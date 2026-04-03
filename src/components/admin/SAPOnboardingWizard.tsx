import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, MapPin, ShieldCheck, Clock, FileText, Plug, TestTube,
  PartyPopper, LifeBuoy, Users, ArrowRight, ArrowLeft, Upload, AlertTriangle,
  Timer, Star, ExternalLink, Ticket
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──
interface WizardKitchen {
  id: string;
  kitchenName: string;
  partnerName: string;
  city: string;
  currentStep: number;
  stepTimestamps: Record<number, { start: string; end?: string }>;
  contract: {
    signed: boolean;
    signedBy: string;
    signedDate: string;
    signature: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
    manualEntry: boolean;
  };
  fdaApplication: {
    type: "tatkal" | "normal";
    applicantName: string;
    kitchenAddress: string;
    foodCategory: string;
    mobile: string;
    email: string;
    documents: { aadhaar: boolean; addressProof: boolean; kitchenPhoto: boolean };
    status: "not_submitted" | "submitted" | "approved" | "rejected";
    submittedDate: string;
    rejectionReason: string;
  };
  platforms: {
    swiggy: PlatformOnboard;
    zomato: PlatformOnboard;
  };
  pos: {
    provider: string;
    stage: "not_started" | "selected" | "integration_started" | "test_order" | "confirmed";
    startDate: string;
  };
  kobTesting: {
    isLive: boolean | null;
    testOrderStatus: "not_started" | "placed" | "delivered" | "failed";
    supportTicketRaised: boolean;
    startDate: string;
  };
  goLiveDate: string;
  tickets: SupportTicket[];
}

interface PlatformOnboard {
  applied: boolean;
  appliedDate: string;
  resIdLinked: boolean;
  resId: string;
  menuUploaded: boolean;
  live: boolean;
  liveDate: string;
}

interface SupportTicket {
  id: string;
  category: "pos" | "location" | "fda";
  issueType: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  assignedTo: string;
  expectedResolution: string;
  tatBreached: boolean;
}

const STEPS = [
  { num: 1, label: "Contract", icon: FileText, sla: 1 },
  { num: 2, label: "Location", icon: MapPin, sla: 1 },
  { num: 3, label: "FDA Application", icon: ShieldCheck, sla: 3 },
  { num: 4, label: "FDA Decision", icon: ShieldCheck, sla: 14 },
  { num: 5, label: "Platform Onboarding", icon: ExternalLink, sla: 7 },
  { num: 6, label: "POS Setup", icon: Plug, sla: 7 },
  { num: 7, label: "KOB Testing", icon: TestTube, sla: 2 },
  { num: 8, label: "Go LIVE", icon: PartyPopper, sla: 0 },
  { num: 9, label: "Support Tickets", icon: LifeBuoy, sla: 0 },
  { num: 10, label: "Auto-Assign", icon: Users, sla: 0 },
  { num: 11, label: "Progress Tracker", icon: Star, sla: 0 },
];

const OBG_TEAM = [
  { name: "Anitha S.", speciality: "fda" },
  { name: "Rachel M.", speciality: "pos" },
  { name: "Preethi V.", speciality: "location" },
  { name: "Gomathi R.", speciality: "pos" },
];

function getDefaultKitchen(id: string, name: string, partner: string, city: string): WizardKitchen {
  return {
    id, kitchenName: name, partnerName: partner, city,
    currentStep: 1,
    stepTimestamps: { 1: { start: new Date().toISOString().split("T")[0] } },
    contract: { signed: false, signedBy: "", signedDate: "", signature: "" },
    location: { lat: 0, lng: 0, address: "", manualEntry: false },
    fdaApplication: {
      type: "normal", applicantName: partner, kitchenAddress: "", foodCategory: "",
      mobile: "", email: "", documents: { aadhaar: false, addressProof: false, kitchenPhoto: false },
      status: "not_submitted", submittedDate: "", rejectionReason: "",
    },
    platforms: {
      swiggy: { applied: false, appliedDate: "", resIdLinked: false, resId: "", menuUploaded: false, live: false, liveDate: "" },
      zomato: { applied: false, appliedDate: "", resIdLinked: false, resId: "", menuUploaded: false, live: false, liveDate: "" },
    },
    pos: { provider: "", stage: "not_started", startDate: "" },
    kobTesting: { isLive: null, testOrderStatus: "not_started", supportTicketRaised: false, startDate: "" },
    goLiveDate: "",
    tickets: [],
  };
}

function formatDate(d: string) {
  if (!d) return "—";
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

function daysBetween(start: string, end?: string) {
  if (!start) return 0;
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  return Math.max(0, Math.floor((e.getTime() - s.getTime()) / 86400000));
}

function TATCountdown({ startDate, slaDays, label }: { startDate: string; slaDays: number; label?: string }) {
  if (!startDate) return null;
  const elapsed = daysBetween(startDate);
  const remaining = slaDays - elapsed;
  const breached = remaining < 0;
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${breached ? "text-destructive" : remaining <= 1 ? "text-amber-600" : "text-muted-foreground"}`}>
      <Timer className="w-3.5 h-3.5" />
      {label && <span>{label}:</span>}
      {breached ? (
        <Badge variant="destructive" className="text-[10px]">TAT Breached ({Math.abs(remaining)}d over)</Badge>
      ) : (
        <span>{remaining}d remaining of {slaDays}d SLA</span>
      )}
    </div>
  );
}

function FDADecisionTAT({ kitchen }: { kitchen: WizardKitchen }) {
  const submittedDate = kitchen.fdaApplication.submittedDate;
  const status = kitchen.fdaApplication.status;
  if (!submittedDate || status === "not_submitted") return null;
  if (status === "approved" || status === "rejected") return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-1.5">
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span>FDA Decision TAT: {status === "approved" ? "Approved" : "Rejected"} — completed ✓</span>
    </div>
  );
  const elapsed = daysBetween(submittedDate);
  const remaining = 9 - elapsed;
  const breached = remaining < 0;
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium rounded-md px-3 py-1.5 border ${breached ? "text-destructive bg-destructive/10 border-destructive/30" : remaining <= 2 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-muted-foreground bg-muted/30 border-border"}`}>
      <Timer className="w-3.5 h-3.5" />
      <span>FDA Application → Decision TAT:</span>
      {breached ? (
        <Badge variant="destructive" className="text-[10px]">TAT Breached ({Math.abs(remaining)}d over 9d SLA)</Badge>
      ) : (
        <span>{remaining}d remaining of 9d SLA</span>
      )}
    </div>
  );
}

// ── Main Component ──
export default function SAPOnboardingWizard({
  kitchenId,
  kitchenName,
  partnerName,
  city,
  onClose,
}: {
  kitchenId: string;
  kitchenName: string;
  partnerName: string;
  city: string;
  onClose: () => void;
}) {
  const [kitchen, setKitchen] = useState<WizardKitchen>(() =>
    getDefaultKitchen(kitchenId, kitchenName, partnerName, city)
  );
  const [activeStep, setActiveStep] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signPadRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const update = useCallback((changes: Partial<WizardKitchen>) => {
    setKitchen(prev => ({ ...prev, ...changes }));
  }, []);

  const goNext = () => {
    if (activeStep < 11) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      if (!kitchen.stepTimestamps[nextStep]) {
        update({
          currentStep: Math.max(kitchen.currentStep, nextStep),
          stepTimestamps: { ...kitchen.stepTimestamps, [nextStep]: { start: new Date().toISOString().split("T")[0] } }
        });
      }
    }
  };
  const goBack = () => { if (activeStep > 1) setActiveStep(activeStep - 1); };

  const completionPercent = Math.round(
    ((Math.min(kitchen.currentStep, 8) - 1) / 7) * 100
  );

  // ── Signature drawing ──
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signPadRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signPadRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "hsl(var(--foreground))";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };
  const endDraw = () => {
    setIsDrawing(false);
    if (signPadRef.current) {
      update({ contract: { ...kitchen.contract, signature: signPadRef.current.toDataURL() } });
    }
  };
  const clearSignature = () => {
    const canvas = signPadRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    update({ contract: { ...kitchen.contract, signature: "" } });
  };

  // ── Geolocation ──
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({
          location: {
            ...kitchen.location,
            lat: parseFloat(pos.coords.latitude.toFixed(6)),
            lng: parseFloat(pos.coords.longitude.toFixed(6)),
            manualEntry: false,
          },
        });
        toast.success("Location detected!");
      },
      () => toast.error("Location access denied. Please enter manually.")
    );
  };

  // ── Confetti for Step 8 ──
  useEffect(() => {
    if (activeStep === 8 && kitchen.goLiveDate) {
      import("canvas-confetti").then((mod) => {
        const confetti = mod.default;
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 100, spread: 60, origin: { y: 0.5 } }), 300);
      });
    }
  }, [activeStep, kitchen.goLiveDate]);

  // ── Auto-assign logic ──
  const autoAssignTicket = (category: "pos" | "location" | "fda"): string => {
    const agent = OBG_TEAM.find(a => a.speciality === category) || OBG_TEAM[0];
    return agent.name;
  };

  const addTicket = (category: "pos" | "location" | "fda", issueType: string, description: string, priority: "low" | "medium" | "high") => {
    const assignedTo = autoAssignTicket(category);
    const ticket: SupportTicket = {
      id: `TKT-${Date.now().toString(36).toUpperCase()}`,
      category, issueType, description, priority,
      status: "open",
      createdAt: new Date().toISOString().split("T")[0],
      assignedTo,
      expectedResolution: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
      tatBreached: false,
    };
    update({ tickets: [...kitchen.tickets, ticket] });
    toast.success(`Ticket ${ticket.id} created & assigned to ${assignedTo}`);
  };

  // ── Render Steps ──
  const renderStep = () => {
    switch (activeStep) {
      case 1: return <StepContract kitchen={kitchen} update={update} signPadRef={signPadRef} startDraw={startDraw} draw={draw} endDraw={endDraw} clearSignature={clearSignature} />;
      case 2: return <StepLocation kitchen={kitchen} update={update} detectLocation={detectLocation} />;
      case 3: return <StepFDAApplication kitchen={kitchen} update={update} />;
      case 4: return <StepFDADecision kitchen={kitchen} update={update} goNext={goNext} />;
      case 5: return <StepPlatformOnboarding kitchen={kitchen} update={update} />;
      case 6: return <StepPOSSetup kitchen={kitchen} update={update} />;
      case 7: return <StepKOBTesting kitchen={kitchen} update={update} addTicket={addTicket} />;
      case 8: return <StepGoLive kitchen={kitchen} update={update} onClose={onClose} />;
      case 9: return <StepSupportTickets kitchen={kitchen} addTicket={addTicket} />;
      case 10: return <StepAutoAssign kitchen={kitchen} update={update} />;
      case 11: return <StepProgressTracker kitchen={kitchen} />;
      default: return null;
    }
  };

  return (
    <Card className="border-primary/20 mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🏪 SAP Onboarding Wizard — {kitchen.kitchenName}
            <Badge variant="secondary" className="text-[10px]">{kitchen.id}</Badge>
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onClose}>✕</Button>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Overall Progress</span>
            <span>{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {STEPS.map((s) => {
            const isActive = activeStep === s.num;
            const isCompleted = kitchen.currentStep > s.num;
            const isCurrent = kitchen.currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap border transition-all ${
                  isActive ? "bg-primary text-primary-foreground border-primary" :
                  isCompleted ? "bg-green-50 text-green-700 border-green-200" :
                  isCurrent ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-muted/30 text-muted-foreground border-border"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={goBack} disabled={activeStep === 1}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {activeStep < 11 && (
            <Button size="sm" onClick={goNext}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════
// STEP 1 — Partner Contract
// ════════════════════════════════════════
function StepContract({ kitchen, update, signPadRef, startDraw, draw, endDraw, clearSignature }: any) {
  const signContract = () => {
    if (!kitchen.contract.signedBy) {
      toast.error("Please type your name to sign");
      return;
    }
    update({
      contract: {
        ...kitchen.contract,
        signed: true,
        signedDate: new Date().toISOString().split("T")[0],
      },
    });
    toast.success("Contract signed successfully! ✅");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Step 1 — Partner Contract</h3>

      {kitchen.contract.signed ? (
        <div className="text-center py-8 space-y-3">
          <Badge className="bg-green-100 text-green-700 border-green-300 text-sm py-1.5 px-4">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Contract Signed ✓
          </Badge>
          <p className="text-sm text-muted-foreground">Signed by {kitchen.contract.signedBy} on {formatDate(kitchen.contract.signedDate)}</p>
        </div>
      ) : (
        <>
          {/* T&C Clauses */}
          <Card className="bg-muted/20">
            <CardContent className="p-4 space-y-3 text-sm">
              <p className="font-semibold text-foreground">Shero Home Foods — Partner Agreement</p>
              <div className="space-y-2 text-muted-foreground text-xs max-h-48 overflow-y-auto">
                <p><strong>1. Scope:</strong> Partner agrees to prepare food items as per Shero quality guidelines and deliver through authorized platforms (Swiggy, Zomato).</p>
                <p><strong>2. FDA Compliance:</strong> Partner must maintain a valid FDA license at all times. Shero will assist in application and renewal.</p>
                <p><strong>3. Hygiene Standards:</strong> Kitchen must comply with monthly hygiene audits. Failure to meet standards may result in temporary suspension.</p>
                <p><strong>4. Revenue Sharing:</strong> Revenue split as per the agreed commission structure. Payouts processed weekly.</p>
                <p><strong>5. Platform Conduct:</strong> Partner must maintain a minimum 4.0 rating. Consistent low ratings will trigger a performance review.</p>
                <p><strong>6. Termination:</strong> Either party may terminate with 30 days written notice. Immediate termination for food safety violations.</p>
                <p><strong>7. Confidentiality:</strong> Partner shall not share proprietary recipes, pricing strategies, or business data with competitors.</p>
                <p><strong>8. Insurance:</strong> Shero provides basic liability coverage for food-related incidents during active orders.</p>
              </div>
            </CardContent>
          </Card>

          {/* E-Signature */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Type Your Full Name</Label>
              <Input
                value={kitchen.contract.signedBy}
                onChange={(e) => update({ contract: { ...kitchen.contract, signedBy: e.target.value } })}
                placeholder="Enter your legal name"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Draw Signature</Label>
              <div className="border border-border rounded-lg mt-1 overflow-hidden bg-background">
                <canvas
                  ref={signPadRef}
                  width={400}
                  height={120}
                  className="w-full cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                />
              </div>
              <Button variant="ghost" size="sm" className="mt-1 text-xs" onClick={clearSignature}>Clear Signature</Button>
            </div>
            <Button onClick={signContract} className="w-full">
              <FileText className="w-4 h-4 mr-1" /> Sign Contract
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// STEP 2 — Get Location
// ════════════════════════════════════════
function StepLocation({ kitchen, update, detectLocation }: any) {
  const hasLocation = kitchen.location.lat !== 0 && kitchen.location.lng !== 0;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Step 2 — Kitchen Location</h3>

      <div className="flex gap-2">
        <Button onClick={detectLocation} variant="outline" size="sm">
          <MapPin className="w-4 h-4 mr-1" /> Auto-Detect Location
        </Button>
        <Button
          variant="ghost" size="sm"
          onClick={() => update({ location: { ...kitchen.location, manualEntry: !kitchen.location.manualEntry } })}
        >
          {kitchen.location.manualEntry ? "Hide Manual Entry" : "Enter Manually"}
        </Button>
      </div>

      {/* Map Embed */}
      {hasLocation && (
        <div className="rounded-lg overflow-hidden border border-border">
          <iframe
            width="100%"
            height="300"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${kitchen.location.lng - 0.01},${kitchen.location.lat - 0.01},${kitchen.location.lng + 0.01},${kitchen.location.lat + 0.01}&layer=mapnik&marker=${kitchen.location.lat},${kitchen.location.lng}`}
            title="Kitchen Location"
          />
        </div>
      )}

      {/* Coordinates Display */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Latitude</Label>
          <Input
            type="number"
            step="0.000001"
            value={kitchen.location.lat || ""}
            onChange={(e) => update({ location: { ...kitchen.location, lat: parseFloat(e.target.value) || 0 } })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Longitude</Label>
          <Input
            type="number"
            step="0.000001"
            value={kitchen.location.lng || ""}
            onChange={(e) => update({ location: { ...kitchen.location, lng: parseFloat(e.target.value) || 0 } })}
            className="mt-1"
          />
        </div>
      </div>

      {/* Manual Address */}
      {kitchen.location.manualEntry && (
        <div>
          <Label className="text-xs text-muted-foreground">Full Address</Label>
          <Textarea
            value={kitchen.location.address}
            onChange={(e) => update({ location: { ...kitchen.location, address: e.target.value } })}
            placeholder="Enter complete kitchen address..."
            className="mt-1"
          />
        </div>
      )}

      {hasLocation && (
        <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Location Saved: {kitchen.location.lat}, {kitchen.location.lng}
        </Badge>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// STEP 3 — FDA Application
// ════════════════════════════════════════
function StepFDAApplication({ kitchen, update }: any) {
  const app = kitchen.fdaApplication;
  const updateApp = (changes: any) => update({ fdaApplication: { ...app, ...changes } });

  const submitApplication = () => {
    if (!app.applicantName || !app.kitchenAddress || !app.mobile || !app.email) {
      toast.error("Please fill all required fields");
      return;
    }
    updateApp({ status: "submitted", submittedDate: new Date().toISOString().split("T")[0] });
    toast.success("FDA Application submitted! Status: Pending Approval");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Step 3 — FDA Application</h3>
      <FDADecisionTAT kitchen={kitchen} />

      {app.status !== "not_submitted" ? (
        <div className="text-center py-6 space-y-2">
          <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-sm py-1.5 px-4">
            <Clock className="w-4 h-4 mr-1" /> FDA Submitted — Pending Approval
          </Badge>
          <p className="text-xs text-muted-foreground">Application type: {app.type === "tatkal" ? "Tatkal (Fast Track)" : "Normal"}</p>
        </div>
      ) : (
        <>
          {/* Application Type Toggle */}
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Label className="text-sm">Application Type:</Label>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${app.type === "normal" ? "font-semibold text-foreground" : "text-muted-foreground"}`}>Normal</span>
              <Switch
                checked={app.type === "tatkal"}
                onCheckedChange={(v) => updateApp({ type: v ? "tatkal" : "normal" })}
              />
              <span className={`text-sm ${app.type === "tatkal" ? "font-semibold text-foreground" : "text-muted-foreground"}`}>Tatkal</span>
            </div>
            {app.type === "tatkal" && <Badge variant="destructive" className="text-[10px]">Fast Track — Higher Fee</Badge>}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Applicant Name *</Label>
              <Input value={app.applicantName} onChange={(e) => updateApp({ applicantName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Food Category *</Label>
              <Select value={app.foodCategory} onValueChange={(v) => updateApp({ foodCategory: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="bakery">Bakery & Confectionery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Kitchen Address *</Label>
              <Textarea value={app.kitchenAddress} onChange={(e) => updateApp({ kitchenAddress: e.target.value })} className="mt-1" placeholder="Full kitchen address" />
            </div>
            <div>
              <Label className="text-xs">Mobile Number *</Label>
              <Input value={app.mobile} onChange={(e) => updateApp({ mobile: e.target.value })} className="mt-1" placeholder="+1 XXXXX XXXXX" />
            </div>
            <div>
              <Label className="text-xs">Email *</Label>
              <Input type="email" value={app.email} onChange={(e) => updateApp({ email: e.target.value })} className="mt-1" />
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Document Upload</Label>
            {[
              { key: "aadhaar", label: "Aadhaar Card" },
              { key: "addressProof", label: "Address Proof" },
              { key: "kitchenPhoto", label: "Kitchen Photo" },
            ].map((doc) => (
              <div key={doc.key} className="flex items-center justify-between p-2.5 border border-border rounded-lg">
                <span className="text-sm">{doc.label}</span>
                <div className="flex items-center gap-2">
                  {app.documents[doc.key] ? (
                    <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Uploaded
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => {
                        updateApp({ documents: { ...app.documents, [doc.key]: true } });
                        toast.success(`${doc.label} uploaded`);
                      }}
                    >
                      <Upload className="w-3 h-3 mr-1" /> Upload
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={submitApplication} className="w-full">
            <ShieldCheck className="w-4 h-4 mr-1" /> Submit FDA Application
          </Button>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// STEP 4 — FDA Decision Gate
// ════════════════════════════════════════
function StepFDADecision({ kitchen, update, goNext }: any) {
  const app = kitchen.fdaApplication;

  if (app.status === "not_submitted") {
    return (
      <div className="text-center py-8 space-y-2">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <p className="text-sm text-muted-foreground">FDA Application not yet submitted. Please complete Step 3 first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Step 4 — FDA Decision Gate</h3>
      <FDADecisionTAT kitchen={kitchen} />

      {app.status === "submitted" && (
        <div className="text-center py-8 space-y-4">
          <div className="animate-pulse">
            <Clock className="w-12 h-12 text-amber-500 mx-auto" />
          </div>
          <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-sm py-1.5 px-4">Awaiting FDA Approval</Badge>
          <p className="text-xs text-muted-foreground">Estimated TAT: {app.type === "tatkal" ? "3-5 business days" : "10-15 business days"}</p>
          <div className="flex justify-center gap-2">
            <Button size="sm" onClick={() => {
              update({ fdaApplication: { ...app, status: "approved" } });
              toast.success("FDA Approved! ✅ Proceeding...");
            }} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Simulate: Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => {
              update({ fdaApplication: { ...app, status: "rejected", rejectionReason: "Incomplete kitchen photos. Kitchen hygiene standards not met in submitted images." } });
            }}>
              Simulate: Reject
            </Button>
          </div>
        </div>
      )}

      {app.status === "approved" && (
        <div className="text-center py-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
          <Badge className="bg-green-100 text-green-700 border-green-300 text-sm py-1.5 px-4">FDA Approved ✓</Badge>
          <p className="text-xs text-muted-foreground">Your FDA application has been approved. You may proceed to platform onboarding.</p>
          <Button size="sm" onClick={goNext}>Proceed to Step 5 <ArrowRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}

      {app.status === "rejected" && (
        <div className="text-center py-8 space-y-3">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <Badge variant="destructive" className="text-sm py-1.5 px-4">FDA Rejected</Badge>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            <strong>Reason:</strong> {app.rejectionReason}
          </p>
          <Button size="sm" onClick={() => {
            update({ fdaApplication: { ...app, status: "not_submitted", rejectionReason: "" } });
            toast.info("Redirecting to FDA Application form...");
          }}>
            <ShieldCheck className="w-4 h-4 mr-1" /> Reapply
          </Button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// STEP 5 — Platform Onboarding (existing, enhanced view)
// ════════════════════════════════════════
function StepPlatformOnboarding({ kitchen, update }: any) {
  const platforms = kitchen.platforms;

  const updatePlatform = (name: "swiggy" | "zomato", changes: Partial<PlatformOnboard>) => {
    update({ platforms: { ...platforms, [name]: { ...platforms[name], ...changes } } });
  };

  const renderCard = (name: "swiggy" | "zomato", color: string, emoji: string) => {
    const p = platforms[name];
    const stages = [
      { label: "Applied", done: p.applied },
      { label: "Res ID Linked", done: p.resIdLinked },
      { label: "Menu Uploaded", done: p.menuUploaded },
      { label: "Live", done: p.live },
    ];

    return (
      <Card className={`border-l-4 ${color}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{emoji} {name.charAt(0).toUpperCase() + name.slice(1)}</h4>
            {p.live && <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px]">LIVE</Badge>}
          </div>
          {/* Stages */}
          <div className="flex items-center gap-1 flex-wrap">
            {stages.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1">
                <button
                  className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer ${s.done ? "bg-green-50 border-green-200 text-green-700" : "bg-muted/30 border-border text-muted-foreground"}`}
                  onClick={() => {
                    if (i === 0) updatePlatform(name, { applied: true, appliedDate: new Date().toISOString().split("T")[0] });
                    if (i === 1) updatePlatform(name, { resIdLinked: true, resId: `${name === "swiggy" ? "SWG" : "ZMT"}-${Math.floor(Math.random() * 90000 + 10000)}` });
                    if (i === 2) updatePlatform(name, { menuUploaded: true });
                    if (i === 3) updatePlatform(name, { live: true, liveDate: new Date().toISOString().split("T")[0] });
                  }}
                >
                  {s.done ? <CheckCircle2 className="w-3 h-3 inline mr-0.5" /> : <Clock className="w-3 h-3 inline mr-0.5" />}
                  {s.label}
                </button>
                {i < 3 && <span className="text-muted-foreground/40 text-[10px]">→</span>}
              </div>
            ))}
          </div>
          {p.applied && <TATCountdown startDate={p.appliedDate} slaDays={7} label="Go-Live SLA" />}
          {p.appliedDate && !p.live && daysBetween(p.appliedDate) > 7 && (
            <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" /> TAT Breached</Badge>
          )}
          {p.resId && <p className="text-xs text-muted-foreground">Res ID: {p.resId}</p>}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><ExternalLink className="w-4 h-4 text-primary" /> Step 5 — Swiggy & Zomato Onboarding</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {renderCard("swiggy", "border-l-orange-500", "🟠")}
        {renderCard("zomato", "border-l-red-500", "🔴")}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// STEP 6 — POS Setup
// ════════════════════════════════════════
function StepPOSSetup({ kitchen, update }: any) {
  const pos = kitchen.pos;
  const updatePOS = (changes: any) => update({ pos: { ...pos, ...changes } });
  const stages = ["not_started", "selected", "integration_started", "test_order", "confirmed"];
  const stageLabels = ["POS Selected", "Integration Started", "Test Order", "Confirmed"];
  const currentIdx = stages.indexOf(pos.stage);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><Plug className="w-4 h-4 text-primary" /> Step 6 — POS System Setup</h3>
      

      {/* Provider Selection */}
      <div>
        <Label className="text-xs">POS Provider</Label>
        <Select value={pos.provider} onValueChange={(v) => {
          updatePOS({ provider: v, stage: "selected", startDate: new Date().toISOString().split("T")[0] });
        }}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select POS provider" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="DotPe">DotPe</SelectItem>
            <SelectItem value="Petpooja">Petpooja</SelectItem>
            <SelectItem value="UrbanPiper">UrbanPiper</SelectItem>
            <SelectItem value="Posist">Posist</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progress Tracker */}
      <div className="flex items-center gap-1 flex-wrap">
        {stageLabels.map((label, i) => {
          const done = currentIdx > i;
          const active = currentIdx === i;
          return (
            <div key={label} className="flex items-center gap-1">
              <button
                className={`text-[10px] px-2.5 py-1 rounded-full border ${done ? "bg-green-50 border-green-200 text-green-700" : active ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/30 border-border text-muted-foreground"}`}
                onClick={() => updatePOS({ stage: stages[i + 1] })}
              >
                {done ? <CheckCircle2 className="w-3 h-3 inline mr-0.5" /> : <Clock className="w-3 h-3 inline mr-0.5" />}
                {label}
              </button>
              {i < 3 && <span className="text-muted-foreground/40 text-[10px]">→</span>}
            </div>
          );
        })}
      </div>

      {pos.startDate && <TATCountdown startDate={pos.startDate} slaDays={7} label="POS Setup SLA" />}

      {pos.stage === "confirmed" && (
        <Badge className="bg-green-100 text-green-700 border-green-300 text-sm py-1.5 px-4">
          <CheckCircle2 className="w-4 h-4 mr-1" /> POS Integrated ✓ — {pos.provider}
        </Badge>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// STEP 7 — KOB Live Testing
// ════════════════════════════════════════
function StepKOBTesting({ kitchen, update, addTicket }: any) {
  const kob = kitchen.kobTesting;
  const updateKOB = (changes: any) => update({ kobTesting: { ...kob, ...changes } });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><TestTube className="w-4 h-4 text-primary" /> Step 7 — KOB Live Testing</h3>

      <Card className="bg-muted/20">
        <CardContent className="p-4 text-center space-y-4">
          <p className="font-medium text-sm">Is the kitchen live on both platforms and tested?</p>

          {kob.isLive === null ? (
            <div className="flex justify-center gap-3">
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                updateKOB({ isLive: true, startDate: new Date().toISOString().split("T")[0] });
                toast.success("Kitchen verified as LIVE! ✅");
              }}>
                ✅ Yes — Kitchen is Live
              </Button>
              <Button variant="destructive" onClick={() => {
                updateKOB({ isLive: false, supportTicketRaised: true, startDate: new Date().toISOString().split("T")[0] });
                addTicket("pos", "Kitchen not live", "Kitchen is not live on platforms after onboarding steps completed.", "high");
              }}>
                ❌ No — Raise Support Ticket
              </Button>
            </div>
          ) : kob.isLive ? (
            <Badge className="bg-green-100 text-green-700 border-green-300 text-sm py-1.5 px-4">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Kitchen Verified Live
            </Badge>
          ) : (
            <div className="space-y-2">
              <Badge variant="destructive" className="text-sm py-1.5 px-4">
                <AlertTriangle className="w-4 h-4 mr-1" /> Support Ticket Raised
              </Badge>
              <p className="text-xs text-muted-foreground">Auto-support ticket has been created. OBG team will investigate.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {kob.startDate && <TATCountdown startDate={kob.startDate} slaDays={2} label="KOB Testing SLA" />}

      {/* Test Order Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Test Order Status</Label>
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { key: "placed", label: "Order Placed" },
            { key: "delivered", label: "Delivered" },
          ].map((s, i) => {
            const testStages = ["not_started", "placed", "delivered"];
            const currentIdx = testStages.indexOf(kob.testOrderStatus);
            const done = currentIdx > i;
            return (
              <div key={s.key} className="flex items-center gap-1">
                <button
                  className={`text-[10px] px-2.5 py-1 rounded-full border ${done ? "bg-green-50 border-green-200 text-green-700" : "bg-muted/30 border-border text-muted-foreground"}`}
                  onClick={() => updateKOB({ testOrderStatus: s.key })}
                >
                  {done ? <CheckCircle2 className="w-3 h-3 inline mr-0.5" /> : <Clock className="w-3 h-3 inline mr-0.5" />}
                  {s.label}
                </button>
                {i < 1 && <span className="text-muted-foreground/40 text-[10px]">→</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// STEP 8 — Go LIVE
// ════════════════════════════════════════
function StepGoLive({ kitchen, update, onClose }: any) {
  const isLive = !!kitchen.goLiveDate;

  const goLive = () => {
    update({ goLiveDate: new Date().toISOString().split("T")[0] });
    toast.success("🎉 Store is LIVE!");
  };

  return (
    <div className="space-y-4 text-center">
      {isLive ? (
        <div className="py-8 space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold text-foreground">Your Store is LIVE!</h2>
          <div className="flex justify-center gap-2">
            <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-sm py-1.5 px-4">🟠 Swiggy</Badge>
            <Badge className="bg-red-100 text-red-700 border-red-300 text-sm py-1.5 px-4">🔴 Zomato</Badge>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-300 text-sm py-1.5 px-4">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Store is LIVE
          </Badge>

          {/* Summary */}
          <Card className="bg-muted/20 max-w-md mx-auto text-left">
            <CardContent className="p-4 space-y-2 text-sm">
              {[
                { label: "Kitchen Name", value: kitchen.kitchenName },
                { label: "SAP ID", value: kitchen.id },
                { label: "Live Date", value: formatDate(kitchen.goLiveDate) },
                { label: "City", value: kitchen.city },
              ].map((f) => (
                <div key={f.label} className="flex justify-between">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-medium">{f.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={onClose} className="mt-4">
            Go to Partner Dashboard <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      ) : (
        <div className="py-8 space-y-4">
          <PartyPopper className="w-12 h-12 text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">All steps complete. Ready to go live?</p>
          <Button size="lg" onClick={goLive}>
            🚀 Go LIVE Now
          </Button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// STEP 9 — Support Ticket Portal
// ════════════════════════════════════════
function StepSupportTickets({ kitchen, addTicket }: any) {
  const [ticketTab, setTicketTab] = useState("pos");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const submit = () => {
    if (!issueType || !description) {
      toast.error("Please fill issue type and description");
      return;
    }
    addTicket(ticketTab as "pos" | "location" | "fda", issueType, description, priority);
    setIssueType("");
    setDescription("");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><LifeBuoy className="w-4 h-4 text-primary" /> Step 9 — Support Ticket Portal</h3>

      <Tabs value={ticketTab} onValueChange={setTicketTab}>
        <TabsList>
          <TabsTrigger value="pos">POS Issues</TabsTrigger>
          <TabsTrigger value="location">Location Issues</TabsTrigger>
          <TabsTrigger value="fda">FDA Issues</TabsTrigger>
        </TabsList>
        <TabsContent value={ticketTab} className="space-y-3 mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Issue Type *</Label>
              <Input value={issueType} onChange={(e) => setIssueType(e.target.value)} className="mt-1" placeholder={`Describe the ${ticketTab} issue type`} />
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" placeholder="Describe the issue in detail..." />
          </div>
          <Button onClick={submit} size="sm">
            <Ticket className="w-4 h-4 mr-1" /> Submit Ticket
          </Button>
        </TabsContent>
      </Tabs>

      {/* Open Tickets List */}
      {kitchen.tickets.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Open Tickets ({kitchen.tickets.length})</Label>
          {kitchen.tickets.map((t: SupportTicket) => (
            <Card key={t.id} className="border-border">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold">{t.id}</span>
                    <Badge variant={t.status === "resolved" ? "default" : t.status === "in_progress" ? "secondary" : "outline"} className="text-[10px]">
                      {t.status.replace("_", " ")}
                    </Badge>
                    <Badge variant={t.priority === "high" ? "destructive" : "outline"} className="text-[10px]">{t.priority}</Badge>
                    {t.tatBreached && <Badge variant="destructive" className="text-[10px]">TAT Breached</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.category.toUpperCase()} — {t.issueType}</p>
                  <p className="text-xs text-muted-foreground">Assigned: {t.assignedTo}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{formatDate(t.createdAt)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// STEP 10 — Auto-Assign Logic (OBG Admin View)
// ════════════════════════════════════════
function StepAutoAssign({ kitchen, update }: any) {
  const tickets = kitchen.tickets as SupportTicket[];
  const flaggedTickets = tickets.filter((t) => t.status !== "resolved");

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Step 10 — Auto-Assign & OBG Queue</h3>

      <Card className="bg-muted/20">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-medium">Auto-Assignment Rules</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>POS Issues</strong> → Rachel M. / Gomathi R.</p>
            <p>• <strong>Location Issues</strong> → Preethi V.</p>
            <p>• <strong>FDA Issues</strong> → Anitha S.</p>
            <p>• TAT exceeded → Auto-flag with <Badge variant="destructive" className="text-[9px] py-0 px-1">TAT Breached</Badge></p>
          </div>
        </CardContent>
      </Card>

      {/* OBG Queue */}
      <Label className="text-sm font-medium">OBG Team Queue ({flaggedTickets.length} open)</Label>
      {flaggedTickets.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No open tickets 🎉</p>
      ) : (
        <div className="space-y-2">
          {flaggedTickets
            .sort((a, b) => {
              const pMap = { high: 0, medium: 1, low: 2 };
              return pMap[a.priority] - pMap[b.priority];
            })
            .map((t) => (
              <Card key={t.id} className={`border-l-4 ${t.priority === "high" ? "border-l-destructive" : t.priority === "medium" ? "border-l-amber-500" : "border-l-border"}`}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold">{t.id}</span>
                      <Badge variant={t.priority === "high" ? "destructive" : "outline"} className="text-[10px]">{t.priority}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{t.category.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs mt-1">{t.issueType}</p>
                    <p className="text-xs text-muted-foreground">Assigned: <strong>{t.assignedTo}</strong> · Expected: {formatDate(t.expectedResolution)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => {
                      const updated = kitchen.tickets.map((tk: SupportTicket) =>
                        tk.id === t.id ? { ...tk, status: "resolved" as const } : tk
                      );
                      update({ tickets: updated });
                      toast.success(`Ticket ${t.id} resolved`);
                    }}
                  >
                    Resolve
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// STEP 11 — Progress Tracker
// ════════════════════════════════════════
function StepProgressTracker({ kitchen }: any) {
  const stepsStatus = STEPS.map((s) => {
    const timestamp = kitchen.stepTimestamps[s.num];
    const completed = kitchen.currentStep > s.num;
    const inProgress = kitchen.currentStep === s.num;
    const daysElapsed = timestamp ? daysBetween(timestamp.start, timestamp.end) : 0;
    const tatOk = s.sla === 0 || daysElapsed <= s.sla;

    return {
      ...s,
      completed,
      inProgress,
      daysElapsed,
      tatOk,
      timestamp,
    };
  });

  const completedSteps = stepsStatus.filter((s) => s.completed).length;
  const overallPercent = Math.round((completedSteps / 8) * 100); // Steps 1-8 are sequential
  const tatBreaches = stepsStatus.filter((s) => !s.tatOk && s.sla > 0).length;
  const healthColor = tatBreaches === 0 ? "text-green-600" : tatBreaches <= 2 ? "text-amber-600" : "text-destructive";
  const healthLabel = tatBreaches === 0 ? "Green" : tatBreaches <= 2 ? "Amber" : "Red";

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Step 11 — Onboarding Progress Tracker</h3>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{overallPercent}%</p>
            <p className="text-[10px] text-muted-foreground">Completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className={`text-2xl font-bold ${healthColor}`}>{healthLabel}</p>
            <p className="text-[10px] text-muted-foreground">Health Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{kitchen.id}</p>
            <p className="text-[10px] text-muted-foreground">SAP ID</p>
          </CardContent>
        </Card>
      </div>

      <Progress value={overallPercent} className="h-3" />

      {/* Milestone Cards */}
      <div className="space-y-2">
        {stepsStatus.map((s) => (
          <div
            key={s.num}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              s.completed ? "bg-green-50/50 border-green-200" :
              s.inProgress ? "bg-amber-50/50 border-amber-200" :
              "bg-muted/20 border-border"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {s.completed ? "✅" : s.inProgress ? "🔄" : "⏳"}
              </span>
              <div>
                <p className="text-sm font-medium">Step {s.num}: {s.label}</p>
                {s.sla > 0 && (
                  <p className={`text-[10px] ${s.tatOk ? "text-muted-foreground" : "text-destructive font-medium"}`}>
                    {s.daysElapsed}d taken / {s.sla}d SLA {!s.tatOk && "⚠️"}
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant={s.completed ? "default" : s.inProgress ? "secondary" : "outline"}
              className="text-[10px]"
            >
              {s.completed ? "Done" : s.inProgress ? "In Progress" : "Pending"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
