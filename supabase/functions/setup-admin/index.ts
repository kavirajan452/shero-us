import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const seedUsers = [
    {
      email: "superadmin@shero.in",
      password: "Shero@Admin2026",
      role: "super_admin",
      fullName: "Super Admin",
      phone: "9999000001",
    },
    {
      email: "kitchenpartner@shero.in",
      password: "Shero@Partner2026",
      role: "partner",
      fullName: "Kitchen Partner",
      phone: "9999000002",
    },
  ] as const;

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const users = existingUsers?.users ?? [];
  const seeded: Array<{ email: string; role: string; userId: string }> = [];

  for (const seed of seedUsers) {
    const existing = users.find((u: { id: string; email?: string | null }) => (u.email ?? "").toLowerCase() === seed.email.toLowerCase());
    let userId = existing?.id;

    if (!userId) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: seed.email,
        password: seed.password,
        email_confirm: true,
        user_metadata: { full_name: seed.fullName, phone: seed.phone },
      });
      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      userId = newUser.user?.id;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: `Could not create or resolve user for ${seed.email}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          full_name: seed.fullName,
          email: seed.email,
          phone: seed.phone,
        },
        { onConflict: "user_id" },
      );

    await supabase
      .from("user_roles")
      .upsert(
        {
          user_id: userId,
          role: seed.role,
        },
        { onConflict: "user_id,role" },
      );

    seeded.push({ email: seed.email, role: seed.role, userId });
  }

  return new Response(JSON.stringify({ success: true, seeded }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
