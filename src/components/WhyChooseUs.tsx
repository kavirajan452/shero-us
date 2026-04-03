import { Shield, Clock, Heart, Leaf } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";

const iconMap: { icon: LucideIcon; key: string; color: string; bg: string }[] = [
  { icon: Heart, key: "nostalgia", color: "text-rose-500", bg: "bg-rose-50" },
  { icon: Shield, key: "formula", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Leaf, key: "sheroes", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Clock, key: "fresh", color: "text-amber-500", bg: "bg-amber-50" },
];

const WhyChooseUs = () => {
  const { data: items } = useScreenContent("why");
  const c = contentMap(items || []);

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {c["why.title"] || "What Shero Does Differently"}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {iconMap.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl bg-card">
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${f.color}`} strokeWidth={1.5} />
                </div>
                <h4 className="text-xs font-semibold text-foreground mb-1">
                  {c[`why.${f.key}_title`] || f.key}
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {c[`why.${f.key}_desc`] || ""}
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
