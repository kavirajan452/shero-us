import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDeliveryTracking, useInstantOrders } from "@/hooks/useSupabaseData";

const statusColors: Record<string, string> = {
  assigned: "bg-action-dispatch/15 text-action-dispatch",
  picked_up: "bg-action-pack/15 text-action-pack",
  in_transit: "bg-action-cook/15 text-action-cook",
  delivered: "bg-action-done/15 text-action-done",
  failed: "bg-destructive/10 text-destructive",
};

export default function AdminLocationSupport() {
  const { data: tracking = [], isLoading } = useDeliveryTracking();
  const { data: orders = [] } = useInstantOrders();

  const orderMap = new Map(orders.map((o) => [o.order_code || o.id, o]));
  const active = tracking.filter((d) => ["assigned", "picked_up", "in_transit"].includes(d.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" /> Location & Pickup Ops
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Live tracking from delivery_tracking table</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Drivers</p><p className="text-2xl font-bold text-foreground mt-1">{active.length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Assigned</p><p className="text-2xl font-bold text-action-dispatch mt-1">{tracking.filter((d) => d.status === "assigned").length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">In Transit</p><p className="text-2xl font-bold text-action-pack mt-1">{tracking.filter((d) => d.status === "in_transit").length}</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Failed</p><p className="text-2xl font-bold text-destructive mt-1">{tracking.filter((d) => d.status === "failed").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Driver Tracking — Live</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Driver</TableHead><TableHead className="text-xs">Order</TableHead><TableHead className="text-xs">Pickup</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">ETA</TableHead><TableHead className="text-xs">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {tracking.map((d) => {
                  const order = orderMap.get(d.order_id);
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="text-xs font-medium">{d.agent_name || d.delivery_partner}</TableCell>
                      <TableCell className="text-xs font-mono">{d.order_id}</TableCell>
                      <TableCell className="text-xs">{order?.kitchen_name || "—"}</TableCell>
                      <TableCell><Badge className={`text-[8px] ${statusColors[d.status] || "bg-muted text-muted-foreground"}`}>{d.status.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="text-xs">{d.estimated_arrival ? new Date(d.estimated_arrival).toLocaleTimeString() : "—"}</TableCell>
                      <TableCell><a href={`tel:${d.agent_phone || ""}`}><Button size="sm" variant="outline" className="h-6 text-[10px] gap-1"><Navigation className="w-3 h-3" /> Track</Button></a></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
