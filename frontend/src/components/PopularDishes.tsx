import { useTranslation } from "react-i18next";
import { Star, Clock, Heart } from "lucide-react";
import { useInstantMenuItems } from "@/hooks/useSupabaseData";

const PopularDishes = () => {
  const { t } = useTranslation();
  const { data: menuItems, isLoading } = useInstantMenuItems();

  // Show top 6 items, prefer bestsellers
  const dishes = (menuItems || [])
    .sort((a: any, b: any) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0))
    .slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-serif font-bold text-foreground mb-6">{t("popular.title")}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border h-72 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h3 className="text-3xl font-serif font-bold text-foreground mb-2">{t("popular.title")}</h3>
            <p className="text-muted-foreground">{t("popular.subtitle")}</p>
          </div>
          <button className="text-primary font-semibold hover:underline hidden sm:block">{t("popular.viewAll")}</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish: any, i: number) => (
            <div
              key={dish.id}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-shero transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative h-44 bg-secondary flex items-center justify-center overflow-hidden">
                {dish.image ? (
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <span className="text-7xl">{dish.is_veg ? "🥘" : "🍗"}</span>
                )}
                {dish.is_bestseller && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">Best Seller</span>
                )}
                <button className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                  <Heart className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-serif font-bold text-foreground">{dish.name}</h4>
                  <span className="text-lg font-bold text-primary">${dish.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{dish.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {dish.preparation_time || "30 min"}
                    </span>
                  </div>
                  <button className="px-4 py-2 rounded-full bg-gradient-shero text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                    {t("popular.add")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDishes;
