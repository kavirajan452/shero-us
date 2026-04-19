import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { Package, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const FoodProducts = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-24 container mx-auto px-4 text-center">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <Package className="w-16 h-16 text-primary mx-auto mb-4" />
      <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Food Products</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Pickles, powders, masalas, and pantry essentials — homemade and packaged with care. Coming soon!
      </p>
      <div className="inline-block px-6 py-3 rounded-xl bg-secondary text-muted-foreground text-sm font-medium">
        📦 Coming Soon — Stay Tuned!
      </div>
    </main>
    <Footer />
    <BottomNav />
  </div>
);

export default FoodProducts;
