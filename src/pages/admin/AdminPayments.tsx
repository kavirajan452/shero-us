import { useState, useMemo, useRef } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DollarSign, Upload, Download, Search, Eye, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, FileSpreadsheet, Calendar, CalendarIcon, Building2, MapPin, BarChart3,
  XCircle, Ban, PieChart, Wallet, Receipt, Users, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Lock, Unlock, FileDown, Stamp, Gift, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAdminRole } from "@/data/adminRoles";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";
import * as XLSX from "xlsx";

/* ── Types ── */

interface PartnerPaymentRecord {
  id: string;
  partnerName: string;
  rmn: string;
  state: string;
  city: string;
  cuisine: string;
  stream: "SHF" | "HCF";
  totalOrders: number;
  totalSales: number;
  totalPPP: number;
  penalties: number;
  netPayable: number;
  status: "pending" | "paid" | "on_hold";
  weekEnding: string;
}

interface PenaltyRecord {
  id: string;
  partnerName: string;
  rmn: string;
  orderId: string;
  reason: string;
  amount: number;
  date: string;
  type: "late_delivery" | "cancellation" | "quality_complaint" | "attendance" | "disciplinary";
}

interface BulkPaymentUpload {
  id: string;
  fileName: string;
  uploadedAt: Date;
  uploadedBy: string;
  partnerCount: number;
  totalAmount: number;
  status: "processing" | "completed" | "failed";
}

/* ── Mock Data ── */

const mockPaymentRecords: PartnerPaymentRecord[] = [
  { id: "PP-001", partnerName: "Sujatha M.", rmn: "+91 98765 43210", state: "Tamil Nadu", city: "Chennai", cuisine: "Chettinad", stream: "SHF", totalOrders: 42, totalSales: 18200, totalPPP: 11830, penalties: 150, netPayable: 11680, status: "pending", weekEnding: "2026-03-01" },
  { id: "PP-002", partnerName: "Priya K.", rmn: "+91 87654 32109", state: "Karnataka", city: "Bengaluru", cuisine: "North Indian", stream: "HCF", totalOrders: 28, totalSales: 12400, totalPPP: 8060, penalties: 0, netPayable: 8060, status: "pending", weekEnding: "2026-03-01" },
  { id: "PP-003", partnerName: "Lakshmi R.", rmn: "+91 76543 21098", state: "Telangana", city: "Hyderabad", cuisine: "Andhra", stream: "SHF", totalOrders: 55, totalSales: 24800, totalPPP: 16120, penalties: 500, netPayable: 15620, status: "paid", weekEnding: "2026-02-22" },
  { id: "PP-004", partnerName: "Meena S.", rmn: "+91 65432 10987", state: "Maharashtra", city: "Mumbai", cuisine: "Gujarati", stream: "HCF", totalOrders: 19, totalSales: 8200, totalPPP: 5330, penalties: 100, netPayable: 5230, status: "paid", weekEnding: "2026-02-22" },
  { id: "PP-005", partnerName: "Anita D.", rmn: "+91 54321 09876", state: "Delhi", city: "Delhi", cuisine: "Kerala", stream: "SHF", totalOrders: 35, totalSales: 16500, totalPPP: 10725, penalties: 0, netPayable: 10725, status: "on_hold", weekEnding: "2026-03-01" },
  { id: "PP-006", partnerName: "Padma V.", rmn: "+91 71234 56789", state: "Maharashtra", city: "Nagpur", cuisine: "Marathi", stream: "HCF", totalOrders: 22, totalSales: 9800, totalPPP: 6370, penalties: 250, netPayable: 6120, status: "pending", weekEnding: "2026-03-01" },
  { id: "PP-007", partnerName: "Saroja T.", rmn: "+91 61234 56789", state: "Tamil Nadu", city: "Coimbatore", cuisine: "Chettinad", stream: "SHF", totalOrders: 31, totalSales: 14200, totalPPP: 9230, penalties: 0, netPayable: 9230, status: "pending", weekEnding: "2026-03-01" },
  { id: "PP-008", partnerName: "Kamala R.", rmn: "+91 51234 56789", state: "Uttar Pradesh", city: "Lucknow", cuisine: "Mughlai", stream: "HCF", totalOrders: 17, totalSales: 7600, totalPPP: 4940, penalties: 25, netPayable: 4915, status: "paid", weekEnding: "2026-02-22" },
];

const mockPenalties: PenaltyRecord[] = [
  { id: "PEN-001", partnerName: "Sujatha M.", rmn: "+91 98765 43210", orderId: "SH4815", reason: "Order ready 18 min late (SLA: 10 min max)", amount: 50, date: "2026-02-28", type: "late_delivery" },
  { id: "PEN-002", partnerName: "Sujatha M.", rmn: "+91 98765 43210", orderId: "SH4790", reason: "Customer complaint — cold food & missing item", amount: 100, date: "2026-02-27", type: "quality_complaint" },
  { id: "PEN-003", partnerName: "Lakshmi R.", rmn: "+91 76543 21098", orderId: "SH4745", reason: "Partner-initiated cancellation after acceptance", amount: 500, date: "2026-02-24", type: "cancellation" },
  { id: "PEN-004", partnerName: "Meena S.", rmn: "+91 65432 10987", orderId: "—", reason: "Attendance violation — committed session missed without notice", amount: 100, date: "2026-02-26", type: "attendance" },
  { id: "PEN-005", partnerName: "Padma V.", rmn: "+91 71234 56789", orderId: "SH4802", reason: "3rd rejection this month — fine applied", amount: 250, date: "2026-02-25", type: "cancellation" },
  { id: "PEN-006", partnerName: "Kamala R.", rmn: "+91 51234 56789", orderId: "SH4810", reason: "Customer reported hygiene issue — refund deducted", amount: 25, date: "2026-02-27", type: "disciplinary" },
];

const mockBulkUploads: BulkPaymentUpload[] = [
  { id: "BU-001", fileName: "WeeklyPayout_Feb22.xlsx", uploadedAt: new Date("2026-02-23T09:30:00"), uploadedBy: "Ganesh R.", partnerCount: 42, totalAmount: 285000, status: "completed" },
  { id: "BU-002", fileName: "WeeklyPayout_Feb15.xlsx", uploadedAt: new Date("2026-02-16T10:15:00"), uploadedBy: "Vijay K.", partnerCount: 38, totalAmount: 252000, status: "completed" },
  { id: "BU-003", fileName: "WeeklyPayout_Feb08.xlsx", uploadedAt: new Date("2026-02-09T11:00:00"), uploadedBy: "Sudha M.", partnerCount: 35, totalAmount: 231000, status: "completed" },
  { id: "BU-004", fileName: "WeeklyPayout_Feb01.xlsx", uploadedAt: new Date("2026-02-02T09:45:00"), uploadedBy: "Ganesh R.", partnerCount: 33, totalAmount: 218000, status: "completed" },
];

const penaltyTypeConfig: Record<string, { label: string; color: string }> = {
  late_delivery: { label: "Late Delivery", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  cancellation: { label: "Cancellation", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  quality_complaint: { label: "Quality Issue", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  attendance: { label: "Attendance", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  disciplinary: { label: "Disciplinary", color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400" },
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  on_hold: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

/* ── Chart Data ── */
const weeklyPayoutTrend = [
  { week: "W1 Jan", mrp: 180000, ppp: 117000, penalties: 3200, netPayout: 113800 },
  { week: "W2 Jan", mrp: 195000, ppp: 126750, penalties: 2800, netPayout: 123950 },
  { week: "W3 Jan", mrp: 210000, ppp: 136500, penalties: 4100, netPayout: 132400 },
  { week: "W4 Jan", mrp: 205000, ppp: 133250, penalties: 3500, netPayout: 129750 },
  { week: "W1 Feb", mrp: 218000, ppp: 141700, penalties: 2900, netPayout: 138800 },
  { week: "W2 Feb", mrp: 231000, ppp: 150150, penalties: 3600, netPayout: 146550 },
  { week: "W3 Feb", mrp: 252000, ppp: 163800, penalties: 4200, netPayout: 159600 },
  { week: "W4 Feb", mrp: 285000, ppp: 185250, penalties: 5100, netPayout: 180150 },
];

const penaltyDistribution = [
  { name: "Late Delivery", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Cancellation", value: 28, color: "hsl(var(--chart-2))" },
  { name: "Quality Issue", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Attendance", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Disciplinary", value: 7, color: "hsl(var(--chart-5))" },
];

const stateRevenueData = [
  { state: "TN", mrp: 32400, ppp: 21060, partners: 2 },
  { state: "KA", mrp: 12400, ppp: 8060, partners: 1 },
  { state: "TS", mrp: 24800, ppp: 16120, partners: 1 },
  { state: "MH", mrp: 18000, ppp: 11700, partners: 2 },
  { state: "DL", mrp: 16500, ppp: 10725, partners: 1 },
  { state: "UP", mrp: 7600, ppp: 4940, partners: 1 },
];

const reconciliationData = [
  { week: "W1 Feb", processed: 33, onTime: 31, delayed: 2, disputed: 0 },
  { week: "W2 Feb", processed: 35, onTime: 33, delayed: 1, disputed: 1 },
  { week: "W3 Feb", processed: 38, onTime: 36, delayed: 2, disputed: 0 },
  { week: "W4 Feb", processed: 42, onTime: 39, delayed: 2, disputed: 1 },
];

const chartConfig = {
  mrp: { label: "MRP Sales", color: "hsl(var(--chart-1))" },
  ppp: { label: "PPP Payable", color: "hsl(var(--chart-2))" },
  penalties: { label: "Penalties", color: "hsl(var(--chart-3))" },
  netPayout: { label: "Net Payout", color: "hsl(var(--chart-4))" },
  processed: { label: "Processed", color: "hsl(var(--chart-1))" },
  onTime: { label: "On-Time", color: "hsl(var(--chart-2))" },
  delayed: { label: "Delayed", color: "hsl(var(--chart-3))" },
  disputed: { label: "Disputed", color: "hsl(var(--chart-5))" },
};

/* ── PPP Approval Data ── */

interface PayoutWeek {
  weekId: string;
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  status: "open" | "finance_approved" | "ops_approved" | "paid";
  financeApprover: string | null;
  financeApprovedAt: string | null;
  opsApprover: string | null;
  opsApprovedAt: string | null;
  partnerBreakdown: PayoutPartner[];
}

interface PayoutPartner {
  rmn: string;
  name: string;
  skid: string;
  stream: "SHF" | "HCF";
  state: string;
  city: string;
  cuisine: string;
  totalOrders: number;
  totalMRP: number;
  totalPPP: number;
  penalties: number;
  netPayable: number;
  pppRatio: number;
  bankName: string;
  accountNo: string;
  ifsc: string;
  upiId: string;
}

const mockOpenWeeks: PayoutWeek[] = [
  {
    weekId: "CW09-2026",
    weekLabel: "CW 09 — 24 Feb – 01 Mar 2026",
    weekStart: "2026-02-24",
    weekEnd: "2026-03-01",
    status: "open",
    financeApprover: null, financeApprovedAt: null, opsApprover: null, opsApprovedAt: null,
    partnerBreakdown: [
      { rmn: "+91 98765 43210", name: "Sujatha M.", skid: "SK-TN-001", stream: "SHF", state: "Tamil Nadu", city: "Chennai", cuisine: "Chettinad", totalOrders: 42, totalMRP: 18200, totalPPP: 11830, penalties: 150, netPayable: 11680, pppRatio: 65.0, bankName: "HDFC Bank", accountNo: "****7842", ifsc: "HDFC0001234", upiId: "sujatha@hdfc" },
      { rmn: "+91 87654 32109", name: "Priya K.", skid: "SK-KA-001", stream: "HCF", state: "Karnataka", city: "Bengaluru", cuisine: "North Indian", totalOrders: 28, totalMRP: 12400, totalPPP: 8060, penalties: 0, netPayable: 8060, pppRatio: 65.0, bankName: "SBI", accountNo: "****3291", ifsc: "SBIN0005678", upiId: "priya@sbi" },
      { rmn: "+91 54321 09876", name: "Anita D.", skid: "SK-DL-001", stream: "SHF", state: "Delhi", city: "Delhi", cuisine: "Kerala", totalOrders: 35, totalMRP: 16500, totalPPP: 10725, penalties: 0, netPayable: 10725, pppRatio: 65.0, bankName: "ICICI Bank", accountNo: "****5610", ifsc: "ICIC0009012", upiId: "anita@icici" },
      { rmn: "+91 71234 56789", name: "Padma V.", skid: "SK-MH-002", stream: "HCF", state: "Maharashtra", city: "Nagpur", cuisine: "Marathi", totalOrders: 22, totalMRP: 9800, totalPPP: 6370, penalties: 250, netPayable: 6120, pppRatio: 65.0, bankName: "Axis Bank", accountNo: "****8834", ifsc: "UTIB0003456", upiId: "padma@axis" },
      { rmn: "+91 61234 56789", name: "Saroja T.", skid: "SK-TN-002", stream: "SHF", state: "Tamil Nadu", city: "Coimbatore", cuisine: "Chettinad", totalOrders: 31, totalMRP: 14200, totalPPP: 9230, penalties: 0, netPayable: 9230, pppRatio: 65.0, bankName: "Indian Bank", accountNo: "****2215", ifsc: "IDIB0007890", upiId: "saroja@iob" },
    ],
  },
  {
    weekId: "CW08-2026",
    weekLabel: "CW 08 — 17 Feb – 23 Feb 2026",
    weekStart: "2026-02-17",
    weekEnd: "2026-02-23",
    status: "finance_approved",
    financeApprover: "Ganesh R.", financeApprovedAt: "24 Feb 2026, 10:30 AM", opsApprover: null, opsApprovedAt: null,
    partnerBreakdown: [
      { rmn: "+91 76543 21098", name: "Lakshmi R.", skid: "SK-TS-001", stream: "SHF", state: "Telangana", city: "Hyderabad", cuisine: "Andhra", totalOrders: 55, totalMRP: 24800, totalPPP: 16120, penalties: 500, netPayable: 15620, pppRatio: 65.0, bankName: "SBI", accountNo: "****6701", ifsc: "SBIN0001234", upiId: "lakshmi@sbi" },
      { rmn: "+91 65432 10987", name: "Meena S.", skid: "SK-MH-001", stream: "HCF", state: "Maharashtra", city: "Mumbai", cuisine: "Gujarati", totalOrders: 19, totalMRP: 8200, totalPPP: 5330, penalties: 100, netPayable: 5230, pppRatio: 65.0, bankName: "Kotak Bank", accountNo: "****4423", ifsc: "KKBK0005678", upiId: "meena@kotak" },
      { rmn: "+91 51234 56789", name: "Kamala R.", skid: "SK-UP-001", stream: "HCF", state: "Uttar Pradesh", city: "Lucknow", cuisine: "Mughlai", totalOrders: 17, totalMRP: 7600, totalPPP: 4940, penalties: 25, netPayable: 4915, pppRatio: 65.0, bankName: "PNB", accountNo: "****9087", ifsc: "PUNB0009012", upiId: "kamala@pnb" },
    ],
  },
  {
    weekId: "CW07-2026",
    weekLabel: "CW 07 — 10 Feb – 16 Feb 2026",
    weekStart: "2026-02-10",
    weekEnd: "2026-02-16",
    status: "ops_approved",
    financeApprover: "Ganesh R.", financeApprovedAt: "17 Feb 2026, 09:15 AM", opsApprover: "Kavitha R.", opsApprovedAt: "17 Feb 2026, 02:45 PM",
    partnerBreakdown: [
      { rmn: "+91 98765 43210", name: "Sujatha M.", skid: "SK-TN-001", stream: "SHF", state: "Tamil Nadu", city: "Chennai", cuisine: "Chettinad", totalOrders: 38, totalMRP: 16800, totalPPP: 10920, penalties: 0, netPayable: 10920, pppRatio: 65.0, bankName: "HDFC Bank", accountNo: "****7842", ifsc: "HDFC0001234", upiId: "sujatha@hdfc" },
      { rmn: "+91 87654 32109", name: "Priya K.", skid: "SK-KA-001", stream: "HCF", state: "Karnataka", city: "Bengaluru", cuisine: "North Indian", totalOrders: 25, totalMRP: 11200, totalPPP: 7280, penalties: 100, netPayable: 7180, pppRatio: 65.0, bankName: "SBI", accountNo: "****3291", ifsc: "SBIN0005678", upiId: "priya@sbi" },
    ],
  },
];

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

/* ── Component ── */

export default function AdminPayments() {
  const role = getAdminRole();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [streamFilter, setStreamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState<PartnerPaymentRecord | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // PPP Approval state
  const [payoutWeeks, setPayoutWeeks] = useState<PayoutWeek[]>(mockOpenWeeks);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [showApprovalConfirm, setShowApprovalConfirm] = useState<"finance" | "ops" | null>(null);

  const activeWeek = useMemo(() => payoutWeeks.find(w => w.weekId === selectedWeek), [payoutWeeks, selectedWeek]);

  const handleFinanceApprove = () => {
    setPayoutWeeks(prev => prev.map(w => w.weekId === selectedWeek ? { ...w, status: "finance_approved" as const, financeApprover: "Ganesh R.", financeApprovedAt: new Date().toLocaleString("en-US") } : w));
    setShowApprovalConfirm(null);
    toast({ title: "Finance Approved", description: `Week ${selectedWeek} approved by Finance Manager. Pending Ops Head approval.` });
  };

  const handleOpsApprove = () => {
    setPayoutWeeks(prev => prev.map(w => w.weekId === selectedWeek ? { ...w, status: "ops_approved" as const, opsApprover: "Kavitha R.", opsApprovedAt: new Date().toLocaleString("en-US") } : w));
    setShowApprovalConfirm(null);
    toast({ title: "Ops Head Approved", description: `Week ${selectedWeek} fully approved. Ready for bank download.` });
  };

  const handleDownloadBankFile = () => {
    if (!activeWeek) return;
    const rows = activeWeek.partnerBreakdown.map((p, i) => ({
      "Sl. No": i + 1,
      "Partner Name": p.name,
      "RMN": p.rmn,
      "SKID": p.skid,
      "Stream": p.stream,
      "State": p.state,
      "City": p.city,
      "Bank Name": p.bankName,
      "Account No": p.accountNo,
      "IFSC": p.ifsc,
      "UPI ID": p.upiId,
      "Total Orders": p.totalOrders,
      "MRP Sales ($)": p.totalMRP,
      "PPP Payable ($)": p.totalPPP,
      "Penalties ($)": p.penalties,
      "Net Payable ($)": p.netPayable,
      "PPP Ratio %": p.pppRatio,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BankPayout");
    XLSX.writeFile(wb, `PPP_BankPayout_${activeWeek.weekId}.xlsx`);
    toast({ title: "Excel Downloaded", description: `Bank payout file for ${activeWeek.weekId} downloaded successfully.` });
  };

  const states = [...new Set(mockPaymentRecords.map((p) => p.state))].sort();

  const filtered = useMemo(() => {
    return mockPaymentRecords.filter((p) => {
      if (stateFilter !== "all" && p.state !== stateFilter) return false;
      if (streamFilter !== "all" && p.stream !== streamFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (dateFrom && p.weekEnding < format(dateFrom, "yyyy-MM-dd")) return false;
      if (dateTo && p.weekEnding > format(dateTo, "yyyy-MM-dd")) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.partnerName.toLowerCase().includes(q) && !p.rmn.includes(search) && !p.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, stateFilter, streamFilter, statusFilter, dateFrom, dateTo]);

  const totalSales = filtered.reduce((s, p) => s + p.totalSales, 0);
  const totalPPP = filtered.reduce((s, p) => s + p.totalPPP, 0);
  const totalPenalties = filtered.reduce((s, p) => s + p.penalties, 0);
  const totalNet = filtered.reduce((s, p) => s + p.netPayable, 0);

  const handleBulkUpload = () => {
    toast({ title: "Payment File Uploaded", description: "Processing weekly payout file. Partners will see updated statements." });
    setShowBulkUpload(false);
  };

  const [activeVertical, setActiveVertical] = useState("all");
  
  const verticals = [
    { key: "all", label: "All Verticals" },
    { key: "instant", label: "Instant Delivery" },
    { key: "subscription", label: "Subscriptions" },
    { key: "party", label: "Party Orders" },
    { key: "services", label: "Home Services" },
  ];

  // Sub-vertical sales/PPP/expense summary
  const verticalSummary = [
    { key: "instant", label: "Instant Delivery", sales: 485000, ppp: 315250, delivery: 48500, gateway: 9700, overhead: 38800, cm1: 169750, cm15: 130950 },
    { key: "subscription", label: "Subscriptions", sales: 672000, ppp: 436800, delivery: 33600, gateway: 13440, overhead: 53760, cm1: 235200, cm15: 181440 },
    { key: "party", label: "Party Orders", sales: 520000, ppp: 338000, delivery: 26000, gateway: 10400, overhead: 41600, cm1: 182000, cm15: 140400 },
    { key: "services", label: "Home Services", sales: 96000, ppp: 62400, delivery: 4800, gateway: 1920, overhead: 7680, cm1: 33600, cm15: 25920 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PPP Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Triple P — Partner payments, reconciliation, penalties & financial reporting</p>
        </div>
        <Button onClick={() => setShowBulkUpload(true)} className="gap-1.5 text-xs">
          <Upload className="w-3.5 h-3.5" /> Bulk Payment Upload
        </Button>
      </div>

      {/* Sub-Vertical Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {verticals.map(v => (
          <Button key={v.key} variant={activeVertical === v.key ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setActiveVertical(v.key)}>
            {v.label}
          </Button>
        ))}
      </div>

      {/* Sub-Vertical Financial Summary Cards */}
      {activeVertical === "all" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {verticalSummary.map(vs => (
            <Card key={vs.key} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setActiveVertical(vs.key)}>
              <CardContent className="pt-4 space-y-1.5">
                <p className="text-sm font-semibold">{vs.label}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                  <span className="text-muted-foreground">Sales</span><span className="font-medium text-right">{formatCurrency(vs.sales)}</span>
                  <span className="text-muted-foreground">PPP Payout</span><span className="font-medium text-right">{formatCurrency(vs.ppp)}</span>
                  <span className="text-muted-foreground">Delivery</span><span className="font-medium text-right">{formatCurrency(vs.delivery)}</span>
                  <span className="text-muted-foreground">Gateway</span><span className="font-medium text-right">{formatCurrency(vs.gateway)}</span>
                  <span className="text-muted-foreground">CM1</span><span className="font-medium text-right text-green-600">{formatCurrency(vs.cm1)}</span>
                  <span className="text-muted-foreground">CM1.5</span><span className="font-medium text-right text-green-600">{formatCurrency(vs.cm15)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {(() => {
            const vs = verticalSummary.find(v => v.key === activeVertical) || verticalSummary[0];
            return [
              { label: "Sales", value: vs.sales },
              { label: "PPP Payout", value: vs.ppp },
              { label: "Delivery Cost", value: vs.delivery },
              { label: "Gateway Fee", value: vs.gateway },
              { label: "CM1", value: vs.cm1, color: "text-green-600" },
              { label: "CM1.5", value: vs.cm15, color: "text-green-600" },
            ].map(c => (
              <Card key={c.label}><CardContent className="pt-3">
                <p className="text-[10px] text-muted-foreground">{c.label}</p>
                <p className={`text-lg font-bold ${c.color || "text-foreground"}`}>{formatCurrency(c.value)}</p>
              </CardContent></Card>
            ));
          })()}
        </div>
      )}

      <Tabs defaultValue="daily_sales">
        <TabsList className="h-11 p-1 gap-1 flex-wrap">
          <TabsTrigger value="daily_sales" className="gap-2 text-xs px-4 py-2.5">
            <DollarSign className="w-4 h-4 shrink-0" /> Daily Sales
          </TabsTrigger>
          <TabsTrigger value="penalties" className="gap-2 text-xs px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" /> Penalties
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2 text-xs px-4 py-2.5">
            <FileSpreadsheet className="w-4 h-4 shrink-0" /> Payouts
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="gap-2 text-xs px-4 py-2.5">
            <Receipt className="w-4 h-4 shrink-0" /> Reconciliation
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2 text-xs px-4 py-2.5">
            <BarChart3 className="w-4 h-4 shrink-0" /> Reports & Stats
          </TabsTrigger>
          <TabsTrigger value="referral-payouts" className="gap-2 text-xs px-4 py-2.5">
            <Gift className="w-4 h-4 shrink-0" /> Referral Payouts
          </TabsTrigger>
          <TabsTrigger value="ppp_approval" className="gap-2 text-xs px-4 py-2.5">
            <Stamp className="w-4 h-4 shrink-0" /> PPP Approval
          </TabsTrigger>
        </TabsList>

        {/* ── Daily Sales Tab ── */}
        <TabsContent value="daily_sales" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card><CardContent className="p-4"><p className="text-[11px] text-muted-foreground">Total MRP Sales</p><p className="text-lg font-bold text-foreground">{formatCurrency(totalSales)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[11px] text-muted-foreground">Partner Payable (PPP)</p><p className="text-lg font-bold text-foreground">{formatCurrency(totalPPP)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[11px] text-muted-foreground">Total Penalties</p><p className="text-lg font-bold text-destructive">{formatCurrency(totalPenalties)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[11px] text-muted-foreground">Net Payable</p><p className="text-lg font-bold text-accent">{formatCurrency(totalNet)}</p></CardContent></Card>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search partner, RMN, ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
              </div>
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={streamFilter} onValueChange={setStreamFilter}>
              <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Stream" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="SHF">SHF</SelectItem>
                <SelectItem value="HCF">HCF</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 text-xs gap-1.5 min-w-[130px] justify-start">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {dateFrom ? format(dateFrom, "dd MMM") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 text-xs gap-1.5 min-w-[130px] justify-start">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {dateTo ? format(dateTo, "dd MMM") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold">Partner</TableHead>
                  <TableHead className="text-[10px] font-semibold">State / City</TableHead>
                  <TableHead className="text-[10px] font-semibold">Stream</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Orders</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">MRP Sales</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">PPP</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Penalties</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Net Payable</TableHead>
                  <TableHead className="text-[10px] font-semibold">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/20">
                    <TableCell className="py-2.5">
                      <p className="text-xs font-medium text-foreground">{p.partnerName}</p>
                      <p className="text-[10px] text-muted-foreground">{p.rmn}</p>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{p.state}<br />{p.city}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[9px]">{p.stream}</Badge></TableCell>
                    <TableCell className="text-xs text-right text-foreground">{p.totalOrders}</TableCell>
                    <TableCell className="text-xs text-right text-foreground">{formatCurrency(p.totalSales)}</TableCell>
                    <TableCell className="text-xs text-right text-foreground">{formatCurrency(p.totalPPP)}</TableCell>
                    <TableCell className="text-xs text-right">
                      {p.penalties > 0 ? <span className="text-destructive font-medium">-{formatCurrency(p.penalties)}</span> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-right font-semibold text-foreground">{formatCurrency(p.netPayable)}</TableCell>
                    <TableCell><Badge className={`${statusColors[p.status]} text-[9px] border-0 capitalize`}>{p.status === "on_hold" ? "On Hold" : p.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedPartner(p)}><Eye className="w-3.5 h-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Penalties Tab ── */}
        <TabsContent value="penalties" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(penaltyTypeConfig).map(([key, cfg]) => {
              const count = mockPenalties.filter((p) => p.type === key).length;
              const total = mockPenalties.filter((p) => p.type === key).reduce((s, p) => s + p.amount, 0);
              return (
                <Card key={key}><CardContent className="p-3">
                  <Badge className={`${cfg.color} text-[9px] border-0 mb-1.5`}>{cfg.label}</Badge>
                  <p className="text-sm font-bold text-foreground">{count} penalties</p>
                  <p className="text-[10px] text-destructive font-medium">{formatCurrency(total)}</p>
                </CardContent></Card>
              );
            })}
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold">Date</TableHead>
                  <TableHead className="text-[10px] font-semibold">Partner</TableHead>
                  <TableHead className="text-[10px] font-semibold">Order</TableHead>
                  <TableHead className="text-[10px] font-semibold">Type</TableHead>
                  <TableHead className="text-[10px] font-semibold">Reason</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPenalties.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-[10px] text-muted-foreground">{p.date}</TableCell>
                    <TableCell>
                      <p className="text-xs font-medium text-foreground">{p.partnerName}</p>
                      <p className="text-[10px] text-muted-foreground">{p.rmn}</p>
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-mono">{p.orderId}</TableCell>
                    <TableCell><Badge className={`${penaltyTypeConfig[p.type]?.color} text-[9px] border-0`}>{penaltyTypeConfig[p.type]?.label}</Badge></TableCell>
                    <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">{p.reason}</TableCell>
                    <TableCell className="text-xs text-right font-semibold text-destructive">-{formatCurrency(p.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Payout History Tab ── */}
        <TabsContent value="payouts" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card><CardContent className="p-4 flex items-center gap-3">
              <Wallet className="w-8 h-8 text-primary/70" />
              <div><p className="text-xl font-bold text-foreground">{mockBulkUploads.length}</p><p className="text-[10px] text-muted-foreground">Total Payouts</p></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-accent/70" />
              <div><p className="text-xl font-bold text-foreground">{formatCurrency(mockBulkUploads.reduce((s, b) => s + b.totalAmount, 0))}</p><p className="text-[10px] text-muted-foreground">Total Disbursed</p></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary/50" />
              <div><p className="text-xl font-bold text-foreground">{mockBulkUploads.reduce((s, b) => s + b.partnerCount, 0)}</p><p className="text-[10px] text-muted-foreground">Partners Paid</p></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600/70" />
              <div><p className="text-xl font-bold text-foreground">{mockBulkUploads.filter(b => b.status === "completed").length}/{mockBulkUploads.length}</p><p className="text-[10px] text-muted-foreground">Success Rate</p></div>
            </CardContent></Card>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold">File</TableHead>
                  <TableHead className="text-[10px] font-semibold">Uploaded By</TableHead>
                  <TableHead className="text-[10px] font-semibold">Date</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Partners</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Total Amount</TableHead>
                  <TableHead className="text-[10px] font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBulkUploads.map((bu) => (
                  <TableRow key={bu.id}>
                    <TableCell className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-primary" /> {bu.fileName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{bu.uploadedBy}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                      {bu.uploadedAt.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-xs text-right text-foreground">{bu.partnerCount}</TableCell>
                    <TableCell className="text-xs text-right font-semibold text-foreground">{formatCurrency(bu.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge className={`text-[9px] border-0 ${bu.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : bu.status === "processing" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"}`}>
                        {bu.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Reconciliation Tab ── */}
        <TabsContent value="reconciliation" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Total Processed</p>
              <p className="text-lg font-bold text-foreground">{reconciliationData.reduce((s, r) => s + r.processed, 0)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">On-Time Payments</p>
              <p className="text-lg font-bold text-foreground">{reconciliationData.reduce((s, r) => s + r.onTime, 0)}</p>
              <p className="text-[10px] text-green-600 flex items-center gap-0.5 mt-0.5"><ArrowUpRight className="w-3 h-3" /> 94.6%</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Delayed</p>
              <p className="text-lg font-bold text-amber-600">{reconciliationData.reduce((s, r) => s + r.delayed, 0)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Disputed</p>
              <p className="text-lg font-bold text-destructive">{reconciliationData.reduce((s, r) => s + r.disputed, 0)}</p>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Weekly Reconciliation Summary</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart data={reconciliationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="onTime" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="delayed" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="disputed" stackId="a" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Reconciliation Ledger</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold">Week</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Processed</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">On-Time</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Delayed</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Disputed</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Success %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliationData.map((r) => (
                    <TableRow key={r.week}>
                      <TableCell className="text-xs font-medium text-foreground">{r.week}</TableCell>
                      <TableCell className="text-xs text-right">{r.processed}</TableCell>
                      <TableCell className="text-xs text-right text-green-600">{r.onTime}</TableCell>
                      <TableCell className="text-xs text-right text-amber-600">{r.delayed}</TableCell>
                      <TableCell className="text-xs text-right text-destructive">{r.disputed}</TableCell>
                      <TableCell className="text-xs text-right font-semibold">{((r.onTime / r.processed) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Referral Payouts Tab ── */}
        <TabsContent value="referral-payouts" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Total Referral Payouts</p>
              <p className="text-lg font-bold text-foreground">$47,250</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Listed Rewards ($750)</p>
              <p className="text-lg font-bold text-blue-600">$15,750</p>
              <p className="text-[10px] text-muted-foreground">21 partners</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Active Rewards ($1,500)</p>
              <p className="text-lg font-bold text-green-600">$31,500</p>
              <p className="text-[10px] text-muted-foreground">21 partners</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Pending Payouts</p>
              <p className="text-lg font-bold text-amber-600">$3,750</p>
              <p className="text-[10px] text-muted-foreground">5 listed, awaiting active</p>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Referral Payout Ledger</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold">Date</TableHead>
                    <TableHead className="text-[10px] font-semibold">Referrer</TableHead>
                    <TableHead className="text-[10px] font-semibold">Referred Partner</TableHead>
                    <TableHead className="text-[10px] font-semibold">Milestone</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Amount</TableHead>
                    <TableHead className="text-[10px] font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { date: "Feb 22, 2026", referrer: "Meera (SHERO-MEERA24)", referred: "Radha Menon", milestone: "Listed", amount: 750, status: "paid" },
                    { date: "Feb 18, 2026", referrer: "Meera (SHERO-MEERA24)", referred: "Preethi Kumari", milestone: "Active", amount: 1500, status: "paid" },
                    { date: "Feb 18, 2026", referrer: "Meera (SHERO-MEERA24)", referred: "Preethi Kumari", milestone: "Listed", amount: 750, status: "paid" },
                    { date: "Feb 12, 2026", referrer: "Meera (SHERO-MEERA24)", referred: "Anjali Sharma", milestone: "Active", amount: 1500, status: "paid" },
                    { date: "Feb 12, 2026", referrer: "Meera (SHERO-MEERA24)", referred: "Anjali Sharma", milestone: "Listed", amount: 750, status: "paid" },
                    { date: "Feb 08, 2026", referrer: "Meera (SHERO-MEERA24)", referred: "Lakshmi Nair", milestone: "Active", amount: 1500, status: "paid" },
                    { date: "Jan 28, 2026", referrer: "Meera (SHERO-MEERA24)", referred: "Kavitha Rao", milestone: "Active", amount: 1500, status: "paid" },
                    { date: "Jan 22, 2026", referrer: "Meera (SHERO-MEERA24)", referred: "Sunita Devi", milestone: "Active", amount: 1500, status: "paid" },
                    { date: "Feb 26, 2026", referrer: "Meera (SHERO-MEERA24)", referred: "Deepa Gowda", milestone: "Listed", amount: 750, status: "pending" },
                    { date: "Feb 25, 2026", referrer: "Meera (SHERO-MEERA24)", referred: "Fatima Begum", milestone: "—", amount: 0, status: "awaiting" },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{row.date}</TableCell>
                      <TableCell className="text-xs font-medium">{row.referrer}</TableCell>
                      <TableCell className="text-xs">{row.referred}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${row.milestone === "Active" ? "bg-green-100 text-green-700 border-green-300" : row.milestone === "Listed" ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-muted text-muted-foreground"}`}>
                          {row.milestone}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-semibold">{row.amount > 0 ? `$${row.amount.toLocaleString()}` : "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] capitalize ${row.status === "paid" ? "bg-green-100 text-green-700 border-green-300" : row.status === "pending" ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-muted text-muted-foreground"}`}>
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Reports & Stats Tab ── */}
        <TabsContent value="reports" className="space-y-5 mt-5">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Total Revenue</p>
              <p className="text-base font-bold text-foreground">{formatCurrency(weeklyPayoutTrend.reduce((s, w) => s + w.mrp, 0))}</p>
              <p className="text-[9px] text-green-600 flex items-center justify-center gap-0.5"><ArrowUpRight className="w-2.5 h-2.5" /> +12.4%</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Total PPP Paid</p>
              <p className="text-base font-bold text-foreground">{formatCurrency(weeklyPayoutTrend.reduce((s, w) => s + w.netPayout, 0))}</p>
              <p className="text-[9px] text-green-600 flex items-center justify-center gap-0.5"><ArrowUpRight className="w-2.5 h-2.5" /> +10.8%</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Avg PPP Ratio</p>
              <p className="text-base font-bold text-foreground">65%</p>
              <p className="text-[9px] text-muted-foreground">Target: 65%</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Penalty Rate</p>
              <p className="text-base font-bold text-destructive">2.4%</p>
              <p className="text-[9px] text-green-600 flex items-center justify-center gap-0.5"><ArrowDownRight className="w-2.5 h-2.5" /> -0.3%</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Active Partners</p>
              <p className="text-base font-bold text-foreground">{mockPaymentRecords.length}</p>
              <p className="text-[9px] text-green-600 flex items-center justify-center gap-0.5"><ArrowUpRight className="w-2.5 h-2.5" /> +3</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Payout Cycle</p>
              <p className="text-base font-bold text-foreground">Weekly</p>
              <p className="text-[9px] text-muted-foreground">Every Saturday</p>
            </CardContent></Card>
          </div>

          {/* Weekly Payout Trend */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Weekly Payout Trend</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <AreaChart data={weeklyPayoutTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="mrp" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="netPayout" stackId="2" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Penalty Distribution */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Penalty Distribution</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="h-[220px] w-full max-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={penaltyDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {penaltyDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* State-wise Revenue */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">State-wise Revenue Split</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart data={stateRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="state" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} className="fill-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="mrp" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ppp" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed State Table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">State-wise Payment Summary</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold">State</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Partners</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Orders</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">MRP Sales</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">PPP Total</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Penalties</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Net Payable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {states.map((state) => {
                    const stateRecords = mockPaymentRecords.filter((p) => p.state === state);
                    return (
                      <TableRow key={state}>
                        <TableCell className="text-xs font-medium text-foreground">{state}</TableCell>
                        <TableCell className="text-xs text-right">{stateRecords.length}</TableCell>
                        <TableCell className="text-xs text-right">{stateRecords.reduce((s, p) => s + p.totalOrders, 0)}</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency(stateRecords.reduce((s, p) => s + p.totalSales, 0))}</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency(stateRecords.reduce((s, p) => s + p.totalPPP, 0))}</TableCell>
                        <TableCell className="text-xs text-right text-destructive">{formatCurrency(stateRecords.reduce((s, p) => s + p.penalties, 0))}</TableCell>
                        <TableCell className="text-xs text-right font-semibold">{formatCurrency(stateRecords.reduce((s, p) => s + p.netPayable, 0))}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ PPP APPROVAL TAB ═══════ */}
        <TabsContent value="ppp_approval" className="space-y-5 mt-5">
          {/* Open Weeks Selector */}
          <div className="grid md:grid-cols-3 gap-3">
            {payoutWeeks.map((w) => {
              const wTotal = w.partnerBreakdown.reduce((s, p) => s + p.netPayable, 0);
              const wPartners = w.partnerBreakdown.length;
              const isSelected = selectedWeek === w.weekId;
              const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
                open: { label: "Open — Awaiting Finance", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", icon: Clock },
                finance_approved: { label: "Finance Approved", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", icon: ShieldCheck },
                ops_approved: { label: "Fully Approved", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400", icon: CheckCircle2 },
                paid: { label: "Paid", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
              };
              const sc = statusConfig[w.status];
              return (
                <button
                  key={w.weekId}
                  onClick={() => setSelectedWeek(isSelected ? null : w.weekId)}
                  className={`text-left rounded-xl border p-4 transition-all ${isSelected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-bold text-foreground">{w.weekId}</p>
                    <Badge className={`${sc.color} text-[9px] border-0 gap-1`}>
                      <sc.icon className="w-3 h-3" /> {sc.label}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{w.weekLabel}</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(wTotal)}</p>
                      <p className="text-[9px] text-muted-foreground">Net Payable</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{wPartners}</p>
                      <p className="text-[9px] text-muted-foreground">Partners</p>
                    </div>
                  </div>
                  {w.financeApprover && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-[9px] text-muted-foreground">Finance: <span className="text-foreground font-medium">{w.financeApprover}</span> — {w.financeApprovedAt}</p>
                    </div>
                  )}
                  {w.opsApprover && (
                    <p className="text-[9px] text-muted-foreground mt-0.5">Ops: <span className="text-foreground font-medium">{w.opsApprover}</span> — {w.opsApprovedAt}</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Week Detail */}
          {activeWeek && (() => {
            const bp = activeWeek.partnerBreakdown;
            const wTotalMRP = bp.reduce((s, p) => s + p.totalMRP, 0);
            const wTotalPPP = bp.reduce((s, p) => s + p.totalPPP, 0);
            const wTotalPen = bp.reduce((s, p) => s + p.penalties, 0);
            const wTotalNet = bp.reduce((s, p) => s + p.netPayable, 0);
            const wTotalOrders = bp.reduce((s, p) => s + p.totalOrders, 0);
            const avgPPPRatio = wTotalMRP > 0 ? ((wTotalPPP / wTotalMRP) * 100).toFixed(1) : "0";

            return (
              <div className="space-y-4">
                {/* Week Summary KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Partners</p>
                    <p className="text-lg font-bold text-foreground">{bp.length}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Total Orders</p>
                    <p className="text-lg font-bold text-foreground">{wTotalOrders}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">MRP Sales</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(wTotalMRP)}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">PPP Payable</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(wTotalPPP)}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">Penalties</p>
                    <p className="text-lg font-bold text-destructive">{formatCurrency(wTotalPen)}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">PPP Ratio</p>
                    <p className="text-lg font-bold text-foreground">{avgPPPRatio}%</p>
                    <p className="text-[9px] text-muted-foreground">Target: 65%</p>
                  </CardContent></Card>
                </div>

                {/* Approval Status & Actions */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">Approval Workflow — {activeWeek.weekId}</p>
                        <div className="flex items-center gap-6">
                          {/* Step 1: Finance */}
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeWeek.status !== "open" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"}`}>
                              {activeWeek.status !== "open" ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-foreground">Finance Manager</p>
                              {activeWeek.financeApprover ? (
                                <p className="text-[9px] text-muted-foreground">{activeWeek.financeApprover} — {activeWeek.financeApprovedAt}</p>
                              ) : (
                                <p className="text-[9px] text-amber-600">Pending approval</p>
                              )}
                            </div>
                          </div>
                          <div className="w-8 border-t border-border" />
                          {/* Step 2: Ops Head */}
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeWeek.status === "ops_approved" || activeWeek.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : activeWeek.status === "finance_approved" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>
                              {activeWeek.status === "ops_approved" || activeWeek.status === "paid" ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-foreground">Ops Head</p>
                              {activeWeek.opsApprover ? (
                                <p className="text-[9px] text-muted-foreground">{activeWeek.opsApprover} — {activeWeek.opsApprovedAt}</p>
                              ) : activeWeek.status === "finance_approved" ? (
                                <p className="text-[9px] text-amber-600">Pending approval</p>
                              ) : (
                                <p className="text-[9px] text-muted-foreground">Awaiting finance</p>
                              )}
                            </div>
                          </div>
                          <div className="w-8 border-t border-border" />
                          {/* Step 3: Download */}
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeWeek.status === "ops_approved" || activeWeek.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                              <FileDown className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-foreground">Bank File</p>
                              <p className="text-[9px] text-muted-foreground">{activeWeek.status === "ops_approved" ? "Ready to download" : "Locked"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeWeek.status === "open" && (
                          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowApprovalConfirm("finance")}>
                            <ShieldCheck className="w-3.5 h-3.5" /> Finance Approve
                          </Button>
                        )}
                        {activeWeek.status === "finance_approved" && (
                          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowApprovalConfirm("ops")}>
                            <ShieldCheck className="w-3.5 h-3.5" /> Ops Approve
                          </Button>
                        )}
                        {(activeWeek.status === "ops_approved" || activeWeek.status === "paid") && (
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleDownloadBankFile}>
                            <Download className="w-3.5 h-3.5" /> Download Bank File
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Partner Breakdown Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Partner-wise Payout Breakdown</CardTitle>
                      <Badge variant="outline" className="text-[9px] gap-1">
                        <DollarSign className="w-3 h-3" /> Net: {formatCurrency(wTotalNet)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead className="text-[10px] font-semibold">Partner</TableHead>
                            <TableHead className="text-[10px] font-semibold">SKID</TableHead>
                            <TableHead className="text-[10px] font-semibold">Location</TableHead>
                            <TableHead className="text-[10px] font-semibold">Stream</TableHead>
                            <TableHead className="text-[10px] font-semibold text-right">Orders</TableHead>
                            <TableHead className="text-[10px] font-semibold text-right">MRP</TableHead>
                            <TableHead className="text-[10px] font-semibold text-right">PPP</TableHead>
                            <TableHead className="text-[10px] font-semibold text-right">Penalties</TableHead>
                            <TableHead className="text-[10px] font-semibold text-right">Net Payable</TableHead>
                            <TableHead className="text-[10px] font-semibold text-right">PPP %</TableHead>
                            <TableHead className="text-[10px] font-semibold">Bank</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bp.map((p) => (
                            <TableRow key={p.rmn} className="hover:bg-muted/20">
                              <TableCell className="py-2.5">
                                <p className="text-xs font-medium text-foreground">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground">{p.rmn}</p>
                              </TableCell>
                              <TableCell className="text-xs font-mono text-muted-foreground">{p.skid}</TableCell>
                              <TableCell className="text-[10px] text-muted-foreground">{p.city}, {p.state}</TableCell>
                              <TableCell><Badge variant="outline" className="text-[9px]">{p.stream}</Badge></TableCell>
                              <TableCell className="text-xs text-right">{p.totalOrders}</TableCell>
                              <TableCell className="text-xs text-right">{formatCurrency(p.totalMRP)}</TableCell>
                              <TableCell className="text-xs text-right">{formatCurrency(p.totalPPP)}</TableCell>
                              <TableCell className="text-xs text-right">
                                {p.penalties > 0 ? <span className="text-destructive font-medium">-{formatCurrency(p.penalties)}</span> : <span className="text-muted-foreground">—</span>}
                              </TableCell>
                              <TableCell className="text-xs text-right font-semibold text-foreground">{formatCurrency(p.netPayable)}</TableCell>
                              <TableCell className="text-xs text-right text-muted-foreground">{p.pppRatio}%</TableCell>
                              <TableCell>
                                <p className="text-[10px] text-foreground">{p.bankName}</p>
                                <p className="text-[9px] text-muted-foreground">{p.accountNo} · {p.ifsc}</p>
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* Total Row */}
                          <TableRow className="bg-muted/30 font-semibold">
                            <TableCell colSpan={4} className="text-xs text-foreground">Total ({bp.length} partners)</TableCell>
                            <TableCell className="text-xs text-right">{wTotalOrders}</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency(wTotalMRP)}</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency(wTotalPPP)}</TableCell>
                            <TableCell className="text-xs text-right text-destructive">{formatCurrency(wTotalPen)}</TableCell>
                            <TableCell className="text-xs text-right text-foreground">{formatCurrency(wTotalNet)}</TableCell>
                            <TableCell className="text-xs text-right">{avgPPPRatio}%</TableCell>
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {!selectedWeek && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <Stamp className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Select a calendar week above to view the payout breakdown</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">Open weeks require Finance Manager approval followed by Ops Head approval before the bank file can be downloaded.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Confirmation Dialog */}
      <Dialog open={!!showApprovalConfirm} onOpenChange={() => setShowApprovalConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              {showApprovalConfirm === "finance" ? "Finance Manager Approval" : "Ops Head Approval"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {showApprovalConfirm === "finance"
                ? "You are about to approve this weekly payout as Finance Manager. This will advance the payout to Ops Head for final approval."
                : "You are about to give final approval as Ops Head. Once approved, the bank payout file will be available for download and submission to the bank."}
            </p>
            {activeWeek && (
              <div className="rounded-lg bg-muted/30 border border-border p-3 space-y-1">
                <p className="text-xs font-semibold text-foreground">{activeWeek.weekLabel}</p>
                <p className="text-xs text-muted-foreground">{activeWeek.partnerBreakdown.length} partners · {formatCurrency(activeWeek.partnerBreakdown.reduce((s, p) => s + p.netPayable, 0))} net payable</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowApprovalConfirm(null)}>Cancel</Button>
            <Button size="sm" className="gap-1" onClick={showApprovalConfirm === "finance" ? handleFinanceApprove : handleOpsApprove}>
              <ShieldCheck className="w-3.5 h-3.5" /> Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partner Detail Dialog */}
      <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
        <DialogContent className="max-w-md">
          {selectedPartner && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">{selectedPartner.partnerName} — Payment Detail</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">RMN:</span> <span className="text-foreground font-medium">{selectedPartner.rmn}</span></div>
                  <div><span className="text-muted-foreground">Stream:</span> <Badge variant="outline" className="text-[9px] ml-1">{selectedPartner.stream}</Badge></div>
                  <div><span className="text-muted-foreground">Cuisine:</span> <span className="text-foreground">{selectedPartner.cuisine}</span></div>
                  <div><span className="text-muted-foreground">Location:</span> <span className="text-foreground">{selectedPartner.city}, {selectedPartner.state}</span></div>
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Orders</span><span className="font-medium text-foreground">{selectedPartner.totalOrders}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">MRP Sales</span><span className="font-medium text-foreground">{formatCurrency(selectedPartner.totalSales)}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Partner Price (PPP)</span><span className="font-medium text-foreground">{formatCurrency(selectedPartner.totalPPP)}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Penalties</span><span className="font-medium text-destructive">-{formatCurrency(selectedPartner.penalties)}</span></div>
                  <div className="flex justify-between text-xs border-t border-border pt-2"><span className="font-semibold text-foreground">Net Payable</span><span className="font-bold text-foreground text-sm">{formatCurrency(selectedPartner.netPayable)}</span></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Badge className={`${statusColors[selectedPartner.status]} text-[10px] border-0 capitalize`}>{selectedPartner.status === "on_hold" ? "On Hold" : selectedPartner.status}</Badge>
                  <span className="text-[10px] text-muted-foreground">Week ending: {selectedPartner.weekEnding}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" /> Weekly Bulk Payment Upload
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Upload the weekly payment Excel file. Each row should contain: Partner RMN, Payment Amount, UTR/Reference, Payment Date. Once uploaded, the payment will reflect in each partner's Statement of Accounts.
            </p>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Payment File</Label>
              <Input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="h-9 text-xs file:text-xs" />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-[10px] font-semibold text-foreground mb-1">Expected Columns:</p>
              <p className="text-[10px] text-muted-foreground">Partner RMN, Partner Name, Payment Amount ($), UTR/Reference, Payment Date, Payment Mode (ACH/UPI/IMPS)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowBulkUpload(false)}>Cancel</Button>
            <Button size="sm" onClick={handleBulkUpload} className="gap-1"><Upload className="w-3.5 h-3.5" /> Upload & Process</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
