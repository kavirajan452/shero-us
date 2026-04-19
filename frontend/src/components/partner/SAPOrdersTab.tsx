import { useState, useMemo } from "react";
import { createInvoice } from "@/utils/invoiceService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRegion } from "@/contexts/RegionContext";
import {
  Clock, CheckCircle2, ChefHat, Package, Truck, XCircle, Store,
} from "lucide-react";

type SAPPlatform = "swiggy" | "zomato";
type SAPOrderStatus = "new" | "accepted" | "preparing" | "ready" | "picked_up" | "delivered" | "rejected";

interface SAPOrder {
  id: string;
  platform: SAPPlatform;
  platformOrderId: string;
  customerName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: SAPOrderStatus;
  placedAt: string;
  note?: string;
  deliveryAddress: string;
}

const mockSAPOrders: SAPOrder[] = [
  {
    id: "SAP-001", platform: "swiggy", platformOrderId: "SWG-98231",
    customerName: "Ravi Kumar", placedAt: "12:30 PM",
    items: [{ name: "Chicken Biryani", qty: 2, price: 249 }, { name: "Raita", qty: 2, price: 49 }],
    total: 596, status: "new", deliveryAddress: "T Nagar, New York",
  },
  {
    id: "SAP-002", platform: "swiggy", platformOrderId: "SWG-98245",
    customerName: "Priya S.", placedAt: "12:45 PM",
    items: [{ name: "Masala Dosa", qty: 3, price: 89 }, { name: "Filter Coffee", qty: 3, price: 39 }],
    total: 384, status: "preparing", deliveryAddress: "Anna Nagar, New York",
  },
  {
    id: "SAP-003", platform: "swiggy", platformOrderId: "SWG-98260",
    customerName: "Anitha M.", placedAt: "1:00 PM",
    items: [{ name: "Veg Thali", qty: 1, price: 179 }],
    total: 179, status: "delivered", deliveryAddress: "Adyar, New York",
  },
  {
    id: "SAP-004", platform: "zomato", platformOrderId: "ZMT-44521",
    customerName: "Karthik R.", placedAt: "12:15 PM",
    items: [{ name: "Mutton Curry", qty: 1, price: 349 }, { name: "Parotta", qty: 4, price: 29 }],
    total: 465, status: "new", deliveryAddress: "Velachery, New York",
  },
  {
    id: "SAP-005", platform: "zomato", platformOrderId: "ZMT-44538",
    customerName: "Deepa L.", placedAt: "12:50 PM",
    items: [{ name: "Fish Curry Meals", qty: 2, price: 219 }],
    total: 438, status: "accepted", deliveryAddress: "Tambaram, New York",
  },
  {
    id: "SAP-006", platform: "zomato", platformOrderId: "ZMT-44550",
    customerName: "Suresh P.", placedAt: "1:10 PM",
    items: [{ name: "Curd Rice", qty: 2, price: 99 }, { name: "Pickle", qty: 1, price: 29 }],
    total: 227, status: "ready", deliveryAddress: "Porur, New York",
  },
  {
    id: "SAP-007", platform: "zomato", platformOrderId: "ZMT-44562",
    customerName: "Meena G.", placedAt: "11:30 AM",
    items: [{ name: "Idli Vada Combo", qty: 4, price: 79 }],
    total: 316, status: "delivered", deliveryAddress: "West Village, New York",
  },
];

const statusConfig: Record<SAPOrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "New", color: "bg-destructive text-destructive-foreground", icon: Clock },
  accepted: { label: "Accepted", color: "bg-primary text-primary-foreground", icon: CheckCircle2 },
  preparing: { label: "Preparing", color: "bg-accent text-accent-foreground", icon: ChefHat },
  ready: { label: "Ready", color: "bg-yellow-500 text-white", icon: Package },
  picked_up: { label: "Picked Up", color: "bg-secondary text-secondary-foreground", icon: Truck },
  delivered: { label: "Delivered", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const platformConfig: Record<SAPPlatform, { label: string; color: string; logo: string }> = {
  swiggy: { label: "Swiggy", color: "bg-orange-100 text-orange-700 border-orange-200", logo: "🟠" },
  zomato: { label: "Zomato", color: "bg-red-100 text-red-700 border-red-200", logo: "🔴" },
};

const SAPOrdersTab = () => {
  const { formatPrice } = useRegion();
  const [activePlatform, setActivePlatform] = useState<"all" | SAPPlatform>("all");
  const [orders, setOrders] = useState(mockSAPOrders);

  const filtered = useMemo(() => {
    if (activePlatform === "all") return orders;
    return orders.filter((o) => o.platform === activePlatform);
  }, [orders, activePlatform]);

  const counts = useMemo(() => ({
    all: orders.length,
    swiggy: orders.filter((o) => o.platform === "swiggy").length,
    zomato: orders.filter((o) => o.platform === "zomato").length,
  }), [orders]);

  const pendingCounts = useMemo(() => ({
    swiggy: orders.filter((o) => o.platform === "swiggy" && o.status === "new").length,
    zomato: orders.filter((o) => o.platform === "zomato" && o.status === "new").length,
  }), [orders]);

  const handleAccept = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "accepted" as SAPOrderStatus } : o));
  };

  const handleStartCooking = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "preparing" as SAPOrderStatus } : o));
  };

  const handleReady = (id: string) => {
    const order = orders.find(o => o.id === id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "ready" as SAPOrderStatus } : o));
    if (order) {
      createInvoice({
        orderId: order.id,
        orderType: "instant",
        customerName: order.customerName,
        customerPhone: "",
        items: order.items.map(i => ({ name: i.name, qty: `${i.qty}`, amount: i.price * i.qty })),
        subtotal: order.total,
        taxAmount: Math.round(order.total * 0.05),
        deliveryFee: 0,
        packingCharges: 0,
        platformFee: 0,
        discount: 0,
        total: order.total + Math.round(order.total * 0.05),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Platform summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {(["swiggy", "zomato"] as SAPPlatform[]).map((p) => {
          const cfg = platformConfig[p];
          return (
            <Card
              key={p}
              className={`cursor-pointer transition-all ${activePlatform === p ? "ring-2 ring-primary" : "hover:border-primary/40"}`}
              onClick={() => setActivePlatform(activePlatform === p ? "all" : p)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{cfg.logo} {cfg.label}</span>
                  {pendingCounts[p] > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground text-[10px]">
                      {pendingCounts[p]} new
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{counts[p]}</p>
                <p className="text-[10px] text-muted-foreground">orders today</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Platform filter pills */}
      <div className="flex gap-2">
        {[
          { key: "all" as const, label: "All SAP", count: counts.all },
          { key: "swiggy" as const, label: "🟠 Swiggy", count: counts.swiggy },
          { key: "zomato" as const, label: "🔴 Zomato", count: counts.zomato },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActivePlatform(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activePlatform === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No SAP orders in this category</p>
      )}

      {filtered.map((order) => {
        const cfg = statusConfig[order.status];
        const StatusIcon = cfg.icon;
        const platCfg = platformConfig[order.platform];
        const totalItems = order.items.reduce((s, i) => s + i.qty, 0);

        return (
          <Card key={order.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground">{order.id}</span>
                    <Badge className={`${platCfg.color} text-[10px] gap-1 border`}>
                      <Store className="w-3 h-3" /> {platCfg.label}
                    </Badge>
                    <Badge className={`${cfg.color} text-[10px] gap-1`}>
                      <StatusIcon className="w-3 h-3" /> {cfg.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {platCfg.label} #{order.platformOrderId} · {order.placedAt} · {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    📍 {order.deliveryAddress}
                  </p>

                  <div className="mt-2 space-y-0.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground">
                        {item.qty}× {item.name} — {formatPrice(item.price * item.qty)}
                      </div>
                    ))}
                  </div>

                  {order.note && <p className="text-xs text-primary mt-1.5 italic">📝 {order.note}</p>}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-foreground">{formatPrice(order.total)}</p>
                  <div className="flex flex-col gap-1.5 mt-3">
                    {order.status === "new" && (
                      <Button size="sm" onClick={() => handleAccept(order.id)} className="text-xs gap-1 bg-action-accept text-action-accept-foreground hover:bg-action-accept/90">
                        <CheckCircle2 className="w-3 h-3" /> Accept
                      </Button>
                    )}
                    {order.status === "accepted" && (
                      <Button size="sm" onClick={() => handleStartCooking(order.id)} className="text-xs gap-1 bg-action-cook text-action-cook-foreground hover:bg-action-cook/90">
                        <ChefHat className="w-3 h-3" /> Start Cooking
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button size="sm" onClick={() => handleReady(order.id)} className="text-xs gap-1 bg-action-pack text-action-pack-foreground hover:bg-action-pack/90">
                        <Package className="w-3 h-3" /> Food Ready
                      </Button>
                    )}
                    {order.status === "ready" && (
                      <Badge className="bg-action-dispatch/15 text-action-dispatch text-[10px]">🚚 Awaiting Pickup</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SAPOrdersTab;
