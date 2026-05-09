import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@7.0.11";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailPayload = {
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

type IncomingBody = {
  mode?: "demo" | "smtp";
  type?: string;
  recipient?: string;
  payload?: EmailPayload;
  reference_id?: string | null;
};

const EMAIL_SUBJECTS: Record<string, string> = {
  order_confirmation: "Your Shero Order is Confirmed 🍱",
  order_accepted: "Your Shero Order Has Been Accepted ✅",
  order_dispatched: "Your Shero Order is On The Way 🚚",
  order_delivered: "Your Shero Order Has Been Delivered 🎉",
  payment_failed: "Payment Failed — Please Retry",
  kitchen_new_order: "New Shero Order Received",
  kitchen_order_cancelled: "Shero Order Cancelled",
  admin_high_value_order: "High Value Order Alert",
  admin_payment_failure: "Payment Failure Alert",
  admin_delivery_failure: "Delivery Failure Alert",
};

const sanitize = (value: string) => value.replace(/[<>"'&]/g, "");

const renderItems = (items: EmailPayload["items"] = []) =>
  items
    .map((item) => {
      const qty = item.qty ?? 1;
      const name = sanitize(item.name ?? "Item");
      const price = typeof item.price === "number" ? ` - $${item.price.toFixed(2)}` : "";
      return `<li>${qty}x ${name}${price}</li>`;
    })
    .join("");

const renderTemplate = (type: string, payload: EmailPayload = {}) => {
  const customerName = sanitize(payload.customerName || "Customer");
  const orderId = sanitize(payload.orderId || "-");
  const total = typeof payload.total === "number" ? `$${payload.total.toFixed(2)}` : "-";
  const deliveryAddress = sanitize(payload.deliveryAddress || "-");
  const deliveryEta = sanitize(payload.deliveryEta || "We'll share an ETA soon.");
  const supportContact = sanitize(payload.supportContact || "support@shero.com");
  const paymentRetryLink = sanitize(payload.paymentRetryLink || "https://www.shero.us/checkout");
  const courierName = sanitize(payload.courierName || "Shero delivery partner");
  const trackingStatus = sanitize(payload.trackingStatus || "Out for delivery");

  switch (type) {
    case "order_confirmation":
      return `
        <h2>Your Shero Order is Confirmed 🍱</h2>
        <p>Hi ${customerName}, your order has been confirmed.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total:</strong> ${total}</p>
        <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
        <p><strong>Estimated Delivery:</strong> ${deliveryEta}</p>
        <h3>Items</h3>
        <ul>${renderItems(payload.items)}</ul>
        <p>If you need help, contact us at ${supportContact}.</p>
      `;
    case "order_dispatched":
      return `
        <h2>Your Shero Order is On The Way 🚚</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Courier:</strong> ${courierName}</p>
        <p><strong>ETA:</strong> ${deliveryEta}</p>
        <p><strong>Tracking:</strong> ${trackingStatus}</p>
      `;
    case "payment_failed":
      return `
        <h2>Payment Failed — Please Retry</h2>
        <p>Hi ${customerName}, your payment could not be completed.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><a href="${paymentRetryLink}">Retry payment</a></p>
        <p>Need help? Contact ${supportContact}</p>
      `;
    default:
      return `
        <h2>${sanitize(EMAIL_SUBJECTS[type] || "Shero Notification")}</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total:</strong> ${total}</p>
      `;
  }
};

const getEmailMode = (mode?: string) => {
  const raw = (mode ?? Deno.env.get("EMAIL_MODE") ?? Deno.env.get("NEXT_PUBLIC_EMAIL_MODE") ?? "demo").toLowerCase();
  return raw === "smtp" ? "smtp" : "demo";
};

const createSupabaseAdminClient = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

const parseReferenceId = (referenceId?: string | null) => {
  if (!referenceId) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(referenceId)
    ? referenceId
    : null;
};

const logNotification = async (params: {
  type: string;
  recipient: string;
  subject: string;
  body: string;
  provider: string;
  status: string;
  referenceId?: string | null;
  metadata?: Record<string, unknown>;
}) => {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notification_logs").insert({
    type: params.type,
    recipient: params.recipient,
    subject: params.subject,
    body: params.body,
    provider: params.provider,
    status: params.status,
    reference_id: parseReferenceId(params.referenceId),
    metadata: params.metadata ?? {},
  });
  if (error) console.error("Failed to log notification", error.message);
};

const sendWithSmtp = async (recipient: string, subject: string, html: string) => {
  const host = Deno.env.get("SMTP_HOST");
  const port = Number(Deno.env.get("SMTP_PORT") ?? "587");
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASSWORD");
  const fromEmail = Deno.env.get("SMTP_FROM_EMAIL");
  const fromName = Deno.env.get("SMTP_FROM_NAME") ?? "Shero";

  if (!host || !port || !user || !pass || !fromEmail) {
    throw new Error("SMTP configuration is incomplete");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: recipient,
    subject,
    html,
  });

  return {
    provider: "smtp",
    messageId: info.messageId,
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as IncomingBody;
    const type = body?.type?.trim() || "";
    const recipient = body?.recipient?.trim() || "";

    if (!type || !(type in EMAIL_SUBJECTS)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid notification type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid recipient" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = EMAIL_SUBJECTS[type];
    const html = renderTemplate(type, body.payload ?? {});
    const mode = getEmailMode(body.mode);
    const referenceId = body.reference_id ?? body.payload?.orderId ?? null;

    if (mode === "demo") {
      console.log({ to: recipient, subject, html });
      await logNotification({
        type,
        recipient,
        subject,
        body: html,
        provider: "demo",
        status: "demo_logged",
        referenceId,
        metadata: { mode: "demo" },
      });
      return new Response(JSON.stringify({ success: true, mode: "demo", status: "logged" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const result = await sendWithSmtp(recipient, subject, html);
      await logNotification({
        type,
        recipient,
        subject,
        body: html,
        provider: result.provider,
        status: "sent",
        referenceId,
        metadata: { mode: "smtp", message_id: result.messageId },
      });

      return new Response(JSON.stringify({ success: true, mode: "smtp", messageId: result.messageId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (smtpError) {
      const smtpMessage = (smtpError as Error).message;
      await logNotification({
        type,
        recipient,
        subject,
        body: html,
        provider: "smtp",
        status: "failed",
        referenceId,
        metadata: { mode: "smtp", error: smtpMessage },
      });
      throw smtpError;
    }
  } catch (error) {
    const message = (error as Error).message;
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
