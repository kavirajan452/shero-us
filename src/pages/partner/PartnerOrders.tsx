import { useState, useEffect, useCallback, useMemo } from "react";
import { addStockAlert } from "@/data/sscStockAlerts";
import { getUnacknowledgedCancellations, acknowledgeCancellation, subscribe as subscribeCancellations, type CustomerCancellation } from "@/data/customerCancellations";
import { getUnacknowledgedDelayComplaints, acknowledgeDelayComplaint, subscribeDelayComplaints, type DelayComplaint } from "@/data/delayComplaints";
import { Clock, CheckCircle2, Truck, XCircle, ChefHat, Package, Timer, AlertTriangle, UtensilsCrossed, Volume2, VolumeX, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { partnerOrders as initialOrders, OrderStatus, PartnerOrder, getPrepTimeMinutes, REJECTION_FINE, MAX_FREE_REJECTIONS_PER_MONTH } from "@/data/partnerMockData";
import { subscriptionMealOrders } from "@/data/partnerSubscriptionData";
import { serviceBookings } from "@/data/partnerSubscriptionData";
import { useRegion } from "@/contexts/RegionContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import OrderSummaryCards from "@/components/partner/OrderSummaryCards";
import SubscriptionOrdersTab from "@/components/partner/SubscriptionOrdersTab";
import ServiceBookingsTab from "@/components/partner/ServiceBookingsTab";
import { type OrderSource } from "@/data/partnerMockData";

// ── Status config for instant orders ──
const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "New", color: "bg-destructive text-destructive-foreground", icon: Clock },
  accepted: { label: "Accepted", color: "bg-primary text-primary-foreground", icon: CheckCircle2 },
  preparing: { label: "Preparing", color: "bg-accent text-accent-foreground", icon: ChefHat },
  ready: { label: "Ready", color: "bg-yellow-500 text-white", icon: Package },
  picked_up: { label: "Picked Up", color: "bg-secondary text-secondary-foreground", icon: Truck },
  delivered: { label: "Delivered", color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-muted text-muted-foreground", icon: XCircle },
};

// ── TTS ──
const langToVoiceLocale: Record<string, string> = {
  en: "en-IN", "en-IN": "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN",
  kn: "kn-IN", ml: "ml-IN", bn: "bn-IN", mr: "mr-IN",
  gu: "gu-IN", es: "es-ES", fr: "fr-FR", ar: "ar-SA", zh: "zh-CN",
};

const buildOrderSpeech = (order: PartnerOrder, lang: string, formatPrice: (n: number) => string): string => {
  const itemList = order.items.map((i) => `${i.name}, quantity ${i.qty}, ${formatPrice(i.price * i.qty)}`).join(". ");
  const allergens = order.allergens?.length ? order.allergens.join(", ") : "";
  const instructions = order.cookingInstructions || "";
  const note = order.note || "";
  const templates: Record<string, (id: string, total: string, items: string, a: string, i: string, n: string) => string> = {
    en: (id, total, items, a, i, n) => `Order ${id}, total ${total}. Items: ${items}.${a ? ` Allergy warning: ${a}.` : ""}${n ? ` Note: ${n}.` : ""}${i ? ` Cooking instructions: ${i}.` : ""}`,
    hi: (id, total, items, a, i, n) => `ऑर्डर ${id}, कुल ${total}. आइटम: ${items}.${a ? ` एलर्जी चेतावनी: ${a}.` : ""}${n ? ` नोट: ${n}.` : ""}${i ? ` खाना पकाने के निर्देश: ${i}.` : ""}`,
    ta: (id, total, items, a, i, n) => `ஆர்டர் ${id}, மொத்தம் ${total}. பொருட்கள்: ${items}.${a ? ` ஒவ்வாமை எச்சரிக்கை: ${a}.` : ""}${n ? ` குறிப்பு: ${n}.` : ""}${i ? ` சமையல் அறிவுறுத்தல்கள்: ${i}.` : ""}`,
    te: (id, total, items, a, i, n) => `ఆర్డర్ ${id}, మొత్తం ${total}. అంశాలు: ${items}.${a ? ` అలర్జీ హెచ్చరిక: ${a}.` : ""}${n ? ` గమనిక: ${n}.` : ""}${i ? ` వంట సూచనలు: ${i}.` : ""}`,
    kn: (id, total, items, a, i, n) => `ಆರ್ಡರ್ ${id}, ಒಟ್ಟು ${total}. ವಸ್ತುಗಳು: ${items}.${a ? ` ಅಲರ್ಜಿ ಎಚ್ಚರಿಕೆ: ${a}.` : ""}${n ? ` ಟಿಪ್ಪಣಿ: ${n}.` : ""}${i ? ` ಅಡುಗೆ ಸೂಚನೆಗಳು: ${i}.` : ""}`,
    ml: (id, total, items, a, i, n) => `ഓർഡർ ${id}, ആകെ ${total}. ഇനങ്ങൾ: ${items}.${a ? ` അലർജി മുന്നറിയിപ്പ്: ${a}.` : ""}${n ? ` കുറിപ്പ്: ${n}.` : ""}${i ? ` പാചക നിർദ്ദേശങ്ങൾ: ${i}.` : ""}`,
    bn: (id, total, items, a, i, n) => `অর্ডার ${id}, মোট ${total}. আইটেম: ${items}.${a ? ` অ্যালার্জি সতর্কতা: ${a}.` : ""}${n ? ` নোট: ${n}.` : ""}${i ? ` রান্নার নির্দেশনা: ${i}.` : ""}`,
    mr: (id, total, items, a, i, n) => `ऑर्डर ${id}, एकूण ${total}. आयटम: ${items}.${a ? ` ॲलर्जी इशारा: ${a}.` : ""}${n ? ` टीप: ${n}.` : ""}${i ? ` स्वयंपाक सूचना: ${i}.` : ""}`,
    gu: (id, total, items, a, i, n) => `ઓર્ડર ${id}, કુલ ${total}. આઇટમ્સ: ${items}.${a ? ` એલર્જી ચેતવણી: ${a}.` : ""}${n ? ` નોંધ: ${n}.` : ""}${i ? ` રસોઈ સૂચનાઓ: ${i}.` : ""}`,
    es: (id, total, items, a, i, n) => `Pedido ${id}, total ${total}. Artículos: ${items}.${a ? ` Alerta de alergia: ${a}.` : ""}${n ? ` Nota: ${n}.` : ""}${i ? ` Instrucciones: ${i}.` : ""}`,
    fr: (id, total, items, a, i, n) => `Commande ${id}, total ${total}. Articles: ${items}.${a ? ` Alerte allergie: ${a}.` : ""}${n ? ` Note: ${n}.` : ""}${i ? ` Instructions: ${i}.` : ""}`,
    ar: (id, total, items, a, i, n) => `طلب ${id}, المجموع ${total}. العناصر: ${items}.${a ? ` تحذير حساسية: ${a}.` : ""}${n ? ` ملاحظة: ${n}.` : ""}${i ? ` تعليمات الطبخ: ${i}.` : ""}`,
    zh: (id, total, items, a, i, n) => `订单 ${id}, 总计 ${total}. 项目: ${items}.${a ? ` 过敏警告: ${a}.` : ""}${n ? ` 备注: ${n}.` : ""}${i ? ` 烹饪说明: ${i}.` : ""}`,
  };
  const baseLang = lang.split("-")[0];
  const template = templates[lang] || templates[baseLang] || templates.en;
  return template(order.id, formatPrice(order.total), itemList, allergens, instructions, note);
};

// ── Instant order sub-tabs ──
const instantTabs: { label: string; filter: OrderStatus[] }[] = [
  { label: "Pending", filter: ["new"] },
  { label: "Preparing", filter: ["accepted", "preparing"] },
  { label: "Ready", filter: ["ready"] },
  { label: "Done", filter: ["delivered", "picked_up"] },
  { label: "All", filter: [] },
];

// Alternative suggestions map — keyword-based
const ALTERNATIVE_SUGGESTIONS: Record<string, string[]> = {
  "biryani": ["Pulao", "Fried Rice", "Jeera Rice", "Veg Biryani"],
  "chicken": ["Paneer Butter Masala", "Egg Curry", "Fish Curry", "Mushroom Masala"],
  "mutton": ["Chicken Curry", "Egg Masala", "Paneer Tikka", "Soya Chunks Curry"],
  "fish": ["Chicken Fry", "Egg Bhurji", "Prawn Masala", "Paneer Fry"],
  "dosa": ["Uttapam", "Idli", "Pongal", "Upma"],
  "idli": ["Dosa", "Pongal", "Upma", "Rava Idli"],
  "rice": ["Chapati", "Parotta", "Naan", "Poori"],
  "chapati": ["Rice", "Parotta", "Naan", "Phulka"],
  "sambar": ["Rasam", "Dal Fry", "Kootu", "Poriyal"],
  "paneer": ["Tofu Masala", "Mushroom Curry", "Soya Chunks", "Gobi Masala"],
  "egg": ["Paneer Bhurji", "Mushroom Pepper Fry", "Aloo Masala", "Tofu Scramble"],
  "naan": ["Chapati", "Parotta", "Kulcha", "Tandoori Roti"],
  "curry": ["Dry Fry", "Gravy", "Masala", "Stir Fry"],
  "dal": ["Sambar", "Rasam", "Kootu", "Poriyal"],
  "sweet": ["Payasam", "Gulab Jamun", "Kesari", "Halwa"],
  "juice": ["Buttermilk", "Lassi", "Lemon Soda", "Tender Coconut"],
};

const getAlternativesForItem = (itemName: string): string[] => {
  const lower = itemName.toLowerCase();
  for (const [keyword, alts] of Object.entries(ALTERNATIVE_SUGGESTIONS)) {
    if (lower.includes(keyword)) return alts;
  }
  // Generic fallback
  return ["Chef's Special", "Today's Special", "Ask customer"];
};

const useCountdown = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const formatCountdown = (remainingMs: number) => {
  if (remainingMs <= 0) return "OVERDUE";
  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
};

// ── Top-level order type tabs ──
type OrderTypeTab = "instant" | "subscription" | "services" | "party";
const orderTypeTabs: { key: OrderTypeTab; label: string; emoji: string }[] = [
  { key: "instant", label: "Instant Orders", emoji: "⚡" },
  { key: "subscription", label: "Subscriptions", emoji: "🔒" },
  { key: "services", label: "Services", emoji: "✨" },
  { key: "party", label: "Party Orders", emoji: "🎉" },
];

const SOURCE_CONFIG: Record<OrderSource, { label: string; color: string }> = {
  shero: { label: "Shero", color: "bg-primary/10 text-primary border-primary/20" },
  swiggy: { label: "Swiggy", color: "bg-orange-50 text-orange-600 border-orange-100" },
  zomato: { label: "Zomato", color: "bg-red-50 text-red-600 border-red-100" },
};

const PartnerOrders = () => {
  const [activeTypeTab, setActiveTypeTab] = useState<OrderTypeTab>("instant");
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [orders, setOrders] = useState<PartnerOrder[]>(initialOrders);
  const [rejectionsThisMonth, setRejectionsThisMonth] = useState(1);
  const [rejectDialogOrder, setRejectDialogOrder] = useState<PartnerOrder | null>(null);
  const [bulkRejectDialog, setBulkRejectDialog] = useState<PartnerOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectCustomReason, setRejectCustomReason] = useState("");
  const [unavailableItems, setUnavailableItems] = useState<Set<number>>(new Set());
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<number, string>>({});
  const { formatPrice, region } = useRegion();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const [speakingOrderId, setSpeakingOrderId] = useState<string | null>(null);
  const [fiveMinNotified, setFiveMinNotified] = useState<Set<string>>(new Set());
  const now = useCountdown();

  // ── 5-minute remaining notification for preparing orders ──
  useEffect(() => {
    orders.forEach((order) => {
      if (
        order.acceptedAt &&
        order.status === "preparing" &&
        order.orderType === "instant" &&
        !fiveMinNotified.has(order.id)
      ) {
        const totalItems = getTotalItems(order);
        const prepMinutes = getPrepTimeMinutes(totalItems);
        const elapsed = now - order.acceptedAt;
        const remainingMs = (prepMinutes * 60 * 1000) - elapsed;
        // Trigger when remaining is ≤ 5 minutes and > 0 (not overdue)
        if (remainingMs <= 5 * 60 * 1000 && remainingMs > 0) {
          setFiveMinNotified((prev) => new Set(prev).add(order.id));
          const remainMins = Math.ceil(remainingMs / 60000);
          toast({
            title: `⏰ ${order.id} — ${remainMins} min left!`,
            description: `Only ${remainMins} minute(s) remaining to complete preparation. Mark as ready soon!`,
            variant: "destructive",
          });
          // Play alert sound
          try {
            const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACA");
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch {}
        }
      }
    });
  }, [now, orders, fiveMinNotified, toast]);

  // ── Customer cancellation notifications ──
  const [cancellations, setCancellations] = useState<CustomerCancellation[]>(() => getUnacknowledgedCancellations());
  const [notifiedCancellations, setNotifiedCancellations] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = subscribeCancellations(() => {
      setCancellations(getUnacknowledgedCancellations());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    cancellations.forEach((c) => {
      if (!notifiedCancellations.has(c.id)) {
        setNotifiedCancellations((prev) => new Set(prev).add(c.id));
        toast({
          title: `🚫 Order ${c.orderId} Cancelled by Customer`,
          description: `Reason: ${c.reason}${c.reasonDetail ? ` — ${c.reasonDetail}` : ""}. Stop preparation if started.`,
          variant: "destructive",
        });
        try {
          const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACA");
          audio.volume = 0.7;
          audio.play().catch(() => {});
        } catch {}
      }
    });
  }, [cancellations, notifiedCancellations, toast]);

  // ── Customer delay complaint notifications ──
  const [delayComplaints, setDelayComplaints] = useState<DelayComplaint[]>(() => getUnacknowledgedDelayComplaints());
  const [notifiedDelays, setNotifiedDelays] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = subscribeDelayComplaints(() => {
      setDelayComplaints(getUnacknowledgedDelayComplaints());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    delayComplaints.forEach((d) => {
      if (!notifiedDelays.has(d.id)) {
        setNotifiedDelays((prev) => new Set(prev).add(d.id));
        toast({
          title: `⏰ Delay Reported — Order ${d.orderId}`,
          description: `Customer "${d.customerName}" reported a delay for ${d.kitchenName}. Please expedite preparation!`,
          variant: "destructive",
        });
        try {
          const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACA");
          audio.volume = 0.7;
          audio.play().catch(() => {});
        } catch {}
      }
    });
  }, [delayComplaints, notifiedDelays, toast]);

  const speakOrder = useCallback((order: PartnerOrder) => {
    if (!("speechSynthesis" in window)) return;
    if (speakingOrderId === order.id) {
      window.speechSynthesis.cancel();
      setSpeakingOrderId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const text = buildOrderSpeech(order, i18n.language, formatPrice);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langToVoiceLocale[i18n.language] || "en-IN";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeakingOrderId(null);
    setSpeakingOrderId(order.id);
    window.speechSynthesis.speak(utterance);
  }, [i18n.language, formatPrice, speakingOrderId]);

  // ── Summary data ──
  const today = new Date().toISOString().split("T")[0];
  const summaryData = {
    instant: {
      total: orders.filter((o) => !["rejected"].includes(o.status)).length,
      pending: orders.filter((o) => o.status === "new").length,
    },
    subscription: {
      total: subscriptionMealOrders.filter((o) => o.date === today).length,
      pending: subscriptionMealOrders.filter((o) => o.date === today && o.status === "pending").length,
    },
    services: {
      total: serviceBookings.filter((b) => b.date === today).length,
      upcoming: serviceBookings.filter((b) => b.date === today && b.status === "upcoming").length,
    },
    party: { total: 2, pending: 1 },
  };

  const filtered = activeSubTab === instantTabs.length - 1
    ? orders
    : orders.filter((o) => instantTabs[activeSubTab].filter.includes(o.status));

  const getTotalItems = (order: PartnerOrder) => order.items.reduce((s, i) => s + i.qty, 0);

  const handleAccept = useCallback((order: PartnerOrder) => {
    const totalItems = getTotalItems(order);
    const prepTime = getPrepTimeMinutes(totalItems);
    if (prepTime === -1) { setBulkRejectDialog(order); return; }
    setOrders((prev) =>
      prev.map((o) => o.id === order.id ? { ...o, status: "accepted" as OrderStatus, acceptedAt: Date.now() } : o)
    );
    toast({ title: `Order ${order.id} Accepted`, description: `${totalItems} items · ${prepTime} min prep time started` });
  }, [toast]);

  const handleStartCooking = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "preparing" as OrderStatus } : o)));
    toast({ title: `Order ${id}`, description: "Cooking started 🍳" });
  };

  const handleFoodReady = (order: PartnerOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "ready" as OrderStatus, readyAt: Date.now() } : o)));
    toast({ title: `Order ${order.id} Ready`, description: order.orderType === "instant" ? "🚚 Delivery partner notified" : "📱 Customer notified for pickup" });
  };

  const handleMarkDelivered = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "delivered" as OrderStatus } : o)));
    toast({ title: `Order ${id}`, description: "✅ Order delivered" });
  };

  const handleRejectConfirm = () => {
    if (!rejectDialogOrder) return;
    const reason = rejectReason === "other" ? rejectCustomReason : rejectReason;
    if (!reason && unavailableItems.size === 0) return;
    const newCount = rejectionsThisMonth + 1;
    const fined = newCount > MAX_FREE_REJECTIONS_PER_MONTH;
    const fineAmt = REJECTION_FINE[region.currency] || REJECTION_FINE.INR;
    const unavailableNames = Array.from(unavailableItems).map((i) => rejectDialogOrder.items[i]?.name).filter(Boolean);
    const altsSummary = Object.entries(selectedAlternatives)
      .map(([idx, alt]) => `${rejectDialogOrder.items[Number(idx)]?.name} → ${alt}`)
      .filter(Boolean);

    // Push stock alerts to SSC Management
    if (unavailableNames.length > 0) {
      Array.from(unavailableItems).forEach((idx) => {
        const item = rejectDialogOrder.items[idx];
        if (item) {
          addStockAlert({
            orderId: rejectDialogOrder.id,
            partnerName: "Maria T.",
            partnerId: "P001",
            kitchenName: "Sujatha's Chettinad Kitchen",
            itemName: item.name,
            suggestedAlternative: selectedAlternatives[idx] || undefined,
            reason: rejectReason === "ingredient_shortage" ? "ingredient_shortage" : "items_unavailable",
          });
        }
      });
    }
    setOrders((prev) => prev.map((o) => (o.id === rejectDialogOrder.id ? { ...o, status: "rejected" as OrderStatus } : o)));
    setRejectionsThisMonth(newCount);
    setRejectDialogOrder(null);
    setRejectReason("");
    setRejectCustomReason("");
    setUnavailableItems(new Set());
    setSelectedAlternatives({});
    toast({
      title: `Order ${rejectDialogOrder.id} Rejected`,
      description: fined
        ? `⚠️ Fine of ${formatPrice(fineAmt)} applied. ${unavailableNames.length ? `Unavailable: ${unavailableNames.join(", ")}` : reason}${altsSummary.length ? ` · Suggested: ${altsSummary.join(", ")}` : ""}`
        : `${MAX_FREE_REJECTIONS_PER_MONTH - newCount} free rejection(s) remaining.${altsSummary.length ? ` Alternatives sent: ${altsSummary.join(", ")}` : ""}`,
      variant: "destructive",
    });
  };

  const handleBulkRejectConfirm = () => {
    if (!bulkRejectDialog) return;
    setOrders((prev) => prev.map((o) => (o.id === bulkRejectDialog.id ? { ...o, status: "rejected" as OrderStatus } : o)));
    setBulkRejectDialog(null);
    toast({ title: `Order ${bulkRejectDialog.id} Auto-Rejected`, description: "15+ items — Advised to use Party Order", variant: "destructive" });
  };

  const fineAmt = REJECTION_FINE[region.currency] || REJECTION_FINE.INR;
  const willBeFined = rejectionsThisMonth >= MAX_FREE_REJECTIONS_PER_MONTH;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-2xl font-serif font-bold text-foreground">Order Management</h2>
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          Rejections: {rejectionsThisMonth}/{MAX_FREE_REJECTIONS_PER_MONTH} free
        </Badge>
      </div>

      {/* Customer Cancellation Alerts */}
      {cancellations.length > 0 && (
        <div className="space-y-2">
          {cancellations.map((c) => (
            <Card key={c.id} className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-3 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-destructive">Customer cancelled {c.orderId}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Reason: {c.reason}{c.reasonDetail ? ` — ${c.reasonDetail}` : ""}</p>
                  <p className="text-[10px] text-muted-foreground">{c.items.map((i) => `${i.qty}× ${i.name}`).join(", ")} · {c.cancelledAt}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs shrink-0"
                  onClick={() => acknowledgeCancellation(c.id)}
                >
                  Acknowledge
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Delay Complaint Alerts */}
      {delayComplaints.length > 0 && (
        <div className="space-y-2">
          {delayComplaints.map((d) => (
            <Card key={d.id} className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">⏰ Delay reported — {d.orderId}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Customer "{d.customerName}" says order is delayed. Kitchen: {d.kitchenName}</p>
                  <p className="text-[10px] text-muted-foreground">{d.reportedAt}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs shrink-0"
                  onClick={() => acknowledgeDelayComplaint(d.id)}
                >
                  Acknowledge
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <OrderSummaryCards data={summaryData} />

      {/* Order Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-border">
        {orderTypeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTypeTab(tab.key); setActiveSubTab(0); }}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTypeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Instant Orders Tab ── */}
      {activeTypeTab === "instant" && (
        <div className="space-y-3">
          {/* Sub-tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {instantTabs.map((tab, i) => {
              const count = i === instantTabs.length - 1
                ? orders.length
                : orders.filter((o) => instantTabs[i].filter.includes(o.status)).length;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveSubTab(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSubTab === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No orders in this category</p>
          )}

          {filtered.map((order) => {
            const cfg = statusConfig[order.status];
            const StatusIcon = cfg.icon;
            const totalItems = getTotalItems(order);
            const prepMinutes = getPrepTimeMinutes(totalItems);

            let timerMs = 0;
            let timerLabel = "";
            let isOverdue = false;
            if (order.acceptedAt && ["accepted", "preparing"].includes(order.status) && order.orderType === "instant") {
              const elapsed = now - order.acceptedAt;
              timerMs = (prepMinutes * 60 * 1000) - elapsed;
              timerLabel = formatCountdown(timerMs);
              isOverdue = timerMs <= 0;
            }

            return (
              <Card key={order.id} className={`border-border ${isOverdue ? "border-destructive/50 bg-destructive/5" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">{order.id}</span>
                        <Badge className={`${cfg.color} text-[10px] gap-1`}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{order.paymentMode.toUpperCase()}</Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {order.orderType === "instant" ? "🚚 Delivery" : "🏪 Pickup"}
                        </Badge>
                        {order.source && (
                          <Badge variant="outline" className={`text-[10px] font-semibold ${SOURCE_CONFIG[order.source].color}`}>
                            {SOURCE_CONFIG[order.source].label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.placedAt} · {totalItems} item{totalItems !== 1 ? "s" : ""}
                        {prepMinutes > 0 && order.status === "new" && ` · ${prepMinutes} min allowed`}
                      </p>

                      {order.acceptedAt && ["accepted", "preparing"].includes(order.status) && order.orderType === "instant" && (
                        <div className={`flex items-center gap-2 mt-2 px-2 py-1.5 rounded-md text-xs font-semibold ${
                          isOverdue ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                        }`}>
                          <Timer className="w-3.5 h-3.5" />
                          <span>{isOverdue ? "⏰ OVERDUE" : `⏱ ${timerLabel} remaining`}</span>
                          <span className="ml-auto text-muted-foreground font-normal">{prepMinutes} min limit</span>
                        </div>
                      )}

                      <div className="mt-2 space-y-0.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{item.qty}× {item.name} — {formatPrice(item.price * item.qty)}</span>
                            {["accepted", "preparing"].includes(order.status) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.name + " recipe short")}`, "_blank"); }}
                                className="shrink-0 p-0.5 rounded hover:bg-destructive/10 transition-colors"
                                title={`Watch ${item.name} recipe`}
                              >
                                <Youtube className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {order.note && <p className="text-xs text-primary mt-1.5 italic">📝 {order.note}</p>}
                      {order.allergens && order.allergens.length > 0 && (
                        <p className="text-xs text-destructive mt-1 font-semibold">⚠️ Allergens: {order.allergens.join(", ")}</p>
                      )}
                      {order.cookingInstructions && (
                        <p className="text-xs text-accent-foreground mt-0.5 font-medium">🍳 {order.cookingInstructions}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm" variant="ghost"
                          className={`h-8 w-8 p-0 ${speakingOrderId === order.id ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                          onClick={() => speakOrder(order)}
                          title={speakingOrderId === order.id ? "Stop reading" : "Read order aloud"}
                        >
                          {speakingOrderId === order.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <p className="text-lg font-bold text-foreground">{formatPrice(order.total)}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 mt-3">
                        {order.status === "new" && (
                          <>
                            <Button size="sm" onClick={() => handleAccept(order)} className="text-xs gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setRejectDialogOrder(order)}
                              className="text-xs text-destructive border-destructive/30">
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          </>
                        )}
                        {order.status === "accepted" && (
                          <Button size="sm" onClick={() => handleStartCooking(order.id)} className="text-xs gap-1">
                            <ChefHat className="w-3 h-3" /> Start Cooking
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button size="sm" onClick={() => handleFoodReady(order)} className="text-xs gap-1">
                            <UtensilsCrossed className="w-3 h-3" /> Food Ready
                          </Button>
                        )}
                        {order.status === "ready" && order.orderType === "pickup" && (
                          <Button size="sm" onClick={() => handleMarkDelivered(order.id)} className="text-xs gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Handed Over
                          </Button>
                        )}
                        {order.status === "ready" && order.orderType === "instant" && (
                          <div className="space-y-1">
                            <Badge className="bg-primary/10 text-primary text-[10px]">🚚 Awaiting Pickup</Badge>
                            <Button size="sm" variant="outline" onClick={() => handleMarkDelivered(order.id)} className="text-xs gap-1">
                              <Truck className="w-3 h-3" /> Mark Delivered
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Subscription Tab ── */}
      {activeTypeTab === "subscription" && <SubscriptionOrdersTab />}

      {/* ── Services Tab ── */}
      {activeTypeTab === "services" && <ServiceBookingsTab />}

      {/* ── Party Orders Tab ── */}
      {activeTypeTab === "party" && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Party orders are managed in the dedicated</p>
          <a href="/partner/party-orders" className="text-primary font-semibold hover:underline text-sm">
            🎉 Party Orders Dashboard →
          </a>
        </div>
      )}

      {/* SAP tab removed — all channel orders now under Instant Orders */}

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialogOrder} onOpenChange={(open) => { if (!open) { setRejectDialogOrder(null); setRejectReason(""); setRejectCustomReason(""); setUnavailableItems(new Set()); setSelectedAlternatives({}); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Order {rejectDialogOrder?.id}?</DialogTitle>
            <DialogDescription>
              {willBeFined ? (
                <span className="text-destructive font-semibold">
                  ⚠️ All {MAX_FREE_REJECTIONS_PER_MONTH} free rejections used. Fine of <strong>{formatPrice(fineAmt)}</strong> applies.
                </span>
              ) : (
                <span>
                  <strong>{MAX_FREE_REJECTIONS_PER_MONTH - rejectionsThisMonth}</strong> free rejection(s) remaining.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Reason Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Reason for rejection</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: "busy", label: "🔥 Too busy right now" },
                { value: "closing", label: "🕐 Kitchen closing soon" },
                { value: "items_unavailable", label: "❌ Items not available" },
                { value: "ingredient_shortage", label: "🥕 Ingredient shortage" },
                { value: "equipment_issue", label: "🔧 Equipment issue" },
                { value: "other", label: "📝 Other reason" },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRejectReason(r.value)}
                  className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    rejectReason === r.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {rejectReason === "other" && (
              <Input
                placeholder="Enter your reason..."
                value={rejectCustomReason}
                onChange={(e) => setRejectCustomReason(e.target.value)}
                className="mt-2"
              />
            )}

            {/* Item-level unavailability + alternatives */}
            {rejectDialogOrder && (rejectReason === "items_unavailable" || rejectReason === "ingredient_shortage") && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select unavailable items & suggest alternatives</label>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {rejectDialogOrder.items.map((item, idx) => {
                    const isSelected = unavailableItems.has(idx);
                    const alternatives = getAlternativesForItem(item.name);
                    const chosenAlt = selectedAlternatives[idx];
                    return (
                      <div key={idx} className="space-y-1.5">
                        <button
                          onClick={() => {
                            setUnavailableItems((prev) => {
                              const next = new Set(prev);
                              if (next.has(idx)) {
                                next.delete(idx);
                                setSelectedAlternatives((p) => { const n = { ...p }; delete n[idx]; return n; });
                              } else {
                                next.add(idx);
                              }
                              return next;
                            });
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors ${
                            isSelected
                              ? "border-destructive bg-destructive/10 text-destructive"
                              : "border-border text-foreground hover:border-destructive/40"
                          }`}
                        >
                          <span className={isSelected ? "line-through" : ""}>{item.qty}× {item.name}</span>
                          <span className="text-muted-foreground">{isSelected ? "❌ Unavailable" : "Tap to mark"}</span>
                        </button>

                        {/* Alternative suggestions */}
                        {isSelected && (
                          <div className="ml-3 space-y-1.5">
                            <p className="text-[11px] font-medium text-muted-foreground">🔄 Suggest alternative to customer:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {alternatives.map((alt) => (
                                <button
                                  key={alt}
                                  onClick={() => setSelectedAlternatives((p) => ({ ...p, [idx]: chosenAlt === alt ? undefined as any : alt }))}
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                                    chosenAlt === alt
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                  }`}
                                >
                                  {alt}
                                </button>
                              ))}
                            </div>
                            {chosenAlt && (
                              <p className="text-[10px] text-primary font-medium">
                                ✅ Will suggest "{chosenAlt}" as replacement for {item.name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialogOrder(null); setRejectReason(""); setRejectCustomReason(""); setUnavailableItems(new Set()); setSelectedAlternatives({}); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason || (rejectReason === "other" && !rejectCustomReason.trim()) || ((rejectReason === "items_unavailable" || rejectReason === "ingredient_shortage") && unavailableItems.size === 0)}
            >
              {willBeFined ? `Reject & Pay ${formatPrice(fineAmt)}` : "Reject Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reject Dialog */}
      <Dialog open={!!bulkRejectDialog} onOpenChange={() => setBulkRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Too Many Items
            </DialogTitle>
            <DialogDescription>
              Order <strong>{bulkRejectDialog?.id}</strong> has <strong>{bulkRejectDialog ? getTotalItems(bulkRejectDialog) : 0}</strong> items (max 15).
              Customer will be advised to use <strong>Party / Bulk Order</strong>. No fine applied.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRejectDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkRejectConfirm}>Reject & Advise Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerOrders;
