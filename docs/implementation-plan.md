# 🍽️ Shero US — Single Meal Order: Full Implementation Plan

> Version 1.0 | April 2026 | Assignable Task Document

---

## 📋 Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Complete Route Map](#2-complete-route-map)
3. [Tech Stack](#3-tech-stack)
4. [Implementation Plan by Sub-Phase](#4-implementation-plan-by-sub-phase)
   - [Phase 1.1 — Auth (Real OTP)](#sub-phase-11--foundation--auth)
   - [Phase 1.2 — Kitchen Discovery & Geo-filter](#sub-phase-12--kitchen-discovery--geo-filter)
   - [Phase 1.3 — Cart Persistence](#sub-phase-13--cart-persistence)
   - [Phase 1.4 — Checkout & Stripe Payment](#sub-phase-14--checkout--stripe-payment)
   - [Phase 1.5 — Notifications](#sub-phase-15--notifications)
   - [Phase 1.6 — Real-time Order Tracking](#sub-phase-16--real-time-order-tracking)
   - [Phase 1.7 — Customer Dashboard](#sub-phase-17--customer-dashboard)
   - [Phase 1.8 — Admin Dashboard](#sub-phase-18--admin-dashboard--orders--operations)
   - [Phase 1.9 — Partner Portal](#sub-phase-19--partner-portal)
   - [Phase 1.10 — Finance, Compliance & QA](#sub-phase-110--finance-compliance--qa)
5. [Database Schema Additions](#5-database-schema-additions)
6. [Supabase Edge Functions Required](#6-supabase-edge-functions-required)
7. [GitHub Copilot Prompts Reference](#7-github-copilot-prompts-reference)
8. [Timeline Summary](#8-timeline-summary)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Required Credentials & Assets](#10-required-credentials--assets)
11. [Open Questions / Business Decisions Required](#11-open-questions--business-decisions-required)

---

## 1. Current State Assessment

| Area | Status | Gap |
|---|---|---|
| Kitchen listing (`/instant-delivery`) | ✅ Live — reads `kitchen_partners` from Supabase | Geo-filter is client-side only; no server-side radius query |
| Kitchen detail (`/instant-delivery/kitchen/:id`) | ✅ Live — reads `instant_menu_items` | Menu toggle not real-time per partner session |
| Item detail (`/instant-delivery/item/:id`) | ✅ Live | Allergen/nutrition data entered manually |
| Cart | ⚠️ In-memory React state only | Lost on refresh; no cross-device persistence |
| Auth (`/auth`) | ⚠️ Dev stub — phone → fake email, hardcoded OTP `123456` | Must switch to real Twilio OTP or Supabase Phone Auth |
| Checkout (`/checkout`) | ⚠️ Order is inserted BUT payment is a fake `setTimeout` | Stripe not integrated |
| Order confirmation | ⚠️ Static screen | No SMS / email is fired |
| Order tracking (`/order-tracking`) | ❌ Uses `mockTrackedOrder` hardcoded data | Must read real `instant_orders` via Supabase Realtime |
| Customer dashboard (`/customer`) | ⚠️ Fetches real orders but falls back to mock `orderHistory` array | Wallet is in-memory; lost on refresh |
| Wallet | ⚠️ In-memory `WalletContext` only | No `wallet_transactions` table write; balance not persisted |
| Admin orders (`/admin/orders`) | ✅ Reads `instant_orders` from Supabase | Status updates wired; delivery assignment is stub |
| Partner portal | ✅ UI complete | Order accept / prep / mark-ready not writing to `instant_orders` |
| Payments | ❌ Demo only | Stripe PaymentIntent + webhook not implemented |
| Notifications | ❌ Not implemented | Twilio SMS + SendGrid email needed |
| Delivery partner | ❌ Config exists in `deliveryTrackingData.ts` | DoorDash Drive / Uber Direct API not called |

---

## 2. Complete Route Map

### 2.1 Customer Routes

| Route | Component File | Purpose |
|---|---|---|
| `/` | `src/pages/Index.tsx` | Homepage — hero, ZIP serviceability check |
| `/auth` | `src/pages/Auth.tsx` | Login / Signup — phone OTP or email |
| `/instant-delivery` | `src/pages/InstantDelivery.tsx` | Kitchen listing, geo-filter, category filter |
| `/instant-delivery/kitchen/:id` | `src/pages/KitchenDetail.tsx` | Menu browsing, add to cart, add-ons |
| `/instant-delivery/item/:id` | `src/pages/ItemDetail.tsx` | Item detail, nutrition, allergens |
| `/checkout` | `src/pages/Checkout.tsx` | Cart review, address, slot, promo, payment |
| `/order-confirmation` | `src/pages/OrderConfirmation.tsx` | Post-payment success screen |
| `/order-tracking` | `src/pages/OrderTracking.tsx` | Live status, ETA, modification, cancel |
| `/customer` | `src/pages/Profile.tsx` | Dashboard — orders, wallet, referrals, FAQs |
| `/referrals` | `src/pages/CustomerReferrals.tsx` | Share referral code, view rewards |
| `/privacy-policy` | `src/pages/PrivacyPolicy.tsx` | Legal |
| `/terms-of-service` | `src/pages/TermsOfService.tsx` | Legal |
| `/allergen-notice` | `src/pages/AllergenNotice.tsx` | Allergen compliance page |

### 2.2 Admin Routes

| Route | Component File | Purpose |
|---|---|---|
| `/admin` | `src/pages/admin/AdminDashboard.tsx` | KPI overview, PPP approvals |
| `/admin/orders` | `src/pages/admin/AdminOrders.tsx` | Live orders, accept/reject/assign delivery |
| `/admin/menus` | `src/pages/admin/AdminMenus.tsx` | Global menu management |
| `/admin/kitchen-categories` | `src/pages/admin/AdminKitchenCategories.tsx` | Cuisine categories |
| `/admin/manual-order` | `src/pages/admin/AdminManualOrder.tsx` | Phone-in order punching |
| `/admin/order-modifications` | `src/pages/admin/AdminOrderModifications.tsx` | Customer modification requests queue |
| `/admin/delivery-mgmt` | `src/pages/admin/AdminDeliveryManagement.tsx` | Zone management, delivery partner assign |
| `/admin/delivery-analytics` | `src/pages/admin/AdminDeliveryAnalytics.tsx` | Delivery KPIs |
| `/admin/instant-finance` | `src/pages/admin/AdminInstantFinance.tsx` | Revenue, tips, delivery fees |
| `/admin/payments` | `src/pages/admin/AdminPayments.tsx` | Stripe reconciliation |
| `/admin/promotions` | `src/pages/admin/AdminPromotions.tsx` | Promo codes, wallet rules |
| `/admin/debit-credit` | `src/pages/admin/AdminDebitCredit.tsx` | Manual wallet adjustments |
| `/admin/wallet-referrals` | `src/pages/admin/AdminWalletExpiry.tsx` | Referral program management |
| `/admin/users` | `src/pages/admin/AdminUsers.tsx` | Customer list and profiles |
| `/admin/customer-feedback` | `src/pages/admin/AdminCustomerFeedback.tsx` | Ratings and complaints |
| `/admin/live-support` | `src/pages/admin/AdminLiveSupport.tsx` | Real-time chat support |
| `/admin/tickets` | `src/pages/admin/AdminTickets.tsx` | Support ticket management |
| `/admin/instant-comms` | `src/pages/admin/AdminCommunications.tsx` | SMS / email template management |
| `/admin/invoice-settings` | `src/pages/admin/AdminInvoiceSettings.tsx` | Delivery fee and tip presets |

### 2.3 Partner Routes

| Route | Component File | Purpose |
|---|---|---|
| `/partner` | `src/pages/partner/PartnerDashboard.tsx` | Daily earnings, order count |
| `/partner/orders` | `src/pages/partner/PartnerOrders.tsx` | Accept / decline, prep timer |
| `/partner/menu` | `src/pages/partner/PartnerMenuManagement.tsx` | Menu CRUD |
| `/partner/menu-items` | `src/pages/partner/PartnerMenuItems.tsx` | Item-level management |
| `/partner/ingredients` | `src/pages/partner/PartnerIngredients.tsx` | Ingredient / allergen data |
| `/partner/kitchen-attendance` | `src/pages/partner/PartnerKitchenAttendance.tsx` | Go-live toggle |
| `/partner/kitchen-schedule` | `src/pages/partner/PartnerKitchenSchedule.tsx` | Delivery slot windows |
| `/partner/earnings` | `src/pages/partner/PartnerEarnings.tsx` | Revenue + tips breakdown |
| `/partner/performance` | `src/pages/partner/PartnerPerformance.tsx` | Ratings, on-time %, complaints |
| `/partner/tips` | `src/pages/partner/PartnerTips.tsx` | Tip history |
| `/partner/reports` | `src/pages/partner/PartnerReports.tsx` | Weekly / monthly summaries |

---

## 3. Tech Stack

### 3.1 Frontend (already in repo — no changes needed)

| Tool | Version | Role |
|---|---|---|
| Next.js (App Router) | 15.x | Framework + routing |
| React | 18.3 | UI library |
| TypeScript | 5.8 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| shadcn/ui + Radix UI | latest | Component library |
| TanStack Query | 5.83 | Data fetching + caching |
| React Hook Form + Zod | latest | Forms + validation |
| Framer Motion | 12 | Animations |
| react-leaflet | 4.2 | Maps for delivery radius visualisation |
| jsPDF | 4.2 | Invoice PDF generation |
| Lucide React | latest | Icons |

### 3.2 Backend / Database

| Tool | Role | Current Status |
|---|---|---|
| Supabase (PostgreSQL) | Primary DB, Auth, Realtime, Storage | Partially wired |
| Supabase Auth | User sessions, RLS policies | Dev stub (needs real phone OTP) |
| Supabase Realtime | Live order status push to customer + partner | Hooks exist; order tracking page needs wiring |
| Supabase Edge Functions | Serverless endpoints for Stripe webhooks, notifications, cron | Not yet created |
| Supabase Storage | Menu item images, chef photos | Used for some partner images |

### 3.3 Third-Party Integrations to Add

| Service | Purpose | Mode behavior | Provider |
|---|---|---|---|
| **Stripe** | Payment processing — card/UPI/wallet flows | **Demo:** simulated payment intent response; **Live:** real Stripe API | stripe.com |
| **Avalara** | Tax ERP/API | **Demo:** simulated tax breakdown; **Live:** real Avalara API | avalara.com |
| **DoorDash Drive** | Third-party delivery dispatch/tracking | **Demo:** simulated delivery id + tracking payload; **Live:** real DoorDash API | developer.doordash.com |
| **Gallabox** | SMS notifications/OTP/status alerts | **Demo:** simulated send + delivery status; **Live:** real Gallabox API | gallabox.com |
| **SMTP Provider** | Transactional email — order confirm/invoice | **Demo:** logged/simulated email response; **Live:** real SMTP delivery | (provider-specific) |
| **Google Maps Platform** | Address autocomplete + geocoding | Same behavior in demo/live | console.cloud.google.com |

### 3.4 Current Delivery Snapshot (Completed vs Pending)

#### ✅ Completed
1. DB schema design (migrations/tables/RLS exist)
2. UI/UX screens integration (broad coverage in app/src pages)
3. Auth system (OTP send/verify + session + role handling)
4. Delivery radius logic (geo + radius + ZIP check hook)
5. Menu API + UI binding (Supabase hooks wired to menu/kitchens)
6. Cart system (DB-backed user cart sync)
7. Checkout flow (address/slot/promo/payment section/order submit flow)
8. Order placement + DB (`instant_orders` insert wired)
9. User dashboard (live orders/profile/wallet sections wired)
10. Admin order management (live orders + actions UI)
11. Compliance pages (privacy/terms/cookies/accessibility/etc.)
12. Deployment readiness (Next.js build + Vercel docs/scripts)

#### 🔲 Pending / Partial
1. Project setup wording mismatch: "Next.js + Prisma + Postgres" vs actual stack (Next.js + Supabase Postgres)
2. Homepage ZIP validation on existing address input before search bar
3. Stripe end-to-end integration (Elements/webhook confirmation path)
4. Avalara tax API integration
5. DoorDash API dispatch integration
6. SMTP email notification integration
7. Gallabox SMS integration
8. Admin menu upload persistence to DB
9. Admin ZIP control dedicated module
10. Security/validation hardening pass
11. Expanded tests + bug fixing pass

---

## 4. Implementation Plan by Sub-Phase

---

### Sub-Phase 1.1 — Foundation & Auth

**Days:** 1–3 | **Est. Hours:** 8 hrs
**Goal:** Real phone OTP authentication. All downstream features require a real session.

#### Tasks

- [ ] **Task 1.1.1** — Create Supabase Edge Function `send-otp`
  - File: `supabase/functions/send-otp/index.ts`
  - Accepts: `POST { phone: string }`
  - Calls Twilio Verify: `POST services/{VERIFY_SID}/verifications`
  - Returns: `{ success: boolean }`
  - Environment vars needed: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SID`

- [ ] **Task 1.1.2** — Create Supabase Edge Function `verify-otp`
  - File: `supabase/functions/verify-otp/index.ts`
  - Accepts: `POST { phone: string, code: string }`
  - Calls Twilio Verify check endpoint
  - On success: `supabase.auth.signInWithOtp()` or signs in by phone-mapped email
  - Returns: `{ success: boolean, user: object }`

- [ ] **Task 1.1.3** — Update `src/pages/Auth.tsx`
  - Replace `handleSendOtp` function body — remove fake email construction and `DEV_OTP` constant
  - Call `fetch('/functions/v1/send-otp', { body: { phone } })` instead
  - Replace `handleVerifyOtp` to call `/functions/v1/verify-otp`
  - Remove `const DEV_OTP = "123456"` and all references

- [ ] **Task 1.1.4** — Verify profile auto-creation trigger
  - Check migration file: confirm `handle_new_user` trigger creates a `profiles` row and `user_roles` row with `customer` role on signup
  - If missing, add migration: `supabase/migrations/XXXXXX_add_handle_new_user_trigger.sql`

- [ ] **Task 1.1.5** — Add `<RequireAuth>` wrapper component
  - File: `src/components/RequireAuth.tsx`
  - Redirects unauthenticated users to `/auth?next=<currentPath>`
  - Wrap in router: `/checkout`, `/customer`, `/referrals`

- [ ] **Task 1.1.6** — Add OTP rate limiting to Edge Function
  - Maximum 3 OTP sends per phone number per hour
  - Store attempts in a `otp_attempts` table or Supabase KV
  - Return `429 Too Many Requests` when limit exceeded

#### Copilot Prompts

```
"Create a Supabase Edge Function in Deno/TypeScript that calls Twilio Verify 
to send an OTP to a phone number and returns { success: boolean }. 
Use TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SID from env."

"In src/pages/Auth.tsx, replace handleSendOtp which currently creates a Supabase 
user with a fake email. Call a Supabase Edge Function at /functions/v1/send-otp 
with { phone } and show a toast on success or error using the existing useToast hook."
```

---

### Sub-Phase 1.2 — Kitchen Discovery & Geo-filter

**Days:** 3–5 | **Est. Hours:** 6 hrs
**Goal:** Accurate geo-based kitchen listing from DB, real-time attendance badges.

#### Tasks

- [ ] **Task 1.2.1** — Create Supabase RPC function `get_nearby_kitchens`
  - File: `supabase/migrations/XXXXXX_add_get_nearby_kitchens_rpc.sql`
  - Uses haversine formula in SQL to return kitchens within `radius_km`
  - Signature: `get_nearby_kitchens(customer_lat float, customer_lng float, radius_km float)`
  - Returns: all columns of `kitchen_partners` + computed `distance_km` field

  ```sql
  CREATE OR REPLACE FUNCTION get_nearby_kitchens(
    customer_lat float, customer_lng float, radius_km float
  )
  RETURNS TABLE (LIKE kitchen_partners, distance_km float) AS $$
    SELECT *,
      (6371 * acos(
        cos(radians(customer_lat)) * cos(radians(latitude))
        * cos(radians(longitude) - radians(customer_lng))
        + sin(radians(customer_lat)) * sin(radians(latitude))
      )) AS distance_km
    FROM kitchen_partners
    WHERE is_active = TRUE
    HAVING distance_km <= radius_km
    ORDER BY distance_km ASC
  $$ LANGUAGE SQL STABLE;
  ```

- [ ] **Task 1.2.2** — Update `useNearbyKitchenPartners` hook
  - File: `src/hooks/useSupabaseData.ts`
  - Change query body to call `supabase.rpc('get_nearby_kitchens', { customer_lat, customer_lng, radius_km })`
  - Remove client-side haversine filtering loop

- [ ] **Task 1.2.3** — Add ZIP-code fallback to `InstantDelivery.tsx`
  - If `locationStatus === "denied"`, render a ZIP input
  - On submit, call `useServiceability().checkByZip(zip)` (already exists in `src/hooks/useServiceability.ts`)
  - If serviceable, query kitchens by matching `kitchen_partner_locations.pincode`

- [ ] **Task 1.2.4** — Real-time attendance badge
  - The `useRealtimeSubscription("kitchen_partners", ...)` hook already exists
  - Verify it triggers re-render of the live/closed badge without a page reload
  - Test: toggle `is_attendance_marked` in Supabase Dashboard → badge should update in <2s

- [ ] **Task 1.2.5** — Verify admin `kitchen_visibility_radius` config
  - In `/admin/location-support`, confirm saving the radius updates `app_config` table key `kitchen_visibility_radius`
  - The `useKitchenVisibilityRadius` hook reads this; the RPC should use it

#### Copilot Prompts

```
"Write a PostgreSQL function get_nearby_kitchens(customer_lat float, customer_lng float, 
radius_km float) that returns kitchen_partners rows with a computed distance_km column 
using the haversine formula, filtered to rows within radius_km."

"Update the useNearbyKitchenPartners hook in src/hooks/useSupabaseData.ts to call 
supabase.rpc('get_nearby_kitchens') instead of fetching all kitchens and filtering 
client-side with haversine."
```

---

### Sub-Phase 1.3 — Cart Persistence

**Days:** 5–6 | **Est. Hours:** 3 hrs
**Goal:** Cart survives page refresh; logged-in users see same cart across devices.

#### Tasks

- [ ] **Task 1.3.1** — Add `localStorage` sync to `CartContext`
  - File: `src/contexts/CartContext.tsx`
  - On every `setItems`, write `localStorage.setItem("shero_cart", JSON.stringify(items))`
  - On mount inside `CartProvider`, read `localStorage.getItem("shero_cart")` and restore state
  - Handle JSON parse errors gracefully

- [ ] **Task 1.3.2** — Create `cart_items` Supabase table
  - File: `supabase/migrations/XXXXXX_add_cart_items.sql`

  ```sql
  CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES instant_menu_items(id),
    quantity INT NOT NULL DEFAULT 1,
    selected_add_ons JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, item_id)
  );
  ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users manage own cart" ON cart_items
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  ```

- [ ] **Task 1.3.3** — Sync CartContext to DB for logged-in users
  - In `CartProvider`, use `useAuth()` to get current user
  - On every `items` change (debounced 500ms), upsert to `cart_items` table when user is logged in
  - On user login, merge DB cart items into local cart (union, taking higher quantity on conflict)

#### Copilot Prompts

```
"Extend the CartProvider in src/contexts/CartContext.tsx to persist cart items to 
localStorage on every update and restore them on mount, with JSON parse error handling."

"Add a useEffect in CartProvider that, when the user is logged in, syncs cart items 
to the Supabase cart_items table using an upsert, debounced by 500ms."
```

---

### Sub-Phase 1.4 — Checkout & Stripe Payment

**Days:** 6–9 | **Est. Hours:** 8 hrs
**Goal:** Real money flows through Stripe. Order created on payment success only.

#### Tasks

- [ ] **Task 1.4.1** — Install Stripe dependencies

  ```bash
  npm install @stripe/stripe-js @stripe/react-stripe-js
  ```

- [ ] **Task 1.4.2** — Create Edge Function `create-payment-intent`
  - File: `supabase/functions/create-payment-intent/index.ts`
  - Accepts: `POST { amount: number, currency: string, orderId: string, customerId: string }`
  - Creates Stripe PaymentIntent
  - Returns: `{ clientSecret: string }`
  - Environment vars: `STRIPE_SECRET_KEY`

- [ ] **Task 1.4.3** — Create Edge Function `stripe-webhook`
  - File: `supabase/functions/stripe-webhook/index.ts`
  - Verifies Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`
  - On `payment_intent.succeeded`:
    - Updates `instant_orders.status = "accepted"`
    - Calls `trigger-notification` Edge Function
  - On `payment_intent.payment_failed`:
    - Updates `instant_orders.status = "payment_failed"`

- [ ] **Task 1.4.4** — Replace `PaymentSection` with Stripe Elements
  - File: `src/components/PaymentSection.tsx`
  - Wrap with `<Elements stripe={stripePromise}>`
  - Use `<PaymentElement />` — this natively handles card, Apple Pay, Google Pay
  - For ACH: use `us_bank_account` payment method configuration
  - On `stripe.confirmPayment()` success, call `onPaymentSuccess()`

- [ ] **Task 1.4.5** — Update checkout order creation flow
  - File: `src/pages/Checkout.tsx`
  - Change: create order with `status: "payment_pending"` first
  - Then call `create-payment-intent` with order amount
  - Show `<PaymentElement>` with the returned `clientSecret`
  - Stripe webhook updates status to `"accepted"` on payment success
  - Navigate to `/order-confirmation?orderId=<id>` on confirmed payment

- [ ] **Task 1.4.6** — Add Google Places address autocomplete
  - Create component: `src/components/AddressAutocomplete.tsx`
  - Uses `@googlemaps/js-api-loader` with `places` library
  - Returns: `{ formattedAddress, lat, lng, zip, state }`
  - Replace manual address input fields in `Checkout.tsx`
  - Environment var: `VITE_GOOGLE_MAPS_API_KEY`

- [ ] **Task 1.4.7** — Wire wallet balance to checkout
  - On checkout page, show available wallet balance
  - Allow customer to toggle "Use wallet credit" (up to 50% on first order; 100% thereafter)
  - Deduct from `wallet_transactions` on successful payment (insert negative transaction row)

#### Copilot Prompts

```
"Create a Supabase Edge Function in Deno/TypeScript that creates a Stripe PaymentIntent 
given { amount, currency, metadata } and returns { clientSecret }. 
Use STRIPE_SECRET_KEY from environment."

"Create a Supabase Edge Function that handles Stripe webhook events. 
On payment_intent.succeeded, update instant_orders.status to 'accepted' 
and call the trigger-notification function."

"Replace the PaymentSection component in src/components/PaymentSection.tsx 
with Stripe Elements using @stripe/react-stripe-js. 
Support card, Apple Pay, and Google Pay via the PaymentElement component."

"Create a React component AddressAutocomplete.tsx that uses @googlemaps/js-api-loader 
to provide a Google Places autocomplete address input. It should return the 
formatted address, latitude, longitude, and ZIP code via an onChange callback."
```

---

### Sub-Phase 1.5 — Notifications

**Days:** 9–10 | **Est. Hours:** 4 hrs
**Goal:** Customer and partner receive SMS + email on every order state change.

#### Tasks

- [ ] **Task 1.5.1** — Create Edge Function `trigger-notification`
  - File: `supabase/functions/trigger-notification/index.ts`
  - Accepts: `POST { orderId: string, event: string }`
  - Events: `order_placed`, `order_accepted`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`
  - Fetches order + customer + partner data from DB
  - Calls `send-sms` and `send-order-email` with the appropriate template

- [ ] **Task 1.5.2** — Create Edge Function `send-sms`
  - File: `supabase/functions/send-sms/index.ts`
  - Accepts: `POST { to: string, body: string }`
  - Calls Twilio Messages API
  - Environment vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`

- [ ] **Task 1.5.3** — Create Edge Function `send-order-email`
  - File: `supabase/functions/send-order-email/index.ts`
  - Accepts: `POST { to: string, templateId: string, dynamicData: object }`
  - Calls SendGrid API
  - Templates needed:
    - `order_confirmation` — order ID, items list, total, expected delivery time
    - `new_order_alert` (to partner) — items, customer name/phone, delivery slot
    - `order_delivered` — "Thank you" + link to download invoice PDF
    - `order_cancelled` — confirmation of cancellation + refund ETA
  - Environment var: `SENDGRID_API_KEY`

- [ ] **Task 1.5.4** — Create SMS template store in DB
  - Connect `/admin/instant-comms` page to a `communications_templates` table
  - Templates have: `event` (enum), `channel` (sms/email), `subject`, `body` (with `{{variables}}`)
  - `trigger-notification` reads templates from this table instead of hardcoding

- [ ] **Task 1.5.5** — Wire `trigger-notification` into all status change points
  - Stripe webhook → on `payment_intent.succeeded`
  - Admin order status change (sub-phase 1.8)
  - Partner order status change (sub-phase 1.9)
  - Customer cancel flow (sub-phase 1.6)

#### Copilot Prompts

```
"Create a Supabase Edge Function trigger-notification that accepts { orderId, event }, 
fetches order details from Supabase, and calls a send-sms function with the 
appropriate message template based on the event."

"Create a Supabase Edge Function send-order-email that uses the SendGrid API to send 
a transactional email. Accept { to, templateId, dynamicData } and use SENDGRID_API_KEY 
from environment."
```

---

### Sub-Phase 1.6 — Real-time Order Tracking

**Days:** 10–12 | **Est. Hours:** 5 hrs
**Goal:** `/order-tracking` shows real DB data with live status push.

#### Tasks

- [ ] **Task 1.6.1** — Remove mock data from `OrderTracking.tsx`
  - File: `src/pages/OrderTracking.tsx`
  - Remove `import { mockTrackedOrder } from ...`
  - Read `orderId` from `useSearchParams()`
  - Add `useQuery` to fetch `instant_orders` row by `orderId`

- [ ] **Task 1.6.2** — Add Supabase Realtime subscription in `OrderTracking.tsx`
  - Subscribe to changes on `instant_orders` where `id = orderId`
  - On row change, update local state and re-render progress bar
  - Unsubscribe on component unmount

- [ ] **Task 1.6.3** — Map DB status values to tracking UI steps
  - Create a mapping constant:

  ```ts
  const STATUS_STEPS = {
    "payment_pending": 0,
    "accepted": 1,
    "preparing": 2,
    "ready": 3,
    "rider_assigned": 4,
    "picked_up": 5,
    "in_transit": 6,
    "near_destination": 7,
    "delivered": 8,
  };
  ```

  - Drive the existing 9-step progress bar UI from this mapping

- [ ] **Task 1.6.4** — ETA calculation
  - On order accept: set `instant_orders.estimated_delivery_at = NOW() + prep_time + delivery_estimate`
  - Display countdown timer in `OrderTracking.tsx` using `estimated_delivery_at`
  - Update ETA display as status advances

- [ ] **Task 1.6.5** — Wire 5-minute modification window
  - The countdown timer already exists in the UI
  - On "modify" button click, insert a row into `order_modifications` table
  - Admin sees this in `/admin/order-modifications` queue

- [ ] **Task 1.6.6** — Wire cancel flow end-to-end
  - Cancel dialog → `useUpdateInstantOrder` mutation: status = `"cancelled"`
  - Call Edge Function `process-refund` (Task 1.6.7)
  - Call `trigger-notification` with event `order_cancelled`

- [ ] **Task 1.6.7** — Create Edge Function `process-refund`
  - File: `supabase/functions/process-refund/index.ts`
  - Fetches `instant_orders.payment_intent_id`
  - Calls Stripe `POST /v1/refunds` with the PaymentIntent ID
  - On success, credits refund amount to `wallet_transactions` as `type: "refund"`

- [ ] **Task 1.6.8** — Pass `orderId` through the full flow
  - `Checkout.tsx`: after `createInstantOrder` → navigate to `/order-confirmation?orderId=<id>`
  - `OrderConfirmation.tsx`: show "Track Order" button linking to `/order-tracking?orderId=<id>`

#### Copilot Prompts

```
"Update OrderTracking.tsx to read orderId from useSearchParams, fetch the order from 
Supabase instant_orders table, and subscribe to real-time row changes using 
supabase.channel().on('postgres_changes'). Remove all mockTrackedOrder references."

"Create a Supabase Edge Function process-refund that fetches the payment_intent_id 
from the instant_orders table and calls the Stripe Refunds API to issue a full refund."
```

---

### Sub-Phase 1.7 — Customer Dashboard

**Days:** 12–14 | **Est. Hours:** 5 hrs
**Goal:** Real order history, persistent wallet, functional referrals and spin wheel.

#### Tasks

- [ ] **Task 1.7.1** — Remove mock `orderHistory` fallback from `Profile.tsx`
  - File: `src/pages/Profile.tsx`
  - The `liveOrders` state already fetches from `instant_orders` via `supabase.from("instant_orders")`
  - Remove the `orderHistory` const and replace all references with `liveOrders`
  - Add loading skeleton and empty-state message

- [ ] **Task 1.7.2** — Create `wallet_transactions` table migration
  - File: `supabase/migrations/XXXXXX_add_wallet_transactions.sql`

  ```sql
  CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,  -- positive = credit, negative = debit
    type TEXT NOT NULL CHECK (type IN ('credit','debit')),
    reason TEXT,  -- 'referral' | 'spin' | 'order_use' | 'refund' | 'manual'
    order_id UUID REFERENCES instant_orders(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users view own wallet" ON wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);
  ```

- [ ] **Task 1.7.3** — Update `WalletContext` to read from DB
  - File: `src/contexts/WalletContext.tsx`
  - Replace in-memory balance state with `useQuery` that sums `wallet_transactions`
  - Query: `SELECT SUM(amount) FROM wallet_transactions WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > now())`
  - Replace `addCredit`, `deductBalance` functions with Supabase inserts into `wallet_transactions`

- [ ] **Task 1.7.4** — Add referral code to profiles
  - Migration: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;`
  - Create DB trigger or Edge Function that generates a unique 6-char alphanumeric code on profile creation
  - `/referrals` page reads `profile.referral_code` from `AuthContext`

- [ ] **Task 1.7.5** — Wire referral reward on signup
  - In `Auth.tsx`, check URL param `?ref=CODE` after successful signup
  - Call Edge Function `process-referral` with `{ newUserId, referralCode }`
  - Edge Function: look up referrer's `profiles.user_id` → insert credit row into `wallet_transactions`

- [ ] **Task 1.7.6** — Wire spin wheel to wallet
  - Add `spin_used BOOLEAN DEFAULT FALSE` to `profiles` table
  - After spin: call `useUpdateProfile` to set `spin_used = true`
  - Insert won amount into `wallet_transactions` with `reason: "spin"`
  - Show spin button only if `!profile.spin_used`

- [ ] **Task 1.7.7** — Wire customer settings save
  - `CustomerSettings` component → `useUpdateProfile` mutation → upsert `profiles` table
  - Fields: `full_name`, `phone`, `email`, `address` (JSONB)

#### Copilot Prompts

```
"Update WalletContext in src/contexts/WalletContext.tsx to fetch the balance from 
Supabase wallet_transactions table by summing non-expired rows for the current user, 
using TanStack Query."

"Write a Supabase PostgreSQL trigger that auto-generates a unique 6-character 
alphanumeric referral_code on insert into the profiles table."
```

---

### Sub-Phase 1.8 — Admin Dashboard — Orders & Operations

**Days:** 14–17 | **Est. Hours:** 6 hrs
**Goal:** Admin controls the full order lifecycle in real-time with DB writes and notifications.

#### Tasks

- [ ] **Task 1.8.1** — Create `useUpdateInstantOrder` mutation
  - File: `src/hooks/useSupabaseData.ts`
  - Mutation: updates `instant_orders` by `id`, invalidates `["instant_orders"]` query
  - After successful update, call `trigger-notification` Edge Function

- [ ] **Task 1.8.2** — Wire admin action buttons in `AdminOrders.tsx`
  - File: `src/pages/admin/AdminOrders.tsx`
  - Each status button must call `useUpdateInstantOrder` with the new status
  - Status progression: `new → accepted → preparing → ready → rider_assigned → in_transit → delivered`
  - Cancel/reject: status → `"cancelled"` / `"rejected"` + call `process-refund` if payment was online

- [ ] **Task 1.8.3** — Create Edge Function `dispatch-delivery`
  - File: `supabase/functions/dispatch-delivery/index.ts`
  - Triggered when admin clicks "Assign Delivery"
  - Calls DoorDash Drive API `POST /drive/v2/deliveries` (or Uber Direct equivalent)
  - Stores returned `deliveryId` and tracking URL in `instant_orders.delivery_details` (JSONB)
  - Migration: `ALTER TABLE instant_orders ADD COLUMN IF NOT EXISTS delivery_details JSONB DEFAULT '{}';`

- [ ] **Task 1.8.4** — Wire manual order punching
  - File: `src/pages/admin/AdminManualOrder.tsx`
  - Verify form inserts into `instant_orders` with:
    - `payment_method: "cod"`
    - `source: "manual"`
    - `status: "accepted"` (no payment step needed)
  - Call `trigger-notification` with event `order_placed`

- [ ] **Task 1.8.5** — Order modifications queue
  - File: `src/pages/admin/AdminOrderModifications.tsx`
  - Read from `order_modifications` table
  - Approve: call `useUpdateInstantOrder` with updated items
  - Reject: update `order_modifications.status = "rejected"`

- [ ] **Task 1.8.6** — Verify Admin Realtime
  - `useInstantOrders` hook already uses `useRealtimeSubscription("instant_orders", ...)`
  - Test: place an order → admin dashboard should show it within 2 seconds without refresh

#### Copilot Prompts

```
"Create a Supabase Edge Function dispatch-delivery that calls the DoorDash Drive API 
to create a delivery for a given instant_orders row, and stores the returned 
delivery_id and tracking_url back into instant_orders.delivery_details."

"In src/pages/admin/AdminOrders.tsx, wire each status action button to call the 
useUpdateInstantOrder mutation with the correct status value, and then call the 
trigger-notification Supabase Edge Function."
```

---

### Sub-Phase 1.9 — Partner Portal

**Days:** 17–18 | **Est. Hours:** 4 hrs
**Goal:** Partner can accept orders, manage their menu, mark attendance, and see real earnings.

#### Tasks

- [ ] **Task 1.9.1** — Wire order accept / decline buttons in `PartnerOrders.tsx`
  - Call `useUpdateInstantOrder` mutation
  - Accept: status → `"preparing"` + call `trigger-notification`
  - Decline: status → `"rejected"` + call `trigger-notification` + `process-refund`

- [ ] **Task 1.9.2** — Wire prep timer and "Mark Ready"
  - On accept, start a countdown timer with `kitchen.prep_time_minutes`
  - "Mark Ready" button: status → `"ready"` + call `trigger-notification`

- [ ] **Task 1.9.3** — Wire kitchen attendance toggle
  - File: `src/pages/partner/PartnerKitchenAttendance.tsx`
  - Toggle switch → upsert `kitchen_partners.is_attendance_marked` via `useUpdateKitchenPartner` mutation
  - This controls the live/closed badge on the public kitchen listing page

- [ ] **Task 1.9.4** — Partner menu CRUD verification
  - File: `src/pages/partner/PartnerMenuItems.tsx`
  - Verify Create/Edit/Delete all write to `instant_menu_items` with `kitchen_id = currentPartner.id`
  - Verify `is_toggled_on` toggle updates the item's availability in real-time on `KitchenDetail.tsx`

- [ ] **Task 1.9.5** — Partner earnings from real orders
  - File: `src/pages/partner/PartnerEarnings.tsx`
  - Query `instant_orders WHERE partner_id = currentPartner.id AND status = 'delivered'`
  - Calculate: `total_earnings = SUM(subtotal * partner_rate) + SUM(tips)`
  - `partner_rate` from `kitchen_partners.commission_rate` (or app config)

- [ ] **Task 1.9.6** — Real-time new order toast for partner
  - In `PartnerOrders.tsx`, subscribe to new `instant_orders` rows where `kitchen_id = currentPartner.kitchenId`
  - Show a toast notification with an alert sound on new order arrival

#### Copilot Prompts

```
"In src/pages/partner/PartnerOrders.tsx, wire the Accept button to call 
useUpdateInstantOrder with status 'preparing' and then call trigger-notification. 
Wire the Decline button to call useUpdateInstantOrder with status 'rejected'."

"In src/pages/partner/PartnerKitchenAttendance.tsx, wire the attendance toggle 
to upsert kitchen_partners.is_attendance_marked via a Supabase mutation."
```

---

### Sub-Phase 1.10 — Finance, Compliance & QA

**Days:** 18–20 | **Est. Hours:** 4 hrs
**Goal:** Correct tax calculation, RLS audit, input validation, and integration tests.

#### Tasks

- [ ] **Task 1.10.1** — Tax calculation verification
  - File: `src/utils/invoiceGenerator.ts`
  - Verify tax rates use correct US state rates from `app_config.invoice_settings`
  - Texas: 8.25% (6% state + 2.25% local)
  - Florida: 7% (6% state + 1% local)

- [ ] **Task 1.10.2** — Stripe reconciliation in Admin Finance
  - File: `src/pages/admin/AdminInstantFinance.tsx`
  - Read revenue from `instant_orders WHERE status = 'delivered'`
  - Add Stripe Balance API call via Edge Function to show available + pending payout amounts

- [ ] **Task 1.10.3** — Promo code usage tracking
  - After successful promo apply in `CartContext.applyPromoCode`, increment `promotions.usage_count`
  - Either via a DB trigger on `instant_orders` insert when promo is applied, or direct mutation on order creation

- [ ] **Task 1.10.4** — Full RLS audit
  - Review all tables: `instant_orders`, `instant_menu_items`, `kitchen_partners`, `cart_items`, `wallet_transactions`, `profiles`, `order_modifications`
  - Customers: SELECT/INSERT own orders, own cart, own wallet, own profile only
  - Partners: SELECT orders where `kitchen_id` matches their kitchen
  - Admins: full access via service role key in Edge Functions

- [ ] **Task 1.10.5** — Input validation with Zod
  - Checkout form: address required, ZIP must be 5 digits, phone must be 10 digits
  - Auth form: phone validation, name min-length
  - All forms already use `react-hook-form`; add Zod schema validation to each

- [ ] **Task 1.10.6** — Edge Function rate limiting
  - `send-otp`: max 3 calls per phone per hour
  - `create-payment-intent`: max 10 per user per hour (prevent abuse)
  - Use a `rate_limit_log` table or Upstash Redis

- [ ] **Task 1.10.7** — Integration tests
  - File: `src/tests/cart.test.ts`
    - Test: add item, update quantity, apply promo, clear cart
  - File: `src/tests/checkout.test.ts`
    - Test: form validation, order creation mutation mock, payment intent call
  - File: `src/tests/wallet.test.ts`
    - Test: balance calculation from transactions, referral credit, spin deduction

#### Copilot Prompts

```
"Write a Vitest test for CartContext that tests: adding an item, updating quantity 
to 0 removes the item, applying a valid promo code, and clearing the cart."

"Write a Supabase RLS policy for the instant_orders table that allows customers to 
SELECT only their own orders (where customer_id = auth.uid()) and INSERT new orders 
(where the inserted customer_id equals auth.uid())."
```

---

## 5. Database Schema Additions

```sql
-- ══════════════════════════════════════════════
-- MIGRATION: Cart Persistence
-- ══════════════════════════════════════════════
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES instant_menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  selected_add_ons JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id)
);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON cart_items
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════
-- MIGRATION: Wallet
-- ══════════════════════════════════════════════
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit','debit')),
  reason TEXT,
  order_id UUID REFERENCES instant_orders(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own wallet" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════
-- MIGRATION: Profile Extensions
-- ══════════════════════════════════════════════
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS spin_used BOOLEAN DEFAULT FALSE;

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code := upper(substring(md5(random()::text) from 1 for 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION generate_referral_code();

-- ══════════════════════════════════════════════
-- MIGRATION: Order Delivery Details
-- ══════════════════════════════════════════════
ALTER TABLE instant_orders
  ADD COLUMN IF NOT EXISTS delivery_details JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS delivery_partner TEXT,
  ADD COLUMN IF NOT EXISTS tracking_url TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- ══════════════════════════════════════════════
-- MIGRATION: Order Modifications
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS order_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES instant_orders(id),
  customer_id UUID REFERENCES auth.users(id),
  mod_type TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE order_modifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers insert own modifications" ON order_modifications
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers view own modifications" ON order_modifications
  FOR SELECT USING (auth.uid() = customer_id);

-- ══════════════════════════════════════════════
-- MIGRATION: Nearby Kitchens RPC
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_nearby_kitchens(
  customer_lat float, customer_lng float, radius_km float
)
RETURNS TABLE (
  id UUID, name TEXT, image TEXT, cuisine TEXT[], location TEXT,
  latitude DECIMAL, longitude DECIMAL, is_active BOOLEAN,
  is_attendance_marked BOOLEAN, is_branded BOOLEAN, is_veg BOOLEAN,
  distance_km float
) AS $$
  SELECT *,
    (6371 * acos(
      LEAST(1, cos(radians(customer_lat)) * cos(radians(latitude))
      * cos(radians(longitude) - radians(customer_lng))
      + sin(radians(customer_lat)) * sin(radians(latitude)))
    )) AS distance_km
  FROM kitchen_partners
  WHERE is_active = TRUE
    AND latitude IS NOT NULL AND longitude IS NOT NULL
  HAVING distance_km <= radius_km
  ORDER BY distance_km ASC
$$ LANGUAGE SQL STABLE;
```

---

## 6. Supabase Edge Functions Required

| Function | Method | Trigger | Description |
|---|---|---|---|
| `send-otp` | POST | Auth page — "Send OTP" | Call Twilio Verify to send OTP to phone |
| `verify-otp` | POST | Auth page — "Verify" | Verify OTP code, sign in user |
| `create-payment-intent` | POST | Checkout — payment step | Create Stripe PaymentIntent, return clientSecret |
| `stripe-webhook` | POST | Stripe Dashboard webhook | Handle payment events, update order status |
| `trigger-notification` | POST | All status changes | Route to SMS + email based on event type |
| `send-sms` | POST | trigger-notification | Send SMS via Twilio |
| `send-order-email` | POST | trigger-notification | Send email via SendGrid |
| `dispatch-delivery` | POST | Admin — assign delivery | Call DoorDash Drive / Uber Direct API |
| `process-refund` | POST | Order cancel | Stripe refund + wallet credit |
| `process-referral` | POST | Signup with `?ref=` | Credit referrer wallet |

### Edge Function File Structure

```
supabase/
└── functions/
    ├── send-otp/
    │   └── index.ts
    ├── verify-otp/
    │   └── index.ts
    ├── create-payment-intent/
    │   └── index.ts
    ├── stripe-webhook/
    │   └── index.ts
    ├── trigger-notification/
    │   └── index.ts
    ├── send-sms/
    │   └── index.ts
    ├── send-order-email/
    │   └── index.ts
    ├── dispatch-delivery/
    │   └── index.ts
    ├── process-refund/
    │   └── index.ts
    └── process-referral/
        └── index.ts
```

---

## 7. GitHub Copilot Prompts Reference

All prompts below can be used directly in GitHub Copilot Chat or Agent mode.

### Auth

```
Create a Supabase Edge Function in Deno/TypeScript (supabase/functions/send-otp/index.ts) 
that accepts POST { phone: string }, calls the Twilio Verify API to send an OTP, 
and returns { success: boolean }. Use environment variables TWILIO_ACCOUNT_SID, 
TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SID.
```

```
In src/pages/Auth.tsx, the handleSendOtp function currently creates a Supabase user 
with a fake email and hardcoded OTP "123456". Replace this to call the Supabase Edge 
Function at /functions/v1/send-otp with body { phone: loginPhone }. 
Use the existing useToast hook for success and error feedback. 
Also update handleVerifyOtp to call /functions/v1/verify-otp with { phone, code: otp }.
```

### Cart

```
Extend the CartProvider in src/contexts/CartContext.tsx to:
1. Write cart items to localStorage on every setItems call using key "shero_cart"
2. Read from localStorage on mount and restore cart state
3. When a user is logged in (check via useAuth), sync cart to Supabase cart_items table 
   using an upsert, debounced by 500ms. Handle JSON parse errors gracefully.
```

### Payment

```
Create a Supabase Edge Function at supabase/functions/create-payment-intent/index.ts 
in Deno/TypeScript that:
- Accepts POST body { amount: number, currency: string, orderId: string, customerId: string }
- Creates a Stripe PaymentIntent using STRIPE_SECRET_KEY from env
- Returns { clientSecret: string }
- Handles errors and returns appropriate HTTP status codes
```

```
Replace the PaymentSection component in src/components/PaymentSection.tsx with 
Stripe Elements. Use @stripe/react-stripe-js with the Elements provider and the 
PaymentElement component. Load the stripe instance using loadStripe with 
VITE_STRIPE_PUBLISHABLE_KEY. On confirmPayment success call onPaymentSuccess(). 
Keep the existing component props interface intact.
```

### Order Tracking

```
Update src/pages/OrderTracking.tsx to:
1. Read orderId from useSearchParams instead of using mockTrackedOrder
2. Fetch the order from Supabase instant_orders table using useQuery
3. Subscribe to real-time row changes using supabase.channel().on('postgres_changes') 
   for the specific orderId row
4. Map the order status to the progress bar step using a STATUS_STEPS constant
5. Unsubscribe in the useEffect cleanup function
Remove all imports and references to mockTrackedOrder.
```

### Wallet

```
Update WalletContext in src/contexts/WalletContext.tsx to:
1. Replace useState balance with a useQuery that fetches from Supabase 
   wallet_transactions table: SELECT SUM(amount) WHERE user_id = currentUser.id 
   AND (expires_at IS NULL OR expires_at > now())
2. Replace addCredit(amount, reason) to INSERT a positive row into wallet_transactions
3. Replace deductBalance(amount, reason, orderId) to INSERT a negative row
The context should still expose { balance, addCredit, deductBalance, isLoading }.
```

### Notifications

```
Create a Supabase Edge Function at supabase/functions/trigger-notification/index.ts that:
- Accepts POST { orderId: string, event: string }
- Fetches order details including customer_phone and partner_phone from Supabase
- Based on event, selects the appropriate SMS template from communications_templates table
- Calls the send-sms Edge Function to notify the customer
- For order_placed and order_accepted events, also notifies the partner
- Returns { success: boolean, notified: string[] }
```

### RLS

```
Write Supabase RLS policies for the instant_orders table that:
1. Allow customers to SELECT rows where customer_id = auth.uid()
2. Allow customers to INSERT rows where the new customer_id equals auth.uid()
3. Allow customers to UPDATE only the status column to 'cancelled' on their own orders 
   within 5 minutes of creation
4. Allow service role (admin / Edge Functions) full access
```

---

## 8. Timeline Summary

| Sub-Phase | Description | Days | Est. Hours | Priority |
|---|---|---|---|---|
| 1.1 | Auth — Real Phone OTP | 1–3 | 8 hrs | 🔴 Critical |
| 1.2 | Kitchen Discovery & Geo-filter | 3–5 | 6 hrs | 🔴 Critical |
| 1.3 | Cart Persistence | 5–6 | 3 hrs | 🟠 High |
| 1.4 | Checkout & Stripe Payment | 6–9 | 8 hrs | 🔴 Critical |
| 1.5 | Notifications (SMS + Email) | 9–10 | 4 hrs | 🟠 High |
| 1.6 | Real-time Order Tracking | 10–12 | 5 hrs | 🔴 Critical |
| 1.7 | Customer Dashboard | 12–14 | 5 hrs | 🟠 High |
| 1.8 | Admin Dashboard | 14–17 | 6 hrs | 🟠 High |
| 1.9 | Partner Portal | 17–18 | 4 hrs | 🟡 Medium |
| 1.10 | Finance, Compliance & QA | 18–20 | 4 hrs | 🟡 Medium |
| **Total** | | **20 days** | **53 hrs** | |

> **Minimum viable path (21 hrs):** Sub-phases 1.1 + 1.4 + 1.6 are the absolute core.
> Everything else enhances the experience but the app is usable without sub-phases 1.7–1.10.

---

## 9. Deployment Architecture

```
Customer Browser
       │ HTTPS
       ▼
  Nginx (VPS / Ubuntu 22.04)
       │
  ┌────┴─────────────────────────────────┐
  │  /dist (Vite static build)            │
  │  React SPA served by Nginx            │
  └───────────────┬──────────────────────┘
                  │ API calls (HTTPS)
                  ▼
         Supabase Cloud (hosted)
         ├── PostgreSQL + RLS
         ├── Supabase Auth
         ├── Supabase Realtime (WebSocket)
         ├── Supabase Storage
         └── Edge Functions (Deno runtime)
              ├── → Stripe API
              ├── → Twilio Verify (OTP)
              ├── → Twilio SMS (notifications)
              ├── → SendGrid (email)
              ├── → DoorDash Drive / Uber Direct
              └── → Google Maps Geocoding
```

### CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - name: Deploy to VPS
        run: rsync -avz --delete dist/ user@your-vps:/var/www/shero-us/
      - name: Push Supabase migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
      - name: Deploy Edge Functions
        run: supabase functions deploy
```

---

## 10. Required Credentials & Assets

> Collect all items below **before** starting implementation. Store them as GitHub repository secrets or Supabase Edge Function environment variables.

| Credential / Asset | Where to Get | Needed By Sub-Phase | Secret Name |
|---|---|---|---|
| Stripe Publishable Key | dashboard.stripe.com → API Keys | 1.4 | `VITE_STRIPE_PUBLISHABLE_KEY` |
| Stripe Secret Key | dashboard.stripe.com → API Keys | 1.4 | `STRIPE_SECRET_KEY` |
| Stripe Webhook Secret | dashboard.stripe.com → Webhooks | 1.4 | `STRIPE_WEBHOOK_SECRET` |
| Twilio Account SID | console.twilio.com | 1.1, 1.5 | `TWILIO_ACCOUNT_SID` |
| Twilio Auth Token | console.twilio.com | 1.1, 1.5 | `TWILIO_AUTH_TOKEN` |
| Twilio Verify Service SID | console.twilio.com → Verify | 1.1 | `TWILIO_VERIFY_SID` |
| Twilio From Phone Number | console.twilio.com → Phone Numbers | 1.5 | `TWILIO_FROM_NUMBER` |
| SendGrid API Key | app.sendgrid.com → API Keys | 1.5 | `SENDGRID_API_KEY` |
| SendGrid Verified Sender | app.sendgrid.com → Sender Auth | 1.5 | `SENDGRID_FROM_EMAIL` |
| Google Maps API Key | console.cloud.google.com | 1.4 | `VITE_GOOGLE_MAPS_API_KEY` |
| Google Places API enabled | console.cloud.google.com → APIs | 1.4 | — (enable in console) |
| DoorDash Drive API Key | developer.doordash.com | 1.8 | `DOORDASH_API_KEY` |
| DoorDash Developer ID | developer.doordash.com | 1.8 | `DOORDASH_DEVELOPER_ID` |
| Supabase Service Role Key | supabase.com → Project Settings | All Edge Functions | `SUPABASE_SERVICE_ROLE_KEY` |
| Supabase Project URL | supabase.com → Project Settings | All Edge Functions | `SUPABASE_URL` |
| VPS SSH private key | Your hosting provider | Deploy | `VPS_SSH_KEY` |
| Business email (orders@shero.us) | Your email provider | 1.5 | — |

---

## 11. Open Questions / Business Decisions Required

> These must be answered before or during the relevant sub-phase.

| # | Question | Needed By | Default Assumption |
|---|---|---|---|
| Q1 | What is the exact delivery radius for US launch? | 1.2 | 7 km (in app_config) |
| Q2 | Is the first-order wallet cap 50% or a different amount? | 1.4 | 50% |
| Q3 | Should cancelled orders within 5 min get a full refund or partial? | 1.6 | Full refund |
| Q4 | Which delivery API to use: DoorDash Drive or Uber Direct? | 1.8 | DoorDash Drive |
| Q5 | What is the partner commission rate (% of subtotal)? | 1.9 | Stored per partner in `kitchen_partners.commission_rate` |
| Q6 | Should wallet credits expire? If yes, after how many days? | 1.7 | 365 days for referral credits; spin credits no expiry |
| Q7 | Is phone-only signup acceptable or should email also be required? | 1.1 | Phone-only for customers, email for partners |
| Q8 | What US states will be supported at launch? Tax rates needed. | 1.10 | Texas + Florida at launch |
| Q9 | Should the modification window be 5 minutes or configurable from admin? | 1.6 | Configurable via app_config |
| Q10 | Will DoorDash Drive cover all serviceable zones or only some? | 1.8 | DoorDash Drive as primary; partner self-delivery as fallback |
