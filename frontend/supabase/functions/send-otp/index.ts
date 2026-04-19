import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const hashOtp = async (otp: string) => {
  const bytes = new TextEncoder().encode(otp);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const isLiveMode = () => {
  const mode = (Deno.env.get("APP_MODE") ?? Deno.env.get("MODE") ?? "dev").toLowerCase();
  return mode === "production" || mode === "prod" || mode === "live";
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
    const digits = String(body?.phone ?? "").replace(/\D/g, "");
    if (digits.length < 10) {
      return new Response(JSON.stringify({ success: false, error: "Invalid phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("otp_attempts")
      .select("id", { count: "exact", head: true })
      .eq("phone", digits)
      .gte("created_at", oneHourAgo);
    if (countError) throw countError;

    if ((count ?? 0) >= 5) {
      return new Response(JSON.stringify({ success: false, error: "Too many OTP requests. Try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    const otp = (100000 + (random[0] % 900000)).toString();
    const otpHash = await hashOtp(otp);

    const { error } = await supabase.from("otp_attempts").insert({
      phone: digits,
      otp_code: otpHash,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    if (error) throw error;

    const liveMode = isLiveMode();
    if (liveMode) {
      const smsApiUrl = Deno.env.get("SMS_INTEGRA_API_URL");
      const smsApiKey = Deno.env.get("SMS_INTEGRA_API_KEY");
      const smsSender = Deno.env.get("SMS_INTEGRA_SENDER_ID") ?? "SHERO";

      if (!smsApiUrl || !smsApiKey) {
        return new Response(JSON.stringify({ success: false, error: "SMS gateway is not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const smsResponse = await fetch(smsApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${smsApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: digits,
          from: smsSender,
          message: `Your Shero OTP is ${otp}`,
        }),
      });

      if (!smsResponse.ok) {
        const smsErrorText = await smsResponse.text();
        return new Response(JSON.stringify({ success: false, error: `SMS gateway failed: ${smsErrorText}` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: true, otp: liveMode ? undefined : otp, mode: liveMode ? "production" : "dev" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
