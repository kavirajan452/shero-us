import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import SSCPartnerChats from "@/components/admin/SSCPartnerChats";
import SSCFloatingChat from "@/components/admin/SSCFloatingChat";
import { getStockAlerts, updateStockAlertStatus, type SSCStockAlert } from "@/data/sscStockAlerts";
import { getOrderModifications, getNewModificationsCount, updateModificationStatus, subscribeModifications, type SSCOrderModification } from "@/data/sscOrderModifications";
import { getDelayComplaints, getNewDelayComplaintsCount, updateDelayComplaintStatus, subscribeDelayComplaints, type DelayComplaint } from "@/data/delayComplaints";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Search, Plus, Eye, CheckCircle2, Clock, XCircle, MessageSquare,
  UserCog, Building2, RefreshCw, FileText, AlertTriangle, Send, Headphones,
  Phone, Mail, MessageCircle, Star, ShieldAlert, DollarSign, BarChart3,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Users, ThumbsUp, ThumbsDown,
  Hash, MapPin, Gauge, ClipboardList, Activity, Zap, Shield, Brain,
  ChevronRight, Package, Utensils, Timer, CalendarCheck, Mic, MicOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAdminRole } from "@/data/adminRoles";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

/* ═══════════════════════════════════════════════════════════
   DATA LAYER — All mock data for lookup-based SSC
   ═══════════════════════════════════════════════════════════ */

// ── Partner Profiles (by RMN) ──
interface PartnerProfile {
  name: string;
  rmn: string;
  partnerId: string;
  kitchens: { skid: string; name: string; type: "SHF" | "HCF"; cuisine: string; city: string; status: "active" | "paused" }[];
  joinedDate: string;
  region: string;
  manager: string;
  grade: "A" | "B" | "C" | "D";
  scvBiz: number;
  metrics: { attendance: number; badRating: number; delayedDelivery: number; cancellations: number; ratingReviews: number };
  salesTarget: number;
  salesAchieved: number;
  bankName: string;
  accountNo: string;
  pendingGrievances: number;
  totalOrders: number;
  activeTickets: number;
  ledger: { sl: number; date: string; week: string; description: string; debit: number; credit: number; balance: number; type: "income" | "penalty" | "payout" | "adjustment" }[];
}

interface OrderRecord {
  orderId: string;
  customerName: string;
  customerRMN: string;
  partnerName: string;
  partnerRMN: string;
  skid: string;
  items: { name: string; qty: number; price: number }[];
  status: "pending" | "accepted" | "preparing" | "ready" | "delivered" | "cancelled";
  orderTime: string;
  deliveryTime: string;
  totalMRP: number;
  totalPPP: number;
  paymentStatus: "paid" | "pending" | "refunded";
  deliveryAddress: string;
  notes: string;
}

type TicketType = "order_edit" | "order_cancel" | "refund_request" | "profile_edit" | "kitchen_add" | "kitchen_remove" | "license_renewal" | "complaint" | "payment_query" | "other";
type TicketStatus = "open" | "in_progress" | "resolved" | "rejected" | "escalated";
type TicketPriority = "low" | "medium" | "high" | "critical";

interface TicketComment {
  author: string;
  role: string;
  text: string;
  at: string;
}

interface Ticket {
  id: string;
  type: TicketType;
  priority: TicketPriority;
  referenceId: string; // RMN or Order ID
  referenceType: "partner" | "customer" | "order";
  partnerName: string;
  partnerRMN: string;
  subject: string;
  description: string;
  raisedBy: string;
  raisedByRole: string;
  assignedTo: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
}

interface CallLog {
  id: string;
  callerType: "partner" | "customer";
  callerName: string;
  callerRMN: string;
  type: "inbound" | "outbound";
  category: string;
  duration: string;
  agent: string;
  outcome: "resolved" | "ticket_raised" | "escalated" | "callback";
  linkedTicket?: string;
  time: string;
  notes: string;
}

// ── Mock Partner Profiles ──
const partnerProfiles: PartnerProfile[] = [
  {
    name: "Sujatha M.", rmn: "+1 (212) 555-0101", partnerId: "P001",
    kitchens: [
      { skid: "SK-TN-001", name: "Sujatha's Chettinad Kitchen", type: "SHF", cuisine: "Chettinad", city: "New York", status: "active" },
      { skid: "SK-TN-002", name: "Sujatha's Florida Kitchen", type: "SHF", cuisine: "Florida", city: "New York", status: "active" },
    ],
    joinedDate: "Jan 2025", region: "Northeast", manager: "Nithya P.", grade: "A", scvBiz: 87,
    metrics: { attendance: 95, badRating: 3, delayedDelivery: 5, cancellations: 2, ratingReviews: 4.6 },
    salesTarget: 200, salesAchieved: 185, bankName: "HDFC Bank", accountNo: "****7842",
    pendingGrievances: 1, totalOrders: 1245, activeTickets: 1,
    ledger: [
      { sl: 1, date: "2026-03-01", week: "CW09", description: "Weekly sales earnings — 42 orders", debit: 0, credit: 11830, balance: 11830, type: "income" },
      { sl: 2, date: "2026-02-28", week: "CW09", description: "Penalty: Late delivery (18 min)", debit: 50, credit: 0, balance: 11780, type: "penalty" },
      { sl: 3, date: "2026-02-27", week: "CW09", description: "Penalty: Quality complaint (cold food)", debit: 100, credit: 0, balance: 11680, type: "penalty" },
      { sl: 4, date: "2026-02-23", week: "CW08", description: "Weekly payout — ACH to HDFC ****7842", debit: 10920, credit: 0, balance: 760, type: "payout" },
      { sl: 5, date: "2026-02-22", week: "CW08", description: "Weekly sales earnings — 38 orders", debit: 0, credit: 10920, balance: 11680, type: "income" },
      { sl: 6, date: "2026-02-16", week: "CW07", description: "Weekly payout — ACH to HDFC ****7842", debit: 9800, credit: 0, balance: 760, type: "payout" },
    ],
  },
  {
    name: "Priya K.", rmn: "+1 (310) 555-0102", partnerId: "P002",
    kitchens: [{ skid: "SK-KA-001", name: "Priya's Home Kitchen", type: "HCF", cuisine: "North Indian", city: "Bengaluru", status: "active" }],
    joinedDate: "Feb 2025", region: "Northeast", manager: "Madhavi K.", grade: "B", scvBiz: 72,
    metrics: { attendance: 88, badRating: 8, delayedDelivery: 12, cancellations: 5, ratingReviews: 4.1 },
    salesTarget: 150, salesAchieved: 120, bankName: "SBI", accountNo: "****3291",
    pendingGrievances: 1, totalOrders: 680, activeTickets: 1,
    ledger: [
      { sl: 1, date: "2026-03-01", week: "CW09", description: "Weekly sales earnings — 28 orders", debit: 0, credit: 8060, balance: 8060, type: "income" },
      { sl: 2, date: "2026-02-23", week: "CW08", description: "Weekly payout — ACH to SBI ****3291", debit: 7180, credit: 0, balance: 880, type: "payout" },
      { sl: 3, date: "2026-02-22", week: "CW08", description: "Weekly sales earnings — 25 orders", debit: 0, credit: 7280, balance: 8060, type: "income" },
      { sl: 4, date: "2026-02-21", week: "CW08", description: "Penalty: Quality complaint — cold food", debit: 100, credit: 0, balance: 780, type: "penalty" },
    ],
  },
  {
    name: "Lakshmi R.", rmn: "+1 (312) 555-0103", partnerId: "P003",
    kitchens: [{ skid: "SK-TS-001", name: "Lakshmi's Pennsylvania Kitchen", type: "SHF", cuisine: "Pennsylvania", city: "Chicago", status: "paused" }],
    joinedDate: "Mar 2025", region: "Northeast", manager: "Harish G.", grade: "A", scvBiz: 91,
    metrics: { attendance: 92, badRating: 2, delayedDelivery: 3, cancellations: 1, ratingReviews: 4.8 },
    salesTarget: 250, salesAchieved: 248, bankName: "SBI", accountNo: "****6701",
    pendingGrievances: 0, totalOrders: 2100, activeTickets: 0,
    ledger: [
      { sl: 1, date: "2026-02-22", week: "CW08", description: "Weekly sales earnings — 55 orders", debit: 0, credit: 16120, balance: 16120, type: "income" },
      { sl: 2, date: "2026-02-24", week: "CW08", description: "Penalty: Partner cancellation", debit: 500, credit: 0, balance: 15620, type: "penalty" },
      { sl: 3, date: "2026-02-23", week: "CW08", description: "Weekly payout — ACH to SBI ****6701", debit: 15620, credit: 0, balance: 0, type: "payout" },
    ],
  },
  {
    name: "Meena S.", rmn: "+1 (713) 555-0104", partnerId: "P004",
    kitchens: [{ skid: "SK-MH-001", name: "Meena's Marathi Kitchen", type: "HCF", cuisine: "Marathi", city: "Houston", status: "active" }],
    joinedDate: "Apr 2025", region: "West", manager: "Preeti J.", grade: "C", scvBiz: 58,
    metrics: { attendance: 78, badRating: 15, delayedDelivery: 18, cancellations: 10, ratingReviews: 3.6 },
    salesTarget: 100, salesAchieved: 65, bankName: "ICICI", accountNo: "****4512",
    pendingGrievances: 1, totalOrders: 340, activeTickets: 0,
    ledger: [
      { sl: 1, date: "2026-03-01", week: "CW09", description: "Weekly sales earnings — 15 orders", debit: 0, credit: 4200, balance: 4200, type: "income" },
      { sl: 2, date: "2026-02-23", week: "CW08", description: "Weekly payout — ACH to ICICI ****4512", debit: 3800, credit: 0, balance: 400, type: "payout" },
    ],
  },
];

// ── Mock Orders ──
const orderRecords: OrderRecord[] = [
  {
    orderId: "ORD-4520", customerName: "Rahul S.", customerRMN: "+1 99887 77665",
    partnerName: "Sujatha M.", partnerRMN: "+1 (212) 555-0101", skid: "SK-TN-001",
    items: [{ name: "Chettinad Chicken Curry", qty: 1, price: 220 }, { name: "Sambar Rice", qty: 2, price: 150 }, { name: "Rasam", qty: 1, price: 60 }],
    status: "delivered", orderTime: "2026-03-03 12:30 PM", deliveryTime: "2026-03-03 1:15 PM",
    totalMRP: 580, totalPPP: 380, paymentStatus: "paid",
    deliveryAddress: "Operational Zone — SoHo", notes: "",
  },
  {
    orderId: "ORD-4521", customerName: "Priya M.", customerRMN: "+1 (305) 555-0108",
    partnerName: "Priya K.", partnerRMN: "+1 (310) 555-0102", skid: "SK-KA-001",
    items: [{ name: "Paneer Butter Masala", qty: 1, price: 180 }, { name: "Butter Naan", qty: 4, price: 40 }],
    status: "preparing", orderTime: "2026-03-03 1:00 PM", deliveryTime: "—",
    totalMRP: 340, totalPPP: 220, paymentStatus: "paid",
    deliveryAddress: "Operational Zone — Koramangala", notes: "Customer reported wrong item concern",
  },
  {
    orderId: "ORD-4522", customerName: "Karthik R.", customerRMN: "+1 77665 44332",
    partnerName: "Sujatha M.", partnerRMN: "+1 (212) 555-0101", skid: "SK-TN-002",
    items: [{ name: "Florida Fish Curry", qty: 1, price: 250 }, { name: "Appam", qty: 3, price: 30 }],
    status: "accepted", orderTime: "2026-03-03 1:15 PM", deliveryTime: "—",
    totalMRP: 340, totalPPP: 225, paymentStatus: "paid",
    deliveryAddress: "Operational Zone — Anna Nagar", notes: "",
  },
  {
    orderId: "ORD-4523", customerName: "Deepa N.", customerRMN: "+1 66554 33221",
    partnerName: "Meena S.", partnerRMN: "+1 (713) 555-0104", skid: "SK-MH-001",
    items: [{ name: "Vada Pav", qty: 4, price: 50 }, { name: "Misal Pav", qty: 2, price: 120 }],
    status: "pending", orderTime: "2026-03-03 1:30 PM", deliveryTime: "—",
    totalMRP: 440, totalPPP: 290, paymentStatus: "pending",
    deliveryAddress: "Operational Zone — Andheri", notes: "",
  },
  {
    orderId: "ORD-4519", customerName: "Arun K.", customerRMN: "+1 (503) 555-0109",
    partnerName: "Lakshmi R.", partnerRMN: "+1 (312) 555-0103", skid: "SK-TS-001",
    items: [{ name: "Chicagoi Biryani", qty: 2, price: 280 }],
    status: "cancelled", orderTime: "2026-03-02 7:00 PM", deliveryTime: "—",
    totalMRP: 560, totalPPP: 370, paymentStatus: "refunded",
    deliveryAddress: "Operational Zone — Downtown", notes: "Customer cancelled — partner started cooking",
  },
];

// ── Mock Tickets ──
const mockTickets: Ticket[] = [
  { id: "TKT-001", type: "profile_edit", priority: "medium", referenceId: "+1 (212) 555-0101", referenceType: "partner", partnerId: "P001", partnerName: "Sujatha M.", partnerRMN: "+1 (212) 555-0101", subject: "Update partner address — moved to SoHo", description: "Partner called to update kitchen address.", raisedBy: "Preethi V.", raisedByRole: "SSC Executor", assignedTo: "KOBTL", status: "open", createdAt: "2026-03-02 10:15 AM", updatedAt: "2026-03-02 10:15 AM", comments: [] } as Ticket & { partnerId: string },
  { id: "TKT-002", type: "order_edit", priority: "high", referenceId: "ORD-4521", referenceType: "order", partnerId: "P002", partnerName: "Priya K.", partnerRMN: "+1 (310) 555-0102", subject: "Customer wants to add 2 Garlic Naan to order", description: "Customer Priya M. called to modify active order ORD-4521.", raisedBy: "Preethi V.", raisedByRole: "SSC Executor", assignedTo: "OPS", status: "in_progress", createdAt: "2026-03-03 1:10 PM", updatedAt: "2026-03-03 1:15 PM", comments: [{ author: "Preethi V.", role: "SSC Executor", text: "Order is in preparing status. Contacted kitchen for modification.", at: "2026-03-03 1:15 PM" }] } as Ticket & { partnerId: string },
  { id: "TKT-003", type: "refund_request", priority: "high", referenceId: "ORD-4519", referenceType: "order", partnerId: "P003", partnerName: "Lakshmi R.", partnerRMN: "+1 (312) 555-0103", subject: "Customer requests full refund — cancelled after prep started", description: "Customer Arun K. wants refund. Partner had started cooking.", raisedBy: "Anitha S.", raisedByRole: "SSC Team Lead", assignedTo: "PPP", status: "open", createdAt: "2026-03-02 7:30 PM", updatedAt: "2026-03-02 7:30 PM", comments: [] } as Ticket & { partnerId: string },
  { id: "TKT-004", type: "kitchen_add", priority: "medium", referenceId: "+1 (212) 555-0101", referenceType: "partner", partnerId: "P001", partnerName: "Sujatha M.", partnerRMN: "+1 (212) 555-0101", subject: "Request to add New York Veg kitchen", description: "Partner wants a 3rd kitchen — Tamil Veg.", raisedBy: "Gomathi R.", raisedByRole: "SSC Executor", assignedTo: "KOBTL", status: "open", createdAt: "2026-03-01 4:00 PM", updatedAt: "2026-03-01 4:00 PM", comments: [] } as Ticket & { partnerId: string },
  { id: "TKT-005", type: "payment_query", priority: "low", referenceId: "+1 (713) 555-0104", referenceType: "partner", partnerId: "P004", partnerName: "Meena S.", partnerRMN: "+1 (713) 555-0104", subject: "Partner asking about delayed payout for CW08", description: "Meena S. called about CW08 payout not received.", raisedBy: "Preethi V.", raisedByRole: "SSC Executor", assignedTo: "PPP", status: "resolved", createdAt: "2026-02-27 3:00 PM", updatedAt: "2026-02-28 10:00 AM", comments: [{ author: "Vijay K.", role: "PPP TL", text: "Payout was delayed due to bank holiday. Processed now.", at: "2026-02-28 10:00 AM" }] } as Ticket & { partnerId: string },
  { id: "TKT-006", type: "complaint", priority: "high", referenceId: "+1 (305) 555-0108", referenceType: "customer", partnerId: "", partnerName: "", partnerRMN: "", subject: "Customer Priya M. — wrong item received in ORD-4521", description: "Customer says ordered Paneer but got Dal Makhani.", raisedBy: "Preethi V.", raisedByRole: "SSC Executor", assignedTo: "OPS", status: "in_progress", createdAt: "2026-03-03 1:30 PM", updatedAt: "2026-03-03 1:35 PM", comments: [{ author: "Preethi V.", role: "SSC Executor", text: "Contacted kitchen. They confirm wrong item packed. Replacement being prepared.", at: "2026-03-03 1:35 PM" }] } as Ticket & { partnerId: string },
];

// ── Mock Call Logs ──
const callLogs: CallLog[] = [
  { id: "CL-001", callerType: "partner", callerName: "Sujatha M.", callerRMN: "+1 (212) 555-0101", type: "inbound", category: "Order Query", duration: "4:32", agent: "Preethi V.", outcome: "resolved", time: "10:15 AM", notes: "Partner asked about pending order count for today." },
  { id: "CL-002", callerType: "partner", callerName: "Meena S.", callerRMN: "+1 (713) 555-0104", type: "inbound", category: "Payment Query", duration: "6:10", agent: "Gomathi R.", outcome: "ticket_raised", linkedTicket: "TKT-005", time: "10:45 AM", notes: "Partner inquiring about delayed payout. Ticket raised." },
  { id: "CL-003", callerType: "customer", callerName: "Rahul S.", callerRMN: "+1 99887 77665", type: "inbound", category: "Delivery Status", duration: "2:15", agent: "Preethi V.", outcome: "resolved", time: "11:00 AM", notes: "Customer tracking ORD-4520. Confirmed delivered." },
  { id: "CL-004", callerType: "customer", callerName: "Priya M.", callerRMN: "+1 (305) 555-0108", type: "inbound", category: "Wrong Item", duration: "5:40", agent: "Preethi V.", outcome: "ticket_raised", linkedTicket: "TKT-006", time: "1:30 PM", notes: "Customer received wrong item. Ticket + complaint raised." },
  { id: "CL-005", callerType: "partner", callerName: "Priya K.", callerRMN: "+1 (310) 555-0102", type: "outbound", category: "Kitchen Follow-up", duration: "3:20", agent: "Anitha S.", outcome: "resolved", time: "2:00 PM", notes: "Follow-up on quality complaint. Partner acknowledged." },
  { id: "CL-006", callerType: "customer", callerName: "Deepa N.", callerRMN: "+1 66554 33221", type: "inbound", category: "Order Edit", duration: "3:50", agent: "Gomathi R.", outcome: "ticket_raised", linkedTicket: "TKT-002", time: "2:30 PM", notes: "Customer wants to add items. Ticket raised for order modification." },
];

// ── Ticket Type Config ──
const typeConfig: Record<TicketType, { label: string; icon: typeof UserCog; color: string }> = {
  order_edit: { label: "Order Edit", icon: ClipboardList, color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  order_cancel: { label: "Order Cancel", icon: XCircle, color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  refund_request: { label: "Refund", icon: DollarSign, color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  profile_edit: { label: "Profile Edit", icon: UserCog, color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  kitchen_add: { label: "Kitchen Add", icon: Building2, color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
  kitchen_remove: { label: "Kitchen Remove", icon: XCircle, color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  license_renewal: { label: "License Renewal", icon: RefreshCw, color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  complaint: { label: "Complaint", icon: ShieldAlert, color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  payment_query: { label: "Payment Query", icon: DollarSign, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  other: { label: "Other", icon: FileText, color: "bg-muted text-muted-foreground" },
};

const statusConfig: Record<TicketStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  escalated: { label: "Escalated", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
};

const priorityColors: Record<TicketPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  critical: "bg-destructive/15 text-destructive",
};

const orderStatusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  preparing: "bg-indigo-100 text-indigo-700",
  ready: "bg-green-100 text-green-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--destructive))"];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function AdminTickets() {
  const { toast } = useToast();
  const role = getAdminRole();
  const [activeTab, setActiveTab] = useState<"console" | "stock_alerts" | "order_mods" | "delay_complaints" | "tickets" | "calls" | "analytics" | "partner_chats">("console");
  const [, setModTick] = useState(0);
  useEffect(() => {
    return subscribeModifications(() => setModTick((t) => t + 1));
  }, []);

  // ── Console State ──
  const [lookupType, setLookupType] = useState<"partner_rmn" | "customer_rmn" | "order_id">("partner_rmn");
  const [lookupInput, setLookupInput] = useState("");
  const [foundPartner, setFoundPartner] = useState<PartnerProfile | null>(null);
  const [foundOrder, setFoundOrder] = useState<OrderRecord | null>(null);
  const [foundOrders, setFoundOrders] = useState<OrderRecord[]>([]);
  const [lookupNotFound, setLookupNotFound] = useState(false);
  const [lookupView, setLookupView] = useState<"profile" | "orders" | "finance" | "metrics" | "tickets">("profile");

  // ── Mic State ──
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ── Tickets State ──
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newTicket, setNewTicket] = useState({ type: "order_edit" as TicketType, priority: "medium" as TicketPriority, subject: "", description: "" });

  // ── Calls State ──
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  // ── Lookup Handler ──
  const handleLookup = () => {
    const cleaned = lookupInput.trim().replace(/\s/g, "");
    if (!cleaned) { toast({ title: "Enter a value", variant: "destructive" }); return; }

    setFoundPartner(null);
    setFoundOrder(null);
    setFoundOrders([]);
    setLookupNotFound(false);

    if (lookupType === "partner_rmn") {
      const partner = partnerProfiles.find(p => p.rmn.replace(/\s/g, "").includes(cleaned));
      if (partner) {
        setFoundPartner(partner);
        setFoundOrders(orderRecords.filter(o => o.partnerRMN.replace(/\s/g, "").includes(cleaned)));
        setLookupView("profile");
      } else {
        setLookupNotFound(true);
      }
    } else if (lookupType === "customer_rmn") {
      const orders = orderRecords.filter(o => o.customerRMN.replace(/\s/g, "").includes(cleaned));
      if (orders.length > 0) {
        setFoundOrders(orders);
        // Also find partner from first order
        const partner = partnerProfiles.find(p => p.rmn === orders[0].partnerRMN);
        setFoundPartner(partner || null);
        setLookupView("orders");
      } else {
        setLookupNotFound(true);
      }
    } else if (lookupType === "order_id") {
      const order = orderRecords.find(o => o.orderId.toLowerCase() === cleaned.toLowerCase() || o.orderId.toLowerCase().includes(cleaned.toLowerCase()));
      if (order) {
        setFoundOrder(order);
        const partner = partnerProfiles.find(p => p.rmn === order.partnerRMN);
        setFoundPartner(partner || null);
        setFoundOrders([order]);
        setLookupView("orders");
      } else {
        setLookupNotFound(true);
      }
    }
  };

  // ── Ticket Handlers ──
  const handleCreateTicket = () => {
    if (!newTicket.subject) { toast({ title: "Subject required", variant: "destructive" }); return; }
    const ticket: Ticket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      ...newTicket,
      referenceId: lookupInput,
      referenceType: lookupType === "order_id" ? "order" : lookupType === "customer_rmn" ? "customer" : "partner",
      partnerName: foundPartner?.name || "",
      partnerRMN: foundPartner?.rmn || "",
      raisedBy: localStorage.getItem("shero-admin-name") || "SSC Agent",
      raisedByRole: "SSC",
      assignedTo: newTicket.type.startsWith("order") ? "OPS" : newTicket.type === "payment_query" || newTicket.type === "refund_request" ? "PPP" : "KOBTL",
      status: "open",
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      comments: [],
    };
    setTickets(prev => [ticket, ...prev]);
    setShowCreateTicket(false);
    setNewTicket({ type: "order_edit", priority: "medium", subject: "", description: "" });
    toast({ title: `Ticket ${ticket.id} created`, description: `Routed to ${ticket.assignedTo}` });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTicket) return;
    const comment: TicketComment = { author: localStorage.getItem("shero-admin-name") || "SSC Agent", role: role || "ssc", text: newComment.trim(), at: new Date().toLocaleString() };
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, comments: [...t.comments, comment], updatedAt: comment.at } : t));
    setSelectedTicket(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : prev);
    setNewComment("");
  };

  const handleUpdateTicketStatus = (id: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toLocaleString() } : t));
    setSelectedTicket(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
    toast({ title: `Ticket ${id}`, description: `→ ${statusConfig[newStatus].label}` });
  };

  // ── Linked tickets for current lookup ──
  const linkedTickets = useMemo(() => {
    if (!foundPartner && !foundOrder) return [];
    return tickets.filter(t => {
      if (foundPartner && t.partnerRMN === foundPartner.rmn) return true;
      if (foundOrder && t.referenceId === foundOrder.orderId) return true;
      return false;
    });
  }, [foundPartner, foundOrder, tickets]);

  // ── Analytics Data ──
  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const resolvedToday = tickets.filter(t => t.status === "resolved").length;
  const escalatedCount = tickets.filter(t => t.status === "escalated").length;

  const stockAlerts = getStockAlerts();
  const newStockAlerts = stockAlerts.filter(a => a.status === "new").length;

  const orderMods = getOrderModifications();
  const newModsCount = getNewModificationsCount();

  const delayComplaints = getDelayComplaints();
  const newDelayCount = getNewDelayComplaintsCount();

  // Subscribe to delay complaints for live updates
  const [, setDelayTick] = useState(0);
  useEffect(() => {
    const unsub = subscribeDelayComplaints(() => setDelayTick(t => t + 1));
    return unsub;
  }, []);

  const tabs = [
    { key: "console" as const, label: "Agent Console", icon: Headphones, badge: "" },
    { key: "stock_alerts" as const, label: "Stock Alerts", icon: AlertTriangle, badge: newStockAlerts > 0 ? String(newStockAlerts) : "" },
    { key: "order_mods" as const, label: "Order Modifications", icon: Package, badge: newModsCount > 0 ? String(newModsCount) : "" },
    { key: "delay_complaints" as const, label: "Delay Complaints", icon: Timer, badge: newDelayCount > 0 ? String(newDelayCount) : "" },
    { key: "tickets" as const, label: "My Tickets", icon: ClipboardList, badge: String(openTickets) },
    { key: "calls" as const, label: "Call Log", icon: Phone, badge: String(callLogs.length) },
    { key: "analytics" as const, label: "Analytics", icon: BarChart3, badge: "" },
    { key: "partner_chats" as const, label: "Partner Chats", icon: MessageCircle, badge: "" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Headphones className="w-6 h-6 text-primary" /> SSC Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Shero Support Center — Lookup-based call centre. No lists. Query by RMN or Order ID. Tickets for all actions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}>
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{tab.badge}</span>}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════ AGENT CONSOLE ═══════════════════ */}
      {activeTab === "console" && (
        <div className="space-y-4">
          {/* Lookup Bar */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">SSC Agent Console — Lookup</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={lookupType} onValueChange={(v: any) => { setLookupType(v); setFoundPartner(null); setFoundOrder(null); setFoundOrders([]); setLookupNotFound(false); }}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner_rmn">Partner RMN</SelectItem>
                    <SelectItem value="customer_rmn">Customer RMN</SelectItem>
                    <SelectItem value="order_id">Order ID</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1 flex items-center gap-1.5">
                  {lookupType === "order_id" ? <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /> : <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                  <Input
                    placeholder={lookupType === "partner_rmn" ? "Enter partner mobile e.g. 98765 43210" : lookupType === "customer_rmn" ? "Enter customer mobile e.g. 99887 77665" : "Enter Order ID e.g. ORD-4520"}
                    value={lookupInput}
                    onChange={e => setLookupInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLookup()}
                    className="pl-9 pr-10"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant={isListening ? "destructive" : "ghost"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => {
                      if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
                        toast({ title: "Not supported", description: "Speech recognition is not available in this browser.", variant: "destructive" });
                        return;
                      }
                      if (isListening && recognitionRef.current) {
                        recognitionRef.current.stop();
                        setIsListening(false);
                        return;
                      }
                      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                      const recognition = new SpeechRecognition();
                      recognitionRef.current = recognition;
                      recognition.continuous = false;
                      recognition.interimResults = false;
                      recognition.lang = "en-US";
                      recognition.onresult = (event: any) => {
                        const transcript: string = event.results[0][0].transcript;
                        // Extract digits for RMN, or keep as-is for Order ID
                        const cleaned = lookupType === "order_id" ? transcript.replace(/\s+/g, "").toUpperCase() : transcript.replace(/[^0-9]/g, "");
                        setLookupInput(cleaned);
                        setIsListening(false);
                      };
                      recognition.onerror = () => setIsListening(false);
                      recognition.onend = () => setIsListening(false);
                      recognition.start();
                      setIsListening(true);
                    }}
                    title={isListening ? "Stop listening" : "Voice input"}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <Button onClick={handleLookup} className="gap-1.5">
                  <Search className="w-4 h-4" /> Lookup
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                🔒 SSC agents have read-only access. For any changes — raise a ticket. Order edits, sales alterations, profile changes — all through tickets only.
              </p>
            </CardContent>
          </Card>

          {/* Not Found */}
          {lookupNotFound && (
            <Card className="border-dashed border-destructive/40 bg-destructive/5">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-6 h-6 text-destructive/60 mx-auto mb-2" />
                <p className="text-sm font-medium text-destructive">No results found for "{lookupInput}"</p>
                <p className="text-[10px] text-muted-foreground mt-1">Verify the {lookupType === "order_id" ? "Order ID" : "mobile number"} and try again.</p>
              </CardContent>
            </Card>
          )}

          {/* Results Found — Sub-navigation */}
          {(foundPartner || foundOrder || foundOrders.length > 0) && (
            <>
              {/* Sub-view tabs */}
              <div className="flex gap-1 flex-wrap">
                {foundPartner && (
                  <>
                    <Button size="sm" variant={lookupView === "profile" ? "default" : "outline"} onClick={() => setLookupView("profile")} className="text-xs gap-1">
                      <UserCog className="w-3 h-3" /> Partner Profile
                    </Button>
                    <Button size="sm" variant={lookupView === "metrics" ? "default" : "outline"} onClick={() => setLookupView("metrics")} className="text-xs gap-1">
                      <Gauge className="w-3 h-3" /> Metrics/SCV
                    </Button>
                    <Button size="sm" variant={lookupView === "finance" ? "default" : "outline"} onClick={() => setLookupView("finance")} className="text-xs gap-1">
                      <DollarSign className="w-3 h-3" /> PPP / Finance
                    </Button>
                  </>
                )}
                {foundOrders.length > 0 && (
                  <Button size="sm" variant={lookupView === "orders" ? "default" : "outline"} onClick={() => setLookupView("orders")} className="text-xs gap-1">
                    <Package className="w-3 h-3" /> Orders ({foundOrders.length})
                  </Button>
                )}
                <Button size="sm" variant={lookupView === "tickets" ? "default" : "outline"} onClick={() => setLookupView("tickets")} className="text-xs gap-1">
                  <ClipboardList className="w-3 h-3" /> Tickets ({linkedTickets.length})
                </Button>
              </div>

              {/* ── PARTNER PROFILE VIEW ── */}
              {lookupView === "profile" && foundPartner && (
                <div className="space-y-4">
                  <Card className="border border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-foreground">{foundPartner.name}</h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {foundPartner.rmn}</span>
                            <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {foundPartner.partnerId}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {foundPartner.region}</span>
                            <span className="flex items-center gap-1"><CalendarCheck className="w-3 h-3" /> Since {foundPartner.joinedDate}</span>
                            <span>Manager: <strong>{foundPartner.manager}</strong></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`text-sm px-3 py-1 ${foundPartner.grade === "A" ? "bg-green-100 text-green-700" : foundPartner.grade === "B" ? "bg-blue-100 text-blue-700" : foundPartner.grade === "C" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                            Grade {foundPartner.grade}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-1">SCV(BIZ): {foundPartner.scvBiz}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Kitchens */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">KITCHENS ({foundPartner.kitchens.length})</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {foundPartner.kitchens.map(k => (
                        <Card key={k.skid} className="border">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-foreground">{k.name}</p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                  <Badge variant="outline" className="text-[9px]">{k.skid}</Badge>
                                  <Badge variant="outline" className="text-[9px]">{k.type}</Badge>
                                  <span>{k.cuisine} · {k.city}</span>
                                </div>
                              </div>
                              <Badge className={`text-[9px] ${k.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{k.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Total Orders</p><p className="text-lg font-bold text-foreground">{foundPartner.totalOrders}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Active Tickets</p><p className="text-lg font-bold text-amber-600">{foundPartner.activeTickets}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Grievances</p><p className="text-lg font-bold text-orange-600">{foundPartner.pendingGrievances}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Bank</p><p className="text-sm font-medium text-foreground">{foundPartner.bankName} {foundPartner.accountNo}</p></CardContent></Card>
                  </div>
                </div>
              )}

              {/* ── METRICS VIEW ── */}
              {lookupView === "metrics" && foundPartner && (
                <div className="space-y-4">
                  <Card className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" /> SCV Health — {foundPartner.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Radar */}
                        <ResponsiveContainer width="100%" height={250}>
                          <RadarChart data={[
                            { metric: "Attendance", value: foundPartner.metrics.attendance },
                            { metric: "Bad Rating", value: 100 - foundPartner.metrics.badRating },
                            { metric: "Delayed Del.", value: 100 - foundPartner.metrics.delayedDelivery },
                            { metric: "Cancellations", value: 100 - foundPartner.metrics.cancellations },
                            { metric: "Rating", value: foundPartner.metrics.ratingReviews * 20 },
                          ]}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                            <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                          </RadarChart>
                        </ResponsiveContainer>

                        {/* Metrics Table */}
                        <div className="space-y-3">
                          {[
                            { label: "Attendance", value: `${foundPartner.metrics.attendance}%`, weight: "25%", good: foundPartner.metrics.attendance >= 90 },
                            { label: "Bad Rating (BR)", value: `${foundPartner.metrics.badRating}%`, weight: "20%", good: foundPartner.metrics.badRating <= 5 },
                            { label: "Delayed Delivery (DD)", value: `${foundPartner.metrics.delayedDelivery}%`, weight: "20%", good: foundPartner.metrics.delayedDelivery <= 10 },
                            { label: "Cancellations (CA)", value: `${foundPartner.metrics.cancellations}%`, weight: "20%", good: foundPartner.metrics.cancellations <= 5 },
                            { label: "Rating & Reviews (RR)", value: `${foundPartner.metrics.ratingReviews}/5`, weight: "15%", good: foundPartner.metrics.ratingReviews >= 4.0 },
                          ].map(m => (
                            <div key={m.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2">
                                {m.good ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                <span className="text-xs font-medium text-foreground">{m.label}</span>
                                <span className="text-[9px] text-muted-foreground">({m.weight})</span>
                              </div>
                              <span className={`text-sm font-bold ${m.good ? "text-green-600" : "text-amber-600"}`}>{m.value}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <span className="text-sm font-semibold text-foreground">SCV(BIZ)</span>
                            <span className="text-xl font-bold text-primary">{foundPartner.scvBiz}%</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <span className="text-xs text-muted-foreground">Sales: {foundPartner.salesAchieved}/{foundPartner.salesTarget} orders</span>
                            <Progress value={(foundPartner.salesAchieved / foundPartner.salesTarget) * 100} className="w-24 h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/10">
                    <CardContent className="p-3">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3 h-3" /> <strong>Read-Only.</strong> Metrics data is sourced from Metric Management. SSC cannot modify. For disputes, raise a ticket.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── FINANCE VIEW ── */}
              {lookupView === "finance" && foundPartner && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Total Earnings (2M)</p><p className="text-lg font-bold text-green-600">${foundPartner.ledger.reduce((s, e) => s + e.credit, 0).toLocaleString("en-US")}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Total Payouts</p><p className="text-lg font-bold text-foreground">${foundPartner.ledger.filter(e => e.type === "payout").reduce((s, e) => s + e.debit, 0).toLocaleString("en-US")}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Penalties</p><p className="text-lg font-bold text-destructive">${foundPartner.ledger.filter(e => e.type === "penalty").reduce((s, e) => s + e.debit, 0).toLocaleString("en-US")}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Balance</p><p className="text-lg font-bold text-foreground">${foundPartner.ledger[0]?.balance.toLocaleString("en-US") ?? 0}</p></CardContent></Card>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <div className="p-4 pb-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Statement of Accounts — PPP</p>
                          <p className="text-[10px] text-muted-foreground">Last 2 months · {foundPartner.ledger.length} entries · Read-Only</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] gap-1"><Eye className="w-3 h-3" /> Read-Only</Badge>
                      </div>
                      <div className="border-t border-border overflow-auto">
                        <Table>
                          <TableHeader><TableRow className="bg-muted/40">
                            <TableHead className="text-[10px] font-semibold w-10">Sl</TableHead>
                            <TableHead className="text-[10px] font-semibold">Date</TableHead>
                            <TableHead className="text-[10px] font-semibold">Week</TableHead>
                            <TableHead className="text-[10px] font-semibold">Description</TableHead>
                            <TableHead className="text-[10px] font-semibold text-right">Debit ($)</TableHead>
                            <TableHead className="text-[10px] font-semibold text-right">Credit ($)</TableHead>
                            <TableHead className="text-[10px] font-semibold text-right">Balance ($)</TableHead>
                          </TableRow></TableHeader>
                          <TableBody>
                            {foundPartner.ledger.map(entry => (
                              <TableRow key={entry.sl} className={entry.type === "penalty" ? "bg-destructive/5" : entry.type === "payout" ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}>
                                <TableCell className="text-xs text-muted-foreground">{entry.sl}</TableCell>
                                <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{entry.date}</TableCell>
                                <TableCell><Badge variant="outline" className="text-[9px]">{entry.week}</Badge></TableCell>
                                <TableCell className="text-xs"><span className={entry.type === "penalty" ? "text-destructive" : entry.type === "payout" ? "text-blue-600" : "text-green-600"}>{entry.description}</span></TableCell>
                                <TableCell className="text-xs text-right">{entry.debit > 0 ? <span className="text-destructive">${entry.debit.toLocaleString("en-US")}</span> : "—"}</TableCell>
                                <TableCell className="text-xs text-right">{entry.credit > 0 ? <span className="text-green-600">${entry.credit.toLocaleString("en-US")}</span> : "—"}</TableCell>
                                <TableCell className="text-xs text-right font-semibold">${entry.balance.toLocaleString("en-US")}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── ORDERS VIEW ── */}
              {lookupView === "orders" && foundOrders.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {lookupType === "customer_rmn" ? "CUSTOMER ORDERS" : lookupType === "order_id" ? "ORDER DETAILS" : "PARTNER ORDERS (TODAY)"}
                    </p>
                    <Badge variant="outline" className="text-[9px] gap-1"><Eye className="w-3 h-3" /> Read-Only · Raise ticket for changes</Badge>
                  </div>
                  {foundOrders.map(order => (
                    <Card key={order.orderId} className={`border ${order.status === "cancelled" ? "border-destructive/30" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold font-mono text-foreground">{order.orderId}</span>
                              <Badge className={`text-[9px] ${orderStatusColors[order.status] || "bg-muted text-muted-foreground"}`}>{order.status}</Badge>
                              <Badge className={`text-[9px] ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : order.paymentStatus === "refunded" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{order.paymentStatus}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-muted-foreground">
                              <span>👤 {order.customerName}</span>
                              <span>📞 {order.customerRMN}</span>
                              <span>🍳 {order.partnerName} ({order.skid})</span>
                              <span>📍 {order.deliveryAddress}</span>
                              <span>🕐 Ordered: {order.orderTime}</span>
                              <span>🚚 Delivery: {order.deliveryTime}</span>
                            </div>

                            {/* Items */}
                            <div className="mt-3 border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader><TableRow className="bg-muted/40">
                                  <TableHead className="text-[10px]">Item</TableHead>
                                  <TableHead className="text-[10px] text-center">Qty</TableHead>
                                  <TableHead className="text-[10px] text-right">Price</TableHead>
                                </TableRow></TableHeader>
                                <TableBody>
                                  {order.items.map((item, i) => (
                                    <TableRow key={i}>
                                      <TableCell className="text-xs">{item.name}</TableCell>
                                      <TableCell className="text-xs text-center">{item.qty}</TableCell>
                                      <TableCell className="text-xs text-right">${item.price * item.qty}</TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow className="bg-muted/30">
                                    <TableCell colSpan={2} className="text-xs font-semibold">Total (PPP)</TableCell>
                                    <TableCell className="text-xs text-right font-bold">${order.totalPPP}</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>

                            {order.notes && <p className="text-[11px] text-amber-600 mt-2">⚠️ {order.notes}</p>}
                          </div>

                          {/* Action: Raise Ticket */}
                          <div className="shrink-0">
                            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => {
                              setLookupInput(order.orderId);
                              setNewTicket(prev => ({ ...prev, type: "order_edit", subject: `Modification for ${order.orderId}` }));
                              setShowCreateTicket(true);
                            }}>
                              <Plus className="w-3 h-3" /> Raise Ticket
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* ── LINKED TICKETS VIEW ── */}
              {lookupView === "tickets" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">LINKED TICKETS ({linkedTickets.length})</p>
                    <Button size="sm" onClick={() => setShowCreateTicket(true)} className="text-xs gap-1"><Plus className="w-3 h-3" /> Raise Ticket</Button>
                  </div>
                  {linkedTickets.length === 0 && (
                    <Card className="border-dashed"><CardContent className="p-6 text-center text-muted-foreground text-sm">No tickets linked to this lookup. Raise one if needed.</CardContent></Card>
                  )}
                  {linkedTickets.map(t => {
                    const tCfg = typeConfig[t.type];
                    return (
                      <Card key={t.id} className="border cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedTicket(t); }}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold font-mono">{t.id}</span>
                            <Badge className={`text-[9px] ${tCfg.color}`}>{tCfg.label}</Badge>
                            <Badge className={`text-[9px] ${statusConfig[t.status].color}`}>{statusConfig[t.status].label}</Badge>
                            <Badge className={`text-[9px] ${priorityColors[t.priority]}`}>{t.priority}</Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground mt-1">{t.subject}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Raised by {t.raisedBy} · {t.createdAt} · {t.comments.length} comments</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!foundPartner && !foundOrder && foundOrders.length === 0 && !lookupNotFound && (
            <Card className="border-dashed">
              <CardContent className="p-10 text-center">
                <Headphones className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-muted-foreground">SSC Agent Console</h3>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-md mx-auto">
                  Enter a Partner RMN, Customer RMN, or Order ID above to look up information.
                  All data is read-only. For any changes, raise a ticket.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {["Partner Profile", "Order Status", "PPP / Finance", "Metrics / SCV", "Raise Tickets"].map(f => (
                    <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════════════ STOCK ALERTS TAB ═══════════════════ */}
      {activeTab === "stock_alerts" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">New Alerts</p><p className="text-lg font-bold text-destructive">{stockAlerts.filter(a => a.status === "new").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Acknowledged</p><p className="text-lg font-bold text-amber-600">{stockAlerts.filter(a => a.status === "acknowledged").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Resolved</p><p className="text-lg font-bold text-green-600">{stockAlerts.filter(a => a.status === "resolved").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Total</p><p className="text-lg font-bold text-foreground">{stockAlerts.length}</p></CardContent></Card>
          </div>

          <div className="space-y-3">
            {stockAlerts.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No stock alerts reported</p>
              </Card>
            ) : (
              stockAlerts.map((alert) => {
                const statusCfg: Record<SSCStockAlert["status"], { label: string; cls: string }> = {
                  new: { label: "New", cls: "bg-destructive/15 text-destructive" },
                  acknowledged: { label: "Acknowledged", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
                  resolved: { label: "Resolved", cls: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
                  escalated: { label: "Escalated", cls: "bg-destructive/15 text-destructive" },
                };
                const cfg = statusCfg[alert.status];
                return (
                  <Card key={alert.id} className={`border ${alert.status === "new" ? "border-destructive/30 bg-destructive/5" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{alert.itemName}</p>
                            <Badge className={`text-[10px] ${cfg.cls}`}>{cfg.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {alert.reason === "ingredient_shortage" ? "🥕 Ingredient Shortage" : "❌ Item Unavailable"}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{alert.id}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                        <span>📦 Order: <strong className="text-foreground">{alert.orderId}</strong></span>
                        <span>👩‍🍳 Partner: <strong className="text-foreground">{alert.partnerName}</strong></span>
                        <span>🏠 Kitchen: {alert.kitchenName}</span>
                        <span>🕐 Reported: {alert.reportedAt}</span>
                      </div>

                      {alert.suggestedAlternative && (
                        <div className="mt-2 text-xs">
                          <span className="text-muted-foreground">Suggested Alternative: </span>
                          <Badge variant="outline" className="text-[10px]">🔄 {alert.suggestedAlternative}</Badge>
                        </div>
                      )}

                      {alert.status === "new" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => {
                            updateStockAlertStatus(alert.id, "acknowledged");
                            toast({ title: "Alert Acknowledged", description: `${alert.itemName} — will follow up with partner` });
                          }}>
                            <Eye className="w-3 h-3" /> Acknowledge
                          </Button>
                          <Button size="sm" className="text-xs gap-1" onClick={() => {
                            updateStockAlertStatus(alert.id, "resolved", "SSC Agent");
                            toast({ title: "Alert Resolved", description: `${alert.itemName} marked as resolved` });
                          }}>
                            <CheckCircle2 className="w-3 h-3" /> Resolve
                          </Button>
                          <Button size="sm" variant="destructive" className="text-xs gap-1" onClick={() => {
                            updateStockAlertStatus(alert.id, "escalated");
                            toast({ title: "Alert Escalated", description: `${alert.itemName} escalated to OPS team`, variant: "destructive" });
                          }}>
                            <AlertTriangle className="w-3 h-3" /> Escalate
                          </Button>
                        </div>
                      )}

                      {alert.status === "acknowledged" && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="text-xs gap-1" onClick={() => {
                            updateStockAlertStatus(alert.id, "resolved", "SSC Agent");
                            toast({ title: "Alert Resolved", description: `${alert.itemName} marked as resolved` });
                          }}>
                            <CheckCircle2 className="w-3 h-3" /> Resolve
                          </Button>
                        </div>
                      )}

                      {alert.resolvedBy && (
                        <p className="text-[10px] text-muted-foreground mt-2">Resolved by {alert.resolvedBy} at {alert.resolvedAt}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ MY TICKETS TAB ═══════════════════ */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-3 gap-3 flex-1 max-w-md">
              <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Open</p><p className="text-lg font-bold text-amber-600">{tickets.filter(t => t.status === "open").length}</p></CardContent></Card>
              <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">In Progress</p><p className="text-lg font-bold text-blue-600">{tickets.filter(t => t.status === "in_progress").length}</p></CardContent></Card>
              <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Resolved</p><p className="text-lg font-bold text-green-600">{resolvedToday}</p></CardContent></Card>
            </div>
            <Button size="sm" onClick={() => setShowCreateTicket(true)} className="gap-1"><Plus className="w-4 h-4" /> Raise Ticket</Button>
          </div>

          <div className="space-y-2">
            {tickets.map(t => {
              const tCfg = typeConfig[t.type];
              return (
                <Card key={t.id} className={`border cursor-pointer hover:shadow-md transition-shadow ${t.priority === "critical" ? "border-destructive/30" : ""}`} onClick={() => setSelectedTicket(t)}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold font-mono">{t.id}</span>
                          <Badge className={`text-[9px] ${tCfg.color}`}>{tCfg.label}</Badge>
                          <Badge className={`text-[9px] ${statusConfig[t.status].color}`}>{statusConfig[t.status].label}</Badge>
                          <Badge className={`text-[9px] ${priorityColors[t.priority]}`}>{t.priority}</Badge>
                          {t.referenceType === "order" && <Badge variant="outline" className="text-[9px]">📦 {t.referenceId}</Badge>}
                        </div>
                        <p className="text-sm font-medium text-foreground mt-1">{t.subject}</p>
                        <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                          {t.partnerName && <span>👤 {t.partnerName}</span>}
                          <span>📋 → {t.assignedTo}</span>
                          <span>🕐 {t.createdAt}</span>
                          <span>💬 {t.comments.length}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════ CALL LOG TAB ═══════════════════ */}
      {activeTab === "calls" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Today's Calls</p><p className="text-xl font-bold text-foreground">{callLogs.length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Resolved</p><p className="text-xl font-bold text-green-600">{callLogs.filter(c => c.outcome === "resolved").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Tickets Raised</p><p className="text-xl font-bold text-blue-600">{callLogs.filter(c => c.outcome === "ticket_raised").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Escalated</p><p className="text-xl font-bold text-amber-600">{callLogs.filter(c => c.outcome === "escalated").length}</p></CardContent></Card>
          </div>

          <div className="space-y-2">
            {callLogs.map(c => (
              <Card key={c.id} className="border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCall(c)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold">{c.id}</span>
                        <Badge variant={c.type === "inbound" ? "default" : "secondary"} className="text-[9px]">{c.type === "inbound" ? "📞 Inbound" : "📤 Outbound"}</Badge>
                        <Badge variant="outline" className="text-[9px]">{c.callerType}</Badge>
                        <Badge variant="outline" className="text-[9px]">{c.category}</Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1">{c.callerName} · {c.callerRMN}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>⏱️ {c.duration}</span>
                        <span>👤 {c.agent}</span>
                        <span>🕐 {c.time}</span>
                        {c.linkedTicket && <span className="text-primary">🔗 {c.linkedTicket}</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{c.notes}</p>
                    </div>
                    <Badge className={`text-[9px] ${c.outcome === "resolved" ? "bg-green-100 text-green-700" : c.outcome === "ticket_raised" ? "bg-blue-100 text-blue-700" : c.outcome === "escalated" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                      {c.outcome.replace("_", " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════ ANALYTICS TAB ═══════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "First Call Resolution", value: "78%", trend: "+3%", up: true },
              { label: "Avg Response Time", value: "2.5 min", trend: "-18%", up: true },
              { label: "CSAT Score", value: "4.4/5", trend: "+0.2", up: true },
              { label: "Ticket Backlog", value: String(openTickets), trend: openTickets > 5 ? "+2" : "-1", up: openTickets <= 5 },
              { label: "Avg Handle Time", value: "3:25", trend: "-12%", up: true },
              { label: "Escalation Rate", value: "8.5%", trend: "-2.1%", up: true },
            ].map(k => (
              <Card key={k.label}><CardContent className="p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className="text-lg font-bold text-foreground mt-1">{k.value}</p>
                <div className={`flex items-center gap-0.5 mt-1 text-[10px] ${k.up ? "text-green-600" : "text-destructive"}`}>
                  {k.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {k.trend}
                </div>
              </CardContent></Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold mb-3">Daily Call & Ticket Volume</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[
                    { day: "Mon", calls: 45, tickets: 8 }, { day: "Tue", calls: 52, tickets: 12 },
                    { day: "Wed", calls: 38, tickets: 6 }, { day: "Thu", calls: 61, tickets: 15 },
                    { day: "Fri", calls: 55, tickets: 10 }, { day: "Sat", calls: 72, tickets: 18 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Calls" />
                    <Bar dataKey="tickets" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold mb-3">Resolution & CSAT Trend</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={[
                    { week: "W1", avgTime: 4.2, csat: 4.1 }, { week: "W2", avgTime: 3.8, csat: 4.3 },
                    { week: "W3", avgTime: 3.5, csat: 4.4 }, { week: "W4", avgTime: 3.1, csat: 4.5 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="avgTime" stroke="hsl(var(--primary))" strokeWidth={2} name="Avg Resolution (hrs)" />
                    <Line type="monotone" dataKey="csat" stroke="hsl(var(--chart-2))" strokeWidth={2} name="CSAT" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold mb-3">Ticket Category Breakdown</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={[
                      { name: "Order Edit", value: 35 }, { name: "Payment Query", value: 25 },
                      { name: "Complaint", value: 18 }, { name: "Profile Edit", value: 12 },
                      { name: "Refund", value: 10 },
                    ]} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {[0, 1, 2, 3, 4].map(i => <Cell key={i} fill={CHART_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold mb-3">Agent Leaderboard</p>
                <div className="space-y-2">
                  {[
                    { agent: "Preethi V.", calls: 128, resolved: 115, csat: 4.6 },
                    { agent: "Anitha S.", calls: 112, resolved: 98, csat: 4.4 },
                    { agent: "Gomathi R.", calls: 96, resolved: 82, csat: 4.2 },
                    { agent: "Rekha M.", calls: 45, resolved: 42, csat: 4.7 },
                  ].sort((a, b) => b.csat - a.csat).map((a, i) => (
                    <div key={a.agent} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}</span>
                        <span className="text-xs font-medium text-foreground">{a.agent}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{a.calls} calls</span>
                        <span className="text-green-600">{Math.round((a.resolved / a.calls) * 100)}% resolved</span>
                        <div className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /><span className="font-medium text-foreground">{a.csat}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="border border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> SSC Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { icon: "📊", title: "Order Edit Tickets Spiking", text: "35% of tickets are order edits. Consider enabling limited self-service order modification for customers before prep starts.", type: "warning" },
                  { icon: "💰", title: "Payment Queries Down 18%", text: "Proactive payout notifications reduced payment-related calls significantly. Continue automated status updates.", type: "positive" },
                  { icon: "🚨", title: "Agent Gomathi — AHT Above Target", text: "Average handle time 4:05 vs target 3:30. Recommend call script optimization and partner data pre-loading.", type: "critical" },
                ].map((insight, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${insight.type === "critical" ? "border-destructive/30 bg-destructive/5" : insight.type === "warning" ? "border-amber-300/30 bg-amber-50/50 dark:bg-amber-950/20" : "border-green-300/30 bg-green-50/50 dark:bg-green-950/20"}`}>
                    <p className="text-sm font-medium text-foreground">{insight.icon} {insight.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{insight.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════ TICKET DETAIL DIALOG ═══════════════════ */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedTicket && (() => {
            const tCfg = typeConfig[selectedTicket.type];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base"><Headphones className="w-5 h-5 text-primary" />{selectedTicket.id}</DialogTitle>
                  <DialogDescription className="text-xs">{selectedTicket.subject}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${tCfg.color} text-[9px]`}>{tCfg.label}</Badge>
                    <Badge className={`${statusConfig[selectedTicket.status].color} text-[9px]`}>{statusConfig[selectedTicket.status].label}</Badge>
                    <Badge className={`${priorityColors[selectedTicket.priority]} text-[9px]`}>{selectedTicket.priority}</Badge>
                    {selectedTicket.referenceType === "order" && <Badge variant="outline" className="text-[9px]">📦 {selectedTicket.referenceId}</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {selectedTicket.partnerName && <div><span className="text-muted-foreground">Partner:</span> <strong>{selectedTicket.partnerName}</strong></div>}
                    {selectedTicket.partnerRMN && <div><span className="text-muted-foreground">RMN:</span> {selectedTicket.partnerRMN}</div>}
                    <div><span className="text-muted-foreground">Raised By:</span> {selectedTicket.raisedBy}</div>
                    <div><span className="text-muted-foreground">Assigned:</span> <strong>{selectedTicket.assignedTo}</strong></div>
                    <div><span className="text-muted-foreground">Created:</span> {selectedTicket.createdAt}</div>
                    <div><span className="text-muted-foreground">Updated:</span> {selectedTicket.updatedAt}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs leading-relaxed">{selectedTicket.description}</p></div>

                  {/* Comments */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">Activity ({selectedTicket.comments.length})</p>
                    {selectedTicket.comments.map((c, i) => (
                      <div key={i} className="bg-muted/20 rounded-lg p-2.5 border">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold">{c.author}</span>
                          <Badge variant="outline" className="text-[8px] h-4 px-1">{c.role}</Badge>
                          <span className="text-[9px] text-muted-foreground ml-auto">{c.at}</span>
                        </div>
                        <p className="text-[11px]">{c.text}</p>
                      </div>
                    ))}
                    <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="text-xs min-h-[60px]" />
                    <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()} className="gap-1"><Send className="w-3 h-3" /> Post</Button>
                  </div>
                </div>
                {selectedTicket.status !== "resolved" && selectedTicket.status !== "rejected" && (
                  <DialogFooter className="flex-row gap-2 sm:justify-start mt-4">
                    {selectedTicket.status === "open" && <Button size="sm" variant="outline" onClick={() => handleUpdateTicketStatus(selectedTicket.id, "in_progress")} className="gap-1"><Clock className="w-3 h-3" /> Pick Up</Button>}
                    <Button size="sm" onClick={() => handleUpdateTicketStatus(selectedTicket.id, "resolved")} className="gap-1 bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3" /> Resolve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleUpdateTicketStatus(selectedTicket.id, "escalated")} className="gap-1 text-purple-600 border-purple-200"><ArrowUpRight className="w-3 h-3" /> Escalate</Button>
                  </DialogFooter>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ CREATE TICKET DIALOG ═══════════════════ */}
      <Dialog open={showCreateTicket} onOpenChange={setShowCreateTicket}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-base flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Raise Ticket</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {foundPartner && <div className="text-xs p-2 rounded-lg bg-muted/50">👤 {foundPartner.name} · {foundPartner.rmn}</div>}
            {foundOrder && <div className="text-xs p-2 rounded-lg bg-muted/50">📦 {foundOrder.orderId} · {foundOrder.customerName}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={newTicket.type} onValueChange={v => setNewTicket(p => ({ ...p, type: v as TicketType }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={newTicket.priority} onValueChange={v => setNewTicket(p => ({ ...p, priority: v as TicketPriority }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Subject *</Label><Input value={newTicket.subject} onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))} className="h-9 text-xs" /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={newTicket.description} onChange={e => setNewTicket(p => ({ ...p, description: e.target.value }))} className="text-xs min-h-[70px]" /></div>
            <p className="text-[10px] text-muted-foreground">Ticket will be auto-routed: Order tickets → OPS, Payment → PPP, Profile/Kitchen → KOBTL</p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCreateTicket(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateTicket} className="gap-1"><Send className="w-3 h-3" /> Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ ORDER MODIFICATIONS TAB ═══════════════════ */}
      {activeTab === "order_mods" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">New Requests</p><p className="text-lg font-bold text-destructive">{orderMods.filter(m => m.status === "new").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Acknowledged</p><p className="text-lg font-bold text-amber-600">{orderMods.filter(m => m.status === "acknowledged").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Resolved</p><p className="text-lg font-bold text-green-600">{orderMods.filter(m => m.status === "resolved").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Total</p><p className="text-lg font-bold text-foreground">{orderMods.length}</p></CardContent></Card>
          </div>

          <div className="space-y-3">
            {orderMods.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No order modification requests</p>
              </Card>
            ) : (
              orderMods.map((mod) => {
                const modStatusCfg: Record<SSCOrderModification["status"], { label: string; cls: string }> = {
                  new: { label: "New", cls: "bg-destructive/15 text-destructive" },
                  acknowledged: { label: "Acknowledged", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
                  resolved: { label: "Resolved", cls: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
                  escalated: { label: "Escalated", cls: "bg-destructive/15 text-destructive" },
                };
                const msCfg = modStatusCfg[mod.status];
                const typeLabels: Record<string, string> = {
                  add_item: "Add Item", remove_item: "Remove Item", change_item: "Change Item",
                  change_qty: "Change Qty", cancel_item: "Cancel Item", other: "Other",
                };
                return (
                  <Card key={mod.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold font-mono text-foreground">{mod.id}</span>
                            <Badge className={`${msCfg.cls} text-[9px] border-0`}>{msCfg.label}</Badge>
                            <Badge variant="outline" className="text-[9px]">{typeLabels[mod.modificationType] || mod.modificationType}</Badge>
                          </div>
                          <p className="text-xs font-medium text-foreground">Order: {mod.orderId}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Customer: {mod.customerName} · <a href={`tel:${mod.customerPhone.replace(/\s/g, '')}`} className="text-primary hover:underline inline-flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{mod.customerPhone}</a>
                          </p>
                          <p className="text-[10px] text-muted-foreground">Kitchen: {mod.kitchenName} · Partner: {mod.partnerName}</p>
                          <p className="text-xs text-foreground mt-1.5 bg-muted/50 rounded p-2">{mod.description}</p>
                          <p className="text-[9px] text-muted-foreground mt-1">Requested: {mod.requestedAt}</p>
                          {mod.notes && <p className="text-[9px] text-primary mt-0.5 italic">📝 {mod.notes}</p>}
                        </div>
                        <div className="shrink-0">
                          {mod.status === "new" && (
                            <div className="flex flex-col gap-1.5">
                              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => {
                                updateModificationStatus(mod.id, "acknowledged");
                                toast({ title: "Request Acknowledged", description: `${mod.orderId} modification in progress` });
                              }}>
                                <Eye className="w-3 h-3" /> Acknowledge
                              </Button>
                              <Button size="sm" className="text-xs gap-1" onClick={() => {
                                updateModificationStatus(mod.id, "resolved", "SSC Agent", "Modification applied");
                                toast({ title: "Request Resolved", description: `${mod.orderId} modification completed` });
                              }}>
                                <CheckCircle2 className="w-3 h-3" /> Resolve
                              </Button>
                            </div>
                          )}
                          {mod.status === "acknowledged" && (
                            <div className="flex flex-col gap-1.5">
                              <Button size="sm" className="text-xs gap-1" onClick={() => {
                                updateModificationStatus(mod.id, "resolved", "SSC Agent", "Modification applied");
                                toast({ title: "Request Resolved", description: `${mod.orderId} modification completed` });
                              }}>
                                <CheckCircle2 className="w-3 h-3" /> Resolve
                              </Button>
                              <Button size="sm" variant="destructive" className="text-xs gap-1" onClick={() => {
                                updateModificationStatus(mod.id, "escalated");
                                toast({ title: "Escalated", description: `${mod.orderId} escalated to OPS`, variant: "destructive" });
                              }}>
                                <AlertTriangle className="w-3 h-3" /> Escalate
                              </Button>
                            </div>
                          )}
                          {mod.status === "resolved" && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 text-[9px]">✅ Done</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ DELAY COMPLAINTS TAB ═══════════════════ */}
      {activeTab === "delay_complaints" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">New</p><p className="text-lg font-bold text-destructive">{delayComplaints.filter(d => d.status === "new").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Acknowledged</p><p className="text-lg font-bold text-amber-600">{delayComplaints.filter(d => d.status === "acknowledged").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Resolved</p><p className="text-lg font-bold text-green-600">{delayComplaints.filter(d => d.status === "resolved").length}</p></CardContent></Card>
            <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Total</p><p className="text-lg font-bold text-foreground">{delayComplaints.length}</p></CardContent></Card>
          </div>

          <div className="space-y-3">
            {delayComplaints.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No delay complaints</p>
              </Card>
            ) : (
              delayComplaints.map((dc) => {
                const dcStatusCfg: Record<DelayComplaint["status"], { label: string; cls: string }> = {
                  new: { label: "New", cls: "bg-destructive/15 text-destructive" },
                  acknowledged: { label: "Acknowledged", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
                  resolved: { label: "Resolved", cls: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
                  escalated: { label: "Escalated", cls: "bg-destructive/15 text-destructive" },
                };
                const dsCfg = dcStatusCfg[dc.status];
                return (
                  <Card key={dc.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-sm text-foreground">{dc.id}</span>
                            <Badge variant="outline" className="text-[10px]">Order {dc.orderId}</Badge>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${dsCfg.cls}`}>{dsCfg.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Customer: {dc.customerName} · <a href={`tel:${dc.customerPhone}`} className="text-primary underline">{dc.customerPhone}</a></p>
                          <p className="text-xs text-muted-foreground">Kitchen: {dc.kitchenName} · Partner: {dc.partnerName}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">Reported: {dc.reportedAt}</p>
                          {dc.notes && <p className="text-[10px] text-muted-foreground mt-1 italic">Notes: {dc.notes}</p>}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {dc.status === "new" && (
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => updateDelayComplaintStatus(dc.id, "acknowledged")}>
                              Acknowledge
                            </Button>
                          )}
                          {(dc.status === "new" || dc.status === "acknowledged") && (
                            <Button size="sm" className="text-xs" onClick={() => updateDelayComplaintStatus(dc.id, "resolved", "SSC Agent")}>
                              Resolve
                            </Button>
                          )}
                          {dc.status !== "escalated" && dc.status !== "resolved" && (
                            <Button size="sm" variant="destructive" className="text-xs" onClick={() => updateDelayComplaintStatus(dc.id, "escalated")}>
                              Escalate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ PARTNER CHATS TAB ═══════════════════ */}
      {activeTab === "partner_chats" && (
        <SSCPartnerChats />
      )}

      {/* Floating Chat Widget — available on all tabs */}
      <SSCFloatingChat />
    </div>
  );
}
