import type { BriefInput, BriefOutput } from "@/lib/supabase/types";
import { totalVolumeLastNDays, totalVolumeDaysNtoM } from "./mission-score";

const BODY_FAT_TARGET = 15;           // Nate's leanness goal
const BODY_FAT_START_ESTIMATE = 28.5; // approximate starting point for efficiency calc

export function generateCommanderBrief(data: BriefInput): BriefOutput {
  // Sort weight logs newest first
  const w = [...data.weightLogs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );

  // Body composition — use readings that have bf% data
  const logsWithBf = w.filter((l) => l.body_fat_pct != null);
  const currentBf   = logsWithBf[0]?.body_fat_pct ?? null;
  const prevBf      = logsWithBf[1]?.body_fat_pct ?? null;
  const currentLean = logsWithBf[0]?.lean_mass_kg ?? null;
  const prevLean    = logsWithBf[1]?.lean_mass_kg ?? null;
  const bfDelta     = currentBf != null && prevBf != null ? currentBf - prevBf : null;
  const leanDelta   = currentLean != null && prevLean != null ? currentLean - prevLean : null;

  // Strength — workouts in last 7 days
  const cutoff7 = new Date();
  cutoff7.setDate(cutoff7.getDate() - 7);
  const workoutsThisWeek = data.workouts.filter(
    (wo) => new Date(wo.logged_at) >= cutoff7
  ).length;
  const sortedWorkouts = [...data.workouts].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );
  const daysSinceWorkout =
    sortedWorkouts.length > 0
      ? Math.floor(
          (Date.now() - new Date(sortedWorkouts[0].logged_at).getTime()) / 86400000
        )
      : 99;
  const thisWeekVol = totalVolumeLastNDays(data.workouts, 7);
  const lastWeekVol = totalVolumeDaysNtoM(data.workouts, 7, 14);
  const volChangePct =
    lastWeekVol > 0
      ? Math.round(((thisWeekVol - lastWeekVol) / lastWeekVol) * 100)
      : null;

  // Finance
  const finance = data.finances[0];
  const savingsTarget = data.user.monthly_savings_target_pence;
  const monthlySurplus = finance
    ? (finance.monthly_income_pence ?? 0) - (finance.monthly_expenses_pence ?? 0)
    : 0;
  const savingsAhead = savingsTarget > 0 ? monthlySurplus >= savingsTarget : null;

  // ── Build brief (2-3 sentences max) ────────────────────────────────────────
  const lines: string[] = [];

  // Sentence 1: Body composition
  if (currentBf != null && bfDelta != null) {
    const bfStr =
      bfDelta < -0.1
        ? `BF down ${Math.abs(bfDelta).toFixed(1)}% to ${currentBf.toFixed(1)}%`
        : bfDelta > 0.1
        ? `BF up ${bfDelta.toFixed(1)}% to ${currentBf.toFixed(1)}% — cut not executing`
        : `BF unchanged at ${currentBf.toFixed(1)}%`;
    const leanStr =
      leanDelta != null
        ? leanDelta < -0.3
          ? `, lean mass DROPPING (${leanDelta.toFixed(1)}kg) — increase protein`
          : leanDelta > 0.1
          ? `, lean mass up ${leanDelta.toFixed(1)}kg`
          : ", lean mass stable"
        : currentLean != null
        ? `, lean ${currentLean.toFixed(1)}kg`
        : "";
    lines.push(`${bfStr}${leanStr}.`);
  } else if (currentBf != null) {
    const gap = (currentBf - BODY_FAT_TARGET).toFixed(1);
    lines.push(
      `BF at ${currentBf.toFixed(1)}% — ${gap}pp to target. Log second reading to trend.`
    );
  } else {
    // No bf data — fall back to weight direction
    const weightDelta = w.length >= 2 ? w[0].weight_kg - w[1].weight_kg : 0;
    const wStr =
      weightDelta > 0.2
        ? `Body mass up ${weightDelta.toFixed(1)}kg — watch deficit`
        : weightDelta < -0.2
        ? `Body mass down ${Math.abs(weightDelta).toFixed(1)}kg`
        : "Body mass stable";
    lines.push(`${wStr}. Log body fat % to enable composition tracking.`);
  }

  // Sentence 2: Strength
  if (daysSinceWorkout >= 7) {
    lines.push(
      `${daysSinceWorkout} days since last session — muscle loss risk elevated. Get a session in today.`
    );
  } else if (workoutsThisWeek === 0) {
    lines.push("No session logged yet this week.");
  } else if (volChangePct !== null) {
    const volStr =
      volChangePct >= 0
        ? `volume up ${volChangePct}% vs last week`
        : `volume down ${Math.abs(volChangePct)}% vs last week`;
    lines.push(
      `${workoutsThisWeek} session${workoutsThisWeek > 1 ? "s" : ""} this week, ${volStr}.`
    );
  } else {
    lines.push(
      `${workoutsThisWeek} session${workoutsThisWeek > 1 ? "s" : ""} logged this week.`
    );
  }

  // Sentence 3: Finance (only if behind)
  if (savingsAhead === false) {
    lines.push("Savings behind target — review monthly expenses.");
  }

  const brief = lines.join(" ");

  // ── Verdict ─────────────────────────────────────────────────────────────────
  const bfTrendingDown = bfDelta != null ? bfDelta < 0 : null;
  const leanStable     = leanDelta != null ? leanDelta >= -0.3 : true;
  const hasWorkout     = workoutsThisWeek > 0;

  let status: string;
  if (
    daysSinceWorkout >= 7 ||
    (bfDelta !== null && bfDelta > 0.5) ||
    (leanDelta !== null && leanDelta < -0.5)
  ) {
    status = "INTERVENE";
  } else if (bfTrendingDown === true && leanStable && hasWorkout) {
    status = "NOMINAL";
  } else {
    status = "MONITOR";
  }

  // ── Efficiency ──────────────────────────────────────────────────────────────
  const bfProgress =
    currentBf != null
      ? Math.max(
          0,
          Math.min(
            100,
            ((BODY_FAT_START_ESTIMATE - currentBf) /
              (BODY_FAT_START_ESTIMATE - BODY_FAT_TARGET)) *
              100
          )
        )
      : 50;
  const strengthEff =
    lastWeekVol > 0
      ? Math.min(100, Math.max(0, (thisWeekVol / lastWeekVol) * 100))
      : hasWorkout
      ? 70
      : 30;
  const financeEff =
    savingsAhead === true ? 100 : savingsAhead === false ? 55 : 70;
  const efficiency = Math.round(
    bfProgress * 0.4 +
      strengthEff * 0.25 +
      financeEff * 0.25 +
      data.habitScore * 0.1
  );

  return { brief, status, efficiency };
}
