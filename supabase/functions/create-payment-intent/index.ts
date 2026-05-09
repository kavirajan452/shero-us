import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PaymentMode = "demo" | "stripe";

const getPaymentMode = (): PaymentMode => {
  const raw = (
    Deno.env.get("PAYMENT_MODE") ??
    Deno.env.get("NEXT_PUBLIC_PAYMENT_MODE") ??
    Deno.env.get("APP_MODE") ??
    "demo"
  ).toLowerCase();
  return raw === "stripe" || raw === "production" || raw === "live" ? "stripe" : "demo";
};

const getAdminClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("Missing Supabase service role configuration");
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

const updateOrderPayment = async (orderId: string, updates: Record<string, unknown>) => {
  const supabase = getAdminClient();
  const { error } = await supabase.from("instant_orders").update(updates).eq("id", orderId);
  if (error) {
    throw new Error(`Unable to update order payment: ${error.message}`);
  }
};

const logPaymentAttempt = async (params: {
  orderId: string;
  amount: number;
  mode: "dev" | "production";
  provider: string;
  status: string;
  responseBody: unknown;
}) => {
  try {
    const supabase = getAdminClient();
    await supabase.from("payment_attempts").insert({
      order_id: params.orderId,
      amount: params.amount,
      mode: params.mode,
      provider: params.provider,
      status: params.status,
      gateway_response: params.responseBody,
    });
  } catch (error) {
    console.error("Failed to log payment attempt", (error as Error).message);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    const amount = Number(body?.amount ?? 0);
    const currency = typeof body?.currency === "string" ? body.currency.toLowerCase() : "usd";

    if (!orderId) {
      return new Response(JSON.stringify({ success: false, error: "orderId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return new Response(JSON.stringify({ success: false, error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mode = getPaymentMode();

    if (mode === "demo") {
      const transactionId = `demo_txn_${Date.now()}`;
      const responseBody = {
        success: true,
        mode: "demo",
        clientSecret: `demo_secret_${Date.now()}`,
        transactionId,
      };

      await updateOrderPayment(orderId, {
        payment_status: "processing",
        payment_provider: "demo",
        payment_transaction_id: transactionId,
        payment_mode: "demo",
      });

      await logPaymentAttempt({
        orderId,
        amount,
        mode: "dev",
        provider: "demo",
        status: "intent_created",
        responseBody,
      });

      return new Response(JSON.stringify(responseBody), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ success: false, error: "STRIPE_SECRET_KEY is required in stripe mode" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountCents = Math.round(amount * 100);
    const stripeBody = new URLSearchParams({
      amount: String(amountCents),
      currency,
      "automatic_payment_methods[enabled]": "true",
      "metadata[order_id]": orderId,
    });

    const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: stripeBody.toString(),
    });

    const stripeJson = await stripeResponse.json();

    if (!stripeResponse.ok) {
      await logPaymentAttempt({
        orderId,
        amount,
        mode: "production",
        provider: "stripe",
        status: "failed",
        responseBody: stripeJson,
      });
      return new Response(JSON.stringify({ success: false, error: stripeJson?.error?.message ?? "Stripe request failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await updateOrderPayment(orderId, {
      payment_status: "processing",
      payment_provider: "stripe",
      payment_transaction_id: stripeJson.id,
      payment_mode: "stripe",
    });

    await logPaymentAttempt({
      orderId,
      amount,
      mode: "production",
      provider: "stripe",
      status: "intent_created",
      responseBody: stripeJson,
    });

    return new Response(JSON.stringify({
      success: true,
      mode: "stripe",
      clientSecret: stripeJson.client_secret,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
