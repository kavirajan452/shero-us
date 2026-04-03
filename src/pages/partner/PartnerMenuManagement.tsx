import { useState, useMemo } from "react";
import { Leaf, Check, AlertTriangle, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Lock, Pencil, X, Camera, Plus, FolderPlus, ArrowLeft, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  partnerMenu as defaultBrandedMenu,
  vegetables as defaultVegetables,
  menuIngredientMap as defaultIngredientMap,
} from "@/data/partnerMockData";
import { brandedCuisineMasters } from "@/data/masterMenuData";
import { useRegion } from "@/contexts/RegionContext";
import { useToast } from "@/hooks/use-toast";

// ── Mock unbranded kitchen menu ──
const unbrandedMenuItems = [
  { id: "u1", name: "Chicken Biryani", description: "Hyderabadi style dum biryani with tender chicken", price: 249, category: "Rice", isVeg: false, isAvailable: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200" },
  { id: "u2", name: "Mutton Curry", description: "Slow-cooked mutton in rich masala gravy", price: 349, category: "Curry", isVeg: false, isAvailable: true, image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=200" },
  { id: "u3", name: "Paneer Tikka", description: "Marinated paneer cubes grilled to perfection", price: 199, category: "Starters", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200" },
  { id: "u4", name: "Dal Makhani", description: "Creamy black lentils slow-cooked overnight", price: 179, category: "Curry", isVeg: true, isAvailable: false, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200" },
  { id: "u5", name: "Egg Fried Rice", description: "Wok-tossed rice with scrambled eggs and veggies", price: 149, category: "Rice", isVeg: false, isAvailable: true, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200" },
  { id: "u6", name: "Aloo Paratha", description: "Stuffed whole wheat flatbread with spiced potato filling", price: 89, category: "Breads", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200" },
];

const PartnerMenuManagement = () => {
  // ── Branded state ──
  const [vegs, setVegs] = useState(defaultVegetables);
  const [ingredientMap, setIngredientMap] = useState<Record<string, string[]>>(defaultIngredientMap);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [brandedStockFilter, setBrandedStockFilter] = useState<"all" | "in" | "out">("all");

  // ── Unbranded state ──
  const [unbrandedItems, setUnbrandedItems] = useState(unbrandedMenuItems);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  // ── Add category/item dialogs ──
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "", category: "", isVeg: true });

  const { formatPrice } = useRegion();
  const { toast } = useToast();

  const availableVegIds = useMemo(() => new Set(vegs.filter((v) => v.isAvailable).map((v) => v.id)), [vegs]);
  const availableCount = vegs.filter((v) => v.isAvailable).length;

  // ── Brand options from master data ──
  const brandOptions = useMemo(() => brandedCuisineMasters.map((b) => ({ value: b.cuisine, label: `${b.emoji} ${b.cuisine}` })), []);

  // ── Branded menu with ingredient availability ──
  // ── Build a videoUrl lookup from all master data ──
  const videoUrlMap = useMemo(() => {
    const mapById: Record<string, string> = {};
    const mapByName: Record<string, string> = {};
    brandedCuisineMasters.forEach((b) => b.menuItems.forEach((mi) => {
      if (mi.videoUrl) {
        mapById[mi.id] = mi.videoUrl;
        mapByName[mi.name.toLowerCase()] = mi.videoUrl;
      }
    }));
    return { mapById, mapByName };
  }, []);

  const brandedItems = useMemo(() => {
    let sourceItems = defaultBrandedMenu;
    let videoLookup: Record<string, string> = {};
    // When a specific brand is selected, show items from that cuisine master
    if (selectedBrand !== "all") {
      const master = brandedCuisineMasters.find((b) => b.cuisine === selectedBrand);
      if (master) {
        sourceItems = master.menuItems.map((mi) => ({
          id: mi.id,
          name: mi.name,
          description: mi.description,
          price: mi.statePrices[0]?.ppp ?? 0,
          category: mi.category,
          isVeg: mi.isVeg,
          isAvailable: true,
          image: mi.image,
        }));
        master.menuItems.forEach((mi) => { if (mi.videoUrl) videoLookup[mi.id] = mi.videoUrl; });
      }
    } else {
      // For "all" view, match by ID first, then fallback to name
      defaultBrandedMenu.forEach((item) => {
        const vid = videoUrlMap.mapById[item.id] || videoUrlMap.mapByName[item.name.toLowerCase()] || "";
        if (vid) videoLookup[item.id] = vid;
      });
    }
    return sourceItems.map((item) => {
      const required = ingredientMap[item.id] || [];
      const allAvailable = required.length === 0 || required.every((id) => availableVegIds.has(id));
      const missingIngredients = required.filter((id) => !availableVegIds.has(id));
      return { ...item, isAvailable: allAvailable, missingIngredients, videoUrl: videoLookup[item.id] || "" };
    });
  }, [availableVegIds, ingredientMap, selectedBrand, videoUrlMap]);

  const brandedStockInCount = brandedItems.filter((i) => i.isAvailable).length;
  const brandedStockOutCount = brandedItems.filter((i) => !i.isAvailable).length;
  const displayedBrandedItems = useMemo(() => {
    if (brandedStockFilter === "in") return brandedItems.filter((i) => i.isAvailable);
    if (brandedStockFilter === "out") return brandedItems.filter((i) => !i.isAvailable);
    return brandedItems;
  }, [brandedItems, brandedStockFilter]);
  const brandedCategories = useMemo(() => [...new Set(displayedBrandedItems.map((i) => i.category))], [displayedBrandedItems]);
  const unbrandedCategories = useMemo(() => [...new Set(unbrandedItems.map((i) => i.category))], [unbrandedItems]);

  // ── Ingredient toggle ──
  const toggleVeg = (id: string) => {
    setVegs((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const next = !v.isAvailable;
        toast({ title: v.name, description: next ? "Marked available" : "Marked unavailable" });
        return { ...v, isAvailable: next };
      })
    );
  };

  // ── Ingredient mapping for branded items ──
  const toggleIngredientForItem = (itemId: string, vegId: string) => {
    setIngredientMap((prev) => {
      const current = prev[itemId] || [];
      const has = current.includes(vegId);
      const updated = has ? current.filter((id) => id !== vegId) : [...current, vegId];
      const veg = vegs.find((v) => v.id === vegId);
      const item = defaultBrandedMenu.find((i) => i.id === itemId);
      if (veg && item) {
        toast({ title: item.name, description: has ? `Removed ${veg.name}` : `Added ${veg.name}` });
      }
      return { ...prev, [itemId]: updated };
    });
  };

  // ── Unbranded item toggle ──
  const toggleUnbrandedItem = (id: string) => {
    setUnbrandedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = !item.isAvailable;
        toast({ title: item.name, description: next ? "Now available" : "Marked unavailable" });
        return { ...item, isAvailable: next };
      })
    );
  };

  // ── Unbranded item edit ──
  const startEdit = (item: typeof unbrandedMenuItems[0]) => {
    setEditingItem(item.id);
    setEditForm({ name: item.name, description: item.description, price: item.price, isVeg: item.isVeg });
  };

  const saveEdit = (id: string) => {
    setUnbrandedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, ...editForm, price: Number(editForm.price) };
      })
    );
    toast({ title: "Item updated", description: editForm.name });
    setEditingItem(null);
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    // Add a placeholder item so the category appears
    const id = `u${Date.now()}`;
    setUnbrandedItems((prev) => [...prev, { id, name: "New Item", description: "Add description", price: 0, category: newCategoryName.trim(), isVeg: true, isAvailable: false, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200" }]);
    toast({ title: "Category added", description: newCategoryName.trim() });
    setNewCategoryName("");
    setShowAddCategory(false);
  };

  const addMenuItem = () => {
    if (!newItem.name.trim() || !newItem.category) return;
    const id = `u${Date.now()}`;
    setUnbrandedItems((prev) => [...prev, { id, name: newItem.name, description: newItem.description, price: Number(newItem.price) || 0, category: newItem.category, isVeg: newItem.isVeg, isAvailable: false, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200" }]);
    toast({ title: "Item added", description: newItem.name });
    setNewItem({ name: "", description: "", price: "", category: "", isVeg: true });
    setShowAddItem(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => window.history.back()} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <h2 className="text-2xl font-serif font-bold text-foreground">Menu Management</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your branded and unbranded kitchen menus. Kitchens sourced from Admin approval.
        </p>
      </div>

      <Tabs defaultValue="branded" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="branded" className="text-xs">
            <Lock className="w-3 h-3 mr-1.5" />
            Branded
          </TabsTrigger>
          <TabsTrigger value="unbranded" className="text-xs">
            <Pencil className="w-3 h-3 mr-1.5" />
            Unbranded
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ BRANDED TAB ═══════════ */}
        <TabsContent value="branded" className="space-y-6 mt-4">
          {/* Ingredient Inventory Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Ingredient Inventory</h3>
              <Badge variant="secondary" className="text-xs">{availableCount}/{vegs.length} available</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Toggle ingredients on/off. Menu items requiring unavailable ingredients will automatically be hidden from customers.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {vegs.map((v) => (
                <button
                  key={v.id}
                  onClick={() => toggleVeg(v.id)}
                  className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center
                    ${v.isAvailable ? "border-emerald-200 bg-emerald-50/60 shadow-sm" : "border-destructive/20 bg-destructive/5 opacity-60"}
                    hover:scale-105 active:scale-95`}
                >
                  {v.isAvailable && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="text-3xl leading-none">{v.emoji}</span>
                  <span className="text-xs font-medium text-foreground leading-tight">{v.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{v.nameHi}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Branded Menu Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-semibold text-foreground">Branded Menu Items</h3>
              <div className="flex items-center gap-2">
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brandOptions.map((b) => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Centrally Managed</Badge>
                <Badge variant="secondary" className="text-xs">{brandedItems.length} items</Badge>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Menu controlled by Shero · Use ingredient grid above to control availability</span>
            </div>

            {/* Stock filter tabs */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              <button
                onClick={() => setBrandedStockFilter("all")}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all font-semibold ${brandedStockFilter === "all" ? "border-foreground bg-card shadow-sm" : "border-border bg-card/50 hover:border-muted-foreground/30"}`}
              >
                <span className="text-lg font-bold text-foreground">{brandedItems.length}</span>
                <span className="text-xs text-muted-foreground">Items</span>
              </button>
              <button
                onClick={() => setBrandedStockFilter("in")}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all font-semibold ${brandedStockFilter === "in" ? "border-emerald-500 bg-emerald-500 shadow-sm" : "border-border bg-emerald-500 hover:border-emerald-400"}`}
              >
                <span className="text-lg font-bold text-white">{brandedStockInCount}</span>
                <span className="text-xs text-white">Stock In</span>
              </button>
              <button
                onClick={() => setBrandedStockFilter("out")}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all font-semibold ${brandedStockFilter === "out" ? "border-destructive bg-destructive/10 shadow-sm" : "border-border bg-card/50 hover:border-destructive/30"}`}
              >
                <span className="text-lg font-bold text-destructive">{brandedStockOutCount}</span>
                <span className="text-xs text-destructive">Stock Out</span>
              </button>
            </div>

            {brandedCategories.map((cat) => (
              <div key={cat} className="mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat}</h4>
                <div className="space-y-2">
                  {displayedBrandedItems
                    .filter((i) => i.category === cat)
                    .map((item) => {
                      const isExpanded = expandedItem === item.id;
                      const itemIngredients = ingredientMap[item.id] || [];
                      return (
                        <Card key={item.id} className={`border-border transition-opacity ${!item.isAvailable ? "opacity-50" : ""}`}>
                          <CardContent className="p-3">
                            <div className="flex gap-3 items-center">
                              {/* Image with embedded video play */}
                              <div className="relative w-14 h-14 shrink-0">
                                {playingVideo === item.id && item.videoUrl ? (
                                  <iframe
                                    src={`${item.videoUrl}?autoplay=1`}
                                    title={`${item.name} demo`}
                                    className="w-14 h-14 rounded-lg object-cover"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <>
                                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-muted" />
                                    {item.videoUrl && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setPlayingVideo(item.id); }}
                                        className="absolute bottom-0 right-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary shadow-md"
                                      >
                                        <Play className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground text-sm">{item.name}</span>
                                  {item.isVeg && <Leaf className="w-3.5 h-3.5 text-accent shrink-0" />}
                                  
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                                <p className="font-bold text-foreground text-sm mt-0.5">
                                  {formatPrice(item.price)} <span className="text-[9px] font-normal text-muted-foreground">(Partner Price)</span>
                                </p>
                                {itemIngredients.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {itemIngredients.map((vegId) => {
                                      const veg = vegs.find((v) => v.id === vegId);
                                      if (!veg) return null;
                                      const isMissing = !availableVegIds.has(vegId);
                                      return (
                                        <span key={vegId} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${isMissing ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-accent/10 text-accent border border-accent/20"}`}>
                                          {veg.emoji} {veg.name}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                                {item.missingIngredients.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-destructive">
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    <span className="text-[10px]">Unavailable — hidden from customers</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <Badge variant={item.isAvailable ? "default" : "secondary"} className="text-[9px]">{item.isAvailable ? "Live" : "Off"}</Badge>
                                <button onClick={() => setExpandedItem(isExpanded ? null : item.id)} className="mt-1 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-border space-y-3">

                                {/* Ingredients */}
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Required ingredients for this dish</p>
                                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                                    {vegs.map((v) => {
                                      const isSelected = itemIngredients.includes(v.id);
                                      return (
                                        <button key={v.id} onClick={() => toggleIngredientForItem(item.id, v.id)}
                                          className={`relative flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all text-center ${isSelected ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card hover:bg-muted/50"} active:scale-95`}>
                                          {isSelected && (
                                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                                              <Check className="w-2 h-2 text-primary-foreground" />
                                            </div>
                                          )}
                                          <span className="text-lg leading-none">{v.emoji}</span>
                                          <span className="text-[8px] font-medium text-foreground leading-tight">{v.name}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ═══════════ UNBRANDED TAB ═══════════ */}
        <TabsContent value="unbranded" className="space-y-6 mt-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-foreground">Your Kitchen Menu</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{unbrandedItems.length} items</Badge>

              {/* Add Category */}
              <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <FolderPlus className="w-3.5 h-3.5" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle>Add New Category</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    <Input placeholder="Category name (e.g. Starters, Rice)" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                    <Button className="w-full" onClick={addCategory} disabled={!newCategoryName.trim()}>Create Category</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Add Menu Item */}
              <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-xs gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle>Add Menu Item</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    <Input placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                    <Textarea placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="min-h-[60px]" />
                    <Input type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
                    <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {unbrandedCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => setNewItem({ ...newItem, isVeg: !newItem.isVeg })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${newItem.isVeg ? "bg-accent/10 text-accent border-accent/30" : "bg-destructive/10 text-destructive border-destructive/30"}`}
                    >
                      <Leaf className="w-3.5 h-3.5" />
                      {newItem.isVeg ? "Veg" : "Non-Veg"}
                    </button>
                    <Button className="w-full" onClick={addMenuItem} disabled={!newItem.name.trim() || !newItem.category}>Add Item</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Full control over your unbranded kitchen items. Toggle availability, edit details, mark veg/non-veg, update photos & pricing.
          </p>

          {unbrandedCategories.map((cat) => (
            <div key={cat} className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat}</h4>
              <div className="space-y-2">
                {unbrandedItems
                  .filter((i) => i.category === cat)
                  .map((item) => {
                    const isEditing = editingItem === item.id;
                    return (
                      <Card key={item.id} className={`border-border transition-opacity ${!item.isAvailable ? "opacity-50" : ""}`}>
                        <CardContent className="p-3">
                          {isEditing ? (
                            /* ── Edit mode ── */
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-foreground">Edit Item</span>
                                <button onClick={() => setEditingItem(null)} className="p-1 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
                              </div>
                              <div className="flex gap-3">
                                <div className="relative w-14 h-14 rounded-lg bg-muted shrink-0 overflow-hidden group cursor-pointer">
                                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Item name" className="h-8 text-sm" />
                                  <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" className="text-xs min-h-[50px]" />
                                  <div className="flex items-center gap-2">
                                    <Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="h-8 text-sm w-24" />
                                    <button
                                      onClick={() => setEditForm({ ...editForm, isVeg: !editForm.isVeg })}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-colors ${editForm.isVeg ? "bg-accent/10 text-accent border-accent/30" : "bg-destructive/10 text-destructive border-destructive/30"}`}
                                    >
                                      <Leaf className="w-3 h-3" />
                                      {editForm.isVeg ? "Veg" : "Non-Veg"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setEditingItem(null)}>Cancel</Button>
                                <Button size="sm" onClick={() => saveEdit(item.id)}>Save</Button>
                              </div>
                            </div>
                          ) : (
                            /* ── View mode ── */
                            <div className="flex gap-3 items-center">
                              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0 bg-muted" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground text-sm">{item.name}</span>
                                  <span className={`w-3 h-3 rounded-sm border-2 shrink-0 ${item.isVeg ? "border-accent bg-accent/20" : "border-destructive bg-destructive/20"}`} />
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                                <p className="font-bold text-foreground text-sm mt-0.5">{formatPrice(item.price)}</p>
                              </div>
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <button onClick={() => toggleUnbrandedItem(item.id)} className="text-foreground">
                                  {item.isAvailable ? <ToggleRight className="w-8 h-8 text-accent" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                                </button>
                                <Badge variant={item.isAvailable ? "default" : "secondary"} className="text-[9px]">{item.isAvailable ? "Live" : "Off"}</Badge>
                                <button onClick={() => startEdit(item)} className="mt-1 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerMenuManagement;
