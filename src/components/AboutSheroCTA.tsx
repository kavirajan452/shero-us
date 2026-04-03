import { Link } from "react-router-dom";
import { ArrowRight, Heart, Shield, ChefHat } from "lucide-react";

const AboutSheroCTA = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="rounded-2xl bg-card border border-border p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Left: emotional hook */}
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                Why We Exist
              </p>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground leading-snug mb-3">
                Because everyone deserves<br className="hidden md:block" />
                <span className="text-primary"> a home-cooked meal.</span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Real homes. Real kitchens. Real women cooking with love — no factories, no shortcuts. That's the Shero promise.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 mt-5 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Our Story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: trust pills */}
            <div className="flex flex-col items-start gap-2">
              {[
                { icon: Heart, label: "Genuinely Homemade", color: "text-red-500" },
                { icon: ChefHat, label: "50+ Home Chefs", color: "text-primary" },
                { icon: Shield, label: "Quality Assured", color: "text-amber-500" },
              ].map((pill) => (
                <div
                  key={pill.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border"
                >
                  <pill.icon className={`w-4 h-4 ${pill.color} shrink-0`} />
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">{pill.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSheroCTA;
