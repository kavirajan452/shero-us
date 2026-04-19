# Phase 2 · Task 4 — Auth & RBAC Update Log

> Version 1.0 &nbsp;|&nbsp; Scope: Super Admin login + Kitchen Partner login with full Supabase-backed auth, RLS, audit trail and seed data.

---

## 1. What changed at a glance

| # | Area | Before | After |
|---|---|---|---|
| 1 | Admin login | Dummy creds stored in localStorage bypassed real auth | Real `supabase.auth.signInWithPassword` + `is_admin()` RPC check; dummy creds only active when `NEXT_PUBLIC_ENABLE_DEV_LOGIN="true"` |
| 2 | Admin route guard | Leaked through localStorage flag | Hard guard: session + `is_admin()` RPC required; redirects to `/admin/login?next=<path>` |
| 3 | Partner login | **No page existed** — `/partner/*` was wide open | New page at `/partner/login`, real auth + `is_partner()` RPC check |
| 4 | Partner route guard | None | Hard guard on `/partner/*` via updated `PartnerLayout` |
| 5 | Kitchen ↔ user link | Missing column | `kitchen_partners.user_id → auth.users(id)` with unique index |
| 6 | RLS | Admins-only on menu/kitchen tables | Partners can now read + update their own kitchen and manage their own menu items |
| 7 | Audit | No trail | `public.login_audit` table records every attempt (success/fail) |
| 8 | Signup trigger | Always assigned `customer` role | Honours `raw_user_meta_data->>'role'` so seeded admin/partner users start with the correct role |
| 9 | Role helpers | `is_admin`, `has_role` only | Added `is_partner`, `get_user_roles`, `get_primary_role` |
| 10 | Seed data | None for login | One `super_admin` + one `partner` + one linked test kitchen |

---

## 2. File-by-file diff summary

### Database (`supabase/migrations/` + `supabase/seeds/`)

| File | Change |
|---|---|
| `supabase/migrations/20260420000000_phase2_task4_auth_rbac.sql` | **NEW** — adds `kitchen_partners.user_id`, role helpers (`is_partner`, `get_user_roles`, `get_primary_role`), partner RLS, `login_audit` table, smarter `handle_new_user` trigger |
| `supabase/seeds/20260420_seed_phase2_task4_users.sql` | **NEW** — seeds `superadmin@shero.in`, `partner1@shero.in`, kitchen `kp-seed-partner-1`, links them |

### Frontend (`src/` + `app/`)

| File | Change |
|---|---|
| `src/pages/AdminLogin.tsx` | Dummy credential branch is now gated behind `NEXT_PUBLIC_ENABLE_DEV_LOGIN==='true'`; real Supabase path writes a `login_audit` row |
| `src/pages/PartnerLogin.tsx` | **NEW** — Partner login (`signInWithPassword` + `is_partner` RPC + audit + dev-login toggle) |
| `app/partner/login/page.tsx` | **NEW** — Next.js route re-exporting the page above |
| `src/layouts/AdminLayout.tsx` | Removed the silent localStorage bypass; guard now re-checks on every mount and waits for supabase response before rendering |
| `src/layouts/PartnerLayout.tsx` | **NEW GUARD** — wraps the existing layout in `RequireAuth` so unauthenticated / non-partner users are redirected |
| `src/components/RequireAuth.tsx` | **NEW** — reusable client-side guard component for admin/partner portals |
| `src/contexts/AuthContext.tsx` | Role detection now populates a fine-grained `adminRole: AdminRole \| null` in addition to the legacy `role: 'customer'\|'partner'\|null` |
| `src/data/adminRoles.ts` | `getAdminRole()` now also works for users who logged in via real Supabase (reads role from the auth context, not just localStorage) |
| `.env` | Points to new project `xdprzxmtudsmwsnwabec`; adds `NEXT_PUBLIC_ENABLE_DEV_LOGIN` toggle |

---

## 3. How to apply the changes

### 3.1 Run the migration

Supabase Dashboard → **SQL Editor** → New query → paste the contents of
`supabase/migrations/20260420000000_phase2_task4_auth_rbac.sql` → **Run**.

Alternatively, with Supabase CLI:

```bash
supabase link --project-ref xdprzxmtudsmwsnwabec
supabase db push            # pushes every migration not yet applied
```

Expected output: `NOTICE: ...OK` for each statement.  Re-running is safe.

### 3.2 Seed the users

Supabase Dashboard → **SQL Editor** → paste
`supabase/seeds/20260420_seed_phase2_task4_users.sql` → **Run**.

Verify:

```sql
SELECT u.email, ur.role
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email IN ('superadmin@shero.in','partner1@shero.in');

SELECT id, name, user_id
FROM public.kitchen_partners
WHERE id = 'kp-seed-partner-1';
```

Expected:

```
superadmin@shero.in | super_admin
partner1@shero.in   | partner
kp-seed-partner-1   | Shero Test Kitchen #1 | <uuid>
```

### 3.3 Restart the frontend

```bash
sudo supervisorctl restart frontend
```

The `.env` file has already been updated to point at `xdprzxmtudsmwsnwabec`, so no further config changes are needed.

---

## 4. How to test the implemented changes

### 4.1 Test the guards (should all redirect to login)

| URL | Expected behaviour (unauthenticated) |
|---|---|
| `/admin`                       | Redirect → `/admin/login?next=/admin` |
| `/admin/dashboard`             | Redirect → `/admin/login?next=/admin/dashboard` |
| `/admin/orders`                | Redirect → `/admin/login?next=/admin/orders` |
| `/partner`                     | Redirect → `/partner/login?next=/partner` |
| `/partner/orders`              | Redirect → `/partner/login?next=/partner/orders` |
| `/partner/menu-items`          | Redirect → `/partner/login?next=/partner/menu-items` |

### 4.2 Test Super Admin login

1. Go to `/admin/login`
2. Enter `superadmin@shero.in` / `SuperAdmin@123`
3. Click **Sign In**
4. ✅ Expected: toast **"✅ Welcome …"**, redirect to `/admin`, sidebar badge shows **Super Admin**, all menu items accessible
5. In Supabase dashboard → `login_audit` table → new row with `portal='admin'`, `success=true`, `role_at_login='super_admin'`

### 4.3 Test Partner login

1. Go to `/partner/login`
2. Enter `partner1@shero.in` / `Partner@123`
3. ✅ Expected: redirect to `/partner`, partner dashboard loads, the linked kitchen (`Shero Test Kitchen #1`) is visible
4. In Supabase dashboard → `login_audit` → new row with `portal='partner'`, `success=true`, `role_at_login='partner'`

### 4.4 Test role enforcement

| Scenario | Expected |
|---|---|
| Log in as a `partner` and navigate to `/admin` | Redirect to `/admin/login` (partner is not admin) |
| Log in as a `super_admin` and navigate to `/partner` | Redirect to `/partner/login` (admin is not a partner) |
| Invalid password on `/admin/login` | Red error message, `login_audit` row with `success=false` |

### 4.5 Test dev-login toggle

Only active when `.env` has `NEXT_PUBLIC_ENABLE_DEV_LOGIN="true"`.

| Action | Result |
|---|---|
| `/admin/login` with `admin@shero.in` / `admin123` (dev creds) | Logs in as `super_admin` dummy (localStorage only) |
| `/partner/login` with `partner1@shero.in` / `Partner@123` when the real user also exists | Short-circuits to local dev session |

Set `NEXT_PUBLIC_ENABLE_DEV_LOGIN="false"` (or remove it) and restart the frontend to require real Supabase auth for everyone.

---

## 5. Test credentials summary

Also stored in `/app/memory/test_credentials.md`.

| Portal | Email | Password | Role |
|---|---|---|---|
| Admin  | `superadmin@shero.in` | `SuperAdmin@123` | `super_admin` |
| Partner| `partner1@shero.in`   | `Partner@123`    | `partner` |

Dev-only creds (kept for convenience while `NEXT_PUBLIC_ENABLE_DEV_LOGIN="true"`):

| Portal | Email | Password | Simulated role |
|---|---|---|---|
| Admin  | `admin@shero.in`       | `admin123` | super_admin |
| Admin  | `superadmin@shero.in`  | `super123` | super_admin |
| Admin  | `ceo@shero.in`         | `ceo123`   | super_admin |

---

## 6. Troubleshooting

**"This account is not registered as a kitchen partner."**
→ The user exists in `auth.users` but has no `partner` row in `public.user_roles`.  Re-run the seed script or insert manually:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'partner' FROM auth.users WHERE email = 'partner1@shero.in'
ON CONFLICT DO NOTHING;
```

**"You do not have admin access."**
→ `is_admin()` returned `false`.  Make sure the user has at least one non-`customer`/non-`partner` role:

```sql
SELECT * FROM public.user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'superadmin@shero.in');
```

**Login succeeds but I land back on the login page.**
→ The Supabase session cookie was never written.  Usually caused by
wrong `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
Open DevTools → Application → Cookies — you should see
`sb-xdprzxmtudsmwsnwabec-auth-token`.

**Seed SQL fails with `permission denied for schema auth`.**
→ Run the SQL as the **service role** (Dashboard SQL editor always uses
service role).  The `supabase` CLI uses the DB password — also fine.

---

## 7. Roadmap for remaining roles

Task 4 seeds the **two most-needed** logins.  Adding the other 23 admin
roles is a pure data operation — simply append entries to the seed
script using the same `DO $$ … $$` block pattern and the correct
`app_role` value.  All 25 roles are already present in the `app_role`
enum, the permission matrix already lives in
`src/data/adminRoles.ts` (`ADMIN_ROLES`), and the RBAC check in
`AdminLayout.tsx` is driven from that matrix — so no additional code is
needed to onboard the remaining roles.

Recommended rollout order (biggest blast radius first):

1. `country_manager` → `vertical_head` → `hr_manager`
2. `ops_manager`, `onboarding_manager`, `finance_manager`
3. `regional_manager`, `spc_manager`, `ssc_manager`, `party_manager`
4. Team Leaders (`*_tl`)
5. Executives (`*_executive`, `*_executor`, `asst_manager`)
