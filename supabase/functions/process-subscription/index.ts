import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");

    // Verify RevenueCat webhook secret
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

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const appUserId = event.app_user_id as string;
    const eventType = event.type as string;

    const activeEvents = [
      "INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE", "UNCANCELLATION",
    ];
    const inactiveEvents = [
      "CANCELLATION", "EXPIRATION", "BILLING_ISSUE",
    ];

    if (activeEvents.includes(eventType)) {
      const expiresAt = event.expiration_at_ms
        ? new Date(event.expiration_at_ms).toISOString()
        : null;
      await adminClient
        .from("users")
        .update({ is_pro: true, pro_expires_at: expiresAt })
        .eq("id", appUserId);
    } else if (inactiveEvents.includes(eventType)) {
      await adminClient
        .from("users")
        .update({ is_pro: false, pro_expires_at: null })
        .eq("id", appUserId);
    }

    return new Response(
      JSON.stringify({ success: true, event_type: eventType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
