import type { EmailPayload } from "./order-confirmation";

export const renderPaymentFailedEmail = (payload: EmailPayload) => {
  const customerName = payload.customerName || "Customer";
  const orderId = payload.orderId || "-";
  const retryLink = payload.paymentRetryLink || "https://www.shero.us/checkout";
  const supportContact = payload.supportContact || "support@shero.com";

  return `
    <h2>Payment Failed — Please Retry</h2>
    <p>Hi ${customerName}, your payment could not be completed.</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><a href="${retryLink}">Retry payment</a></p>
    <p>Need help? Contact ${supportContact}</p>
  `;
};
