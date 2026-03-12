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
  const allExercises = (exercisesRes.data ?? []) as Exercise[];
  const primaryExercises = allExercises.filter((e) => e.is_primary);

  const primaryLifts: LiftSummary[] = primaryExercises.map((ex) => {
    let allSets = workouts.flatMap((w) =>
      w.sets.filter((s) => s.exercise_id === ex.id)
    );

    // Fuzzy fallback: strip parentheticals, match on meaningful tokens
    if (allSets.length === 0) {
      const nameTokens = ex.name
        .toLowerCase()
        .replace(/\s*\(.*?\)/g, "")
        .split(/\s+/)
        .filter((t) => t.length >= 3);
      const fuzzyMatch = allExercises.find(
        (other) =>
          other.id !== ex.id &&
          nameTokens.length > 0 &&
          nameTokens.every((token) => other.name.toLowerCase().includes(token))
      );
      if (fuzzyMatch) {
        allSets = workouts.flatMap((w) =>
          w.sets.filter((s) => s.exercise_id === fuzzyMatch.id)
        );
      }
    }
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

  const todayStr = new Date().toISOString().slice(0, 10);

  // Steps: only count today's entry — if today hasn't synced yet, return 0
  const todayHabit = habits.find((h) => h.habit_date === todayStr);
  const todaySteps = todayHabit?.steps ?? 0;

  // Nutrition: only show today's entry — if not logged yet, show empty state
  const latestNutritionRow = (nutritionRes.data?.[0] ?? null) as NutritionLog | null;
  const todayNutrition =
    latestNutritionRow?.log_date === todayStr ? latestNutritionRow : null;

  // Projected freedom year: months until savings reach 25× annual expenses (4% rule)
  const userData = userRes.data as User | null;
  const apyPct = (userData?.savings_apy_pct as number | null) ?? 7;
  const monthlyRate = apyPct / 100 / 12;
  let projectedFreedomYear = "—";
  if (finance?.monthly_expenses_pence && finance.monthly_expenses_pence > 0) {
    const fiTargetPence = finance.monthly_expenses_pence * 12 * 25;
    const currentBalancePence =
      (finance.turbo_fund_pence ?? 0) +
      (finance.safety_buffer_pence ?? 0) +
      (finance.investment_pence ?? 0);
    const monthlySavingsPence = Math.max(
      0,
      (finance.monthly_income_pence ?? 0) - finance.monthly_expenses_pence
    );
    if (currentBalancePence >= fiTargetPence) {
      projectedFreedomYear = "NOW";
    } else if (monthlySavingsPence > 0) {
      const now = new Date();
      let balance = currentBalancePence;
      const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
      for (let m = 1; m <= 480; m++) {
        balance = balance * (1 + monthlyRate) + monthlySavingsPence;
        if (balance >= fiTargetPence) {
          const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
          projectedFreedomYear = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
          break;
        }
      }
    }
  }

  return Response.json({
    systemState: systemStateRes.data as SystemState | null,
    priorityGoal: priorityGoalWithMeta,
    recentWeights: weightLogs,
    latestWeight: weightLogs[0] ?? null,
    primaryLifts,
    totalVolumeWeek: Math.round(totalVolumeWeek),
    projectedSBD: Math.round(projectedSBD),
    latestNutrition: todayNutrition,
    habitHeatmap,
    streaks,
    todaySteps,
    finances,
    financialGoals: goals.filter((g) => g.category === "finance"),
    allGoals: goals,
    unreadAlerts: (alertsRes.data ?? []) as Alert[],
    userData,
    projectedFreedomYear,
  });
}
