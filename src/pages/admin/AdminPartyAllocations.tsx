import { useState, useMemo, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import jsPDF from "jspdf";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockPartnerLocations,
  computeProductionVolume,
  getPortionSize,
  type PartnerLocation,
} from "@/data/partyProductionData";
import { usePartyOrders, useUpdatePartyOrder } from "@/hooks/useSupabaseData";
import { partyMenu, mealLabels, categoryLabels } from "@/data/partyMenuData";
import {
  getPackingConfig,
  savePackingConfig,
  calculatePackingCharges,
  type PackingConfig,
} from "@/data/packingChargesConfig";
import {
  getEscalations,
  getAllocationLogs,
  addEscalation,
  addAllocationLog,
  resolveEscalation,
  type AllocationMode,
  type AllocationEscalation,
  type AllocationLog,
} from "@/data/allocationStore";
import {
  getDeliveryRecords,
  getDeliveryLogs,
  updateDeliveryStatus,
  addDeliveryLog,
  getAvailableAgents,
  getFoodReadyOrders,
  getInTransitOrders,
  getDeliveredOrders,
  getFailedDeliveries,
  type DeliveryRecord,
  type DeliveryAgent,
  type DeliveryLog as DeliveryLogType,
} from "@/data/deliveryLogisticsStore";
import {
  getFeedbackRecords,
  getPendingFeedbacks,
  getSentFeedbacks,
  getRespondedFeedbacks,
  sendFeedbackWhatsApp,
  recordFeedbackResponse,
  markNoResponse,
  FEEDBACK_TEMPLATE,
  type CustomerFeedback,
} from "@/data/feedbackStore";
import { useRegion } from "@/contexts/RegionContext";
import { useToast } from "@/hooks/use-toast";
import { getAdminRole } from "@/data/adminRoles";
import {
  Users,
  CalendarDays,
  MapPin,
  Star,
  Check,
  Clock,
  Zap,
  ChefHat,
  Settings,
  Download,
  Package,
  AlertTriangle,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  XCircle,
  ArrowRight,
  Shield,
  Eye,
  Ban,
  Truck,
  Phone,
  Navigation,
  CheckCircle2,
  CircleDot,
  MessageCircle,
  Send,
  StarIcon,
} from "lucide-react";

// Leaflet icon fix
const customerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const partnerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const selectedPartnerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useMemo(() => { if (positions.length > 0) map.fitBounds(positions, { padding: [40, 40] }); }, [positions, map]);
  return null;
};

// Role-based permission helpers
const isExecutiveOnly = () => {
  const role = getAdminRole();
  return role === "party_executive";
};

const isTeamLeaderOrAbove = () => {
  const role = getAdminRole();
  return role !== "party_executive";
};

const serviceTypeBadge: Record<string, { label: string; className: string }> = {
  "bulk-food": { label: "🍲 Bulk", className: "bg-orange-100 text-orange-800" },
  "combo-meal-box": { label: "🍱 Combo", className: "bg-violet-100 text-violet-800" },
};

const AdminPartyAllocations = ({ embedded = false }: { embedded?: boolean }) => {
  const { formatPrice } = useRegion();
  const { toast } = useToast();
  const { data: dbOrders = [], isLoading: loadingOrders } = usePartyOrders();
  const updatePartyOrder = useUpdatePartyOrder();
  // Map DB records to local format for compatibility
  const [localStatusOverrides, setLocalStatusOverrides] = useState<Record<string, string>>({});
  const orders = dbOrders.map((o: any) => ({
    ...o,
    orderId: o.order_id,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerLat: o.customer_lat,
    customerLng: o.customer_lng,
    customerAddress: o.customer_address,
    serviceType: o.service_type,
    foodType: o.food_type,
    guestCount: o.guest_count,
    eventDate: o.event_date,
    eventTime: o.event_time,
    selectedItems: o.selected_items || [],
    cookingInstructions: o.cooking_instructions,
    totalAmount: o.total_amount,
    allocatedPartnerId: o.allocated_partner_id,
    allocatedAt: o.allocated_at,
    createdAt: o.created_at,
    status: localStatusOverrides[o.id] || o.status,
  }));
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [tab, setTab] = useState("pending");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [packingConfig, setPackingConfig] = useState<PackingConfig>(getPackingConfig());
  const [allocationMode, setAllocationMode] = useState<AllocationMode>("manual");
  const [autoProcessing, setAutoProcessing] = useState(false);
  const autoTriggeredRef = useRef<string | null>(null);
  const [escalations, setEscalations] = useState<AllocationEscalation[]>(getEscalations());
  const [logs, setLogs] = useState<AllocationLog[]>(getAllocationLogs());
  const [resolveDialog, setResolveDialog] = useState<AllocationEscalation | null>(null);
  const [resolveAction, setResolveAction] = useState<"reallocate" | "cancel">("reallocate");
  const [resolveNotes, setResolveNotes] = useState("");
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [refundAmount, setRefundAmount] = useState(0);
  const [reportsSubTab, setReportsSubTab] = useState("overview");
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecord[]>(getDeliveryRecords());
  const [deliveryLogsList, setDeliveryLogsList] = useState<DeliveryLogType[]>(getDeliveryLogs());
  const [deliverySubTab, setDeliverySubTab] = useState("food_ready");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const agents = getAvailableAgents();
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>(getFeedbackRecords());
  const [feedbackSubTab, setFeedbackSubTab] = useState("pending_send");
  const [feedbackResponseDialog, setFeedbackResponseDialog] = useState<CustomerFeedback | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  const pending = orders.filter((o) => o.status === "pending_allocation" && (serviceTypeFilter === "all" || o.serviceType === serviceTypeFilter));
  const allocated = orders.filter((o) => o.status !== "pending_allocation" && (serviceTypeFilter === "all" || o.serviceType === serviceTypeFilter));
  const pendingEscalations = escalations.filter(e => e.status === "pending_team_action");
  const foodReadyOrders = deliveryRecords.filter(d => d.status === "food_ready");
  const inTransitOrders = deliveryRecords.filter(d => ["pickup_assigned", "pickup_en_route", "picked_up", "in_transit"].includes(d.status));
  const deliveredOrders = deliveryRecords.filter(d => d.status === "delivered");
  const failedDeliveries = deliveryRecords.filter(d => d.status === "delivery_failed");
  const pendingFeedbacks = feedbacks.filter(f => f.status === "pending");
  const respondedFeedbacks = feedbacks.filter(f => f.status === "responded" || (f.status === "sent" && !!f.rating));
  const awaitingFeedbacks = feedbacks.filter(f => f.status === "sent" && !f.rating);

  const handleSavePackingConfig = () => {
    savePackingConfig(packingConfig);
    toast({ title: "✅ Packing config saved" });
  };

  const handleDownloadPDF = (order: any) => {
    const production = computeProductionVolume(order.selectedItems, order.guestCount);
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text(`Production Sheet — ${order.orderId}`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Customer: ${order.customerName} | Guests: ${order.guestCount} | Date: ${order.eventDate} | ${order.occasion}`, 14, 26);
    const headers = ["#", "Item Name", "Category", "Meal Type", "Portion/Plate", "Guests", "Total Volume"];
    const colX = [14, 22, 80, 150, 195, 230, 250];
    let y = 36;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    headers.forEach((h, i) => doc.text(h, colX[i], y));
    y += 2;
    doc.setDrawColor(180);
    doc.line(14, y, 290, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    production.filter(Boolean).forEach((row: any, idx: number) => {
      if (y > 190) { doc.addPage(); y = 18; }
      doc.text(String(idx + 1), colX[0], y);
      doc.text(row.itemName || "", colX[1], y);
      doc.text((categoryLabels[row.category] || row.category || "").replace(/[^\w\s&,]/g, ""), colX[2], y);
      doc.text((mealLabels[row.mealType] || row.mealType || "").replace(/[^\w\s&,]/g, ""), colX[3], y);
      doc.text(row.portionPerPlate || "", colX[4], y);
      doc.text(String(order.guestCount), colX[5], y);
      doc.text(row.totalVolume || "", colX[6], y);
      y += 6;
    });
    doc.save(`party-order-${order.orderId}-production.pdf`);
    toast({ title: "📥 Downloaded PDF" });
  };

  const partnersWithDistance = useMemo(() => {
    if (!selectedOrder) return [];
    return mockPartnerLocations
      .filter((p) => p.isAvailable && (p.speciality === "both" || p.speciality === selectedOrder.foodType))
      .map((p) => ({
        ...p,
        distance: haversineKm(selectedOrder.customerLat, selectedOrder.customerLng, p.lat, p.lng),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [selectedOrder]);

  const handleAllocate = () => {
    if (!selectedOrder || !selectedPartner) return;
    const partner = partnersWithDistance.find(p => p.id === selectedPartner);
    // Update in DB
    updatePartyOrder.mutate({
      id: selectedOrder.id,
      updates: { status: "allocated", allocated_partner_id: selectedPartner, allocated_at: new Date().toISOString() },
    });
    setLocalStatusOverrides(prev => ({ ...prev, [selectedOrder.id]: "allocated" }));
    const newLog: AllocationLog = {
      id: `log-${Date.now()}`,
      orderId: selectedOrder.id,
      orderDisplayId: selectedOrder.orderId,
      customerName: selectedOrder.customerName,
      mode: allocationMode,
      partnerId: selectedPartner,
      partnerName: partner?.name || "",
      distance: partner?.distance || 0,
      allocatedAt: new Date().toISOString(),
      status: "sent",
    };
    addAllocationLog(newLog);
    setLogs(getAllocationLogs());
    setSelectedOrder(null);
    setSelectedPartner(null);
    toast({ title: `✅ Allocated to ${partner?.name}` });
  };

  const handleAutoAllocate = () => {
    if (!selectedOrder || partnersWithDistance.length === 0) return;
    const nearest = partnersWithDistance[0];
    setSelectedPartner(nearest.id);
  };
  // Auto-trigger when order is selected in auto mode
  useEffect(() => {
    if (allocationMode === "auto" && selectedOrder && !autoProcessing && !isExecutiveOnly() && autoTriggeredRef.current !== selectedOrder.id) {
      autoTriggeredRef.current = selectedOrder.id;
      handleAutoMode();
    }
  }, [allocationMode, selectedOrder, autoProcessing]);


  const handleAutoMode = async () => {
    if (!selectedOrder) return;
    setAutoProcessing(true);
    const MAX_RADIUS = 10; // km

    const eligiblePartners = partnersWithDistance.filter(p => p.distance <= MAX_RADIUS);

    if (eligiblePartners.length === 0) {
      // Escalate immediately
      const esc: AllocationEscalation = {
        id: `esc-${Date.now()}`,
        orderId: selectedOrder.id,
        orderDisplayId: selectedOrder.orderId,
        customerName: selectedOrder.customerName,
        guestCount: selectedOrder.guestCount,
        eventDate: selectedOrder.eventDate,
        reason: "No partner available within 10 km radius",
        rejectedBy: [],
        rejectionReasons: {},
        escalatedAt: new Date().toISOString(),
        status: "pending_team_action",
      };
      addEscalation(esc);
      setEscalations(getEscalations());
      toast({ title: "⚠️ No partners within 10 km — escalated to team", variant: "destructive" });
      setAutoProcessing(false);
      return;
    }

    // Simulate sending to nearest partner and getting acceptance
    // In demo, first partner "accepts" after a brief delay
    const nearest = eligiblePartners[0];
    const simLog: AllocationLog = {
      id: `log-${Date.now()}`,
      orderId: selectedOrder.id,
      orderDisplayId: selectedOrder.orderId,
      customerName: selectedOrder.customerName,
      mode: "auto",
      partnerId: nearest.id,
      partnerName: nearest.name,
      distance: nearest.distance,
      allocatedAt: new Date().toISOString(),
      status: "sent",
      autoAttempt: 1,
    };
    addAllocationLog(simLog);
    setLogs(getAllocationLogs());

    // Simulate acceptance after 1.5s
    setTimeout(() => {
      updatePartyOrder.mutate({
        id: selectedOrder.id,
        updates: { status: "allocated", allocated_partner_id: nearest.id, allocated_at: new Date().toISOString() },
      });
      setLocalStatusOverrides(prev => ({ ...prev, [selectedOrder.id]: "allocated" }));
      toast({ title: `✅ Auto-allocated to ${nearest.name} (${nearest.distance.toFixed(1)} km)` });
      setSelectedOrder(null);
      setSelectedPartner(null);
      setAutoProcessing(false);
    }, 1500);
  };

  // Resolve escalation
  const handleResolveEscalation = () => {
    if (!resolveDialog) return;
    if (resolveAction === "cancel") {
      resolveEscalation(
        resolveDialog.id,
        "cancelled_refunded",
        "Current Admin",
        `Cancelled & refunded (${refundType})`,
        refundType === "full" ? undefined : refundAmount,
        refundType,
        resolveNotes
      );
      toast({ title: `🔴 Order cancelled & ${refundType} refund initiated` });
    } else {
      resolveEscalation(
        resolveDialog.id,
        "reallocated",
        "Current Admin",
        `Reallocated manually — ${resolveNotes}`,
        undefined,
        undefined,
        resolveNotes
      );
      toast({ title: "✅ Escalation resolved — reallocated" });
    }
    setEscalations(getEscalations());
    setResolveDialog(null);
    setResolveNotes("");
  };

  const mapPositions: [number, number][] = useMemo(() => {
    if (!selectedOrder) return [[13.05, 80.25]];
    const pts: [number, number][] = [[selectedOrder.customerLat, selectedOrder.customerLng]];
    partnersWithDistance.forEach((p) => pts.push([p.lat, p.lng]));
    return pts;
  }, [selectedOrder, partnersWithDistance]);

  // Report stats
  const totalAllocations = logs.length;
  const autoAllocations = logs.filter(l => l.mode === "auto").length;
  const manualAllocations = logs.filter(l => l.mode === "manual").length;
  const rejections = logs.filter(l => l.status === "rejected").length;
  const escalationCount = escalations.length;
  const resolvedCount = escalations.filter(e => e.status !== "pending_team_action").length;
  const cancelledCount = escalations.filter(e => e.status === "cancelled_refunded").length;

  // Delivery handlers
  const handleAssignAgent = (deliveryId: string) => {
    if (!selectedAgent) return;
    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent) return;
    updateDeliveryStatus(deliveryId, "pickup_assigned", {
      agentId: selectedAgent,
      agentName: agent.name,
      pickupAssignedAt: new Date().toISOString(),
    });
    addDeliveryLog({
      id: `dl-${Date.now()}`,
      deliveryId,
      orderDisplayId: deliveryRecords.find(d => d.id === deliveryId)?.orderDisplayId || "",
      action: `Delivery agent ${agent.name} assigned for pickup`,
      timestamp: new Date().toISOString(),
      by: "Admin",
    });
    setDeliveryRecords(getDeliveryRecords());
    setDeliveryLogsList(getDeliveryLogs());
    setSelectedAgent(null);
    toast({ title: `🚚 ${agent.name} assigned for pickup` });
  };

  const handleUpdateDeliveryStatus = (deliveryId: string, newStatus: "picked_up" | "in_transit" | "delivered" | "delivery_failed", label: string) => {
    const updates: Partial<DeliveryRecord> = {};
    if (newStatus === "picked_up") updates.pickedUpAt = new Date().toISOString();
    if (newStatus === "delivered") updates.deliveredAt = new Date().toISOString();
    updateDeliveryStatus(deliveryId, newStatus, updates);
    addDeliveryLog({
      id: `dl-${Date.now()}`,
      deliveryId,
      orderDisplayId: deliveryRecords.find(d => d.id === deliveryId)?.orderDisplayId || "",
      action: label,
      timestamp: new Date().toISOString(),
      by: "Admin",
    });
    setDeliveryRecords(getDeliveryRecords());
    setDeliveryLogsList(getDeliveryLogs());
    toast({ title: `✅ ${label}` });
  };

  // Feedback handlers
  const handleSendFeedback = (feedbackId: string) => {
    sendFeedbackWhatsApp(feedbackId, "Current Admin");
    setFeedbacks(getFeedbackRecords());
    toast({ title: "📱 WhatsApp feedback sent!" });
  };

  const handleRecordResponse = () => {
    if (!feedbackResponseDialog) return;
    recordFeedbackResponse(feedbackResponseDialog.id, feedbackRating, feedbackComment);
    setFeedbacks(getFeedbackRecords());
    setFeedbackResponseDialog(null);
    setFeedbackComment("");
    setFeedbackRating(5);
    toast({ title: "✅ Feedback response recorded" });
  };

  const handleMarkNoResponse = (feedbackId: string) => {
    markNoResponse(feedbackId);
    setFeedbacks(getFeedbackRecords());
    toast({ title: "Marked as no response" });
  };

  const canManageAllocations = isTeamLeaderOrAbove();
  const executiveOnly = isExecutiveOnly();

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">🎉 Party Order Management</h1>
            <p className="text-sm text-muted-foreground">Allocations, delivery logistics & tracking — end to end.</p>
          </div>
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 bg-secondary rounded-xl p-1.5">
            <button
              onClick={() => setAllocationMode("auto")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                allocationMode === "auto" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Auto Mode
            </button>
            <button
              onClick={() => setAllocationMode("manual")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                allocationMode === "manual" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" /> Manual Mode
            </button>
          </div>
        </div>
      )}
      {embedded && (
        <div className="flex items-center gap-2 bg-secondary rounded-xl p-1.5 w-fit">
          <button
            onClick={() => setAllocationMode("auto")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              allocationMode === "auto" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Auto Mode
          </button>
          <button
            onClick={() => setAllocationMode("manual")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              allocationMode === "manual" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" /> Manual Mode
          </button>
        </div>
      )}

      {/* Mode description */}
      <Card className={`p-3 border-l-4 ${allocationMode === "auto" ? "border-l-accent bg-accent/5" : "border-l-primary bg-primary/5"}`}>
        <div className="flex items-start gap-2">
          {allocationMode === "auto" ? <Zap className="w-4 h-4 text-accent mt-0.5" /> : <ChefHat className="w-4 h-4 text-primary mt-0.5" />}
          <div>
            <p className="text-sm font-medium text-foreground">
              {allocationMode === "auto" ? "Auto Allocation Mode" : "Manual Allocation Mode"}
            </p>
            <p className="text-xs text-muted-foreground">
              {allocationMode === "auto"
                ? "Orders are sent to the nearest available partner automatically. If rejected, it cascades to the next partner. If no partner is found within 10 km, the team is notified."
                : "Select a pending order, review available partners on the map, and allocate manually. Auto-suggest highlights the nearest partner."}
            </p>
          </div>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto flex-wrap gap-1 rounded-2xl bg-secondary p-1.5">
          <TabsTrigger value="pending" className="gap-1.5 text-xs rounded-xl py-2.5 px-3">
            <Clock className="w-3.5 h-3.5" /> Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="allocated" className="gap-1.5 text-xs rounded-xl py-2.5 px-3">
            <Check className="w-3.5 h-3.5" /> Allocated ({allocated.length})
          </TabsTrigger>
          <TabsTrigger value="warnings" className="gap-1.5 text-xs rounded-xl py-2.5 px-3 relative">
            <AlertTriangle className="w-3.5 h-3.5" /> Warnings
            {pendingEscalations.length > 0 && (
              <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingEscalations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-1.5 text-xs rounded-xl py-2.5 px-3 relative">
            <Truck className="w-3.5 h-3.5" /> Delivery
            {foodReadyOrders.length > 0 && (
              <span className="ml-1 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {foodReadyOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-1.5 text-xs rounded-xl py-2.5 px-3 relative">
            <MessageCircle className="w-3.5 h-3.5" /> Feedback
            {pendingFeedbacks.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingFeedbacks.length}
              </span>
            )}
          </TabsTrigger>
          {canManageAllocations && !embedded && (
            <TabsTrigger value="reports" className="gap-1.5 text-xs rounded-xl py-2.5 px-3">
              <BarChart3 className="w-3.5 h-3.5" /> Reports
            </TabsTrigger>
          )}
          {canManageAllocations && (
            <TabsTrigger value="settings" className="gap-1.5 text-xs rounded-xl py-2.5 px-3">
              <Settings className="w-3.5 h-3.5" /> Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* ==================== PENDING TAB ==================== */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          {/* Service type filter */}
          <div className="flex gap-1.5">
            {["all", "bulk-food", "combo-meal-box"].map((st) => (
              <button
                key={st}
                onClick={() => setServiceTypeFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  serviceTypeFilter === st
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {st === "all" ? "All Types" : serviceTypeBadge[st]?.label}
              </button>
            ))}
          </div>
          {pending.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No pending allocations</p>
          )}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {pending.map((order) => (
                <Card
                  key={order.id}
                  onClick={() => { setSelectedOrder(order); setSelectedPartner(null); }}
                  className={`p-4 cursor-pointer transition-all ${selectedOrder?.id === order.id ? "ring-2 ring-primary" : "hover:border-primary/40"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{order.orderId}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName} • {order.customerPhone}</p>
                    </div>
                    <Badge variant={order.foodType === "veg" ? "default" : "destructive"} className="text-[10px]">
                      {order.foodType === "veg" ? "🥬 Veg" : "🍗 Non-Veg"}
                    </Badge>
                    <Badge className={`text-[10px] ${serviceTypeBadge[order.serviceType]?.className || "bg-muted text-muted-foreground"}`}>
                      {serviceTypeBadge[order.serviceType]?.label || order.serviceType}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {order.guestCount} guests</span>
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {order.eventDate}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.occasion}</span>
                    <span className="font-semibold text-foreground">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {order.meals.map((m) => (
                      <span key={m} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{mealLabels[m]?.split(" ")[1] || m}</span>
                    ))}
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{order.selectedItems.length} items</span>
                  </div>
                </Card>
              ))}
            </div>

            {selectedOrder && (
              <div className="space-y-3">
                {selectedOrder.customerLat != null && selectedOrder.customerLng != null ? (
                <Card className="overflow-hidden rounded-xl">
                  <div className="h-64 relative">
                    <MapContainer
                      center={[selectedOrder.customerLat, selectedOrder.customerLng]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <FitBounds positions={mapPositions} />
                      <Marker position={[selectedOrder.customerLat, selectedOrder.customerLng]} icon={customerIcon}>
                        <Popup>
                          <strong>📍 Customer</strong><br />
                          {selectedOrder.customerName}<br />
                          <span className="text-xs">{selectedOrder.customerAddress}</span>
                        </Popup>
                      </Marker>
                      {partnersWithDistance.map((p) => (
                        <Marker
                          key={p.id}
                          position={[p.lat, p.lng]}
                          icon={selectedPartner === p.id ? selectedPartnerIcon : partnerIcon}
                          eventHandlers={{ click: () => setSelectedPartner(p.id) }}
                        >
                          <Popup>
                            <strong>🍳 {p.name}</strong><br />
                            ⭐ {p.rating} • {p.distance.toFixed(1)} km<br />
                            <span className="text-xs">{p.address}</span>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </Card>
                ) : (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  📍 Customer location not available — map cannot be displayed.
                </Card>
                )}

                {/* Auto Mode: single-click cascading send */}
                {allocationMode === "auto" ? (
                  <div className="space-y-3">
                    <Card className="p-4 bg-accent/5 border-accent/30">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
                        <Zap className="w-4 h-4 text-accent" /> Auto Allocation
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Automatically sending to the nearest available partner within 10 km. If rejected, it cascades to the next.
                      </p>
                      <div className="space-y-2 mb-3">
                        {partnersWithDistance.slice(0, 5).map((p, i) => (
                          <div key={p.id} className={`flex items-center justify-between text-xs p-2 rounded-lg ${i === 0 ? "bg-accent/10 border border-accent/30" : "bg-secondary"}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground w-4">#{i + 1}</span>
                              <ChefHat className="w-3 h-3 text-primary" />
                              <span className="font-medium text-foreground">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{p.distance.toFixed(1)} km</span>
                              {p.distance > 10 && <Badge variant="destructive" className="text-[9px]">Out of range</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                      {autoProcessing && (
                        <div className="w-full py-3 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center gap-2 text-sm font-medium text-accent">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Sending to nearest partner...
                        </div>
                      )}
                      {executiveOnly && (
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Shield className="w-3 h-3" /> View-only access for Executives</p>
                      )}
                    </Card>
                  </div>
                ) : (
                  <>
                    {/* Manual Mode — existing UI */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Available Partners</h3>
                      <button
                        onClick={handleAutoAllocate}
                        className="text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                      >
                        <Zap className="w-3 h-3" /> Auto-Suggest (Nearest)
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {partnersWithDistance.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPartner(p.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedPartner === p.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <ChefHat className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.address}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-foreground flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{p.rating}</p>
                            <p className="text-xs text-muted-foreground">{p.distance.toFixed(1)} km</p>
                            <p className="text-[10px] text-muted-foreground">Cap: {p.capacity} plates</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleAllocate}
                      disabled={!selectedPartner || executiveOnly}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                      Allocate to Selected Partner
                    </button>
                    {executiveOnly && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> View-only access for Executives</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ==================== ALLOCATED TAB ==================== */}
        <TabsContent value="allocated" className="space-y-3 mt-4">
          {allocated.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No allocated orders yet</p>
          )}
          {allocated.map((order) => {
            const partner = mockPartnerLocations.find((p) => p.id === order.allocatedPartnerId);
            return (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{order.orderId}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName} • {order.guestCount} guests • {order.eventDate}</p>
                  </div>
                  <Badge className="bg-accent/20 text-accent-foreground text-[10px]">
                    <Check className="w-3 h-3 mr-1" /> Allocated
                  </Badge>
                  <Badge className={`text-[10px] ${serviceTypeBadge[order.serviceType]?.className || "bg-muted text-muted-foreground"}`}>
                    {serviceTypeBadge[order.serviceType]?.label || order.serviceType}
                  </Badge>
                </div>
                {partner && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-secondary rounded-lg">
                    <ChefHat className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground font-medium">{partner.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{partner.address}</span>
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleDownloadPDF(order)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors">
                    <Download className="w-3 h-3" /> Download PDF
                  </button>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        {/* ==================== WARNINGS / ESCALATIONS TAB ==================== */}
        <TabsContent value="warnings" className="space-y-4 mt-4">
          {escalations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No escalations</p>
          ) : (
            <div className="space-y-3">
              {/* Filter pills */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="destructive" className="text-xs">{pendingEscalations.length} Pending</Badge>
                <Badge variant="outline" className="text-xs">{resolvedCount} Resolved</Badge>
                <Badge variant="outline" className="text-xs">{cancelledCount} Cancelled</Badge>
              </div>

              {escalations.map((esc) => (
                <Card key={esc.id} className={`p-4 ${esc.status === "pending_team_action" ? "border-destructive/40 bg-destructive/5" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        {esc.status === "pending_team_action" && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        {esc.orderDisplayId}
                      </p>
                      <p className="text-xs text-muted-foreground">{esc.customerName} • {esc.guestCount} guests • {esc.eventDate}</p>
                    </div>
                    <Badge
                      variant={esc.status === "pending_team_action" ? "destructive" : esc.status === "cancelled_refunded" ? "outline" : "default"}
                      className="text-[10px]"
                    >
                      {esc.status === "pending_team_action" ? "⚠️ Action Needed" : esc.status === "reallocated" ? "✅ Reallocated" : "🔴 Cancelled"}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Reason:</strong> {esc.reason}
                  </p>

                  {/* Rejection trail */}
                  {esc.rejectedBy.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">Rejection Trail:</p>
                      <div className="flex flex-wrap gap-1">
                        {esc.rejectedBy.map(pid => {
                          const p = mockPartnerLocations.find(x => x.id === pid);
                          return (
                            <span key={pid} className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                              {p?.name || pid}: {esc.rejectionReasons[pid] || "No reason"}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {esc.status !== "pending_team_action" && esc.resolution && (
                    <div className="p-2 bg-secondary rounded-lg text-xs text-muted-foreground">
                      <strong>Resolution:</strong> {esc.resolution}
                      {esc.resolvedBy && <span className="ml-2">— by {esc.resolvedBy}</span>}
                    </div>
                  )}

                  {/* Action buttons for pending — only Team Leader+ */}
                  {esc.status === "pending_team_action" && canManageAllocations && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => { setResolveDialog(esc); setResolveAction("reallocate"); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        <RefreshCw className="w-3 h-3" /> Re-Allocate
                      </button>
                      <button
                        onClick={() => { setResolveDialog(esc); setResolveAction("cancel"); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        <XCircle className="w-3 h-3" /> Cancel & Refund
                      </button>
                    </div>
                  )}
                  {esc.status === "pending_team_action" && executiveOnly && (
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> View-only — escalate to Team Leader for action
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Resolve Dialog */}
          {resolveDialog && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-md p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {resolveAction === "reallocate" ? <RefreshCw className="w-5 h-5 text-primary" /> : <XCircle className="w-5 h-5 text-destructive" />}
                  {resolveAction === "reallocate" ? "Re-Allocate Order" : "Cancel & Refund Order"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Order: <strong>{resolveDialog.orderDisplayId}</strong> — {resolveDialog.customerName}
                </p>

                {resolveAction === "cancel" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1">Refund Type</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRefundType("full")}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${refundType === "full" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                        >
                          Full Refund
                        </button>
                        <button
                          onClick={() => setRefundType("partial")}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${refundType === "partial" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                        >
                          Partial Refund
                        </button>
                      </div>
                    </div>
                    {refundType === "partial" && (
                      <div>
                        <label className="text-xs font-medium text-foreground block mb-1">Refund Amount ($)</label>
                        <input
                          type="number"
                          value={refundAmount}
                          onChange={e => setRefundAmount(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Notes</label>
                  <textarea
                    value={resolveNotes}
                    onChange={e => setResolveNotes(e.target.value)}
                    rows={3}
                    placeholder={resolveAction === "reallocate" ? "Which partner & why..." : "Reason for cancellation..."}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setResolveDialog(null)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolveEscalation}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity ${
                      resolveAction === "cancel" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {resolveAction === "reallocate" ? "Confirm Re-Allocation" : "Confirm Cancel & Refund"}
                  </button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ==================== REPORTS TAB ==================== */}
        {canManageAllocations && (
          <TabsContent value="reports" className="space-y-4 mt-4">
            <Tabs value={reportsSubTab} onValueChange={setReportsSubTab}>
              <TabsList>
                <TabsTrigger value="overview" className="gap-1 text-xs"><BarChart3 className="w-3 h-3" /> Overview</TabsTrigger>
                <TabsTrigger value="logs" className="gap-1 text-xs"><Clock className="w-3 h-3" /> Allocation Logs</TabsTrigger>
                <TabsTrigger value="escalations" className="gap-1 text-xs"><AlertTriangle className="w-3 h-3" /> Escalation History</TabsTrigger>
                <TabsTrigger value="cancellations" className="gap-1 text-xs"><Ban className="w-3 h-3" /> Cancellations</TabsTrigger>
                <TabsTrigger value="delivery_report" className="gap-1 text-xs"><Truck className="w-3 h-3" /> Delivery</TabsTrigger>
                <TabsTrigger value="feedback_report" className="gap-1 text-xs"><MessageCircle className="w-3 h-3" /> Feedback</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{totalAllocations}</p>
                    <p className="text-xs text-muted-foreground">Total Allocations</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-accent">{autoAllocations}</p>
                    <p className="text-xs text-muted-foreground">Auto Mode</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{manualAllocations}</p>
                    <p className="text-xs text-muted-foreground">Manual Mode</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-destructive">{rejections}</p>
                    <p className="text-xs text-muted-foreground">Rejections</p>
                  </Card>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{escalationCount}</p>
                    <p className="text-xs text-muted-foreground">Total Escalations</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{resolvedCount}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-destructive">{cancelledCount}</p>
                    <p className="text-xs text-muted-foreground">Cancelled & Refunded</p>
                  </Card>
                </div>

                {/* Auto vs Manual ratio */}
                <Card className="p-4 mt-3">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Auto vs Manual Ratio</h4>
                  <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
                    {totalAllocations > 0 && (
                      <>
                        <div className="bg-accent h-full transition-all" style={{ width: `${(autoAllocations / totalAllocations) * 100}%` }} />
                        <div className="bg-primary h-full transition-all" style={{ width: `${(manualAllocations / totalAllocations) * 100}%` }} />
                      </>
                    )}
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> Auto ({autoAllocations})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Manual ({manualAllocations})</span>
                  </div>
                </Card>
              </TabsContent>

              {/* Allocation Logs */}
              <TabsContent value="logs" className="mt-4">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No allocation logs</p>
                  ) : (
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-secondary">
                          <tr>
                            <th className="text-left p-2 font-medium text-muted-foreground">Order</th>
                            <th className="text-left p-2 font-medium text-muted-foreground">Customer</th>
                            <th className="text-left p-2 font-medium text-muted-foreground">Mode</th>
                            <th className="text-left p-2 font-medium text-muted-foreground">Partner</th>
                            <th className="text-left p-2 font-medium text-muted-foreground">Dist.</th>
                            <th className="text-left p-2 font-medium text-muted-foreground">Status</th>
                            <th className="text-left p-2 font-medium text-muted-foreground">Attempt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map(log => (
                            <tr key={log.id} className="border-t border-border">
                              <td className="p-2 font-medium text-foreground">{log.orderDisplayId}</td>
                              <td className="p-2 text-muted-foreground">{log.customerName}</td>
                              <td className="p-2">
                                <Badge variant={log.mode === "auto" ? "default" : "outline"} className="text-[9px]">
                                  {log.mode === "auto" ? "⚡ Auto" : "✋ Manual"}
                                </Badge>
                              </td>
                              <td className="p-2 text-foreground">{log.partnerName || "—"}</td>
                              <td className="p-2 text-muted-foreground">{log.distance > 0 ? `${log.distance.toFixed(1)} km` : "—"}</td>
                              <td className="p-2">
                                <Badge
                                  variant={log.status === "accepted" ? "default" : log.status === "rejected" ? "destructive" : log.status === "escalated" ? "destructive" : "outline"}
                                  className="text-[9px]"
                                >
                                  {log.status}
                                </Badge>
                              </td>
                              <td className="p-2 text-muted-foreground">{log.autoAttempt ? `#${log.autoAttempt}` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Escalation History */}
              <TabsContent value="escalations" className="mt-4">
                <div className="space-y-3">
                  {escalations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No escalation history</p>
                  ) : escalations.map(esc => (
                    <Card key={esc.id} className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{esc.orderDisplayId}</p>
                          <p className="text-xs text-muted-foreground">{esc.customerName} • {esc.eventDate}</p>
                        </div>
                        <Badge variant={esc.status === "pending_team_action" ? "destructive" : esc.status === "reallocated" ? "default" : "outline"} className="text-[10px]">
                          {esc.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground"><strong>Reason:</strong> {esc.reason}</p>
                      <p className="text-xs text-muted-foreground"><strong>Rejected by:</strong> {esc.rejectedBy.length} partner(s)</p>
                      {esc.resolution && <p className="text-xs text-primary mt-1"><strong>Resolution:</strong> {esc.resolution}</p>}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Cancellations */}
              <TabsContent value="cancellations" className="mt-4">
                {escalations.filter(e => e.status === "cancelled_refunded").length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No cancellations yet</p>
                ) : (
                  <div className="space-y-3">
                    {escalations.filter(e => e.status === "cancelled_refunded").map(esc => (
                      <Card key={esc.id} className="p-4 border-destructive/20">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-foreground">{esc.orderDisplayId}</p>
                            <p className="text-xs text-muted-foreground">{esc.customerName} • {esc.guestCount} guests</p>
                          </div>
                          <Badge variant="destructive" className="text-[10px]">Cancelled & Refunded</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground"><strong>Reason:</strong> {esc.reason}</p>
                        {esc.refundType && <p className="text-xs text-muted-foreground"><strong>Refund:</strong> {esc.refundType}{esc.refundAmount ? ` — $${esc.refundAmount}` : ""}</p>}
                        {esc.resolution && <p className="text-xs text-muted-foreground"><strong>Resolution:</strong> {esc.resolution}</p>}
                        {esc.resolvedBy && <p className="text-xs text-muted-foreground"><strong>Resolved by:</strong> {esc.resolvedBy} on {new Date(esc.resolvedAt || "").toLocaleDateString()}</p>}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Delivery Report */}
              <TabsContent value="delivery_report" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{deliveryRecords.length}</p>
                    <p className="text-xs text-muted-foreground">Total Deliveries</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-accent">{deliveredOrders.length}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{inTransitOrders.length}</p>
                    <p className="text-xs text-muted-foreground">In Transit</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-destructive">{failedDeliveries.length}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </Card>
                </div>

                {/* Delivery success rate */}
                <Card className="p-4 mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Delivery Performance</h4>
                  <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
                    {deliveryRecords.length > 0 && (
                      <>
                        <div className="bg-accent h-full" style={{ width: `${(deliveredOrders.length / deliveryRecords.length) * 100}%` }} />
                        <div className="bg-primary h-full" style={{ width: `${(inTransitOrders.length / deliveryRecords.length) * 100}%` }} />
                        <div className="bg-destructive h-full" style={{ width: `${(failedDeliveries.length / deliveryRecords.length) * 100}%` }} />
                      </>
                    )}
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> Delivered ({deliveredOrders.length})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> In Transit ({inTransitOrders.length})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block" /> Failed ({failedDeliveries.length})</span>
                  </div>
                </Card>

                {/* Agent performance */}
                <Card className="p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Agent Performance</h4>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-2 font-medium text-muted-foreground">Agent</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Vehicle</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Rating</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Deliveries</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map(agent => {
                          const agentDeliveries = deliveryRecords.filter(d => d.agentId === agent.id);
                          return (
                            <tr key={agent.id} className="border-t border-border">
                              <td className="p-2 font-medium text-foreground">{agent.name}</td>
                              <td className="p-2 text-muted-foreground">{agent.vehicle}</td>
                              <td className="p-2"><span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500" /> {agent.rating}</span></td>
                              <td className="p-2 text-muted-foreground">{agentDeliveries.length}</td>
                              <td className="p-2"><Badge variant={agent.isAvailable ? "default" : "outline"} className="text-[9px]">{agent.isAvailable ? "Available" : "Busy"}</Badge></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              {/* Feedback Report */}
              <TabsContent value="feedback_report" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{feedbacks.length}</p>
                    <p className="text-xs text-muted-foreground">Total Feedbacks</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-accent">{respondedFeedbacks.length}</p>
                    <p className="text-xs text-muted-foreground">Responded</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{pendingFeedbacks.length + awaitingFeedbacks.length}</p>
                    <p className="text-xs text-muted-foreground">Pending / Awaiting</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-amber-500">
                      {respondedFeedbacks.length > 0
                        ? (respondedFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / respondedFeedbacks.length).toFixed(1)
                        : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Rating ⭐</p>
                  </Card>
                </div>

                {/* Rating distribution */}
                <Card className="p-4 mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Rating Distribution</h4>
                  {[5, 4, 3, 2, 1].map(r => {
                    const count = respondedFeedbacks.filter(f => f.rating === r).length;
                    const pct = respondedFeedbacks.length > 0 ? (count / respondedFeedbacks.length) * 100 : 0;
                    return (
                      <div key={r} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs w-12 text-muted-foreground flex items-center gap-0.5">{r} <Star className="w-3 h-3 text-amber-500 fill-amber-500" /></span>
                        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </Card>

                {/* Partner-wise feedback summary */}
                <Card className="p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Partner-wise Feedback</h4>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-2 font-medium text-muted-foreground">Partner</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Orders</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Avg Rating</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Response Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(new Set(feedbacks.map(f => f.partnerName))).map(partner => {
                          const pFeedbacks = feedbacks.filter(f => f.partnerName === partner);
                          const pResponded = pFeedbacks.filter(f => f.rating);
                          const avgRating = pResponded.length > 0
                            ? (pResponded.reduce((s, f) => s + (f.rating || 0), 0) / pResponded.length).toFixed(1)
                            : "—";
                          const responseRate = pFeedbacks.length > 0
                            ? Math.round((pResponded.length / pFeedbacks.length) * 100)
                            : 0;
                          return (
                            <tr key={partner} className="border-t border-border">
                              <td className="p-2 font-medium text-foreground">{partner}</td>
                              <td className="p-2 text-muted-foreground">{pFeedbacks.length}</td>
                              <td className="p-2"><span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500" /> {avgRating}</span></td>
                              <td className="p-2 text-muted-foreground">{responseRate}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}

        {/* ==================== DELIVERY TAB ==================== */}
        <TabsContent value="delivery" className="space-y-4 mt-4">
          <Tabs value={deliverySubTab} onValueChange={setDeliverySubTab}>
            <TabsList>
              <TabsTrigger value="food_ready" className="gap-1 text-xs">
                <CheckCircle2 className="w-3 h-3" /> Food Ready ({foodReadyOrders.length})
              </TabsTrigger>
              <TabsTrigger value="in_transit" className="gap-1 text-xs">
                <Truck className="w-3 h-3" /> In Transit ({inTransitOrders.length})
              </TabsTrigger>
              <TabsTrigger value="delivered" className="gap-1 text-xs">
                <Check className="w-3 h-3" /> Delivered ({deliveredOrders.length})
              </TabsTrigger>
              <TabsTrigger value="failed" className="gap-1 text-xs">
                <AlertTriangle className="w-3 h-3" /> Failed ({failedDeliveries.length})
              </TabsTrigger>
              <TabsTrigger value="delivery_logs" className="gap-1 text-xs">
                <Clock className="w-3 h-3" /> Logs
              </TabsTrigger>
            </TabsList>

            {/* Food Ready — assign delivery agent */}
            <TabsContent value="food_ready" className="mt-4 space-y-3">
              {foodReadyOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No food-ready orders awaiting pickup</p>
              ) : foodReadyOrders.map(del => (
                <Card key={del.id} className="p-4 border-l-4 border-l-accent">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-accent" /> {del.orderDisplayId}
                      </p>
                      <p className="text-xs text-muted-foreground">{del.customerName} • {del.guestCount} guests • {del.eventDate} {del.eventTime}</p>
                    </div>
                    <Badge className="bg-accent/20 text-accent-foreground text-[10px]">🍳 Food Ready</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" /> {del.partnerName}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {del.customerAddress}</span>
                    {del.foodReadyAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Ready at {new Date(del.foodReadyAt).toLocaleTimeString()}</span>}
                    {del.distanceKm && <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {del.distanceKm} km</span>}
                  </div>

                  {/* Agent Assignment */}
                  {canManageAllocations && (
                    <div className="p-3 bg-secondary rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-foreground">Assign Delivery Agent</p>
                      <div className="space-y-1.5">
                        {agents.map(agent => (
                          <div
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent.id)}
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                              selectedAgent === agent.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Truck className="w-3.5 h-3.5 text-primary" />
                              <div>
                                <p className="font-medium text-foreground">{agent.name}</p>
                                <p className="text-[10px] text-muted-foreground">{agent.vehicle} • {agent.vehicleNumber}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-amber-500" /> {agent.rating}</p>
                              <a href={`tel:${agent.phone}`} className="text-[10px] text-primary flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> Call</a>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleAssignAgent(del.id)}
                        disabled={!selectedAgent}
                        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" /> Assign & Dispatch
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </TabsContent>

            {/* In Transit */}
            <TabsContent value="in_transit" className="mt-4 space-y-3">
              {inTransitOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders in transit</p>
              ) : inTransitOrders.map(del => (
                <Card key={del.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{del.orderDisplayId}</p>
                      <p className="text-xs text-muted-foreground">{del.customerName} • {del.guestCount} guests</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary text-[10px]">
                      {del.status === "pickup_assigned" ? "🔵 Pickup Assigned" : del.status === "picked_up" ? "📦 Picked Up" : "🚚 In Transit"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {del.agentName || "—"}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {del.customerAddress}</span>
                    <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" /> From: {del.partnerName}</span>
                    {del.estimatedDeliveryMins && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ETA: {del.estimatedDeliveryMins} min</span>}
                  </div>

                  {/* Status progression */}
                  <div className="flex items-center gap-1 mb-3">
                    {["pickup_assigned", "picked_up", "in_transit", "delivered"].map((s, i) => (
                      <div key={s} className="flex items-center gap-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          ["pickup_assigned", "pickup_en_route", "picked_up", "in_transit", "delivered"].indexOf(del.status) >= i
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {i + 1}
                        </div>
                        {i < 3 && <div className={`w-6 h-0.5 ${["pickup_assigned", "pickup_en_route", "picked_up", "in_transit", "delivered"].indexOf(del.status) > i ? "bg-primary" : "bg-secondary"}`} />}
                      </div>
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-2">
                      {del.status === "pickup_assigned" ? "Agent assigned" : del.status === "picked_up" ? "Food picked up" : "On the way"}
                    </span>
                  </div>

                  {canManageAllocations && (
                    <div className="flex gap-2">
                      {del.status === "pickup_assigned" && (
                        <button onClick={() => handleUpdateDeliveryStatus(del.id, "picked_up", "Food picked up")} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">
                          📦 Mark Picked Up
                        </button>
                      )}
                      {del.status === "picked_up" && (
                        <button onClick={() => handleUpdateDeliveryStatus(del.id, "in_transit", "In transit to customer")} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">
                          🚚 Mark In Transit
                        </button>
                      )}
                      {del.status === "in_transit" && (
                        <>
                          <button onClick={() => handleUpdateDeliveryStatus(del.id, "delivered", "Order delivered successfully")} className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90">
                            ✅ Mark Delivered
                          </button>
                          <button onClick={() => handleUpdateDeliveryStatus(del.id, "delivery_failed", "Delivery failed")} className="py-2 px-3 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90">
                            ❌ Failed
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </TabsContent>

            {/* Delivered */}
            <TabsContent value="delivered" className="mt-4 space-y-3">
              {deliveredOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No delivered orders yet</p>
              ) : deliveredOrders.map(del => (
                <Card key={del.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{del.orderDisplayId}</p>
                      <p className="text-xs text-muted-foreground">{del.customerName} • {del.guestCount} guests</p>
                    </div>
                    <Badge className="bg-accent/20 text-accent-foreground text-[10px]"><Check className="w-3 h-3 mr-0.5" /> Delivered</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span><strong>Agent:</strong> {del.agentName || "—"}</span>
                    <span><strong>Partner:</strong> {del.partnerName}</span>
                    {del.deliveredAt && <span><strong>Delivered:</strong> {new Date(del.deliveredAt).toLocaleString()}</span>}
                    {del.foodReadyAt && <span><strong>Food Ready:</strong> {new Date(del.foodReadyAt).toLocaleString()}</span>}
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Failed */}
            <TabsContent value="failed" className="mt-4 space-y-3">
              {failedDeliveries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No failed deliveries</p>
              ) : failedDeliveries.map(del => (
                <Card key={del.id} className="p-4 border-destructive/20">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{del.orderDisplayId}</p>
                      <p className="text-xs text-muted-foreground">{del.customerName} • {del.guestCount} guests</p>
                    </div>
                    <Badge variant="destructive" className="text-[10px]">❌ Failed</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground"><strong>Agent:</strong> {del.agentName || "—"}</p>
                  {del.failureReason && <p className="text-xs text-destructive"><strong>Reason:</strong> {del.failureReason}</p>}
                </Card>
              ))}
            </TabsContent>

            {/* Delivery Logs */}
            <TabsContent value="delivery_logs" className="mt-4">
              {deliveryLogsList.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No delivery logs</p>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-2 font-medium text-muted-foreground">Order</th>
                        <th className="text-left p-2 font-medium text-muted-foreground">Action</th>
                        <th className="text-left p-2 font-medium text-muted-foreground">By</th>
                        <th className="text-left p-2 font-medium text-muted-foreground">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveryLogsList.map(log => (
                        <tr key={log.id} className="border-t border-border">
                          <td className="p-2 font-medium text-foreground">{log.orderDisplayId}</td>
                          <td className="p-2 text-muted-foreground">{log.action}</td>
                          <td className="p-2 text-muted-foreground">{log.by}</td>
                          <td className="p-2 text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ==================== FEEDBACK TAB ==================== */}
        <TabsContent value="feedback" className="space-y-4 mt-4">
          <Card className="p-3 border-l-4 border-l-primary bg-primary/5">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp Customer Feedback</p>
                <p className="text-xs text-muted-foreground">Send feedback requests via WhatsApp 2 days after delivery. Record responses and ratings.</p>
              </div>
            </div>
          </Card>

          <Tabs value={feedbackSubTab} onValueChange={setFeedbackSubTab}>
            <TabsList>
              <TabsTrigger value="pending_send" className="gap-1 text-xs">
                <Send className="w-3 h-3" /> Ready to Send ({pendingFeedbacks.length})
              </TabsTrigger>
              <TabsTrigger value="awaiting" className="gap-1 text-xs">
                <Clock className="w-3 h-3" /> Awaiting Response ({awaitingFeedbacks.length})
              </TabsTrigger>
              <TabsTrigger value="responded" className="gap-1 text-xs">
                <Star className="w-3 h-3" /> Responded ({respondedFeedbacks.length})
              </TabsTrigger>
            </TabsList>

            {/* Ready to Send */}
            <TabsContent value="pending_send" className="mt-4 space-y-3">
              {pendingFeedbacks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No feedback requests ready to send</p>
              ) : pendingFeedbacks.map(fb => (
                <Card key={fb.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{fb.orderDisplayId}</p>
                      <p className="text-xs text-muted-foreground">{fb.customerName} • {fb.guestCount} guests • {fb.eventDate}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary text-[10px]">📱 Ready to Send</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {fb.customerPhone}</span>
                    <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" /> {fb.partnerName}</span>
                    <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Delivered: {new Date(fb.deliveredAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Eligible: {new Date(fb.feedbackEligibleAt).toLocaleDateString()}</span>
                  </div>

                  {/* Preview message */}
                  <div className="p-3 bg-secondary rounded-xl mb-3">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">WhatsApp Message Preview:</p>
                    <p className="text-xs text-foreground whitespace-pre-line">{FEEDBACK_TEMPLATE(fb.customerName, fb.orderDisplayId, fb.eventDate)}</p>
                  </div>

                  {canManageAllocations && (
                    <button
                      onClick={() => handleSendFeedback(fb.id)}
                      className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-4 h-4" /> Send via WhatsApp
                    </button>
                  )}
                </Card>
              ))}
            </TabsContent>

            {/* Awaiting Response */}
            <TabsContent value="awaiting" className="mt-4 space-y-3">
              {awaitingFeedbacks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending responses</p>
              ) : awaitingFeedbacks.map(fb => (
                <Card key={fb.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{fb.orderDisplayId}</p>
                      <p className="text-xs text-muted-foreground">{fb.customerName} • {fb.customerPhone}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">⏳ Awaiting</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    <span>Sent: {fb.whatsappSentAt ? new Date(fb.whatsappSentAt).toLocaleString() : "—"}</span>
                    <span className="ml-3">By: {fb.sentBy}</span>
                  </div>
                  {canManageAllocations && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setFeedbackResponseDialog(fb); setFeedbackRating(5); setFeedbackComment(""); }}
                        className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> Record Response
                      </button>
                      <button
                        onClick={() => handleMarkNoResponse(fb.id)}
                        className="py-2 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors"
                      >
                        No Response
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </TabsContent>

            {/* Responded */}
            <TabsContent value="responded" className="mt-4 space-y-3">
              {respondedFeedbacks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No feedback responses yet</p>
              ) : respondedFeedbacks.map(fb => (
                <Card key={fb.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{fb.orderDisplayId}</p>
                      <p className="text-xs text-muted-foreground">{fb.customerName} • {fb.eventDate} • {fb.partnerName}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= (fb.rating || 0) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </div>
                  {fb.comment && (
                    <div className="p-3 bg-secondary rounded-xl mt-2">
                      <p className="text-xs text-foreground italic">"{fb.comment}"</p>
                      <p className="text-[10px] text-muted-foreground mt-1">— {fb.customerName}, {fb.respondedAt ? new Date(fb.respondedAt).toLocaleDateString() : ""}</p>
                    </div>
                  )}
                  <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                    <span>Sent: {fb.whatsappSentAt ? new Date(fb.whatsappSentAt).toLocaleDateString() : "—"}</span>
                    <span>Responded: {fb.respondedAt ? new Date(fb.respondedAt).toLocaleDateString() : "—"}</span>
                    <span>By: {fb.sentBy}</span>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* Feedback Response Dialog */}
          {feedbackResponseDialog && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-md p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" /> Record Feedback
                </h3>
                <p className="text-sm text-muted-foreground">
                  <strong>{feedbackResponseDialog.orderDisplayId}</strong> — {feedbackResponseDialog.customerName}
                </p>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        onClick={() => setFeedbackRating(s)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-7 h-7 ${s <= feedbackRating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Customer Comment</label>
                  <textarea
                    value={feedbackComment}
                    onChange={e => setFeedbackComment(e.target.value)}
                    rows={3}
                    placeholder="What the customer said..."
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedbackResponseDialog(null)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRecordResponse}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Save Feedback
                  </button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {canManageAllocations && (
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-primary" /> Packing Charges Configuration
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Set the cost per box and thresholds. Every 5 Kg/5L of food = 1 box. Piece-based items charged flat per item.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Box Cost ($)</label>
                  <input type="number" value={packingConfig.boxCostRupees} onChange={(e) => setPackingConfig(prev => ({ ...prev, boxCostRupees: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Kg per Box</label>
                  <input type="number" value={packingConfig.volumePerBoxKg} onChange={(e) => setPackingConfig(prev => ({ ...prev, volumePerBoxKg: parseInt(e.target.value) || 5 }))} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Litres per Box</label>
                  <input type="number" value={packingConfig.volumePerBoxLitres} onChange={(e) => setPackingConfig(prev => ({ ...prev, volumePerBoxLitres: parseInt(e.target.value) || 5 }))} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Per-Piece Cost ($)</label>
                  <input type="number" value={packingConfig.pieceCostRupees} onChange={(e) => setPackingConfig(prev => ({ ...prev, pieceCostRupees: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
                </div>
              </div>
              <button onClick={handleSavePackingConfig} className="mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                Save Packing Config
              </button>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminPartyAllocations;
