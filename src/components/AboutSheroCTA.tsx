import { Link } from "react-router-dom";
import { ArrowRight, Heart, Shield, ChefHat, Sparkles } from "lucide-react";

const AboutSheroCTA = () => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/15 p-7 md:p-12">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
          <div className="absolute bottom-12 right-20 w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse delay-700" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            {/* Left: content */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
                  Why We Exist
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-snug mb-3">
                Because everyone deserves<br className="hidden md:block" />
                <span className="text-primary"> a home-cooked meal.</span>
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-6">
                Real homes. Real kitchens. Real women cooking with love — no factories, no shortcuts. That's the Shero promise.
              </p>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03] active:scale-[0.97] transition-all"
              >
                Our Story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: trust metrics */}
            <div className="flex flex-col gap-3">
              {[
                { icon: Heart, label: "Cooked in real homes, not commercial kitchens", value: "Not Restaurant Food", color: "text-red-500", bg: "bg-red-500/8 border-red-500/15" },
                { icon: ChefHat, label: "Home Chefs", value: "50+", color: "text-primary", bg: "bg-primary/8 border-primary/15" },
                { icon: Shield, label: "Quality Assured", value: "FSSAI", color: "text-amber-600", bg: "bg-amber-500/8 border-amber-500/15" },
              ].map((pill) => (
                <div
                  key={pill.label}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-sm ${pill.bg} transition-transform hover:scale-[1.03]`}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-card shadow-sm border border-border/50">
                    <pill.icon className={`w-4 h-4 ${pill.color} shrink-0`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-none">{pill.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{pill.label}</p>
                  </div>
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
