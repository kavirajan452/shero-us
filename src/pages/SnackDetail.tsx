import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, MapPin, Minus, Plus, Truck, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import CartDrawer from "@/components/CartDrawer";
import { useSnackProductById, useSnackProducts } from "@/hooks/useSupabaseData";
import { useRegion } from "@/contexts/RegionContext";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

interface PackSize {
  label: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
}

const SnackDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useSnackProductById(id || "");
  const { data: rawAll } = useSnackProducts();
  const { formatPrice } = useRegion();
  const { items: cartItems, addItem, updateQuantity } = useCart();
  const [selectedPack, setSelectedPack] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const packSizes = (Array.isArray(product.pack_sizes) ? product.pack_sizes : []) as unknown as PackSize[];
  const pack = packSizes[selectedPack];
  const cartItem = cartItems.find((ci) => ci.item.id === product.id);
  const qty = cartItem?.quantity || 0;
  const cartTotal = cartItems.reduce((s, ci) => s + ci.quantity, 0);

  // Related products from same category
  const related = useMemo(() => {
    if (!rawAll) return [];
    return rawAll.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [rawAll, product]);

  const handleAddToCart = () => {
    if (!pack) return;
    addItem({
      id: product.id,
      kitchenId: "snacks",
      name: `${product.name} (${pack.label})`,
      description: product.description || "",
      price: pack.price,
      image: product.image || "",
      category: product.category,
      isVeg: true,
      isBestseller: product.is_bestseller || false,
      spiceLevel: "mild" as const,
      servingSize: pack.label,
      preparationTime: "Ships in 1-2 days",
      ingredients: (product.ingredients || "").split(", "),
      allergens: [],
      nutritionInfo: { calories: 0, protein: "—", carbs: "—", fat: "—" },
      ppp: Math.round(pack.price * 0.65),
      majorVegetables: [],
      isToggledOn: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 pb-28">
        {/* Product Image */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-secondary">
          <img src={product.image || ""} alt={product.name} className="w-full h-full object-cover" />
          <Link to="/sweets-snacks" className="absolute top-20 left-4 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          {product.region_tag && (
            <span className="absolute top-20 right-4 text-xs font-semibold bg-card/90 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-full border border-border/50 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-primary" /> {product.region_tag}
            </span>
          )}
          {(product.is_bestseller || product.is_new_launch) && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              {product.is_bestseller && <Badge className="bg-primary text-primary-foreground">⭐ Bestseller</Badge>}
              {product.is_new_launch && <Badge className="bg-accent text-accent-foreground">🆕 New</Badge>}
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 -mt-6 relative z-10">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            {product.badges && (product.badges as string[]).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(product.badges as string[]).map((b: string) => (
                  <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-semibold">{b}</span>
                ))}
              </div>
            )}
            <h1 className="text-xl font-serif font-bold text-foreground">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-bold text-foreground">{product.rating || 0}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{product.review_count || 0} reviews</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{product.description}</p>

            {/* Pack Sizes */}
            {packSizes.length > 1 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-foreground mb-2">Choose Pack Size</h3>
                <div className="flex gap-2 flex-wrap">
                  {packSizes.map((p: any, i: number) => (
                    <button key={i} onClick={() => setSelectedPack(i)} className={`px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all ${selectedPack === i ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/40"}`}>
                      <span className="block font-semibold">{p.label}</span>
                      <span className="block text-[10px] mt-0.5">
                        {formatPrice(p.price)}
                        {p.originalPrice && <span className="line-through text-muted-foreground ml-1">{formatPrice(p.originalPrice)}</span>}
                        {p.discountPercent && <span className="text-destructive ml-1">{p.discountPercent}% off</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { icon: Package, label: product.weight_info || "—" },
              { icon: Clock, label: `Shelf: ${product.shelf_life || "—"}` },
              { icon: MapPin, label: `From: ${product.made_in || "—"}` },
            ].map((d) => (
              <div key={d.label} className="bg-card border border-border rounded-xl p-2.5 text-center">
                <d.icon className="w-3.5 h-3.5 mx-auto text-primary mb-0.5" />
                <span className="text-[9px] text-muted-foreground leading-tight block">{d.label}</span>
              </div>
            ))}
          </div>

          {/* Ingredients */}
          {product.ingredients && (
            <div className="bg-card border border-border rounded-xl p-4 mt-4">
              <h3 className="font-semibold text-foreground text-sm mb-2">Ingredients</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{product.ingredients}</p>
            </div>
          )}

          {/* Shipping */}
          <div className="bg-card border border-border rounded-xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Shipping</h3>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>📦 Ships within 1-2 business days</p>
              <p>🚚 Free delivery above {formatPrice(499)}</p>
              <p>🌍 Pan-India delivery</p>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-6">
              <h3 className="text-base font-serif font-bold text-foreground mb-3">You may also like</h3>
              <div className="grid grid-cols-2 gap-3">
                {related.map((rp) => {
                  const rpPacks = (Array.isArray(rp.pack_sizes) ? rp.pack_sizes : []) as unknown as PackSize[];
                  const rPack = rpPacks[0];
                  return (
                    <Link key={rp.id} to={`/sweets-snacks/${rp.id}`} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                      <img src={rp.image || ""} alt={rp.name} className="w-full aspect-square object-cover" />
                      <div className="p-2.5">
                        <h4 className="text-xs font-semibold text-foreground line-clamp-2">{rp.name}</h4>
                        {rPack && <p className="text-xs font-bold text-foreground mt-1">{formatPrice(rPack.price)}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Add to Cart */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-4 py-3">
          <div className="max-w-lg mx-auto">
            {pack && qty === 0 ? (
              <button onClick={handleAddToCart} className="w-full py-3 rounded-xl bg-gradient-shero text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity">
                Add to Cart — {formatPrice(pack.price)}
              </button>
            ) : pack && qty > 0 ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-primary/10 rounded-xl px-4 py-2.5">
                  <button onClick={() => updateQuantity(product.id, qty - 1)} className="p-1.5 text-primary hover:bg-primary/20 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="text-base font-bold text-primary">{qty}</span>
                  <button onClick={() => updateQuantity(product.id, qty + 1)} className="p-1.5 text-primary hover:bg-primary/20 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => setCartOpen(true)} className="px-6 py-2.5 rounded-xl bg-gradient-shero text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                  View Cart ({cartTotal})
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      </main>
      <BottomNav />
    </div>
  );
};

export default SnackDetail;
