-- Phase 2 - Task 4
-- Seed profile + role mappings for seeded login users.
-- NOTE: This migration assumes corresponding auth.users rows exist.
-- Use supabase/functions/setup-admin to create the auth users first.

DO $$
BEGIN
  -- Super Admin
  INSERT INTO public.profiles (user_id, full_name, email, phone)
  SELECT
    u.id,
    'Super Admin',
    'superadmin@shero.in',
    '9999000001'
  FROM auth.users u
  WHERE lower(u.email) = 'superadmin@shero.in'
  ON CONFLICT (user_id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  SELECT
    u.id,
    'super_admin'::public.app_role
  FROM auth.users u
  WHERE lower(u.email) = 'superadmin@shero.in'
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Kitchen Partner
  INSERT INTO public.profiles (user_id, full_name, email, phone)
  SELECT
    u.id,
    'Kitchen Partner',
    'kitchenpartner@shero.in',
    '9999000002'
  FROM auth.users u
  WHERE lower(u.email) = 'kitchenpartner@shero.in'
  ON CONFLICT (user_id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  SELECT
    u.id,
    'partner'::public.app_role
  FROM auth.users u
  WHERE lower(u.email) = 'kitchenpartner@shero.in'
  ON CONFLICT (user_id, role) DO NOTHING;
END
$$;
