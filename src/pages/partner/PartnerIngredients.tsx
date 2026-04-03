import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { vegetables as defaultVegetables, partnerCuisine } from "@/data/partnerMockData";
import { useToast } from "@/hooks/use-toast";

const PartnerIngredients = () => {
  const [vegs, setVegs] = useState(defaultVegetables);
  const { toast } = useToast();
  const isIndian = partnerCuisine === "Indian";

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

  const availableCount = vegs.filter((v) => v.isAvailable).length;

  if (!isIndian) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-foreground">Ingredient Inventory</h2>
        <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">Ingredient-level inventory is available for <strong>Indian cuisine</strong> kitchens only.</p>
          <p className="text-sm text-muted-foreground mt-2">Use the Menu Items page to toggle items on/off directly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-foreground">Ingredient Inventory</h2>
        <Badge variant="secondary" className="text-xs">
          {availableCount}/{vegs.length} available
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Toggle ingredients on/off. Menu items requiring unavailable ingredients will automatically be hidden from customers.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {vegs.map((v) => (
          <button
            key={v.id}
            onClick={() => toggleVeg(v.id)}
            className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-center
              ${v.isAvailable
                ? "border-emerald-200 bg-emerald-50/60 shadow-sm"
                : "border-destructive/20 bg-destructive/5 opacity-60"
              }
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
  );
};

export default PartnerIngredients;
