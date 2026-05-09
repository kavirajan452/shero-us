import { supabase } from "@/integrations/supabase/client";

export type EmailNotificationType =
  | "order_confirmation"
  | "order_accepted"
  | "order_dispatched"
  | "order_delivered"
  | "payment_failed"
  | "kitchen_new_order"
  | "kitchen_order_cancelled"
  | "admin_high_value_order"
  | "admin_payment_failure"
  | "admin_delivery_failure";

type EmailNotificationInput = {
  type: EmailNotificationType;
  recipient: string;
  payload: Record<string, unknown>;
  referenceId?: string;
};

const isDemoMode = () => (process.env.NEXT_PUBLIC_EMAIL_MODE ?? "demo").toLowerCase() === "demo";

export async function sendEmailNotification(input: EmailNotificationInput) {
  if (!input.recipient?.trim()) return { success: false, skipped: true, reason: "missing_recipient" };

  const { data, error } = await supabase.functions.invoke("send-email", {
    body: {
      mode: isDemoMode() ? "demo" : "smtp",
      type: input.type,
      recipient: input.recipient.trim(),
      payload: input.payload,
      reference_id: input.referenceId ?? null,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function sendOrderConfirmationNotification(input: {
  recipient: string;
  customerName: string;
  orderId: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  deliveryAddress: string;
  deliveryEta?: string;
  supportContact?: string;
}) {
  return sendEmailNotification({
    type: "order_confirmation",
    recipient: input.recipient,
    referenceId: input.orderId,
    payload: input,
  });
}

export async function sendPaymentFailureNotification(input: {
  recipient: string;
  customerName: string;
  orderId: string;
  paymentRetryLink?: string;
  supportContact?: string;
}) {
  return sendEmailNotification({
    type: "payment_failed",
    recipient: input.recipient,
    referenceId: input.orderId,
    payload: input,
  });
}

export async function sendHighValueAdminAlert(input: {
  recipient: string;
  customerName: string;
  orderId: string;
  total: number;
}) {
  return sendEmailNotification({
    type: "admin_high_value_order",
    recipient: input.recipient,
    referenceId: input.orderId,
    payload: input,
  });
}

export async function sendPaymentFailureAdminAlert(input: {
  recipient: string;
  customerName: string;
  orderId: string;
  total: number;
}) {
  return sendEmailNotification({
    type: "admin_payment_failure",
    recipient: input.recipient,
    referenceId: input.orderId,
    payload: input,
  });
}
