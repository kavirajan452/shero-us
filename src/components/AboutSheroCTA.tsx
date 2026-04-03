import { Link } from "react-router-dom";
import { ArrowRight, Heart, Users, Award } from "lucide-react";

const AboutSheroCTA = () => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/10 p-6 md:p-8">
          <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full bg-primary/5 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Mini icons */}
            <div className="flex gap-4 md:gap-6 shrink-0">
              {[
                { icon: Heart, label: "Genuinely\nHomemade", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
                { icon: Users, label: "2,400+\nSheroes", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
                { icon: Award, label: "Award\nWinning", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-1.5`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight whitespace-pre-line">{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Text + CTA */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-serif font-bold text-foreground mb-1">
                Know the Story Behind Your Food
              </h3>
              <p className="text-xs text-muted-foreground mb-3 max-w-md leading-relaxed">
                From 12 home chefs to India's largest home food platform — discover how Shero is empowering women and transforming meals across 72 cities.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                About Shero <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSheroCTA;
