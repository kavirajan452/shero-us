import { Phone, Clock, AlertTriangle, CheckCircle2, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const liveOrders = [
  { id: "ORD-8821", customer: "Priya S.", partner: "Chef Lakshmi", status: "preparing", time: "12 min", issue: "none", phone: "+91-9876543210" },
  { id: "ORD-8819", customer: "Ravi K.", partner: "Chef Meena", status: "delayed", time: "28 min", issue: "Late preparation", phone: "+91-9876543211" },
  { id: "ORD-8817", customer: "Anita M.", partner: "Chef Saroja", status: "out_for_delivery", time: "8 min", issue: "none", phone: "+91-9876543212" },
  { id: "ORD-8815", customer: "Kumar R.", partner: "Chef Fathima", status: "escalated", time: "35 min", issue: "Wrong items packed", phone: "+91-9876543213" },
  { id: "ORD-8813", customer: "Lakshmi V.", partner: "Chef Kamala", status: "preparing", time: "5 min", issue: "none", phone: "+91-9876543214" },
];

const statusColors: Record<string, string> = {
  preparing: "bg-action-cook/15 text-action-cook",
  delayed: "bg-destructive/10 text-destructive",
  out_for_delivery: "bg-action-dispatch/15 text-action-dispatch",
  escalated: "bg-destructive/15 text-destructive",
};

export default function AdminLiveSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Phone className="w-6 h-6 text-primary" /> Live Order Support
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time order monitoring, escalations & call support across all sub-verticals</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Orders</p><p className="text-2xl font-bold text-foreground mt-1">47</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Escalated</p><p className="text-2xl font-bold text-destructive mt-1">3</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Delayed</p><p className="text-2xl font-bold text-action-cook mt-1">5</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Response</p><p className="text-2xl font-bold text-primary mt-1">2.4m</p></CardContent></Card>
      </div>

      <Tabs defaultValue="live">
        <TabsList>
          <TabsTrigger value="live" className="text-xs gap-1"><Radio className="w-3.5 h-3.5" /> Live Monitor</TabsTrigger>
          <TabsTrigger value="escalations" className="text-xs gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Escalations</TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Active Orders — Live Feed</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">Order</TableHead><TableHead className="text-xs">Customer</TableHead><TableHead className="text-xs">Partner</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Elapsed</TableHead><TableHead className="text-xs">Issue</TableHead><TableHead className="text-xs">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {liveOrders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs font-mono font-bold">{o.id}</TableCell>
                      <TableCell className="text-xs">{o.customer}</TableCell>
                      <TableCell className="text-xs">{o.partner}</TableCell>
                      <TableCell><Badge className={`text-[8px] ${statusColors[o.status]}`}>{o.status.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="text-xs"><Clock className="w-3 h-3 inline mr-1" />{o.time}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{o.issue === "none" ? "—" : o.issue}</TableCell>
                      <TableCell><a href={`tel:${o.phone}`}><Button size="sm" variant="outline" className="h-6 text-[10px] gap-1"><Phone className="w-3 h-3" /> Call</Button></a></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="escalations" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">3 Escalated Orders</p>
              <p className="text-xs text-muted-foreground mt-1">Orders exceeding SLA or with critical issues requiring immediate attention</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
