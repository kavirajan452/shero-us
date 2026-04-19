import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye, Search, MapPin, Clock, CheckCircle2, XCircle, Truck, ChefHat,
  Phone, Plus, Minus, Ban, Send, ClipboardList, Package, AlertTriangle,
  Calendar, CalendarIcon, DollarSign, Building2, Navigation, Edit3, X, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAdminRole } from "@/data/adminRoles";
import { addOrderModification } from "@/data/sscOrderModifications";
import { useInstantOrders } from "@/hooks/useSupabaseData";

/* ── Types ── */
type OrderStatus = "new" | "pending" | "accepted" | "preparing" | "ready" | "in_transit" | "picked_up" | "delivered" | "cancelled" | "rejected";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface AdminOrder {
  id: string;
  dbId: string;
  customer: string;
  customerPhone: string;
  partner: string;
  partnerRMN: string;
  kitchen: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  serviceType: string;
  paymentMode: "online" | "cod";
  placedAt: string;
  cookingInstructions?: string;
  deliveryInstructions?: string;
  pickupInstructions?: string;
  date: string;
  orderType: string;
}

const mapSupabaseToAdmin = (row: any): AdminOrder => {
  const items: OrderItem[] = Array.isArray(row.items)
    ? row.items.map((i: any) => ({ name: i.name || "Item", qty: i.qty || i.quantity || 1, price: i.price || 0 }))
    : [];

  return {
    id: row.order_code || row.id,
    dbId: row.id,
    customer: row.customer_name || "Unknown",
    customerPhone: row.customer_phone || "",
    partner: row.partner_id || "Unassigned",
    partnerRMN: "",
    kitchen: row.kitchen_name || "—",
    items,
    total: row.total || 0,
    status: (row.status as OrderStatus) || "new",
    serviceType: row.order_type || "instant",
    paymentMode: row.payment_method === "cod" ? "cod" : "online",
    placedAt: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    cookingInstructions: row.cooking_instructions || undefined,
    deliveryInstructions: row.delivery_instructions || undefined,
    pickupInstructions: row.pickup_instructions || undefined,
    date: row.created_at?.split("T")[0] || "",
    orderType: row.order_type || "instant",
  };
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: "New", color: "bg-destructive/15 text-destructive", icon: Clock },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", icon: CheckCircle2 },
  preparing: { label: "Preparing", color: "bg-primary/15 text-primary", icon: ChefHat },
  ready: { label: "Ready", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400", icon: Package },
  in_transit: { label: "In Transit", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400", icon: Truck },
  picked_up: { label: "Picked Up", color: "bg-secondary text-secondary-foreground", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400", icon: XCircle },
  rejected: { label: "Rejected", color: "bg-muted text-muted-foreground", icon: Ban },
};

const SSC_ROLES = ["ssc_manager", "ssc_tl", "ssc_executor"];

export default function AdminOrders() {
  const role = getAdminRole();
  const isSSC = role && SSC_ROLES.includes(role);
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [modifyOrder, setModifyOrder] = useState<AdminOrder | null>(null);
  const [modifyType, setModifyType] = useState<string>("other");
  const [modifyDesc, setModifyDesc] = useState("");

  // ── Supabase data ──
  const { data: rawOrders = [], isLoading } = useInstantOrders();
  const allOrders: AdminOrder[] = useMemo(() => rawOrders.map(mapSupabaseToAdmin), [rawOrders]);

  const today = new Date().toISOString().slice(0, 10);
  const baseOrders = isSSC ? allOrders.filter((o) => o.date === today) : allOrders;

  const filtered = useMemo(() => {
    return baseOrders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (channelFilter !== "all" && o.serviceType !== channelFilter) return false;
      if (dateFrom && o.date < format(dateFrom, "yyyy-MM-dd")) return false;
      if (dateTo && o.date > format(dateTo, "yyyy-MM-dd")) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.id.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q) && !o.kitchen.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [baseOrders, search, statusFilter, channelFilter, dateFrom, dateTo]);

  const liveOrders = baseOrders.filter((o) => ["new", "accepted", "preparing", "ready", "in_transit", "picked_up"].includes(o.status));
  const completedOrders = baseOrders.filter((o) => o.status === "delivered");

  const handleCancelOrder = (orderId: string) => {
    toast({ title: `Order ${orderId} Cancelled`, description: "Customer and partner have been notified.", variant: "destructive" });
    setSelectedOrder(null);
  };

  const handleRequestModification = () => {
    if (!modifyOrder || !modifyDesc.trim()) return;
    addOrderModification({
      orderId: modifyOrder.id,
      customerName: modifyOrder.customer,
      customerPhone: modifyOrder.customerPhone,
      kitchenName: modifyOrder.kitchen,
      partnerName: modifyOrder.partner,
      modificationType: modifyType as any,
      description: modifyDesc.trim(),
    });
    toast({ title: "Modification Request Sent", description: `SSC notified for order ${modifyOrder.id}` });
    setShowModifyDialog(false);
    setModifyOrder(null);
    setModifyDesc("");
    setModifyType("other");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSSC ? "Today's live orders — SSC Call Center view" : `All orders across partners & kitchens (${allOrders.length} total)`}
          </p>
        </div>
        {isSSC && (
          <Badge variant="outline" className="text-xs gap-1">
            <Calendar className="w-3 h-3" /> Today Only
          </Badge>
        )}
      </div>

      {/* Summary cards */}
      {(() => {
        const cancelledOrders = filtered.filter((o) => o.status === "cancelled" || o.status === "rejected");
        const cancelledSales = cancelledOrders.reduce((s, o) => s + o.total, 0);
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Live Orders</p>
              <p className="text-lg font-bold text-foreground">{liveOrders.length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Completed</p>
              <p className="text-lg font-bold text-foreground">{completedOrders.length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold text-foreground">${filtered.reduce((s, o) => s + o.total, 0).toLocaleString()}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Total Orders</p>
              <p className="text-lg font-bold text-foreground">{filtered.length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Cancelled</p>
              <p className="text-lg font-bold text-destructive">{cancelledOrders.length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Lost Revenue</p>
              <p className="text-lg font-bold text-destructive">${cancelledSales.toLocaleString()}</p>
            </CardContent></Card>
          </div>
        );
      })()}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, customer, kitchen..."
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Channel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="instant">Instant</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <CalendarIcon className="w-3.5 h-3.5" />
              {dateFrom ? format(dateFrom, "MMM d") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} /></PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <CalendarIcon className="w-3.5 h-3.5" />
              {dateTo ? format(dateTo, "MMM d") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} /></PopoverContent>
        </Popover>
        {(dateFrom || dateTo || statusFilter !== "all" || channelFilter !== "all") && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setDateFrom(undefined); setDateTo(undefined); setStatusFilter("all"); setChannelFilter("all"); }}>
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Orders table */}
      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px] w-[100px]">Order ID</TableHead>
              <TableHead className="text-[10px]">Customer</TableHead>
              <TableHead className="text-[10px]">Kitchen</TableHead>
              <TableHead className="text-[10px]">Items</TableHead>
              <TableHead className="text-[10px]">Total</TableHead>
              <TableHead className="text-[10px]">Status</TableHead>
              <TableHead className="text-[10px]">Type</TableHead>
              <TableHead className="text-[10px]">Time</TableHead>
              <TableHead className="text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => {
                const cfg = statusConfig[order.status] || statusConfig.new;
                return (
                  <TableRow key={order.dbId} className="cursor-pointer hover:bg-secondary/30" onClick={() => setSelectedOrder(order)}>
                    <TableCell className="text-xs font-mono font-medium">{order.id}</TableCell>
                    <TableCell className="text-xs">
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-[10px] text-muted-foreground">{order.customerPhone}</p>
                    </TableCell>
                    <TableCell className="text-xs">{order.kitchen}</TableCell>
                    <TableCell className="text-xs">{order.items.reduce((s, i) => s + i.qty, 0)} items</TableCell>
                    <TableCell className="text-xs font-medium">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${cfg.color} text-[9px] border-0`}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs capitalize">{order.orderType}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{order.placedAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setModifyOrder(order); setShowModifyDialog(true); }}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Order {selectedOrder.id}
                  <Badge className={`${(statusConfig[selectedOrder.status] || statusConfig.new).color} text-[10px]`}>
                    {(statusConfig[selectedOrder.status] || statusConfig.new).label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{selectedOrder.customer}</p></div>
                  <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedOrder.customerPhone}</p></div>
                  <div><p className="text-muted-foreground">Kitchen</p><p className="font-medium">{selectedOrder.kitchen}</p></div>
                  <div><p className="text-muted-foreground">Payment</p><p className="font-medium">{selectedOrder.paymentMode.toUpperCase()}</p></div>
                  <div><p className="text-muted-foreground">Type</p><p className="font-medium capitalize">{selectedOrder.orderType}</p></div>
                  <div><p className="text-muted-foreground">Placed At</p><p className="font-medium">{selectedOrder.placedAt}</p></div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-2">Items</p>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-1 border-b border-border last:border-0">
                      <span>{item.qty}× {item.name}</span>
                      <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.cookingInstructions && (
                  <div className="text-xs"><p className="text-muted-foreground">🍳 Cooking Instructions</p><p className="font-medium">{selectedOrder.cookingInstructions}</p></div>
                )}
                {selectedOrder.deliveryInstructions && (
                  <div className="text-xs"><p className="text-muted-foreground">🚚 Delivery Instructions</p><p className="font-medium">{selectedOrder.deliveryInstructions}</p></div>
                )}
                {selectedOrder.pickupInstructions && (
                  <div className="text-xs"><p className="text-muted-foreground">📦 Pickup Instructions</p><p className="font-medium">{selectedOrder.pickupInstructions}</p></div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => { setModifyOrder(selectedOrder); setShowModifyDialog(true); setSelectedOrder(null); }} className="text-xs gap-1">
                  <Edit3 className="w-3 h-3" /> Modify
                </Button>
                {!["delivered", "cancelled", "rejected"].includes(selectedOrder.status) && (
                  <Button variant="destructive" size="sm" onClick={() => handleCancelOrder(selectedOrder.id)} className="text-xs gap-1">
                    <XCircle className="w-3 h-3" /> Cancel Order
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modify Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={() => { setShowModifyDialog(false); setModifyOrder(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modify Order {modifyOrder?.id}</DialogTitle>
            <DialogDescription>Send a modification request to SSC</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={modifyType} onValueChange={setModifyType}>
              <SelectTrigger><SelectValue placeholder="Modification type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="add_item">Add Item</SelectItem>
                <SelectItem value="remove_item">Remove Item</SelectItem>
                <SelectItem value="change_qty">Change Quantity</SelectItem>
                <SelectItem value="address_change">Address Change</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea value={modifyDesc} onChange={(e) => setModifyDesc(e.target.value)} placeholder="Describe the modification..." rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModifyDialog(false); setModifyOrder(null); }}>Cancel</Button>
            <Button onClick={handleRequestModification} disabled={!modifyDesc.trim()} className="gap-1">
              <Send className="w-3 h-3" /> Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
