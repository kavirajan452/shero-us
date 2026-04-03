import { IndianRupee, TrendingUp, Star, ClipboardList, Gift, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { earningsSummary, weeklyEarnings, referralStats, opportunitySummary } from "@/data/partnerMockData";
import { useRegion } from "@/contexts/RegionContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import mascotPresenting from "@/assets/shero-mascot-presenting.png";

const PartnerEarnings = () => {
  const { formatPrice } = useRegion();

  const cards = [
    { label: "Today", value: formatPrice(earningsSummary.today), icon: IndianRupee, sub: "earnings", accent: "border-l-emerald-500", opportunity: opportunitySummary.missedToday > 0 ? formatPrice(opportunitySummary.potentialToday) : null },
    { label: "This Week", value: formatPrice(earningsSummary.thisWeek), icon: TrendingUp, sub: "earnings", accent: "border-l-blue-500", opportunity: opportunitySummary.missedThisWeek > 0 ? formatPrice(opportunitySummary.potentialThisWeek) : null },
    { label: "This Month", value: formatPrice(earningsSummary.thisMonth), icon: IndianRupee, sub: "earnings", accent: "border-l-purple-500", opportunity: opportunitySummary.missedThisMonth > 0 ? formatPrice(opportunitySummary.potentialThisMonth) : null },
    { label: "Total Orders", value: earningsSummary.totalOrders.toString(), icon: ClipboardList, sub: "all time", accent: "border-l-sky-500" },
    { label: "Avg Rating", value: earningsSummary.avgRating.toFixed(1), icon: Star, sub: "from customers", accent: "border-l-amber-500" },
    { label: "Referral Earnings", value: formatPrice(referralStats.totalEarned), icon: Gift, sub: `${referralStats.listed} listed · ${referralStats.active} active`, accent: "border-l-pink-500" },
  ];

  const OpportunityTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const actual = payload.find((p: any) => p.dataKey === "amount");
    const potential = payload.find((p: any) => p.dataKey === "potential");
    const missed = (potential?.value || 0) - (actual?.value || 0);
    return (
      <div className="bg-card border border-border rounded-lg p-2.5 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-primary">Earned: {formatPrice(actual?.value || 0)}</p>
        {missed > 0 && <p className="text-destructive">Missed: {formatPrice(missed)}</p>}
        {potential?.value > 0 && <p className="text-muted-foreground">Potential: {formatPrice(potential?.value || 0)}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <img src={mascotPresenting} alt="" className="w-10 h-10 object-contain hidden md:block" />
        <h2 className="text-xl font-serif font-bold text-foreground">Earnings & Analytics</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {cards.map((c) => (
          <Card key={c.label} className={`border-border bg-card border-l-4 ${c.accent}`}>
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <c.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-muted-foreground">{c.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{c.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{c.sub}</p>
              {"opportunity" in c && c.opportunity && (
                <p className="text-[10px] text-destructive/70 mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Potential: {c.opportunity}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Opportunity Banner */}
      {opportunitySummary.missedThisMonth > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Monthly opportunity missed: <span className="text-destructive">{formatPrice(opportunitySummary.missedThisMonth)}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Based on your best performance days, you could earn {formatPrice(opportunitySummary.potentialThisMonth)} this month.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            Weekly Earnings
            <span className="text-[10px] font-normal text-muted-foreground">(grey = your potential)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyEarnings} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={<OpportunityTooltip />} />
                <Bar dataKey="potential" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-[10px] text-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Actual Earnings</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted inline-block" /> Opportunity</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerEarnings;
