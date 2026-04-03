import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PromoBanner from "@/components/PromoBanner";
import DesktopNav from "@/components/DesktopNav";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";

import CategoryCards from "@/components/CategoryCards";
import TrendingDishesCarousel from "@/components/TrendingDishesCarousel";
import SubscriptionCTA from "@/components/SubscriptionCTA";
import TopChefsCarousel from "@/components/TopChefsCarousel";
import WhyChooseUs from "@/components/WhyChooseUs";
import AboutSheroCTA from "@/components/AboutSheroCTA";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const { role, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && role === "partner") {
      navigate("/partner", { replace: true });
    }
  }, [isLoggedIn, role, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <DesktopNav />
      <main>
        <HeroSection />
        <TrustBar />
        <CategoryCards />
        <TrendingDishesCarousel />
        <AboutSheroCTA />
        <SubscriptionCTA />
        <TopChefsCarousel />
        <WhyChooseUs />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
