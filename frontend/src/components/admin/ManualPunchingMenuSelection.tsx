import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegion } from "@/contexts/RegionContext";
import {
  southIndianRegions,
  allMenuTypes,
  othersSpecialPrices,
  categoryLabels,
  type PartyMenuType,
  type PartyMenuCategory,
} from "@/data/partyMenuData";
import { ChevronDown, ChevronRight, ShoppingCart } from "lucide-react";

export interface SelectedCartItem {
  itemId: string;
  itemName: string;
  categoryName: string;
  menuTypeName: string;
  cuisineName: string;
  pricePerPlate: number;
  portionSize: number;
  portionUnit: string;
}

interface Props {
  selectedItems: Map<string, SelectedCartItem>;
  onSelectionChange: (items: Map<string, SelectedCartItem>) => void;
  guestCount: number;
}

const ManualPunchingMenuSelection = ({ selectedItems, onSelectionChange, guestCount }: Props) => {
  const { formatPrice } = useRegion();
  const [activeCuisine, setActiveCuisine] = useState(southIndianRegions[0].id);
  const [activeMenuType, setActiveMenuType] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const activeRegion = southIndianRegions.find(r => r.id === activeCuisine);
  const menuTypes = activeRegion?.menuTypes || [];

  // Auto-select first menu type when cuisine changes
  const currentMenuType = menuTypes.find(m => m.id === activeMenuType) || menuTypes[0] || null;

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  const toggleItem = (item: { id: string; name: string }, cat: PartyMenuCategory, menuType: PartyMenuType) => {
    const next = new Map(selectedItems);
    if (next.has(item.id)) {
      next.delete(item.id);
    } else {
      next.set(item.id, {
        itemId: item.id,
        itemName: item.name,
        categoryName: cat.name,
        menuTypeName: menuType.name,
        cuisineName: activeRegion?.name || "",
        pricePerPlate: othersSpecialPrices[item.id] || cat.pricePerItem,
        portionSize: cat.portionSize,
        portionUnit: cat.portionUnit,
      });
    }
    onSelectionChange(next);
  };

  const totalPerGuest = useMemo(() => {
    let sum = 0;
    selectedItems.forEach(item => { sum += item.pricePerPlate; });
    return sum;
  }, [selectedItems]);

  const grandTotal = totalPerGuest * guestCount;

  return (
    <div className="space-y-3">
      {/* Cuisine tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {southIndianRegions.map(region => (
          <button
            key={region.id}
            onClick={() => { setActiveCuisine(region.id); setActiveMenuType(null); setExpandedCategories(new Set()); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
              activeCuisine === region.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-secondary"
            }`}
          >
            {region.emoji} {region.name.replace(" Menu", "")}
          </button>
        ))}
      </div>

      {/* Menu type tabs */}
      {menuTypes.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {menuTypes.map(mt => (
            <button
              key={mt.id}
              onClick={() => { setActiveMenuType(mt.id); setExpandedCategories(new Set()); }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border whitespace-nowrap transition-colors ${
                (currentMenuType?.id === mt.id)
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border hover:bg-secondary"
              }`}
            >
              {mt.emoji} {mt.name}
            </button>
          ))}
        </div>
      )}

      {/* Categories & Items */}
      {currentMenuType && (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
          {currentMenuType.categories.map(cat => {
            const isExpanded = expandedCategories.has(cat.id);
            const selectedInCat = cat.items.filter(i => selectedItems.has(i.id)).length;
            return (
              <div key={cat.id} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span className="font-medium text-foreground">{categoryLabels[cat.name] || cat.name}</span>
                    <span className="text-muted-foreground">({cat.portionSize}{cat.portionUnit} • {formatPrice(cat.pricePerItem)}/plate)</span>
                  </div>
                  {selectedInCat > 0 && (
                    <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">
                      {selectedInCat} selected
                    </Badge>
                  )}
                </button>
                {isExpanded && (
                  <div className="p-2 space-y-1">
                    {cat.items.map(item => {
                      const isSelected = selectedItems.has(item.id);
                      const price = othersSpecialPrices[item.id] || cat.pricePerItem;
                      return (
                        <label
                          key={item.id}
                          className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                            isSelected ? "bg-primary/5 border border-primary/20" : "hover:bg-secondary"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleItem(item, cat, currentMenuType)}
                              className="w-3.5 h-3.5"
                            />
                            <span className="text-xs text-foreground">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{formatPrice(price)}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add-ons */}
          {currentMenuType.addOns && currentMenuType.addOns.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(`addons-${currentMenuType.id}`)}
                className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs">
                  {expandedCategories.has(`addons-${currentMenuType.id}`) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span className="font-medium text-foreground">⭐ Add-Ons</span>
                </div>
              </button>
              {expandedCategories.has(`addons-${currentMenuType.id}`) && (
                <div className="p-2 space-y-1">
                  {currentMenuType.addOns.map(addon => {
                    const isSelected = selectedItems.has(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/5 border border-primary/20" : "hover:bg-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => {
                              const next = new Map(selectedItems);
                              if (next.has(addon.id)) {
                                next.delete(addon.id);
                              } else {
                                next.set(addon.id, {
                                  itemId: addon.id,
                                  itemName: addon.name,
                                  categoryName: "Add-Ons",
                                  menuTypeName: currentMenuType.name,
                                  cuisineName: activeRegion?.name || "",
                                  pricePerPlate: addon.price,
                                  portionSize: 0,
                                  portionUnit: "",
                                });
                              }
                              onSelectionChange(next);
                            }}
                            className="w-3.5 h-3.5"
                          />
                          <div>
                            <span className="text-xs text-foreground">{addon.name}</span>
                            {addon.description && <p className="text-[9px] text-muted-foreground">{addon.description}</p>}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{formatPrice(addon.price)}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating cart summary */}
      <div className="sticky bottom-0 p-3 bg-secondary rounded-xl border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{selectedItems.size} items selected</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">{formatPrice(totalPerGuest)}/guest × {guestCount}</p>
            <p className="text-sm font-bold text-primary">{formatPrice(grandTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualPunchingMenuSelection;
