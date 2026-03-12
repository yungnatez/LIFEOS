import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeightLog, Workout, WorkoutSet, Goal, Habit, User, SystemState } from "@/lib/supabase/types";
import {
  calcPhysiqueScore,
  calcStrengthScore,
  calcFinanceScore,
  calcMissionScore,
} from "./mission-score";
import { calcHabitScore } from "./habit-completion";

/**
 * Fetches all scoring data for a user, recalculates every pillar score,
 * and writes the result back to system_state.
 * Call this after any log operation to keep the dashboard live.
 */
export async function recalcAndPersistScores(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  type WorkoutRow = Workout & { sets: WorkoutSet[] };

  const [weightRes, workoutsRes, goalsRes, habitsRes, userRes, ssRes] =
    await Promise.all([
      supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", userId)
        .order("logged_at", { ascending: false })
        .limit(60),
      supabase
        .from("workouts")
        .select("*, sets:workout_sets(*)")
        .eq("user_id", userId)
        .order("logged_at", { ascending: false })
        .limit(60),
      supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId),
      supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .order("habit_date", { ascending: false })
        .limit(30),
      supabase.from("users").select("*").eq("id", userId).single(),
      supabase.from("system_state").select("*").eq("user_id", userId).single(),
    ]);

  const weightLogs = (weightRes.data   ?? []) as WeightLog[];
  const workouts   = (workoutsRes.data ?? []) as WorkoutRow[];
  const goals      = (goalsRes.data    ?? []) as Goal[];
  const habits     = (habitsRes.data   ?? []) as Habit[];
  const userData   = userRes.data as User | null;
  const ss         = ssRes.data as SystemState | null;

  if (!userData || !ss) return;

  const physique_score = calcPhysiqueScore(weightLogs, userData);
  const strength_score = calcStrengthScore(workouts);
  const finance_score  = calcFinanceScore(goals);
  const habit_score    = calcHabitScore(habits);
  const mission_score  = calcMissionScore(
    physique_score,
    strength_score,
    finance_score,
    habit_score
  );

  await supabase
    .from("system_state")
    .update({
      physique_score,
      strength_score,
      finance_score,
      habit_score,
      mission_score,
      last_updated: new Date().toISOString(),
    } as never)
    .eq("user_id", userId);
}
