import { useState } from "react";
import { CreditCard, Smartphone, Landmark, Wallet, Link2, CheckCircle2, Loader2 } from "lucide-react";

export type PaymentMethod = "card" | "apple_pay" | "google_pay" | "ach" | "payment_link";

interface PaymentSectionProps {
  total: number;
  formatPrice: (n: number) => string;
  onPaymentSuccess: () => void;
  onPaymentFailure: (method: PaymentMethod) => void;
  disabled?: boolean;
  showPaymentLink?: boolean;
}

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, Amex & Discover" },
  { id: "apple_pay", label: "Apple Pay", icon: Smartphone, desc: "Pay quickly with Apple Pay" },
  { id: "google_pay", label: "Google Pay", icon: Smartphone, desc: "Pay quickly with Google Pay" },
  { id: "ach", label: "Bank Transfer (ACH)", icon: Landmark, desc: "Direct payment from your bank account" },
];

const PaymentSection = ({ total, formatPrice, onPaymentSuccess, disabled, showPaymentLink }: PaymentSectionProps) => {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<"success" | null>(null);

  const allMethods = showPaymentLink
    ? [...methods, { id: "payment_link" as PaymentMethod, label: "Payment Link", icon: Link2, desc: "Send a payment link to complete later" }]
    : methods;

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handlePay = () => {
    if (!selected) return;
    setProcessing(true);
    setResult(null);

    setTimeout(() => {
      setProcessing(false);
      setResult("success");
      setTimeout(() => onPaymentSuccess(), 500);
    }, 1200);
  };

  const canPay =
    selected &&
    !processing &&
    !result &&
    (selected === "card"
      ? cardNumber.replace(/\s/g, "").length >= 15 && !!cardExpiry && cardCvv.length >= 3 && cardZip.length >= 5
      : selected === "apple_pay" || selected === "google_pay" || selected === "ach" || selected === "payment_link");

  return (
    <section className="bg-card border border-border rounded-2xl p-5 mb-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-foreground">Payment</h2>
          <p className="text-xs text-muted-foreground mt-1">Demo payment flow for testing the full order journey.</p>
        </div>
        <span className="text-sm font-bold text-primary">{formatPrice(total)}</span>
      </div>

      <div className="space-y-2 mb-4">
        {allMethods.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setSelected(m.id);
              setResult(null);
            }}
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

      {selected === "card" && (
        <div className="space-y-2 mb-4">
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm tracking-wider"
          />
          <div className="flex gap-2">
            <input
              value={cardExpiry}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                setCardExpiry(v);
              }}
              placeholder="MM/YY"
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm"
            />
            <input
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="CVV"
              type="password"
              className="w-20 px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm"
            />
            <input
              value={cardZip}
              onChange={(e) => setCardZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="ZIP"
              className="w-20 px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Dummy secure card flow for preview only.</p>
        </div>
      )}

      {(selected === "apple_pay" || selected === "google_pay") && (
        <div className="mb-4 p-3 rounded-xl bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">
            {selected === "apple_pay"
              ? "Apple Pay will prompt for Face ID / Touch ID in a real integration. This dummy flow completes instantly."
              : "Google Pay will launch the GPay sheet in a real integration. This dummy flow completes instantly."}
          </p>
        </div>
      )}

      {selected === "ach" && (
        <div className="mb-4 p-3 rounded-xl bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">Bank transfer (ACH) selection is mocked here so the end-to-end order flow works reliably.</p>
        </div>
      )}

      {selected === "payment_link" && (
        <div className="mb-4 p-3 rounded-xl bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">A mock payment link will be generated in this demo flow.</p>
        </div>
      )}

      {result === "success" && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent mb-4">
          <CheckCircle2 className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-foreground">Payment successful!</span>
        </div>
      )}

      {selected && !result && (
        <button
          onClick={handlePay}
          disabled={!canPay || disabled}
          className="w-full py-3.5 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-shero flex items-center justify-center gap-2"
        >
          {processing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            `Pay ${formatPrice(total)}`
          )}
        </button>
      )}
    </section>
  );
};

export default PaymentSection;
