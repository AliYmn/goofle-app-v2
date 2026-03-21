import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRO_DAILY_BONUS = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify user is Pro
    const { data: userRow } = await adminClient
      .from("users")
      .select("is_pro")
      .eq("id", user.id)
      .single();

    if (!userRow?.is_pro) {
      return new Response(JSON.stringify({ error: "Pro subscription required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency: one claim per calendar day
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await adminClient
      .from("credit_transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "pro_daily_bonus")
      .gte("created_at", `${today}T00:00:00.000Z`)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ already_claimed: true, credits_awarded: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient.rpc("add_credits", {
      p_user_id: user.id,
      p_amount: PRO_DAILY_BONUS,
      p_type: "pro_daily_bonus",
    });

    return new Response(
      JSON.stringify({ success: true, credits_awarded: PRO_DAILY_BONUS }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
