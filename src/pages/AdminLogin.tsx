import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowLeft } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import sheroLogo from "@/assets/shero-logo.png";
import mascotWelcome from "@/assets/shero-mascot-welcome.png";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const loginId = username.trim().toLowerCase();

    if (!loginId || !password.trim()) {
      setError("Username and password are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginId, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Invalid username or password.");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("shero-admin", "true");
      localStorage.setItem("shero-admin-role", data.role);
      localStorage.setItem("shero-admin-rem", data.username);
      localStorage.setItem("shero-admin-name", data.display_name);
      toast({ title: `✅ Logged in as ${data.display_name}` });
      navigate("/admin");
    } catch (err) {
      console.error("[AdminLogin] fetch error:", err);
      setError("Login failed. Please try again.");
    }

    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    // Password reset requires a Super Admin to update your credentials directly
    // in the database. Contact your Super Admin with this email address.
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
              {forgotSent ? "Contact your Super Admin to reset your password" : "Enter your email so we can identify your account"}
            </p>
          </div>

          {forgotSent ? (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Password reset for admin accounts must be done by a Super Admin. Please contact your Super Admin and provide the email address <strong className="text-foreground">{forgotEmail}</strong> to have your password reset.
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
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="superadmin"
              className="mt-1.5"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Password</label>
              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setForgotEmail(username.includes("@") ? username : "");
                }}
                className="text-xs text-primary hover:underline"
              >
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
