

## Wallet Credit Expiry System — 90-Day Validity + Notifications + Admin Dashboard

### What This Adds

Every wallet credit (referral, spin, PPP bonus) will expire 90 days after creation if unused. Users get notified before expiry, and admins can track/manage all expirations from a dedicated dashboard.

---

### Step 1 — Database: `wallet_transactions` Table

Create a new dedicated `wallet_transactions` table (replacing the current JSONB `transactions` column in `user_wallets`):

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Owner |
| `type` | text | referral_credit, spin_reward, purchase_debit, etc. |
| `amount` | numeric | Credit (+) or debit (-) |
| `description` | text | Human-readable label |
| `expires_at` | timestamptz | `created_at + 90 days` (null for debits) |
| `expired` | boolean | Default false, set true when expired |
| `remaining_amount` | numeric | Tracks partial usage (starts = amount) |
| `created_at` | timestamptz | When credit was earned |

RLS: Users read/insert own rows. Admins read all.

### Step 2 — Database: `wallet_expiry_notifications` Table

Track all expiry-related notifications sent to users:

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Recipient |
| `transaction_id` | uuid | FK to wallet_transactions |
| `notification_type` | text | `7_day_warning`, `3_day_warning`, `1_day_warning`, `expired` |
| `message` | text | Notification text |
| `sent_at` | timestamptz | When sent |
| `read_at` | timestamptz | When user read it (nullable) |

### Step 3 — `app_config` Entry for Expiry Settings

Insert a new `app_config` row with key `wallet_expiry_settings`:
```json
{
  "validity_days": 90,
  "warning_days": [7, 3, 1],
  "auto_expire_enabled": true,
  "notification_messages": {
    "7_day_warning": "₹{amount} in your wallet expires in 7 days! Use it before {date}.",
    "3_day_warning": "₹{amount} expiring in 3 days — order now!",
    "1_day_warning": "Last day! ₹{amount} expires tomorrow.",
    "expired": "₹{amount} has expired from your wallet."
  }
}
```

### Step 4 — Alter `user_wallets` Table

Add column `total_referral_earnings` (numeric, default 0) for the ₹2,500 cap. Add `referral_code` (text, unique). Add `order_count` (integer, default 0).

### Step 5 — Edge Function: `process-wallet-expiry`

A scheduled or on-demand edge function that:
1. Queries `wallet_transactions` where `expires_at` is approaching (within warning days) and no notification sent yet → inserts into `wallet_expiry_notifications`
2. Queries `wallet_transactions` where `expires_at < now()` and `expired = false` → marks `expired = true`, deducts `remaining_amount` from `user_wallets.balance`, inserts `expired` notification

### Step 6 — Refactor WalletContext

- Fetch from `wallet_transactions` table instead of JSONB column
- `getUsableAmount`: only sum `remaining_amount` from non-expired credits; cap at 50% of order value; require `order_count >= 2`
- `spendOnPurchase`: debit from oldest-first (FIFO) non-expired credits by updating `remaining_amount`
- Credits: set `expires_at = now() + interval '90 days'`
- Show expiry info per transaction in wallet UI

### Step 7 — WalletSection UI Updates

- Show "Expires on {date}" next to each credit transaction
- Show expiring-soon warning banner: "₹X expiring in Y days — use it now!"
- Color-code: green (>7 days), yellow (3-7 days), red (<3 days)

### Step 8 — User Notifications

- Add a notifications bell/panel (or integrate with existing notification system)
- Show wallet expiry warnings from `wallet_expiry_notifications` table
- Mark as read on view

### Step 9 — Admin Dashboard: Wallet Expiry Management

New page: `/admin/wallet-expiry` with:

1. **Expiry Settings Panel** — edit validity days, warning intervals, notification message templates (reads/writes `app_config`)
2. **Expiring Credits Overview** — table showing credits expiring in next 7/30 days with user name, amount, expiry date
3. **Expired Credits Log** — historical log of all expired credits with totals
4. **Notification Log** — all sent notifications with delivery status, read status
5. **Summary Cards** — total active credits, total expiring this week, total expired this month, total notifications sent

Add sidebar entry under a "Wallet & Referrals" group in AdminSidebar.

### Step 10 — Route Wiring

- Add `/admin/wallet-expiry` route in `App.tsx`
- Add sidebar link in `AdminSidebar.tsx`

---

### Files to Create/Modify

| File | Action |
|---|---|
| Migration SQL | Create `wallet_transactions`, `wallet_expiry_notifications` tables; alter `user_wallets` |
| `app_config` insert | Wallet expiry settings |
| `supabase/functions/process-wallet-expiry/index.ts` | New edge function |
| `src/contexts/WalletContext.tsx` | Full refactor — backend + FIFO expiry logic |
| `src/components/WalletSection.tsx` | Expiry dates, warning banners |
| `src/pages/CustomerReferrals.tsx` | Earning cap UI, expiry info |
| `src/pages/admin/AdminWalletExpiry.tsx` | New admin page |
| `src/components/AdminSidebar.tsx` | Add wallet expiry link |
| `src/App.tsx` | Add route |

