import { createClient } from "@/lib/supabase/server";
import { calcWeightForecast } from "@/lib/calculations/forecasts";
import type { WeightLog, Goal, User } from "@/lib/supabase/types";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [weightRes, nutritionRes, goalsRes, userRes] = await Promise.all([
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: true })
      .limit(90),
    supabase
      .from("nutrition_logs")
      .select("calories, protein_g, log_date")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(14),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("category", "physique")
      .eq("status", "active")
      .order("priority", { ascending: true })
      .limit(1),
    supabase.from("users").select("*").eq("id", user.id).single(),
  ]);

  const weightLogs  = (weightRes.data   ?? []) as WeightLog[];
  const nutritionLogs = (nutritionRes.data ?? []) as { calories: number; protein_g: number | null; log_date: string }[];
  const physiqueGoal  = ((goalsRes.data ?? []) as Goal[])[0] ?? null;
  const userData      = userRes.data as User | null;

  const { points, slopeKgPerDay, rSquared } = calcWeightForecast(weightLogs);

  // ── Current values ────────────────────────────────────────────────────────
  const sortedDesc = [...weightLogs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );
  const currentWeight  = sortedDesc[0]?.weight_kg ?? null;
  const startWeight    = weightLogs[0]?.weight_kg ?? null;
  const currentBodyFat = sortedDesc.find((l) => l.body_fat_pct != null)?.body_fat_pct ?? null;

  const slopeKgPerWeek = Math.round(slopeKgPerDay * 7 * 100) / 100;

  // ── Target + projection ───────────────────────────────────────────────────
  const targetWeight  = physiqueGoal?.target_value ?? userData?.weight_goal_kg ?? null;
  const targetDate    = physiqueGoal?.target_date   ?? null;

  let projectedTargetDate: string | null = null;
  if (
    targetWeight !== null &&
    currentWeight !== null &&
    slopeKgPerDay !== 0
  ) {
    const daysToTarget = (targetWeight - currentWeight) / slopeKgPerDay;
    if (daysToTarget > 0 && daysToTarget < 365 * 3) {
      const proj = new Date(sortedDesc[0].logged_at);
      proj.setDate(proj.getDate() + Math.round(daysToTarget));
      projectedTargetDate = proj.toISOString().slice(0, 10);
    }
  }

  const onTrack: boolean | null =
    targetDate && projectedTargetDate
      ? new Date(projectedTargetDate) <= new Date(targetDate)
      : null;

  // ── Nutrition averages ────────────────────────────────────────────────────
  const avgCalories =
    nutritionLogs.length > 0
      ? Math.round(
          nutritionLogs.reduce((s, n) => s + n.calories, 0) / nutritionLogs.length
        )
      : null;
  const proteinLogs = nutritionLogs.filter((n) => n.protein_g != null);
  const avgProtein =
    proteinLogs.length > 0
      ? Math.round(
          proteinLogs.reduce((s, n) => s + (n.protein_g ?? 0), 0) / proteinLogs.length
        )
      : null;

  // ── Model variables ───────────────────────────────────────────────────────
  const calorieTarget  = userData?.calorie_target   ?? 3000;
  const proteinTarget  = userData?.protein_target_g ?? 210;

  // Goal progress % (how far from start → target)
  const goalProgressPct =
    targetWeight !== null && startWeight !== null
      ? Math.min(
          100,
          Math.max(
            0,
            ((( currentWeight ?? startWeight) - startWeight) /
              (targetWeight - startWeight)) *
              100
          )
        )
      : 0;

  // Needed rate to hit goal by target date
  let neededKgPerWeek: number | null = null;
  if (targetWeight !== null && currentWeight !== null && targetDate) {
    const daysLeft = (new Date(targetDate).getTime() - Date.now()) / 86400000;
    if (daysLeft > 0) {
      neededKgPerWeek = Math.round(((targetWeight - currentWeight) / daysLeft) * 7 * 100) / 100;
    }
  }
  const rateProgressPct =
    neededKgPerWeek && neededKgPerWeek > 0
      ? Math.min(100, Math.max(0, (slopeKgPerWeek / neededKgPerWeek) * 100))
      : slopeKgPerWeek > 0
      ? 60
      : 20;

  const calorieAdherencePct =
    avgCalories !== null ? Math.min(100, Math.round((avgCalories / calorieTarget) * 100)) : 0;
  const proteinAdherencePct =
    avgProtein !== null ? Math.min(100, Math.round((avgProtein / proteinTarget) * 100)) : 0;

  const modelVars = [
    {
      name:  "Goal Progress",
      val:   targetWeight !== null && currentWeight !== null
               ? `${currentWeight.toFixed(1)}kg → ${targetWeight}kg`
               : "—",
      pct:   Math.round(goalProgressPct),
      color: "#14b8a6",
    },
    {
      name:  "Weekly Rate",
      val:   `${slopeKgPerWeek >= 0 ? "+" : ""}${slopeKgPerWeek} kg/wk`,
      pct:   Math.min(100, Math.round(rateProgressPct)),
      color: "#3b86f7",
    },
    {
      name:  "Calorie Adherence",
      val:   avgCalories !== null ? `${avgCalories.toLocaleString()} kcal avg` : `${calorieTarget.toLocaleString()} kcal target`,
      pct:   calorieAdherencePct,
      color: "#f59e0b",
    },
    {
      name:  "Protein Adherence",
      val:   avgProtein !== null ? `${avgProtein}g avg` : `${proteinTarget}g target`,
      pct:   proteinAdherencePct,
      color: "#10b981",
    },
  ];

  // ── Insight text ──────────────────────────────────────────────────────────
  let insight = "";
  if (projectedTargetDate && targetWeight !== null) {
    const projFormatted = new Date(projectedTargetDate).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
    if (onTrack === true) {
      insight = `On track to reach ${targetWeight}kg by ${projFormatted} at current rate of ${slopeKgPerWeek >= 0 ? "+" : ""}${slopeKgPerWeek}kg/wk.`;
    } else if (onTrack === false) {
      insight = `Projected to reach ${targetWeight}kg by ${projFormatted} — behind target date. Increase training frequency and caloric surplus.`;
    } else {
      insight = `Trending toward ${targetWeight}kg — projected arrival ${projFormatted}.`;
    }
  } else if (slopeKgPerWeek !== 0) {
    insight = `Currently ${slopeKgPerWeek >= 0 ? "gaining" : "losing"} ${Math.abs(slopeKgPerWeek)}kg/wk on average.`;
  }

  return Response.json({
    forecast: points,
    stats: {
      slopeKgPerWeek,
      rSquared,
      currentWeight,
      currentBodyFat,
      targetWeight,
      targetDate,
      projectedTargetDate,
      onTrack,
      avgCalories,
      avgProtein,
    },
    modelVars,
    insight,
    user: userData,
  });
}
