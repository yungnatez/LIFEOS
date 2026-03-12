import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recalcAndPersistScores } from "@/lib/calculations/recalc-scores";
import type { Goal } from "@/lib/supabase/types";

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
    } as never)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Update physique goal progress
  const { data: goalsRaw } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("category", "physique")
    .eq("status", "active");

  for (const goal of ((goalsRaw ?? []) as Goal[])) {
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
      } as never)
      .eq("id", goal.id);
  }

  // Recalculate all scores immediately
  await recalcAndPersistScores(supabase, user.id);

  return Response.json(row);
}
