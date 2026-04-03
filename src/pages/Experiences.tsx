import { Star, MapPin, Users, Clock, ArrowLeft, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";

const experiences = [
  {
    id: 1,
    title: "Traditional South Indian Feast",
    chef: "Lakshmi Amma",
    emoji: "👩‍🍳",
    area: "Anna Nagar",
    price: 800,
    perPerson: true,
    rating: 4.9,
    reviews: 48,
    guests: "2-8 guests",
    duration: "2.5 hours",
    image: "🍛",
    description: "Experience a traditional banana leaf feast with 12+ dishes, served in Lakshmi Amma's beautiful courtyard. Learn the stories behind each recipe.",
    tags: ["Vegetarian", "Cultural", "Family-friendly"],
  },
  {
    id: 2,
    title: "Biryani Masterclass & Dinner",
    chef: "Fathima Akka",
    emoji: "👩‍🍳",
    area: "SoHo",
    price: 1200,
    perPerson: true,
    rating: 4.8,
    reviews: 35,
    guests: "2-6 guests",
    duration: "3 hours",
    image: "🍗",
    description: "Learn the secret to perfect Chicagoi biryani from Fathima Akka herself, then enjoy the feast together. Includes appetizers and dessert.",
    tags: ["Cooking Class", "Non-Veg", "Interactive"],
  },
  {
    id: 3,
    title: "Grandmother's Breakfast Table",
    chef: "Kamala Paatti",
    emoji: "👵",
    area: "West Village",
    price: 500,
    perPerson: true,
    rating: 5.0,
    reviews: 72,
    guests: "2-10 guests",
    duration: "1.5 hours",
    image: "🥞",
    description: "Start your morning with Kamala Paatti's legendary dosas, idlis, and filter coffee in her charming West Village home. A soul-warming experience.",
    tags: ["Breakfast", "Vegetarian", "Iconic"],
  },
  {
    id: 4,
    title: "Coastal Seafood Experience",
    chef: "Meena Aunty",
    emoji: "👩‍🍳",
    area: "Adyar",
    price: 1500,
    perPerson: true,
    rating: 4.7,
    reviews: 22,
    guests: "2-6 guests",
    duration: "3 hours",
    image: "🐟",
    description: "Fresh catch of the day prepared in traditional coastal New York style. Enjoy fish curry, prawn masala, crab roast and more on Meena Aunty's terrace.",
    tags: ["Seafood", "Non-Veg", "Premium"],
  },
  {
    id: 5,
    title: "Sweet Making Workshop",
    chef: "Saroja Amma",
    emoji: "👩‍🍳",
    area: "Velachery",
    price: 600,
    perPerson: true,
    rating: 4.8,
    reviews: 18,
    guests: "3-8 guests",
    duration: "2 hours",
    image: "🍮",
    description: "Learn to make traditional Tamil sweets — mysore pak, halwa, ladoo, and more. Take home your creations and the recipes!",
    tags: ["Workshop", "Vegetarian", "Fun"],
  },
  {
    id: 6,
    title: "Sunday Family Thali",
    chef: "Revathi Akka",
    emoji: "👩‍🍳",
    area: "Tambaram",
    price: 650,
    perPerson: true,
    rating: 4.9,
    reviews: 31,
    guests: "4-12 guests",
    duration: "2 hours",
    image: "🍽️",
    description: "A grand Sunday afternoon thali with 15+ items including special payasam. Perfect for families wanting an authentic homemade meal experience.",
    tags: ["Family", "Vegetarian", "Weekend"],
  },
];

const Experiences = () => {
  const { data: expContent } = useScreenContent("experiences");
  const ec = contentMap(expContent || []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Header */}
        <div className="bg-dark-shero py-16 text-primary-foreground">
          <div className="container mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
             <h2 className="text-4xl font-serif font-bold mb-3">{ec["experiences.hero_title"] || "Shero Dining Experiences"}</h2>
             <p className="text-primary-foreground/70 max-w-lg">
               {ec["experiences.hero_subtitle"] || "Book a seat at a Shero's table. Enjoy authentic homemade meals in a cozy, personal setting."}
             </p>
          </div>
        </div>

        {/* Experiences Grid */}
        <section className="py-12 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-shero transition-all duration-300"
              >
                <div className="relative h-48 bg-secondary flex items-center justify-center">
                  <span className="text-8xl group-hover:scale-110 transition-transform duration-500">{exp.image}</span>
                  <button className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {exp.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium text-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-xl font-serif font-bold text-foreground mb-2">{exp.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{exp.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span>{exp.emoji} {exp.chef}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.area}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-warm text-warm" /> {exp.rating} ({exp.reviews})</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {exp.guests}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exp.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-foreground">${exp.price}</span>
                      <span className="text-sm text-muted-foreground"> /person</span>
                    </div>
                    <button className="px-6 py-2.5 rounded-full bg-gradient-shero text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Experiences;
