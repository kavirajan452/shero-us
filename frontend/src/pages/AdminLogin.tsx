'use client';
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowLeft } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import sheroLogo from "@/assets/shero-logo.png";
import mascotWelcome from "@/assets/shero-mascot-welcome.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AdminRole } from "@/data/adminRoles";

/**
 * Admin Login (hardened for Phase 2 · Task 4).
 *
 * - PRIMARY path: real Supabase authentication + `is_admin()` RPC check.
 * - DEV path   : legacy dummy credentials are only accepted when the
 *                `NEXT_PUBLIC_ENABLE_DEV_LOGIN` env flag is exactly
 *                the string "true".  In any other case the form refuses
 *                to fall back to localStorage-only login.
 * - AUDIT      : every attempt (success + failure) is written to the
 *                `public.login_audit` table (see migration
 *                20260420000000_phase2_task4_auth_rbac.sql).
 */
export default function AdminLogin() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get("next") || "/admin";
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const devLoginEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";

  // Dummy credentials for local testing only — never accepted in production.
  const DUMMY_CREDS: Record<
    string,
    { email: string; password: string; role: AdminRole; name: string }
  > = {
    admin:       { email: "admin@shero.in",      password: "admin123", role: "super_admin", name: "Admin User" },
    super_admin: { email: "superadmin@shero.in", password: "super123", role: "super_admin", name: "Super Admin" },
    ceo:         { email: "ceo@shero.in",        password: "ceo123",   role: "super_admin", name: "CEO" },
  };

  const recordAudit = async (params: {
    userId?: string | null;
    success: boolean;
    failureReason?: string;
    roleAtLogin?: AdminRole | null;
  }) => {
    try {
      await (supabase.from as any)("login_audit").insert({
        user_id: params.userId ?? null,
        email: email.trim().toLowerCase(),
        portal: "admin",
        role_at_login: params.roleAtLogin ?? null,
        success: params.success,
        failure_reason: params.failureReason ?? null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
    } catch {
      /* audit must never break login flow */
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // ── DEV-ONLY SHORTCUT ────────────────────────────────────────────
    if (devLoginEnabled) {
      const dummy = Object.values(DUMMY_CREDS).find(
        (c) => c.email === email.trim().toLowerCase() && c.password === password
      );
      if (dummy) {
        localStorage.setItem("shero-admin", "true");
        localStorage.setItem("shero-admin-role", dummy.role);
        localStorage.setItem("shero-admin-rem", dummy.email);
        localStorage.setItem("shero-admin-name", dummy.name);
        toast({ title: `✅ Logged in (dev) as ${dummy.name} (${dummy.role})` });
        setIsSubmitting(false);
        window.location.assign(next);
        return;
      }
    }

    // ── REAL SUPABASE AUTH ───────────────────────────────────────────
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !data?.user) {
      const message = authError?.message || "Login failed. Please try again.";
      setError(message);
      await recordAudit({ success: false, failureReason: message });
      setIsSubmitting(false);
      return;
    }

    const { data: isAdmin, error: rpcError } = await (supabase.rpc as any)("is_admin", {
      _user_id: data.user.id,
    });

    if (rpcError || !isAdmin) {
      const message = "You do not have admin access. Contact your administrator.";
      setError(message);
      await supabase.auth.signOut();
      await recordAudit({
        userId: data.user.id,
        success: false,
        failureReason: rpcError?.message || message,
      });
      setIsSubmitting(false);
      return;
    }

    // Resolve the user's primary admin role (super_admin > ... > asst_manager)
    const { data: primaryRole } = await (supabase.rpc as any)("get_primary_role", {
      _user_id: data.user.id,
    });

    const resolvedRole = (primaryRole as AdminRole) || "super_admin";

    localStorage.setItem("shero-admin", "true");
    localStorage.setItem("shero-admin-role", resolvedRole);
    localStorage.setItem("shero-admin-rem", email);
    localStorage.setItem(
      "shero-admin-name",
      data.user.user_metadata?.full_name || email
    );

    await recordAudit({
      userId: data.user.id,
      success: true,
      roleAtLogin: resolvedRole,
    });

    toast({ title: `✅ Welcome, ${data.user.user_metadata?.full_name || email}` });
    setIsSubmitting(false);
    window.location.assign(next);
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
      toast({
        title: "Failed to send reset email",
        description: error.message,
        variant: "destructive",
      });
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
                We've sent a password reset link to{" "}
                <strong className="text-foreground">{forgotEmail}</strong>. Please check your inbox.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowForgot(false);
                  setForgotSent(false);
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleForgotPassword}
              className="space-y-4 bg-card rounded-xl border border-border p-6"
            >
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
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
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
          <img
            src={mascotWelcome}
            alt="Shero mascot"
            className="w-20 h-20 object-contain mx-auto mb-3 drop-shadow-md"
          />
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
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="admin@shero.in"
              className="mt-1.5"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Password</label>
              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setForgotEmail(email);
                }}
                className="text-xs text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <PasswordInput
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              className="mt-1.5"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {devLoginEnabled && (
          <div className="mt-4 bg-card rounded-xl border border-dashed border-border p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Dev-login credentials (NEXT_PUBLIC_ENABLE_DEV_LOGIN=true)
            </p>
            <ul className="text-xs text-muted-foreground font-mono space-y-1">
              <li>superadmin@shero.in / SuperAdmin@123 — real Supabase (super_admin)</li>
              <li>admin@shero.in / admin123 — local dummy (super_admin)</li>
              <li>ceo@shero.in / ceo123 — local dummy (super_admin)</li>
            </ul>
          </div>
        )}

        <div className="mt-6 bg-card rounded-xl border border-border p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Note
          </p>
          <p className="text-xs text-muted-foreground">
            Admin accounts are created by the Super Admin. Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
