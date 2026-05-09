import type { EmailPayload } from "./order-confirmation";

export const renderAdminAlertEmail = (alertType: string, payload: EmailPayload) => {
  const orderId = payload.orderId || "-";
  const total = typeof payload.total === "number" ? `$${payload.total.toFixed(2)}` : "-";
  const customerName = payload.customerName || "Unknown";

  return `
    <h2>Shero Admin Alert: ${alertType}</h2>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Customer:</strong> ${customerName}</p>
    <p><strong>Total:</strong> ${total}</p>
    <p>Review this event in the admin dashboard.</p>
  `;
};
