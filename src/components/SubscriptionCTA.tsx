import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, UtensilsCrossed } from "lucide-react";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";

const SubscriptionCTA = () => {
  const { data: items } = useScreenContent("subscription_cta");
  const c = contentMap(items || []);

  return (
    <section className="py-4 container mx-auto px-4 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-3">
        <Link to="/subscriptions" className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all group">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-0.5">
              {c["subscription_cta.meal_plans_title"] || "Meal Subscription Plans"}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {c["subscription_cta.meal_plans_desc"] || "Subscribe to daily homemade meals."}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
        </Link>

        <Link to="/experiences" className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all group">
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-0.5">
              {c["subscription_cta.dining_title"] || "Book a Home Dining Experience"}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {c["subscription_cta.dining_desc"] || "Dine at a Shero's table."}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
        </Link>
      </div>
    </section>
  );
};

export default SubscriptionCTA;
