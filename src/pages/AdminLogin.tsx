import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowLeft } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import sheroLogo from "@/assets/shero-logo.png";
import mascotWelcome from "@/assets/shero-mascot-welcome.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dummy credentials for testing (bypass real auth)
  const DUMMY_CREDS = {
    admin: { email: "admin@shero.in", password: "admin123", role: "super_admin", name: "Admin User" },
    super_admin: { email: "superadmin@shero.in", password: "super123", role: "super_admin", name: "Super Admin" },
    ceo: { email: "ceo@shero.in", password: "ceo123", role: "super_admin", name: "CEO" },
  } as const;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Check dummy credentials first (testing mode)
    const dummyMatch = Object.values(DUMMY_CREDS).find(
      (c) => c.email === email.trim().toLowerCase() && c.password === password
    );

    if (dummyMatch) {
      localStorage.setItem("shero-admin", "true");
      localStorage.setItem("shero-admin-role", dummyMatch.role);
      localStorage.setItem("shero-admin-rem", dummyMatch.email);
      localStorage.setItem("shero-admin-name", dummyMatch.name);

      // Also grant admin role in DB for the current Supabase session user (so RLS works)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from("user_roles")
          .upsert(
            { user_id: session.user.id, role: dummyMatch.role },
            { onConflict: "user_id,role" }
          );
      }

      toast({ title: `✅ Logged in as ${dummyMatch.name} (${dummyMatch.role})` });
      setIsSubmitting(false);
      navigate("/admin");
      return;
    }

    // Fallback to real Supabase auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    if (!data.user) {
      setError("Login failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: data.user.id });

    if (!isAdmin) {
      setError("You do not have admin access. Contact your administrator.");
      await supabase.auth.signOut();
      setIsSubmitting(false);
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const adminRole = roles?.find(r => r.role !== "customer" && r.role !== "partner");

    if (adminRole) {
      localStorage.setItem("shero-admin", "true");
      localStorage.setItem("shero-admin-role", adminRole.role);
      localStorage.setItem("shero-admin-rem", email);
      localStorage.setItem("shero-admin-name", data.user.user_metadata?.full_name || email);
    }

    setIsSubmitting(false);
    navigate("/admin");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Failed to send reset email", description: error.message, variant: "destructive" });
      return;
    }
    setForgotSent(true);
  };

  if (showForgot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src={sheroLogo} alt="Shero" className="h-10 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {forgotSent ? "Check your email for a reset link" : "Enter your email to receive a reset link"}
            </p>
          </div>

          {forgotSent ? (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong className="text-foreground">{forgotEmail}</strong>. Please check your inbox.
              </p>
              <Button variant="outline" className="w-full" onClick={() => { setShowForgot(false); setForgotSent(false); }}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 bg-card rounded-xl border border-border p-6">
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@shero.in"
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
              <button type="button" onClick={() => setShowForgot(false)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={sheroLogo} alt="Shero" className="h-10 mx-auto mb-3" />
          <img src={mascotWelcome} alt="Shero mascot" className="w-20 h-20 object-contain mx-auto mb-3 drop-shadow-md" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Admin Portal</h1>
          </div>
          <p className="text-sm text-muted-foreground">Sign in with your admin credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-card rounded-xl border border-border p-6">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="admin@shero.in"
              className="mt-1.5"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Password</label>
              <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(email); }} className="text-xs text-primary hover:underline">
                Forgot Password?
              </button>
            </div>
            <PasswordInput
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              className="mt-1.5"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 bg-card rounded-xl border border-border p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Note</p>
          <p className="text-xs text-muted-foreground">
            Admin accounts are created by the Super Admin. Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}