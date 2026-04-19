import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllLeads, getLeadStats, type PartyLead, type LeadStatus } from "@/data/partyLeadsStore";
import {
  Users, Eye, Save, ShoppingCart, MessageCircle, LogOut, Search, Phone, MapPin,
  CalendarDays, ArrowDownUp, Download, TrendingUp, ArrowRight, Clock, Percent,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel,
  LabelList, Cell, LineChart, Line, CartesianGrid, Legend, PieChart, Pie,
} from "recharts";
import * as XLSX from "xlsx";

const statusConfig: Record<LeadStatus, { label: string; color: string; icon: typeof Eye; chartColor: string }> = {
  visited: { label: "Visited", color: "bg-blue-100 text-blue-800", icon: Eye, chartColor: "#3b82f6" },
  menu_saved: { label: "Menu Saved", color: "bg-amber-100 text-amber-800", icon: Save, chartColor: "#f59e0b" },
  pre_order_discussion: { label: "Pre-Order Discussion", color: "bg-purple-100 text-purple-800", icon: MessageCircle, chartColor: "#8b5cf6" },
  order_placed: { label: "Order Placed", color: "bg-green-100 text-green-800", icon: ShoppingCart, chartColor: "#22c55e" },
  exited: { label: "Exited", color: "bg-red-100 text-red-800", icon: LogOut, chartColor: "#ef4444" },
};

const FUNNEL_COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e"];

const AdminPartyLeads = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"recent" | "visits">("recent");
  const [activeTab, setActiveTab] = useState<"overview" | "leads">("overview");

  const leads = useMemo(() => getAllLeads(), []);
  const stats = useMemo(() => getLeadStats(), []);

  const filtered = useMemo(() => {
    let result = leads;
    if (filterStatus !== "all") result = result.filter((l) => l.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.location.toLowerCase().includes(q));
    }
    result.sort((a, b) => sortBy === "visits" ? b.visits - a.visits : new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
    return result;
  }, [leads, filterStatus, search, sortBy]);

  // Funnel data (excluding exited)
  const funnelData = useMemo(() => [
    { name: "Visited", value: stats.visited + stats.menuSaved + stats.preOrderDiscussion + stats.orderPlaced, fill: FUNNEL_COLORS[0] },
    { name: "Menu Saved", value: stats.menuSaved + stats.preOrderDiscussion + stats.orderPlaced, fill: FUNNEL_COLORS[1] },
    { name: "Pre-Order Talk", value: stats.preOrderDiscussion + stats.orderPlaced, fill: FUNNEL_COLORS[2] },
    { name: "Order Placed", value: stats.orderPlaced, fill: FUNNEL_COLORS[3] },
  ], [stats]);

  // Conversion rates
  const conversionRates = useMemo(() => {
    const totalActive = stats.total - stats.exited;
    const visitToSave = stats.visited > 0 ? ((stats.menuSaved + stats.preOrderDiscussion + stats.orderPlaced) / (stats.visited + stats.menuSaved + stats.preOrderDiscussion + stats.orderPlaced)) * 100 : 0;
    const saveToTalk = stats.menuSaved > 0 ? ((stats.preOrderDiscussion + stats.orderPlaced) / (stats.menuSaved + stats.preOrderDiscussion + stats.orderPlaced)) * 100 : 0;
    const talkToOrder = stats.preOrderDiscussion > 0 ? (stats.orderPlaced / (stats.preOrderDiscussion + stats.orderPlaced)) * 100 : 0;
    const overallConversion = stats.total > 0 ? (stats.orderPlaced / stats.total) * 100 : 0;
    const exitRate = stats.total > 0 ? (stats.exited / stats.total) * 100 : 0;

    return { visitToSave, saveToTalk, talkToOrder, overallConversion, exitRate };
  }, [stats]);

  // Source distribution for pie chart
  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {};
    leads.forEach((l) => { sources[l.source] = (sources[l.source] || 0) + 1; });
    const colors = ["#3b82f6", "#f59e0b", "#22c55e", "#8b5cf6", "#ef4444"];
    return Object.entries(sources).map(([name, value], i) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value,
      fill: colors[i % colors.length],
    }));
  }, [leads]);

  // Trend data (last 7 days)
  const trendData = useMemo(() => {
    const days: Record<string, { date: string; leads: number; conversions: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: d.toLocaleDateString("en", { month: "short", day: "numeric" }), leads: 0, conversions: 0 };
    }
    leads.forEach((l) => {
      const key = l.createdAt.slice(0, 10);
      if (days[key]) days[key].leads += 1;
      if (l.status === "order_placed") {
        const vKey = l.lastVisit.slice(0, 10);
        if (days[vKey]) days[vKey].conversions += 1;
      }
    });
    return Object.values(days);
  }, [leads]);

  // Average visits before conversion
  const avgVisits = useMemo(() => {
    const converted = leads.filter((l) => l.status === "order_placed");
    if (converted.length === 0) return 0;
    return Math.round(converted.reduce((s, l) => s + l.visits, 0) / converted.length * 10) / 10;
  }, [leads]);

  const handleExportExcel = () => {
    const headers = ["Name", "Phone", "Location", "Status", "Visits", "Source", "Created", "Last Visit", "Saved Menu?", "Guest Count", "Occasion", "Event Date"];
    const rows = filtered.map((l) => [
      l.name, l.phone, l.location, statusConfig[l.status]?.label || l.status,
      l.visits, l.source, new Date(l.createdAt).toLocaleDateString(), new Date(l.lastVisit).toLocaleDateString(),
      l.savedOrder ? "Yes" : "No",
      l.savedOrder?.guestCount || "", l.savedOrder?.occasion || "", l.savedOrder?.eventDate || "",
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = headers.map(() => ({ wch: 16 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Party Leads");
    XLSX.writeFile(wb, "party-leads-report.xlsx");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">🎯 Party Order Leads</h1>
          <p className="text-sm text-muted-foreground">End-to-end intelligence: leads, saved menus, orders & funnel tracking</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export Excel
        </Button>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
        <button onClick={() => setActiveTab("overview")} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "overview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
          📊 Analytics
        </button>
        <button onClick={() => setActiveTab("leads")} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "leads" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
          👥 Lead List
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {/* KPI Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Total Leads", value: stats.total, icon: Users, color: "text-foreground" },
              { label: "Converted", value: stats.orderPlaced, icon: ShoppingCart, color: "text-emerald-600" },
              { label: "Conversion Rate", value: `${conversionRates.overallConversion.toFixed(1)}%`, icon: Percent, color: "text-primary" },
              { label: "Exit Rate", value: `${conversionRates.exitRate.toFixed(1)}%`, icon: LogOut, color: "text-destructive" },
              { label: "Avg Visits to Convert", value: avgVisits || "–", icon: Clock, color: "text-amber-600" },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-3 text-center">
                <kpi.icon className={`w-5 h-5 mx-auto mb-1 ${kpi.color}`} />
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              </Card>
            ))}
          </div>

          {/* Funnel Visualization */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-1 text-foreground">📈 Conversion Funnel</h3>
            <p className="text-[10px] text-muted-foreground mb-3">Lead journey from visit to order placement</p>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Visited", count: stats.visited + stats.menuSaved + stats.preOrderDiscussion + stats.orderPlaced, color: FUNNEL_COLORS[0] },
                { label: "Menu Saved", count: stats.menuSaved + stats.preOrderDiscussion + stats.orderPlaced, color: FUNNEL_COLORS[1], rate: conversionRates.visitToSave },
                { label: "Pre-Order Talk", count: stats.preOrderDiscussion + stats.orderPlaced, color: FUNNEL_COLORS[2], rate: conversionRates.saveToTalk },
                { label: "Order Placed", count: stats.orderPlaced, color: FUNNEL_COLORS[3], rate: conversionRates.talkToOrder },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className="text-center min-w-[100px]">
                    <div className="rounded-lg px-4 py-3 text-white font-bold text-lg" style={{
                      backgroundColor: step.color,
                      width: `${Math.max(80, 100 - i * 10)}%`,
                      margin: "0 auto",
                    }}>
                      {step.count}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{step.label}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ArrowRight className="w-4 h-4" />
                      {step.rate !== undefined && (
                        <span className="text-[9px] font-medium text-primary">{step.rate.toFixed(0)}%</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {stats.exited > 0 && (
              <div className="mt-3 flex items-center gap-2 text-[10px] text-destructive">
                <LogOut className="w-3 h-3" /> {stats.exited} leads exited the funnel
              </div>
            )}
          </Card>

          {/* Charts Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Trend Chart */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-1 text-foreground">📅 7-Day Trend</h3>
              <p className="text-[10px] text-muted-foreground mb-3">New leads vs conversions</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="New Leads" />
                  <Line type="monotone" dataKey="conversions" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Conversions" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Source Distribution */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-1 text-foreground">🔗 Lead Sources</h3>
              <p className="text-[10px] text-muted-foreground mb-3">Where your leads come from</p>
              {sourceData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }} fontSize={10}>
                      {sourceData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Stage-wise Conversion Table */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">🔄 Stage-wise Conversion Rates</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Stage Transition</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">From</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">To</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Rate</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { from: "Visited", to: "Menu Saved", fromCount: stats.visited + stats.menuSaved + stats.preOrderDiscussion + stats.orderPlaced, toCount: stats.menuSaved + stats.preOrderDiscussion + stats.orderPlaced, rate: conversionRates.visitToSave, color: "#f59e0b" },
                    { from: "Menu Saved", to: "Pre-Order Talk", fromCount: stats.menuSaved + stats.preOrderDiscussion + stats.orderPlaced, toCount: stats.preOrderDiscussion + stats.orderPlaced, rate: conversionRates.saveToTalk, color: "#8b5cf6" },
                    { from: "Pre-Order Talk", to: "Order Placed", fromCount: stats.preOrderDiscussion + stats.orderPlaced, toCount: stats.orderPlaced, rate: conversionRates.talkToOrder, color: "#22c55e" },
                  ].map((row) => (
                    <tr key={row.from} className="border-b border-border/50">
                      <td className="py-2.5 px-3 font-medium text-foreground">{row.from} → {row.to}</td>
                      <td className="py-2.5 px-3 text-center">{row.fromCount}</td>
                      <td className="py-2.5 px-3 text-center">{row.toCount}</td>
                      <td className="py-2.5 px-3 text-center font-semibold" style={{ color: row.color }}>{row.rate.toFixed(1)}%</td>
                      <td className="py-2.5 px-3">
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(row.rate, 100)}%`, backgroundColor: row.color }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-secondary/30">
                    <td className="py-2.5 px-3 font-semibold text-foreground">Overall: Visit → Order</td>
                    <td className="py-2.5 px-3 text-center">{stats.total}</td>
                    <td className="py-2.5 px-3 text-center">{stats.orderPlaced}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-primary">{conversionRates.overallConversion.toFixed(1)}%</td>
                    <td className="py-2.5 px-3">
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(conversionRates.overallConversion, 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeTab === "leads" && (
        <>
          {/* Funnel Filter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
              { label: "Total Leads", count: stats.total, icon: Users, color: "text-foreground", filter: "all" as const },
              { label: "Visited", count: stats.visited, icon: Eye, color: "text-blue-600", filter: "visited" as const },
              { label: "Menu Saved", count: stats.menuSaved, icon: Save, color: "text-amber-600", filter: "menu_saved" as const },
              { label: "Pre-Order Talk", count: stats.preOrderDiscussion, icon: MessageCircle, color: "text-purple-600", filter: "pre_order_discussion" as const },
              { label: "Order Placed", count: stats.orderPlaced, icon: ShoppingCart, color: "text-green-600", filter: "order_placed" as const },
              { label: "Exited", count: stats.exited, icon: LogOut, color: "text-red-600", filter: "exited" as const },
            ].map((s) => (
              <Card key={s.label} className={`cursor-pointer hover:border-primary/40 transition-colors ${filterStatus === s.filter ? "border-primary" : ""}`} onClick={() => setFilterStatus(s.filter)}>
                <CardContent className="p-3 text-center">
                  <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                  <p className="text-xl font-bold text-foreground">{s.count}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone or location..." className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs outline-none focus:border-primary" />
            </div>
            <button onClick={() => setSortBy((s) => s === "recent" ? "visits" : "recent")} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowDownUp className="w-3 h-3" />
              {sortBy === "recent" ? "Recent" : "Visits"}
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setFilterStatus("all")} className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors ${filterStatus === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>All</button>
            {(Object.keys(statusConfig) as LeadStatus[]).map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {statusConfig[s].label}
              </button>
            ))}
          </div>

          {/* Leads List */}
          {filtered.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No leads found. Leads will appear as customers visit the Party Orders page.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((lead) => {
                const cfg = statusConfig[lead.status];
                const StatusIcon = cfg.icon;
                return (
                  <Card key={lead.id} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{lead.phone}</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{lead.location}</span>
                        </div>
                      </div>
                      <Badge className={`${cfg.color} text-[10px] gap-1`}>
                        <StatusIcon className="w-3 h-3" /> {cfg.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{lead.visits} visits</span>
                      <span className="flex items-center gap-0.5"><CalendarDays className="w-2.5 h-2.5" />{new Date(lead.lastVisit).toLocaleDateString()}</span>
                      <span className="bg-secondary px-1.5 py-0.5 rounded text-[9px]">{lead.source}</span>
                    </div>
                    {lead.savedOrder && (
                      <div className="mt-2 bg-accent/20 border border-accent rounded-lg p-2 text-[10px] text-muted-foreground">
                        <p className="font-semibold text-foreground text-xs mb-0.5">📋 Saved Menu</p>
                        <p>{lead.savedOrder.guestCount} guests · {lead.savedOrder.occasion} · {lead.savedOrder.eventDate}</p>
                        <p>{lead.savedOrder.selectedItems.length} items · Expires {new Date(lead.savedOrder.expiresAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="mt-2 flex gap-1.5">
                      <a href={`https://wa.me/91${lead.phone}?text=Hi%20${encodeURIComponent(lead.name)}%2C%20regarding%20your%20Shero%20party%20order...`} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium hover:bg-green-200 transition-colors">
                        💬 WhatsApp
                      </a>
                      <a href={`tel:+1${lead.phone}`} className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-medium hover:bg-blue-200 transition-colors">
                        📞 Call
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPartyLeads;
