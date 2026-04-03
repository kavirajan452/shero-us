import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import {
  TrendingUp, TrendingDown, BarChart3, Users, Download, Calendar,
  ChefHat, Star, Clock, XCircle, SkipForward, DollarSign,
  ArrowUpRight, ArrowDownRight, Package,
} from "lucide-react";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--destructive))",
];

type ReportPeriod = "today" | "week" | "month";

const kpiData: Record<ReportPeriod, { activeSubscribers: number; newSignups: number; churnRate: number; avgOrderValue: number; onTimeRate: number; totalRevenue: number; totalPortions: number; avgRating: number; skips: number; cancellations: number }> = {
  today: { activeSubscribers: 142, newSignups: 3, churnRate: 1.2, avgOrderValue: 145, onTimeRate: 94, totalRevenue: 18500, totalPortions: 127, avgRating: 4.6, skips: 5, cancellations: 0 },
  week: { activeSubscribers: 142, newSignups: 18, churnRate: 2.8, avgOrderValue: 148, onTimeRate: 91, totalRevenue: 128750, totalPortions: 870, avgRating: 4.5, skips: 32, cancellations: 2 },
  month: { activeSubscribers: 142, newSignups: 65, churnRate: 4.5, avgOrderValue: 152, onTimeRate: 89, totalRevenue: 542000, totalPortions: 3564, avgRating: 4.5, skips: 124, cancellations: 8 },
};

const planBreakdown = [
  { plan: "Chettinad Veg Thali", subscribers: 38, revenue: 142500, avgRating: 4.6, onTime: 93, skips: 28, trend: "up" },
  { plan: "S.I. Breakfast Box", subscribers: 32, revenue: 95040, avgRating: 4.9, onTime: 96, skips: 12, trend: "up" },
  { plan: "Andhra Spice Box", subscribers: 25, revenue: 131250, avgRating: 4.7, onTime: 88, skips: 22, trend: "stable" },
  { plan: "Chettinad Non-Veg", subscribers: 19, revenue: 102600, avgRating: 4.8, onTime: 91, skips: 18, trend: "up" },
  { plan: "Kerala Sadya Box", subscribers: 16, revenue: 76800, avgRating: 4.5, onTime: 85, skips: 24, trend: "down" },
  { plan: "North Indian Dabba", subscribers: 12, revenue: 59400, avgRating: 4.4, onTime: 87, skips: 20, trend: "down" },
];

const partnerPerformance = [
  { name: "Chef Lakshmi Kitchen", subscribers: 32, onTime: 96, avgRating: 4.7, revenue: 148000, complaints: 1, grade: "A" },
  { name: "Chef Fathima Kitchen", subscribers: 28, onTime: 94, avgRating: 4.6, revenue: 128000, complaints: 2, grade: "A" },
  { name: "Chef Kamala Kitchen", subscribers: 24, onTime: 88, avgRating: 4.4, revenue: 98000, complaints: 3, grade: "B" },
  { name: "Chef Meena Kitchen", subscribers: 18, onTime: 91, avgRating: 4.5, revenue: 82000, complaints: 1, grade: "A" },
  { name: "Chef Saroja Kitchen", subscribers: 16, onTime: 83, avgRating: 4.2, revenue: 68000, complaints: 5, grade: "C" },
];

const skipPatterns = [
  { day: "Monday", breakfast: 3, lunch: 5, dinner: 4 },
  { day: "Tuesday", breakfast: 2, lunch: 3, dinner: 2 },
  { day: "Wednesday", breakfast: 1, lunch: 2, dinner: 3 },
  { day: "Thursday", breakfast: 2, lunch: 4, dinner: 3 },
  { day: "Friday", breakfast: 4, lunch: 6, dinner: 5 },
  { day: "Saturday", breakfast: 6, lunch: 8, dinner: 7 },
  { day: "Sunday", breakfast: 5, lunch: 4, dinner: 3 },
];

const gradeColors: Record<string, string> = { A: "bg-green-100 text-green-800", B: "bg-yellow-100 text-yellow-800", C: "bg-red-100 text-red-800" };

// Growth trend data
const growthTrend = [
  { month: "Oct", subscribers: 62, revenue: 186000 },
  { month: "Nov", subscribers: 85, revenue: 289000 },
  { month: "Dec", subscribers: 98, revenue: 352800 },
  { month: "Jan", subscribers: 112, revenue: 420000 },
  { month: "Feb", subscribers: 128, revenue: 486400 },
  { month: "Mar", subscribers: 142, revenue: 542000 },
];

const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

const AdminSubReports = () => {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const kpi = kpiData[period];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscription Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">KPIs, partner grading, skip patterns & growth analytics</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1.5">
            {(["today", "week", "month"] as ReportPeriod[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`text-[10px] px-2.5 py-1 rounded-md font-medium transition-all ${period === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {p === "today" ? "Today" : p === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1"><Download className="w-3 h-3" /> Export</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Active Subscribers", value: kpi.activeSubscribers, icon: Users, color: "text-green-600" },
          { label: "New Signups", value: kpi.newSignups, icon: ArrowUpRight, color: "text-blue-600" },
          { label: "Revenue", value: fmt(kpi.totalRevenue), icon: DollarSign, color: "text-primary" },
          { label: "On-Time %", value: `${kpi.onTimeRate}%`, icon: Clock, color: kpi.onTimeRate >= 90 ? "text-green-600" : "text-yellow-600" },
          { label: "Avg Rating", value: kpi.avgRating, icon: Star, color: "text-yellow-600" },
          { label: "Churn Rate", value: `${kpi.churnRate}%`, icon: ArrowDownRight, color: kpi.churnRate > 3 ? "text-destructive" : "text-green-600" },
          { label: "Total Skips", value: kpi.skips, icon: SkipForward, color: "text-muted-foreground" },
          { label: "Cancellations", value: kpi.cancellations, icon: XCircle, color: kpi.cancellations > 0 ? "text-destructive" : "text-green-600" },
        ].map(m => (
          <Card key={m.label} className="border-border">
            <CardContent className="p-2.5 flex items-center gap-2">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <div>
                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[9px] text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Subscriber Growth & Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={{ subscribers: { label: "Subscribers", color: "hsl(var(--primary))" }, revenue: { label: "Revenue", color: "hsl(var(--chart-2))" } }} className="h-[260px] w-full">
            <AreaChart data={growthTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={v => fmt(v)} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area yAxisId="left" type="monotone" dataKey="subscribers" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} name="Subscribers" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Plan & Partner Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-primary" /> Plan-wise Revenue</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" }, skips: { label: "Skips", color: "hsl(var(--chart-4))" } }} className="h-[220px] w-full">
              <BarChart data={planBreakdown.map(p => ({ plan: p.plan.split(" ").slice(0, 2).join(" "), revenue: p.revenue, skips: p.skips * 100 }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="plan" tick={{ fontSize: 9 }} />
                <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1.5"><ChefHat className="w-3.5 h-3.5 text-primary" /> Partner Revenue</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-2))" } }} className="h-[220px] w-full">
              <BarChart data={partnerPerformance.map(p => ({ name: p.name.replace("Chef ", "").replace(" Kitchen", ""), revenue: p.revenue }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Plan Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-primary" /> Plan-wise Performance</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[9px]">Plan</TableHead>
                  <TableHead className="text-[9px]">Subs</TableHead>
                  <TableHead className="text-[9px]">Revenue</TableHead>
                  <TableHead className="text-[9px]">Rating</TableHead>
                  <TableHead className="text-[9px]">On-Time</TableHead>
                  <TableHead className="text-[9px]">Skips</TableHead>
                  <TableHead className="text-[9px]">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planBreakdown.map(p => (
                  <TableRow key={p.plan}>
                    <TableCell className="text-[10px] font-medium">{p.plan}</TableCell>
                    <TableCell className="text-[10px]">{p.subscribers}</TableCell>
                    <TableCell className="text-[10px] font-medium">{fmt(p.revenue)}</TableCell>
                    <TableCell className="text-[10px]"><span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-yellow-500" />{p.avgRating}</span></TableCell>
                    <TableCell><Badge className={`text-[8px] ${p.onTime >= 90 ? "bg-green-100 text-green-800" : p.onTime >= 85 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{p.onTime}%</Badge></TableCell>
                    <TableCell className="text-[10px]">{p.skips}</TableCell>
                    <TableCell>
                      {p.trend === "up" && <TrendingUp className="w-3 h-3 text-green-600" />}
                      {p.trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
                      {p.trend === "stable" && <span className="text-[10px] text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Partner Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1.5"><ChefHat className="w-3.5 h-3.5 text-primary" /> Partner Performance</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[9px]">Partner</TableHead>
                  <TableHead className="text-[9px]">Subs</TableHead>
                  <TableHead className="text-[9px]">On-Time</TableHead>
                  <TableHead className="text-[9px]">Rating</TableHead>
                  <TableHead className="text-[9px]">Revenue</TableHead>
                  <TableHead className="text-[9px]">Complaints</TableHead>
                  <TableHead className="text-[9px]">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerPerformance.map(p => (
                  <TableRow key={p.name}>
                    <TableCell className="text-[10px] font-medium">{p.name}</TableCell>
                    <TableCell className="text-[10px]">{p.subscribers}</TableCell>
                    <TableCell><Badge className={`text-[8px] ${p.onTime >= 90 ? "bg-green-100 text-green-800" : p.onTime >= 85 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{p.onTime}%</Badge></TableCell>
                    <TableCell className="text-[10px]"><span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-yellow-500" />{p.avgRating}</span></TableCell>
                    <TableCell className="text-[10px] font-medium">{fmt(p.revenue)}</TableCell>
                    <TableCell className="text-[10px]">{p.complaints}</TableCell>
                    <TableCell><Badge className={`text-[8px] font-bold ${gradeColors[p.grade]}`}>{p.grade}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Skip Heatmap */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1.5"><SkipForward className="w-3.5 h-3.5 text-primary" /> Weekly Skip Pattern Heatmap</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <ChartContainer config={{ breakfast: { label: "Breakfast", color: "hsl(var(--chart-4))" }, lunch: { label: "Lunch", color: "hsl(var(--primary))" }, dinner: { label: "Dinner", color: "hsl(var(--chart-2))" } }} className="h-[200px] w-full">
            <BarChart data={skipPatterns}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="breakfast" stackId="a" fill="hsl(var(--chart-4))" name="Breakfast" />
              <Bar dataKey="lunch" stackId="a" fill="hsl(var(--primary))" name="Lunch" />
              <Bar dataKey="dinner" stackId="a" fill="hsl(var(--chart-2))" name="Dinner" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[9px]">Day</TableHead>
                  <TableHead className="text-[9px]">🌅 Breakfast</TableHead>
                  <TableHead className="text-[9px]">☀️ Lunch</TableHead>
                  <TableHead className="text-[9px]">🌙 Dinner</TableHead>
                  <TableHead className="text-[9px]">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skipPatterns.map(d => {
                  const total = d.breakfast + d.lunch + d.dinner;
                  const getHeat = (v: number) => v >= 6 ? "bg-red-100 text-red-800 font-bold" : v >= 4 ? "bg-yellow-100 text-yellow-800" : "bg-green-50 text-green-800";
                  return (
                    <TableRow key={d.day}>
                      <TableCell className="text-[10px] font-medium">{d.day}</TableCell>
                      <TableCell><Badge className={`text-[9px] ${getHeat(d.breakfast)}`}>{d.breakfast}</Badge></TableCell>
                      <TableCell><Badge className={`text-[9px] ${getHeat(d.lunch)}`}>{d.lunch}</Badge></TableCell>
                      <TableCell><Badge className={`text-[9px] ${getHeat(d.dinner)}`}>{d.dinner}</Badge></TableCell>
                      <TableCell><Badge className={`text-[9px] ${getHeat(total / 3)}`}>{total}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="text-[9px] text-muted-foreground">💡 Saturday has highest skip rates. Consider flexible Saturday menus or weekend pause option.</p>
        </CardContent>
      </Card>

      {/* Retention Funnel */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Retention Funnel (This Month)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "Trial Signups", value: 65, pct: 100, color: "bg-blue-500" },
            { label: "Trial → Weekly", value: 42, pct: 64.6, color: "bg-green-500" },
            { label: "Weekly → Monthly", value: 28, pct: 43.1, color: "bg-primary" },
            { label: "Monthly Renewals", value: 22, pct: 33.8, color: "bg-amber-500" },
          ].map(step => (
            <div key={step.label} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-foreground">{step.label}</span>
                <span className="text-[10px] text-muted-foreground">{step.value} ({step.pct}%)</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full ${step.color}`} style={{ width: `${step.pct}%` }} />
              </div>
            </div>
          ))}
          <p className="text-[9px] text-muted-foreground mt-1">💡 64.6% trial-to-weekly conversion is strong. Focus on weekly-to-monthly retention (43.1%).</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubReports;
