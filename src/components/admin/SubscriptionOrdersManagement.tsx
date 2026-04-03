import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  ChefHat, Package, Truck, CheckCircle2, AlertTriangle, Clock,
  Users, Eye, MapPin, Phone, RefreshCw, Zap, Calendar,
  TrendingUp, BarChart3, Brain,
} from "lucide-react";

// ── Types ──
type OrderStatus = "pending" | "cooking" | "packed" | "dispatched" | "delivered" | "skipped" | "delayed";
type MealSlot = "breakfast" | "lunch" | "dinner";

interface DailySubscriptionOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  planName: string;
  planType: "veg" | "nonveg";
  slot: MealSlot;
  deliveryTime: string;
  items: string[];
  persons: number;
  partnerId: string;
  partnerName: string;
  status: OrderStatus;
  note?: string;
  allergens?: string[];
  isDelayed?: boolean;
  delayMinutes?: number;
}

const slotConfig: Record<MealSlot, { emoji: string; label: string; time: string }> = {
  breakfast: { emoji: "🌅", label: "Breakfast", time: "7:00 – 9:00 AM" },
  lunch: { emoji: "☀️", label: "Lunch", time: "12:00 – 2:00 PM" },
  dinner: { emoji: "🌙", label: "Dinner", time: "7:00 – 9:00 PM" },
};

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-destructive/10 text-destructive" },
  cooking: { label: "Cooking", color: "bg-action-cook/15 text-action-cook" },
  packed: { label: "Packed", color: "bg-action-pack/15 text-action-pack" },
  dispatched: { label: "Dispatched", color: "bg-action-dispatch/15 text-action-dispatch" },
  delivered: { label: "Delivered", color: "bg-action-done/15 text-action-done" },
  skipped: { label: "Skipped", color: "bg-muted text-muted-foreground" },
  delayed: { label: "Delayed", color: "bg-destructive/10 text-destructive" },
};

const partners = [
  { id: "P001", name: "Chef Lakshmi Kitchen", area: "HITEC City" },
  { id: "P002", name: "Chef Fathima Kitchen", area: "Jubilee Hills" },
  { id: "P003", name: "Chef Meena Kitchen", area: "Madhapur" },
  { id: "P004", name: "Chef Kamala Kitchen", area: "Nallagandla" },
  { id: "P005", name: "Chef Saroja Kitchen", area: "Kukatpally" },
];

const today = new Date().toISOString().split("T")[0];

// Mock daily orders
const mockDailyOrders: DailySubscriptionOrder[] = [
  { id: "DSO-001", customerId: "SC001", customerName: "Priya Reddy", customerPhone: "9876543210", address: "Flat 302, Cyber Towers, HITEC City", planName: "Chettinad Veg Thali", planType: "veg", slot: "lunch", deliveryTime: "12:30 PM", items: ["Sambar Rice", "Carrot Beans Poriyal", "Rasam", "Curd", "Papad"], persons: 2, partnerId: "P001", partnerName: "Chef Lakshmi Kitchen", status: "cooking", allergens: [] },
  { id: "DSO-002", customerId: "SC002", customerName: "Rahul Sharma", customerPhone: "9876543211", address: "My Home Hub, Madhapur", planName: "Andhra Spice Box", planType: "nonveg", slot: "lunch", deliveryTime: "1:00 PM", items: ["Gongura Chicken", "Rice", "Pappu", "Fry"], persons: 1, partnerId: "P003", partnerName: "Chef Meena Kitchen", status: "pending", note: "Extra spicy" },
  { id: "DSO-003", customerId: "SC003", customerName: "Lakshmi Iyer", customerPhone: "9876543212", address: "Jubilee Hills Road 14", planName: "Custom Meal Plan", planType: "veg", slot: "breakfast", deliveryTime: "7:00 AM", items: ["Idli (4)", "Sambar", "Chutney", "Filter Coffee"], persons: 3, partnerId: "P002", partnerName: "Chef Fathima Kitchen", status: "delivered" },
  { id: "DSO-004", customerId: "SC004", customerName: "Anitha Kumari", customerPhone: "9876543213", address: "Banjara Hills Road 12", planName: "South Indian Breakfast Box", planType: "veg", slot: "breakfast", deliveryTime: "7:30 AM", items: ["Masala Dosa (2)", "Sambar", "Chutney", "Coffee"], persons: 1, partnerId: "P002", partnerName: "Chef Fathima Kitchen", status: "delivered" },
  { id: "DSO-005", customerId: "SC007", customerName: "Meera Joshi", customerPhone: "9876543216", address: "Aparna Sarovar, Nallagandla", planName: "Chettinad Non-Veg Thali", planType: "nonveg", slot: "lunch", deliveryTime: "12:30 PM", items: ["Chicken Biryani", "Raita", "Boiled Egg Curry", "Salad"], persons: 1, partnerId: "P001", partnerName: "Chef Lakshmi Kitchen", status: "cooking" },
  { id: "DSO-006", customerId: "SC008", customerName: "Deepa Sharma", customerPhone: "9876543217", address: "Lanco Hills, Manikonda", planName: "Custom Family Plan", planType: "veg", slot: "lunch", deliveryTime: "12:00 PM", items: ["Dal Makhani", "Jeera Rice", "Aloo Gobi", "Roti (3)", "Raita"], persons: 4, partnerId: "P002", partnerName: "Chef Fathima Kitchen", status: "pending", isDelayed: true, delayMinutes: 15 },
  { id: "DSO-007", customerId: "SC005", customerName: "Sneha Pillai", customerPhone: "9876543214", address: "Kondapur Main Road", planName: "Kerala Sadya Box", planType: "veg", slot: "lunch", deliveryTime: "1:00 PM", items: ["Avial", "Sambar Rice", "Thoran", "Rasam", "Curd"], persons: 2, partnerId: "P004", partnerName: "Chef Kamala Kitchen", status: "skipped" },
  { id: "DSO-008", customerId: "SC001", customerName: "Priya Reddy", customerPhone: "9876543210", address: "Flat 302, Cyber Towers, HITEC City", planName: "Chettinad Veg Thali", planType: "veg", slot: "dinner", deliveryTime: "8:00 PM", items: ["Chapati (4)", "Paneer Curry", "Dal", "Salad"], persons: 2, partnerId: "P001", partnerName: "Chef Lakshmi Kitchen", status: "pending" },
  { id: "DSO-009", customerId: "SC008", customerName: "Deepa Sharma", customerPhone: "9876543217", address: "Lanco Hills, Manikonda", planName: "Custom Family Plan", planType: "veg", slot: "dinner", deliveryTime: "7:30 PM", items: ["Chapati (4)", "Palak Paneer", "Dal"], persons: 4, partnerId: "P002", partnerName: "Chef Fathima Kitchen", status: "pending" },
  { id: "DSO-010", customerId: "SC008", customerName: "Deepa Sharma", customerPhone: "9876543217", address: "Lanco Hills, Manikonda", planName: "Custom Family Plan", planType: "veg", slot: "breakfast", deliveryTime: "7:00 AM", items: ["Pongal", "Vada (2)", "Sambar", "Coffee"], persons: 4, partnerId: "P002", partnerName: "Chef Fathima Kitchen", status: "delivered" },
];

// ── Intelligence Alerts ──
interface IntelligenceAlert {
  id: string;
  type: "delay" | "capacity" | "skip_pattern" | "quality" | "churn_risk";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  actionLabel?: string;
}

const intelligenceAlerts: IntelligenceAlert[] = [
  { id: "IA1", type: "delay", severity: "high", title: "⏰ Delayed Order Detected", description: "DSO-006 (Deepa Sharma) lunch is 15 min behind schedule. Partner: Chef Fathima Kitchen", actionLabel: "Escalate" },
  { id: "IA2", type: "capacity", severity: "medium", title: "📊 Partner at 90% Capacity", description: "Chef Lakshmi Kitchen has 18/20 slots filled. Consider redistributing new signups.", actionLabel: "View Allocation" },
  { id: "IA3", type: "skip_pattern", severity: "medium", title: "📈 High Skip Pattern — SC003", description: "Lakshmi Iyer has skipped 2 sessions this week. Approaching weekly limit of 3.", actionLabel: "View Customer" },
  { id: "IA4", type: "churn_risk", severity: "high", title: "🚨 Churn Risk — Sneha Pillai", description: "Paused subscription + recent complaint. 85% churn probability based on pattern.", actionLabel: "Call Customer" },
  { id: "IA5", type: "quality", severity: "low", title: "⭐ Top Performer", description: "Chef Fathima Kitchen has 100% on-time delivery for breakfast slot this week.", actionLabel: "View" },
];

const severityColors: Record<string, string> = {
  high: "border-destructive/30 bg-destructive/5",
  medium: "border-yellow-400/30 bg-yellow-50",
  low: "border-green-400/30 bg-green-50",
};

const SubscriptionOrdersManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<DailySubscriptionOrder[]>(mockDailyOrders);
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    if (slotFilter !== "all" && o.slot !== slotFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (partnerFilter !== "all" && o.partnerId !== partnerFilter) return false;
    return true;
  });

  const slotGroups = (["breakfast", "lunch", "dinner"] as MealSlot[]).map(slot => ({
    slot,
    ...slotConfig[slot],
    orders: filteredOrders.filter(o => o.slot === slot),
  }));

  // Metrics
  const totalOrders = orders.length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const pending = orders.filter(o => o.status === "pending").length;
  const cooking = orders.filter(o => o.status === "cooking").length;
  const delayed = orders.filter(o => o.isDelayed).length;
  const skipped = orders.filter(o => o.status === "skipped").length;
  const totalPortions = orders.filter(o => o.status !== "skipped").reduce((s, o) => s + o.persons, 0);

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, isDelayed: false } : o));
    toast({ title: `Order ${orderId}`, description: `Status → ${statusConfig[newStatus].label}` });
  };

  const handleReassign = (orderId: string, newPartnerId: string) => {
    const partner = partners.find(p => p.id === newPartnerId);
    if (!partner) return;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, partnerId: partner.id, partnerName: partner.name } : o));
    toast({ title: "Partner Reassigned", description: `${orderId} → ${partner.name}` });
  };

  return (
    <div className="space-y-4">
      {/* ── Intelligence Alerts ── */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-primary" /> Smart Alerts
        </h4>
        <div className="space-y-1.5">
          {intelligenceAlerts.filter(a => a.severity === "high").map(alert => (
            <Card key={alert.id} className={`${severityColors[alert.severity]} border`}>
              <CardContent className="p-2.5 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-foreground">{alert.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{alert.description}</p>
                </div>
                {alert.actionLabel && (
                  <Button size="sm" variant="outline" className="text-[9px] h-6 shrink-0" onClick={() => toast({ title: alert.actionLabel!, description: "Action triggered" })}>
                    {alert.actionLabel}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {intelligenceAlerts.filter(a => a.severity !== "high").length > 0 && (
            <details className="text-xs">
              <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                +{intelligenceAlerts.filter(a => a.severity !== "high").length} more alerts
              </summary>
              <div className="space-y-1.5 mt-1.5">
                {intelligenceAlerts.filter(a => a.severity !== "high").map(alert => (
                  <Card key={alert.id} className={`${severityColors[alert.severity]} border`}>
                    <CardContent className="p-2.5 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-foreground">{alert.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{alert.description}</p>
                      </div>
                      {alert.actionLabel && (
                        <Button size="sm" variant="outline" className="text-[9px] h-6 shrink-0" onClick={() => toast({ title: alert.actionLabel! })}>
                          {alert.actionLabel}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* ── Metrics Strip ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: "Total", value: totalOrders, color: "text-foreground" },
          { label: "Delivered", value: delivered, color: "text-green-600" },
          { label: "Cooking", value: cooking, color: "text-primary" },
          { label: "Pending", value: pending, color: "text-destructive" },
          { label: "Delayed", value: delayed, color: "text-red-600" },
          { label: "Portions", value: totalPortions, color: "text-foreground" },
        ].map(m => (
          <div key={m.label} className="bg-secondary/50 rounded-lg p-2 text-center">
            <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-1.5 flex-wrap">
        <Select value={slotFilter} onValueChange={setSlotFilter}>
          <SelectTrigger className="w-28 h-7 text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Slots</SelectItem>
            {(["breakfast", "lunch", "dinner"] as MealSlot[]).map(s => (
              <SelectItem key={s} value={s}>{slotConfig[s].emoji} {slotConfig[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28 h-7 text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-36 h-7 text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Partners</SelectItem>
            {partners.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Orders by Slot ── */}
      {slotGroups.map(group => {
        if (group.orders.length === 0) return null;
        return (
          <div key={group.slot} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm">{group.emoji}</span>
              <span className="text-sm font-bold text-foreground">{group.label}</span>
              <Badge variant="outline" className="text-[9px]">{group.time}</Badge>
              <Badge className="text-[9px] bg-secondary text-foreground">{group.orders.length} orders</Badge>
            </div>

            {group.orders.map(order => {
              const sc = statusConfig[order.status];
              const isExpanded = expandedOrder === order.id;

              return (
                <Card key={order.id} className={`border-border ${order.isDelayed ? "border-destructive/40 bg-destructive/5" : ""}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-foreground">{order.customerName}</span>
                          <Badge className={`text-[8px] ${order.planType === "veg" ? "bg-action-done/15 text-action-done" : "bg-destructive/15 text-destructive"}`}>
                            {order.planType === "veg" ? "🥬" : "🍗"} {order.planType}
                          </Badge>
                          <Badge className={`text-[8px] ${sc.color}`}>{sc.label}</Badge>
                          {order.isDelayed && (
                            <Badge className="text-[8px] bg-red-100 text-red-800 animate-pulse">
                              ⏰ {order.delayMinutes}min late
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {order.id} · {order.planName} · {order.persons}p · {order.deliveryTime}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <ChefHat className="w-2.5 h-2.5" /> {order.partnerName}
                        </p>

                        {isExpanded && (
                          <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-primary/20">
                            <p className="text-[10px] flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {order.address}</p>
                            <p className="text-[10px] flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {order.customerPhone}</p>
                            <div className="text-[10px] text-muted-foreground">
                              <span className="font-medium text-foreground">Items: </span>
                              {order.items.join(" · ")}
                            </div>
                            {order.note && <p className="text-[10px] text-primary italic">📝 {order.note}</p>}
                            {order.allergens && order.allergens.length > 0 && (
                              <p className="text-[10px] text-destructive font-semibold">⚠️ {order.allergens.join(", ")}</p>
                            )}
                            {/* Reassign */}
                            {order.status !== "delivered" && order.status !== "skipped" && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Select onValueChange={(val) => handleReassign(order.id, val)}>
                                  <SelectTrigger className="w-36 h-6 text-[9px]"><SelectValue placeholder="Reassign Partner" /></SelectTrigger>
                                  <SelectContent>
                                    {partners.filter(p => p.id !== order.partnerId).map(p => (
                                      <SelectItem key={p.id} value={p.id} className="text-[10px]">{p.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        {order.status === "pending" && (
                          <Button size="sm" className="text-[9px] h-6 gap-0.5 bg-action-cook text-action-cook-foreground hover:bg-action-cook/90" onClick={() => handleStatusUpdate(order.id, "cooking")}>
                            <ChefHat className="w-2.5 h-2.5" /> Cook
                          </Button>
                        )}
                        {order.status === "cooking" && (
                          <Button size="sm" className="text-[9px] h-6 gap-0.5 bg-action-pack text-action-pack-foreground hover:bg-action-pack/90" onClick={() => handleStatusUpdate(order.id, "packed")}>
                            <Package className="w-2.5 h-2.5" /> Pack
                          </Button>
                        )}
                        {order.status === "packed" && (
                          <Button size="sm" className="text-[9px] h-6 gap-0.5 bg-action-dispatch text-action-dispatch-foreground hover:bg-action-dispatch/90" onClick={() => handleStatusUpdate(order.id, "dispatched")}>
                            <Truck className="w-2.5 h-2.5" /> Ship
                          </Button>
                        )}
                        {order.status === "dispatched" && (
                          <Button size="sm" className="text-[9px] h-6 gap-0.5 bg-action-done text-action-done-foreground hover:bg-action-done/90" onClick={() => handleStatusUpdate(order.id, "delivered")}>
                            <CheckCircle2 className="w-2.5 h-2.5" /> Done
                          </Button>
                        )}
                        {order.status === "delivered" && (
                          <Badge className="text-[8px] bg-action-done/15 text-action-done">✅</Badge>
                        )}
                        {order.status === "skipped" && (
                          <Badge className="text-[8px] bg-muted text-muted-foreground">Skipped</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })}

      {filteredOrders.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">No orders match current filters</p>
      )}
    </div>
  );
};

export default SubscriptionOrdersManagement;
