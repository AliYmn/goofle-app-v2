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

    const url = new URL(req.url);
    const generationId = url.searchParams.get("id");
    if (!generationId) {
      return new Response(JSON.stringify({ error: "Missing id parameter" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: generation, error: fetchError } = await supabase
      .from("generations")
      .select("id, status, result_image_url, fal_job_id, created_at, completed_at")
      .eq("id", generationId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !generation) {
      return new Response(JSON.stringify({ error: "Generation not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If still processing, check fal.ai for live status
    if (generation.status === "processing" && generation.fal_job_id) {
      const falApiKey = Deno.env.get("FAL_API_KEY")!;
      const falStatusRes = await fetch(
        `https://queue.fal.run/fal-ai/ip-adapter-face-id/requests/${generation.fal_job_id}/status`,
        { headers: { "Authorization": `Key ${falApiKey}` } },
      );

      if (falStatusRes.ok) {
        const falStatus = await falStatusRes.json();
        return new Response(
          JSON.stringify({
            ...generation,
            fal_status: falStatus.status,
            fal_progress: falStatus.queue_position ?? null,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(JSON.stringify(generation), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
