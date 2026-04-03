import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  BarChart3, TrendingUp, TrendingDown, Minus, Search, Download, Filter, Eye, Activity,
  AlertTriangle, Award, Target, Gauge, Brain, ChevronRight, ArrowUpDown, Lightbulb
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area
} from "recharts";
import {
  PARTNER_METRICS, METRIC_WEIGHTAGES, MONTHS, REGIONS, CUISINES, VERTICALS,
  getLatestMetrics, getVerticalSummaries, getRegionSummaries, getTrendData,
  getIntelligenceInsights, getGrade, getGradeBg, getGradeColor,
  type PartnerMetrics, type Vertical, type SCVGrade
} from "@/data/metricsData";

const GRADE_COLORS: Record<SCVGrade, string> = { A: "#16a34a", B: "#2563eb", C: "#d97706", D: "#dc2626" };

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-green-600" />;
  if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-red-600" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

const SCVBar = ({ value, label }: { value: number; label: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
    <Progress value={value} className="h-1.5" />
  </div>
);

export default function AdminMetrics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQ, setSearchQ] = useState("");
  const [filterVertical, setFilterVertical] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [sortField, setSortField] = useState<"scvBiz" | "scvMetrics" | "scvSales" | "partnerName">("scvBiz");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedPartner, setSelectedPartner] = useState<PartnerMetrics | null>(null);

  const latest = useMemo(() => getLatestMetrics(), []);
  const verticalSummaries = useMemo(() => getVerticalSummaries(), []);
  const regionSummaries = useMemo(() => getRegionSummaries(), []);
  const trendData = useMemo(() => getTrendData(), []);
  const insights = useMemo(() => getIntelligenceInsights(PARTNER_METRICS), []);

  const structuredInsights = useMemo(() => {
    const gradeD = latest.filter(m => m.grade === "D");
    const declining = latest.filter(m => m.trend === "down");
    const underPerformers = latest.filter(m => m.scvSales < 50);
    const lowAttendance = latest.filter(m => m.attendance < 60);
    const topA = latest.filter(m => m.grade === "A");
    const avgDD = latest.reduce((s, m) => s + m.delivery_discipline, 0) / latest.length;
    const avgRR = latest.reduce((s, m) => s + m.repeat_rate, 0) / latest.length;

    const items: { text: string; action?: () => void }[] = [];

    if (gradeD.length > 0) {
      items.push({
        text: `🔴 ${gradeD.length} kitchen(s) in Critical (Grade D) — immediate intervention required. Weakest: ${gradeD.sort((a, b) => a.scvBiz - b.scvBiz)[0]?.partnerName}`,
        action: () => { setFilterGrade("D"); setFilterVertical("all"); setFilterRegion("all"); setSearchQ(""); },
      });
    }
    if (declining.length > 0) {
      items.push({
        text: `📉 ${declining.length} partner(s) showing declining SCV trend — schedule review meetings.`,
        action: () => { setFilterGrade("all"); setFilterVertical("all"); setFilterRegion("all"); setSearchQ(""); setSortField("scvBiz"); setSortDir("asc"); },
      });
    }
    if (underPerformers.length > 0) {
      items.push({
        text: `💰 ${underPerformers.length} kitchen(s) achieving <50% of expected sales — consider demand-gen or menu optimization.`,
        action: () => { setFilterGrade("all"); setFilterVertical("all"); setFilterRegion("all"); setSearchQ(""); setSortField("scvSales"); setSortDir("asc"); },
      });
    }
    if (lowAttendance.length > 0) {
      items.push({
        text: `⏰ ${lowAttendance.length} kitchen(s) with attendance below 60% — potential availability issue impacting revenue.`,
        action: () => { setFilterGrade("all"); setFilterVertical("all"); setFilterRegion("all"); setSearchQ(""); setSortField("scvMetrics"); setSortDir("asc"); },
      });
    }
    items.push({
      text: `🏆 ${topA.length} kitchen(s) rated Grade A (Excellent) — recognize & incentivize to sustain performance.`,
      action: () => { setFilterGrade("A"); setFilterVertical("all"); setFilterRegion("all"); setSearchQ(""); },
    });
    if (avgDD < 70) {
      items.push({ text: `🚚 Average Delivery Discipline at ${avgDD.toFixed(1)}% — below 70% threshold. Training intervention recommended.` });
    }
    const vertSummaries = getVerticalSummaries();
    const sorted = [...vertSummaries].sort((a, b) => b.avgScvBiz - a.avgScvBiz);
    const bestV = sorted[0];
    const worstV = sorted[sorted.length - 1];
    if (bestV && worstV && bestV.vertical !== worstV.vertical) {
      items.push({
        text: `📊 Best vertical: ${bestV.vertical} (SCV ${bestV.avgScvBiz}) vs Weakest: ${worstV.vertical} (SCV ${worstV.avgScvBiz}) — ${(bestV.avgScvBiz - worstV.avgScvBiz).toFixed(1)}pt gap.`,
        action: () => { setFilterVertical(worstV.vertical); setFilterGrade("all"); setFilterRegion("all"); setSearchQ(""); setActiveTab("partners"); },
      });
    }
    if (avgRR < 60) {
      items.push({ text: `🔄 Platform Repeat Rate at ${avgRR.toFixed(1)}% — customer retention programs needed.` });
    }

    return items;
  }, [latest]);

  const filtered = useMemo(() => {
    let data = [...latest];
    if (searchQ) {
      const q = searchQ.toLowerCase();
      data = data.filter(m => m.partnerName.toLowerCase().includes(q) || m.kitchenId.toLowerCase().includes(q) || m.partnerId.toLowerCase().includes(q));
    }
    if (filterVertical !== "all") data = data.filter(m => m.vertical === filterVertical);
    if (filterRegion !== "all") data = data.filter(m => m.region === filterRegion);
    if (filterGrade !== "all") data = data.filter(m => m.grade === filterGrade);
    data.sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      if (typeof va === "number" && typeof vb === "number") return sortDir === "desc" ? vb - va : va - vb;
      return sortDir === "desc" ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
    });
    return data;
  }, [latest, searchQ, filterVertical, filterRegion, filterGrade, sortField, sortDir]);

  // Aggregate stats
  const avgBiz = latest.length ? Math.round(latest.reduce((s, m) => s + m.scvBiz, 0) / latest.length * 10) / 10 : 0;
  const totalExpected = latest.reduce((s, m) => s + m.expectedSales, 0);
  const totalAchieved = latest.reduce((s, m) => s + m.achievedSales, 0);
  const gradeDist = { A: 0, B: 0, C: 0, D: 0 } as Record<SCVGrade, number>;
  latest.forEach(m => gradeDist[m.grade]++);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const pieData = Object.entries(gradeDist).map(([grade, count]) => ({ name: `Grade ${grade}`, value: count, color: GRADE_COLORS[grade as SCVGrade] }));

  const getPartnerHistory = (partnerId: string) => PARTNER_METRICS.filter(m => m.partnerId === partnerId).sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));

  const getPartnerRadar = (m: PartnerMetrics) => METRIC_WEIGHTAGES.map(w => ({
    metric: w.shortLabel,
    value: m[w.key],
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" /> Metric Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">SCV Intelligence · Partner Health · Business Performance</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg SCV(BIZ)</p>
            <p className="text-2xl font-bold text-foreground mt-1">{avgBiz}</p>
            <Badge className={getGradeBg(getGrade(avgBiz))}>{getGrade(avgBiz)}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Kitchens</p>
            <p className="text-2xl font-bold text-foreground mt-1">{latest.length}</p>
            <p className="text-[10px] text-muted-foreground">{latest.filter(m => m.attendance > 50).length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sales Achievement</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalExpected > 0 ? Math.round(totalAchieved / totalExpected * 100) : 0}%</p>
            <p className="text-[10px] text-muted-foreground">₹{(totalAchieved / 100000).toFixed(1)}L / ₹{(totalExpected / 100000).toFixed(1)}L</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Grade Distribution</p>
            <div className="flex items-center gap-1.5 mt-1">
              {(["A", "B", "C", "D"] as SCVGrade[]).map(g => (
                <Badge key={g} className={`${getGradeBg(g)} text-[10px] px-1.5`}>{g}:{gradeDist[g]}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Intelligence Panel */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Intelligence Insights
            <Badge variant="secondary" className="text-[9px]">AI</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {structuredInsights.map((insight, i) => (
            <p key={i} className="text-xs text-foreground leading-relaxed">
              {insight.text}
              {insight.action && (
                <button
                  onClick={() => {
                    insight.action!();
                    setActiveTab("partners");
                  }}
                  className="ml-1.5 text-primary hover:text-primary/80 underline underline-offset-2 font-medium inline-flex items-center gap-0.5 transition-colors"
                >
                  View list <ChevronRight className="w-3 h-3 inline" />
                </button>
              )}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="partners" className="text-xs">Partners</TabsTrigger>
          <TabsTrigger value="verticals" className="text-xs">Verticals</TabsTrigger>
          <TabsTrigger value="regions" className="text-xs">Regions</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
        </TabsList>

        {/* ─── Overview Tab ─── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Weightage Framework */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" /> SCV Weightage Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="text-[10px] text-muted-foreground mb-1">
                  <strong>SCV(BIZ)</strong> = 60% × SCV(Metrics) + 40% × SCV(Sales)
                </div>
                {METRIC_WEIGHTAGES.map(w => (
                  <div key={w.key} className="flex items-center gap-3">
                    <Badge variant="outline" className="w-10 text-center text-[10px]">{w.weight}%</Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{w.label}</span>
                        <span className="text-[10px] text-muted-foreground">({w.shortLabel})</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{w.description}</p>
                    </div>
                    <Progress value={w.weight} className="w-20 h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Grade Distribution Pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* SCV Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">SCV Trend (6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} className="fill-muted-foreground" />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="scvBiz" stroke="#16a34a" strokeWidth={2.5} name="SCV(BIZ)" dot={{ r: 3 }} label={{ fontSize: 9, position: "top" }} />
                      <Line type="monotone" dataKey="scvMetrics" stroke="#2563eb" strokeWidth={1.5} name="SCV(Metrics)" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="scvSales" stroke="#d97706" strokeWidth={1.5} name="SCV(Sales)" strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales vs Expected by Vertical */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sales Achievement by Vertical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={verticalSummaries.map(v => ({
                    name: v.vertical,
                    expected: Math.round(v.totalExpectedSales / 1000),
                    achieved: Math.round(v.totalAchievedSales / 1000),
                    scvBiz: v.avgScvBiz,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                    <YAxis yAxisId="left" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar yAxisId="left" dataKey="expected" fill="#B0B0B0" name="Expected (₹K)" radius={[2, 2, 0, 0]} />
                    <Bar yAxisId="left" dataKey="achieved" fill="#16a34a" name="Achieved (₹K)" radius={[2, 2, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="scvBiz" stroke="#dc2626" strokeWidth={2} name="SCV(BIZ)" dot={{ r: 4 }} label={{ fontSize: 9, position: "top" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Partners Tab ─── */}
        <TabsContent value="partners" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search partner, kitchen ID..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="pl-8 h-9 text-xs" />
            </div>
            <Select value={filterVertical} onValueChange={setFilterVertical}>
              <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Vertical" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verticals</SelectItem>
                {VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-[110px] h-9 text-xs"><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {(["A", "B", "C", "D"] as SCVGrade[]).map(g => <SelectItem key={g} value={g}>Grade {g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-[10px]">{filtered.length} results</Badge>
          </div>

          {/* Partner Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] w-[180px]">
                        <button onClick={() => toggleSort("partnerName")} className="flex items-center gap-1">Partner <ArrowUpDown className="w-3 h-3" /></button>
                      </TableHead>
                      <TableHead className="text-[10px]">Kitchen</TableHead>
                      <TableHead className="text-[10px]">Vertical</TableHead>
                      <TableHead className="text-[10px]">Region</TableHead>
                      <TableHead className="text-[10px] text-center">ATT</TableHead>
                      <TableHead className="text-[10px] text-center">BR</TableHead>
                      <TableHead className="text-[10px] text-center">DD</TableHead>
                      <TableHead className="text-[10px] text-center">CA</TableHead>
                      <TableHead className="text-[10px] text-center">RR</TableHead>
                      <TableHead className="text-[10px] text-center">
                        <button onClick={() => toggleSort("scvMetrics")} className="flex items-center gap-1">SCV(M) <ArrowUpDown className="w-3 h-3" /></button>
                      </TableHead>
                      <TableHead className="text-[10px] text-center">
                        <button onClick={() => toggleSort("scvSales")} className="flex items-center gap-1">SCV(S) <ArrowUpDown className="w-3 h-3" /></button>
                      </TableHead>
                      <TableHead className="text-[10px] text-center">
                        <button onClick={() => toggleSort("scvBiz")} className="flex items-center gap-1 font-bold">SCV(BIZ) <ArrowUpDown className="w-3 h-3" /></button>
                      </TableHead>
                      <TableHead className="text-[10px] text-center">Grade</TableHead>
                      <TableHead className="text-[10px] text-center">Trend</TableHead>
                      <TableHead className="text-[10px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.slice(0, 30).map(m => (
                      <TableRow key={m.partnerId} className="group hover:bg-muted/30">
                        <TableCell className="text-xs font-medium text-foreground">
                          <div>{m.partnerName}</div>
                          <div className="text-[10px] text-muted-foreground">{m.partnerId} · {m.rmn}</div>
                        </TableCell>
                        <TableCell className="text-[10px]">
                          <div className="text-foreground">{m.kitchenName}</div>
                          <Badge variant="outline" className="text-[8px] mt-0.5">{m.kitchenType}</Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{m.vertical}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{m.region}</TableCell>
                        <TableCell className="text-[10px] text-center font-mono text-foreground">{m.attendance.toFixed(0)}</TableCell>
                        <TableCell className="text-[10px] text-center font-mono text-foreground">{m.brand_rating.toFixed(0)}</TableCell>
                        <TableCell className="text-[10px] text-center font-mono text-foreground">{m.delivery_discipline.toFixed(0)}</TableCell>
                        <TableCell className="text-[10px] text-center font-mono text-foreground">{m.customer_acceptance.toFixed(0)}</TableCell>
                        <TableCell className="text-[10px] text-center font-mono text-foreground">{m.repeat_rate.toFixed(0)}</TableCell>
                        <TableCell className="text-xs text-center font-bold text-blue-600 dark:text-blue-400">{m.scvMetrics}</TableCell>
                        <TableCell className="text-xs text-center font-bold text-amber-600 dark:text-amber-400">{m.scvSales}</TableCell>
                        <TableCell className="text-xs text-center font-extrabold text-foreground">{m.scvBiz}</TableCell>
                        <TableCell className="text-center"><Badge className={`${getGradeBg(m.grade)} text-[10px] px-1.5`}>{m.grade}</Badge></TableCell>
                        <TableCell className="text-center"><TrendIcon trend={m.trend} /></TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedPartner(m)}>
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-sm flex items-center gap-2">
                                  {m.partnerName} — {m.kitchenName}
                                  <Badge className={getGradeBg(m.grade)}>Grade {m.grade}</Badge>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* Radar */}
                                <div className="h-[220px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={getPartnerRadar(m)}>
                                      <PolarGrid className="stroke-border" />
                                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} className="fill-foreground" />
                                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} className="fill-muted-foreground" />
                                      <Radar name="Score" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                                    </RadarChart>
                                  </ResponsiveContainer>
                                </div>
                                {/* SCV Breakdown */}
                                <div className="grid grid-cols-3 gap-3">
                                  <Card className="p-3"><SCVBar value={m.scvMetrics} label="SCV(Metrics)" /></Card>
                                  <Card className="p-3"><SCVBar value={m.scvSales} label="SCV(Sales)" /></Card>
                                  <Card className="p-3 border-primary/30"><SCVBar value={m.scvBiz} label="SCV(BIZ)" /></Card>
                                </div>
                                {/* Sales */}
                                <div className="text-xs text-muted-foreground">
                                  Expected: ₹{m.expectedSales.toLocaleString()} · Achieved: ₹{m.achievedSales.toLocaleString()} · Ratio: {(m.achievedSales / m.expectedSales * 100).toFixed(0)}%
                                </div>
                                {/* History */}
                                <Card>
                                  <CardHeader className="pb-1"><CardTitle className="text-xs">6-Month SCV Trend</CardTitle></CardHeader>
                                  <CardContent>
                                    <div className="h-[180px]">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={getPartnerHistory(m.partnerId).map(h => ({
                                          month: h.month.replace(" 20", " '"),
                                          "SCV(BIZ)": h.scvBiz,
                                          "SCV(M)": h.scvMetrics,
                                          "SCV(S)": h.scvSales,
                                        }))}>
                                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                          <XAxis dataKey="month" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                                          <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                                          <Tooltip />
                                          <Line type="monotone" dataKey="SCV(BIZ)" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} label={{ fontSize: 8, position: "top" }} />
                                          <Line type="monotone" dataKey="SCV(M)" stroke="#2563eb" strokeWidth={1} strokeDasharray="4 4" />
                                          <Line type="monotone" dataKey="SCV(S)" stroke="#d97706" strokeWidth={1} strokeDasharray="4 4" />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </CardContent>
                                </Card>
                                {/* Gyan */}
                                <Card className="bg-primary/5 border-primary/20">
                                  <CardContent className="p-3">
                                    <p className="text-xs font-medium text-foreground flex items-center gap-1 mb-1"><Lightbulb className="w-3.5 h-3.5 text-primary" /> Improvement Gyan</p>
                                    {METRIC_WEIGHTAGES.filter(w => m[w.key] < 60).length > 0 ? (
                                      METRIC_WEIGHTAGES.filter(w => m[w.key] < 60).map(w => (
                                        <p key={w.key} className="text-[10px] text-muted-foreground">• <strong>{w.label}</strong> at {m[w.key].toFixed(0)}% — {w.description}. Target: 70%+</p>
                                      ))
                                    ) : (
                                      <p className="text-[10px] text-muted-foreground">All metrics above 60% — strong operational performance. Focus on sales growth.</p>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filtered.length > 30 && (
                <div className="p-3 text-center text-[10px] text-muted-foreground border-t">
                  Showing 30 of {filtered.length} — use filters to narrow results
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Verticals Tab ─── */}
        <TabsContent value="verticals" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {verticalSummaries.map(v => (
              <Card key={v.vertical} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {v.vertical}
                    <Badge className={getGradeBg(getGrade(v.avgScvBiz))}>{getGrade(v.avgScvBiz)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{v.avgScvBiz}</p>
                      <p className="text-[9px] text-muted-foreground">SCV(BIZ)</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{v.avgScvMetrics}</p>
                      <p className="text-[9px] text-muted-foreground">SCV(M)</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{v.avgScvSales}</p>
                      <p className="text-[9px] text-muted-foreground">SCV(S)</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{v.activeKitchens}/{v.totalKitchens} active</span>
                    <span>₹{(v.totalAchievedSales / 100000).toFixed(1)}L / ₹{(v.totalExpectedSales / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(["A", "B", "C", "D"] as SCVGrade[]).map(g => (
                      <div key={g} className="flex-1">
                        <div className="h-4 rounded-sm flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: GRADE_COLORS[g], opacity: v.gradeDistribution[g] > 0 ? 1 : 0.2 }}>
                          {v.gradeDistribution[g] > 0 && v.gradeDistribution[g]}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vertical Comparison Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Vertical SCV Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={verticalSummaries.map(v => ({ name: v.vertical, "SCV(Metrics)": v.avgScvMetrics, "SCV(Sales)": v.avgScvSales, "SCV(BIZ)": v.avgScvBiz }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} className="fill-muted-foreground" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="SCV(Metrics)" fill="#2563eb" radius={[0, 2, 2, 0]} />
                    <Bar dataKey="SCV(Sales)" fill="#d97706" radius={[0, 2, 2, 0]} />
                    <Bar dataKey="SCV(BIZ)" fill="#16a34a" radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Regions Tab ─── */}
        <TabsContent value="regions" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {regionSummaries.map(r => (
              <Card key={r.region}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {r.region}
                    <Badge className={getGradeBg(getGrade(r.avgScvBiz))}>{getGrade(r.avgScvBiz)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{r.avgScvBiz}</p>
                    <p className="text-[10px] text-muted-foreground">Avg SCV(BIZ) · {r.totalPartners} partners</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {(["A", "B", "C", "D"] as SCVGrade[]).map(g => (
                      <div key={g} className="flex-1">
                        <div className="h-4 rounded-sm flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: GRADE_COLORS[g], opacity: r.gradeDistribution[g] > 0 ? 1 : 0.2 }}>
                          {r.gradeDistribution[g] > 0 && r.gradeDistribution[g]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] space-y-0.5">
                    <div className="flex items-center gap-1"><Award className="w-3 h-3 text-green-600" /> <span className="text-muted-foreground">Top:</span> <span className="text-foreground font-medium">{r.topPerformer}</span></div>
                    <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> <span className="text-muted-foreground">Bottom:</span> <span className="text-foreground font-medium">{r.bottomPerformer}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Region Comparison */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Region SCV(BIZ) Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionSummaries.map(r => ({ name: r.region, "SCV(BIZ)": r.avgScvBiz, partners: r.totalPartners }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                    <Tooltip />
                    <Bar dataKey="SCV(BIZ)" radius={[4, 4, 0, 0]} label={{ fontSize: 9, position: "top" }}>
                      {regionSummaries.map((r, i) => <Cell key={i} fill={GRADE_COLORS[getGrade(r.avgScvBiz)]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Trends Tab ─── */}
        <TabsContent value="trends" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Platform SCV Trend — 6 Month Rolling</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="scvBiz" fill="#16a34a" fillOpacity={0.1} stroke="#16a34a" strokeWidth={3} name="SCV(BIZ)" dot={{ r: 4 }} label={{ fontSize: 10, position: "top", fill: "#16a34a" }} />
                    <Line type="monotone" dataKey="scvMetrics" stroke="#2563eb" strokeWidth={2} name="SCV(Metrics)" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="scvSales" stroke="#d97706" strokeWidth={2} name="SCV(Sales)" dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Grade Shift Over Time */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Grade Distribution Over Time</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={["Oct '25", "Nov '25", "Dec '25", "Jan '26", "Feb '26", "Mar '26"].map((monthLabel, mi) => {
                    const monthData = PARTNER_METRICS.filter(m => m.month === ["Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026"][mi]);
                    const dist = { A: 0, B: 0, C: 0, D: 0 } as Record<string, number>;
                    monthData.forEach(m => dist[m.grade]++);
                    return { month: monthLabel, ...dist };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="A" stackId="g" fill="#16a34a" name="Grade A" />
                    <Bar dataKey="B" stackId="g" fill="#2563eb" name="Grade B" />
                    <Bar dataKey="C" stackId="g" fill="#d97706" name="Grade C" />
                    <Bar dataKey="D" stackId="g" fill="#dc2626" name="Grade D" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
