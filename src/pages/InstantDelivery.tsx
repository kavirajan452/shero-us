import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Leaf, X, Bike, AlertTriangle, MapPin, LocateFixed, Hash, Plus, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { useNearbyKitchenPartners, useInstantMenuCategories, useKitchenVisibilityRadius, useInstantMenuItems } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { useRegion } from "@/contexts/RegionContext";
import { useCustomerLocation } from "@/contexts/CustomerLocationContext";
import { applyLocationToSearchParams, getLocationSummary, isValidZip, normalizeZip, readLocationFromSearchParams } from "@/lib/customerLocation";
import { trackEvent } from "@/lib/analyticsEvents";

const sortOptions = ["Relevance", "Distance"];

const InstantDelivery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("Relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [showChangeLocation, setShowChangeLocation] = useState(false);
  const [manualAddressInput, setManualAddressInput] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [locationError, setLocationError] = useState("");
  const [detecting, setDetecting] = useState(false);
  const { location, setLocation, hydrated } = useCustomerLocation();
  const { formatPrice } = useRegion();

  const [customerLat, setCustomerLat] = useState<number | null>(null);
  const [customerLng, setCustomerLng] = useState<number | null>(null);
  const [customerZip, setCustomerZip] = useState("");
  const [customerLabel, setCustomerLabel] = useState("");
  const [locationStatus, setLocationStatus] = useState<"found" | "denied" | "invalid_zip" | "idle">("idle");

  const { data: menuCategories } = useInstantMenuCategories();
  const { data: allInstantMenuItems } = useInstantMenuItems();
  const categoryFilters = useMemo(() => ["All", ...(menuCategories || [])], [menuCategories]);
  const { data: radiusKm } = useKitchenVisibilityRadius();

  const { data: allKitchens, isLoading } = useNearbyKitchenPartners(customerLat, customerLng, customerZip || undefined);

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const fromUrl = readLocationFromSearchParams(searchParams);
    const urlZipRaw = searchParams.get("locZip");
    const hasUrlLocation = !!(fromUrl.method || fromUrl.label || fromUrl.zip || fromUrl.lat != null || fromUrl.lng != null);

    if (urlZipRaw && !isValidZip(urlZipRaw)) {
      setLocationStatus("invalid_zip");
    }

    if (hasUrlLocation) {
      const nextLat = fromUrl.lat ?? null;
      const nextLng = fromUrl.lng ?? null;
      const nextZip = normalizeZip(fromUrl.zip || "");
      const nextLabel = fromUrl.label || (nextZip ? `ZIP ${nextZip}` : "");

      setCustomerLat(nextLat);
      setCustomerLng(nextLng);
      setCustomerZip(nextZip);
      setCustomerLabel(nextLabel);
      setZipInput(nextZip);

      if (nextLat != null && nextLng != null) {
        setLocationStatus("found");
      } else if (nextZip) {
        setLocationStatus(nextZip.length === 5 ? "found" : "invalid_zip");
      }

      setLocation({
        method: fromUrl.method || (nextZip ? "manual_zip" : "manual_address"),
        label: nextLabel,
        zip: nextZip,
        lat: nextLat,
        lng: nextLng,
      });
      return;
    }

    if (!hydrated) return;

    const nextZip = normalizeZip(location.zip || "");
    setCustomerLat(location.lat);
    setCustomerLng(location.lng);
    setCustomerZip(nextZip);
    setCustomerLabel(location.label || (nextZip ? `ZIP ${nextZip}` : ""));
    setZipInput(nextZip);

    if (location.lat != null && location.lng != null) {
      setLocationStatus("found");
    } else if (nextZip.length === 5) {
      setLocationStatus("found");
    }

    if (location.method || location.label || nextZip || location.lat != null || location.lng != null) {
      const params = applyLocationToSearchParams(new URLSearchParams(searchParams), {
        method: location.method,
        label: location.label,
        zip: nextZip,
        lat: location.lat,
        lng: location.lng,
      });
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams, location, hydrated, setLocation]);

  const updateUrl = (nextSearch: string, nextLoc?: { method: "gps" | "manual_address" | "manual_zip" | null; label: string; zip: string; lat: number | null; lng: number | null }) => {
    const params = new URLSearchParams(searchParams);
    const query = nextSearch.trim();

    if (query) params.set("q", query);
    else params.delete("q");

    const activeLocation = nextLoc || {
      method: location.method,
      label: customerLabel || location.label,
      zip: customerZip || location.zip,
      lat: customerLat,
      lng: customerLng,
    };

    const withLocation = applyLocationToSearchParams(params, activeLocation);
    setSearchParams(withLocation, { replace: true });
  };

  const dishNameIndex = useMemo(() => {
    const map = new Map<string, string[]>();
    (allInstantMenuItems || []).forEach((item: any) => {
      const key = String(item.kitchen_id || "");
      const dishName = String(item.name || "").toLowerCase();
      if (!key || !dishName) return;
      const existing = map.get(key) || [];
      existing.push(dishName);
      map.set(key, existing);
    });
    return map;
  }, [allInstantMenuItems]);

  const livePartners = useMemo(() => (allKitchens || []).filter((k: any) => k.is_attendance_marked), [allKitchens]);
  const unavailablePartners = useMemo(() => (allKitchens || []).filter((k: any) => !k.is_attendance_marked), [allKitchens]);

  const filtered = useMemo(() => {
    let result = livePartners;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((k: any) => {
        const dishNames = dishNameIndex.get(String(k.id)) || [];
        const matchesKitchen =
          k.name.toLowerCase().includes(q) ||
          (k.cuisine || []).some((c: string) => c.toLowerCase().includes(q)) ||
          (k.location || "").toLowerCase().includes(q);

        const matchesDish = dishNames.some((name) => name.includes(q));
        return matchesKitchen || matchesDish;
      });
    }

    if (selectedCategory !== "All") {
      result = result.filter((k: any) => (k.cuisine || []).some((c: string) => c.toLowerCase() === selectedCategory.toLowerCase()));
    }

    if (vegOnly) {
      result = result.filter((k: any) => k.is_veg);
    }

    if (sortBy === "Distance") {
      result = [...result].sort((a: any, b: any) => (a.distance ?? 999) - (b.distance ?? 999));
    }

    return result;
  }, [search, selectedCategory, vegOnly, sortBy, livePartners, dishNameIndex]);

  useEffect(() => {
    if (!isLoading && filtered.length === 0) {
      trackEvent("search_no_results", {
        search: search.trim(),
        has_location: !!(customerLat != null && customerLng != null) || !!customerZip,
      });
    }
  }, [filtered.length, isLoading, search, customerLat, customerLng, customerZip]);

  const setAndTrackLocation = (next: {
    method: "gps" | "manual_address" | "manual_zip";
    label: string;
    zip: string;
    lat: number | null;
    lng: number | null;
  }) => {
    const normalized = normalizeZip(next.zip || "");

    setLocation({
      method: next.method,
      label: next.label,
      zip: normalized,
      lat: next.lat,
      lng: next.lng,
    });

    setCustomerLat(next.lat);
    setCustomerLng(next.lng);
    setCustomerZip(normalized);
    setCustomerLabel(next.label);
    setZipInput(normalized);
    setLocationStatus("found");
    setLocationError("");

    updateUrl(search, {
      method: next.method,
      label: next.label,
      zip: normalized,
      lat: next.lat,
      lng: next.lng,
    });

    trackEvent("location_selected", {
      source: "instant_delivery",
      method: next.method,
      has_zip: !!normalized,
      has_coordinates: next.lat != null && next.lng != null,
    });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location services are unavailable on this device.");
      return;
    }

    setDetecting(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
          );
          const data = await res.json();
          const label =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.city_district ||
            data.address?.city ||
            data.address?.state ||
            "Current Location";
          const zip = normalizeZip(data.address?.postcode || "");

          setAndTrackLocation({ method: "gps", label, zip, lat, lng });
        } catch {
          setAndTrackLocation({ method: "gps", label: "Current Location", zip: "", lat, lng });
        }

        setDetecting(false);
        setShowChangeLocation(false);
      },
      () => {
        setDetecting(false);
        setLocationStatus("denied");
        setLocationError("Location access denied. Enter address or ZIP instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualAddressSave = async () => {
    const trimmed = manualAddressInput.trim();
    if (!trimmed) return;

    setLocationError("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1&addressdetails=1`
      );
      const data = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
        address?: { postcode?: string };
      }>;

      if (data.length > 0) {
        const first = data[0];
        const lat = Number(first.lat);
        const lng = Number(first.lon);
        setAndTrackLocation({
          method: "manual_address",
          label: first.display_name || trimmed,
          zip: normalizeZip(first.address?.postcode || ""),
          lat: Number.isFinite(lat) ? lat : null,
          lng: Number.isFinite(lng) ? lng : null,
        });
      } else {
        setAndTrackLocation({
          method: "manual_address",
          label: trimmed,
          zip: "",
          lat: null,
          lng: null,
        });
      }

      setManualAddressInput("");
      setShowChangeLocation(false);
    } catch {
      setAndTrackLocation({
        method: "manual_address",
        label: trimmed,
        zip: "",
        lat: null,
        lng: null,
      });
      setManualAddressInput("");
      setShowChangeLocation(false);
    }
  };

  const handleZipSave = () => {
    const normalized = normalizeZip(zipInput);

    if (!isValidZip(normalized)) {
      setLocationStatus("invalid_zip");
      setLocationError("Please enter a valid 5-digit ZIP code.");
      return;
    }

    setAndTrackLocation({
      method: "manual_zip",
      label: `ZIP ${normalized}`,
      zip: normalized,
      lat: null,
      lng: null,
    });
    setShowChangeLocation(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-24 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading kitchens...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  const hasLocationFilter = (customerLat != null && customerLng != null) || !!customerZip;
  const locationSummary = getLocationSummary({ label: customerLabel || location.label, zip: customerZip || location.zip }, "No location selected");
  const noServiceableKitchens = hasLocationFilter && livePartners.length === 0;
  const noSearchMatches = !noServiceableKitchens && !!search.trim() && filtered.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24 container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <Bike className="w-6 h-6 text-primary" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Single Meal Order</h1>
            <p className="text-sm text-muted-foreground">Choose Menu & Time</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-primary" />
              {locationSummary}
            </p>
            <button
              onClick={() => setShowChangeLocation((prev) => !prev)}
              className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
            >
              Change location <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {showChangeLocation && (
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <button
                onClick={handleDetectLocation}
                disabled={detecting}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary text-sm text-left"
              >
                <LocateFixed className="w-4 h-4 text-primary" />
                {detecting ? "Detecting location..." : "Use current location (GPS)"}
              </button>

              <div className="flex gap-2">
                <input
                  value={manualAddressInput}
                  onChange={(e) => setManualAddressInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualAddressSave()}
                  placeholder="Enter address/locality"
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
                <button
                  onClick={handleManualAddressSave}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={zipInput}
                    onChange={(e) => setZipInput(normalizeZip(e.target.value))}
                    onKeyDown={(e) => e.key === "Enter" && handleZipSave()}
                    placeholder="ZIP code"
                    maxLength={5}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
                <button
                  onClick={handleZipSave}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                >
                  Save ZIP
                </button>
              </div>

              {locationError && <p className="text-xs text-destructive">{locationError}</p>}
            </div>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              const next = e.target.value;
              setSearch(next);
              updateUrl(next);
            }}
            placeholder="Search kitchens, cuisines, locations, dishes..."
            className="w-full pl-11 pr-12 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
          <button onClick={() => setShowFilters(!showFilters)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
          {categoryFilters.map((c) => (
            <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === c ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:border-primary/40"}`}>
              {c}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 mb-4 flex flex-wrap items-center gap-4 animate-scale-in">
            <button onClick={() => setVegOnly(!vegOnly)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${vegOnly ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}>
              <Leaf className="w-3.5 h-3.5" /> Veg Only
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground outline-none">
                {sortOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            {(vegOnly || selectedCategory !== "All") && (
              <button onClick={() => { setVegOnly(false); setSelectedCategory("All"); }} className="flex items-center gap-1 text-xs text-destructive hover:underline">
                <X className="w-3 h-3" /> Clear Filters
              </button>
            )}
          </div>
        )}

        {locationStatus === "found" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <MapPin className="w-3 h-3 text-primary" /> Showing kitchens within <strong className="text-foreground">{radiusKm || 7} km</strong> when nearby coordinates are available
          </div>
        )}

        {locationStatus === "denied" && (
          <div className="flex items-center gap-2 text-xs text-destructive mb-2">
            <MapPin className="w-3 h-3" /> Location access denied. Use address or ZIP to filter this area.
          </div>
        )}

        {locationStatus === "invalid_zip" && (
          <div className="flex items-center gap-2 text-xs text-destructive mb-2">
            <MapPin className="w-3 h-3" /> Invalid ZIP code. Enter a valid 5-digit ZIP.
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} live kitchen{filtered.length !== 1 ? "s" : ""} available now
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((kitchen: any) => (
            <Link key={kitchen.id} to={`/instant-delivery/kitchen/${kitchen.id}`} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="relative h-44 overflow-hidden">
                <img src={kitchen.image} alt={kitchen.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {kitchen.is_branded && <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs">Shero Branded</Badge>}
                <Badge className="absolute top-3 right-3 bg-accent/90 text-accent-foreground text-[10px]">🟢 Live</Badge>
                {kitchen.distance != null && (
                  <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-foreground">{kitchen.distance.toFixed(1)} km</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{kitchen.name}</h3>
                <p className="text-xs text-muted-foreground">{(kitchen.cuisine || []).join(" • ")} — {kitchen.location}</p>
              </div>
            </Link>
          ))}
        </div>

        {noServiceableKitchens && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No serviceable kitchens found in this area. Try changing location.</p>
          </div>
        )}

        {noSearchMatches && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No match for “{search.trim()}” in this area.</p>
          </div>
        )}

        {!noServiceableKitchens && !noSearchMatches && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No live kitchens found. Try adjusting your filters.</p>
          </div>
        )}

        {unavailablePartners.length > 0 && (
          <div className="mt-8">
            <button onClick={() => setShowUnavailable(!showUnavailable)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
              <AlertTriangle className="w-4 h-4" />
              {showUnavailable ? "Hide" : "Show"} unavailable kitchens ({unavailablePartners.length})
            </button>
            {showUnavailable && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
                {unavailablePartners.map((kitchen: any) => (
                  <div key={kitchen.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="relative h-44 overflow-hidden">
                      <img src={kitchen.image} alt={kitchen.name} className="w-full h-full object-cover grayscale" />
                      <Badge variant="destructive" className="absolute top-3 right-3 text-[10px]">Closed Today</Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{kitchen.name}</h3>
                      <p className="text-xs text-muted-foreground">{(kitchen.cuisine || []).join(" • ")} — {kitchen.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default InstantDelivery;
