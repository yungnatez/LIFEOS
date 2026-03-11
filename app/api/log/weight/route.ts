import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calcPhysiqueScore } from "@/lib/calculations/mission-score";
import { calcMissionScore } from "@/lib/calculations/mission-score";
import { calcHabitScore } from "@/lib/calculations/habit-completion";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { weight_kg: number; body_fat_pct?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.weight_kg || isNaN(body.weight_kg)) {
    return Response.json({ error: "weight_kg is required" }, { status: 400 });
  }

  const lean_mass_kg =
    body.body_fat_pct != null
      ? body.weight_kg * (1 - body.body_fat_pct / 100)
      : null;

  const { data: row, error } = await supabase
    .from("weight_logs")
    .insert({
      user_id: user.id,
      weight_kg: body.weight_kg,
      body_fat_pct: body.body_fat_pct ?? null,
      lean_mass_kg: lean_mass_kg != null ? Math.round(lean_mass_kg * 100) / 100 : null,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Recalculate physique score
  const [{ data: userData }, { data: weightLogs }, { data: goals }, { data: habits }] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(60),
      supabase.from("goals").select("*").eq("user_id", user.id),
      supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("habit_date", { ascending: false })
        .limit(30),
    ]);

  if (userData && weightLogs) {
    const physique_score = calcPhysiqueScore(weightLogs, userData);
    const habit_score = calcHabitScore(habits ?? []);
    const { data: ss } = await supabase
      .from("system_state")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (ss) {
      const mission_score = calcMissionScore(
        physique_score,
        ss.strength_score,
        ss.finance_score,
        habit_score
      );
      await supabase
        .from("system_state")
        .update({
          physique_score,
          habit_score,
          mission_score,
          last_updated: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      // Update physique goals
      for (const goal of (goals ?? []).filter(
        (g) => g.category === "physique" && g.status === "active"
      )) {
        const start = goal.start_value ?? goal.current_value;
        const range = Math.abs(goal.target_value - start);
        const done = Math.abs(body.weight_kg - start);
        const progress_pct = range === 0 ? 0 : Math.min(100, (done / range) * 100);
        await supabase
          .from("goals")
          .update({
            current_value: body.weight_kg,
            progress_pct,
            status: progress_pct >= 100 ? "complete" : "active",
          })
          .eq("id", goal.id);
      }
    }
  }

  return Response.json(row);
}
