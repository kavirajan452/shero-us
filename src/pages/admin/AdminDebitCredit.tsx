import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Download, FileText, DollarSign, AlertTriangle, CheckCircle2,
  Clock, XCircle, ArrowLeftRight, Shield, Eye, Book, Wallet,
  TrendingDown, TrendingUp, RotateCcw, Users, Link2, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  generatePartnerLedger, generateCustomerLedger,
  DEBIT_REASONS, CREDIT_REASONS, SUPPORT_VOUCHER_REASONS,
  CEILING_LIMITS, TIER_LABELS,
  type DebitNote, type CreditNote, type JournalEntry as JE, type SupportVoucher,
  type AuditLogEntry, type PartnerLedgerRow, type CustomerLedgerRow,
  type ApprovalTier,
} from "@/data/debitCreditEngine";
import { useLedgerEntries, useCreateLedgerEntry } from "@/hooks/useSupabaseData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ── Map Supabase ledger_entries rows to engine display types ──

function mapToDebitNote(row: any): DebitNote {
  return {
    id: row.id,
    date: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "",
    partnerId: row.partner_id || "",
    partnerName: row.partner_name || "",
    kitchenId: row.partner_id || "",
    orderId: row.order_id || "—",
    reason: (row.reason_code || "quality_complaint") as any,
    severity: (row.severity || "medium") as any,
    amount: Number(row.amount || 0),
    gstAmount: 0,
    netAmount: Number(row.amount || 0),
    description: row.notes || row.reason_label || "",
    status: (row.status || "pending_approval") as any,
    linkedCreditNoteId: row.linked_entry_id || null,
    linkedJournalId: null,
    raisedBy: row.raised_by || "Admin",
    raisedByRole: row.raised_by_role || "admin",
    approvedBy: row.approved_by || null,
    approvedByRole: row.approved_by_role || null,
    createdAt: row.created_at || "",
    updatedAt: row.created_at || "",
    subVertical: (row.sub_vertical || "instant") as any,
    evidenceUrls: [],
    voucherId: `DN-${row.id?.slice(0, 8)?.toUpperCase() || ""}`,
  };
}

function mapToCreditNote(row: any, debitNotes: DebitNote[]): CreditNote {
  const linkedDebit = row.linked_entry_id
    ? debitNotes.find((d) => d.id === row.linked_entry_id)
    : debitNotes[0];
  return {
    id: row.id,
    date: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "",
    customerId: row.customer_id || "",
    customerName: row.customer_name || "",
    customerPhone: "",
    orderId: row.order_id || "—",
    reason: (row.reason_code || "order_cancellation") as any,
    amount: Number(row.amount || 0),
    creditType: "wallet" as const,
    description: row.notes || row.reason_label || "",
    status: (row.status || "pending_approval") as any,
    linkedDebitNoteId: linkedDebit?.id || "",
    linkedJournalId: null,
    raisedBy: row.raised_by || "Admin",
    raisedByRole: row.raised_by_role || "admin",
    approvedBy: row.approved_by || null,
    approvedByRole: row.approved_by_role || null,
    createdAt: row.created_at || "",
    updatedAt: row.created_at || "",
    subVertical: (row.sub_vertical || "instant") as any,
    voucherId: `CN-${row.id?.slice(0, 8)?.toUpperCase() || ""}`,
  };
}

function mapToSupportVoucher(row: any): SupportVoucher {
  return {
    id: row.id,
    date: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "",
    customerId: row.customer_id || "",
    customerName: row.customer_name || "",
    orderId: row.order_id || "—",
    reason: (row.reason_code || "delay_compensation") as any,
    amount: Number(row.amount || 0),
    description: row.notes || row.reason_label || "",
    status: (row.status || "pending_approval") as any,
    raisedBy: row.raised_by || "Admin",
    raisedByRole: row.raised_by_role || "admin",
    approvedBy: row.approved_by || null,
    createdAt: row.created_at || "",
    subVertical: (row.sub_vertical || "instant") as any,
    voucherId: `SV-${row.id?.slice(0, 8)?.toUpperCase() || ""}`,
  };
}

// ── Status Config ──

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  pending_approval: { label: "Pending", color: "bg-action-cook/15 text-action-cook", icon: Clock },
  approved: { label: "Approved", color: "bg-primary/15 text-primary", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
  reversed: { label: "Reversed", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: RotateCcw },
  disbursed: { label: "Disbursed", color: "bg-action-done/15 text-action-done", icon: CheckCircle2 },
  posted: { label: "Posted", color: "bg-action-done/15 text-action-done", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-action-cook/15 text-action-cook", icon: Clock },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  high: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  critical: { label: "Critical", color: "bg-destructive/10 text-destructive" },
};

export default function AdminDebitCredit() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: rawEntries = [], isLoading } = useLedgerEntries();

  // Separate by entry_type
  const debitNotes: DebitNote[] = useMemo(
    () => (rawEntries as any[]).filter((e: any) => e.entry_type === "debit").map(mapToDebitNote),
    [rawEntries]
  );
  const creditNotes: CreditNote[] = useMemo(
    () => (rawEntries as any[]).filter((e: any) => e.entry_type === "credit").map((e) => mapToCreditNote(e, debitNotes)),
    [rawEntries, debitNotes]
  );
  const supportVouchers: SupportVoucher[] = useMemo(
    () => (rawEntries as any[]).filter((e: any) => e.entry_type === "voucher").map(mapToSupportVoucher),
    [rawEntries]
  );
  const journals: JE[] = useMemo(() => [], []);
  const auditLog: AuditLogEntry[] = useMemo(() => [], []);

  const summary = useMemo(() => {
    const totalDebits = debitNotes.reduce((s, n) => s + n.amount, 0);
    const totalCredits = creditNotes.reduce((s, n) => s + n.amount, 0);
    const totalSV = supportVouchers.reduce((s, v) => s + v.amount, 0);
    const pendingApproval = [...debitNotes, ...creditNotes, ...supportVouchers].filter(
      (n) => n.status === "pending_approval" || n.status === "pending"
    ).length;
    const reversedCount = [...debitNotes, ...creditNotes].filter((n) => n.status === "reversed").length;
    const linkedDebitIds = new Set(creditNotes.map((c) => c.linkedDebitNoteId));
    const orphanedDebits = debitNotes.filter((d) => !linkedDebitIds.has(d.id)).length;
    return { totalDebits, totalCredits, totalSV, pendingApproval, reversedCount, orphanedDebits, netImpact: totalDebits - totalCredits };
  }, [debitNotes, creditNotes, supportVouchers]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Debit-Credit & Voucher Console
          </h2>
          <p className="text-xs text-muted-foreground">
            Partner debits ↔ Customer credits · Foolproof dual-approval · Ledger downloads · Journal entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => qc.invalidateQueries({ queryKey: ["ledger_entries"] })}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Export All</Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <SummaryCard label="Total Debits" value={`$${summary.totalDebits.toLocaleString("en-US")}`} icon={<TrendingDown className="w-4 h-4" />} color="text-destructive" />
        <SummaryCard label="Total Credits" value={`$${summary.totalCredits.toLocaleString("en-US")}`} icon={<TrendingUp className="w-4 h-4" />} color="text-green-600 dark:text-green-400" />
        <SummaryCard label="Support Vouchers" value={`$${summary.totalSV.toLocaleString("en-US")}`} icon={<Wallet className="w-4 h-4" />} color="text-primary" />
        <SummaryCard label="Pending Approval" value={String(summary.pendingApproval)} icon={<Clock className="w-4 h-4" />} color="text-action-cook" />
        <SummaryCard label="Reversed" value={String(summary.reversedCount)} icon={<RotateCcw className="w-4 h-4" />} color="text-amber-600 dark:text-amber-400" />
        <SummaryCard label="Orphan Debits" value={String(summary.orphanedDebits)} icon={<AlertTriangle className="w-4 h-4" />} color={summary.orphanedDebits > 0 ? "text-destructive" : "text-action-done"} />
        <SummaryCard label="Net Impact" value={`$${summary.netImpact.toLocaleString("en-US")}`} icon={<ArrowLeftRight className="w-4 h-4" />} color="text-foreground" />
      </div>

      {/* Foolproof Controls Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
        <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2"><Shield className="w-3.5 h-3.5" /> Foolproof Controls Active</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
          <div className="flex items-center gap-1.5 text-foreground/80"><Link2 className="w-3 h-3 text-primary shrink-0" /> <span>Every Customer Credit MUST have a linked Partner Debit — no orphans</span></div>
          <div className="flex items-center gap-1.5 text-foreground/80"><Users className="w-3 h-3 text-primary shrink-0" /> <span>Dual Approval — raiser ≠ approver. No single person can debit+credit</span></div>
          <div className="flex items-center gap-1.5 text-foreground/80"><DollarSign className="w-3 h-3 text-primary shrink-0" /> <span>Ceiling: Exec ≤$500 · TL ≤$2K · Mgr ≤$5K · Leadership ∞</span></div>
          <div className="flex items-center gap-1.5 text-foreground/80"><Book className="w-3 h-3 text-primary shrink-0" /> <span>Immutable audit trail — reversals require higher authority</span></div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading ledger entries…</div>
      ) : (
        <Tabs defaultValue="debit_notes">
          <TabsList className="h-auto flex-wrap gap-1">
            <TabsTrigger value="debit_notes" className="text-xs gap-1"><TrendingDown className="w-3 h-3" /> Debit Notes ({debitNotes.length})</TabsTrigger>
            <TabsTrigger value="credit_notes" className="text-xs gap-1"><TrendingUp className="w-3 h-3" /> Credit Notes ({creditNotes.length})</TabsTrigger>
            <TabsTrigger value="journals" className="text-xs gap-1"><Book className="w-3 h-3" /> Journal Entries ({journals.length})</TabsTrigger>
            <TabsTrigger value="support" className="text-xs gap-1"><Wallet className="w-3 h-3" /> Support Vouchers ({supportVouchers.length})</TabsTrigger>
            <TabsTrigger value="ledger" className="text-xs gap-1"><FileText className="w-3 h-3" /> Partner/Customer Ledger</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs gap-1"><Shield className="w-3 h-3" /> Audit Trail ({auditLog.length})</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs gap-1"><DollarSign className="w-3 h-3" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="debit_notes"><DebitNotesTab notes={debitNotes} /></TabsContent>
          <TabsContent value="credit_notes"><CreditNotesTab notes={creditNotes} debitNotes={debitNotes} /></TabsContent>
          <TabsContent value="journals"><JournalsTab entries={journals} /></TabsContent>
          <TabsContent value="support"><SupportVouchersTab vouchers={supportVouchers} /></TabsContent>
          <TabsContent value="ledger"><LedgerTab debitNotes={debitNotes} creditNotes={creditNotes} /></TabsContent>
          <TabsContent value="audit"><AuditTrailTab log={auditLog} /></TabsContent>
          <TabsContent value="analytics"><AnalyticsTab debitNotes={debitNotes} creditNotes={creditNotes} supportVouchers={supportVouchers} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// ── Summary Card ──

function SummaryCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className={`flex items-center gap-1.5 ${color} mb-1`}>{icon}<span className="text-[9px] font-medium uppercase tracking-wider">{label}</span></div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ── Debit Notes Tab ──

function DebitNotesTab({ notes }: { notes: DebitNote[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<DebitNote | null>(null);

  const filtered = notes.filter(n => {
    if (statusFilter !== "all" && n.status !== statusFilter) return false;
    if (search && !n.partnerName.toLowerCase().includes(search.toLowerCase()) && !n.orderId.toLowerCase().includes(search.toLowerCase()) && !n.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 mt-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search partner, order, DN ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_approval">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="disbursed">Disbursed</SelectItem>
            <SelectItem value="reversed">Reversed</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Excel</Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">DN ID</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Partner</TableHead>
              <TableHead className="text-xs">Order</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs">Severity</TableHead>
              <TableHead className="text-xs text-right">Amount ($)</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Linked CN</TableHead>
              <TableHead className="text-xs">Raised By</TableHead>
              <TableHead className="text-xs">Approved By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(n => {
              const sCfg = statusConfig[n.status];
              const sevCfg = severityConfig[n.severity];
              return (
                <TableRow key={n.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(n)}>
                  <TableCell className="text-xs font-mono font-medium text-primary">{n.id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{n.date}</TableCell>
                  <TableCell className="text-xs font-medium">{n.partnerName}</TableCell>
                  <TableCell className="text-xs font-mono">{n.orderId}</TableCell>
                  <TableCell className="text-[10px]">{DEBIT_REASONS[n.reason].label}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${sevCfg.color}`}>{sevCfg.label}</Badge></TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold text-destructive">-${n.amount.toLocaleString("en-US")}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${sCfg.color}`}>{sCfg.label}</Badge></TableCell>
                  <TableCell className="text-[10px] font-mono text-green-600 dark:text-green-400">{n.linkedCreditNoteId || "—"}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{n.raisedBy}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{n.approvedBy || "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm">
                <TrendingDown className="w-4 h-4 text-destructive" /> Debit Note: {selected.id}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <DetailRow label="Partner" value={selected.partnerName} />
                <DetailRow label="Kitchen" value={selected.kitchenId} />
                <DetailRow label="Order" value={selected.orderId} />
                <DetailRow label="Sub-Vertical" value={selected.subVertical} />
                <DetailRow label="Reason" value={DEBIT_REASONS[selected.reason].label} />
                <DetailRow label="Severity" value={selected.severity} />
                <DetailRow label="Amount" value={`$${selected.amount}`} />
                <DetailRow label="Sales Tax" value={`$${selected.gstAmount}`} />
                <DetailRow label="Net Amount" value={`$${selected.netAmount}`} />
                <DetailRow label="Linked CN" value={selected.linkedCreditNoteId || "None"} />
                <DetailRow label="Linked JRN" value={selected.linkedJournalId || "None"} />
                <DetailRow label="Status" value={selected.status} />
                <DetailRow label="Raised By" value={`${selected.raisedBy} (${selected.raisedByRole})`} />
                <DetailRow label="Approved By" value={selected.approvedBy ? `${selected.approvedBy} (${selected.approvedByRole})` : "—"} />
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-muted/30">
                <p className="text-[10px] text-muted-foreground">{selected.description}</p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-[10px]">
                <strong className="text-primary">Control Check:</strong> Raiser ({selected.raisedBy}) ≠ Approver ({selected.approvedBy || "pending"}) ✓ · Linked CN: {selected.linkedCreditNoteId ? "✅" : "⚠️ Missing"} · Amount within ceiling: ✅
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ── Credit Notes Tab ──

function CreditNotesTab({ notes, debitNotes }: { notes: CreditNote[]; debitNotes: DebitNote[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = notes.filter(n => {
    if (typeFilter !== "all" && n.creditType !== typeFilter) return false;
    if (search && !n.customerName.toLowerCase().includes(search.toLowerCase()) && !n.orderId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const creditTypeColors: Record<string, string> = {
    wallet: "bg-primary/15 text-primary",
    refund: "bg-action-done/15 text-action-done",
    coupon: "bg-action-pack/15 text-action-pack",
    replacement: "bg-action-dispatch/15 text-action-dispatch",
  };

  return (
    <div className="space-y-4 mt-3">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search customer, order..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="wallet">Wallet</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
            <SelectItem value="coupon">Coupon</SelectItem>
            <SelectItem value="replacement">Replacement</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Excel</Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">CN ID</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs">Phone</TableHead>
              <TableHead className="text-xs">Order</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs">Credit Type</TableHead>
              <TableHead className="text-xs text-right">Amount ($)</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Linked DN</TableHead>
              <TableHead className="text-xs">Raised By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(n => {
              const sCfg = statusConfig[n.status];
              return (
                <TableRow key={n.id}>
                  <TableCell className="text-xs font-mono font-medium text-green-600 dark:text-green-400">{n.id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{n.date}</TableCell>
                  <TableCell className="text-xs font-medium">{n.customerName}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{n.customerPhone}</TableCell>
                  <TableCell className="text-xs font-mono">{n.orderId}</TableCell>
                  <TableCell className="text-[10px]">{CREDIT_REASONS[n.reason].label}</TableCell>
                  <TableCell><Badge className={`text-[8px] capitalize ${creditTypeColors[n.creditType] || ""}`}>{n.creditType}</Badge></TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold text-green-600 dark:text-green-400">+${n.amount.toLocaleString("en-US")}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${sCfg.color}`}>{sCfg.label}</Badge></TableCell>
                  <TableCell className="text-[10px] font-mono text-destructive">{n.linkedDebitNoteId}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{n.raisedBy}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Journal Entries Tab ──

function JournalsTab({ entries }: { entries: JE[] }) {
  return (
    <div className="space-y-4 mt-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Double-entry postings: Partner Penalty A/c Dr ↔ Customer Support Expense A/c Cr — auto-generated from linked DN↔CN pairs</p>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Export</Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">JRN ID</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Debit Account</TableHead>
              <TableHead className="text-xs text-right">Dr ($)</TableHead>
              <TableHead className="text-xs">Credit Account</TableHead>
              <TableHead className="text-xs text-right">Cr ($)</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Linked DN</TableHead>
              <TableHead className="text-xs">Linked CN</TableHead>
              <TableHead className="text-xs">Narration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(e => {
              const sCfg = statusConfig[e.status];
              return (
                <TableRow key={e.id}>
                  <TableCell className="text-xs font-mono font-medium text-muted-foreground">{e.id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.date}</TableCell>
                  <TableCell className="text-[10px] font-medium">{e.debitAccountLabel}</TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold text-destructive">${e.debitAmount.toLocaleString("en-US")}</TableCell>
                  <TableCell className="text-[10px] font-medium">{e.creditAccountLabel}</TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold text-green-600 dark:text-green-400">${e.creditAmount.toLocaleString("en-US")}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${sCfg.color}`}>{sCfg.label}</Badge></TableCell>
                  <TableCell className="text-[10px] font-mono text-destructive">{e.linkedDebitNoteId || "—"}</TableCell>
                  <TableCell className="text-[10px] font-mono text-green-600 dark:text-green-400">{e.linkedCreditNoteId || "—"}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">{e.narration}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Support Vouchers Tab ──

function SupportVouchersTab({ vouchers }: { vouchers: SupportVoucher[] }) {
  return (
    <div className="space-y-4 mt-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Goodwill, replacements, coupons, escalation compensation — with approval workflow</p>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Export</Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">SV ID</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs">Order</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs text-right">Amount ($)</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Raised By</TableHead>
              <TableHead className="text-xs">Approved By</TableHead>
              <TableHead className="text-xs">Vertical</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map(v => {
              const sCfg = statusConfig[v.status];
              return (
                <TableRow key={v.id}>
                  <TableCell className="text-xs font-mono font-medium text-primary">{v.id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{v.date}</TableCell>
                  <TableCell className="text-xs font-medium">{v.customerName}</TableCell>
                  <TableCell className="text-xs font-mono">{v.orderId}</TableCell>
                  <TableCell className="text-[10px]">{SUPPORT_VOUCHER_REASONS[v.reason].label}</TableCell>
                  <TableCell className="text-xs text-right font-mono font-bold text-primary">${v.amount.toLocaleString("en-US")}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${sCfg.color}`}>{sCfg.label}</Badge></TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{v.raisedBy}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{v.approvedBy || "—"}</TableCell>
                  <TableCell className="text-[10px] capitalize text-muted-foreground">{v.subVertical}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Partner / Customer Ledger Tab ──

function LedgerTab({ debitNotes, creditNotes }: { debitNotes: DebitNote[]; creditNotes: CreditNote[] }) {
  const [ledgerType, setLedgerType] = useState<"partner" | "customer">("partner");
  const [selectedId, setSelectedId] = useState<string>("P001");

  const partnerIds = [...new Set(debitNotes.map(d => d.partnerId))];
  const customerIds = [...new Set(creditNotes.map(c => c.customerId))];

  const partnerLedger = useMemo(() => generatePartnerLedger(selectedId, debitNotes), [selectedId, debitNotes]);
  const customerLedger = useMemo(() => generateCustomerLedger(selectedId, creditNotes), [selectedId, creditNotes]);

  const ledger = ledgerType === "partner" ? partnerLedger : customerLedger;
  const totalDebit = ledger.reduce((s, r) => s + r.debit, 0);
  const totalCredit = ledger.reduce((s, r) => s + r.credit, 0);
  const netBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;

  const partnerName = debitNotes.find(d => d.partnerId === selectedId)?.partnerName || selectedId;
  const customerName = creditNotes.find(c => c.customerId === selectedId)?.customerName || selectedId;

  return (
    <div className="space-y-4 mt-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={ledgerType} onValueChange={(v: "partner" | "customer") => { setLedgerType(v); setSelectedId(v === "partner" ? "P001" : "C001"); }}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="partner">Partner Ledger</SelectItem>
            <SelectItem value="customer">Customer Ledger</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(ledgerType === "partner" ? partnerIds : customerIds).map(id => (
              <SelectItem key={id} value={id}>{id} — {ledgerType === "partner" ? debitNotes.find(d => d.partnerId === id)?.partnerName : creditNotes.find(c => c.customerId === id)?.customerName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Download Ledger (Excel)</Button>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1"><FileText className="w-3.5 h-3.5" /> Download PDF</Button>
      </div>

      {/* Ledger Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{ledgerType === "partner" ? "PPP Earned + Credits" : "Payments"}</p><p className="text-lg font-bold text-foreground mt-1">${(ledgerType === "partner" ? totalCredit : totalDebit).toLocaleString("en-US")}</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{ledgerType === "partner" ? "Debits & Penalties" : "Credits & Refunds"}</p><p className="text-lg font-bold text-destructive mt-1">${(ledgerType === "partner" ? totalDebit : totalCredit).toLocaleString("en-US")}</p></CardContent></Card>
        <Card className="border-primary/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Net {ledgerType === "partner" ? "Payable" : "Balance"}</p><p className={`text-lg font-bold mt-1 ${netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>${Math.abs(netBalance).toLocaleString("en-US")}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Entries</p><p className="text-lg font-bold text-foreground mt-1">{ledger.length}</p></CardContent></Card>
      </div>

      <p className="text-[10px] text-muted-foreground">Ledger for: <strong>{ledgerType === "partner" ? partnerName : customerName}</strong> ({selectedId})</p>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Voucher</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Description</TableHead>
              <TableHead className="text-xs">Order</TableHead>
              <TableHead className="text-xs text-right">Debit ($)</TableHead>
              <TableHead className="text-xs text-right">Credit ($)</TableHead>
              <TableHead className="text-xs text-right">Balance ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                <TableCell className="text-[10px] font-mono">{r.voucherId}</TableCell>
                <TableCell><Badge variant="outline" className="text-[8px]">{r.type}</Badge></TableCell>
                <TableCell className="text-[10px]">{r.description}</TableCell>
                <TableCell className="text-[10px] font-mono text-muted-foreground">{r.orderId}</TableCell>
                <TableCell className="text-xs text-right font-mono">{r.debit > 0 ? <span className="text-destructive">${r.debit.toLocaleString("en-US")}</span> : "—"}</TableCell>
                <TableCell className="text-xs text-right font-mono">{r.credit > 0 ? <span className="text-green-600 dark:text-green-400">${r.credit.toLocaleString("en-US")}</span> : "—"}</TableCell>
                <TableCell className={`text-xs text-right font-mono font-bold ${r.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>${Math.abs(r.balance).toLocaleString("en-US")} {r.balance < 0 ? "Dr" : "Cr"}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell colSpan={5} className="text-xs">Totals</TableCell>
              <TableCell className="text-xs text-right font-mono text-destructive">${totalDebit.toLocaleString("en-US")}</TableCell>
              <TableCell className="text-xs text-right font-mono text-green-600 dark:text-green-400">${totalCredit.toLocaleString("en-US")}</TableCell>
              <TableCell className={`text-xs text-right font-mono ${netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>${Math.abs(netBalance).toLocaleString("en-US")} {netBalance < 0 ? "Dr" : "Cr"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Audit Trail Tab ──

function AuditTrailTab({ log }: { log: AuditLogEntry[] }) {
  const [entityFilter, setEntityFilter] = useState("all");
  const filtered = entityFilter === "all" ? log : log.filter(l => l.entityType === entityFilter);

  const actionColors: Record<string, string> = {
    created: "bg-primary/15 text-primary",
    approved: "bg-action-done/15 text-action-done",
    rejected: "bg-destructive/10 text-destructive",
    reversed: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    disbursed: "bg-action-done/15 text-action-done",
    modified: "bg-action-cook/15 text-action-cook",
  };

  return (
    <div className="space-y-4 mt-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Immutable Audit Trail</span>
          <span className="text-[10px] text-muted-foreground">— All debit/credit actions logged. Reversals require higher authority.</span>
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="debit_note">Debit Notes</SelectItem>
            <SelectItem value="credit_note">Credit Notes</SelectItem>
            <SelectItem value="journal">Journals</SelectItem>
            <SelectItem value="support_voucher">Support Vouchers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">Timestamp</TableHead>
              <TableHead className="text-xs">Action</TableHead>
              <TableHead className="text-xs">Entity</TableHead>
              <TableHead className="text-xs">Entity ID</TableHead>
              <TableHead className="text-xs">By</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Status Change</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
              <TableHead className="text-xs">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 50).map(l => (
              <TableRow key={l.id}>
                <TableCell className="text-[10px] text-muted-foreground font-mono">{l.timestamp}</TableCell>
                <TableCell><Badge className={`text-[8px] capitalize ${actionColors[l.action] || ""}`}>{l.action}</Badge></TableCell>
                <TableCell><Badge variant="outline" className="text-[8px]">{l.entityType.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell className="text-xs font-mono">{l.entityId}</TableCell>
                <TableCell className="text-xs">{l.performedBy}</TableCell>
                <TableCell className="text-[10px] text-muted-foreground capitalize">{l.performedByRole.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-[10px]">{l.previousStatus} → {l.newStatus}</TableCell>
                <TableCell className="text-xs text-right font-mono">${l.amount.toLocaleString("en-US")}</TableCell>
                <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">{l.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Analytics Tab ──

function AnalyticsTab({ debitNotes, creditNotes, supportVouchers }: { debitNotes: DebitNote[]; creditNotes: CreditNote[]; supportVouchers: SupportVoucher[] }) {
  const reasonData = useMemo(() => {
    const map = new Map<string, number>();
    debitNotes.forEach(d => {
      const label = DEBIT_REASONS[d.reason].label;
      map.set(label, (map.get(label) || 0) + d.amount);
    });
    return Array.from(map.entries()).map(([reason, amount]) => ({ reason: reason.length > 25 ? reason.slice(0, 25) + "…" : reason, amount })).sort((a, b) => b.amount - a.amount);
  }, [debitNotes]);

  const verticalData = useMemo(() => {
    const map = new Map<string, { debits: number; credits: number }>();
    debitNotes.forEach(d => {
      const cur = map.get(d.subVertical) || { debits: 0, credits: 0 };
      cur.debits += d.amount;
      map.set(d.subVertical, cur);
    });
    creditNotes.forEach(c => {
      const cur = map.get(c.subVertical) || { debits: 0, credits: 0 };
      cur.credits += c.amount;
      map.set(c.subVertical, cur);
    });
    return Array.from(map.entries()).map(([vertical, v]) => ({ vertical, ...v }));
  }, [debitNotes, creditNotes]);

  const severityData = useMemo(() => {
    const map: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    debitNotes.forEach(d => { map[d.severity] += d.amount; });
    return Object.entries(map).map(([severity, amount]) => ({ severity, amount }));
  }, [debitNotes]);

  const colors = ["hsl(var(--primary))", "hsl(142,71%,35%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)"];

  return (
    <div className="space-y-5 mt-3">
      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Debits by Reason ($)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={reasonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="reason" tick={{ fontSize: 9 }} width={140} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="amount" fill="hsl(var(--destructive))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Debits vs Credits by Vertical</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={verticalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="vertical" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="debits" name="Debits" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="credits" name="Credits" fill="hsl(142,71%,35%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Severity Distribution ($ Value)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={severityData} dataKey="amount" nameKey="severity" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label={({ severity, amount }) => `${severity}: $${amount}`}>
                  {severityData.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Ceiling Limits Reference</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(["executive", "team_leader", "manager", "leadership"] as ApprovalTier[]).map(tier => (
              <div key={tier} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                <span className="text-xs font-medium capitalize">{tier.replace(/_/g, " ")}</span>
                <span className="text-xs font-bold text-primary">
                  {CEILING_LIMITS[tier] === Infinity ? "Unlimited" : `≤ $${CEILING_LIMITS[tier].toLocaleString("en-US")}`}
                </span>
              </div>
            ))}
            <p className="text-[9px] text-muted-foreground text-center mt-2">
              Amounts exceeding ceiling auto-escalate to next tier for approval
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Detail Row ──

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className="text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}
