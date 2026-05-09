import type { EmailPayload } from "./order-confirmation";

export const renderOrderDispatchedEmail = (payload: EmailPayload) => {
  const customerName = payload.customerName || "Customer";
  const orderId = payload.orderId || "-";
  const courierName = payload.courierName || "Shero delivery partner";
  const deliveryEta = payload.deliveryEta || "Soon";
  const trackingStatus = payload.trackingStatus || "Out for delivery";

  return `
    <h2>Your Shero Order is On The Way 🚚</h2>
    <p>Hi ${customerName}, your order is on the way.</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Courier:</strong> ${courierName}</p>
    <p><strong>ETA:</strong> ${deliveryEta}</p>
    <p><strong>Tracking:</strong> ${trackingStatus}</p>
  `;
};
