import { useState, useEffect } from "react";
import { User, Phone, MapPin, Info, ArrowRight, RotateCcw, Loader2 } from "lucide-react";

interface Props {
  onVerified: (data: { name: string; phone: string; location: string; isReturning: boolean; hasSavedOrder: boolean }) => void;
}

import { findLeadByPhone, createOrUpdateLead } from "@/data/partyLeadsStore";
import { findLeadByPhoneAsync, createOrUpdateLeadAsync } from "@/data/partyLeadsStore";

const PartyLeadCapture = ({ onVerified }: Props) => {
  const [mode, setMode] = useState<"entry" | "form">("entry");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");

  const autoDetectLocation = () => {
    if (!navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          setLocation(data.display_name?.split(",").slice(0, 3).join(", ") || `${pos.coords.latitude}, ${pos.coords.longitude}`);
        } catch {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setLoadingLocation(false);
      },
      () => setLoadingLocation(false),
      { timeout: 5000 }
    );
  };

  useEffect(() => { autoDetectLocation(); }, []);

  const [checking, setChecking] = useState(false);

  const handlePhoneCheck = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    setChecking(true);
    try {
      // Try database first, fall back to localStorage
      const existing = await findLeadByPhoneAsync(cleaned);
      if (existing) {
        const lead = await createOrUpdateLeadAsync({ name: existing.name, phone: cleaned, location: existing.location });
        // Also sync localStorage
        createOrUpdateLead({ name: lead.name, phone: cleaned, location: lead.location });
        onVerified({
          name: lead.name,
          phone: cleaned,
          location: lead.location,
          isReturning: true,
          hasSavedOrder: !!lead.savedOrder,
        });
      } else {
        setMode("form");
      }
    } catch {
      // Fallback to localStorage
      const existing = findLeadByPhone(cleaned);
      if (existing) {
        const lead = createOrUpdateLead({ name: existing.name, phone: cleaned, location: existing.location });
        onVerified({
          name: lead.name,
          phone: cleaned,
          location: lead.location,
          isReturning: true,
          hasSavedOrder: !!lead.savedOrder,
        });
      } else {
        setMode("form");
      }
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) { setError("Name is required"); return; }
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) { setError("Enter a valid phone number"); return; }
    if (!location.trim()) { setError("Location is required"); return; }
    
    createOrUpdateLead({ name: name.trim(), phone: cleaned, location: location.trim(), source: "direct" });
    onVerified({ name: name.trim(), phone: cleaned, location: location.trim(), isReturning: false, hasSavedOrder: false });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-4xl">🎉</span>
          <h1 className="text-xl font-serif font-bold text-foreground mt-2">Party Orders</h1>
          <p className="text-xs text-muted-foreground mt-1">🙏 Thank you for choosing genuinely homemade food for your guests — zero chemicals, quality oils & ingredients, cooked fresh by a real home chef as we cook for our home-coming guest! Your order puts a smile on her family's face.</p>
        </div>

        {/* Why we ask */}
        <div className="bg-accent/20 border border-accent rounded-xl p-3 mb-4 flex gap-2">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-[10px] text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground text-xs mb-0.5">Why do we need your details?</p>
            <p>• Save your menu selections for 15 days — come back anytime to edit</p>
            <p>• Get a callback from our party planning team</p>
            <p>• Track your order even if you close the browser</p>
          </div>
        </div>

        {mode === "entry" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3 text-primary" /> Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                maxLength={12}
              />
              {error && <p className="text-[10px] text-destructive mt-1">{error}</p>}
            </div>

            <button
              onClick={handlePhoneCheck}
              disabled={checking}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {checking ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking…</> : <>Continue <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
            <p className="text-[10px] text-center text-muted-foreground">Returning customer? Enter your number to retrieve saved order.</p>
          </div>
        )}

        {mode === "form" && (
          <div className="space-y-3">
            <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">{phone}</span>
              <button onClick={() => setMode("entry")} className="ml-auto text-xs text-primary flex items-center gap-0.5">
                <RotateCcw className="w-3 h-3" /> Change
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground flex items-center gap-1 mb-1">
                <User className="w-3 h-3 text-primary" /> Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Full name"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-primary" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setError(""); }}
                placeholder={loadingLocation ? "Detecting location…" : "Area, City"}
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
              {!location && (
                <button onClick={autoDetectLocation} className="text-[10px] text-primary mt-1 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" /> Auto-detect my location
                </button>
              )}
            </div>

            {error && <p className="text-[10px] text-destructive">{error}</p>}

            <button
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              Start Building Menu <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyLeadCapture;
