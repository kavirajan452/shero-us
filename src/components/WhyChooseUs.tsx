import { Heart, ChefHat, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: Heart,
    color: "text-red-500",
    title: "Made by Women, from Their Homes",
    desc: "Real care. Real cooking. Real homes.",
  },
  {
    icon: ChefHat,
    color: "text-primary",
    title: "Women Home Chefs",
    desc: "Independent kitchens led by women",
  },
  {
    icon: ShieldCheck,
    color: "text-amber-600",
    title: "Trusted & Safe Food",
    desc: "Cooked with care, held to standards",
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
