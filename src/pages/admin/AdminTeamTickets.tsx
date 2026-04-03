import { TicketCheck, Clock, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const tickets = [
  { id: "ITK-201", from: "Onboarding TL - South", to: "Operations Manager", subject: "Kitchen inspection delay — Chef Nandini", priority: "high", status: "open", date: "Today" },
  { id: "ITK-199", from: "SSC Agent - Priya", to: "Finance Manager", subject: "Refund processing stuck for ORD-8790", priority: "medium", status: "in_progress", date: "Today" },
  { id: "ITK-197", from: "Finance Executive", to: "Vertical Head", subject: "TDS deduction mismatch Q3", priority: "high", status: "open", date: "Yesterday" },
  { id: "ITK-195", from: "HR Manager", to: "Country Head", subject: "New hire approval — SSC batch", priority: "low", status: "resolved", date: "Yesterday" },
  { id: "ITK-193", from: "Ops Executive", to: "Onboarding Manager", subject: "FSSAI renewal pending for 3 partners", priority: "medium", status: "in_progress", date: "2 days ago" },
];

const statusColors: Record<string, string> = {
  open: "bg-primary/15 text-primary",
  in_progress: "bg-action-cook/15 text-action-cook",
  resolved: "bg-action-done/15 text-action-done",
};
const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-action-cook/15 text-action-cook",
  low: "bg-muted text-muted-foreground",
};

export default function AdminTeamTickets() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TicketCheck className="w-6 h-6 text-primary" /> Intra-Team Tickets
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Internal tickets between teams, departments & management escalations</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-primary/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Open</p><p className="text-2xl font-bold text-primary mt-1">2</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-action-cook mt-1">2</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Resolved (7d)</p><p className="text-2xl font-bold text-action-done mt-1">1</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">All Tickets</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">ID</TableHead><TableHead className="text-xs">From</TableHead><TableHead className="text-xs">To</TableHead><TableHead className="text-xs">Subject</TableHead><TableHead className="text-xs">Priority</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {tickets.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs font-mono font-bold">{t.id}</TableCell>
                  <TableCell className="text-xs">{t.from}</TableCell>
                  <TableCell className="text-xs">{t.to}</TableCell>
                  <TableCell className="text-xs font-medium max-w-[250px] truncate">{t.subject}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${priorityColors[t.priority]}`}>{t.priority}</Badge></TableCell>
                  <TableCell><Badge className={`text-[8px] ${statusColors[t.status]}`}>{t.status.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
