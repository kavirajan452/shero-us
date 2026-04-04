import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, Shield, Clock, MapPin, Star, ChevronDown, ChevronUp, Package, Navigation, XCircle, AlertTriangle, Edit3, Send, Timer, CheckCircle2 } from "lucide-react";
import { openWhatsAppSupport, buildSupportMessage } from "@/utils/whatsapp";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { mockTrackedOrder, statusMeta, type TrackingStatus, type TrackedOrder } from "@/data/deliveryTrackingData";
import { useRegion } from "@/contexts/RegionContext";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addCancellation, CANCELLATION_REASONS } from "@/data/customerCancellations";
import { addOrderModification } from "@/data/sscOrderModifications";
import { addDelayComplaint } from "@/data/delayComplaints";
import { getPrepTimeMinutes } from "@/data/partnerMockData";
import { toast } from "sonner";

const allStatuses: TrackingStatus[] = [
  "order_placed", "order_confirmed", "preparing", "rider_assigned",
  "rider_at_kitchen", "picked_up", "in_transit", "near_destination", "delivered",
];

const OrderTracking = () => {
  const { formatPrice } = useRegion();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<TrackedOrder>(mockTrackedOrder);
  const [showDetails, setShowDetails] = useState(false);
  const [liveEta, setLiveEta] = useState(12);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDetail, setCancelDetail] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);

  // 5-minute modification window
  const [modWindowStart] = useState(() => Date.now());
  const [modSecondsLeft, setModSecondsLeft] = useState(5 * 60);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [modType, setModType] = useState("other");
  const [modDesc, setModDesc] = useState("");
  const modWindowOpen = modSecondsLeft > 0 && !isCancelled && ["order_placed", "order_confirmed", "preparing"].includes(order.currentStatus);

  // Delay complaint — available after prep time expires
  const totalItemCount = order.items.reduce((sum, i) => sum + i.qty, 0);
  const prepTimeMinutes = getPrepTimeMinutes(totalItemCount);
  const orderPlacedTime = new Date(order.events[0]?.timestamp || order.orderDate).getTime();
  const [prepElapsedSecs, setPrepElapsedSecs] = useState(0);
  const prepTimeExpired = prepTimeMinutes > 0 && prepElapsedSecs >= prepTimeMinutes * 60;
  const canReportDelay = prepTimeExpired && !isCancelled && ["preparing", "rider_assigned", "rider_at_kitchen"].includes(order.currentStatus);
  const [delayReported, setDelayReported] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - modWindowStart) / 1000);
      const remaining = Math.max(0, 5 * 60 - elapsed);
      setModSecondsLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [modWindowStart]);

  // Track prep time elapsed
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - orderPlacedTime) / 1000);
      setPrepElapsedSecs(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [orderPlacedTime]);

  const handleReportDelay = () => {
    addDelayComplaint({
      orderId: order.orderId,
      customerName: "Customer",
      customerPhone: "+1 98765 00000",
      kitchenName: order.kitchenName,
      partnerName: "Kitchen Partner",
    });
    setDelayReported(true);
    toast.success("Delay reported!", {
      description: "The kitchen partner and our support team have been notified. We're on it!",
      duration: 5000,
    });
  };

  const modMinutes = Math.floor(modSecondsLeft / 60);
  const modSecs = modSecondsLeft % 60;

  const handleSubmitModification = () => {
    if (!modDesc.trim()) return;
    addOrderModification({
      orderId: order.orderId,
      customerName: "Customer",
      customerPhone: "+1 98765 00000",
      kitchenName: order.kitchenName,
      partnerName: "Kitchen Partner",
      modificationType: modType as any,
      description: modDesc.trim(),
    });
    toast.success("Modification request sent!", {
      description: "Our support team will process your change shortly.",
      duration: 4000,
    });
    setShowModifyDialog(false);
    setModDesc("");
    setModType("other");
  };

  const handleCancelOrder = () => {
    if (!cancelReason) {
      toast.error("Please select a reason for cancellation");
      return;
    }
    const reasonLabel = CANCELLATION_REASONS.find((r) => r.value === cancelReason)?.label || cancelReason;
    addCancellation({
      orderId: order.orderId,
      customerName: "Customer",
      reason: reasonLabel,
      reasonDetail: cancelReason === "other" ? cancelDetail : undefined,
      items: order.items.map((i) => ({ name: i.name, qty: i.qty })),
      orderTotal: order.total,
    });
    setIsCancelled(true);
    setShowCancelDialog(false);
    setCancelReason("");
    setCancelDetail("");
    toast.success("Order cancelled", {
      description: "Your refund will be processed within 2-3 business days. The kitchen has been notified.",
      duration: 5000,
    });
  };

  // Simulate live status progression
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveEta((prev) => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Simulate status advancement for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (order.currentStatus === "in_transit") {
        setOrder((prev) => ({
          ...prev,
          currentStatus: "near_destination" as TrackingStatus,
          events: [
            ...prev.events,
            {
              status: "near_destination" as TrackingStatus,
              label: "Almost There!",
              description: "Rider is near your location",
              timestamp: new Date().toISOString(),
              icon: "📍",
            },
          ],
        }));
        setLiveEta(3);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [order.currentStatus]);

  const currentMeta = statusMeta[order.currentStatus];
  const currentIdx = allStatuses.indexOf(order.currentStatus);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-28 container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Order ID & Partner Badge */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">Order #{order.orderId}</h1>
            <p className="text-xs text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: order.deliveryPartner.color }}
          >
            <span>{order.deliveryPartner.logo}</span>
            {order.deliveryPartner.name}
          </div>
        </div>

        {/* Live Status Card */}
        <section className="bg-card border border-border rounded-2xl p-5 mb-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">{order.events[order.events.length - 1]?.icon}</span>
              <div>
                <h2 className="font-bold text-foreground text-lg">{currentMeta.label}</h2>
                <p className="text-xs text-muted-foreground">{order.events[order.events.length - 1]?.description}</p>
              </div>
            </div>
            {order.currentStatus !== "delivered" && order.currentStatus !== "cancelled" && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{liveEta}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">min left</div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <Progress value={currentMeta.progress} className="h-2 mb-4" />

          {/* Status steps */}
          <div className="flex justify-between">
            {allStatuses.slice(0, -1).map((s, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-3 h-3 rounded-full border-2 transition-all ${
                      done ? "bg-primary border-primary" : "bg-background border-muted-foreground/30"
                    } ${active ? "ring-4 ring-primary/20 scale-125" : ""}`}
                  />
                  {i < 3 || i === allStatuses.length - 2 ? (
                    <span className="text-[9px] text-muted-foreground mt-1 text-center leading-tight">
                      {statusMeta[s].label.split(" ")[0]}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {/* 5-Minute Modification Window Banner */}
        {modWindowOpen && (
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Need to change something?</p>
                  <p className="text-[10px] text-muted-foreground">You can modify your order within the window</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary font-bold text-lg">
                  <Timer className="w-4 h-4" />
                  {modMinutes}:{modSecs.toString().padStart(2, "0")}
                </div>
                <p className="text-[9px] text-muted-foreground">remaining</p>
              </div>
            </div>
            <Button
              className="w-full mt-3 gap-2"
              variant="outline"
              onClick={() => setShowModifyDialog(true)}
            >
              <Edit3 className="w-4 h-4" /> Request Order Modification
            </Button>
          </section>
        )}

        {modSecondsLeft <= 0 && !isCancelled && ["order_placed", "order_confirmed", "preparing"].includes(order.currentStatus) && (
          <section className="bg-muted/50 border border-border rounded-2xl p-3 mb-5 text-center">
            <p className="text-xs text-muted-foreground">⏰ Modification window has closed. Contact support for changes.</p>
          </section>
        )}

        {/* Live Map Placeholder */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden mb-5 relative">
          <div className="h-48 bg-gradient-to-br from-accent/10 to-primary/5 flex items-center justify-center relative">
            {/* Simulated map with dots */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />
            {/* Kitchen marker */}
            <div className="absolute left-[25%] top-[40%] flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm shadow-lg">🏠</div>
              <span className="text-[9px] text-muted-foreground mt-0.5 bg-card/80 px-1 rounded">Kitchen</span>
            </div>
            {/* Rider marker (animated) */}
            <div className="absolute left-[55%] top-[35%] flex flex-col items-center animate-bounce">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm shadow-lg">🏍️</div>
              <span className="text-[9px] text-primary-foreground mt-0.5 bg-primary px-1.5 rounded-full font-bold">Rider</span>
            </div>
            {/* Delivery marker */}
            <div className="absolute right-[20%] top-[55%] flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-destructive/80 flex items-center justify-center text-sm shadow-lg">📍</div>
              <span className="text-[9px] text-muted-foreground mt-0.5 bg-card/80 px-1 rounded">You</span>
            </div>
            {/* Path line */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <line x1="30%" y1="45%" x2="57%" y2="40%" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
              <line x1="57%" y1="40%" x2="78%" y2="60%" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6 4" opacity="0.3" />
            </svg>
          </div>
          <div className="px-4 py-2 flex items-center justify-between border-t border-border">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Navigation className="w-3 h-3" /> Live tracking via {order.deliveryPartner.name} API
            </span>
            <span className="text-xs text-primary font-medium">View Full Map →</span>
          </div>
        </section>

        {/* Rider Card */}
        {order.rider && (
          <section className="bg-card border border-border rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                🏍️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{order.rider.name}</h3>
                  <span className="flex items-center gap-0.5 text-xs text-accent">
                    <Star className="w-3 h-3 fill-accent" /> {order.rider.rating}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {order.rider.vehicleNumber} · {order.rider.totalDeliveries.toLocaleString()} deliveries
                </p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors">
                  <Phone className="w-4 h-4 text-accent" />
                </button>
                <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>
            {/* OTP for handoff */}
            <div className="mt-3 flex items-center justify-between bg-secondary/50 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                Delivery OTP
              </div>
              <span className="text-lg font-bold tracking-[0.3em] text-foreground">{order.otp}</span>
            </div>
          </section>
        )}

        {/* Timeline */}
        <section className="bg-card border border-border rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Order Timeline
          </h2>
          <div className="space-y-0">
            {order.events.map((evt, i) => {
              const isLast = i === order.events.length - 1;
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isLast ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-secondary"}`}>
                      {evt.icon}
                    </div>
                    {!isLast && <div className="w-0.5 h-8 bg-border" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isLast ? "text-primary" : "text-foreground"}`}>{evt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{formatTime(evt.timestamp)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{evt.description}</p>
                  </div>
                </div>
              );
            })}
            {/* Future steps */}
            {allStatuses.slice(currentIdx + 1).map((s) => (
              <div key={s} className="flex gap-3 opacity-40">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-secondary border border-dashed border-muted-foreground/30">
                    ⏳
                  </div>
                  {s !== "delivered" && <div className="w-0.5 h-8 bg-border/50" />}
                </div>
                <div className="pb-4">
                  <span className="text-sm font-medium text-muted-foreground">{statusMeta[s].label}</span>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Order Summary (collapsible) */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
          <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground text-sm">Order Details</span>
              <span className="text-xs text-muted-foreground">({order.items.length} items)</span>
            </div>
            {showDetails ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showDetails && (
            <div className="px-4 pb-4 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {order.kitchenName}
              </p>
              <div className="space-y-2 mb-3">
                {order.items.map((itm, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-foreground">{itm.name} × {itm.qty}</span>
                    <span className="text-foreground font-medium">{formatPrice(itm.price * itm.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span><span>{formatPrice(order.deliveryFee)}</span></div>
                <div className="flex justify-between font-bold pt-1 border-t border-border"><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 inline mr-1" />
                {order.deliveryAddress}
              </div>
            </div>
          )}
        </section>

        {/* Order Delayed Report — visible after preset prep time expires */}
        {canReportDelay && !delayReported && (
          <section className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Order taking longer than expected?</p>
                <p className="text-[10px] text-muted-foreground">
                  Preparation time ({prepTimeMinutes} min) has been exceeded. Report the delay and we'll follow up immediately.
                </p>
              </div>
            </div>
            <Button
              className="w-full mt-3 gap-2"
              variant="destructive"
              onClick={handleReportDelay}
            >
              <AlertTriangle className="w-4 h-4" /> Report Order Delayed
            </Button>
          </section>
        )}

        {delayReported && (
          <section className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-5 text-center">
            <CheckCircle2 className="w-6 h-6 text-accent mx-auto mb-1" />
            <p className="text-sm font-semibold text-foreground">Delay Reported</p>
            <p className="text-[10px] text-muted-foreground">The kitchen and our support team have been notified.</p>
          </section>
        )}

        {/* Cancel Order */}
        {!isCancelled && order.currentStatus !== "delivered" && order.currentStatus !== "picked_up" && (
          <section className="mb-5">
            <button
              onClick={() => setShowCancelDialog(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors text-sm font-medium"
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          </section>
        )}

        {isCancelled && (
          <section className="mb-5 bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-center">
            <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm font-semibold text-destructive">Order Cancelled</p>
            <p className="text-xs text-muted-foreground mt-1">Refund will be processed within 2-3 business days</p>
          </section>
        )}

        {/* Help & Support */}
        <section className="bg-card border border-border rounded-2xl p-4">
          <h2 className="font-semibold text-foreground mb-3 text-sm">Need Help?</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-sm text-foreground">
              <Phone className="w-4 h-4 text-primary" /> Call Support
            </button>
            <button className="flex items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-sm text-foreground">
              <MessageCircle className="w-4 h-4 text-accent" /> Chat with Us
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {order.deliveryPartner.name} Support: {order.deliveryPartner.supportPhone}
          </p>
        </section>
      </main>

      {/* Order Modification Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Edit3 className="w-5 h-5" /> Modify Your Order
            </DialogTitle>
            <DialogDescription>
              Tell us what you'd like to change. Our team will process it immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="bg-muted/30 rounded-lg border border-border p-3">
              <p className="text-sm font-semibold text-foreground">Order #{order.orderId}</p>
              <p className="text-xs text-muted-foreground">{order.items.length} items · {formatPrice(order.total)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                <Timer className="w-3 h-3" /> {modMinutes}:{modSecs.toString().padStart(2, "0")} remaining
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">What would you like to change?</label>
              <Select value={modType} onValueChange={setModType}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_item">Add an item</SelectItem>
                  <SelectItem value="remove_item">Remove an item</SelectItem>
                  <SelectItem value="change_item">Swap / change an item</SelectItem>
                  <SelectItem value="change_qty">Change quantity</SelectItem>
                  <SelectItem value="cancel_item">Cancel a specific item</SelectItem>
                  <SelectItem value="other">Other change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Describe your change *</label>
              <Textarea
                value={modDesc}
                onChange={(e) => setModDesc(e.target.value)}
                placeholder="E.g., Please add 1 more Masala Dosa, or remove Raita from the order..."
                className="text-sm"
                rows={3}
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-primary font-medium">ℹ️ How it works</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Your request goes to our support team who will coordinate with the kitchen. Price adjustments (if any) will be communicated to you.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModifyDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitModification} disabled={!modDesc.trim()} className="gap-1">
              <Send className="w-4 h-4" /> Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Cancel Order
            </DialogTitle>
            <DialogDescription>
              Please tell us why you're cancelling. This helps us improve.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="bg-muted/30 rounded-lg border p-3">
              <p className="text-sm font-semibold text-foreground">Order #{order.orderId}</p>
              <p className="text-xs text-muted-foreground">{order.items.length} items · {formatPrice(order.total)}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-2 block">Why are you cancelling? *</label>
              <div className="space-y-1.5">
                {CANCELLATION_REASONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setCancelReason(r.value)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      cancelReason === r.value
                        ? "border-destructive bg-destructive/10 text-foreground font-medium"
                        : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {cancelReason === "other" && (
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Please describe *</label>
                <Textarea
                  value={cancelDetail}
                  onChange={(e) => setCancelDetail(e.target.value)}
                  placeholder="Tell us more about why you're cancelling..."
                  className="text-sm"
                  rows={3}
                />
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">💡 Refund Policy</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">
                If the kitchen has started preparing, a partial refund may apply. Full refund for orders not yet accepted.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Order</Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={!cancelReason || (cancelReason === "other" && !cancelDetail.trim())}
            >
              <XCircle className="w-4 h-4 mr-1" /> Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default OrderTracking;
