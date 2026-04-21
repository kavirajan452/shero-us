import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileEdit, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useOrderModifications } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  new: "bg-primary/15 text-primary",
  acknowledged: "bg-action-cook/15 text-action-cook",
  resolved: "bg-action-done/15 text-action-done",
  escalated: "bg-destructive/10 text-destructive",
};

export default function AdminOrderModifications() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data = [], isLoading } = useOrderModifications();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "resolved") updates.resolved_at = new Date().toISOString();
      const { error } = await supabase.from("order_modifications").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order_modifications"] }),
  });

  const stats = useMemo(() => {
    return {
      newCount: data.filter((x) => x.status === "new").length,
      acknowledged: data.filter((x) => x.status === "acknowledged").length,
      resolved: data.filter((x) => x.status === "resolved").length,
      escalated: data.filter((x) => x.status === "escalated").length,
    };
  }, [data]);

  const handleUpdate = async (id: string, status: string) => {
    await updateStatus.mutateAsync({ id, status });
    toast({ title: "Modification updated", description: `Marked as ${status}` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileEdit className="w-6 h-6 text-primary" /> Order Modifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Live request queue from Supabase</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-primary/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">New Requests</p><p className="text-2xl font-bold text-primary mt-1">{stats.newCount}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Acknowledged</p><p className="text-2xl font-bold text-action-cook mt-1">{stats.acknowledged}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Resolved</p><p className="text-2xl font-bold text-action-done mt-1">{stats.resolved}</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Escalated</p><p className="text-2xl font-bold text-destructive mt-1">{stats.escalated}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Modification Requests</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Order</TableHead><TableHead className="text-xs">Customer</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs">Detail</TableHead><TableHead className="text-xs">Requested</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs font-mono">{m.order_id}</TableCell>
                    <TableCell className="text-xs">{m.customer_name}</TableCell>
                    <TableCell className="text-xs">{String(m.modification_type || "").replaceAll("_", " ")}</TableCell>
                    <TableCell className="text-xs font-medium">{m.description}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(m.requested_at).toLocaleString()}</TableCell>
                    <TableCell><Badge className={`text-[8px] ${statusColors[m.status] || "bg-muted text-muted-foreground"}`}>{m.status}</Badge></TableCell>
                    <TableCell className="space-x-1">
                      {m.status === "new" && <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => handleUpdate(m.id, "acknowledged")}>Acknowledge</Button>}
                      {(m.status === "new" || m.status === "acknowledged") && <Button size="sm" className="h-6 text-[10px]" onClick={() => handleUpdate(m.id, "resolved")}>Resolve</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
