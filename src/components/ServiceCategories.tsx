import { Link } from "react-router-dom";
import { Bike, CalendarDays, PartyPopper, Cookie, GraduationCap, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const serviceKeys = [
  {
    nameKey: "serviceCategories.instantDelivery",
    descKey: "serviceCategories.instantDeliveryDesc",
    icon: Bike,
    to: "/instant-delivery",
    gradient: "from-primary/15 to-primary/5",
    iconColor: "text-primary",
  },
  {
    nameKey: "serviceCategories.subscriptions",
    descKey: "serviceCategories.subscriptionsDesc",
    icon: CalendarDays,
    to: "/subscriptions",
    gradient: "from-accent-foreground/15 to-accent-foreground/5",
    iconColor: "text-accent-foreground",
  },
  {
    nameKey: "serviceCategories.partyOrders",
    descKey: "serviceCategories.partyOrdersDesc",
    icon: PartyPopper,
    to: "/party-orders",
    gradient: "from-primary/15 to-primary/5",
    iconColor: "text-primary",
  },
];

const ServiceCategories = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 container mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
          {t("serviceCategories.title")}
        </h2>
        <p className="text-muted-foreground">{t("serviceCategories.subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {serviceKeys.map((service, i) => (
          <Link
            key={service.nameKey}
            to={service.to}
            className={`group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br ${service.gradient} border border-border hover:border-primary/30 hover:shadow-shero transition-all duration-300 animate-scale-in`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`p-3 rounded-xl bg-card shadow-sm ${service.iconColor}`}>
              <service.icon className="w-7 h-7" />
            </div>
            <span className="text-sm font-semibold text-foreground text-center leading-tight">
              {t(service.nameKey)}
            </span>
            <span className="text-xs text-muted-foreground text-center hidden sm:block">
              {t(service.descKey)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ServiceCategories;
