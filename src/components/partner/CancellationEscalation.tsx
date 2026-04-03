import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Mail, Clock, ArrowUp, X } from "lucide-react";
import { toast } from "sonner";

interface CancellationEscalationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderType: "Subscription" | "Party" | "Service" | "Instant";
  orderLabel: string;
  orderDate: string;
}

const ESCALATION_CHAIN = [
  { role: "Cuisine Manager (OPS RM)", email: "cuisine.manager@shero.in", timing: "Instantly" },
  { role: "OPS Head", email: "ops.head@shero.in", timing: "If no response in 6 hours" },
  { role: "CEO", email: "ceo@shero.in", timing: "CC with OPS Head escalation" },
];

export default function CancellationEscalation({ open, onOpenChange, orderType, orderLabel, orderDate }: CancellationEscalationProps) {
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"confirm" | "escalation">("confirm");

  const handleCancel = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    setStep("escalation");
  };

  const handleConfirmEscalation = () => {
    toast.success("Cancellation submitted", {
      description: `Escalation email sent to Cuisine Manager instantly. Auto-escalation to OPS Head + CEO in 6 hours if unresolved.`,
      duration: 6000,
    });
    setStep("confirm");
    setReason("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setStep("confirm");
    setReason("");
    onOpenChange(false);
  };

  const typeColors: Record<string, string> = {
    Subscription: "bg-blue-100 text-blue-700 border-blue-300",
    Party: "bg-amber-100 text-amber-700 border-amber-300",
    Service: "bg-emerald-100 text-emerald-700 border-emerald-300",
    Instant: "bg-red-100 text-red-600 border-red-300",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Cancel Commitment
              </DialogTitle>
              <DialogDescription>
                This will trigger an escalation to the operations team.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{orderLabel}</p>
                  <p className="text-xs text-muted-foreground">{orderDate}</p>
                </div>
                <Badge className={`text-[10px] ${typeColors[orderType]}`}>{orderType}</Badge>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Reason for cancellation *</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Ingredients unavailable, family emergency, equipment issue..."
                  className="text-sm"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>Keep Order</Button>
              <Button variant="destructive" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" /> Cancel Order
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-destructive" />
                Escalation Preview
              </DialogTitle>
              <DialogDescription>
                The following escalation chain will be triggered immediately.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              {ESCALATION_CHAIN.map((esc, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${i === 0 ? "bg-red-50 border-red-200" : i === 1 ? "bg-amber-50 border-amber-200" : "bg-amber-50/50 border-amber-100"}`}>
                  <div className="mt-0.5">
                    {i === 0 ? <Mail className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{esc.role}</p>
                    <p className="text-[10px] text-muted-foreground">{esc.email}</p>
                    <Badge variant="outline" className="text-[9px] mt-1">
                      {esc.timing}
                    </Badge>
                  </div>
                  {i === 2 && <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-[9px]">CC</Badge>}
                </div>
              ))}

              <div className="p-2 rounded border bg-muted/20 mt-2">
                <p className="text-[10px] text-muted-foreground font-medium">Cancellation Reason:</p>
                <p className="text-xs text-foreground mt-0.5">{reason}</p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("confirm")}>Go Back</Button>
              <Button variant="destructive" onClick={handleConfirmEscalation}>
                Confirm & Escalate
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
