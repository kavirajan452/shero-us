import { useParams, Link } from "react-router-dom";
import { Star, Clock, MapPin, Heart, ArrowLeft, Shield, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const chefData: Record<string, {
  name: string; emoji: string; specialty: string; area: string;
  rating: number; orders: number; bio: string; joined: string;
  menu: { name: string; price: number; time: string; emoji: string; veg: boolean; popular?: boolean }[];
  reviews: { name: string; rating: number; text: string; date: string }[];
}> = {
  "lakshmi-amma": {
    name: "Lakshmi Amma", emoji: "👩‍🍳", specialty: "Vegetarian Meals",
    area: "Anna Nagar", rating: 4.9, orders: 1200,
    bio: "30 years of cooking experience. Specializes in traditional South Indian vegetarian cuisine passed down from her grandmother.",
    joined: "Jan 2023",
    menu: [
      { name: "Sambar Rice", price: 80, time: "30 min", emoji: "🍛", veg: true, popular: true },
      { name: "Curd Rice", price: 60, time: "20 min", emoji: "🍚", veg: true },
      { name: "Lemon Rice", price: 70, time: "25 min", emoji: "🍋", veg: true },
      { name: "Rasam Rice", price: 75, time: "30 min", emoji: "🍲", veg: true, popular: true },
      { name: "Pongal", price: 65, time: "25 min", emoji: "🥘", veg: true },
      { name: "Thali Meals", price: 120, time: "40 min", emoji: "🍽️", veg: true, popular: true },
    ],
    reviews: [
      { name: "Priya R.", rating: 5, text: "Best sambar rice I've ever had! Tastes exactly like my mom's cooking.", date: "2 days ago" },
      { name: "Arun K.", rating: 5, text: "The thali meals are incredible. So many varieties and everything is fresh.", date: "1 week ago" },
      { name: "Deepa S.", rating: 4, text: "Very tasty food. Delivery was slightly delayed but worth the wait.", date: "2 weeks ago" },
    ],
  },
  "fathima-akka": {
    name: "Fathima Akka", emoji: "👩‍🍳", specialty: "Biryani Specials",
    area: "T. Nagar", rating: 4.8, orders: 980,
    bio: "Known for her legendary biryanis. Her secret spice blend has been in the family for generations.",
    joined: "Mar 2023",
    menu: [
      { name: "Chicken Biryani", price: 150, time: "45 min", emoji: "🍗", veg: false, popular: true },
      { name: "Mutton Biryani", price: 220, time: "50 min", emoji: "🥩", veg: false, popular: true },
      { name: "Egg Biryani", price: 100, time: "35 min", emoji: "🥚", veg: false },
      { name: "Veg Biryani", price: 90, time: "35 min", emoji: "🥕", veg: true },
      { name: "Chicken 65", price: 130, time: "30 min", emoji: "🍗", veg: false },
      { name: "Haleem", price: 140, time: "40 min", emoji: "🥘", veg: false, popular: true },
    ],
    reviews: [
      { name: "Ravi M.", rating: 5, text: "The best biryani in Chennai. Period. No restaurant comes close.", date: "3 days ago" },
      { name: "Sara J.", rating: 5, text: "Mutton biryani is out of this world. The meat is so tender!", date: "5 days ago" },
      { name: "Karthik V.", rating: 4, text: "Really good chicken biryani. Generous portions too.", date: "1 week ago" },
    ],
  },
};

const defaultChef = {
  name: "Kamala Paatti", emoji: "👵", specialty: "Dosa & Idli",
  area: "Mylapore", rating: 4.9, orders: 2100,
  bio: "At 72, Kamala Paatti is our most beloved chef. Her crispy dosas and soft idlis are the stuff of legends.",
  joined: "Dec 2022",
  menu: [
    { name: "Masala Dosa", price: 60, time: "20 min", emoji: "🥞", veg: true, popular: true },
    { name: "Plain Dosa", price: 40, time: "15 min", emoji: "🥞", veg: true },
    { name: "Idli (4 pcs)", price: 50, time: "15 min", emoji: "🫓", veg: true, popular: true },
    { name: "Rava Dosa", price: 70, time: "20 min", emoji: "🥞", veg: true },
    { name: "Uttapam", price: 65, time: "20 min", emoji: "🥞", veg: true },
    { name: "Podi Idli", price: 55, time: "15 min", emoji: "🫓", veg: true, popular: true },
  ],
  reviews: [
    { name: "Meena P.", rating: 5, text: "Paatti's dosa is crispy perfection. The chutney is amazing!", date: "1 day ago" },
    { name: "Vijay S.", rating: 5, text: "Reminds me of my grandmother's cooking. Pure comfort food.", date: "4 days ago" },
    { name: "Anita L.", rating: 5, text: "Best idli I've ever tasted. So soft and fluffy!", date: "1 week ago" },
  ],
};

const ChefProfile = () => {
  const { id } = useParams();
  const chef = (id && chefData[id]) || defaultChef;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Chef Header */}
        <div className="bg-secondary/50 py-10">
          <div className="container mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center text-5xl shadow-shero">
                {chef.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-serif font-bold text-foreground">{chef.name}</h2>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-primary font-medium mb-2">{chef.specialty}</p>
                <p className="text-sm text-muted-foreground mb-3 max-w-xl">{chef.bio}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {chef.area}</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-warm text-warm" /> {chef.rating} rating</span>
                  <span>{chef.orders}+ orders</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Since {chef.joined}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 rounded-full bg-gradient-shero text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
                <button className="p-2.5 rounded-full border-2 border-border hover:border-primary transition-colors">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <section className="py-12 container mx-auto px-4">
          <h3 className="text-2xl font-serif font-bold text-foreground mb-6">Today's Menu</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chef.menu.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-shero transition-all duration-300"
              >
                <span className="text-4xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
                    {item.popular && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.veg ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                      {item.veg ? "🥬 Veg" : "🍗 Non-Veg"}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-foreground">₹{item.price}</p>
                  <button className="mt-1 px-3 py-1 rounded-full bg-gradient-shero text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                    Add +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="py-12 bg-secondary/50">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-6">Customer Reviews</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chef.reviews.map((review) => (
                <div
                  key={review.name}
                  className="p-5 rounded-2xl bg-card border border-border"
                >
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warm text-warm" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-3">"{review.text}"</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">{review.name}</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ChefProfile;
