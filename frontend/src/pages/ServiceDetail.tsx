import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { useRegion } from "@/contexts/RegionContext";
import { useCookeryClasses, useCookeryCategories, useCookeryClass } from "@/hooks/useCatalogData";
import { ArrowLeft, Star, Clock, Check, BadgeCheck, GraduationCap, ChevronRight, BookOpen, PlayCircle, Video, Radio, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mealTypes = [
  { id: "breakfast", label: "🌅 Breakfast Recipes", icon: "🌅" },
  { id: "lunch", label: "🍛 Lunch / Meals Recipes", icon: "🍛" },
  { id: "tiffin", label: "🥡 Tiffin & Snacks Recipes", icon: "🥡" },
  { id: "dinner", label: "🌙 Dinner Recipes", icon: "🌙" },
  { id: "sweets", label: "🍮 Sweets & Desserts Recipes", icon: "🍮" },
  { id: "bakery", label: "🧁 Bakery Classes", icon: "🧁" },
];

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { formatPrice, region } = useRegion();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: cls, isLoading } = useCookeryClass(serviceId);
  const { data: cuisineCategories = [] } = useCookeryCategories();
  const { data: allCookeryClasses = [] } = useCookeryClasses(cls?.cuisine_id);

  const cuisine = cls ? cuisineCategories.find((c: any) => c.id === cls.cuisine_id) : null;
  const mt = cls ? mealTypes.find((m) => m.id === cls.meal_type) : null;
  const relatedClasses = cls ? allCookeryClasses.filter((c: any) => c.id !== cls.id).slice(0, 3) : [];

  const [selectedMode, setSelectedMode] = useState<"recorded" | "live">(
    cls?.class_mode === "live" ? "live" : "recorded"
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-24 container mx-auto px-4">
          <div className="h-56 bg-muted rounded-2xl animate-pulse mb-4" />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!cls || !cuisine) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-24 container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Class not found</p>
          <Link to="/services" className="text-primary font-semibold hover:underline mt-4 inline-block">← Back to Cookery Classes</Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const livePrice = region.code === "IN" ? cls.price_in : cls.price_us;
  const recordedPrice = region.code === "IN" ? (cls.recorded_price_in ?? cls.price_in) : (cls.recorded_price_us ?? cls.price_us);
  const hasRecorded = cls.class_mode === "recorded" || cls.class_mode === "both";
  const hasLive = cls.class_mode === "live" || cls.class_mode === "both";

  const handleBuyRecorded = () => {
    toast({ title: "Course purchased!", description: `${cls.name} – Self-Learning course. You now have lifetime access.` });
    navigate("/order-confirmation");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-32">
        <div className="relative h-56 overflow-hidden">
          <img src={cls.image} alt={cls.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4">
            <Link to={`/services/${cuisine.id}`} className="inline-flex items-center gap-1.5 text-xs text-white/90 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/50 transition-colors">
              <ArrowLeft className="w-3 h-3" /> {cuisine.name} Classes
            </Link>
          </div>
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="text-xs bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-full font-medium">{mt?.icon} {cls.meal_type.charAt(0).toUpperCase() + cls.meal_type.slice(1)} Recipes</span>
            {hasRecorded && <span className="text-xs bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>}
            {hasLive && <span className="text-xs bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><Radio className="w-3 h-3" /> Live</span>}
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-2xl -mt-8 relative z-10">
          <div className="bg-card border border-border rounded-2xl p-5 mb-5 shadow-sm">
            <h1 className="text-xl font-serif font-bold text-foreground mb-1">{cls.name}</h1>
            <p className="text-xs text-muted-foreground mb-3">{cuisine.icon} {cuisine.name} Cuisine</p>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-foreground">{cls.rating}</span>
                <span className="text-sm text-muted-foreground">({cls.review_count} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm">{cls.duration}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{cls.description}</p>
          </div>

          {(hasRecorded && hasLive) && (
            <div className="bg-card border border-border rounded-2xl p-5 mb-5">
              <h2 className="font-semibold text-foreground mb-3">Choose Your Learning Mode</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSelectedMode("recorded")} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMode === "recorded" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <PlayCircle className={`w-6 h-6 mb-2 ${selectedMode === "recorded" ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="text-sm font-semibold text-foreground">Self-Learning</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Pre-recorded videos, learn at your own pace</p>
                  <p className="text-sm font-bold text-primary mt-2">{formatPrice(recordedPrice)}</p>
                  {cls.video_lessons && <p className="text-[10px] text-muted-foreground">{cls.video_lessons} lessons · {cls.video_hours} hrs</p>}
                </button>
                <button onClick={() => setSelectedMode("live")} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMode === "live" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <Radio className={`w-6 h-6 mb-2 ${selectedMode === "live" ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="text-sm font-semibold text-foreground">Live Class</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time session with an expert instructor</p>
                  <p className="text-sm font-bold text-primary mt-2">{formatPrice(livePrice)}</p>
                  <p className="text-[10px] text-muted-foreground">Interactive · Q&A · {cls.duration}</p>
                </button>
              </div>
            </div>
          )}

          {cls.class_mode === "recorded" && (
            <div className="bg-card border border-border rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-3 mb-2">
                <PlayCircle className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Self-Learning Video Course</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Pre-recorded lessons you can watch anytime, anywhere. Lifetime access.</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {cls.video_lessons && <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {cls.video_lessons} lessons</span>}
                {cls.video_hours && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {cls.video_hours} hrs total</span>}
              </div>
              <p className="text-lg font-bold text-foreground mt-3">{formatPrice(recordedPrice)}</p>
            </div>
          )}

          {cls.class_mode === "live" && (
            <div className="bg-card border border-border rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-3 mb-2">
                <Radio className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Live Interactive Class</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Real-time session with an expert instructor.</p>
              <p className="text-lg font-bold text-foreground mt-3">{formatPrice(livePrice)}</p>
            </div>
          )}

          {/* Dishes */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Dishes You'll Learn
            </h2>
            <div className="flex flex-wrap gap-2">
              {(cls.dishes || []).map((dish: string) => (
                <span key={dish} className="px-3 py-1.5 bg-primary/5 border border-primary/20 text-sm text-foreground rounded-full">{dish}</span>
              ))}
            </div>
          </div>

          {/* What's included */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h2 className="font-semibold text-foreground mb-3">What's Included</h2>
            <div className="space-y-2.5">
              {(cls.includes || []).map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          {relatedClasses.length > 0 && (
            <div className="mb-5">
              <h2 className="font-semibold text-foreground mb-3">More {cuisine.name} Classes</h2>
              <div className="space-y-2">
                {relatedClasses.map((rc: any) => (
                  <Link key={rc.id} to={`/services/detail/${rc.id}`} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors group">
                    <img src={rc.image} alt={rc.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{rc.name}</h4>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {rc.duration} · {mealTypes.find((m) => m.id === rc.meal_type)?.icon} {rc.meal_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-sm font-bold text-foreground">{formatPrice(region.code === "IN" ? rc.price_in : rc.price_us)}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4">
          <div className="max-w-2xl mx-auto">
            {selectedMode === "recorded" && hasRecorded ? (
              <button onClick={handleBuyRecorded} className="w-full py-4 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity shadow-shero flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Buy Course — {formatPrice(recordedPrice)}
              </button>
            ) : (
              <Link to={`/services/book/${cls.id}`} className="w-full py-4 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity shadow-shero flex items-center justify-center gap-2">
                <Radio className="w-5 h-5" /> Book Live Class — {formatPrice(livePrice)}
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default ServiceDetail;
