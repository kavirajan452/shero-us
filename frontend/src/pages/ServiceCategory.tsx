import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { useRegion } from "@/contexts/RegionContext";
import { useCookeryCategories, useCookeryClasses } from "@/hooks/useCatalogData";
import { ArrowLeft, Star, Clock, ArrowRight, BadgeCheck, GraduationCap, Video, Radio } from "lucide-react";

const mealTypes = [
  { id: "breakfast", label: "🌅 Breakfast Recipes", icon: "🌅" },
  { id: "lunch", label: "🍛 Lunch / Meals Recipes", icon: "🍛" },
  { id: "tiffin", label: "🥡 Tiffin & Snacks Recipes", icon: "🥡" },
  { id: "dinner", label: "🌙 Dinner Recipes", icon: "🌙" },
  { id: "sweets", label: "🍮 Sweets & Desserts Recipes", icon: "🍮" },
  { id: "bakery", label: "🧁 Bakery Classes", icon: "🧁" },
];

const ServiceCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { formatPrice, region } = useRegion();
  const [activeMeal, setActiveMeal] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<"all" | "recorded" | "live">("all");

  const { data: cuisineCategories = [] } = useCookeryCategories();
  const { data: cookeryClasses = [] } = useCookeryClasses(categoryId);

  const cuisine = cuisineCategories.find((c: any) => c.id === categoryId);
  const allClasses = cookeryClasses;

  const filteredClasses = activeMeal
    ? allClasses
        .filter((c: any) => c.meal_type === activeMeal)
        .filter((c: any) => modeFilter === "all" || c.class_mode === modeFilter || c.class_mode === "both")
    : [];

  const availableMealTypes = [...new Set(allClasses.map((c: any) => c.meal_type))];

  if (!cuisine) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-24 container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Cuisine not found</p>
          <Link to="/services" className="text-primary font-semibold hover:underline mt-4 inline-block">← Back to Cookery Classes</Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-28">
        <div className="relative h-40 overflow-hidden">
          <img src={cuisine.image} alt={cuisine.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 container mx-auto max-w-3xl">
            <Link to="/services" className="inline-flex items-center gap-2 text-xs text-white/80 hover:text-white mb-2 transition-colors">
              <ArrowLeft className="w-3 h-3" /> All Cuisines
            </Link>
            <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
              {cuisine.icon} {cuisine.name} Cookery Classes
            </h1>
            <p className="text-sm text-white/70">{allClasses.length} classes available · {cuisine.region} cuisine</p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-3xl mt-6">
          {!activeMeal ? (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">What would you like to learn?</h2>
              <div className="grid grid-cols-2 gap-3 mb-10">
                {availableMealTypes.map((mt: any) => {
                  const info = mealTypes.find((m) => m.id === mt);
                  const count = allClasses.filter((c: any) => c.meal_type === mt).length;
                  const hasVideo = allClasses.some((c: any) => c.meal_type === mt && (c.class_mode === "recorded" || c.class_mode === "both"));
                  const hasLive = allClasses.some((c: any) => c.meal_type === mt && (c.class_mode === "live" || c.class_mode === "both"));
                  return (
                    <button key={mt} onClick={() => setActiveMeal(mt)} className="flex flex-col items-center gap-2 p-5 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-md transition-all group">
                      <span className="text-3xl">{info?.icon}</span>
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{info?.label.split(" ").slice(1).join(" ") || mt}</span>
                      <span className="text-xs text-muted-foreground">{count} {count === 1 ? "class" : "classes"}</span>
                      <div className="flex items-center gap-1.5">
                        {hasVideo && <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Video className="w-2.5 h-2.5" /> Video</span>}
                        {hasLive && <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Radio className="w-2.5 h-2.5" /> Live</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <>
              <button onClick={() => setActiveMeal(null)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to categories
              </button>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                {mealTypes.find((m) => m.id === activeMeal)?.icon} {mealTypes.find((m) => m.id === activeMeal)?.label.split(" ").slice(1).join(" ")}
              </h2>
              <div className="flex gap-2 mb-4">
                {(["all", "recorded", "live"] as const).map((m) => (
                  <button key={m} onClick={() => setModeFilter(m)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${modeFilter === m ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    {m === "all" ? "All" : m === "recorded" ? <><Video className="w-3 h-3" /> Self-Learning</> : <><Radio className="w-3 h-3" /> Live</>}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeMeal && (
            <div className="space-y-3 mb-10">
              {filteredClasses.map((cls: any) => {
                const mtInfo = mealTypes.find((m) => m.id === cls.meal_type);
                const hasVideo = cls.class_mode === "recorded" || cls.class_mode === "both";
                const hasLive = cls.class_mode === "live" || cls.class_mode === "both";
                return (
                  <Link key={cls.id} to={`/services/detail/${cls.id}`} className="flex gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all group">
                    <div className="relative shrink-0">
                      <img src={cls.image} alt={cls.name} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="absolute bottom-1 left-1 flex gap-0.5">
                        {hasVideo && <span className="bg-black/60 backdrop-blur-sm rounded p-0.5"><Video className="w-2.5 h-2.5 text-white" /></span>}
                        {hasLive && <span className="bg-black/60 backdrop-blur-sm rounded p-0.5"><Radio className="w-2.5 h-2.5 text-white" /></span>}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{cls.name}</h3>
                        {cls.popular && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium shrink-0">Popular</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{mtInfo?.icon} {cls.meal_type.charAt(0).toUpperCase() + cls.meal_type.slice(1)} Recipes</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium text-foreground">{cls.rating}</span>
                          <span className="text-xs text-muted-foreground">({cls.review_count})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{cls.duration}</span>
                        </div>
                      </div>
                      {hasVideo && cls.video_lessons && (
                        <p className="text-[10px] text-primary font-medium mt-1">{cls.video_lessons} lessons · {cls.video_hours} hrs video</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(cls.dishes || []).slice(0, 3).map((d: string) => (
                          <span key={d} className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{d}</span>
                        ))}
                        {(cls.dishes || []).length > 3 && <span className="text-[10px] text-muted-foreground">+{cls.dishes.length - 3} more</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between shrink-0">
                      <div className="text-right">
                        {cls.class_mode === "both" && cls.recorded_price_in ? (
                          <>
                            <span className="text-[10px] text-muted-foreground">from</span>
                            <span className="text-sm font-bold text-foreground block">{formatPrice(region.code === "IN" ? (cls.recorded_price_in ?? cls.price_in) : (cls.recorded_price_us ?? cls.price_us))}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-foreground">{formatPrice(region.code === "IN" ? cls.price_in : cls.price_us)}</span>
                        )}
                      </div>
                      <span className="text-xs text-primary font-medium flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </Link>
                );
              })}
              {filteredClasses.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No classes available for this filter.</p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default ServiceCategory;
