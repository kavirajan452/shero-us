const items = [
  { emoji: "🌍", text: "World's First Branded Home Food" },
  { emoji: "🏡", text: "Verified Home Kitchens" },
  { emoji: "🍲", text: "Authentic Indian Recipes" },
  { emoji: "✔️", text: "Consistent Quality & Safety" },
];

const TrustBar = () => {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-center gap-4 md:gap-10 flex-wrap">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-sm md:text-base font-semibold text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
