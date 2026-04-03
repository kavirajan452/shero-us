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
  Calendar, CalendarIcon, DollarSign, Building2, Navigation, Edit3, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAdminRole } from "@/data/adminRoles";
import { addOrderModification } from "@/data/sscOrderModifications";

/* ── Types ── */

type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "in_transit" | "delivered" | "cancelled" | "rejected";
type ServiceType = "instant" | "subscription" | "party" | "swiggy" | "zomato";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface AdminOrder {
  id: string;
  customer: string;
  customerPhone: string;
  partner: string;
  partnerRMN: string;
  kitchen: string;
  skid: string;
  cuisine: string;
  state: string;
  city: string;
  pincode: string;
  kitchenAddress: string;
  kitchenMapUrl: string;
  items: OrderItem[];
  total: number;
  pppTotal: number;
  status: OrderStatus;
  serviceType: ServiceType;
  paymentMode: "online" | "cod";
  placedAt: string;
  cookingInstructions?: string;
  date: string;
}

/* ── Mock Data ── */

const mockOrders: AdminOrder[] = [
  {
    id: "ORD-1001", customer: "Ramesh K.", customerPhone: "+91 98765 11111",
    partner: "Sujatha M.", partnerRMN: "+91 98765 43210", kitchen: "Shero – Chettinad (Veg)",
    skid: "SK-0001", cuisine: "Chettinad", state: "Tamil Nadu", city: "Chennai", pincode: "600001",
    kitchenAddress: "12/3, 2nd Cross, Anna Nagar, Chennai - 600040",
    kitchenMapUrl: "https://maps.google.com/?q=13.0850,80.2101",
    items: [{ name: "Chinna Vengayam Sambar", qty: 2, price: 167 }, { name: "Carrot Beans Poriyal", qty: 1, price: 196 }],
    total: 530, pppTotal: 345, status: "preparing", serviceType: "instant", paymentMode: "online",
    placedAt: "12:35 PM", cookingInstructions: "Less spicy please", date: "2026-03-02",
  },
  {
    id: "ORD-1002", customer: "Anita P.", customerPhone: "+91 87654 22222",
    partner: "Priya K.", partnerRMN: "+91 87654 32109", kitchen: "Priya's Kitchen",
    skid: "SK-0004", cuisine: "North Indian", state: "Karnataka", city: "Bengaluru", pincode: "560001",
    kitchenAddress: "45, 1st Main Rd, Koramangala, Bengaluru - 560034",
    kitchenMapUrl: "https://maps.google.com/?q=12.9352,77.6245",
    items: [{ name: "Paneer Butter Masala", qty: 1, price: 229 }, { name: "Dal Makhani", qty: 1, price: 199 }, { name: "Butter Naan", qty: 3, price: 40 }],
    total: 548, pppTotal: 356, status: "pending", serviceType: "instant", paymentMode: "cod",
    placedAt: "12:50 PM", date: "2026-03-02",
  },
  {
    id: "ORD-1003", customer: "Vijay S.", customerPhone: "+91 76543 33333",
    partner: "Lakshmi R.", partnerRMN: "+91 76543 21098", kitchen: "Shero – Andhra (Non-Veg)",
    skid: "SK-0006", cuisine: "Andhra", state: "Telangana", city: "Hyderabad", pincode: "500032",
    kitchenAddress: "78, Jubilee Hills, Hyderabad - 500033",
    kitchenMapUrl: "https://maps.google.com/?q=17.4325,78.4073",
    items: [{ name: "Gutti Vankaya Kura", qty: 2, price: 220 }, { name: "Pappu (Dal)", qty: 1, price: 155 }],
    total: 595, pppTotal: 387, status: "ready", serviceType: "instant", paymentMode: "online",
    placedAt: "11:45 AM", date: "2026-03-02",
  },
  {
    id: "ORD-1004", customer: "Deepa M.", customerPhone: "+91 65432 44444",
    partner: "Sujatha M.", partnerRMN: "+91 98765 43210", kitchen: "Suji's Kitchen",
    skid: "SK-0003", cuisine: "North Indian", state: "Tamil Nadu", city: "Chennai", pincode: "600028",
    kitchenAddress: "12/3, 2nd Cross, Anna Nagar, Chennai - 600040",
    kitchenMapUrl: "https://maps.google.com/?q=13.0850,80.2101",
    items: [{ name: "Chole", qty: 1, price: 179 }, { name: "Aloo Gobi", qty: 1, price: 165 }],
    total: 344, pppTotal: 224, status: "delivered", serviceType: "instant", paymentMode: "online",
    placedAt: "10:30 AM", date: "2026-03-02",
  },
  {
    id: "ORD-1005", customer: "Karthik R.", customerPhone: "+91 54321 55555",
    partner: "Meena S.", partnerRMN: "+91 65432 10987", kitchen: "Meena's Kitchen",
    skid: "SK-0007", cuisine: "Gujarati", state: "Maharashtra", city: "Mumbai", pincode: "400001",
    kitchenAddress: "23, Marine Lines, Mumbai - 400020",
    kitchenMapUrl: "https://maps.google.com/?q=18.9433,72.8235",
    items: [{ name: "Undhiyu", qty: 1, price: 230 }, { name: "Kadhi", qty: 1, price: 155 }],
    total: 385, pppTotal: 250, status: "cancelled", serviceType: "instant", paymentMode: "cod",
    placedAt: "09:15 AM", date: "2026-03-01",
  },
  {
    id: "ORD-1006", customer: "Priya L.", customerPhone: "+91 43210 66666",
    partner: "Kamala R.", partnerRMN: "+91 51234 56789", kitchen: "Kamala's Subscription Meals",
    skid: "SK-0017", cuisine: "Mughlai", state: "Uttar Pradesh", city: "Lucknow", pincode: "226001",
    kitchenAddress: "56, Hazratganj, Lucknow - 226001",
    kitchenMapUrl: "https://maps.google.com/?q=26.8467,80.9462",
    items: [{ name: "Shahi Paneer", qty: 1, price: 245 }, { name: "Dal Mughlai", qty: 1, price: 199 }],
    total: 444, pppTotal: 289, status: "accepted", serviceType: "subscription", paymentMode: "online",
    placedAt: "07:00 AM", date: "2026-03-02",
  },
  {
    id: "ORD-1007", customer: "Suresh V.", customerPhone: "+91 32109 77777",
    partner: "Padma V.", partnerRMN: "+91 71234 56789", kitchen: "Padma's Party Kitchen",
    skid: "SK-0015", cuisine: "Marathi", state: "Maharashtra", city: "Nagpur", pincode: "440001",
    kitchenAddress: "99, Dharampeth, Nagpur - 440010",
    kitchenMapUrl: "https://maps.google.com/?q=21.1458,79.0882",
    items: [{ name: "Bharli Vangi", qty: 5, price: 195 }, { name: "Puran Poli", qty: 10, price: 140 }, { name: "Amti Dal", qty: 5, price: 160 }],
    total: 3175, pppTotal: 2064, status: "in_transit", serviceType: "party", paymentMode: "online",
    placedAt: "Yesterday", date: "2026-03-01",
  },
  {
    id: "ORD-1008", customer: "Meera T.", customerPhone: "+91 21098 88888",
    partner: "Lakshmi R.", partnerRMN: "+91 76543 21098", kitchen: "Lakshmi's Home Kitchen",
    skid: "SK-0018", cuisine: "Andhra", state: "Telangana", city: "Hyderabad", pincode: "500001",
    kitchenAddress: "78, Jubilee Hills, Hyderabad - 500033",
    kitchenMapUrl: "https://maps.google.com/?q=17.4325,78.4073",
    items: [{ name: "Bendakaya Vepudu", qty: 1, price: 190 }],
    total: 190, pppTotal: 124, status: "rejected", serviceType: "instant", paymentMode: "online",
    placedAt: "Yesterday", date: "2026-03-01",
  },
  {
    id: "SWG-2001", customer: "Arun D.", customerPhone: "+91 91234 99901",
    partner: "Sujatha M.", partnerRMN: "+91 98765 43210", kitchen: "Shero – Chettinad (Veg)",
    skid: "SK-0001", cuisine: "Chettinad", state: "Tamil Nadu", city: "Chennai", pincode: "600040",
    kitchenAddress: "12/3, 2nd Cross, Anna Nagar, Chennai - 600040",
    kitchenMapUrl: "https://maps.google.com/?q=13.0850,80.2101",
    items: [{ name: "Veg Meals Combo", qty: 2, price: 189 }],
    total: 378, pppTotal: 246, status: "preparing", serviceType: "swiggy", paymentMode: "online",
    placedAt: "1:10 PM", date: "2026-03-02",
  },
  {
    id: "SWG-2002", customer: "Neha R.", customerPhone: "+91 91234 99902",
    partner: "Priya K.", partnerRMN: "+91 87654 32109", kitchen: "Priya's Kitchen",
    skid: "SK-0004", cuisine: "North Indian", state: "Karnataka", city: "Bengaluru", pincode: "560034",
    kitchenAddress: "45, 1st Main Rd, Koramangala, Bengaluru - 560034",
    kitchenMapUrl: "https://maps.google.com/?q=12.9352,77.6245",
    items: [{ name: "Rajma Chawal", qty: 1, price: 179 }, { name: "Raita", qty: 1, price: 49 }],
    total: 228, pppTotal: 148, status: "accepted", serviceType: "swiggy", paymentMode: "online",
    placedAt: "12:45 PM", date: "2026-03-02",
  },
  {
    id: "ZMT-3001", customer: "Farhan S.", customerPhone: "+91 91234 99903",
    partner: "Lakshmi R.", partnerRMN: "+91 76543 21098", kitchen: "Shero – Andhra (Non-Veg)",
    skid: "SK-0006", cuisine: "Andhra", state: "Telangana", city: "Hyderabad", pincode: "500032",
    kitchenAddress: "78, Jubilee Hills, Hyderabad - 500033",
    kitchenMapUrl: "https://maps.google.com/?q=17.4325,78.4073",
    items: [{ name: "Chicken Biryani", qty: 2, price: 249 }, { name: "Mirchi Ka Salan", qty: 1, price: 99 }],
    total: 597, pppTotal: 388, status: "ready", serviceType: "zomato", paymentMode: "online",
    placedAt: "11:30 AM", date: "2026-03-02",
  },
  {
    id: "ZMT-3002", customer: "Sneha M.", customerPhone: "+91 91234 99904",
    partner: "Meena S.", partnerRMN: "+91 65432 10987", kitchen: "Meena's Kitchen",
    skid: "SK-0007", cuisine: "Gujarati", state: "Maharashtra", city: "Mumbai", pincode: "400020",
    kitchenAddress: "23, Marine Lines, Mumbai - 400020",
    kitchenMapUrl: "https://maps.google.com/?q=18.9433,72.8235",
    items: [{ name: "Thali Special", qty: 1, price: 299 }],
    total: 299, pppTotal: 194, status: "in_transit", serviceType: "zomato", paymentMode: "online",
    placedAt: "12:00 PM", date: "2026-03-02",
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", icon: CheckCircle2 },
  preparing: { label: "Preparing", color: "bg-primary/15 text-primary", icon: ChefHat },
  ready: { label: "Ready", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400", icon: Package },
  in_transit: { label: "In Transit", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400", icon: Truck },
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
  const [stateFilter, setStateFilter] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationOrder, setLocationOrder] = useState<AdminOrder | null>(null);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [modifyOrder, setModifyOrder] = useState<AdminOrder | null>(null);
  const [modifyType, setModifyType] = useState<string>("other");
  const [modifyDesc, setModifyDesc] = useState("");

  // SSC sees only today's orders
  const today = new Date().toISOString().slice(0, 10);
  const baseOrders = isSSC ? mockOrders.filter((o) => o.date === today) : mockOrders;

  const states = [...new Set(mockOrders.map((o) => o.state))].sort();
  const cuisines = [...new Set(mockOrders.map((o) => o.cuisine))].sort();

  const filtered = useMemo(() => {
    return baseOrders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (stateFilter !== "all" && o.state !== stateFilter) return false;
      if (cuisineFilter !== "all" && o.cuisine !== cuisineFilter) return false;
      if (channelFilter !== "all" && o.serviceType !== channelFilter) return false;
      if (dateFrom && o.date < format(dateFrom, "yyyy-MM-dd")) return false;
      if (dateTo && o.date > format(dateTo, "yyyy-MM-dd")) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.id.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q) && !o.partner.toLowerCase().includes(q) && !o.kitchen.toLowerCase().includes(q) && !o.pincode.includes(q)) return false;
      }
      return true;
    });
  }, [baseOrders, search, statusFilter, stateFilter, cuisineFilter, channelFilter, dateFrom, dateTo]);

  const liveOrders = baseOrders.filter((o) => ["pending", "accepted", "preparing", "ready", "in_transit"].includes(o.status));
  const completedOrders = baseOrders.filter((o) => o.status === "delivered");

  const showLocation = (order: AdminOrder) => {
    setLocationOrder(order);
    setShowLocationDialog(true);
  };

  const handleCancelOrder = (orderId: string) => {
    toast({ title: `Order ${orderId} Cancelled`, description: "Customer and partner have been notified.", variant: "destructive" });
    setSelectedOrder(null);
  };

  const handleSendPaymentLink = (orderId: string) => {
    toast({ title: "Payment Link Sent", description: `Payment link sent to customer for order ${orderId}` });
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSSC ? "Today's live orders — SSC Call Center view" : "All orders across partners, kitchens & services"}
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
        const packingCharges = filtered.filter((o) => o.status !== "cancelled" && o.status !== "rejected").reduce((s, o) => s + o.items.reduce((is, i) => is + i.qty, 0) * 5, 0);
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Live Orders</p>
              <p className="text-lg font-bold text-foreground">{liveOrders.length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Completed Today</p>
              <p className="text-lg font-bold text-foreground">{completedOrders.length}</p>
            </CardContent></Card>
            {!isSSC && (
              <>
                <Card><CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground">Total MRP Value</p>
                  <p className="text-lg font-bold text-foreground">${filtered.reduce((s, o) => s + o.total, 0).toLocaleString()}</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground">Total Orders</p>
                  <p className="text-lg font-bold text-foreground">{filtered.length}</p>
                </CardContent></Card>
              </>
            )}
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Packing Charges</p>
              <p className="text-lg font-bold text-foreground">${packingCharges.toLocaleString()}</p>
              <p className="text-[9px] text-muted-foreground">$5/item</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Cancelled Orders</p>
              <p className="text-lg font-bold text-destructive">{cancelledOrders.length}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Cancelled Sales</p>
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
            <Input placeholder="Search order, customer, partner, kitchen, PIN..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
          <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Cuisine" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cuisines</SelectItem>
            {cuisines.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Channel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="instant">Instant</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="party">Party</SelectItem>
            <SelectItem value="swiggy">Swiggy</SelectItem>
            <SelectItem value="zomato">Zomato</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 text-xs gap-1.5 min-w-[130px] justify-start">
              <CalendarIcon className="w-3.5 h-3.5" />
              {dateFrom ? format(dateFrom, "dd MMM") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 text-xs gap-1.5 min-w-[130px] justify-start">
              <CalendarIcon className="w-3.5 h-3.5" />
              {dateTo ? format(dateTo, "dd MMM") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        {(dateFrom || dateTo) && (
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-[10px] font-semibold">Order</TableHead>
              <TableHead className="text-[10px] font-semibold">Customer</TableHead>
              <TableHead className="text-[10px] font-semibold">Kitchen / Partner</TableHead>
              <TableHead className="text-[10px] font-semibold">Location</TableHead>
              <TableHead className="text-[10px] font-semibold">Type</TableHead>
              <TableHead className="text-[10px] font-semibold text-right">Amount</TableHead>
              <TableHead className="text-[10px] font-semibold">Status</TableHead>
              <TableHead className="text-[10px] font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => {
              const cfg = statusConfig[o.status];
              const StatusIcon = cfg.icon;
              return (
                <TableRow key={o.id} className="hover:bg-muted/20">
                  <TableCell className="py-2.5">
                    <p className="text-xs font-bold text-foreground font-mono">{o.id}</p>
                    <p className="text-[10px] text-muted-foreground">{o.placedAt} · {o.paymentMode.toUpperCase()}</p>
                    {o.cookingInstructions && (
                      <p className="text-[9px] text-primary mt-0.5 italic">🍳 {o.cookingInstructions}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-foreground">{o.customer}</p>
                    <a href={`tel:${o.customerPhone.replace(/\s/g, '')}`} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {o.customerPhone}
                    </a>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-foreground">{o.kitchen}</p>
                    <p className="text-[10px] text-muted-foreground">{o.partner} · {o.skid}</p>
                    <a href={`tel:${o.partnerRMN.replace(/\s/g, '')}`} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {o.partnerRMN}
                    </a>
                  </TableCell>
                  <TableCell>
                    <p className="text-[10px] text-muted-foreground">{o.city}, {o.state}</p>
                    <p className="text-[10px] text-muted-foreground">PIN: {o.pincode}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[9px] capitalize ${o.serviceType === "swiggy" ? "border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950" : o.serviceType === "zomato" ? "border-red-500 text-red-600 bg-red-50 dark:bg-red-950" : ""}`}>{o.serviceType}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <p className="text-xs font-semibold text-foreground">${o.total.toLocaleString()}</p>
                    {!isSSC && <p className="text-[9px] text-muted-foreground">PPP: ${o.pppTotal}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${cfg.color} text-[9px] border-0 gap-1`}>
                      <StatusIcon className="w-3 h-3" /> {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedOrder(o)} title="View details">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => showLocation(o)} title="Kitchen location">
                        <Navigation className="w-3.5 h-3.5 text-primary" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No orders match the filters.</p>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  Order {selectedOrder.id}
                  <Badge className={`${statusConfig[selectedOrder.status].color} text-[9px] border-0`}>
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Customer & Kitchen */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Customer</p>
                    <p className="font-medium text-foreground">{selectedOrder.customer}</p>
                    <p className="text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedOrder.customerPhone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Kitchen</p>
                    <p className="font-medium text-foreground">{selectedOrder.kitchen}</p>
                    <p className="text-muted-foreground">{selectedOrder.partner} · {selectedOrder.skid}</p>
                    <Button size="sm" variant="outline" className="text-[10px] h-6 gap-1 mt-1" onClick={() => showLocation(selectedOrder)}>
                      <MapPin className="w-3 h-3" /> View Location
                    </Button>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-border pt-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Order Items</p>
                  <div className="space-y-1.5">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-foreground">{item.qty}× {item.name}</span>
                        <span className="text-foreground font-medium">${(item.qty * item.price).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs border-t border-border pt-1.5 font-semibold">
                      <span className="text-foreground">Total (MRP)</span>
                      <span className="text-foreground">${selectedOrder.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Packing Charges ({selectedOrder.items.reduce((s, i) => s + i.qty, 0)} items × $5)</span>
                      <span>${(selectedOrder.items.reduce((s, i) => s + i.qty, 0) * 5).toLocaleString()}</span>
                    </div>
                    {!isSSC && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Partner Price (PPP)</span>
                        <span>${selectedOrder.pppTotal.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.cookingInstructions && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5">
                    <p className="text-[10px] font-semibold text-primary mb-0.5">🍳 Cooking Instructions</p>
                    <p className="text-xs text-foreground">{selectedOrder.cookingInstructions}</p>
                  </div>
                )}

                {/* SSC Actions */}
                <div className="border-t border-border pt-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {["pending", "accepted", "preparing", "ready"].includes(selectedOrder.status) && (
                      <Button size="sm" variant="destructive" className="text-xs gap-1" onClick={() => handleCancelOrder(selectedOrder.id)}>
                        <XCircle className="w-3 h-3" /> Cancel Order
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => handleSendPaymentLink(selectedOrder.id)}>
                      <Send className="w-3 h-3" /> Send Payment Link
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      <Plus className="w-3 h-3" /> Add Item
                    </Button>
                    {["pending", "accepted", "preparing", "ready"].includes(selectedOrder.status) && (
                      <Button size="sm" variant="outline" className="text-xs gap-1 border-primary text-primary" onClick={() => {
                        setModifyOrder(selectedOrder);
                        setShowModifyDialog(true);
                        setSelectedOrder(null);
                      }}>
                        <Edit3 className="w-3 h-3" /> Request Modify
                      </Button>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="text-[10px] text-muted-foreground flex flex-wrap gap-3 pt-2 border-t border-border">
                  <span>Placed: {selectedOrder.placedAt}</span>
                  <span>Payment: {selectedOrder.paymentMode.toUpperCase()}</span>
                  <span>Service: {selectedOrder.serviceType}</span>
                  <span>PIN: {selectedOrder.pincode}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Kitchen Location Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="max-w-sm">
          {locationOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Kitchen Location
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">{locationOrder.kitchen}</p>
                  <p className="text-[10px] text-muted-foreground">{locationOrder.partner} · {locationOrder.skid}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-foreground">{locationOrder.kitchenAddress}</p>
                </div>
                <Button className="w-full gap-1.5 text-xs" asChild>
                  <a href={locationOrder.kitchenMapUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-3.5 h-3.5" /> Open in Google Maps
                  </a>
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Share this location with the delivery rider for pickup guidance.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Modification Request Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-w-sm">
          {modifyOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary" /> Request Order Modification
                </DialogTitle>
                <DialogDescription className="text-xs">
                  This will notify SSC to process the modification for <span className="font-semibold">{modifyOrder.id}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground">Customer: <span className="text-foreground font-medium">{modifyOrder.customer}</span></p>
                  <p className="text-muted-foreground">Kitchen: <span className="text-foreground font-medium">{modifyOrder.kitchen}</span></p>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Modification Type</label>
                  <Select value={modifyType} onValueChange={setModifyType}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add_item">Add Item</SelectItem>
                      <SelectItem value="remove_item">Remove Item</SelectItem>
                      <SelectItem value="change_item">Change Item</SelectItem>
                      <SelectItem value="change_qty">Change Quantity</SelectItem>
                      <SelectItem value="cancel_item">Cancel Specific Item</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Description</label>
                  <Textarea
                    value={modifyDesc}
                    onChange={(e) => setModifyDesc(e.target.value)}
                    placeholder="Describe what the customer wants to change..."
                    className="text-xs mt-1 min-h-[60px]"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowModifyDialog(false)}>Cancel</Button>
                <Button size="sm" className="text-xs gap-1" onClick={handleRequestModification} disabled={!modifyDesc.trim()}>
                  <Send className="w-3 h-3" /> Send to SSC
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
