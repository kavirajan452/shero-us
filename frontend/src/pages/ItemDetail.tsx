import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, Leaf, Flame, Plus, Minus, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useInstantMenuItem, useKitchenPartner } from "@/hooks/useSupabaseData";
import type { MenuItem, AddOn } from "@/types/menu";
import { useCart } from "@/contexts/CartContext";
import { useRegion } from "@/contexts/RegionContext";
import { Badge } from "@/components/ui/badge";
import AddOnsDialog from "@/components/AddOnsDialog";

function dbToMenuItem(row: any): MenuItem {
  return {
    id: row.id,
    kitchenId: row.kitchen_id,
    name: row.name,
    description: row.description || "",
    price: Number(row.price),
    ppp: Number(row.ppp),
    image: row.image || "",
    category: row.category,
    isVeg: row.is_veg,
    isBestseller: row.is_bestseller,
    spiceLevel: row.spice_level || "mild",
    servingSize: row.serving_size || "",
    preparationTime: row.preparation_time || "",
    ingredients: row.ingredients || [],
    majorVegetables: row.major_vegetables || [],
    allergens: row.allergens || [],
    nutritionInfo: row.nutrition_info || { calories: 0, protein: "—", carbs: "—", fat: "—" },
    isToggledOn: row.is_toggled_on,
    addOns: Array.isArray(row.add_ons) ? row.add_ons : [],
  };
}

const spiceLabels: Record<string, string> = { mild: "Mild", medium: "Medium", spicy: "🔥 Spicy" };

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: rawItem, isLoading } = useInstantMenuItem(id);
  const item = rawItem ? dbToMenuItem(rawItem) : null;
  const { data: kitchen } = useKitchenPartner(item?.kitchenId);
  const { items: cartItems, addItem, updateQuantity } = useCart();
  const { formatPrice } = useRegion();
  const [showAddOns, setShowAddOns] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Item not found.</p>
      </div>
    );
  }

  const qty = cartItems.find((ci) => ci.item.id === item.id)?.quantity || 0;
  const cartTotal = cartItems.reduce((s, ci) => s + ci.quantity, 0);
  const cartAddOns = cartItems.find((ci) => ci.item.id === item.id)?.selectedAddOns || [];

  const handleAdd = () => {
    if (item.addOns?.length) {
      setShowAddOns(true);
    } else {
      addItem(item);
    }
  };

  const handleAddOnConfirm = (menuItem: MenuItem, selectedAddOns: AddOn[]) => {
    addItem(menuItem, selectedAddOns);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 pb-28">
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <Link to={`/instant-delivery/kitchen/${item.kitchenId}`} className="absolute top-20 left-4 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          {item.isBestseller && (
            <Badge className="absolute top-20 right-4 bg-yellow-500 text-white">⭐ Bestseller</Badge>
          )}
        </div>

        <div className="container mx-auto px-4 -mt-6 relative z-10">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {item.isVeg && <Leaf className="w-4 h-4 text-accent" />}
                  <span className="text-xs text-muted-foreground">{spiceLabels[item.spiceLevel] || "Mild"}</span>
                </div>
                <h1 className="text-2xl font-serif font-bold text-foreground">{item.name}</h1>
                {kitchen && (
                  <Link to={`/instant-delivery/kitchen/${kitchen.id}`} className="text-sm text-primary hover:underline mt-1 inline-block">
                    by {kitchen.name}
                  </Link>
                )}
              </div>
              <span className="text-2xl font-bold text-foreground">{formatPrice(item.price)}</span>
            </div>

            <p className="text-muted-foreground mt-4 leading-relaxed">{item.description}</p>
            {item.addOns?.length ? <p className="text-xs text-primary font-medium mt-2">✨ Customisable — add-ons available</p> : null}

            <div className="flex gap-4 mt-5 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="w-4 h-4" /> {item.preparationTime}</div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Flame className="w-4 h-4" /> {item.nutritionInfo.calories} cal</div>
              <div className="text-sm text-muted-foreground">{item.servingSize}</div>
            </div>

            <div className="mt-6">
              {qty === 0 ? (
                <button onClick={handleAdd} className="w-full py-3 rounded-xl bg-gradient-shero text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity">
                  Add to Cart — {formatPrice(item.price)}
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-4 bg-primary/10 rounded-xl py-3">
                    <button onClick={() => updateQuantity(item.id, qty - 1)} className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"><Minus className="w-5 h-5" /></button>
                    <span className="text-lg font-bold text-primary">{qty}</span>
                    <button onClick={() => updateQuantity(item.id, qty + 1)} className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"><Plus className="w-5 h-5" /></button>
                  </div>
                  {cartAddOns.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">Add-ons: {cartAddOns.map((a) => a.name).join(", ")}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ing) => (
                  <span key={ing} className="px-3 py-1 rounded-full bg-secondary text-sm text-foreground">{ing}</span>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3">Nutrition Info</h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: "Calories", value: `${item.nutritionInfo.calories}` },
                  { label: "Protein", value: item.nutritionInfo.protein },
                  { label: "Carbs", value: item.nutritionInfo.carbs },
                  { label: "Fat", value: item.nutritionInfo.fat },
                ].map((n) => (
                  <div key={n.label} className="bg-secondary rounded-lg p-3">
                    <span className="text-lg font-bold text-foreground">{n.value}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{n.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {item.allergens.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" /> Allergen Info
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.allergens.map((a) => (
                    <span key={a} className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {cartTotal > 0 && (
          <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
            <Link to="/checkout" className="flex items-center justify-between bg-gradient-shero text-primary-foreground px-6 py-4 rounded-2xl shadow-shero hover:opacity-95 transition-opacity">
              <span className="font-semibold">{cartTotal} item{cartTotal !== 1 ? "s" : ""}</span>
              <span className="font-bold text-lg">View Cart →</span>
            </Link>
          </div>
        )}
      </main>

      <AddOnsDialog item={showAddOns ? item : null} open={showAddOns} onClose={() => setShowAddOns(false)} onConfirm={handleAddOnConfirm} />
      <BottomNav />
    </div>
  );
};

export default ItemDetail;
