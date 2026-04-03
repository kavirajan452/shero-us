import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Bike, MapPin, Clock, CheckCircle, AlertTriangle, Users, Route, Zap, Settings } from "lucide-react";

const deliveryPartners = [
  { name: "Dunzo", status: "active", orders: 128, avgTime: "22 min", success: 97.2, apiHealth: "healthy" },
  { name: "Shadowfax", status: "active", orders: 95, avgTime: "25 min", success: 95.8, apiHealth: "healthy" },
  { name: "Porter", status: "active", orders: 42, avgTime: "28 min", success: 94.1, apiHealth: "warning" },
  { name: "WeFast", status: "inactive", orders: 0, avgTime: "-", success: 0, apiHealth: "offline" },
  { name: "Own Fleet", status: "active", orders: 186, avgTime: "18 min", success: 98.5, apiHealth: "healthy" },
];

const liveOrders = [
  { id: "DEL-4521", partner: "Own Fleet", rider: "Suresh K.", pickup: "Chef Lakshmi Kitchen", drop: "T. Nagar", status: "picked_up", eta: "8 min" },
  { id: "DEL-4522", partner: "Dunzo", rider: "Auto-assigned", pickup: "Chef Meena Kitchen", drop: "Adyar", status: "assigned", eta: "15 min" },
  { id: "DEL-4523", partner: "Shadowfax", rider: "Rajan M.", pickup: "Chef Saroja Kitchen", drop: "Velachery", status: "in_transit", eta: "5 min" },
  { id: "DEL-4524", partner: "Own Fleet", rider: "Deepak R.", pickup: "Chef Fathima Kitchen", drop: "Anna Nagar", status: "picked_up", eta: "12 min" },
];

const routingRules = [
  { rule: "Orders < 3 km", assignTo: "Own Fleet", priority: 1, active: true },
  { rule: "Orders 3-8 km", assignTo: "Dunzo / Shadowfax", priority: 2, active: true },
  { rule: "Orders > 8 km", assignTo: "Porter", priority: 3, active: true },
  { rule: "Party Orders (Bulk)", assignTo: "Own Fleet + Porter", priority: 1, active: true },
  { rule: "Peak Hour Overflow", assignTo: "All Partners", priority: 4, active: false },
];

export default function AdminDeliveryManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delivery Management</h1>
        <p className="text-muted-foreground text-sm">Fleet partners, routing rules & live order tracking</p>
      </div>

      <Tabs defaultValue="partners">
        <TabsList>
          <TabsTrigger value="partners">Delivery Partners</TabsTrigger>
          <TabsTrigger value="live">Live Orders</TabsTrigger>
          <TabsTrigger value="routing">Routing Rules</TabsTrigger>
          <TabsTrigger value="config">API Config</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {deliveryPartners.map((dp) => (
              <Card key={dp.name}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{dp.name}</p>
                    <Badge variant={dp.status === "active" ? "default" : "secondary"} className="text-[10px]">{dp.status}</Badge>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>Today: <span className="text-foreground font-medium">{dp.orders} orders</span></p>
                    <p>Avg Time: <span className="text-foreground font-medium">{dp.avgTime}</span></p>
                    <p>Success: <span className="text-foreground font-medium">{dp.success}%</span></p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {dp.apiHealth === "healthy" ? <CheckCircle className="w-3 h-3 text-green-500" /> :
                     dp.apiHealth === "warning" ? <AlertTriangle className="w-3 h-3 text-yellow-500" /> :
                     <AlertTriangle className="w-3 h-3 text-destructive" />}
                    <span>API {dp.apiHealth}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Live Delivery Tracking</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {liveOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <Bike className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{order.id} · {order.rider}</p>
                        <p className="text-xs text-muted-foreground">{order.pickup} → {order.drop}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <Badge variant={order.status === "in_transit" ? "default" : "secondary"} className="text-[10px]">
                        {order.status.replace("_", " ")}
                      </Badge>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {order.eta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Auto-Routing Rules</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {routingRules.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{rule.rule}</p>
                      <p className="text-xs text-muted-foreground">Assign to: {rule.assignTo} · Priority {rule.priority}</p>
                    </div>
                    <Switch defaultChecked={rule.active} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">API Connections</CardTitle></CardHeader>
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
