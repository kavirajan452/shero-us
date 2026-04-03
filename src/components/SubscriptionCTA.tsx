import { Link } from "react-router-dom";
import { ArrowRight, PartyPopper, Cookie } from "lucide-react";

const SubscriptionCTA = () => {
  return (
    <section className="py-4 container mx-auto px-4 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-3">
        <Link to="/party-orders" className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all group">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <PartyPopper className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-0.5">Party Orders</h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">Bulk food & combo boxes for events.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
        </Link>

        <Link to="/sweets-snacks" className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all group">
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-0.5">Sweets & Snacks</h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">Homemade treats delivered to your door.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
        </Link>
      </div>
    </section>
  );
};

export default SubscriptionCTA;
