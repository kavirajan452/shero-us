import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Check, X, Clock, BadgePercent, Phone, User, Hash, DollarSign,
} from "lucide-react";

interface DiscountRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderAmount: number;
  requestedDiscount: number;
  reason: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedDiscount?: number;
}

const mockDiscountRequests: DiscountRequest[] = [
  {
    id: "DR001",
    orderId: "PTY-2025-0042",
    customerName: "Priya Lakshmi",
    customerPhone: "9876543210",
    orderAmount: 14000,
    requestedDiscount: 1400,
    reason: "Repeat customer — 3rd party order this month",
    requestedAt: "2025-06-14 10:30 AM",
    status: "pending",
  },
  {
    id: "DR002",
    orderId: "PTY-2025-0038",
    customerName: "Arjun Kumar",
    customerPhone: "9123456789",
    orderAmount: 22000,
    requestedDiscount: 2200,
    reason: "Corporate bulk order — requesting 10% off",
    requestedAt: "2025-06-13 03:15 PM",
    status: "pending",
  },
  {
    id: "DR003",
    orderId: "PTY-2025-0035",
    customerName: "Meena Devi",
    customerPhone: "9988776655",
    orderAmount: 8500,
    requestedDiscount: 850,
    reason: "Referred by existing customer",
    requestedAt: "2025-06-12 11:00 AM",
    status: "approved",
    approvedBy: "TL Ramesh",
    approvedDiscount: 600,
  },
  {
    id: "DR004",
    orderId: "PTY-2025-0030",
    customerName: "Suresh Babu",
    customerPhone: "9112233445",
    orderAmount: 5000,
    requestedDiscount: 1000,
    reason: "Requesting 20% off — too high",
    requestedAt: "2025-06-11 09:45 AM",
    status: "rejected",
  },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: Check },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: X },
};

const AdminPartyDiscounts = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<DiscountRequest[]>(mockDiscountRequests);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [approvalAmounts, setApprovalAmounts] = useState<Record<string, string>>({});

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.orderId.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerPhone.includes(search);
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const handleApprove = (id: string) => {
    const customAmount = approvalAmounts[id];
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const approvedAmt = customAmount ? parseInt(customAmount) : req.requestedDiscount;
    if (isNaN(approvedAmt) || approvedAmt <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "approved" as const, approvedBy: "TL (You)", approvedDiscount: approvedAmt } : r
      )
    );
    toast({ title: "✅ Discount Approved", description: `$${approvedAmt} discount approved for ${req.orderId}` });
  };

  const handleReject = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r))
    );
    toast({ title: "❌ Discount Rejected", description: `Discount request for ${req.orderId} has been rejected.` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">🏷️ Discount Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve discount requests for party orders. Only Team Leaders and above can approve.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Pending</p>
          <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Approved</p>
          <p className="text-xl font-bold text-green-600">{requests.filter((r) => r.status === "approved").length}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Rejected</p>
          <p className="text-xl font-bold text-red-600">{requests.filter((r) => r.status === "rejected").length}</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            {s === "pending" && pendingCount > 0 && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Requests */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <BadgePercent className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No discount requests found</p>
          </Card>
        ) : (
          filtered.map((req) => {
            const cfg = statusConfig[req.status];
            const StatusIcon = cfg.icon;
            return (
              <Card key={req.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm">{req.orderId}</p>
                      <Badge className={`${cfg.color} text-[10px] gap-1`}>
                        <StatusIcon className="w-3 h-3" /> {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{req.requestedAt}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {req.customerName}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {req.customerPhone}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Order: ${req.orderAmount.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><BadgePercent className="w-3 h-3" /> Requested: ${req.requestedDiscount.toLocaleString()}</span>
                </div>

                <div className="mt-2 p-2 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-[10px] text-muted-foreground font-medium">Reason:</p>
                  <p className="text-xs text-foreground">{req.reason}</p>
                </div>

                {req.status === "approved" && (
                  <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-300 text-xs">
                    <p className="text-green-800 dark:text-green-300 font-medium">✅ Approved: ${req.approvedDiscount?.toLocaleString()}</p>
                    <p className="text-[10px] text-green-600 dark:text-green-400">By: {req.approvedBy}</p>
                  </div>
                )}

                {req.status === "pending" && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">Approve $:</span>
                      <Input
                        type="number"
                        placeholder={`${req.requestedDiscount}`}
                        value={approvalAmounts[req.id] || ""}
                        onChange={(e) => setApprovalAmounts((prev) => ({ ...prev, [req.id]: e.target.value }))}
                        className="h-8 text-xs w-24"
                      />
                      <span className="text-[10px] text-muted-foreground">of ${req.orderAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminPartyDiscounts;
