-- ─────────────────────────────────────────────────────────────────────────────
-- DEBUG: confirm pgcrypto extension status before doing anything
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_ext_schema text;
BEGIN
  SELECT extnamespace::regnamespace::text
    INTO v_ext_schema
    FROM pg_extension
   WHERE extname = 'pgcrypto';

  IF v_ext_schema IS NULL THEN
    RAISE NOTICE '[DEBUG] pgcrypto extension is NOT installed — attempting to install it now.';
  ELSE
    RAISE NOTICE '[DEBUG] pgcrypto extension is already installed in schema: %', v_ext_schema;
  END IF;

  -- Also log the current search_path so we can see what schemas are visible
  RAISE NOTICE '[DEBUG] current search_path = %', current_setting('search_path');
END;
$$;

-- Install pgcrypto if missing.  On Supabase hosted projects it already lives in
-- the "extensions" schema; this is a no-op in that case.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ─────────────────────────────────────────────────────────────────────────────
-- DEBUG: confirm crypt / gen_salt are now resolvable
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_hash text;
BEGIN
  -- Try calling the functions via the explicit schema prefix
  BEGIN
    v_hash := extensions.crypt('test', extensions.gen_salt('bf'));
    RAISE NOTICE '[DEBUG] extensions.crypt / extensions.gen_salt are working correctly.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[DEBUG] extensions.crypt / extensions.gen_salt FAILED: % — trying public schema fallback.', SQLERRM;
    BEGIN
      v_hash := public.crypt('test', public.gen_salt('bf'));
      RAISE NOTICE '[DEBUG] public.crypt / public.gen_salt are working correctly (pgcrypto is in public schema).';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '[DEBUG] public.crypt / public.gen_salt ALSO FAILED: %', SQLERRM;
      RAISE EXCEPTION '[FATAL] Cannot locate crypt/gen_salt in any schema. Check pgcrypto installation.';
    END;
  END;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed the initial superadmin login account.
--
-- Two scenarios are handled:
--   A) A super_admin role already exists in user_roles (e.g. manually created user).
--      → Reset their password to 'admin@123' and ensure admin_accounts.username = 'superadmin'.
--   B) No super_admin exists at all.
--      → Create a brand-new auth user (superadmin@shero.in / admin@123),
--        add the super_admin role, and register in admin_accounts.
--
-- After applying this migration, log in with:
--   Username : superadmin
--   Password : admin@123
--
-- ⚠ Change this password immediately after first login in production.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_existing_id  uuid;
  v_new_id       uuid := gen_random_uuid();
  v_email        text := 'superadmin@shero.in';
BEGIN

  RAISE NOTICE '[DEBUG] Starting superadmin seed — new candidate UUID: %', v_new_id;

  -- ── Scenario A: a super_admin already exists ──────────────────────────────
  SELECT ur.user_id
    INTO v_existing_id
    FROM public.user_roles ur
   WHERE ur.role = 'super_admin'
   ORDER BY ur.created_at
   LIMIT 1;

  RAISE NOTICE '[DEBUG] Existing super_admin user_id: %', COALESCE(v_existing_id::text, '<none>');

  IF v_existing_id IS NOT NULL THEN

    RAISE NOTICE '[DEBUG] Scenario A — resetting password for existing super_admin %.', v_existing_id;

    -- Reset password
    UPDATE auth.users
       SET encrypted_password = extensions.crypt('admin@123', extensions.gen_salt('bf')),
           updated_at = now()
     WHERE id = v_existing_id;

    RAISE NOTICE '[DEBUG] Password reset done. Rows updated: %', 1;

    -- Free the 'superadmin' username if another account holds it
    UPDATE public.admin_accounts
       SET username = concat('admin-', replace(substr(auth_user_id::text, 1, 8), '-', '')),
           updated_at = now()
     WHERE username = 'superadmin'
       AND auth_user_id <> v_existing_id;

    -- Upsert admin_accounts for this user
    INSERT INTO public.admin_accounts (auth_user_id, username, role, display_name, is_active)
    VALUES (v_existing_id, 'superadmin', 'super_admin', 'Super Admin', true)
    ON CONFLICT (auth_user_id) DO UPDATE
       SET username     = 'superadmin',
           role         = 'super_admin',
           display_name = 'Super Admin',
           is_active    = true,
           updated_at   = now();

    RAISE NOTICE '[DEBUG] admin_accounts upserted for %.', v_existing_id;
    RAISE NOTICE 'Scenario A: updated existing super_admin % — username=superadmin, password reset.', v_existing_id;
    RETURN;
  END IF;

  -- ── Scenario B: no super_admin exists — create one from scratch ───────────
  RAISE NOTICE '[DEBUG] Scenario B — creating brand-new superadmin user (%).', v_email;

  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token
  ) VALUES (
    v_new_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    extensions.crypt('admin@123', extensions.gen_salt('bf')),
    now(),   -- email already confirmed
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    '',
    ''
  );

  RAISE NOTICE '[DEBUG] auth.users row inserted for %.', v_new_id;
  -- Note: the handle_new_user trigger fires here and creates:
  --   • public.profiles row
  --   • public.user_roles row with role='customer'

  -- Upgrade role to super_admin (keep customer row so trigger doesn't error)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_new_id, 'super_admin')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '[DEBUG] user_roles super_admin row inserted for %.', v_new_id;

  -- Register in admin_accounts
  INSERT INTO public.admin_accounts (auth_user_id, username, role, display_name, is_active)
  VALUES (v_new_id, 'superadmin', 'super_admin', 'Super Admin', true)
  ON CONFLICT (auth_user_id) DO UPDATE
     SET username     = 'superadmin',
         role         = 'super_admin',
         display_name = 'Super Admin',
         is_active    = true,
         updated_at   = now();

  RAISE NOTICE '[DEBUG] admin_accounts row inserted for %.', v_new_id;
  RAISE NOTICE 'Scenario B: created new superadmin user % (superadmin@shero.in).', v_new_id;

END;
$$;
