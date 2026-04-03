import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Users, Award, MapPin, Shield, ChefHat, Leaf, Clock, Star, TrendingUp, Globe } from "lucide-react";
import DesktopNav from "@/components/DesktopNav";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";

const milestones = [
  { year: "2024", title: "The Spark", desc: "Founded with 5 home chefs in the DC Metro area — a mission to empower women through food." },
  { year: "2025 Q1", title: "Growing Roots", desc: "Expanded to 3 cities, 50+ kitchens. Launched subscriptions & party orders." },
  { year: "2025 Q3", title: "Scaling Up", desc: "Crossed 10K orders. Entered 12 cities across 5 states. Launched Shero Classes." },
  { year: "2026", title: "The Revolution Continues", desc: "America's fastest-growing home food platform. Expanding services, classes & experiences." },
];

const values = [
  { icon: Heart, title: "Genuinely Homemade", desc: "Zero chemicals, quality oils & ingredients. Cooked fresh by real home chefs, just like they cook for their own families.", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
  { icon: Users, title: "Women Empowerment", desc: "Creating financial independence for 2,400+ women through their culinary talents. Managed entirely by our all-women operations team.", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { icon: Shield, title: "Transparent & Honest", desc: "No hidden charges, no cloud kitchens. Decentralised home kitchens you can trust. What you see is what you get.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { icon: Leaf, title: "Fresh & Sustainable", desc: "Locally sourced ingredients, minimal packaging waste. 500+ varieties of wholesome dishes delivered fresh daily.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
];

const defaultStats = [
  { key: "stat_kitchens", number: "50+", label: "Home Kitchens", icon: ChefHat },
  { key: "stat_cities", number: "12", label: "Cities", icon: MapPin },
  { key: "stat_states", number: "5", label: "States", icon: Globe },
  { key: "stat_orders", number: "10K+", label: "Orders Delivered", icon: TrendingUp },
  { key: "stat_dishes", number: "200+", label: "Dish Varieties", icon: Star },
  { key: "stat_years", number: "1", label: "Year of Love", icon: Heart },
];

const awards = [
  { title: "Best Social Impact Startup 2025", org: "TechCrunch Disrupt" },
  { title: "Women Empowerment Excellence", org: "SBA Women's Business" },
  { title: "Food Innovation of the Year", org: "National Restaurant Assoc." },
  { title: "Top 50 Startups to Watch", org: "Forbes" },
];

const AboutShero = () => {
  const { data: aboutContent } = useScreenContent("about");
  const ac = contentMap(aboutContent || []);
  return (
    <div className="min-h-screen bg-background">
      <DesktopNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20 pt-20 pb-16">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              {ac["about.hero_badge"] || "🏠 America's Newest Home Food Platform"}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 leading-tight">
              {(ac["about.hero_title"] || "A Home-Food Revolution").split("Revolution").map((part, i) => (
                <span key={i}>{part}{i === 0 ? <span className="text-primary">Revolution</span> : ""}</span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {ac["about.hero_subtitle"] || "We believe every woman deserves the opportunity to turn her kitchen into a livelihood — and every family deserves the taste of genuinely homemade food."}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card border-y border-border py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {defaultStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1.5 text-primary" />
                  <div className="text-xl md:text-2xl font-bold text-foreground">{ac[`about.${s.key}`] || s.number}</div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-center mb-3">Our Story</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            What started as 5 home chefs in the DC Metro area is growing into America's home-cooked food movement.
          </p>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-4 md:gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{m.year}</span>
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-border my-1" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-semibold text-foreground text-sm">{m.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Stand For */}
      <section className="py-12 md:py-16 bg-card/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-center mb-3">What We Stand For</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Not your usual food delivery platform. We're flipping the formula.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${v.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Shero Promise */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-center mb-3">The Shero Promise</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-1">Freshly Cooked</h3>
              <p className="text-xs text-muted-foreground">Every meal is cooked fresh — never reheated, never frozen, never mass-produced.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-1">Quality Assured</h3>
              <p className="text-xs text-muted-foreground">Mandatory training, hygiene audits, and quality checks for every kitchen on our platform.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-1">Made With Love</h3>
              <p className="text-xs text-muted-foreground">Our chefs cook as they do for a home-coming guest — with care, love, and the best ingredients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-12 md:py-16 bg-card/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-center mb-3">Awards & Recognition</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Our impact has been recognised by India's top institutions.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {awards.map((a, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-card border border-border">
                <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-foreground mb-1">{a.title}</h4>
                <p className="text-[10px] text-muted-foreground">{a.org}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
            Join the Home-Food Revolution
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Whether you want to order homemade meals or become a Shero — there's a place for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/instant-delivery" className="px-8 py-3 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold shadow-shero hover:opacity-90 transition-opacity">
              Order Now
            </Link>
            <Link to="/auth?role=partner" className="px-8 py-3 rounded-2xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">
              Become a Shero
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default AboutShero;
