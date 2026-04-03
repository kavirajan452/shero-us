import { useState } from "react";
import { Phone, ArrowRight, User, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

const DEV_OTP = "123456";
type AuthMode = "signup" | "login";
type LoginStep = "phone" | "otp";

const CheckoutAuth = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signup state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Login state
  const [loginStep, setLoginStep] = useState<LoginStep>("phone");
  const [loginPhone, setLoginPhone] = useState("");
  const [otp, setOtp] = useState("");

  const phoneToEmail = (ph: string) => {
    const digits = ph.replace(/\D/g, "").slice(-10);
    return `${digits}@shero.phone`;
  };

  const handleSignup = async () => {
    if (!fullName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (!email.trim()) { toast({ title: "Email required", variant: "destructive" }); return; }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) { toast({ title: "Valid phone number required", variant: "destructive" }); return; }

    setIsSubmitting(true);
    try {
      // Try signup first
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password: DEV_OTP,
        options: {
          data: { full_name: fullName, phone: phone.replace(/\D/g, "") },
          emailRedirectTo: window.location.origin,
        },
      });

      if (signupError && !signupError.message.toLowerCase().includes("already")) {
        toast({ title: "Signup failed", description: signupError.message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      // Auto-login after signup (works for both new and existing accounts)
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password: DEV_OTP });
      if (loginError) {
        toast({ title: "Login failed", description: loginError.message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      toast({ title: "Welcome!", description: "You can now place your order." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleSendOtp = async () => {
    const digits = loginPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      toast({ title: "Enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const devEmail = phoneToEmail(loginPhone);
      // Ensure account exists (idempotent)
      await supabase.auth.signUp({
        email: devEmail,
        password: DEV_OTP,
        options: { data: { phone: digits }, emailRedirectTo: window.location.origin },
      });
      setLoginStep("otp");
      toast({ title: "OTP Sent!", description: `Dev OTP: ${DEV_OTP}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { toast({ title: "Enter 6-digit OTP", variant: "destructive" }); return; }
    setIsSubmitting(true);
    try {
      const devEmail = phoneToEmail(loginPhone);
      const { error } = await supabase.auth.signInWithPassword({ email: devEmail, password: DEV_OTP });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      toast({ title: "Logged in!", description: "You can now place your order." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <section className="bg-card border border-primary/20 rounded-2xl p-5 mb-5">
      <h2 className="font-semibold text-foreground mb-1 text-center">
        {mode === "signup" ? "Create Account to Place Order" : "Login to Place Order"}
      </h2>
      <p className="text-xs text-muted-foreground text-center mb-4">
        {mode === "signup" ? "Quick sign up to complete your order" : "Welcome back! Log in with OTP"}
      </p>

      {/* Mode toggle */}
      <div className="flex rounded-xl bg-secondary p-1 mb-5">
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          Sign Up
        </button>
        <button
          onClick={() => { setMode("login"); setLoginStep("phone"); setOtp(""); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          Log In
        </button>
      </div>

      {/* ─── SIGNUP ─── */}
      {mode === "signup" && (
        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10 h-11 rounded-xl" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="tel" placeholder="+1 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10 h-11 rounded-xl" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-11 rounded-xl" />
          </div>
          <Button onClick={handleSignup} disabled={isSubmitting} className="w-full h-11 rounded-xl bg-gradient-shero hover:opacity-90 font-semibold gap-2">
            {isSubmitting ? "Creating..." : "Create Account"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ─── LOGIN (Phone + OTP) ─── */}
      {mode === "login" && loginStep === "phone" && (
        <div className="space-y-3">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="tel" placeholder="+1 XXXXX XXXXX" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} className="pl-10 h-11 rounded-xl" autoFocus />
          </div>
          <Button onClick={handleSendOtp} disabled={isSubmitting} className="w-full h-11 rounded-xl bg-gradient-shero hover:opacity-90 font-semibold gap-2">
            {isSubmitting ? "Sending..." : "Send OTP"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {mode === "login" && loginStep === "otp" && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              OTP sent to <span className="font-semibold text-foreground">{loginPhone}</span>
            </p>
            <button onClick={() => { setLoginStep("phone"); setOtp(""); }} className="text-xs text-primary hover:underline mt-1">
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
          <p className="text-[10px] text-center text-muted-foreground">
            <ShieldCheck className="inline w-3 h-3 mr-1" /> Dev OTP: <span className="font-mono font-semibold">123456</span>
          </p>
          <Button onClick={handleVerifyOtp} disabled={isSubmitting || otp.length < 6} className="w-full h-11 rounded-xl bg-gradient-shero hover:opacity-90 font-semibold gap-2">
            {isSubmitting ? "Verifying..." : "Verify & Continue"} <ShieldCheck className="w-4 h-4" />
          </Button>
          <button onClick={handleSendOtp} disabled={isSubmitting} className="w-full text-center text-xs text-primary hover:underline">
            Resend OTP
          </button>
        </div>
      )}
    </section>
  );
};

export default CheckoutAuth;
