import { useState } from "react";
import { ArrowLeft, Phone, ArrowRight, User, Mail, Lock, ShieldCheck } from "lucide-react";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import sheroLogo from "@/assets/shero-logo.png";
import sheroWelcome from "@/assets/shero-mascot-welcome.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const DEV_LOGIN_PASSWORD = import.meta.env.VITE_DEV_LOGIN_PASSWORD || "123456";

type LoginStep = "phone" | "otp";
type SignupStep = "details" | "otp";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const role = searchParams.get("role") || "customer";

  // /login path → login mode, /register path → signup mode
  const isLoginPath = location.pathname === "/login";
  const isRegisterPath = location.pathname === "/register";
  const loginParam = searchParams.get("login") === "true";
  const defaultIsLogin = isLoginPath || (loginParam && !isRegisterPath);

  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login (Phone + OTP) state
  const [loginStep, setLoginStep] = useState<LoginStep>("phone");
  const [loginPhone, setLoginPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpPreview, setOtpPreview] = useState("");

  // Signup state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  // Signup OTP verification step
  const [signupStep, setSignupStep] = useState<SignupStep>("details");
  const [signupOtp, setSignupOtp] = useState("");
  const [signupOtpPreview, setSignupOtpPreview] = useState("");

  const isPartner = role === "partner";

  const themeAccent = isPartner
    ? "from-rose-100 via-rose-50 to-orange-50/60 dark:from-rose-950/40 dark:via-rose-900/20 dark:to-orange-950/10"
    : "from-teal-100 via-emerald-50 to-cyan-50/60 dark:from-teal-950/40 dark:via-emerald-900/20 dark:to-cyan-950/10";
  const themeBorder = isPartner ? "border-rose-200/80 dark:border-rose-800/30" : "border-teal-200/80 dark:border-teal-800/30";
  const themeBadge = isPartner ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300";

  const phoneToEmail = (ph: string) => {
    const digits = ph.replace(/\D/g, "").slice(-10);
    return `${digits}@shero.dev`;
  };

  const handleSendOtp = async () => {
    const digits = loginPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      toast({ title: "Enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const response = await fetch("/functions/v1/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: digits }),
    });
    const result = await response.json();
    if (!response.ok || !result?.success) {
      toast({ title: "Error", description: result?.error || "Failed to send OTP", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    setOtpPreview(result.otp || "");
    setIsSubmitting(false);
    setLoginStep("otp");
    toast({ title: "OTP Sent!", description: result.otp ? `Dev OTP: ${result.otp}` : "OTP sent successfully" });
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast({ title: "Enter 6-digit OTP", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const digits = loginPhone.replace(/\D/g, "");
    const verifyResponse = await fetch("/functions/v1/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: digits, code: otp, role: isPartner ? "partner" : "customer" }),
    });
    const verifyResult = await verifyResponse.json();
    if (!verifyResponse.ok || !verifyResult?.success) {
      setIsSubmitting(false);
      toast({ title: "Invalid OTP", description: verifyResult?.error || "Verification failed", variant: "destructive" });
      return;
    }

    const devEmail = phoneToEmail(loginPhone);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: DEV_LOGIN_PASSWORD,
    });

    setIsSubmitting(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }
    // Ensure profile and role exist for this user
    const userId = signInData?.user?.id;
    if (userId) {
      const digits = loginPhone.replace(/\D/g, "").slice(-10);
      await supabase
        .from("profiles")
        .upsert({ user_id: userId, phone: digits }, { onConflict: "user_id" });
      const roleToAssign = isPartner ? "partner" : "customer";
      const { data: existingRoles } = await supabase
        .from("user_roles").select("id").eq("user_id", userId).eq("role", roleToAssign);
      if (!existingRoles?.length) {
        await supabase.from("user_roles").insert({ user_id: userId, role: roleToAssign });
      }
    }
    toast({ title: "Logged in!", description: "Welcome back!" });
    navigate("/");
  };

  const upsertProfileAndRole = async (userId: string) => {
    const roleToAssign = isPartner ? "partner" : "customer";
    await supabase
      .from("profiles")
      .upsert(
        { user_id: userId, full_name: fullName, email, phone: phone || null },
        { onConflict: "user_id" }
      );
    const { data: existingRoles } = await supabase
      .from("user_roles").select("id").eq("user_id", userId).eq("role", roleToAssign);
    if (!existingRoles?.length) {
      await supabase.from("user_roles").insert({ user_id: userId, role: roleToAssign });
    }
  };

  const handleSignupSendOtp = async () => {
    if (!fullName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (!email.trim()) { toast({ title: "Email required", variant: "destructive" }); return; }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { toast({ title: "Enter a valid 10-digit phone number", variant: "destructive" }); return; }

    setIsSubmitting(true);
    const response = await fetch("/functions/v1/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: digits }),
    });
    const result = await response.json();
    setIsSubmitting(false);
    if (!response.ok || !result?.success) {
      toast({ title: "Error", description: result?.error || "Failed to send OTP", variant: "destructive" });
      return;
    }
    setSignupOtpPreview(result.otp || "");
    setSignupStep("otp");
    toast({ title: "OTP Sent!", description: result.otp ? `Dev OTP: ${result.otp}` : `OTP sent to ${phone}` });
  };

  const handleSignupVerifyOtp = async () => {
    if (signupOtp.length < 6) {
      toast({ title: "Enter 6-digit OTP", variant: "destructive" });
      return;
    }
    const digits = phone.replace(/\D/g, "");
    setIsSubmitting(true);
    const verifyResponse = await fetch("/functions/v1/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: digits,
        code: signupOtp,
        role: isPartner ? "partner" : "customer",
        fullName,
        email,
      }),
    });
    const verifyResult = await verifyResponse.json();
    if (!verifyResponse.ok || !verifyResult?.success) {
      setIsSubmitting(false);
      toast({ title: "Invalid OTP", description: verifyResult?.error || "Verification failed", variant: "destructive" });
      return;
    }
    const devEmail = phoneToEmail(phone);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: DEV_LOGIN_PASSWORD,
    });
    if (signInError) {
      setIsSubmitting(false);
      toast({ title: "Signup failed", description: signInError.message, variant: "destructive" });
      return;
    }
    const userId = signInData?.user?.id;
    if (userId) await upsertProfileAndRole(userId);
    setIsSubmitting(false);
    toast({ title: "Account created!", description: "Your account is verified and ready." });
    navigate("/");
  };

  // ─── SIGNUP FLOW ───
  if (!isLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b flex items-center justify-center px-4 py-8">
        <div className={`fixed inset-0 bg-gradient-to-b ${themeAccent} -z-10`} />
        <div className="w-full max-w-4xl flex gap-8 items-center">
          {/* Mascot — desktop only */}
          <div className="hidden lg:flex flex-col items-center w-64 shrink-0">
            <img src={sheroWelcome} alt="Shero welcomes you" className="w-56 h-auto drop-shadow-lg" />
            <p className="text-sm text-muted-foreground mt-3 text-center font-medium">Join the home-food revolution!</p>
          </div>
          <div className="flex-1 max-w-md mx-auto lg:mx-0">
          <Link to="/welcome" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className={`bg-card rounded-3xl border ${themeBorder} p-6 md:p-8 shadow-shero`}>
            <div className="text-center mb-6">
              <img src={sheroLogo} alt="Shero" className="h-12 mx-auto mb-3" />
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 ${themeBadge}`}>
                {isPartner ? "👩‍🍳 Partner / Service Provider" : "🍽️ Customer"}
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Create Account</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isPartner ? "Start your home business journey" : "Sign up to order food & services"}
              </p>
            </div>
            <div className="space-y-4">
              {signupStep === "details" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-medium">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="fullName" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10 h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-medium">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="phone" type="tel" placeholder="+1 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10 h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-medium">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-medium">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                      <PasswordInput id="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-12 rounded-xl" />
                    </div>
                  </div>
                  <Button onClick={handleSignupSendOtp} disabled={isSubmitting} className="w-full h-12 rounded-xl bg-gradient-shero hover:opacity-90 text-lg font-semibold gap-2">
                    {isSubmitting ? "Sending OTP..." : "Continue"} <ArrowRight className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <div className="space-y-5">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      OTP sent to <span className="font-semibold text-foreground">{phone}</span>
                    </p>
                    <button
                      onClick={() => { setSignupStep("details"); setSignupOtp(""); }}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      Change number
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Enter 6-digit OTP</Label>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={signupOtp} onChange={setSignupOtp}>
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
                    {signupOtpPreview && (
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        <ShieldCheck className="inline w-3 h-3 mr-1" />
                        Dev OTP: <span className="font-mono font-semibold">{signupOtpPreview}</span>
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleSignupVerifyOtp}
                    disabled={isSubmitting || signupOtp.length < 6}
                    className="w-full h-12 rounded-xl bg-gradient-shero hover:opacity-90 text-lg font-semibold gap-2"
                  >
                    {isSubmitting ? "Creating Account..." : "Verify & Create Account"} <ShieldCheck className="w-5 h-5" />
                  </Button>
                  <button
                    onClick={handleSignupSendOtp}
                    disabled={isSubmitting}
                    className="w-full text-center text-sm text-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-sm font-medium text-foreground opacity-50 cursor-not-allowed" disabled>
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="flex-1 py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-sm font-medium text-foreground opacity-50 cursor-not-allowed" disabled>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Apple
              </button>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => setIsLogin(true)} className="text-primary font-semibold hover:underline">Log In</button>
            </div>
            <div className="mt-3 text-center">
              <Link to={`/register?role=${isPartner ? "customer" : "partner"}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {isPartner ? "🍽️ Switch to Customer" : "👩‍🍳 Switch to Partner / Service Provider"}
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // ─── LOGIN FLOW (Phone + OTP) ───
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      <div className={`fixed inset-0 bg-gradient-to-b ${themeAccent} -z-10`} />
      <div className="w-full max-w-md">
        <Link to="/welcome" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className={`bg-card rounded-3xl border ${themeBorder} p-6 md:p-8 shadow-shero`}>
          <div className="text-center mb-6">
            <img src={sheroLogo} alt="Shero" className="h-12 mx-auto mb-3" />
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 ${themeBadge}`}>
              {isPartner ? "👩‍🍳 Partner / Service Provider" : "🍽️ Customer"}
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Welcome Back!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isPartner ? "Log in to your partner dashboard" : "Log in to order food & services"}
            </p>
          </div>

          {loginStep === "phone" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+1 XXXXX XXXXX"
                    value={loginPhone}
                    onChange={e => setLoginPhone(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    autoFocus
                  />
                </div>
              </div>
              <Button
                onClick={handleSendOtp}
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-shero hover:opacity-90 text-lg font-semibold gap-2"
              >
                {isSubmitting ? "Sending..." : "Send OTP"} <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  OTP sent to <span className="font-semibold text-foreground">{loginPhone}</span>
                </p>
                <button
                  onClick={() => { setLoginStep("phone"); setOtp(""); }}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Change number
                </button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Enter 6-digit OTP</Label>
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
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    <ShieldCheck className="inline w-3 h-3 mr-1" />
                    Dev OTP: <span className="font-mono font-semibold">{otpPreview}</span>
                  </p>
                )}
              </div>
              <Button
                onClick={handleVerifyOtp}
                disabled={isSubmitting || otp.length < 6}
                className="w-full h-12 rounded-xl bg-gradient-shero hover:opacity-90 text-lg font-semibold gap-2"
              >
                {isSubmitting ? "Verifying..." : "Verify & Log In"} <ShieldCheck className="w-5 h-5" />
              </Button>
              <button
                onClick={handleSendOtp}
                disabled={isSubmitting}
                className="w-full text-center text-sm text-primary hover:underline"
              >
                Resend OTP
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-sm font-medium text-foreground opacity-50 cursor-not-allowed" disabled>
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="flex-1 py-3 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-sm font-medium text-foreground opacity-50 cursor-not-allowed" disabled>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button onClick={() => setIsLogin(false)} className="text-primary font-semibold hover:underline">Sign Up</button>
          </div>

          <div className="mt-3 text-center">
            <Link to={`/login?role=${isPartner ? "customer" : "partner"}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {isPartner ? "🍽️ Switch to Customer" : "👩‍🍳 Switch to Partner / Service Provider"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
