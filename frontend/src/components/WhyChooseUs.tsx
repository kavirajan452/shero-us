import { Heart, ChefHat, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: Heart,
    color: "text-red-500",
    title: "Not Restaurant Food",
    desc: "Cooked in real homes, not commercial kitchens",
  },
  {
    icon: ChefHat,
    color: "text-primary",
    title: "Women Behind Every Meal",
    desc: "Home chefs, not factory cooks",
  },
  {
    icon: ShieldCheck,
    color: "text-amber-600",
    title: "Food You Can Trust Daily",
    desc: "Simple, balanced, made the right way",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.title} className="py-5 first:pt-0 last:pb-0">
              <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
              <h4 className="text-base font-bold text-foreground leading-snug">{item.title}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
