// Delay Complaint Store — customer reports order delayed after prep time expires
// Syncs across Customer, Partner, and SSC panels

export interface DelayComplaint {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  kitchenName: string;
  partnerName: string;
  reportedAt: string;
  status: "new" | "acknowledged" | "resolved" | "escalated";
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
  partnerNotified: boolean;
  partnerAcknowledged: boolean;
}

let _complaints: DelayComplaint[] = [];
let _nextId = 1;
let _subscribers: (() => void)[] = [];

function _notify() {
  _subscribers.forEach((cb) => cb());
}

export function subscribeDelayComplaints(cb: () => void): () => void {
  _subscribers.push(cb);
  return () => {
    _subscribers = _subscribers.filter((s) => s !== cb);
  };
}

export function getDelayComplaints(): DelayComplaint[] {
  return [..._complaints];
}

export function getNewDelayComplaintsCount(): number {
  return _complaints.filter((c) => c.status === "new").length;
}

export function getUnacknowledgedDelayComplaints(): DelayComplaint[] {
  return _complaints.filter((c) => !c.partnerAcknowledged);
}

export function addDelayComplaint(
  complaint: Omit<DelayComplaint, "id" | "status" | "reportedAt" | "partnerNotified" | "partnerAcknowledged">
): DelayComplaint {
  const newComplaint: DelayComplaint = {
    ...complaint,
    id: `DLC-${String(_nextId++).padStart(3, "0")}`,
    status: "new",
    reportedAt: new Date().toLocaleString("en-IN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }),
    partnerNotified: true,
    partnerAcknowledged: false,
  };
  _complaints = [newComplaint, ..._complaints];
  _notify();
  return newComplaint;
}

export function updateDelayComplaintStatus(
  id: string,
  status: DelayComplaint["status"],
  resolvedBy?: string,
  notes?: string
): void {
  _complaints = _complaints.map((c) =>
    c.id === id
      ? {
          ...c,
          status,
          resolvedBy: resolvedBy || c.resolvedBy,
          resolvedAt: status === "resolved" ? new Date().toLocaleString("en-IN") : c.resolvedAt,
          notes: notes || c.notes,
        }
      : c
  );
  _notify();
}

export function acknowledgeDelayComplaint(id: string): void {
  _complaints = _complaints.map((c) =>
    c.id === id ? { ...c, partnerAcknowledged: true } : c
  );
  _notify();
}
