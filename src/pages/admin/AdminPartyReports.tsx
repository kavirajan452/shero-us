import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockPartyOrders, mockPartnerLocations } from "@/data/partyProductionData";
import { mealLabels } from "@/data/partyMenuData";
import { useRegion } from "@/contexts/RegionContext";
import {
  Users, CalendarDays, DollarSign, ChefHat, TrendingUp, Package, BarChart3, PieChart,
} from "lucide-react";

const AdminPartyReports = () => {
  const { formatPrice } = useRegion();

  const stats = useMemo(() => {
    const orders = mockPartyOrders;
    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalGuests = orders.reduce((s, o) => s + o.guestCount, 0);
    const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
    const vegOrders = orders.filter(o => o.foodType === "veg").length;
    const nonVegOrders = orders.filter(o => o.foodType === "non-veg").length;
    const pendingCount = orders.filter(o => o.status === "pending_allocation").length;
    const allocatedCount = orders.filter(o => o.status !== "pending_allocation").length;

    // Meal distribution
    const mealCounts: Record<string, number> = {};
    orders.forEach(o => o.meals.forEach(m => { mealCounts[m] = (mealCounts[m] || 0) + 1; }));

    // Partner utilization
    const partnerOrders: Record<string, number> = {};
    orders.forEach(o => {
      if (o.allocatedPartnerId) partnerOrders[o.allocatedPartnerId] = (partnerOrders[o.allocatedPartnerId] || 0) + 1;
    });

    // Occasion distribution
    const occasionCounts: Record<string, number> = {};
    orders.forEach(o => { occasionCounts[o.occasion] = (occasionCounts[o.occasion] || 0) + 1; });

    return {
      totalOrders: orders.length, totalRevenue, totalGuests, avgOrderValue,
      vegOrders, nonVegOrders, pendingCount, allocatedCount,
      mealCounts, partnerOrders, occasionCounts,
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">📊 Party Order Reports</h1>
        <p className="text-sm text-muted-foreground">Analytics and insights for party order operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
          <p className="text-xs text-muted-foreground">Total Orders</p>
        </Card>
        <Card className="p-4 text-center">
          <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{formatPrice(stats.totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </Card>
        <Card className="p-4 text-center">
          <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{stats.totalGuests}</p>
          <p className="text-xs text-muted-foreground">Total Guests</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{formatPrice(stats.avgOrderValue)}</p>
          <p className="text-xs text-muted-foreground">Avg Order Value</p>
        </Card>
      </div>

      {/* Distribution Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Food Type */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><PieChart className="w-4 h-4 text-primary" /> Food Type</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">🥬 Vegetarian</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(stats.vegOrders / stats.totalOrders) * 100}%` }} />
                </div>
                <span className="text-sm font-medium">{stats.vegOrders}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">🍗 Non-Vegetarian</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.nonVegOrders / stats.totalOrders) * 100}%` }} />
                </div>
                <span className="text-sm font-medium">{stats.nonVegOrders}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Allocation Status */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Package className="w-4 h-4 text-primary" /> Allocation Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-600">⏳ Pending</span>
              <span className="text-lg font-bold">{stats.pendingCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-600">✅ Allocated</span>
              <span className="text-lg font-bold">{stats.allocatedCount}</span>
            </div>
          </div>
        </Card>

        {/* Meal Distribution */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-primary" /> Meal Distribution</h3>
          <div className="space-y-1.5">
            {Object.entries(stats.mealCounts).map(([meal, count]) => (
              <div key={meal} className="flex items-center justify-between text-sm">
                <span>{mealLabels[meal] || meal}</span>
                <Badge variant="outline" className="text-xs">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Occasion Types */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> Occasions</h3>
          <div className="space-y-1.5">
            {Object.entries(stats.occasionCounts).map(([occasion, count]) => (
              <div key={occasion} className="flex items-center justify-between text-sm">
                <span className="truncate mr-2">{occasion}</span>
                <Badge variant="outline" className="text-xs">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Partner Utilization */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><ChefHat className="w-4 h-4 text-primary" /> Partner Utilization</h3>
        {Object.keys(stats.partnerOrders).length === 0 ? (
          <p className="text-sm text-muted-foreground">No allocations yet</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(stats.partnerOrders).map(([partnerId, count]) => {
              const partner = mockPartnerLocations.find(p => p.id === partnerId);
              return partner ? (
                <div key={partnerId} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{partner.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{partner.address}</span>
                    <Badge className="bg-primary/10 text-primary text-xs">{count} order(s)</Badge>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminPartyReports;
