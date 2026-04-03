import { Home, Search, ShoppingBag, User, Gift, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BottomNavProps {
  onChatOpen?: () => void;
}

const BottomNav = ({ onChatOpen }: BottomNavProps) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const items = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/instant-delivery", icon: Search, label: t("nav.explore") },
    { to: "/referrals", icon: Gift, label: "Refer" },
    { to: "/order-tracking", icon: ShoppingBag, label: t("nav.orders") },
    { to: "/customer", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        {onChatOpen && (
          <button
            onClick={onChatOpen}
            className="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors text-primary"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="text-[10px] font-medium">Chat</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;
