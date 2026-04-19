import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Fetch expiry settings
    const { data: configRow } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "wallet_expiry_settings")
      .single();

    const settings = configRow?.value || {
      validity_days: 90,
      warning_days: [7, 3, 1],
      auto_expire_enabled: true,
      notification_messages: {
        "7_day_warning": "${amount} in your wallet expires in 7 days! Use it before {date}.",
        "3_day_warning": "${amount} expiring in 3 days — order now!",
        "1_day_warning": "Last day! ${amount} expires tomorrow.",
        expired: "${amount} has expired from your wallet.",
      },
    };

    if (!settings.auto_expire_enabled) {
      return new Response(
        JSON.stringify({ message: "Auto-expire disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();
    let notificationsSent = 0;
    let creditsExpired = 0;

    // 2. Send warning notifications for credits approaching expiry
    const warningDays: number[] = settings.warning_days || [7, 3, 1];

    for (const days of warningDays) {
      const notifType = `${days}_day_warning`;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const futureDateStart = new Date(futureDate);
      futureDateStart.setHours(0, 0, 0, 0);
      const futureDateEnd = new Date(futureDate);
      futureDateEnd.setHours(23, 59, 59, 999);

      // Find credits expiring on that day that haven't been notified
      const { data: expiringCredits } = await supabase
        .from("wallet_transactions")
        .select("id, user_id, remaining_amount, expires_at")
        .eq("expired", false)
        .gt("remaining_amount", 0)
        .gte("expires_at", futureDateStart.toISOString())
        .lte("expires_at", futureDateEnd.toISOString());

      if (!expiringCredits?.length) continue;

      for (const credit of expiringCredits) {
        // Check if notification already sent
        const { data: existing } = await supabase
          .from("wallet_expiry_notifications")
          .select("id")
          .eq("transaction_id", credit.id)
          .eq("notification_type", notifType)
          .limit(1);

        if (existing?.length) continue;

        const messageTemplate =
          settings.notification_messages?.[notifType] || `$\{amount} expires in ${days} days.`;
        const expiryDate = new Date(credit.expires_at).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const message = messageTemplate
          .replace("{amount}", String(credit.remaining_amount))
          .replace("{date}", expiryDate);

        await supabase.from("wallet_expiry_notifications").insert({
          user_id: credit.user_id,
          transaction_id: credit.id,
          notification_type: notifType,
          message,
        });
        notificationsSent++;
      }
    }

    // 3. Expire credits past their expiry date
    const { data: expiredCredits } = await supabase
      .from("wallet_transactions")
      .select("id, user_id, remaining_amount")
      .eq("expired", false)
      .gt("remaining_amount", 0)
      .not("expires_at", "is", null)
      .lt("expires_at", now);

    if (expiredCredits?.length) {
      for (const credit of expiredCredits) {
        // Mark expired
        await supabase
          .from("wallet_transactions")
          .update({ expired: true, remaining_amount: 0 })
          .eq("id", credit.id);

        // Deduct from user wallet balance
        const { data: wallet } = await supabase
          .from("user_wallets")
          .select("balance")
          .eq("user_id", credit.user_id)
          .single();

        if (wallet) {
          const newBalance = Math.max(0, wallet.balance - credit.remaining_amount);
          await supabase
            .from("user_wallets")
            .update({ balance: newBalance })
            .eq("user_id", credit.user_id);
        }

        // Send expired notification
        const messageTemplate =
          settings.notification_messages?.expired || "${amount} has expired from your wallet.";
        const message = messageTemplate.replace("{amount}", String(credit.remaining_amount));

        await supabase.from("wallet_expiry_notifications").insert({
          user_id: credit.user_id,
          transaction_id: credit.id,
          notification_type: "expired",
          message,
        });

        creditsExpired++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: notificationsSent,
        credits_expired: creditsExpired,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
