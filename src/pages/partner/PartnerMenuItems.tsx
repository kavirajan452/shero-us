import { useState, useMemo } from "react";
import { Leaf, Check, AlertTriangle, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Lock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { partnerMenu as defaultMenu, vegetables as defaultVegetables, menuIngredientMap as defaultIngredientMap, partnerCuisine, partnerType } from "@/data/partnerMockData";
import { useRegion } from "@/contexts/RegionContext";
import { useToast } from "@/hooks/use-toast";

const PartnerMenuItems = () => {
  const [vegs] = useState(defaultVegetables);
  const [ingredientMap, setIngredientMap] = useState<Record<string, string[]>>(defaultIngredientMap);
  const [manualAvailability, setManualAvailability] = useState<Record<string, boolean>>({});
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const { formatPrice } = useRegion();
  const { toast } = useToast();

  const isIndian = partnerCuisine === "Indian";
  const isBranded = partnerType === "branded";
  const availableVegIds = useMemo(() => new Set(vegs.filter((v) => v.isAvailable).map((v) => v.id)), [vegs]);

  const items = useMemo(() => {
    return defaultMenu.map((item) => {
      if (isIndian) {
        const required = ingredientMap[item.id] || [];
        const allAvailable = required.length === 0 || required.every((id) => availableVegIds.has(id));
        const missingIngredients = required.filter((id) => !availableVegIds.has(id));
        return { ...item, isAvailable: allAvailable, missingIngredients };
      }
      const available = manualAvailability[item.id] ?? item.isAvailable;
      return { ...item, isAvailable: available, missingIngredients: [] as string[] };
    });
  }, [availableVegIds, isIndian, manualAvailability, ingredientMap]);

  const stockInCount = items.filter((i) => i.isAvailable).length;
  const stockOutCount = items.filter((i) => !i.isAvailable).length;

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (stockFilter === "in") list = list.filter((i) => i.isAvailable);
    if (stockFilter === "out") list = list.filter((i) => !i.isAvailable);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }, [items, searchQuery, stockFilter]);

  const filteredCategories = useMemo(() => [...new Set(filteredItems.map((i) => i.category))], [filteredItems]);

  const toggleManualAvailability = (id: string) => {
    setManualAvailability((prev) => {
      const current = prev[id] ?? defaultMenu.find((i) => i.id === id)?.isAvailable ?? true;
      const next = !current;
      const item = defaultMenu.find((i) => i.id === id);
      if (item) toast({ title: item.name, description: next ? "Now available" : "Marked unavailable" });
      return { ...prev, [id]: next };
    });
  };

  // Only marketplace partners can edit ingredient mapping
  const toggleIngredientForItem = (itemId: string, vegId: string) => {
    if (isBranded) return;
    setIngredientMap((prev) => {
      const current = prev[itemId] || [];
      const has = current.includes(vegId);
      const updated = has ? current.filter((id) => id !== vegId) : [...current, vegId];
      const veg = vegs.find((v) => v.id === vegId);
      const item = defaultMenu.find((i) => i.id === itemId);
      if (veg && item) {
        toast({ title: item.name, description: has ? `Removed ${veg.name}` : `Added ${veg.name} as required ingredient` });
      }
      return { ...prev, [itemId]: updated };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Menu Items</h2>
          {isBranded && (
            <div className="flex items-center gap-1.5 mt-1">
              <Lock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Centrally managed by Shero · Use Ingredients page to control availability</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isBranded && <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Branded</Badge>}
          <Badge variant="secondary" className="text-xs">{defaultMenu.length} items</Badge>
        </div>
      </div>

      {!isBranded && isIndian && (
        <p className="text-xs text-muted-foreground">
          Items auto-mapped from ingredients. Tap the arrow to edit required ingredients per dish.
        </p>
      )}

      {/* Stock filter tabs */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setStockFilter("all")}
          className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all font-semibold ${stockFilter === "all" ? "border-foreground bg-card shadow-sm" : "border-border bg-card/50 hover:border-muted-foreground/30"}`}
        >
          <span className="text-lg font-bold text-foreground">{items.length}</span>
          <span className="text-xs text-muted-foreground">Items</span>
        </button>
        <button
          onClick={() => setStockFilter("in")}
          className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all font-semibold ${stockFilter === "in" ? "border-accent bg-accent/10 shadow-sm" : "border-border bg-card/50 hover:border-accent/30"}`}
        >
          <span className="text-lg font-bold text-accent">{stockInCount}</span>
          <span className="text-xs text-accent">Stock In</span>
        </button>
        <button
          onClick={() => setStockFilter("out")}
          className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all font-semibold ${stockFilter === "out" ? "border-destructive bg-destructive/10 shadow-sm" : "border-border bg-card/50 hover:border-destructive/30"}`}
        >
          <span className="text-lg font-bold text-destructive">{stockOutCount}</span>
          <span className="text-xs text-destructive">Stock Out</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search items & categories"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">No items match "{searchQuery}"</p>
      )}

      {filteredCategories.map((cat) => (
        <div key={cat} className="mb-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat}</h4>
          <div className="space-y-2">
            {filteredItems
              .filter((i) => i.category === cat)
              .map((item) => {
                const isExpanded = expandedItem === item.id;
                const itemIngredients = ingredientMap[item.id] || [];

                return (
                  <Card key={item.id} className={`border-border transition-opacity ${!item.isAvailable ? "opacity-50" : ""}`}>
                    <CardContent className="p-3">
                      <div className="flex gap-3 items-center">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0 bg-muted" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground text-sm">{item.name}</span>
                            {item.isVeg && <Leaf className="w-3.5 h-3.5 text-accent shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                          <p className="font-bold text-foreground text-sm mt-0.5">
                            {formatPrice(item.price)} <span className="text-[9px] font-normal text-muted-foreground">(Partner Price)</span>
                          </p>

                          {isIndian && itemIngredients.length > 0 && (
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

                          {!isBranded && isIndian && itemIngredients.length === 0 && (
                            <p className="text-[10px] text-muted-foreground/60 mt-1 italic">No ingredients mapped — expand to set</p>
                          )}

                          {isIndian && item.missingIngredients.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-destructive">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span className="text-[10px]">Unavailable — item hidden from customers</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          {!isIndian ? (
                            <>
                              <button onClick={() => toggleManualAvailability(item.id)} className="text-foreground">
                                {item.isAvailable ? <ToggleRight className="w-8 h-8 text-accent" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                              </button>
                              <Badge variant={item.isAvailable ? "default" : "secondary"} className="text-[9px]">{item.isAvailable ? "Live" : "Off"}</Badge>
                            </>
                          ) : (
                            <>
                              <Badge variant={item.isAvailable ? "default" : "secondary"} className="text-[9px]">{item.isAvailable ? "Live" : "Off"}</Badge>
                              {/* Branded partners can't edit ingredient mapping — only view */}
                              {!isBranded && (
                                <button onClick={() => setExpandedItem(isExpanded ? null : item.id)} className="mt-1 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Ingredient editor — marketplace only */}
                      {!isBranded && isIndian && isExpanded && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select required ingredients for this dish</p>
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
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartnerMenuItems;
