import { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  LocateFixed,
  Plus,
  X,
  Mic,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Hash,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import sheroLogo from "@/assets/shero-logo.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import heroMascot from "@/assets/shero-mascot-cooking.jpeg";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";
import { useServiceability } from "@/hooks/useServiceability";
import { useLocation as useLocationCtx } from "@/contexts/LocationContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NonServiceableArea from "@/components/NonServiceableArea";

const HeroSection = () => {
  const { data: contentItems } = useScreenContent("home");
  const c = contentMap(contentItems || []);
  const navigate = useNavigate();

  // Global location / serviceability state
  const locationCtx = useLocationCtx();
  const { checkByZip, detectAndCheck, hasKitchens } = useServiceability();

  // Local UI state
  const [showDropdown, setShowDropdown] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [detecting, setDetecting] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [showZipInput, setShowZipInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [langSet, setLangSet] = useState(false);

  useEffect(() => {
    const check = () => setLangSet(!!localStorage.getItem("i18nextLng"));
    check();
    window.addEventListener("storage", check);
    const t = setTimeout(check, 500);
    return () => { window.removeEventListener("storage", check); clearTimeout(t); };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowManual(false);
        setShowZipInput(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // GPS detect and serviceability check
  const handleDetect = async () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    locationCtx.setStatus("checking");
    try {
      const result = await detectAndCheck();
      const locality = result.detectedLocation || "Current Location";
      setAddressLabel("Current");
      locationCtx.setDetectedLocation(locality);
      locationCtx.setStatus(result.serviceable ? "serviceable" : "not_serviceable");
    } catch {
      locationCtx.setStatus("idle");
    }
    setDetecting(false);
    setShowDropdown(false);
  };

  // ZIP check
  const handleZipCheck = () => {
    const zip = zipInput.trim();
    if (zip.length < 5) return;
    const serviceable = checkByZip(zip);
    locationCtx.setZip(zip);
    locationCtx.setStatus(serviceable ? "serviceable" : "not_serviceable");
    setAddressLabel(zip);
    setShowZipInput(false);
    setShowDropdown(false);
  };

  const handleManualSave = () => {
    const trimmed = manualInput.trim();
    if (trimmed.length > 0 && trimmed.length <= 100) {
      setAddressLabel("Other");
      setManualInput("");
      setShowManual(false);
      setShowDropdown(false);
      locationCtx.setStatus("idle");
    }
  };

  const handleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("");
      setSearchQuery(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  // Gated search submit
  const handleSearchSubmit = () => {
    if (locationCtx.status === "not_serviceable") {
      setShowWaitlist(true);
      return;
    }
    const q = searchQuery.trim();
    navigate(q ? `/instant-delivery?q=${encodeURIComponent(q)}` : "/instant-delivery");
  };

  // Serviceability status badge
  const renderStatusBadge = () => {
    if (!hasKitchens) return null;
    const { status, zip, detectedLocation } = locationCtx;
    const label = zip || detectedLocation;

    if (status === "checking" || detecting) {
      return (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5 ml-1">
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
          Checking your location…
        </div>
      );
    }
    if (status === "serviceable") {
      return (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 mt-1.5 ml-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {label ? `We deliver to ${label}!` : "We deliver to your area!"}
        </div>
      );
    }
    if (status === "not_serviceable") {
      return (
        <div className="flex items-center gap-1.5 text-[11px] text-destructive mt-1.5 ml-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {label ? `Not available yet in ${label}` : "Not available in your area yet"}
          <button
            onClick={() => setShowWaitlist(true)}
            className="underline underline-offset-2 hover:text-destructive/80 transition-colors"
          >
            — Notify me
          </button>
        </div>
      );
    }
    return null;
  };

  // Shared location dropdown
  const renderLocationDropdown = () => (
    <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
      <button
        onClick={handleDetect}
        disabled={detecting}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
      >
        <LocateFixed className={`w-4 h-4 text-primary shrink-0 ${detecting ? "animate-spin" : ""}`} />
        <div>
          <p className="text-xs font-medium text-foreground">{detecting ? "Detecting..." : "Use current location"}</p>
          <p className="text-[10px] text-muted-foreground">Auto-detect via GPS</p>
        </div>
      </button>

      <div className="h-px bg-border" />

      {!showZipInput ? (
        <button
          onClick={() => { setShowZipInput(true); setShowManual(false); }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
        >
          <Hash className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">Check by ZIP code</p>
            <p className="text-[10px] text-muted-foreground">See if we deliver to your area</p>
          </div>
        </button>
      ) : (
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={(e) => e.key === "Enter" && handleZipCheck()}
              placeholder="e.g. 10001"
              className="flex-1 text-xs bg-secondary rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 outline-none border border-border focus:border-primary transition-colors"
              autoFocus
              maxLength={5}
            />
            <button
              onClick={() => { setShowZipInput(false); setZipInput(""); }}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={handleZipCheck}
            disabled={zipInput.length < 5}
            className="w-full text-xs font-medium bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            Check Availability
          </button>
        </div>
      )}

      <div className="h-px bg-border" />

      {!showManual ? (
        <button
          onClick={() => { setShowManual(true); setShowZipInput(false); }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
        >
          <Plus className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">Enter address manually</p>
            <p className="text-[10px] text-muted-foreground">Type your locality or area</p>
          </div>
        </button>
      ) : (
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value.slice(0, 100))}
              onKeyDown={(e) => e.key === "Enter" && handleManualSave()}
              placeholder="e.g. Manhattan, New York"
              className="flex-1 text-xs bg-secondary rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 outline-none border border-border focus:border-primary transition-colors"
              autoFocus
              maxLength={100}
            />
            <button
              onClick={() => { setShowManual(false); setManualInput(""); }}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={handleManualSave}
            disabled={manualInput.trim().length === 0}
            className="w-full text-xs font-medium bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );

  return (
    <section className="relative">
      {/* === MOBILE HERO (< md) === */}
      <div className="md:hidden relative h-[420px] overflow-hidden">
        <img src={heroMascot} alt="Shero Home Chef" className="absolute inset-0 w-full h-full object-cover object-top brightness-105 saturate-90 z-[1]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/75 via-background/20 to-transparent z-[2]" />
        <div className="absolute top-1 right-3 h-20 w-40 rounded-full bg-background/70 blur-2xl z-[2]" />
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-background via-background/80 to-transparent z-[2]" />

        <div className="relative z-10 container mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
          {!langSet && <LanguageSwitcher />}
          {langSet && <div />}
          <img
            src={sheroLogo}
            alt="Shero"
            className="h-14 w-auto"
            style={{
              filter:
                "drop-shadow(0 0 8px hsl(var(--background) / 0.95)) drop-shadow(0 0 18px hsl(var(--background) / 0.9))",
            }}
          />
        </div>

        <div className="absolute bottom-10 left-0 right-0 z-10 container mx-auto px-5">
          <h1 className="text-foreground font-serif text-[19px] font-bold leading-[1.15] drop-shadow-md">
            {c["home.hero_title"] || "Authentic Indian Home Food,"}<br />
            {c["home.hero_title_line2"] || "Delivered Fresh."} <span className="text-primary">{c["home.hero_title_line3"] || "Now Closer to You."}</span>
          </h1>
          <p className="text-foreground/70 text-[11px] mt-1 max-w-[300px] leading-snug drop-shadow-sm">
            {c["home.hero_subtitle"] || "From our certified home kitchens to your doorstep. The taste of India, made in America."}
          </p>
        </div>
      </div>

      {/* === DESKTOP HERO (md+) === */}
      <div className="hidden md:flex items-stretch min-h-[500px] overflow-visible">
        <div className="w-1/2 flex flex-col justify-center px-10 lg:px-16 py-8 relative z-10 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="absolute top-8 right-12 w-24 h-24 rounded-full bg-primary/5 blur-2xl" />
          <div className="absolute bottom-12 left-8 w-32 h-32 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute top-1/3 left-4 w-2 h-2 rounded-full bg-primary/30" />
          <div className="absolute bottom-1/4 right-20 w-3 h-3 rounded-full bg-primary/20" />
          <div className="flex items-center gap-4 mb-4">
            <img src={sheroLogo} alt="Shero" className="h-14 lg:h-16 drop-shadow-md" />
            {!langSet && <LanguageSwitcher />}
          </div>
          <h1 className="text-foreground font-serif text-4xl lg:text-5xl font-bold leading-tight">
            {c["home.hero_title"] || "Authentic Indian Home Food,"}<br />
            {c["home.hero_title_line2"] || "Delivered Fresh"}<br />
            <span className="text-primary">{c["home.hero_title_line3"] || "Now Closer to You."}</span>
          </h1>
          <p className="text-foreground/70 text-base mt-3 max-w-[440px] leading-relaxed">
            {c["home.hero_subtitle"] || "From our certified home kitchens to your doorstep. The taste of India, made in America."}
          </p>

          <Link to="/instant-delivery" className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] w-fit">
            {c["home.hero_cta"] || "Order Now"}
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Desktop search bar */}
          <div className="mt-5 max-w-[520px]">
            <div className="bg-card rounded-2xl p-2.5 flex items-center gap-2 shadow-lg border border-border">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-foreground font-medium text-xs max-w-[80px] truncate">{addressLabel}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                {showDropdown && renderLocationDropdown()}
              </div>
              <div className="h-5 w-px bg-border" />
              <Search className="w-4 h-4 text-muted-foreground/40 shrink-0 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
                placeholder={c["hero.search_placeholder"] || "Search 'Your Dish'"}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              <button
                onClick={handleMic}
                className={`p-2 rounded-full shrink-0 transition-colors ${listening ? "bg-primary/10 text-primary animate-pulse" : "text-muted-foreground/50 hover:text-primary"}`}
                aria-label="Voice search"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSearchSubmit}
                className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0"
              >
                Search
              </button>
            </div>
            {renderStatusBadge()}
          </div>
        </div>

        <div className="w-1/2 relative -ml-16">
          <img src={heroMascot} alt="Shero Home Chef" className="absolute inset-0 w-full h-full object-cover object-[center_15%]" />
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>
      </div>

      {/* === MOBILE search bar (below hero) === */}
      <div className="md:hidden container mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-card rounded-2xl p-2.5 flex items-center gap-2 shadow-lg border border-border">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-foreground font-medium text-xs max-w-[80px] truncate">{addressLabel}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            {showDropdown && renderLocationDropdown()}
          </div>
          <div className="h-5 w-px bg-border" />
          <Search className="w-4 h-4 text-muted-foreground/40 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
            placeholder={c["hero.search_placeholder"] || "Search 'Your Dish'"}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
          />
          <button
            onClick={handleMic}
            className={`p-2 rounded-full shrink-0 transition-colors ${listening ? "bg-primary/10 text-primary animate-pulse" : "text-muted-foreground/50 hover:text-primary"}`}
            aria-label="Voice search"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        {renderStatusBadge()}
      </div>

      {/* Waitlist dialog */}
      <Dialog open={showWaitlist} onOpenChange={setShowWaitlist}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Get notified when we arrive</DialogTitle>
          </DialogHeader>
          <NonServiceableArea
            compact
            detectedLocation={locationCtx.detectedLocation || undefined}
            zipCode={locationCtx.zip || undefined}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
