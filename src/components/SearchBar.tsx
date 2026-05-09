import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  LocateFixed,
  Plus,
  X,
  Mic,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Hash,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useServiceability } from "@/hooks/useServiceability";
import { useLocation as useLocationCtx } from "@/contexts/LocationContext";
import { useRegion } from "@/contexts/RegionContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NonServiceableArea from "@/components/NonServiceableArea";

const popularSuggestions = [
  { label: "Biryani", icon: "🍛", category: "Dish" },
  { label: "Dosa", icon: "🥞", category: "Dish" },
  { label: "Idli", icon: "🫓", category: "Dish" },
  { label: "Chapati", icon: "🫓", category: "Dish" },
  { label: "Paneer Butter Masala", icon: "🍛", category: "Dish" },
  { label: "Chicken Curry", icon: "🍗", category: "Dish" },
  { label: "Sambar Rice", icon: "🍚", category: "Dish" },
  { label: "Curd Rice", icon: "🍚", category: "Dish" },
  { label: "Fried Rice", icon: "🍚", category: "Dish" },
  { label: "Pulihora", icon: "🍋", category: "Dish" },
  { label: "Ghee Rice", icon: "🍚", category: "Dish" },
  { label: "Meals", icon: "🍽️", category: "Category" },
  { label: "Sweets", icon: "🍮", category: "Category" },
  { label: "Snacks", icon: "🍘", category: "Category" },
  { label: "South Indian", icon: "🌿", category: "Cuisine" },
  { label: "North Indian", icon: "🫓", category: "Cuisine" },
  { label: "Pennsylvania", icon: "🌶️", category: "Cuisine" },
  { label: "Florida", icon: "🥥", category: "Cuisine" },
  { label: "Party Orders", icon: "🎉", category: "Service" },
  { label: "Subscriptions", icon: "📦", category: "Service" },
];

const recentSearches = ["Biryani", "Dosa", "Sambar Rice"];

const SearchBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Global location / serviceability state
  const locationCtx = useLocationCtx();
  const { checkByZip, detectAndCheck, resolveZipToCoords, hasKitchens } = useServiceability();
  const { regionCode } = useRegion();
  // US ZIP codes are 5 digits; Indian pincodes are 6 digits
  const zipLength = regionCode === "IN" ? 6 : 5;

  const [showDropdown, setShowDropdown] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Anna Nagar");
  const [detecting, setDetecting] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [showZipInput, setShowZipInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowManual(false);
        setShowZipInput(false);
      }
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        e.target !== inputRef.current
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return popularSuggestions.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

  const trendingSuggestions = useMemo(() => {
    return popularSuggestions.filter((s) => s.category === "Dish").slice(0, 6);
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
      locationCtx.setCoords(result.customerCoords);
      locationCtx.setStatus(result.serviceable ? "serviceable" : "not_serviceable");
    } catch {
      setAddressLabel("Current Location");
      locationCtx.setCoords(null);
      locationCtx.setStatus("idle");
    }
    setDetecting(false);
    setShowDropdown(false);
  };

  // ZIP check
  const handleZipCheck = async () => {
    const zip = zipInput.trim();
    if (zip.length < zipLength) return;
    const serviceable = checkByZip(zip);
    const coords = await resolveZipToCoords(zip);
    locationCtx.setZip(zip);
    locationCtx.setCoords(coords);
    locationCtx.setStatus(serviceable ? "serviceable" : "not_serviceable");
    setAddressLabel(zip);
    setShowZipInput(false);
    setShowDropdown(false);
  };

  const handleManualSave = () => {
    const trimmed = manualInput.trim();
    if (trimmed.length > 0 && trimmed.length <= 100) {
      setAddressLabel(trimmed);
      setManualInput("");
      setShowManual(false);
      setShowDropdown(false);
      locationCtx.setStatus("idle");
    }
  };

  const handleSelectSuggestion = (label: string) => {
    setSearchQuery(label);
    setShowSuggestions(false);
    if (locationCtx.status === "not_serviceable") {
      setShowWaitlist(true);
      return;
    }
    const item = popularSuggestions.find((s) => s.label === label);
    if (item?.category === "Service" && label === "Party Orders") navigate("/party-orders");
    else if (item?.category === "Service" && label === "Subscriptions") navigate("/subscriptions");
    else navigate(`/instant-delivery?q=${encodeURIComponent(label)}`);
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowSuggestions(false);
    if (locationCtx.status === "not_serviceable") {
      setShowWaitlist(true);
      return;
    }
    navigate(`/instant-delivery?q=${encodeURIComponent(q)}`);
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
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setSearchQuery(transcript);
      setShowSuggestions(true);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    setListening(true);
    recognition.start();
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

  const shouldShowPanel = showSuggestions && !showDropdown;
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <section className="container mx-auto px-4 py-4">
      <div className="relative">
        <div className="bg-background rounded-xl border border-border p-2 flex items-center gap-2">
          {/* Location picker */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground shrink-0 cursor-pointer hover:bg-secondary transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium text-xs hidden sm:inline max-w-[120px] truncate">
                {addressLabel}
              </span>
              <span className="text-[10px] text-muted-foreground">▾</span>
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {/* GPS detect */}
                <button
                  onClick={handleDetect}
                  disabled={detecting}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                >
                  <LocateFixed className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {detecting ? "Detecting..." : "Use current location"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Auto-detect via GPS</p>
                  </div>
                </button>

                <div className="h-px bg-border" />

                {/* Check by ZIP */}
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
                        onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, zipLength))}
                        onKeyDown={(e) => e.key === "Enter" && handleZipCheck()}
                        placeholder={regionCode === "IN" ? "e.g. 600001" : "e.g. 10001"}
                        className="flex-1 text-xs bg-secondary rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 outline-none border border-border focus:border-primary transition-colors"
                        autoFocus
                        maxLength={zipLength}
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
                      disabled={zipInput.length < zipLength}
                      className="w-full text-xs font-medium bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors disabled:opacity-40"
                    >
                      Check Availability
                    </button>
                  </div>
                )}

                <div className="h-px bg-border" />

                {/* Manual address */}
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
                        placeholder="e.g. Adyar, New York"
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
            )}
          </div>

          <div className="h-5 w-px bg-border hidden sm:block" />
          <div className="flex-1 flex items-center gap-2 px-2">
            <Search className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
              placeholder={t("common.search", "Search for 'Biryani'")}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleMic}
              className={`p-1.5 rounded-full shrink-0 transition-colors ${
                listening
                  ? "bg-primary/10 text-primary animate-pulse"
                  : "text-muted-foreground hover:text-primary hover:bg-secondary"
              }`}
              aria-label="Voice search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {renderStatusBadge()}

        {/* Suggestions Dropdown */}
        {shouldShowPanel && (
          <div
            ref={suggestionsRef}
            className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto"
          >
            {hasQuery && (
              <button
                onClick={handleSearchSubmit}
                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-secondary transition-colors border-b border-border"
              >
                <Search className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  Search for "<span className="text-primary">{searchQuery.trim()}</span>"
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">↵ Enter</span>
              </button>
            )}

            {hasQuery && filteredSuggestions.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 pb-1.5">Results</p>
                {filteredSuggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSelectSuggestion(s.label)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <span className="text-lg">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.category}</p>
                    </div>
                    <Search className="w-3 h-3 text-muted-foreground/40" />
                  </button>
                ))}
              </div>
            )}

            {hasQuery && filteredSuggestions.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground">No results for "{searchQuery}"</p>
                <p className="text-[10px] text-muted-foreground mt-1">Try searching for a dish, cuisine, or service</p>
              </div>
            )}

            {!hasQuery && (
              <>
                {recentSearches.length > 0 && (
                  <div className="p-2 border-b border-border">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 pb-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent
                    </p>
                    <div className="flex flex-wrap gap-1.5 px-2">
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSelectSuggestion(s)}
                          className="text-[11px] px-3 py-1.5 rounded-full bg-secondary text-foreground hover:bg-primary/10 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 pb-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </p>
                  {trendingSuggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSelectSuggestion(s.label)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                    >
                      <span className="text-lg">{s.icon}</span>
                      <p className="text-xs font-medium text-foreground">{s.label}</p>
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-border">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 pb-1.5">Quick Links</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "Party Orders", icon: "🎉", path: "/party-orders" },
                      { label: "Subscriptions", icon: "📦", path: "/subscriptions" },
                      { label: "Sweets & Snacks", icon: "🍮", path: "/sweets-snacks" },
                      { label: "Services", icon: "🛠️", path: "/services" },
                    ].map((link) => (
                      <button
                        key={link.label}
                        onClick={() => { setShowSuggestions(false); navigate(link.path); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <span>{link.icon}</span>
                        <span className="text-[11px] font-medium text-foreground">{link.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
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

export default SearchBar;
