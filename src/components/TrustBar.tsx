import { Globe, Home, UtensilsCrossed, ShieldCheck } from "lucide-react";

const items = [
  { icon: Globe, text: "First Branded Home Food" },
  { icon: Home, text: "Verified Kitchens" },
  { icon: UtensilsCrossed, text: "Authentic Recipes" },
  { icon: ShieldCheck, text: "Quality Assured" },
];

const TrustBar = () => {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="container mx-auto px-4 py-2.5 md:py-3">
        {/* Mobile: horizontal scroll */}
        <div className="flex items-center gap-4 md:gap-8 md:justify-center overflow-x-auto scrollbar-none whitespace-nowrap">
          {items.map((item, i) => (
            <div key={item.text} className="flex items-center gap-1.5 shrink-0">
              <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shrink-0" />
              <span className="text-xs md:text-sm font-semibold text-foreground">{item.text}</span>
              {i < items.length - 1 && <span className="text-muted-foreground/30 ml-2 md:ml-4">|</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
