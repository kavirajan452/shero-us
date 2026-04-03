import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";
import sheroPresentingImg from "@/assets/shero-mascot-presenting.png";

const SubscriptionCTA = () => {
  const { data: items } = useScreenContent("subscription_cta");
  const c = contentMap(items || []);

  return (
    <section className="py-4 container mx-auto px-4 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-3">
        <Link to="/subscriptions" className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-sm transition-all group relative overflow-hidden">
          <img src={sheroPresentingImg} alt="" className="absolute right-2 bottom-0 h-20 opacity-40 pointer-events-none drop-shadow-md" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-0.5">
              {c["subscription_cta.meal_plans_title"] || "Meal Subscription Plans"}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {c["subscription_cta.meal_plans_desc"] || "Subscribe to daily homemade meals."}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
        </Link>

        <Link to="/experiences" className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 border border-purple-100 hover:shadow-sm transition-all group">
          <div className="text-4xl shrink-0">🍽️</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-0.5">
              {c["subscription_cta.dining_title"] || "Book a Home Dining Experience"}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {c["subscription_cta.dining_desc"] || "Dine at a Shero's table."}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
        </Link>
      </div>
    </section>
  );
};

export default SubscriptionCTA;
