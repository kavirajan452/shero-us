import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ClipboardList, IndianRupee, Star, TrendingUp, Clock, CheckCircle2, Gift, Users, Share2, AlertTriangle, CreditCard, CalendarIcon, MessageCircle, ChefHat, Package, GraduationCap, Heart, Lightbulb, UtensilsCrossed, Globe, FileBarChart, Award, Cookie, Sparkles, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { partnerOrders, earningsSummary, referralStats, referralCode, weeklyEarnings, opportunitySummary } from "@/data/partnerMockData";
import { subscriptionMealOrders, serviceBookings } from "@/data/partnerSubscriptionData";
import { useRegion } from "@/contexts/RegionContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import WalletSection from "@/components/WalletSection";
import sheroGreeting from "@/assets/shero-mascot-greeting.png";

const PartnerDashboard = () => {
  const { formatPrice } = useRegion();
  const { profile } = useAuth();
  const [topItemsDateRange, setTopItemsDateRange] = useState<{ from?: Date; to?: Date }>({});

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = profile?.full_name?.split(" ")[0] || "Chef";
    if (hour < 12) return `Good morning, ${name}! ☀️`;
    if (hour < 17) return `Good afternoon, ${name}! 🌤️`;
    return `Good evening, ${name}! 🌙`;
  }, [profile?.full_name]);

  // Order counts
  const newOrders = partnerOrders.filter((o) => o.status === "new");
  const preparingOrders = partnerOrders.filter((o) => ["accepted", "preparing"].includes(o.status));
  const readyOrders = partnerOrders.filter((o) => o.status === "ready");
  const today = new Date().toISOString().split("T")[0];
  const todaySubOrders = subscriptionMealOrders.filter((o) => o.date === today && o.status === "pending");
  const todayServices = serviceBookings.filter((b) => b.date === today && b.status === "upcoming");

  // Mock messages count
  const unreadMessages = 3;

  const stats = [
    {
      label: "Today's Earnings",
      value: formatPrice(earningsSummary.today),
      icon: IndianRupee,
      accent: "border-l-emerald-500",
      opportunity: opportunitySummary.missedToday > 0 ? formatPrice(opportunitySummary.potentialToday) : null,
    },
    { label: "Total Orders", value: earningsSummary.totalOrders.toString(), icon: ClipboardList, accent: "border-l-blue-500" },
    { label: "Avg Rating", value: earningsSummary.avgRating.toFixed(1), icon: Star, accent: "border-l-amber-500" },
    { label: "Completion", value: `${earningsSummary.completionRate}%`, icon: TrendingUp, accent: "border-l-teal-500" },
  ];

  const OpportunityTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const actual = payload.find((p: any) => p.dataKey === "amount");
    const potential = payload.find((p: any) => p.dataKey === "potential");
    const missed = (potential?.value || 0) - (actual?.value || 0);
    return (
      <div className="bg-card border border-border rounded-lg p-2.5 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-accent">Earned: {formatPrice(actual?.value || 0)}</p>
        {missed > 0 && <p className="text-destructive">Missed: {formatPrice(missed)}</p>}
        {potential?.value > 0 && <p className="text-muted-foreground">Potential: {formatPrice(potential?.value || 0)}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <img src={sheroGreeting} alt="Shero" className="w-14 h-14 rounded-full object-cover object-top border-2 border-primary/20 shadow-sm shrink-0" />
        <div>
          <h2 className="text-xl font-serif font-bold text-foreground">{greeting}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Here's your kitchen overview for today</p>
        </div>
      </div>

      {/* ═══ PRIORITY ACTION TILES ═══ */}
      <div className="grid grid-cols-2 gap-2">
        {/* Orders Hub Tile */}
        <Link to="/partner/orders" className="col-span-2">
          <Card className="border-border bg-card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-xs">Order Hub</p>
                  <p className="text-[9px] text-muted-foreground">All channels · Tap to manage</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-muted/40 rounded-lg p-1.5 text-center border border-border">
                  <p className="text-lg font-bold text-destructive">{newOrders.length + todaySubOrders.length + todayServices.length}</p>
                  <p className="text-[8px] text-muted-foreground font-medium uppercase">New</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-1.5 text-center border border-border">
                  <p className="text-lg font-bold text-amber-600">{preparingOrders.length}</p>
                  <p className="text-[8px] text-muted-foreground font-medium uppercase">Preparing</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-1.5 text-center border border-border">
                  <p className="text-lg font-bold text-emerald-600">{readyOrders.length}</p>
                  <p className="text-[8px] text-muted-foreground font-medium uppercase">Ready</p>
                </div>
              </div>
              {newOrders.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-destructive font-semibold">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  {newOrders.length} new order{newOrders.length > 1 ? "s" : ""} waiting — tap to accept
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* New Messages Tile */}
        <Link to="/partner/messages">
          <Card className="border-border bg-card hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-blue-500">
            <CardContent className="p-2.5 flex flex-col items-center justify-center text-center h-full">
              <div className="relative mb-1">
                <MessageCircle className="w-6 h-6 text-primary" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </div>
              <p className="font-semibold text-foreground text-[11px]">Messages</p>
              <p className="text-[9px] text-muted-foreground">{unreadMessages} unread</p>
            </CardContent>
          </Card>
        </Link>

        {/* Party Orders Tile */}
        <Link to="/partner/party-orders">
          <Card className="border-border bg-card hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-amber-500">
            <CardContent className="p-2.5 flex flex-col items-center justify-center text-center h-full">
              <div className="mb-1">
                <PartyPopper className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-[11px]">Party Orders</p>
              <p className="text-[9px] text-muted-foreground">1 pending</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ═══ EARNINGS STATS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((s) => (
          <Card key={s.label} className={`border-border bg-card border-l-4 ${s.accent}`}>
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <s.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[9px] text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              {"opportunity" in s && s.opportunity && (
                <p className="text-[10px] text-destructive/70 mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Could be {s.opportunity}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Opportunity Banner */}
      {opportunitySummary.missedThisWeek > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Missed this week: <span className="text-destructive">{formatPrice(opportunitySummary.missedThisWeek)}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Earned {formatPrice(opportunitySummary.actualThisWeek)} of {formatPrice(opportunitySummary.potentialThisWeek)} potential.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ QUICK SHORTCUTS — Sidebar Highlights ═══ */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quick Shortcuts</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Menu", icon: UtensilsCrossed, to: "/partner/menu" },
            { label: "Kitchens", icon: Globe, to: "/partner/cuisines" },
            { label: "Schedule", icon: Clock, to: "/partner/kitchen-schedule" },
            { label: "Attendance", icon: CheckCircle2, to: "/partner/kitchen-attendance" },
            { label: "Training", icon: GraduationCap, to: "/partner/training" },
            { label: "Finance", icon: FileBarChart, to: "/partner/reports" },
            { label: "SCV", icon: Award, to: "/partner/performance-scv" },
            { label: "Earnings", icon: IndianRupee, to: "/partner/earnings" },
          ].map((s) => (
            <Link key={s.label} to={s.to}>
              <div className="bg-muted/50 rounded-lg p-2 flex flex-col items-center gap-1 hover:shadow-sm transition-shadow cursor-pointer border border-border hover:bg-accent/30">
                <s.icon className="w-4 h-4 text-primary" />
                <span className="text-[9px] font-medium text-foreground text-center leading-tight">{s.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ WEEKLY EARNINGS CHART ═══ */}
      <Card className="border-border">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
            PPP Earnings This Week
            <span className="text-[9px] font-normal text-muted-foreground">(grey = opportunity)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyEarnings} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<OpportunityTooltip />} />
                <Bar dataKey="potential" fill="#B0B0B0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ═══ TOP ITEMS SOLD ═══ */}
      <Card className="border-border">
        <CardHeader className="pb-1 pt-3 px-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              Top Items Sold
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-7 text-[10px] gap-1", !topItemsDateRange.from && "text-muted-foreground")}>
                  <CalendarIcon className="w-3 h-3" />
                  {topItemsDateRange.from ? (
                    topItemsDateRange.to
                      ? `${format(topItemsDateRange.from, "dd MMM")} – ${format(topItemsDateRange.to, "dd MMM")}`
                      : format(topItemsDateRange.from, "dd MMM yyyy")
                  ) : "All Time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={topItemsDateRange.from ? { from: topItemsDateRange.from, to: topItemsDateRange.to } : undefined}
                  onSelect={(range) => setTopItemsDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={1}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
                {topItemsDateRange.from && (
                  <div className="px-3 pb-3">
                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setTopItemsDateRange({})}>
                      Clear – Show All Time
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1.5">
            {[
              { name: "Sambar Rice", qty: 142, rating: 4.8, emoji: "🍛" },
              { name: "Chicken Biryani", qty: 118, rating: 4.9, emoji: "🍗" },
              { name: "Masala Dosa", qty: 96, rating: 4.7, emoji: "🥞" },
              { name: "Idli Vada", qty: 85, rating: 4.8, emoji: "🫓" },
              { name: "Fish Curry", qty: 72, rating: 4.6, emoji: "🐟" },
            ].map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2 border border-border">
                <span className="text-base">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-xs">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.qty} sold {topItemsDateRange.from ? (topItemsDateRange.to ? `${format(topItemsDateRange.from, "dd MMM")} – ${format(topItemsDateRange.to, "dd MMM")}` : `on ${format(topItemsDateRange.from, "dd MMM")}`) : "all time"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs font-bold text-foreground">{item.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══ VISITING CARD + WALLET + REFERRAL ═══ */}
      <Link to="/partner/visiting-card">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="py-2.5 px-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-base shrink-0">🪪</div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-xs">Digital Visiting Card</p>
              <p className="text-[9px] text-muted-foreground">Share & earn ₹500 per referral</p>
            </div>
            <CreditCard className="w-4 h-4 text-primary shrink-0" />
          </CardContent>
        </Card>
      </Link>

      <div>
        <h3 className="text-xs font-semibold text-foreground mb-1.5">My Wallet</h3>
        <WalletSection variant="partner" />
      </div>

      {/* Referral Summary */}
      <Card className="border-border">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-primary" />
              <h3 className="font-semibold text-foreground text-xs">Refer & Earn</h3>
            </div>
            <Badge variant="outline" className="text-[8px] border-primary/30 text-primary">Up to ₹2,250</Badge>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-1.5">
            <div className="text-center">
              <p className="text-base font-bold text-foreground">{referralStats.totalReferred}</p>
              <p className="text-[8px] text-muted-foreground">Referred</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-foreground">{referralStats.listed}</p>
              <p className="text-[8px] text-muted-foreground">Listed</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-foreground">{formatPrice(referralStats.totalEarned)}</p>
              <p className="text-[8px] text-muted-foreground">Earned</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 rounded-md p-1.5 border border-border mb-1.5">
            <span className="text-xs font-mono font-bold text-foreground flex-1">{referralCode}</span>
            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <Link to="/partner/referrals">
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" /> View Referrals
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerDashboard;
