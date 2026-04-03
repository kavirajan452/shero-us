import { ClipboardList, CheckCircle2, Clock, FileEdit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const amendments = [
  { id: "AMD-101", partner: "Chef Lakshmi", type: "Bank Details Update", detail: "New IFSC: HDFC0001234", status: "pending", date: "Today" },
  { id: "AMD-099", partner: "Chef Meena", type: "Address Change", detail: "Kitchen relocated to Anna Nagar", status: "approved", date: "Yesterday" },
  { id: "AMD-097", partner: "Chef Saroja", type: "FDA Renewal", detail: "New license: 10024051000123", status: "pending", date: "Yesterday" },
  { id: "AMD-095", partner: "Chef Fathima", type: "Menu Category Change", detail: "Added Kerala cuisine", status: "approved", date: "2 days ago" },
  { id: "AMD-093", partner: "Chef Kamala", type: "Contact Update", detail: "New phone: +91-9988776655", status: "rejected", date: "3 days ago" },
];

const statusColors: Record<string, string> = {
  pending: "bg-action-cook/15 text-action-cook",
  approved: "bg-action-done/15 text-action-done",
  rejected: "bg-destructive/10 text-destructive",
};

export default function AdminPartnerAmendments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileEdit className="w-6 h-6 text-primary" /> Partner Amendments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Partner profile changes, document updates & amendment approvals</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-action-cook/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending</p><p className="text-2xl font-bold text-action-cook mt-1">2</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Approved (7d)</p><p className="text-2xl font-bold text-action-done mt-1">8</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rejected (7d)</p><p className="text-2xl font-bold text-destructive mt-1">1</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Amendment Requests</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">ID</TableHead><TableHead className="text-xs">Partner</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs">Detail</TableHead><TableHead className="text-xs">Date</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {amendments.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs font-mono font-bold">{a.id}</TableCell>
                  <TableCell className="text-xs">{a.partner}</TableCell>
                  <TableCell className="text-xs font-medium">{a.type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.detail}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.date}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${statusColors[a.status]}`}>{a.status}</Badge></TableCell>
                  <TableCell>{a.status === "pending" && <Button size="sm" variant="outline" className="h-6 text-[10px]">Review</Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
