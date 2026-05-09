import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DemoPaymentModalProps = {
  open: boolean;
  amount: number;
  formatPrice: (value: number) => string;
  onOpenChange: (open: boolean) => void;
  onSuccess: (result: { success: true; transactionId: string }) => Promise<void> | void;
  onFailure: (result: { success: false; message: string }) => Promise<void> | void;
};

const DemoPaymentModal = ({ open, amount, formatPrice, onOpenChange, onSuccess, onFailure }: DemoPaymentModalProps) => {
  const [processing, setProcessing] = useState<"success" | "failure" | null>(null);

  const handleSuccess = async () => {
    setProcessing("success");
    try {
      await onSuccess({
        success: true,
        transactionId: `demo_txn_${Date.now()}`,
      });
      onOpenChange(false);
    } finally {
      setProcessing(null);
    }
  };

  const handleFailure = async () => {
    setProcessing("failure");
    try {
      await onFailure({
        success: false,
        message: "Payment failed",
      });
      onOpenChange(false);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Demo Payment</DialogTitle>
          <DialogDescription>
            Simulate payment for <span className="font-semibold text-foreground">{formatPrice(amount)}</span>.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:space-x-0">
          <Button variant="outline" onClick={handleFailure} disabled={!!processing}>
            {processing === "failure" ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : "Simulate Failure"}
          </Button>
          <Button onClick={handleSuccess} disabled={!!processing}>
            {processing === "success" ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : "Simulate Success"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DemoPaymentModal;
