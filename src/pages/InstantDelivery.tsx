import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Leaf, X, Bike, AlertTriangle, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { useNearbyKitchenPartners, useInstantMenuCategories, useKitchenVisibilityRadius } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { useRegion } from "@/contexts/RegionContext";
import { useLocation as useLocationCtx } from "@/contexts/LocationContext";
import { supabase } from "@/integrations/supabase/client";

const sortOptions = ["Relevance", "Distance"];

const InstantDelivery = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("Relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const { formatPrice } = useRegion();
  const locationCtx = useLocationCtx();

  // Customer location
  const [customerLat, setCustomerLat] = useState<number | null>(locationCtx.coords?.lat ?? null);
  const [customerLng, setCustomerLng] = useState<number | null>(locationCtx.coords?.lng ?? null);
  const [locationStatus, setLocationStatus] = useState<"detecting" | "found" | "denied" | "idle">("idle");
  const searchQueryParam = searchParams.get("q") || "";

  useEffect(() => {
    setSearch(searchQueryParam);
  }, [searchQueryParam]);

  useEffect(() => {
    if (locationCtx.coords) {
      setCustomerLat(locationCtx.coords.lat);
      setCustomerLng(locationCtx.coords.lng);
      setLocationStatus("found");
      return;
    }
    if (!navigator.geolocation) return;
    setLocationStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLat(pos.coords.latitude);
        setCustomerLng(pos.coords.longitude);
        locationCtx.setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("found");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [locationCtx.coords, locationCtx.setCoords]);

  const { data: menuCategories } = useInstantMenuCategories();
  const categoryFilters = useMemo(() => ["All", ...(menuCategories || [])], [menuCategories]);
  const { data: radiusKm } = useKitchenVisibilityRadius();
  const normalizedSearch = search.trim().toLowerCase();
  const searchForMenuMatch = normalizedSearch.replace(/,/g, " ");
  const { data: matchedKitchenIds = [] } = useQuery({
    queryKey: ["instant_menu_search_kitchen_ids", normalizedSearch],
    queryFn: async () => {
      if (!normalizedSearch) return [];
      const { data, error } = await supabase
        .from("instant_menu_items")
        .select("kitchen_id")
        .eq("is_active", true)
        .or(`name.ilike.%${searchForMenuMatch}%,category.ilike.%${searchForMenuMatch}%`);
      if (error) throw error;
      return Array.from(new Set((data || []).map((item: any) => item.kitchen_id)));
    },
    enabled: !!normalizedSearch,
    staleTime: 60 * 1000,
  });
  const matchedKitchenIdSet = useMemo(() => new Set(matchedKitchenIds), [matchedKitchenIds]);

  const { data: allKitchens, isLoading } = useNearbyKitchenPartners(customerLat, customerLng);

  const livePartners = useMemo(() => (allKitchens || []).filter((k: any) => k.is_attendance_marked), [allKitchens]);
  const unavailablePartners = useMemo(() => (allKitchens || []).filter((k: any) => !k.is_attendance_marked), [allKitchens]);

  const filtered = useMemo(() => {
    let result = livePartners;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((k: any) => {
        const kitchenMatch =
          k.name.toLowerCase().includes(q) ||
          (k.cuisine || []).some((c: string) => c.toLowerCase().includes(q)) ||
          (k.location || "").toLowerCase().includes(q);
        return kitchenMatch || matchedKitchenIdSet.has(k.id);
      });
    }
    if (selectedCategory !== "All") {
      result = result.filter((k: any) => (k.cuisine || []).some((c: string) => c.toLowerCase() === selectedCategory.toLowerCase()));
    }
    if (vegOnly) {
      result = result.filter((k: any) => k.is_veg);
    }
    if (sortBy === "Distance") result = [...result].sort((a: any, b: any) => (a.distance ?? 999) - (b.distance ?? 999));
    return result;
  }, [search, selectedCategory, vegOnly, sortBy, livePartners, matchedKitchenIdSet]);

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

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search kitchens, cuisines, locations..." className="w-full pl-11 pr-12 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
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

        {locationStatus === "detecting" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <MapPin className="w-3 h-3 animate-pulse text-primary" /> Detecting your location...
          </div>
        )}
        {locationStatus === "found" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <MapPin className="w-3 h-3 text-primary" /> Showing kitchens within <strong className="text-foreground">{radiusKm || 7} km</strong> of your location
          </div>
        )}
        {locationStatus === "denied" && (
          <div className="flex items-center gap-2 text-xs text-destructive mb-2">
            <MapPin className="w-3 h-3" /> Location access denied — showing all kitchens
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} live kitchen{filtered.length !== 1 ? "s" : ""} available now</p>

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

        {filtered.length === 0 && (
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
