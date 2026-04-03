import { useState } from "react";
import { CreditCard, Smartphone, Building2, Link2, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export type PaymentMethod = "upi" | "card" | "bank" | "payment_link";

interface PaymentSectionProps {
  total: number;
  formatPrice: (n: number) => string;
  onPaymentSuccess: () => void;
  onPaymentFailure: (method: PaymentMethod) => void;
  disabled?: boolean;
  showPaymentLink?: boolean; // for admin flow
}

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "bank", label: "Net Banking", icon: Building2, desc: "All major banks supported" },
];

const PaymentSection = ({ total, formatPrice, onPaymentSuccess, onPaymentFailure, disabled, showPaymentLink }: PaymentSectionProps) => {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<"success" | "failed" | null>(null);

  const allMethods = showPaymentLink
    ? [...methods, { id: "payment_link" as PaymentMethod, label: "Payment Link", icon: Link2, desc: "Send payment link to customer" }]
    : methods;

  const handlePay = () => {
    if (!selected) return;
    setProcessing(true);
    setResult(null);
    // Mock payment – simulate 70% success
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setProcessing(false);
      setResult(success ? "success" : "failed");
      if (success) {
        setTimeout(() => onPaymentSuccess(), 800);
      } else {
        onPaymentFailure(selected);
      }
    }, 2000);
  };

  const canPay = selected && !processing && !result &&
    (selected === "upi" ? upiId.includes("@") :
     selected === "card" ? cardNumber.length >= 12 && cardExpiry && cardCvv.length >= 3 :
     selected === "bank" ? true :
     selected === "payment_link" ? true : false);

  return (
    <section className="bg-card border border-border rounded-2xl p-5 mb-5">
      <h2 className="font-semibold text-foreground mb-4">Payment</h2>

      {/* Method selection */}
      <div className="space-y-2 mb-4">
        {allMethods.map((m) => (
          <button
            key={m.id}
            onClick={() => { setSelected(m.id); setResult(null); }}
            disabled={disabled || processing}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              selected === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
            } disabled:opacity-50`}
          >
            <m.icon className={`w-5 h-5 ${selected === m.id ? "text-primary" : "text-muted-foreground"}`} />
            <div className="flex-1 text-left">
              <span className={`text-sm font-medium ${selected === m.id ? "text-primary" : "text-foreground"}`}>{m.label}</span>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Method-specific fields */}
      {selected === "upi" && (
        <div className="space-y-2 mb-4">
          <label className="text-xs font-medium text-muted-foreground">UPI ID</label>
          <input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@upi"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
      )}

      {selected === "card" && (
        <div className="space-y-2 mb-4">
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
            placeholder="Card Number"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm"
          />
          <div className="flex gap-2">
            <input
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
              placeholder="MM/YY"
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm"
            />
            <input
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="CVV"
              type="password"
              className="w-24 px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
        </div>
      )}

      {selected === "bank" && (
        <div className="mb-4 p-3 rounded-xl bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">You will be redirected to your bank's secure portal to complete the payment.</p>
        </div>
      )}

      {selected === "payment_link" && (
        <div className="mb-4 p-3 rounded-xl bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">A payment link will be generated and sent to the customer via SMS/WhatsApp.</p>
        </div>
      )}

      {/* Result */}
      {result === "success" && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent mb-4">
          <CheckCircle2 className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-accent">Payment Successful!</span>
        </div>
      )}
      {result === "failed" && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive mb-4">
          <XCircle className="w-5 h-5 text-destructive" />
          <div>
            <span className="text-sm font-medium text-destructive">Payment Failed</span>
            <p className="text-xs text-muted-foreground">Your order details have been saved. Try again or choose another method.</p>
          </div>
        </div>
      )}

      {/* Pay button */}
      {selected && !result && (
        <button
          onClick={handlePay}
          disabled={!canPay || disabled}
          className="w-full py-3.5 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-shero flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </>
          ) : (
            `Pay ${formatPrice(total)}`
          )}
        </button>
      )}

      {result === "failed" && (
        <button
          onClick={() => { setResult(null); setProcessing(false); }}
          className="w-full mt-2 py-3 rounded-2xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
        >
          Retry Payment
        </button>
      )}
    </section>
  );
};

export default PaymentSection;
