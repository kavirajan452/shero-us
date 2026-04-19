import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const isLiveMode = () => {
  const mode = (Deno.env.get("APP_MODE") ?? Deno.env.get("MODE") ?? "dev").toLowerCase();
  return mode === "production" || mode === "prod" || mode === "live";
};

const logPaymentAttempt = async (params: {
  orderId?: string;
  amount: number;
  mode: "dev" | "production";
  provider: string;
  status: string;
  responseBody: unknown;
}) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRole) return;

  const supabase = createClient(supabaseUrl, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });
  await supabase.from("payment_attempts").insert({
    order_id: params.orderId ?? null,
    amount: params.amount,
    mode: params.mode,
    provider: params.provider,
    status: params.status,
    gateway_response: params.responseBody,
  });
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const amount = Number(body?.amount ?? 0);
    const orderId = typeof body?.orderId === "string" ? body.orderId : undefined;
    if (!Number.isFinite(amount) || amount <= 0) {
      return new Response(JSON.stringify({ success: false, error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const liveMode = isLiveMode();
    if (!liveMode) {
      const paymentIntentId = `pi_test_${Date.now()}`;
      const testResponse = {
        success: true,
        clientSecret: "test_secret",
        paymentIntentId,
        mode: "dev",
      };
      await logPaymentAttempt({
        orderId,
        amount,
        mode: "dev",
        provider: "simulated",
        status: "simulated",
        responseBody: testResponse,
      });
      return new Response(JSON.stringify(testResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ success: false, error: "STRIPE_SECRET_KEY missing in production mode" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const currency = (Deno.env.get("STRIPE_CURRENCY") ?? "usd").toLowerCase();
    const amountCents = Math.round(amount * 100);
    const stripeBody = new URLSearchParams({
      amount: String(amountCents),
      currency,
      "automatic_payment_methods[enabled]": "true",
    });
    if (orderId) stripeBody.set("metadata[order_id]", orderId);

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

    await logPaymentAttempt({
      orderId,
      amount,
      mode: "production",
      provider: "stripe",
      status: "created",
      responseBody: stripeJson,
    });

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: stripeJson.client_secret,
        paymentIntentId: stripeJson.id,
        mode: "production",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
