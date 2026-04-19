import { Star, MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const feedbackEntries = [
  { id: "FB-501", order: "ORD-8810", customer: "Meera L.", rating: 5, comment: "Amazing biryani, perfectly spiced!", partner: "Chef Lakshmi", date: "Today", type: "feedback" },
  { id: "FB-499", order: "ORD-8805", customer: "Anand R.", rating: 2, comment: "Food was cold on arrival", partner: "Chef Meena", date: "Today", type: "complaint" },
  { id: "FB-497", order: "ORD-8798", customer: "Sunitha K.", rating: 4, comment: "Good taste, slightly late delivery", partner: "Chef Saroja", date: "Yesterday", type: "feedback" },
  { id: "FB-495", order: "ORD-8792", customer: "Deepa M.", rating: 1, comment: "Wrong order delivered, very disappointed", partner: "Chef Fathima", date: "Yesterday", type: "complaint" },
  { id: "FB-493", order: "ORD-8785", customer: "Vijay N.", rating: 5, comment: "Best dosa in the city!", partner: "Chef Kamala", date: "2 days ago", type: "feedback" },
];

const ratingDist = [
  { stars: 5, count: 142, pct: 45 },
  { stars: 4, count: 89, pct: 28 },
  { stars: 3, count: 47, pct: 15 },
  { stars: 2, count: 22, pct: 7 },
  { stars: 1, count: 15, pct: 5 },
];

export default function AdminCustomerFeedback() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Star className="w-6 h-6 text-primary" /> Customer Feedback & Complaints
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Feedback collection, complaint resolution & NPS tracking across all verticals</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Rating</p><p className="text-2xl font-bold text-primary mt-1">4.2 ★</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Reviews</p><p className="text-2xl font-bold text-foreground mt-1">315</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Response Rate</p><p className="text-2xl font-bold text-action-done mt-1">78%</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Open Complaints</p><p className="text-2xl font-bold text-destructive mt-1">5</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Rating Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ratingDist.map(r => (
              <div key={r.stars} className="flex items-center gap-2">
                <span className="text-xs w-8 text-right">{r.stars} ★</span>
                <Progress value={r.pct} className="flex-1 h-2" />
                <span className="text-[10px] text-muted-foreground w-12">{r.count} ({r.pct}%)</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Feedback & Complaints</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">ID</TableHead><TableHead className="text-xs">Customer</TableHead><TableHead className="text-xs">Partner</TableHead><TableHead className="text-xs">Rating</TableHead><TableHead className="text-xs">Comment</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-xs">Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {feedbackEntries.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="text-xs font-mono">{f.id}</TableCell>
                    <TableCell className="text-xs">{f.customer}</TableCell>
                    <TableCell className="text-xs">{f.partner}</TableCell>
                    <TableCell className="text-xs">{Array.from({ length: f.rating }).map((_, i) => "★").join("")}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{f.comment}</TableCell>
                    <TableCell><Badge className={`text-[8px] ${f.type === "complaint" ? "bg-destructive/10 text-destructive" : "bg-action-done/15 text-action-done"}`}>{f.type}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{f.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
