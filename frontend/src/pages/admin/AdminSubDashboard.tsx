import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  subscriptionCustomers,
  type SubscriptionCustomerRecord,
  type SubscriptionStatus,
} from "@/data/subscriptionPlansData";
import {
  Users, Pause, XCircle, Search, Eye, Play, Clock,
  CheckCircle2, AlertTriangle, Phone, Mail, Package, Calendar, MapPin, ChefHat,
} from "lucide-react";

const statusConfig: Record<SubscriptionStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-100 text-green-800" },
  trial: { label: "Trial", color: "bg-blue-100 text-blue-800" },
  paused: { label: "Paused", color: "bg-yellow-100 text-yellow-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground" },
};

const AdminSubDashboard = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<SubscriptionCustomerRecord[]>(subscriptionCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<SubscriptionCustomerRecord | null>(null);

  const activeCount = customers.filter(c => c.status === "active").length;
  const trialCount = customers.filter(c => c.status === "trial").length;
  const pausedCount = customers.filter(c => c.status === "paused").length;
  const cancelledCount = customers.filter(c => c.status === "cancelled").length;
  const totalRevenue = customers.filter(c => ["active", "trial"].includes(c.status)).reduce((s, c) => s + c.totalPaid, 0);
  const avgOrderValue = totalRevenue / Math.max(activeCount + trialCount, 1);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search) || c.planName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: SubscriptionStatus) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    toast({ title: `Subscription ${newStatus}`, description: `Customer ID: ${id}` });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">📦 Subscription Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active", value: activeCount, icon: Users, color: "text-green-600" },
          { label: "Trial", value: trialCount, icon: Clock, color: "text-blue-600" },
          { label: "Paused", value: pausedCount, icon: Pause, color: "text-yellow-600" },
          { label: "Cancelled", value: cancelledCount, icon: XCircle, color: "text-red-600" },
        ].map(m => (
          <Card key={m.label} className="border-border">
            <CardContent className="p-3 flex items-center gap-2">
              <m.icon className={`w-5 h-5 ${m.color}`} />
              <div>
                <p className="text-lg font-bold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Active Revenue</p>
            <p className="text-lg font-bold text-primary">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Avg Order Value</p>
            <p className="text-lg font-bold text-foreground">${Math.round(avgOrderValue).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Insights */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3 space-y-2">
          <p className="text-[10px] font-bold text-foreground flex items-center gap-1">🧠 Intelligence Insights</p>
          <div className="space-y-1.5">
            {[
              { emoji: "🚨", text: `${pausedCount} paused subscribers — ${pausedCount > 0 ? "review for win-back campaigns" : "all good!"}`, severity: pausedCount > 2 ? "high" : "low" },
              { emoji: "📊", text: `${cancelledCount} cancellations this period. Churn rate: ${((cancelledCount / Math.max(activeCount + trialCount + cancelledCount, 1)) * 100).toFixed(1)}%`, severity: cancelledCount > 3 ? "high" : "low" },
              { emoji: "💰", text: `Avg subscription value: $${Math.round(avgOrderValue)} — ${avgOrderValue > 140 ? "healthy" : "consider upsell campaigns"}`, severity: "low" },
              { emoji: "📈", text: `${trialCount} trial users — prime for conversion to weekly plan`, severity: trialCount > 0 ? "medium" : "low" },
            ].map((insight, i) => (
              <p key={i} className={`text-[10px] ${insight.severity === "high" ? "text-destructive font-semibold" : insight.severity === "medium" ? "text-primary" : "text-muted-foreground"}`}>
                {insight.emoji} {insight.text}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, mobile, plan..." className="pl-8 h-9 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Customers Table */}
      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Customer</TableHead>
              <TableHead className="text-[10px]">Plan</TableHead>
              <TableHead className="text-[10px]">Duration</TableHead>
              <TableHead className="text-[10px]">Status</TableHead>
              <TableHead className="text-[10px]">Partner</TableHead>
              <TableHead className="text-[10px]">Paid</TableHead>
              <TableHead className="text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map(c => {
              const sc = statusConfig[c.status];
              return (
                <TableRow key={c.id}>
                  <TableCell className="text-xs">
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.mobile}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <p className="text-foreground">{c.planName}</p>
                    <p className="text-[10px] text-muted-foreground">{c.persons}p • {c.slots.join(", ")}</p>
                  </TableCell>
                  <TableCell className="text-xs">{c.duration}</TableCell>
                  <TableCell><Badge className={`text-[9px] ${sc.color}`}>{sc.label}</Badge></TableCell>
                  <TableCell className="text-xs text-foreground">{c.partnerName || "—"}</TableCell>
                  <TableCell className="text-xs font-medium">${c.totalPaid.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelectedCustomer(c)} title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {c.status === "active" && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-yellow-600" onClick={() => handleStatusChange(c.id, "paused")} title="Pause">
                          <Pause className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {c.status === "paused" && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => handleStatusChange(c.id, "active")} title="Resume">
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Customer Detail */}
      {selectedCustomer && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{selectedCustomer.name} — {selectedCustomer.id}</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setSelectedCustomer(null)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedCustomer.mobile}</p>
              <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedCustomer.email}</p>
              <p className="flex items-center gap-1"><Package className="w-3 h-3" /> {selectedCustomer.planName}</p>
              <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedCustomer.startDate} → {selectedCustomer.endDate}</p>
              <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedCustomer.address}</p>
              <p className="flex items-center gap-1"><ChefHat className="w-3 h-3" /> {selectedCustomer.partnerName || "Unallocated"}</p>
            </div>
            {selectedCustomer.skippedSessions.length > 0 && (
              <div className="text-muted-foreground text-xs space-y-0.5">
                <p className="font-semibold">Skipped Sessions:</p>
                {selectedCustomer.skippedSessions.map((s, i) => (
                  <p key={i}>• {s.date} — <span className="capitalize">{s.slot}</span></p>
                ))}
              </div>
            )}
            {selectedCustomer.pauseReason && <p className="text-yellow-600">Pause reason: {selectedCustomer.pauseReason}</p>}
            {selectedCustomer.cancelReason && <p className="text-destructive">Cancel reason: {selectedCustomer.cancelReason}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSubDashboard;
