import type { EmailPayload } from "./order-confirmation";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const renderPaymentFailedEmail = (payload: EmailPayload) => {
  const customerName = escapeHtml(payload.customerName || "Customer");
  const orderId = escapeHtml(payload.orderId || "-");
  const retryLink = escapeHtml(encodeURI(payload.paymentRetryLink || "https://www.shero.us/checkout"));
  const supportContact = escapeHtml(payload.supportContact || "support@shero.com");

  return `
    <h2>Payment Failed — Please Retry</h2>
    <p>Hi ${customerName}, your payment could not be completed.</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><a href="${retryLink}">Retry payment</a></p>
    <p>Need help? Contact ${supportContact}</p>
  `;
};
