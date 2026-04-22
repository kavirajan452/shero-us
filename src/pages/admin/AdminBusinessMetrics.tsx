import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import {
  Gauge, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Users, ChefHat,
  Star, Clock, Percent, Target, Zap, AlertTriangle, CheckCircle, Download,
  ShoppingCart, Bike, PartyPopper, Calendar, Cookie, GraduationCap, Sparkles, Wrench
} from "lucide-react";
import { useInstantOrderStats, useCustomerFeedback } from "@/hooks/useSupabaseData";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--accent))"];

// ── Vertical Health Scores ──
const verticalHealth = [
  { vertical: "Single Meal Order", icon: Bike, score: 87, revenue: 842500, growth: 12.3, orders: 1280, nps: 72, fulfillment: 96.8, avgDelivery: "38m", churn: 3.2, color: COLORS[0] },
  { vertical: "Subscriptions", icon: Calendar, score: 82, revenue: 425000, growth: 18.5, orders: 320, nps: 78, fulfillment: 94.2, avgDelivery: "On-time", churn: 5.1, color: COLORS[1] },
  { vertical: "Party Orders", icon: PartyPopper, score: 79, revenue: 318000, growth: 8.7, orders: 85, nps: 81, fulfillment: 98.8, avgDelivery: "Scheduled", churn: 1.2, color: COLORS[2] },
  { vertical: "Sweets & Snacks", icon: Cookie, score: 74, revenue: 156000, growth: 22.4, orders: 210, nps: 68, fulfillment: 92.5, avgDelivery: "2.5d", churn: 4.8, color: COLORS[3] },
  { vertical: "Cookery Classes", icon: GraduationCap, score: 81, revenue: 89000, growth: 32.1, orders: 145, nps: 85, fulfillment: 97.2, avgDelivery: "N/A", churn: 2.1, color: COLORS[4] },
  { vertical: "Shero Classes", icon: Sparkles, score: 76, revenue: 62000, growth: 28.6, orders: 98, nps: 82, fulfillment: 95.9, avgDelivery: "N/A", churn: 3.5, color: COLORS[5] },
  { vertical: "Home Services", icon: Wrench, score: 71, revenue: 48000, growth: 5.2, orders: 42, nps: 65, fulfillment: 89.3, avgDelivery: "Scheduled", churn: 6.2, color: COLORS[0] },
];

// ── Operational KPIs ──
const opKPIs = {
  avgOrderValue: 884,
  aovGrowth: 3.2,
  customerLTV: 4200,
  ltvGrowth: 8.4,
  repeatRate: 62.5,
  repeatGrowth: 4.1,
  partnerRetention: 94.2,
  supportTicketsPerDay: 28,
  avgResolutionTime: "12m",
  firstCallResolution: 78,
  appCrashRate: 0.12,
  uptime: 99.97,
};

// ── Weekly Trend ──
const weeklyTrend = Array.from({ length: 12 }, (_, i) => {
  const w = 12 - i;
  return {
    week: `W${52 - w + 1}`,
    orders: 280 + Math.floor(Math.random() * 120),
    revenue: 280000 + Math.floor(Math.random() * 120000),
    newUsers: 40 + Math.floor(Math.random() * 30),
    nps: 68 + Math.floor(Math.random() * 15),
  };
});

// ── Partner Metrics ──
const partnerMetrics = [
  { metric: "Total Active Partners", value: "248", delta: "+8", trend: "up" },
  { metric: "Avg Orders/Partner/Day", value: "5.2", delta: "+0.3", trend: "up" },
  { metric: "Avg Partner Rating", value: "4.4 ⭐", delta: "+0.1", trend: "up" },
  { metric: "On-time Preparation", value: "94.8%", delta: "+1.2%", trend: "up" },
  { metric: "Partner Complaints", value: "12", delta: "-3", trend: "down" },
  { metric: "Avg Payout/Partner/Week", value: "$8,400", delta: "+$420", trend: "up" },
  { metric: "New Onboards (MTD)", value: "6", delta: "+2", trend: "up" },
  { metric: "Churn Rate (Monthly)", value: "2.1%", delta: "-0.4%", trend: "down" },
];

// ── Customer Metrics ──
const customerMetrics = [
  { metric: "Total Registered Users", value: "5,120", delta: "+320", trend: "up" },
  { metric: "Monthly Active Users", value: "2,840", delta: "+180", trend: "up" },
  { metric: "Avg Orders/User/Month", value: "3.4", delta: "+0.2", trend: "up" },
  { metric: "Customer LTV", value: "$4,200", delta: "+$340", trend: "up" },
  { metric: "Repeat Order Rate", value: "62.5%", delta: "+4.1%", trend: "up" },
  { metric: "Cart Abandonment", value: "18.2%", delta: "-2.1%", trend: "down" },
  { metric: "Avg Rating Given", value: "4.3 ⭐", delta: "+0.1", trend: "up" },
  { metric: "Referral Conversion", value: "24.6%", delta: "+3.2%", trend: "up" },
];

// ── Radar data for vertical comparison (computed inside component with live data) ──
const _radarDataBase = verticalHealth.map(v => ({
  vertical: v.vertical.split(" ")[0],
  Health: v.score,
  NPS: v.nps,
  Fulfillment: v.fulfillment,
  Growth: Math.min(v.growth * 2, 100),
}));

export default function AdminBusinessMetrics() {
  const [tab, setTab] = useState("health");
  const { data: orderStats } = useInstantOrderStats();
  const { data: rawFeedback = [] } = useCustomerFeedback();

  // Compute real averages from live data
  const avgRating = useMemo(() => {
    const fb = rawFeedback as any[];
    if (fb.length === 0) return null;
    return (fb.reduce((s: number, f: any) => s + Number(f.rating || 0), 0) / fb.length).toFixed(1);
  }, [rawFeedback]);

  const liveInstantVertical = useMemo(() => {
    const base = verticalHealth.find(v => v.vertical === "Single Meal Order")!;
    return {
      ...base,
      revenue: Number(orderStats?.totalSales || base.revenue),
      orders: Number(orderStats?.totalOrders || base.orders),
      nps: avgRating ? Math.round(Number(avgRating) * 14) : base.nps,
    };
  }, [orderStats, avgRating]);

  const liveHealth = useMemo(() => verticalHealth.map(v => v.vertical === "Single Meal Order" ? liveInstantVertical : v), [liveInstantVertical]);

  const totalRevenue = liveHealth.reduce((s, v) => s + v.revenue, 0);
  const avgHealth = Math.round(liveHealth.reduce((s, v) => s + v.score, 0) / liveHealth.length);
  const avgNPS = Math.round(liveHealth.reduce((s, v) => s + v.nps, 0) / liveHealth.length);
  const radarData = useMemo(() => liveHealth.map(v => ({
    vertical: v.vertical.split(" ")[0],
    Health: v.score,
    NPS: v.nps,
    Fulfillment: v.fulfillment,
    Growth: Math.min(v.growth * 2, 100),
  })), [liveHealth]);
  const chartConfig = { orders: { label: "Orders", color: COLORS[0] }, revenue: { label: "Revenue", color: COLORS[1] }, nps: { label: "NPS", color: COLORS[4] } };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📈 Business Metrics</h1>
          <p className="text-sm text-muted-foreground">Vertical health scores, operational KPIs, partner & customer analytics</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> Export</Button>
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Platform Health", value: `${avgHealth}/100`, icon: Gauge, color: "text-primary" },
          { label: "Avg NPS", value: avgNPS, icon: Star, color: "text-yellow-600" },
          { label: "Customer LTV", value: `$${opKPIs.customerLTV.toLocaleString()}`, icon: Users, color: "text-green-600" },
          { label: "Repeat Rate", value: `${opKPIs.repeatRate}%`, icon: TrendingUp, color: "text-blue-600" },
          { label: "Uptime", value: `${opKPIs.uptime}%`, icon: Zap, color: "text-accent" },
          { label: "Partner Retention", value: `${opKPIs.partnerRetention}%`, icon: ChefHat, color: "text-primary" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="health" className="text-xs">Vertical Health</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs">Trends (12W)</TabsTrigger>
          <TabsTrigger value="partners" className="text-xs">Partner Metrics</TabsTrigger>
          <TabsTrigger value="customers" className="text-xs">Customer Metrics</TabsTrigger>
        </TabsList>

        {/* ── VERTICAL HEALTH ── */}
        <TabsContent value="health" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveHealth.map(v => {
              const Icon = v.icon;
              return (
                <Card key={v.vertical} className="overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: v.color }} />
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5" style={{ color: v.color }} />
                      <h3 className="text-sm font-semibold text-foreground flex-1">{v.vertical}</h3>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${v.score >= 80 ? "bg-green-100 text-green-800" : v.score >= 70 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                        {v.score}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span className="font-semibold">${(v.revenue / 1000).toFixed(0)}K</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Growth</span><span className="font-semibold text-green-600">+{v.growth}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Orders</span><span className="font-semibold">{v.orders}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">NPS</span><span className="font-semibold">{v.nps}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Fulfillment</span><span className="font-semibold">{v.fulfillment}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Churn</span><span className={`font-semibold ${v.churn > 4 ? "text-destructive" : "text-foreground"}`}>{v.churn}%</span></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {/* Radar comparison */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Vertical Comparison Radar</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
              <ChartContainer config={{ Health: { label: "Health", color: COLORS[0] } }} className="h-[320px] w-full max-w-[500px]">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="vertical" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fontSize: 9 }} />
                  <Radar name="Health" dataKey="Health" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.3} />
                  <Radar name="NPS" dataKey="NPS" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.2} />
                  <Radar name="Fulfillment" dataKey="Fulfillment" stroke={COLORS[4]} fill={COLORS[4]} fillOpacity={0.15} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TRENDS ── */}
        <TabsContent value="trends" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Orders</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <AreaChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="orders" fill={COLORS[0]} fillOpacity={0.3} stroke={COLORS[0]} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly NPS</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="nps" stroke={COLORS[4]} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── PARTNER METRICS ── */}
        <TabsContent value="partners" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {partnerMetrics.map(m => (
              <Card key={m.metric}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{m.metric}</p>
                    <p className="text-lg font-bold text-foreground">{m.value}</p>
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${m.trend === "up" && !m.metric.includes("Complaint") && !m.metric.includes("Churn") ? "text-green-600" : m.trend === "down" && (m.metric.includes("Complaint") || m.metric.includes("Churn")) ? "text-green-600" : "text-destructive"}`}>
                    {m.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {m.delta}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── CUSTOMER METRICS ── */}
        <TabsContent value="customers" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customerMetrics.map(m => (
              <Card key={m.metric}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{m.metric}</p>
                    <p className="text-lg font-bold text-foreground">{m.value}</p>
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${m.trend === "up" && !m.metric.includes("Abandon") ? "text-green-600" : m.trend === "down" && m.metric.includes("Abandon") ? "text-green-600" : "text-destructive"}`}>
                    {m.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {m.delta}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
