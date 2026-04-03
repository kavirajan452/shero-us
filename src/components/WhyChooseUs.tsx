import { Heart, ShieldCheck, ChefHat, Clock } from "lucide-react";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";

const features = [
  {
    icon: Heart,
    key: "nostalgia",
    defaultTitle: "Taste of Home",
    defaultDesc: "Recipes passed down through generations — cooked with love, not by machines.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    icon: ShieldCheck,
    key: "formula",
    defaultTitle: "No Shortcuts",
    defaultDesc: "Zero chemicals, no preservatives, no cloud kitchens. Just honest home cooking.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: ChefHat,
    key: "sheroes",
    defaultTitle: "Real Home Chefs",
    defaultDesc: "Every meal is prepared by a verified home chef in their own kitchen.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Clock,
    key: "fresh",
    defaultTitle: "Always Fresh",
    defaultDesc: "Cooked fresh for every order — never reheated, never frozen, never stale.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
];

const WhyChooseUs = () => {
  const { data: items } = useScreenContent("why");
  const c = contentMap(items || []);

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h3 className="text-lg font-serif font-bold text-foreground mb-1">
          {c["why.title"] || "What Shero Does Differently"}
        </h3>
        <p className="text-xs text-muted-foreground mb-5">Not your usual food delivery. We're flipping the formula.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all">
                <div className={`w-9 h-9 rounded-lg ${f.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${f.color}`} strokeWidth={1.8} />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {c[`why.${f.key}_title`] || f.defaultTitle}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {c[`why.${f.key}_desc`] || f.defaultDesc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
