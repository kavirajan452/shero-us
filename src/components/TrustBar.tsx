import { Star, ChefHat, MapPin, Package } from "lucide-react";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";

const TrustBar = () => {
  const { data: contentItems } = useScreenContent("home");
  const c = contentMap(contentItems || []);

  const stats = [
    { icon: ChefHat, value: c["home.trust_bar_kitchens"]?.split(" ")[0] || "50+", label: c["home.trust_bar_kitchens"]?.replace(/^\S+\s/, "") || "Home Kitchens" },
    { icon: MapPin, value: c["home.trust_bar_cities"]?.split(" ")[0] || "12", label: c["home.trust_bar_cities"]?.replace(/^\S+\s/, "") || "US Cities" },
    { icon: Package, value: c["home.trust_bar_orders"]?.split(" ")[0] || "10,000+", label: c["home.trust_bar_orders"]?.replace(/^\S+\s/, "") || "Orders Served" },
    { icon: Star, value: c["home.trust_bar_rating"]?.split(" ")[0] || "4.8★", label: c["home.trust_bar_rating"]?.replace(/^\S+\s/, "") || "Average Rating" },
  ];

  return (
    <section className="border-y border-border bg-card/50">
      <div className="container mx-auto px-4 py-4 md:py-5">
        <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 md:gap-3">
              <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-base md:text-lg font-bold text-foreground">{stat.value}</span>
                <span className="text-xs md:text-sm text-muted-foreground">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
