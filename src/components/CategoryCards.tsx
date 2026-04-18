import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePromotions, type Promotion } from "@/hooks/useScreenContent";
import catInstant from "@/assets/cat-instant-delivery.jpg";
import catSubscriptions from "@/assets/cat-subscriptions.jpg";
import catParty from "@/assets/cat-party-orders.jpg";
import catSweets from "@/assets/cat-sweets-snacks.jpg";

interface Category {
  nameKey: string;
  descKey: string;
  vertical: string;
  image: string;
  to: string;
  className?: string;
  imageClassName?: string;
  comingSoon?: boolean;
}

const categories: Category[] = [
  { nameKey: "serviceCategories.instantDelivery", descKey: "serviceCategories.instantDeliveryDesc", vertical: "instant_delivery", image: catInstant, to: "/instant-delivery", className: "col-span-1 row-span-1" },
  { nameKey: "serviceCategories.subscriptions", descKey: "serviceCategories.subscriptionsDesc", vertical: "subscriptions", image: catSubscriptions, to: "/subscriptions", className: "col-span-1 row-span-1", comingSoon: true },
  { nameKey: "serviceCategories.partyOrders", descKey: "serviceCategories.partyOrdersDesc", vertical: "party_orders", image: catParty, to: "/party-orders", className: "col-span-1 row-span-1", comingSoon: true },
  { nameKey: "serviceCategories.sweetsSnacks", descKey: "serviceCategories.sweetsSnacksDesc", vertical: "sweets_snacks", image: catSweets, to: "/sweets-snacks", className: "col-span-1 row-span-1", comingSoon: true },
];

const CategoryCards = () => {
  const { t } = useTranslation();
  const { data: promotions } = usePromotions({ targetScreen: "category_cards" });

  const promoMap: Record<string, Promotion> = {};
  (promotions || []).forEach((p) => { promoMap[p.vertical] = p; });

  return (
    <section className="container mx-auto px-4 py-5">
      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[200px] gap-4">
        {categories.map((cat) => {
          const promo = promoMap[cat.vertical];
          if (cat.comingSoon) {
            return (
              <div
                key={cat.nameKey}
                className={`group relative bg-card rounded-2xl overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.08)] opacity-60 cursor-not-allowed ${cat.className || ""}`}
              >
                <div className="absolute inset-0 bg-background/40 z-10 flex items-start justify-end p-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <div className="p-3.5 md:p-5 pb-0 relative z-0">
                  <h3 className="font-sans font-extrabold text-[13px] md:text-[15px] text-foreground uppercase tracking-tight leading-snug">
                    {t(cat.nameKey)}
                  </h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 tracking-wide font-medium truncate">
                    {t(cat.descKey)}
                  </p>
                </div>
                <img
                  src={cat.image}
                  alt={t(cat.nameKey)}
                  className={`absolute right-0 w-auto object-contain grayscale ${cat.imageClassName || "bottom-0 h-[55%]"}`}
                />
              </div>
            );
          }
          return (
            <Link
              key={cat.nameKey}
              to={cat.to}
              className={`group relative bg-card rounded-2xl overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.13)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.18)] transition-shadow duration-200 ${cat.className || ""}`}
            >
              <div className="p-3.5 md:p-5 pb-0">
                <h3 className="font-sans font-extrabold text-[13px] md:text-[15px] text-foreground uppercase tracking-tight leading-snug">
                  {t(cat.nameKey)}
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 tracking-wide font-medium truncate">
                  {t(cat.descKey)}
                </p>
                {promo?.offer_tag && (
                  <span className="inline-block mt-1.5 text-[9px] font-semibold text-primary/80">
                    {promo.offer_tag}
                  </span>
                )}
              </div>
              <img
                src={cat.image}
                alt={t(cat.nameKey)}
                className={`absolute right-0 w-auto object-contain group-hover:scale-105 transition-transform duration-300 ${cat.imageClassName || "bottom-0 h-[55%]"}`}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryCards;
