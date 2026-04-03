const items = [
  { emoji: "🌍", text: "First Branded Home Food" },
  { emoji: "🏡", text: "Verified Kitchens" },
  { emoji: "🍲", text: "Authentic Recipes" },
  { emoji: "✔️", text: "Quality Assured" },
];

const TrustBar = () => {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="container mx-auto px-4 py-2.5 md:py-3">
        <div className="flex items-center justify-center gap-3 md:gap-8 whitespace-nowrap overflow-x-auto scrollbar-none">
          {items.map((item, i) => (
            <div key={item.text} className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm md:text-base">{item.emoji}</span>
              <span className="text-xs md:text-sm font-semibold text-foreground">{item.text}</span>
              {i < items.length - 1 && <span className="text-border ml-2 md:ml-4">•</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
