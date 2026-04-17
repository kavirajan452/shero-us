import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, LogIn } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Explore Menu", to: "/instant-delivery" },
  // Phase 2+: { label: "Subscriptions", to: "/subscriptions" },
  // Phase 2+: { label: "Party Orders", to: "/party-orders" },
  // Phase 2+: { label: "Sweets & Snacks", to: "/sweets-snacks" },
  // Phase 2+: { label: "Become a Partner", to: "/partner-enrollment" },
];

const DesktopNav = () => {
  const { isLoggedIn } = useAuth();

  return (
    <nav className="hidden md:flex items-center justify-between px-8 lg:px-16 py-3 bg-card border-b border-border">
      <div className="flex items-center gap-8">
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
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <Link to="/customer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <User className="w-3.5 h-3.5" />
              My Account
            </Button>
          </Link>
        ) : (
          <>
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <LogIn className="w-3.5 h-3.5" />
                Log In
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default DesktopNav;
