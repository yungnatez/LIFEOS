import type { BriefInput, BriefOutput } from "@/lib/supabase/types";
import { totalVolumeLastNDays, totalVolumeDaysNtoM } from "./mission-score";

export function generateCommanderBrief(data: BriefInput): BriefOutput {
  // Weight trend
  const w = [...data.weightLogs].sort(
    (a, b) =>
      new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );
  const weightDelta =
    w.length >= 2 ? w[0].weight_kg - w[1].weight_kg : 0;
  const weightTrend =
    weightDelta > 0.1 ? "upward" : weightDelta < -0.1 ? "downward" : "stable";

  // Strength trend
  const thisWeek = totalVolumeLastNDays(data.workouts, 7);
  const lastWeek = totalVolumeDaysNtoM(data.workouts, 7, 14);
  const strengthPct =
    lastWeek > 0
      ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
      : 0;
  const strengthDir =
    strengthPct >= 0 ? `up ${strengthPct}%` : `down ${Math.abs(strengthPct)}%`;

  // Savings status
  const finance = data.finances[0];
  const savingsTarget = data.user.monthly_savings_target_pence;
  const monthlySurplus = finance
    ? (finance.monthly_income_pence ?? 0) -
      (finance.monthly_expenses_pence ?? 0)
    : 0;
  const savingsAhead = monthlySurplus >= savingsTarget;

  // Nearest goal
  const nearest = data.goals
    .filter((g) => g.status === "active")
    .sort(
      (a, b) =>
        new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    )[0];
  const daysLeft = nearest
    ? Math.ceil(
        (new Date(nearest.target_date).getTime() - Date.now()) / 86400000
      )
    : null;

  const milestone =
    daysLeft !== null && daysLeft <= 30
      ? `${daysLeft} days to ${nearest.title}.`
      : "Your trajectory is optimal.";

  const brief =
    `Body mass trending ${weightTrend}. Strength volume ${strengthDir}. ` +
    `Savings ${savingsAhead ? "ahead of" : "behind"} schedule. ${milestone}`;

  const allGood = data.habitScore >= 80 && savingsAhead && strengthPct >= 0;
  const status = allGood ? "NOMINAL" : "MONITOR";
  const efficiency = Math.round(
    (data.habitScore +
      (savingsAhead ? 100 : 65) +
      Math.max(0, 80 + strengthPct)) /
      3
  );

  return { brief, status, efficiency };
}
