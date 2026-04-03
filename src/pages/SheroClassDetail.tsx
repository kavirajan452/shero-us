import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { useRegion } from "@/contexts/RegionContext";
import { useSheroClass } from "@/hooks/useCatalogData";
import { ArrowLeft, Star, Clock, PlayCircle, Radio, CheckCircle, Video, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SheroClassDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const { formatPrice, region, calcTax } = useRegion();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: cls, isLoading } = useSheroClass(classId);

  const showSelf = cls && (cls.mode === "self-learning" || cls.mode === "both");
  const showLive = cls && (cls.mode === "live" || cls.mode === "both");
  const defaultMode = showSelf ? "self-learning" : "live";
  const [selectedMode, setSelectedMode] = useState<"self-learning" | "live">(defaultMode);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-24 container mx-auto px-4 text-center">
          <div className="h-56 bg-muted rounded-2xl animate-pulse mb-4" />
          <div className="h-8 bg-muted rounded w-1/2 mx-auto animate-pulse" />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-24 container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Class not found</p>
          <Link to="/shero-classes" className="text-primary font-semibold mt-4 inline-block">← Back to Classes</Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const price = selectedMode === "self-learning"
    ? (region.code === "IN" ? cls.self_learning_price_in : cls.self_learning_price_us)
    : (region.code === "IN" ? cls.live_price_in : cls.live_price_us);

  const tax = calcTax(price);
  const total = price + tax;

  const handlePurchase = () => {
    toast({
      title: selectedMode === "self-learning" ? "🎉 Course Purchased!" : "📅 Session Booked!",
      description: `${cls.name} — ${formatPrice(total)} (incl. ${region.taxLabel}). ${selectedMode === "self-learning" ? "Start learning now!" : "You'll receive a confirmation email."}`,
    });
    navigate("/order-confirmation");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-28">
        {/* Hero Image */}
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img src={cls.image} alt={cls.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute top-4 left-4">
            <Link to={`/shero-classes/${cls.category_id}`} className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-1.5 mb-2">
              {showSelf && <span className="text-[10px] bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full flex items-center gap-1"><PlayCircle className="w-3 h-3" /> Self-Learning</span>}
              {showLive && <span className="text-[10px] bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full flex items-center gap-1"><Radio className="w-3 h-3" /> Live 1-on-1</span>}
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-white">{cls.name}</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-2xl">
          {/* Instructor */}
          <div className="flex items-center gap-3 py-4 border-b border-border">
            <img src={cls.instructor_image} alt={cls.instructor} className="w-10 h-10 rounded-full object-cover ring-2 ring-border" />
            <div>
              <p className="text-sm font-semibold text-foreground">{cls.instructor}</p>
              <p className="text-xs text-muted-foreground">Expert Instructor</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-foreground">{cls.rating}</span>
              <span className="text-xs text-muted-foreground">({cls.review_count})</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground py-4">{cls.description}</p>

          {/* Mode Selector */}
          {cls.mode === "both" && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Choose Your Learning Mode</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedMode("self-learning")}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedMode === "self-learning"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <PlayCircle className={`w-6 h-6 mb-2 ${selectedMode === "self-learning" ? "text-primary" : "text-muted-foreground"}`} />
                  <h4 className="text-sm font-bold text-foreground">Self-Learning</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Recorded videos · Learn anytime</p>
                  {cls.video_lessons && <p className="text-[10px] text-primary font-medium mt-1">{cls.video_lessons} lessons · {cls.video_hours} hrs</p>}
                  <p className="text-lg font-bold text-foreground mt-2">
                    {formatPrice(region.code === "IN" ? cls.self_learning_price_in : cls.self_learning_price_us)}
                  </p>
                </button>
                <button
                  onClick={() => setSelectedMode("live")}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedMode === "live"
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/30"
                  }`}
                >
                  <Radio className={`w-6 h-6 mb-2 ${selectedMode === "live" ? "text-accent" : "text-muted-foreground"}`} />
                  <h4 className="text-sm font-bold text-foreground">Live 1-on-1</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Real-time · Interactive sessions</p>
                  <p className="text-[10px] text-accent font-medium mt-1">Personalized attention</p>
                  <p className="text-lg font-bold text-foreground mt-2">
                    {formatPrice(region.code === "IN" ? cls.live_price_in : cls.live_price_us)}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Single mode display */}
          {cls.mode !== "both" && (
            <div className="mb-5 p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-1">
                {cls.mode === "self-learning" ? <PlayCircle className="w-5 h-5 text-primary" /> : <Radio className="w-5 h-5 text-accent" />}
                <h4 className="text-sm font-bold text-foreground">
                  {cls.mode === "self-learning" ? "Self-Learning Course" : "Live 1-on-1 Session"}
                </h4>
              </div>
              {cls.video_lessons && cls.mode === "self-learning" && (
                <p className="text-xs text-primary mb-1">{cls.video_lessons} lessons · {cls.video_hours} hrs</p>
              )}
              <p className="text-xl font-bold text-foreground">{formatPrice(price)}</p>
            </div>
          )}

          {/* Highlights */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">What's Included</h3>
            <div className="space-y-2">
              {(cls.highlights || []).map((h: string) => (
                <div key={h} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-sm text-foreground">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info Row */}
          <div className="flex gap-4 mb-6 py-3 border-t border-b border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{cls.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-4 h-4 text-primary" />
              <span>{cls.instructor}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 text-accent" />
              <span>Secure Payment</span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h3 className="font-semibold text-foreground mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {selectedMode === "self-learning" ? "Course Fee" : "Session Fee"}
                </span>
                <span className="text-foreground">{formatPrice(price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{region.taxLabel}</span>
                <span className="text-foreground">{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handlePurchase}
            className="w-full py-4 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity shadow-shero"
          >
            {selectedMode === "self-learning" ? `Buy Course — ${formatPrice(total)}` : `Book Live Session — ${formatPrice(total)}`}
          </button>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Price includes {region.taxLabel}. Secure checkout.
          </p>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default SheroClassDetail;
