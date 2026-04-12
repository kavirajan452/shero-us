'use client';
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { getAdminRole, getRoleConfig, hasAccess, type AdminRole } from "@/data/adminRoles";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Still read from localStorage for sidebar compatibility during migration
  const role = getAdminRole();
  const roleConfig = role ? getRoleConfig(role) : null;

  // Force sidebar cookie open on mount
  useEffect(() => {
    document.cookie = "sidebar:state=true; path=/; max-age=604800";
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const isDummyAdmin = localStorage.getItem("shero-admin") === "true" && localStorage.getItem("shero-admin-role");

      if (isDummyAdmin) {
        setIsChecking(false);
        return;
      }

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

      if (!localStorage.getItem("shero-admin-role")) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        const adminRole = roles?.find(r => r.role !== "customer" && r.role !== "partner");
        if (adminRole) {
          localStorage.setItem("shero-admin", "true");
          localStorage.setItem("shero-admin-role", adminRole.role);
        }
      }

      const currentRole = getAdminRole();
      if (currentRole && !hasAccess(currentRole, location.pathname)) {
        navigate("/admin");
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
