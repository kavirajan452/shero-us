import { Star, Clock, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useInstantMenuItems } from "@/hooks/useSupabaseData";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";

const TrendingDishesCarousel = () => {
  const { data: menuItems, isLoading } = useInstantMenuItems();
  const { data: contentItems } = useScreenContent("trending");
  const c = contentMap(contentItems || []);
  const dishes = (menuItems || []).slice(0, 10);

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{c["trending.title"] || "Popular Dishes"}</h3>
          <Link to="/instant-delivery" className="flex items-center gap-1 text-primary text-xs font-semibold">
            {c["trending.view_all_label"] || "View All →"} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-2" style={{ width: "max-content" }}>
          {isLoading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="w-[160px] shrink-0 bg-card rounded-xl h-[200px] animate-pulse" />
              ))
            : dishes.map((dish: any) => (
                <div key={dish.id} className="w-[160px] shrink-0 bg-card rounded-xl overflow-hidden group">
                  <div className="relative h-[120px] overflow-hidden rounded-xl mx-2 mt-2">
                    <img src={dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop"} alt={dish.name} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    {dish.is_bestseller && (
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-foreground/80 text-card text-[8px] font-bold tracking-wider">BESTSELLER</span>
                    )}
                  </div>
                  <div className="p-2.5 pt-2">
                    <h4 className="text-xs font-semibold text-foreground truncate">{dish.name}</h4>
                    <p className="text-[10px] text-muted-foreground mb-1.5">{dish.category}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {dish.preparation_time || "30 min"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">₹{dish.price}</span>
                      <button className="w-6 h-6 rounded-md border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-bold">
                        <Plus className="w-3 h-3" />
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

export default TrendingDishesCarousel;
