'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChefHat, ArrowLeft } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import sheroLogo from '@/assets/shero-logo.png';
import mascotWelcome from '@/assets/shero-mascot-welcome.png';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Kitchen Partner login page.
 *
 * Authentication flow:
 *   1. supabase.auth.signInWithPassword({ email, password })
 *   2. verify the signed-in user has the `partner` role via the
 *      `is_partner` RPC (added in migration 20260420000000_phase2_task4_auth_rbac.sql)
 *   3. log attempt to `login_audit`
 *   4. redirect to ?next=<path> or /partner on success
 */
export default function PartnerLogin() {
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const next = search?.get('next') || '/partner';
  const devLogin = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true';

  // Only used when NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true'.  These are
  // throw-away local credentials for testing while the real Supabase
  // seed is being applied — they are NEVER used in production.
  const DEV_PARTNER_CREDS = {
    email: 'partner1@shero.in',
    password: 'Partner@123',
    name: 'Kitchen Partner One',
  } as const;

  const recordAudit = async (
    params: {
      userId?: string | null;
      success: boolean;
      failureReason?: string;
      roleAtLogin?: string | null;
    },
  ) => {
    try {
      await (supabase.from as any)('login_audit').insert({
        user_id: params.userId ?? null,
        email: email.trim().toLowerCase(),
        portal: 'partner',
        role_at_login: params.roleAtLogin ?? null,
        success: params.success,
        failure_reason: params.failureReason ?? null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });
    } catch {
      // Audit failure must never block login flow.
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Dev-login shortcut (only when explicitly enabled)
    if (
      devLogin &&
      email.trim().toLowerCase() === DEV_PARTNER_CREDS.email &&
      password === DEV_PARTNER_CREDS.password
    ) {
      localStorage.setItem('shero-partner', 'true');
      localStorage.setItem('shero-partner-email', DEV_PARTNER_CREDS.email);
      localStorage.setItem('shero-partner-name', DEV_PARTNER_CREDS.name);
      toast({ title: `✅ Logged in (dev) as ${DEV_PARTNER_CREDS.name}` });
      setSubmitting(false);
      window.location.assign(next);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !data?.user) {
      const message = authError?.message || 'Invalid credentials';
      setError(message);
      await recordAudit({ success: false, failureReason: message });
      setSubmitting(false);
      return;
    }

    const { data: isPartner, error: rpcError } = await (supabase.rpc as any)('is_partner', {
      _user_id: data.user.id,
    });

    if (rpcError || !isPartner) {
      const message = 'This account is not registered as a kitchen partner.';
      setError(message);
      await supabase.auth.signOut();
      await recordAudit({
        userId: data.user.id,
        success: false,
        failureReason: message,
      });
      setSubmitting(false);
      return;
    }

    localStorage.setItem('shero-partner', 'true');
    localStorage.setItem('shero-partner-email', email);
    localStorage.setItem('shero-partner-name', data.user.user_metadata?.full_name || email);

    await recordAudit({
      userId: data.user.id,
      success: true,
      roleAtLogin: 'partner',
    });

    toast({ title: '✅ Welcome back, Partner!' });
    setSubmitting(false);
    window.location.assign(next);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast({ title: 'Please enter your email', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (resetError) {
      toast({
        title: 'Failed to send reset email',
        description: resetError.message,
        variant: 'destructive',
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
              {forgotSent
                ? 'Check your email for a reset link'
                : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {forgotSent ? (
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to{' '}
                <strong className="text-foreground">{forgotEmail}</strong>.
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
            <form onSubmit={handleForgot} className="space-y-4 bg-card rounded-xl border border-border p-6">
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="partner@shero.in"
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Reset Link'}
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
            <ChefHat className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Partner Portal</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your kitchen & orders
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-card rounded-xl border border-border p-6">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="partner@shero.in"
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
                setError('');
              }}
              placeholder="••••••••"
              className="mt-1.5"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        {devLogin && (
          <div className="mt-4 bg-card rounded-xl border border-dashed border-border p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Dev-login credentials
            </p>
            <p className="text-xs text-muted-foreground font-mono break-all">
              partner1@shero.in&nbsp;/&nbsp;Partner@123
            </p>
          </div>
        )}

        <div className="mt-6 bg-card rounded-xl border border-border p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Not a partner yet?
          </p>
          <p className="text-xs text-muted-foreground">
            Apply at{' '}
            <a href="/partner-enrollment" className="text-primary hover:underline">
              /partner-enrollment
            </a>
            . Your account is created after the onboarding team approves.
          </p>
        </div>
      </div>
    </div>
  );
}
