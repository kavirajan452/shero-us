import { useState } from "react";
import { useNavigate } from "react-router-dom";
import sheroLogo from "@/assets/shero-logo.png";
import mascotCooking from "@/assets/shero-mascot-cooking.jpeg";
import mascotWelcome from "@/assets/shero-mascot-welcome.png";
import mascotPresenting from "@/assets/shero-mascot-presenting.png";
import mascotKitchen from "@/assets/shero-mascot-kitchen.png";
import { ArrowRight, ChefHat, Truck, CalendarCheck, PartyPopper, GraduationCap, Heart } from "lucide-react";

const slides = [
  {
    icon: Heart,
    mascot: mascotCooking,
    title: "Home-Cooked Meals",
    subtitle: "Fresh, healthy food made by women home chefs near you — just like Amma's cooking.",
    gradient: "from-primary/15 to-accent/10",
  },
  {
    icon: Truck,
    mascot: mascotWelcome,
    title: "Delivered in 45 mins",
    subtitle: "Order single meal order or subscribe for daily tiffins. Breakfast, lunch & dinner covered.",
    gradient: "from-accent/15 to-primary/10",
  },
  {
    icon: PartyPopper,
    mascot: mascotPresenting,
    title: "Parties & Catering",
    subtitle: "Bulk orders for birthdays, weddings, office events — authentic homemade food at scale.",
    gradient: "from-primary/10 to-secondary",
  },
  {
    icon: GraduationCap,
    mascot: mascotKitchen,
    title: "Classes & Services",
    subtitle: "Learn cooking, yoga & fitness. Book kitchen cleaning, cook-on-demand & more.",
    gradient: "from-secondary to-primary/10",
  },
];

const Onboarding = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const isLast = current === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      navigate("/welcome", { replace: true });
    } else {
      setCurrent(current + 1);
    }
  };

  const handleSkip = () => {
    navigate("/welcome", { replace: true });
  };

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-10 relative overflow-hidden">
      {/* Skip */}
      <div className="w-full flex justify-end">
        <button onClick={handleSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Skip
        </button>
      </div>

      {/* Illustration area */}
      <div className="w-full max-w-xs aspect-square flex flex-col items-center justify-center my-8 transition-all duration-500 relative">
        <img src={slide.mascot} alt={slide.title} className="w-56 h-56 object-contain drop-shadow-xl" />
      </div>

      {/* Content */}
      <div className="text-center max-w-sm">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
          {slide.title}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {slide.subtitle}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="w-full max-w-sm flex flex-col items-center gap-6 mt-8">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Next / Get Started */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 shadow-shero hover:opacity-90 transition-opacity"
        >
          {isLast ? "Get Started" : "Next"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
