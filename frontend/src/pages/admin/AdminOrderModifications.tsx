import { FileEdit, Clock, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const modifications = [
  { id: "MOD-301", order: "ORD-8821", customer: "Priya S.", type: "Add Item", detail: "+1 Sambar Vada", requestedAt: "2 min ago", status: "new", source: "customer" },
  { id: "MOD-299", order: "ORD-8819", customer: "Ravi K.", type: "Remove Item", detail: "-1 Curd Rice", requestedAt: "8 min ago", status: "acknowledged", source: "customer" },
  { id: "MOD-297", order: "ORD-8815", customer: "Kumar R.", type: "Qty Change", detail: "Biryani: 2→3", requestedAt: "15 min ago", status: "resolved", source: "admin" },
  { id: "MOD-295", order: "ORD-8810", customer: "Meera L.", type: "Cancel Item", detail: "-1 Fish Curry", requestedAt: "22 min ago", status: "escalated", source: "customer" },
  { id: "MOD-293", order: "ORD-8808", customer: "Sudha P.", type: "Add Item", detail: "+2 Idli", requestedAt: "30 min ago", status: "resolved", source: "customer" },
];

const statusColors: Record<string, string> = {
  new: "bg-primary/15 text-primary",
  acknowledged: "bg-action-cook/15 text-action-cook",
  resolved: "bg-action-done/15 text-action-done",
  escalated: "bg-destructive/10 text-destructive",
};

export default function AdminOrderModifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileEdit className="w-6 h-6 text-primary" /> Order Modifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Customer & admin-initiated order changes within the 5-minute modification window</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-primary/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">New Requests</p><p className="text-2xl font-bold text-primary mt-1">1</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Acknowledged</p><p className="text-2xl font-bold text-action-cook mt-1">1</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Resolved Today</p><p className="text-2xl font-bold text-action-done mt-1">2</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Escalated</p><p className="text-2xl font-bold text-destructive mt-1">1</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Modification Requests</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Mod ID</TableHead><TableHead className="text-xs">Order</TableHead><TableHead className="text-xs">Customer</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs">Detail</TableHead><TableHead className="text-xs">Source</TableHead><TableHead className="text-xs">Requested</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {modifications.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-xs font-mono font-bold">{m.id}</TableCell>
                  <TableCell className="text-xs font-mono">{m.order}</TableCell>
                  <TableCell className="text-xs">{m.customer}</TableCell>
                  <TableCell className="text-xs">{m.type}</TableCell>
                  <TableCell className="text-xs font-medium">{m.detail}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[8px]">{m.source}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.requestedAt}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${statusColors[m.status]}`}>{m.status}</Badge></TableCell>
                  <TableCell>{m.status === "new" && <Button size="sm" variant="outline" className="h-6 text-[10px]">Acknowledge</Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
