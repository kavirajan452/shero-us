import { ChefHat, Users, ClipboardList, UtensilsCrossed, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import sheroWelcome from "@/assets/shero-mascot-welcome.png";
import { useAdminDashboardStats, usePendingInstantOrders, useUpdateInstantOrder } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: pendingOrders = [], isLoading: pendingLoading } = usePendingInstantOrders(5);
  const updateOrder = useUpdateInstantOrder();
  const { toast } = useToast();

  const statCards = [
    { label: "Active Kitchens", value: statsLoading ? "…" : String(stats?.activeKitchens ?? 0), icon: ChefHat, color: "text-primary", link: "/admin/partners" },
    { label: "Total Orders", value: statsLoading ? "…" : String(stats?.totalOrders ?? 0), icon: ClipboardList, color: "text-blue-600", link: "/admin/orders" },
    { label: "Menu Categories", value: statsLoading ? "…" : String(stats?.cuisines ?? 0), icon: UtensilsCrossed, color: "text-amber-600", link: "/admin/menus" },
    { label: "Registered Users", value: statsLoading ? "…" : String(stats?.registeredUsers ?? 0), icon: Users, color: "text-green-600", link: "/admin/users" },
  ];

  const handleAccept = async (orderId: string) => {
    await updateOrder.mutateAsync({ id: orderId, updates: { status: "accepted", accepted_at: new Date().toISOString() } });
    toast({ title: "Order accepted" });
  };

  const handleReject = async (orderId: string) => {
    await updateOrder.mutateAsync({ id: orderId, updates: { status: "rejected", rejected_at: new Date().toISOString(), rejection_reason: "Admin rejected" } });
    toast({ title: "Order rejected", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src={sheroWelcome} alt="Shero" className="w-12 h-12 object-contain drop-shadow-md shrink-0 hidden md:block" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform overview and quick actions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link
            key={s.label}
            to={s.link}
            className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
          >
            <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Pending New Orders */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Pending New Orders
            {pendingOrders.length > 0 && (
              <Badge variant="destructive" className="text-[10px] ml-1">{pendingOrders.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
            </div>
          ) : pendingOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No pending orders right now 🎉</p>
          ) : (
            pendingOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between bg-muted/30 rounded-xl p-3 border border-border">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    #{order.order_code || order.id.slice(0, 8)} · {order.kitchen_name || "—"} · ${Number(order.total).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    disabled={updateOrder.isPending}
                    onClick={() => handleReject(order.id)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={updateOrder.isPending}
                    onClick={() => handleAccept(order.id)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
          <Link to="/admin/orders" className="block text-center text-sm font-semibold text-primary hover:underline pt-1">
            View All Orders →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
