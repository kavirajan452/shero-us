'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import type { AdminRole } from '@/data/adminRoles';

type RequireAuthProps = {
  children: React.ReactNode;
  /** Which portal this guard protects.  Drives redirect target + role check. */
  portal: 'admin' | 'partner';
  /** Optional — only allow these specific admin roles (for fine-grained pages). */
  allowedRoles?: AdminRole[];
  /** Optional override for the login path (defaults to /<portal>/login). */
  loginPath?: string;
  /** Bypass supabase — used when dev-login localStorage flag is active. */
  allowDevLocalStorage?: boolean;
};

/**
 * Client-side route guard.  Blocks rendering until the user is verified
 * to have the required role for the portal.  If the check fails, the
 * user is redirected to the matching login page with ?next=<current-path>.
 */
const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  portal,
  allowedRoles,
  loginPath,
  allowDevLocalStorage = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'checking' | 'authorised' | 'blocked'>('checking');

  useEffect(() => {
    let alive = true;
    const check = async () => {
      // Dev-only localStorage bypass (only honoured when the env toggle is ON
      // AND the caller opts into it).
      const devLoginEnabled =
        process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true' && allowDevLocalStorage;
      if (devLoginEnabled) {
        if (portal === 'admin' && localStorage.getItem('shero-admin') === 'true') {
          if (alive) setStatus('authorised');
          return;
        }
        if (portal === 'partner' && localStorage.getItem('shero-partner') === 'true') {
          if (alive) setStatus('authorised');
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (alive) {
          setStatus('blocked');
          if (typeof window !== 'undefined') {
            window.location.replace(
              `${loginPath ?? `/${portal}/login`}?next=${encodeURIComponent(pathname || `/${portal}`)}`,
            );
          } else {
            router.replace(
              `${loginPath ?? `/${portal}/login`}?next=${encodeURIComponent(pathname || `/${portal}`)}`,
            );
          }
        }
        return;
      }

      if (portal === 'admin') {
        const { data: isAdmin } = await (supabase.rpc as any)('is_admin', {
          _user_id: session.user.id,
        });
        if (!isAdmin) {
          if (alive) {
            setStatus('blocked');
            if (typeof window !== 'undefined') {
              window.location.replace(`/admin/login?next=${encodeURIComponent(pathname || '/admin')}`);
            }
          }
          return;
        }
        if (allowedRoles && allowedRoles.length > 0) {
          const { data: primary } = await (supabase.rpc as any)('get_primary_role', {
            _user_id: session.user.id,
          });
          if (!primary || !allowedRoles.includes(primary as AdminRole)) {
            if (alive) {
              setStatus('blocked');
              if (typeof window !== 'undefined') {
                window.location.replace('/admin');
              }
            }
            return;
          }
        }
      } else {
        const { data: isPartner } = await (supabase.rpc as any)('is_partner', {
          _user_id: session.user.id,
        });
        if (!isPartner) {
          if (alive) {
            setStatus('blocked');
            if (typeof window !== 'undefined') {
              window.location.replace(`/partner/login?next=${encodeURIComponent(pathname || '/partner')}`);
            }
          }
          return;
        }
      }

      if (alive) setStatus('authorised');
    };
    check();
    return () => {
      alive = false;
    };
  }, [portal, allowedRoles, loginPath, allowDevLocalStorage, router, pathname]);

  if (status !== 'authorised') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">
          {status === 'blocked' ? 'Redirecting to login…' : 'Verifying access…'}
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default RequireAuth;
