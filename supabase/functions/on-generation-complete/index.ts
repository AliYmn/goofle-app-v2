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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();

    // fal.ai webhook payload shape: { request_id, status, payload: { images: [{url}] } }
    const { request_id, status, payload, error: falError } = body;

    if (!request_id) {
      return new Response(JSON.stringify({ error: "Missing request_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the generation record by fal_job_id
    const { data: generation, error: fetchError } = await supabase
      .from("generations")
      .select("id, user_id, mod_id")
      .eq("fal_job_id", request_id)
      .single();

    if (fetchError || !generation) {
      console.error("Generation not found for job:", request_id);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (status === "COMPLETED" && payload?.images?.[0]?.url) {
      const resultImageUrl = payload.images[0].url;

      await supabase
        .from("generations")
        .update({
          result_image_url: resultImageUrl,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", generation.id);

      // Update streak and increment mod usage in parallel
      await Promise.all([
        supabase.rpc("update_streak", { p_user_id: generation.user_id }),
        supabase.rpc("increment_mod_usage", { p_mod_id: generation.mod_id }),
      ]);

      // Fetch user push token for notification
      const { data: user } = await supabase
        .from("users")
        .select("push_token")
        .eq("id", generation.user_id)
        .single();

      if (user?.push_token) {
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: user.push_token,
            title: "Üretiminiz Hazır! 🎉",
            body: "AI dönüşümünüz tamamlandı. Hemen bakın!",
            data: { generation_id: generation.id },
          }),
        });
      }
    } else if (status === "FAILED" || falError) {
      await supabase
        .from("generations")
        .update({ status: "failed" })
        .eq("id", generation.id);

      // Refund credits
      const { data: mod } = await supabase
        .from("mods")
        .select("credit_cost")
        .eq("id", generation.mod_id)
        .single();

      if (mod) {
        await supabase.rpc("add_credits", {
          p_user_id: generation.user_id,
          p_amount: mod.credit_cost,
          p_type: "refund",
          p_description: "Üretim başarısız — kredi iadesi",
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
