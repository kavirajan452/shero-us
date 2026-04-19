-- ════════════════════════════════════════════════════════════════════
-- Phase 2 · Task 4 — Seed login users
-- ════════════════════════════════════════════════════════════════════
-- Creates:
--   • 1 Super Admin   : superadmin@shero.in / SuperAdmin@123
--   • 1 Kitchen Partner: partner1@shero.in  / Partner@123
--                        linked to a brand-new test kitchen
--
-- HOW TO RUN
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Paste this file's content, click Run
--   3. Log in using the credentials above
--
-- The script is IDEMPOTENT — running it twice is safe; existing rows
-- are not duplicated or overwritten.
-- ════════════════════════════════════════════════════════════════════

BEGIN;

-- Required extensions (usually pre-enabled on Supabase projects)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── 1. Seed SUPER_ADMIN user ────────────────────────────────────────
DO $$
DECLARE
  v_user_id   uuid;
  v_email     text := 'superadmin@shero.in';
  v_password  text := 'SuperAdmin@123';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers', ARRAY['email']),
      jsonb_build_object(
        'full_name','Super Admin',
        'role','super_admin'
      ),
      now(), now(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
      'email', v_email, now(), now(), now()
    )
    ON CONFLICT (provider, provider_id) DO NOTHING;
  END IF;

  -- Profile + role (trigger may or may not have fired depending on project state)
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (v_user_id, 'Super Admin', v_email)
  ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'super_admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- ─── 2. Brand-new test kitchen for the partner ───────────────────────
INSERT INTO public.kitchen_partners (
  id, partner_id, name, image, rating, review_count, cuisine,
  delivery_time, min_order, is_branded, location, is_veg,
  food_preference, is_attendance_marked, is_active
)
VALUES (
  'kp-seed-partner-1', 'SHERO-TEST-001',
  'Shero Test Kitchen #1',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
  4.5, 12, ARRAY['South Indian','Andhra']::text[],
  '30-40 min', 199, true, 'Chennai — Test Location',
  true, 'veg', false, true
)
ON CONFLICT (id) DO NOTHING;

-- ─── 3. Seed PARTNER user + link to the kitchen above ───────────────
DO $$
DECLARE
  v_user_id   uuid;
  v_email     text := 'partner1@shero.in';
  v_password  text := 'Partner@123';
  v_kitchen_id text := 'kp-seed-partner-1';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers', ARRAY['email']),
      jsonb_build_object(
        'full_name','Kitchen Partner One',
        'role','partner'
      ),
      now(), now(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
      'email', v_email, now(), now(), now()
    )
    ON CONFLICT (provider, provider_id) DO NOTHING;
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (v_user_id, 'Kitchen Partner One', v_email)
  ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'partner'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.kitchen_partners
     SET user_id       = v_user_id,
         contact_email = v_email
   WHERE id = v_kitchen_id;
END $$;

COMMIT;

-- Verification queries — run these after the script:
-- SELECT u.email, ur.role FROM auth.users u
--   JOIN public.user_roles ur ON ur.user_id = u.id
--   WHERE u.email IN ('superadmin@shero.in','partner1@shero.in');
-- SELECT id, name, user_id FROM public.kitchen_partners WHERE id = 'kp-seed-partner-1';
