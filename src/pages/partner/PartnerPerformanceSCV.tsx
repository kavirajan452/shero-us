import { useState } from "react";
import KitchenSelector from "@/components/partner/KitchenSelector";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, CalendarIcon,
  AlertTriangle, CheckCircle2, Star as StarIcon, Clock, Award, ShieldAlert,
  Lightbulb, Package, FileSpreadsheet, ExternalLink,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";
import {
  performanceWeeks, currentCVAT, currentSCV,
  cvatDescriptions, performanceInsights, type CVATCategory,
} from "@/data/partnerMockData";
import * as XLSX from "xlsx";

// ── Helpers ──
const addTrendLine = (data: { name: string; value: number }[]) => {
  const n = data.length;
  const sumX = data.reduce((s, _, i) => s + i, 0);
  const sumY = data.reduce((s, d) => s + d.value, 0);
  const sumXY = data.reduce((s, d, i) => s + i * d.value, 0);
  const sumX2 = data.reduce((s, _, i) => s + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return data.map((d, i) => ({ ...d, trend: Math.round((slope * i + intercept) * 10) / 10 }));
};

const cvatBadgeStyles: Record<CVATCategory, string> = {
  A: "bg-primary/10 text-primary border-primary/30",
  B: "bg-blue-100 text-blue-700 border-blue-300",
  C: "bg-amber-100 text-amber-700 border-amber-300",
  D: "bg-destructive/10 text-destructive border-destructive/30",
};

const metricPastelColors = ["#7CB9E8", "#9FD5A6", "#F4A6C1", "#B8A9E8", "#F7CE76", "#F4A46E"];

const getWeakMetrics = (week: typeof performanceWeeks[0]) => {
  const metrics = [
    { name: "Kitchen Timing", value: week.kitchenTimingScore, ideal: 95, unit: "%", inverted: false },
    { name: "Product Availability", value: week.productAvailability, ideal: 95, unit: "%", inverted: false },
    { name: "Customer Reviews", value: week.customerReviews, ideal: 4.5, unit: "/5", inverted: false },
    { name: "Delayed Deliveries", value: week.delayedDeliveries, ideal: 0, unit: "", inverted: true },
    { name: "Bad Reviews", value: week.badReviews, ideal: 0, unit: "", inverted: true },
    { name: "Cancellations", value: week.cancellations, ideal: 0, unit: "", inverted: true },
  ];
  return metrics.filter((m) => m.inverted ? m.value > m.ideal : m.value < m.ideal);
};

const badReviewsData = [
  { orderId: "SH4821", date: "2026-02-28", customer: "Patricia Sharma", dish: "Chicagoi Biryani", rating: 1, review: "Food was cold and lacked spice.", week: "W3" },
  { orderId: "SH4790", date: "2026-02-27", customer: "Rahul Verma", dish: "Butter Chicken", rating: 2, review: "Missing naan. Chicken was dry.", week: "W3" },
  { orderId: "SH4760", date: "2026-02-25", customer: "Meena Iyer", dish: "Veg Thali", rating: 1, review: "Sambar was too salty.", week: "W3" },
  { orderId: "SH4701", date: "2026-02-21", customer: "Anita Reddy", dish: "Masala Dosa", rating: 2, review: "Dosa was soggy.", week: "W2" },
  { orderId: "SH4685", date: "2026-02-20", customer: "Deepak Nair", dish: "Curd Rice", rating: 1, review: "Portion was very small.", week: "W2" },
  { orderId: "SH4650", date: "2026-02-18", customer: "Karen S.", dish: "Fish Curry", rating: 2, review: "Fish was overcooked.", week: "W2" },
  { orderId: "SH4620", date: "2026-02-16", customer: "Sanjay R.", dish: "Mutton Curry", rating: 1, review: "Found hair in the food.", week: "W1" },
  { orderId: "SH4598", date: "2026-02-14", customer: "Lakshmi P.", dish: "Idli Vada", rating: 2, review: "Idli was hard.", week: "W1" },
];

const downloadBadReviewsExcel = (weekFilter?: string) => {
  const filtered = weekFilter ? badReviewsData.filter(r => r.week === weekFilter) : badReviewsData;
  const rows = filtered.map((r, i) => ({
    "Sl": i + 1, "Order ID": r.orderId, "Date": r.date, "Customer": r.customer,
    "Dish": r.dish, "Rating": `${r.rating}/5`, "Review": r.review, "Week": r.week,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bad Reviews");
  XLSX.writeFile(wb, `Bad_Reviews_${weekFilter || "All"}_${format(new Date(), "yyyyMMdd")}.xlsx`);
};

const downloadPerformanceExcel = () => {
  const rows = performanceWeeks.map((w) => ({
    "Week": w.week, "Period": w.weekLabel, "Kitchen Timing (%)": w.kitchenTimingScore,
    "Product Availability (%)": w.productAvailability, "Avg Review": w.customerReviews,
    "Delayed Orders": w.delayedDeliveries, "Bad Reviews": w.badReviews,
    "Total Orders": w.totalOrders, "SCV Score": w.scv, "CVAT Grade": w.cvatCategory,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Performance");
  XLSX.writeFile(wb, `Performance_SCV_Report_${format(new Date(), "yyyyMMdd")}.xlsx`);
};

const insightIcon = { positive: CheckCircle2, warning: AlertTriangle, critical: ShieldAlert };
const insightColor = { positive: "text-primary", warning: "text-amber-600", critical: "text-destructive" };
const insightBg = { positive: "bg-card border-border border-l-4 border-l-emerald-500", warning: "bg-card border-border border-l-4 border-l-amber-500", critical: "bg-card border-border border-l-4 border-l-destructive" };

const PartnerPerformanceSCV = () => {
  const [perfFromDate, setPerfFromDate] = useState<Date | undefined>(new Date("2026-02-01"));
  const [perfToDate, setPerfToDate] = useState<Date | undefined>(new Date());
  const [selectedKitchen, setSelectedKitchen] = useState("all");

  const latest = performanceWeeks[performanceWeeks.length - 1];
  const previous = performanceWeeks[performanceWeeks.length - 2];
  const weakMetrics = getWeakMetrics(latest);
  const cvatInfo = cvatDescriptions[currentCVAT];
  const scvDelta = latest.scv - previous.scv;
  const scvTrending = scvDelta >= 0;
  const totalIssues = latest.delayedDeliveries + latest.badReviews + latest.cancellations;

  const radarData = [
    { metric: "Timing", value: latest.kitchenTimingScore },
    { metric: "Availability", value: latest.productAvailability },
    { metric: "Reviews", value: Math.round(latest.customerReviews * 20) },
    { metric: "On-time", value: Math.round(100 - (latest.delayedDeliveries / latest.totalOrders) * 100) },
    { metric: "SCV", value: latest.scv },
  ];

  const trendData = performanceWeeks.map((w) => ({
    name: w.week,
    "Timing": w.kitchenTimingScore,
    "Avail.": w.productAvailability,
    SCV: w.scv,
  }));

  return (
    <div className="space-y-4">
      {/* Header row — compact */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-serif font-bold text-foreground leading-tight">Performance Report – SCV</h2>
          <p className="text-xs text-muted-foreground mt-0.5">SCV & CVAT classification with detailed metrics</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1 text-[10px] shrink-0 h-7" onClick={downloadPerformanceExcel}>
          <FileSpreadsheet className="w-3 h-3" /> Excel
        </Button>
      </div>

      {/* Kitchen Selector */}
      <KitchenSelector value={selectedKitchen} onChange={setSelectedKitchen} />

      {/* Date range — inline compact */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("gap-1 text-[10px] h-7 px-2", !perfFromDate && "text-muted-foreground")}>
              <CalendarIcon className="w-3 h-3" />
              {perfFromDate ? format(perfFromDate, "dd MMM yy") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={perfFromDate} onSelect={setPerfFromDate} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        <span className="text-[10px] text-muted-foreground">→</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("gap-1 text-[10px] h-7 px-2", !perfToDate && "text-muted-foreground")}>
              <CalendarIcon className="w-3 h-3" />
              {perfToDate ? format(perfToDate, "dd MMM yy") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={perfToDate} onSelect={setPerfToDate} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Power Highlight Row — SCV + CVAT hero ── */}
      <div className="grid grid-cols-5 gap-2">
        <Card className="col-span-3 border-border bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">SCV Score</span>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-black text-foreground leading-none">{currentSCV}</span>
              <span className="text-xs text-muted-foreground mb-1">/100</span>
              <span className={`flex items-center gap-0.5 text-xs font-bold ml-auto ${scvTrending ? "text-primary" : "text-destructive"}`}>
                {scvTrending ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {scvTrending ? "+" : ""}{scvDelta}
              </span>
            </div>
            {/* Mini sparkline */}
            <div className="h-10 mt-1.5 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={addTrendLine(performanceWeeks.map((w) => ({ name: w.week, value: w.scv })))}>
                  <Line type="monotone" dataKey="value" stroke="#7CB9E8" strokeWidth={2} dot={{ r: 2, fill: "#7CB9E8" }} />
                  <Line type="monotone" dataKey="trend" stroke="#E53E3E" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                  <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                  <XAxis hide dataKey="name" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 border-border bg-card">
          <CardContent className="p-3 flex flex-col justify-between h-full">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">CVAT</span>
            </div>
            <div className="mt-1">
              <span className={`text-4xl font-black leading-none ${cvatInfo.color}`}>{currentCVAT}</span>
              <Badge variant="outline" className={`text-[9px] ml-1.5 border ${cvatBadgeStyles[currentCVAT]}`}>{cvatInfo.label}</Badge>
            </div>
            <div className="flex gap-0.5 mt-2">
              {(["D", "C", "B", "A"] as CVATCategory[]).map((cat) => (
                <div key={cat} className={`flex-1 h-1.5 rounded-full ${cat === currentCVAT ? (cat === "A" ? "bg-green-500" : cat === "B" ? "bg-blue-500" : cat === "C" ? "bg-yellow-500" : "bg-red-500") : "bg-muted"}`} />
              ))}
            </div>
            <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
              <span>D</span><span>C</span><span>B</span><span>A</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Metric Tiles — 3×2 compact grid ── */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "Timing", value: `${latest.kitchenTimingScore}%`, icon: Clock },
          { label: "Availability", value: `${latest.productAvailability}%`, icon: Package },
          { label: "Reviews", value: latest.customerReviews.toFixed(1), icon: StarIcon },
          { label: "Delays", value: `${latest.delayedDeliveries}`, icon: AlertTriangle, warn: latest.delayedDeliveries > 0 },
          { label: "Bad Reviews", value: `${latest.badReviews}`, icon: ShieldAlert, warn: latest.badReviews > 0 },
          { label: "Issues", value: `${totalIssues}`, icon: AlertTriangle, warn: totalIssues > 5 },
        ].map((t) => (
          <div key={t.label} className="rounded-lg p-2 bg-card border border-border">
            <div className="flex items-center gap-1">
              <t.icon className={`w-3 h-3 ${t.warn ? "text-destructive" : "text-primary"}`} />
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-medium">{t.label}</span>
            </div>
            <p className={`text-base font-bold mt-0.5 leading-tight ${t.warn ? "text-destructive" : "text-foreground"}`}>{t.value}</p>
          </div>
        ))}
      </div>

      {/* ── Focus Areas (if any) ── */}
      {weakMetrics.length > 0 && (
        <Card className="border-border bg-card border-l-4 border-l-amber-500">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Focus Areas to Improve SCV
            </p>
            <div className="space-y-1">
              {weakMetrics.map((m) => (
                <div key={m.name} className="flex items-center justify-between text-xs">
                  <span className="text-foreground/80">{m.name}</span>
                  <span className="text-destructive font-medium text-[11px]">{m.value}{m.unit} → {m.ideal}{m.unit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Detailed Metric Cards with Sparklines ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {[
          { label: "SCV Score", key: "scv" as const, icon: StarIcon, unit: "", color: metricPastelColors[0], desc: "Composite score /100", bg: "bg-card" },
          { label: "Kitchen Timing", key: "kitchenTimingScore" as const, icon: Clock, unit: "%", color: metricPastelColors[1], desc: "On-time kitchen opening", bg: "bg-card" },
          { label: "Availability", key: "productAvailability" as const, icon: Package, unit: "%", color: metricPastelColors[2], desc: "Menu availability %", bg: "bg-card" },
          { label: "Avg Review", key: "customerReviews" as const, icon: StarIcon, unit: "", color: metricPastelColors[3], desc: "Customer rating", bg: "bg-card" },
          { label: "Delays", key: "delayedDeliveries" as const, icon: AlertTriangle, unit: "", color: metricPastelColors[4], inverted: true, desc: "Orders past SLA", bg: "bg-card" },
          { label: "Bad Reviews", key: "badReviews" as const, icon: ShieldAlert, unit: "", color: metricPastelColors[5], inverted: true, desc: "1–2 star ratings", bg: "bg-card" },
        ].map((m) => {
          const data = performanceWeeks.map((w) => ({ name: w.week, value: w[m.key] }));
          const current = data[data.length - 1].value;
          const prev = data[data.length - 2].value;
          const delta = current - prev;
          const good = "inverted" in m && m.inverted ? delta <= 0 : delta >= 0;
          const trendWord = "inverted" in m && m.inverted
            ? (delta < 0 ? "↑ Better" : delta === 0 ? "— Stable" : "↓ Worse")
            : (delta > 0 ? "↑ Better" : delta === 0 ? "— Stable" : "↓ Worse");
          return (
            <Card key={m.label} className={`border-border ${m.bg}`}>
              <CardContent className="p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <m.icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider">{m.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-base font-bold text-foreground leading-tight">{m.key === "customerReviews" ? current.toFixed(1) : current}{m.unit}</p>
                    <span className={`text-[8px] font-semibold ${good ? "text-green-600" : "text-red-600"}`}>{trendWord}</span>
                  </div>
                  <div className="h-8 w-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={addTrendLine(data)}>
                        <Line type="monotone" dataKey="value" stroke={m.color} strokeWidth={1.5} dot={{ r: 2, fill: m.color }} />
                        <Line type="monotone" dataKey="trend" stroke="#E53E3E" strokeWidth={1} dot={false} strokeDasharray="2 2" />
                        <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                        <XAxis hide dataKey="name" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <p className="text-[8px] text-muted-foreground mt-1">{m.desc}</p>
                {m.key === "badReviews" && current > 0 && (
                  <button onClick={() => downloadBadReviewsExcel()} className="flex items-center gap-0.5 mt-1 text-[9px] text-primary hover:underline font-medium">
                    <ExternalLink className="w-2.5 h-2.5" /> Download
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Trend + Radar side-by-side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-border">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm">3-Week Trends</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="Timing" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Avail." stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="SCV" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm">Performance Radar</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Insights — compact ── */}
      <Card className="border-border">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-yellow-500" />Insights & Tips</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {performanceInsights.map((insight, idx) => {
            const Icon = insightIcon[insight.type];
            return (
              <div key={idx} className={`rounded-lg border p-2.5 ${insightBg[insight.type]}`}>
                <div className="flex items-start gap-1.5">
                  <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${insightColor[insight.type]}`} />
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">{insight.metric}</p>
                    <p className="text-xs text-foreground/80 mt-0.5">{insight.message}</p>
                    {insight.tip && <p className="text-[10px] text-muted-foreground mt-1 italic">💡 {insight.tip}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Weekly History — compact rows ── */}
      <Card className="border-border">
        <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm">Weekly CVAT History</CardTitle></CardHeader>
        <CardContent className="p-3 pt-0 space-y-1.5">
          {performanceWeeks.map((w) => (
            <div key={w.week} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 border border-border/50">
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-xs">{w.week} <span className="text-muted-foreground font-normal text-[10px]">({w.weekLabel})</span></p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[10px] text-muted-foreground">{w.totalOrders} orders · {w.badReviews} bad · {w.delayedDeliveries} delays</p>
                  {w.badReviews > 0 && (
                    <button onClick={() => downloadBadReviewsExcel(w.week)} className="text-[9px] text-primary hover:underline font-medium shrink-0">
                      View
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-foreground">{w.scv}</span>
                <Badge variant="outline" className={`text-xs font-bold border px-1.5 py-0 ${cvatBadgeStyles[w.cvatCategory]}`}>{w.cvatCategory}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-[9px] text-center text-muted-foreground italic">CVAT: Classification → Visit → Audit → Training</p>
    </div>
  );
};

export default PartnerPerformanceSCV;
