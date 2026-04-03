import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import mascotPresenting from "@/assets/shero-mascot-presenting.png";
import { ArrowLeft, Search, Star, Clock, Users, Heart, Sparkles, Brain, Baby, Moon, Dumbbell, Apple, BookOpen, Eye } from "lucide-react";

const categories = [
  {
    id: "yoga",
    name: "Yoga & Meditation",
    description: "Hatha, Vinyasa, Pranayama & mindfulness",
    icon: "🧘‍♀️",
    lucideIcon: Moon,
    gradient: "from-[hsl(280,40%,92%)] to-[hsl(280,30%,96%)]",
    iconBg: "bg-[hsl(280,40%,88%)]",
    iconColor: "text-[hsl(280,50%,40%)]",
    classCount: 24,
    topInstructor: "Priya Sharma",
    rating: 4.9,
  },
  {
    id: "zumba",
    name: "Zumba & Dance Fitness",
    description: "Cardio, Bollywood, Latin & aerobics",
    icon: "💃",
    lucideIcon: Sparkles,
    gradient: "from-primary/10 to-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    classCount: 18,
    topInstructor: "Meera Kapoor",
    rating: 4.8,
  },
  {
    id: "fitness",
    name: "Fitness Consulting",
    description: "Personal training, HIIT & strength",
    icon: "💪",
    lucideIcon: Dumbbell,
    gradient: "from-accent/10 to-accent/5",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    classCount: 15,
    topInstructor: "Coach Arjun",
    rating: 4.9,
  },
  {
    id: "diet",
    name: "Diet & Nutrition",
    description: "Personalized meal plans & wellness",
    icon: "🥗",
    lucideIcon: Apple,
    gradient: "from-[hsl(140,40%,92%)] to-[hsl(140,30%,96%)]",
    iconBg: "bg-[hsl(140,40%,88%)]",
    iconColor: "text-[hsl(140,50%,35%)]",
    classCount: 12,
    topInstructor: "Dr. Ananya Reddy",
    rating: 4.7,
  },
  {
    id: "tuition",
    name: "Personalized Tuitions",
    description: "Academic coaching & skill development",
    icon: "📚",
    lucideIcon: BookOpen,
    gradient: "from-[hsl(210,40%,92%)] to-[hsl(210,30%,96%)]",
    iconBg: "bg-[hsl(210,40%,88%)]",
    iconColor: "text-[hsl(210,50%,40%)]",
    classCount: 30,
    topInstructor: "Lakshmi Iyer",
    rating: 4.8,
  },
  {
    id: "stress",
    name: "Stress & Wellness",
    description: "Counseling, therapy & mental health",
    icon: "🧠",
    lucideIcon: Brain,
    gradient: "from-[hsl(200,40%,92%)] to-[hsl(200,30%,96%)]",
    iconBg: "bg-[hsl(200,40%,88%)]",
    iconColor: "text-[hsl(200,50%,40%)]",
    classCount: 10,
    topInstructor: "Dr. Kavitha Nair",
    rating: 4.9,
  },
  {
    id: "eldercare",
    name: "Elder Care Plans",
    description: "Senior wellness, physio & companion care",
    icon: "🤝",
    lucideIcon: Heart,
    gradient: "from-primary/10 to-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    classCount: 8,
    topInstructor: "Sister Grace",
    rating: 4.8,
  },
  {
    id: "pregnancy",
    name: "Pregnancy & Parenting",
    description: "Pre/post-natal yoga, lamaze & advice",
    icon: "🤰",
    lucideIcon: Baby,
    gradient: "from-[hsl(340,40%,92%)] to-[hsl(340,30%,96%)]",
    iconBg: "bg-[hsl(340,40%,88%)]",
    iconColor: "text-[hsl(340,50%,40%)]",
    classCount: 14,
    topInstructor: "Dr. Swati Menon",
    rating: 4.9,
  },
  {
    id: "astrology",
    name: "Astrology & Spirituality",
    description: "1-on-1 horoscope, vastu & numerology",
    icon: "🔮",
    lucideIcon: Eye,
    gradient: "from-[hsl(260,40%,92%)] to-[hsl(260,30%,96%)]",
    iconBg: "bg-[hsl(260,40%,88%)]",
    iconColor: "text-[hsl(260,50%,40%)]",
    classCount: 9,
    topInstructor: "Pandit Raghav",
    rating: 4.7,
  },
];

const featuredExperts = [
  { name: "Priya Sharma", specialty: "Yoga & Meditation", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face", rating: 4.9, sessions: 1200 },
  { name: "Coach Arjun", specialty: "Fitness & HIIT", image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop&crop=face", rating: 4.9, sessions: 800 },
  { name: "Dr. Ananya", specialty: "Diet & Nutrition", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face", rating: 4.7, sessions: 650 },
  { name: "Meera Kapoor", specialty: "Zumba & Dance", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face", rating: 4.8, sessions: 950 },
];

const SheroClasses = () => {
  const [search, setSearch] = useState("");

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-28">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(280,30%,20%)] via-[hsl(260,25%,18%)] to-[hsl(200,20%,15%)] py-14">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(280 60% 50% / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(350 75% 45% / 0.2) 0%, transparent 50%)" }} />
          <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-5 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Wellness • Fitness • Learning • Life
            </div>
            <img src={mascotPresenting} alt="" className="w-20 h-20 object-contain mx-auto mb-3 drop-shadow-lg" />
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3 leading-tight">
              Shero <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(280,60%,70%)] to-[hsl(350,70%,65%)]">Classes</span>
            </h1>
            <p className="text-white/70 mb-7 max-w-lg mx-auto text-sm md:text-base">
              Expert-led sessions in yoga, fitness, nutrition, mental wellness, and more — live or self-paced, from the comfort of your home.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search yoga, fitness, astrology..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-white placeholder:text-white/40 outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 max-w-3xl flex justify-around py-4">
            {[
              { value: "150+", label: "Classes" },
              { value: "50+", label: "Experts" },
              { value: "10k+", label: "Happy Learners" },
              { value: "4.8★", label: "Avg Rating" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-3xl">
          {/* Categories Grid */}
          <h2 className="text-xl font-serif font-bold text-foreground mt-8 mb-5">Explore Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {filtered.map((cat, i) => {
              const Icon = cat.lucideIcon;
              return (
                <Link
                  to={`/shero-classes/${cat.id}`}
                  key={cat.id}
                  className={`group relative p-5 rounded-2xl bg-gradient-to-br ${cat.gradient} border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 animate-scale-in`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl ${cat.iconBg} shrink-0`}>
                      <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {cat.icon} {cat.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {cat.rating}
                    </span>
                    <span>{cat.classCount} classes</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {cat.topInstructor}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Featured Experts */}
          <h2 className="text-xl font-serif font-bold text-foreground mb-5">Meet Our Experts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {featuredExperts.map((expert) => (
              <div key={expert.name} className="text-center p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all">
                <img src={expert.image} alt={expert.name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover ring-2 ring-border" />
                <h4 className="text-sm font-semibold text-foreground">{expert.name}</h4>
                <p className="text-[10px] text-muted-foreground mb-2">{expert.specialty}</p>
                <div className="flex items-center justify-center gap-2 text-[10px]">
                  <span className="flex items-center gap-0.5 text-yellow-600"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{expert.rating}</span>
                  <span className="text-muted-foreground">{expert.sessions}+ sessions</span>
                </div>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="rounded-2xl bg-gradient-to-br from-[hsl(280,30%,95%)] to-[hsl(350,30%,95%)] border border-border p-6 mb-12">
            <h2 className="text-lg font-serif font-bold text-foreground mb-5 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Choose Your Class", desc: "Browse categories & pick a live or recorded session" },
                { step: "2", title: "Book & Pay", desc: "Secure checkout with multiple payment options" },
                { step: "3", title: "Learn & Grow", desc: "Join live or watch anytime at your own pace" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{s.step}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-3">Can't find what you need?</p>
            <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-shero">
              Request a Custom Session
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default SheroClasses;
