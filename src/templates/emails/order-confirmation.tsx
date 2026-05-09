export type EmailPayload = {
  customerName?: string;
  orderId?: string;
  items?: Array<{ name?: string; qty?: number; price?: number }>;
  total?: number;
  deliveryAddress?: string;
  deliveryEta?: string;
  supportContact?: string;
  paymentRetryLink?: string;
  courierName?: string;
  trackingStatus?: string;
};

const formatItems = (items: EmailPayload["items"] = []) =>
  items
    .map((item) => {
      const qty = item.qty ?? 1;
      const name = item.name ?? "Item";
      const price = typeof item.price === "number" ? ` - $${item.price.toFixed(2)}` : "";
      return `<li>${qty}x ${name}${price}</li>`;
    })
    .join("");

export const renderOrderConfirmationEmail = (payload: EmailPayload) => {
  const customerName = payload.customerName || "Customer";
  const orderId = payload.orderId || "-";
  const total = typeof payload.total === "number" ? `$${payload.total.toFixed(2)}` : "-";
  const deliveryAddress = payload.deliveryAddress || "-";
  const deliveryEta = payload.deliveryEta || "We'll share an ETA soon.";
  const supportContact = payload.supportContact || "support@shero.com";

  return `
    <h2>Your Shero Order is Confirmed 🍱</h2>
    <p>Hi ${customerName}, your order has been confirmed.</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Total:</strong> ${total}</p>
    <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
    <p><strong>Estimated Delivery:</strong> ${deliveryEta}</p>
    <h3>Items</h3>
    <ul>${formatItems(payload.items)}</ul>
    <p>If you need help, contact us at ${supportContact}.</p>
  `;
};
