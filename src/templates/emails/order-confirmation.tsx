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
      const name = escapeHtml(item.name ?? "Item");
      const price = typeof item.price === "number" ? ` - $${item.price.toFixed(2)}` : "";
      return `<li>${qty}x ${name}${price}</li>`;
    })
    .join("");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const renderOrderConfirmationEmail = (payload: EmailPayload) => {
  const customerName = escapeHtml(payload.customerName || "Customer");
  const orderId = escapeHtml(payload.orderId || "-");
  const total = typeof payload.total === "number" ? `$${payload.total.toFixed(2)}` : "-";
  const deliveryAddress = escapeHtml(payload.deliveryAddress || "-");
  const deliveryEta = escapeHtml(payload.deliveryEta || "We'll share an ETA soon.");
  const supportContact = escapeHtml(payload.supportContact || "support@shero.com");

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
