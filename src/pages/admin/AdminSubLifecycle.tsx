import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionCustomers, useUpdateSubscriptionCustomer } from "@/hooks/useSupabaseData";
import { Pause, XCircle, Play, Ban, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";

const AdminSubLifecycle = () => {
  const { toast } = useToast();
  const { data: customers = [], isLoading } = useSubscriptionCustomers();
  const updateCustomer = useUpdateSubscriptionCustomer();

  const activeCount = customers.filter(c => c.status === "active").length;
  const pausedCount = customers.filter(c => c.status === "paused").length;
  const cancelledCount = customers.filter(c => c.status === "cancelled").length;

  const handleStatusChange = (id: string, newStatus: string, reason?: string) => {
    updateCustomer.mutate({
      id,
      updates: {
        status: newStatus,
        ...(newStatus === "paused" ? { pause_reason: reason || "Admin paused" } : {}),
        ...(newStatus === "cancelled" ? { cancel_reason: reason || "Admin cancelled" } : {}),
      },
    }, {
      onSuccess: () => toast({ title: `Subscription ${newStatus}`, description: `Customer ID: ${id}` }),
    });
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">🔄 Subscription Lifecycle</h1>

      <div>
        <h4 className="text-xs font-semibold text-yellow-600 flex items-center gap-1 mb-2"><Pause className="w-3 h-3" /> Paused ({pausedCount})</h4>
        {customers.filter(c => c.status === "paused").map(c => (
          <Card key={c.id} className="border-yellow-200 mb-2">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">{c.name} — {c.plan_name}</p>
                <p className="text-[10px] text-yellow-600">Reason: {c.pause_reason}</p>
                <p className="text-[10px] text-muted-foreground">{c.start_date} → {c.end_date}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" className="text-[10px] h-7 gap-1" onClick={() => handleStatusChange(c.id, "active")}><Play className="w-3 h-3" /> Resume</Button>
                <Button size="sm" variant="destructive" className="text-[10px] h-7 gap-1" onClick={() => handleStatusChange(c.id, "cancelled", "Admin decision")}><Ban className="w-3 h-3" /> Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {pausedCount === 0 && <p className="text-xs text-muted-foreground text-center py-3">No paused subscriptions</p>}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-destructive flex items-center gap-1 mb-2"><XCircle className="w-3 h-3" /> Cancelled ({cancelledCount})</h4>
        {customers.filter(c => c.status === "cancelled").map(c => (
          <Card key={c.id} className="border-red-200 mb-2">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">{c.name} — {c.plan_name}</p>
                <p className="text-[10px] text-destructive">Reason: {c.cancel_reason}</p>
                <p className="text-[10px] text-muted-foreground">Paid: ₹{c.total_paid?.toLocaleString()}</p>
              </div>
              <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1" onClick={() => handleStatusChange(c.id, "active")}><RefreshCw className="w-3 h-3" /> Reactivate</Button>
            </CardContent>
          </Card>
        ))}
        {cancelledCount === 0 && <p className="text-xs text-muted-foreground text-center py-3">No cancelled subscriptions</p>}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-green-600 flex items-center gap-1 mb-2"><CheckCircle2 className="w-3 h-3" /> Active ({activeCount})</h4>
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Customer</TableHead>
                <TableHead className="text-[10px]">Plan</TableHead>
                <TableHead className="text-[10px]">Ends</TableHead>
                <TableHead className="text-[10px]">Skips</TableHead>
                <TableHead className="text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.filter(c => c.status === "active").map(c => (
                <TableRow key={c.id}>
                  <TableCell className="text-xs">{c.name}</TableCell>
                  <TableCell className="text-xs">{c.plan_name}</TableCell>
                  <TableCell className="text-xs">{c.end_date}</TableCell>
                  <TableCell className="text-xs">{Array.isArray(c.skipped_sessions) ? c.skipped_sessions.length : 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] text-yellow-600" onClick={() => handleStatusChange(c.id, "paused", "Admin paused")}>Pause</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive" onClick={() => handleStatusChange(c.id, "cancelled", "Admin cancelled")}>Cancel</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubLifecycle;
