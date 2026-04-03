import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Home, Navigation, Truck, MessageCircle, Phone } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import mascotGreeting from "@/assets/shero-mascot-greeting.png";

const orderId = `SH${Date.now().toString().slice(-6)}`;

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const isPartyOrder = searchParams.get("type") === "party";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <img src={mascotGreeting} alt="Shero celebrates!" className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-md" />
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-serif font-bold text-foreground mb-3">
          {isPartyOrder ? "Order Received! 🎉" : "Order Placed! 🎉"}
        </h1>

        {isPartyOrder ? (
          <>
            <p className="text-muted-foreground mb-2">
              A confirmation has been sent to your phone. After delivery, you can download the invoice from your order history.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Order ID: #{orderId}
            </p>




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
              Your homemade meal is being prepared with love. You'll receive updates on your order status.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Order ID: #{orderId}
            </p>

            {/* Delivery Partner Assignment */}
            <div className="bg-card border border-border rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Delivery Partner Assigned</span>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                <span className="text-2xl">🟢</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">Dunzo</p>
                  <p className="text-xs text-muted-foreground">Rider will be assigned once food is ready</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to={`/order-tracking?id=${orderId}`}
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
