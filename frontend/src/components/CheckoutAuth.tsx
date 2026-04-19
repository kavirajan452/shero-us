import { useState } from "react";
import { Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

const DEV_LOGIN_PASSWORD = "123456";
type LoginStep = "phone" | "otp";

const phoneToEmail = (ph: string) => `${ph.replace(/\D/g, "").slice(-10)}@shero.dev`;

const CheckoutAuth = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<LoginStep>("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpPreview, setOtpPreview] = useState("");

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      toast({ title: "Enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/functions/v1/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      const result = await res.json();
      if (!res.ok || !result?.success) {
        toast({ title: "Error", description: result?.error || "Failed to send OTP", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      setOtpPreview(result.otp || "");
      setStep("otp");
      toast({ title: "OTP Sent!", description: result.otp ? `Dev OTP: ${result.otp}` : "OTP sent to your phone" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast({ title: "Enter 6-digit OTP", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const digits = phone.replace(/\D/g, "");
    try {
      const verifyRes = await fetch("/functions/v1/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits, code: otp }),
      });
      const verifyResult = await verifyRes.json();
      if (!verifyRes.ok || !verifyResult?.success) {
        toast({ title: "Invalid OTP", description: verifyResult?.error || "Verification failed", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const devEmail = phoneToEmail(phone);
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: DEV_LOGIN_PASSWORD,
      });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const userId = signInData?.user?.id;
      if (userId) {
        await supabase
          .from("profiles")
          .upsert({ user_id: userId, phone: digits.slice(-10), email: devEmail }, { onConflict: "user_id" });
        const { data: existingRoles } = await supabase
          .from("user_roles").select("id").eq("user_id", userId).eq("role", "customer");
        if (!existingRoles?.length) {
          await supabase.from("user_roles").insert({ user_id: userId, role: "customer" });
        }
      }

      toast({ title: "Logged in!", description: "You can now place your order." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <section className="bg-card border border-primary/20 rounded-2xl p-5 mb-5">
      <h2 className="font-semibold text-foreground mb-1 text-center">Login to Place Order</h2>
      <p className="text-xs text-muted-foreground text-center mb-4">Enter your phone number to receive an OTP</p>

      {step === "phone" && (
        <div className="space-y-3">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="+1 (___) ___-____"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10 h-11 rounded-xl"
              autoFocus
            />
          </div>
          <Button
            onClick={handleSendOtp}
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-gradient-shero hover:opacity-90 font-semibold gap-2"
          >
            {isSubmitting ? "Sending..." : "Send OTP"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              OTP sent to <span className="font-semibold text-foreground">{phone}</span>
            </p>
            <button
              onClick={() => { setStep("phone"); setOtp(""); setOtpPreview(""); }}
              className="text-xs text-primary hover:underline mt-1"
            >
              Change number
            </button>
          </div>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {otpPreview && (
            <p className="text-[10px] text-center text-muted-foreground">
              <ShieldCheck className="inline w-3 h-3 mr-1" /> Dev OTP:{" "}
              <span className="font-mono font-semibold">{otpPreview}</span>
            </p>
          )}
          <Button
            onClick={handleVerifyOtp}
            disabled={isSubmitting || otp.length < 6}
            className="w-full h-11 rounded-xl bg-gradient-shero hover:opacity-90 font-semibold gap-2"
          >
            {isSubmitting ? "Verifying..." : "Verify & Continue"} <ShieldCheck className="w-4 h-4" />
          </Button>
          <button
            onClick={handleSendOtp}
            disabled={isSubmitting}
            className="w-full text-center text-xs text-primary hover:underline"
          >
            Resend OTP
          </button>
        </div>
      )}
    </section>
  );
};

export default CheckoutAuth;
