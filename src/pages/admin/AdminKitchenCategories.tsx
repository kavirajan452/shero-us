import { useState, useMemo } from "react";
import { Plus, Store, ChevronRight, ChevronDown, Pencil, Trash2, ToggleLeft, ToggleRight, Tag, ShieldCheck, Home, Search, Filter, MapPin, Users } from "lucide-react";
import { PartnerLocationsTab } from "@/components/admin/PartnerLocationsTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ═══ DATA HOOKS ═══
function useKitchenBrands() {
  return useQuery({
    queryKey: ["kitchen_partners_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kitchen_partners").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

function useKitchenCategories() {
  return useQuery({
    queryKey: ["kitchen_categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kitchen_categories").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

function usePartnerLocations() {
  return useQuery({
    queryKey: ["kitchen_partner_locations"],
    queryFn: async () => {
      // Fetch in batches to handle >1000 rows
      let allData: any[] = [];
      let from = 0;
      const batchSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("kitchen_partner_locations")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + batchSize - 1);
        if (error) throw error;
        allData = allData.concat(data || []);
        if (!data || data.length < batchSize) break;
        from += batchSize;
      }
      return allData;
    },
  });
}

const AdminKitchenCategories = () => {
  const queryClient = useQueryClient();
  const { data: kitchens, isLoading: kitchensLoading } = useKitchenBrands();
  const { data: categories, isLoading: categoriesLoading } = useKitchenCategories();
  const { data: partnerLocations, isLoading: locationsLoading } = usePartnerLocations();

  // Kitchen dialog state
  const [showKitchenDialog, setShowKitchenDialog] = useState(false);
  const [editingKitchen, setEditingKitchen] = useState<any>(null);
  const [kitchenSearch, setKitchenSearch] = useState("");
  const [kitchenTypeFilter, setKitchenTypeFilter] = useState<"all" | "branded" | "unbranded">("all");

  // Category dialog state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedBrandForCat, setSelectedBrandForCat] = useState<string>("");
  const [expandedKitchen, setExpandedKitchen] = useState<string | null>(null);

  // Partner Location dialog state
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [locKitchenId, setLocKitchenId] = useState("");
  const [locPartnerName, setLocPartnerName] = useState("");
  const [locPartnerPhone, setLocPartnerPhone] = useState("");
  const [locPincode, setLocPincode] = useState("");
  const [locLatitude, setLocLatitude] = useState("");
  const [locLongitude, setLocLongitude] = useState("");
  const [locLocation, setLocLocation] = useState("");
  const [locSearch, setLocSearch] = useState("");

  // Kitchen form
  const [kName, setKName] = useState("");
  const [kCuisine, setKCuisine] = useState("");
  const [kLocation, setKLocation] = useState("");
  const [kIsBranded, setKIsBranded] = useState(true);
  const [kIsVeg, setKIsVeg] = useState(false);
  const [kMinOrder, setKMinOrder] = useState("199");
  const [kDeliveryTime, setKDeliveryTime] = useState("30-40 min");
  const [kFoodPref, setKFoodPref] = useState("both");
  // For unbranded only (single-partner kitchen)
  const [kPincode, setKPincode] = useState("");
  const [kLatitude, setKLatitude] = useState("");
  const [kLongitude, setKLongitude] = useState("");

  // Radius config
  const { data: radiusConfig } = useQuery({
    queryKey: ["kitchen_visibility_radius"],
    queryFn: async () => {
      const { data } = await supabase.from("app_config").select("value").eq("key", "kitchen_visibility_radius_km").maybeSingle();
      return data ? Number(data.value) : 7;
    },
  });

  // Category form
  const [catName, setCatName] = useState("");
  const [catSubCategory, setCatSubCategory] = useState("");
  const [catIcon, setCatIcon] = useState("");
  const [catOrder, setCatOrder] = useState("0");

  // ═══ DERIVED DATA ═══
  const brandedKitchens = useMemo(() => (kitchens || []).filter((k: any) => k.is_branded), [kitchens]);
  const unbrandedKitchens = useMemo(() => (kitchens || []).filter((k: any) => !k.is_branded), [kitchens]);

  const filteredKitchens = useMemo(() => {
    let result = kitchens || [];
    if (kitchenTypeFilter === "branded") result = result.filter((k: any) => k.is_branded);
    if (kitchenTypeFilter === "unbranded") result = result.filter((k: any) => !k.is_branded);
    if (kitchenSearch) {
      const q = kitchenSearch.toLowerCase();
      result = result.filter((k: any) => k.name.toLowerCase().includes(q) || (k.location || "").toLowerCase().includes(q));
    }
    return result;
  }, [kitchens, kitchenTypeFilter, kitchenSearch]);

  const getLocationsForKitchen = (kitchenId: string) =>
    (partnerLocations || []).filter((l: any) => l.kitchen_id === kitchenId);

  const getCategoriesForKitchen = (kitchenId: string) =>
    (categories || []).filter((c: any) => c.kitchen_id === kitchenId);

  const filteredLocations = useMemo(() => {
    let result = partnerLocations || [];
    if (locSearch) {
      const q = locSearch.toLowerCase();
      result = result.filter((l: any) =>
        l.partner_name.toLowerCase().includes(q) ||
        (l.pincode || "").includes(q) ||
        (l.location || "").toLowerCase().includes(q) ||
        (l.kitchen_id || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [partnerLocations, locSearch]);

  // ═══ KITCHEN MUTATIONS ═══
  const createKitchen = useMutation({
    mutationFn: async () => {
      const id = kName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const cuisineArr = kCuisine.split(",").map((s) => s.trim()).filter(Boolean);
      const insertData: any = {
        id, name: kName, partner_id: id, cuisine: cuisineArr,
        location: kLocation, is_branded: kIsBranded, is_veg: kIsVeg,
        min_order: parseFloat(kMinOrder) || 199, delivery_time: kDeliveryTime,
        food_preference: kFoodPref,
      };
      // For unbranded kitchens, location is on the kitchen itself
      if (!kIsBranded) {
        insertData.pincode = kPincode || null;
        insertData.latitude = kLatitude ? parseFloat(kLatitude) : null;
        insertData.longitude = kLongitude ? parseFloat(kLongitude) : null;
      }
      const { error } = await supabase.from("kitchen_partners").insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_partners_admin"] });
      toast.success(`${kIsBranded ? "Brand" : "Kitchen"} created successfully`);
      closeKitchenDialog();
    },
    onError: (e: any) => toast.error(e.message || "Failed to create"),
  });

  const updateKitchen = useMutation({
    mutationFn: async () => {
      if (!editingKitchen) return;
      const cuisineArr = kCuisine.split(",").map((s) => s.trim()).filter(Boolean);
      const updateData: any = {
        name: kName, cuisine: cuisineArr, location: kLocation,
        is_branded: kIsBranded, is_veg: kIsVeg,
        min_order: parseFloat(kMinOrder) || 199, delivery_time: kDeliveryTime,
        food_preference: kFoodPref,
      };
      if (!kIsBranded) {
        updateData.pincode = kPincode || null;
        updateData.latitude = kLatitude ? parseFloat(kLatitude) : null;
        updateData.longitude = kLongitude ? parseFloat(kLongitude) : null;
      }
      const { error } = await supabase.from("kitchen_partners").update(updateData).eq("id", editingKitchen.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_partners_admin"] });
      toast.success("Updated successfully");
      closeKitchenDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleKitchenActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("kitchen_partners").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_partners_admin"] });
      toast.success("Status updated");
    },
  });

  const deleteKitchen = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kitchen_partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_partners_admin"] });
      toast.success("Deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // ═══ PARTNER LOCATION MUTATIONS ═══
  const createLocation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("kitchen_partner_locations").insert({
        kitchen_id: locKitchenId,
        partner_name: locPartnerName,
        partner_phone: locPartnerPhone || null,
        pincode: locPincode,
        latitude: locLatitude ? parseFloat(locLatitude) : null,
        longitude: locLongitude ? parseFloat(locLongitude) : null,
        location: locLocation || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_partner_locations"] });
      toast.success("Partner location added");
      closeLocationDialog();
    },
    onError: (e: any) => toast.error(e.message || "Failed to add location"),
  });

  const updateLocation = useMutation({
    mutationFn: async () => {
      if (!editingLocation) return;
      const { error } = await supabase.from("kitchen_partner_locations").update({
        partner_name: locPartnerName,
        partner_phone: locPartnerPhone || null,
        pincode: locPincode,
        latitude: locLatitude ? parseFloat(locLatitude) : null,
        longitude: locLongitude ? parseFloat(locLongitude) : null,
        location: locLocation || null,
      }).eq("id", editingLocation.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_partner_locations"] });
      toast.success("Location updated");
      closeLocationDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleLocationActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("kitchen_partner_locations").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kitchen_partner_locations"] }),
  });

  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kitchen_partner_locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_partner_locations"] });
      toast.success("Location deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // ═══ CATEGORY MUTATIONS ═══
  const createCategory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("kitchen_categories").insert({
        kitchen_id: selectedBrandForCat,
        name: catName,
        sub_category: catSubCategory || null,
        icon: catIcon || null,
        display_order: parseInt(catOrder) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_categories"] });
      toast.success("Category added");
      closeCategoryDialog();
    },
    onError: (e: any) => toast.error(e.message || "Failed to create category"),
  });

  const updateCategory = useMutation({
    mutationFn: async () => {
      if (!editingCategory) return;
      const { error } = await supabase.from("kitchen_categories").update({
        name: catName,
        sub_category: catSubCategory || null,
        icon: catIcon || null,
        display_order: parseInt(catOrder) || 0,
      }).eq("id", editingCategory.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_categories"] });
      toast.success("Category updated");
      closeCategoryDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleCategoryActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("kitchen_categories").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kitchen_categories"] }),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kitchen_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_categories"] });
      toast.success("Category deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // ═══ DIALOG HELPERS ═══
  const resetKitchenForm = () => {
    setKName(""); setKCuisine(""); setKLocation("");
    setKPincode(""); setKLatitude(""); setKLongitude("");
    setKIsBranded(true); setKIsVeg(false); setKMinOrder("199");
    setKDeliveryTime("30-40 min"); setKFoodPref("both");
  };

  const closeKitchenDialog = () => {
    setShowKitchenDialog(false);
    setEditingKitchen(null);
    resetKitchenForm();
  };

  const openEditKitchen = (k: any) => {
    setEditingKitchen(k);
    setKName(k.name); setKCuisine((k.cuisine || []).join(", "));
    setKLocation(k.location || "");
    setKPincode(k.pincode || ""); setKLatitude(k.latitude ? String(k.latitude) : "");
    setKLongitude(k.longitude ? String(k.longitude) : "");
    setKIsBranded(k.is_branded);
    setKIsVeg(k.is_veg); setKMinOrder(String(k.min_order));
    setKDeliveryTime(k.delivery_time || "30-40 min");
    setKFoodPref(k.food_preference || "both");
    setShowKitchenDialog(true);
  };

  const resetCatForm = () => {
    setCatName(""); setCatSubCategory(""); setCatIcon(""); setCatOrder("0");
  };

  const closeCategoryDialog = () => {
    setShowCategoryDialog(false);
    setEditingCategory(null);
    resetCatForm();
  };

  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setSelectedBrandForCat(cat.kitchen_id);
    setCatName(cat.name);
    setCatSubCategory(cat.sub_category || "");
    setCatIcon(cat.icon || "");
    setCatOrder(String(cat.display_order));
    setShowCategoryDialog(true);
  };

  const openAddCategory = (kitchenId?: string) => {
    resetCatForm();
    setSelectedBrandForCat(kitchenId || "");
    setShowCategoryDialog(true);
  };

  const resetLocationForm = () => {
    setLocKitchenId(""); setLocPartnerName(""); setLocPartnerPhone("");
    setLocPincode(""); setLocLatitude(""); setLocLongitude(""); setLocLocation("");
  };

  const closeLocationDialog = () => {
    setShowLocationDialog(false);
    setEditingLocation(null);
    resetLocationForm();
  };

  const openEditLocation = (loc: any) => {
    setEditingLocation(loc);
    setLocKitchenId(loc.kitchen_id);
    setLocPartnerName(loc.partner_name);
    setLocPartnerPhone(loc.partner_phone || "");
    setLocPincode(loc.pincode || "");
    setLocLatitude(loc.latitude ? String(loc.latitude) : "");
    setLocLongitude(loc.longitude ? String(loc.longitude) : "");
    setLocLocation(loc.location || "");
    setShowLocationDialog(true);
  };

  const openAddLocation = (kitchenId?: string) => {
    resetLocationForm();
    if (kitchenId) setLocKitchenId(kitchenId);
    setShowLocationDialog(true);
  };

  const getKitchenName = (kitchenId: string) =>
    (kitchens || []).find((k: any) => k.id === kitchenId)?.name || kitchenId;

  if (kitchensLoading || categoriesLoading || locationsLoading) {
    return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground animate-pulse">Loading...</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          Kitchen & Category Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Master registry for brands & kitchens, partner locations, and category config. Visibility radius: <strong className="text-primary">{radiusConfig || 7} km</strong>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{(kitchens || []).length}</p>
            <p className="text-[10px] text-muted-foreground">Total Kitchens</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{brandedKitchens.length}</p>
            <p className="text-[10px] text-muted-foreground">Branded (SHF)</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{unbrandedKitchens.length}</p>
            <p className="text-[10px] text-muted-foreground">Unbranded (HCF)</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{(partnerLocations || []).length}</p>
            <p className="text-[10px] text-muted-foreground">Partner Locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{(kitchens || []).filter((k: any) => k.is_active).length}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{(categories || []).length}</p>
            <p className="text-[10px] text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="kitchens" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="kitchens" className="gap-1.5 text-xs">
            <Store className="w-3.5 h-3.5" /> Kitchen Master
          </TabsTrigger>
          <TabsTrigger value="locations" className="gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5" /> Partner Locations
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5 text-xs">
            <Tag className="w-3.5 h-3.5" /> Brand Categories
          </TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: KITCHEN MASTER ═══ */}
        <TabsContent value="kitchens" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={kitchenSearch} onChange={(e) => setKitchenSearch(e.target.value)} placeholder="Search kitchens..." className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={kitchenTypeFilter} onValueChange={(v) => setKitchenTypeFilter(v as any)}>
                <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Kitchens</SelectItem>
                  <SelectItem value="branded">Branded (SHF)</SelectItem>
                  <SelectItem value="unbranded">Unbranded (HCF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => { resetKitchenForm(); setShowKitchenDialog(true); }}>
              <Plus className="w-4 h-4" /> Add Kitchen / Brand
            </Button>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Architecture:</strong>{" "}
            <Badge variant="default" className="mx-1 text-[9px] px-1.5 py-0">Branded (SHF)</Badge> = a master brand operated by multiple partners from different locations.{" "}
            <Badge variant="outline" className="mx-1 text-[9px] px-1.5 py-0">Unbranded (HCF)</Badge> = a single home-chef kitchen with its own location.
            Add partner locations in the <strong>"Partner Locations"</strong> tab to make branded kitchens visible to nearby customers.
          </div>

          <div className="space-y-2">
            {filteredKitchens.map((kitchen: any) => {
              const catCount = getCategoriesForKitchen(kitchen.id).length;
              const locCount = getLocationsForKitchen(kitchen.id).length;
              return (
                <div key={kitchen.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${!kitchen.is_active ? "opacity-50 border-border bg-muted/20" : "border-border bg-card hover:border-primary/30"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${kitchen.is_branded ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>
                    {kitchen.is_branded ? <ShieldCheck className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{kitchen.name}</span>
                      <Badge variant={kitchen.is_branded ? "default" : "outline"} className="text-[9px] px-1.5 py-0">
                        {kitchen.is_branded ? "SHF Branded" : "HCF Unbranded"}
                      </Badge>
                      {!kitchen.is_active && <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Inactive</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {(kitchen.cuisine || []).join(" • ")}
                      {kitchen.is_branded ? (
                        <>
                          <span className="ml-2 text-green-600 font-medium">{locCount} partner{locCount !== 1 ? "s" : ""}</span>
                          <span className="ml-2 text-primary font-medium">{catCount} categories</span>
                        </>
                      ) : (
                        <>
                          {" — "}{kitchen.location || "No location"}
                          {kitchen.pincode && <span className="ml-1">📍 {kitchen.pincode}</span>}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {kitchen.is_branded && (
                      <>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => openAddLocation(kitchen.id)}>
                          <MapPin className="w-3 h-3" /> Partner
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => openAddCategory(kitchen.id)}>
                          <Plus className="w-3 h-3" /> Category
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditKitchen(kitchen)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => toggleKitchenActive.mutate({ id: kitchen.id, active: !kitchen.is_active })}>
                      {kitchen.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      onClick={() => { if (confirm(`Delete "${kitchen.name}"?`)) deleteKitchen.mutate(kitchen.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {filteredKitchens.length === 0 && (
              <div className="text-center py-12">
                <Store className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No kitchens found</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═══ TAB 2: PARTNER LOCATIONS ═══ */}
        <TabsContent value="locations" className="space-y-4">
          <PartnerLocationsTab
            partnerLocations={partnerLocations || []}
            brandedKitchens={brandedKitchens}
            radiusConfig={radiusConfig || 7}
            onAddLocation={openAddLocation}
            onEditLocation={openEditLocation}
          />
        </TabsContent>

        {/* ═══ TAB 3: BRAND CATEGORIES ═══ */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Manage food categories for <strong className="text-foreground">branded kitchens (SHF)</strong>. These categories appear in Menu Management and customer filters.
            </p>
            <Button size="sm" className="gap-1.5 shrink-0" onClick={() => openAddCategory()}>
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </div>

          {brandedKitchens.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No branded kitchens created yet. Create one in the Kitchen Master tab first.
            </div>
          ) : (
            <div className="space-y-3">
              {brandedKitchens.map((kitchen: any) => {
                const kitchenCats = getCategoriesForKitchen(kitchen.id);
                const isExpanded = expandedKitchen === kitchen.id;
                return (
                  <Card key={kitchen.id} className={`transition-all ${!kitchen.is_active ? "opacity-50" : ""}`}>
                    <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors rounded-t-xl"
                      onClick={() => setExpandedKitchen(isExpanded ? null : kitchen.id)}>
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm text-foreground">{kitchen.name}</span>
                        <p className="text-[11px] text-muted-foreground">{(kitchen.cuisine || []).join(" • ")} — {kitchenCats.length} categories</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 mr-2"
                        onClick={(e) => { e.stopPropagation(); openAddCategory(kitchen.id); }}>
                        <Plus className="w-3 h-3" /> Add
                      </Button>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {isExpanded && (
                      <CardContent className="px-4 pb-4 pt-0">
                        {kitchenCats.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic py-4 text-center border-t border-border mt-1">
                            No categories yet. Add categories like Sambar, Puri, Idli, Rasam, Dosa, etc.
                          </p>
                        ) : (
                          <div className="border-t border-border mt-1 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {kitchenCats.map((cat: any) => (
                              <div key={cat.id} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${cat.is_active ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60"}`}>
                                {cat.icon && <span className="text-base">{cat.icon}</span>}
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-foreground block">{cat.name}</span>
                                  {cat.sub_category && <span className="text-[10px] text-muted-foreground">↳ {cat.sub_category}</span>}
                                </div>
                                <Badge variant="outline" className="text-[8px] px-1 shrink-0">#{cat.display_order}</Badge>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditCategory(cat)}>
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6"
                                    onClick={() => toggleCategoryActive.mutate({ id: cat.id, active: !cat.is_active })}>
                                    {cat.is_active ? <ToggleRight className="w-3.5 h-3.5 text-primary" /> : <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" />}
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"
                                    onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteCategory.mutate(cat.id); }}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══ KITCHEN DIALOG ═══ */}
      <Dialog open={showKitchenDialog} onOpenChange={(open) => { if (!open) closeKitchenDialog(); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingKitchen ? "Edit Kitchen / Brand" : "Create Kitchen / Brand"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex gap-2">
              <button onClick={() => setKIsBranded(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${kIsBranded ? "border-orange-500 bg-orange-50 text-orange-700" : "border-border text-muted-foreground hover:border-border/80"}`}>
                <ShieldCheck className="w-4 h-4" /> Branded (SHF)
              </button>
              <button onClick={() => setKIsBranded(false)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${!kIsBranded ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border text-muted-foreground hover:border-border/80"}`}>
                <Home className="w-4 h-4" /> Unbranded (HCF)
              </button>
            </div>

            <div className="bg-muted/50 rounded-md p-2 text-[11px] text-muted-foreground">
              {kIsBranded
                ? "Creates a master brand (e.g., Shero Home Food Chettinad). Multiple partners can operate this brand from different locations. Add partner locations in the Partner Locations tab."
                : "Creates a single home-chef kitchen with its own location. The partner manages their own menu via the Partner App."}
            </div>

            <div>
              <Label className="text-xs">{kIsBranded ? "Brand Name" : "Kitchen Name"} *</Label>
              <Input value={kName} onChange={(e) => setKName(e.target.value)}
                placeholder={kIsBranded ? "e.g., Shero Home Food Chettinad" : "e.g., Lakshmi's Kitchen"} />
            </div>
            <div>
              <Label className="text-xs">Cuisines (comma-separated) *</Label>
              <Input value={kCuisine} onChange={(e) => setKCuisine(e.target.value)} placeholder="e.g., Chettinad, South Indian" />
            </div>

            {kIsBranded ? (
              <div>
                <Label className="text-xs">Default Location Label</Label>
                <Input value={kLocation} onChange={(e) => setKLocation(e.target.value)} placeholder="e.g., Pan-India" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Branded kitchens get their actual location from partner locations, not here.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Location / Area</Label>
                    <Input value={kLocation} onChange={(e) => setKLocation(e.target.value)} placeholder="e.g., Midtown, Manhattan" />
                  </div>
                  <div>
                    <Label className="text-xs">ZIP Code *</Label>
                    <Input value={kPincode} onChange={(e) => setKPincode(e.target.value)} placeholder="e.g., 10001" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Latitude</Label>
                    <Input type="number" step="any" value={kLatitude} onChange={(e) => setKLatitude(e.target.value)} placeholder="e.g., 40.7128" />
                  </div>
                  <div>
                    <Label className="text-xs">Longitude</Label>
                    <Input type="number" step="any" value={kLongitude} onChange={(e) => setKLongitude(e.target.value)} placeholder="e.g., 80.2341" />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Min Order (₹)</Label>
                <Input type="number" value={kMinOrder} onChange={(e) => setKMinOrder(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Delivery Time</Label>
                <Input value={kDeliveryTime} onChange={(e) => setKDeliveryTime(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Food Preference</Label>
                <select value={kFoodPref} onChange={(e) => setKFoodPref(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                  <option value="veg">Veg Only</option>
                  <option value="non-veg">Non-Veg Only</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="pt-5">
                <div className="flex items-center gap-2">
                  <Switch checked={kIsVeg} onCheckedChange={setKIsVeg} />
                  <Label className="text-xs">Pure Veg Kitchen</Label>
                </div>
              </div>
            </div>
            <Button className="w-full" disabled={!kName.trim() || !kCuisine.trim()}
              onClick={() => editingKitchen ? updateKitchen.mutate() : createKitchen.mutate()}>
              {editingKitchen ? "Update" : "Create"} {kIsBranded ? "Brand" : "Kitchen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ PARTNER LOCATION DIALOG ═══ */}
      <Dialog open={showLocationDialog} onOpenChange={(open) => { if (!open) closeLocationDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLocation ? "Edit Partner Location" : "Add Partner Location"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs">Brand / Kitchen *</Label>
              <Select value={locKitchenId} onValueChange={setLocKitchenId} disabled={!!editingLocation}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Select a branded kitchen..." /></SelectTrigger>
                <SelectContent>
                  {brandedKitchens.map((k: any) => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Partner Name *</Label>
                <Input value={locPartnerName} onChange={(e) => setLocPartnerName(e.target.value)} placeholder="e.g., Priya" />
              </div>
              <div>
                <Label className="text-xs">Partner Phone</Label>
                <Input value={locPartnerPhone} onChange={(e) => setLocPartnerPhone(e.target.value)} placeholder="e.g., (212) 555-0100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">ZIP Code *</Label>
                <Input value={locPincode} onChange={(e) => setLocPincode(e.target.value)} placeholder="e.g., 10001" />
              </div>
              <div>
                <Label className="text-xs">Area / Location</Label>
                <Input value={locLocation} onChange={(e) => setLocLocation(e.target.value)} placeholder="e.g., Midtown, Manhattan" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Latitude</Label>
                <Input type="number" step="any" value={locLatitude} onChange={(e) => setLocLatitude(e.target.value)} placeholder="13.0418" />
              </div>
              <div>
                <Label className="text-xs">Longitude</Label>
                <Input type="number" step="any" value={locLongitude} onChange={(e) => setLocLongitude(e.target.value)} placeholder="80.2341" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground -mt-2">
              This partner's location will make <strong>{locKitchenId ? getKitchenName(locKitchenId) : "the brand"}</strong> visible to customers within <strong className="text-primary">{radiusConfig || 7} km</strong>.
            </p>
            <Button className="w-full" disabled={!locKitchenId || !locPartnerName.trim() || !locPincode.trim()}
              onClick={() => editingLocation ? updateLocation.mutate() : createLocation.mutate()}>
              {editingLocation ? "Update Location" : "Add Partner Location"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ CATEGORY DIALOG ═══ */}
      <Dialog open={showCategoryDialog} onOpenChange={(open) => { if (!open) closeCategoryDialog(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category to Brand"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs">Select Brand *</Label>
              <Select value={selectedBrandForCat} onValueChange={setSelectedBrandForCat} disabled={!!editingCategory}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Choose a branded kitchen..." /></SelectTrigger>
                <SelectContent>
                  {brandedKitchens.map((k: any) => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Category Name *</Label>
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g., Sambar, Puri, Idli, Rasam" />
            </div>
            <div>
              <Label className="text-xs">Sub-category (optional)</Label>
              <Input value={catSubCategory} onChange={(e) => setCatSubCategory(e.target.value)} placeholder="e.g., Special Sambar, Mini Idli" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Icon (emoji)</Label>
                <Input value={catIcon} onChange={(e) => setCatIcon(e.target.value)} placeholder="e.g., 🍛" />
              </div>
              <div>
                <Label className="text-xs">Display Order</Label>
                <Input type="number" value={catOrder} onChange={(e) => setCatOrder(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" disabled={!catName.trim() || !selectedBrandForCat}
              onClick={() => editingCategory ? updateCategory.mutate() : createCategory.mutate()}>
              {editingCategory ? "Update Category" : "Add Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKitchenCategories;
