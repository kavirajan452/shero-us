import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import sheroLogo from "@/assets/shero-logo.png";
import mascotCooking from "@/assets/shero-mascot-cooking.jpeg";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding", { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated glow */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/15 blur-[80px] animate-pulse" />
      
      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        <img 
          src={sheroLogo} 
          alt="Shero Home Food" 
          className="h-28 mb-4 drop-shadow-lg" 
        />
        <img src={mascotCooking} alt="Shero Chef" className="w-32 h-32 object-contain mb-4 drop-shadow-lg" />
        <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">
          Shero Home Food
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">Truly Homemade Love</p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-20 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      {/* Footer text */}
      <p className="absolute bottom-8 text-[10px] text-muted-foreground/50">
        from Shero Foods Pvt Ltd
      </p>
    </div>
  );
};

export default SplashScreen;
