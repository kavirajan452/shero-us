import { Zap, CalendarCheck, Sparkles, PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryData {
  instant: { total: number; pending: number };
  subscription: { total: number; pending: number };
  services: { total: number; upcoming: number };
  party: { total: number; pending: number };
}

const OrderSummaryCards = ({ data }: { data: SummaryData }) => {
  const cards = [
    {
      label: "Instant Orders",
      emoji: "⚡",
      icon: Zap,
      total: data.instant.total,
      badge: `${data.instant.pending} pending`,
      badgeColor: data.instant.pending > 0 ? "text-destructive" : "text-muted-foreground",
      accent: "border-l-orange-500",
    },
    {
      label: "Subscriptions",
      emoji: "🔒",
      icon: CalendarCheck,
      total: data.subscription.total,
      badge: `${data.subscription.pending} to cook`,
      badgeColor: data.subscription.pending > 0 ? "text-primary" : "text-muted-foreground",
      accent: "border-l-emerald-500",
    },
    {
      label: "Services",
      emoji: "✨",
      icon: Sparkles,
      total: data.services.total,
      badge: `${data.services.upcoming} upcoming`,
      badgeColor: data.services.upcoming > 0 ? "text-primary" : "text-muted-foreground",
      accent: "border-l-sky-500",
    },
    {
      label: "Party Orders",
      emoji: "🎉",
      icon: PartyPopper,
      total: data.party.total,
      badge: `${data.party.pending} pending`,
      badgeColor: data.party.pending > 0 ? "text-amber-600" : "text-muted-foreground",
      accent: "border-l-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {cards.map((c) => (
        <Card key={c.label} className={`border-border bg-card border-l-4 ${c.accent}`}>
          <CardContent className="p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{c.emoji}</span>
              <span className="text-[10px] font-semibold text-foreground">{c.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{c.total}</p>
            <span className={`inline-block mt-0.5 text-[9px] font-medium ${c.badgeColor}`}>
              {c.badge}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderSummaryCards;
