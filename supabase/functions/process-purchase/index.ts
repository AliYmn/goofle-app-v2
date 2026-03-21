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
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");

    const authHeader = req.headers.get("Authorization");
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const event = body.event;
    if (!event) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eventType = String(event.type ?? "");
    if (!["INITIAL_PURCHASE", "NON_RENEWING_PURCHASE"].includes(eventType)) {
      return new Response(JSON.stringify({ ignored: true, event_type: eventType }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productId = String(event.product_id ?? event.product_identifier ?? "");
    const transactionId = String(
      event.transaction_id ?? event.original_transaction_id ?? event.id ?? "",
    );
    const appUserId = String(event.app_user_id ?? "");

    if (!productId || !transactionId || !appUserId) {
      return new Response(JSON.stringify({ error: "Missing purchase fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const creditAmount = CREDIT_PACKS[productId];
    if (!creditAmount) {
      return new Response(JSON.stringify({ ignored: true, product_id: productId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      p_user_id: appUserId,
      p_amount: creditAmount,
      p_type: "purchase",
      p_reference_id: transactionId,
    });

    return new Response(
      JSON.stringify({ success: true, event_type: eventType, credits_awarded: creditAmount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
