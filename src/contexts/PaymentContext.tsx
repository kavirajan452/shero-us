import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type PaymentMode = "demo" | "stripe";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "refunded";

type PaymentState = {
  isProcessing: boolean;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  setIsProcessing: (value: boolean) => void;
  setPaymentMode: (value: PaymentMode) => void;
  setPaymentStatus: (value: PaymentStatus) => void;
  resetPaymentState: () => void;
};

const getInitialPaymentMode = (): PaymentMode => {
  const envMode = (process.env.NEXT_PUBLIC_PAYMENT_MODE ?? "demo").toLowerCase();
  return envMode === "stripe" ? "stripe" : "demo";
};

const PaymentContext = createContext<PaymentState | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(getInitialPaymentMode());
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");

  const value = useMemo(
    () => ({
      isProcessing,
      paymentMode,
      paymentStatus,
      setIsProcessing,
      setPaymentMode,
      setPaymentStatus,
      resetPaymentState: () => {
        setIsProcessing(false);
        setPaymentMode(getInitialPaymentMode());
        setPaymentStatus("pending");
      },
    }),
    [isProcessing, paymentMode, paymentStatus],
  );

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within PaymentProvider");
  }
  return context;
};
