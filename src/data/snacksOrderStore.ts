// Sweets & Snacks order store — shared across Customer, Partner, Admin
import { snackProducts } from "./snacksData";

export type SnackOrderStatus = "new" | "confirmed" | "preparing" | "packed" | "dispatched" | "delivered" | "cancelled";

export interface SnackOrderItem {
  productId: string;
  productName: string;
  packSize: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface SnackOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  partnerId: string;
  partnerName: string;
  items: SnackOrderItem[];
  subtotal: number;
  packingCharge: number;
  deliveryCharge: number;
  discount: number;
  gst: number;
  total: number;
  status: SnackOrderStatus;
  paymentMethod: string;
  paymentStatus: "paid" | "cod" | "pending";
  shippingAddress: string;
  city: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  trackingId?: string;
}

const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "San Diego", "San Jose", "Mysore"];
const partners = [
  { id: "sp-1", name: "Lakshmi's Kitchen" },
  { id: "sp-2", name: "Amma's Snacks" },
  { id: "sp-3", name: "Florida Delights" },
  { id: "sp-4", name: "Pennsylvania Pickles House" },
  { id: "sp-5", name: "Mysore Sweets Hub" },
];
const customers = [
  { id: "c1", name: "Priya Rajan", phone: "98401xxxxx" },
  { id: "c2", name: "Suresh Kumar", phone: "90001xxxxx" },
  { id: "c3", name: "Deepa Menon", phone: "94441xxxxx" },
  { id: "c4", name: "Arun Prakash", phone: "87651xxxxx" },
  { id: "c5", name: "Meera Nair", phone: "96771xxxxx" },
  { id: "c6", name: "Karthik S", phone: "99441xxxxx" },
  { id: "c7", name: "Anitha Reddy", phone: "90081xxxxx" },
  { id: "c8", name: "Fathima Banu", phone: "98761xxxxx" },
];

const statuses: SnackOrderStatus[] = ["new", "confirmed", "preparing", "packed", "dispatched", "delivered"];
const payments = ["UPI", "Card", "COD", "Net Banking"];

function randomPick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function generateOrder(idx: number): SnackOrder {
  const itemCount = 1 + Math.floor(Math.random() * 4);
  const items: SnackOrderItem[] = [];
  const usedIds = new Set<string>();
  for (let i = 0; i < itemCount; i++) {
    let product = randomPick(snackProducts);
    while (usedIds.has(product.id)) product = randomPick(snackProducts);
    usedIds.add(product.id);
    const pack = randomPick(product.packSizes);
    const qty = 1 + Math.floor(Math.random() * 3);
    items.push({
      productId: product.id,
      productName: product.name,
      packSize: pack.label,
      qty,
      unitPrice: pack.price,
      total: pack.price * qty,
    });
  }
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const packingCharge = items.length * 5;
  const deliveryCharge = subtotal >= 499 ? 0 : 49;
  const discount = Math.random() > 0.6 ? Math.round(subtotal * 0.1) : 0;
  const gst = Math.round((subtotal - discount) * 0.05);
  const total = subtotal + packingCharge + deliveryCharge - discount + gst;
  const customer = randomPick(customers);
  const partner = randomPick(partners);
  const status = randomPick(statuses);
  const daysAgo = Math.floor(Math.random() * 30);
  const created = new Date(Date.now() - daysAgo * 86400000);
  const pm = randomPick(payments);

  return {
    id: `SNK-${String(1000 + idx).slice(1)}`,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    partnerId: partner.id,
    partnerName: partner.name,
    items,
    subtotal,
    packingCharge,
    deliveryCharge,
    discount,
    gst,
    total,
    status,
    paymentMethod: pm,
    paymentStatus: pm === "COD" ? "cod" : "paid",
    shippingAddress: `${Math.floor(Math.random() * 200) + 1}, Example Street`,
    city: randomPick(cities),
    pincode: `${500000 + Math.floor(Math.random() * 100000)}`,
    createdAt: created.toISOString(),
    updatedAt: new Date(created.getTime() + Math.random() * 86400000 * 2).toISOString(),
    estimatedDelivery: new Date(created.getTime() + 3 * 86400000).toISOString().slice(0, 10),
    trackingId: status === "dispatched" || status === "delivered" ? `SHR${Date.now().toString(36).toUpperCase().slice(-6)}` : undefined,
  };
}

export const snackOrders: SnackOrder[] = Array.from({ length: 35 }, (_, i) => generateOrder(i));

export const snackOrderStatusFlow: Record<SnackOrderStatus, SnackOrderStatus | null> = {
  new: "confirmed",
  confirmed: "preparing",
  preparing: "packed",
  packed: "dispatched",
  dispatched: "delivered",
  delivered: null,
  cancelled: null,
};

export const snackOrderStatusColors: Record<SnackOrderStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  preparing: "bg-yellow-100 text-yellow-800",
  packed: "bg-orange-100 text-orange-800",
  dispatched: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
