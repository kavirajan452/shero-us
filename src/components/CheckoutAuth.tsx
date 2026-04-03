import { useState } from "react";
import { Mail, Lock, Phone, User, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/PasswordInput";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "signup" | "login";

const CheckoutAuth = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signup state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleSignup = async () => {
    if (!fullName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (!email.trim()) { toast({ title: "Email required", variant: "destructive" }); return; }
    if (!password || password.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone || undefined },
        emailRedirectTo: window.location.origin,
      },
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Account created!", description: "You can now place your order." });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Logged in!", description: "You can now place your order." });
  };

  return (
    <section className="bg-card border border-primary/20 rounded-2xl p-5 mb-5">
      <h2 className="font-semibold text-foreground mb-1 text-center">
        {mode === "signup" ? "Create Account to Place Order" : "Login to Place Order"}
      </h2>
      <p className="text-xs text-muted-foreground text-center mb-4">
        {mode === "signup" ? "Quick sign up to complete your order" : "Welcome back! Log in to continue"}
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
          onClick={() => setMode("login")}
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
            <Input type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10 h-11 rounded-xl" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-11 rounded-xl" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <PasswordInput placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-11 rounded-xl" />
          </div>
          <Button onClick={handleSignup} disabled={isSubmitting} className="w-full h-11 rounded-xl bg-gradient-shero hover:opacity-90 font-semibold gap-2">
            {isSubmitting ? "Creating..." : "Create Account"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ─── LOGIN ─── */}
      {mode === "login" && (
        <form onSubmit={handleLoginSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" placeholder="your@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="pl-10 h-11 rounded-xl" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <PasswordInput placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="pl-10 h-11 rounded-xl" />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl bg-gradient-shero hover:opacity-90 font-semibold">
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>
      )}
    </section>
  );
};

export default CheckoutAuth;
