import { useState, useRef, useEffect, useMemo } from "react";
import { Search, MapPin, LocateFixed, Plus, X, Mic, TrendingUp, Clock, ChefHat, UtensilsCrossed } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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
  { label: "Andhra", icon: "🌶️", category: "Cuisine" },
  { label: "Kerala", icon: "🥥", category: "Cuisine" },
  { label: "Party Orders", icon: "🎉", category: "Service" },
  { label: "Subscriptions", icon: "📦", category: "Service" },
];

const recentSearches = ["Biryani", "Dosa", "Sambar Rice"];

const SearchBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [address, setAddress] = useState("Anna Nagar");
  const [detecting, setDetecting] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowManual(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) && e.target !== inputRef.current) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return popularSuggestions.filter(s => s.label.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

  const trendingSuggestions = useMemo(() => {
    return popularSuggestions.filter(s => s.category === "Dish").slice(0, 6);
  }, []);

  const handleSelectSuggestion = (label: string) => {
    setSearchQuery(label);
    setShowSuggestions(false);
    // Navigate based on suggestion
    const item = popularSuggestions.find(s => s.label === label);
    if (item?.category === "Service" && label === "Party Orders") navigate("/party-orders");
    else if (item?.category === "Service" && label === "Subscriptions") navigate("/subscriptions");
    else navigate("/instant-delivery");
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowSuggestions(false);
    navigate(`/instant-delivery?q=${encodeURIComponent(q)}`);
  };

  const handleDetect = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const locality =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.city_district ||
            data.address?.city ||
            "Current Location";
          setAddress(locality);
        } catch {
          setAddress("Current Location");
        }
        setDetecting(false);
        setShowDropdown(false);
      },
      () => {
        setDetecting(false);
      }
    );
  };

  const handleManualSave = () => {
    const trimmed = manualInput.trim();
    if (trimmed.length > 0 && trimmed.length <= 100) {
      setAddress(trimmed);
      setManualInput("");
      setShowManual(false);
      setShowDropdown(false);
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
                {address}
              </span>
              <span className="text-[10px] text-muted-foreground">▾</span>
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
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

                {!showManual ? (
                  <button
                    onClick={() => setShowManual(true)}
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
                        placeholder="e.g. Adyar, Chennai"
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
              <button onClick={() => { setSearchQuery(""); setShowSuggestions(false); }} className="p-1 rounded-full text-muted-foreground hover:text-foreground">
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
                <span className="text-xs font-medium text-foreground">Search for "<span className="text-primary">{searchQuery.trim()}</span>"</span>
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
                {/* Recent Searches */}
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

                {/* Trending */}
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

                {/* Quick Links */}
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
