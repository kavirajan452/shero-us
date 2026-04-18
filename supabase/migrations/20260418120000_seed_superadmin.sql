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

DO $$
DECLARE
  v_existing_id  uuid;
  v_new_id       uuid := gen_random_uuid();
  v_email        text := 'superadmin@shero.in';
BEGIN

  -- ── Scenario A: a super_admin already exists ──────────────────────────────
  SELECT ur.user_id
    INTO v_existing_id
    FROM public.user_roles ur
   WHERE ur.role = 'super_admin'
   ORDER BY ur.created_at
   LIMIT 1;

  IF v_existing_id IS NOT NULL THEN

    -- Reset password
    UPDATE auth.users
       SET encrypted_password = crypt('admin@123', gen_salt('bf')),
           updated_at = now()
     WHERE id = v_existing_id;

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

    RAISE NOTICE 'Scenario A: updated existing super_admin % → username=superadmin, password reset.', v_existing_id;
    RETURN;
  END IF;

  -- ── Scenario B: no super_admin exists — create one from scratch ───────────
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
    crypt('admin@123', gen_salt('bf')),
    now(),   -- email already confirmed
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    '',
    ''
  );
  -- Note: the handle_new_user trigger fires here and creates:
  --   • public.profiles row
  --   • public.user_roles row with role='customer'

  -- Upgrade role to super_admin (keep customer row so trigger doesn't error)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_new_id, 'super_admin')
  ON CONFLICT DO NOTHING;

  -- Register in admin_accounts
  INSERT INTO public.admin_accounts (auth_user_id, username, role, display_name, is_active)
  VALUES (v_new_id, 'superadmin', 'super_admin', 'Super Admin', true)
  ON CONFLICT (auth_user_id) DO UPDATE
     SET username     = 'superadmin',
         role         = 'super_admin',
         display_name = 'Super Admin',
         is_active    = true,
         updated_at   = now();

  RAISE NOTICE 'Scenario B: created new superadmin user % (superadmin@shero.in).', v_new_id;

END;
$$;
