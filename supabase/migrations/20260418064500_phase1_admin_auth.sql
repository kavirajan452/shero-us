-- Phase 1 admin username/password login support

CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role public.app_role NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT admin_accounts_role_check CHECK (role NOT IN ('customer', 'partner'))
);

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage admin accounts" ON public.admin_accounts;
CREATE POLICY "Admins can manage admin accounts"
  ON public.admin_accounts
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS update_admin_accounts_updated_at ON public.admin_accounts;
CREATE TRIGGER update_admin_accounts_updated_at
  BEFORE UPDATE ON public.admin_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_admin_login_identity(_username TEXT)
RETURNS TABLE (
  email TEXT,
  role public.app_role,
  display_name TEXT,
  username TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.email::TEXT AS email,
    a.role,
    a.display_name,
    a.username
  FROM public.admin_accounts a
  JOIN auth.users u ON u.id = a.auth_user_id
  WHERE a.is_active = true
    AND lower(a.username) = lower(trim(_username))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_login_identity(TEXT) TO anon, authenticated;

WITH ranked_admin_roles AS (
  SELECT
    ur.user_id,
    ur.role,
    p.full_name,
    p.email,
    ROW_NUMBER() OVER (
      PARTITION BY ur.user_id
      ORDER BY
        CASE ur.role
          WHEN 'super_admin' THEN 1
          WHEN 'country_manager' THEN 2
          WHEN 'vertical_head' THEN 3
          ELSE 4
        END,
        ur.created_at ASC
    ) AS rn
  FROM public.user_roles ur
  LEFT JOIN public.profiles p ON p.user_id = ur.user_id
  WHERE ur.role NOT IN ('customer', 'partner')
)
INSERT INTO public.admin_accounts (auth_user_id, username, role, display_name, is_active)
SELECT
  r.user_id,
  concat(
    COALESCE(NULLIF(lower(regexp_replace(split_part(COALESCE(r.email, ''), '@', 1), '[^a-zA-Z0-9._-]', '', 'g')), ''), 'admin'),
    '-',
    replace(substr(r.user_id::TEXT, 1, 8), '-', '')
  ) AS username,
  r.role,
  COALESCE(NULLIF(r.full_name, ''), NULLIF(r.email, ''), 'Admin User') AS display_name,
  true
FROM ranked_admin_roles r
WHERE r.rn = 1
ON CONFLICT (auth_user_id) DO UPDATE
SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  is_active = true,
  updated_at = now();
