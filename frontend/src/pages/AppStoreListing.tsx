import { Link } from "react-router-dom";
import sheroLogo from "@/assets/shero-logo.png";
import mascotCooking from "@/assets/shero-mascot-cooking.jpeg";
import { Star, Download, Shield, Users, ChefHat } from "lucide-react";

const AppStoreListing = () => {
  const screenshots = [
    { label: "Home", gradient: "from-primary/20 to-accent/20" },
    { label: "Order", gradient: "from-accent/20 to-primary/20" },
    { label: "Chef", gradient: "from-primary/20 to-secondary" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Status bar mock */}
      <div className="h-11 bg-card flex items-center justify-between px-5 text-xs text-muted-foreground border-b border-border">
        <span>9:41</span>
        <div className="flex gap-1.5 items-center">
          <div className="w-4 h-2.5 border border-muted-foreground rounded-sm relative">
            <div className="absolute inset-0.5 bg-foreground rounded-[1px]" style={{ width: "70%" }} />
          </div>
        </div>
      </div>

      {/* App Store header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-1 text-sm text-primary">
        <span>‹</span>
        <span className="font-medium">Search</span>
      </div>

      {/* App info card */}
      <div className="px-5 flex gap-4 items-start">
        <div className="w-20 h-20 shrink-0">
          <img src={mascotCooking} alt="Shero" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground leading-tight">Shero Home Food</h1>
          <p className="text-sm text-primary font-medium">Shero Foods Pvt Ltd</p>
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? "fill-amber-400 text-amber-400" : "fill-amber-400/50 text-amber-400/50"}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">4.6 (12.4K)</span>
          </div>
        </div>
      </div>

      {/* Get button */}
      <div className="px-5 mt-4">
        <Link
          to="/splash"
          className="w-full py-3 rounded-full bg-gradient-shero text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 shadow-shero"
        >
          <Download className="w-4 h-4" /> GET
        </Link>
        <p className="text-center text-[10px] text-muted-foreground mt-1.5">In-App Purchases</p>
      </div>

      {/* Stats row */}
      <div className="flex justify-around px-5 mt-5 py-4 border-y border-border">
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">4.6★</p>
          <p className="text-[10px] text-muted-foreground">12.4K Ratings</p>
        </div>
        <div className="text-center border-x border-border px-6">
          <p className="text-sm font-bold text-foreground">#2</p>
          <p className="text-[10px] text-muted-foreground">Food & Drink</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">4+</p>
          <p className="text-[10px] text-muted-foreground">Age</p>
        </div>
      </div>

      {/* Screenshots carousel */}
      <div className="mt-5 px-5">
        <h2 className="text-sm font-bold text-foreground mb-3">Preview</h2>
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
          {screenshots.map((s, i) => (
            <div
              key={i}
              className={`w-48 h-80 rounded-2xl bg-gradient-to-b ${s.gradient} border border-border shrink-0 flex flex-col items-center justify-center gap-3`}
            >
              <img src={sheroLogo} alt="" className="h-10 opacity-60" />
              <span className="text-xs font-medium text-muted-foreground">{s.label} Screen</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="px-5 mt-5">
        <h2 className="text-sm font-bold text-foreground mb-2">Description</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          India's largest home food platform. Order fresh, homemade meals from 2,400+ home kitchens across 72 cities. 
          Daily tiffins, party catering, sweets, snacks, cooking classes & home services — all by women entrepreneurs.
        </p>
      </div>

      {/* What's New */}
      <div className="px-5 mt-5 mb-6">
        <h2 className="text-sm font-bold text-foreground mb-2">What's New</h2>
        <p className="text-xs text-muted-foreground">Version 3.2.1 • Mar 2026</p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
          <li>• Single Meal Order in 45 mins</li>
          <li>• Shero Classes — yoga, cooking & more</li>
          <li>• Party order tracking</li>
        </ul>
      </div>

      {/* Ratings */}
      <div className="px-5 pb-8 border-t border-border pt-5">
        <h2 className="text-sm font-bold text-foreground mb-3">Ratings & Reviews</h2>
        <div className="flex gap-4 items-start">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">4.6</p>
            <p className="text-[10px] text-muted-foreground">out of 5</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-2">{star}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: star === 5 ? "65%" : star === 4 ? "22%" : star === 3 ? "8%" : star === 2 ? "3%" : "2%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppStoreListing;
