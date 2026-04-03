// Delivery Partner definitions
export interface DeliveryPartner {
  id: string;
  name: string;
  logo: string;
  color: string;
  trackingUrlTemplate: string; // e.g. "https://dunzo.com/track/{trackingId}"
  supportPhone: string;
  avgRating: number;
  regions: string[];
}

export const deliveryPartners: DeliveryPartner[] = [
  {
    id: "dunzo",
    name: "Dunzo",
    logo: "🟢",
    color: "#00B167",
    trackingUrlTemplate: "https://dunzo.com/track/{id}",
    supportPhone: "+91-1800-xxx-001",
    avgRating: 4.3,
    regions: ["IN"],
  },
  {
    id: "rapido",
    name: "Rapido",
    logo: "🟡",
    color: "#FFD600",
    trackingUrlTemplate: "https://rapido.bike/track/{id}",
    supportPhone: "+91-1800-xxx-002",
    avgRating: 4.1,
    regions: ["IN"],
  },
  {
    id: "shiprocket",
    name: "Shiprocket",
    logo: "🟣",
    color: "#7B2FF7",
    trackingUrlTemplate: "https://shiprocket.in/track/{id}",
    supportPhone: "+91-1800-xxx-003",
    avgRating: 4.4,
    regions: ["IN"],
  },
  {
    id: "doordash",
    name: "DoorDash",
    logo: "🔴",
    color: "#FF3008",
    trackingUrlTemplate: "https://doordash.com/track/{id}",
    supportPhone: "+1-855-xxx-001",
    avgRating: 4.2,
    regions: ["US"],
  },
  {
    id: "uber-direct",
    name: "Uber Direct",
    logo: "⚫",
    color: "#000000",
    trackingUrlTemplate: "https://uber.com/direct/track/{id}",
    supportPhone: "+1-800-xxx-002",
    avgRating: 4.5,
    regions: ["US"],
  },
];

// Order tracking statuses
export type TrackingStatus =
  | "order_placed"
  | "order_confirmed"
  | "preparing"
  | "rider_assigned"
  | "rider_at_kitchen"
  | "picked_up"
  | "in_transit"
  | "near_destination"
  | "delivered"
  | "cancelled";

export interface TrackingEvent {
  status: TrackingStatus;
  label: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface RiderInfo {
  name: string;
  phone: string;
  vehicleType: "bike" | "scooter" | "car";
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  photoUrl: string;
  currentLat: number;
  currentLng: number;
}

export interface TrackedOrder {
  orderId: string;
  orderDate: string;
  customerName: string;
  deliveryAddress: string;
  kitchenName: string;
  kitchenLat: number;
  kitchenLng: number;
  deliveryLat: number;
  deliveryLng: number;
  deliveryPartner: DeliveryPartner;
  rider: RiderInfo | null;
  currentStatus: TrackingStatus;
  events: TrackingEvent[];
  estimatedDeliveryTime: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  otp: string;
}

// Status metadata for UI rendering
export const statusMeta: Record<TrackingStatus, { label: string; color: string; progress: number }> = {
  order_placed: { label: "Order Placed", color: "#6B7280", progress: 5 },
  order_confirmed: { label: "Confirmed", color: "#3B82F6", progress: 15 },
  preparing: { label: "Preparing", color: "#F59E0B", progress: 30 },
  rider_assigned: { label: "Rider Assigned", color: "#8B5CF6", progress: 45 },
  rider_at_kitchen: { label: "Rider at Kitchen", color: "#8B5CF6", progress: 55 },
  picked_up: { label: "Picked Up", color: "#10B981", progress: 65 },
  in_transit: { label: "On the Way", color: "#10B981", progress: 80 },
  near_destination: { label: "Almost There!", color: "#10B981", progress: 92 },
  delivered: { label: "Delivered", color: "#059669", progress: 100 },
  cancelled: { label: "Cancelled", color: "#EF4444", progress: 0 },
};

// Mock tracked order for demo
export const mockTrackedOrder: TrackedOrder = {
  orderId: "SH284731",
  orderDate: new Date().toISOString(),
  customerName: "Customer",
  deliveryAddress: "Flat 302, Lakshmi Towers, Road No. 12, Banjara Hills",
  kitchenName: "Lakshmi's Kitchen",
  kitchenLat: 17.4156,
  kitchenLng: 78.4347,
  deliveryLat: 17.4239,
  deliveryLng: 78.4488,
  deliveryPartner: deliveryPartners[0], // Dunzo
  rider: {
    name: "Raju K.",
    phone: "+91 98xxx xxxxx",
    vehicleType: "bike",
    vehicleNumber: "TS 09 AB 1234",
    rating: 4.7,
    totalDeliveries: 1823,
    photoUrl: "",
    currentLat: 17.4190,
    currentLng: 78.4410,
  },
  currentStatus: "preparing",
  events: [
    { status: "order_placed", label: "Order Placed", description: "Your order has been placed successfully", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), icon: "📋" },
    { status: "order_confirmed", label: "Order Confirmed", description: "Kitchen has accepted your order", timestamp: new Date(Date.now() - 23 * 60000).toISOString(), icon: "✅" },
    { status: "preparing", label: "Preparing Food", description: "Your meal is being freshly prepared", timestamp: new Date(Date.now() - 20 * 60000).toISOString(), icon: "👩‍🍳" },
  ],
  estimatedDeliveryTime: new Date(Date.now() + 12 * 60000).toISOString(),
  items: [
    { name: "Chicken Biryani", qty: 2, price: 220 },
    { name: "Raita", qty: 1, price: 40 },
    { name: "Gulab Jamun (2pc)", qty: 1, price: 60 },
  ],
  subtotal: 540,
  deliveryFee: 50,
  total: 600,
  otp: "4829",
};

// Admin delivery analytics mock
export interface DeliveryAnalytics {
  partnerId: string;
  partnerName: string;
  totalOrders: number;
  delivered: number;
  failed: number;
  avgDeliveryMinutes: number;
  slaBreaches: number;
  slaPct: number;
  avgRating: number;
  costPerDelivery: number;
}

export const deliveryAnalyticsMock: DeliveryAnalytics[] = [
  { partnerId: "dunzo", partnerName: "Dunzo", totalOrders: 1245, delivered: 1198, failed: 12, avgDeliveryMinutes: 28, slaBreaches: 35, slaPct: 96.2, avgRating: 4.3, costPerDelivery: 42 },
  { partnerId: "rapido", partnerName: "Rapido", totalOrders: 892, delivered: 854, failed: 18, avgDeliveryMinutes: 32, slaBreaches: 56, slaPct: 93.7, avgRating: 4.1, costPerDelivery: 38 },
  { partnerId: "shiprocket", partnerName: "Shiprocket", totalOrders: 634, delivered: 612, failed: 8, avgDeliveryMinutes: 35, slaBreaches: 28, slaPct: 95.6, avgRating: 4.4, costPerDelivery: 45 },
];

export const deliverySlaMock = {
  targetMinutes: 45,
  overallSla: 95.2,
  peakHourSla: 88.4,
  offPeakSla: 98.1,
  breachesThisWeek: 23,
  breachesLastWeek: 31,
};
