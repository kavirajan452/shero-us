import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User, MapPin, Bell, Globe, Trash2, ChevronRight, Plus, Save, Pencil, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface CustomerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Section = "main" | "profile" | "addresses" | "notifications" | "language";

const savedAddresses = [
  { id: 1, label: "Home", address: "12, 3rd Cross St, Anna Nagar, Chennai 600040", isDefault: true },
  { id: 2, label: "Office", address: "45, Cathedral Rd, Gopalapuram, Chennai 600086", isDefault: false },
];

const languages = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
];

const CustomerSettings = ({ open, onOpenChange }: CustomerSettingsProps) => {
  const [section, setSection] = useState<Section>("main");
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 98765 43210",
  });

  // OTP verification state
  const [otpDialog, setOtpDialog] = useState<{ field: "email" | "phone"; newValue: string } | null>(null);
  const [newFieldValue, setNewFieldValue] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [changingField, setChangingField] = useState<"email" | "phone" | null>(null);
  const generatedOtp = useRef(""); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // OTP countdown
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => setOtpTimer(t => t - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [otpTimer]);

  const startOtpFlow = (field: "email" | "phone") => {
    setChangingField(field);
    setNewFieldValue("");
    setOtpValue("");
    setOtpSent(false);
    setOtpVerified(false);
    setOtpDialog({ field, newValue: "" });
  };

  const sendOtp = () => {
    if (!newFieldValue.trim()) {
      toast({ title: "Please enter a value", variant: "destructive" });
      return;
    }
    if (changingField === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newFieldValue)) {
      toast({ title: "Invalid email address", variant: "destructive" });
      return;
    }
    if (changingField === "phone" && !/^\+?\d{10,15}$/.test(newFieldValue.replace(/\s/g, ""))) {
      toast({ title: "Invalid phone number", variant: "destructive" });
      return;
    }
    // Generate a mock OTP
    generatedOtp.current = String(Math.floor(100000 + Math.random() * 900000));
    setOtpSent(true);
    setOtpTimer(30);
    toast({ title: `OTP sent to ${newFieldValue}`, description: `Demo OTP: ${generatedOtp.current}` });
  };

  const verifyOtp = () => {
    if (otpValue === generatedOtp.current) {
      setOtpVerified(true);
      if (changingField === "email") {
        setProfileForm(p => ({ ...p, email: newFieldValue }));
      } else if (changingField === "phone") {
        setProfileForm(p => ({ ...p, phone: newFieldValue }));
      }
      toast({ title: "✅ Verified successfully!", description: `${changingField === "email" ? "Email" : "Phone"} updated.` });
      setTimeout(() => {
        setOtpDialog(null);
        setChangingField(null);
      }, 1000);
    } else {
      toast({ title: "❌ Invalid OTP", description: "Please check and try again.", variant: "destructive" });
    }
  };

  const resendOtp = () => {
    generatedOtp.current = String(Math.floor(100000 + Math.random() * 900000));
    setOtpValue("");
    setOtpTimer(30);
    toast({ title: `OTP resent`, description: `Demo OTP: ${generatedOtp.current}` });
  };

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    subscriptionReminders: true,
    walletAlerts: false,
  });

  const [selectedLang, setSelectedLang] = useState("en");

  const handleSaveProfile = () => {
    toast({ title: "✅ Profile Updated", description: "Your changes have been saved." });
    setSection("main");
  };

  const handleSaveNotifications = () => {
    toast({ title: "✅ Notification Preferences Saved" });
    setSection("main");
  };

  const handleSaveLanguage = () => {
    toast({ title: "✅ Language Updated" });
    setSection("main");
  };

  const handleDeleteAccount = () => {
    toast({ title: "⚠️ Account Deletion Requested", description: "Our team will contact you within 24 hours to process this.", variant: "destructive" });
  };

  const renderMain = () => (
    <div className="space-y-1">
      <button onClick={() => setSection("profile")} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Edit Profile</p>
            <p className="text-xs text-muted-foreground">Name, email, phone</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      <button onClick={() => setSection("addresses")} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Manage Addresses</p>
            <p className="text-xs text-muted-foreground">{savedAddresses.length} saved addresses</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      <button onClick={() => setSection("notifications")} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">Order updates, promos, alerts</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      <button onClick={() => setSection("language")} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Language</p>
            <p className="text-xs text-muted-foreground">{languages.find(l => l.code === selectedLang)?.label}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>

      <Separator className="my-3" />

      <button onClick={handleDeleteAccount} className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-destructive/10 transition-colors">
        <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
          <Trash2 className="w-4 h-4 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">Delete Account</p>
      </button>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-5">
      <button onClick={() => setSection("main")} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-medium">Full Name</Label>
          <Input id="name" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
        </div>

        {/* Email — disabled with change icon */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-medium">Email</Label>
          <div className="relative">
            <Input id="email" type="email" value={profileForm.email} disabled className="pr-10 bg-muted/50 text-foreground" />
            <button
              onClick={() => startOtpFlow("email")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-secondary transition-colors"
              title="Change email"
            >
              <Pencil className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">Requires OTP verification to change</p>
        </div>

        {/* Phone — disabled with change icon */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs font-medium">Phone</Label>
          <div className="relative">
            <Input id="phone" value={profileForm.phone} disabled className="pr-10 bg-muted/50 text-foreground" />
            <button
              onClick={() => startOtpFlow("phone")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-secondary transition-colors"
              title="Change phone"
            >
              <Pencil className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">Requires OTP verification to change</p>
        </div>
      </div>
      <Button onClick={handleSaveProfile} className="w-full gap-2">
        <Save className="w-4 h-4" /> Save Changes
      </Button>
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-5">
      <button onClick={() => setSection("main")} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
      <div className="space-y-3">
        {savedAddresses.map(addr => (
          <div key={addr.id} className="p-3.5 rounded-xl border border-border bg-secondary/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-foreground">{addr.label}</span>
              {addr.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Default</span>}
            </div>
            <p className="text-xs text-muted-foreground">{addr.address}</p>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full gap-2 text-sm">
        <Plus className="w-4 h-4" /> Add New Address
      </Button>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-5">
      <button onClick={() => setSection("main")} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
      <div className="space-y-4">
        {([
          { key: "orderUpdates" as const, label: "Order Updates", desc: "Status changes, delivery alerts" },
          { key: "promotions" as const, label: "Promotions & Offers", desc: "Discounts, new chef launches" },
          { key: "subscriptionReminders" as const, label: "Subscription Reminders", desc: "Renewal, meal plan alerts" },
          { key: "walletAlerts" as const, label: "Wallet Alerts", desc: "Credit added, low balance" },
        ]).map(item => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={notifications[item.key]}
              onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}
            />
          </div>
        ))}
      </div>
      <Button onClick={handleSaveNotifications} className="w-full gap-2">
        <Save className="w-4 h-4" /> Save Preferences
      </Button>
    </div>
  );

  const renderLanguage = () => (
    <div className="space-y-5">
      <button onClick={() => setSection("main")} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
      <div className="space-y-2">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => setSelectedLang(lang.code)}
            className={`w-full text-left p-3 rounded-xl border transition-colors text-sm ${selectedLang === lang.code ? "border-primary bg-primary/5 font-medium text-foreground" : "border-border hover:bg-secondary text-muted-foreground"}`}
          >
            {lang.label}
          </button>
        ))}
      </div>
      <Button onClick={handleSaveLanguage} className="w-full gap-2">
        <Save className="w-4 h-4" /> Save Language
      </Button>
    </div>
  );

  const titles: Record<Section, string> = {
    main: "Settings",
    profile: "Edit Profile",
    addresses: "Manage Addresses",
    notifications: "Notifications",
    language: "Language",
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSection("main"); }}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-serif">{titles[section]}</SheetTitle>
          </SheetHeader>
          {section === "main" && renderMain()}
          {section === "profile" && renderProfile()}
          {section === "addresses" && renderAddresses()}
          {section === "notifications" && renderNotifications()}
          {section === "language" && renderLanguage()}
        </SheetContent>
      </Sheet>

      {/* OTP Verification Dialog */}
      <Dialog open={!!otpDialog} onOpenChange={(v) => { if (!v) { setOtpDialog(null); setChangingField(null); } }}>
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-serif flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Change {changingField === "email" ? "Email" : "Phone"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {!otpSent
                ? `Enter your new ${changingField === "email" ? "email address" : "phone number"}. We'll send an OTP to verify.`
                : otpVerified
                  ? "Verification successful!"
                  : `Enter the 6-digit OTP sent to ${newFieldValue}`
              }
            </DialogDescription>
          </DialogHeader>

          {otpVerified ? (
            <div className="flex flex-col items-center py-4 gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Verified & Updated!</p>
            </div>
          ) : !otpSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">
                  New {changingField === "email" ? "Email" : "Phone Number"}
                </Label>
                <Input
                  type={changingField === "email" ? "email" : "tel"}
                  placeholder={changingField === "email" ? "new@example.com" : "+91 XXXXX XXXXX"}
                  value={newFieldValue}
                  onChange={e => setNewFieldValue(e.target.value)}
                  autoFocus
                />
              </div>
              <Button onClick={sendOtp} className="w-full">Send OTP</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-xs text-muted-foreground">Resend in {otpTimer}s</p>
                  ) : (
                    <button onClick={resendOtp} className="text-xs text-primary font-medium hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
              <Button onClick={verifyOtp} className="w-full" disabled={otpValue.length < 6}>
                Verify & Update
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerSettings;
