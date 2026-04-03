// Store for auto-saving incomplete orders — NOW BACKED BY SUPABASE

import { supabase } from "@/integrations/supabase/client";

export interface IncompleteOrder {
  id: string;
  type: "instant" | "party" | "subscription" | "service";
  customerName: string;
  customerPhone: string;
  address: string;
  deliveryType: string;
  selectedSlot: string;
  cartSnapshot: any[];
  paymentMethod: string;
  paymentStatus: "pending" | "failed" | "abandoned";
  totalAmount: number;
  savedAt: string;
  region: string;
  customerId?: string;
}

function mapDbToOrder(row: any): IncompleteOrder {
  return {
    id: row.id,
    type: row.type,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    address: row.address || "",
    deliveryType: row.delivery_type || "",
    selectedSlot: row.selected_slot || "",
    cartSnapshot: row.cart_snapshot || [],
    paymentMethod: row.payment_method || "",
    paymentStatus: row.payment_status,
    totalAmount: row.total_amount,
    savedAt: row.created_at,
    region: row.region || "",
  };
}

export async function getAllIncompleteOrdersAsync(): Promise<IncompleteOrder[]> {
  const { data, error } = await supabase.from("incomplete_orders").select("*").order("created_at", { ascending: false });
  if (error || !data) return getAllIncompleteOrders();
  return data.map(mapDbToOrder);
}

export async function saveIncompleteOrderAsync(order: Omit<IncompleteOrder, "id" | "savedAt">): Promise<IncompleteOrder> {
  const { data, error } = await supabase.from("incomplete_orders").insert({
    type: order.type,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    address: order.address,
    delivery_type: order.deliveryType,
    selected_slot: order.selectedSlot,
    cart_snapshot: order.cartSnapshot,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    total_amount: order.totalAmount,
    region: order.region,
    customer_id: order.customerId || null,
  }).select().single();
  if (error || !data) return saveIncompleteOrder(order);
  return mapDbToOrder(data);
}

// ── Legacy localStorage functions (backward compat) ──
const STORE_KEY = "shero-incomplete-orders";

export function getAllIncompleteOrders(): IncompleteOrder[] {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { return []; }
}

function saveAll(orders: IncompleteOrder[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(orders));
}

export function saveIncompleteOrder(order: Omit<IncompleteOrder, "id" | "savedAt">): IncompleteOrder {
  const orders = getAllIncompleteOrders();
  const existing = orders.findIndex((o) => o.customerPhone === order.customerPhone && o.type === order.type);
  const full: IncompleteOrder = { ...order, id: existing >= 0 ? orders[existing].id : `inc-${Date.now()}`, savedAt: new Date().toISOString() };
  if (existing >= 0) orders[existing] = full; else orders.push(full);
  saveAll(orders);
  saveIncompleteOrderAsync(order).catch(() => {});
  return full;
}

export function removeIncompleteOrder(id: string) {
  saveAll(getAllIncompleteOrders().filter((o) => o.id !== id));
  supabase.from("incomplete_orders").delete().eq("id", id).then(() => {});
}

export function getIncompleteOrderStats() {
  const orders = getAllIncompleteOrders();
  return {
    total: orders.length,
    failed: orders.filter((o) => o.paymentStatus === "failed").length,
    abandoned: orders.filter((o) => o.paymentStatus === "abandoned").length,
    pending: orders.filter((o) => o.paymentStatus === "pending").length,
  };
}
