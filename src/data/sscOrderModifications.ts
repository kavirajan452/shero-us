// SSC Order Modification Requests — shared store for customer order change requests

export interface SSCOrderModification {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  kitchenName: string;
  partnerName: string;
  modificationType: "add_item" | "remove_item" | "change_item" | "change_qty" | "cancel_item" | "other";
  description: string;
  status: "new" | "acknowledged" | "resolved" | "escalated";
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

let _modifications: SSCOrderModification[] = [
  {
    id: "OM-001",
    orderId: "ORD-1001",
    customerName: "Ramesh K.",
    customerPhone: "+1 98765 11111",
    kitchenName: "Shero – Chettinad (Veg)",
    partnerName: "Sujatha M.",
    modificationType: "change_qty",
    description: "Customer wants to increase Sambar qty from 2 to 3",
    status: "new",
    requestedAt: "2026-03-07 12:40",
  },
];

let _nextId = 2;
type Subscriber = () => void;
let _subscribers: Subscriber[] = [];

export function getOrderModifications(): SSCOrderModification[] {
  return [..._modifications];
}

export function getNewModificationsCount(): number {
  return _modifications.filter((m) => m.status === "new").length;
}

export function addOrderModification(
  mod: Omit<SSCOrderModification, "id" | "status" | "requestedAt">
): SSCOrderModification {
  const newMod: SSCOrderModification = {
    ...mod,
    id: `OM-${String(_nextId++).padStart(3, "0")}`,
    status: "new",
    requestedAt: new Date().toLocaleString("en-IN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }),
  };
  _modifications = [newMod, ..._modifications];
  _notifySubscribers();
  return newMod;
}

export function updateModificationStatus(
  id: string,
  status: SSCOrderModification["status"],
  resolvedBy?: string,
  notes?: string
): void {
  _modifications = _modifications.map((m) =>
    m.id === id
      ? {
          ...m,
          status,
          resolvedBy: resolvedBy || m.resolvedBy,
          resolvedAt: status === "resolved" ? new Date().toLocaleString("en-IN") : m.resolvedAt,
          notes: notes || m.notes,
        }
      : m
  );
  _notifySubscribers();
}

export function subscribeModifications(cb: Subscriber): () => void {
  _subscribers.push(cb);
  return () => {
    _subscribers = _subscribers.filter((s) => s !== cb);
  };
}

function _notifySubscribers() {
  _subscribers.forEach((cb) => cb());
}
