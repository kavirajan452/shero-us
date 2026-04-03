import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, XCircle, Clock, Search, Store, ShieldCheck, Hash, Plug,
  ExternalLink, AlertTriangle, Eye, CalendarDays, MessageSquare, Bell, Wand2
} from "lucide-react";
import SAPOnboardingWizard from "@/components/admin/SAPOnboardingWizard";

type Platform = "swiggy" | "zomato" | "both";
type OnboardingStatus = "pending_fssai" | "fssai_verified" | "pending_resid" | "resid_linked" | "pos_pending" | "pos_integrated" | "live" | "rejected";

interface SAPKitchen {
  id: string;
  kitchenName: string;
  partnerName: string;
  city: string;
  platform: Platform;
  // FSSAI
  fssaiNumber: string;
  fssaiStatus: "pending" | "verified" | "expired" | "not_submitted";
  fssaiApplyDate: string;
  fssaiReceivedDate: string;
  fssaiValidUpto: string;
  fssaiExpiry: string; // kept for compat
  // Swiggy timeline
  swiggyResId: string;
  swiggyAppliedDate: string;
  swiggyLiveDate: string;
  swiggyOpsHandoverDate: string;
  swiggyComments: string;
  // Zomato timeline
  zomatoResId: string;
  zomatoAppliedDate: string;
  zomatoLiveDate: string;
  zomatoOpsHandoverDate: string;
  zomatoComments: string;
  // POS
  posIntegrated: boolean;
  posProvider: string;
  // General
  status: OnboardingStatus;
  appliedAt: string;
  goLiveDate: string;
}

const mockKitchens: SAPKitchen[] = [
  {
    id: "SAP-001", kitchenName: "Lakshmi's Kitchen", partnerName: "Chef Lakshmi", city: "Chennai",
    platform: "both", fssaiNumber: "10024051000123", fssaiStatus: "verified",
    fssaiApplyDate: "2025-12-01", fssaiReceivedDate: "2026-01-10", fssaiValidUpto: "2027-03-15", fssaiExpiry: "2027-03-15",
    swiggyResId: "SWG-98231", swiggyAppliedDate: "2026-01-15", swiggyLiveDate: "2026-02-20", swiggyOpsHandoverDate: "2026-02-22", swiggyComments: "Smooth onboarding",
    zomatoResId: "ZMT-44521", zomatoAppliedDate: "2026-01-15", zomatoLiveDate: "2026-02-20", zomatoOpsHandoverDate: "2026-02-23", zomatoComments: "Menu approved quickly",
    posIntegrated: true, posProvider: "Petpooja",
    status: "live", appliedAt: "15 days ago", goLiveDate: "2026-02-20"
  },
  {
    id: "SAP-002", kitchenName: "Meena's Tiffins", partnerName: "Chef Meena", city: "Bangalore",
    platform: "swiggy", fssaiNumber: "10024051000456", fssaiStatus: "verified",
    fssaiApplyDate: "2025-11-10", fssaiReceivedDate: "2025-12-20", fssaiValidUpto: "2027-06-10", fssaiExpiry: "2027-06-10",
    swiggyResId: "SWG-98345", swiggyAppliedDate: "2026-02-28", swiggyLiveDate: "", swiggyOpsHandoverDate: "", swiggyComments: "Awaiting POS setup",
    zomatoResId: "", zomatoAppliedDate: "", zomatoLiveDate: "", zomatoOpsHandoverDate: "", zomatoComments: "",
    posIntegrated: false, posProvider: "",
    status: "pos_pending", appliedAt: "3 days ago", goLiveDate: ""
  },
  {
    id: "SAP-003", kitchenName: "Raheema's Biryani", partnerName: "Chef Raheema", city: "Hyderabad",
    platform: "zomato", fssaiNumber: "", fssaiStatus: "not_submitted",
    fssaiApplyDate: "", fssaiReceivedDate: "", fssaiValidUpto: "", fssaiExpiry: "",
    swiggyResId: "", swiggyAppliedDate: "", swiggyLiveDate: "", swiggyOpsHandoverDate: "", swiggyComments: "",
    zomatoResId: "", zomatoAppliedDate: "", zomatoLiveDate: "", zomatoOpsHandoverDate: "", zomatoComments: "",
    posIntegrated: false, posProvider: "",
    status: "pending_fssai", appliedAt: "1 day ago", goLiveDate: ""
  },
  {
    id: "SAP-004", kitchenName: "Saroja's Chettinad", partnerName: "Chef Saroja", city: "Madurai",
    platform: "both", fssaiNumber: "10024051000789", fssaiStatus: "verified",
    fssaiApplyDate: "2025-09-15", fssaiReceivedDate: "2025-10-20", fssaiValidUpto: "2026-12-01", fssaiExpiry: "2026-12-01",
    swiggyResId: "SWG-99102", swiggyAppliedDate: "2026-02-25", swiggyLiveDate: "", swiggyOpsHandoverDate: "", swiggyComments: "",
    zomatoResId: "", zomatoAppliedDate: "", zomatoLiveDate: "", zomatoOpsHandoverDate: "", zomatoComments: "Application pending",
    posIntegrated: false, posProvider: "",
    status: "pending_resid", appliedAt: "5 days ago", goLiveDate: ""
  },
  {
    id: "SAP-005", kitchenName: "Kamala's Kitchen", partnerName: "Chef Kamala", city: "Coimbatore",
    platform: "swiggy", fssaiNumber: "10024051000321", fssaiStatus: "expired",
    fssaiApplyDate: "2023-10-01", fssaiReceivedDate: "2023-11-15", fssaiValidUpto: "2025-11-30", fssaiExpiry: "2025-11-30",
    swiggyResId: "", swiggyAppliedDate: "", swiggyLiveDate: "", swiggyOpsHandoverDate: "", swiggyComments: "Blocked due to expired FSSAI",
    zomatoResId: "", zomatoAppliedDate: "", zomatoLiveDate: "", zomatoOpsHandoverDate: "", zomatoComments: "",
    posIntegrated: false, posProvider: "",
    status: "rejected", appliedAt: "7 days ago", goLiveDate: ""
  },
  {
    id: "SAP-006", kitchenName: "Fathima's Kerala", partnerName: "Chef Fathima", city: "Kochi",
    platform: "both", fssaiNumber: "10024051000654", fssaiStatus: "verified",
    fssaiApplyDate: "2025-07-01", fssaiReceivedDate: "2025-08-15", fssaiValidUpto: "2027-09-20", fssaiExpiry: "2027-09-20",
    swiggyResId: "SWG-99200", swiggyAppliedDate: "2026-02-10", swiggyLiveDate: "", swiggyOpsHandoverDate: "", swiggyComments: "Waiting for menu verification",
    zomatoResId: "ZMT-44600", zomatoAppliedDate: "2026-02-10", zomatoLiveDate: "", zomatoOpsHandoverDate: "", zomatoComments: "Documents submitted",
    posIntegrated: true, posProvider: "UrbanPiper",
    status: "resid_linked", appliedAt: "4 days ago", goLiveDate: ""
  },
];

const statusConfig: Record<OnboardingStatus, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
  pending_fssai: { label: "FSSAI Pending", variant: "outline" },
  fssai_verified: { label: "FSSAI Verified", variant: "secondary" },
  pending_resid: { label: "Res ID Pending", variant: "outline" },
  resid_linked: { label: "Res ID Linked", variant: "secondary" },
  pos_pending: { label: "POS Pending", variant: "outline" },
  pos_integrated: { label: "POS Integrated", variant: "secondary" },
  live: { label: "Live", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const platformBadge = (p: Platform) => {
  if (p === "swiggy") return <Badge className="bg-orange-500/10 text-orange-600 border-orange-200 text-[10px]">Swiggy</Badge>;
  if (p === "zomato") return <Badge className="bg-red-500/10 text-red-600 border-red-200 text-[10px]">Zomato</Badge>;
  return (
    <div className="flex gap-1">
      <Badge className="bg-orange-500/10 text-orange-600 border-orange-200 text-[10px]">Swiggy</Badge>
      <Badge className="bg-red-500/10 text-red-600 border-red-200 text-[10px]">Zomato</Badge>
    </div>
  );
};

const fssaiStatusBadge = (s: SAPKitchen["fssaiStatus"]) => {
  const map = {
    verified: { label: "Verified", variant: "default" as const },
    pending: { label: "Pending", variant: "outline" as const },
    expired: { label: "Expired", variant: "destructive" as const },
    not_submitted: { label: "Not Submitted", variant: "outline" as const },
  };
  const c = map[s];
  return <Badge variant={c.variant} className="text-[10px]">{c.label}</Badge>;
};

function getRenewalAlert(validUpto: string): { show: boolean; message: string; urgent: boolean } {
  if (!validUpto) return { show: false, message: "", urgent: false };
  const expiry = new Date(validUpto);
  const now = new Date();
  const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { show: true, message: `FSSAI expired ${Math.abs(diffDays)} days ago!`, urgent: true };
  if (diffDays <= 30) return { show: true, message: `FSSAI expires in ${diffDays} days — renewal required!`, urgent: true };
  if (diffDays <= 60) return { show: true, message: `FSSAI expires in ${diffDays} days — plan renewal soon`, urgent: false };
  return { show: false, message: "", urgent: false };
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
        <CalendarDays className="w-3 h-3" /> {label}
      </Label>
      <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-9 text-sm" />
    </div>
  );
}

function PlatformTimeline({ 
  platformName, color, resId, appliedDate, liveDate, opsHandoverDate, comments,
  onUpdate 
}: {
  platformName: string;
  color: string;
  resId: string;
  appliedDate: string;
  liveDate: string;
  opsHandoverDate: string;
  comments: string;
  onUpdate: (updates: Record<string, string>) => void;
}) {
  const prefix = platformName.toLowerCase();
  return (
    <div className="border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="font-semibold text-sm">{platformName} Onboarding Timeline</h3>
        {liveDate && <Badge variant="default" className="text-[10px]">Live</Badge>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Hash className="w-3 h-3" /> {platformName} Res ID
          </Label>
          <Input
            value={resId}
            placeholder={platformName === "Swiggy" ? "SWG-XXXXX" : "ZMT-XXXXX"}
            onChange={(e) => onUpdate({ [`${prefix}ResId`]: e.target.value })}
            className="mt-1 h-9 text-sm"
          />
        </div>
        <DateField label="Applied Date" value={appliedDate} onChange={(v) => onUpdate({ [`${prefix}AppliedDate`]: v })} />
        <DateField label="Live Date" value={liveDate} onChange={(v) => onUpdate({ [`${prefix}LiveDate`]: v })} />
        <DateField label="Ops Handover Date" value={opsHandoverDate} onChange={(v) => onUpdate({ [`${prefix}OpsHandoverDate`]: v })} />
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: "Applied", done: !!appliedDate },
          { label: "Res ID", done: !!resId },
          { label: "Live", done: !!liveDate },
          { label: "Ops Handover", done: !!opsHandoverDate },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center gap-1">
            <div className={`text-[10px] px-2 py-0.5 rounded-full border ${step.done ? "bg-green-50 border-green-200 text-green-700" : "bg-muted/30 border-border text-muted-foreground"}`}>
              {step.done ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <Clock className="w-3 h-3 inline mr-1" />}
              {step.label}
            </div>
            {i < 3 && <span className="text-muted-foreground/40 text-[10px]">→</span>}
          </div>
        ))}
      </div>

      {/* Comments */}
      <div>
        <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
          <MessageSquare className="w-3 h-3" /> Comments
        </Label>
        <Textarea
          value={comments}
          placeholder={`Add comments for ${platformName} onboarding...`}
          onChange={(e) => onUpdate({ [`${prefix}Comments`]: e.target.value })}
          className="mt-1 text-sm min-h-[60px]"
        />
      </div>
    </div>
  );
}

export default function AdminSAPOnboarding() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [kitchens, setKitchens] = useState(mockKitchens);
  const [selected, setSelected] = useState<SAPKitchen | null>(null);
  const [wizardKitchen, setWizardKitchen] = useState<SAPKitchen | null>(null);

  const filtered = kitchens.filter((k) => {
    const matchSearch = k.kitchenName.toLowerCase().includes(search.toLowerCase()) ||
      k.id.toLowerCase().includes(search.toLowerCase()) ||
      k.partnerName.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === "all" || k.platform === platformFilter || k.platform === "both";
    const matchTab = tab === "all" ||
      (tab === "pending" && ["pending_fssai", "pending_resid", "pos_pending"].includes(k.status)) ||
      (tab === "live" && k.status === "live") ||
      (tab === "rejected" && k.status === "rejected") ||
      (tab === "in_progress" && ["fssai_verified", "resid_linked", "pos_integrated"].includes(k.status));
    return matchSearch && matchPlatform && matchTab;
  });

  const counts = {
    all: kitchens.length,
    pending: kitchens.filter((k) => ["pending_fssai", "pending_resid", "pos_pending"].includes(k.status)).length,
    in_progress: kitchens.filter((k) => ["fssai_verified", "resid_linked", "pos_integrated"].includes(k.status)).length,
    live: kitchens.filter((k) => k.status === "live").length,
    rejected: kitchens.filter((k) => k.status === "rejected").length,
  };

  const renewalAlerts = useMemo(() => {
    return kitchens.filter(k => getRenewalAlert(k.fssaiValidUpto).show);
  }, [kitchens]);

  const updateKitchen = (id: string, updates: Partial<SAPKitchen>) => {
    setKitchens((prev) => prev.map((k) => (k.id === id ? { ...k, ...updates } : k)));
    if (selected?.id === id) setSelected((p) => p ? { ...p, ...updates } : p);
  };

  const renewalAlert = selected ? getRenewalAlert(selected.fssaiValidUpto) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SAP Onboarding</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage kitchen onboarding to Swiggy & Zomato — FSSAI, Restaurant IDs & POS integration
        </p>
      </div>

      {/* Renewal Alerts Banner */}
      {renewalAlerts.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">FSSAI Renewal Alerts ({renewalAlerts.length})</p>
            </div>
            <div className="space-y-1">
              {renewalAlerts.map(k => {
                const alert = getRenewalAlert(k.fssaiValidUpto);
                return (
                  <div key={k.id} className={`flex items-center justify-between text-xs rounded-lg px-2 py-1.5 ${alert.urgent ? "bg-destructive/10 text-destructive" : "bg-amber-100 text-amber-700"}`}>
                    <span>{k.kitchenName} ({k.id}) — {alert.message}</span>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => setSelected(k)}>View</Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Kitchens", value: counts.all, icon: Store, color: "text-primary" },
          { label: "Pending Steps", value: counts.pending, icon: Clock, color: "text-amber-600" },
          { label: "In Progress", value: counts.in_progress, icon: Plug, color: "text-blue-600" },
          { label: "Live", value: counts.live, icon: CheckCircle2, color: "text-green-600" },
          { label: "Rejected", value: counts.rejected, icon: XCircle, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <s.icon className={`w-5 h-5 ${s.color} mb-1.5`} />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search kitchen, partner or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="swiggy">Swiggy</SelectItem>
            <SelectItem value="zomato">Zomato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs & List */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({counts.in_progress})</TabsTrigger>
          <TabsTrigger value="live">Live ({counts.live})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No kitchens found</p>
          )}
          {filtered.map((k) => {
            const alert = getRenewalAlert(k.fssaiValidUpto);
            return (
              <Card key={k.id} className={`border-border hover:shadow-sm transition-shadow cursor-pointer ${alert.urgent ? "border-l-4 border-l-destructive" : ""}`} onClick={() => setSelected(k)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">{k.kitchenName}</p>
                        <Badge variant={statusConfig[k.status].variant} className="text-[10px]">
                          {statusConfig[k.status].label}
                        </Badge>
                        {platformBadge(k.platform)}
                        {alert.show && (
                          <Badge variant={alert.urgent ? "destructive" : "outline"} className="text-[10px]">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Renewal
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{k.id} · {k.partnerName} · {k.city}</p>

                      {/* Progress steps */}
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {[
                          { label: "FSSAI", done: ["verified"].includes(k.fssaiStatus), icon: ShieldCheck },
                          { label: "Res ID", done: !!(k.swiggyResId || k.zomatoResId), icon: Hash },
                          { label: "POS", done: k.posIntegrated, icon: Plug },
                          { label: "Live", done: k.status === "live", icon: ExternalLink },
                        ].map((step, i) => (
                          <div key={step.label} className="flex items-center gap-1">
                            <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${step.done ? "bg-green-50 border-green-200 text-green-700" : "bg-muted/30 border-border text-muted-foreground"}`}>
                              <step.icon className="w-3 h-3" />
                              {step.label}
                            </div>
                            {i < 3 && <span className="text-muted-foreground/40 text-[10px]">→</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="default" className="h-8 px-2 text-xs" onClick={(e) => { e.stopPropagation(); setWizardKitchen(k); }}>
                        <Wand2 className="w-3.5 h-3.5 mr-1" /> Wizard
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={(e) => { e.stopPropagation(); setSelected(k); }}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Detail Panel */}
      {selected && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                {selected.kitchenName}
                <Badge variant={statusConfig[selected.status].variant} className="text-[10px] ml-1">
                  {statusConfig[selected.status].label}
                </Badge>
              </span>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>✕</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {[
                { label: "Kitchen ID", value: selected.id },
                { label: "Partner", value: selected.partnerName },
                { label: "City", value: selected.city },
                { label: "Applied", value: selected.appliedAt },
              ].map((f) => (
                <div key={f.label} className="bg-muted/30 rounded-lg p-3 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                  <p className="font-medium text-foreground mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>

            {/* FSSAI Section - Expanded */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> FSSAI License
                </h3>
                {fssaiStatusBadge(selected.fssaiStatus)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <Label className="text-[11px] text-muted-foreground">FSSAI Number</Label>
                  <Input
                    value={selected.fssaiNumber}
                    placeholder="14-digit FSSAI number"
                    onChange={(e) => updateKitchen(selected.id, { fssaiNumber: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <DateField label="FSSAI Apply Date" value={selected.fssaiApplyDate} onChange={(v) => updateKitchen(selected.id, { fssaiApplyDate: v })} />
                <DateField label="FSSAI Received Date" value={selected.fssaiReceivedDate} onChange={(v) => updateKitchen(selected.id, { fssaiReceivedDate: v })} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <DateField label="Valid Upto" value={selected.fssaiValidUpto} onChange={(v) => updateKitchen(selected.id, { fssaiValidUpto: v, fssaiExpiry: v })} />
                <div>
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Bell className="w-3 h-3" /> Next Renewal Alert
                  </Label>
                  <div className="mt-1 h-9 flex items-center">
                    {renewalAlert?.show ? (
                      <span className={`text-xs font-medium ${renewalAlert.urgent ? "text-destructive" : "text-amber-600"}`}>
                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                        {renewalAlert.message}
                      </span>
                    ) : (
                      <span className="text-xs text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                        No renewal needed soon
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selected.fssaiStatus === "expired" && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-2">
                  <AlertTriangle className="w-4 h-4" /> FSSAI license has expired. Renewal required before onboarding.
                </div>
              )}
              {selected.fssaiStatus !== "verified" && (
                <Button size="sm" variant="outline" onClick={() => updateKitchen(selected.id, { fssaiStatus: "verified", status: "fssai_verified" })}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark as Verified
                </Button>
              )}
            </div>

            {/* Swiggy Timeline */}
            {(selected.platform === "swiggy" || selected.platform === "both") && (
              <PlatformTimeline
                platformName="Swiggy"
                color="bg-orange-500"
                resId={selected.swiggyResId}
                appliedDate={selected.swiggyAppliedDate}
                liveDate={selected.swiggyLiveDate}
                opsHandoverDate={selected.swiggyOpsHandoverDate}
                comments={selected.swiggyComments}
                onUpdate={(updates) => updateKitchen(selected.id, updates as Partial<SAPKitchen>)}
              />
            )}

            {/* Zomato Timeline */}
            {(selected.platform === "zomato" || selected.platform === "both") && (
              <PlatformTimeline
                platformName="Zomato"
                color="bg-red-500"
                resId={selected.zomatoResId}
                appliedDate={selected.zomatoAppliedDate}
                liveDate={selected.zomatoLiveDate}
                opsHandoverDate={selected.zomatoOpsHandoverDate}
                comments={selected.zomatoComments}
                onUpdate={(updates) => updateKitchen(selected.id, updates as Partial<SAPKitchen>)}
              />
            )}

            {/* POS Integration */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Plug className="w-4 h-4 text-primary" /> POS Integration
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selected.posIntegrated}
                    onCheckedChange={(v) => updateKitchen(selected.id, { posIntegrated: v })}
                  />
                  <Label className="text-sm">{selected.posIntegrated ? "Integrated" : "Not Integrated"}</Label>
                </div>
                {selected.posIntegrated && (
                  <Select
                    value={selected.posProvider || "petpooja"}
                    onValueChange={(v) => updateKitchen(selected.id, { posProvider: v })}
                  >
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue placeholder="POS Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petpooja">Petpooja</SelectItem>
                      <SelectItem value="UrbanPiper">UrbanPiper</SelectItem>
                      <SelectItem value="Posist">Posist</SelectItem>
                      <SelectItem value="dotpe">DotPe</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 flex-wrap">
              {selected.status !== "live" && selected.status !== "rejected" && (
                <>
                  <Button variant="destructive" size="sm" onClick={() => updateKitchen(selected.id, { status: "rejected" })}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => updateKitchen(selected.id, { status: "live", goLiveDate: new Date().toISOString().split("T")[0] })}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Go Live
                  </Button>
                </>
              )}
              {selected.status === "live" && (
                <Badge variant="default" className="text-xs py-1.5 px-3">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Live since {selected.goLiveDate}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SAP Onboarding Wizard */}
      {wizardKitchen && (
        <SAPOnboardingWizard
          kitchenId={wizardKitchen.id}
          kitchenName={wizardKitchen.kitchenName}
          partnerName={wizardKitchen.partnerName}
          city={wizardKitchen.city}
          onClose={() => setWizardKitchen(null)}
        />
      )}
    </div>
  );
}
