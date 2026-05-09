import type { EmailPayload } from "./order-confirmation";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const renderAdminAlertEmail = (alertType: string, payload: EmailPayload) => {
  const orderId = escapeHtml(payload.orderId || "-");
  const total = typeof payload.total === "number" ? `$${payload.total.toFixed(2)}` : "-";
  const customerName = escapeHtml(payload.customerName || "Unknown");
  const safeAlertType = escapeHtml(alertType);

  return `
    <h2>Shero Admin Alert: ${safeAlertType}</h2>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Customer:</strong> ${customerName}</p>
    <p><strong>Total:</strong> ${total}</p>
    <p>Review this event in the admin dashboard.</p>
  `;
};
