import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAILY_LOGIN_CREDITS = 2;
const PRO_DAILY_CREDITS = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if already claimed today
    const { data: existing } = await supabase
      .from("credit_transactions")
      .select("id")
      .eq("user_id", user.id)
      .in("type", ["daily_login", "pro_daily_bonus"])
      .gte("created_at", `${today}T00:00:00Z`)
      .limit(1)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ already_claimed: true, credits_awarded: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch user pro status
    const { data: userData } = await supabase
      .from("users")
      .select("is_pro")
      .eq("id", user.id)
      .single();

    const creditsToAward = userData?.is_pro ? PRO_DAILY_CREDITS : DAILY_LOGIN_CREDITS;
    const transactionType = userData?.is_pro ? "pro_daily_bonus" : "daily_login";

    const newBalance = await supabase.rpc("add_credits", {
      p_user_id: user.id,
      p_amount: creditsToAward,
      p_type: transactionType,
      p_description: userData?.is_pro ? "Pro günlük bonus" : "Günlük giriş bonusu",
    });

    return new Response(
      JSON.stringify({
        already_claimed: false,
        credits_awarded: creditsToAward,
        new_balance: newBalance.data,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
