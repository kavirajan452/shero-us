import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Star, ArrowLeft, Tag, Heart, MapPin, Plus, Minus, Package, Truck, CreditCard, Headphones } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import CustomerTestimonials from "@/components/CustomerTestimonials";
import CartDrawer from "@/components/CartDrawer";
import { useSnackProducts } from "@/hooks/useSupabaseData";
import { useRegion } from "@/contexts/RegionContext";
import { useCart } from "@/contexts/CartContext";

const snackCategories = [
  { id: "all", label: "All", emoji: "🛒" },
  { id: "kudumulu", label: "Kudumulu", emoji: "🟡" },
  { id: "inippu", label: "Inippu", emoji: "🍯" },
  { id: "kozhukattai", label: "Kozhukattai", emoji: "🍮" },
  { id: "kara", label: "Kara", emoji: "🌶️" },
  { id: "snacks", label: "Snacks", emoji: "🍘" },
  { id: "pickles", label: "Pickles", emoji: "🥒" },
  { id: "daily", label: "Daily", emoji: "🧂" },
  { id: "gifting", label: "Gifts", emoji: "🎁" },
];

const filterTabs = [
  { id: "all", label: "All" },
  { id: "bestsellers", label: "⭐ Bestsellers" },
  { id: "new", label: "🆕 New" },
];

interface DbSnackProduct {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  category: string;
  rating: number | null;
  review_count: number | null;
  is_bestseller: boolean | null;
  is_new_launch: boolean | null;
  badges: string[] | null;
  pack_sizes: any;
  ingredients: string | null;
  shelf_life: string | null;
  made_in: string | null;
  weight_info: string | null;
  region_tag: string | null;
  city_tag?: string | null;
  product_code: string;
}

function mapProduct(row: DbSnackProduct) {
  const packSizes = Array.isArray(row.pack_sizes) ? row.pack_sizes : [];
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    image: row.image || "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",
    category: row.category,
    rating: row.rating || 0,
    reviewCount: row.review_count || 0,
    isBestseller: row.is_bestseller || false,
    isNewLaunch: row.is_new_launch || false,
    badges: row.badges || [],
    packSizes,
    ingredients: row.ingredients || "",
    shelfLife: row.shelf_life || "",
    madeIn: row.made_in || "",
    weightInfo: row.weight_info || "",
    regionTag: row.region_tag || undefined,
    cityTag: (row as any).city_tag || undefined,
  };
}

const SweetsSnacks = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const { formatPrice } = useRegion();
  const { addItem, items: cartItems, updateQuantity } = useCart();

  const { data: rawProducts, isLoading } = useSnackProducts();
  const snackProducts = useMemo(() => (rawProducts || []).map(mapProduct), [rawProducts]);

  const filtered = useMemo(() => {
    let result = snackProducts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (activeFilter === "bestsellers") {
      result = result.filter((p) => p.isBestseller);
    } else if (activeFilter === "new") {
      result = result.filter((p) => p.isNewLaunch);
    }
    return result;
  }, [search, selectedCategory, activeFilter, snackProducts]);

  const cartTotal = cartItems.reduce((s, ci) => s + ci.quantity, 0);
  const cartSubtotal = cartItems.reduce((s, ci) => {
    const addOnsPrice = ci.selectedAddOns.reduce((a, ao) => a + ao.price, 0);
    return s + (ci.item.price + addOnsPrice) * ci.quantity;
  }, 0);

  const handleQuickAdd = (product: ReturnType<typeof mapProduct>, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pack = product.packSizes[0];
    if (!pack) return;
    addItem({
      id: product.id,
      kitchenId: "snacks",
      name: `${product.name} (${pack.label})`,
      description: product.description,
      price: pack.price,
      image: product.image,
      category: product.category,
      isVeg: true,
      isBestseller: product.isBestseller,
      spiceLevel: "mild" as const,
      servingSize: pack.label,
      preparationTime: "Ships in 1-2 days",
      ingredients: product.ingredients.split(", "),
      allergens: [],
      nutritionInfo: { calories: 0, protein: "—", carbs: "—", fat: "—" },
      ppp: Math.round(pack.price * 0.65),
      majorVegetables: [],
      isToggledOn: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-24 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading products...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-24">
        {/* Free Shipping Banner */}
        <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-semibold tracking-wide">
          🚚 FREE SHIPPING above {formatPrice(99)} · Code <span className="underline">FIRST10</span> for $10 OFF
        </div>

        {/* Hero Banner */}
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(30 45% 90%), hsl(25 50% 85%), hsl(35 40% 88%))" }}>
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-start gap-3 mb-2">
              <Link to="/" className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="text-[10px] font-semibold text-primary tracking-widest uppercase">Mahaprasad by Shero</p>
                <h1 className="text-xl font-serif font-bold text-foreground leading-tight">
                  Heritage in Every Bite
                </h1>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Handmade at home. Fresh to order. Delivered across 12+ US cities.
                </p>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">🎉 Pick 5+ items & GET 12% OFF</p>
                <p className="text-[10px] text-muted-foreground">Code <span className="font-bold text-primary">ANY5</span></p>
              </div>
              <Tag className="w-6 h-6 text-primary/40" />
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10" style={{ background: "hsl(30 60% 50%)" }} />
        </section>

        {/* Trust Strip */}
        <div className="flex gap-4 py-3 px-4 overflow-x-auto border-b border-border" style={{ scrollbarWidth: "none" }}>
          {[
            { icon: Heart, text: "Handmade" },
            { icon: Package, text: "Fresh to Order" },
            { icon: Truck, text: "12+ US Cities" },
            { icon: CreditCard, text: "Secure Pay" },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
              <b.icon className="w-3 h-3 text-primary" />
              <span>{b.text}</span>
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 max-w-5xl">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto py-4" style={{ scrollbarWidth: "none" }}>
            {snackCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setActiveFilter("all"); }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/30"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-3">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeFilter === tab.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sweets, snacks, pickles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">{filtered.length} products</p>
            {selectedCategory !== "all" && (
              <button onClick={() => setSelectedCategory("all")} className="text-[11px] text-primary font-semibold hover:underline">← All</button>
            )}
          </div>

          {/* 2-Column Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {filtered.map((product) => {
              const mainPack = product.packSizes[0];
              if (!mainPack) return null;
              const cartItem = cartItems.find((ci) => ci.item.id === product.id);
              const qty = cartItem?.quantity || 0;

              return (
                <Link
                  key={product.id}
                  to={`/sweets-snacks/${product.id}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.regionTag && (
                      <span className="absolute top-2 left-2 text-[9px] font-semibold bg-card/90 backdrop-blur-sm text-foreground px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <MapPin className="w-2 h-2 text-primary" />
                        {product.regionTag}
                      </span>
                    )}
                    {mainPack.discountPercent && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                        {mainPack.discountPercent}% OFF
                      </span>
                    )}
                    {(product.isBestseller || product.isNewLaunch) && (
                      <div className="absolute bottom-2 left-2">
                        {product.isBestseller && <span className="text-[9px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">⭐ Best</span>}
                        {product.isNewLaunch && <span className="text-[9px] font-semibold bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full ml-1">🆕</span>}
                      </div>
                    )}
                    {/* Add / Qty button */}
                    <div className="absolute bottom-2 right-2">
                      {qty === 0 ? (
                        <button
                          onClick={(e) => handleQuickAdd(product, e)}
                          className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 bg-primary rounded-full px-1 py-0.5 shadow-lg" onClick={(e) => e.preventDefault()}>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(product.id, qty - 1); }}
                            className="w-6 h-6 rounded-full bg-primary-foreground/20 text-primary-foreground flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-primary-foreground min-w-[14px] text-center">{qty}</span>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(product.id, qty + 1); }}
                            className="w-6 h-6 rounded-full bg-primary-foreground/20 text-primary-foreground flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <h3 className="font-semibold text-foreground text-xs leading-tight mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                      <span className="text-[10px] font-bold text-foreground">{product.rating}</span>
                      <span className="text-[9px] text-muted-foreground">({product.reviewCount})</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mb-1">{mainPack.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-foreground">{formatPrice(mainPack.price)}</span>
                      {mainPack.originalPrice && (
                        <span className="text-[10px] text-muted-foreground line-through">{formatPrice(mainPack.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground">No products found. Try a different search.</p>
            </div>
          )}

          <CustomerTestimonials />

          {/* Trust Grid */}
          <section className="mt-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { emoji: "🍳", title: "Made to Order", desc: "Freshly prepared after you order" },
                { emoji: "🚚", title: "Fast Delivery", desc: "Delivered within 24 hours" },
                { emoji: "📞", title: "Support", desc: "Available 10 am to 7 pm" },
                { emoji: "🔒", title: "Secure Pay", desc: "Debit, Credit & UPI" },
              ].map((item) => (
                <div key={item.title} className="bg-card border border-border rounded-xl p-3 text-center">
                  <span className="text-xl mb-1 block">{item.emoji}</span>
                  <h4 className="text-[11px] font-semibold text-foreground">{item.title}</h4>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky Cart Bar — opens drawer */}
        {cartTotal > 0 && (
          <div className="fixed bottom-16 md:bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full flex items-center justify-between bg-gradient-shero text-primary-foreground px-6 py-4 rounded-2xl shadow-shero hover:opacity-95 transition-opacity"
            >
              <div>
                <span className="font-semibold">{cartTotal} item{cartTotal !== 1 ? "s" : ""}</span>
                <span className="text-xs opacity-80 ml-2">{formatPrice(cartSubtotal)}</span>
              </div>
              <span className="font-bold text-lg">View Cart →</span>
            </button>
          </div>
        )}

        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default SweetsSnacks;
