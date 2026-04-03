import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { snackOrders, snackOrderStatusColors, snackOrderStatusFlow, type SnackOrder, type SnackOrderStatus } from "@/data/snacksOrderStore";
import { Package, CheckCircle, Truck, Clock, AlertCircle, ChevronRight, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function PartnerSnacksOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState(snackOrders.filter(o => o.partnerId === "sp-1" || o.partnerId === "sp-2"));
  const [tab, setTab] = useState("active");

  const activeOrders = useMemo(() => orders.filter(o => !["delivered", "cancelled"].includes(o.status)), [orders]);
  const completedOrders = useMemo(() => orders.filter(o => o.status === "delivered"), [orders]);
  const cancelledOrders = useMemo(() => orders.filter(o => o.status === "cancelled"), [orders]);

  const stats = useMemo(() => ({
    active: activeOrders.length,
    today: orders.filter(o => o.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
    revenue: orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0),
    avgItems: orders.length ? Math.round(orders.reduce((s, o) => s + o.items.length, 0) / orders.length * 10) / 10 : 0,
  }), [orders, activeOrders]);

  const advanceStatus = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const next = snackOrderStatusFlow[o.status];
      if (!next) return o;
      toast({ title: `Order ${o.id} → ${next.replace("_", " ").toUpperCase()}` });
      return { ...o, status: next, updatedAt: new Date().toISOString() };
    }));
  };

  const getNextAction = (status: SnackOrderStatus) => {
    const map: Record<string, { label: string; icon: typeof CheckCircle }> = {
      new: { label: "Accept Order", icon: CheckCircle },
      confirmed: { label: "Start Preparing", icon: Clock },
      preparing: { label: "Mark Packed", icon: Package },
      packed: { label: "Hand to Delivery", icon: Truck },
      dispatched: { label: "Confirm Delivered", icon: CheckCircle },
    };
    return map[status];
  };

  const OrderRow = ({ order }: { order: SnackOrder }) => {
    const action = getNextAction(order.status);
    return (
      <TableRow>
        <TableCell className="font-mono text-xs font-semibold">{order.id}</TableCell>
        <TableCell>
          <div>
            <p className="text-sm font-medium text-foreground">{order.customerName}</p>
            <p className="text-[10px] text-muted-foreground">{order.city} · {order.pincode}</p>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-0.5">
            {order.items.map(i => (
              <p key={i.productId} className="text-xs text-foreground">{i.qty}× {i.productName} ({i.packSize})</p>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-sm font-semibold">{fmt(order.total)}</TableCell>
        <TableCell>
          <Badge className={`text-[10px] ${snackOrderStatusColors[order.status]}`}>{order.status.toUpperCase()}</Badge>
          <p className="text-[10px] text-muted-foreground mt-0.5">{order.paymentStatus === "cod" ? "💵 COD" : "✅ Prepaid"}</p>
        </TableCell>
        <TableCell>
          {action && (
            <Button size="sm" variant="default" className="text-xs h-8" onClick={() => advanceStatus(order.id)}>
              <action.icon className="w-3 h-3 mr-1" /> {action.label}
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  };

  const tabOrders = tab === "active" ? activeOrders : tab === "completed" ? completedOrders : cancelledOrders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">🍪 Sweets & Snacks Orders</h1>
        <p className="text-sm text-muted-foreground">Manage incoming product orders — prepare, pack & hand off to delivery</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Orders", value: stats.active, icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Today's Orders", value: stats.today, icon: Package, color: "text-primary", bg: "bg-green-100" },
          { label: "Revenue (Delivered)", value: fmt(stats.revenue), icon: CheckCircle, color: "text-green-600", bg: "bg-emerald-100" },
          { label: "Avg Items/Order", value: stats.avgItems, icon: AlertCircle, color: "text-accent", bg: "bg-amber-100" },
        ].map(s => (
          <Card key={s.label} className={s.bg}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active" className="text-xs">Active ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Delivered ({completedOrders.length})</TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs">Cancelled ({cancelledOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Order ID</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Items</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tabOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No orders</TableCell></TableRow>
                  ) : tabOrders.map(o => <OrderRow key={o.id} order={o} />)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
