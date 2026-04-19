import { Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useKitchenPartners } from "@/hooks/useSupabaseData";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";

const TopChefsCarousel = () => {
  const { data: partners, isLoading } = useKitchenPartners(true);
  const { data: contentItems } = useScreenContent("chefs");
  const c = contentMap(contentItems || []);
  const chefs = (partners || []).slice(0, 8);

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{c["chefs.title"] || "Our Sheroes"}</h3>
          <Link to="/instant-delivery" className="flex items-center gap-1 text-primary text-xs font-semibold">
            View All → <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-2" style={{ width: "max-content" }}>
          {isLoading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="w-[130px] shrink-0 text-center">
                  <div className="w-[72px] h-[72px] mx-auto mb-2 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 bg-muted rounded mx-auto w-20 mb-1 animate-pulse" />
                  <div className="h-2 bg-muted rounded mx-auto w-16 animate-pulse" />
                </div>
              ))
            : chefs.map((chef: any) => (
                <Link key={chef.id} to={`/kitchen/${chef.id}`} className="w-[130px] shrink-0 text-center group">
                  <div className="w-[72px] h-[72px] mx-auto mb-2 rounded-full overflow-hidden border-2 border-background shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={chef.image || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100&h=100&fit=crop"} alt={chef.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground mb-0.5 truncate">{chef.name}</h4>
                  <p className="text-[10px] text-muted-foreground mb-1 truncate">{(chef.cuisine || []).slice(0, 2).join(", ")}</p>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5 text-green-700 font-semibold">
                      <Star className="w-2.5 h-2.5 fill-green-600 text-green-600" /> {chef.rating}
                    </span>
                    <span>•</span>
                    <span>{chef.review_count}+</span>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};

export default TopChefsCarousel;
