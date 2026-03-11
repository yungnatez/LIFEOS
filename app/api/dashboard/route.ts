import { createClient } from "@/lib/supabase/server";
import type { LiftSummary, HabitDay, FinanceSummary, Goal, WeightLog, Habit, Finance, NutritionLog, SystemState, Alert, User, Exercise } from "@/lib/supabase/types";
import { calcStreaks } from "@/lib/calculations/habit-completion";
import { totalVolumeLastNDays } from "@/lib/calculations/mission-score";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    systemStateRes,
    goalsRes,
    weightLogsRes,
    workoutsRes,
    nutritionRes,
    habitsRes,
    financesRes,
    exercisesRes,
    alertsRes,
    userRes,
  ] = await Promise.all([
    supabase
      .from("system_state")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("priority", { ascending: true }),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(12),
    supabase
      .from("workouts")
      .select("*, sets:workout_sets(*)")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(60),
    supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(1),
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("habit_date", { ascending: false })
      .limit(48),
    supabase
      .from("finances")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(1),
    supabase
      .from("exercises")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .eq("is_primary", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("users").select("*").eq("id", user.id).single(),
  ]);

  type WorkoutRow = { id: string; user_id: string; logged_at: string; total_volume_kg: number; notes: string | null; sets: { weight_kg: number; reps: number; exercise_id: string; estimated_1rm_kg: number | null; id: string; workout_id: string; set_number: number }[] };
  const goals = (goalsRes.data ?? []) as Goal[];
  const weightLogs = (weightLogsRes.data ?? []) as WeightLog[];
  const workouts = (workoutsRes.data ?? []) as WorkoutRow[];
  const habits = (habitsRes.data ?? []) as Habit[];
  const finance = (financesRes.data?.[0] ?? null) as Finance | null;

  // Priority goal (first active, by priority)
  const priorityGoal = goals.find((g) => g.status === "active") ?? null;
  const priorityGoalWithMeta = priorityGoal
    ? {
        ...priorityGoal,
        daysRemaining: Math.max(
          0,
          Math.ceil(
            (new Date(priorityGoal.target_date).getTime() - Date.now()) /
              86400000
          )
        ),
        onTrack: priorityGoal.on_track,
      }
    : null;

  // Primary lifts with best sets
  const primaryLifts: LiftSummary[] = ((exercisesRes.data ?? []) as Exercise[]).map((ex) => {
    const allSets = workouts.flatMap((w) =>
      w.sets.filter((s) => s.exercise_id === ex.id)
    );
    const bestSet = allSets.reduce(
      (best, s) =>
        (s.estimated_1rm_kg ?? 0) > (best?.estimated_1rm_kg ?? 0) ? s : best,
      allSets[0]
    );
    const recentSets = allSets.slice(0, 3);
    const recentVol = recentSets.reduce(
      (s, set) => s + set.weight_kg * set.reps,
      0
    );
    const olderSets = allSets.slice(3, 6);
    const olderVol = olderSets.reduce(
      (s, set) => s + set.weight_kg * set.reps,
      0
    );
    const progress_pct =
      olderVol > 0 ? Math.min(100, (recentVol / olderVol) * 100) : 50;

    return {
      exercise_id: ex.id,
      name: ex.name,
      best_set: bestSet
        ? `${bestSet.weight_kg} × ${bestSet.reps}`
        : "No sets yet",
      estimated_1rm_kg: bestSet?.estimated_1rm_kg ?? 0,
      progress_pct,
    };
  });

  // Habit heatmap
  const habitHeatmap: HabitDay[] = habits.map((h) => ({
    date: h.habit_date,
    completion_status: h.completion_status,
  }));

  // Streaks
  const rawStreaks = calcStreaks(habits);
  const sleepAvg =
    habits.slice(0, 7).reduce((s, h) => s + (h.sleep_hours ?? 0), 0) /
    Math.max(habits.slice(0, 7).length, 1);
  const sleepH = Math.floor(sleepAvg);
  const sleepM = Math.round((sleepAvg - sleepH) * 60);
  const streaks = {
    gym: rawStreaks.gym,
    sleep: `${sleepH}h ${String(sleepM).padStart(2, "0")}m`,
    meditation: rawStreaks.meditation,
  };

  // Finance summary
  const finances: FinanceSummary | null = finance
    ? {
        turbo_fund_pence: finance.turbo_fund_pence,
        safety_buffer_pence: finance.safety_buffer_pence,
        investment_pence: finance.investment_pence,
        savings_rate_pct: finance.savings_rate_pct,
        monthly_income_pence: finance.monthly_income_pence,
        monthly_expenses_pence: finance.monthly_expenses_pence,
      }
    : null;

  // Total volume this week
  const totalVolumeWeek = totalVolumeLastNDays(workouts, 7);

  // Projected SBD (sum of best 1RMs for primary lifts)
  const projectedSBD = primaryLifts.reduce(
    (s, l) => s + (l.estimated_1rm_kg ?? 0),
    0
  );

  const todaySteps = habits[0]?.steps ?? 0;

  return Response.json({
    systemState: systemStateRes.data as SystemState | null,
    priorityGoal: priorityGoalWithMeta,
    recentWeights: weightLogs,
    latestWeight: weightLogs[0] ?? null,
    primaryLifts,
    totalVolumeWeek: Math.round(totalVolumeWeek),
    projectedSBD: Math.round(projectedSBD),
    latestNutrition: (nutritionRes.data?.[0] ?? null) as NutritionLog | null,
    habitHeatmap,
    streaks,
    todaySteps,
    finances,
    financialGoals: goals.filter((g) => g.category === "finance"),
    allGoals: goals,
    unreadAlerts: (alertsRes.data ?? []) as Alert[],
    userData: userRes.data as User | null,
  });
}
