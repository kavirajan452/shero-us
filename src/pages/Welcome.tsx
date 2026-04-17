import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import sheroLogo from "@/assets/shero-logo.png";
import mascotWelcome from "@/assets/shero-mascot-welcome.png";
import { ArrowRight, UtensilsCrossed, ChefHat, Shield } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

type Role = "customer" | "partner" | null;

const Welcome = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { addReferralCredit } = useWallet();

  // Auto-credit referral if ?ref= present
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) addReferralCredit(ref);
  }, [searchParams, addReferralCredit]);

  const roles = [
    {
      id: "customer" as Role,
      icon: UtensilsCrossed,
      title: "I want to order Food & Services",
      subtitle: "Home-cooked meals, subscriptions, catering, kitchen cleaning & more",
      emoji: "🍽️",
    },
    {
      id: "partner" as Role,
      icon: ChefHat,
      title: "I want to become a Chef / Service Provider",
      subtitle: "Cook, teach, clean or cater — earn from your skills with Shero",
      emoji: "👩‍🍳",
    },
  ];

  const selectedRole = selectedIndex !== null ? roles[selectedIndex] : null;
  const getStartedLink = selectedRole?.id === "partner" ? "/register?role=partner" : "/register?role=customer";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        <img src={sheroLogo} alt="Shero Home Food" className="h-20 mb-2 animate-fade-in" />
        <img src={mascotWelcome} alt="Shero mascot" className="w-28 h-28 object-contain mb-2 drop-shadow-md animate-fade-in" />

        {/* Promo video */}
        <div className="w-full rounded-2xl overflow-hidden mb-6 shadow-shero">
          <video
            src="/shero-promo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-40 object-cover"
          />
        </div>

        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
          Homemade Food,{" "}
          <span className="text-gradient-shero">Delivered.</span>
        </h1>

        <p className="text-muted-foreground text-base mb-8 leading-relaxed">
          India's #1 home food platform — now in the USA. Authentic meals by home chefs & branded kitchens, delivered fresh to your door.
        </p>

        {/* Role Selection */}
        <div className="w-full space-y-3 mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-2">How would you like to use Shero?</p>
          {roles.map((role, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                selectedIndex === idx
                  ? "border-primary bg-primary/5 shadow-shero"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-3xl">{role.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm ${selectedIndex === idx ? "text-primary" : "text-foreground"}`}>
                  {role.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{role.subtitle}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selectedIndex === idx ? "border-primary bg-primary" : "border-muted-foreground/30"
                }`}
              >
                {selectedIndex === idx && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                )}
              </div>
            </button>
          ))}
        </div>

        <Link
          to={getStartedLink}
          className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-shero mb-4 ${
            selectedIndex !== null
              ? "bg-gradient-shero text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
          }`}
          onClick={(e) => { if (selectedIndex === null) e.preventDefault(); }}
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </Link>

        <Link
          to={`/login?role=${selectedRole?.id || "customer"}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          I already have an account
        </Link>

        <Link
          to="/admin/login"
          className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Shield className="w-3.5 h-3.5" /> Team Login
        </Link>

        {/* Mock app store badges */}
        <div className="flex items-center gap-4 mt-12 opacity-40">
          <div className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground">
            ▶ Google Play
          </div>
          <div className="px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground">
             App Store
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
