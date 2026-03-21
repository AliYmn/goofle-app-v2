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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const falApiKey = Deno.env.get("FAL_API_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: max 10 generations per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if ((recentCount ?? 0) >= 10) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { mod_id, source_image_url, custom_prompt } = body;

    if (!mod_id || !source_image_url) {
      return new Response(JSON.stringify({ error: "mod_id and source_image_url are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch mod and user in parallel
    const [modRes, userRes] = await Promise.all([
      supabase.from("mods").select("id, prompt, credit_cost, is_premium").eq("id", mod_id).single(),
      supabase.from("users").select("id, credit_balance, is_pro").eq("id", user.id).single(),
    ]);

    if (modRes.error || !modRes.data) {
      return new Response(JSON.stringify({ error: "Mod not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mod = modRes.data;
    const userData = userRes.data;

    if (!userData) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pro users get 50% cost discount
    const effectiveCost = userData.is_pro ? Math.ceil(mod.credit_cost / 2) : mod.credit_cost;

    if (userData.credit_balance < effectiveCost) {
      return new Response(JSON.stringify({ error: "insufficient_credits", required: effectiveCost }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build fal.ai prompt
    const finalPrompt = custom_prompt ? `${mod.prompt}, ${custom_prompt}` : mod.prompt;

    // Submit to fal.ai (queue mode for async)
    const falRes = await fetch("https://queue.fal.run/fal-ai/ip-adapter-face-id", {
      method: "POST",
      headers: {
        "Authorization": `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: source_image_url,
        prompt: finalPrompt,
        negative_prompt: "blurry, low quality, deformed, ugly",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        face_id_strength: 0.8,
      }),
    });

    if (!falRes.ok) {
      const falErr = await falRes.text();
      console.error("fal.ai error:", falErr);
      return new Response(JSON.stringify({ error: "Generation service unavailable" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const falData = await falRes.json();
    const falJobId = falData.request_id;

    // Create generation record + deduct credits in a transaction-like manner
    const { data: generation, error: genError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        mod_id: mod.id,
        source_image_url,
        custom_prompt: custom_prompt ?? null,
        status: "processing",
        fal_job_id: falJobId,
        is_public: false,
      })
      .select("id")
      .single();

    if (genError || !generation) {
      return new Response(JSON.stringify({ error: "Failed to create generation record" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct credits
    await supabase.rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: effectiveCost,
      p_description: `Generation: mod ${mod_id}`,
    });

    // Increment mod usage count
    await supabase
      .from("mods")
      .update({ usage_count: mod.credit_cost }) // will be handled by trigger ideally
      .eq("id", mod_id);

    return new Response(
      JSON.stringify({ generation_id: generation.id, fal_job_id: falJobId }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
