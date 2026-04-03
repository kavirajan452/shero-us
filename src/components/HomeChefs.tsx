import { Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const chefs = [
  { id: "lakshmi-amma", name: "Lakshmi Amma", specialty: "Vegetarian Meals", rating: 4.9, orders: 1200, area: "Anna Nagar", emoji: "👩‍🍳" },
  { id: "fathima-akka", name: "Fathima Akka", specialty: "Biryani Specials", rating: 4.8, orders: 980, area: "T. Nagar", emoji: "👩‍🍳" },
  { id: "kamala-paatti", name: "Kamala Paatti", specialty: "Dosa & Idli", rating: 4.9, orders: 2100, area: "Mylapore", emoji: "👵" },
  { id: "meena-aunty", name: "Meena Aunty", specialty: "Seafood", rating: 4.7, orders: 750, area: "Adyar", emoji: "👩‍🍳" },
];

const HomeChefs = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 container mx-auto px-4">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-serif font-bold text-foreground mb-2">{t("chefs.title")}</h3>
        <p className="text-muted-foreground">{t("chefs.subtitle")}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {chefs.map((chef, i) => (
          <div
            key={chef.name}
            className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-shero transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center text-4xl">
              {chef.emoji}
            </div>
            <h4 className="text-lg font-serif font-bold text-foreground mb-1">{chef.name}</h4>
            <p className="text-sm text-primary font-medium mb-2">{chef.specialty}</p>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <MapPin className="w-3 h-3" /> {chef.area}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warm text-warm" /> {chef.rating}
              </span>
              <span>•</span>
              <span>{chef.orders}+ {t("common.orders")}</span>
            </div>
            <Link
              to={`/chef/${chef.id}`}
              className="block w-full py-2.5 rounded-full border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {t("common.viewMenu")}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeChefs;
