import { useScreenContent, contentMap } from "@/hooks/useScreenContent";

const bullets = [
  { emoji: "🌍", key: "branded", defaultText: "World's First Branded Home Food" },
  { emoji: "🏡", key: "verified", defaultText: "Verified Home Kitchens" },
  { emoji: "🍲", key: "authentic", defaultText: "Authentic Indian Recipes" },
  { emoji: "✔️", key: "quality", defaultText: "Consistent Quality & Safety" },
];

const WhyChooseUs = () => {
  const { data: items } = useScreenContent("why");
  const c = contentMap(items || []);

  return (
    <section className="py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col gap-2">
          {bullets.map((b) => (
            <div key={b.key} className="flex items-center gap-2.5">
              <span className="text-lg">{b.emoji}</span>
              <span className="text-base md:text-lg font-semibold text-foreground">
                {c[`why.${b.key}`] || b.defaultText}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
