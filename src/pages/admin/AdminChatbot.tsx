import { MessageSquare, Bot, Users, BarChart3, Settings, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const chatbots = [
  { name: "Customer Support Bot", platform: "App & WhatsApp", status: "active", conversations: 482, resolved: 89, avgTime: "45s", language: "EN, TA, TE, HI" },
  { name: "Partner Helpdesk Bot", platform: "Partner App", status: "active", conversations: 124, resolved: 76, avgTime: "1.2m", language: "EN, TA, TE" },
  { name: "Order Status Bot", platform: "WhatsApp", status: "active", conversations: 310, resolved: 95, avgTime: "12s", language: "EN, TA, HI" },
  { name: "Feedback Collection Bot", platform: "WhatsApp", status: "paused", conversations: 0, resolved: 0, avgTime: "—", language: "EN, TA" },
];

export default function AdminChatbot() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" /> Chatbot Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure, monitor & train AI chatbots across customer and partner channels</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Bots</p><p className="text-2xl font-bold text-action-done mt-1">3</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Conversations Today</p><p className="text-2xl font-bold text-primary mt-1">916</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Auto-Resolved</p><p className="text-2xl font-bold text-foreground mt-1">86%</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Escalated to Human</p><p className="text-2xl font-bold text-action-cook mt-1">14%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Bot Fleet Overview</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Bot Name</TableHead><TableHead className="text-xs">Platform</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">Conversations</TableHead><TableHead className="text-xs">Resolution %</TableHead><TableHead className="text-xs">Avg Response</TableHead><TableHead className="text-xs">Languages</TableHead></TableRow></TableHeader>
            <TableBody>
              {chatbots.map(b => (
                <TableRow key={b.name}>
                  <TableCell className="text-xs font-medium flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-primary" />{b.name}</TableCell>
                  <TableCell className="text-xs">{b.platform}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${b.status === "active" ? "bg-action-done/15 text-action-done" : "bg-muted text-muted-foreground"}`}>{b.status}</Badge></TableCell>
                  <TableCell className="text-xs font-mono">{b.conversations}</TableCell>
                  <TableCell className="text-xs">{b.resolved > 0 ? <><Progress value={b.resolved} className="h-1.5 w-16 inline-block mr-1" />{b.resolved}%</> : "—"}</TableCell>
                  <TableCell className="text-xs">{b.avgTime}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{b.language}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
