// ═══════════════════════════════════════════════════════════════════════
// SHERO Debit-Credit Engine — Support Centre
// Partner debits (penalties) ↔ Customer credits (refunds/compensation)
// With foolproof dual-approval, ceiling limits, audit trail, journal entries
// ═══════════════════════════════════════════════════════════════════════

import type { AdminRole } from "@/data/adminRoles";
import type { VoucherType, SubVertical, LedgerAccount } from "@/data/financeEngine";

// ── Role Tiers & Ceiling Limits ──

export type ApprovalTier = "executive" | "team_leader" | "manager" | "leadership";

export const CEILING_LIMITS: Record<ApprovalTier, number> = {
  executive: 500,
  team_leader: 2000,
  manager: 5000,
  leadership: Infinity,
};

export const TIER_LABELS: Record<ApprovalTier, string> = {
  executive: "Executive (≤$500)",
  team_leader: "Team Leader (≤$2,000)",
  manager: "Manager (≤$5,000)",
  leadership: "Leadership (Unlimited)",
};

export function getApprovalTier(role: AdminRole): ApprovalTier {
  const map: Partial<Record<AdminRole, ApprovalTier>> = {
    super_admin: "leadership", country_manager: "leadership", vertical_head: "leadership",
    regional_manager: "manager", ops_manager: "manager", onboarding_manager: "manager",
    hr_manager: "manager", finance_manager: "manager", shf_manager: "manager",
    hcf_manager: "manager", spc_manager: "manager", ssc_manager: "manager", party_manager: "manager",
    kobtl: "team_leader", sap_onboarding_tl: "team_leader", spc_tl: "team_leader",
    ssc_tl: "team_leader", ppp_tl: "team_leader", party_tl: "team_leader",
    kob_executive: "executive", ssc_executor: "executive", ppp_executor: "executive",
    party_executive: "executive", asst_manager: "team_leader",
  };
  return map[role] ?? "executive";
}

export function canApproveAmount(tier: ApprovalTier, amount: number): boolean {
  return amount <= CEILING_LIMITS[tier];
}

export function getRequiredApprover(amount: number): ApprovalTier {
  if (amount <= 500) return "executive";
  if (amount <= 2000) return "team_leader";
  if (amount <= 5000) return "manager";
  return "leadership";
}

// ── Debit/Credit Reason Codes ──

export type DebitReasonCode =
  | "bad_feedback" | "bad_order_quality" | "late_delivery_partner" | "order_rejection"
  | "hygiene_violation" | "customer_complaint" | "missing_items" | "wrong_order"
  | "no_show_delivery" | "repeated_offence" | "policy_violation";

export type CreditReasonCode =
  | "refund_bad_quality" | "refund_late_delivery" | "compensation_missing_items"
  | "compensation_wrong_order" | "goodwill_credit" | "wallet_credit"
  | "replacement_order" | "coupon_issuance" | "escalation_compensation"
  | "partial_refund";

export type SupportVoucherCode =
  | "goodwill_gesture" | "replacement_meal" | "priority_redelivery"
  | "free_upgrade" | "loyalty_bonus" | "festive_credit" | "referral_bonus_adjustment";

export const DEBIT_REASONS: Record<DebitReasonCode, { label: string; defaultAmount: number; severity: "low" | "medium" | "high" | "critical" }> = {
  bad_feedback: { label: "Bad Customer Feedback (1-2★)", defaultAmount: 100, severity: "medium" },
  bad_order_quality: { label: "Poor Food Quality", defaultAmount: 200, severity: "high" },
  late_delivery_partner: { label: "Late Delivery (Partner fault)", defaultAmount: 50, severity: "low" },
  order_rejection: { label: "Order Rejection by Partner", defaultAmount: 150, severity: "medium" },
  hygiene_violation: { label: "Hygiene / FSSAI Violation", defaultAmount: 500, severity: "critical" },
  customer_complaint: { label: "Formal Customer Complaint", defaultAmount: 150, severity: "medium" },
  missing_items: { label: "Missing Items in Order", defaultAmount: 100, severity: "medium" },
  wrong_order: { label: "Wrong Order Delivered", defaultAmount: 250, severity: "high" },
  no_show_delivery: { label: "No-Show / Failed Pickup", defaultAmount: 200, severity: "high" },
  repeated_offence: { label: "Repeated Offence Penalty", defaultAmount: 500, severity: "critical" },
  policy_violation: { label: "Platform Policy Violation", defaultAmount: 300, severity: "high" },
};

export const CREDIT_REASONS: Record<CreditReasonCode, { label: string; defaultAmount: number }> = {
  refund_bad_quality: { label: "Refund — Bad Quality", defaultAmount: 200 },
  refund_late_delivery: { label: "Refund — Late Delivery", defaultAmount: 100 },
  compensation_missing_items: { label: "Compensation — Missing Items", defaultAmount: 150 },
  compensation_wrong_order: { label: "Compensation — Wrong Order", defaultAmount: 250 },
  goodwill_credit: { label: "Goodwill Credit", defaultAmount: 100 },
  wallet_credit: { label: "Wallet Credit", defaultAmount: 75 },
  replacement_order: { label: "Replacement Order Value", defaultAmount: 200 },
  coupon_issuance: { label: "Coupon / Discount Code", defaultAmount: 50 },
  escalation_compensation: { label: "Escalation Compensation", defaultAmount: 300 },
  partial_refund: { label: "Partial Refund", defaultAmount: 100 },
};

export const SUPPORT_VOUCHER_REASONS: Record<SupportVoucherCode, { label: string; defaultAmount: number }> = {
  goodwill_gesture: { label: "Goodwill Gesture", defaultAmount: 100 },
  replacement_meal: { label: "Replacement Meal", defaultAmount: 150 },
  priority_redelivery: { label: "Priority Re-delivery", defaultAmount: 75 },
  free_upgrade: { label: "Free Upgrade", defaultAmount: 50 },
  loyalty_bonus: { label: "Loyalty Bonus", defaultAmount: 200 },
  festive_credit: { label: "Festive Season Credit", defaultAmount: 100 },
  referral_bonus_adjustment: { label: "Referral Bonus Adjustment", defaultAmount: 50 },
};

// ── Core Types ──

export type DCEntryStatus = "draft" | "pending_approval" | "approved" | "rejected" | "reversed" | "disbursed";

export interface DebitNote {
  id: string;
  date: string;
  partnerId: string;
  partnerName: string;
  kitchenId: string;
  orderId: string;
  reason: DebitReasonCode;
  severity: "low" | "medium" | "high" | "critical";
  amount: number;
  gstAmount: number;
  netAmount: number;
  description: string;
  status: DCEntryStatus;
  linkedCreditNoteId: string | null;
  linkedJournalId: string | null;
  raisedBy: string;
  raisedByRole: string;
  approvedBy: string | null;
  approvedByRole: string | null;
  createdAt: string;
  updatedAt: string;
  subVertical: SubVertical;
  evidenceUrls: string[];
  voucherId: string;
}

export interface CreditNote {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderId: string;
  reason: CreditReasonCode;
  amount: number;
  creditType: "wallet" | "refund" | "coupon" | "replacement";
  description: string;
  status: DCEntryStatus;
  linkedDebitNoteId: string;
  linkedJournalId: string | null;
  raisedBy: string;
  raisedByRole: string;
  approvedBy: string | null;
  approvedByRole: string | null;
  createdAt: string;
  updatedAt: string;
  subVertical: SubVertical;
  voucherId: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  debitAccount: string;
  debitAccountLabel: string;
  debitAmount: number;
  creditAccount: string;
  creditAccountLabel: string;
  creditAmount: number;
  narration: string;
  linkedDebitNoteId: string | null;
  linkedCreditNoteId: string | null;
  status: "posted" | "pending" | "reversed";
  subVertical: SubVertical;
  voucherId: string;
  createdAt: string;
}

export interface SupportVoucher {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  orderId: string;
  reason: SupportVoucherCode;
  amount: number;
  description: string;
  status: DCEntryStatus;
  raisedBy: string;
  raisedByRole: string;
  approvedBy: string | null;
  createdAt: string;
  subVertical: SubVertical;
  voucherId: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: "created" | "approved" | "rejected" | "reversed" | "disbursed" | "modified";
  entityType: "debit_note" | "credit_note" | "journal" | "support_voucher";
  entityId: string;
  performedBy: string;
  performedByRole: string;
  previousStatus: string;
  newStatus: string;
  amount: number;
  notes: string;
}

export interface PartnerLedgerRow {
  date: string;
  voucherId: string;
  type: "PPP_Credit" | "Debit_Note" | "Penalty" | "Bonus" | "TDS";
  description: string;
  debit: number;
  credit: number;
  balance: number;
  orderId: string;
}

export interface CustomerLedgerRow {
  date: string;
  voucherId: string;
  type: "Order_Payment" | "Credit_Note" | "Wallet_Credit" | "Refund" | "Coupon";
  description: string;
  debit: number;
  credit: number;
  balance: number;
  orderId: string;
}

// ── Mock Data Generation ──

const partners = [
  { id: "P001", name: "Chef Lakshmi", kitchen: "K-CHN-001" },
  { id: "P002", name: "Chef Kamala", kitchen: "K-BLR-002" },
  { id: "P003", name: "Chef Meena", kitchen: "K-HYD-003" },
  { id: "P004", name: "Chef Saroja", kitchen: "K-MAA-004" },
  { id: "P005", name: "Chef Fathima", kitchen: "K-COK-005" },
  { id: "P006", name: "Chef Raheema", kitchen: "K-VIZ-006" },
];

const customers = [
  { id: "C001", name: "Priya Reddy", phone: "9876543210" },
  { id: "C002", name: "Arun Kumar", phone: "9876543211" },
  { id: "C003", name: "Divya Menon", phone: "9876543212" },
  { id: "C004", name: "Raj Sharma", phone: "9876543213" },
  { id: "C005", name: "Lakshmi Nair", phone: "9876543214" },
  { id: "C006", name: "Kavitha Iyer", phone: "9876543215" },
];

const agents = [
  { name: "Anitha S", role: "ssc_executor" },
  { name: "Deepa R", role: "ssc_tl" },
  { name: "Karthik M", role: "ssc_manager" },
  { name: "Sundar V", role: "vertical_head" },
];

const subVerticals: SubVertical[] = ["instant", "subscription", "party", "services"];

let seq = 100;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().split("T")[0];
}

// Generate linked debit-credit pairs
export function generateDebitNotes(): DebitNote[] {
  const debitReasonKeys = Object.keys(DEBIT_REASONS) as DebitReasonCode[];
  const notes: DebitNote[] = [];

  for (let i = 0; i < 25; i++) {
    const partner = partners[i % partners.length];
    const reason = debitReasonKeys[i % debitReasonKeys.length];
    const reasonCfg = DEBIT_REASONS[reason];
    const amount = reasonCfg.defaultAmount + Math.round((Math.random() - 0.3) * 100);
    const date = randomDate(45);
    const sv = subVerticals[i % 4];
    const agent = agents[i % agents.length];
    const statuses: DCEntryStatus[] = ["approved", "approved", "disbursed", "pending_approval", "approved", "reversed"];
    const status = statuses[i % statuses.length];
    const approver = status !== "pending_approval" && status !== "draft" ? agents[(i + 1) % agents.length] : null;

    const dnId = nextId("DN");
    const cnId = nextId("CN");
    const jrnId = nextId("JRN");

    notes.push({
      id: dnId, date, partnerId: partner.id, partnerName: partner.name, kitchenId: partner.kitchen,
      orderId: `ORD-${2000 + i}`, reason, severity: reasonCfg.severity, amount, gstAmount: Math.round(amount * 0.05),
      netAmount: Math.round(amount * 1.05), description: `${reasonCfg.label} — Order #ORD-${2000 + i}`,
      status, linkedCreditNoteId: cnId, linkedJournalId: jrnId,
      raisedBy: agent.name, raisedByRole: agent.role,
      approvedBy: approver?.name || null, approvedByRole: approver?.role || null,
      createdAt: date, updatedAt: date, subVertical: sv,
      evidenceUrls: i % 3 === 0 ? ["screenshot_feedback.jpg"] : [], voucherId: `V-${dnId}`,
    });
  }
  return notes;
}

export function generateCreditNotes(debitNotes: DebitNote[]): CreditNote[] {
  const creditReasonKeys = Object.keys(CREDIT_REASONS) as CreditReasonCode[];
  const creditTypes: CreditNote["creditType"][] = ["wallet", "refund", "coupon", "replacement"];

  return debitNotes.map((dn, i) => {
    const customer = customers[i % customers.length];
    const reason = creditReasonKeys[i % creditReasonKeys.length];
    const agent = agents[i % agents.length];
    const approver = dn.status !== "pending_approval" && dn.status !== "draft" ? agents[(i + 1) % agents.length] : null;
    const cnId = dn.linkedCreditNoteId!;

    return {
      id: cnId, date: dn.date, customerId: customer.id, customerName: customer.name,
      customerPhone: customer.phone, orderId: dn.orderId, reason,
      amount: dn.amount, creditType: creditTypes[i % 4],
      description: `Credit to ${customer.name} — linked to ${dn.id}`,
      status: dn.status, linkedDebitNoteId: dn.id, linkedJournalId: dn.linkedJournalId,
      raisedBy: agent.name, raisedByRole: agent.role,
      approvedBy: approver?.name || null, approvedByRole: approver?.role || null,
      createdAt: dn.date, updatedAt: dn.date, subVertical: dn.subVertical, voucherId: `V-${cnId}`,
    };
  });
}

export function generateJournalEntries(debitNotes: DebitNote[]): JournalEntry[] {
  return debitNotes.filter(dn => dn.linkedJournalId).map((dn, i) => ({
    id: dn.linkedJournalId!,
    date: dn.date,
    debitAccount: "expense_customer_support",
    debitAccountLabel: "Customer Support Expense A/c",
    debitAmount: dn.amount,
    creditAccount: "accounts_payable_partner",
    creditAccountLabel: "Sundry Creditors — Partners",
    creditAmount: dn.amount,
    narration: `Partner penalty ${dn.id} ↔ Customer credit ${dn.linkedCreditNoteId} — ${dn.description}`,
    linkedDebitNoteId: dn.id,
    linkedCreditNoteId: dn.linkedCreditNoteId,
    status: dn.status === "reversed" ? "reversed" : "posted",
    subVertical: dn.subVertical,
    voucherId: `V-${dn.linkedJournalId}`,
    createdAt: dn.date,
  }));
}

export function generateSupportVouchers(): SupportVoucher[] {
  const reasonKeys = Object.keys(SUPPORT_VOUCHER_REASONS) as SupportVoucherCode[];
  const vouchers: SupportVoucher[] = [];

  for (let i = 0; i < 12; i++) {
    const customer = customers[i % customers.length];
    const reason = reasonKeys[i % reasonKeys.length];
    const reasonCfg = SUPPORT_VOUCHER_REASONS[reason];
    const agent = agents[i % agents.length];
    const statuses: DCEntryStatus[] = ["approved", "pending_approval", "disbursed", "approved"];

    vouchers.push({
      id: nextId("SV"),
      date: randomDate(30),
      customerId: customer.id,
      customerName: customer.name,
      orderId: `ORD-${3000 + i}`,
      reason,
      amount: reasonCfg.defaultAmount,
      description: `${reasonCfg.label} for ${customer.name}`,
      status: statuses[i % 4],
      raisedBy: agent.name,
      raisedByRole: agent.role,
      approvedBy: i % 2 === 0 ? agents[(i + 1) % agents.length].name : null,
      createdAt: randomDate(30),
      subVertical: subVerticals[i % 4],
      voucherId: `V-SV-${i}`,
    });
  }
  return vouchers;
}

export function generateAuditLog(
  debitNotes: DebitNote[], creditNotes: CreditNote[], journals: JournalEntry[], supportVouchers: SupportVoucher[]
): AuditLogEntry[] {
  const log: AuditLogEntry[] = [];

  debitNotes.forEach(dn => {
    log.push({
      id: nextId("AUD"), timestamp: `${dn.date}T09:30:00`, action: "created",
      entityType: "debit_note", entityId: dn.id, performedBy: dn.raisedBy,
      performedByRole: dn.raisedByRole, previousStatus: "—", newStatus: "pending_approval",
      amount: dn.amount, notes: `Debit note raised: ${dn.description}`,
    });
    if (dn.status !== "pending_approval" && dn.status !== "draft") {
      log.push({
        id: nextId("AUD"), timestamp: `${dn.date}T11:00:00`, action: "approved",
        entityType: "debit_note", entityId: dn.id, performedBy: dn.approvedBy || "System",
        performedByRole: dn.approvedByRole || "—", previousStatus: "pending_approval",
        newStatus: dn.status, amount: dn.amount, notes: `Approved by ${dn.approvedBy}`,
      });
    }
    if (dn.status === "reversed") {
      log.push({
        id: nextId("AUD"), timestamp: `${dn.date}T14:00:00`, action: "reversed",
        entityType: "debit_note", entityId: dn.id, performedBy: "Sundar V",
        performedByRole: "vertical_head", previousStatus: "approved",
        newStatus: "reversed", amount: dn.amount, notes: "Reversed by leadership — partner dispute accepted",
      });
    }
  });

  creditNotes.forEach(cn => {
    log.push({
      id: nextId("AUD"), timestamp: `${cn.date}T09:35:00`, action: "created",
      entityType: "credit_note", entityId: cn.id, performedBy: cn.raisedBy,
      performedByRole: cn.raisedByRole, previousStatus: "—", newStatus: "pending_approval",
      amount: cn.amount, notes: `Credit note auto-linked to ${cn.linkedDebitNoteId}`,
    });
  });

  supportVouchers.forEach(sv => {
    log.push({
      id: nextId("AUD"), timestamp: `${sv.date}T10:00:00`, action: "created",
      entityType: "support_voucher", entityId: sv.id, performedBy: sv.raisedBy,
      performedByRole: sv.raisedByRole, previousStatus: "—", newStatus: "pending_approval",
      amount: sv.amount, notes: `Support voucher: ${sv.description}`,
    });
  });

  return log.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ── Partner Ledger (PPP earned, debits, credits, net payable) ──

export function generatePartnerLedger(partnerId: string, debitNotes: DebitNote[]): PartnerLedgerRow[] {
  const rows: PartnerLedgerRow[] = [];
  let balance = 0;

  // PPP earnings (simulated)
  const pppDays = 30;
  for (let d = pppDays; d >= 1; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];
    const ppp = 150 + Math.round(Math.random() * 200);
    balance += ppp;
    rows.push({
      date: dateStr, voucherId: `PPP-${partnerId}-D${d}`, type: "PPP_Credit",
      description: `Daily PPP earnings`, debit: 0, credit: ppp, balance, orderId: `ORD-BATCH-D${d}`,
    });
  }

  // Debits from debit notes
  debitNotes.filter(dn => dn.partnerId === partnerId && dn.status !== "reversed").forEach(dn => {
    balance -= dn.amount;
    rows.push({
      date: dn.date, voucherId: dn.voucherId, type: "Debit_Note",
      description: `${DEBIT_REASONS[dn.reason].label} — ${dn.orderId}`,
      debit: dn.amount, credit: 0, balance, orderId: dn.orderId,
    });
  });

  // TDS deduction (1% of total PPP)
  const totalPPP = rows.filter(r => r.type === "PPP_Credit").reduce((s, r) => s + r.credit, 0);
  const tds = Math.round(totalPPP * 0.01);
  balance -= tds;
  rows.push({
    date: new Date().toISOString().split("T")[0], voucherId: `TDS-${partnerId}`, type: "TDS",
    description: "TDS @1% on PPP earnings", debit: tds, credit: 0, balance, orderId: "—",
  });

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

export function generateCustomerLedger(customerId: string, creditNotes: CreditNote[]): CustomerLedgerRow[] {
  const rows: CustomerLedgerRow[] = [];
  let balance = 0;

  // Orders (simulated)
  for (let d = 30; d >= 1; d -= 3) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];
    const amt = 150 + Math.round(Math.random() * 300);
    balance -= amt;
    rows.push({
      date: dateStr, voucherId: `INV-${customerId}-D${d}`, type: "Order_Payment",
      description: "Meal order payment", debit: amt, credit: 0, balance, orderId: `ORD-CUST-D${d}`,
    });
  }

  // Credits
  creditNotes.filter(cn => cn.customerId === customerId && cn.status !== "reversed").forEach(cn => {
    balance += cn.amount;
    rows.push({
      date: cn.date, voucherId: cn.voucherId, type: "Credit_Note",
      description: `${CREDIT_REASONS[cn.reason].label} — ${cn.orderId}`,
      debit: 0, credit: cn.amount, balance, orderId: cn.orderId,
    });
  });

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

// ── Summary Stats ──

export function getDCSummary(debitNotes: DebitNote[], creditNotes: CreditNote[], supportVouchers: SupportVoucher[]) {
  const totalDebits = debitNotes.filter(d => d.status !== "reversed").reduce((s, d) => s + d.amount, 0);
  const totalCredits = creditNotes.filter(c => c.status !== "reversed").reduce((s, c) => s + c.amount, 0);
  const totalSV = supportVouchers.filter(s => s.status !== "rejected").reduce((s, v) => s + v.amount, 0);
  const pendingApproval = debitNotes.filter(d => d.status === "pending_approval").length + creditNotes.filter(c => c.status === "pending_approval").length;
  const reversedCount = debitNotes.filter(d => d.status === "reversed").length;
  const disbursedCredits = creditNotes.filter(c => c.status === "disbursed").reduce((s, c) => s + c.amount, 0);

  return {
    totalDebits, totalCredits, totalSV, pendingApproval, reversedCount, disbursedCredits,
    netImpact: totalCredits + totalSV,
    orphanedDebits: debitNotes.filter(d => !d.linkedCreditNoteId).length,
    orphanedCredits: creditNotes.filter(c => !c.linkedDebitNoteId).length,
  };
}
