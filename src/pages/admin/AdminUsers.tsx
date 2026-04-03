import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ban, Eye } from "lucide-react";

const mockUsers = [
  { id: "1", name: "Ramesh K.", rmn: "+91 98765 43210", role: "customer" as const, orders: 12, joined: "Jan 2026" },
  { id: "2", name: "Sujatha M.", rmn: "+91 87654 32109", role: "partner" as const, orders: 0, joined: "Dec 2025" },
  { id: "3", name: "Anita P.", rmn: "+91 76543 21098", role: "customer" as const, orders: 5, joined: "Feb 2026" },
  { id: "4", name: "Priya K.", rmn: "+91 65432 10987", role: "partner" as const, orders: 0, joined: "Jan 2026" },
  { id: "5", name: "Vijay S.", rmn: "+91 54321 09876", role: "customer" as const, orders: 28, joined: "Nov 2025" },
  { id: "6", name: "Deepa M.", rmn: "+91 43210 98765", role: "customer" as const, orders: 3, joined: "Feb 2026" },
];

const roleColors = {
  customer: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  partner: "bg-primary/10 text-primary",
};

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage all registered users</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User (RMN)</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Orders</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockUsers.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">RMN: {u.rmn}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${roleColors[u.role]} text-[10px] border-0 capitalize`}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{u.orders}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{u.joined}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600">
                      <Ban className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
