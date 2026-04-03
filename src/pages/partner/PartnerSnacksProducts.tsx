import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { snackProducts, snackCategories } from "@/data/snacksData";
import { Search, Package, Star, Edit, Plus, TrendingUp } from "lucide-react";

export default function PartnerSnacksProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockMap, setStockMap] = useState<Record<string, boolean>>(
    Object.fromEntries(snackProducts.map(p => [p.id, true]))
  );

  const filtered = snackProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  const toggleStock = (id: string) => setStockMap(prev => ({ ...prev, [id]: !prev[id] }));

  const inStock = Object.values(stockMap).filter(Boolean).length;
  const outOfStock = Object.values(stockMap).filter(v => !v).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">📦 My Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog, stock & pricing</p>
        </div>
        <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1" /> Add Product</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-100"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-foreground">{snackProducts.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Total Products</p>
        </CardContent></Card>
        <Card className="bg-green-100"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-green-600">{inStock}</p>
          <p className="text-[10px] text-muted-foreground uppercase">In Stock</p>
        </CardContent></Card>
        <Card className="bg-rose-100"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-destructive">{outOfStock}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Out of Stock</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {[{ id: "all", label: "All" }, ...snackCategories.filter(c => c.id !== "all")].map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${category === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(product => (
          <Card key={product.id} className={`overflow-hidden ${!stockMap[product.id] ? "opacity-60" : ""}`}>
            <CardContent className="p-0">
              <div className="flex gap-3 p-3">
                <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
                      <p className="text-[10px] text-muted-foreground capitalize">{product.category} · {product.regionTag}</p>
                    </div>
                    <Switch checked={stockMap[product.id]} onCheckedChange={() => toggleStock(product.id)} />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">{product.rating}</span>
                    <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
                    {product.isBestseller && <Badge variant="secondary" className="text-[8px] h-4">Bestseller</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {product.packSizes.map(ps => (
                      <span key={ps.label} className="text-xs bg-secondary rounded px-1.5 py-0.5">
                        {ps.label}: <span className="font-semibold">₹{ps.price}</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {product.badges.slice(0, 2).map(b => (
                      <span key={b} className="text-[8px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
