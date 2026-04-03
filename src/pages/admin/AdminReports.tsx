import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart3, TrendingUp, DollarSign, Users, ChefHat, ClipboardList,
  ArrowUpRight, ArrowDownRight, Eye, Search, MapPin, Building2,
  Layers, Target, ShieldCheck, UserCheck, Utensils, Star,
  Activity, Percent, Calendar, FileText, Edit, CheckCircle2,
  XCircle, Clock, Filter, ChevronRight, Globe, Package, Briefcase,
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { getAdminRole, getRoleConfig, type AdminRole } from "@/data/adminRoles";

/* ═══════════════════════════════════════════
   MOCK DATA — CEO-LEVEL MANAGEMENT DASHBOARD
   ═══════════════════════════════════════════ */

// ── Overview KPIs ──
const overviewKPIs = {
  totalRevenue: 1842500,
  revenueGrowth: 12.3,
  totalOrders: 1842,
  orderGrowth: 15.7,
  activePartners: 248,
  partnerGrowth: 8,
  activeUsers: 5120,
  userGrowth: 320,
  avgOrderValue: 1000,
  aovGrowth: 3.2,
  fulfillmentRate: 96.8,
  avgDeliveryTime: 38,
  customerSatisfaction: 4.6,
  partnerRetention: 94.2,
};

// ── Revenue by Month ──
const revenueByMonth = [
  { month: "Sep", revenue: 980000, orders: 1020, partners: 198 },
  { month: "Oct", revenue: 1120000, orders: 1180, partners: 212 },
  { month: "Nov", revenue: 1340000, orders: 1420, partners: 228 },
  { month: "Dec", revenue: 1580000, orders: 1650, partners: 238 },
  { month: "Jan", revenue: 1680000, orders: 1740, partners: 244 },
  { month: "Feb", revenue: 1842500, orders: 1842, partners: 248 },
];

// ── Verticals ──
const verticals = [
  { id: "shf", name: "SHF (Branded Home Food)", head: "Kavitha R.", revenue: 1200000, orders: 1150, partners: 142, kitchens: 168, growth: 14.2, status: "active" },
  { id: "hcf", name: "HCF (Marketplace)", head: "Kavitha R.", revenue: 642500, orders: 692, partners: 106, kitchens: 112, growth: 9.8, status: "active" },
  { id: "dst", name: "DST (Digital Stores)", head: "TBD", revenue: 0, orders: 0, partners: 0, kitchens: 0, growth: 0, status: "planned" },
  { id: "otc", name: "OTC (Over The Counter)", head: "TBD", revenue: 0, orders: 0, partners: 0, kitchens: 0, growth: 0, status: "planned" },
  { id: "essentials", name: "Essentials", head: "TBD", revenue: 0, orders: 0, partners: 0, kitchens: 0, growth: 0, status: "planned" },
];

// ── State-wise Data ──
const stateWiseData = [
  { state: "New York", code: "TN", partners: 68, kitchens: 82, orders: 520, revenue: 542000, leads: 45, growth: 18.5 },
  { state: "California", code: "KA", partners: 52, kitchens: 60, orders: 380, revenue: 398000, leads: 32, growth: 14.2 },
  { state: "Illinois", code: "TS", partners: 38, kitchens: 44, orders: 285, revenue: 295000, leads: 28, growth: 16.1 },
  { state: "Texas", code: "MH", partners: 42, kitchens: 48, orders: 310, revenue: 320000, leads: 35, growth: 11.8 },
  { state: "Phoenix NCR", code: "DL", partners: 28, kitchens: 30, orders: 198, revenue: 185000, leads: 22, growth: 21.3 },
  { state: "Uttar Pradesh", code: "UP", partners: 20, kitchens: 22, orders: 149, revenue: 102500, leads: 18, growth: 8.4 },
];

// ── Lead Funnel ──
const leadFunnel = [
  { stage: "New Leads", count: 420, color: "hsl(var(--chart-1))" },
  { stage: "Video Watched", count: 310, color: "hsl(var(--chart-2))" },
  { stage: "Paid Registration", count: 185, color: "hsl(var(--chart-3))" },
  { stage: "Approved", count: 142, color: "hsl(var(--chart-4))" },
  { stage: "Rejected", count: 43, color: "hsl(var(--chart-5))" },
];

// ── Top Partners ──
const topPartners = [
  { name: "Sujatha M.", rmn: "+1 (212) 555-0101", city: "New York", state: "TN", stream: "SHF", cuisine: "Chettinad", orders: 142, revenue: 124500, rating: 4.8, skid: "SK-TN-001" },
  { name: "Lakshmi R.", rmn: "+1 (312) 555-0103", city: "Chicago", state: "TS", stream: "SHF", cuisine: "Pennsylvania", orders: 118, revenue: 98200, rating: 4.7, skid: "SK-TS-001" },
  { name: "Priya K.", rmn: "+1 (310) 555-0102", city: "Bengaluru", state: "KA", stream: "HCF", cuisine: "North Indian", orders: 96, revenue: 82400, rating: 4.5, skid: "SK-KA-001" },
  { name: "Meena S.", rmn: "+1 (713) 555-0104", city: "Houston", state: "MH", stream: "HCF", cuisine: "Gujarati", orders: 84, revenue: 71800, rating: 4.6, skid: "SK-MH-001" },
  { name: "Anita D.", rmn: "+1 (602) 555-0105", city: "Phoenix", state: "DL", stream: "SHF", cuisine: "Florida", orders: 78, revenue: 68500, rating: 4.9, skid: "SK-DL-001" },
  { name: "Padma V.", rmn: "+1 (312) 555-0116", city: "Nagpur", state: "MH", stream: "HCF", cuisine: "Marathi", orders: 72, revenue: 62000, rating: 4.4, skid: "SK-MH-002" },
  { name: "Saroja T.", rmn: "+1 (646) 555-0114", city: "San Jose", state: "TN", stream: "SHF", cuisine: "Chettinad", orders: 65, revenue: 58200, rating: 4.7, skid: "SK-TN-002" },
  { name: "Kamala R.", rmn: "+1 (713) 555-0117", city: "Lucknow", state: "UP", stream: "HCF", cuisine: "Mughlai", orders: 58, revenue: 49500, rating: 4.3, skid: "SK-UP-001" },
];

// ── Recent Orders ──
const recentOrders = [
  { id: "SH-5024", customer: "C-***812", partner: "Sujatha M.", skid: "SK-TN-001", items: 3, amount: 850, status: "delivered", time: "12:45 PM", date: "02 Mar" },
  { id: "SH-5023", customer: "C-***445", partner: "Lakshmi R.", skid: "SK-TS-001", items: 5, amount: 1420, status: "preparing", time: "12:30 PM", date: "02 Mar" },
  { id: "SH-5022", customer: "C-***678", partner: "Priya K.", skid: "SK-KA-001", items: 2, amount: 580, status: "pending_acceptance", time: "12:15 PM", date: "02 Mar" },
  { id: "SH-5021", customer: "C-***901", partner: "Meena S.", skid: "SK-MH-001", items: 4, amount: 1100, status: "delivered", time: "11:58 AM", date: "02 Mar" },
  { id: "SH-5020", customer: "C-***234", partner: "Anita D.", skid: "SK-DL-001", items: 6, amount: 1800, status: "delivered", time: "11:42 AM", date: "02 Mar" },
  { id: "SH-5019", customer: "C-***567", partner: "Padma V.", skid: "SK-MH-002", items: 3, amount: 920, status: "cancelled", time: "11:30 AM", date: "02 Mar" },
  { id: "SH-5018", customer: "C-***890", partner: "Saroja T.", skid: "SK-TN-002", items: 4, amount: 1050, status: "delivered", time: "11:15 AM", date: "02 Mar" },
  { id: "SH-5017", customer: "C-***123", partner: "Kamala R.", skid: "SK-UP-001", items: 2, amount: 620, status: "delivered", time: "10:58 AM", date: "02 Mar" },
];

// ── Team Summary ──
const teamSummary = [
  { role: "Country Head", name: "Arvind S.", rem: "country@shero.in", department: "Leadership", kpiLabel: "Revenue", kpiValue: "$18.4L", status: "active" },
  { role: "Vertical Head (SAP & OPS)", name: "Kavitha R.", rem: "sapops@shero.in", department: "Operations", kpiLabel: "Active Kitchens", kpiValue: "280", status: "active" },
  { role: "Regional Manager", name: "Deepak M.", rem: "regional@shero.in", department: "South Region", kpiLabel: "Region Orders", kpiValue: "520", status: "active" },
  { role: "Onboarding Manager", name: "Meera R.", rem: "onboarding@shero.in", department: "KOB", kpiLabel: "Approved Kitchens", kpiValue: "142", status: "active" },
  { role: "KOBTL", name: "Divya N.", rem: "kobtl@shero.in", department: "KOB", kpiLabel: "Leads Processed", kpiValue: "310", status: "active" },
  { role: "SHF Manager", name: "Nithya P.", rem: "shf@shero.in", department: "Branded Ops", kpiLabel: "SHF Kitchens", kpiValue: "168", status: "active" },
  { role: "HCF Manager", name: "Preeti J.", rem: "hcf@shero.in", department: "Marketplace", kpiLabel: "HCF Kitchens", kpiValue: "112", status: "active" },
  { role: "SSC Manager", name: "Rekha M.", rem: "ssc-mgr@shero.in", department: "Support Center", kpiLabel: "Tickets/Day", kpiValue: "85", status: "active" },
  { role: "PPP Manager", name: "Ganesh R.", rem: "ppp-mgr@shero.in", department: "Payments", kpiLabel: "Weekly Payout", kpiValue: "$2.85L", status: "active" },
];

// ── Order Status Distribution ──
const orderStatusDist = [
  { name: "Delivered", value: 1580, color: "hsl(var(--chart-2))" },
  { name: "Preparing", value: 85, color: "hsl(var(--chart-1))" },
  { name: "Pending", value: 42, color: "hsl(var(--chart-3))" },
  { name: "Cancelled", value: 135, color: "hsl(var(--chart-5))" },
];

// ── Cuisine Performance ──
const cuisinePerformance = [
  { cuisine: "Chettinad", orders: 320, revenue: 285000, partners: 28, rating: 4.7 },
  { cuisine: "Pennsylvania", orders: 245, revenue: 218000, partners: 22, rating: 4.6 },
  { cuisine: "North Indian", orders: 210, revenue: 195000, partners: 24, rating: 4.5 },
  { cuisine: "Gujarati", orders: 180, revenue: 158000, partners: 18, rating: 4.4 },
  { cuisine: "Florida", orders: 165, revenue: 148000, partners: 16, rating: 4.8 },
  { cuisine: "Marathi", orders: 155, revenue: 135000, partners: 15, rating: 4.3 },
  { cuisine: "Mughlai", orders: 142, revenue: 128000, partners: 14, rating: 4.5 },
  { cuisine: "Bengali", orders: 98, revenue: 85000, partners: 10, rating: 4.6 },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  orders: { label: "Orders", color: "hsl(var(--chart-2))" },
  partners: { label: "Partners", color: "hsl(var(--chart-3))" },
  kitchens: { label: "Kitchens", color: "hsl(var(--chart-4))" },
  leads: { label: "Leads", color: "hsl(var(--chart-5))" },
  mrp: { label: "MRP", color: "hsl(var(--chart-1))" },
  ppp: { label: "PPP", color: "hsl(var(--chart-2))" },
};

function fmt(amount: number): string {
  if (amount >= 100000) return `$${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString("en-US")}`;
}

const orderStatusColors: Record<string, string> = {
  delivered: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  preparing: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  pending_acceptance: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

/* ═══════════════════════════════
   COMPONENT
   ═══════════════════════════════ */

export default function AdminReports() {
  const role = getAdminRole();
  const roleConfig = role ? getRoleConfig(role) : null;
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [streamFilter, setStreamFilter] = useState("all");
  const [drillPartner, setDrillPartner] = useState<typeof topPartners[0] | null>(null);
  const [drillOrder, setDrillOrder] = useState<typeof recentOrders[0] | null>(null);
  const [drillTeam, setDrillTeam] = useState<typeof teamSummary[0] | null>(null);

  const isCEO = !role || role === "super_admin" || role === "country_manager";
  const isVerticalHead = role === "vertical_head";
  const isRegional = role === "regional_manager";

  const filteredPartners = useMemo(() => {
    return topPartners.filter((p) => {
      if (stateFilter !== "all" && p.state !== stateFilter) return false;
      if (streamFilter !== "all" && p.stream !== streamFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.rmn.includes(search) && !p.skid.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, stateFilter, streamFilter]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Management Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isCEO ? "CEO Command Center — Full business intelligence & drill-down" :
             isVerticalHead ? "Vertical Operations — SAP & OPS deep-dive" :
             isRegional ? "Regional Performance — Your region at a glance" :
             `${roleConfig?.label || "Admin"} Dashboard`}
          </p>
        </div>
        {roleConfig && (
          <Badge variant="outline" className="text-[10px] gap-1">
            <ShieldCheck className="w-3 h-3" /> {roleConfig.label}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-11 p-1 gap-1 flex-wrap">
          <TabsTrigger value="overview" className="gap-1.5 text-xs px-3 py-2.5">
            <Activity className="w-3.5 h-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="verticals" className="gap-1.5 text-xs px-3 py-2.5">
            <Layers className="w-3.5 h-3.5" /> Verticals
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-1.5 text-xs px-3 py-2.5">
            <ChefHat className="w-3.5 h-3.5" /> Partners & Kitchens
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5 text-xs px-3 py-2.5">
            <ClipboardList className="w-3.5 h-3.5" /> Orders & Revenue
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs px-3 py-2.5">
            <Users className="w-3.5 h-3.5" /> Team & Ops
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-1.5 text-xs px-3 py-2.5">
            <Target className="w-3.5 h-3.5" /> Leads & Funnel
          </TabsTrigger>
        </TabsList>

        {/* ═══════ OVERVIEW ═══════ */}
        <TabsContent value="overview" className="space-y-5 mt-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "Total Revenue", value: fmt(overviewKPIs.totalRevenue), change: `+${overviewKPIs.revenueGrowth}%`, icon: DollarSign, up: true },
              { label: "Orders", value: overviewKPIs.totalOrders.toLocaleString(), change: `+${overviewKPIs.orderGrowth}%`, icon: ClipboardList, up: true },
              { label: "Active Partners", value: String(overviewKPIs.activePartners), change: `+${overviewKPIs.partnerGrowth}`, icon: ChefHat, up: true },
              { label: "Active Users", value: overviewKPIs.activeUsers.toLocaleString(), change: `+${overviewKPIs.userGrowth}`, icon: Users, up: true },
              { label: "Avg Order Value", value: fmt(overviewKPIs.avgOrderValue), change: `+${overviewKPIs.aovGrowth}%`, icon: TrendingUp, up: true },
              { label: "Fulfillment %", value: `${overviewKPIs.fulfillmentRate}%`, change: "+0.8%", icon: CheckCircle2, up: true },
              { label: "CSAT", value: `${overviewKPIs.customerSatisfaction}/5`, change: "+0.1", icon: Star, up: true },
            ].map((k) => (
              <Card key={k.label}><CardContent className="p-3">
                <k.icon className="w-4 h-4 text-primary/60 mb-1.5" />
                <p className="text-base font-bold text-foreground">{k.value}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{k.label}</p>
                <p className={`text-[9px] font-medium mt-0.5 flex items-center gap-0.5 ${k.up ? "text-green-600" : "text-destructive"}`}>
                  {k.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />} {k.change}
                </p>
              </CardContent></Card>
            ))}
          </div>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Revenue & Order Trend (6 Months)</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <AreaChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis yAxisId="rev" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 100000).toFixed(1)}L`} className="fill-muted-foreground" />
                  <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.12} strokeWidth={2} />
                  <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* State-wise Quick View + Order Status */}
          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">State-wise Revenue</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart data={stateWiseData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="code" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} className="fill-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Order Status Distribution</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="h-[220px] w-full max-w-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={orderStatusDist} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {orderStatusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ VERTICALS ═══════ */}
        <TabsContent value="verticals" className="space-y-5 mt-5">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verticals.map((v) => (
              <Card key={v.id} className={v.status === "planned" ? "opacity-50" : ""}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{v.name}</p>
                      <p className="text-[10px] text-muted-foreground">Head: {v.head}</p>
                    </div>
                    <Badge className={`text-[9px] border-0 ${v.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {v.status}
                    </Badge>
                  </div>
                  {v.status === "active" && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-muted/40 p-2">
                          <p className="text-xs font-bold text-foreground">{fmt(v.revenue)}</p>
                          <p className="text-[9px] text-muted-foreground">Revenue</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-2">
                          <p className="text-xs font-bold text-foreground">{v.orders.toLocaleString()}</p>
                          <p className="text-[9px] text-muted-foreground">Orders</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-2">
                          <p className="text-xs font-bold text-foreground">{v.partners}</p>
                          <p className="text-[9px] text-muted-foreground">Partners</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-2">
                          <p className="text-xs font-bold text-foreground">{v.kitchens}</p>
                          <p className="text-[9px] text-muted-foreground">Kitchens</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" /> +{v.growth}% growth
                      </p>
                    </>
                  )}
                  {v.status === "planned" && (
                    <p className="text-xs text-muted-foreground italic">Launching soon</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cuisine Performance Table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Cuisine Performance Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <BarChart data={cuisinePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} className="fill-muted-foreground" />
                  <YAxis dataKey="cuisine" type="category" tick={{ fontSize: 10 }} width={80} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Cuisine Detail Table</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold">Cuisine</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Partners</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Orders</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Revenue</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Avg Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cuisinePerformance.map((c) => (
                    <TableRow key={c.cuisine}>
                      <TableCell className="text-xs font-medium text-foreground">{c.cuisine}</TableCell>
                      <TableCell className="text-xs text-right">{c.partners}</TableCell>
                      <TableCell className="text-xs text-right">{c.orders}</TableCell>
                      <TableCell className="text-xs text-right">{fmt(c.revenue)}</TableCell>
                      <TableCell className="text-xs text-right"><span className="flex items-center justify-end gap-0.5"><Star className="w-3 h-3 text-amber-500 fill-amber-500" />{c.rating}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ PARTNERS & KITCHENS ═══════ */}
        <TabsContent value="partners" className="space-y-5 mt-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, RMN, or SKID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
              </div>
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {["TN", "KA", "TS", "MH", "DL", "UP"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={streamFilter} onValueChange={setStreamFilter}>
              <SelectTrigger className="w-28 h-9 text-xs"><SelectValue placeholder="Stream" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="SHF">SHF</SelectItem>
                <SelectItem value="HCF">HCF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Partners Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold">Partner</TableHead>
                  <TableHead className="text-[10px] font-semibold">SKID</TableHead>
                  <TableHead className="text-[10px] font-semibold">Location</TableHead>
                  <TableHead className="text-[10px] font-semibold">Stream</TableHead>
                  <TableHead className="text-[10px] font-semibold">Cuisine</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Orders</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Revenue</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Rating</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map((p) => (
                  <TableRow key={p.skid} className="hover:bg-muted/20">
                    <TableCell className="py-2.5">
                      <p className="text-xs font-medium text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.rmn}</p>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{p.skid}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{p.city}, {p.state}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[9px]">{p.stream}</Badge></TableCell>
                    <TableCell className="text-xs text-foreground">{p.cuisine}</TableCell>
                    <TableCell className="text-xs text-right text-foreground">{p.orders}</TableCell>
                    <TableCell className="text-xs text-right font-medium text-foreground">{fmt(p.revenue)}</TableCell>
                    <TableCell className="text-xs text-right">
                      <span className="flex items-center justify-end gap-0.5"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {p.rating}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDrillPartner(p)}><Eye className="w-3.5 h-3.5" /></Button>
                        {isCEO && <Button size="icon" variant="ghost" className="h-7 w-7"><Edit className="w-3.5 h-3.5" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* State-wise Partner Summary */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">State-wise Partner & Kitchen Distribution</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold">State</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Partners</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Kitchens</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Orders</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Revenue</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">New Leads</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stateWiseData.map((s) => (
                    <TableRow key={s.code}>
                      <TableCell className="text-xs font-medium text-foreground">{s.state}</TableCell>
                      <TableCell className="text-xs text-right">{s.partners}</TableCell>
                      <TableCell className="text-xs text-right">{s.kitchens}</TableCell>
                      <TableCell className="text-xs text-right">{s.orders}</TableCell>
                      <TableCell className="text-xs text-right">{fmt(s.revenue)}</TableCell>
                      <TableCell className="text-xs text-right">{s.leads}</TableCell>
                      <TableCell className="text-xs text-right text-green-600 font-medium">+{s.growth}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ ORDERS & REVENUE ═══════ */}
        <TabsContent value="orders" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Today's Orders</p>
              <p className="text-lg font-bold text-foreground">87</p>
              <p className="text-[9px] text-green-600 flex items-center justify-center gap-0.5"><ArrowUpRight className="w-2.5 h-2.5" /> +12%</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Today's Revenue</p>
              <p className="text-lg font-bold text-foreground">{fmt(92500)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Avg Delivery Time</p>
              <p className="text-lg font-bold text-foreground">{overviewKPIs.avgDeliveryTime} min</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Cancellation Rate</p>
              <p className="text-lg font-bold text-destructive">3.2%</p>
              <p className="text-[9px] text-green-600 flex items-center justify-center gap-0.5"><ArrowDownRight className="w-2.5 h-2.5" /> -0.5%</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Rejection Rate</p>
              <p className="text-lg font-bold text-amber-600">1.8%</p>
            </CardContent></Card>
          </div>

          {/* Recent Orders Table */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Recent Orders (Live)</CardTitle>
                <Badge variant="outline" className="text-[9px] gap-1"><Activity className="w-3 h-3 text-green-500" /> Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-[10px] font-semibold">Order ID</TableHead>
                      <TableHead className="text-[10px] font-semibold">Customer</TableHead>
                      <TableHead className="text-[10px] font-semibold">Partner / SKID</TableHead>
                      <TableHead className="text-[10px] font-semibold text-right">Items</TableHead>
                      <TableHead className="text-[10px] font-semibold text-right">Amount</TableHead>
                      <TableHead className="text-[10px] font-semibold">Status</TableHead>
                      <TableHead className="text-[10px] font-semibold">Time</TableHead>
                      <TableHead className="text-[10px] font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((o) => (
                      <TableRow key={o.id} className="hover:bg-muted/20">
                        <TableCell className="text-xs font-mono font-medium text-foreground">{o.id}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{o.customer}</TableCell>
                        <TableCell className="py-2">
                          <p className="text-xs font-medium text-foreground">{o.partner}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{o.skid}</p>
                        </TableCell>
                        <TableCell className="text-xs text-right">{o.items}</TableCell>
                        <TableCell className="text-xs text-right font-medium text-foreground">{fmt(o.amount)}</TableCell>
                        <TableCell>
                          <Badge className={`${orderStatusColors[o.status]} text-[9px] border-0 capitalize`}>
                            {o.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{o.time}<br />{o.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDrillOrder(o)}><Eye className="w-3.5 h-3.5" /></Button>
                            {isCEO && <Button size="icon" variant="ghost" className="h-7 w-7"><Edit className="w-3.5 h-3.5" /></Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue Trend */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Monthly Revenue vs Orders</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <LineChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis yAxisId="r" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 100000).toFixed(1)}L`} className="fill-muted-foreground" />
                  <YAxis yAxisId="o" orientation="right" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line yAxisId="r" type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="o" type="monotone" dataKey="orders" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ TEAM & OPS ═══════ */}
        <TabsContent value="team" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Total Team Size</p>
              <p className="text-lg font-bold text-foreground">{teamSummary.length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Departments</p>
              <p className="text-lg font-bold text-foreground">{new Set(teamSummary.map(t => t.department)).size}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Active Roles</p>
              <p className="text-lg font-bold text-foreground">{teamSummary.filter(t => t.status === "active").length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Partner Retention</p>
              <p className="text-lg font-bold text-foreground">{overviewKPIs.partnerRetention}%</p>
            </CardContent></Card>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] font-semibold">Role</TableHead>
                  <TableHead className="text-[10px] font-semibold">Name</TableHead>
                  <TableHead className="text-[10px] font-semibold">REM</TableHead>
                  <TableHead className="text-[10px] font-semibold">Department</TableHead>
                  <TableHead className="text-[10px] font-semibold">Key KPI</TableHead>
                  <TableHead className="text-[10px] font-semibold">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamSummary.map((t) => (
                  <TableRow key={t.rem} className="hover:bg-muted/20">
                    <TableCell className="text-xs font-medium text-foreground">{t.role}</TableCell>
                    <TableCell className="text-xs text-foreground">{t.name}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground font-mono">{t.rem}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.department}</TableCell>
                    <TableCell className="text-xs">
                      <span className="text-muted-foreground">{t.kpiLabel}: </span>
                      <span className="font-semibold text-foreground">{t.kpiValue}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-[9px] border-0">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDrillTeam(t)}><Eye className="w-3.5 h-3.5" /></Button>
                        {isCEO && <Button size="icon" variant="ghost" className="h-7 w-7"><Edit className="w-3.5 h-3.5" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ═══════ LEADS & FUNNEL ═══════ */}
        <TabsContent value="leads" className="space-y-5 mt-5">
          {/* Funnel KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {leadFunnel.map((f) => (
              <Card key={f.stage}><CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground">{f.stage}</p>
                <p className="text-xl font-bold text-foreground">{f.count}</p>
                {f.stage !== "New Leads" && f.stage !== "Rejected" && (
                  <p className="text-[9px] text-muted-foreground">{((f.count / leadFunnel[0].count) * 100).toFixed(1)}% conversion</p>
                )}
              </CardContent></Card>
            ))}
          </div>

          {/* Funnel Visualization */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Lead Funnel Pipeline</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <BarChart data={leadFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 10 }} width={110} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {leadFunnel.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* State-wise Lead Distribution */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">State-wise Lead Distribution</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={stateWiseData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="code" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="leads" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="partners" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Conversion Metrics */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Funnel Conversion Metrics</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold">Stage</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Count</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">% of Total</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">Stage Conversion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadFunnel.map((f, i) => (
                    <TableRow key={f.stage}>
                      <TableCell className="text-xs font-medium text-foreground">{f.stage}</TableCell>
                      <TableCell className="text-xs text-right font-semibold">{f.count}</TableCell>
                      <TableCell className="text-xs text-right">{((f.count / leadFunnel[0].count) * 100).toFixed(1)}%</TableCell>
                      <TableCell className="text-xs text-right">
                        {i === 0 ? "—" : `${((f.count / leadFunnel[i - 1].count) * 100).toFixed(1)}%`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══════ DRILL-DOWN DIALOGS ═══════ */}

      {/* Partner Drill-Down */}
      <Dialog open={!!drillPartner} onOpenChange={() => setDrillPartner(null)}>
        <DialogContent className="max-w-lg">
          {drillPartner && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-primary" /> {drillPartner.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">RMN:</span> <span className="text-foreground font-medium">{drillPartner.rmn}</span></div>
                  <div><span className="text-muted-foreground">SKID:</span> <span className="text-foreground font-mono">{drillPartner.skid}</span></div>
                  <div><span className="text-muted-foreground">Location:</span> <span className="text-foreground">{drillPartner.city}, {drillPartner.state}</span></div>
                  <div><span className="text-muted-foreground">Stream:</span> <Badge variant="outline" className="text-[9px] ml-1">{drillPartner.stream}</Badge></div>
                  <div><span className="text-muted-foreground">Cuisine:</span> <span className="text-foreground">{drillPartner.cuisine}</span></div>
                  <div><span className="text-muted-foreground">Rating:</span> <span className="flex items-center gap-0.5 text-foreground"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {drillPartner.rating}</span></div>
                </div>
                <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-lg font-bold text-foreground">{drillPartner.orders}</p>
                    <p className="text-[10px] text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-lg font-bold text-foreground">{fmt(drillPartner.revenue)}</p>
                    <p className="text-[10px] text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
                {isCEO && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs"><Edit className="w-3 h-3" /> Edit Partner</Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs"><CheckCircle2 className="w-3 h-3" /> Approve Changes</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Drill-Down */}
      <Dialog open={!!drillOrder} onOpenChange={() => setDrillOrder(null)}>
        <DialogContent className="max-w-md">
          {drillOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" /> Order {drillOrder.id}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Customer:</span> <span className="text-foreground font-mono">{drillOrder.customer}</span></div>
                  <div><span className="text-muted-foreground">Partner:</span> <span className="text-foreground font-medium">{drillOrder.partner}</span></div>
                  <div><span className="text-muted-foreground">SKID:</span> <span className="text-foreground font-mono">{drillOrder.skid}</span></div>
                  <div><span className="text-muted-foreground">Items:</span> <span className="text-foreground">{drillOrder.items}</span></div>
                  <div><span className="text-muted-foreground">Amount:</span> <span className="text-foreground font-semibold">{fmt(drillOrder.amount)}</span></div>
                  <div><span className="text-muted-foreground">Time:</span> <span className="text-foreground">{drillOrder.time}, {drillOrder.date}</span></div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <Badge className={`${orderStatusColors[drillOrder.status]} text-[9px] border-0 capitalize`}>{drillOrder.status.replace("_", " ")}</Badge>
                </div>
                {isCEO && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs"><Edit className="w-3 h-3" /> Modify Order</Button>
                    {drillOrder.status !== "cancelled" && drillOrder.status !== "delivered" && (
                      <Button size="sm" variant="destructive" className="gap-1 text-xs"><XCircle className="w-3 h-3" /> Cancel</Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Team Drill-Down */}
      <Dialog open={!!drillTeam} onOpenChange={() => setDrillTeam(null)}>
        <DialogContent className="max-w-md">
          {drillTeam && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> {drillTeam.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Role:</span> <span className="text-foreground font-medium">{drillTeam.role}</span></div>
                  <div><span className="text-muted-foreground">REM:</span> <span className="text-foreground font-mono">{drillTeam.rem}</span></div>
                  <div><span className="text-muted-foreground">Department:</span> <span className="text-foreground">{drillTeam.department}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-[9px] border-0 ml-1">Active</Badge></div>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-[10px] text-muted-foreground">{drillTeam.kpiLabel}</p>
                    <p className="text-xl font-bold text-foreground">{drillTeam.kpiValue}</p>
                  </div>
                </div>
                {isCEO && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs"><Edit className="w-3 h-3" /> Edit Member</Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs"><CheckCircle2 className="w-3 h-3" /> Approve Actions</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
