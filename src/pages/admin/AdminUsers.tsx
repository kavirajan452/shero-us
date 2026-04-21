import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRow = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  role: string;
  orders: number;
};

const roleColors: Record<string, string> = {
  customer: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  partner: "bg-primary/10 text-primary",
  super_admin: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
};

export default function AdminUsers() {
  const { toast } = useToast();

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_users"],
    queryFn: async (): Promise<UserRow[]> => {
      const [profilesRes, rolesRes, ordersRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, full_name, phone, email, created_at")
          .order("created_at", { ascending: false })
          .limit(300),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("instant_orders").select("customer_id"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (ordersRes.error) throw ordersRes.error;

      const roleByUser = new Map<string, string>();
      (rolesRes.data || []).forEach((row) => {
        if (!roleByUser.has(row.user_id)) roleByUser.set(row.user_id, row.role);
      });

      const orderCountByUser = new Map<string, number>();
      (ordersRes.data || []).forEach((row) => {
        if (!row.customer_id) return;
        orderCountByUser.set(row.customer_id, (orderCountByUser.get(row.customer_id) || 0) + 1);
      });

      return (profilesRes.data || []).map((p) => ({
        ...p,
        role: roleByUser.get(p.user_id) || "customer",
        orders: orderCountByUser.get(p.user_id) || 0,
      }));
    },
  });

  const stats = useMemo(() => {
    const total = data.length;
    const partners = data.filter((u) => u.role === "partner").length;
    const customers = data.filter((u) => u.role === "customer").length;
    return { total, partners, customers };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Live users from Supabase profiles and roles</p>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-xl">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Total Users</p><p className="text-xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Customers</p><p className="text-xl font-bold">{stats.customers}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground">Kitchen Partners</p><p className="text-xl font-bold">{stats.partners}</p></CardContent></Card>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Orders</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((u) => (
              <tr key={u.user_id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{u.full_name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{u.email || u.phone || "N/A"}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${roleColors[u.role] || "bg-muted text-muted-foreground"} text-[10px] border-0 capitalize`}>
                    {u.role.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{u.orders}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => toast({ title: u.full_name || "User", description: `${u.email || u.phone || "No contact"}` })}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
