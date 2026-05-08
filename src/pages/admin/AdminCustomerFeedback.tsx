import { useMemo } from "react";
import { Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useCustomerFeedback, useUpdateFeedback } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";

export default function AdminCustomerFeedback() {
  const { data = [], isLoading } = useCustomerFeedback();
  const updateFeedback = useUpdateFeedback();
  const { toast } = useToast();

  const stats = useMemo(() => {
    const rated = data.filter((x) => typeof x.rating === "number");
    const avg = rated.length ? rated.reduce((s, x) => s + Number(x.rating || 0), 0) / rated.length : 0;
    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = rated.filter((x) => Number(x.rating) === stars).length;
      const pct = rated.length ? Math.round((count / rated.length) * 100) : 0;
      return { stars, count, pct };
    });
    const openComplaints = data.filter((x) => x.status === "pending" || x.status === "sent").length;
    return { avg, total: data.length, openComplaints, distribution };
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Star className="w-6 h-6 text-primary" /> Customer Feedback & Complaints
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Live customer_feedback data with response actions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Rating</p><p className="text-2xl font-bold text-primary mt-1">{stats.avg.toFixed(1)} ★</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Reviews</p><p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Responded</p><p className="text-2xl font-bold text-action-done mt-1">{data.filter((x) => x.status === "responded").length}</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Open Complaints</p><p className="text-2xl font-bold text-destructive mt-1">{stats.openComplaints}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Rating Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.distribution.map((r) => (
              <div key={r.stars} className="flex items-center gap-2">
                <span className="text-xs w-8 text-right">{r.stars} ★</span>
                <Progress value={r.pct} className="flex-1 h-2" />
                <span className="text-[10px] text-muted-foreground w-12">{r.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Feedback & Complaints</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">Order</TableHead><TableHead className="text-xs">Customer</TableHead><TableHead className="text-xs">Partner</TableHead><TableHead className="text-xs">Rating</TableHead><TableHead className="text-xs">Comment</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="text-xs font-mono">{f.order_display_id || f.order_id}</TableCell>
                      <TableCell className="text-xs">{f.customer_name}</TableCell>
                      <TableCell className="text-xs">{f.partner_name || "—"}</TableCell>
                      <TableCell className="text-xs">{f.rating ? Array(f.rating).fill("★").join("") : "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">{f.comment || "No comment"}</TableCell>
                      <TableCell><Badge className={`text-[8px] ${f.status === "responded" ? "bg-action-done/15 text-action-done" : "bg-destructive/10 text-destructive"}`}>{f.status}</Badge></TableCell>
                      <TableCell>
                        {f.status !== "responded" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px]"
                            disabled={updateFeedback.isPending}
                            onClick={() =>
                              updateFeedback.mutate(
                                { id: f.id, updates: { status: "responded", responded_at: new Date().toISOString() } },
                                {
                                  onError: (error) =>
                                    toast({
                                      title: "Update failed",
                                      description: error instanceof Error ? error.message : "Please retry",
                                      variant: "destructive",
                                    }),
                                },
                              )
                            }
                          >
                            Mark Responded
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
