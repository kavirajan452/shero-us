import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { User, LogIn, ShoppingBag } from "lucide-react";
import sheroLogo from "@/assets/shero-logo.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Explore Menu", to: "/instant-delivery" },
  // Phase 2+: { label: "Subscriptions", to: "/subscriptions" },
  // Phase 2+: { label: "Party Orders", to: "/party-orders" },
  // Phase 2+: { label: "Sweets & Snacks", to: "/sweets-snacks" },
  // Phase 2+: { label: "Become a Partner", to: "/partner-enrollment" },
];

const DesktopNav = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="hidden md:flex items-center justify-between px-8 lg:px-16 py-3 bg-card border-b border-border">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 mr-4">
          <img src={sheroLogo} alt="Shero Home Food" className="h-9" />
        </Link>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {!isLoading && (
          isLoggedIn ? (
            <Link
              to="/customer"
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              title="My Account"
            >
              <User className="w-5 h-5 text-foreground" />
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <LogIn className="w-3.5 h-3.5" />
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )
        )}
        <Link
          to="/checkout"
          className="relative p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ShoppingBag className="w-5 h-5 text-foreground" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default DesktopNav;
