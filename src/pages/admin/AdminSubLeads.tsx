import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import {
  Users, Search, Phone, MapPin, Calendar, TrendingUp,
  ArrowUpRight, Download, Filter, UserPlus, Target, Megaphone,
} from "lucide-react";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--destructive))",
];

type LeadStatus = "new" | "contacted" | "interested" | "trial_started" | "converted" | "lost";
type LeadSource = "direct" | "marketing" | "referral" | "organic" | "social_media" | "partner";

interface SubscriptionLead {
  id: string;
  name: string;
  phone: string;
  location: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
  lastContactedAt?: string;
  assignedTo?: string;
  savedPlan?: string;
  notes?: string;
  score: number; // 0-100 lead score
}

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800" },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  interested: { label: "Interested", color: "bg-primary/10 text-primary" },
  trial_started: { label: "Trial Started", color: "bg-green-100 text-green-800" },
  converted: { label: "Converted", color: "bg-green-200 text-green-900" },
  lost: { label: "Lost", color: "bg-muted text-muted-foreground" },
};

const sourceLabels: Record<LeadSource, string> = {
  direct: "Direct", marketing: "Marketing", referral: "Referral",
  organic: "Organic", social_media: "Social Media", partner: "Partner Referral",
};

const mockLeads: SubscriptionLead[] = [
  { id: "SL001", name: "Kavitha Rajan", phone: "9876500001", location: "Financial District", source: "marketing", status: "new", createdAt: "2026-03-17", score: 72, savedPlan: "Chettinad Veg Thali" },
  { id: "SL002", name: "Arjun Patel", phone: "9876500002", location: "Madhapur", source: "referral", status: "contacted", createdAt: "2026-03-16", lastContactedAt: "2026-03-17", assignedTo: "Priya (TL)", score: 85, savedPlan: "Pennsylvania Spice Box" },
  { id: "SL003", name: "Divya Menon", phone: "9876500003", location: "Uptown", source: "social_media", status: "interested", createdAt: "2026-03-15", lastContactedAt: "2026-03-16", assignedTo: "Anitha (Exec)", score: 90, savedPlan: "Florida Sadya Box", notes: "Wants trial first" },
  { id: "SL004", name: "Suresh Kumar", phone: "9876500004", location: "Gachibowli", source: "organic", status: "trial_started", createdAt: "2026-03-12", lastContactedAt: "2026-03-14", assignedTo: "Priya (TL)", score: 95 },
  { id: "SL005", name: "Fatima Brown", phone: "9876500005", location: "Kondapur", source: "partner", status: "converted", createdAt: "2026-03-08", lastContactedAt: "2026-03-12", assignedTo: "Anitha (Exec)", score: 100 },
  { id: "SL006", name: "Ravi Teja", phone: "9876500006", location: "Kukatpally", source: "marketing", status: "contacted", createdAt: "2026-03-15", lastContactedAt: "2026-03-16", assignedTo: "Priya (TL)", score: 60 },
  { id: "SL007", name: "Nandini Reddy", phone: "9876500007", location: "Nallagandla", source: "direct", status: "lost", createdAt: "2026-03-10", lastContactedAt: "2026-03-13", notes: "Budget constraints", score: 30 },
  { id: "SL008", name: "Prakash Rao", phone: "9876500008", location: "Manikonda", source: "social_media", status: "new", createdAt: "2026-03-17", score: 65 },
  { id: "SL009", name: "Snehalatha K", phone: "9876500009", location: "Downtown", source: "referral", status: "interested", createdAt: "2026-03-14", assignedTo: "Priya (TL)", score: 88, savedPlan: "South Indian Breakfast" },
  { id: "SL010", name: "Mohammed Irfan", phone: "9876500010", location: "Financial District", source: "marketing", status: "trial_started", createdAt: "2026-03-11", assignedTo: "Anitha (Exec)", score: 92, savedPlan: "Chettinad Non-Veg" },
  { id: "SL011", name: "Preethi Sagar", phone: "9876500011", location: "Madhapur", source: "organic", status: "new", createdAt: "2026-03-17", score: 55 },
  { id: "SL012", name: "Venkat Ramana", phone: "9876500012", location: "Kondapur", source: "marketing", status: "lost", createdAt: "2026-03-05", lastContactedAt: "2026-03-09", notes: "Relocated", score: 15 },
];

// Analytics data
const sourceAnalytics = [
  { source: "Marketing", leads: 4, converted: 1, rate: 25 },
  { source: "Referral", leads: 2, converted: 1, rate: 50 },
  { source: "Social Media", leads: 2, converted: 0, rate: 0 },
  { source: "Organic", leads: 2, converted: 0, rate: 0 },
  { source: "Partner", leads: 1, converted: 1, rate: 100 },
  { source: "Direct", leads: 1, converted: 0, rate: 0 },
];

const weeklyLeadTrend = [
  { week: "W1 Mar", newLeads: 8, converted: 2 },
  { week: "W2 Mar", newLeads: 12, converted: 3 },
  { week: "W3 Mar", newLeads: 15, converted: 4 },
  { week: "W4 Feb", newLeads: 6, converted: 1 },
  { week: "W3 Feb", newLeads: 9, converted: 2 },
  { week: "W2 Feb", newLeads: 7, converted: 2 },
];

const funnelData = [
  { stage: "New Leads", value: 45, pct: 100 },
  { stage: "Contacted", value: 32, pct: 71 },
  { stage: "Interested", value: 22, pct: 49 },
  { stage: "Trial Started", value: 14, pct: 31 },
  { stage: "Converted", value: 8, pct: 18 },
];

const AdminSubLeads = () => {
  const [leads] = useState<SubscriptionLead[]>(mockLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filteredLeads = leads.filter(l => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.phone.includes(search) && !l.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
    return true;
  });

  const newCount = leads.filter(l => l.status === "new").length;
  const contactedCount = leads.filter(l => l.status === "contacted").length;
  const interestedCount = leads.filter(l => l.status === "interested").length;
  const convertedCount = leads.filter(l => l.status === "converted").length;
  const conversionRate = leads.length > 0 ? ((convertedCount / leads.length) * 100).toFixed(1) : "0";
  const avgScore = Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length);

  const sourcePieData = sourceAnalytics.map(s => ({ name: s.source, value: s.leads }));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscription Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">Lead pipeline, source analysis & conversion tracking</p>
        </div>
        <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5"><Download className="w-3.5 h-3.5" /> Export</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "New", value: newCount, icon: UserPlus, color: "text-blue-600" },
          { label: "Contacted", value: contactedCount, icon: Phone, color: "text-yellow-600" },
          { label: "Interested", value: interestedCount, icon: Target, color: "text-primary" },
          { label: "Converted", value: convertedCount, icon: ArrowUpRight, color: "text-green-600" },
          { label: "Conversion %", value: `${conversionRate}%`, icon: TrendingUp, color: "text-chart-2" },
          { label: "Avg Score", value: avgScore, icon: Target, color: "text-chart-4" },
        ].map(m => (
          <Card key={m.label} className="border-border">
            <CardContent className="p-3 flex items-center gap-2">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <div>
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                <p className="text-[9px] text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Lead Conversion Funnel</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {funnelData.map((step, i) => (
            <div key={step.stage} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{step.stage}</span>
                <span className="text-xs text-muted-foreground">{step.value} ({step.pct}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${step.pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Leads by Source</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={{}} className="h-[220px] w-full">
              <PieChart>
                <Pie data={sourcePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {sourcePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <div className="px-6 pb-4 grid grid-cols-2 gap-1">
            {sourcePieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Weekly Lead Trend</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ newLeads: { label: "New Leads", color: "hsl(var(--primary))" }, converted: { label: "Converted", color: "hsl(var(--chart-2))" } }} className="h-[250px] w-full">
              <LineChart data={weeklyLeadTrend.reverse()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="newLeads" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="New Leads" />
                <Line type="monotone" dataKey="converted" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="Converted" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Source Conversion Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" /> Source Performance</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={{ leads: { label: "Leads", color: "hsl(var(--primary))" }, converted: { label: "Converted", color: "hsl(var(--chart-2))" } }} className="h-[200px] w-full">
            <BarChart data={sourceAnalytics}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="source" tick={{ fontSize: 10 }} />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Leads" />
              <Bar dataKey="converted" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Converted" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, location..." className="pl-8 h-9 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {Object.entries(sourceLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Lead</TableHead>
              <TableHead className="text-[10px]">Location</TableHead>
              <TableHead className="text-[10px]">Source</TableHead>
              <TableHead className="text-[10px]">Status</TableHead>
              <TableHead className="text-[10px]">Score</TableHead>
              <TableHead className="text-[10px]">Plan Interest</TableHead>
              <TableHead className="text-[10px]">Assigned To</TableHead>
              <TableHead className="text-[10px]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map(l => {
              const sc = statusConfig[l.status];
              return (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">
                    <p className="font-medium text-foreground">{l.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> {l.phone}</p>
                  </TableCell>
                  <TableCell className="text-xs flex items-center gap-0.5"><MapPin className="w-3 h-3 text-muted-foreground" /> {l.location}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px]">{sourceLabels[l.source]}</Badge></TableCell>
                  <TableCell><Badge className={`text-[9px] ${sc.color}`}>{sc.label}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full ${l.score >= 80 ? "bg-green-500" : l.score >= 50 ? "bg-yellow-500" : "bg-destructive"}`} style={{ width: `${l.score}%` }} />
                      </div>
                      <span className="text-[10px] font-medium">{l.score}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{l.savedPlan || "—"}</TableCell>
                  <TableCell className="text-[10px]">{l.assignedTo || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" /> {l.createdAt}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-[9px] text-muted-foreground">💡 Lead score combines recency, plan interest, source quality, and engagement signals. Scores above 80 are high-priority.</p>
    </div>
  );
};

export default AdminSubLeads;
