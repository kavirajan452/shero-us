/**
 * Centralized WhatsApp Utility for Shero Platform
 * Handles all WhatsApp communications except OTP (which uses SMS).
 * Uses wa.me deep links (opens user's WhatsApp app).
 * Ready for future Twilio WhatsApp Business API upgrade.
 */

// Placeholder — replace with actual WhatsApp Business number when available
const SHERO_SUPPORT_NUMBER = "15551234567"; // US format without +

export const WHATSAPP_CONFIG = {
  supportNumber: SHERO_SUPPORT_NUMBER,
  supportUrl: `https://wa.me/${SHERO_SUPPORT_NUMBER}`,
};

// ── Order Status Messages ──────────────────────────────────────────

export function buildOrderConfirmationMessage(params: {
  orderId: string;
  orderType: string;
  customerName: string;
  total: string;
  deliverySlot?: string;
  eventDate?: string;
  guestCount?: number;
}): string {
  const { orderId, orderType, customerName, total, deliverySlot, eventDate, guestCount } = params;

  if (orderType === "party") {
    return `🎉 *Shero — Party Order Confirmed!*

Hi ${customerName},
Your party order *#${orderId}* has been received!

📅 Event Date: ${eventDate || "TBD"}
👥 Guests: ${guestCount || "—"}
💰 Total: ${total}

Our team will allocate a kitchen partner and confirm details soon. You'll receive updates here on WhatsApp.

📄 Invoice will be available in Profile → Orders after delivery.

Questions? Reply to this message!
— Team Shero 🍛`;
  }

  return `✅ *Shero — Order Confirmed!*

Hi ${customerName},
Your order *#${orderId}* is confirmed!

🕐 Delivery Slot: ${deliverySlot || "ASAP"}
💰 Total: ${total}

Your homemade meal is being freshly prepared. Track your order in the app.

📄 Invoice available after delivery in Profile → Orders.

Need help? Reply to this message!
— Team Shero 🍛`;
}

export function buildOrderStatusMessage(params: {
  orderId: string;
  status: string;
  customerName: string;
  eta?: string;
}): string {
  const { orderId, status, customerName, eta } = params;

  const statusMessages: Record<string, string> = {
    order_confirmed: `👩‍🍳 Hi ${customerName}, your order *#${orderId}* has been confirmed! Our Shero partner is getting ready to cook your meal.`,
    preparing: `🍳 Your meal for order *#${orderId}* is now being freshly prepared! ${eta ? `Estimated ready in ${eta}.` : ""}`,
    ready: `📦 Great news, ${customerName}! Your order *#${orderId}* is packed and ready for pickup!`,
    rider_assigned: `🚗 A delivery partner has been assigned for order *#${orderId}*. They're on their way to the kitchen!`,
    picked_up: `🛵 Your order *#${orderId}* has been picked up and is on its way to you! ${eta ? `ETA: ${eta}` : ""}`,
    in_transit: `📍 Almost there, ${customerName}! Your order *#${orderId}* is nearby. ${eta ? `ETA: ${eta}` : ""}`,
    delivered: `🎉 Your order *#${orderId}* has been delivered! Enjoy your homemade meal, ${customerName}! Rate us in the app. 🌟`,
    cancelled: `❌ Order *#${orderId}* has been cancelled. If a refund is applicable, it will be processed within 5–10 business days.`,
  };

  return statusMessages[status] || `📋 Order *#${orderId}* status update: ${status}. — Team Shero`;
}

export function buildPartnerOrderAlert(params: {
  orderId: string;
  orderType: string;
  customerName: string;
  itemCount: number;
  deliverySlot?: string;
  eventDate?: string;
  guestCount?: number;
}): string {
  const { orderId, orderType, customerName, itemCount, deliverySlot, eventDate, guestCount } = params;

  if (orderType === "party") {
    return `🔔 *New Party Order Allocated!*

Order: *#${orderId}*
Customer: ${customerName}
📅 Event: ${eventDate || "TBD"}
👥 Guests: ${guestCount || "—"}

Please open your Shero Partner app to review the production sheet and accept/reject.

— Shero Operations`;
  }

  return `🔔 *New Order Received!*

Order: *#${orderId}*
Customer: ${customerName}
Items: ${itemCount}
🕐 Slot: ${deliverySlot || "ASAP"}

Open your Shero Partner app to accept.

— Shero Operations`;
}

export function buildSubscriptionReminderMessage(params: {
  customerName: string;
  planName: string;
  mealSlot: string;
  date: string;
}): string {
  return `🍽️ Hi ${customerName},

Your *${params.planName}* subscription meal (${params.mealSlot}) is scheduled for *${params.date}*.

Want to skip or make changes? Open the Shero app → Subscriptions.

— Team Shero`;
}

export function buildDeliveryPickupMessage(params: {
  orderId: string;
  kitchenName: string;
  kitchenAddress?: string;
  customerAddress?: string;
  pickupInstructions?: string;
  deliveryInstructions?: string;
}): string {
  return `📦 *Delivery Assignment*

Order: *#${params.orderId}*
🏠 Pickup: ${params.kitchenName}${params.kitchenAddress ? `\n📍 ${params.kitchenAddress}` : ""}${params.pickupInstructions ? `\n📝 Pickup Note: ${params.pickupInstructions}` : ""}

🚗 Deliver to:${params.customerAddress ? `\n📍 ${params.customerAddress}` : " Customer address in app"}${params.deliveryInstructions ? `\n📝 Delivery Note: ${params.deliveryInstructions}` : ""}

— Shero Operations`;
}

// ── Support & Query Messages ───────────────────────────────────────

export function buildSupportMessage(params: {
  orderId?: string;
  customerName?: string;
  issue?: string;
}): string {
  let msg = `Hi Shero Support 👋\n`;
  if (params.customerName) msg += `I'm ${params.customerName}.\n`;
  if (params.orderId) msg += `Order ID: #${params.orderId}\n`;
  if (params.issue) msg += `Issue: ${params.issue}\n`;
  msg += `\nPlease help!`;
  return msg;
}

// ── Universal wa.me Link Generator ─────────────────────────────────

export function openWhatsApp(phone: string, message: string): void {
  const cleanPhone = phone.replace(/\D/g, "");
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

export function openWhatsAppSupport(message?: string): void {
  const msg = message || "Hi Shero Support 👋 I need help!";
  openWhatsApp(SHERO_SUPPORT_NUMBER, msg);
}

export function shareViaWhatsApp(message: string): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
}

// ── Send order confirmation via WhatsApp (customer) ────────────────

export function sendOrderConfirmationWhatsApp(params: {
  customerPhone: string;
  orderId: string;
  orderType: string;
  customerName: string;
  total: string;
  deliverySlot?: string;
  eventDate?: string;
  guestCount?: number;
}): void {
  const message = buildOrderConfirmationMessage(params);
  openWhatsApp(params.customerPhone, message);
}

// ── Send order status update via WhatsApp (customer) ───────────────

export function sendOrderStatusWhatsApp(params: {
  customerPhone: string;
  orderId: string;
  status: string;
  customerName: string;
  eta?: string;
}): void {
  const message = buildOrderStatusMessage(params);
  openWhatsApp(params.customerPhone, message);
}

// ── Notify partner via WhatsApp ────────────────────────────────────

export function notifyPartnerWhatsApp(params: {
  partnerPhone: string;
  orderId: string;
  orderType: string;
  customerName: string;
  itemCount: number;
  deliverySlot?: string;
  eventDate?: string;
  guestCount?: number;
}): void {
  const message = buildPartnerOrderAlert(params);
  openWhatsApp(params.partnerPhone, message);
}
