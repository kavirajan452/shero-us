import { MessageSquare, Send, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const queries = [
  { id: "PCQ-401", partner: "Chef Lakshmi", subject: "Payment delay for last week orders", channel: "WhatsApp", status: "open", date: "Today", priority: "high" },
  { id: "PCQ-399", partner: "Chef Meena", subject: "How to update menu prices?", channel: "App Chat", status: "responded", date: "Today", priority: "low" },
  { id: "PCQ-397", partner: "Chef Saroja", subject: "Kitchen holiday request for next week", channel: "WhatsApp", status: "open", date: "Yesterday", priority: "medium" },
  { id: "PCQ-395", partner: "Chef Fathima", subject: "Need packaging material restock", channel: "Call", status: "resolved", date: "Yesterday", priority: "medium" },
  { id: "PCQ-393", partner: "Chef Kamala", subject: "Training certificate not received", channel: "App Chat", status: "responded", date: "2 days ago", priority: "low" },
];

const statusColors: Record<string, string> = {
  open: "bg-primary/15 text-primary",
  responded: "bg-action-cook/15 text-action-cook",
  resolved: "bg-action-done/15 text-action-done",
};

export default function AdminPartnerComms() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" /> Partner Communications & Queries
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Partner queries, communication threads & resolution tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-primary/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Open Queries</p><p className="text-2xl font-bold text-primary mt-1">2</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Responded</p><p className="text-2xl font-bold text-action-cook mt-1">2</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Resolved (7d)</p><p className="text-2xl font-bold text-action-done mt-1">1</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Response</p><p className="text-2xl font-bold text-foreground mt-1">1.8h</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Partner Queries</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">ID</TableHead><TableHead className="text-xs">Partner</TableHead><TableHead className="text-xs">Subject</TableHead><TableHead className="text-xs">Channel</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {queries.map(q => (
                <TableRow key={q.id}>
                  <TableCell className="text-xs font-mono font-bold">{q.id}</TableCell>
                  <TableCell className="text-xs">{q.partner}</TableCell>
                  <TableCell className="text-xs font-medium max-w-[250px] truncate">{q.subject}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[8px]">{q.channel}</Badge></TableCell>
                  <TableCell><Badge className={`text-[8px] ${statusColors[q.status]}`}>{q.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{q.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
