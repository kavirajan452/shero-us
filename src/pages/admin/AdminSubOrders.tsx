import { useSubscriptionCustomers } from "@/hooks/useSupabaseData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  trial: "bg-blue-100 text-blue-800",
  paused: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  expired: "bg-muted text-muted-foreground",
};

const AdminSubOrders = () => {
  const { data: customers = [], isLoading } = useSubscriptionCustomers();

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">📋 Subscription Orders</h1>
      <p className="text-xs text-muted-foreground">{customers.length} subscriptions total</p>

      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">ID</TableHead>
              <TableHead className="text-[10px]">Customer</TableHead>
              <TableHead className="text-[10px]">Plan</TableHead>
              <TableHead className="text-[10px]">Duration</TableHead>
              <TableHead className="text-[10px]">Status</TableHead>
              <TableHead className="text-[10px]">Partner</TableHead>
              <TableHead className="text-[10px]">Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map(c => (
              <TableRow key={c.id}>
                <TableCell className="text-xs font-mono">{c.id}</TableCell>
                <TableCell className="text-xs">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.mobile}</p>
                </TableCell>
                <TableCell className="text-xs">{c.plan_name}</TableCell>
                <TableCell className="text-xs capitalize">{c.duration}</TableCell>
                <TableCell>
                  <Badge className={`text-[9px] border-0 ${statusColors[c.status] || "bg-muted text-muted-foreground"}`}>{c.status}</Badge>
                </TableCell>
                <TableCell className="text-xs">{c.partner_name || "—"}</TableCell>
                <TableCell className="text-xs">${c.total_paid?.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSubOrders;
