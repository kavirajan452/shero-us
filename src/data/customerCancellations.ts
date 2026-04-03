// Customer Cancellation Store — connects customer panel to partner panel

export interface CustomerCancellation {
  id: string;
  orderId: string;
  customerName: string;
  reason: string;
  reasonDetail?: string;
  cancelledAt: string;
  items: { name: string; qty: number }[];
  orderTotal: number;
  refundStatus: "pending" | "processed" | "denied";
  partnerNotified: boolean;
  partnerAcknowledged: boolean;
}

export const CANCELLATION_REASONS = [
  { value: "changed_mind", label: "🤔 Changed my mind", refundable: true },
  { value: "wrong_order", label: "❌ Ordered wrong items", refundable: true },
  { value: "taking_too_long", label: "⏰ Taking too long", refundable: true },
  { value: "found_alternative", label: "🔄 Found another option", refundable: true },
  { value: "duplicate_order", label: "📋 Duplicate order", refundable: true },
  { value: "price_issue", label: "💰 Price too high", refundable: true },
  { value: "emergency", label: "🚨 Personal emergency", refundable: true },
  { value: "other", label: "📝 Other reason", refundable: true },
];

let _cancellations: CustomerCancellation[] = [];
let _nextId = 1;
let _listeners: (() => void)[] = [];

export function subscribe(listener: () => void) {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

function notify() {
  _listeners.forEach((l) => l());
}

export function getCancellations(): CustomerCancellation[] {
  return [..._cancellations];
}

export function getUnacknowledgedCancellations(): CustomerCancellation[] {
  return _cancellations.filter((c) => !c.partnerAcknowledged);
}

export function addCancellation(
  cancel: Omit<CustomerCancellation, "id" | "cancelledAt" | "refundStatus" | "partnerNotified" | "partnerAcknowledged">
): CustomerCancellation {
  const newCancel: CustomerCancellation = {
    ...cancel,
    id: `CC-${String(_nextId++).padStart(3, "0")}`,
    cancelledAt: new Date().toLocaleString("en-IN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }),
    refundStatus: "pending",
    partnerNotified: true,
    partnerAcknowledged: false,
  };
  _cancellations = [newCancel, ..._cancellations];
  notify();
  return newCancel;
}

export function acknowledgeCancellation(id: string): void {
  _cancellations = _cancellations.map((c) =>
    c.id === id ? { ...c, partnerAcknowledged: true } : c
  );
  notify();
}
