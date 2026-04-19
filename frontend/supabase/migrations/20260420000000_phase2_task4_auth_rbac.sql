-- ════════════════════════════════════════════════════════════════════
-- Phase 2 · Task 4 — Auth & RBAC Hardening
-- ════════════════════════════════════════════════════════════════════
-- Adds first-class partner ↔ kitchen linkage, helper RPCs for role
-- detection, richer RLS for partner self-service, a login audit trail
-- and a smarter signup trigger that respects the role encoded in
-- auth.users.raw_user_meta_data.
--
-- This migration is SAFE TO RE-RUN (all statements are idempotent).
-- It assumes the baseline migration 20260318061614_...sql has already
-- created the `profiles`, `user_roles`, `app_role`, `is_admin`,
-- `has_role`, `handle_new_user` and `kitchen_partners` objects.
-- ════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────
-- 1. Link kitchen_partners to an auth user  (one-to-one)
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE public.kitchen_partners
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_kitchen_partners_user_id
  ON public.kitchen_partners(user_id)
  WHERE user_id IS NOT NULL;

-- ──────────────────────────────────────────────────────────────────
-- 2. Role helpers  (SECURITY DEFINER, safe for RLS recursion)
-- ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_partner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'partner'::app_role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id;
$$;

-- Returns the "primary" role in priority order:
-- super_admin > any other admin > partner > customer
CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY
    CASE role
      WHEN 'super_admin'        THEN 0
      WHEN 'country_manager'    THEN 1
      WHEN 'vertical_head'      THEN 2
      WHEN 'regional_manager'   THEN 3
      WHEN 'ops_manager'        THEN 4
      WHEN 'onboarding_manager' THEN 5
      WHEN 'finance_manager'    THEN 6
      WHEN 'hr_manager'         THEN 7
      WHEN 'spc_manager'        THEN 8
      WHEN 'ssc_manager'        THEN 9
      WHEN 'party_manager'      THEN 10
      WHEN 'shf_manager'        THEN 11
      WHEN 'hcf_manager'        THEN 12
      WHEN 'kobtl'              THEN 20
      WHEN 'sap_onboarding_tl'  THEN 21
      WHEN 'spc_tl'             THEN 22
      WHEN 'ssc_tl'             THEN 23
      WHEN 'ppp_tl'             THEN 24
      WHEN 'party_tl'           THEN 25
      WHEN 'kob_executive'      THEN 30
      WHEN 'ssc_executor'       THEN 31
      WHEN 'ppp_executor'       THEN 32
      WHEN 'party_executive'    THEN 33
      WHEN 'asst_manager'       THEN 34
      WHEN 'partner'            THEN 90
      WHEN 'customer'           THEN 99
      ELSE 100
    END
  LIMIT 1;
$$;

-- ──────────────────────────────────────────────────────────────────
-- 3. Partner-facing RLS on kitchen_partners / instant_menu_items
-- ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Partners can view their own kitchen" ON public.kitchen_partners;
CREATE POLICY "Partners can view their own kitchen"
  ON public.kitchen_partners FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Partners can update their own kitchen" ON public.kitchen_partners;
CREATE POLICY "Partners can update their own kitchen"
  ON public.kitchen_partners FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Partners manage their menu items" ON public.instant_menu_items;
CREATE POLICY "Partners manage their menu items"
  ON public.instant_menu_items FOR ALL
  TO authenticated
  USING (
    kitchen_id IN (
      SELECT id FROM public.kitchen_partners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    kitchen_id IN (
      SELECT id FROM public.kitchen_partners WHERE user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────────
-- 4. Login audit trail
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.login_audit (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email       text,
  portal      text NOT NULL CHECK (portal IN ('admin','partner','customer')),
  role_at_login app_role,
  success     boolean NOT NULL DEFAULT false,
  failure_reason text,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own login history" ON public.login_audit;
CREATE POLICY "Users read own login history"
  ON public.login_audit FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can insert login audit" ON public.login_audit;
CREATE POLICY "Anyone can insert login audit"
  ON public.login_audit FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_login_audit_user_id  ON public.login_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_login_audit_email    ON public.login_audit(email);
CREATE INDEX IF NOT EXISTS idx_login_audit_created  ON public.login_audit(created_at DESC);

-- ──────────────────────────────────────────────────────────────────
-- 5. Smarter signup trigger — honours raw_user_meta_data.role
-- ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
  resolved_role  app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Pick the role supplied at signup (must cast-valid)
  requested_role := NEW.raw_user_meta_data->>'role';
  BEGIN
    resolved_role := requested_role::app_role;
  EXCEPTION WHEN others THEN
    resolved_role := 'customer'::app_role;
  END;

  IF resolved_role IS NULL THEN
    resolved_role := 'customer'::app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, resolved_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
