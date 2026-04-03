// ═══════════════════════════════════════════════════════════════════════
// SHERO Finance Engine — US GAAP-Standard Double-Entry Bookkeeping
// Covers: Subscriptions, Party Orders, Instant Delivery, Services
// Books: Day Book, Cash Book, Bank Book, Sales Register, Purchase Register,
//        Journal Register, Trial Balance, P&L Statement, Ledger
// ═══════════════════════════════════════════════════════════════════════

// ── Sub-Verticals ──
export type SubVertical = "subscription" | "party" | "instant" | "services" | "snacks" | "cookery" | "shero_classes";

export const subVerticalLabels: Record<SubVertical, string> = {
  subscription: "Subscriptions",
  party: "Party Orders (SAP/SPO)",
  instant: "Instant Delivery",
  services: "Home Services",
  snacks: "Sweets & Snacks",
  cookery: "Cookery Classes",
  shero_classes: "Shero Classes",
};

// ── Voucher Types (Tally Standard) ──
export type VoucherType =
  | "sales"            // Sales Voucher (Tax Invoice)
  | "credit_note"      // Credit Note (Returns / Refunds)
  | "debit_note"       // Debit Note (Partner penalty, shortage)
  | "receipt"          // Receipt Voucher (Money In)
  | "payment"          // Payment Voucher (Money Out)
  | "journal"          // Journal Voucher (Adjustments)
  | "contra"           // Contra Voucher (Cash ↔ Bank)
  | "purchase";        // Purchase Voucher (Procurement)

export const voucherTypeLabels: Record<VoucherType, { label: string; shortCode: string; color: string; description: string }> = {
  sales:       { label: "Sales",        shortCode: "SLS", color: "bg-action-done/15 text-action-done",         description: "Tax Invoice — Revenue recognition on delivery" },
  credit_note: { label: "Credit Note",  shortCode: "CN",  color: "bg-destructive/10 text-destructive",         description: "Refund, cancellation credit, adjustment to customer" },
  debit_note:  { label: "Debit Note",   shortCode: "DN",  color: "bg-action-cook/15 text-action-cook",         description: "Partner penalty, shortage deduction, recovery" },
  receipt:     { label: "Receipt",       shortCode: "RCT", color: "bg-action-pack/15 text-action-pack",         description: "Cash/Bank receipt from customer or advance" },
  payment:     { label: "Payment",       shortCode: "PMT", color: "bg-action-dispatch/15 text-action-dispatch", description: "Payout to partner, vendor, or refund disbursement" },
  journal:     { label: "Journal",       shortCode: "JRN", color: "bg-muted text-muted-foreground",             description: "Internal adjustment — deferral, accrual, reclassification" },
  contra:      { label: "Contra",        shortCode: "CTR", color: "bg-accent text-accent-foreground",           description: "Cash ↔ Bank transfer, inter-account movement" },
  purchase:    { label: "Purchase",      shortCode: "PUR", color: "bg-teal/15 text-teal",                       description: "Procurement of packing, raw materials, supplies" },
};

// ── Ledger Groups (US GAAP Standard) ──
export type LedgerGroup =
  | "income_direct"
  | "income_indirect"
  | "expense_direct"
  | "expense_indirect"
  | "current_asset"
  | "current_liability"
  | "fixed_asset"
  | "capital";

export const ledgerGroupLabels: Record<LedgerGroup, string> = {
  income_direct: "Direct Income",
  income_indirect: "Indirect Income",
  expense_direct: "Direct Expenses",
  expense_indirect: "Indirect Expenses",
  current_asset: "Current Assets",
  current_liability: "Current Liabilities",
  fixed_asset: "Fixed Assets",
  capital: "Capital Account",
};

// ── Ledger Accounts (Chart of Accounts) ──
export type LedgerAccount =
  // INCOME — Direct
  | "sales_meal_subscription"
  | "sales_meal_instant"
  | "sales_meal_party"
  | "sales_service_booking"
  | "sales_delivery_fee"
  | "sales_packaging_charge"
  | "sales_transport_charge"
  | "sales_cancellation_charge"
  | "sales_surge_charge"
  | "sales_convenience_fee"
  // INCOME — Indirect
  | "income_wallet_forfeiture"
  | "income_referral_commission"
  | "income_late_fee"
  // EXPENSE — Direct (COGS)
  | "purchase_ppp_payout"
  | "purchase_packing_material"
  | "purchase_raw_ingredients"
  | "expense_delivery_logistics"
  | "expense_payment_gateway"
  | "expense_service_provider_payout"
  // EXPENSE — Indirect (Overheads)
  | "expense_ops_overhead"
  | "expense_marketing_leadgen"
  | "expense_marketing_social"
  | "expense_marketing_referral"
  | "expense_customer_support"
  | "expense_training"
  | "expense_technology"
  | "expense_insurance"
  | "expense_delivery_return"
  // CURRENT ASSETS
  | "cash_in_hand"
  | "bank_account_primary"
  | "bank_account_settlement"
  | "accounts_receivable"
  | "tds_receivable"
  | "advance_to_partner"
  | "prepaid_expense"
  // CURRENT LIABILITIES
  | "accounts_payable_partner"
  | "accounts_payable_vendor"
  | "sales_tax_food"
  | "sales_tax_services"
  | "tax_input_credit"
  | "tds_payable"
  | "revenue_deferred"
  | "advance_from_customer"
  | "skip_credit_liability"
  | "wallet_liability"
  | "security_deposit"
  | "refund_payable"
  | "discount_contra";

export const accountMeta: Record<LedgerAccount, { label: string; group: LedgerGroup; nature: "Dr" | "Cr" }> = {
  // INCOME — Direct
  sales_meal_subscription:    { label: "Sales A/c — Meal Subscriptions",    group: "income_direct", nature: "Cr" },
  sales_meal_instant:         { label: "Sales A/c — Instant Delivery",      group: "income_direct", nature: "Cr" },
  sales_meal_party:           { label: "Sales A/c — Party Orders",          group: "income_direct", nature: "Cr" },
  sales_service_booking:      { label: "Sales A/c — Service Bookings",      group: "income_direct", nature: "Cr" },
  sales_delivery_fee:         { label: "Sales A/c — Delivery Fees",         group: "income_direct", nature: "Cr" },
  sales_packaging_charge:     { label: "Sales A/c — Packaging Charges",     group: "income_direct", nature: "Cr" },
  sales_transport_charge:     { label: "Sales A/c — Transport Charges",     group: "income_direct", nature: "Cr" },
  sales_cancellation_charge:  { label: "Sales A/c — Cancellation Charges",  group: "income_direct", nature: "Cr" },
  sales_surge_charge:         { label: "Sales A/c — Surge Pricing",         group: "income_direct", nature: "Cr" },
  sales_convenience_fee:      { label: "Sales A/c — Convenience Fee",       group: "income_direct", nature: "Cr" },
  // INCOME — Indirect
  income_wallet_forfeiture:   { label: "Wallet Forfeiture Income",          group: "income_indirect", nature: "Cr" },
  income_referral_commission: { label: "Referral Commission Income",        group: "income_indirect", nature: "Cr" },
  income_late_fee:            { label: "Late Payment Fee Income",           group: "income_indirect", nature: "Cr" },
  // EXPENSE — Direct
  purchase_ppp_payout:        { label: "Purchase A/c — PPP Partner Payout", group: "expense_direct", nature: "Dr" },
  purchase_packing_material:  { label: "Purchase A/c — Packing Materials",  group: "expense_direct", nature: "Dr" },
  purchase_raw_ingredients:   { label: "Purchase A/c — Raw Ingredients",    group: "expense_direct", nature: "Dr" },
  expense_delivery_logistics: { label: "Delivery & Logistics Expense",      group: "expense_direct", nature: "Dr" },
  expense_payment_gateway:    { label: "Payment Gateway Charges",           group: "expense_direct", nature: "Dr" },
  expense_service_provider_payout: { label: "Service Provider Payout",      group: "expense_direct", nature: "Dr" },
  // EXPENSE — Indirect
  expense_ops_overhead:       { label: "Operations Overhead",               group: "expense_indirect", nature: "Dr" },
  expense_marketing_leadgen:  { label: "Marketing — Lead Generation",       group: "expense_indirect", nature: "Dr" },
  expense_marketing_social:   { label: "Marketing — Social Media",          group: "expense_indirect", nature: "Dr" },
  expense_marketing_referral: { label: "Marketing — Referral Rewards",      group: "expense_indirect", nature: "Dr" },
  expense_customer_support:   { label: "Customer Support Expense",          group: "expense_indirect", nature: "Dr" },
  expense_training:           { label: "Partner Training Expense",          group: "expense_indirect", nature: "Dr" },
  expense_technology:         { label: "Technology & Platform Expense",      group: "expense_indirect", nature: "Dr" },
  expense_insurance:          { label: "Insurance Expense",                 group: "expense_indirect", nature: "Dr" },
  expense_delivery_return:    { label: "Delivery Return / Failed Delivery", group: "expense_indirect", nature: "Dr" },
  // CURRENT ASSETS
  cash_in_hand:               { label: "Cash-in-Hand",                      group: "current_asset", nature: "Dr" },
  bank_account_primary:       { label: "Bank A/c — Primary (Chase)",        group: "current_asset", nature: "Dr" },
  bank_account_settlement:    { label: "Bank A/c — Settlement (BofA)",      group: "current_asset", nature: "Dr" },
  accounts_receivable:        { label: "Accounts Receivable",               group: "current_asset", nature: "Dr" },
  tds_receivable:             { label: "Withholding Tax Receivable",        group: "current_asset", nature: "Dr" },
  advance_to_partner:         { label: "Advance to Partner",                group: "current_asset", nature: "Dr" },
  prepaid_expense:            { label: "Prepaid Expenses",                  group: "current_asset", nature: "Dr" },
  // CURRENT LIABILITIES
  accounts_payable_partner:   { label: "Accounts Payable — Partners",       group: "current_liability", nature: "Cr" },
  accounts_payable_vendor:    { label: "Accounts Payable — Vendors",        group: "current_liability", nature: "Cr" },
  sales_tax_food:             { label: "Sales Tax — Food (8.25%)",          group: "current_liability", nature: "Cr" },
  sales_tax_services:         { label: "Sales Tax — Services (8.25%)",     group: "current_liability", nature: "Cr" },
  tax_input_credit:           { label: "Tax Input Credit",                  group: "current_asset", nature: "Dr" },
  tds_payable:                { label: "Withholding Tax Payable",           group: "current_liability", nature: "Cr" },
  revenue_deferred:           { label: "Deferred Revenue",                  group: "current_liability", nature: "Cr" },
  advance_from_customer:      { label: "Advance from Customer",             group: "current_liability", nature: "Cr" },
  skip_credit_liability:      { label: "Skip Credit Liability",             group: "current_liability", nature: "Cr" },
  wallet_liability:           { label: "Customer Wallet Liability",         group: "current_liability", nature: "Cr" },
  security_deposit:           { label: "Security Deposit (Partner)",        group: "current_liability", nature: "Cr" },
  refund_payable:             { label: "Refund Payable",                    group: "current_liability", nature: "Cr" },
  discount_contra:            { label: "Discount (Contra Revenue)",         group: "income_direct", nature: "Dr" },
};

// ── Legacy compat ──
export const accountLabels: Record<string, string> = Object.fromEntries(
  Object.entries(accountMeta).map(([k, v]) => [k, v.label])
);

// ── Transaction Triggers ──
export type TransactionTrigger =
  // Subscription
  | "new_subscription" | "meal_delivered" | "session_skipped" | "subscription_paused"
  | "subscription_resumed" | "subscription_cancelled" | "subscription_renewed"
  | "skip_credit_redeemed"
  // Party
  | "party_order_placed" | "party_advance_received" | "party_final_payment"
  | "party_order_cancelled" | "party_order_delivered"
  // Instant
  | "instant_order_placed" | "instant_order_delivered" | "instant_order_cancelled"
  | "instant_surge_applied"
  // Services
  | "service_booked" | "service_completed" | "service_cancelled"
  // Snacks
  | "snack_order_placed" | "snack_order_delivered" | "snack_order_cancelled"
  // Cookery Classes
  | "cookery_class_booked" | "cookery_class_completed" | "cookery_class_cancelled"
  // Shero Classes
  | "shero_class_booked" | "shero_class_completed" | "shero_class_cancelled"
  // Common
  | "partner_payout" | "partner_penalty" | "discount_applied" | "marketing_spend"
  | "refund_issued" | "wallet_topup" | "wallet_used" | "tax_payment"
  | "tds_deducted" | "cash_to_bank" | "packing_purchased"
  | "instructor_payout";

// ── Core Interfaces ──
export interface LedgerEntry {
  id: string;
  date: string;
  voucherType: VoucherType;
  voucherId: string;
  trigger: TransactionTrigger;
  account: LedgerAccount;
  debit: number;
  credit: number;
  description: string;
  referenceId: string;
  subVertical: SubVertical;
  narration?: string;
}

export interface Voucher {
  id: string;
  type: VoucherType;
  date: string;
  trigger: TransactionTrigger;
  referenceId: string;
  partyName: string;       // Tally: "Party" = customer or vendor
  partnerName?: string;
  amount: number;
  status: "posted" | "pending" | "reversed" | "cancelled";
  entries: LedgerEntry[];
  subVertical: SubVertical;
  narration: string;
}

export interface PLLineItem {
  label: string;
  amount: number;
  type: "revenue" | "expense" | "subtotal" | "header";
  indent?: number;
  bold?: boolean;
}

export interface ReceivablePayable {
  id: string;
  type: "receivable" | "payable";
  entity: string;
  referenceId: string;
  amount: number;
  dueDate: string;
  status: "outstanding" | "overdue" | "settled" | "partial";
  agingDays: number;
  subVertical: SubVertical;
}

export interface FinancialGap {
  id: string;
  category: "revenue_leakage" | "expense_untracked" | "liability_missing" | "reconciliation" | "compliance" | "tax_gap";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  suggestion: string;
  subVertical: SubVertical | "all";
}

export interface TrialBalanceRow {
  account: LedgerAccount;
  label: string;
  group: LedgerGroup;
  debit: number;
  credit: number;
}

export interface DayBookEntry {
  date: string;
  voucherId: string;
  voucherType: VoucherType;
  partyName: string;
  narration: string;
  debit: number;
  credit: number;
  subVertical: SubVertical;
}

// ── Helpers ──
let vSeq = 1000;
let eSeq = 5000;
const vid = (prefix: string) => `${prefix}-${++vSeq}`;
const eid = () => `LE-${++eSeq}`;
const today = new Date().toISOString().split("T")[0];

function entry(
  voucherId: string, vType: VoucherType, trigger: TransactionTrigger,
  account: LedgerAccount, dr: number, cr: number,
  desc: string, ref: string, sv: SubVertical, date = today
): LedgerEntry {
  return { id: eid(), date, voucherType: vType, voucherId, trigger, account, debit: dr, credit: cr, description: desc, referenceId: ref, subVertical: sv };
}

// ═══════════════════════════════════════════
// SUBSCRIPTION VOUCHERS
// ═══════════════════════════════════════════
export function generateSubscriptionVouchers(): Voucher[] {
  const v: Voucher[] = [];

  // 1. New Subscription — Sales Invoice
  const s1 = vid("SLS");
  v.push({ id: s1, type: "sales", date: "2026-03-01", trigger: "new_subscription", referenceId: "SUB-1001", partyName: "Priya Reddy", amount: 4500, status: "posted", subVertical: "subscription",
    narration: "Chettinad Veg Thali — 30 days × $150/day",
    entries: [
      entry(s1, "sales", "new_subscription", "accounts_receivable", 4500, 0, "Subscription receivable", "SUB-1001", "subscription", "2026-03-01"),
      entry(s1, "sales", "new_subscription", "sales_meal_subscription", 0, 4286, "Meal revenue (excl GST 5%)", "SUB-1001", "subscription", "2026-03-01"),
      entry(s1, "sales", "new_subscription", "gst_output_5", 0, 214, "GST 5% on food", "SUB-1001", "subscription", "2026-03-01"),
    ],
  });

  // 2. Receipt — Payment via Razorpay
  const s2 = vid("RCT");
  v.push({ id: s2, type: "receipt", date: "2026-03-01", trigger: "new_subscription", referenceId: "SUB-1001", partyName: "Priya Reddy", amount: 4500, status: "posted", subVertical: "subscription",
    narration: "Online payment received via Razorpay",
    entries: [
      entry(s2, "receipt", "new_subscription", "bank_account_primary", 4500, 0, "Payment received — Razorpay", "SUB-1001", "subscription", "2026-03-01"),
      entry(s2, "receipt", "new_subscription", "accounts_receivable", 0, 4500, "Receivable cleared", "SUB-1001", "subscription", "2026-03-01"),
    ],
  });

  // 3. Journal — Meal Delivered (revenue recognition + PPP accrual)
  const s3 = vid("JRN");
  v.push({ id: s3, type: "journal", date: "2026-03-05", trigger: "meal_delivered", referenceId: "SUB-1001", partyName: "Priya Reddy", partnerName: "Chef Lakshmi", amount: 150, status: "posted", subVertical: "subscription",
    narration: "Lunch delivered — Day 5, Chettinad Veg Thali",
    entries: [
      entry(s3, "journal", "meal_delivered", "purchase_ppp_payout", 82.50, 0, "PPP 55% of $150", "SUB-1001", "subscription", "2026-03-05"),
      entry(s3, "journal", "meal_delivered", "accounts_payable_partner", 0, 82.50, "Payable to Chef Lakshmi", "SUB-1001", "subscription", "2026-03-05"),
      entry(s3, "journal", "meal_delivered", "purchase_packing_material", 20, 0, "Packing cost per meal", "SUB-1001", "subscription", "2026-03-05"),
      entry(s3, "journal", "meal_delivered", "expense_delivery_logistics", 25, 0, "Delivery cost per meal", "SUB-1001", "subscription", "2026-03-05"),
      entry(s3, "journal", "meal_delivered", "accounts_payable_vendor", 0, 45, "Packing + delivery vendor payable", "SUB-1001", "subscription", "2026-03-05"),
    ],
  });

  // 4. Journal — Session Skipped (defer revenue + skip credit)
  const s4 = vid("JRN");
  v.push({ id: s4, type: "journal", date: "2026-03-07", trigger: "session_skipped", referenceId: "SUB-1001", partyName: "Priya Reddy", amount: 150, status: "posted", subVertical: "subscription",
    narration: "Lunch session skipped — Day 7 (within 3/week limit)",
    entries: [
      entry(s4, "journal", "session_skipped", "sales_meal_subscription", 143, 0, "Reverse recognized revenue for skipped session", "SUB-1001", "subscription", "2026-03-07"),
      entry(s4, "journal", "session_skipped", "revenue_deferred", 0, 143, "Park as deferred revenue", "SUB-1001", "subscription", "2026-03-07"),
      entry(s4, "journal", "session_skipped", "skip_credit_liability", 0, 143, "Skip credit liability — 1 meal owed", "SUB-1001", "subscription", "2026-03-07"),
      entry(s4, "journal", "session_skipped", "sales_meal_subscription", 143, 0, "Balance contra for liability", "SUB-1001", "subscription", "2026-03-07"),
    ],
  });

  // 5. Journal — Subscription Paused
  const s5 = vid("JRN");
  v.push({ id: s5, type: "journal", date: "2026-03-10", trigger: "subscription_paused", referenceId: "SUB-1003", partyName: "Sneha Pillai", amount: 2700, status: "posted", subVertical: "subscription",
    narration: "Subscription paused — 18 remaining meals frozen as deferred revenue",
    entries: [
      entry(s5, "journal", "subscription_paused", "sales_meal_subscription", 2571, 0, "Reverse undelivered revenue (18 × $143)", "SUB-1003", "subscription", "2026-03-10"),
      entry(s5, "journal", "subscription_paused", "gst_output_5", 129, 0, "Reverse GST on undelivered", "SUB-1003", "subscription", "2026-03-10"),
      entry(s5, "journal", "subscription_paused", "revenue_deferred", 0, 2700, "Park as deferred revenue", "SUB-1003", "subscription", "2026-03-10"),
    ],
  });

  // 6. Credit Note — Subscription Cancelled with Refund
  const s6 = vid("CN");
  v.push({ id: s6, type: "credit_note", date: "2026-03-12", trigger: "subscription_cancelled", referenceId: "SUB-1005", partyName: "Meera Joshi", amount: 1800, status: "posted", subVertical: "subscription",
    narration: "Cancellation — prorated refund for 12 undelivered meals",
    entries: [
      entry(s6, "credit_note", "subscription_cancelled", "revenue_deferred", 1800, 0, "Release deferred revenue", "SUB-1005", "subscription", "2026-03-12"),
      entry(s6, "credit_note", "subscription_cancelled", "refund_payable", 0, 1800, "Refund payable to customer", "SUB-1005", "subscription", "2026-03-12"),
    ],
  });

  // 7. Payment — Refund Disbursed
  const s7 = vid("PMT");
  v.push({ id: s7, type: "payment", date: "2026-03-12", trigger: "refund_issued", referenceId: "SUB-1005", partyName: "Meera Joshi", amount: 1800, status: "posted", subVertical: "subscription",
    narration: "Refund disbursed via NEFT",
    entries: [
      entry(s7, "payment", "refund_issued", "refund_payable", 1800, 0, "Settle refund liability", "SUB-1005", "subscription", "2026-03-12"),
      entry(s7, "payment", "refund_issued", "bank_account_primary", 0, 1800, "Bank transfer — refund", "SUB-1005", "subscription", "2026-03-12"),
    ],
  });

  // 8. Payment — Weekly Partner Payout
  const s8 = vid("PMT");
  v.push({ id: s8, type: "payment", date: "2026-03-08", trigger: "partner_payout", referenceId: "PTNR-001", partyName: "Chef Lakshmi Kitchen", amount: 12375, status: "posted", subVertical: "subscription",
    narration: "Weekly PPP settlement — 150 meals × $82.50",
    entries: [
      entry(s8, "payment", "partner_payout", "accounts_payable_partner", 12375, 0, "Settlement — Chef Lakshmi", "PTNR-001", "subscription", "2026-03-08"),
      entry(s8, "payment", "partner_payout", "bank_account_settlement", 0, 12375, "NEFT transfer", "PTNR-001", "subscription", "2026-03-08"),
    ],
  });

  // 9. Debit Note — Partner Penalty
  const s9 = vid("DN");
  v.push({ id: s9, type: "debit_note", date: "2026-03-09", trigger: "partner_penalty", referenceId: "PTNR-002", partyName: "Chef Fathima Kitchen", amount: 500, status: "posted", subVertical: "subscription",
    narration: "Late delivery penalty — 3 orders late by >15 min",
    entries: [
      entry(s9, "debit_note", "partner_penalty", "accounts_payable_partner", 500, 0, "Deduct from partner payable", "PTNR-002", "subscription", "2026-03-09"),
      entry(s9, "debit_note", "partner_penalty", "income_late_fee", 0, 500, "Penalty income", "PTNR-002", "subscription", "2026-03-09"),
    ],
  });

  // 10. Journal — Discount Applied
  const s10 = vid("JRN");
  v.push({ id: s10, type: "journal", date: "2026-03-01", trigger: "discount_applied", referenceId: "SUB-1001", partyName: "Priya Reddy", amount: 675, status: "posted", subVertical: "subscription",
    narration: "15% monthly plan discount applied",
    entries: [
      entry(s10, "journal", "discount_applied", "discount_contra", 675, 0, "Discount contra-revenue", "SUB-1001", "subscription", "2026-03-01"),
      entry(s10, "journal", "discount_applied", "accounts_receivable", 0, 675, "Reduce receivable by discount", "SUB-1001", "subscription", "2026-03-01"),
    ],
  });

  // 11. Journal — Skip Credit Redeemed
  const s11 = vid("JRN");
  v.push({ id: s11, type: "journal", date: "2026-03-15", trigger: "skip_credit_redeemed", referenceId: "SUB-1001", partyName: "Priya Reddy", partnerName: "Chef Lakshmi", amount: 150, status: "posted", subVertical: "subscription",
    narration: "Extended meal delivered — skip credit redeemed",
    entries: [
      entry(s11, "journal", "skip_credit_redeemed", "skip_credit_liability", 143, 0, "Redeem skip credit", "SUB-1001", "subscription", "2026-03-15"),
      entry(s11, "journal", "skip_credit_redeemed", "revenue_deferred", 143, 0, "Release deferred revenue", "SUB-1001", "subscription", "2026-03-15"),
      entry(s11, "journal", "skip_credit_redeemed", "sales_meal_subscription", 0, 143, "Revenue recognized", "SUB-1001", "subscription", "2026-03-15"),
      entry(s11, "journal", "skip_credit_redeemed", "purchase_ppp_payout", 82.50, 0, "PPP for redeemed meal", "SUB-1001", "subscription", "2026-03-15"),
      entry(s11, "journal", "skip_credit_redeemed", "accounts_payable_partner", 0, 82.50, "Payable to Chef Lakshmi", "SUB-1001", "subscription", "2026-03-15"),
      entry(s11, "journal", "skip_credit_redeemed", "skip_credit_liability", 0, 143, "Close liability contra", "SUB-1001", "subscription", "2026-03-15"),
    ],
  });

  // 12. Purchase — Packing Materials Procured
  const s12 = vid("PUR");
  v.push({ id: s12, type: "purchase", date: "2026-03-03", trigger: "packing_purchased", referenceId: "PO-PACK-001", partyName: "GreenPack Supplies", amount: 15000, status: "posted", subVertical: "subscription",
    narration: "Monthly packing material — eco-friendly containers",
    entries: [
      entry(s12, "purchase", "packing_purchased", "purchase_packing_material", 12712, 0, "Packing material (excl GST)", "PO-PACK-001", "subscription", "2026-03-03"),
      entry(s12, "purchase", "packing_purchased", "gst_input_credit", 2288, 0, "GST 18% input credit", "PO-PACK-001", "subscription", "2026-03-03"),
      entry(s12, "purchase", "packing_purchased", "accounts_payable_vendor", 0, 15000, "Vendor payable", "PO-PACK-001", "subscription", "2026-03-03"),
    ],
  });

  // 13. Contra — Cash Deposit to Bank
  const s13 = vid("CTR");
  v.push({ id: s13, type: "contra", date: "2026-03-04", trigger: "cash_to_bank", referenceId: "CTR-001", partyName: "—", amount: 5000, status: "posted", subVertical: "subscription",
    narration: "Cash on delivery deposited to bank",
    entries: [
      entry(s13, "contra", "cash_to_bank", "bank_account_primary", 5000, 0, "Cash deposited", "CTR-001", "subscription", "2026-03-04"),
      entry(s13, "contra", "cash_to_bank", "cash_in_hand", 0, 5000, "Cash transferred to bank", "CTR-001", "subscription", "2026-03-04"),
    ],
  });

  // 14. Journal — Payment Gateway Fee
  const s14 = vid("JRN");
  v.push({ id: s14, type: "journal", date: "2026-03-08", trigger: "marketing_spend", referenceId: "GW-MAR", partyName: "Razorpay", amount: 3200, status: "posted", subVertical: "subscription",
    narration: "Monthly gateway processing fee — 2% of collections",
    entries: [
      entry(s14, "journal", "marketing_spend", "expense_payment_gateway", 3200, 0, "Gateway fee 2%", "GW-MAR", "subscription", "2026-03-08"),
      entry(s14, "journal", "marketing_spend", "bank_account_primary", 0, 3200, "Auto-deducted from bank", "GW-MAR", "subscription", "2026-03-08"),
    ],
  });

  // 15. Journal — TDS Deducted on Partner Payout
  const s15 = vid("JRN");
  v.push({ id: s15, type: "journal", date: "2026-03-08", trigger: "tds_deducted", referenceId: "TDS-001", partyName: "Chef Lakshmi Kitchen", amount: 124, status: "posted", subVertical: "subscription",
    narration: "TDS 1% deducted on PPP payout",
    entries: [
      entry(s15, "journal", "tds_deducted", "accounts_payable_partner", 124, 0, "TDS deduction from payout", "TDS-001", "subscription", "2026-03-08"),
      entry(s15, "journal", "tds_deducted", "tds_payable", 0, 124, "TDS liability — to be deposited with Govt", "TDS-001", "subscription", "2026-03-08"),
    ],
  });

  return v;
}

// ═══════════════════════════════════════════
// PARTY ORDER VOUCHERS
// ═══════════════════════════════════════════
export function generatePartyVouchers(): Voucher[] {
  const v: Voucher[] = [];

  const p1 = vid("SLS");
  v.push({ id: p1, type: "sales", date: "2026-03-08", trigger: "party_order_placed", referenceId: "PO-3421", partyName: "Ramesh K.", amount: 42500, status: "posted", subVertical: "party",
    narration: "Wedding reception — 50 guests, Chettinad cuisine",
    entries: [
      entry(p1, "sales", "party_order_placed", "accounts_receivable", 42500, 0, "Party order receivable", "PO-3421", "party", "2026-03-08"),
      entry(p1, "sales", "party_order_placed", "sales_meal_party", 0, 38636, "MRP revenue (excl GST 5% + ancillary)", "PO-3421", "party", "2026-03-08"),
      entry(p1, "sales", "party_order_placed", "gst_output_5", 0, 2024, "GST 5% on food", "PO-3421", "party", "2026-03-08"),
      entry(p1, "sales", "party_order_placed", "sales_packaging_charge", 0, 850, "Packaging charge", "PO-3421", "party", "2026-03-08"),
      entry(p1, "sales", "party_order_placed", "sales_transport_charge", 0, 500, "Transport charge", "PO-3421", "party", "2026-03-08"),
      entry(p1, "sales", "party_order_placed", "discount_contra", 490, 0, "Early bird discount", "PO-3421", "party", "2026-03-08"),
    ],
  });

  const p2 = vid("RCT");
  v.push({ id: p2, type: "receipt", date: "2026-03-08", trigger: "party_advance_received", referenceId: "PO-3421", partyName: "Ramesh K.", amount: 21250, status: "posted", subVertical: "party",
    narration: "50% advance received for wedding order",
    entries: [
      entry(p2, "receipt", "party_advance_received", "bank_account_primary", 21250, 0, "Advance received", "PO-3421", "party", "2026-03-08"),
      entry(p2, "receipt", "party_advance_received", "advance_from_customer", 0, 21250, "Advance liability — delivery pending", "PO-3421", "party", "2026-03-08"),
    ],
  });

  const p2b = vid("JRN");
  v.push({ id: p2b, type: "journal", date: "2026-03-08", trigger: "party_advance_received", referenceId: "PO-3421", partyName: "Ramesh K.", amount: 21250, status: "posted", subVertical: "party",
    narration: "Adjust advance against receivable",
    entries: [
      entry(p2b, "journal", "party_advance_received", "advance_from_customer", 21250, 0, "Release advance on partial payment", "PO-3421", "party", "2026-03-08"),
      entry(p2b, "journal", "party_advance_received", "accounts_receivable", 0, 21250, "Reduce receivable by advance", "PO-3421", "party", "2026-03-08"),
    ],
  });

  const p3 = vid("JRN");
  v.push({ id: p3, type: "journal", date: "2026-03-12", trigger: "party_order_delivered", referenceId: "PO-3421", partyName: "Ramesh K.", partnerName: "Chef Lakshmi Kitchen", amount: 28975, status: "posted", subVertical: "party",
    narration: "Order delivered — expenses recognized",
    entries: [
      entry(p3, "journal", "party_order_delivered", "purchase_ppp_payout", 23375, 0, "PPP 55% payout", "PO-3421", "party", "2026-03-12"),
      entry(p3, "journal", "party_order_delivered", "accounts_payable_partner", 0, 23375, "Payable to Chef Lakshmi", "PO-3421", "party", "2026-03-12"),
      entry(p3, "journal", "party_order_delivered", "purchase_packing_material", 850, 0, "Packing cost", "PO-3421", "party", "2026-03-12"),
      entry(p3, "journal", "party_order_delivered", "expense_delivery_logistics", 1350, 0, "Delivery + transport", "PO-3421", "party", "2026-03-12"),
      entry(p3, "journal", "party_order_delivered", "expense_payment_gateway", 850, 0, "Gateway 2%", "PO-3421", "party", "2026-03-12"),
      entry(p3, "journal", "party_order_delivered", "expense_ops_overhead", 3400, 0, "Ops overhead 8%", "PO-3421", "party", "2026-03-12"),
      entry(p3, "journal", "party_order_delivered", "accounts_payable_vendor", 0, 5600, "Vendor payables (packing+delivery)", "PO-3421", "party", "2026-03-12"),
      entry(p3, "journal", "party_order_delivered", "bank_account_primary", 0, 850, "Gateway auto-deducted", "PO-3421", "party", "2026-03-12"),
    ],
  });

  const p4 = vid("RCT");
  v.push({ id: p4, type: "receipt", date: "2026-03-12", trigger: "party_final_payment", referenceId: "PO-3421", partyName: "Ramesh K.", amount: 21250, status: "posted", subVertical: "party",
    narration: "Final 50% payment collected on delivery",
    entries: [
      entry(p4, "receipt", "party_final_payment", "bank_account_primary", 21250, 0, "Final payment received", "PO-3421", "party", "2026-03-12"),
      entry(p4, "receipt", "party_final_payment", "accounts_receivable", 0, 21250, "Receivable fully cleared", "PO-3421", "party", "2026-03-12"),
    ],
  });

  const p5 = vid("CN");
  v.push({ id: p5, type: "credit_note", date: "2026-03-06", trigger: "party_order_cancelled", referenceId: "PO-3412", partyName: "Priya M.", amount: 15000, status: "posted", subVertical: "party",
    narration: "Anniversary order cancelled — 80% refund ($3,750 cancellation retained)",
    entries: [
      entry(p5, "credit_note", "party_order_cancelled", "sales_meal_party", 15000, 0, "Reverse revenue", "PO-3412", "party", "2026-03-06"),
      entry(p5, "credit_note", "party_order_cancelled", "refund_payable", 0, 15000, "Refund payable", "PO-3412", "party", "2026-03-06"),
      entry(p5, "credit_note", "party_order_cancelled", "sales_cancellation_charge", 0, 3750, "Cancellation charge 20%", "PO-3412", "party", "2026-03-06"),
      entry(p5, "credit_note", "party_order_cancelled", "refund_payable", 3750, 0, "Reduce refund by cancellation", "PO-3412", "party", "2026-03-06"),
    ],
  });

  const p6 = vid("PMT");
  v.push({ id: p6, type: "payment", date: "2026-03-14", trigger: "partner_payout", referenceId: "PTNR-001", partyName: "Chef Lakshmi Kitchen", amount: 23375, status: "posted", subVertical: "party",
    narration: "PPP settlement for PO-3421",
    entries: [
      entry(p6, "payment", "partner_payout", "accounts_payable_partner", 23375, 0, "Settlement", "PTNR-001", "party", "2026-03-14"),
      entry(p6, "payment", "partner_payout", "bank_account_settlement", 0, 23375, "NEFT transfer", "PTNR-001", "party", "2026-03-14"),
    ],
  });

  const p7 = vid("PMT");
  v.push({ id: p7, type: "payment", date: "2026-03-06", trigger: "refund_issued", referenceId: "PO-3412", partyName: "Priya M.", amount: 11250, status: "posted", subVertical: "party",
    narration: "Refund disbursed — PO-3412 cancellation",
    entries: [
      entry(p7, "payment", "refund_issued", "refund_payable", 11250, 0, "Settle refund", "PO-3412", "party", "2026-03-06"),
      entry(p7, "payment", "refund_issued", "bank_account_primary", 0, 11250, "Bank transfer — refund", "PO-3412", "party", "2026-03-06"),
    ],
  });

  return v;
}

// ═══════════════════════════════════════════
// INSTANT DELIVERY VOUCHERS
// ═══════════════════════════════════════════
export function generateInstantVouchers(): Voucher[] {
  const v: Voucher[] = [];

  const i1 = vid("SLS");
  v.push({ id: i1, type: "sales", date: "2026-03-15", trigger: "instant_order_placed", referenceId: "INS-7801", partyName: "Deepa R.", amount: 380, status: "posted", subVertical: "instant",
    narration: "Chicken Biryani + Raita — instant delivery",
    entries: [
      entry(i1, "sales", "instant_order_placed", "accounts_receivable", 380, 0, "Order receivable", "INS-7801", "instant", "2026-03-15"),
      entry(i1, "sales", "instant_order_placed", "sales_meal_instant", 0, 310, "Food MRP (excl GST + delivery)", "INS-7801", "instant", "2026-03-15"),
      entry(i1, "sales", "instant_order_placed", "gst_output_5", 0, 16, "GST 5%", "INS-7801", "instant", "2026-03-15"),
      entry(i1, "sales", "instant_order_placed", "sales_delivery_fee", 0, 35, "Delivery fee", "INS-7801", "instant", "2026-03-15"),
      entry(i1, "sales", "instant_order_placed", "sales_packaging_charge", 0, 19, "Packaging", "INS-7801", "instant", "2026-03-15"),
    ],
  });

  const i2 = vid("RCT");
  v.push({ id: i2, type: "receipt", date: "2026-03-15", trigger: "instant_order_placed", referenceId: "INS-7801", partyName: "Deepa R.", amount: 380, status: "posted", subVertical: "instant",
    narration: "Online payment — UPI",
    entries: [
      entry(i2, "receipt", "instant_order_placed", "bank_account_primary", 380, 0, "UPI payment", "INS-7801", "instant", "2026-03-15"),
      entry(i2, "receipt", "instant_order_placed", "accounts_receivable", 0, 380, "Receivable cleared", "INS-7801", "instant", "2026-03-15"),
    ],
  });

  const i3 = vid("JRN");
  v.push({ id: i3, type: "journal", date: "2026-03-15", trigger: "instant_order_delivered", referenceId: "INS-7801", partyName: "Deepa R.", partnerName: "Chef Meena", amount: 241, status: "posted", subVertical: "instant",
    narration: "Order delivered — expense recognition",
    entries: [
      entry(i3, "journal", "instant_order_delivered", "purchase_ppp_payout", 171, 0, "PPP 55%", "INS-7801", "instant", "2026-03-15"),
      entry(i3, "journal", "instant_order_delivered", "accounts_payable_partner", 0, 171, "Payable to Chef Meena", "INS-7801", "instant", "2026-03-15"),
      entry(i3, "journal", "instant_order_delivered", "purchase_packing_material", 19, 0, "Packing", "INS-7801", "instant", "2026-03-15"),
      entry(i3, "journal", "instant_order_delivered", "expense_delivery_logistics", 35, 0, "Delivery", "INS-7801", "instant", "2026-03-15"),
      entry(i3, "journal", "instant_order_delivered", "expense_payment_gateway", 8, 0, "Gateway 2%", "INS-7801", "instant", "2026-03-15"),
      entry(i3, "journal", "instant_order_delivered", "accounts_payable_vendor", 0, 54, "Vendor payable", "INS-7801", "instant", "2026-03-15"),
      entry(i3, "journal", "instant_order_delivered", "bank_account_primary", 0, 8, "Gateway auto-deducted", "INS-7801", "instant", "2026-03-15"),
    ],
  });

  const i4 = vid("CN");
  v.push({ id: i4, type: "credit_note", date: "2026-03-14", trigger: "instant_order_cancelled", referenceId: "INS-7795", partyName: "Karthik S.", amount: 240, status: "posted", subVertical: "instant",
    narration: "Order cancelled before cooking — full refund",
    entries: [
      entry(i4, "credit_note", "instant_order_cancelled", "sales_meal_instant", 240, 0, "Reverse revenue", "INS-7795", "instant", "2026-03-14"),
      entry(i4, "credit_note", "instant_order_cancelled", "refund_payable", 0, 240, "Refund payable", "INS-7795", "instant", "2026-03-14"),
    ],
  });

  const i5 = vid("JRN");
  v.push({ id: i5, type: "journal", date: "2026-03-16", trigger: "instant_surge_applied", referenceId: "INS-7810", partyName: "Ajay V.", amount: 45, status: "posted", subVertical: "instant",
    narration: "Peak hour surge $45 applied",
    entries: [
      entry(i5, "journal", "instant_surge_applied", "accounts_receivable", 45, 0, "Surge receivable", "INS-7810", "instant", "2026-03-16"),
      entry(i5, "journal", "instant_surge_applied", "sales_surge_charge", 0, 45, "Surge income", "INS-7810", "instant", "2026-03-16"),
    ],
  });

  return v;
}

// ═══════════════════════════════════════════
// SERVICES VOUCHERS
// ═══════════════════════════════════════════
export function generateServicesVouchers(): Voucher[] {
  const v: Voucher[] = [];

  const sv1 = vid("SLS");
  v.push({ id: sv1, type: "sales", date: "2026-03-10", trigger: "service_booked", referenceId: "SVC-501", partyName: "Nandini K.", amount: 1500, status: "posted", subVertical: "services",
    narration: "Home cook — Birthday dinner prep, 4 hours",
    entries: [
      entry(sv1, "sales", "service_booked", "accounts_receivable", 1500, 0, "Service receivable", "SVC-501", "services", "2026-03-10"),
      entry(sv1, "sales", "service_booked", "sales_service_booking", 0, 1271, "Service revenue (excl GST 18%)", "SVC-501", "services", "2026-03-10"),
      entry(sv1, "sales", "service_booked", "gst_output_18", 0, 229, "GST 18% on services", "SVC-501", "services", "2026-03-10"),
    ],
  });

  const sv2 = vid("RCT");
  v.push({ id: sv2, type: "receipt", date: "2026-03-10", trigger: "service_booked", referenceId: "SVC-501", partyName: "Nandini K.", amount: 1500, status: "posted", subVertical: "services",
    narration: "Full payment received — online",
    entries: [
      entry(sv2, "receipt", "service_booked", "bank_account_primary", 1500, 0, "Payment received", "SVC-501", "services", "2026-03-10"),
      entry(sv2, "receipt", "service_booked", "accounts_receivable", 0, 1500, "Receivable cleared", "SVC-501", "services", "2026-03-10"),
    ],
  });

  const sv3 = vid("JRN");
  v.push({ id: sv3, type: "journal", date: "2026-03-11", trigger: "service_completed", referenceId: "SVC-501", partyName: "Nandini K.", partnerName: "Chef Saroja", amount: 900, status: "posted", subVertical: "services",
    narration: "Service completed — provider payout recognized",
    entries: [
      entry(sv3, "journal", "service_completed", "expense_service_provider_payout", 900, 0, "Service provider 60%", "SVC-501", "services", "2026-03-11"),
      entry(sv3, "journal", "service_completed", "accounts_payable_partner", 0, 900, "Payable to Chef Saroja", "SVC-501", "services", "2026-03-11"),
      entry(sv3, "journal", "service_completed", "expense_payment_gateway", 30, 0, "Gateway 2%", "SVC-501", "services", "2026-03-11"),
      entry(sv3, "journal", "service_completed", "bank_account_primary", 0, 30, "Auto-deducted", "SVC-501", "services", "2026-03-11"),
    ],
  });

  const sv4 = vid("CN");
  v.push({ id: sv4, type: "credit_note", date: "2026-03-13", trigger: "service_cancelled", referenceId: "SVC-505", partyName: "Revathi S.", amount: 800, status: "posted", subVertical: "services",
    narration: "Service cancelled — partial refund ($200 cancellation charge)",
    entries: [
      entry(sv4, "credit_note", "service_cancelled", "sales_service_booking", 800, 0, "Reverse service revenue", "SVC-505", "services", "2026-03-13"),
      entry(sv4, "credit_note", "service_cancelled", "refund_payable", 0, 600, "Refund payable (net of cancellation)", "SVC-505", "services", "2026-03-13"),
      entry(sv4, "credit_note", "service_cancelled", "sales_cancellation_charge", 0, 200, "Cancellation charge retained", "SVC-505", "services", "2026-03-13"),
    ],
  });

  const sv5 = vid("PMT");
  v.push({ id: sv5, type: "payment", date: "2026-03-12", trigger: "partner_payout", referenceId: "PTNR-SVC-001", partyName: "Chef Saroja", amount: 900, status: "posted", subVertical: "services",
    narration: "Service provider payout — SVC-501",
    entries: [
      entry(sv5, "payment", "partner_payout", "accounts_payable_partner", 900, 0, "Settlement", "PTNR-SVC-001", "services", "2026-03-12"),
      entry(sv5, "payment", "partner_payout", "bank_account_settlement", 0, 900, "NEFT transfer", "PTNR-SVC-001", "services", "2026-03-12"),
    ],
  });

  return v;
}

// ═══════════════════════════════════════════
// SNACKS VOUCHERS
// ═══════════════════════════════════════════
export function generateSnacksVouchers(): Voucher[] {
  const v: Voucher[] = [];

  const sk1 = vid("SLS");
  v.push({ id: sk1, type: "sales", date: "2026-03-10", trigger: "snack_order_placed", referenceId: "SNK-201", partyName: "Anitha M.", amount: 850, status: "posted", subVertical: "snacks",
    narration: "Murukku 500g + Mysore Pak 250g + Adhirasam 6pc",
    entries: [
      entry(sk1, "sales", "snack_order_placed", "accounts_receivable", 850, 0, "Snack order receivable", "SNK-201", "snacks", "2026-03-10"),
      entry(sk1, "sales", "snack_order_placed", "sales_meal_instant", 0, 810, "Snacks revenue (excl GST 5%)", "SNK-201", "snacks", "2026-03-10"),
      entry(sk1, "sales", "snack_order_placed", "gst_output_5", 0, 40, "GST 5%", "SNK-201", "snacks", "2026-03-10"),
    ],
  });

  const sk2 = vid("RCT");
  v.push({ id: sk2, type: "receipt", date: "2026-03-10", trigger: "snack_order_placed", referenceId: "SNK-201", partyName: "Anitha M.", amount: 850, status: "posted", subVertical: "snacks",
    narration: "UPI payment received",
    entries: [
      entry(sk2, "receipt", "snack_order_placed", "bank_account_primary", 850, 0, "Payment received", "SNK-201", "snacks", "2026-03-10"),
      entry(sk2, "receipt", "snack_order_placed", "accounts_receivable", 0, 850, "Receivable cleared", "SNK-201", "snacks", "2026-03-10"),
    ],
  });

  const sk3 = vid("JRN");
  v.push({ id: sk3, type: "journal", date: "2026-03-11", trigger: "snack_order_delivered", referenceId: "SNK-201", partyName: "Anitha M.", partnerName: "Chef Kamala", amount: 520, status: "posted", subVertical: "snacks",
    narration: "Order delivered — expense recognition",
    entries: [
      entry(sk3, "journal", "snack_order_delivered", "purchase_ppp_payout", 425, 0, "PPP 50% (snacks margin)", "SNK-201", "snacks", "2026-03-11"),
      entry(sk3, "journal", "snack_order_delivered", "accounts_payable_partner", 0, 425, "Payable to Chef Kamala", "SNK-201", "snacks", "2026-03-11"),
      entry(sk3, "journal", "snack_order_delivered", "purchase_packing_material", 45, 0, "Packaging", "SNK-201", "snacks", "2026-03-11"),
      entry(sk3, "journal", "snack_order_delivered", "expense_delivery_logistics", 35, 0, "Delivery", "SNK-201", "snacks", "2026-03-11"),
      entry(sk3, "journal", "snack_order_delivered", "expense_payment_gateway", 17, 0, "Gateway 2%", "SNK-201", "snacks", "2026-03-11"),
      entry(sk3, "journal", "snack_order_delivered", "accounts_payable_vendor", 0, 80, "Vendor payable", "SNK-201", "snacks", "2026-03-11"),
      entry(sk3, "journal", "snack_order_delivered", "bank_account_primary", 0, 17, "Gateway auto-deducted", "SNK-201", "snacks", "2026-03-11"),
    ],
  });

  const sk4 = vid("CN");
  v.push({ id: sk4, type: "credit_note", date: "2026-03-09", trigger: "snack_order_cancelled", referenceId: "SNK-195", partyName: "Revathi P.", amount: 320, status: "posted", subVertical: "snacks",
    narration: "Order cancelled — full refund (pre-dispatch)",
    entries: [
      entry(sk4, "credit_note", "snack_order_cancelled", "sales_meal_instant", 320, 0, "Reverse revenue", "SNK-195", "snacks", "2026-03-09"),
      entry(sk4, "credit_note", "snack_order_cancelled", "refund_payable", 0, 320, "Refund payable", "SNK-195", "snacks", "2026-03-09"),
    ],
  });

  const sk5 = vid("PMT");
  v.push({ id: sk5, type: "payment", date: "2026-03-13", trigger: "partner_payout", referenceId: "PTNR-SNK-001", partyName: "Chef Kamala", amount: 425, status: "posted", subVertical: "snacks",
    narration: "Weekly snacks partner payout",
    entries: [
      entry(sk5, "payment", "partner_payout", "accounts_payable_partner", 425, 0, "Settlement", "PTNR-SNK-001", "snacks", "2026-03-13"),
      entry(sk5, "payment", "partner_payout", "bank_account_settlement", 0, 425, "NEFT transfer", "PTNR-SNK-001", "snacks", "2026-03-13"),
    ],
  });

  return v;
}

// ═══════════════════════════════════════════
// COOKERY CLASSES VOUCHERS
// ═══════════════════════════════════════════
export function generateCookeryVouchers(): Voucher[] {
  const v: Voucher[] = [];

  const ck1 = vid("SLS");
  v.push({ id: ck1, type: "sales", date: "2026-03-05", trigger: "cookery_class_booked", referenceId: "CKC-101", partyName: "Divya S.", amount: 1200, status: "posted", subVertical: "cookery",
    narration: "Chettinad Masterclass — 3-hour hands-on session",
    entries: [
      entry(ck1, "sales", "cookery_class_booked", "accounts_receivable", 1200, 0, "Class booking receivable", "CKC-101", "cookery", "2026-03-05"),
      entry(ck1, "sales", "cookery_class_booked", "sales_service_booking", 0, 1017, "Class fee (excl GST 18%)", "CKC-101", "cookery", "2026-03-05"),
      entry(ck1, "sales", "cookery_class_booked", "gst_output_18", 0, 183, "GST 18% on education", "CKC-101", "cookery", "2026-03-05"),
    ],
  });

  const ck2 = vid("RCT");
  v.push({ id: ck2, type: "receipt", date: "2026-03-05", trigger: "cookery_class_booked", referenceId: "CKC-101", partyName: "Divya S.", amount: 1200, status: "posted", subVertical: "cookery",
    narration: "Online payment received",
    entries: [
      entry(ck2, "receipt", "cookery_class_booked", "bank_account_primary", 1200, 0, "Payment received", "CKC-101", "cookery", "2026-03-05"),
      entry(ck2, "receipt", "cookery_class_booked", "accounts_receivable", 0, 1200, "Receivable cleared", "CKC-101", "cookery", "2026-03-05"),
    ],
  });

  const ck3 = vid("JRN");
  v.push({ id: ck3, type: "journal", date: "2026-03-06", trigger: "cookery_class_completed", referenceId: "CKC-101", partyName: "Divya S.", partnerName: "Chef Lakshmi (Instructor)", amount: 600, status: "posted", subVertical: "cookery",
    narration: "Class completed — instructor payout + expenses recognized",
    entries: [
      entry(ck3, "journal", "cookery_class_completed", "expense_service_provider_payout", 480, 0, "Instructor payout 40%", "CKC-101", "cookery", "2026-03-06"),
      entry(ck3, "journal", "cookery_class_completed", "accounts_payable_partner", 0, 480, "Payable to instructor", "CKC-101", "cookery", "2026-03-06"),
      entry(ck3, "journal", "cookery_class_completed", "purchase_raw_ingredients", 120, 0, "Ingredient cost for class", "CKC-101", "cookery", "2026-03-06"),
      entry(ck3, "journal", "cookery_class_completed", "expense_payment_gateway", 24, 0, "Gateway 2%", "CKC-101", "cookery", "2026-03-06"),
      entry(ck3, "journal", "cookery_class_completed", "accounts_payable_vendor", 0, 120, "Ingredient vendor payable", "CKC-101", "cookery", "2026-03-06"),
      entry(ck3, "journal", "cookery_class_completed", "bank_account_primary", 0, 24, "Gateway auto-deducted", "CKC-101", "cookery", "2026-03-06"),
    ],
  });

  const ck4 = vid("CN");
  v.push({ id: ck4, type: "credit_note", date: "2026-03-04", trigger: "cookery_class_cancelled", referenceId: "CKC-098", partyName: "Meera K.", amount: 800, status: "posted", subVertical: "cookery",
    narration: "Class cancelled — 75% refund ($200 cancellation charge)",
    entries: [
      entry(ck4, "credit_note", "cookery_class_cancelled", "sales_service_booking", 800, 0, "Reverse class revenue", "CKC-098", "cookery", "2026-03-04"),
      entry(ck4, "credit_note", "cookery_class_cancelled", "refund_payable", 0, 600, "Refund payable", "CKC-098", "cookery", "2026-03-04"),
      entry(ck4, "credit_note", "cookery_class_cancelled", "sales_cancellation_charge", 0, 200, "Cancellation charge", "CKC-098", "cookery", "2026-03-04"),
    ],
  });

  const ck5 = vid("PMT");
  v.push({ id: ck5, type: "payment", date: "2026-03-08", trigger: "instructor_payout", referenceId: "INST-CK-001", partyName: "Chef Lakshmi (Instructor)", amount: 480, status: "posted", subVertical: "cookery",
    narration: "Instructor payout — CKC-101",
    entries: [
      entry(ck5, "payment", "instructor_payout", "accounts_payable_partner", 480, 0, "Settlement", "INST-CK-001", "cookery", "2026-03-08"),
      entry(ck5, "payment", "instructor_payout", "bank_account_settlement", 0, 480, "NEFT transfer", "INST-CK-001", "cookery", "2026-03-08"),
    ],
  });

  return v;
}

// ═══════════════════════════════════════════
// SHERO CLASSES VOUCHERS
// ═══════════════════════════════════════════
export function generateSheroClassesVouchers(): Voucher[] {
  const v: Voucher[] = [];

  const sh1 = vid("SLS");
  v.push({ id: sh1, type: "sales", date: "2026-03-07", trigger: "shero_class_booked", referenceId: "SHC-301", partyName: "Lakshmi R.", amount: 600, status: "posted", subVertical: "shero_classes",
    narration: "Yoga for Beginners — 1-hour virtual session",
    entries: [
      entry(sh1, "sales", "shero_class_booked", "accounts_receivable", 600, 0, "Class booking receivable", "SHC-301", "shero_classes", "2026-03-07"),
      entry(sh1, "sales", "shero_class_booked", "sales_service_booking", 0, 508, "Class fee (excl GST 18%)", "SHC-301", "shero_classes", "2026-03-07"),
      entry(sh1, "sales", "shero_class_booked", "gst_output_18", 0, 92, "GST 18%", "SHC-301", "shero_classes", "2026-03-07"),
    ],
  });

  const sh2 = vid("RCT");
  v.push({ id: sh2, type: "receipt", date: "2026-03-07", trigger: "shero_class_booked", referenceId: "SHC-301", partyName: "Lakshmi R.", amount: 600, status: "posted", subVertical: "shero_classes",
    narration: "Online payment received",
    entries: [
      entry(sh2, "receipt", "shero_class_booked", "bank_account_primary", 600, 0, "Payment received", "SHC-301", "shero_classes", "2026-03-07"),
      entry(sh2, "receipt", "shero_class_booked", "accounts_receivable", 0, 600, "Receivable cleared", "SHC-301", "shero_classes", "2026-03-07"),
    ],
  });

  const sh3 = vid("JRN");
  v.push({ id: sh3, type: "journal", date: "2026-03-08", trigger: "shero_class_completed", referenceId: "SHC-301", partyName: "Lakshmi R.", partnerName: "Yoga Instructor Priya", amount: 300, status: "posted", subVertical: "shero_classes",
    narration: "Session completed — instructor payout recognized",
    entries: [
      entry(sh3, "journal", "shero_class_completed", "expense_service_provider_payout", 240, 0, "Instructor payout 40%", "SHC-301", "shero_classes", "2026-03-08"),
      entry(sh3, "journal", "shero_class_completed", "accounts_payable_partner", 0, 240, "Payable to instructor", "SHC-301", "shero_classes", "2026-03-08"),
      entry(sh3, "journal", "shero_class_completed", "expense_payment_gateway", 12, 0, "Gateway 2%", "SHC-301", "shero_classes", "2026-03-08"),
      entry(sh3, "journal", "shero_class_completed", "bank_account_primary", 0, 12, "Gateway auto-deducted", "SHC-301", "shero_classes", "2026-03-08"),
      entry(sh3, "journal", "shero_class_completed", "expense_technology", 48, 0, "Platform fee (Zoom/streaming)", "SHC-301", "shero_classes", "2026-03-08"),
      entry(sh3, "journal", "shero_class_completed", "accounts_payable_vendor", 0, 48, "Tech vendor payable", "SHC-301", "shero_classes", "2026-03-08"),
    ],
  });

  const sh4 = vid("CN");
  v.push({ id: sh4, type: "credit_note", date: "2026-03-06", trigger: "shero_class_cancelled", referenceId: "SHC-298", partyName: "Sudha V.", amount: 450, status: "posted", subVertical: "shero_classes",
    narration: "Session cancelled — 80% refund",
    entries: [
      entry(sh4, "credit_note", "shero_class_cancelled", "sales_service_booking", 450, 0, "Reverse revenue", "SHC-298", "shero_classes", "2026-03-06"),
      entry(sh4, "credit_note", "shero_class_cancelled", "refund_payable", 0, 360, "Refund payable", "SHC-298", "shero_classes", "2026-03-06"),
      entry(sh4, "credit_note", "shero_class_cancelled", "sales_cancellation_charge", 0, 90, "Cancellation charge 20%", "SHC-298", "shero_classes", "2026-03-06"),
    ],
  });

  const sh5 = vid("PMT");
  v.push({ id: sh5, type: "payment", date: "2026-03-10", trigger: "instructor_payout", referenceId: "INST-SH-001", partyName: "Yoga Instructor Priya", amount: 240, status: "posted", subVertical: "shero_classes",
    narration: "Instructor payout — SHC-301",
    entries: [
      entry(sh5, "payment", "instructor_payout", "accounts_payable_partner", 240, 0, "Settlement", "INST-SH-001", "shero_classes", "2026-03-10"),
      entry(sh5, "payment", "instructor_payout", "bank_account_settlement", 0, 240, "NEFT transfer", "INST-SH-001", "shero_classes", "2026-03-10"),
    ],
  });

  return v;
}

export function generateSubscriptionPL(): PLLineItem[] {
  return [
    { label: "REVENUE", amount: 0, type: "header" },
    { label: "Sales — Meal Subscriptions", amount: 492430, type: "revenue", indent: 1 },
    { label: "Sales — Delivery Fees", amount: 127800, type: "revenue", indent: 1 },
    { label: "GROSS REVENUE", amount: 620230, type: "subtotal", bold: true },
    { label: "Less: Discounts (Contra)", amount: -47500, type: "revenue", indent: 1 },
    { label: "Less: Deferred Revenue (Paused/Skipped)", amount: -28650, type: "revenue", indent: 1 },
    { label: "Less: Refunds", amount: -12600, type: "revenue", indent: 1 },
    { label: "NET REVENUE", amount: 531480, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "TAX COLLECTED (Liability)", amount: 0, type: "header" },
    { label: "GST Output 5% — Food", amount: -25308, type: "expense", indent: 1 },
    { label: "", amount: 0, type: "header" },
    { label: "DIRECT COSTS (COGS)", amount: 0, type: "header" },
    { label: "Purchase — PPP Partner Payouts (55%)", amount: -270837, type: "expense", indent: 1 },
    { label: "Purchase — Packing Materials", amount: -28400, type: "expense", indent: 1 },
    { label: "Delivery & Logistics", amount: -42600, type: "expense", indent: 1 },
    { label: "Payment Gateway Charges (2%)", amount: -10630, type: "expense", indent: 1 },
    { label: "TOTAL DIRECT COSTS", amount: -352467, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1 (CM1)", amount: 179013, type: "subtotal", bold: true },
    { label: "CM1 Margin %", amount: 33.7, type: "subtotal" },
    { label: "", amount: 0, type: "header" },
    { label: "INDIRECT EXPENSES", amount: 0, type: "header" },
    { label: "Operations Overhead (8%)", amount: -42518, type: "expense", indent: 1 },
    { label: "Marketing — Lead Generation", amount: -8500, type: "expense", indent: 1 },
    { label: "Marketing — Social Media", amount: -12000, type: "expense", indent: 1 },
    { label: "Marketing — Referral Rewards", amount: -3200, type: "expense", indent: 1 },
    { label: "Customer Support", amount: -4500, type: "expense", indent: 1 },
    { label: "Partner Training", amount: -2800, type: "expense", indent: 1 },
    { label: "TOTAL INDIRECT EXPENSES", amount: -73518, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1.5 (CM1.5)", amount: 105495, type: "subtotal", bold: true },
    { label: "CM1.5 Margin %", amount: 19.8, type: "subtotal" },
  ];
}

export function generatePartyPL(): PLLineItem[] {
  return [
    { label: "REVENUE", amount: 0, type: "header" },
    { label: "Sales — Party Orders (MRP)", amount: 1700000, type: "revenue", indent: 1 },
    { label: "Sales — Packaging Charges", amount: 47360, type: "revenue", indent: 1 },
    { label: "Sales — Transport Charges", amount: 74000, type: "revenue", indent: 1 },
    { label: "Sales — Cancellation Charges", amount: 11250, type: "revenue", indent: 1 },
    { label: "GROSS REVENUE", amount: 1832610, type: "subtotal", bold: true },
    { label: "Less: Discounts (Contra)", amount: -68000, type: "revenue", indent: 1 },
    { label: "Less: Refunds", amount: -45000, type: "revenue", indent: 1 },
    { label: "NET REVENUE", amount: 1719610, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "TAX COLLECTED (Liability)", amount: 0, type: "header" },
    { label: "GST Output 5% — Food", amount: -85000, type: "expense", indent: 1 },
    { label: "", amount: 0, type: "header" },
    { label: "DIRECT COSTS (COGS)", amount: 0, type: "header" },
    { label: "Purchase — PPP Partner Payouts (55%)", amount: -935000, type: "expense", indent: 1 },
    { label: "Purchase — Packing Materials", amount: -47360, type: "expense", indent: 1 },
    { label: "Delivery & Transport", amount: -51800, type: "expense", indent: 1 },
    { label: "Payment Gateway Charges (2%)", amount: -34000, type: "expense", indent: 1 },
    { label: "TOTAL DIRECT COSTS", amount: -1068160, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1 (CM1)", amount: 566450, type: "subtotal", bold: true },
    { label: "CM1 Margin %", amount: 32.9, type: "subtotal" },
    { label: "", amount: 0, type: "header" },
    { label: "INDIRECT EXPENSES", amount: 0, type: "header" },
    { label: "Operations Overhead (8%)", amount: -137569, type: "expense", indent: 1 },
    { label: "Marketing — Lead Generation", amount: -12500, type: "expense", indent: 1 },
    { label: "Marketing — Social Media", amount: -18000, type: "expense", indent: 1 },
    { label: "Marketing — Referral Rewards", amount: -5200, type: "expense", indent: 1 },
    { label: "Customer Support", amount: -6500, type: "expense", indent: 1 },
    { label: "TOTAL INDIRECT EXPENSES", amount: -179769, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1.5 (CM1.5)", amount: 386681, type: "subtotal", bold: true },
    { label: "CM1.5 Margin %", amount: 22.5, type: "subtotal" },
  ];
}

export function generateInstantPL(): PLLineItem[] {
  return [
    { label: "REVENUE", amount: 0, type: "header" },
    { label: "Sales — Instant Delivery (Food)", amount: 385000, type: "revenue", indent: 1 },
    { label: "Sales — Delivery Fees", amount: 52500, type: "revenue", indent: 1 },
    { label: "Sales — Packaging Charges", amount: 28200, type: "revenue", indent: 1 },
    { label: "Sales — Surge Pricing", amount: 18500, type: "revenue", indent: 1 },
    { label: "GROSS REVENUE", amount: 484200, type: "subtotal", bold: true },
    { label: "Less: Discounts (Contra)", amount: -24210, type: "revenue", indent: 1 },
    { label: "Less: Refunds", amount: -9600, type: "revenue", indent: 1 },
    { label: "NET REVENUE", amount: 450390, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "TAX COLLECTED (Liability)", amount: 0, type: "header" },
    { label: "GST Output 5% — Food", amount: -21447, type: "expense", indent: 1 },
    { label: "", amount: 0, type: "header" },
    { label: "DIRECT COSTS (COGS)", amount: 0, type: "header" },
    { label: "Purchase — PPP Partner Payouts (55%)", amount: -211750, type: "expense", indent: 1 },
    { label: "Purchase — Packing Materials", amount: -28200, type: "expense", indent: 1 },
    { label: "Delivery & Logistics", amount: -52500, type: "expense", indent: 1 },
    { label: "Payment Gateway Charges (2%)", amount: -9008, type: "expense", indent: 1 },
    { label: "TOTAL DIRECT COSTS", amount: -301458, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1 (CM1)", amount: 148932, type: "subtotal", bold: true },
    { label: "CM1 Margin %", amount: 33.1, type: "subtotal" },
    { label: "", amount: 0, type: "header" },
    { label: "INDIRECT EXPENSES", amount: 0, type: "header" },
    { label: "Operations Overhead (8%)", amount: -36031, type: "expense", indent: 1 },
    { label: "Marketing — Lead Generation", amount: -6500, type: "expense", indent: 1 },
    { label: "Marketing — Social Media", amount: -8000, type: "expense", indent: 1 },
    { label: "Delivery Returns / Failed", amount: -3200, type: "expense", indent: 1 },
    { label: "Customer Support", amount: -3800, type: "expense", indent: 1 },
    { label: "TOTAL INDIRECT EXPENSES", amount: -57531, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1.5 (CM1.5)", amount: 91401, type: "subtotal", bold: true },
    { label: "CM1.5 Margin %", amount: 20.3, type: "subtotal" },
  ];
}

export function generateServicesPL(): PLLineItem[] {
  return [
    { label: "REVENUE", amount: 0, type: "header" },
    { label: "Sales — Service Bookings", amount: 128000, type: "revenue", indent: 1 },
    { label: "Sales — Convenience Fee", amount: 8500, type: "revenue", indent: 1 },
    { label: "Sales — Cancellation Charges", amount: 3200, type: "revenue", indent: 1 },
    { label: "GROSS REVENUE", amount: 139700, type: "subtotal", bold: true },
    { label: "Less: Discounts (Contra)", amount: -5600, type: "revenue", indent: 1 },
    { label: "Less: Refunds", amount: -4800, type: "revenue", indent: 1 },
    { label: "NET REVENUE", amount: 129300, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "TAX COLLECTED (Liability)", amount: 0, type: "header" },
    { label: "GST Output 18% — Services", amount: -19729, type: "expense", indent: 1 },
    { label: "", amount: 0, type: "header" },
    { label: "DIRECT COSTS", amount: 0, type: "header" },
    { label: "Service Provider Payouts (60%)", amount: -76800, type: "expense", indent: 1 },
    { label: "Payment Gateway Charges (2%)", amount: -2586, type: "expense", indent: 1 },
    { label: "TOTAL DIRECT COSTS", amount: -79386, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1 (CM1)", amount: 49914, type: "subtotal", bold: true },
    { label: "CM1 Margin %", amount: 38.6, type: "subtotal" },
    { label: "", amount: 0, type: "header" },
    { label: "INDIRECT EXPENSES", amount: 0, type: "header" },
    { label: "Operations Overhead (8%)", amount: -10344, type: "expense", indent: 1 },
    { label: "Marketing — Social Media", amount: -3500, type: "expense", indent: 1 },
    { label: "Partner Training", amount: -2000, type: "expense", indent: 1 },
    { label: "Customer Support", amount: -1800, type: "expense", indent: 1 },
    { label: "Insurance", amount: -1200, type: "expense", indent: 1 },
    { label: "TOTAL INDIRECT EXPENSES", amount: -18844, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1.5 (CM1.5)", amount: 31070, type: "subtotal", bold: true },
    { label: "CM1.5 Margin %", amount: 24.0, type: "subtotal" },
  ];
}

export function generateSnacksPL(): PLLineItem[] {
  return [
    { label: "REVENUE", amount: 0, type: "header" },
    { label: "Sales — Sweets & Snacks", amount: 185000, type: "revenue", indent: 1 },
    { label: "Sales — Packaging Charges", amount: 12500, type: "revenue", indent: 1 },
    { label: "Sales — Delivery Fees", amount: 18200, type: "revenue", indent: 1 },
    { label: "GROSS REVENUE", amount: 215700, type: "subtotal", bold: true },
    { label: "Less: Discounts (Contra)", amount: -10800, type: "revenue", indent: 1 },
    { label: "Less: Refunds", amount: -6400, type: "revenue", indent: 1 },
    { label: "NET REVENUE", amount: 198500, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "TAX COLLECTED (Liability)", amount: 0, type: "header" },
    { label: "GST Output 5% — Food", amount: -9452, type: "expense", indent: 1 },
    { label: "", amount: 0, type: "header" },
    { label: "DIRECT COSTS (COGS)", amount: 0, type: "header" },
    { label: "Purchase — PPP Partner Payouts (50%)", amount: -92500, type: "expense", indent: 1 },
    { label: "Purchase — Packing Materials", amount: -12500, type: "expense", indent: 1 },
    { label: "Purchase — Raw Ingredients", amount: -18500, type: "expense", indent: 1 },
    { label: "Delivery & Logistics", amount: -18200, type: "expense", indent: 1 },
    { label: "Payment Gateway Charges (2%)", amount: -3970, type: "expense", indent: 1 },
    { label: "TOTAL DIRECT COSTS", amount: -145670, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1 (CM1)", amount: 52830, type: "subtotal", bold: true },
    { label: "CM1 Margin %", amount: 26.6, type: "subtotal" },
    { label: "", amount: 0, type: "header" },
    { label: "INDIRECT EXPENSES", amount: 0, type: "header" },
    { label: "Operations Overhead (8%)", amount: -15880, type: "expense", indent: 1 },
    { label: "Marketing — Social Media", amount: -4500, type: "expense", indent: 1 },
    { label: "Marketing — Festival Promotions", amount: -3200, type: "expense", indent: 1 },
    { label: "Customer Support", amount: -2100, type: "expense", indent: 1 },
    { label: "Quality Testing", amount: -1500, type: "expense", indent: 1 },
    { label: "TOTAL INDIRECT EXPENSES", amount: -27180, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1.5 (CM1.5)", amount: 25650, type: "subtotal", bold: true },
    { label: "CM1.5 Margin %", amount: 12.9, type: "subtotal" },
  ];
}

export function generateCookeryPL(): PLLineItem[] {
  return [
    { label: "REVENUE", amount: 0, type: "header" },
    { label: "Sales — Cookery Class Fees", amount: 142000, type: "revenue", indent: 1 },
    { label: "Sales — Ingredient Kit Add-ons", amount: 18500, type: "revenue", indent: 1 },
    { label: "Sales — Cancellation Charges", amount: 4200, type: "revenue", indent: 1 },
    { label: "GROSS REVENUE", amount: 164700, type: "subtotal", bold: true },
    { label: "Less: Discounts (Contra)", amount: -8200, type: "revenue", indent: 1 },
    { label: "Less: Refunds", amount: -5400, type: "revenue", indent: 1 },
    { label: "NET REVENUE", amount: 151100, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "TAX COLLECTED (Liability)", amount: 0, type: "header" },
    { label: "GST Output 18% — Education", amount: -23050, type: "expense", indent: 1 },
    { label: "", amount: 0, type: "header" },
    { label: "DIRECT COSTS", amount: 0, type: "header" },
    { label: "Instructor Payouts (40%)", amount: -56800, type: "expense", indent: 1 },
    { label: "Raw Ingredients for Classes", amount: -14200, type: "expense", indent: 1 },
    { label: "Venue & Equipment Rental", amount: -8500, type: "expense", indent: 1 },
    { label: "Payment Gateway Charges (2%)", amount: -3022, type: "expense", indent: 1 },
    { label: "TOTAL DIRECT COSTS", amount: -82522, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1 (CM1)", amount: 68578, type: "subtotal", bold: true },
    { label: "CM1 Margin %", amount: 45.4, type: "subtotal" },
    { label: "", amount: 0, type: "header" },
    { label: "INDIRECT EXPENSES", amount: 0, type: "header" },
    { label: "Operations Overhead (8%)", amount: -12088, type: "expense", indent: 1 },
    { label: "Marketing — Social Media", amount: -5200, type: "expense", indent: 1 },
    { label: "Instructor Training & Certification", amount: -3500, type: "expense", indent: 1 },
    { label: "Customer Support", amount: -2200, type: "expense", indent: 1 },
    { label: "TOTAL INDIRECT EXPENSES", amount: -22988, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1.5 (CM1.5)", amount: 45590, type: "subtotal", bold: true },
    { label: "CM1.5 Margin %", amount: 30.2, type: "subtotal" },
  ];
}

export function generateSheroClassesPL(): PLLineItem[] {
  return [
    { label: "REVENUE", amount: 0, type: "header" },
    { label: "Sales — Yoga & Wellness Sessions", amount: 86000, type: "revenue", indent: 1 },
    { label: "Sales — Fitness Classes", amount: 32000, type: "revenue", indent: 1 },
    { label: "Sales — Subscription Packs", amount: 24500, type: "revenue", indent: 1 },
    { label: "Sales — Cancellation Charges", amount: 2800, type: "revenue", indent: 1 },
    { label: "GROSS REVENUE", amount: 145300, type: "subtotal", bold: true },
    { label: "Less: Discounts (Contra)", amount: -7200, type: "revenue", indent: 1 },
    { label: "Less: Refunds", amount: -4100, type: "revenue", indent: 1 },
    { label: "NET REVENUE", amount: 134000, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "TAX COLLECTED (Liability)", amount: 0, type: "header" },
    { label: "GST Output 18% — Services", amount: -20441, type: "expense", indent: 1 },
    { label: "", amount: 0, type: "header" },
    { label: "DIRECT COSTS", amount: 0, type: "header" },
    { label: "Instructor Payouts (40%)", amount: -53600, type: "expense", indent: 1 },
    { label: "Platform & Streaming Costs", amount: -8400, type: "expense", indent: 1 },
    { label: "Payment Gateway Charges (2%)", amount: -2680, type: "expense", indent: 1 },
    { label: "TOTAL DIRECT COSTS", amount: -64680, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1 (CM1)", amount: 69320, type: "subtotal", bold: true },
    { label: "CM1 Margin %", amount: 51.7, type: "subtotal" },
    { label: "", amount: 0, type: "header" },
    { label: "INDIRECT EXPENSES", amount: 0, type: "header" },
    { label: "Operations Overhead (8%)", amount: -10720, type: "expense", indent: 1 },
    { label: "Marketing — Social Media", amount: -4800, type: "expense", indent: 1 },
    { label: "Instructor Onboarding & Certification", amount: -3200, type: "expense", indent: 1 },
    { label: "Customer Support", amount: -1800, type: "expense", indent: 1 },
    { label: "Technology (Zoom/Streaming)", amount: -2400, type: "expense", indent: 1 },
    { label: "TOTAL INDIRECT EXPENSES", amount: -22920, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1.5 (CM1.5)", amount: 46400, type: "subtotal", bold: true },
    { label: "CM1.5 Margin %", amount: 34.6, type: "subtotal" },
  ];
}

// ═══════════════════════════════════════════
// RECEIVABLES & PAYABLES
// ═══════════════════════════════════════════
export function generateReceivablesPayables(sv: SubVertical): ReceivablePayable[] {
  const data: Record<SubVertical, ReceivablePayable[]> = {
    subscription: [
      { id: "AR-S01", type: "receivable", entity: "Priya Reddy", referenceId: "SUB-1001", amount: 0, dueDate: "2026-03-01", status: "settled", agingDays: 0, subVertical: "subscription" },
      { id: "AR-S02", type: "receivable", entity: "Rahul Sharma", referenceId: "SUB-1002", amount: 1200, dueDate: "2026-03-10", status: "overdue", agingDays: 7, subVertical: "subscription" },
      { id: "AP-S01", type: "payable", entity: "Chef Lakshmi Kitchen", referenceId: "PTNR-001", amount: 18500, dueDate: "2026-03-15", status: "outstanding", agingDays: 2, subVertical: "subscription" },
      { id: "AP-S02", type: "payable", entity: "Chef Fathima Kitchen", referenceId: "PTNR-002", amount: 14200, dueDate: "2026-03-15", status: "outstanding", agingDays: 2, subVertical: "subscription" },
      { id: "AP-S03", type: "payable", entity: "Chef Meena Kitchen", referenceId: "PTNR-003", amount: 0, dueDate: "2026-03-08", status: "settled", agingDays: 0, subVertical: "subscription" },
      { id: "AP-S04", type: "payable", entity: "GreenPack Supplies", referenceId: "PO-PACK-001", amount: 15000, dueDate: "2026-03-18", status: "outstanding", agingDays: 0, subVertical: "subscription" },
    ],
    party: [
      { id: "AR-P01", type: "receivable", entity: "Ramesh K.", referenceId: "PO-3421", amount: 0, dueDate: "2026-03-12", status: "settled", agingDays: 0, subVertical: "party" },
      { id: "AR-P02", type: "receivable", entity: "Lakshmi S.", referenceId: "PO-3418", amount: 12000, dueDate: "2026-03-10", status: "outstanding", agingDays: 7, subVertical: "party" },
      { id: "AR-P03", type: "receivable", entity: "Arun V.", referenceId: "PO-3415", amount: 19125, dueDate: "2026-03-12", status: "overdue", agingDays: 5, subVertical: "party" },
      { id: "AP-P01", type: "payable", entity: "Chef Lakshmi Kitchen", referenceId: "PTNR-001", amount: 23375, dueDate: "2026-03-14", status: "outstanding", agingDays: 3, subVertical: "party" },
      { id: "AP-P02", type: "payable", entity: "Chef Fathima Kitchen", referenceId: "PTNR-002", amount: 13200, dueDate: "2026-03-14", status: "outstanding", agingDays: 3, subVertical: "party" },
    ],
    instant: [
      { id: "AR-I01", type: "receivable", entity: "Karthik S.", referenceId: "INS-7795", amount: 0, dueDate: "2026-03-14", status: "settled", agingDays: 0, subVertical: "instant" },
      { id: "AP-I01", type: "payable", entity: "Chef Meena Kitchen", referenceId: "PTNR-INS-001", amount: 8500, dueDate: "2026-03-18", status: "outstanding", agingDays: 0, subVertical: "instant" },
      { id: "AP-I02", type: "payable", entity: "QuickShip Logistics", referenceId: "VEND-DEL-001", amount: 12400, dueDate: "2026-03-15", status: "outstanding", agingDays: 2, subVertical: "instant" },
    ],
    services: [
      { id: "AR-SV01", type: "receivable", entity: "Revathi S.", referenceId: "SVC-505", amount: 0, dueDate: "2026-03-13", status: "settled", agingDays: 0, subVertical: "services" },
      { id: "AP-SV01", type: "payable", entity: "Chef Saroja", referenceId: "PTNR-SVC-001", amount: 0, dueDate: "2026-03-12", status: "settled", agingDays: 0, subVertical: "services" },
      { id: "AP-SV02", type: "payable", entity: "Chef Kamala", referenceId: "PTNR-SVC-002", amount: 4500, dueDate: "2026-03-18", status: "outstanding", agingDays: 0, subVertical: "services" },
    ],
    snacks: [
      { id: "AR-SK01", type: "receivable", entity: "Anitha M.", referenceId: "SNK-201", amount: 0, dueDate: "2026-03-10", status: "settled", agingDays: 0, subVertical: "snacks" },
      { id: "AP-SK01", type: "payable", entity: "Chef Kamala", referenceId: "PTNR-SNK-001", amount: 6200, dueDate: "2026-03-18", status: "outstanding", agingDays: 0, subVertical: "snacks" },
      { id: "AP-SK02", type: "payable", entity: "SweetBox Packaging", referenceId: "VEND-PKG-002", amount: 4800, dueDate: "2026-03-20", status: "outstanding", agingDays: 0, subVertical: "snacks" },
    ],
    cookery: [
      { id: "AR-CK01", type: "receivable", entity: "Divya S.", referenceId: "CKC-101", amount: 0, dueDate: "2026-03-05", status: "settled", agingDays: 0, subVertical: "cookery" },
      { id: "AR-CK02", type: "receivable", entity: "Preethi N.", referenceId: "CKC-105", amount: 2400, dueDate: "2026-03-15", status: "outstanding", agingDays: 2, subVertical: "cookery" },
      { id: "AP-CK01", type: "payable", entity: "Chef Lakshmi (Instructor)", referenceId: "INST-CK-001", amount: 8400, dueDate: "2026-03-15", status: "outstanding", agingDays: 2, subVertical: "cookery" },
    ],
    shero_classes: [
      { id: "AR-SH01", type: "receivable", entity: "Lakshmi R.", referenceId: "SHC-301", amount: 0, dueDate: "2026-03-07", status: "settled", agingDays: 0, subVertical: "shero_classes" },
      { id: "AP-SH01", type: "payable", entity: "Yoga Instructor Priya", referenceId: "INST-SH-001", amount: 5400, dueDate: "2026-03-15", status: "outstanding", agingDays: 2, subVertical: "shero_classes" },
      { id: "AP-SH02", type: "payable", entity: "ZoomPro Platform", referenceId: "VEND-TECH-001", amount: 2800, dueDate: "2026-03-20", status: "outstanding", agingDays: 0, subVertical: "shero_classes" },
    ],
  };
  return data[sv] || [];
}

// ═══════════════════════════════════════════
// FINANCIAL INTELLIGENCE — GAPS
// ═══════════════════════════════════════════
export const financialGaps: FinancialGap[] = [
  { id: "FG-001", category: "revenue_leakage", severity: "critical", title: "Paused Subscriptions Counted as Revenue", description: "3 paused subscriptions ($8,100) still recognized as revenue. Must be deferred until resumed.", impact: "P&L overstated by $8,100", suggestion: "Auto-journal: On pause → reverse remaining sessions to Deferred Revenue", subVertical: "subscription" },
  { id: "FG-002", category: "liability_missing", severity: "critical", title: "Skip Credits Not Recorded as Liability", description: "28 skip credits ($4,200) have no liability entry. Meals still owed.", impact: "Understated liabilities by $4,200", suggestion: "Auto-journal: On skip → Cr Skip Credit Liability, Dr Revenue Deferred", subVertical: "subscription" },
  { id: "FG-003", category: "tax_gap", severity: "critical", title: "GST Liability Not Reconciled with GSTR-3B", description: "GST Output collected $1,51,484 but no reconciliation with filed GSTR-3B. Risk of penalty.", impact: "Tax compliance risk — $1.5L unreconciled", suggestion: "Monthly GSTR-3B reconciliation report; auto-match with Sales Register", subVertical: "all" },
  { id: "FG-004", category: "reconciliation", severity: "high", title: "Overdue Sundry Debtors > 7 Days", description: "$32,325 receivable overdue from 3 customers across sub-verticals.", impact: "Cash collection delay, working capital stress", suggestion: "Auto-SMS/email reminder > 3 days overdue; escalate > 7 days to Team Leader", subVertical: "all" },
  { id: "FG-005", category: "expense_untracked", severity: "high", title: "Party Advances Not Parked as Liability", description: "Advances received (50%) recognized as revenue immediately instead of Advance from Customer.", impact: "Revenue recognized before service delivery", suggestion: "Receipt → Cr Advance from Customer; On delivery → Journal to clear advance vs receivable", subVertical: "party" },
  { id: "FG-006", category: "compliance", severity: "high", title: "TDS Not Deducted on All Partner Payouts", description: "TDS 1% under Sec 194C mandatory on all PPP payouts > $30,000/year. Only 40% partners have TDS deducted.", impact: "Non-compliance penalty risk", suggestion: "Auto-deduct TDS on all Payment vouchers; maintain TDS Payable ledger", subVertical: "all" },
  { id: "FG-007", category: "revenue_leakage", severity: "medium", title: "Instant Delivery Surge Not Tracked Separately", description: "Surge charges mixed with food revenue. Cannot analyze surge contribution.", impact: "Revenue analysis incomplete", suggestion: "Separate Sales — Surge Pricing ledger; auto-post on surge orders", subVertical: "instant" },
  { id: "FG-008", category: "expense_untracked", severity: "medium", title: "Delivery Return Costs Untracked", description: "Failed deliveries incur return costs not recorded. Estimated $3,200/month.", impact: "Hidden expense", suggestion: "Track delivery failures; Journal return costs to Delivery Return account", subVertical: "all" },
  { id: "FG-009", category: "reconciliation", severity: "medium", title: "Partner Settlement Mismatch > 7 Days", description: "2 partners show outstanding payables > 7 days past agreed settlement date.", impact: "Partner relationship risk", suggestion: "Weekly auto-reconciliation; flag overdue settlements", subVertical: "all" },
  { id: "FG-010", category: "tax_gap", severity: "high", title: "Services GST @ 18% vs Food GST @ 5% Mixed", description: "Service bookings taxed at 18% but no separate GST Output account. Risk of under-reporting.", impact: "Mixed GST rates = wrong GSTR filing", suggestion: "Maintain separate GST Output 5% and GST Output 18% ledgers", subVertical: "services" },
];

// ═══════════════════════════════════════════
// AGGREGATE & BOOK GENERATORS
// ═══════════════════════════════════════════

export function aggregateLedger(entries: LedgerEntry[]): { account: LedgerAccount; label: string; group: LedgerGroup; debit: number; credit: number; balance: number }[] {
  const map: Record<string, { debit: number; credit: number }> = {};
  entries.forEach(e => {
    if (!map[e.account]) map[e.account] = { debit: 0, credit: 0 };
    map[e.account].debit += e.debit;
    map[e.account].credit += e.credit;
  });
  return Object.entries(map).map(([account, { debit, credit }]) => ({
    account: account as LedgerAccount,
    label: accountMeta[account as LedgerAccount]?.label || account,
    group: accountMeta[account as LedgerAccount]?.group || "current_asset",
    debit,
    credit,
    balance: debit - credit,
  })).sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
}

export function generateTrialBalance(entries: LedgerEntry[]): TrialBalanceRow[] {
  return aggregateLedger(entries).map(b => ({
    account: b.account,
    label: b.label,
    group: b.group,
    debit: b.debit > b.credit ? b.debit - b.credit : 0,
    credit: b.credit > b.debit ? b.credit - b.debit : 0,
  }));
}

export function generateDayBook(vouchers: Voucher[]): DayBookEntry[] {
  return vouchers
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(v => ({
      date: v.date,
      voucherId: v.id,
      voucherType: v.type,
      partyName: v.partyName,
      narration: v.narration,
      debit: v.entries.reduce((s, e) => s + e.debit, 0),
      credit: v.entries.reduce((s, e) => s + e.credit, 0),
      subVertical: v.subVertical,
    }));
}

export function generateCashBankBook(entries: LedgerEntry[], bookType: "cash" | "bank"): LedgerEntry[] {
  const accounts: LedgerAccount[] = bookType === "cash"
    ? ["cash_in_hand"]
    : ["bank_account_primary", "bank_account_settlement"];
  return entries
    .filter(e => accounts.includes(e.account))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function generateSalesRegister(vouchers: Voucher[]): Voucher[] {
  return vouchers.filter(v => v.type === "sales").sort((a, b) => a.date.localeCompare(b.date));
}

export function generatePurchaseRegister(vouchers: Voucher[]): Voucher[] {
  return vouchers.filter(v => v.type === "purchase").sort((a, b) => a.date.localeCompare(b.date));
}

// ═══════════════════════════════════════════
// CONSOLIDATED (ALL SUB-VERTICALS)
// ═══════════════════════════════════════════
export function generateAllVouchers(): { vouchers: Voucher[]; byVertical: Record<SubVertical, Voucher[]> } {
  const sub = generateSubscriptionVouchers();
  const party = generatePartyVouchers();
  const instant = generateInstantVouchers();
  const services = generateServicesVouchers();
  const snacks = generateSnacksVouchers();
  const cookery = generateCookeryVouchers();
  const shero_classes = generateSheroClassesVouchers();
  const all = [...sub, ...party, ...instant, ...services, ...snacks, ...cookery, ...shero_classes].sort((a, b) => a.date.localeCompare(b.date));
  return {
    vouchers: all,
    byVertical: { subscription: sub, party, instant, services, snacks, cookery, shero_classes },
  };
}

export function generateConsolidatedPL(): PLLineItem[] {
  const allPLs: { label: string; pl: PLLineItem[] }[] = [
    { label: "Subscriptions", pl: generateSubscriptionPL() },
    { label: "Party Orders", pl: generatePartyPL() },
    { label: "Instant Delivery", pl: generateInstantPL() },
    { label: "Home Services", pl: generateServicesPL() },
    { label: "Sweets & Snacks", pl: generateSnacksPL() },
    { label: "Cookery Classes", pl: generateCookeryPL() },
    { label: "Shero Classes", pl: generateSheroClassesPL() },
  ];

  const getVal = (pl: PLLineItem[], label: string) => pl.find(l => l.label === label)?.amount || 0;

  const netRev = allPLs.reduce((s, v) => s + getVal(v.pl, "NET REVENUE"), 0);
  const totalDirect = allPLs.reduce((s, v) => s + getVal(v.pl, "TOTAL DIRECT COSTS"), 0);
  const cm1 = netRev + totalDirect;
  const totalIndirect = allPLs.reduce((s, v) => s + getVal(v.pl, "TOTAL INDIRECT EXPENSES"), 0);
  const cm15 = cm1 + totalIndirect;

  return [
    { label: "CONSOLIDATED P&L — ALL SUB-VERTICALS", amount: 0, type: "header" },
    { label: "", amount: 0, type: "header" },
    ...allPLs.map(v => ({ label: `Net Revenue — ${v.label}`, amount: getVal(v.pl, "NET REVENUE"), type: "revenue" as const, indent: 1 })),
    { label: "TOTAL NET REVENUE", amount: netRev, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    ...allPLs.map(v => ({ label: `Direct Costs — ${v.label}`, amount: getVal(v.pl, "TOTAL DIRECT COSTS"), type: "expense" as const, indent: 1 })),
    { label: "TOTAL DIRECT COSTS", amount: totalDirect, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1 (CM1)", amount: cm1, type: "subtotal", bold: true },
    { label: "CM1 Margin %", amount: Math.round(cm1 / netRev * 1000) / 10, type: "subtotal" },
    { label: "", amount: 0, type: "header" },
    ...allPLs.map(v => ({ label: `Indirect Expenses — ${v.label}`, amount: getVal(v.pl, "TOTAL INDIRECT EXPENSES"), type: "expense" as const, indent: 1 })),
    { label: "TOTAL INDIRECT EXPENSES", amount: totalIndirect, type: "subtotal", bold: true },
    { label: "", amount: 0, type: "header" },
    { label: "CONTRIBUTION MARGIN 1.5 (CM1.5)", amount: cm15, type: "subtotal", bold: true },
    { label: "CM1.5 Margin %", amount: Math.round(cm15 / netRev * 1000) / 10, type: "subtotal" },
  ];
}
