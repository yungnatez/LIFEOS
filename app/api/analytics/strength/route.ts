import { createClient } from "@/lib/supabase/server";
import type { Workout, WorkoutSet, Exercise } from "@/lib/supabase/types";

type WorkoutWithSets = Workout & { sets: WorkoutSet[] };

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get primary exercises
  const { data: exercisesRaw } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .eq("active", true)
    .order("display_order", { ascending: true })
    .limit(3);
  const exercises = exercisesRaw as Exercise[] | null;

  // Get last 8 weeks of workouts with sets
  const { data: workoutsRaw } = await supabase
    .from("workouts")
    .select("*, sets:workout_sets(*)")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: true })
    .limit(56);
  const workouts = workoutsRaw as WorkoutWithSets[] | null;

  // Also get all workout_sets to compute correlation data
  const { data: allSets } = await supabase
    .from("workout_sets")
    .select("*, workout:workouts!inner(user_id, total_volume_kg, logged_at)")
    .eq("workout.user_id", user.id)
    .order("workout.logged_at", { ascending: false })
    .limit(200);

  // Build weekly strength history
  const weeks: Record<string, Record<string, number>> = {};
  for (const workout of workouts ?? []) {
    const weekKey = `W${Math.ceil(
      (new Date().getTime() - new Date(workout.logged_at).getTime()) /
        (7 * 86400000)
    )}`;
    for (const set of workout.sets ?? []) {
      const exercise = (exercises ?? []).find(
        (e) => e.id === set.exercise_id
      );
      if (!exercise) continue;
      const current1rm = weeks[weekKey]?.[exercise.name] ?? 0;
      const this1rm = set.estimated_1rm_kg ?? 0;
      if (!weeks[weekKey]) weeks[weekKey] = {};
      if (this1rm > current1rm) {
        weeks[weekKey][exercise.name] = this1rm;
      }
    }
  }

  // Get correlation: volume vs gain per workout
  const volumeGainData = (workouts ?? [])
    .filter((w) => w.total_volume_kg > 0)
    .map((w) => {
      const maxRm = Math.max(
        ...(w.sets ?? []).map((s) => s.estimated_1rm_kg ?? 0),
        0
      );
      return {
        volume: Math.round(w.total_volume_kg * 1000), // in grams for chart scale
        gain: Math.round(maxRm * 100) / 100,
      };
    })
    .filter((d) => d.volume > 0 && d.gain > 0);

  return Response.json({
    exercises: exercises ?? [],
    strengthHistory: Object.entries(weeks)
      .slice(0, 8)
      .reverse()
      .map(([week, lifts]) => ({ week, ...lifts })),
    correlationData: volumeGainData.slice(0, 30),
    rawSets: allSets ?? [],
  });
}
