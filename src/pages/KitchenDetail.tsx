import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { useKitchenPartner, useInstantMenuItems } from "@/hooks/useSupabaseData";
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

const KitchenDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: kitchen, isLoading: loadingKitchen } = useKitchenPartner(id);
  const { data: rawItems, isLoading: loadingItems } = useInstantMenuItems(id);
  const items = useMemo(() => (rawItems || []).filter((m: any) => m.is_toggled_on).map(dbToMenuItem), [rawItems]);
  const { items: cartItems, addItem, updateQuantity } = useCart();
  const { formatPrice } = useRegion();
  const cartTotal = cartItems.reduce((s, ci) => s + ci.quantity, 0);
  const [addOnItem, setAddOnItem] = useState<MenuItem | null>(null);
  const categories = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);

  if (loadingKitchen || loadingItems) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading kitchen...</p>
      </div>
    );
  }

  if (!kitchen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Kitchen not found.</p>
      </div>
    );
  }

  const getCartQty = (itemId: string) => cartItems.find((ci) => ci.item.id === itemId)?.quantity || 0;

  const handleAddItem = (item: MenuItem) => {
    if (item.addOns?.length) {
      setAddOnItem(item);
    } else {
      addItem(item);
    }
  };

  const handleAddOnConfirm = (item: MenuItem, selectedAddOns: AddOn[]) => {
    addItem(item, selectedAddOns);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 pb-28">
        <div className="relative h-56 overflow-hidden">
          <img src={kitchen.image} alt={kitchen.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              {kitchen.is_branded && <Badge className="bg-primary text-primary-foreground text-xs">Shero Branded</Badge>}
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">{kitchen.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {kitchen.location}</span>
            </div>
          </div>
          <Link to="/instant-delivery" className="absolute top-20 left-4 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
        </div>

        <div className="container mx-auto px-4 mt-6">
          <p className="text-sm text-muted-foreground mb-6">{(kitchen.cuisine || []).join(" • ")}</p>

          {categories.map((cat) => (
            <div key={cat} className="mb-8">
              <h2 className="text-lg font-serif font-bold text-foreground mb-4 border-b border-border pb-2">{cat}</h2>
              <div className="space-y-4">
                {items.filter((i) => i.category === cat).map((item) => {
                  const qty = getCartQty(item.id);
                  return (
                    <div key={item.id} className="flex gap-4 bg-card border border-border rounded-xl p-3 hover:shadow-sm transition-shadow">
                      <Link to={`/instant-delivery/item/${item.id}`} className="shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/instant-delivery/item/${item.id}`} className="hover:text-primary transition-colors">
                            <h3 className="font-semibold text-foreground text-sm leading-tight">{item.name}</h3>
                          </Link>
                          {item.isVeg && <Leaf className="w-4 h-4 text-accent shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                        {item.addOns?.length ? <span className="text-[10px] text-primary font-medium">Customisable</span> : null}
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-foreground">{formatPrice(item.price)}</span>
                          {qty === 0 ? (
                            <button onClick={() => handleAddItem(item)} className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">ADD</button>
                          ) : (
                            <div className="flex items-center gap-2 bg-primary/10 rounded-lg">
                              <button onClick={() => updateQuantity(item.id, qty - 1)} className="p-1.5 text-primary hover:bg-primary/20 rounded-l-lg transition-colors"><Minus className="w-4 h-4" /></button>
                              <span className="text-sm font-bold text-primary w-5 text-center">{qty}</span>
                              <button onClick={() => updateQuantity(item.id, qty + 1)} className="p-1.5 text-primary hover:bg-primary/20 rounded-r-lg transition-colors"><Plus className="w-4 h-4" /></button>
                            </div>
                          )}
                        </div>
                        {item.isBestseller && <Badge variant="secondary" className="mt-1 text-[10px]">⭐ Bestseller</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {cartTotal > 0 && (
          <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
            <Link to="/checkout" className="flex items-center justify-between bg-gradient-shero text-primary-foreground px-6 py-4 rounded-2xl shadow-shero hover:opacity-95 transition-opacity">
              <span className="font-semibold">{cartTotal} item{cartTotal !== 1 ? "s" : ""} in cart</span>
              <span className="font-bold text-lg">View Cart →</span>
            </Link>
          </div>
        )}
      </main>

      <AddOnsDialog item={addOnItem} open={!!addOnItem} onClose={() => setAddOnItem(null)} onConfirm={handleAddOnConfirm} />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default KitchenDetail;
