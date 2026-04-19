-- Drop the old function (both possible parameter name variants)
DROP FUNCTION IF EXISTS public.get_admin_login_identity(TEXT);

-- Recreate with parameter named `username` (no leading underscore) so
-- PostgREST resolves it correctly when called as:
--   supabase.rpc("get_admin_login_identity", { username: "..." })
CREATE OR REPLACE FUNCTION public.get_admin_login_identity(username TEXT)
RETURNS TABLE (
  email      TEXT,
  role       public.app_role,
  display_name TEXT,
  username   TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.email::TEXT           AS email,
    a.role,
    a.display_name,
    a.username
  FROM public.admin_accounts a
  JOIN auth.users u ON u.id = a.auth_user_id
  WHERE a.is_active = true
    AND lower(a.username) = lower(trim(get_admin_login_identity.username))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_login_identity(TEXT) TO anon, authenticated;

-- Notify PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';
