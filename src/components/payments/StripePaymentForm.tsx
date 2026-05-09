import { useMemo, useState } from "react";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type StripePaymentFormProps = {
  clientSecret: string;
  amount: number;
  formatPrice: (value: number) => string;
  onSuccess: (result: { paymentIntentId: string }) => Promise<void> | void;
  onFailure: (result: { message: string }) => Promise<void> | void;
};

const cardElementStyle = {
  style: {
    base: {
      fontSize: "16px",
      color: "#111827",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
    },
  },
};

const StripePaymentInner = ({ clientSecret, amount, formatPrice, onSuccess, onFailure }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Card details are required.");
      setIsSubmitting(false);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (result.error) {
      const message = result.error.message ?? "Payment failed";
      setErrorMessage(message);
      await onFailure({ message });
      setIsSubmitting(false);
      return;
    }

    if (!result.paymentIntent) {
      const message = "Unable to confirm payment.";
      setErrorMessage(message);
      await onFailure({ message });
      setIsSubmitting(false);
      return;
    }

    await onSuccess({ paymentIntentId: result.paymentIntent.id });
    setIsSubmitting(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Stripe Payment</h3>
        <span className="text-sm font-bold text-primary">{formatPrice(amount)}</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-border bg-background p-3">
          <CardElement options={cardElementStyle} />
        </div>
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
        <Button type="submit" disabled={!stripe || isSubmitting} className="w-full">
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : "Pay Securely"}
        </Button>
      </form>
    </div>
  );
};

const StripePaymentForm = (props: StripePaymentFormProps) => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (!publishableKey || !stripePromise) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable Stripe mode.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret }}>
      <StripePaymentInner {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
