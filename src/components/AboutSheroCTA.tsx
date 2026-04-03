import { Link } from "react-router-dom";
import { ArrowRight, Heart, Shield, ChefHat } from "lucide-react";

const AboutSheroCTA = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="rounded-2xl bg-card border border-border p-5 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            {/* Left: headline + description */}
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-serif font-bold text-foreground mb-2">
                Know the Story Behind Your Food
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                From 5 home chefs in the DC Metro area to America's fastest-growing home food platform — discover how Shero empowers women and transforms meals.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                About Shero <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: mini stat pills */}
            <div className="flex md:flex-col gap-3 shrink-0">
              {[
                { icon: Heart, label: "Genuinely Homemade", color: "text-rose-500" },
                { icon: ChefHat, label: "50+ Home Chefs", color: "text-primary" },
                { icon: Shield, label: "Quality Assured", color: "text-amber-500" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60">
                    <Icon className={`w-4 h-4 ${item.color} shrink-0`} />
                    <span className="text-xs font-medium text-foreground whitespace-nowrap">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSheroCTA;
