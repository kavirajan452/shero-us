import { useState, useCallback } from "react";
import { Users, Package, ChefHat, CheckCircle2, Eye, Youtube, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { subscriptionMealOrders, type SubscriptionMealOrder, type SubscriptionOrderStatus } from "@/data/partnerSubscriptionData";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { buildSubscriptionSpeech, speak, stopSpeaking } from "@/utils/partnerTTS";

const statusColors: Record<SubscriptionOrderStatus, string> = {
  pending: "bg-destructive text-destructive-foreground",
  cooking: "bg-action-cook text-action-cook-foreground",
  packed: "bg-action-pack text-action-pack-foreground",
  dispatched: "bg-action-dispatch text-action-dispatch-foreground",
  delivered: "bg-action-done text-action-done-foreground",
  skipped: "bg-muted text-muted-foreground",
};

const slotConfig = {
  breakfast: { emoji: "🌅", label: "Breakfast", time: "7:00 – 9:00 AM" },
  lunch: { emoji: "☀️", label: "Lunch", time: "12:00 – 2:00 PM" },
  dinner: { emoji: "🌙", label: "Dinner", time: "7:00 – 9:00 PM" },
};

const planColors: Record<string, string> = {
  veg: "bg-green-100 text-green-800",
  nonveg: "bg-red-100 text-red-800",
  family: "bg-blue-100 text-blue-800",
  custom: "bg-purple-100 text-purple-800",
};

const SubscriptionOrdersTab = () => {
  const [viewMode, setViewMode] = useState<"batch" | "individual">("batch");
  const [orders, setOrders] = useState<SubscriptionMealOrder[]>(subscriptionMealOrders);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { i18n } = useTranslation();

  const speakOrder = useCallback((order: SubscriptionMealOrder) => {
    if (speakingId === order.id) { stopSpeaking(); setSpeakingId(null); return; }
    const text = buildSubscriptionSpeech(order, i18n.language);
    speak(text, i18n.language, () => setSpeakingId(order.id), () => setSpeakingId(null));
  }, [speakingId, i18n.language]);

  const todayOrders = orders.filter((o) => o.date === new Date().toISOString().split("T")[0]);

  const handleStatusChange = (id: string, newStatus: SubscriptionOrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    const labels: Record<string, string> = {
      cooking: "🍳 Cooking started",
      packed: "📦 All meals packed",
      dispatched: "🚚 Dispatched for delivery",
    };
    toast({ title: id, description: labels[newStatus] || "Status updated" });
  };

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={viewMode === "batch" ? "default" : "outline"}
          onClick={() => setViewMode("batch")}
          className="text-xs gap-1"
        >
          <Package className="w-3 h-3" /> Batch Production
        </Button>
        <Button
          size="sm"
          variant={viewMode === "individual" ? "default" : "outline"}
          onClick={() => setViewMode("individual")}
          className="text-xs gap-1"
        >
          <Users className="w-3 h-3" /> Individual Customers
        </Button>
      </div>

      {todayOrders.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No subscription orders for today</p>
      )}

      {/* Batch Production View */}
      {viewMode === "batch" && todayOrders.map((order) => {
        const slot = slotConfig[order.slot];
        return (
          <Card key={order.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{slot.emoji}</span>
                    <span className="font-bold text-foreground">{slot.label}</span>
                    <Badge className={`text-[10px] ${statusColors[order.status]}`}>
                      {order.status.toUpperCase()}
                    </Badge>
                    <Badge className={`text-[10px] ${planColors[order.planType]}`}>
                      {order.planType === "veg" ? "🥬 Veg" : order.planType === "nonveg" ? "🍗 Non-Veg" : order.planType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {slot.time} · {order.totalPortions} portions · {order.id}
                  </p>

                  {/* Production quantities */}
                  <div className="mt-3 bg-secondary/50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Production Quantities
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-foreground">{item.name}</span>
                            {["pending", "cooking"].includes(order.status) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.name + " recipe short")}`, "_blank"); }}
                                className="shrink-0 p-0.5 rounded hover:bg-destructive/10 transition-colors"
                                title={`Watch ${item.name} recipe`}
                              >
                                <Youtube className="w-3 h-3 text-destructive" />
                              </button>
                            )}
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold">
                            ×{item.qty}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer count */}
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="flex items-center gap-1.5 mt-2 text-xs text-primary hover:underline"
                  >
                    <Users className="w-3 h-3" />
                    {order.customers.length} customers
                    <Eye className="w-3 h-3" />
                  </button>

                  {/* Expanded customer list */}
                  {expandedOrder === order.id && (
                    <div className="mt-2 space-y-1 pl-2 border-l-2 border-primary/20">
                      {order.customers.map((c) => (
                        <div key={c.id} className="text-[11px]">
                          <span className="font-medium text-foreground">{c.name}</span>
                          <span className="text-muted-foreground"> — {c.address}</span>
                          {c.note && <span className="text-primary italic"> · 📝 {c.note}</span>}
                          {c.allergens && c.allergens.length > 0 && (
                            <span className="text-destructive font-semibold"> · ⚠️ {c.allergens.join(", ")}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex flex-col items-center gap-1.5">
                  <Button
                    size="sm" variant="ghost"
                    className={`h-8 w-8 p-0 ${speakingId === order.id ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                    onClick={() => speakOrder(order)}
                    title={speakingId === order.id ? "Stop reading" : "Read order aloud"}
                  >
                    {speakingId === order.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  {order.status === "pending" && (
                    <Button size="sm" onClick={() => handleStatusChange(order.id, "cooking")} className="text-xs gap-1 bg-action-cook text-action-cook-foreground hover:bg-action-cook/90">
                      <ChefHat className="w-3 h-3" /> Start Cooking
                    </Button>
                  )}
                  {order.status === "cooking" && (
                    <Button size="sm" onClick={() => handleStatusChange(order.id, "packed")} className="text-xs gap-1 bg-action-pack text-action-pack-foreground hover:bg-action-pack/90">
                      <Package className="w-3 h-3" /> Mark Packed
                    </Button>
                  )}
                  {order.status === "packed" && (
                    <Button size="sm" onClick={() => handleStatusChange(order.id, "dispatched")} className="text-xs gap-1 bg-action-dispatch text-action-dispatch-foreground hover:bg-action-dispatch/90">
                      <CheckCircle2 className="w-3 h-3" /> Dispatch
                    </Button>
                  )}
                  {order.status === "delivered" && (
                    <Badge className="bg-action-done/15 text-action-done text-[10px]">✅ Done</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Individual Customer View */}
      {viewMode === "individual" && todayOrders.map((order) => {
        const slot = slotConfig[order.slot];
        return (
          <div key={order.id} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm">{slot.emoji}</span>
              <span className="text-sm font-semibold text-foreground">{slot.label}</span>
              <Badge className={`text-[10px] ${planColors[order.planType]}`}>
                {order.planType === "veg" ? "🥬 Veg" : "🍗 Non-Veg"}
              </Badge>
              <span className="text-xs text-muted-foreground">{slot.time}</span>
            </div>
            {order.customers.map((customer) => (
              <Card key={customer.id} className="border-border">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{customer.address}</p>
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="inline-flex items-center gap-0.5">
                            {item.name}
                            {["pending", "cooking"].includes(order.status) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.name + " recipe short")}`, "_blank"); }}
                                className="shrink-0 p-0.5 rounded hover:bg-destructive/10 transition-colors"
                                title={`Watch ${item.name} recipe`}
                              >
                                <Youtube className="w-3 h-3 text-destructive" />
                              </button>
                            )}
                            {idx < order.items.length - 1 && <span>·</span>}
                          </span>
                        ))}
                      </div>
                      {customer.note && (
                        <p className="text-[11px] text-primary mt-1 italic">📝 {customer.note}</p>
                      )}
                      {customer.allergens && customer.allergens.length > 0 && (
                        <p className="text-[11px] text-destructive mt-0.5 font-semibold">
                          ⚠️ {customer.allergens.join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className={`text-[10px] ${statusColors[order.status]}`}>
                        {order.status}
                      </Badge>
                      <Button
                        size="sm" variant="ghost"
                        className={`h-7 w-7 p-0 ${speakingId === order.id ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                        onClick={() => speakOrder(order)}
                        title={speakingId === order.id ? "Stop reading" : "Read order aloud"}
                      >
                        {speakingId === order.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default SubscriptionOrdersTab;
