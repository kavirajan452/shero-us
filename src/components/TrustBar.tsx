import { Star, ChefHat, MapPin, Package } from "lucide-react";

const stats = [
  { icon: ChefHat, value: "2,400+", label: "Home Kitchens" },
  { icon: MapPin, value: "12", label: "Cities" },
  { icon: Package, value: "1.4M+", label: "Orders Delivered" },
  { icon: Star, value: "4.8★", label: "Avg Rating" },
];

const TrustBar = () => {
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
