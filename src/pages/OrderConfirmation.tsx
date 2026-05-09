import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Home, Navigation, Truck, CalendarClock, Clock, FileText, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import mascotGreeting from "@/assets/shero-mascot-greeting.png";
import { sendOrderConfirmationWhatsApp, shareViaWhatsApp, buildOrderConfirmationMessage } from "@/utils/whatsapp";
import { useRegion } from "@/contexts/RegionContext";
import { Button } from "@/components/ui/button";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || `SH${Date.now().toString().slice(-6)}`;
  const isPartyOrder = searchParams.get("type") === "party";
  const deliverySlot = searchParams.get("slot") || "";
  const customerName = searchParams.get("name") || "Customer";
  const total = searchParams.get("total") || "0";
  const customerPhone = searchParams.get("phone") || "";
  const eventDate = searchParams.get("eventDate") || "";
  const guestCount = parseInt(searchParams.get("guests") || "0");
  const paymentStatus = searchParams.get("paymentStatus") || "pending";
  const paymentMode = searchParams.get("paymentMode") || "demo";
  const transactionId = searchParams.get("transactionId") || "";

  const handleShareWhatsApp = () => {
    const message = buildOrderConfirmationMessage({
      orderId,
      orderType: isPartyOrder ? "party" : "instant",
      customerName,
      total: `$${total}`,
      deliverySlot,
      eventDate,
      guestCount,
    });
    shareViaWhatsApp(message);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <img src={mascotGreeting} alt="Shero celebrates!" className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-md" />
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-serif font-bold text-foreground mb-3">
          {isPartyOrder ? "Order Received! 🎉" : "Order Confirmed! 🎉"}
        </h1>

        {isPartyOrder ? (
          <>
            <p className="text-muted-foreground mb-2">
              A confirmation has been sent to your phone. After delivery, you can download the invoice from your order history.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Order ID: #{orderId}
            </p>
            
            {/* WhatsApp Confirmation */}
            <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-3 mb-4">
              <p className="text-xs text-muted-foreground mb-2">📲 Get order updates on WhatsApp</p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
                onClick={handleShareWhatsApp}
              >
                <MessageCircle className="w-4 h-4" /> Share on WhatsApp
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
              >
                <Home className="w-5 h-5" /> Back to Home
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mb-2">
              Your homemade meal has been scheduled! Our Shero partner will freshly prepare it closer to your delivery time.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Order ID: #{orderId}
            </p>
            <div className="bg-card border border-border rounded-2xl p-4 mb-4 text-left space-y-2">
              <p className="text-xs text-muted-foreground">
                Payment: <span className="font-semibold text-foreground">{paymentStatus.toUpperCase()}</span> ({paymentMode})
              </p>
              {transactionId && (
                <p className="text-xs text-muted-foreground break-all">
                  Transaction ID: <span className="font-medium text-foreground">{transactionId}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">Estimated delivery: 35-55 mins based on your selected slot.</p>
            </div>

            {/* Scheduled Delivery Details */}
            <div className="bg-card border border-border rounded-2xl p-4 mb-4 text-left space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <CalendarClock className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Scheduled Delivery</span>
              </div>
              {deliverySlot && (
                <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-3">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{deliverySlot}</p>
                    <p className="text-xs text-muted-foreground">Freshly prepared & delivered to your door</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    A delivery partner will be assigned closer to your slot. You'll be notified when your meal is on its way.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-accent/5 border border-accent/20 rounded-xl p-3">
                <FileText className="w-4 h-4 text-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    📄 Invoice will be available for download from <span className="font-medium text-foreground">Profile → Orders</span> after your meal is delivered.
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Confirmation */}
            <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-3 mb-4">
              <p className="text-xs text-muted-foreground mb-2">📲 Get real-time order updates on WhatsApp</p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
                onClick={handleShareWhatsApp}
              >
                <MessageCircle className="w-4 h-4" /> Share on WhatsApp
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to={`/order-tracking?orderId=${orderId}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-shero"
              >
                <Navigation className="w-5 h-5" /> Track Your Order
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
              >
                <Home className="w-5 h-5" /> Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default OrderConfirmation;
