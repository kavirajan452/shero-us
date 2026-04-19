import { MapPin, Navigation, Clock, Truck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const activeDrivers = [
  { id: "DRV-101", name: "Suresh R.", order: "ORD-8821", pickup: "Chef Lakshmi Kitchen", status: "en_route_pickup", eta: "4 min", lat: "13.0827°N", lng: "80.2707°E" },
  { id: "DRV-102", name: "Manoj K.", order: "ORD-8819", pickup: "Chef Meena Kitchen", status: "at_pickup", eta: "—", lat: "13.0604°N", lng: "80.2496°E" },
  { id: "DRV-103", name: "Ramesh P.", order: "ORD-8817", pickup: "Chef Saroja Kitchen", status: "delivering", eta: "8 min", lat: "13.0674°N", lng: "80.2376°E" },
  { id: "DRV-104", name: "Vijay S.", order: "ORD-8815", pickup: "Chef Fathima Kitchen", status: "stuck", eta: "Unknown", lat: "13.0524°N", lng: "80.2121°E" },
];

const statusColors: Record<string, string> = {
  en_route_pickup: "bg-action-dispatch/15 text-action-dispatch",
  at_pickup: "bg-action-pack/15 text-action-pack",
  delivering: "bg-action-cook/15 text-action-cook",
  stuck: "bg-destructive/10 text-destructive",
};

export default function AdminLocationSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" /> Location & Pickup Ops
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time driver tracking, pickup coordination & location troubleshooting</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Drivers</p><p className="text-2xl font-bold text-foreground mt-1">{activeDrivers.length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">En Route</p><p className="text-2xl font-bold text-action-dispatch mt-1">1</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">At Pickup</p><p className="text-2xl font-bold text-action-pack mt-1">1</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Stuck / Issues</p><p className="text-2xl font-bold text-destructive mt-1">1</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Driver Tracking — Live</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Driver</TableHead><TableHead className="text-xs">Order</TableHead><TableHead className="text-xs">Pickup From</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs">ETA</TableHead><TableHead className="text-xs">Coordinates</TableHead><TableHead className="text-xs">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {activeDrivers.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="text-xs font-medium">{d.name} <span className="text-muted-foreground font-mono">({d.id})</span></TableCell>
                  <TableCell className="text-xs font-mono">{d.order}</TableCell>
                  <TableCell className="text-xs">{d.pickup}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${statusColors[d.status]}`}>{d.status.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="text-xs">{d.eta}</TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground">{d.lat}, {d.lng}</TableCell>
                  <TableCell><Button size="sm" variant="outline" className="h-6 text-[10px] gap-1"><Navigation className="w-3 h-3" /> Track</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
