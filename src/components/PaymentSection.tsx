import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export type PaymentMethod = "card" | "apple_pay" | "google_pay" | "ach" | "payment_link";

interface PaymentSectionProps {
  total: number;
  formatPrice: (n: number) => string;
  onPaymentSuccess: () => void | Promise<void>;
  onPaymentFailure: (method: PaymentMethod) => void;
  disabled?: boolean;
  showPaymentLink?: boolean;
}

const PaymentSection = ({ total, formatPrice, onPaymentSuccess, disabled }: PaymentSectionProps) => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const appMode = (import.meta.env.NEXT_PUBLIC_APP_MODE || import.meta.env.VITE_APP_MODE || import.meta.env.MODE || "dev").toLowerCase();
  const isLiveMode = appMode === "production" || appMode === "prod" || appMode === "live";

  const handlePay = async () => {
    setProcessing(true);
    setResult(null);
    setErrorMessage("");

    try {
      await onPaymentSuccess();
      setResult("success");
    } catch (err: any) {
      const msg = err?.message ?? err?.error_description ?? "Unable to place order. Please try again.";
      setErrorMessage(msg);
      setResult("error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-5 mb-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-foreground">Payment</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isLiveMode ? "Secure live payment gateway." : "Test mode payment simulation."} Click Pay Now to complete checkout.
          </p>
        </div>
        <span className="text-sm font-bold text-primary">{formatPrice(total)}</span>
      </div>

      {result === "success" && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent mb-4">
          <CheckCircle2 className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-foreground">Payment successful!</span>
        </div>
      )}

      {result === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 mb-4">
          <span className="text-sm font-medium text-destructive">{errorMessage}</span>
        </div>
      )}

      {result !== "success" && (
        <button
          onClick={handlePay}
          disabled={processing || disabled}
          className="w-full py-3.5 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-shero flex items-center justify-center gap-2"
        >
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Pay Now"}
        </button>
      )}
    </section>
  );
};

export default PaymentSection;
