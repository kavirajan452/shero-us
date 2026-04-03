import { useState } from "react";
import { Send, Clock, FileText, Plus, Search, Filter, Eye, MessageCircle, Smartphone, Users, BarChart3, Megaphone, TrendingUp, AlertTriangle, PartyPopper, DollarSign, Radio, ChevronDown, ChevronUp, Copy, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  MOCK_COMMUNICATIONS,
  COMM_TEMPLATES,
  REGIONS,
  CUISINES,
  PERFORMANCE_TIERS,
  KITCHEN_STATUSES,
  categoryConfig,
  channelConfig,
  priorityConfig,
  type Communication,
  type CommCategory,
  type CommChannel,
  type CommPriority,
  type CommStatus,
  type AudienceFilter,
  type CommTemplate,
} from "@/data/communicationsData";

const categoryIcons: Record<CommCategory, any> = {
  performance: TrendingUp,
  finance: DollarSign,
  promotion: Megaphone,
  announcement: Radio,
  alert: AlertTriangle,
  celebration: PartyPopper,
};

// ─── Stats Overview ──────────────────────────
const StatsBar = ({ comms }: { comms: Communication[] }) => {
  const sent = comms.filter((c) => c.status === "sent").length;
  const scheduled = comms.filter((c) => c.status === "scheduled").length;
  const drafts = comms.filter((c) => c.status === "draft").length;
  const totalDelivered = comms.reduce((a, c) => a + c.deliveredCount, 0);
  const totalRead = comms.reduce((a, c) => a + c.readCount, 0);
  const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

  const stats = [
    { label: "Total Sent", value: sent, icon: Send, accent: "text-primary" },
    { label: "Scheduled", value: scheduled, icon: Clock, accent: "text-orange-600" },
    { label: "Drafts", value: drafts, icon: FileText, accent: "text-muted-foreground" },
    { label: "Read Rate", value: `${readRate}%`, icon: Eye, accent: "text-emerald-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="border-border">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <s.icon className={`w-4 h-4 ${s.accent}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ─── Audience Builder ──────────────────────────
const AudienceBuilder = ({
  audience,
  setAudience,
}: {
  audience: AudienceFilter;
  setAudience: (a: AudienceFilter) => void;
}) => {
  const toggleArrayItem = (key: keyof AudienceFilter, item: string) => {
    const arr = (audience[key] as string[] | undefined) || [];
    const next = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
    setAudience({ ...audience, [key]: next });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold">Audience Type</Label>
        <Select value={audience.type} onValueChange={(v: AudienceFilter["type"]) => setAudience({ ...audience, type: v })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Partners</SelectItem>
            <SelectItem value="region">By Region</SelectItem>
            <SelectItem value="cuisine">By Cuisine</SelectItem>
            <SelectItem value="performance">By Performance Tier</SelectItem>
            <SelectItem value="individual">Individual Partner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {audience.type === "region" && (
        <div>
          <Label className="text-xs font-semibold">Select Regions</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {REGIONS.map((r) => (
              <label key={r} className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={audience.regions?.includes(r)} onCheckedChange={() => toggleArrayItem("regions", r)} />
                {r}
              </label>
            ))}
          </div>
        </div>
      )}

      {audience.type === "cuisine" && (
        <div>
          <Label className="text-xs font-semibold">Select Cuisines</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {CUISINES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={audience.cuisines?.includes(c)} onCheckedChange={() => toggleArrayItem("cuisines", c)} />
                {c}
              </label>
            ))}
          </div>
        </div>
      )}

      {audience.type === "performance" && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold">Performance Tier</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PERFORMANCE_TIERS.map((t) => (
                <label key={t} className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={audience.performanceTier?.includes(t)} onCheckedChange={() => toggleArrayItem("performanceTier", t)} />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Kitchen Status</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {KITCHEN_STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={audience.kitchenStatus?.includes(s)} onCheckedChange={() => toggleArrayItem("kitchenStatus", s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Min Orders</Label>
              <Input type="number" placeholder="e.g. 50" className="mt-1" value={audience.minOrders || ""} onChange={(e) => setAudience({ ...audience, minOrders: Number(e.target.value) || undefined })} />
            </div>
            <div>
              <Label className="text-xs font-semibold">Min Rating</Label>
              <Input type="number" step="0.1" placeholder="e.g. 4.0" className="mt-1" value={audience.minRating || ""} onChange={(e) => setAudience({ ...audience, minRating: Number(e.target.value) || undefined })} />
            </div>
          </div>
        </div>
      )}

      {audience.type === "individual" && (
        <div>
          <Label className="text-xs font-semibold">Partner ID / Name</Label>
          <Input placeholder="Search partner by name or ID..." className="mt-1" onChange={(e) => setAudience({ ...audience, partnerIds: e.target.value ? [e.target.value] : [] })} />
          <p className="text-[10px] text-muted-foreground mt-1">Enter partner name or ID. In production, this will have autocomplete.</p>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-xs text-foreground font-medium">
          Estimated audience:{" "}
          <strong>
            {audience.type === "all" ? "142" : audience.type === "individual" ? "1" : `${Math.floor(Math.random() * 40 + 10)}`}
          </strong>{" "}
          partners
        </span>
      </div>
    </div>
  );
};

// ─── Compose Dialog ──────────────────────────
const ComposeDialog = ({ templates }: { templates: CommTemplate[] }) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CommCategory>("announcement");
  const [channel, setChannel] = useState<CommChannel>("both");
  const [priority, setPriority] = useState<CommPriority>("normal");
  const [audience, setAudience] = useState<AudienceFilter>({ type: "all" });
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showAudience, setShowAudience] = useState(false);

  const applyTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
      setCategory(tpl.category);
      setSelectedTemplate(templateId);
    }
  };

  const handleSend = () => {
    toast({ title: "Communication Sent ✅", description: `"${subject}" sent to ${audience.type === "all" ? "all partners" : "targeted audience"} via ${channelConfig[channel].label}` });
  };

  const handleSchedule = () => {
    toast({ title: "Communication Scheduled 📅", description: `"${subject}" scheduled for delivery.` });
  };

  const handleSaveDraft = () => {
    toast({ title: "Draft Saved 📝", description: `"${subject || "Untitled"}" saved as draft.` });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Communication
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" /> Compose Communication
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template */}
          <div>
            <Label className="text-xs font-semibold">Quick Template</Label>
            <Select value={selectedTemplate} onValueChange={applyTemplate}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a template or start fresh..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{categoryConfig[t.category].label}</Badge>
                      {t.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Category + Channel + Priority row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={category} onValueChange={(v: CommCategory) => setCategory(v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Channel</Label>
              <Select value={channel} onValueChange={(v: CommChannel) => setChannel(v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app"><span className="flex items-center gap-1.5"><MessageCircle className="w-3 h-3" /> In-App</span></SelectItem>
                  <SelectItem value="whatsapp"><span className="flex items-center gap-1.5"><Smartphone className="w-3 h-3" /> WhatsApp</span></SelectItem>
                  <SelectItem value="both"><span className="flex items-center gap-1.5"><Send className="w-3 h-3" /> Both</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Priority</Label>
              <Select value={priority} onValueChange={(v: CommPriority) => setPriority(v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityConfig).map(([k, v]) => (
                    <SelectItem key={k} value={k}><span className={v.color}>{v.label}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label className="text-xs font-semibold">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter subject line..." className="mt-1" />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-semibold">Message Body</Label>
              <Button variant="ghost" size="sm" className="text-[10px] gap-1 h-6 text-primary">
                <Sparkles className="w-3 h-3" /> AI Rewrite
              </Button>
            </div>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." rows={6} />
            <p className="text-[10px] text-muted-foreground mt-1">
              Use {"{{partner_name}}"}, {"{{region}}"}, {"{{cuisine}}"} for personalization
            </p>
          </div>

          {/* Audience */}
          <div>
            <button onClick={() => setShowAudience(!showAudience)} className="flex items-center gap-2 text-sm font-semibold text-foreground w-full">
              <Users className="w-4 h-4 text-primary" /> Target Audience
              {showAudience ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
            </button>
            {showAudience && (
              <div className="mt-3 border border-border rounded-lg p-3">
                <AudienceBuilder audience={audience} setAudience={setAudience} />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="secondary" onClick={handleSchedule} className="gap-1">
              <Clock className="w-3.5 h-3.5" /> Schedule
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSend} className="gap-1">
              <Send className="w-3.5 h-3.5" /> Send Now
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Communication Row ──────────────────────────
const CommRow = ({ comm }: { comm: Communication }) => {
  const catCfg = categoryConfig[comm.category];
  const CatIcon = categoryIcons[comm.category];
  const readRate = comm.deliveredCount > 0 ? Math.round((comm.readCount / comm.deliveredCount) * 100) : 0;

  const statusBadge: Record<CommStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    sent: { label: "Sent", variant: "default" },
    scheduled: { label: "Scheduled", variant: "secondary" },
    draft: { label: "Draft", variant: "outline" },
    failed: { label: "Failed", variant: "destructive" },
  };

  const audienceLabel = () => {
    switch (comm.audience.type) {
      case "all": return "All Partners";
      case "region": return `Region: ${comm.audience.regions?.join(", ")}`;
      case "cuisine": return `Cuisine: ${comm.audience.cuisines?.join(", ")}`;
      case "performance": return `Tier: ${comm.audience.performanceTier?.join(", ")}`;
      case "individual": return "Individual";
    }
  };

  return (
    <Card className="border-border hover:shadow-md transition-shadow">
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg ${catCfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
            <CatIcon className={`w-4 h-4 ${catCfg.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold text-foreground truncate">{comm.subject}</h3>
              <Badge variant={statusBadge[comm.status].variant} className="text-[9px]">
                {statusBadge[comm.status].label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{comm.body}</p>
            <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Badge variant="outline" className="text-[9px]">{catCfg.label}</Badge>
              </span>
              <span>{channelConfig[comm.channel].label}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {audienceLabel()} ({comm.audienceCount})
              </span>
              <span>•</span>
              <span>By {comm.sentBy} ({comm.sentByRole})</span>
              {comm.status === "sent" && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {readRate}% read
                  </span>
                </>
              )}
              {comm.sentAt && <span>• {new Date(comm.sentAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>}
              {comm.scheduledAt && <span>• Scheduled: {new Date(comm.scheduledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Template Card ──────────────────────────
const TemplateCard = ({ template }: { template: CommTemplate }) => {
  const catCfg = categoryConfig[template.category];

  return (
    <Card className="border-border hover:shadow-sm transition-shadow">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className={`text-[9px] ${catCfg.bg} ${catCfg.color} border-0`}>{catCfg.label}</Badge>
          <h4 className="text-sm font-semibold text-foreground">{template.name}</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">{template.subject}</p>
        <p className="text-[11px] text-muted-foreground line-clamp-2">{template.body}</p>
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {template.variables.map((v) => (
            <Badge key={v} variant="outline" className="text-[9px]">{`{{${v}}}`}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Analytics Tab ──────────────────────────
const AnalyticsView = ({ comms }: { comms: Communication[] }) => {
  const byCat = Object.entries(categoryConfig).map(([key, cfg]) => {
    const items = comms.filter((c) => c.category === key && c.status === "sent");
    const totalSent = items.reduce((a, c) => a + c.deliveredCount, 0);
    const totalRead = items.reduce((a, c) => a + c.readCount, 0);
    return { ...cfg, key, count: items.length, delivered: totalSent, read: totalRead, rate: totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0 };
  });

  const bySender = [...new Set(comms.map((c) => c.sentBy))].map((name) => {
    const items = comms.filter((c) => c.sentBy === name);
    return { name, role: items[0]?.sentByRole, count: items.length };
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Engagement by Category</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {byCat.map((c) => (
          <Card key={c.key} className="border-border">
            <CardContent className="py-3 px-4">
              <Badge className={`text-[9px] ${c.bg} ${c.color} border-0 mb-2`}>{c.label}</Badge>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-bold text-foreground">{c.count}</p>
                  <p className="text-[9px] text-muted-foreground">Sent</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{c.delivered}</p>
                  <p className="text-[9px] text-muted-foreground">Delivered</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{c.rate}%</p>
                  <p className="text-[9px] text-muted-foreground">Read</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-foreground mt-6">Activity by Sender</h3>
      <div className="space-y-2">
        {bySender.map((s) => (
          <div key={s.name} className="flex items-center gap-3 bg-muted/30 rounded-lg px-4 py-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {s.name.split(" ").map(w => w[0]).join("")}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{s.name}</p>
              <p className="text-[10px] text-muted-foreground">{s.role}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">{s.count} messages</Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────
export type SectionFilter = "command" | "finance" | "instant" | "party" | "subscription" | "support" | "people" | "tech" | "hr" | "snacks" | "classes" | "cookery" | "shero-classes" | null;

const sectionLabels: Record<string, string> = {
  command: "Command",
  finance: "Finance Books",
  instant: "Instant Delivery",
  party: "Party Orders",
  subscription: "Subscriptions",
  support: "Support Centre",
  people: "Partner & Kitchen Onboarding",
  tech: "Tech Management",
  hr: "HR Management",
  snacks: "Sweets & Snacks",
  classes: "Classes",
  cookery: "Cookery Classes",
  "shero-classes": "Shero Classes",
};

const AdminCommunications = ({ sectionFilter = null }: { sectionFilter?: SectionFilter }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = MOCK_COMMUNICATIONS.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
    if (searchQuery && !c.subject.toLowerCase().includes(searchQuery.toLowerCase()) && !c.body.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" /> {sectionFilter ? `${sectionLabels[sectionFilter]} — Broadcast Centre` : "Broadcast Control Room"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sectionFilter ? `WhatsApp & In-App broadcast centre for ${sectionLabels[sectionFilter]} team` : "Send targeted broadcasts to partners via In-App & WhatsApp"}
          </p>
        </div>
        <ComposeDialog templates={COMM_TEMPLATES} />
      </div>

      {/* Stats */}
      <StatsBar comms={MOCK_COMMUNICATIONS} />

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="gap-1.5 text-xs">
            <Send className="w-3.5 h-3.5" /> History
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5 text-xs">
            <FileText className="w-3.5 h-3.5" /> Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-3">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search communications..." className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <Card className="border-dashed border-border">
                <CardContent className="py-8 text-center">
                  <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No communications found</p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((c) => <CommRow key={c.id} comm={c} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMM_TEMPLATES.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsView comms={MOCK_COMMUNICATIONS} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCommunications;
