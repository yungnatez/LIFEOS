import type { WeightLog } from "@/lib/supabase/types";

export type WeightForecastPoint = {
  month: string;
  weight: number;
  forecast?: boolean;
};

export type SavingsForecastPoint = {
  year: string;
  principal: number;
  compound: number;
};

export function calcWeightForecast(logs: WeightLog[]): WeightForecastPoint[] {
  if (logs.length === 0) return [];

  const sorted = [...logs].sort(
    (a, b) =>
      new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  const historical: WeightForecastPoint[] = sorted.map((l) => ({
    month: new Date(l.logged_at)
      .toLocaleString("en-GB", { month: "short" })
      .toUpperCase(),
    weight: l.weight_kg,
    forecast: false,
  }));

  if (logs.length < 2) return historical;

  // Linear regression (least squares)
  const n = sorted.length;
  const xs = sorted.map((_, i) => i);
  const ys = sorted.map((l) => l.weight_kg);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return historical;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const lastDate = new Date(sorted[sorted.length - 1].logged_at);
  const forecast: WeightForecastPoint[] = [];
  for (let i = 1; i <= 3; i++) {
    const date = new Date(lastDate);
    date.setMonth(date.getMonth() + i);
    const weight =
      Math.round((intercept + slope * (n - 1 + i)) * 10) / 10;
    forecast.push({
      month: date.toLocaleString("en-GB", { month: "short" }).toUpperCase(),
      weight,
      forecast: true,
    });
  }

  return [...historical, ...forecast];
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
    const compound = principal * (Math.pow(1 + apy, y) - 1);
    return {
      year: String(currentYear + y),
      principal: Math.round(principal),
      compound: Math.round(compound),
    };
  });
}
