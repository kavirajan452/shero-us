import { ShoppingBag, User, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import sheroLogo from "@/assets/shero-logo.png";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { region } = useRegion();
  const { totalItems } = useCart();
  const { t } = useTranslation();

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/instant-delivery", label: t("nav.instantDelivery", "Single Meal Order") },
    { to: "/subscriptions", label: t("nav.subscriptions") },
    { to: "/party-orders", label: t("nav.partyOrders") },
    { to: "/food-products", label: t("nav.foodProducts") },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={sheroLogo} alt="Shero Home Food" className="h-10" />
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{region.cities}</span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          
          <Link
            to="/auth"
            className="hidden md:inline-flex px-5 py-2 rounded-full bg-gradient-shero text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {t("nav.orderNow")}
          </Link>
          <Link
            to="/customer"
            className="hidden md:flex p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <User className="w-5 h-5 text-foreground" />
          </Link>
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
          <button
            className="lg:hidden p-2 rounded-full hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-primary"
            >
              {t("nav.loginSignUp")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
