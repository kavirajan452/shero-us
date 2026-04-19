import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { useRegion } from "@/contexts/RegionContext";
import { useSheroClasses } from "@/hooks/useCatalogData";
import { ArrowLeft, Star, Clock, PlayCircle, Radio, Video } from "lucide-react";

const categoryMeta: Record<string, { name: string; icon: string; color: string }> = {
  yoga: { name: "Yoga & Meditation", icon: "🧘‍♀️", color: "from-[hsl(280,30%,92%)] to-[hsl(280,20%,96%)]" },
  zumba: { name: "Zumba & Dance Fitness", icon: "💃", color: "from-primary/10 to-primary/5" },
  fitness: { name: "Fitness Consulting", icon: "💪", color: "from-accent/10 to-accent/5" },
  diet: { name: "Diet & Nutrition", icon: "🥗", color: "from-[hsl(140,30%,92%)] to-[hsl(140,20%,96%)]" },
  tuition: { name: "Personalized Tuitions", icon: "📚", color: "from-[hsl(210,30%,92%)] to-[hsl(210,20%,96%)]" },
  stress: { name: "Stress & Wellness", icon: "🧠", color: "from-[hsl(200,30%,92%)] to-[hsl(200,20%,96%)]" },
  eldercare: { name: "Elder Care Plans", icon: "🤝", color: "from-primary/10 to-primary/5" },
  pregnancy: { name: "Pregnancy & Parenting", icon: "🤰", color: "from-[hsl(340,30%,92%)] to-[hsl(340,20%,96%)]" },
  astrology: { name: "Astrology & Spirituality", icon: "🔮", color: "from-[hsl(260,30%,92%)] to-[hsl(260,20%,96%)]" },
};

const SheroClassCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { formatPrice, region } = useRegion();
  const [modeFilter, setModeFilter] = useState<"all" | "self-learning" | "live">("all");

  const { data: allClasses = [], isLoading } = useSheroClasses(categoryId);

  const meta = categoryMeta[categoryId || ""] || { name: "Classes", icon: "📖", color: "from-secondary to-secondary" };
  const filtered = allClasses.filter((c: any) => {
    if (modeFilter === "all") return true;
    return c.mode === modeFilter || c.mode === "both";
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-28">
        <section className={`bg-gradient-to-br ${meta.color} py-8`}>
          <div className="container mx-auto px-4 max-w-3xl">
            <Link to="/shero-classes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> All Categories
            </Link>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              {meta.icon} {meta.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{allClasses.length} classes available</p>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-3xl">
          {/* Mode Filter */}
          <div className="flex gap-2 py-5">
            {([
              { key: "all" as const, label: "All", icon: Star },
              { key: "self-learning" as const, label: "Self-Learning", icon: PlayCircle },
              { key: "live" as const, label: "Live 1-on-1", icon: Radio },
            ]).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setModeFilter(key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                modeFilter === key ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent"
              }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Class List */}
          {!isLoading && (
            <div className="space-y-4">
              {filtered.map((cls: any) => {
                const selfPrice = region.code === "IN" ? cls.self_learning_price_in : cls.self_learning_price_us;
                const livePrice = region.code === "IN" ? cls.live_price_in : cls.live_price_us;
                const showSelf = cls.mode === "self-learning" || cls.mode === "both";
                const showLive = cls.mode === "live" || cls.mode === "both";

                return (
                  <Link
                    key={cls.id}
                    to={`/shero-classes/detail/${cls.id}`}
                    className="flex gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div className="relative shrink-0">
                      <img src={cls.image} alt={cls.name} className="w-24 h-24 rounded-xl object-cover" />
                      <div className="absolute bottom-1 left-1 flex gap-0.5">
                        {showSelf && <span className="bg-black/60 backdrop-blur-sm rounded p-0.5"><Video className="w-2.5 h-2.5 text-white" /></span>}
                        {showLive && <span className="bg-black/60 backdrop-blur-sm rounded p-0.5"><Radio className="w-2.5 h-2.5 text-white" /></span>}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{cls.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cls.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{cls.rating} ({cls.review_count})</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{cls.duration}</span>
                      </div>
                      {cls.video_lessons && showSelf && (
                        <p className="text-[10px] text-primary font-medium mt-1">{cls.video_lessons} lessons · {cls.video_hours} hrs</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between shrink-0">
                      <div className="text-right space-y-0.5">
                        {showSelf && selfPrice > 0 && (
                          <div className="flex items-center gap-1">
                            <Video className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-bold text-foreground">{formatPrice(selfPrice)}</span>
                          </div>
                        )}
                        {showLive && livePrice > 0 && (
                          <div className="flex items-center gap-1">
                            <Radio className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-bold text-foreground">{formatPrice(livePrice)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No classes found for this filter.</p>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default SheroClassCategory;
