'use client';
import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PartnerSidebar } from "@/components/PartnerSidebar";
import PartnerNotifications from "@/components/PartnerNotifications";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PartnerChatbot from "@/components/partner/PartnerChatbot";
import PartnerProfilePopover from "@/components/partner/PartnerProfilePopover";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { PartnerThemeProvider, usePartnerTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Guard: allows the wrapped layout to render only if the visitor
 *  (a) has a Supabase session whose user has the `partner` role, OR
 *  (b) has the dev-login localStorage flag AND
 *      `NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true"` (local testing only).
 */
const usePartnerAuthGuard = () => {
  const router = useRouter();
  const pathname = usePathname() || "/partner";
  const [ready, setReady] = useState(false);
  const devLoginEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";

  useEffect(() => {
    let alive = true;
    const run = async () => {
      // The partner login page is inside /partner/** so the layout wraps
      // it — skip the guard when the visitor IS the login page itself.
      if (pathname === "/partner/login") {
        if (alive) setReady(true);
        return;
      }

      const hasDummyFlag = localStorage.getItem("shero-partner") === "true";

      if (devLoginEnabled && hasDummyFlag) {
        if (alive) setReady(true);
        return;
      }
      if (!devLoginEnabled && hasDummyFlag) {
        localStorage.removeItem("shero-partner");
        localStorage.removeItem("shero-partner-email");
        localStorage.removeItem("shero-partner-name");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (typeof window !== "undefined") {
          window.location.replace(`/partner/login?next=${encodeURIComponent(pathname)}`);
        }
        return;
      }

      const { data: isPartner, error } = await (supabase.rpc as any)("is_partner", {
        _user_id: session.user.id,
      });

      if (error || !isPartner) {
        await supabase.auth.signOut();
        if (typeof window !== "undefined") {
          window.location.replace(`/partner/login?next=${encodeURIComponent(pathname)}`);
        }
        return;
      }

      if (alive) setReady(true);
    };
    run();
    return () => {
      alive = false;
    };
  }, [router, pathname, devLoginEnabled]);

  return ready;
};

const PartnerLayoutInner = ({ children }: { children?: ReactNode }) => {
  const { theme } = usePartnerTheme();
  const themeClass = theme === "classic" ? "" : `theme-${theme}`;

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full bg-background ${themeClass}`}>
        <PartnerSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="shrink-0" />
            <h1 className="text-sm font-semibold text-foreground flex-1">Shero Partner Dashboard</h1>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
              <PartnerNotifications />
              <PartnerProfilePopover />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const PartnerLayout = ({ children }: { children?: ReactNode }) => {
  const pathname = usePathname() || "/partner";
  const ready = usePartnerAuthGuard();

  // Login page renders bare (no sidebar/chrome, no guard).
  if (pathname === "/partner/login") {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Verifying access…</div>
      </div>
    );
  }

  return (
    <PartnerThemeProvider>
      <PartnerLayoutInner>{children}</PartnerLayoutInner>
    </PartnerThemeProvider>
  );
};

export default PartnerLayout;
