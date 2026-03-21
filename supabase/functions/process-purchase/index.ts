import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credit pack sizes by product identifier
const CREDIT_PACKS: Record<string, number> = {
  "credits_50": 50,
  "credits_120": 120,
  "credits_300": 300,
  "credits_700": 700,
};

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

    const { productId, transactionId } = await req.json();
    if (!productId || !transactionId) {
      return new Response(JSON.stringify({ error: "productId and transactionId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const creditAmount = CREDIT_PACKS[productId];
    if (!creditAmount) {
      return new Response(JSON.stringify({ error: "Unknown product" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    // Idempotency: prevent duplicate credit awards for same transaction
    const { data: existing } = await adminClient
      .from("credit_transactions")
      .select("id")
      .eq("reference_id", transactionId)
      .eq("type", "purchase")
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ already_processed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient.rpc("add_credits", {
      p_user_id: user.id,
      p_amount: creditAmount,
      p_type: "purchase",
      p_reference_id: transactionId,
    });

    return new Response(
      JSON.stringify({ success: true, credits_awarded: creditAmount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
