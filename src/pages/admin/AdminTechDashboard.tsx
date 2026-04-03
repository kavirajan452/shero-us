import { useState } from "react";
import { 
  Activity, Shield, CheckCircle, AlertTriangle, XCircle, Clock, 
  TrendingUp, TrendingDown, IndianRupee, Bike, Plug, Server,
  Zap, RefreshCw, Bell, ArrowUpRight, ArrowDownRight, Minus,
  CreditCard, Truck, MessageSquare, MapPin, Database, Cloud,
  BarChart3, Eye, FileText, AlertCircle, Timer, Radio
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";

// ── System Health Data ──

interface ServiceStatus {
  name: string;
  category: string;
  status: "operational" | "degraded" | "down" | "maintenance";
  uptime: number;
  latency: number; // ms
  lastCheck: string;
  icon: typeof Activity;
  errorRate: number;
  requestsToday: number;
}

const services: ServiceStatus[] = [
  { name: "Razorpay Gateway", category: "Payments", status: "operational", uptime: 99.97, latency: 120, lastCheck: "30s ago", icon: CreditCard, errorRate: 0.3, requestsToday: 4250 },
  { name: "Cashfree Payouts", category: "Payments", status: "operational", uptime: 99.95, latency: 180, lastCheck: "1m ago", icon: IndianRupee, errorRate: 0.1, requestsToday: 85 },
  { name: "Dunzo Fleet", category: "Delivery", status: "operational", uptime: 99.8, latency: 95, lastCheck: "15s ago", icon: Bike, errorRate: 0.8, requestsToday: 1280 },
  { name: "Shadowfax Fleet", category: "Delivery", status: "operational", uptime: 99.6, latency: 110, lastCheck: "20s ago", icon: Truck, errorRate: 1.2, requestsToday: 950 },
  { name: "Porter Fleet", category: "Delivery", status: "degraded", uptime: 98.2, latency: 340, lastCheck: "45s ago", icon: Truck, errorRate: 3.5, requestsToday: 420 },
  { name: "Own Fleet Tracking", category: "Delivery", status: "operational", uptime: 99.99, latency: 45, lastCheck: "10s ago", icon: MapPin, errorRate: 0.02, requestsToday: 1860 },
  { name: "Google Maps API", category: "Location", status: "operational", uptime: 99.99, latency: 65, lastCheck: "5s ago", icon: MapPin, errorRate: 0.01, requestsToday: 12450 },
  { name: "WhatsApp Business", category: "Messaging", status: "operational", uptime: 99.9, latency: 200, lastCheck: "30s ago", icon: MessageSquare, errorRate: 0.5, requestsToday: 3200 },
  { name: "Twilio SMS/OTP", category: "Messaging", status: "operational", uptime: 99.95, latency: 150, lastCheck: "1m ago", icon: MessageSquare, errorRate: 0.2, requestsToday: 1840 },
  { name: "Firebase Push", category: "Notifications", status: "operational", uptime: 99.98, latency: 80, lastCheck: "15s ago", icon: Bell, errorRate: 0.1, requestsToday: 8200 },
  { name: "SendGrid Email", category: "Email", status: "degraded", uptime: 99.1, latency: 420, lastCheck: "2m ago", icon: FileText, errorRate: 2.1, requestsToday: 420 },
  { name: "AWS S3 Storage", category: "Infrastructure", status: "operational", uptime: 99.999, latency: 35, lastCheck: "5s ago", icon: Database, errorRate: 0.001, requestsToday: 950 },
  { name: "Supabase DB", category: "Infrastructure", status: "operational", uptime: 99.98, latency: 12, lastCheck: "5s ago", icon: Database, errorRate: 0.01, requestsToday: 45200 },
  { name: "CDN (Cloudflare)", category: "Infrastructure", status: "operational", uptime: 99.999, latency: 8, lastCheck: "5s ago", icon: Cloud, errorRate: 0.001, requestsToday: 128000 },
];

// ── Hourly Traffic Data ──

const trafficData = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0") + ":00";
  const base = i >= 7 && i <= 22 ? 800 : 120;
  const peak = (i >= 11 && i <= 14) || (i >= 18 && i <= 21) ? 1.8 : 1;
  return {
    hour,
    requests: Math.round(base * peak * (0.85 + Math.random() * 0.3)),
    errors: Math.round(base * peak * 0.01 * (0.5 + Math.random())),
    latency: Math.round(80 + Math.random() * 60 + (peak > 1 ? 40 : 0)),
  };
});

// ── Payment Summary ──

const paymentSummary = {
  todayVolume: 284500,
  todayCount: 342,
  successRate: 96.8,
  avgProcessing: "1.2s",
  refundsToday: 8,
  refundAmount: 12400,
  pendingSettlement: 185000,
  failedToday: 11,
};

const paymentMethods = [
  { name: "UPI", value: 68, color: "hsl(var(--primary))" },
  { name: "Card", value: 18, color: "hsl(var(--accent))" },
  { name: "Net Banking", value: 9, color: "hsl(142, 71%, 45%)" },
  { name: "Wallet", value: 5, color: "hsl(38, 92%, 50%)" },
];

// ── Delivery Summary ──

const deliverySummary = {
  activeOrders: 47,
  completedToday: 451,
  avgDeliveryTime: "24 min",
  onTimeRate: 94.2,
  slaBreaches: 6,
  cancelledToday: 3,
};

const deliveryByPartner = [
  { name: "Own Fleet", orders: 186, avgTime: 18, success: 98.5 },
  { name: "Dunzo", orders: 128, avgTime: 22, success: 97.2 },
  { name: "Shadowfax", orders: 95, avgTime: 25, success: 95.8 },
  { name: "Porter", orders: 42, avgTime: 28, success: 94.1 },
];

// ── Incidents ──

interface Incident {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  service: string;
  status: "open" | "investigating" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  impact: string;
}

const incidents: Incident[] = [
  { id: "INC-047", title: "Porter API response time >500ms", severity: "medium", service: "Porter Fleet", status: "investigating", createdAt: "2026-03-17 21:30", impact: "Delayed auto-assignment for 3-8km orders" },
  { id: "INC-046", title: "SendGrid rate limit warning", severity: "low", service: "SendGrid Email", status: "open", createdAt: "2026-03-17 20:15", impact: "Email delivery may slow if quota exceeds 80%" },
  { id: "INC-045", title: "Razorpay webhook timeout spike", severity: "high", service: "Razorpay Gateway", status: "resolved", createdAt: "2026-03-17 14:20", resolvedAt: "2026-03-17 14:45", impact: "Payment confirmation delayed for ~12 orders" },
  { id: "INC-044", title: "Google Maps geocoding quota 85%", severity: "medium", service: "Google Maps API", status: "resolved", createdAt: "2026-03-16 18:00", resolvedAt: "2026-03-16 18:30", impact: "Proactive alert — no user impact" },
  { id: "INC-043", title: "Shadowfax tracking API 503 errors", severity: "high", service: "Shadowfax Fleet", status: "resolved", createdAt: "2026-03-16 12:10", resolvedAt: "2026-03-16 12:35", impact: "Live tracking unavailable for ~25 min" },
  { id: "INC-042", title: "WhatsApp template rejection", severity: "low", service: "WhatsApp Business", status: "resolved", createdAt: "2026-03-15 10:00", resolvedAt: "2026-03-15 16:00", impact: "New promotional template delayed, workaround used" },
];

// ── Helpers ──

const statusColor = (s: ServiceStatus["status"]) => {
  if (s === "operational") return "text-emerald-600";
  if (s === "degraded") return "text-amber-600";
  if (s === "down") return "text-destructive";
  return "text-blue-600";
};

const statusBg = (s: ServiceStatus["status"]) => {
  if (s === "operational") return "bg-emerald-500";
  if (s === "degraded") return "bg-amber-500";
  if (s === "down") return "bg-destructive";
  return "bg-blue-500";
};

const statusLabel = (s: ServiceStatus["status"]) => {
  if (s === "operational") return "Operational";
  if (s === "degraded") return "Degraded";
  if (s === "down") return "Down";
  return "Maintenance";
};

const severityConfig: Record<string, { color: string; bg: string }> = {
  critical: { color: "text-destructive", bg: "bg-destructive/10" },
  high: { color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-950" },
  medium: { color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950" },
  low: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950" },
};

const customTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}{p.dataKey === "latency" ? "ms" : ""}
        </p>
      ))}
    </div>
  );
};

// ── Main Component ──

export default function AdminTechDashboard() {
  const [incidentFilter, setIncidentFilter] = useState<"all" | "open" | "resolved">("all");

  const operational = services.filter((s) => s.status === "operational").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const down = services.filter((s) => s.status === "down").length;
  const overallUptime = (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2);
  const avgLatency = Math.round(services.reduce((sum, s) => sum + s.latency, 0) / services.length);
  const totalRequests = services.reduce((sum, s) => sum + s.requestsToday, 0);
  const openIncidents = incidents.filter((i) => i.status !== "resolved").length;

  const filteredIncidents = incidents.filter((i) => {
    if (incidentFilter === "open") return i.status !== "resolved";
    if (incidentFilter === "resolved") return i.status === "resolved";
    return true;
  });

  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Tech Control Centre
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Unified monitoring — Payments, Delivery, APIs, Infrastructure & Incidents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Last sync: 30s ago
          </div>
          <Button size="sm" variant="outline" className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* ── Overall Health Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "System Health", value: down === 0 && degraded === 0 ? "All Green" : degraded > 0 ? `${degraded} Degraded` : `${down} Down`, icon: Shield, accent: down > 0 ? "text-destructive" : degraded > 0 ? "text-amber-600" : "text-emerald-600", bgAccent: down > 0 ? "bg-destructive/10" : degraded > 0 ? "bg-amber-100 dark:bg-amber-950" : "bg-emerald-100 dark:bg-emerald-950" },
          { label: "Uptime (Avg)", value: `${overallUptime}%`, icon: TrendingUp, accent: "text-emerald-600", bgAccent: "bg-emerald-100 dark:bg-emerald-950" },
          { label: "Avg Latency", value: `${avgLatency}ms`, icon: Timer, accent: avgLatency < 200 ? "text-emerald-600" : "text-amber-600", bgAccent: avgLatency < 200 ? "bg-emerald-100 dark:bg-emerald-950" : "bg-amber-100 dark:bg-amber-950" },
          { label: "Total Requests", value: totalRequests.toLocaleString(), icon: BarChart3, accent: "text-primary", bgAccent: "bg-primary/10" },
          { label: "Services", value: `${operational}/${services.length}`, icon: Server, accent: "text-foreground", bgAccent: "bg-muted" },
          { label: "Open Incidents", value: openIncidents, icon: AlertCircle, accent: openIncidents > 0 ? "text-orange-600" : "text-emerald-600", bgAccent: openIncidents > 0 ? "bg-orange-100 dark:bg-orange-950" : "bg-emerald-100 dark:bg-emerald-950" },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${s.bgAccent} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-4 h-4 ${s.accent}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="text-xs gap-1.5"><Activity className="w-3.5 h-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Payments</TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs gap-1.5"><Bike className="w-3.5 h-3.5" /> Delivery</TabsTrigger>
          <TabsTrigger value="services" className="text-xs gap-1.5"><Plug className="w-3.5 h-3.5" /> Services</TabsTrigger>
          <TabsTrigger value="incidents" className="text-xs gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Incidents</TabsTrigger>
        </TabsList>

        {/* ════════ OVERVIEW TAB ════════ */}
        <TabsContent value="overview" className="space-y-4">
          {/* Service Status Grid */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary" /> Live Service Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {services.map((svc) => (
                <div key={svc.name} className="rounded-lg border border-border p-2.5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={`w-2 h-2 rounded-full ${statusBg(svc.status)} ${svc.status === "operational" ? "" : "animate-pulse"}`} />
                    <span className="text-[10px] font-medium text-foreground truncate">{svc.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                    <span>{svc.uptime}%</span>
                    <span>{svc.latency}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Chart */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">24h Traffic & Error Rate</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={2} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={customTooltip} />
                  <Area type="monotone" dataKey="requests" name="Requests" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                  <Area type="monotone" dataKey="errors" name="Errors" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.1)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Glance: Payment + Delivery side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Quick */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Payment Snapshot
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Today's Volume", value: `₹${(paymentSummary.todayVolume / 1000).toFixed(1)}K` },
                  { label: "Transactions", value: paymentSummary.todayCount },
                  { label: "Success Rate", value: `${paymentSummary.successRate}%` },
                  { label: "Failed", value: paymentSummary.failedToday },
                ].map((m) => (
                  <div key={m.label} className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-sm font-bold text-foreground">{m.value}</p>
                    <p className="text-[9px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Quick */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Bike className="w-4 h-4 text-primary" /> Delivery Snapshot
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Active Orders", value: deliverySummary.activeOrders },
                  { label: "Completed Today", value: deliverySummary.completedToday },
                  { label: "Avg Time", value: deliverySummary.avgDeliveryTime },
                  { label: "On-Time Rate", value: `${deliverySummary.onTimeRate}%` },
                ].map((m) => (
                  <div key={m.label} className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-sm font-bold text-foreground">{m.value}</p>
                    <p className="text-[9px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ════════ PAYMENTS TAB ════════ */}
        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Today's Volume", value: `₹${(paymentSummary.todayVolume / 1000).toFixed(1)}K`, icon: IndianRupee, accent: "text-emerald-600", trend: "+12.3%", up: true },
              { label: "Success Rate", value: `${paymentSummary.successRate}%`, icon: CheckCircle, accent: "text-emerald-600", trend: "+0.4%", up: true },
              { label: "Avg Processing", value: paymentSummary.avgProcessing, icon: Timer, accent: "text-primary", trend: "-0.1s", up: true },
              { label: "Failed Today", value: paymentSummary.failedToday, icon: XCircle, accent: "text-destructive", trend: "-3", up: true },
            ].map((s) => (
              <Card key={s.label} className="border-border">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <s.icon className={`w-4 h-4 ${s.accent}`} />
                    <span className={`text-[10px] flex items-center gap-0.5 ${s.up ? "text-emerald-600" : "text-destructive"}`}>
                      {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {s.trend}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method Split */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method Split</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {paymentMethods.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Settlements & Refunds */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Settlement & Refunds</h3>
              {[
                { label: "Pending Settlement", value: `₹${(paymentSummary.pendingSettlement / 1000).toFixed(1)}K`, accent: "text-amber-600" },
                { label: "Refunds Today", value: `${paymentSummary.refundsToday} (₹${(paymentSummary.refundAmount / 1000).toFixed(1)}K)`, accent: "text-blue-600" },
                { label: "Transactions Today", value: paymentSummary.todayCount.toLocaleString(), accent: "text-foreground" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.accent}`}>{item.value}</span>
                </div>
              ))}

              {/* Gateway Health */}
              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Gateway Health</p>
                {services.filter((s) => s.category === "Payments").map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusBg(svc.status)}`} />
                      <span className="text-xs text-foreground">{svc.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{svc.latency}ms</span>
                      <span>{svc.uptime}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ════════ DELIVERY TAB ════════ */}
        <TabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Active Orders", value: deliverySummary.activeOrders, icon: Zap, accent: "text-primary" },
              { label: "Completed Today", value: deliverySummary.completedToday, icon: CheckCircle, accent: "text-emerald-600" },
              { label: "Avg Delivery Time", value: deliverySummary.avgDeliveryTime, icon: Clock, accent: "text-blue-600" },
              { label: "SLA Breaches", value: deliverySummary.slaBreaches, icon: AlertTriangle, accent: deliverySummary.slaBreaches > 5 ? "text-destructive" : "text-amber-600" },
            ].map((s) => (
              <Card key={s.label} className="border-border">
                <CardContent className="py-3 px-4">
                  <s.icon className={`w-4 h-4 ${s.accent} mb-1`} />
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Delivery Partners Performance */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Fleet Partner Performance</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryByPartner} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={customTooltip} />
                  <Bar dataKey="orders" name="Orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Partner Details Table */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Partner Comparison</h3>
            <div className="space-y-2">
              {deliveryByPartner.map((dp) => (
                <div key={dp.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{dp.name}</p>
                    <p className="text-[10px] text-muted-foreground">{dp.orders} orders today</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">{dp.avgTime} min avg</p>
                    <p className="text-[10px] text-muted-foreground">{dp.success}% success</p>
                  </div>
                  <div className="w-16">
                    <Progress value={dp.success} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ════════ SERVICES TAB ════════ */}
        <TabsContent value="services" className="space-y-4">
          {categories.map((cat) => {
            const catServices = services.filter((s) => s.category === cat);
            return (
              <div key={cat} className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">{cat}</h3>
                <div className="space-y-2">
                  {catServices.map((svc) => (
                    <div key={svc.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full ${statusBg(svc.status)} shrink-0 ${svc.status !== "operational" ? "animate-pulse" : ""}`} />
                      <svc.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{svc.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {svc.requestsToday.toLocaleString()} requests today • Last check: {svc.lastCheck}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-right shrink-0">
                        <div>
                          <p className="text-xs font-semibold text-foreground">{svc.uptime}%</p>
                          <p className="text-[9px] text-muted-foreground">Uptime</p>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${svc.latency > 300 ? "text-amber-600" : "text-foreground"}`}>{svc.latency}ms</p>
                          <p className="text-[9px] text-muted-foreground">Latency</p>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${svc.errorRate > 2 ? "text-destructive" : svc.errorRate > 1 ? "text-amber-600" : "text-foreground"}`}>{svc.errorRate}%</p>
                          <p className="text-[9px] text-muted-foreground">Errors</p>
                        </div>
                        <Badge variant="outline" className={`text-[9px] ${statusColor(svc.status)}`}>
                          {statusLabel(svc.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* ════════ INCIDENTS TAB ════════ */}
        <TabsContent value="incidents" className="space-y-4">
          <div className="flex items-center gap-2">
            {(["all", "open", "resolved"] as const).map((f) => (
              <Button key={f} variant={incidentFilter === f ? "default" : "outline"} size="sm" onClick={() => setIncidentFilter(f)} className="text-xs capitalize">
                {f} {f === "open" ? `(${incidents.filter((i) => i.status !== "resolved").length})` : f === "resolved" ? `(${incidents.filter((i) => i.status === "resolved").length})` : `(${incidents.length})`}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredIncidents.map((inc) => {
              const sevCfg = severityConfig[inc.severity];
              return (
                <Card key={inc.id} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${sevCfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <AlertTriangle className={`w-4 h-4 ${sevCfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-mono text-muted-foreground">{inc.id}</span>
                          <h3 className="text-sm font-semibold text-foreground">{inc.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{inc.impact}</p>
                        <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
                          <Badge variant="outline" className={`text-[9px] ${sevCfg.color} capitalize`}>{inc.severity}</Badge>
                          <span>{inc.service}</span>
                          <span>• Opened: {inc.createdAt}</span>
                          {inc.resolvedAt && <span>• Resolved: {inc.resolvedAt}</span>}
                        </div>
                      </div>
                      <Badge variant={inc.status === "resolved" ? "secondary" : inc.status === "investigating" ? "default" : "destructive"} className="text-[9px] capitalize shrink-0">
                        {inc.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
