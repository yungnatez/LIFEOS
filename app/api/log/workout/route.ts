import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Workout } from "@/lib/supabase/types";
import { recalcAndPersistScores } from "@/lib/calculations/recalc-scores";

interface SetInput {
  exercise_id: string;
  weight_kg: number;
  reps: number;
  set_number: number;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sets: SetInput[]; notes?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.sets || body.sets.length === 0) {
    return Response.json({ error: "At least one set is required" }, { status: 400 });
  }

  const total_volume_kg = body.sets.reduce(
    (sum, s) => sum + s.weight_kg * s.reps,
    0
  );

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      user_id: user.id,
      total_volume_kg,
      notes: body.notes ?? null,
    } as never)
    .select()
    .single();

  if (workoutError || !workout) {
    return Response.json(
      { error: workoutError?.message ?? "Failed to create workout" },
      { status: 500 }
    );
  }
  const workoutRow = workout as Workout;

  const setsToInsert = body.sets.map((s) => ({
    workout_id: workoutRow.id,
    exercise_id: s.exercise_id,
    weight_kg: s.weight_kg,
    reps: s.reps,
    set_number: s.set_number,
    estimated_1rm_kg: Math.round(s.weight_kg * (1 + s.reps / 30) * 10) / 10,
  }));

  const { data: sets, error: setsError } = await supabase
    .from("workout_sets")
    .insert(setsToInsert as never)
    .select();

  if (setsError) {
    return Response.json({ error: setsError.message }, { status: 500 });
  }

  // Recalculate all scores immediately so dashboard reflects this session
  await recalcAndPersistScores(supabase, user.id);

  return Response.json({ ...workoutRow, sets });
}
