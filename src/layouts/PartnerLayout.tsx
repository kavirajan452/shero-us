'use client';
import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PartnerSidebar } from "@/components/PartnerSidebar";
import PartnerNotifications from "@/components/PartnerNotifications";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PartnerChatbot from "@/components/partner/PartnerChatbot";
import PartnerProfilePopover from "@/components/partner/PartnerProfilePopover";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { PartnerThemeProvider, usePartnerTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkPartnerAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate(`/login?role=partner&next=${encodeURIComponent(location.pathname)}`, { replace: true });
        setIsChecking(false);
        return;
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (error || !roles?.some((r) => r.role === "partner")) {
        navigate("/login?role=partner", { replace: true });
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    checkPartnerAccess();
  }, [navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
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
