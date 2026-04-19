import { useState } from "react";
import { Truck, AlertTriangle, Clock, TrendingUp, Star, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Package, CheckCircle, XCircle } from "lucide-react";
import { deliveryAnalyticsMock, deliverySlaMock, deliveryPartners } from "@/data/deliveryTrackingData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const AdminDeliveryAnalytics = () => {
  const [timeRange, setTimeRange] = useState("7d");

  const totalOrders = deliveryAnalyticsMock.reduce((s, d) => s + d.totalOrders, 0);
  const totalDelivered = deliveryAnalyticsMock.reduce((s, d) => s + d.delivered, 0);
  const totalFailed = deliveryAnalyticsMock.reduce((s, d) => s + d.failed, 0);
  const avgDeliveryTime = Math.round(deliveryAnalyticsMock.reduce((s, d) => s + d.avgDeliveryMinutes, 0) / deliveryAnalyticsMock.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" /> Delivery Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Third-party delivery partner performance & SLA monitoring</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {["24h", "7d", "30d", "90d"].map((t) => (
            <button key={t} onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${timeRange === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Deliveries", value: totalOrders.toLocaleString(), icon: Package, color: "text-primary", trend: "+12%", up: true },
          { label: "Success Rate", value: `${((totalDelivered / totalOrders) * 100).toFixed(1)}%`, icon: CheckCircle, color: "text-accent", trend: "+0.3%", up: true },
          { label: "Avg Delivery Time", value: `${avgDeliveryTime} min`, icon: Clock, color: "text-amber-500", trend: "-2 min", up: true },
          { label: "Failed / Cancelled", value: totalFailed.toString(), icon: XCircle, color: "text-destructive", trend: "-8%", up: true },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className={`text-[10px] font-medium flex items-center gap-0.5 ${kpi.up ? "text-accent" : "text-destructive"}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* SLA Overview */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> SLA Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{deliverySlaMock.overallSla}%</p>
            <p className="text-xs text-muted-foreground">Overall SLA</p>
            <Progress value={deliverySlaMock.overallSla} className="h-2 mt-2" />
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-500">{deliverySlaMock.peakHourSla}%</p>
            <p className="text-xs text-muted-foreground">Peak Hours (12-2 PM, 7-9 PM)</p>
            <Progress value={deliverySlaMock.peakHourSla} className="h-2 mt-2" />
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">{deliverySlaMock.offPeakSla}%</p>
            <p className="text-xs text-muted-foreground">Off-Peak Hours</p>
            <Progress value={deliverySlaMock.offPeakSla} className="h-2 mt-2" />
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm border-t border-border pt-3">
          <span className="text-muted-foreground">SLA Target: <strong className="text-foreground">{deliverySlaMock.targetMinutes} min</strong></span>
          <span className="text-muted-foreground">Breaches this week: <strong className="text-destructive">{deliverySlaMock.breachesThisWeek}</strong></span>
          <span className="text-muted-foreground">Last week: <strong className="text-foreground">{deliverySlaMock.breachesLastWeek}</strong></span>
          <span className="text-xs text-accent flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" /> Improving</span>
        </div>
      </div>

      {/* Partner-wise Table */}
      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Partner Performance</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
          <TabsTrigger value="issues">Issues & Escalations</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Partner</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Orders</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Delivered</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Failed</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Avg Time</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">SLA %</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Rating</th>
                </tr>
              </thead>
              <tbody>
                {deliveryAnalyticsMock.map((d) => {
                  const partner = deliveryPartners.find((p) => p.id === d.partnerId);
                  return (
                    <tr key={d.partnerId} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{partner?.logo}</span>
                          <span className="font-medium text-foreground">{d.partnerName}</span>
                        </div>
                      </td>
                      <td className="text-right p-3 text-foreground">{d.totalOrders.toLocaleString()}</td>
                      <td className="text-right p-3 text-accent font-medium">{d.delivered.toLocaleString()}</td>
                      <td className="text-right p-3 text-destructive font-medium">{d.failed}</td>
                      <td className="text-right p-3">
                        <span className={d.avgDeliveryMinutes <= 30 ? "text-accent" : d.avgDeliveryMinutes <= 40 ? "text-amber-500" : "text-destructive"}>
                          {d.avgDeliveryMinutes} min
                        </span>
                      </td>
                      <td className="text-right p-3">
                        <span className={d.slaPct >= 95 ? "text-accent font-bold" : "text-amber-500 font-bold"}>{d.slaPct}%</span>
                      </td>
                      <td className="text-right p-3">
                        <span className="flex items-center justify-end gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {d.avgRating}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="cost">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="space-y-4">
              {deliveryAnalyticsMock.map((d) => {
                const partner = deliveryPartners.find((p) => p.id === d.partnerId);
                const totalCost = d.costPerDelivery * d.delivered;
                return (
                  <div key={d.partnerId} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30">
                    <span className="text-xl">{partner?.logo}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-foreground">{d.partnerName}</span>
                        <span className="text-sm text-foreground font-bold">${totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${d.costPerDelivery}/delivery avg</span>
                        <span>{d.delivered} deliveries</span>
                      </div>
                      <Progress value={(d.delivered / deliveryAnalyticsMock[0].delivered) * 100} className="h-1.5 mt-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="issues">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            {[
              { time: "2h ago", partner: "Rapido", issue: "Rider no-show", order: "#SH284690", severity: "high" },
              { time: "5h ago", partner: "Dunzo", issue: "Late pickup (SLA breach)", order: "#SH284655", severity: "medium" },
              { time: "8h ago", partner: "Shiprocket", issue: "Wrong delivery location", order: "#SH284612", severity: "high" },
              { time: "1d ago", partner: "Dunzo", issue: "Food spill during transit", order: "#SH284501", severity: "critical" },
              { time: "1d ago", partner: "Rapido", issue: "Customer unreachable – returned", order: "#SH284488", severity: "low" },
            ].map((iss, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary/20 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  iss.severity === "critical" ? "bg-destructive animate-pulse" :
                  iss.severity === "high" ? "bg-destructive" :
                  iss.severity === "medium" ? "bg-amber-500" : "bg-muted-foreground"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{iss.issue}</span>
                    <span className="text-[10px] text-muted-foreground">{iss.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{iss.partner} · {iss.order}</p>
                </div>
                <button className="text-xs text-primary hover:underline shrink-0">Resolve</button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* API Integration Status */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> API Integration Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {deliveryPartners.filter((p) => p.regions.includes("IN")).map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
              <span className="text-xl">{p.logo}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">Webhook + REST API</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] text-accent font-medium">Live</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          All partners connected via webhook callbacks for real-time status updates. Polling fallback every 30s.
        </p>
      </div>
    </div>
  );
};

export default AdminDeliveryAnalytics;
