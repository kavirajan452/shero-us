

# Pre-Publish Walkthrough Findings

## Pages Checked
- **Home (/)** — Renders correctly. Hero, categories, FAQ, footer all display properly.
- **Footer** — All 6 legal links present and working (Privacy, Terms, Cookie, Accessibility, Allergen, Do Not Sell).
- **Privacy Policy (/privacy-policy)** — Renders correctly, references Shero USA INC and Maryland law.
- **Single Meal Order (/instant-delivery)** — Page loads but has issues (see below).
- **Checkout (/checkout)** — Empty cart state works. Shows USD, US flag.
- **Sweets & Snacks (/sweets-snacks)** — Shows 0 products (data issue). Indian product category names visible.

## Issues Found

### 1. "Instant Food Delivery" title on Single Meal Order page
**File:** `src/pages/InstantDelivery.tsx` (line 88)
The page heading still says **"Instant Food Delivery"** instead of **"Single Meal Order"**. The subtitle also says "Fresh homemade meals from kitchen partners near you" — should align with the new "Choose Menu & Time" description.

### 2. Indian payment methods in Partner Enrollment
**File:** `src/pages/PartnerEnrollment.tsx` (line 459)
Payment options still show **"UPI / Google Pay", "PhonePe", "Paytm", "Net Banking"** — these are India-only methods. Should be replaced with US methods (Credit/Debit Card, ACH, Zelle, Venmo).

### 3. Indian payment reference in Sweets & Snacks
**File:** `src/pages/SweetsSnacks.tsx` (line 361)
"Secure Pay" section says **"Debit, Credit & UPI"** — UPI should be removed for US.

### 4. ₹ (Rupee) symbols in wallet expiry edge function
**File:** `supabase/functions/process-wallet-expiry/index.ts` (lines 32-35, 85, 139)
Notification messages use **₹{amount}** and `en-IN` locale. Should use **${amount}** and `en-US`.

### 5. Indian snack mock data in Snacks Order Store
**File:** `src/data/snacksOrderStore.ts` (line 61)
Payment methods list includes **"UPI"** and **"Net Banking"**. Should be US methods.

### 6. Indian product categories on Sweets & Snacks page
The category chips show Indian-specific names (Kudumulu, Inippu, Kozhukattai). These come from the snacks data files and should either be updated or the page should show US-appropriate product categories.

### 7. "Instant Delivery" text in AdminSidebar comment
**File:** `src/components/AdminSidebar.tsx` (line 49) — minor comment reference.

## Recommended Fix Plan

1. **Update InstantDelivery.tsx** — Change title to "Single Meal Order" and subtitle to "Choose Menu & Time"
2. **Update PartnerEnrollment.tsx** — Replace Indian payment methods with US ones (Card, ACH, Zelle, Venmo)
3. **Update SweetsSnacks.tsx** — Remove "UPI" from Secure Pay description
4. **Update wallet expiry edge function** — Replace ₹ with $, change locale to en-US
5. **Update snacksOrderStore.ts** — Replace UPI/Net Banking with Card/ACH
6. **Update AdminSidebar comment** — Minor cleanup

### Not blocking publish but worth noting:
- Sweets & Snacks shows 0 products — this is a data/catalog issue, not a bug
- Many internal admin/finance data files still reference INR amounts — these are mock data and don't affect the customer-facing experience

