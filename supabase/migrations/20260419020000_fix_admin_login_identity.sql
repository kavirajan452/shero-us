-- Ensure admin_accounts table exists (idempotent re-apply of phase1_admin_auth)
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_admin_accounts_updated_at'
      AND tgrelid = 'public.admin_accounts'::regclass
  ) THEN
    CREATE TRIGGER update_admin_accounts_updated_at
      BEFORE UPDATE ON public.admin_accounts
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END;
$$;

-- Ensure the RPC used by AdminLogin.tsx to resolve username → email exists.
-- This was originally created in 20260418064500_phase1_admin_auth.sql but
-- may not have been applied to the live database.
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
