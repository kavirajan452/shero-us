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

    const isDevMode = Deno.env.get("OTP_DEV_MODE") !== "false";
    return new Response(JSON.stringify({ success: true, otp: isDevMode ? otp : undefined }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
