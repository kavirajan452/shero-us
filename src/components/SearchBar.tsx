import { useState, useRef, useEffect, useMemo } from "react";
import { Search, MapPin, LocateFixed, Plus, X, Mic, TrendingUp, Clock, Hash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/contexts/LocationContext";
import { useSearchSuggestions } from "@/hooks/useSupabaseData";

const STATIC_TRENDING = [
  { label: "Biryani", sub: "Dish" },
  { label: "Dosa", sub: "Dish" },
  { label: "Idli", sub: "Dish" },
  { label: "Sambar Rice", sub: "Dish" },
  { label: "South Indian", sub: "Cuisine" },
  { label: "North Indian", sub: "Cuisine" },
];

const RECENT_KEY = "shero_recent_searches";

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecent(term: string) {
  try {
    const prev = getRecent().filter((x) => x !== term);
    localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, 5)));
  } catch {}
}

const SearchBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { location, isDetecting, detectGPS, setManualAddress, setZipLocation, clearLocation } = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const [inputMode, setInputMode] = useState<"none" | "address" | "zip">("none");
  const [manualInput, setManualInput] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [zipError, setZipError] = useState("");
  const [zipLoading, setZipLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [listening, setListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setRecentSearches(getRecent());
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setInputMode("none");
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

  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: liveSuggestions, isFetching: suggestionsLoading } = useSearchSuggestions(
    debouncedQuery,
    location.lat,
    location.lng
  );

  const staticFiltered = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return STATIC_TRENDING.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 4);
  }, [searchQuery]);

  const suggestions = liveSuggestions && liveSuggestions.length > 0 ? liveSuggestions : staticFiltered;
  const hasQuery = searchQuery.trim().length > 0;
  const shouldShowPanel = showSuggestions && !showDropdown;

  const displayName = location.displayName || "";
  const hasLocation = !!location.source;
  const locationLabel = hasLocation
    ? location.pincode
      ? `${displayName} ${location.pincode}`
      : displayName
    : "Set location";

  const handleSelectSuggestion = (label: string, type?: string) => {
    setSearchQuery(label);
    setShowSuggestions(false);
    addRecent(label);
    setRecentSearches(getRecent());
    const params = new URLSearchParams({ q: label });
    if (location.lat) params.set("lat", String(location.lat));
    if (location.lng) params.set("lng", String(location.lng));
    navigate(`/instant-delivery?${params.toString()}`);
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowSuggestions(false);
    addRecent(q);
    setRecentSearches(getRecent());
    const params = new URLSearchParams({ q });
    if (location.lat) params.set("lat", String(location.lat));
    if (location.lng) params.set("lng", String(location.lng));
    navigate(`/instant-delivery?${params.toString()}`);
  };

  const handleDetect = () => {
    detectGPS();
    setShowDropdown(false);
    setInputMode("none");
  };

  const handleManualSave = () => {
    const trimmed = manualInput.trim();
    if (trimmed.length === 0 || trimmed.length > 100) return;
    setManualAddress(trimmed);
    setManualInput("");
    setInputMode("none");
    setShowDropdown(false);
  };

  const handleZipSave = async () => {
    const trimmed = zipInput.trim();
    if (!/^\d{4,10}$/.test(trimmed)) {
      setZipError("Enter a valid ZIP/pincode");
      return;
    }
    setZipError("");
    setZipLoading(true);
    const ok = await setZipLocation(trimmed);
    setZipLoading(false);
    if (!ok) {
      setZipError("Location not found. Try a different code.");
      return;
    }
    setZipInput("");
    setInputMode("none");
    setShowDropdown(false);
  };

  const handleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const recognition = new SR();
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

  return (
    <section className="container mx-auto px-4 py-4">
      <div className="relative">
        <div className="bg-background rounded-xl border border-border p-2 flex items-center gap-2">
          {/* Location picker */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => { setShowDropdown(!showDropdown); setInputMode("none"); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm shrink-0 cursor-pointer hover:bg-secondary transition-colors"
            >
              <MapPin className={`w-4 h-4 ${hasLocation ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium hidden sm:inline max-w-[130px] truncate ${hasLocation ? "text-foreground" : "text-muted-foreground"}`}>
                {isDetecting ? "Detecting..." : locationLabel}
              </span>
              <span className="text-[10px] text-muted-foreground">▾</span>
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {/* GPS */}
                <button
                  onClick={handleDetect}
                  disabled={isDetecting}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                >
                  <LocateFixed className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {isDetecting ? "Detecting..." : "Use current location"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Auto-detect via GPS</p>
                  </div>
                </button>

                <div className="h-px bg-border" />

                {/* Manual address */}
                {inputMode !== "address" ? (
                  <button
                    onClick={() => setInputMode("address")}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                  >
                    <Plus className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Enter address manually</p>
                      <p className="text-[10px] text-muted-foreground">Type your locality or area name</p>
                    </div>
                  </button>
                ) : (
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Address / Locality</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value.slice(0, 100))}
                        onKeyDown={(e) => e.key === "Enter" && handleManualSave()}
                        placeholder="e.g. Adyar, Anna Nagar"
                        className="flex-1 text-xs bg-secondary rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 outline-none border border-border focus:border-primary transition-colors"
                        autoFocus
                        maxLength={100}
                      />
                      <button
                        onClick={() => { setInputMode("none"); setManualInput(""); }}
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
                      Save Location
                    </button>
                  </div>
                )}

                <div className="h-px bg-border" />

                {/* ZIP / Pincode */}
                {inputMode !== "zip" ? (
                  <button
                    onClick={() => setInputMode("zip")}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
                  >
                    <Hash className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Enter ZIP / Pincode</p>
                      <p className="text-[10px] text-muted-foreground">Search kitchens by postal code</p>
                    </div>
                  </button>
                ) : (
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">ZIP / Pincode</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={zipInput}
                        onChange={(e) => { setZipInput(e.target.value.replace(/\D/g, "").slice(0, 10)); setZipError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleZipSave()}
                        placeholder="e.g. 600020"
                        className="flex-1 text-xs bg-secondary rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 outline-none border border-border focus:border-primary transition-colors"
                        autoFocus
                      />
                      <button
                        onClick={() => { setInputMode("none"); setZipInput(""); setZipError(""); }}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {zipError && <p className="text-[10px] text-destructive">{zipError}</p>}
                    <button
                      onClick={handleZipSave}
                      disabled={zipInput.trim().length < 4 || zipLoading}
                      className="w-full text-xs font-medium bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors disabled:opacity-40"
                    >
                      {zipLoading ? "Locating..." : "Find Kitchens"}
                    </button>
                  </div>
                )}

                {hasLocation && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="px-4 py-2 flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground truncate max-w-[190px]">
                        Current: <span className="text-foreground font-medium">{displayName}</span>
                        {location.pincode && (
                          <span className="text-muted-foreground"> ({location.pincode})</span>
                        )}
                      </p>
                      <button
                        onClick={() => { clearLocation(); setShowDropdown(false); }}
                        className="text-[10px] text-destructive hover:underline shrink-0 ml-2"
                      >
                        Clear
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* Search input */}
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

        {/* Suggestions panel */}
        {shouldShowPanel && (
          <div
            ref={suggestionsRef}
            className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto"
          >
            {hasQuery && (
              <button
                onClick={handleSearchSubmit}
                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-secondary transition-colors border-b border-border"
              >
                <Search className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  Search for "<span className="text-primary">{searchQuery.trim()}</span>"
                  {hasLocation && (
                    <span className="text-muted-foreground"> near {displayName}</span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">↵</span>
              </button>
            )}

            {hasQuery && suggestions.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 pb-1.5 flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  {suggestionsLoading ? "Searching..." : "Results"}
                  {hasLocation && (
                    <span className="ml-1 normal-case font-normal">near {displayName}</span>
                  )}
                </p>
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.type}-${s.label}-${i}`}
                    onClick={() => handleSelectSuggestion(s.label, s.type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <span className="text-sm leading-none">
                      {s.type === "kitchen" ? "🍳" : s.type === "category" ? "📋" : "🍽️"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.subLabel}</p>
                    </div>
                    {s.distance != null && (
                      <span className="text-[10px] text-primary font-medium shrink-0">
                        {s.distance.toFixed(1)} km
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {hasQuery && suggestions.length === 0 && !suggestionsLoading && (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground">No results for "{searchQuery}"</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Try a dish name, cuisine, or kitchen
                </p>
              </div>
            )}

            {!hasQuery && (
              <>
                {!hasLocation && (
                  <div className="px-4 py-3 bg-secondary/50 border-b border-border flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <p className="text-[11px] text-muted-foreground">
                      Set your location to see nearby kitchens and dishes
                    </p>
                  </div>
                )}

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
                  {STATIC_TRENDING.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSelectSuggestion(s.label)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                    >
                      <span className="text-base leading-none">🍽️</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                      </div>
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
    </section>
  );
};

export default SearchBar;
