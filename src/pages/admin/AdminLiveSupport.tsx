import { Phone, Clock, AlertTriangle, Radio, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useInstantOrders } from "@/hooks/useSupabaseData";

const statusColors: Record<string, string> = {
  new: "bg-muted text-muted-foreground",
  accepted: "bg-action-pack/15 text-action-pack",
  preparing: "bg-action-cook/15 text-action-cook",
  ready: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  in_transit: "bg-action-dispatch/15 text-action-dispatch",
  delivered: "bg-action-done/15 text-action-done",
  cancelled: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

export default function AdminLiveSupport() {
  const { data: orders = [], isLoading } = useInstantOrders();
  const active = orders.filter((o) => ["new", "accepted", "preparing", "ready", "in_transit"].includes(o.status));
  const escalated = orders.filter((o) => ["cancelled", "rejected"].includes(o.status));
  const delayed = orders.filter((o) => {
    const minutes = (Date.now() - new Date(o.created_at).getTime()) / (1000 * 60);
    return ["new", "accepted", "preparing", "ready", "in_transit"].includes(o.status) && minutes > 45;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Phone className="w-6 h-6 text-primary" /> Live Order Support
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Live order monitoring from instant_orders</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Orders</p><p className="text-2xl font-bold text-foreground mt-1">{active.length}</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Escalated</p><p className="text-2xl font-bold text-destructive mt-1">{escalated.length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Delayed (&gt;45m)</p><p className="text-2xl font-bold text-action-cook mt-1">{delayed.length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Delivered Today</p><p className="text-2xl font-bold text-primary mt-1">{orders.filter((o) => o.status === "delivered").length}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="live">
        <TabsList>
          <TabsTrigger value="live" className="text-xs gap-1"><Radio className="w-3.5 h-3.5" /> Live Monitor</TabsTrigger>
          <TabsTrigger value="escalations" className="text-xs gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Escalations</TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Active Orders — Live Feed</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Order</TableHead><TableHead className="text-xs">Customer</TableHead><TableHead className="text-xs">Kitchen</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Elapsed</TableHead><TableHead className="text-xs">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {active.map((o) => {
                      const mins = Math.max(1, Math.floor((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60)));
                      return (
                        <TableRow key={o.id}>
                          <TableCell className="text-xs font-mono font-bold">{o.order_code || o.id.slice(0, 8)}</TableCell>
                          <TableCell className="text-xs">{o.customer_name}</TableCell>
                          <TableCell className="text-xs">{o.kitchen_name || "—"}</TableCell>
                          <TableCell><Badge className={`text-[8px] ${statusColors[o.status] || "bg-muted text-muted-foreground"}`}>{o.status.replace(/_/g, " ")}</Badge></TableCell>
                          <TableCell className="text-xs"><Clock className="w-3 h-3 inline mr-1" />{mins} min</TableCell>
                          <TableCell><a href={`tel:${o.customer_phone || ""}`}><Button size="sm" variant="outline" className="h-6 text-[10px] gap-1"><Phone className="w-3 h-3" /> Call</Button></a></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="escalations" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {escalated.length === 0 ? (
                <p className="text-sm text-muted-foreground">No escalated orders.</p>
              ) : (
                escalated.map((o) => (
                  <div key={o.id} className="text-sm border rounded-lg p-3">
                    <p className="font-medium">{o.order_code || o.id.slice(0, 8)} · {o.customer_name}</p>
                    <p className="text-muted-foreground">{o.rejection_reason || "Escalation required"}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
