import { Link } from "react-router-dom";
import { Bike, CalendarDays, PartyPopper, Cookie, GraduationCap, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const actions = [
  { icon: Bike, labelKey: "serviceCategories.instantDelivery", to: "/instant-delivery", color: "text-primary" },
  { icon: CalendarDays, labelKey: "serviceCategories.subscriptions", to: "/subscriptions", color: "text-accent-foreground" },
  { icon: PartyPopper, labelKey: "serviceCategories.partyOrders", to: "/party-orders", color: "text-primary" },
];

const QuickActions = () => {
  const { t } = useTranslation();

  return (
    <section className="py-6 container mx-auto px-4">
      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
        {actions.map((action) => (
          <Link
            key={action.labelKey}
            to={action.to}
            className="flex flex-col items-center gap-2 min-w-[72px] group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm group-hover:border-primary/40 group-hover:shadow-shero transition-all duration-300 ${action.color}`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-foreground text-center leading-tight max-w-[72px]">
              {t(action.labelKey)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
