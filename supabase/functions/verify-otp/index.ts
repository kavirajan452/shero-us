import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEV_LOGIN_PASSWORD = "123456";

const phoneToEmail = (phone: string) => `${phone.slice(-10)}@shero.dev`;
const allowedOtpRoles = new Set(["customer", "partner"]);
const isDuplicateRegistrationError = (error: { message?: string; code?: string; status?: number } | null) => {
  if (!error) return false;
  const normalized = (error.message ?? "").toLowerCase();
  return error.code === "email_exists" ||
    error.status === 422 ||
    normalized.includes("already been registered") ||
    normalized.includes("already registered");
};
const findAuthUserIdByEmail = async (supabase: ReturnType<typeof createClient>, email: string) => {
  const targetEmail = email.toLowerCase();
  const perPage = Math.max(1, Number(Deno.env.get("VERIFY_OTP_USER_LOOKUP_PER_PAGE") ?? "200"));
  const maxPages = Math.max(1, Number(Deno.env.get("VERIFY_OTP_USER_LOOKUP_MAX_PAGES") ?? "100"));

  for (let page = 1; page <= maxPages; page += 1) {
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ page, perPage });
    if (listError) throw listError;

    const users = listData?.users ?? [];
    const existingAuthUser = users.find((u) => (u.email ?? "").toLowerCase() === targetEmail);
    if (existingAuthUser?.id) return existingAuthUser.id;

    if (users.length < perPage) break;
  }

  return null;
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
    const code = String(body?.code ?? "").trim();
    const requestedRoleRaw = String(body?.role ?? "customer").toLowerCase();
    const requestedRole: "customer" | "partner" = allowedOtpRoles.has(requestedRoleRaw) && requestedRoleRaw === "partner"
      ? "partner"
      : "customer";
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    const providedEmail = typeof body?.email === "string" ? body.email.trim() : "";

    if (digits.length < 10 || code.length !== 6) {
      return new Response(JSON.stringify({ success: false, error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: otpRows, error: otpError } = await supabase
      .from("otp_attempts")
      .select("*")
      .eq("phone", digits)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (otpError) throw otpError;

    const latestOtp = otpRows?.[0];
    if (!latestOtp) {
      return new Response(JSON.stringify({ success: false, error: "OTP not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isExpired = new Date(latestOtp.expires_at).getTime() < Date.now();
    const hashedCode = await hashOtp(code);
    const isMatch = latestOtp.otp_code === hashedCode;
    if (!isMatch || isExpired) {
      await supabase
        .from("otp_attempts")
        .update({ failed_attempts: (latestOtp.failed_attempts ?? 0) + 1 })
        .eq("id", latestOtp.id);

      return new Response(JSON.stringify({ success: false, error: isExpired ? "OTP expired" : "Invalid OTP" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("otp_attempts").update({ used: true }).eq("id", latestOtp.id);

    const email = phoneToEmail(digits);
    const { data: profileByEmailRows, error: profileByEmailError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .not("user_id", "is", null)
      .limit(1);
    if (profileByEmailError) throw profileByEmailError;

    const { data: profileByPhoneRows, error: profileByPhoneError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", digits)
      .not("user_id", "is", null)
      .limit(1);
    if (profileByPhoneError) throw profileByPhoneError;

    const profileEmailUserId = profileByEmailRows?.[0]?.user_id ?? null;
    const profilePhoneUserId = profileByPhoneRows?.[0]?.user_id ?? null;
    if (profileEmailUserId && profilePhoneUserId && profileEmailUserId !== profilePhoneUserId) {
      return new Response(JSON.stringify({ success: false, error: "Conflicting account records found for this login" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userId: string | null = profileEmailUserId ?? profilePhoneUserId;

    if (!userId) {
      const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
        email,
        password: DEV_LOGIN_PASSWORD,
        email_confirm: true,
        user_metadata: { phone: digits },
      });
      if (createUserError) {
        // User already exists in auth.users but not in profiles — look them up
        if (isDuplicateRegistrationError(createUserError)) {
          userId = await findAuthUserIdByEmail(supabase, email);
          if (!userId) throw new Error("User exists in auth but could not be retrieved");
        } else {
          throw createUserError;
        }
      } else {
        userId = createdUser.user?.id ?? null;
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: "Unable to create or find user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          phone: digits,
          email: providedEmail || email,
          full_name: fullName || undefined,
        },
        { onConflict: "user_id" },
      );

    const { data: roleRows, error: roleReadError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", requestedRole);
    if (roleReadError) throw roleReadError;
    if (!roleRows?.length) {
      const { error: roleInsertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: requestedRole });
      if (roleInsertError) throw roleInsertError;
    }

    return new Response(JSON.stringify({ success: true, user: { id: userId, email, phone: digits } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
