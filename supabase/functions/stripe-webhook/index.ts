import Stripe from "https://esm.sh/stripe@18.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const jsonHeaders = {
  "Content-Type": "application/json",
};

const getAdminClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("Missing Supabase service role configuration");
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

const updateOrderById = async (orderId: string, updates: Record<string, unknown>) => {
  const supabase = getAdminClient();
  const { error } = await supabase.from("instant_orders").update(updates).eq("id", orderId);
  if (error) throw new Error(error.message);
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const signature = req.headers.get("stripe-signature");

    if (!stripeSecret || !webhookSecret || !signature) {
      return new Response(JSON.stringify({ success: false, error: "Stripe webhook configuration missing" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2025-03-31.basil" });
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.order_id;
      if (orderId) {
        await updateOrderById(orderId, {
          payment_status: "paid",
          status: "confirmed",
          payment_provider: "stripe",
          payment_transaction_id: paymentIntent.id,
          payment_mode: "stripe",
          payment_completed_at: new Date().toISOString(),
        });
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.order_id;
      if (orderId) {
        await updateOrderById(orderId, {
          payment_status: "failed",
          payment_provider: "stripe",
          payment_transaction_id: paymentIntent.id,
          payment_mode: "stripe",
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: jsonHeaders,
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      headers: jsonHeaders,
      status: 400,
    });
  }
});
