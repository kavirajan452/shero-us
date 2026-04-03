import { useState, useMemo } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Upload, MapPin, Home, Users,
  GraduationCap, Camera, ClipboardList, PlayCircle, Phone, Clock,
  XCircle, CreditCard, MessageCircle, Briefcase, UtensilsCrossed, Sparkles,
  Video, FileText, Award, Info
} from "lucide-react";
import LocationPicker from "@/components/LocationPicker";
import sheroLogo from "@/assets/shero-logo.png";
import mascotWelcome from "@/assets/shero-mascot-welcome.png";
import sheroFamilyHappy from "@/assets/shero-family-happy.png";

/* ───────────────────── Business Verticals (Super Admin approved) ───────────────────── */
type VerticalCategory = "cooking" | "service";

interface BusinessVertical {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: VerticalCategory;
  active: boolean; // controlled by Super Admin
}

const BUSINESS_VERTICALS: BusinessVertical[] = [
  { id: "sap-branded", name: "Shero Branded Home Food (SAP)", description: "Operate a branded Shero kitchen with standardized menus", icon: "🏠", category: "cooking", active: true },
  { id: "hcf-marketplace", name: "Home Chef Food (HCF)", description: "Sell your own recipes as an independent home chef", icon: "👩‍🍳", category: "cooking", active: true },
  { id: "subscriptions", name: "Meal Subscriptions", description: "Provide daily/weekly/monthly meal subscription plans", icon: "📅", category: "cooking", active: true },
  { id: "party-orders", name: "Party & Bulk Orders", description: "Cater for events, parties and bulk food orders", icon: "🎉", category: "cooking", active: true },
  { id: "sweets-snacks", name: "Sweets & Snacks", description: "Homemade sweets, snacks, pickles and packaged foods", icon: "🍪", category: "cooking", active: true },
  { id: "cookery-classes", name: "Cookery Classes", description: "Teach cooking classes online or in-person", icon: "📚", category: "service", active: true },
  { id: "shero-classes", name: "Shero Classes (Yoga, Fitness, Wellness)", description: "Conduct yoga, fitness, wellness or beauty classes", icon: "🧘", category: "service", active: true },
];

/* ───────────────────── Photo & Infrastructure fields ───────────────────── */
const KITCHEN_PHOTO_FIELDS = [
  "Kitchen (Front View)", "Kitchen (Cooking Area)", "Gas Stove Area",
  "Refrigerator (Inside)", "Storage / Pantry Area", "Dining / Packing Area",
];
const HOUSE_PHOTO_FIELDS = [
  "Hall / Living Room", "Bedroom", "Bathroom",
  "Outside View of House",
];

const INFRASTRUCTURE_ITEMS = [
  { key: "gasStoves", label: "No. of Gas Stoves / Burners", type: "number" },
  { key: "gasConnection", label: "Gas Connection Type", type: "select", options: ["Cylinder (LPG)", "Piped Gas", "Both"] },
  { key: "refrigerators", label: "No. of Refrigerators", type: "number" },
  { key: "hasChimney", label: "Chimney / Exhaust Fan", type: "checkbox" },
  { key: "hasOven", label: "Oven / Microwave", type: "checkbox" },
  { key: "hasMixerGrinder", label: "Mixer / Grinder / Food Processor", type: "checkbox" },
  { key: "hasWaterPurifier", label: "Water Purifier (RO/UV)", type: "checkbox" },
  { key: "helpers", label: "No. of Kitchen Helpers Available", type: "number" },
];

const SERVICE_PHOTO_FIELDS = [
  "Certificate Photo 1",
  "Certificate Photo 2",
  "Certificate Photo 3",
  "Recognition / Award Document",
  "Profile / Portfolio Photo",
];

const SERVICE_VIDEO_FIELDS = [
  "Performance Video 1",
  "Performance Video 2",
];

/* ───────────────────── Component ───────────────────── */
const PartnerEnrollment = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  // ── Form state ──
  const [form, setForm] = useState({
    // Step 0: Personal
    fullName: "", phone: "", email: "", altPhone: "",
    // Step 1: Education & Family
    education: "", occupation: "", yearsInHouse: "",
    spouseName: "", spouseOccupation: "",
    totalFamilyMembers: "", kidsCount: "", kidsAges: "",
    elderlyMembers: "", familyDescription: "",
    // Step 2: House & Location
    address: "", city: "", pincode: "", landmark: "",
    googlePinUrl: "", floor: "", houseType: "", kitchenSize: "",
    locationLat: 0, locationLng: 0,
    hasAC: false, hasRefrigerator: false, hasGas: false, hasChimneyHouse: false,
    // Step 3: Business Verticals
    selectedVerticals: [] as string[],
    // Step 4: Kitchen (cooking verticals)
    kitchenPhotos: {} as Record<string, string>,
    housePhotos: {} as Record<string, string>,
    gasStoves: "", gasConnection: "", refrigerators: "",
    hasChimney: false, hasOven: false, hasMixerGrinder: false, hasWaterPurifier: false,
    helpers: "",
    cookingExperience: "", cuisinesKnown: "",
    availableHours: "", daysPerWeek: "",
    preferredTimings: [] as string[],
    
    // Step 5: Service credentials
    servicePhotos: {} as Record<string, Record<string, string>>,
    serviceVideos: {} as Record<string, Record<string, string>>,
    serviceQualification: {} as Record<string, string>,
    serviceExperience: {} as Record<string, string>,
    serviceCertifications: {} as Record<string, string>,
    serviceDemo: "",
    serviceAvailability: "", serviceDaysPerWeek: "",
    // Step 6: Final
    whyJoin: "", hasHealthConditions: false, healthConditionDetails: "", hasPets: false, petDetails: "", isPregnant: false, sickAtHome: false, willingOwnWill: false, referralSource: "",
    agreedTerms: false,
  });

  const updateField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  // ── Derived: which conditional steps are needed ──
  const activeVerticals = BUSINESS_VERTICALS.filter(v => v.active);
  const hasCookingVertical = form.selectedVerticals.some(
    id => BUSINESS_VERTICALS.find(v => v.id === id)?.category === "cooking"
  );
  const hasServiceVertical = form.selectedVerticals.some(
    id => BUSINESS_VERTICALS.find(v => v.id === id)?.category === "service"
  );

  // ── Dynamic steps ──
  const steps = useMemo(() => {
    const base = [
      { id: "about", label: "About Shero", icon: Info },
      { id: "personal", label: "Personal Info", icon: Users },
      { id: "family", label: "Education & Family", icon: GraduationCap },
      { id: "house", label: "House & Location", icon: Home },
      { id: "verticals", label: "Choose Business", icon: Briefcase },
    ];
    if (hasCookingVertical) {
      base.push({ id: "kitchen", label: "Kitchen & Cooking", icon: UtensilsCrossed });
    }
    if (hasServiceVertical) {
      base.push({ id: "service", label: "Service Credentials", icon: Award });
    }
    base.push({ id: "final", label: "Final Submission", icon: ClipboardList });
    return base;
  }, [hasCookingVertical, hasServiceVertical]);

  const [stepIndex, setStepIndex] = useState(0);
  const currentStepId = steps[stepIndex]?.id || "personal";

  const toggleVertical = (id: string) => {
    setForm(prev => ({
      ...prev,
      selectedVerticals: prev.selectedVerticals.includes(id)
        ? prev.selectedVerticals.filter(v => v !== id)
        : [...prev.selectedVerticals, id],
    }));
  };

  const handlePhotoUpload = (field: "kitchenPhotos" | "housePhotos", label: string) => {
    setForm(prev => ({
      ...prev,
      [field]: { ...prev[field], [label]: `photo_${Date.now()}.jpg` },
    }));
    toast({ title: "Photo uploaded", description: `${label} uploaded successfully` });
  };

  const handleServiceUpload = (verticalId: string, field: "servicePhotos" | "serviceVideos", label: string, ext = "jpg") => {
    setForm(prev => ({
      ...prev,
      [field]: { ...prev[field], [verticalId]: { ...(prev[field][verticalId] || {}), [label]: `${ext === "mp4" ? "video" : "photo"}_${Date.now()}.${ext}` } },
    }));
    toast({ title: ext === "mp4" ? "Video uploaded" : "Photo uploaded", description: `${label} uploaded successfully` });
  };

  const updateServiceField = (verticalId: string, field: "serviceQualification" | "serviceExperience" | "serviceCertifications", value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: { ...prev[field], [verticalId]: value },
    }));
  };

  const [showSlotWarning, setShowSlotWarning] = useState(false);

  const getMaxSlots = (hours: string) => {
    switch (hours) {
      case "2-4": return 1;
      case "4-6": return 2;
      case "6-8": return 2;
      case "8+": return 4;
      default: return 4;
    }
  };

  const toggleTiming = (t: string) => {
    const isRemoving = form.preferredTimings.includes(t);
    if (!isRemoving) {
      const maxSlots = getMaxSlots(form.availableHours);
      if (form.preferredTimings.length >= maxSlots) {
        setShowSlotWarning(true);
        return;
      }
    }
    setForm(prev => ({
      ...prev,
      preferredTimings: prev.preferredTimings.includes(t)
        ? prev.preferredTimings.filter(x => x !== t)
        : [...prev.preferredTimings, t],
    }));
  };

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const canProceed = () => {
    const errors: string[] = [];
    switch (currentStepId) {
      case "personal":
        if (!form.fullName.trim()) errors.push("Full name is required");
        if (!form.phone.trim()) errors.push("Phone number is required");
        else if (!/^\d{10,15}$/.test(form.phone.replace(/[\s\-+]/g, ""))) errors.push("Enter a valid phone number");
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push("Enter a valid email address");
        break;
      case "family":
        if (!form.education.trim()) errors.push("Education is required");
        break;
      case "house":
        if (!form.address.trim()) errors.push("Address is required");
        if (!form.city.trim()) errors.push("City is required");
        if (!form.pincode.trim()) errors.push("Pincode is required");
        else if (!/^\d{5,6}$/.test(form.pincode.trim())) errors.push("Enter a valid pincode");
        break;
      case "verticals":
        if (form.selectedVerticals.length === 0) errors.push("Select at least one business vertical");
        break;
      case "kitchen":
        if (Object.keys(form.kitchenPhotos).length < 3) errors.push("Upload at least 3 kitchen photos");
        if (!form.floor) errors.push("Select which floor");
        if (!form.houseType) errors.push("Select house type");
        if (!form.kitchenSize) errors.push("Select kitchen size");
        if (!form.gasStoves) errors.push("Number of gas stoves is required");
        if (!form.gasConnection) errors.push("Gas connection type is required");
        if (!form.cookingExperience) errors.push("Cooking experience is required");
        if (!form.cuisinesKnown.trim()) errors.push("Cuisines known is required");
        if (!form.availableHours) errors.push("Available hours is required");
        if (!form.daysPerWeek) errors.push("Days per week is required");
        break;
      case "service": {
        const serviceVerticals = form.selectedVerticals.filter(id => BUSINESS_VERTICALS.find(v => v.id === id)?.category === "service");
        serviceVerticals.forEach(vId => {
          const vName = BUSINESS_VERTICALS.find(v => v.id === vId)?.name || vId;
          const photos = form.servicePhotos[vId] || {};
          const videos = form.serviceVideos[vId] || {};
          if (Object.keys(photos).length < 3) errors.push(`${vName}: Upload at least 3 certificate photos`);
          if (Object.keys(videos).length < 1) errors.push(`${vName}: Upload at least 1 performance video`);
          if (!form.serviceQualification[vId]?.trim()) errors.push(`${vName}: Primary qualification is required`);
          if (!form.serviceExperience[vId]) errors.push(`${vName}: Experience is required`);
        });
        break;
      }
      case "final":
        if (!form.whyJoin.trim()) errors.push("Please tell us why you want to join");
        if (!form.referralSource) errors.push("Please select how you heard about us");
        if (!form.agreedTerms) errors.push("You must agree to Terms & Conditions");
        break;
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    localStorage.setItem("shero-partner-enrollment-status", "submitted");
    toast({ title: "Application Submitted!", description: "Our team will review your application and get back to you within 2-4 working days." });
  };

  // ── Post-submission state ──
  const [postStep, setPostStep] = useState<"video" | "decision" | "think" | "reject" | "payment" | "paymentSent" | "paymentSuccess" | "paymentReminder" | "callcenter" | "done">("video");
  const [thinkDays, setThinkDays] = useState("");
  const [remindWhen, setRemindWhen] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOther, setRejectOther] = useState("");

  const REJECT_REASONS = [
    "Not sure about the time commitment",
    "Registration fee is too high",
    "Family doesn't support",
    "Kitchen is not ready",
    "Want to explore other options",
    "Health / personal reasons",
  ];

  /* ═══════════════════ POST-SUBMISSION VIEW ═══════════════════ */
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-6">
          <Card className="text-center">
            <CardContent className="pt-8 pb-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Application Submitted!</h2>
              <p className="text-muted-foreground text-sm">
                Thank you for your interest in becoming a Shero Partner. Our team will review your application
                and contact you within <span className="font-semibold text-foreground">2-4 working days</span>.
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {form.selectedVerticals.map(id => {
                  const v = BUSINESS_VERTICALS.find(bv => bv.id === id);
                  return v ? <Badge key={id} variant="secondary" className="text-xs">{v.icon} {v.name}</Badge> : null;
                })}
              </div>
              <p className="text-xs text-muted-foreground">Reference ID: <span className="font-mono font-bold">SH-{Date.now().toString().slice(-6)}</span></p>
            </CardContent>
          </Card>

          {/* Video */}
          {postStep === "video" && (
            <Card className="border-primary/20">
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-2 justify-center">
                  <PlayCircle className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-serif font-semibold text-foreground">Now, the Next Step — Watch This Video!</h3>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Watch this video to understand how Shero works — the platform, your role as a partner, payments, and everything you need to know.
                </p>
                <div className="relative w-full rounded-xl overflow-hidden bg-primary/5 border border-border flex items-center justify-center py-6">
                  <img src={sheroFamilyHappy} alt="Happy families enjoying Shero home food" className="w-full max-w-md object-contain drop-shadow-lg" loading="lazy" />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">Join the Shero family • Covers payments, order flow, support & more</p>
                <Button onClick={() => setPostStep("decision")} className="w-full bg-gradient-shero hover:opacity-90 gap-1.5 mt-2">
                  I Understand — Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Decision */}
          {postStep === "decision" && (
            <Card>
              <CardContent className="pt-6 pb-6 space-y-4">
                <h3 className="text-lg font-serif font-semibold text-foreground text-center">What would you like to do?</h3>
                <p className="text-xs text-muted-foreground text-center">Choose an option that best suits you right now</p>
                <div className="space-y-3">
                  <button onClick={() => setPostStep("payment")} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-accent bg-accent/5 hover:bg-accent/10 transition-colors text-left">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0"><CreditCard className="w-5 h-5 text-accent" /></div>
                    <div><p className="font-semibold text-sm text-foreground">I'm Ready! Pay Registration Fee</p><p className="text-[11px] text-muted-foreground">Proceed to pay and start your partner journey</p></div>
                  </button>
                  <button onClick={() => setPostStep("think")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-colors text-left">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-muted-foreground" /></div>
                    <div><p className="font-semibold text-sm text-foreground">I Need Time to Think</p><p className="text-[11px] text-muted-foreground">Tell us when to remind you</p></div>
                  </button>
                  <button onClick={() => setPostStep("callcenter")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-colors text-left">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-muted-foreground" /></div>
                    <div><p className="font-semibold text-sm text-foreground">Talk to Our Team First</p><p className="text-[11px] text-muted-foreground">Speak with a Shero representative before deciding</p></div>
                  </button>
                  <button onClick={() => setPostStep("reject")} className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-destructive/30 hover:bg-destructive/5 transition-colors text-left">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0"><XCircle className="w-5 h-5 text-muted-foreground" /></div>
                    <div><p className="font-semibold text-sm text-foreground">Not Interested Right Now</p><p className="text-[11px] text-muted-foreground">Let us know why — your feedback helps us improve</p></div>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Think */}
          {postStep === "think" && (
            <Card>
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-2 justify-center"><Clock className="w-5 h-5 text-primary" /><h3 className="text-lg font-serif font-semibold text-foreground">Take Your Time</h3></div>
                <p className="text-xs text-muted-foreground text-center">No rush! Tell us when you'd like us to follow up.</p>
                <div className="space-y-3">
                  <div className="space-y-2"><Label>How many days do you need?</Label><Select value={thinkDays} onValueChange={setThinkDays}><SelectTrigger><SelectValue placeholder="Select days" /></SelectTrigger><SelectContent><SelectItem value="1">1 day</SelectItem><SelectItem value="2">2 days</SelectItem><SelectItem value="3">3 days</SelectItem><SelectItem value="5">5 days</SelectItem><SelectItem value="7">1 week</SelectItem><SelectItem value="14">2 weeks</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Best time to remind you?</Label><Select value={remindWhen} onValueChange={setRemindWhen}><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger><SelectContent><SelectItem value="morning">Morning (9 AM – 12 PM)</SelectItem><SelectItem value="afternoon">Afternoon (12 PM – 4 PM)</SelectItem><SelectItem value="evening">Evening (4 PM – 8 PM)</SelectItem></SelectContent></Select></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setPostStep("decision")} className="flex-1 gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
                  <Button onClick={() => { toast({ title: "Reminder Set!", description: `We'll remind you in ${thinkDays} day(s).` }); setPostStep("done"); }} disabled={!thinkDays} className="flex-1 bg-gradient-shero hover:opacity-90">Set Reminder</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reject */}
          {postStep === "reject" && (
            <Card>
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-2 justify-center"><MessageCircle className="w-5 h-5 text-primary" /><h3 className="text-lg font-serif font-semibold text-foreground">We'd Love Your Feedback</h3></div>
                <p className="text-xs text-muted-foreground text-center">Please share your honest reason — it helps us improve.</p>
                <div className="space-y-2">
                  {REJECT_REASONS.map(reason => (
                    <label key={reason} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${rejectReason === reason ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                      <input type="radio" name="rejectReason" className="accent-primary" checked={rejectReason === reason} onChange={() => setRejectReason(reason)} />
                      <span className="text-sm text-foreground">{reason}</span>
                    </label>
                  ))}
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${rejectReason === "other" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                    <input type="radio" name="rejectReason" className="accent-primary" checked={rejectReason === "other"} onChange={() => setRejectReason("other")} />
                    <span className="text-sm text-foreground">Other reason</span>
                  </label>
                  {rejectReason === "other" && <Textarea placeholder="Please tell us your reason..." value={rejectOther} onChange={e => setRejectOther(e.target.value)} rows={2} className="mt-2" />}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setPostStep("decision")} className="flex-1 gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
                  <Button onClick={() => { toast({ title: "Feedback Submitted", description: "Thank you for your honesty." }); setPostStep("done"); }} disabled={!rejectReason || (rejectReason === "other" && !rejectOther)} className="flex-1">Submit Feedback</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call Center */}
          {postStep === "callcenter" && (
            <Card>
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-2 justify-center"><Phone className="w-5 h-5 text-primary" /><h3 className="text-lg font-serif font-semibold text-foreground">Talk to Our Team</h3></div>
                <p className="text-xs text-muted-foreground text-center">Our partner support team is available to answer all your questions.</p>
                <div className="bg-muted rounded-xl p-4 text-center space-y-2">
                  <p className="text-sm font-semibold text-foreground">📞 Call Us</p>
                  <a href="tel:+911800123456" className="text-lg font-bold text-primary">1800-123-456</a>
                  <p className="text-[10px] text-muted-foreground">Mon – Sat, 9 AM – 7 PM</p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-center space-y-2">
                  <p className="text-sm font-semibold text-foreground">💬 WhatsApp</p>
                  <a href="https://wa.me/911800123456" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-accent">Chat on WhatsApp</a>
                  <p className="text-[10px] text-muted-foreground">Get quick answers via chat</p>
                </div>
                <div className="border-t border-border pt-4 mt-2">
                  <p className="text-xs text-muted-foreground text-center mb-3">After your call, continue here:</p>
                  <Button onClick={() => setPostStep("payment")} className="w-full bg-gradient-shero hover:opacity-90 gap-1.5"><CreditCard className="w-4 h-4" /> Proceed to Payment</Button>
                </div>
                <Button variant="outline" onClick={() => setPostStep("decision")} className="w-full gap-1"><ArrowLeft className="w-4 h-4" /> Back to Options</Button>
              </CardContent>
            </Card>
          )}

          {/* Payment */}
          {postStep === "payment" && (
            <Card className="border-accent/30">
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-2 justify-center"><CreditCard className="w-5 h-5 text-accent" /><h3 className="text-lg font-serif font-semibold text-foreground">Registration Fee</h3></div>
                <div className="bg-muted rounded-xl p-5 text-center space-y-1">
                  <p className="text-3xl font-bold text-foreground">$999</p>
                  <p className="text-xs text-muted-foreground">One-time registration fee (inclusive of GST)</p>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5 px-2">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" /> Kitchen verification & onboarding support</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" /> Training materials & branded kit</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" /> Lifetime platform access</li>
                </ul>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground text-center">Choose payment method:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["UPI / Google Pay", "PhonePe", "Paytm", "Net Banking"].map(method => (
                      <button key={method} className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-xs font-medium text-foreground text-center">
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={() => { toast({ title: "Payment Link Sent!", description: "A payment link has been sent to your phone via SMS & WhatsApp." }); setPostStep("paymentSent"); }} className="w-full bg-gradient-shero hover:opacity-90 gap-1.5">Send Payment Link <ArrowRight className="w-4 h-4" /></Button>
                <Button variant="outline" onClick={() => setPostStep("decision")} className="w-full gap-1"><ArrowLeft className="w-4 h-4" /> Back to Options</Button>
              </CardContent>
            </Card>
          )}

          {/* Payment Sent - Waiting */}
          {postStep === "paymentSent" && (
            <Card className="border-primary/20">
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-2 justify-center"><Clock className="w-5 h-5 text-primary" /><h3 className="text-lg font-serif font-semibold text-foreground">Payment Link Sent!</h3></div>
                <p className="text-xs text-muted-foreground text-center">
                  A payment link of <span className="font-bold text-foreground">$999</span> has been sent to <span className="font-semibold text-foreground">{form.phone || "your phone"}</span> via SMS & WhatsApp.
                </p>
                <div className="bg-muted/50 rounded-xl p-4 text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">Have you completed the payment?</p>
                </div>
                <div className="space-y-2">
                  <Button onClick={() => setPostStep("paymentSuccess")} className="w-full bg-gradient-shero hover:opacity-90 gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Yes, I've Paid
                  </Button>
                  <Button variant="outline" onClick={() => setPostStep("paymentReminder")} className="w-full gap-1.5">
                    <Clock className="w-4 h-4" /> Not Yet, Remind Me Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Success - Receipt */}
          {postStep === "paymentSuccess" && (
            <Card className="border-accent/30">
              <CardContent className="pt-8 pb-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground text-center">Payment Received — Thank You! 🎉</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Your registration fee has been successfully processed. Welcome to the Shero family!
                </p>

                {/* Receipt */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border">
                  <p className="text-xs font-bold text-foreground text-center uppercase tracking-wider">Payment Receipt</p>
                  <div className="h-px bg-border" />
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium text-foreground">{form.fullName || "Partner"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium text-foreground">{form.phone || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-foreground">$999</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Transaction ID</span><span className="font-mono font-medium text-foreground">TXN-{Date.now().toString().slice(-8)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-bold text-accent">✅ Paid</span></div>
                  </div>
                  <div className="h-px bg-border" />
                  <p className="text-[10px] text-muted-foreground text-center">A copy of this receipt has been sent to your WhatsApp.</p>
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center space-y-1">
                  <p className="text-sm font-semibold text-foreground">What happens next?</p>
                  <p className="text-xs text-muted-foreground">Our team will verify your kitchen & onboard you within <span className="font-semibold text-foreground">2-4 working days</span>. You'll receive updates on WhatsApp.</p>
                </div>

                <Button onClick={() => window.location.href = "/"} className="w-full bg-gradient-shero hover:opacity-90 gap-1.5">
                  Go to Home <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payment Reminder */}
          {postStep === "paymentReminder" && (
            <Card>
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-2 justify-center"><Clock className="w-5 h-5 text-primary" /><h3 className="text-lg font-serif font-semibold text-foreground">No Worries!</h3></div>
                <p className="text-sm text-muted-foreground text-center">
                  We shall remind you after some time. Thank you! 🙏
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  A reminder with the payment link will be sent to your WhatsApp at <span className="font-semibold text-foreground">{form.phone || "your number"}</span>. You can pay directly from there or come back here anytime.
                </p>

                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-medium text-foreground">When should we remind you?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["Tomorrow", "In 3 days", "In a week"].map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          toast({ title: "Reminder Scheduled! 📲", description: `We'll send a WhatsApp reminder ${option.toLowerCase()} with your payment link.` });
                          setPostStep("done");
                        }}
                        className="p-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-xs font-medium text-foreground"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPostStep("paymentSent")} className="flex-1 gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
                  <Button onClick={() => setPostStep("payment")} className="flex-1 bg-gradient-shero hover:opacity-90 gap-1.5"><CreditCard className="w-4 h-4" /> Pay Now</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Done */}
          {postStep === "done" && (
            <Card className="text-center">
              <CardContent className="pt-6 pb-6 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-accent mx-auto" />
                <h3 className="text-lg font-serif font-semibold text-foreground">Thank You!</h3>
                <p className="text-sm text-muted-foreground">Your response has been recorded. We'll be in touch soon.</p>
                <Button onClick={() => window.location.href = "/"} variant="outline" className="mt-2">Back to Home</Button>
              </CardContent>
            </Card>
          )}

          {postStep === "video" && (
            <div className="text-center pb-8">
              <Button onClick={() => window.location.href = "/"} variant="outline">Back to Home</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════ FORM WIZARD ═══════════════════ */
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-shero text-primary-foreground py-8 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <img src={sheroLogo} alt="Shero" className="h-10 mx-auto brightness-0 invert" />
          <img src={mascotWelcome} alt="" className="w-16 h-16 object-contain mx-auto drop-shadow-lg" />
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Become a Shero Partner</h1>
          <p className="text-lg font-bold tracking-wide uppercase">Shero Partner Enrollment Application</p>
          <p className="text-sm opacity-90">Join our community and turn your skills into a thriving business</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6 overflow-x-auto gap-1">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <button key={s.id} onClick={() => i < stepIndex && setStepIndex(i)} className={`flex flex-col items-center gap-1 min-w-[56px] transition-all ${isActive ? "scale-105" : ""}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isDone ? "bg-accent text-accent-foreground" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[9px] font-medium leading-tight text-center ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="w-full h-1.5 bg-muted rounded-full mb-6">
          <div className="h-full bg-gradient-shero rounded-full transition-all duration-500" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
        </div>

        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-serif">{steps[stepIndex].label}</CardTitle>
            <CardDescription className="text-xs">
              {currentStepId === "about" && "Learn what Shero is and how you can benefit"}
              {currentStepId === "personal" && "Tell us about yourself"}
              {currentStepId === "family" && "Your education background and family details"}
              {currentStepId === "house" && "Your house and exact location details"}
              {currentStepId === "verticals" && "Select the business verticals you'd like to apply for"}
              {currentStepId === "kitchen" && "Upload kitchen/house photos, infrastructure details & cooking experience"}
              {currentStepId === "service" && "Upload certificates, qualifications & demo content for your services"}
              {currentStepId === "final" && "A few final questions before submission"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* ──── STEP: About Shero ──── */}
            {currentStepId === "about" && (
              <>
                {/* Promo Video */}
                <div className="rounded-2xl overflow-hidden shadow-shero bg-primary/5 flex items-center justify-center py-4">
                  <img src={sheroFamilyHappy} alt="Happy family enjoying home-cooked food" className="w-full max-w-sm object-contain drop-shadow-md" loading="lazy" />
                </div>

                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <h3 className="text-base font-serif font-bold text-foreground">Welcome to Shero! 🎉</h3>
                  <p>
                    <strong className="text-foreground">Shero Home Food</strong> is India's first platform that empowers home chefs — especially women — to build a sustainable food business from their own kitchen.
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { emoji: "🏠", title: "Cook from Home", desc: "Use your existing kitchen. No shop or investment needed." },
                      { emoji: "📅", title: "Flexible Schedule", desc: "Choose your own hours, days, and menu — you're in control." },
                      { emoji: "💰", title: "Earn Weekly", desc: "Get paid directly to your bank account every week." },
                      { emoji: "📦", title: "We Handle Delivery", desc: "Focus on cooking. We take care of packaging, orders & delivery." },
                      { emoji: "📚", title: "Training & Support", desc: "Free training on food safety, packaging, and growing your business." },
                      { emoji: "🎯", title: "Multiple Revenue Streams", desc: "Daily meals, subscriptions, party orders, sweets, classes & more." },
                    ].map(item => (
                      <div key={item.title} className="flex items-start gap-3 bg-muted/50 rounded-xl p-3">
                        <span className="text-xl">{item.emoji}</span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{item.title}</p>
                          <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center space-y-1">
                    <p className="text-sm font-semibold text-foreground">Ready to start your journey?</p>
                    <p className="text-xs text-muted-foreground">Fill out the application form in the next steps. It takes about 10-15 minutes.</p>
                  </div>
                </div>
              </>
            )}

            {/* ──── STEP: Personal Info ──── */}
            {currentStepId === "personal" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" placeholder="Enter your full name" value={form.fullName} onChange={e => updateField("fullName", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label htmlFor="phone">Phone Number *</Label><Input id="phone" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => updateField("phone", e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="altPhone">Alternate Phone</Label><Input id="altPhone" placeholder="+91 XXXXX XXXXX" value={form.altPhone} onChange={e => updateField("altPhone", e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={e => updateField("email", e.target.value)} /></div>
              </>
            )}

            {/* ──── STEP: Education & Family ──── */}
            {currentStepId === "family" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="education">Highest Education *</Label>
                  <Select value={form.education} onValueChange={v => updateField("education", v)}>
                    <SelectTrigger><SelectValue placeholder="Select education" /></SelectTrigger>
                    <SelectContent><SelectItem value="10th">10th Pass</SelectItem><SelectItem value="12th">12th Pass</SelectItem><SelectItem value="graduate">Graduate</SelectItem><SelectItem value="postgraduate">Post Graduate</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="occupation">Current Occupation</Label><Input id="occupation" placeholder="Homemaker, Teacher, etc." value={form.occupation} onChange={e => updateField("occupation", e.target.value)} /></div>
                <div className="border-t border-border pt-4 mt-4"><h4 className="text-sm font-semibold text-foreground mb-3">Family Details</h4></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label htmlFor="spouseName">Spouse Name</Label><Input id="spouseName" placeholder="Name" value={form.spouseName} onChange={e => updateField("spouseName", e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="spouseOccupation">Spouse Occupation</Label><Input id="spouseOccupation" placeholder="Occupation" value={form.spouseOccupation} onChange={e => updateField("spouseOccupation", e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label htmlFor="totalFamilyMembers">Family Members</Label><Input id="totalFamilyMembers" type="number" placeholder="4" value={form.totalFamilyMembers} onChange={e => updateField("totalFamilyMembers", e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="kidsCount">No. of Kids</Label><Input id="kidsCount" type="number" placeholder="2" value={form.kidsCount} onChange={e => updateField("kidsCount", e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="elderlyMembers">Elderly</Label><Input id="elderlyMembers" type="number" placeholder="0" value={form.elderlyMembers} onChange={e => updateField("elderlyMembers", e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="kidsAges">Kids Ages (if any)</Label><Input id="kidsAges" placeholder="e.g. 5, 12" value={form.kidsAges} onChange={e => updateField("kidsAges", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="yearsInHouse">How long in current house?</Label><Input id="yearsInHouse" placeholder="e.g. 5 years" value={form.yearsInHouse} onChange={e => updateField("yearsInHouse", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="familyDescription">Brief about your family</Label><Textarea id="familyDescription" placeholder="Tell us about your family..." value={form.familyDescription} onChange={e => updateField("familyDescription", e.target.value)} rows={3} /></div>
              </>
            )}

            {/* ──── STEP: House & Location ──── */}
            {currentStepId === "house" && (
              <LocationPicker
                address={form.address}
                city={form.city}
                pincode={form.pincode}
                landmark={form.landmark}
                googlePinUrl={form.googlePinUrl}
                lat={form.locationLat || undefined}
                lng={form.locationLng || undefined}
                onUpdate={(fields) => {
                  Object.entries(fields).forEach(([key, value]) => updateField(key, value));
                }}
              />
            )}

            {/* ──── STEP: Choose Business Verticals ──── */}
            {currentStepId === "verticals" && (
              <>
                <p className="text-xs text-muted-foreground">Select one or more business verticals you'd like to apply for. Only active verticals approved by the platform are shown.</p>

                {/* Cooking Verticals */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-primary" /> Food & Kitchen Verticals</h4>
                  <div className="grid gap-2">
                    {activeVerticals.filter(v => v.category === "cooking").map(v => {
                      const selected = form.selectedVerticals.includes(v.id);
                      return (
                        <button key={v.id} onClick={() => toggleVertical(v.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/50"}`}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${selected ? "bg-primary/15" : "bg-muted"}`}>{v.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{v.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{v.description}</p>
                          </div>
                          {selected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Service Verticals */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Service & Classes Verticals</h4>
                  <div className="grid gap-2">
                    {activeVerticals.filter(v => v.category === "service").map(v => {
                      const selected = form.selectedVerticals.includes(v.id);
                      return (
                        <button key={v.id} onClick={() => toggleVertical(v.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${selected ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:border-accent/30 hover:bg-muted/50"}`}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${selected ? "bg-accent/15" : "bg-muted"}`}>{v.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{v.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{v.description}</p>
                          </div>
                          {selected && <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {form.selectedVerticals.length > 0 && (
                  <div className="bg-muted/50 rounded-xl p-3 mt-2">
                    <p className="text-xs font-medium text-foreground mb-1.5">Selected ({form.selectedVerticals.length}):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.selectedVerticals.map(id => {
                        const v = BUSINESS_VERTICALS.find(bv => bv.id === id);
                        return v ? <Badge key={id} variant="secondary" className="text-xs gap-1 text-primary font-semibold">{v.icon} {v.name}</Badge> : null;
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ──── STEP: Kitchen & Cooking (conditional) ──── */}
            {currentStepId === "kitchen" && (
              <>
                {/* Selected cooking verticals summary */}
                <div className="bg-primary/5 rounded-lg p-3 mb-2">
                  <p className="text-xs font-medium text-foreground mb-1">Applying for:</p>
                  <div className="flex flex-wrap gap-1">
                    {form.selectedVerticals.filter(id => BUSINESS_VERTICALS.find(v => v.id === id)?.category === "cooking").map(id => {
                      const v = BUSINESS_VERTICALS.find(bv => bv.id === id);
                      return v ? <Badge key={id} className="text-[10px]">{v.icon} {v.name}</Badge> : null;
                    })}
                  </div>
                </div>

                {/* House Details & Kitchen Size */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Home className="w-4 h-4" /> House & Kitchen Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label htmlFor="floor">Which Floor?</Label><Select value={form.floor} onValueChange={v => updateField("floor", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="ground">Ground Floor</SelectItem><SelectItem value="1">1st Floor</SelectItem><SelectItem value="2">2nd Floor</SelectItem><SelectItem value="3">3rd Floor</SelectItem><SelectItem value="4+">4th Floor+</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="houseType">House Type</Label><Select value={form.houseType} onValueChange={v => updateField("houseType", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="independent">Independent House</SelectItem><SelectItem value="apartment">Apartment</SelectItem><SelectItem value="villa">Villa</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="kitchenSize">Kitchen Size (approx)</Label><Select value={form.kitchenSize} onValueChange={v => updateField("kitchenSize", v)}><SelectTrigger><SelectValue placeholder="Select kitchen size" /></SelectTrigger><SelectContent><SelectItem value="small">Small (under 50 sq ft)</SelectItem><SelectItem value="medium">Medium (50-100 sq ft)</SelectItem><SelectItem value="large">Large (100+ sq ft)</SelectItem></SelectContent></Select></div>
                </div>

                {/* Kitchen Photos */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Camera className="w-4 h-4" /> Kitchen Photos *</h4>
                  <p className="text-[10px] text-muted-foreground">Upload clear photos of your kitchen. Minimum 3 required.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {KITCHEN_PHOTO_FIELDS.map(label => {
                      const uploaded = !!form.kitchenPhotos[label];
                      return (
                        <button key={label} onClick={() => handlePhotoUpload("kitchenPhotos", label)} className={`relative border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 min-h-[80px] transition-colors ${uploaded ? "border-accent bg-accent/5" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}>
                          {uploaded ? <CheckCircle2 className="w-5 h-5 text-accent" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
                          <span className="text-[10px] text-center font-medium text-foreground leading-tight">{label}</span>
                          {uploaded && <Badge variant="secondary" className="text-[8px] absolute top-1 right-1">✓</Badge>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* House Photos */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Home className="w-4 h-4" /> House Photos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {HOUSE_PHOTO_FIELDS.map(label => {
                      const uploaded = !!form.housePhotos[label];
                      return (
                        <button key={label} onClick={() => handlePhotoUpload("housePhotos", label)} className={`relative border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 min-h-[80px] transition-colors ${uploaded ? "border-accent bg-accent/5" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}>
                          {uploaded ? <CheckCircle2 className="w-5 h-5 text-accent" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
                          <span className="text-[10px] text-center font-medium text-foreground leading-tight">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Infrastructure */}
                <div className="border-t border-border pt-4 mt-2 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Kitchen Infrastructure</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {INFRASTRUCTURE_ITEMS.map(item => {
                      if (item.type === "number") {
                        return (
                          <div key={item.key} className="space-y-1.5">
                            <Label className="text-xs">{item.label}</Label>
                            <Input type="number" placeholder="0" value={(form as any)[item.key] || ""} onChange={e => updateField(item.key, e.target.value)} />
                          </div>
                        );
                      }
                      if (item.type === "select" && item.options) {
                        return (
                          <div key={item.key} className="space-y-1.5">
                            <Label className="text-xs">{item.label}</Label>
                            <Select value={(form as any)[item.key] || ""} onValueChange={v => updateField(item.key, v)}>
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{item.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        );
                      }
                      if (item.type === "checkbox") {
                        return (
                          <label key={item.key} className="flex items-center gap-2 cursor-pointer col-span-1">
                            <Checkbox checked={(form as any)[item.key] || false} onCheckedChange={v => updateField(item.key, v)} />
                            <span className="text-xs text-foreground">{item.label}</span>
                          </label>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                {/* Cooking Experience */}
                <div className="border-t border-border pt-4 mt-2 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Cooking Experience & Availability</h4>
                  <div className="space-y-2">
                    <Label>Cooking Experience *</Label>
                    <Select value={form.cookingExperience} onValueChange={v => updateField("cookingExperience", v)}>
                      <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                      <SelectContent><SelectItem value="1-3">1-3 years</SelectItem><SelectItem value="3-5">3-5 years</SelectItem><SelectItem value="5-10">5-10 years</SelectItem><SelectItem value="10+">10+ years</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Cuisines You Can Cook</Label><Textarea placeholder="e.g. South Indian, North Indian, Hyderabadi, Chinese..." value={form.cuisinesKnown} onChange={e => updateField("cuisinesKnown", e.target.value)} rows={2} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Available Hours/Day</Label><Select value={form.availableHours} onValueChange={v => updateField("availableHours", v)}><SelectTrigger><SelectValue placeholder="Hours" /></SelectTrigger><SelectContent><SelectItem value="2-4">2-4 hours</SelectItem><SelectItem value="4-6">4-6 hours</SelectItem><SelectItem value="6-8">6-8 hours</SelectItem><SelectItem value="8+">8+ hours</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Days Per Week</Label><Select value={form.daysPerWeek} onValueChange={v => updateField("daysPerWeek", v)}><SelectTrigger><SelectValue placeholder="Days" /></SelectTrigger><SelectContent><SelectItem value="3">3 days</SelectItem><SelectItem value="4">4 days</SelectItem><SelectItem value="5">5 days</SelectItem><SelectItem value="6">6 days</SelectItem><SelectItem value="7">7 days</SelectItem></SelectContent></Select></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Timings</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Morning (6-10 AM)", "Lunch (10 AM-2 PM)", "Evening (4-7 PM)", "Dinner (7-10 PM)"].map(t => (
                        <button key={t} onClick={() => toggleTiming(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.preferredTimings.includes(t) ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/30"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>

              </>
            )}

            {/* ──── STEP: Service Credentials (conditional) ──── */}
            {currentStepId === "service" && (
              <>
                <div className="bg-accent/5 rounded-lg p-3 mb-2">
                  <p className="text-xs font-medium text-foreground mb-1">Applying for:</p>
                  <div className="flex flex-wrap gap-1">
                    {form.selectedVerticals.filter(id => BUSINESS_VERTICALS.find(v => v.id === id)?.category === "service").map(id => {
                      const v = BUSINESS_VERTICALS.find(bv => bv.id === id);
                      return v ? <Badge key={id} variant="secondary" className="text-[10px]">{v.icon} {v.name}</Badge> : null;
                    })}
                  </div>
                </div>

                {/* Per-vertical credential templates */}
                {form.selectedVerticals.filter(id => BUSINESS_VERTICALS.find(v => v.id === id)?.category === "service").map(verticalId => {
                  const vertical = BUSINESS_VERTICALS.find(v => v.id === verticalId)!;
                  const photos = form.servicePhotos[verticalId] || {};
                  const videos = form.serviceVideos[verticalId] || {};
                  return (
                    <div key={verticalId} className="space-y-4 border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{vertical.icon}</span>
                        <h4 className="text-sm font-bold text-foreground">{vertical.name}</h4>
                      </div>

                      {/* Qualifications */}
                      <div className="space-y-2">
                        <Label className="text-xs">Primary Qualification / Degree *</Label>
                        <Input placeholder={`e.g. Certified ${vertical.name} Instructor`} value={form.serviceQualification[verticalId] || ""} onChange={e => updateServiceField(verticalId, "serviceQualification", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Other Certifications</Label>
                        <Textarea placeholder="List certifications, training, awards..." value={form.serviceCertifications[verticalId] || ""} onChange={e => updateServiceField(verticalId, "serviceCertifications", e.target.value)} rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Experience</Label>
                        <Select value={form.serviceExperience[verticalId] || ""} onValueChange={v => updateServiceField(verticalId, "serviceExperience", v)}>
                          <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                          <SelectContent><SelectItem value="<1">Less than 1 year</SelectItem><SelectItem value="1-3">1-3 years</SelectItem><SelectItem value="3-5">3-5 years</SelectItem><SelectItem value="5-10">5-10 years</SelectItem><SelectItem value="10+">10+ years</SelectItem></SelectContent>
                        </Select>
                      </div>

                      {/* Certificate Photos (3-5) */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Certificates & Recognition (3-5 photos) *</h5>
                        <p className="text-[10px] text-muted-foreground">Upload certificates, recognition documents to validate eligibility.</p>
                        <div className="grid grid-cols-3 gap-2">
                          {SERVICE_PHOTO_FIELDS.map(label => {
                            const uploaded = !!photos[label];
                            return (
                              <button key={label} onClick={() => handleServiceUpload(verticalId, "servicePhotos", label)} className={`relative border-2 border-dashed rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 min-h-[72px] transition-colors ${uploaded ? "border-accent bg-accent/5" : "border-border hover:border-accent/40 hover:bg-muted/50"}`}>
                                {uploaded ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Upload className="w-3.5 h-3.5 text-muted-foreground" />}
                                <span className="text-[9px] text-center font-medium text-foreground leading-tight">{label}</span>
                                {uploaded && <Badge variant="secondary" className="text-[7px] absolute top-0.5 right-0.5">✓</Badge>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Performance Videos (1-2) */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Performance Videos (1-2) *</h5>
                        <p className="text-[10px] text-muted-foreground">Upload videos showing past performance to help admin evaluate your skills.</p>
                        <div className="grid grid-cols-2 gap-2">
                          {SERVICE_VIDEO_FIELDS.map(label => {
                            const uploaded = !!videos[label];
                            return (
                              <button key={label} onClick={() => handleServiceUpload(verticalId, "serviceVideos", label, "mp4")} className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 min-h-[80px] transition-colors ${uploaded ? "border-accent bg-accent/5" : "border-border hover:border-accent/40 hover:bg-muted/50"}`}>
                                {uploaded ? <CheckCircle2 className="w-5 h-5 text-accent" /> : <Video className="w-5 h-5 text-muted-foreground" />}
                                <span className="text-[10px] text-center font-medium text-foreground leading-tight">{label}</span>
                                {uploaded && <Badge variant="secondary" className="text-[7px] absolute top-0.5 right-0.5">✓</Badge>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Availability */}
                <div className="border-t border-border pt-4 mt-2 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Service Availability</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Available Hours/Day</Label><Select value={form.serviceAvailability} onValueChange={v => updateField("serviceAvailability", v)}><SelectTrigger><SelectValue placeholder="Hours" /></SelectTrigger><SelectContent><SelectItem value="1-2">1-2 hours</SelectItem><SelectItem value="2-4">2-4 hours</SelectItem><SelectItem value="4-6">4-6 hours</SelectItem><SelectItem value="6+">6+ hours</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Days Per Week</Label><Select value={form.serviceDaysPerWeek} onValueChange={v => updateField("serviceDaysPerWeek", v)}><SelectTrigger><SelectValue placeholder="Days" /></SelectTrigger><SelectContent><SelectItem value="2">2 days</SelectItem><SelectItem value="3">3 days</SelectItem><SelectItem value="4">4 days</SelectItem><SelectItem value="5">5 days</SelectItem><SelectItem value="6">6 days</SelectItem><SelectItem value="7">7 days</SelectItem></SelectContent></Select></div>
                  </div>
                </div>
              </>
            )}

            {/* ──── STEP: Final Submission ──── */}
            {currentStepId === "final" && (
              <>
                <div className="space-y-2"><Label htmlFor="whyJoin">Why do you want to join Shero?</Label><Textarea id="whyJoin" placeholder="Tell us your motivation..." value={form.whyJoin} onChange={e => updateField("whyJoin", e.target.value)} rows={3} /></div>
                <div className="space-y-4">
                  {[
                    { key: "hasHealthConditions", label: "Do you have any health conditions?" },
                    { key: "hasPets", label: "Do you have any pets?" },
                    { key: "isPregnant", label: "Are you pregnant or expecting?" },
                    { key: "sickAtHome", label: "Anyone sick at home for a long time?" },
                    { key: "willingOwnWill", label: "I am willing to take up this business at my own will" },
                  ].map(item => (
                    <div key={item.key} className="space-y-2">
                      <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                        <Label className="text-sm font-medium leading-snug">{item.label}</Label>
                        <div className="flex items-center gap-4 mt-1">
                          <button
                            type="button"
                            onClick={() => updateField(item.key, true)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              form[item.key as keyof typeof form] === true
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-border hover:bg-muted"
                            }`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateField(item.key, false);
                              if (item.key === "hasHealthConditions") updateField("healthConditionDetails", "");
                              if (item.key === "hasPets") updateField("petDetails", "");
                            }}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              form[item.key as keyof typeof form] === false
                                ? "bg-destructive text-destructive-foreground border-destructive"
                                : "bg-background text-foreground border-border hover:bg-muted"
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                      {item.key === "hasHealthConditions" && form.hasHealthConditions === true && (
                        <Textarea
                          placeholder="Please describe your health condition(s)..."
                          value={form.healthConditionDetails || ""}
                          onChange={e => updateField("healthConditionDetails", e.target.value)}
                          rows={3}
                          className="ml-2"
                        />
                      )}
                      {item.key === "hasPets" && form.hasPets === true && (
                        <Textarea
                          placeholder="Please describe your pets (type, number, etc.)..."
                          value={form.petDetails || ""}
                          onChange={e => updateField("petDetails", e.target.value)}
                          rows={3}
                          className="ml-2"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referralSource">How did you hear about us?</Label>
                  <Select value={form.referralSource} onValueChange={v => updateField("referralSource", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="social">Social Media</SelectItem><SelectItem value="friend">Friend / Family</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="newspaper">Newspaper</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                </div>

                {/* Summary of selected verticals */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Your Application Summary</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.selectedVerticals.map(id => {
                      const v = BUSINESS_VERTICALS.find(bv => bv.id === id);
                      return v ? <Badge key={id} variant="secondary" className="text-xs gap-1">{v.icon} {v.name}</Badge> : null;
                    })}
                  </div>
                  {hasCookingVertical && <p className="text-[10px] text-muted-foreground">✓ Kitchen photos & cooking details provided</p>}
                  {hasServiceVertical && <p className="text-[10px] text-muted-foreground">✓ Service credentials & demo uploaded</p>}
                </div>

                <div className="border-t border-border pt-4 mt-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <Checkbox checked={form.agreedTerms} onCheckedChange={v => updateField("agreedTerms", v)} className="mt-0.5" />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I confirm that all information provided is accurate. I agree to Shero's <span className="text-primary underline">Terms & Conditions</span> and <span className="text-primary underline">Partner Guidelines</span>. *
                    </span>
                  </label>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="mt-3 bg-destructive/10 border border-destructive/30 rounded-lg p-3 space-y-1">
            {validationErrors.map((err, i) => (
              <p key={i} className="text-xs text-destructive flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 shrink-0" /> {err}
              </p>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pb-8">
          {stepIndex === 0 ? (
            <Button variant="outline" onClick={() => window.location.href = "/"} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <Button variant="outline" onClick={() => { setValidationErrors([]); setStepIndex(s => s - 1); }} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          )}
          {stepIndex < steps.length - 1 ? (
            <Button onClick={() => { if (canProceed()) { setStepIndex(s => s + 1); } }} className="gap-1.5 bg-gradient-shero hover:opacity-90">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => { if (canProceed()) handleSubmit(); }} className="gap-1.5 bg-gradient-shero hover:opacity-90">
              Submit Application <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Slot limit warning popup */}
      <AlertDialog open={showSlotWarning} onOpenChange={setShowSlotWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Too many time slots selected</AlertDialogTitle>
            <AlertDialogDescription>
              Based on your available hours ({form.availableHours || "not set"} hours/day), you can select a maximum of {getMaxSlots(form.availableHours)} timing slot{getMaxSlots(form.availableHours) > 1 ? "s" : ""}. Please increase your available hours or deselect an existing slot first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK, Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PartnerEnrollment;
