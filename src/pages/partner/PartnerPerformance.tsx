import { TrendingUp, TrendingDown, Star, Clock, AlertTriangle, CheckCircle2, Award, ShieldAlert, Lightbulb, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  performanceWeeks, currentCVAT, currentSCV,
  cvatDescriptions, performanceInsights, type CVATCategory,
} from "@/data/partnerMockData";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

// Simple linear regression for trend line
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

// Identify weak metrics pulling SCV down
const getWeakMetrics = (week: typeof performanceWeeks[0]) => {
  const metrics = [
    { name: "Kitchen Timing", value: week.kitchenTimingScore, ideal: 95, unit: "%" },
    { name: "Product Availability", value: week.productAvailability, ideal: 95, unit: "%" },
    { name: "Customer Reviews", value: week.customerReviews, ideal: 4.5, unit: "/5" },
    { name: "Delayed Deliveries", value: week.delayedDeliveries, ideal: 0, unit: " orders", inverted: true },
    { name: "Bad Reviews", value: week.badReviews, ideal: 0, unit: " reviews", inverted: true },
  ];
  return metrics
    .filter((m) => m.inverted ? m.value > m.ideal : m.value < m.ideal)
    .sort((a, b) => {
      const gapA = a.inverted ? a.value - a.ideal : (a.ideal - a.value) / a.ideal;
      const gapB = b.inverted ? b.value - b.ideal : (b.ideal - b.value) / b.ideal;
      return (b.inverted ? gapB : gapB) - (a.inverted ? gapA : gapA);
    });
};

// Pastel colors for metric sparklines
const metricPastelColors = [
  "#7CB9E8", // pastel blue
  "#9FD5A6", // pastel green
  "#F4A6C1", // pastel pink
  "#B8A9E8", // pastel purple
  "#F7CE76", // pastel gold
  "#F4A46E", // pastel orange
];

const insightIcon = { positive: CheckCircle2, warning: AlertTriangle, critical: ShieldAlert };
const insightColor = { positive: "text-primary", warning: "text-amber-600", critical: "text-destructive" };
const insightBg = { positive: "bg-card border-border border-l-4 border-l-emerald-500", warning: "bg-card border-border border-l-4 border-l-amber-500", critical: "bg-card border-border border-l-4 border-l-destructive" };

const PartnerPerformance = () => {
  const latest = performanceWeeks[performanceWeeks.length - 1];
  const previous = performanceWeeks[performanceWeeks.length - 2];
  const weakMetrics = getWeakMetrics(latest);
  const cvatInfo = cvatDescriptions[currentCVAT];

  const trendData = performanceWeeks.map((w) => ({
    name: w.week,
    "Kitchen Timing": w.kitchenTimingScore,
    "Product Avail.": w.productAvailability,
    "Reviews": Math.round(w.customerReviews * 20),
    SCV: w.scv,
  }));

  const radarData = [
    { metric: "Kitchen Timing", value: latest.kitchenTimingScore },
    { metric: "Availability", value: latest.productAvailability },
    { metric: "Reviews", value: Math.round(latest.customerReviews * 20) },
    { metric: "On-time Delivery", value: Math.round(100 - (latest.delayedDeliveries / latest.totalOrders) * 100) },
    { metric: "SCV", value: latest.scv },
  ];

  const scvDelta = latest.scv - previous.scv;
  const scvTrending = scvDelta >= 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold text-foreground">Kitchen Partner Performance</h2>

      {/* CVAT Classification Hero */}
      <Card className="border-border bg-card">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">CVAT Classification</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-3xl font-bold ${cvatInfo.color}`}>{currentSCV}</span>
                <Badge variant="outline" className={`text-xs border ${cvatBadgeStyles[currentCVAT]}`}>
                  {cvatInfo.label}
                </Badge>
                <span className="text-sm text-muted-foreground">(SCV {currentSCV})</span>
              </div>
            </div>
          </div>

          <p className="text-base font-medium text-foreground mb-1">{cvatInfo.description}</p>

          {/* Progress bar */}
          <div className="mt-3 flex gap-1">
            {(["D", "C", "B", "A"] as CVATCategory[]).map((cat) => (
              <div
                key={cat}
                className={`flex-1 h-2 rounded-full ${cat === currentCVAT ? (cat === "A" ? "bg-green-500" : cat === "B" ? "bg-blue-500" : cat === "C" ? "bg-yellow-500" : "bg-red-500") : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>D · &lt;40</span><span>C · 40–60</span><span>B · 60–80</span><span>A · 80+</span>
          </div>

          {/* Improvement Focus */}
          {weakMetrics.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Focus Areas to Improve Your SCV
              </p>
              <div className="space-y-1.5">
                {weakMetrics.map((m) => (
                  <div key={m.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/80">{m.name}</span>
                    <span className="text-red-600 font-medium">
                      {m.inverted ? `${m.value}${m.unit} (target: ${m.ideal})` : `${m.value}${m.unit} (target: ${m.ideal}${m.unit})`}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Improving these metrics will move your SCV towards the next grade.
              </p>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground mt-3 italic">CVAT Process: Classification → Visit → Audit → Training</p>
        </CardContent>
      </Card>

      {/* SCV Trend */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

        <Card className="border-border bg-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Scorecard Value (SCV)</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-bold text-foreground">{currentSCV}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                  <span className={`flex items-center gap-0.5 text-sm font-semibold ${scvTrending ? "text-green-600" : "text-red-600"}`}>
                    {scvTrending ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(scvDelta)} · {scvTrending ? "Improving" : "Declining"}
                  </span>
                </div>
              </div>
            </div>
            <div className="h-28 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={addTrendLine(performanceWeeks.map((w) => ({ name: w.weekLabel, value: w.scv })))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                  <Line type="monotone" dataKey="value" name="SCV" stroke="#7CB9E8" strokeWidth={2.5} dot={{ r: 4, fill: "#7CB9E8" }} label={{ fontSize: 9, fill: "hsl(var(--foreground))", position: "top" }} />
                  <Line type="monotone" dataKey="trend" name="Trend" stroke="#E53E3E" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Combined score from kitchen timing, availability, reviews & delivery performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics with Mini Line Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "SCV Score", key: "scv" as const, icon: Star, unit: "", color: metricPastelColors[0], bg: "bg-card" },
          { label: "Kitchen Timing", key: "kitchenTimingScore" as const, icon: Clock, unit: "%", color: metricPastelColors[1], bg: "bg-card" },
          { label: "Product Availability", key: "productAvailability" as const, icon: Package, unit: "%", color: metricPastelColors[2], bg: "bg-card" },
          { label: "Avg Review", key: "customerReviews" as const, icon: Star, unit: "", color: metricPastelColors[3], bg: "bg-card" },
          { label: "Delayed Orders", key: "delayedDeliveries" as const, icon: AlertTriangle, unit: "", color: metricPastelColors[4], inverted: true, bg: "bg-card" },
          { label: "Bad Reviews", key: "badReviews" as const, icon: ShieldAlert, unit: "", color: metricPastelColors[5], inverted: true, bg: "bg-card" },
        ].map((m) => {
          const data = performanceWeeks.map((w) => ({ name: w.week, value: w[m.key] }));
          const current = data[data.length - 1].value;
          const prev = data[data.length - 2].value;
          const delta = current - prev;
          const good = m.inverted ? delta <= 0 : delta >= 0;
          const trendWord = m.inverted
            ? (delta < 0 ? "Improving" : delta === 0 ? "Stable" : "Worsening")
            : (delta > 0 ? "Improving" : delta === 0 ? "Stable" : "Declining");
          return (
            <Card key={m.label} className={`border-border ${m.bg}`}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <m.icon className="w-4 h-4 text-primary" />
                  <span className="text-[11px] text-muted-foreground font-medium">{m.label}</span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{m.key === "customerReviews" ? current.toFixed(1) : current}{m.unit}</p>
                    <span className={`text-[11px] font-semibold ${good ? "text-green-600" : "text-red-600"}`}>
                      {good ? "↑" : "↓"} {trendWord}
                    </span>
                  </div>
                  <div className="h-12 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={addTrendLine(data)}>
                        <Line type="monotone" dataKey="value" stroke={m.color} strokeWidth={2} dot={{ r: 3, fill: m.color }} label={{ fontSize: 8, fill: "hsl(var(--foreground))", position: "top" }} />
                        <Line type="monotone" dataKey="trend" stroke="#E53E3E" strokeWidth={1} dot={false} />
                        <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                        <XAxis hide dataKey="name" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">3-Week Performance Trends</CardTitle>
            <CardDescription>Key metrics over the last 3 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="Kitchen Timing" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Product Avail." stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="SCV" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance Radar</CardTitle>
            <CardDescription>Current week snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Insights & Business Tips
          </CardTitle>
          <CardDescription>Personalised feedback based on your recent performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {performanceInsights.map((insight, idx) => {
            const Icon = insightIcon[insight.type];
            return (
              <div key={idx} className={`rounded-xl border p-3 ${insightBg[insight.type]}`}>
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${insightColor[insight.type]}`} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{insight.metric}</p>
                    <p className="text-sm text-foreground/80 mt-0.5">{insight.message}</p>
                    {insight.tip && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic">💡 {insight.tip}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Weekly CVAT History */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly CVAT History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {performanceWeeks.map((w) => (
              <div key={w.week} className="flex items-center justify-between bg-muted/30 rounded-xl p-3 border border-border">
                <div>
                  <p className="font-semibold text-foreground text-sm">{w.week} <span className="text-muted-foreground font-normal">({w.weekLabel})</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {w.totalOrders} orders · {w.badReviews} bad reviews · {w.delayedDeliveries} delays
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">SCV</p>
                    <p className="font-bold text-foreground">{w.scv}</p>
                  </div>
                  <Badge variant="outline" className={`text-sm font-bold border ${cvatBadgeStyles[w.cvatCategory]}`}>
                    {w.cvatCategory}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerPerformance;