import type { EmailPayload } from "./order-confirmation";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const renderOrderDispatchedEmail = (payload: EmailPayload) => {
  const customerName = escapeHtml(payload.customerName || "Customer");
  const orderId = escapeHtml(payload.orderId || "-");
  const courierName = escapeHtml(payload.courierName || "Shero delivery partner");
  const deliveryEta = escapeHtml(payload.deliveryEta || "Soon");
  const trackingStatus = escapeHtml(payload.trackingStatus || "Out for delivery");

  return `
    <h2>Your Shero Order is On The Way 🚚</h2>
    <p>Hi ${customerName}, your order is on the way.</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Courier:</strong> ${courierName}</p>
    <p><strong>ETA:</strong> ${deliveryEta}</p>
    <p><strong>Tracking:</strong> ${trackingStatus}</p>
  `;
};
