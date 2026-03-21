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
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Find users whose last_generation_date is before yesterday (streak broken)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const { data: brokenStreaks, error } = await adminClient
      .from("users")
      .select("id")
      .lt("last_generation_date", yesterdayStr)
      .gt("current_streak", 0);

    if (error) throw error;

    if (!brokenStreaks || brokenStreaks.length === 0) {
      return new Response(
        JSON.stringify({ success: true, reset_count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userIds = brokenStreaks.map((r: { id: string }) => r.id);

    const { error: updateError } = await adminClient
      .from("users")
      .update({ current_streak: 0 })
      .in("id", userIds);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, reset_count: userIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
