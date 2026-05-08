import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Bike, Clock, CheckCircle, AlertTriangle, Route, Settings, RefreshCw } from "lucide-react";
import { useInstantOrders, useDeliveryTracking, useAppConfig } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const DEFAULT_ROUTING_RULES = [
  { rule: "Orders < 3 km", assignTo: "Own Fleet", priority: 1, active: true },
  { rule: "Orders 3-8 km", assignTo: "Dunzo / Shadowfax", priority: 2, active: true },
  { rule: "Orders > 8 km", assignTo: "Porter", priority: 3, active: true },
  { rule: "Party Orders (Bulk)", assignTo: "Own Fleet + Porter", priority: 1, active: true },
  { rule: "Peak Hour Overflow", assignTo: "All Partners", priority: 4, active: false },
];

export default function AdminDeliveryManagement() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: allOrders = [], isLoading: loadingOrders } = useInstantOrders();
  const { data: trackingRecords = [], isLoading: loadingTracking } = useDeliveryTracking();
  const { data: configData } = useAppConfig("delivery_routing_rules");

  const routingRules: typeof DEFAULT_ROUTING_RULES =
    configData?.value ? (configData.value as any) : DEFAULT_ROUTING_RULES;

  const liveOrders = (allOrders as any[]).filter((o: any) =>
    ["accepted", "preparing", "ready", "picked_up", "in_transit"].includes(o.status)
  );

  const partnerSummary: Record<string, { orders: number; delivered: number; failed: number; times: number[] }> = {};
  for (const t of (trackingRecords as any[])) {
    const p = t.delivery_partner || "Own Fleet";
    if (!partnerSummary[p]) partnerSummary[p] = { orders: 0, delivered: 0, failed: 0, times: [] };
    partnerSummary[p].orders += 1;
    if (t.status === "delivered") {
      partnerSummary[p].delivered += 1;
      if (t.actual_delivery && t.created_at) {
        const mins = Math.round(
          (new Date(t.actual_delivery).getTime() - new Date(t.created_at).getTime()) / 60000
        );
        if (mins > 0 && mins < 300) partnerSummary[p].times.push(mins);
      }
    }
    if (t.status === "failed") partnerSummary[p].failed += 1;
  }

  const deliveryPartners = Object.entries(partnerSummary).map(([name, s]) => ({
    name,
    orders: s.orders,
    avgTime: s.times.length > 0 ? `${Math.round(s.times.reduce((a, b) => a + b, 0) / s.times.length)} min` : "—",
    success: s.orders > 0 ? Math.round((s.delivered / s.orders) * 1000) / 10 : 0,
  }));

  const handleToggleRoutingRule = async (index: number) => {
    const updated = routingRules.map((r, i) => i === index ? { ...r, active: !r.active } : r);
    const { error } = await (supabase.from("app_config" as any) as any).upsert(
      { key: "delivery_routing_rules", value: updated, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    if (error) {
      toast({ title: "Error", description: "Failed to save routing rules", variant: "destructive" });
    } else {
      qc.invalidateQueries({ queryKey: ["app_config", "delivery_routing_rules"] });
      toast({ title: "Routing rule updated" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Management</h1>
          <p className="text-muted-foreground text-sm">Fleet partners, routing rules &amp; live order tracking</p>
        </div>
        <Button
          size="sm" variant="outline" className="gap-1 h-8 text-xs"
          onClick={() => {
            qc.invalidateQueries({ queryKey: ["instant_orders"] });
            qc.invalidateQueries({ queryKey: ["delivery_tracking"] });
          }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="partners">
        <TabsList>
          <TabsTrigger value="partners">Delivery Partners</TabsTrigger>
          <TabsTrigger value="live">
            Live Orders
            {liveOrders.length > 0 && (
              <span className="ml-1.5 bg-primary/20 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                {liveOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="routing">Routing Rules</TabsTrigger>
          <TabsTrigger value="config">API Config</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4 mt-4">
          {loadingTracking ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading partner data…</div>
          ) : deliveryPartners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No delivery tracking data yet. Dispatched orders will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {deliveryPartners.map((dp) => (
                <Card key={dp.name}>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{dp.name}</p>
                      <Badge variant="default" className="text-[10px]">active</Badge>
                    </div>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p>Orders: <span className="text-foreground font-medium">{dp.orders}</span></p>
                      <p>Avg Time: <span className="text-foreground font-medium">{dp.avgTime}</span></p>
                      <p>Success: <span className="text-foreground font-medium">{dp.success > 0 ? `${dp.success}%` : "—"}</span></p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>API healthy</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="live" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Live Delivery Tracking
                {loadingOrders && <RefreshCw className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {liveOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No active deliveries right now.</p>
              ) : (
                <div className="space-y-2">
                  {liveOrders.map((order: any) => {
                    const tracking = (trackingRecords as any[]).find(
                      (t: any) => t.order_id === order.order_code || t.order_id === order.id
                    );
                    const etaMin = tracking?.estimated_arrival
                      ? Math.max(0, Math.round((new Date(tracking.estimated_arrival).getTime() - Date.now()) / 60000))
                      : null;
                    return (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <Bike className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {order.order_code} · {tracking?.agent_name || "Assigning…"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.kitchen_name} → {order.customer_address?.split(",")[0] || "Customer"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={["in_transit", "picked_up"].includes(tracking?.status || order.status) ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {(tracking?.status || order.status).replace(/_/g, " ")}
                          </Badge>
                          {etaMin !== null && (
                            <span className="text-sm font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {etaMin} min
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Route className="w-4 h-4" /> Auto-Routing Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {routingRules.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{rule.rule}</p>
                      <p className="text-xs text-muted-foreground">
                        Assign to: {rule.assignTo} · Priority {rule.priority}
                      </p>
                    </div>
                    <Switch checked={rule.active} onCheckedChange={() => handleToggleRoutingRule(i)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" /> API Connections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Dunzo API", key: "dz_live_****k9X2", status: "connected" },
                { name: "Shadowfax API", key: "sf_prod_****mN7Y", status: "connected" },
                { name: "Porter API", key: "ptr_live_****qR4W", status: "token_expiring" },
                { name: "Google Maps API", key: "AIza****xT9v", status: "connected" },
              ].map((api) => (
                <div key={api.name} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{api.name}</p>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{api.key}</code>
                  </div>
                  <Badge variant={api.status === "connected" ? "default" : "destructive"} className="text-[10px]">
                    {api.status === "connected" ? "Connected" : "Token Expiring"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
