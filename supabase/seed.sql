-- ═══════════════════════════════════════════════════════════════
-- Shero Seed Data
-- Creates auth users, profiles, and roles for local development.
--
-- Super Admin:     superadmin@shero.in     / Shero@Admin2026
-- Kitchen Partner: kitchenpartner@shero.in / Shero@Partner2026
--
-- Password hashes are bcrypt cost-10 values of the passwords above.
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_super_admin_id  uuid := 'f39db918-af29-49ed-8160-2e80724a4b0b';
  v_partner_id      uuid := 'ce5d9dcf-b164-4271-92c2-bd0a8d403cd6';
BEGIN

  -- ── Super Admin auth user ──────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_super_admin,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    v_super_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'superadmin@shero.in',
    -- bcrypt hash of 'Shero@Admin2026' (cost 10)
    '$2b$10$mUAb6HCQgU3jpWSaGDbMJ.QKNXIKABZqp2p8d9qjH0lfhISvLpB.a',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin","phone":"9999000001"}',
    now(), now(), false,
    '', '', '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_super_admin_id,
    v_super_admin_id,
    jsonb_build_object('sub', v_super_admin_id::text, 'email', 'superadmin@shero.in'),
    'email',
    'superadmin@shero.in',
    now(), now(), now()
  ) ON CONFLICT (provider, provider_id) DO NOTHING;

  -- ── Kitchen Partner auth user ──────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_super_admin,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    v_partner_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'kitchenpartner@shero.in',
    -- bcrypt hash of 'Shero@Partner2026' (cost 10)
    '$2b$10$x8uN1ERw/LFFIrJGh79BZ.9VLWe3000H7GGBv8842U0KS2AKLroF.',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Kitchen Partner","phone":"9999000002"}',
    now(), now(), false,
    '', '', '', ''
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_partner_id,
    v_partner_id,
    jsonb_build_object('sub', v_partner_id::text, 'email', 'kitchenpartner@shero.in'),
    'email',
    'kitchenpartner@shero.in',
    now(), now(), now()
  ) ON CONFLICT (provider, provider_id) DO NOTHING;

  -- ── Profiles ──────────────────────────────────────────────────
  INSERT INTO public.profiles (user_id, full_name, email, phone)
  VALUES
    (v_super_admin_id, 'Super Admin',      'superadmin@shero.in',     '9999000001'),
    (v_partner_id,     'Kitchen Partner',  'kitchenpartner@shero.in', '9999000002')
  ON CONFLICT (user_id) DO UPDATE
    SET full_name  = EXCLUDED.full_name,
        email      = EXCLUDED.email,
        phone      = EXCLUDED.phone,
        updated_at = now();

  -- ── Roles ─────────────────────────────────────────────────────
  INSERT INTO public.user_roles (user_id, role)
  VALUES
    (v_super_admin_id, 'super_admin'::public.app_role),
    (v_partner_id,     'partner'::public.app_role),
    (v_partner_id,     'kob_executive'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

END
$$;
