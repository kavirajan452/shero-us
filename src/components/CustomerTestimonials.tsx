import { useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  { name: "Madhavi Rao", city: "Hyderabad", rating: 5, text: "The Kudumulu tasted exactly like what my grandmother used to make. Brought back beautiful memories. Will order again for every festival!" },
  { name: "Suchitra K", city: "Chennai", rating: 5, text: "Ordered the Festival Gift Hamper for Deepavali — the packaging was stunning and everything was so fresh. My relatives loved it!" },
  { name: "Jyothi S", city: "Bangalore", rating: 5, text: "Nei Appam and Kozhukattai were divine. You can taste the pure ghee and jaggery. No artificial flavours at all." },
  { name: "Dharani M", city: "Coimbatore", rating: 5, text: "Best Athirasam I have found online. Crispy outside, soft inside, and the jaggery flavour is perfect. 10/10!" },
  { name: "Savitha R", city: "Chennai", rating: 5, text: "The Sundal combo was fresh and flavourful. Perfect for our Navaratri puja at home. Kids loved it too!" },
  { name: "Anitha P", city: "Hyderabad", rating: 4, text: "Mango pickle is the real deal — tastes exactly like my mom's Avakaya. The sesame oil aroma is so authentic." },
  { name: "Vaishnavi N", city: "Bangalore", rating: 5, text: "Paal Kozhukattai was heavenly! Delivered perfectly chilled. Such a comfort food — ordering monthly now." },
];

const CustomerTestimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <section className="mt-12 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif font-bold text-foreground">💬 What Our Customers Say</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll("left")} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 text-foreground" />
          </button>
          <button onClick={() => scroll("right")} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {testimonials.map((t) => (
          <div key={t.name} className="snap-start shrink-0 w-72 bg-card border border-border rounded-2xl p-5">
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-4">"{t.text}"</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.city}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CustomerTestimonials;
