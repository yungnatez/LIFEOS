import type { Habit, Finance, Goal, Workout, WorkoutSet } from "@/lib/supabase/types";
import { totalVolumeLastNDays, totalVolumeDaysNtoM } from "./mission-score";
import { isWithinLastNDays } from "./habit-completion";

export interface AlertCandidate {
  type: "warning" | "info" | "success" | "danger";
  title: string;
  message: string;
}

export function checkAlertConditions(data: {
  weightLogs: { weight_kg: number; logged_at: string }[];
  workouts: (Workout & { sets: WorkoutSet[] })[];
  habits: Habit[];
  finances: Finance[];
  goals: Goal[];
  habitScore: number;
}): AlertCandidate[] {
  const alerts: AlertCandidate[] = [];

  // 1. Muscle loss risk
  if (data.weightLogs.length >= 2) {
    const sorted = [...data.weightLogs].sort(
      (a, b) =>
        new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    );
    const [latest, previous] = sorted;
    const lossKg = previous.weight_kg - latest.weight_kg;
    const lossPct = (lossKg / previous.weight_kg) * 100;
    const thisWeekVol = totalVolumeLastNDays(data.workouts, 7);
    const lastWeekVol = totalVolumeDaysNtoM(data.workouts, 7, 14);
    if (lossPct > 1.0 && thisWeekVol < lastWeekVol) {
      alerts.push({
        type: "danger",
        title: "Muscle Loss Risk",
        message: `Weight loss ${lossPct.toFixed(1)}% this week with declining training volume. Increase protein and reduce caloric deficit.`,
      });
    }
  }

  // 2. Savings warning
  if (data.finances.length >= 2) {
    const [f1, f2] = data.finances;
    const targetRate = 62;
    if (
      (f1.savings_rate_pct ?? 100) < targetRate &&
      (f2.savings_rate_pct ?? 100) < targetRate
    ) {
      alerts.push({
        type: "warning",
        title: "Savings Rate Falling",
        message:
          "Savings rate below target for 2 consecutive entries. Review your expenses.",
      });
    }
  }

  // 3. Habit consistency
  const last7 = data.habits.filter((h) =>
    isWithinLastNDays(h.habit_date, 7)
  );
  const weekScore =
    last7.length > 0
      ? (last7.filter((h) => h.completion_status === "full").length /
          Math.max(last7.length, 7)) *
        100
      : 0;
  if (data.habits.length > 0 && weekScore < 70) {
    alerts.push({
      type: "warning",
      title: "Consistency Dropping",
      message: `Habit completion at ${Math.round(weekScore)}% this week. Refocus on core habits.`,
    });
  }

  // 4. Milestone approaching
  for (const goal of data.goals.filter((g) => g.status === "active")) {
    const days = Math.ceil(
      (new Date(goal.target_date).getTime() - Date.now()) / 86400000
    );
    if (days <= 14 && days >= 0) {
      alerts.push({
        type: "info",
        title: "Milestone Approaching",
        message: `${goal.title}: ${days} days remaining. Progress: ${goal.progress_pct.toFixed(0)}%.`,
      });
    }
  }

  // 5. Goal complete
  for (const goal of data.goals.filter((g) => g.status === "complete")) {
    alerts.push({
      type: "success",
      title: `Goal Achieved: ${goal.title}`,
      message:
        "Congratulations. Update your targets to maintain momentum.",
    });
  }

  return alerts;
}
