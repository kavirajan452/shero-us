// SSC Stock Alerts — NOW SYNCED TO SUPABASE
import { supabase } from "@/integrations/supabase/client";
export interface SSCStockAlert {
  id: string;
  orderId: string;
  partnerName: string;
  partnerId: string;
  kitchenName: string;
  itemName: string;
  suggestedAlternative?: string;
  reason: string; // "items_unavailable" | "ingredient_shortage"
  status: "new" | "acknowledged" | "resolved" | "escalated";
  reportedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

// In-memory store (simulates DB)
let _alerts: SSCStockAlert[] = [
  {
    id: "SA-001",
    orderId: "ORD-1042",
    partnerName: "Maria T.",
    partnerId: "P001",
    kitchenName: "Sujatha's Chettinad Kitchen",
    itemName: "Chicken Biryani",
    suggestedAlternative: "Veg Biryani",
    reason: "items_unavailable",
    status: "new",
    reportedAt: "2026-03-07 09:15",
  },
  {
    id: "SA-002",
    orderId: "ORD-1042",
    partnerName: "Maria T.",
    partnerId: "P001",
    kitchenName: "Sujatha's Chettinad Kitchen",
    itemName: "Mutton Curry",
    reason: "ingredient_shortage",
    status: "new",
    reportedAt: "2026-03-07 09:15",
  },
  {
    id: "SA-003",
    orderId: "ORD-1038",
    partnerName: "Patricia K.",
    partnerId: "P002",
    kitchenName: "Priya's Home Kitchen",
    itemName: "Paneer Butter Masala",
    suggestedAlternative: "Paneer Tikka",
    reason: "items_unavailable",
    status: "acknowledged",
    reportedAt: "2026-03-07 08:30",
  },
];

let _nextId = 4;

export function getStockAlerts(): SSCStockAlert[] {
  return [..._alerts];
}

export function addStockAlert(alert: Omit<SSCStockAlert, "id" | "status" | "reportedAt">): SSCStockAlert {
  const newAlert: SSCStockAlert = {
    ...alert,
    id: `SA-${String(_nextId++).padStart(3, "0")}`,
    status: "new",
    reportedAt: new Date().toLocaleString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
  };
  _alerts = [newAlert, ..._alerts];
  // Sync to Supabase
  supabase.from("stock_alerts").insert({
    order_id: alert.orderId, partner_name: alert.partnerName, partner_id: alert.partnerId,
    kitchen_name: alert.kitchenName, item_name: alert.itemName,
    suggested_alternative: alert.suggestedAlternative, reason: alert.reason,
  }).then(() => {});
  return newAlert;
}

export function updateStockAlertStatus(
  id: string,
  status: SSCStockAlert["status"],
  resolvedBy?: string,
  notes?: string
): void {
  _alerts = _alerts.map((a) =>
    a.id === id
      ? { ...a, status, resolvedBy: resolvedBy || a.resolvedBy, resolvedAt: status === "resolved" ? new Date().toLocaleString("en-IN") : a.resolvedAt, notes: notes || a.notes }
      : a
  );
  supabase.from("stock_alerts").update({ status, resolved_by: resolvedBy, resolved_at: status === "resolved" ? new Date().toISOString() : undefined, notes }).eq("id", id).then(() => {});
}
