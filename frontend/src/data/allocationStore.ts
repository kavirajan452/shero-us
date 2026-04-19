/** Allocation store — manages auto/manual allocation state, escalations, cancellations */

export type AllocationMode = "auto" | "manual";

export type EscalationStatus = "pending_team_action" | "reallocated" | "cancelled_refunded";

export interface AllocationEscalation {
  id: string;
  orderId: string;
  orderDisplayId: string;
  customerName: string;
  guestCount: number;
  eventDate: string;
  reason: string;
  rejectedBy: string[];          // partner IDs that rejected
  rejectionReasons: Record<string, string>;
  escalatedAt: string;
  status: EscalationStatus;
  resolvedBy?: string;           // admin name
  resolvedAt?: string;
  resolution?: string;           // "reallocated_to_pk3" | "cancelled_refund_full" etc
  refundAmount?: number;
  refundType?: "full" | "partial";
  notes?: string;
}

export interface AllocationLog {
  id: string;
  orderId: string;
  orderDisplayId: string;
  customerName: string;
  mode: AllocationMode;
  partnerId: string;
  partnerName: string;
  distance: number;
  allocatedAt: string;
  status: "sent" | "accepted" | "rejected" | "escalated" | "cancelled";
  rejectionReason?: string;
  autoAttempt?: number;          // which attempt in auto cascade
}

// In-memory store
let escalations: AllocationEscalation[] = [
  {
    id: "esc-001",
    orderId: "pty-sample-1",
    orderDisplayId: "SH-PTY-79001",
    customerName: "Meenakshi Devi",
    guestCount: 150,
    eventDate: "2026-03-18",
    reason: "No partner available within 10 km radius",
    rejectedBy: ["pk1", "pk2", "pk5"],
    rejectionReasons: { pk1: "Busy with another order", pk2: "Too far", pk5: "Capacity exceeded" },
    escalatedAt: "2026-03-14T11:30:00",
    status: "pending_team_action",
  },
  {
    id: "esc-002",
    orderId: "pty-sample-2",
    orderDisplayId: "SH-PTY-79002",
    customerName: "Sathya Narayanan",
    guestCount: 80,
    eventDate: "2026-03-20",
    reason: "All 2 partners within range rejected",
    rejectedBy: ["pk3"],
    rejectionReasons: { pk3: "Menu items not in speciality" },
    escalatedAt: "2026-03-15T09:00:00",
    status: "reallocated",
    resolvedBy: "Senthil K.",
    resolvedAt: "2026-03-15T10:00:00",
    resolution: "Manually reallocated to Chef Fathima (pk3) after discussion",
  },
];

let allocationLogs: AllocationLog[] = [
  { id: "log-001", orderId: "pty-003", orderDisplayId: "SH-PTY-78236", customerName: "Anand Srinivasan", mode: "manual", partnerId: "pk1", partnerName: "Chef Lakshmi", distance: 1.0, allocatedAt: "2026-03-03T08:00:00", status: "accepted" },
  { id: "log-002", orderId: "pty-sample-1", orderDisplayId: "SH-PTY-79001", customerName: "Meenakshi Devi", mode: "auto", partnerId: "pk1", partnerName: "Chef Lakshmi", distance: 3.2, allocatedAt: "2026-03-14T11:00:00", status: "rejected", rejectionReason: "Busy with another order", autoAttempt: 1 },
  { id: "log-003", orderId: "pty-sample-1", orderDisplayId: "SH-PTY-79001", customerName: "Meenakshi Devi", mode: "auto", partnerId: "pk2", partnerName: "Chef Meena", distance: 5.1, allocatedAt: "2026-03-14T11:10:00", status: "rejected", rejectionReason: "Too far", autoAttempt: 2 },
  { id: "log-004", orderId: "pty-sample-1", orderDisplayId: "SH-PTY-79001", customerName: "Meenakshi Devi", mode: "auto", partnerId: "pk5", partnerName: "Chef Kamala", distance: 8.4, allocatedAt: "2026-03-14T11:20:00", status: "rejected", rejectionReason: "Capacity exceeded", autoAttempt: 3 },
  { id: "log-005", orderId: "pty-sample-1", orderDisplayId: "SH-PTY-79001", customerName: "Meenakshi Devi", mode: "auto", partnerId: "", partnerName: "", distance: 0, allocatedAt: "2026-03-14T11:30:00", status: "escalated" },
  { id: "log-006", orderId: "pty-sample-2", orderDisplayId: "SH-PTY-79002", customerName: "Sathya Narayanan", mode: "auto", partnerId: "pk3", partnerName: "Chef Fathima", distance: 4.5, allocatedAt: "2026-03-15T09:00:00", status: "rejected", rejectionReason: "Menu items not in speciality", autoAttempt: 1 },
];

export const getEscalations = () => [...escalations];
export const getAllocationLogs = () => [...allocationLogs];

export const addEscalation = (esc: AllocationEscalation) => {
  escalations = [esc, ...escalations];
};

export const addAllocationLog = (log: AllocationLog) => {
  allocationLogs = [log, ...allocationLogs];
};

export const resolveEscalation = (
  id: string,
  status: EscalationStatus,
  resolvedBy: string,
  resolution: string,
  refundAmount?: number,
  refundType?: "full" | "partial",
  notes?: string
) => {
  escalations = escalations.map((e) =>
    e.id === id
      ? { ...e, status, resolvedBy, resolvedAt: new Date().toISOString(), resolution, refundAmount, refundType, notes }
      : e
  );
};
