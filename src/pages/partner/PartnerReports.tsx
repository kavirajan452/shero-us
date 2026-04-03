import { useState, useMemo } from "react";
import KitchenSelector from "@/components/partner/KitchenSelector";
// Finance Reports — performance tab moved to PartnerPerformanceSCV
import { format, startOfWeek, endOfWeek, subWeeks, getISOWeek, getYear, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegion } from "@/contexts/RegionContext";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, CalendarIcon,
  AlertTriangle, CheckCircle2, ArrowRight, DollarSign, ClipboardList,
  Star as StarIcon, Award, FileSpreadsheet, Ban, Users,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  earningsSummary, weeklyEarnings, referralStats,
} from "@/data/partnerMockData";
import { opportunitySummary } from "@/data/partnerMockData";
import { brandedCuisineMasters } from "@/data/masterMenuData";
import * as XLSX from "xlsx";

// ── Chart data ───────────────────────────────────────────────────────
const weeklyEarningsOverview = [
  { day: "Mon", earnings: 670, potential: 1200 },
  { day: "Tue", earnings: 500, potential: 1200 },
  { day: "Wed", earnings: 895, potential: 1200 },
  { day: "Thu", earnings: 785, potential: 1200 },
  { day: "Fri", earnings: 1175, potential: 1800 },
  { day: "Sat", earnings: 1430, potential: 2860 },
  { day: "Sun", earnings: 0, potential: 2690 },
];

const categoryBreakdown = [
  { name: "Meals", value: 45, color: "#1B5E20" },
  { name: "Snacks", value: 25, color: "#F57C00" },
  { name: "Sweets", value: 18, color: "#C62828" },
  { name: "Beverages", value: 12, color: "#1565C0" },
];

const monthlyTrend = [
  { month: "Sep", earnings: 11760, potential: 14500 },
  { month: "Oct", earnings: 13440, potential: 15800 },
  { month: "Nov", earnings: 14280, potential: 16200 },
  { month: "Dec", earnings: 17360, potential: 18500 },
  { month: "Jan", earnings: 16240, potential: 18500 },
  { month: "Feb", earnings: 18200, potential: 21000 },
];

const topItems = [
  { name: "Hyderabadi Biryani", orders: 86, earnings: 3610 },
  { name: "Butter Chicken", orders: 72, earnings: 3024 },
  { name: "Masala Dosa", orders: 65, earnings: 1274 },
  { name: "Gulab Jamun (Box)", orders: 54, earnings: 1512 },
  { name: "Veg Thali", orders: 48, earnings: 1613 },
];

// ── Helper: generate week options ────────────────────────────────────
const generateWeekOptions = () => {
  const now = new Date();
  const options: { value: string; label: string; start: Date; end: Date }[] = [];
  for (let i = 0; i < 4; i++) {
    const refDate = subWeeks(now, i);
    const ws = startOfWeek(refDate, { weekStartsOn: 1 }); // Monday
    const we = endOfWeek(refDate, { weekStartsOn: 1 });   // Sunday
    const wNum = getISOWeek(ws);
    const yr = getYear(ws);
    options.push({
      value: `${yr}-W${wNum}`,
      label: `W${wNum} — ${format(ws, "dd MMM")} to ${format(we, "dd MMM")}`,
      start: ws,
      end: we,
    });
  }
  return options;
};

const weekOptions = generateWeekOptions();

// ── Ledger data (spread across last 4 weeks) ────────────────────────
type LedgerType = "income" | "penalty" | "payment" | "adjustment" | "referral" | "wallet_bonus";

interface LedgerOrderItem { name: string; qty: number; price: number }

interface LedgerEntry {
  id: string; date: string; type: LedgerType; description: string;
  amount: number; runningBalance: number; orderId?: string;
  orderItems?: LedgerOrderItem[]; customerName?: string;
  penaltyReason?: string; paymentMethod?: string; paymentRef?: string;
}

// Helper to offset dates to spread entries across recent weeks
const offsetDate = (baseDate: string, weeksBack: number): string => {
  const d = new Date(baseDate);
  const now = new Date();
  const ws = startOfWeek(subWeeks(now, weeksBack), { weekStartsOn: 1 });
  // Keep same day-of-week offset
  const baseDow = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0
  const target = new Date(ws);
  target.setDate(target.getDate() + baseDow);
  return format(target, "yyyy-MM-dd");
};

const ledgerEntries: LedgerEntry[] = [
  // Week 0 (current week)
  { id: "L001", date: offsetDate("2026-02-28", 0), type: "income", description: "Order #SH4821 — Hyderabadi Biryani × 2, Raita × 2", amount: 598, runningBalance: 24300, orderId: "SH4821", orderItems: [{ name: "Hyderabadi Biryani", qty: 2, price: 249 }, { name: "Raita", qty: 2, price: 50 }], customerName: "Priya Sharma" },
  { id: "L002", date: offsetDate("2026-02-28", 0), type: "penalty", description: "Late preparation — Order #SH4815", amount: -50, runningBalance: 23702, orderId: "SH4815", penaltyReason: "Order was marked ready 18 minutes after the promised time. Platform SLA allows max 10 min delay. Penalty: $50 flat deduction." },
  { id: "L003", date: offsetDate("2026-02-27", 0), type: "income", description: "Order #SH4798 — Butter Chicken × 1, Naan × 3", amount: 420, runningBalance: 23752, orderId: "SH4798", orderItems: [{ name: "Butter Chicken", qty: 1, price: 299 }, { name: "Butter Naan", qty: 3, price: 40 }], customerName: "Rahul Verma" },
  { id: "L004", date: offsetDate("2026-02-27", 0), type: "income", description: "Order #SH4795 — Masala Dosa × 3, Coffee × 3", amount: 390, runningBalance: 24172, orderId: "SH4795", orderItems: [{ name: "Masala Dosa", qty: 3, price: 80 }, { name: "Filter Coffee", qty: 3, price: 50 }], customerName: "Kavitha S." },
  // Week 1 (previous week)
  { id: "L005", date: offsetDate("2026-02-26", 1), type: "payment", description: "Weekly payout — Bank transfer (Week " + (getISOWeek(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }))) + ")", amount: -15000, runningBalance: 23432, paymentMethod: "Bank Transfer (ACH)", paymentRef: "UTR20260226SHERO4421" },
  { id: "L006", date: offsetDate("2026-02-26", 1), type: "income", description: "Order #SH4775 — Masala Dosa × 4, Filter Coffee × 4", amount: 520, runningBalance: 38432, orderId: "SH4775", orderItems: [{ name: "Masala Dosa", qty: 4, price: 80 }, { name: "Filter Coffee", qty: 4, price: 50 }], customerName: "Anita Reddy" },
  { id: "L007", date: offsetDate("2026-02-25", 1), type: "adjustment", description: "Platform fee reversal — Promo order reimbursement", amount: 75, runningBalance: 37912 },
  { id: "L008", date: offsetDate("2026-02-25", 1), type: "income", description: "Order #SH4760 — Veg Thali × 2", amount: 240, runningBalance: 37837, orderId: "SH4760", orderItems: [{ name: "Veg Thali", qty: 2, price: 120 }], customerName: "Meena Iyer" },
  { id: "L009", date: offsetDate("2026-02-24", 1), type: "penalty", description: "Customer complaint — Order #SH4790 (quality issue)", amount: -100, runningBalance: 23332, orderId: "SH4790", penaltyReason: "Customer reported cold food & missing item (1× Gulab Jamun). Complaint verified by support. Penalty: $100." },
  // Week 2
  { id: "L010", date: offsetDate("2026-02-24", 2), type: "penalty", description: "Order rejected by partner — Order #SH4745", amount: -25, runningBalance: 37597, orderId: "SH4745", penaltyReason: "Partner rejected an accepted order after 5 minutes. Penalty: $25." },
  { id: "L011", date: offsetDate("2026-02-24", 2), type: "income", description: "Order #SH4738 — Gulab Jamun Box × 3", amount: 300, runningBalance: 37622, orderId: "SH4738", orderItems: [{ name: "Gulab Jamun (Box)", qty: 3, price: 100 }], customerName: "Deepak Nair" },
  { id: "L012", date: offsetDate("2026-02-22", 2), type: "referral" as LedgerType, description: "Referral Reward — Radha Menon listed as partner", amount: 750, runningBalance: 37322 },
  { id: "L013", date: offsetDate("2026-02-22", 2), type: "income", description: "Order #SH4720 — Chicken Biryani × 2", amount: 498, runningBalance: 36572, orderId: "SH4720", orderItems: [{ name: "Chicken Biryani", qty: 2, price: 249 }], customerName: "Sanjay R." },
  // Week 3
  { id: "L014", date: offsetDate("2026-02-18", 3), type: "referral" as LedgerType, description: "Referral Reward — Preethi Kumari is now active", amount: 1500, runningBalance: 36572 },
  { id: "L015", date: offsetDate("2026-02-18", 3), type: "referral" as LedgerType, description: "Referral Reward — Preethi Kumari listed as partner", amount: 750, runningBalance: 35072 },
  { id: "L016", date: offsetDate("2026-02-12", 3), type: "income", description: "Order #SH4698 — Paneer Tikka × 4", amount: 560, runningBalance: 34322, orderId: "SH4698", orderItems: [{ name: "Paneer Tikka", qty: 4, price: 140 }], customerName: "Lakshmi P." },
  { id: "L017", date: offsetDate("2026-02-12", 3), type: "wallet_bonus" as LedgerType, description: "Signup Wallet Bonus — included in first PPP payout", amount: 500, runningBalance: 32072 },
  { id: "L018", date: offsetDate("2026-02-10", 3), type: "payment", description: "Weekly payout — Bank transfer (Week " + (getISOWeek(startOfWeek(subWeeks(new Date(), 3), { weekStartsOn: 1 }))) + ")", amount: -8000, runningBalance: 31572, paymentMethod: "Bank Transfer (ACH)", paymentRef: "UTR20260210SHERO3312" },
];

const typeConfig: Record<LedgerType, { label: string; color: string; icon: React.ElementType }> = {
  income: { label: "Income", color: "bg-accent/15 text-accent", icon: CheckCircle2 },
  penalty: { label: "Penalty", color: "bg-destructive/15 text-destructive", icon: AlertTriangle },
  payment: { label: "Payment", color: "bg-primary/15 text-primary", icon: DollarSign },
  adjustment: { label: "Adjustment", color: "bg-secondary text-secondary-foreground", icon: ArrowRight },
  referral: { label: "Referral Reward", color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300", icon: Award },
  wallet_bonus: { label: "Wallet Bonus", color: "bg-primary/15 text-primary", icon: Award },
};


// ── Bad Reviews Mock Data ────────────────────────────────────────────
const badReviewsData = [
  { orderId: "SH4821", date: "2026-02-28", customer: "Priya Sharma", dish: "Hyderabadi Biryani", rating: 1, review: "Food was cold and lacked spice. Very disappointed.", week: "W3" },
  { orderId: "SH4790", date: "2026-02-27", customer: "Rahul Verma", dish: "Butter Chicken", rating: 2, review: "Missing naan from order. Chicken was dry.", week: "W3" },
  { orderId: "SH4760", date: "2026-02-25", customer: "Meena Iyer", dish: "Veg Thali", rating: 1, review: "Sambar was too salty. Dal had no taste at all.", week: "W3" },
  { orderId: "SH4701", date: "2026-02-21", customer: "Anita Reddy", dish: "Masala Dosa", rating: 2, review: "Dosa was soggy and chutney was stale.", week: "W2" },
  { orderId: "SH4685", date: "2026-02-20", customer: "Deepak Nair", dish: "Curd Rice", rating: 1, review: "Portion was very small for the price.", week: "W2" },
  { orderId: "SH4650", date: "2026-02-18", customer: "Kavitha S.", dish: "Fish Curry", rating: 2, review: "Fish was overcooked and curry was watery.", week: "W2" },
  { orderId: "SH4620", date: "2026-02-16", customer: "Sanjay R.", dish: "Mutton Curry", rating: 1, review: "Found hair in the food. Very unhygienic.", week: "W1" },
  { orderId: "SH4598", date: "2026-02-14", customer: "Lakshmi P.", dish: "Idli Vada", rating: 2, review: "Idli was hard and vada was oily.", week: "W1" },
];

const downloadBadReviewsExcel = (weekFilter?: string) => {
  const filtered = weekFilter ? badReviewsData.filter(r => r.week === weekFilter) : badReviewsData;
  const rows = filtered.map((r, i) => ({
    "Sl": i + 1,
    "Order ID": r.orderId,
    "Date": r.date,
    "Customer": r.customer,
    "Dish": r.dish,
    "Rating": `${r.rating}/5`,
    "Review": r.review,
    "Week": r.week,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 4 }, { wch: 10 }, { wch: 12 }, { wch: 16 }, { wch: 20 }, { wch: 6 }, { wch: 50 }, { wch: 5 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bad Reviews");
  const suffix = weekFilter || "All";
  XLSX.writeFile(wb, `Bad_Reviews_${suffix}_${format(new Date(), "yyyyMMdd")}.xlsx`);
};

type Period = "week" | "month" | "quarter" | "custom";
type LedgerFilter = "all" | LedgerType;
type LedgerMode = "week" | "custom";

// ═════════════════════════════════════════════════════════════════════
const PartnerReports = () => {
  const [period, setPeriod] = useState<Period>("week");
  const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>("all");
  const [foodSalesView, setFoodSalesView] = useState<"total" | "splitup">("total");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [selectedKitchen, setSelectedKitchen] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState(weekOptions[0].value);
  const [ledgerMode, setLedgerMode] = useState<LedgerMode>("week");
  const { formatPrice } = useRegion();

  const inductionDate = new Date(earningsSummary.inductionDate);

  // ── Selected week boundaries ──
  const selectedWeekOption = weekOptions.find(w => w.value === selectedWeek) || weekOptions[0];

  // ── Monthly customers count ──
  const monthlyCustomers = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const names = new Set<string>();
    ledgerEntries.forEach(e => {
      if (e.type === "income" && e.customerName) {
        const d = new Date(e.date);
        if (isWithinInterval(d, { start: monthStart, end: monthEnd })) {
          names.add(e.customerName);
        }
      }
    });
    return names.size;
  }, []);

  // ── Download helpers ──
  const downloadLedgerExcel = () => {
    const rows = filteredLedger.map((e, i) => ({
      "Sl": i + 1,
      "Date": format(new Date(e.date), "dd MMM yyyy"),
      "Type": typeConfig[e.type].label,
      "Description": e.description,
      "Debit ($)": e.amount < 0 ? Math.abs(e.amount) : 0,
      "Credit ($)": e.amount > 0 ? e.amount : 0,
      "Balance ($)": e.runningBalance,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statement");
    const dateStr = ledgerMode === "week"
      ? selectedWeek
      : fromDate && toDate ? `${format(fromDate, "yyyyMMdd")}_${format(toDate, "yyyyMMdd")}` : "all";
    XLSX.writeFile(wb, `Statement_of_Accounts_${dateStr}.xlsx`);
  };


  // ── Overview data ──
  const weeklyMissed = weeklyEarningsOverview.reduce((s, d) => s + (d.potential - d.earnings), 0);

  const summaryCards = [
    { label: "PPP Earnings", value: formatPrice(6800), change: "+12%", up: true, accent: "border-l-emerald-500", opportunity: weeklyMissed > 0 ? formatPrice(6800 + weeklyMissed) : null },
    { label: "Total Orders", value: "122", change: "+8%", up: true, accent: "border-l-blue-500" },
    { label: "Avg Earning/Order", value: formatPrice(56), change: "-3%", up: false, accent: "border-l-amber-500" },
    { label: "Cancellation Rate", value: "2.4%", change: "-0.6%", up: true, accent: "border-l-rose-500" },
  ];

  // ── Ledger filtering ──
  const filteredLedger = useMemo(() => {
    return ledgerEntries.filter((e) => {
      if (ledgerFilter !== "all" && e.type !== ledgerFilter) return false;
      const d = new Date(e.date);
      if (ledgerMode === "week") {
        return isWithinInterval(d, { start: selectedWeekOption.start, end: selectedWeekOption.end });
      } else {
        if (fromDate && d < fromDate) return false;
        if (toDate && d > new Date(toDate.getTime() + 86400000)) return false;
        return true;
      }
    });
  }, [ledgerFilter, ledgerMode, selectedWeek, fromDate, toDate]);

  const totalIncome = filteredLedger.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalPenalties = filteredLedger.filter((e) => e.type === "penalty").reduce((s, e) => s + e.amount, 0);
  const totalPayments = filteredLedger.filter((e) => e.type === "payment").reduce((s, e) => s + Math.abs(e.amount), 0);
  const totalReferralRewards = filteredLedger.filter((e) => e.type === "referral").reduce((s, e) => s + e.amount, 0);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-serif font-bold text-foreground">Finance Reports</h2>
      </div>

      {/* Kitchen Selector */}
      <KitchenSelector value={selectedKitchen} onChange={setSelectedKitchen} />

      {/* ── TABS ─────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earnings-summary">Earnings</TabsTrigger>
          <TabsTrigger value="earnings">Ledger / Statement</TabsTrigger>
        </TabsList>

        {/* ── TAB: Overview ─────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {/* Period toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-full bg-muted p-0.5 w-fit">
              {(["week", "month", "quarter", "custom"] as Period[]).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {p === "custom" ? "Custom Range" : p}
                </button>
              ))}
            </div>

            {period === "custom" && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("text-xs gap-1.5 h-8", !customFrom && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {customFrom ? format(customFrom, "dd MMM yyyy") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customFrom}
                      onSelect={setCustomFrom}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-xs text-muted-foreground">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("text-xs gap-1.5 h-8", !customTo && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {customTo ? format(customTo, "dd MMM yyyy") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customTo}
                      onSelect={setCustomTo}
                      disabled={(date) => customFrom ? date < customFrom : false}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {customFrom && customTo && (
                  <Badge variant="outline" className="text-[10px]">
                    {Math.ceil((customTo.getTime() - customFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {summaryCards.map((card) => (
              <Card key={card.label} className={`border-border bg-card border-l-4 ${card.accent}`}>
                <CardContent className="p-2.5">
                  <p className="text-[10px] font-medium text-muted-foreground">{card.label}</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{card.value}</p>
                  <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-medium ${card.up ? "text-accent" : "text-destructive"}`}>
                    {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {card.change}
                  </div>
                  {"opportunity" in card && card.opportunity && (
                    <p className="text-[10px] text-destructive/70 mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Potential: {card.opportunity}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {/* Monthly Customers */}
            <Card className="border-border bg-card border-l-4 border-l-purple-500">
              <CardContent className="p-2.5">
                <p className="text-[10px] font-medium text-muted-foreground">Monthly Customers</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{monthlyCustomers}</p>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] font-medium text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {format(new Date(), "MMMM yyyy")}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Chart */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">PPP Earnings & Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyEarningsOverview} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} labelStyle={{ color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="potential" fill="#B0B0B0" radius={[4, 4, 0, 0]} name="Potential" />
                    <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-5 mt-3 text-xs text-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "hsl(var(--primary))" }} /> Actual Earnings</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#B0B0B0" }} /> Opportunity (missed / leave / shortfall)</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground">Category Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value, cx, cy, midAngle, outerRadius: or }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = (or || 70) + 25;
                        const x = (cx || 0) + radius * Math.cos(-midAngle * RADIAN);
                        const y = (cy || 0) + radius * Math.sin(-midAngle * RADIAN);
                        return <text x={x} y={y} textAnchor={x > (cx || 0) ? "start" : "end"} dominantBaseline="central" style={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--foreground))" }}>{name} {value}%</text>;
                      }} labelLine={{ stroke: "hsl(var(--foreground))", strokeWidth: 1 }}>
                        {categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground">Monthly Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="potential" fill="#B0B0B0" radius={[4, 4, 0, 0]} name="Potential" />
                      <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Selling Items */}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground">Top Selling Items</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {topItems.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatPrice(item.earnings)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: Earnings Summary ─────────────────────────────── */}
        <TabsContent value="earnings-summary" className="space-y-6">
          {/* Quick KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Today", value: formatPrice(earningsSummary.today), icon: DollarSign, sub: "earnings" },
              { label: "This Week", value: formatPrice(earningsSummary.thisWeek), icon: TrendingUp, sub: "earnings" },
              { label: "This Month", value: formatPrice(earningsSummary.thisMonth), icon: DollarSign, sub: "earnings" },
              { label: "Total Orders", value: earningsSummary.totalOrders.toString(), icon: ClipboardList, sub: "all time" },
              { label: "Avg Rating", value: earningsSummary.avgRating.toFixed(1), icon: StarIcon, sub: "from customers" },
              { label: "Completion", value: `${earningsSummary.completionRate}%`, icon: TrendingUp, sub: "rate" },
              { label: "Monthly Customers", value: monthlyCustomers.toString(), icon: Users, sub: format(new Date(), "MMMM yyyy") },
            ].map((c) => (
              <Card key={c.label} className="border-border">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <c.icon className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{c.label}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{c.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* PPP Earnings Breakdown */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground">PPP Earnings Breakdown</CardTitle>
              <CardDescription>Partner Payment Programme — since induction ({format(inductionDate, "dd MMM yyyy")})</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Row 1: Food Sales + Referral = Gross Earnings */}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Income Sources</p>
                <div className="grid grid-cols-3 gap-3">
                  {/* Food Sales PPP — with split-up toggle */}
                  <div className="space-y-1 rounded-lg border border-border p-3 col-span-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">🍽️ Food Sales (PPP)</p>
                      <button
                        onClick={() => setFoodSalesView(foodSalesView === "total" ? "splitup" : "total")}
                        className="text-[9px] text-primary font-semibold hover:underline"
                      >
                        {foodSalesView === "total" ? "Split ↓" : "Total ↑"}
                      </button>
                    </div>
                    <p className="text-lg font-bold text-foreground">{formatPrice(earningsSummary.pppEarnings - referralStats.totalEarned)}</p>
                    <p className="text-[10px] text-muted-foreground">{earningsSummary.totalOrders} orders</p>

                    {foodSalesView === "splitup" && (() => {
                      const basePPP = earningsSummary.pppEarnings - referralStats.totalEarned;
                      const baseOrders = earningsSummary.totalOrders;
                      const brandTotal = Math.round(basePPP * 0.25);
                      const brandOrders = Math.round(baseOrders * 0.25);
                      const brands = brandedCuisineMasters.map((b, i) => {
                        const share = [0.28, 0.22, 0.18, 0.12, 0.06, 0.04, 0.03, 0.03, 0.02, 0.02][i] ?? 0.02;
                        return { label: b.cuisine, emoji: b.emoji, amount: Math.round(brandTotal * share), orders: Math.max(1, Math.round(brandOrders * share)) };
                      });
                      const sections = [
                        { label: "SAP (Instant)", emoji: "⚡", amount: Math.round(basePPP * 0.45), orders: Math.round(baseOrders * 0.45) },
                        { label: "Party Orders", emoji: "🎉", amount: Math.round(basePPP * 0.18), orders: Math.round(baseOrders * 0.18) },
                        { label: "Subscription", emoji: "🔒", amount: Math.round(basePPP * 0.12), orders: Math.round(baseOrders * 0.12) },
                      ];
                      return (
                        <div className="mt-2 pt-2 border-t border-border space-y-2">
                          {sections.map((s) => (
                            <div key={s.label} className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground">{s.emoji} {s.label}</span>
                              <div className="text-right">
                                <span className="font-semibold text-foreground">{formatPrice(s.amount)}</span>
                                <span className="text-muted-foreground ml-1">({s.orders})</span>
                              </div>
                            </div>
                          ))}
                          {/* Brand-wise with per-brand breakdown */}
                          <div className="pt-1.5 border-t border-border">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground font-medium">🏷️ Brand-wise Total</span>
                              <div className="text-right">
                                <span className="font-semibold text-accent-foreground">{formatPrice(brandTotal)}</span>
                                <span className="text-muted-foreground ml-1">({brandOrders})</span>
                              </div>
                            </div>
                            <div className="ml-3 space-y-1 border-l-2 border-primary/20 pl-2">
                              {brands.map((b) => (
                                <div key={b.label} className="flex items-center justify-between text-[9px]">
                                  <span className="text-muted-foreground">{b.emoji} {b.label}</span>
                                  <div className="text-right">
                                    <span className="font-medium text-foreground">{formatPrice(b.amount)}</span>
                                    <span className="text-muted-foreground ml-1">({b.orders})</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="space-y-1 rounded-lg border border-border p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">🎁 Referral Rewards</p>
                    <p className="text-lg font-bold text-foreground">{formatPrice(referralStats.totalEarned)}</p>
                    <p className="text-[10px] text-muted-foreground">{referralStats.listed} listed · {referralStats.active} active</p>
                  </div>
                  <div className="space-y-1 rounded-lg border border-accent/30 bg-accent/5 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">💰 Gross Earnings</p>
                    <p className="text-lg font-bold text-foreground">{formatPrice(earningsSummary.pppEarnings)}</p>
                    <p className="text-[10px] text-muted-foreground">food + referral</p>
                  </div>
                </div>
              </div>

              {/* Row 2: Deductions */}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Deductions</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">Penalties <Ban className="w-3 h-3" /></p>
                    <p className="text-lg font-bold text-destructive">−{formatPrice(earningsSummary.totalPenalties)}</p>
                    <p className="text-[10px] text-muted-foreground">{earningsSummary.penaltyCount} deductions</p>
                  </div>
                  <div className="space-y-1 rounded-xl bg-muted/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Penalty Impact</p>
                    <p className="text-lg font-bold text-foreground">{((earningsSummary.totalPenalties / earningsSummary.pppEarnings) * 100).toFixed(1)}%</p>
                    <p className="text-[10px] text-muted-foreground">of gross earnings</p>
                  </div>
                </div>
              </div>

              {/* Row 3: Payout & Balance */}
              <div className="border-t border-border pt-4">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Settlement</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 rounded-lg border border-border p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">💸 Total Paid Out</p>
                    <p className="text-lg font-bold text-primary">{formatPrice(38500)}</p>
                    <p className="text-[10px] text-muted-foreground">via bank transfer</p>
                  </div>
                  <div className="space-y-1 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">🏦 Net Payout</p>
                    <p className="text-lg font-bold text-primary">{formatPrice(earningsSummary.netPayout)}</p>
                    <p className="text-[10px] text-muted-foreground">after penalties</p>
                  </div>
                  <div className="space-y-1 rounded-lg border border-accent/30 bg-accent/5 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">📊 Balance Due</p>
                    <p className="text-lg font-bold text-foreground">{formatPrice(earningsSummary.netPayout - 38500)}</p>
                    <p className="text-[10px] text-muted-foreground">pending settlement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Earnings Chart */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Weekly Earnings
                <span className="text-[10px] font-normal text-muted-foreground">(grey = potential)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyEarnings} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} formatter={(value: number) => [formatPrice(value), "Earnings"]} />
                    <Bar dataKey="potential" fill="#B0B0B0" radius={[6, 6, 0, 0]} name="Potential" />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: Earnings Ledger ──────────────────────────────── */}
        <TabsContent value="earnings" className="space-y-4">
          {/* Week selector + filters */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Mode toggle */}
              <div className="flex rounded-full bg-muted p-0.5">
                <button onClick={() => setLedgerMode("week")} className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${ledgerMode === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  Week No.
                </button>
                <button onClick={() => setLedgerMode("custom")} className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${ledgerMode === "custom" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  Custom Range
                </button>
              </div>
            </div>

            {ledgerMode === "week" ? (
              <div className="flex flex-wrap items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-[260px] h-8 text-xs">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekOptions.map((w) => (
                      <SelectItem key={w.value} value={w.value} className="text-xs">
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-[10px]">
                  Mon–Sun
                </Badge>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("gap-1.5 text-xs", !fromDate && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {fromDate ? format(fromDate, "dd MMM yyyy") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
                <span className="text-xs text-muted-foreground">→</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("gap-1.5 text-xs", !toDate && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {toDate ? format(toDate, "dd MMM yyyy") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost" size="sm" className="text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={() => { setFromDate(inductionDate); setToDate(new Date()); }}
                >
                  Since Induction
                </Button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-full bg-muted p-0.5">
                {(["all", "income", "penalty", "payment", "referral", "adjustment"] as LedgerFilter[]).map((f) => (
                  <button key={f} onClick={() => setLedgerFilter(f)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium capitalize transition-colors ${ledgerFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs ml-auto" onClick={downloadLedgerExcel}>
                <FileSpreadsheet className="w-3.5 h-3.5" /> Download Excel
              </Button>
            </div>
          </div>

          {/* Vendor Payment Summary for selected week */}
          {ledgerMode === "week" && (
            <Card className="border-border border-l-4 border-l-primary bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Vendor Payment for {selectedWeekOption.label.split(" — ")[0]}</p>
                    <p className="text-lg font-bold text-primary mt-0.5">
                      {formatPrice(filteredLedger.filter(e => e.type === "payment").reduce((s, e) => s + Math.abs(e.amount), 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">{format(selectedWeekOption.start, "dd MMM")} – {format(selectedWeekOption.end, "dd MMM yyyy")}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{filteredLedger.length} transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Statement of Accounts */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">Statement of Accounts</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {ledgerMode === "week"
                    ? `${selectedWeekOption.label} · ${filteredLedger.length} transactions`
                    : (fromDate && toDate
                      ? `${format(fromDate, "dd MMM yyyy")} — ${format(toDate, "dd MMM yyyy")}`
                      : fromDate
                      ? `From ${format(fromDate, "dd MMM yyyy")}`
                      : toDate
                      ? `Up to ${format(toDate, "dd MMM yyyy")}`
                      : "All time") + ` · ${filteredLedger.length} transactions`}
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Total Earnings */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total Earnings</p>
                  <p className="text-xl font-bold text-foreground">{formatPrice(totalIncome)}</p>
                  <p className="text-[10px] text-muted-foreground">{filteredLedger.filter(e => e.type === "income").length} orders</p>
                </div>
                {/* Deductions */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Deductions</p>
                  <p className="text-xl font-bold text-destructive">−{formatPrice(Math.abs(totalPenalties))}</p>
                  <p className="text-[10px] text-muted-foreground">{filteredLedger.filter(e => e.type === "penalty").length} penalties</p>
                </div>
                {/* Referral Rewards */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Referral Rewards</p>
                  <p className="text-xl font-bold text-foreground">{formatPrice(totalReferralRewards)}</p>
                  <p className="text-[10px] text-muted-foreground">{filteredLedger.filter(e => e.type === "referral").length} rewards</p>
                </div>
                {/* Payments Received */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Payments Received</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(totalPayments)}</p>
                  <p className="text-[10px] text-muted-foreground">{filteredLedger.filter(e => e.type === "payment").length} payouts</p>
                </div>
                {/* Net Balance */}
                <div className="space-y-1 rounded-xl bg-muted/50 p-3 -m-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Net Balance</p>
                  <p className={`text-xl font-bold ${(totalIncome + totalPenalties + filteredLedger.filter(e => e.type === "adjustment").reduce((s, e) => s + e.amount, 0) - totalPayments) >= 0 ? "text-foreground" : "text-destructive"}`}>
                    {formatPrice(totalIncome + totalPenalties + filteredLedger.filter(e => e.type === "adjustment").reduce((s, e) => s + e.amount, 0) - totalPayments)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Earnings − Deductions − Paid</p>
                </div>
              </div>

              {/* Adjustments note */}
              {filteredLedger.filter(e => e.type === "adjustment").length > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowRight className="w-3 h-3" />
                  Adjustments: <span className="font-medium text-foreground">{formatPrice(filteredLedger.filter(e => e.type === "adjustment").reduce((s, e) => s + e.amount, 0))}</span>
                  <span>({filteredLedger.filter(e => e.type === "adjustment").length} entries)</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ledger table */}
          <Card className="border-border overflow-hidden">
            <CardContent className="p-0">
              {filteredLedger.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">No ledger entries for selected range</p>}
              {filteredLedger.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-10">Sl</th>
                        <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Date</th>
                        <th className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Description</th>
                        <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Debit</th>
                        <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Credit</th>
                        <th className="text-right px-4 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLedger.map((entry, idx) => {
                        const isCredit = entry.amount > 0;
                        const debit = !isCredit ? Math.abs(entry.amount) : 0;
                        const credit = isCredit ? entry.amount : 0;
                        return (
                          <tr
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{idx + 1}</td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{format(new Date(entry.date), "dd MMM yyyy")}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <p className="text-sm text-foreground truncate max-w-[280px]">{entry.description}</p>
                                <Badge className={`${typeConfig[entry.type].color} text-[9px] px-1.5 py-0 shrink-0`}>{typeConfig[entry.type].label}</Badge>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm font-medium text-destructive whitespace-nowrap">
                              {debit > 0 ? formatPrice(debit) : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm font-medium text-accent whitespace-nowrap">
                              {credit > 0 ? formatPrice(credit) : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm font-bold text-foreground whitespace-nowrap">
                              {formatPrice(entry.runningBalance)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50 border-t-2 border-border">
                        <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-foreground uppercase tracking-wider">Totals</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-destructive">
                          {formatPrice(filteredLedger.filter(e => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0))}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-accent">
                          {formatPrice(filteredLedger.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0))}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-foreground">
                          {filteredLedger.length > 0 ? formatPrice(filteredLedger[filteredLedger.length - 1].runningBalance) : "—"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* ── LEDGER DETAIL DIALOG ────────────────────────────────── */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-md">
          {selectedEntry && (() => {
            const cfg = typeConfig[selectedEntry.type];
            const Icon = cfg.icon;
            const isNegative = selectedEntry.amount < 0;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${cfg.color}`}><Icon className="w-3.5 h-3.5" /></div>
                    {cfg.label} Details
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="text-center py-3 rounded-xl bg-muted/50">
                    <p className={`text-3xl font-bold ${isNegative ? "text-destructive" : "text-accent"}`}>{isNegative ? "−" : "+"}{formatPrice(Math.abs(selectedEntry.amount))}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(selectedEntry.date), "dd MMMM yyyy")}</p>
                  </div>
                  <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm text-foreground">{selectedEntry.description}</p></div>
                  {selectedEntry.orderItems && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Order Items</p>
                      <div className="rounded-lg border border-border divide-y divide-border">
                        {selectedEntry.orderItems.map((item, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2">
                            <span className="text-sm text-foreground">{item.qty}× {item.name}</span>
                            <span className="text-sm font-medium text-foreground">{formatPrice(item.price * item.qty)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
                          <span className="text-sm font-semibold text-foreground">Total</span>
                          <span className="text-sm font-bold text-foreground">{formatPrice(selectedEntry.amount)}</span>
                        </div>
                      </div>
                      {selectedEntry.customerName && <p className="text-xs text-muted-foreground mt-2">Customer: <span className="text-foreground font-medium">{selectedEntry.customerName}</span></p>}
                    </div>
                  )}
                  {selectedEntry.penaltyReason && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5"><AlertTriangle className="w-3.5 h-3.5 text-destructive" /><p className="text-xs font-semibold text-destructive">Penalty Reason</p></div>
                      <p className="text-sm text-foreground leading-relaxed">{selectedEntry.penaltyReason}</p>
                    </div>
                  )}
                  {selectedEntry.paymentMethod && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Details</p>
                      <div className="rounded-lg border border-border p-3 space-y-1.5">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Method</span><span className="text-foreground font-medium">{selectedEntry.paymentMethod}</span></div>
                        {selectedEntry.paymentRef && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Reference</span><span className="text-foreground font-mono text-xs">{selectedEntry.paymentRef}</span></div>}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">Running Balance</span>
                    <span className="text-sm font-bold text-foreground">{formatPrice(selectedEntry.runningBalance)}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerReports;
