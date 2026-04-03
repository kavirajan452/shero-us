import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Heart, AlertTriangle, MessageCircle, Users, TrendingUp, TrendingDown,
  Phone, BookOpen, Smile, Frown, Meh, AlertCircle, CheckCircle2, Clock, ArrowUpRight,
  Shield, Star, Activity, Handshake, Brain, HeartHandshake, Sparkles, ChevronRight,
  Send, FileText, Filter, BarChart3, Eye,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  MOCK_GRIEVANCES, WELFARE_PROGRAMS, FRIEND_TO_PARTNER, STRESS_BUSTERS,
  SPC_KPIS, GRIEVANCE_TRENDS, CATEGORY_DISTRIBUTION, MOOD_DISTRIBUTION,
  type Grievance, type GrievanceStatus, type GrievancePriority, type FriendToPartner,
} from "@/data/spcData";
import { toast } from "sonner";

// ── Helpers ──

const statusColors: Record<GrievanceStatus, string> = {
  open: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  escalated: "bg-destructive/15 text-destructive",
  resolved: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  closed: "bg-muted text-muted-foreground",
};

const priorityColors: Record<GrievancePriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  critical: "bg-destructive/15 text-destructive",
};

const moodIcons = {
  happy: <Smile className="w-4 h-4 text-green-500" />,
  neutral: <Meh className="w-4 h-4 text-amber-500" />,
  stressed: <Frown className="w-4 h-4 text-orange-500" />,
  critical: <AlertCircle className="w-4 h-4 text-destructive" />,
};

const moodColors = {
  happy: "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400",
  neutral: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
  stressed: "text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400",
  critical: "text-destructive bg-destructive/10",
};

// ── Main Component ──

export default function AdminSPC() {
  const [activeTab, setActiveTab] = useState<"overview" | "grievances" | "welfare" | "friend" | "resources" | "analytics">("overview");
  const [grievances, setGrievances] = useState(MOCK_GRIEVANCES);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<FriendToPartner | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");

  const tabs = [
    { key: "overview" as const, label: "SPC Dashboard", icon: Heart },
    { key: "grievances" as const, label: "Grievances", icon: AlertTriangle },
    { key: "welfare" as const, label: "Welfare Programs", icon: HeartHandshake },
    { key: "friend" as const, label: "Friend to Partner", icon: Handshake },
    { key: "resources" as const, label: "Help Centre", icon: BookOpen },
    { key: "analytics" as const, label: "Analytics & KPIs", icon: BarChart3 },
  ];

  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      if (priorityFilter !== "all" && g.priority !== priorityFilter) return false;
      if (search && !g.partnerName.toLowerCase().includes(search.toLowerCase()) && !g.subject.toLowerCase().includes(search.toLowerCase()) && !g.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [grievances, statusFilter, priorityFilter, search]);

  const handleStatusChange = (id: string, newStatus: GrievanceStatus) => {
    setGrievances((prev) => prev.map((g) => g.id === id ? { ...g, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] } : g));
    toast.success(`Grievance ${id} status updated to ${newStatus}`);
  };

  const handleSendMessage = (id: string) => {
    if (!newMessage.trim()) return;
    setGrievances((prev) => prev.map((g) => g.id === id ? {
      ...g,
      messages: [...g.messages, { from: "spc" as const, text: newMessage, time: new Date().toLocaleString() }],
      updatedAt: new Date().toISOString().split("T")[0],
    } : g));
    if (selectedGrievance?.id === id) {
      setSelectedGrievance((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, { from: "spc" as const, text: newMessage, time: new Date().toLocaleString() }],
      } : null);
    }
    setNewMessage("");
    toast.success("Message sent to partner");
  };

  // ── KPI Summary Stats ──
  const openGrievances = grievances.filter((g) => g.status === "open" || g.status === "in_progress").length;
  const escalatedCount = grievances.filter((g) => g.status === "escalated").length;
  const resolvedCount = grievances.filter((g) => g.status === "resolved" || g.status === "closed").length;
  const activeFriends = FRIEND_TO_PARTNER.filter((f) => f.status === "active").length;
  const stressedPartners = FRIEND_TO_PARTNER.filter((f) => f.mood === "stressed" || f.mood === "critical").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" /> Shero Partner Centre (SPC)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Partner relationship, grievance management, welfare programs & wellbeing support
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════ OVERVIEW TAB ═══════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "Open Grievances", value: openGrievances, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
              { label: "Escalated", value: escalatedCount, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
              { label: "Resolved (MTD)", value: resolvedCount, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
              { label: "Active Friends", value: activeFriends, icon: Handshake, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
              { label: "Stressed Partners", value: stressedPartners, icon: Frown, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950" },
              { label: "Welfare Programs", value: WELFARE_PROGRAMS.filter((w) => w.isActive).length, icon: HeartHandshake, color: "text-primary", bg: "bg-primary/10" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="border">
                  <CardContent className="p-4">
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                      <Icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* SPC KPI Cards */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">SPC Performance KPIs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SPC_KPIS.map((kpi) => {
                const perf = kpi.target > 0 ? (kpi.value / kpi.target) * 100 : 0;
                const isGood = kpi.key === "escalation_rate" ? kpi.value <= kpi.target : kpi.value >= kpi.target;
                return (
                  <Card key={kpi.key} className="border">
                    <CardContent className="p-4">
                      <p className="text-[11px] text-muted-foreground mb-1">{kpi.label}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-foreground">{kpi.value}{kpi.unit}</span>
                        <span className="text-[10px] text-muted-foreground">/ {kpi.target}{kpi.unit}</span>
                      </div>
                      <Progress value={Math.min(perf, 100)} className="h-1.5 mt-2" />
                      <div className="flex items-center gap-1 mt-1">
                        {kpi.trend === "up" ? <TrendingUp className="w-3 h-3 text-green-500" /> : kpi.trend === "down" ? <TrendingDown className="w-3 h-3 text-destructive" /> : <Activity className="w-3 h-3 text-muted-foreground" />}
                        <span className={`text-[10px] ${isGood ? "text-green-600" : "text-destructive"}`}>
                          {kpi.trendValue > 0 ? "+" : ""}{kpi.trendValue}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Critical Items */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Recent Grievances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grievances.slice(0, 4).map((g) => (
                  <button key={g.id} onClick={() => { setSelectedGrievance(g); setActiveTab("grievances"); }} className="w-full text-left p-2.5 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">{g.id}</span>
                      <Badge className={`text-[10px] ${statusColors[g.status]}`}>{g.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground mt-1 line-clamp-1">{g.subject}</p>
                    <p className="text-[11px] text-muted-foreground">{g.partnerName} · {g.category}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Frown className="w-4 h-4 text-orange-500" /> Partners Needing Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {FRIEND_TO_PARTNER.filter((f) => f.mood === "stressed" || f.mood === "critical").map((f) => (
                  <div key={f.id} className="p-2.5 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {moodIcons[f.mood]}
                        <span className="text-sm font-medium text-foreground">{f.partnerName}</span>
                      </div>
                      <Badge className={`text-[10px] ${moodColors[f.mood]}`}>{f.mood}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{f.notes}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Friend: {f.friendName} · {f.sessionsCompleted} sessions</p>
                  </div>
                ))}
                {FRIEND_TO_PARTNER.filter((f) => f.mood === "stressed" || f.mood === "critical").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">All partners are doing well! 🎉</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="border border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> SPC Intelligence — Gyan Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { icon: "🚨", title: "Harassment Escalation", text: "Partner Meena S. (P004) has a critical harassment grievance. Immediate action required — delivery partner suspension and partner counselling.", type: "critical" },
                  { icon: "📊", title: "Payment Grievances Trending Up", text: "35% of all grievances are payment-related. Recommend tighter PPP SLA and proactive payout status notifications.", type: "warning" },
                  { icon: "💚", title: "Friend Program Impact", text: "Partners with active Friend assignments show 23% higher retention and 15% better SCV scores. Recommend expanding the program.", type: "positive" },
                ].map((insight, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${insight.type === "critical" ? "border-destructive/30 bg-destructive/5" : insight.type === "warning" ? "border-amber-300/30 bg-amber-50/50 dark:bg-amber-950/20" : "border-green-300/30 bg-green-50/50 dark:bg-green-950/20"}`}>
                    <p className="text-sm font-medium text-foreground">{insight.icon} {insight.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{insight.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════ GRIEVANCES TAB ═══════════════════ */}
      {activeTab === "grievances" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search grievances..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grievance List */}
          <div className="space-y-2">
            {filteredGrievances.map((g) => (
              <Card key={g.id} className={`border cursor-pointer hover:shadow-md transition-shadow ${g.priority === "critical" ? "border-destructive/30" : ""}`} onClick={() => setSelectedGrievance(g)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{g.id}</span>
                        <Badge className={`text-[10px] ${statusColors[g.status]}`}>{g.status.replace("_", " ")}</Badge>
                        <Badge className={`text-[10px] ${priorityColors[g.priority]}`}>{g.priority}</Badge>
                        <Badge variant="outline" className="text-[10px]">{g.category.replace("_", " ")}</Badge>
                      </div>
                      <h4 className="text-sm font-medium text-foreground mt-1.5">{g.subject}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{g.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span>👤 {g.partnerName}</span>
                        <span>📋 {g.assignedTo}</span>
                        <span>📅 {g.createdAt}</span>
                        {g.escalationLevel > 0 && <span className="text-destructive">⬆️ L{g.escalationLevel}</span>}
                        <span>💬 {g.messages.length} msgs</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredGrievances.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">No grievances match your filters</p>
              </div>
            )}
          </div>

          {/* Grievance Detail Dialog */}
          <Dialog open={!!selectedGrievance} onOpenChange={() => setSelectedGrievance(null)}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              {selectedGrievance && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{selectedGrievance.id}</span>
                      {selectedGrievance.subject}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusColors[selectedGrievance.status]}>{selectedGrievance.status.replace("_", " ")}</Badge>
                      <Badge className={priorityColors[selectedGrievance.priority]}>{selectedGrievance.priority}</Badge>
                      <Badge variant="outline">{selectedGrievance.category.replace("_", " ")}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Partner:</span> <span className="font-medium">{selectedGrievance.partnerName}</span></div>
                      <div><span className="text-muted-foreground">Assigned:</span> <span className="font-medium">{selectedGrievance.assignedTo}</span></div>
                      <div><span className="text-muted-foreground">Created:</span> <span className="font-medium">{selectedGrievance.createdAt}</span></div>
                      <div><span className="text-muted-foreground">Updated:</span> <span className="font-medium">{selectedGrievance.updatedAt}</span></div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-foreground">{selectedGrievance.description}</p>
                    </div>
                    {selectedGrievance.resolution && (
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                        <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">✅ Resolution</p>
                        <p className="text-sm text-foreground">{selectedGrievance.resolution}</p>
                      </div>
                    )}

                    {/* Messages */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">CONVERSATION</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedGrievance.messages.map((msg, i) => (
                          <div key={i} className={`p-2.5 rounded-lg text-sm ${msg.from === "partner" ? "bg-muted/50 mr-8" : "bg-primary/10 ml-8"}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-semibold">{msg.from === "partner" ? "👤 Partner" : "🛡️ SPC"}</span>
                              <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                            </div>
                            <p className="text-foreground">{msg.text}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Input placeholder="Type your response..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage(selectedGrievance.id)} />
                        <Button size="sm" onClick={() => handleSendMessage(selectedGrievance.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {selectedGrievance.status !== "resolved" && (
                        <Button size="sm" variant="outline" onClick={() => { handleStatusChange(selectedGrievance.id, "resolved"); setSelectedGrievance(null); }}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Resolved
                        </Button>
                      )}
                      {selectedGrievance.status !== "escalated" && selectedGrievance.status !== "resolved" && (
                        <Button size="sm" variant="destructive" onClick={() => { handleStatusChange(selectedGrievance.id, "escalated"); setSelectedGrievance(null); }}>
                          <ArrowUpRight className="w-3 h-3 mr-1" /> Escalate
                        </Button>
                      )}
                      {selectedGrievance.status === "open" && (
                        <Button size="sm" onClick={() => { handleStatusChange(selectedGrievance.id, "in_progress"); setSelectedGrievance(null); }}>
                          <Clock className="w-3 h-3 mr-1" /> Start Working
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ═══════════════════ WELFARE PROGRAMS TAB ═══════════════════ */}
      {activeTab === "welfare" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Welfare & Wellbeing Programs</h3>
              <p className="text-sm text-muted-foreground">Non-business support programs for partner wellbeing</p>
            </div>
            <Badge variant="outline" className="text-xs">{WELFARE_PROGRAMS.filter((w) => w.isActive).length} Active Programs</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WELFARE_PROGRAMS.map((wp) => (
              <Card key={wp.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{wp.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground">{wp.title}</h4>
                      <Badge variant="outline" className="text-[10px] mt-1">{wp.category}</Badge>
                      <p className="text-[11px] text-muted-foreground mt-2">{wp.description}</p>
                      {wp.schedule && (
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{wp.schedule}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <Users className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-medium text-primary">{wp.participants} participants</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Participation Chart */}
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Program Participation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={WELFARE_PROGRAMS.map((w) => ({ name: w.title.split(" ").slice(0, 2).join(" "), participants: w.participants }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="participants" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════ FRIEND TO PARTNER TAB ═══════════════════ */}
      {activeTab === "friend" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" /> Friend to Partner System
              </h3>
              <p className="text-sm text-muted-foreground">Each partner gets a dedicated SPC friend for non-business support & motivation</p>
            </div>
          </div>

          {/* Mood Overview */}
          <div className="grid grid-cols-4 gap-3">
            {(["happy", "neutral", "stressed", "critical"] as const).map((mood) => {
              const count = FRIEND_TO_PARTNER.filter((f) => f.mood === mood).length;
              return (
                <Card key={mood} className="border">
                  <CardContent className="p-3 flex items-center gap-3">
                    {moodIcons[mood]}
                    <div>
                      <p className="text-lg font-bold text-foreground">{count}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{mood}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Friend Assignments */}
          <div className="space-y-2">
            {FRIEND_TO_PARTNER.map((ftp) => (
              <Card key={ftp.id} className={`border cursor-pointer hover:shadow-md transition-shadow ${ftp.mood === "critical" ? "border-destructive/30" : ftp.mood === "stressed" ? "border-orange-300/30" : ""}`} onClick={() => setSelectedFriend(ftp)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${moodColors[ftp.mood]}`}>
                        {moodIcons[ftp.mood]}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{ftp.partnerName}</h4>
                        <p className="text-[11px] text-muted-foreground">Friend: {ftp.friendName} ({ftp.friendRole})</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{ftp.notes}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                          <span>📅 Since {ftp.assignedDate}</span>
                          <span>💬 {ftp.sessionsCompleted} sessions</span>
                          <span>🔄 Last: {ftp.lastInteraction}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${ftp.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : ftp.status === "completed" ? "bg-muted text-muted-foreground" : "bg-amber-100 text-amber-700"}`}>
                      {ftp.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Friend Detail Dialog */}
          <Dialog open={!!selectedFriend} onOpenChange={() => setSelectedFriend(null)}>
            <DialogContent className="max-w-lg">
              {selectedFriend && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {moodIcons[selectedFriend.mood]} {selectedFriend.partnerName} — Friend Profile
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Partner:</span> <span className="font-medium">{selectedFriend.partnerName}</span></div>
                      <div><span className="text-muted-foreground">Friend:</span> <span className="font-medium">{selectedFriend.friendName}</span></div>
                      <div><span className="text-muted-foreground">Role:</span> <span className="font-medium">{selectedFriend.friendRole}</span></div>
                      <div><span className="text-muted-foreground">Status:</span> <Badge className="text-[10px]">{selectedFriend.status}</Badge></div>
                      <div><span className="text-muted-foreground">Sessions:</span> <span className="font-medium">{selectedFriend.sessionsCompleted}</span></div>
                      <div><span className="text-muted-foreground">Last Contact:</span> <span className="font-medium">{selectedFriend.lastInteraction}</span></div>
                    </div>
                    <div className={`p-3 rounded-lg ${moodColors[selectedFriend.mood]}`}>
                      <p className="text-xs font-semibold mb-1">Current Mood: {selectedFriend.mood.toUpperCase()}</p>
                      <p className="text-sm">{selectedFriend.notes}</p>
                    </div>
                    {/* Radar for friend engagement */}
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={[
                        { metric: "Engagement", value: selectedFriend.sessionsCompleted * 12 },
                        { metric: "Mood", value: selectedFriend.mood === "happy" ? 90 : selectedFriend.mood === "neutral" ? 60 : selectedFriend.mood === "stressed" ? 30 : 10 },
                        { metric: "Retention", value: selectedFriend.status === "active" ? 85 : 50 },
                        { metric: "Support", value: 70 + Math.random() * 20 },
                        { metric: "Growth", value: 60 + Math.random() * 30 },
                      ]}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                        <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ═══════════════════ HELP CENTRE / RESOURCES TAB ═══════════════════ */}
      {activeTab === "resources" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Stress Buster & Help Centre
            </h3>
            <p className="text-sm text-muted-foreground">Resources for partner personal wellbeing — not business, but life</p>
          </div>

          {/* Helplines */}
          <Card className="border border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-destructive" /> Emergency Helplines
              </CardTitle>
              <CardDescription className="text-[11px]">Confidential. Free. Available 24/7.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-3">
                {STRESS_BUSTERS.filter((s) => s.type === "helpline").map((sb) => (
                  <div key={sb.id} className="p-3 rounded-lg bg-card border">
                    <p className="text-sm font-medium text-foreground">{sb.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{sb.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Phone className="w-3 h-3 text-primary" />
                      <span className="text-sm font-bold text-primary">{sb.helpline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activities & Resources */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STRESS_BUSTERS.filter((s) => s.type !== "helpline").map((sb) => {
              const typeIcon = sb.type === "article" ? <FileText className="w-4 h-4" /> : sb.type === "video" ? <Eye className="w-4 h-4" /> : sb.type === "podcast" ? <MessageCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />;
              return (
                <Card key={sb.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {typeIcon}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{sb.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{sb.type}</Badge>
                          <Badge variant="outline" className="text-[10px]">{sb.category}</Badge>
                          {sb.duration && <span className="text-[10px] text-muted-foreground">⏱️ {sb.duration}</span>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2">{sb.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════ ANALYTICS TAB ═══════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">SPC Analytics & Intelligence</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Grievance Trends */}
            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Grievance Trends (6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={GRIEVANCE_TRENDS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="opened" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Opened" />
                    <Line type="monotone" dataKey="resolved" stroke="hsl(var(--primary))" strokeWidth={2} name="Resolved" />
                    <Line type="monotone" dataKey="escalated" stroke="hsl(var(--destructive))" strokeWidth={2} name="Escalated" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Grievance Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={CATEGORY_DISTRIBUTION} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {CATEGORY_DISTRIBUTION.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Mood Distribution */}
            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Partner Mood Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={MOOD_DISTRIBUTION} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {MOOD_DISTRIBUTION.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* SPC Radar */}
            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">SPC Health Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={SPC_KPIS.slice(0, 6).map((k) => ({ metric: k.label.split(" ").slice(0, 2).join(" "), value: k.target > 0 ? (k.value / k.target) * 100 : 0 }))}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 120]} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cross-function Links */}
          <Card className="border border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Cross-Function Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { title: "SPC → Metrics Link", desc: "Partners with active SPC support show 18% higher SCV(BIZ) scores. Recommend welfare enrollment for Grade C/D partners.", icon: "📊" },
                  { title: "SPC → Retention", desc: "Friend program reduces churn by 23%. Partners with 5+ counselling sessions have 92% retention vs 71% baseline.", icon: "🔄" },
                  { title: "SPC → PPP Impact", desc: "67% of payment grievances resolved within 24hrs. Proactive payout notifications could reduce payment tickets by 40%.", icon: "💰" },
                ].map((insight, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-card">
                    <p className="text-sm font-medium text-foreground">{insight.icon} {insight.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{insight.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
