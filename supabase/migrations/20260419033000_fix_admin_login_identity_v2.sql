-- Fix PGRST202: previous migration created a function where both the IN
-- parameter and a RETURNS TABLE column were named `username`, causing
-- PostgreSQL to reject it with "function has duplicate argument name: username".
--
-- Solution: rename the return column to `admin_username` so there is no clash,
-- then qualify the WHERE clause reference explicitly.
-- The frontend (AdminLogin.tsx) only reads `identity.email` from this RPC
-- so renaming the return column requires no TypeScript changes.

-- Drop every overloaded variant that may exist from prior migration attempts.
DROP FUNCTION IF EXISTS public.get_admin_login_identity(TEXT);

CREATE OR REPLACE FUNCTION public.get_admin_login_identity(username TEXT)
RETURNS TABLE (
  email          TEXT,
  role           public.app_role,
  display_name   TEXT,
  admin_username TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.email::TEXT    AS email,
    a.role,
    a.display_name,
    a.username       AS admin_username
  FROM public.admin_accounts a
  JOIN auth.users u ON u.id = a.auth_user_id
  WHERE a.is_active = true
    AND lower(a.username) = lower(trim(username))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_login_identity(TEXT) TO anon, authenticated;

-- Force PostgREST to reload its schema cache so the new signature is visible
-- immediately without a pod restart.
NOTIFY pgrst, 'reload schema';
