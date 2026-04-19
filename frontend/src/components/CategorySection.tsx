import { useTranslation } from "react-i18next";

const categoryKeys = [
  { key: "rice", emoji: "🍚", count: 45 },
  { key: "dosa", emoji: "🥞", count: 32 },
  { key: "idli", emoji: "🫓", count: 28 },
  { key: "biryani", emoji: "🍛", count: 56 },
  { key: "chapati", emoji: "🫓", count: 22 },
  { key: "curries", emoji: "🥗", count: 38 },
  { key: "snacks", emoji: "🍘", count: 41 },
  { key: "sweets", emoji: "🍮", count: 19 },
];

const CategorySection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 container mx-auto px-4">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-serif font-bold text-foreground mb-2">
          {t("categories.title")}
        </h3>
        <p className="text-muted-foreground">
          {t("categories.subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {categoryKeys.map((cat, i) => (
          <button
            key={cat.key}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-warm transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
              {cat.emoji}
            </span>
            <span className="text-sm font-semibold text-foreground">{t(`categories.${cat.key}`)}</span>
            <span className="text-xs text-muted-foreground">{cat.count} {t("common.items")}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
