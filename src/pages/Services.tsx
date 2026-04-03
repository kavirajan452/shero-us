import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { useRegion } from "@/contexts/RegionContext";
import { useCookeryCategories, useCookeryClasses } from "@/hooks/useCatalogData";
import mascotKitchen from "@/assets/shero-mascot-kitchen.png";
import { ArrowLeft, Search, Star, Clock, ArrowRight, GraduationCap, ChefHat, Users, Video, Radio, PlayCircle } from "lucide-react";

const mealTypes = [
  { id: "breakfast", label: "🌅 Breakfast Recipes", icon: "🌅" },
  { id: "lunch", label: "🍛 Lunch / Meals Recipes", icon: "🍛" },
  { id: "tiffin", label: "🥡 Tiffin & Snacks Recipes", icon: "🥡" },
  { id: "dinner", label: "🌙 Dinner Recipes", icon: "🌙" },
  { id: "sweets", label: "🍮 Sweets & Desserts Recipes", icon: "🍮" },
  { id: "bakery", label: "🧁 Bakery Classes", icon: "🧁" },
];

const Services = () => {
  const { formatPrice, region } = useRegion();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<"all" | "Indian" | "World" | "Bakery">("all");
  const [modeFilter, setModeFilter] = useState<"all" | "recorded" | "live">("all");

  const { data: cuisineCategories = [], isLoading: loadingCats } = useCookeryCategories();
  const { data: cookeryClasses = [], isLoading: loadingClasses } = useCookeryClasses();

  const filteredCuisines = cuisineCategories.filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = regionFilter === "all" || c.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const popularClasses = cookeryClasses
    .filter((c: any) => c.popular)
    .filter((c: any) => modeFilter === "all" || c.class_mode === modeFilter || c.class_mode === "both")
    .slice(0, 6);

  const recordedCount = cookeryClasses.filter((c: any) => c.class_mode === "recorded" || c.class_mode === "both").length;
  const liveCount = cookeryClasses.filter((c: any) => c.class_mode === "live" || c.class_mode === "both").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-28">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-10">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              👨‍🍳 Cookery Classes
            </h1>
            <img src={mascotKitchen} alt="" className="w-16 h-16 object-contain mx-auto mb-2 drop-shadow-md" />
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Learn authentic recipes from expert home chefs — self-paced video courses or live interactive classes.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cuisines..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors shadow-sm"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-3xl">
          {/* Learning Mode Toggle */}
          <div className="flex justify-center gap-3 py-5">
            {([
              { key: "all" as const, label: "All Classes", icon: GraduationCap },
              { key: "recorded" as const, label: `Self-Learning (${recordedCount})`, icon: PlayCircle },
              { key: "live" as const, label: `Live Classes (${liveCount})`, icon: Radio },
            ]).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setModeFilter(key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                modeFilter === key ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-foreground hover:bg-accent"
              }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 py-4 border-b border-border mb-6">
            {[
              { icon: ChefHat, label: `${cuisineCategories.length} Cuisines` },
              { icon: GraduationCap, label: `${cookeryClasses.length}+ Classes` },
              { icon: Users, label: "Expert Instructors" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Region Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {(["all", "Indian", "World", "Bakery"] as const).map((r) => (
              <button key={r} onClick={() => setRegionFilter(r)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                regionFilter === r ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:border-primary/30 border border-transparent"
              }`}>
                {r === "all" ? "All" : r === "Indian" ? "🇮🇳 Indian" : r === "World" ? "🌍 World" : "🧁 Bakery"}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {(loadingCats || loadingClasses) && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Cuisine Grid */}
          {!loadingCats && (
            <>
              <h2 className="text-xl font-serif font-bold text-foreground mb-4">Choose a Cuisine</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {filteredCuisines.map((cuisine: any) => {
                  const classCount = cookeryClasses.filter((c: any) => c.cuisine_id === cuisine.id).length;
                  const hasVideo = cookeryClasses.some((c: any) => c.cuisine_id === cuisine.id && (c.class_mode === "recorded" || c.class_mode === "both"));
                  const hasLive = cookeryClasses.some((c: any) => c.cuisine_id === cuisine.id && (c.class_mode === "live" || c.class_mode === "both"));
                  return (
                    <Link
                      key={cuisine.id}
                      to={`/services/${cuisine.id}`}
                      className="group relative overflow-hidden rounded-2xl border border-border hover:border-primary/40 transition-all hover:shadow-md"
                    >
                      <img src={cuisine.image} alt={cuisine.name} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {hasVideo && <span className="text-[10px] bg-black/40 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Video className="w-2.5 h-2.5" /> Video</span>}
                        {hasLive && <span className="text-[10px] bg-black/40 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Radio className="w-2.5 h-2.5" /> Live</span>}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <span>{cuisine.icon}</span> {cuisine.name}
                        </h3>
                        <p className="text-xs text-white/70">{classCount} classes</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Popular Classes */}
          {!loadingClasses && (
            <>
              <h2 className="text-xl font-serif font-bold text-foreground mb-4">🔥 Most Popular Classes</h2>
              <div className="space-y-3 mb-10">
                {popularClasses.map((cls: any) => (
                  <Link
                    key={cls.id}
                    to={`/services/detail/${cls.id}`}
                    className="flex gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div className="relative shrink-0">
                      <img src={cls.image} alt={cls.name} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="absolute bottom-1 left-1 flex gap-0.5">
                        {(cls.class_mode === "recorded" || cls.class_mode === "both") && <span className="bg-black/60 backdrop-blur-sm rounded p-0.5"><Video className="w-2.5 h-2.5 text-white" /></span>}
                        {(cls.class_mode === "live" || cls.class_mode === "both") && <span className="bg-black/60 backdrop-blur-sm rounded p-0.5"><Radio className="w-2.5 h-2.5 text-white" /></span>}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{cls.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{cuisineCategories.find((c: any) => c.id === cls.cuisine_id)?.name} · {mealTypes.find((m) => m.id === cls.meal_type)?.icon} {cls.meal_type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-foreground font-medium">{cls.rating}</span>
                        <span className="text-xs text-muted-foreground">({cls.review_count})</span>
                        <Clock className="w-3 h-3 text-muted-foreground ml-1" />
                        <span className="text-xs text-muted-foreground">{cls.duration}</span>
                      </div>
                      {cls.class_mode !== "live" && cls.video_lessons && (
                        <p className="text-[10px] text-primary font-medium mt-1">{cls.video_lessons} video lessons · {cls.video_hours} hrs</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between shrink-0">
                      <div className="text-right">
                        {cls.class_mode === "both" && cls.recorded_price_in ? (
                          <>
                            <span className="text-xs text-muted-foreground block">from</span>
                            <span className="text-sm font-bold text-foreground">{formatPrice(region.code === "IN" ? (cls.recorded_price_in ?? cls.price_in) : (cls.recorded_price_us ?? cls.price_us))}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-foreground">{formatPrice(region.code === "IN" ? cls.price_in : cls.price_us)}</span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Meal Type Quick Links */}
          <h2 className="text-lg font-serif font-bold text-foreground mb-3">Browse by Class Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
            {mealTypes.map((mt) => {
              const count = cookeryClasses.filter((c: any) => c.meal_type === mt.id).length;
              return (
                <div key={mt.id} className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
                  <span className="text-lg">{mt.icon}</span>
                  <div>
                    <span className="text-sm font-medium text-foreground">{mt.label.split(" ").slice(1).join(" ")}</span>
                    <p className="text-xs text-muted-foreground">{count} classes</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Services;
