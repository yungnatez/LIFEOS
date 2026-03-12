import type { WeightLog } from "@/lib/supabase/types";

export type WeightForecastPoint = {
  date: string;       // ISO datetime string
  weight_kg: number;
  forecast: boolean;
};

export type WeightForecastResult = {
  points: WeightForecastPoint[];
  slopeKgPerDay: number;   // rate of change in kg/day (positive = gaining)
  intercept: number;       // regression intercept (weight at t=0)
  t0: number;              // epoch ms of first reading (for evaluating regression)
  rSquared: number;        // 0–1 fit quality
};

export type SavingsForecastPoint = {
  year: string;
  principal: number;
  compound: number;
};

export function calcWeightForecast(logs: WeightLog[]): WeightForecastResult {
  const empty: WeightForecastResult = { points: [], slopeKgPerDay: 0, intercept: 0, t0: 0, rSquared: 0 };
  if (logs.length === 0) return empty;

  const sorted = [...logs].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  const historical: WeightForecastPoint[] = sorted.map((l) => ({
    date: l.logged_at,
    weight_kg: l.weight_kg,
    forecast: false,
  }));

  if (sorted.length < 2) return { ...empty, points: historical };

  // Use days since first reading as x so regression respects real time gaps
  const t0 = new Date(sorted[0].logged_at).getTime();
  const xs = sorted.map((l) => (new Date(l.logged_at).getTime() - t0) / 86400000);
  const ys = sorted.map((l) => l.weight_kg);
  const n = xs.length;

  const sumX  = xs.reduce((a, b) => a + b, 0);
  const sumY  = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { ...empty, points: historical };

  const slope     = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R²
  const yMean = sumY / n;
  const ssTot = ys.reduce((s, y) => s + (y - yMean) ** 2, 0);
  const ssRes = xs.reduce((s, x, i) => s + (ys[i] - (slope * x + intercept)) ** 2, 0);
  const rSquared = ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0;

  // Forecast: weekly points for 13 weeks (≈3 months)
  const lastDate = new Date(sorted[sorted.length - 1].logged_at);
  const lastT    = xs[xs.length - 1];
  const forecastPoints: WeightForecastPoint[] = [];
  for (let weeks = 1; weeks <= 13; weeks++) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + weeks * 7);
    const t = lastT + weeks * 7;
    const weight_kg = Math.round((slope * t + intercept) * 10) / 10;
    forecastPoints.push({ date: d.toISOString(), weight_kg, forecast: true });
  }

  return {
    points: [...historical, ...forecastPoints],
    slopeKgPerDay: slope,
    intercept,
    t0,
    rSquared: Math.round(rSquared * 100) / 100,
  };
}

export function calcSavingsForecast(
  monthlySavingsPence: number,
  currentBalancePence: number,
  apyPct: number,
  years = 10
): SavingsForecastPoint[] {
  const monthly = monthlySavingsPence / 100;
  const current = currentBalancePence / 100;
  const apy = apyPct / 100;
  const currentYear = new Date().getFullYear();

  return Array.from({ length: years }, (_, i) => {
    const y = i + 1;
    const principal = current + monthly * 12 * y;
    const compound  = principal * (Math.pow(1 + apy, y) - 1);
    return {
      year:      String(currentYear + y),
      principal: Math.round(principal),
      compound:  Math.round(compound),
    };
  });
}
