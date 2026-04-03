/** Delivery logistics store for party orders */

export type DeliveryStatus = 
  | "food_ready"
  | "pickup_assigned" 
  | "pickup_en_route"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "delivery_failed";

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleNumber: string;
  rating: number;
  isAvailable: boolean;
  currentLat: number;
  currentLng: number;
}

export interface DeliveryRecord {
  id: string;
  orderId: string;
  orderDisplayId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  partnerName: string;
  partnerId: string;
  guestCount: number;
  eventDate: string;
  eventTime: string;
  status: DeliveryStatus;
  agentId?: string;
  agentName?: string;
  foodReadyAt?: string;
  pickupAssignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  estimatedDeliveryMins?: number;
  distanceKm?: number;
  notes?: string;
}

export interface DeliveryLog {
  id: string;
  deliveryId: string;
  orderDisplayId: string;
  action: string;
  timestamp: string;
  by: string;
  notes?: string;
}

// Mock delivery agents
export const mockDeliveryAgents: DeliveryAgent[] = [
  { id: "da1", name: "Suresh R.", phone: "9870001111", vehicle: "Tempo Van", vehicleNumber: "TN-01-AB-1234", rating: 4.8, isAvailable: true, currentLat: 13.055, currentLng: 80.252 },
  { id: "da2", name: "Karthik M.", phone: "9870002222", vehicle: "Mini Truck", vehicleNumber: "TN-01-CD-5678", rating: 4.6, isAvailable: true, currentLat: 13.062, currentLng: 80.240 },
  { id: "da3", name: "Rajan P.", phone: "9870003333", vehicle: "Tempo Van", vehicleNumber: "TN-01-EF-9012", rating: 4.9, isAvailable: false, currentLat: 13.040, currentLng: 80.235 },
  { id: "da4", name: "Muthu K.", phone: "9870004444", vehicle: "Large Van", vehicleNumber: "TN-01-GH-3456", rating: 4.5, isAvailable: true, currentLat: 13.070, currentLng: 80.260 },
];

// Mock delivery records (from allocated/accepted orders)
let deliveryRecords: DeliveryRecord[] = [
  {
    id: "del-001",
    orderId: "pty-003",
    orderDisplayId: "SH-PTY-78236",
    customerName: "Anand Srinivasan",
    customerPhone: "9866554433",
    customerAddress: "22, Poonamallee High Rd, Midtown, New York",
    customerLat: 13.069,
    customerLng: 13.240,
    partnerName: "Chef Lakshmi",
    partnerId: "pk1",
    guestCount: 200,
    eventDate: "2026-03-15",
    eventTime: "11:00",
    status: "food_ready",
    foodReadyAt: "2026-03-15T08:30:00",
    estimatedDeliveryMins: 45,
    distanceKm: 3.2,
  },
];

let deliveryLogs: DeliveryLog[] = [
  { id: "dl-001", deliveryId: "del-001", orderDisplayId: "SH-PTY-78236", action: "Food marked ready by partner", timestamp: "2026-03-15T08:30:00", by: "Chef Lakshmi" },
];

export const getDeliveryRecords = () => [...deliveryRecords];
export const getDeliveryLogs = () => [...deliveryLogs];
export const getAvailableAgents = () => mockDeliveryAgents.filter(a => a.isAvailable);

export const addDeliveryRecord = (record: DeliveryRecord) => {
  deliveryRecords = [record, ...deliveryRecords];
};

export const updateDeliveryStatus = (
  deliveryId: string,
  status: DeliveryStatus,
  updates: Partial<DeliveryRecord> = {}
) => {
  deliveryRecords = deliveryRecords.map((d) =>
    d.id === deliveryId ? { ...d, status, ...updates } : d
  );
};

export const addDeliveryLog = (log: DeliveryLog) => {
  deliveryLogs = [log, ...deliveryLogs];
};

// Mark food ready from partner side — creates a delivery record if not exists
export const markFoodReady = (orderId: string, orderDisplayId: string, customerName: string, customerPhone: string, customerAddress: string, customerLat: number, customerLng: number, partnerName: string, partnerId: string, guestCount: number, eventDate: string, eventTime: string) => {
  const existing = deliveryRecords.find(d => d.orderId === orderId);
  if (existing) {
    updateDeliveryStatus(existing.id, "food_ready", { foodReadyAt: new Date().toISOString() });
  } else {
    const newRecord: DeliveryRecord = {
      id: `del-${Date.now()}`,
      orderId,
      orderDisplayId,
      customerName,
      customerPhone,
      customerAddress,
      customerLat,
      customerLng,
      partnerName,
      partnerId,
      guestCount,
      eventDate,
      eventTime,
      status: "food_ready",
      foodReadyAt: new Date().toISOString(),
      estimatedDeliveryMins: 40,
    };
    addDeliveryRecord(newRecord);
  }
  addDeliveryLog({
    id: `dl-${Date.now()}`,
    deliveryId: existing?.id || `del-${Date.now()}`,
    orderDisplayId,
    action: "Food marked ready by partner",
    timestamp: new Date().toISOString(),
    by: partnerName,
  });
  const existing2 = deliveryRecords.find(d => d.orderId === orderId);
  return existing2;
};

// Get food-ready orders (for admin delivery tab)
export const getFoodReadyOrders = () => deliveryRecords.filter(d => d.status === "food_ready");
export const getInTransitOrders = () => deliveryRecords.filter(d => ["pickup_assigned", "pickup_en_route", "picked_up", "in_transit"].includes(d.status));
export const getDeliveredOrders = () => deliveryRecords.filter(d => d.status === "delivered");
export const getFailedDeliveries = () => deliveryRecords.filter(d => d.status === "delivery_failed");
