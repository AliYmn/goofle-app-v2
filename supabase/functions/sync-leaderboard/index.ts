import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getPeriodStart(period: string): string {
  const now = new Date();
  if (period === "daily") {
    return now.toISOString().slice(0, 10);
  } else if (period === "weekly") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diff);
    return monday.toISOString().slice(0, 10);
  } else {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const periods = ["daily", "weekly", "monthly"];
    const categories = ["most_liked", "longest_streak", "most_used_mods"];

    for (const period of periods) {
      const periodStart = getPeriodStart(period);

      for (const category of categories) {
        if (category === "most_liked") {
          // Count likes on user's public generations within period
          const { data: rows } = await adminClient
            .from("likes")
            .select("generations(user_id)")
            .gte("created_at", periodStart);

          const counts: Record<string, number> = {};
          for (const row of rows ?? []) {
            const uid = (row.generations as any)?.user_id;
            if (uid) counts[uid] = (counts[uid] ?? 0) + 1;
          }

          for (const [user_id, score] of Object.entries(counts)) {
            await adminClient.from("leaderboard_entries").upsert({
              user_id, period_type: period, ranking_category: category,
              period_start: periodStart, score,
            }, { onConflict: "user_id,period_type,ranking_category,period_start" });
          }
        } else if (category === "longest_streak") {
          const { data: rows } = await adminClient
            .from("users")
            .select("id, current_streak")
            .gt("current_streak", 0);

          for (const row of rows ?? []) {
            await adminClient.from("leaderboard_entries").upsert({
              user_id: row.id, period_type: period, ranking_category: category,
              period_start: periodStart, score: row.current_streak,
            }, { onConflict: "user_id,period_type,ranking_category,period_start" });
          }
        } else if (category === "most_used_mods") {
          const { data: rows } = await adminClient
            .from("generations")
            .select("user_id")
            .eq("status", "completed")
            .gte("created_at", periodStart);

          const counts: Record<string, number> = {};
          for (const row of rows ?? []) {
            counts[row.user_id] = (counts[row.user_id] ?? 0) + 1;
          }

          for (const [user_id, score] of Object.entries(counts)) {
            await adminClient.from("leaderboard_entries").upsert({
              user_id, period_type: period, ranking_category: category,
              period_start: periodStart, score,
            }, { onConflict: "user_id,period_type,ranking_category,period_start" });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
