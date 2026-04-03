import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Megaphone, Send, Users, ChefHat, Truck, Briefcase, GraduationCap, Building2,
  Search, Plus, Clock, Eye, MessageCircle, Filter, CheckCircle, Radio,
  Smartphone, Globe, Mail, DollarSign, Target, AlertTriangle, TrendingUp
} from "lucide-react";

// ── Stakeholder Groups ──
interface StakeholderGroup {
  id: string;
  label: string;
  icon: typeof Users;
  count: number;
  description: string;
  subGroups: { id: string; label: string; count: number }[];
}

const stakeholderGroups: StakeholderGroup[] = [
  {
    id: "partners", label: "Kitchen Partners (PPP)", icon: ChefHat, count: 248, description: "All onboarded home chefs & kitchen partners",
    subGroups: [
      { id: "partners-active", label: "Active Partners", count: 198 },
      { id: "partners-paused", label: "Paused Partners", count: 32 },
      { id: "partners-probation", label: "Under Probation", count: 12 },
      { id: "partners-new", label: "New Onboards (< 30d)", count: 6 },
    ],
  },
  {
    id: "team", label: "Internal Team", icon: Users, count: 84, description: "All Shero employees across departments",
    subGroups: [
      { id: "team-leadership", label: "Leadership (L1-L3)", count: 6 },
      { id: "team-managers", label: "Managers", count: 12 },
      { id: "team-tls", label: "Team Leaders", count: 18 },
      { id: "team-executives", label: "Executives", count: 48 },
    ],
  },
  {
    id: "delivery", label: "Delivery Associates", icon: Truck, count: 156, description: "Dunzo, Shadowfax & in-house riders",
    subGroups: [
      { id: "delivery-dunzo", label: "Dunzo Fleet", count: 62 },
      { id: "delivery-shadowfax", label: "Shadowfax Fleet", count: 54 },
      { id: "delivery-inhouse", label: "In-house Riders", count: 40 },
    ],
  },
  {
    id: "vendors", label: "Vendors & Suppliers", icon: Building2, count: 42, description: "Packaging, ingredients, logistics vendors",
    subGroups: [
      { id: "vendors-packaging", label: "Packaging Suppliers", count: 12 },
      { id: "vendors-ingredients", label: "Ingredient Suppliers", count: 18 },
      { id: "vendors-logistics", label: "Logistics Partners", count: 8 },
      { id: "vendors-tech", label: "Tech Vendors", count: 4 },
    ],
  },
  {
    id: "instructors", label: "Class Instructors", icon: GraduationCap, count: 36, description: "Cookery & Shero class instructors",
    subGroups: [
      { id: "instructors-cookery", label: "Cookery Instructors", count: 22 },
      { id: "instructors-shero", label: "Shero/Yoga Instructors", count: 14 },
    ],
  },
  {
    id: "associates", label: "Field Associates", icon: Briefcase, count: 28, description: "Onboarding officers, QA auditors, field ops",
    subGroups: [
      { id: "associates-onboarding", label: "Onboarding Officers", count: 10 },
      { id: "associates-qa", label: "QA Auditors", count: 8 },
      { id: "associates-field", label: "Field Ops", count: 10 },
    ],
  },
];

const totalStakeholders = stakeholderGroups.reduce((s, g) => s + g.count, 0);

// ── Broadcast History ──
interface BroadcastRecord {
  id: string;
  subject: string;
  targetGroup: string;
  targetSubGroup?: string;
  channel: "in_app" | "whatsapp" | "sms" | "email" | "all";
  sentBy: string;
  sentAt: string;
  recipientCount: number;
  deliveredCount: number;
  readCount: number;
  priority: "normal" | "high" | "urgent";
}

const broadcastHistory: BroadcastRecord[] = [
  { id: "BC-001", subject: "Diwali Bonus Announcement", targetGroup: "All Stakeholders", channel: "all", sentBy: "Country Head", sentAt: "2026-03-15T10:00:00Z", recipientCount: totalStakeholders, deliveredCount: 572, readCount: 498, priority: "high" },
  { id: "BC-002", subject: "New Packaging Guidelines", targetGroup: "Kitchen Partners", channel: "whatsapp", sentBy: "Ops Manager", sentAt: "2026-03-14T14:30:00Z", recipientCount: 248, deliveredCount: 241, readCount: 189, priority: "normal" },
  { id: "BC-003", subject: "Delivery SLA Update — March", targetGroup: "Delivery Associates", channel: "in_app", sentBy: "Logistics Lead", sentAt: "2026-03-13T09:00:00Z", recipientCount: 156, deliveredCount: 156, readCount: 132, priority: "high" },
  { id: "BC-004", subject: "Monthly Revenue Target Achieved 🎉", targetGroup: "Internal Team", channel: "all", sentBy: "Vertical Head", sentAt: "2026-03-12T16:00:00Z", recipientCount: 84, deliveredCount: 84, readCount: 79, priority: "normal" },
  { id: "BC-005", subject: "Vendor Payment Schedule — Q1 FY27", targetGroup: "Vendors & Suppliers", channel: "email", sentBy: "Finance Manager", sentAt: "2026-03-11T11:00:00Z", recipientCount: 42, deliveredCount: 42, readCount: 38, priority: "urgent" },
  { id: "BC-006", subject: "Cookery Class Curriculum Refresh", targetGroup: "Class Instructors", channel: "whatsapp", sentBy: "Classes Manager", sentAt: "2026-03-10T10:00:00Z", recipientCount: 22, deliveredCount: 22, readCount: 20, priority: "normal" },
  { id: "BC-007", subject: "Field Audit Schedule — Week 12", targetGroup: "Field Associates", channel: "in_app", sentBy: "QA Lead", sentAt: "2026-03-09T08:30:00Z", recipientCount: 28, deliveredCount: 28, readCount: 24, priority: "normal" },
  { id: "BC-008", subject: "Emergency: Kitchen Hygiene Alert", targetGroup: "Kitchen Partners", targetSubGroup: "Active Partners", channel: "all", sentBy: "Country Head", sentAt: "2026-03-08T07:00:00Z", recipientCount: 198, deliveredCount: 198, readCount: 195, priority: "urgent" },
];

const channelLabels: Record<string, string> = { in_app: "📱 In-App", whatsapp: "💬 WhatsApp", sms: "📲 SMS", email: "📧 Email", all: "📡 All Channels" };
const priorityColors: Record<string, string> = { normal: "bg-secondary text-foreground", high: "bg-yellow-100 text-yellow-800", urgent: "bg-destructive/10 text-destructive" };

export default function AdminMasterComms() {
  const [tab, setTab] = useState("directory");
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedCount = useMemo(() => {
    let count = 0;
    selectedGroups.forEach(id => {
      const group = stakeholderGroups.find(g => g.id === id);
      if (group) { count += group.count; return; }
      stakeholderGroups.forEach(g => {
        const sub = g.subGroups.find(s => s.id === id);
        if (sub) count += sub.count;
      });
    });
    return count;
  }, [selectedGroups]);

  const filteredHistory = broadcastHistory.filter(b =>
    !search || b.subject.toLowerCase().includes(search.toLowerCase()) || b.targetGroup.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendBroadcast = () => {
    toast({ title: "📡 Broadcast Sent!", description: `Message sent to ${selectedCount} stakeholders across selected groups.` });
    setComposeOpen(false);
    setSelectedGroups(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📡 Master Communications</h1>
          <p className="text-sm text-muted-foreground">Central broadcast hub — reach every stakeholder across the platform</p>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> New Broadcast</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" /> Compose Broadcast</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Audience Selection */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Audience</Label>
                <div className="mt-2 space-y-2">
                  {/* Select All */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <Checkbox
                      checked={selectedGroups.size === stakeholderGroups.length + stakeholderGroups.reduce((s, g) => s + g.subGroups.length, 0)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const all = new Set<string>();
                          stakeholderGroups.forEach(g => { all.add(g.id); g.subGroups.forEach(s => all.add(s.id)); });
                          setSelectedGroups(all);
                        } else {
                          setSelectedGroups(new Set());
                        }
                      }}
                    />
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">All Stakeholders</span>
                    <Badge variant="secondary" className="text-[10px] ml-auto">{totalStakeholders}</Badge>
                  </div>
                  {stakeholderGroups.map(group => (
                    <div key={group.id} className="border border-border rounded-lg">
                      <div className="flex items-center gap-2 p-2.5">
                        <Checkbox
                          checked={selectedGroups.has(group.id)}
                          onCheckedChange={() => {
                            const next = new Set(selectedGroups);
                            if (next.has(group.id)) {
                              next.delete(group.id);
                              group.subGroups.forEach(s => next.delete(s.id));
                            } else {
                              next.add(group.id);
                              group.subGroups.forEach(s => next.add(s.id));
                            }
                            setSelectedGroups(next);
                          }}
                        />
                        <group.icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium flex-1">{group.label}</span>
                        <Badge variant="outline" className="text-[10px]">{group.count}</Badge>
                      </div>
                      <div className="px-8 pb-2 space-y-1">
                        {group.subGroups.map(sub => (
                          <div key={sub.id} className="flex items-center gap-2">
                            <Checkbox checked={selectedGroups.has(sub.id)} onCheckedChange={() => toggleGroup(sub.id)} />
                            <span className="text-xs text-muted-foreground flex-1">{sub.label}</span>
                            <span className="text-[10px] text-muted-foreground">{sub.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedCount > 0 && (
                  <p className="text-xs text-primary font-semibold mt-2">✅ {selectedCount} recipients selected</p>
                )}
              </div>
              <Separator />
              {/* Message */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Subject</Label>
                  <Input placeholder="Broadcast subject line..." className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Message Body</Label>
                  <Textarea placeholder="Type your message..." className="mt-1 min-h-[120px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Channel</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">📡 All Channels</SelectItem>
                        <SelectItem value="in_app">📱 In-App</SelectItem>
                        <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                        <SelectItem value="sms">📲 SMS</SelectItem>
                        <SelectItem value="email">📧 Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Priority</Label>
                    <Select defaultValue="normal">
                      <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">🔶 High</SelectItem>
                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button variant="outline"><Clock className="w-3.5 h-3.5 mr-1" /> Schedule</Button>
              <Button onClick={handleSendBroadcast} disabled={selectedCount === 0}>
                <Send className="w-3.5 h-3.5 mr-1" /> Send to {selectedCount} recipients
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Stakeholders", value: totalStakeholders, icon: Users, color: "text-primary" },
          { label: "Broadcasts Sent", value: broadcastHistory.length, icon: Send, color: "text-green-600" },
          { label: "Avg Read Rate", value: `${Math.round(broadcastHistory.reduce((s, b) => s + (b.readCount / b.deliveredCount) * 100, 0) / broadcastHistory.length)}%`, icon: Eye, color: "text-blue-600" },
          { label: "Stakeholder Groups", value: stakeholderGroups.length, icon: Globe, color: "text-accent" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="directory" className="text-xs">Stakeholder Directory</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Broadcast History ({broadcastHistory.length})</TabsTrigger>
          <TabsTrigger value="team-allocation" className="text-xs">Team Allocation</TabsTrigger>
        </TabsList>

        {/* ── DIRECTORY ── */}
        <TabsContent value="directory" className="mt-4 space-y-3">
          {stakeholderGroups.map(group => (
            <Card key={group.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <group.icon className="w-4 h-4 text-primary" />
                  {group.label}
                  <Badge variant="secondary" className="text-[10px] ml-1">{group.count}</Badge>
                  <span className="text-xs text-muted-foreground font-normal ml-auto">{group.description}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {group.subGroups.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border">
                      <span className="text-xs text-foreground">{sub.label}</span>
                      <Badge variant="outline" className="text-[10px]">{sub.count}</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setSelectedGroups(new Set([group.id, ...group.subGroups.map(s => s.id)])); setComposeOpen(true); }}>
                    <Send className="w-3 h-3 mr-1" /> Broadcast to {group.label}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── HISTORY ── */}
        <TabsContent value="history" className="mt-4 space-y-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search broadcasts..." className="pl-9 h-9 text-sm" />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Target</TableHead>
                    <TableHead className="text-xs">Channel</TableHead>
                    <TableHead className="text-xs">Sent By</TableHead>
                    <TableHead className="text-xs">Recipients</TableHead>
                    <TableHead className="text-xs">Read Rate</TableHead>
                    <TableHead className="text-xs">Priority</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.id}</TableCell>
                      <TableCell className="text-xs font-medium max-w-[200px] truncate">{b.subject}</TableCell>
                      <TableCell>
                        <span className="text-xs">{b.targetGroup}</span>
                        {b.targetSubGroup && <p className="text-[10px] text-muted-foreground">{b.targetSubGroup}</p>}
                      </TableCell>
                      <TableCell className="text-[10px]">{channelLabels[b.channel]}</TableCell>
                      <TableCell className="text-xs">{b.sentBy}</TableCell>
                      <TableCell className="text-xs">{b.deliveredCount}/{b.recipientCount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {Math.round((b.readCount / b.deliveredCount) * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell><Badge className={`text-[10px] ${priorityColors[b.priority]}`}>{b.priority}</Badge></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{b.sentAt.slice(0, 10)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TEAM ALLOCATION ── */}
        <TabsContent value="team-allocation" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">Each team is assigned ownership of specific stakeholder groups for targeted, regular communication.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { team: "Operations Team", lead: "Ops Manager", groups: ["Kitchen Partners", "Delivery Associates"], members: 18, lastBroadcast: "2 hours ago" },
              { team: "Finance Team", lead: "Finance Manager", groups: ["Vendors & Suppliers", "Kitchen Partners (Payroll)"], members: 8, lastBroadcast: "1 day ago" },
              { team: "People & Onboarding", lead: "Onboarding Manager", groups: ["Field Associates", "New Partners"], members: 12, lastBroadcast: "3 hours ago" },
              { team: "Classes Team", lead: "Classes Manager", groups: ["Cookery Instructors", "Shero Instructors"], members: 6, lastBroadcast: "5 hours ago" },
              { team: "Support Centre (SSC)", lead: "SSC Manager", groups: ["All Partners (Escalations)", "Delivery Associates"], members: 22, lastBroadcast: "30 min ago" },
              { team: "Leadership", lead: "Country Head", groups: ["All Stakeholders"], members: 6, lastBroadcast: "2 days ago" },
            ].map(alloc => (
              <Card key={alloc.team}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{alloc.team}</h3>
                      <p className="text-[10px] text-muted-foreground">Lead: {alloc.lead} · {alloc.members} members</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => { setComposeOpen(true); }}>
                      <Send className="w-3 h-3 mr-0.5" /> Send
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {alloc.groups.map(g => (
                      <div key={g} className="flex items-center gap-2 text-xs text-foreground">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {g}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Last broadcast: {alloc.lastBroadcast}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
