# Shero US — Phase 1 Implementation Guide

> Last updated: 2026-04-19

## 🔄 Update Log (2026-04-19)

- Phase 2 Task 4: replaced admin dummy-login bypass with database-backed role verification.
- Admin portal (`/admin/*`) now allows access only for authenticated users with `super_admin` role.
- Added partner dashboard guard: `/partner/*` now requires authenticated `partner` role.
- Updated admin logout to sign out Supabase session (not only local storage cleanup).
- Extended Supabase seeding function `setup-admin` to seed both:
  - `superadmin@shero.in` → `super_admin`
  - `kitchenpartner@shero.in` → `partner`
- Added migration `20260419091500_phase2_task4_login_seed_profiles_roles.sql` to upsert profiles + role links for seeded login users.

- Added env-driven mode switch for OTP and payments (`APP_MODE` / `NEXT_PUBLIC_APP_MODE`).
- Updated OTP send flow to support:
  - **Dev/Test mode:** generate OTP, store hash in DB, return OTP for UI preview.
  - **Production mode:** call SMS gateway using `SMS_INTEGRA_*` env vars.
- Updated OTP verify flow to upsert profile details and role (`customer` / `partner`) after verification.
- Registration now completes from OTP-verified phone identity and stores user/profile/role in DB.
- Removed cart localStorage persistence; cart now hydrates from and syncs to `user_carts` in DB only.
- Added payment mode behavior in `create-payment-intent`:
  - **Dev/Test mode:** simulated payment intent response.
  - **Production mode:** real Stripe payment intent creation.
- Added Supabase migration: `20260419062000_phase1_task3_payment_modes.sql` for `payment_attempts` log table.
- Added payment mode messaging in checkout payment UI.

## ✅ Verification Guide (Phase 1 Task 3)

1. Apply migrations:
   - `npx supabase db push`
2. Set env:
   - Frontend: `NEXT_PUBLIC_APP_MODE=dev` (or `production`)
   - Edge Functions: `APP_MODE=dev|production` and required SMS/Stripe vars for production
3. OTP registration/login (dev mode):
   - Go to `/auth`
   - Send OTP; verify OTP preview is shown in UI and OTP row is stored in `otp_attempts`
   - Verify OTP; confirm user/profile/role rows exist in `auth.users`, `profiles`, `user_roles`
4. OTP registration/login (production mode):
   - Ensure `SMS_INTEGRA_API_URL` and `SMS_INTEGRA_API_KEY` are set
   - Send OTP; verify OTP is sent via SMS gateway and not shown in UI
5. Cart/checkout DB persistence:
   - Add items to cart and refresh; confirm cart restores from `user_carts`
   - Place order; confirm `instant_orders` row is inserted
6. Payment mode:
   - Dev mode: place order and verify simulated response + row in `payment_attempts` with `mode='dev'`
   - Production mode: verify Stripe payment intent is created and logged in `payment_attempts`

## ✅ Verification Guide (Phase 2 Task 4 — Admin + Kitchen Partner Logins)

1. Apply latest migrations:
   - `npx supabase db push`
2. Seed login users (auth + profile + role):
   - Deploy and invoke Edge Function: `supabase/functions/setup-admin`
   - Expected seeded users:
     - `superadmin@shero.in` (`super_admin`)
     - `kitchenpartner@shero.in` (`partner`)
3. Validate admin access control:
   - Login at `/admin/login` with `superadmin@shero.in`
   - Confirm `/admin` and admin menus load
   - Logout from sidebar and confirm session is invalidated
   - Login with non-admin/non-super-admin account and confirm access is denied
4. Validate partner access control:
   - Login via `/login?role=partner` (OTP flow)
   - Confirm `/partner` pages load only for `partner` role
   - Logout or switch to a non-partner account and confirm `/partner/*` redirects to partner login
5. DB checks (Supabase SQL editor):
   - `select user_id, role from public.user_roles where role in ('super_admin','partner');`
   - `select user_id, email, phone from public.profiles where email in ('superadmin@shero.in','kitchenpartner@shero.in');`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [What Is Done (Phase 1)](#3-what-is-done-phase-1)
4. [What Is Not Yet Done](#4-what-is-not-yet-done)
5. [Seed Data & Migrations](#5-seed-data--migrations)
6. [Location-Based Ordering](#6-location-based-ordering)
7. [User Dashboard](#7-user-dashboard)
8. [Admin Dashboard](#8-admin-dashboard)
9. [Known Issues & Next Steps](#9-known-issues--next-steps)

---

## 1. Architecture Overview

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui |
| State / Data | TanStack Query v5, Zustand (cart/wallet context) |
| Backend | Supabase (PostgreSQL, Row Level Security, Realtime, Auth) |
| Payments | Payment section wired; gateway integration TBD |
| Hosting | Vercel / Netlify (static export) |

### Core Data Flow

```
Customer Browser
  → React pages (src/pages/)
  → Custom hooks (src/hooks/useSupabaseData.ts)
  → Supabase JS client (src/integrations/supabase/client.ts)
  → Supabase PostgreSQL (RLS enforced)
```

---

## 2. Database Schema

### Key Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (name, phone, email, avatar, address) |
| `kitchen_partners` | Kitchen catalogue (SKID, name, image, rating, cuisine) |
| `kitchen_partner_locations` | GPS coords + pincode per kitchen for geofencing |
| `instant_menu_items` | Per-kitchen menu items with pricing, nutrition, add-ons |
| `instant_orders` | All customer orders placed via the app |
| `subscription_customers` | Active meal plan subscriptions |
| `subscription_meal_plans` | Plan definitions (weekly/monthly) |
| `subscription_menu_items` | Items available for subscription meals |
| `party_orders` | Bulk/party food orders |
| `snack_products` | SHF-branded snack catalogue |
| `app_config` | Key–value config (radius, fees, toggles) |
| `user_carts` | Persisted cart per user |
| `user_wallets` | Wallet balance, transaction history |

### RLS Summary

- **Customers** can `SELECT` / `INSERT` their own rows in `instant_orders`, `profiles`, `user_carts`, `user_wallets`.
- **Admins** (`is_admin()` helper) can manage all tables.
- All kitchen/menu reads are **public** (no auth required) to allow unauthenticated browsing.

---

## 3. What Is Done (Phase 1)

### ✅ 3.1 Seed Migration — `20260417100000_seed_phase1_kitchens_menus.sql`

- **10 `kitchen_partners`** seeded covering Manhattan (NYC), San Francisco, Austin (×2), Chicago, Houston, Seattle, Dallas, Jersey City.
- **10 `kitchen_partner_locations`** with real US lat/lng for geofencing.
- **57 `instant_menu_items`** seeded across all 10 kitchens (5–7 items each), covering:
  - Chettinad, Kerala, Andhra, North Indian, Mughlai, Punjabi cuisines
  - Veg and non-veg options
  - Full add-ons, nutrition info, allergens, ingredients
- **9 `kitchen_categories`** seeded for the filter-chip UI on the InstantDelivery page.
- `app_config` entries:
  - `kitchen_visibility_radius` → `{"radius_miles": 20}`
  - `invoice_settings` → delivery fee, tip presets, platform fee

### ✅ 3.2 User Dashboard (Profile.tsx)

**Before:** All order history, stats, and plan data were hardcoded static arrays.

**After:**
- `instant_orders` fetched live from Supabase for the logged-in user (up to 50 orders).
- Stats cards (Orders, Total Spent, Kitchens, Active) are computed dynamically from real DB data.
- "Recent Orders" section renders real order rows with correct status badges and invoice download.
- "Order History" tab lists all real instant orders + party orders + drafts.
- Empty-state UX when no orders exist.
- "Ordered From" section shows kitchens ordered from (frequency-ranked).
- Invoice fallback builds from live order data (not mock data).
- `ordersLoading` state added for skeleton/loading UI.

**Still static:** Active subscription plan card (needs `subscription_customers` data wiring — Phase 2).

### ✅ 3.3 Location-Based Menu/Kitchen Filtering

Already implemented in prior migrations + hooks:

- `kitchen_partner_locations` table stores lat/lng + pincode per kitchen.
- `useServiceability` hook (`src/hooks/useServiceability.ts`):
  - Detects customer GPS location via `navigator.geolocation`
  - Queries all active kitchen locations from DB
  - Uses Haversine formula to compute nearest kitchen distance (in miles)
  - Checks if any kitchen is within configurable radius (`app_config.kitchen_visibility_radius`)
  - Falls back to "serviceable = true" if geolocation denied
- `useNearbyKitchenPartners` hook:
  - Fetches all `kitchen_partners` + `kitchen_partner_locations`
  - Filters by `is_attendance_marked = true` (only live kitchens)
  - Computes distance to each kitchen based on customer coords
  - Returns sorted list with `.distance` property
- `InstantDelivery.tsx`: Detects location, calls `useNearbyKitchenPartners`, shows distance indicator and "X km radius" badge.
- `KitchenDetail.tsx` + `ItemDetail.tsx`: Load from DB via `useKitchenPartner` / `useInstantMenuItems` hooks.

**Seed data:** All 10 seeded kitchens now have coordinates — geofencing is fully functional.

### ✅ 3.4 Admin Dashboard (AdminDashboard.tsx)

**Before:** Hardcoded stat numbers (248 partners, 1,842 orders) and fake PPP approval list.

**After:**
- `useAdminDashboardStats` hook: queries `kitchen_partners`, `instant_orders`, `profiles`, `instant_menu_items` in parallel to produce live counts.
- `usePendingInstantOrders` hook: fetches `instant_orders` with `status = 'new'`, up to 5.
- Accept/Reject buttons call `useUpdateInstantOrder` to update order status in DB.
- Realtime subscriptions keep stats and pending list auto-updated.
- `formatDistanceToNow` (date-fns) shows human-readable "X minutes ago".

---

## 4. What Is Not Yet Done

### 🔲 4.1 Subscription Plan UI in User Dashboard
- `subscription_customers` table exists but the Profile page "Active Plan" card still shows `null` / "No active subscription".
- Need: fetch `subscription_customers` by `user_id`, display plan name, meals used, and renew date.

### 🔲 4.2 Payment Gateway Integration
- Checkout flow (`src/pages/Checkout.tsx`) has UI but no real payment gateway calls.
- Razorpay / Stripe SDK not integrated yet.
- `payment_status` is set to `'pending'` on order creation.

### 🔲 4.3 Partner Dashboard
- `PartnerDashboard.tsx` still uses mock data for attendance, orders, earnings.
- Needs wiring to `instant_orders` (by `partner_id`), `kitchen_partners` (attendance toggle), `user_wallets` (earnings).

### 🔲 4.4 Admin Partners Page
- Partner onboarding list in `AdminPartners.tsx` uses local mock data.
- A `partner_applications` or `enrollment_leads` table is needed for proper onboarding lifecycle tracking.

### 🔲 4.5 Admin Menus — Upload Persistence
- Menu upload via `AdminMenus.tsx` produces an Excel parse but doesn't persist to `instant_menu_items`.
- Need: bulk upsert handler from parsed XLSX to Supabase.

### 🔲 4.6 Admin Orders — Real-Time Filter
- `AdminOrders.tsx` already fetches from `instant_orders` (good), but date-range filter queries entire table client-side.
- Optimisation: push date filter to Supabase query.

### 🔲 4.7 Push Notifications / WhatsApp Order Updates
- WhatsApp share button is in `OrderConfirmation.tsx` but no automated notifications.
- Needs a webhook trigger (Supabase Edge Function) to send WhatsApp via Twilio/WATI.

### 🔲 4.8 Delivery Partner Assignment
- `delivery_tracking` table exists but no delivery partner onboarding or assignment UI.
- `DeliveryType = 'self-delivery'` is hardcoded in checkout.

### 🔲 4.9 Reviews & Ratings
- `customer_feedback` table exists; collection hooks exist.
- No post-delivery rating prompt in the customer flow yet.

---

## 5. Seed Data & Migrations

### Migration Files (in order)

| File | Description |
|------|-------------|
| `20260318061614_…` | Core profiles, auth triggers |
| `20260318062609_…` | Party leads, subscription leads, menu_items, snack_products, app_config |
| `20260318063851_…` | `kitchen_partners`, `instant_menu_items` tables |
| `20260318064759_…` | Partner-facing tables |
| `20260318065918_…` | `instant_orders`, subscription tables, service_bookings, party_combo_configs |
| `20260318074154_…` | Kitchen categories, partner attendance |
| `20260318085046_…` | `kitchen_categories` table |
| `20260318090558_…` | RLS policies cleanup |
| `20260318091324_…` | Wallet tables |
| `20260318091837_…` | `kitchen_partner_locations` table |
| `20260319*` | Various index & policy updates |
| `20260403*` | Phase 0.9 fixes (OTP, cart, payment) |
| `20260417043000_…` | Phase 1 OTP, cart, payment refinements |
| `20260417073000_…` | Fix `instant_orders` anon insert policy |
| **`20260417100000_seed_phase1_kitchens_menus.sql`** | **⭐ Phase 1 seed: 10 kitchens, 57 menu items, 10 locations** |

### Applying Migrations

```bash
supabase db push
# or for production:
supabase migration up --db-url $SUPABASE_DB_URL
```

---

## 6. Location-Based Ordering

### How It Works

1. Customer opens `InstantDelivery` page → browser `navigator.geolocation.getCurrentPosition` called.
2. If granted: coords stored in component state.
3. `useNearbyKitchenPartners(lat, lng)` hook:
   - Fetches all `kitchen_partners` (active) and `kitchen_partner_locations` (active).
   - For each kitchen, finds its location record and computes Haversine distance in km.
   - Returns full kitchen list enriched with `.distance` field.
4. Only kitchens within `app_config.kitchen_visibility_radius` km AND with `is_attendance_marked = true` are shown as "live".
5. Sort by `Distance` sorts the filtered list by `k.distance`.

### Configuring Radius

Update via Supabase dashboard or SQL:

```sql
UPDATE app_config
SET value = '{"radius_miles": 15}'
WHERE key = 'kitchen_visibility_radius';
```

### Adding Kitchens

Insert into both tables:

```sql
INSERT INTO kitchen_partners (id, partner_id, name, …) VALUES (…);
INSERT INTO kitchen_partner_locations (kitchen_id, latitude, longitude, pincode, …) VALUES (…);
```

---

## 7. User Dashboard

### Data Sources

| Section | Source |
|---------|--------|
| User name / email / phone | `profiles` table (via `useAuth`) |
| Wallet balance | `user_wallets` table (via `WalletSection`) |
| Instant order history | `instant_orders` WHERE `customer_id = auth.uid()` |
| Party orders | `party_orders` table (via `useMyPartyOrders`) |
| Party drafts | `party_orders` WHERE `status = 'draft'` |
| Active subscription | `subscription_customers` — **not wired yet** |
| FAQs | Static (no DB, intentional) |

### Key Hooks

- `useMyPartyOrders(userId)` — party orders
- `useMyPartyDrafts(userId, phone)` — saved drafts
- Direct Supabase query in `useEffect` for `instant_orders`

---

## 8. Admin Dashboard

### Data Sources

| Card | Source |
|------|--------|
| Active Kitchens | `kitchen_partners` COUNT WHERE `is_active = true` |
| Total Orders | `instant_orders` COUNT |
| Menu Categories | DISTINCT `category` from `instant_menu_items` |
| Registered Users | `profiles` COUNT |

### Pending Orders Queue

- Source: `instant_orders` WHERE `status = 'new'` ORDER BY `created_at DESC` LIMIT 5
- Accept: sets `status = 'accepted'`, `accepted_at = now()`
- Reject: sets `status = 'rejected'`, `rejected_at = now()`, `rejection_reason = 'Admin rejected'`

### Realtime

Both `instant_orders` and `kitchen_partners` are added to `supabase_realtime` publication. The hooks use `useRealtimeSubscription` to auto-invalidate queries on DB changes.

---

## 9. Known Issues & Next Steps

### Bug: `instant_orders` anon insert
- Fixed in migration `20260417073000_fix_instant_orders_anon_insert.sql`
- Allows unauthenticated guests to place orders (guest checkout flow)

### Bug: Order placed but not visible in DB
- Root cause was an overly restrictive RLS policy on `instant_orders` that prevented `INSERT` for anonymous users.
- Fix applied in `20260417073000` migration.

### Next Priority Items

1. Wire subscription plan to `subscription_customers` in Profile page.
2. Integrate payment gateway (Stripe or Razorpay) in Checkout flow.
3. Build partner dashboard on live `instant_orders` data.
4. Add post-delivery rating prompt → writes to `customer_feedback`.
5. Supabase Edge Function for WhatsApp order notifications (Twilio/WATI).
6. Admin: persist XLSX menu uploads to `instant_menu_items`.
7. Admin: partner onboarding lifecycle with proper `enrollment_leads` table.
