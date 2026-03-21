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
    const falApiKey = Deno.env.get("FAL_API_KEY")!;

    const { modId, prompt } = await req.json();
    if (!modId || !prompt) {
      return new Response(JSON.stringify({ error: "modId and prompt required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate image via fal.ai fast-sdxl
    const falRes = await fetch("https://queue.fal.run/fal-ai/fast-sdxl", {
      method: "POST",
      headers: {
        "Authorization": `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: "square",
        num_inference_steps: 8,
        num_images: 1,
      }),
    });

    if (!falRes.ok) {
      throw new Error(`fal.ai error: ${falRes.status}`);
    }

    const falData = await falRes.json();
    const imageUrl: string = falData?.images?.[0]?.url;
    if (!imageUrl) throw new Error("No image returned from fal.ai");

    // Download and re-upload to Supabase Storage
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const filePath = `mod-thumbnails/${modId}.jpg`;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { error: uploadError } = await adminClient.storage
      .from("public-assets")
      .upload(filePath, imgBuffer, { contentType: "image/jpeg", upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = adminClient.storage
      .from("public-assets")
      .getPublicUrl(filePath);

    await adminClient
      .from("mods")
      .update({ thumbnail_url: publicUrl.publicUrl })
      .eq("id", modId);

    return new Response(
      JSON.stringify({ success: true, thumbnail_url: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
