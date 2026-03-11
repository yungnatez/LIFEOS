import type { WeightLog, Workout, WorkoutSet, Goal, User } from "@/lib/supabase/types";

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
    (a, b) =>
      new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );
  const startWeight = sorted[0].weight_kg;
  const currentWeight = sorted[sorted.length - 1].weight_kg;
  const targetWeight = user.weight_goal_kg ?? 80;
  const totalChange = Math.abs(targetWeight - startWeight);
  const achieved = Math.abs(currentWeight - startWeight);
  if (totalChange === 0) return 0;
  return Math.min(100, Math.max(0, (achieved / totalChange) * 100));
}

export function calcStrengthScore(
  workouts: (Workout & { sets: WorkoutSet[] })[]
): number {
  if (workouts.length === 0) return 50;
  const recent4wk = totalVolumeLastNDays(workouts, 28);
  const baseline = totalVolumeDaysNtoM(workouts, 28, 56);
  if (baseline === 0) return 50;
  return Math.min(100, Math.max(0, (recent4wk / baseline) * 100));
}

export function calcFinanceScore(goals: Goal[]): number {
  const financeGoals = goals.filter(
    (g) => g.category === "finance" && g.status === "active"
  );
  if (!financeGoals.length) return 0;
  const avg =
    financeGoals.reduce((s, g) => s + g.progress_pct, 0) / financeGoals.length;
  return Math.min(100, avg);
}

export function calcMissionScore(
  physique: number,
  strength: number,
  finance: number,
  habits: number
): number {
  return Math.round(
    physique * 0.4 + strength * 0.25 + finance * 0.25 + habits * 0.1
  );
}

export function bestEstimated1rm(
  sets: (WorkoutSet & { exercise_id: string })[],
  exerciseId: string
): number {
  const exerciseSets = sets.filter((s) => s.exercise_id === exerciseId);
  if (!exerciseSets.length) return 0;
  return Math.max(
    ...exerciseSets.map((s) => s.estimated_1rm_kg ?? 0)
  );
}
