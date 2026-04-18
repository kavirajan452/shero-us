'use client';
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { getAdminRole, getRoleConfig, hasAccess, type AdminRole } from "@/data/adminRoles";
import { isPhase1AdminRoute } from "@/data/adminPhase1";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  // Defer localStorage reads to client-side only (avoids SSR "localStorage is not defined")
  const [roleConfig, setRoleConfig] = useState<ReturnType<typeof getRoleConfig>>(undefined);

  // Force sidebar cookie open on mount
  useEffect(() => {
    document.cookie = "sidebar:state=true; path=/; max-age=604800";
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login");
        setIsChecking(false);
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: session.user.id });

      if (!isAdmin) {
        navigate("/admin/login");
        setIsChecking(false);
        return;
      }

      const { data: account } = await supabase
        .from("admin_accounts")
        .select("role, display_name, username")
        .eq("auth_user_id", session.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (account?.role) {
        localStorage.setItem("shero-admin", "true");
        localStorage.setItem("shero-admin-role", account.role);
        localStorage.setItem("shero-admin-name", account.display_name);
        localStorage.setItem("shero-admin-rem", account.username);
      }

      const currentRole = getAdminRole();
      setRoleConfig(currentRole ? getRoleConfig(currentRole) : undefined);
      if (currentRole && !hasAccess(currentRole, location.pathname)) {
        navigate("/admin/login");
        setIsChecking(false);
        return;
      }

      if (!isPhase1AdminRoute(location.pathname)) {
        navigate("/admin");
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    checkAdmin();
  }, [navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    );
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
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
