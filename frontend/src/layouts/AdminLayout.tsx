'use client';
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { getAdminRole, getRoleConfig, hasAccess } from "@/data/adminRoles";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

/**
 * AdminLayout — hardened route guard for Phase 2 · Task 4.
 *
 * A user may enter the admin area only if one of the following is true:
 *   (1) Real Supabase session AND `is_admin()` RPC returns true
 *   (2) Dev-login localStorage flag is present AND
 *       `NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true"` (local testing only)
 *
 * A bare localStorage flag alone is NEVER sufficient in production.
 * If both checks fail, the user is sent to `/admin/login?next=<path>`.
 */
const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname() || "/admin";
  const [isChecking, setIsChecking] = useState(true);

  const role = getAdminRole();
  const roleConfig = role ? getRoleConfig(role) : null;
  const devLoginEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";

  useEffect(() => {
    document.cookie = "sidebar:state=true; path=/; max-age=604800";
  }, []);

  useEffect(() => {
    // The admin login page is itself inside /admin/** so the layout wraps
    // it — skip the whole guard when the visitor IS the login page.
    if (pathname === "/admin/login") {
      setIsChecking(false);
      return;
    }

    const redirectToLogin = () => {
      const target = `/admin/login?next=${encodeURIComponent(pathname)}`;
      if (typeof window !== "undefined") {
        window.location.replace(target);
      } else {
        router.replace(target);
      }
      setIsChecking(false);
    };

    const checkAdmin = async () => {
      // ── (1) Dev-only localStorage bypass ─────────────────────────
      const hasDummyFlag =
        localStorage.getItem("shero-admin") === "true" &&
        !!localStorage.getItem("shero-admin-role");

      if (devLoginEnabled && hasDummyFlag) {
        const currentRole = getAdminRole();
        if (currentRole && !hasAccess(currentRole, pathname)) {
          router.replace("/admin");
        }
        setIsChecking(false);
        return;
      }

      // If a flag was set but dev-login is OFF, clear it to avoid leaks.
      if (!devLoginEnabled && hasDummyFlag) {
        localStorage.removeItem("shero-admin");
        localStorage.removeItem("shero-admin-role");
        localStorage.removeItem("shero-admin-rem");
        localStorage.removeItem("shero-admin-name");
      }

      // ── (2) Real Supabase session check ──────────────────────────
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        redirectToLogin();
        return;
      }

      const { data: isAdmin, error } = await (supabase.rpc as any)("is_admin", {
        _user_id: session.user.id,
      });

      if (error || !isAdmin) {
        await supabase.auth.signOut();
        redirectToLogin();
        return;
      }

      // Populate / refresh the admin-role cache used by the sidebar
      if (!localStorage.getItem("shero-admin-role")) {
        const { data: primaryRole } = await (supabase.rpc as any)("get_primary_role", {
          _user_id: session.user.id,
        });
        if (primaryRole) {
          localStorage.setItem("shero-admin", "true");
          localStorage.setItem("shero-admin-role", primaryRole);
          localStorage.setItem(
            "shero-admin-name",
            session.user.user_metadata?.full_name || session.user.email || ""
          );
        }
      }

      const currentRole = getAdminRole();
      if (currentRole && !hasAccess(currentRole, pathname)) {
        router.replace("/admin");
      }

      setIsChecking(false);
    };

    checkAdmin();
  }, [router, pathname, devLoginEnabled]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Verifying access…</div>
      </div>
    );
  }

  // Login page renders bare (no sidebar/chrome, no guard).
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true} style={{ "--sidebar-width": "260px" } as React.CSSProperties}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="shrink-0" />
            <h1 className="text-sm font-semibold text-foreground flex-1">Shero Admin Console</h1>
            {roleConfig && (
              <Badge variant="outline" className="text-[10px] font-medium">
                {roleConfig.label}
              </Badge>
            )}
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
