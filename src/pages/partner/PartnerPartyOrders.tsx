import { useState, useMemo } from "react";
import { createInvoice } from "@/utils/invoiceService";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  computeProductionVolume,
  getPortionSize,
} from "@/data/partyProductionData";
import { usePartyOrders, useUpdatePartyOrder } from "@/hooks/useSupabaseData";
import { partyMenu, mealLabels, categoryLabels } from "@/data/partyMenuData";
import { useRegion } from "@/contexts/RegionContext";
import { useToast } from "@/hooks/use-toast";
import { markFoodReady } from "@/data/deliveryLogisticsStore";
import {
  Users,
  CalendarDays,
  ClipboardList,
  Check,
  Clock,
  ChefHat,
  Package,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import PartyPrepReminders from "@/components/partner/PartyPrepReminders";
import PackingGuide from "@/components/partner/PackingGuide";

// Helper: convert grams to kg or ml to liters for total volume
function formatTotalVolume(quantityPerPlate: number, unit: string, guestCount: number): string {
  const total = quantityPerPlate * guestCount;
  const unitLower = unit.toLowerCase();
  if (unitLower === "gms" || unitLower === "g") {
    const kg = total / 1000;
    return `${kg.toFixed(2)} Kg`;
  }
  if (unitLower === "ml") {
    const liters = total / 1000;
    return `${liters.toFixed(2)} L`;
  }
  return `${total} ${unit}`;
}

// PPP pricing: partner earns % of MRP based on kitchen age
const PARTNER_PPP_PERCENT = 0.55;
const PARTNER_KITCHEN_AGE = "12m+";

const PartnerPartyOrders = () => {
  const { formatPrice, region } = useRegion();
  const { t } = useTranslation();
  
  // TODO: Get partner ID from auth context; for now use demo
  const myPartnerId = "pk1";
  const { data: allOrders = [], isLoading } = usePartyOrders();
  const updateOrder = useUpdatePartyOrder();

  // Map DB snake_case to camelCase for template compatibility
  const myOrders = useMemo(() => allOrders
    .filter((o: any) => o.allocated_partner_id === myPartnerId)
    .map((o: any) => ({
      ...o,
      orderId: o.order_id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerLat: o.customer_lat,
      customerLng: o.customer_lng,
      customerAddress: o.customer_address,
      serviceType: o.service_type,
      foodType: o.food_type,
      guestCount: o.guest_count,
      eventDate: o.event_date,
      eventTime: o.event_time || "12:00",
      selectedItems: o.selected_items || [],
      cookingInstructions: o.cooking_instructions,
      totalAmount: o.total_amount,
      allocatedPartnerId: o.allocated_partner_id,
      allocatedAt: o.allocated_at,
      createdAt: o.created_at,
    }))
  , [allOrders, myPartnerId]);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(
    null
  );
  const [tab, setTab] = useState("orders");

  const productionData = useMemo(() => {
    if (!selectedOrder) return [];
    return computeProductionVolume(selectedOrder.selectedItems, selectedOrder.guestCount);
  }, [selectedOrder]);

  // PPP income calculation
  const partnerIncome = useMemo(() => {
    if (!selectedOrder) return 0;
    return Math.round(selectedOrder.totalAmount * PARTNER_PPP_PERCENT);
  }, [selectedOrder]);

  const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    allocated: { label: t("party.partner.newAccept"), color: "bg-amber-100 text-amber-800", icon: AlertTriangle },
    accepted: { label: t("party.partner.accepted"), color: "bg-primary/10 text-primary", icon: Check },
    preparing: { label: t("party.partner.preparing"), color: "bg-accent/20 text-accent-foreground", icon: ChefHat },
    delivered: { label: t("party.partner.delivered"), color: "bg-secondary text-muted-foreground", icon: Package },
  };

  const [orderStates, setOrderStates] = useState<Record<string, string>>({});

  const { toast } = useToast();

  const handleAccept = (orderId: string) => {
    // Update DB
    const order = myOrders.find((o: any) => o.id === orderId);
    if (order) {
      updateOrder.mutate({ id: orderId, updates: { status: "accepted" } });
    }
    setOrderStates((prev) => ({ ...prev, [orderId]: "accepted" }));
  };

  const handleFoodReady = (order: any) => {
    // Payment verification gate — block if not fully paid
    const paymentStatus = order.payment_status || "pending";
    if (paymentStatus !== "paid" && paymentStatus !== "advance_paid") {
      toast({
        title: "⚠️ Payment Not Verified",
        description: "Cannot mark food ready — payment has not been received. Contact admin.",
        variant: "destructive",
      });
      return;
    }

    setOrderStates((prev) => ({ ...prev, [order.id]: "preparing" }));
    updateOrder.mutate({ id: order.id, updates: { status: "preparing" } });
    markFoodReady(
      order.id,
      order.orderId,
      order.customerName,
      order.customerPhone,
      order.customerAddress,
      order.customerLat,
      order.customerLng,
      "Chef Lakshmi",
      "pk1",
      order.guestCount,
      order.eventDate,
      order.eventTime
    );
    createInvoice({
      orderId: order.orderId,
      orderType: order.serviceType === "combo-meal-box" ? "party_combo" : "party_bulk",
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.selectedItems.map((item: string) => ({ name: item, qty: `${order.guestCount} pax`, amount: 0 })),
      subtotal: order.totalAmount * 0.85,
      taxAmount: order.totalAmount * 0.05,
      deliveryFee: order.delivery_fee || 12,
      packingCharges: 0,
      platformFee: 0,
      discount: 0,
      total: order.totalAmount,
    });
    toast({ title: "✅ Food Ready — delivery team notified!" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">🎉 {t("party.partner.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("party.partner.subtitle")}</p>
      </div>

      <PartyPrepReminders partnerId={myPartnerId} />

      {myOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t("party.partner.noOrders")}</p>
        </Card>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="orders" className="gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" /> {t("party.partner.orders")} ({myOrders.length})
            </TabsTrigger>
            <TabsTrigger value="production" className="gap-1.5">
              <Package className="w-3.5 h-3.5" /> {t("party.partner.productionChart")}
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-3 mt-4">
            {myOrders.map((order) => {
              const status = orderStates[order.id] || order.status;
              const cfg = statusConfig[status] || statusConfig.allocated;
              const StatusIcon = cfg.icon;
              return (
                <Card
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 cursor-pointer transition-all ${selectedOrder?.id === order.id ? "ring-2 ring-primary" : "hover:border-primary/40"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{order.orderId}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    </div>
                    <Badge className={`${cfg.color} text-[10px] gap-1`}>
                      <StatusIcon className="w-3 h-3" /> {cfg.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {order.guestCount} guests</span>
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {order.eventDate} {order.eventTime}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {order.meals.map((m) => (
                      <span key={m} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{mealLabels[m]?.split(" ")[1] || m}</span>
                    ))}
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {order.foodType === "veg" ? "🥬 Veg" : "🍗 Non-Veg"} • {order.selectedItems.length} items
                    </span>
                  </div>

                  {order.cookingInstructions && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-600">
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 mb-0.5">⚠️ COOKING INSTRUCTIONS</p>
                      <p className="text-[11px] text-foreground leading-snug line-clamp-2">{order.cookingInstructions}</p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-foreground">{formatPrice(Math.round(order.totalAmount * PARTNER_PPP_PERCENT))}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">({t("party.partner.yourEarnings")})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setTab("production"); }}
                        className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
                      >
                        📋 {t("party.partner.viewDetails")}
                      </button>
                      {status === "allocated" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAccept(order.id); }}
                          className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          {t("party.partner.acceptOrder")}
                        </button>
                      )}
                      {(status === "accepted" || status === "preparing") && status !== "preparing" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFoodReady(order); }}
                          className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
                        >
                          🍳 Food Ready
                        </button>
                      )}
                      {status === "preparing" && (
                        <Badge className="bg-accent/20 text-accent-foreground text-[10px]">✅ Food Ready — Awaiting Pickup</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          {/* Production Chart Tab */}
          <TabsContent value="production" className="space-y-4 mt-4">
            {!selectedOrder ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">{t("party.partner.selectOrderPrompt")}</p>
              </Card>
            ) : (
              <>
                {/* PPP Income Card */}
                <Card className="p-4 bg-accent/10 border-accent">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t("party.partner.yourEarnings")}</p>
                      <p className="text-xl font-bold text-foreground">{formatPrice(partnerIncome)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">{selectedOrder.guestCount} guests · {selectedOrder.selectedItems.length} items</p>
                      <p className="text-[10px] text-muted-foreground">{selectedOrder.eventDate} · {selectedOrder.eventTime}</p>
                    </div>
                  </div>
                  {(orderStates[selectedOrder.id] || selectedOrder.status) === "allocated" && (
                    <button
                      onClick={() => handleAccept(selectedOrder.id)}
                      className="w-full mt-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      ✅ {t("party.partner.acceptThisOrder")}
                    </button>
                  )}
                </Card>

                {/* Cooking Instructions — prominent callout */}
                {selectedOrder.cookingInstructions && (
                  <Card className="p-0 overflow-hidden border-[3px] border-red-500 dark:border-red-400 shadow-lg shadow-red-100 dark:shadow-red-950/30">
                    <div className="bg-red-50 dark:bg-red-950/50 px-4 py-3 border-b-2 border-red-400 dark:border-red-500 flex items-center gap-2">
                      <span className="text-xl">🚨</span>
                      <h4 className="text-base font-extrabold text-red-700 dark:text-red-300 uppercase tracking-widest">{t("party.partner.customerCookingInstructions")}</h4>
                    </div>
                    <div className="px-5 py-4 bg-red-100 dark:bg-red-950/40">
                      <p className="text-base font-bold text-foreground leading-relaxed whitespace-pre-wrap">{selectedOrder.cookingInstructions}</p>
                    </div>
                  </Card>
                )}

                {/* Detailed Production Sheet */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{t("party.partner.productionSheet")} — {selectedOrder.orderId}</h3>
                    <Badge variant="outline" className="text-[10px]">{selectedOrder.guestCount} {t("party.partner.plates")}</Badge>
                  </div>
                  {(() => {
                    // Calculate production timeline backwards from service time
                    const [hours, mins] = selectedOrder.eventTime.split(":").map(Number);
                    const serviceDate = new Date(selectedOrder.eventDate);
                    serviceDate.setHours(hours, mins, 0);

                    const travelMins = 40;
                    const itemCount = selectedOrder.selectedItems.length;
                    const cookingMins = itemCount <= 10 ? 60 : itemCount <= 15 ? 90 : 120;

                    const dispatchTime = new Date(serviceDate.getTime() - travelMins * 60000);
                    const cookingStartTime = new Date(dispatchTime.getTime() - cookingMins * 60000);

                    const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
                    const fmtDate = (d: Date) => d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "short", year: "numeric" });

                    return (
                      <div className="mb-4 rounded-xl border-2 border-primary/30 overflow-hidden">
                        {/* Header with order ID & date */}
                        <div className="bg-primary px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-primary-foreground" />
                            <span className="text-lg font-bold text-primary-foreground">{selectedOrder.orderId}</span>
                          </div>
                          <span className="text-sm font-semibold text-primary-foreground/90">{fmtDate(serviceDate)}</span>
                        </div>

                        {/* Timeline */}
                        <div className="bg-primary/5 px-4 py-4">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {/* Start Cooking */}
                            <div className="p-3 rounded-lg bg-background border border-border shadow-sm">
                              <ChefHat className="w-5 h-5 text-primary mx-auto mb-1" />
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Start Cooking</p>
                              <p className="text-lg font-extrabold text-foreground mt-0.5">{fmt(cookingStartTime)}</p>
                              <p className="text-[10px] text-muted-foreground">{cookingMins} min ({itemCount} items)</p>
                            </div>
                            {/* Dispatch */}
                            <div className="p-3 rounded-lg bg-background border border-border shadow-sm">
                              <Package className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Dispatch</p>
                              <p className="text-lg font-extrabold text-foreground mt-0.5">{fmt(dispatchTime)}</p>
                              <p className="text-[10px] text-muted-foreground">{travelMins} min travel</p>
                            </div>
                          </div>
                          {/* Connecting arrows */}
                          <div className="flex items-center justify-center gap-1 mt-2 text-muted-foreground">
                            <span className="text-[10px]">🍳 Cook</span>
                            <span className="text-xs">→</span>
                            <span className="text-[10px]">📦 Pack & Go</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 text-muted-foreground font-medium w-8">#</th>
                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">{t("party.partner.item")}</th>
                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">{t("party.partner.mealCol")}</th>
                          <th className="text-right py-2 px-2 text-muted-foreground font-medium">{t("party.partner.perPlate")}</th>
                          <th className="text-right py-2 px-2 text-muted-foreground font-medium">{t("party.guests")}</th>
                          <th className="text-right py-2 px-2 text-muted-foreground font-medium">{t("party.partner.totalVol")}</th>
                          <th className="text-right py-2 px-2 text-muted-foreground font-medium font-bold">{t("party.partner.earnings")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let totalPPP = 0;
                          
                          const rows = productionData.map((row: any, idx: number) => {
                            const portion = getPortionSize(row.itemId);
                            const menuItem = partyMenu.find((m) => m.id === row.itemId);
                            const totalFormatted = portion
                              ? formatTotalVolume(portion.quantityPerPlate, portion.unit, selectedOrder.guestCount)
                              : row.totalVolume;
                            const mrpPerPlate = menuItem?.pricePerPlateIN || 0;
                            const itemMRP = mrpPerPlate * selectedOrder.guestCount;
                            const itemPPP = Math.round(itemMRP * PARTNER_PPP_PERCENT);
                            
                            totalPPP += itemPPP;
                            return (
                              <tr key={row.itemId} className="border-b border-border/50">
                                <td className="py-2 px-2 text-muted-foreground text-center">{idx + 1}</td>
                                <td className="py-2 px-2 text-foreground font-medium">{row.itemName}</td>
                                <td className="py-2 px-2 text-muted-foreground">{mealLabels[row.mealType]?.split(" ")[1] || row.mealType}</td>
                                <td className="py-2 px-2 text-right text-foreground">{row.portionPerPlate}</td>
                                <td className="py-2 px-2 text-right text-foreground">{row.totalPortions}</td>
                                <td className="py-2 px-2 text-right text-primary font-semibold">{totalFormatted}</td>
                                <td className="py-2 px-2 text-right text-foreground font-semibold">{formatPrice(itemPPP)}</td>
                              </tr>
                            );
                          });
                          return (
                            <>
                              {rows}
                              <tr className="border-t-2 border-border bg-secondary/30">
                                <td colSpan={6} className="py-2.5 px-2 text-right font-bold text-foreground">{t("party.partner.totalEarnings")}</td>
                                <td className="py-2.5 px-2 text-right text-primary font-bold">{formatPrice(totalPPP)}</td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <PackingGuide />
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PartnerPartyOrders;
