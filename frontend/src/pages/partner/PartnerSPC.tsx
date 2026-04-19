import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart, AlertTriangle, MessageCircle, Phone, BookOpen, Smile, Frown, Meh,
  CheckCircle2, Clock, Send, Sparkles, HeartHandshake, Brain, Shield,
  FileText, Eye, Handshake, Plus, Users,
} from "lucide-react";
import {
  WELFARE_PROGRAMS, STRESS_BUSTERS,
  type GrievanceCategory,
} from "@/data/spcData";
import { toast } from "sonner";

// ── Partner's own grievances (mock) ──
const myGrievances = [
  {
    id: "GRV001", category: "payment" as const, subject: "Weekly payout delayed by 3 days",
    status: "in_progress" as const, createdAt: "2026-02-27", lastUpdate: "PPP team investigating. Will be credited by tomorrow.",
    messages: [
      { from: "me" as const, text: "My payout for last week is still pending.", time: "Feb 27, 9:30 AM" },
      { from: "spc" as const, text: "We're checking with the PPP team. Will update within 4 hours.", time: "Feb 27, 10:15 AM" },
      { from: "spc" as const, text: "The delay was due to bank processing. Amount will be credited by tomorrow.", time: "Feb 28, 11:00 AM" },
    ],
  },
];

const myFriend = {
  name: "Anitha S.",
  role: "SPC Counsellor",
  phone: "Available Mon-Sat 9AM-6PM",
  sessions: 6,
  nextSession: "Mar 5, 2026 at 10:00 AM",
  mood: "happy" as const,
};

export default function PartnerSPC() {
  const [activeTab, setActiveTab] = useState<"home" | "grievance" | "welfare" | "help" | "friend">("home");
  const [showNewGrievance, setShowNewGrievance] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<typeof myGrievances[0] | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newGrievance, setNewGrievance] = useState({ category: "" as string, subject: "", description: "" });

  const tabs = [
    { key: "home" as const, label: "My SPC", icon: Heart },
    { key: "grievance" as const, label: "My Grievances", icon: AlertTriangle },
    { key: "welfare" as const, label: "Welfare", icon: HeartHandshake },
    { key: "help" as const, label: "Help Centre", icon: BookOpen },
    { key: "friend" as const, label: "My Friend", icon: Handshake },
  ];

  const handleSubmitGrievance = () => {
    if (!newGrievance.category || !newGrievance.subject) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Grievance submitted! Our SPC team will respond within 4 hours.");
    setShowNewGrievance(false);
    setNewGrievance({ category: "", subject: "", description: "" });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" /> Shero Partner Centre
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Your safe space — support, welfare & wellbeing</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══════ HOME TAB ══════ */}
      {activeTab === "home" && (
        <div className="space-y-4">
          {/* Welcome */}
          <Card className="border-border bg-card border-l-4 border-l-primary">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Shield className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-foreground">Welcome to Your Partner Centre</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is your safe space. Whether it's a work concern, personal stress, or you just need someone to talk to — 
                    we're here for you. Your SPC friend <span className="font-medium text-primary">{myFriend.name}</span> is just a message away.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Raise Grievance", icon: AlertTriangle, color: "text-primary", bg: "bg-card border border-border", action: () => setShowNewGrievance(true) },
              { label: "Talk to Friend", icon: Handshake, color: "text-primary", bg: "bg-card border border-border", action: () => setActiveTab("friend") },
              { label: "Welfare Programs", icon: HeartHandshake, color: "text-primary", bg: "bg-card border border-border", action: () => setActiveTab("welfare") },
              { label: "Emergency Help", icon: Phone, color: "text-destructive", bg: "bg-card border border-border", action: () => setActiveTab("help") },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={a.action} className={`p-4 rounded-xl border hover:shadow-md transition-all text-left ${a.bg}`}>
                  <Icon className={`w-6 h-6 ${a.color} mb-2`} />
                  <p className="text-sm font-medium text-foreground">{a.label}</p>
                </button>
              );
            })}
          </div>

          {/* My Friend Card */}
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Handshake className="w-4 h-4 text-primary" /> Your SPC Friend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smile className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{myFriend.name}</p>
                  <p className="text-[11px] text-muted-foreground">{myFriend.role} · {myFriend.sessions} sessions completed</p>
                  <p className="text-[11px] text-primary mt-0.5">Next session: {myFriend.nextSession}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Grievances */}
          {myGrievances.length > 0 && (
            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Grievances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {myGrievances.map((g) => (
                  <button key={g.id} onClick={() => { setSelectedGrievance(g); setActiveTab("grievance"); }} className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">{g.id}</span>
                      <Badge className="text-[10px] bg-blue-100 text-blue-700">{g.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground mt-1">{g.subject}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{g.lastUpdate}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Motivation Quote */}
          <Card className="border bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm italic text-foreground">"She believed she could, so she did. Every meal you cook is an act of love and empowerment."</p>
                  <p className="text-[11px] text-muted-foreground mt-1">— Shero Motivation, March 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════ GRIEVANCE TAB ══════ */}
      {activeTab === "grievance" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">My Grievances</h3>
            <Button size="sm" onClick={() => setShowNewGrievance(true)}>
              <Plus className="w-4 h-4 mr-1" /> New Grievance
            </Button>
          </div>

          {myGrievances.map((g) => (
            <Card key={g.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{g.id}</span>
                  <Badge className="text-[10px] bg-blue-100 text-blue-700">{g.status.replace("_", " ")}</Badge>
                  <Badge variant="outline" className="text-[10px]">{g.category}</Badge>
                </div>
                <h4 className="text-sm font-medium text-foreground">{g.subject}</h4>
                <p className="text-[11px] text-muted-foreground mt-1">Created: {g.createdAt}</p>

                {/* Messages */}
                <div className="mt-3 space-y-2 border-t pt-3">
                  {g.messages.map((msg, i) => (
                    <div key={i} className={`p-2.5 rounded-lg text-sm ${msg.from === "me" ? "bg-muted/50 mr-8" : "bg-primary/10 ml-8"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold">{msg.from === "me" ? "You" : "🛡️ SPC Team"}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-foreground">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <Input placeholder="Add a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  <Button size="sm" onClick={() => { if (newMessage.trim()) { toast.success("Message sent"); setNewMessage(""); } }}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {myGrievances.length === 0 && (
            <div className="text-center py-10">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">No active grievances. We're glad everything is going well! 🎉</p>
            </div>
          )}
        </div>
      )}

      {/* ══════ WELFARE TAB ══════ */}
      {activeTab === "welfare" && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Welfare & Wellbeing Programs</h3>
          <p className="text-sm text-muted-foreground">Free programs designed for your personal growth and wellbeing</p>
          <div className="grid md:grid-cols-2 gap-3">
            {WELFARE_PROGRAMS.map((wp) => (
              <Card key={wp.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{wp.icon}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{wp.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1">{wp.description}</p>
                      {wp.schedule && (
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{wp.schedule}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3 text-primary" />
                        <span className="text-[10px] text-primary">{wp.participants} partners enrolled</span>
                      </div>
                      <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">Join Program</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ══════ HELP CENTRE TAB ══════ */}
      {activeTab === "help" && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Help Centre & Stress Busters</h3>

          {/* Emergency Helplines */}
          <Card className="border border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-destructive" /> Emergency Helplines (Free & Confidential)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {STRESS_BUSTERS.filter((s) => s.type === "helpline").map((sb) => (
                  <div key={sb.id} className="p-3 rounded-lg bg-card border">
                    <p className="text-sm font-medium text-foreground">{sb.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{sb.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Phone className="w-3 h-3 text-primary" />
                      <span className="text-sm font-bold text-primary">{sb.helpline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <div className="grid md:grid-cols-2 gap-3">
            {STRESS_BUSTERS.filter((s) => s.type !== "helpline").map((sb) => {
              const typeIcon = sb.type === "article" ? <FileText className="w-4 h-4" /> : sb.type === "video" ? <Eye className="w-4 h-4" /> : sb.type === "podcast" ? <MessageCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />;
              return (
                <Card key={sb.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">{typeIcon}</div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{sb.title}</h4>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-[10px]">{sb.type}</Badge>
                        {sb.duration && <span className="text-[10px] text-muted-foreground">⏱️ {sb.duration}</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{sb.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════ MY FRIEND TAB ══════ */}
      {activeTab === "friend" && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Handshake className="w-5 h-5 text-primary" /> Your SPC Friend
          </h3>
          <p className="text-sm text-muted-foreground">A dedicated person who cares about YOU — not orders or ratings, just you.</p>

          <Card className="border border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Smile className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">{myFriend.name}</h4>
                  <p className="text-sm text-muted-foreground">{myFriend.role}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{myFriend.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{myFriend.sessions}</p>
                  <p className="text-[11px] text-muted-foreground">Sessions Completed</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-sm font-medium text-primary">{myFriend.nextSession}</p>
                  <p className="text-[11px] text-muted-foreground">Next Session</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">What Your Friend Can Help With</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Feeling stressed or overwhelmed",
                  "Family or personal problems",
                  "Financial worries or budgeting",
                  "Confidence & motivation boost",
                  "Work-life balance tips",
                  "Connecting to welfare programs",
                  "Just need someone to listen",
                  "Health concerns guidance",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground p-2 rounded-lg bg-muted/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span className="text-[12px]">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                💚 <strong>Remember:</strong> Your SPC Friend conversations are <strong>100% confidential</strong>. 
                Nothing you share will affect your kitchen rating or business. This is purely for your personal wellbeing.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════ NEW GRIEVANCE DIALOG ══════ */}
      <Dialog open={showNewGrievance} onOpenChange={setShowNewGrievance}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Raise a Grievance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Category *</label>
              <Select value={newGrievance.category} onValueChange={(v) => setNewGrievance((p) => ({ ...p, category: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment Issue</SelectItem>
                  <SelectItem value="order_dispute">Order Dispute</SelectItem>
                  <SelectItem value="app_issue">App / Technical Issue</SelectItem>
                  <SelectItem value="policy">Policy Concern</SelectItem>
                  <SelectItem value="harassment">Harassment / Safety</SelectItem>
                  <SelectItem value="personal">Personal Matter</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Subject *</label>
              <Input className="mt-1" placeholder="Brief description of your concern" value={newGrievance.subject} onChange={(e) => setNewGrievance((p) => ({ ...p, subject: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Details</label>
              <Textarea className="mt-1" placeholder="Tell us more about what happened..." rows={4} value={newGrievance.description} onChange={(e) => setNewGrievance((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              🔒 Your grievance is confidential. Our SPC team will respond within 4 hours.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewGrievance(false)}>Cancel</Button>
              <Button onClick={handleSubmitGrievance}>Submit Grievance</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
