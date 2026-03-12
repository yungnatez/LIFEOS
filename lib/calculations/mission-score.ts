import type { WeightLog, Workout, WorkoutSet, Goal, User } from "@/lib/supabase/types";

// Nate's body composition goal
const BODY_FAT_TARGET_PCT = 15;

export function totalVolumeLastNDays(
  workouts: (Workout & { sets: WorkoutSet[] })[],
  days: number
): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return workouts
    .filter((w) => new Date(w.logged_at) >= cutoff)
    .reduce(
      (sum, w) =>
        sum + w.sets.reduce((s, set) => s + set.weight_kg * set.reps, 0),
      0
    );
}

export function totalVolumeDaysNtoM(
  workouts: (Workout & { sets: WorkoutSet[] })[],
  fromDays: number,
  toDays: number
): number {
  const from = new Date();
  from.setDate(from.getDate() - fromDays);
  const to = new Date();
  to.setDate(to.getDate() - toDays);
  return workouts
    .filter((w) => {
      const d = new Date(w.logged_at);
      return d < from && d >= to;
    })
    .reduce(
      (sum, w) =>
        sum + w.sets.reduce((s, set) => s + set.weight_kg * set.reps, 0),
      0
    );
}

export function calcPhysiqueScore(weightLogs: WeightLog[], user: User): number {
  if (weightLogs.length === 0) return 0;

  const sorted = [...weightLogs].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  // Preferred: body fat % progress toward 15% target
  const logsWithBf = sorted.filter((l) => l.body_fat_pct != null);
  if (logsWithBf.length > 0) {
    const startBf = logsWithBf[0].body_fat_pct!;
    const currentBf = logsWithBf[logsWithBf.length - 1].body_fat_pct!;
    const currentLean = logsWithBf[logsWithBf.length - 1].lean_mass_kg;
    const totalReduction = startBf - BODY_FAT_TARGET_PCT;
    if (totalReduction <= 0) return 100;
    const achieved = startBf - currentBf;
    const score = Math.min(100, Math.max(0, (achieved / totalReduction) * 100));
    console.log(
      `[mission-score] physique_score=${score.toFixed(1)} ` +
        `(bf%=${currentBf.toFixed(1)} start=${startBf.toFixed(1)} target=${BODY_FAT_TARGET_PCT}, ` +
        `lean_mass=${currentLean?.toFixed(2) ?? "N/A"}kg)`
    );
    return score;
  }

  // Fallback: weight-based if no body fat data logged
  const startWeight = sorted[0].weight_kg;
  const currentWeight = sorted[sorted.length - 1].weight_kg;
  const targetWeight = user.weight_goal_kg ?? 80;
  const totalChange = Math.abs(targetWeight - startWeight);
  const achieved = Math.abs(currentWeight - startWeight);
  if (totalChange === 0) return 0;
  const score = Math.min(100, Math.max(0, (achieved / totalChange) * 100));
  console.log(
    `[mission-score] physique_score=${score.toFixed(1)} ` +
      `(weight-based: ${startWeight}→${currentWeight}kg, target=${targetWeight}kg — log body fat for accurate scoring)`
  );
  return score;
}

export function calcStrengthScore(
  workouts: (Workout & { sets: WorkoutSet[] })[]
): number {
  if (workouts.length === 0) {
    console.log("[mission-score] strength_score=50 (no workouts in DB)");
    return 50;
  }

  const recent4wk = totalVolumeLastNDays(workouts, 28);
  const baseline = totalVolumeDaysNtoM(workouts, 28, 56);

  if (baseline > 0) {
    const score = Math.min(100, Math.max(0, (recent4wk / baseline) * 100));
    console.log(
      `[mission-score] strength_score=${score.toFixed(1)} ` +
        `(recent_28d=${Math.round(recent4wk)}kg, baseline_28d=${Math.round(baseline)}kg)`
    );
    return score;
  }

  // No baseline in standard 28-56d window — use oldest 28d of data as baseline
  const sorted = [...workouts].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );
  const oldestDate = new Date(sorted[0].logged_at);
  const baselineCutoff = new Date(oldestDate);
  baselineCutoff.setDate(baselineCutoff.getDate() + 28);
  const baselineVol = sorted
    .filter((w) => new Date(w.logged_at) < baselineCutoff)
    .reduce(
      (sum, w) =>
        sum + w.sets.reduce((s, set) => s + set.weight_kg * set.reps, 0),
      0
    );

  if (baselineVol === 0) {
    console.log("[mission-score] strength_score=50 (insufficient baseline data)");
    return 50;
  }
  const score = Math.min(100, Math.max(0, (recent4wk / baselineVol) * 100));
  console.log(
    `[mission-score] strength_score=${score.toFixed(1)} ` +
      `(recent_28d=${Math.round(recent4wk)}kg, earliest_28d_baseline=${Math.round(baselineVol)}kg)`
  );
  return score;
}

export function calcFinanceScore(goals: Goal[]): number {
  const financeGoals = goals.filter(
    (g) => g.category === "finance" && g.status === "active"
  );
  if (!financeGoals.length) {
    console.log("[mission-score] finance_score=0 (no active finance goals)");
    return 0;
  }
  const avg =
    financeGoals.reduce((s, g) => s + g.progress_pct, 0) / financeGoals.length;
  const score = Math.min(100, avg);
  console.log(
    `[mission-score] finance_score=${score.toFixed(1)} ` +
      `(${financeGoals.map((g) => `${g.title}=${g.progress_pct.toFixed(1)}%`).join(", ")})`
  );
  return score;
}

export function calcMissionScore(
  physique: number,
  strength: number,
  finance: number,
  habits: number
): number {
  const score = Math.round(
    physique * 0.4 + strength * 0.25 + finance * 0.25 + habits * 0.1
  );
  console.log(
    `[mission-score] FINAL=${score} ` +
      `(PHY=${physique.toFixed(1)}×0.4 + STR=${strength.toFixed(1)}×0.25 + ` +
      `FIN=${finance.toFixed(1)}×0.25 + HAB=${habits.toFixed(1)}×0.1)`
  );
  return score;
}

export function bestEstimated1rm(
  sets: (WorkoutSet & { exercise_id: string })[],
  exerciseId: string
): number {
  const exerciseSets = sets.filter((s) => s.exercise_id === exerciseId);
  if (!exerciseSets.length) return 0;
  return Math.max(...exerciseSets.map((s) => s.estimated_1rm_kg ?? 0));
}
