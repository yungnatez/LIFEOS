import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { calcCompletionStatus } from "@/lib/calculations/habit-completion";
import type { User, Habit } from "@/lib/supabase/types";

interface HealthEntry {
  date: string;
  qty: number;
  // Health Auto Export v2 may also send these
  source?: string;
  min?: number;
  max?: number;
}

interface HealthMetric {
  name: string;
  units: string;
  data: HealthEntry[];
}

// Health Auto Export v2 top-level shape variants
interface HealthPayloadWrapped {
  data: {
    metrics: HealthMetric[];
  };
}
interface HealthPayloadFlat {
  metrics: HealthMetric[];
}
type HealthPayload = HealthPayloadWrapped | HealthPayloadFlat | HealthMetric[];

function toDateStr(dateStr: string): string {
  return dateStr.slice(0, 10);
}

function extractMetrics(body: HealthPayload): HealthMetric[] | null {
  if (Array.isArray(body)) {
    return body;
  }
  if ("data" in body && body.data && Array.isArray((body as HealthPayloadWrapped).data.metrics)) {
    return (body as HealthPayloadWrapped).data.metrics;
  }
  if ("metrics" in body && Array.isArray((body as HealthPayloadFlat).metrics)) {
    return (body as HealthPayloadFlat).metrics;
  }
  return null;
}

// Sum all qty values for a given date across all entries in a metric
function sumByDate(metric: HealthMetric): Map<string, number> {
  const totals = new Map<string, number>();
  for (const entry of metric.data) {
    const d = toDateStr(entry.date);
    totals.set(d, (totals.get(d) ?? 0) + entry.qty);
  }
  return totals;
}

// Return the highest qty value for a given date (for sleep — take best/last reading)
function maxByDate(metric: HealthMetric): Map<string, number> {
  const bests = new Map<string, number>();
  for (const entry of metric.data) {
    const d = toDateStr(entry.date);
    const current = bests.get(d) ?? 0;
    if (entry.qty > current) bests.set(d, entry.qty);
  }
  return bests;
}

export async function GET() {
  return Response.json({
    status: "ok",
    env_check: !!process.env.HEALTH_SYNC_SECRET,
    supported_metrics: [
      "body_mass", "weight_body_mass", "HKQuantityTypeIdentifierBodyMass",
      "body_fat_percentage", "body_fat_percent", "bodyFatPercentage",
      "dietary_energy_consumed", "dietaryEnergyConsumed",
      "dietary_protein", "dietaryProtein",
      "dietary_carbohydrates", "dietaryCarbohydrates",
      "dietary_fat_total", "dietaryFatTotal",
      "step_count", "stepCount", "HKQuantityTypeIdentifierStepCount",
      "sleep_analysis", "sleepAnalysis", "HKCategoryTypeIdentifierSleepAnalysis",
    ],
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  console.log("[health-sync] POST received at", new Date().toISOString());

  let rawBody: HealthPayload;
  try {
    rawBody = await req.json();
  } catch (e) {
    console.log("[health-sync] JSON parse error:", e);
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[health-sync] raw body:", JSON.stringify(rawBody));

  // Log the top-level shape so we can see the actual structure
  console.log("[health-sync] Payload top-level keys:", Object.keys(rawBody as object));
  if ("data" in (rawBody as object)) {
    const d = (rawBody as HealthPayloadWrapped).data;
    console.log("[health-sync] body.data keys:", d ? Object.keys(d) : "null");
  }

  const metrics = extractMetrics(rawBody);
  if (!metrics) {
    console.log("[health-sync] Could not extract metrics array. Raw payload:", JSON.stringify(rawBody).slice(0, 500));
    return Response.json({ error: "Invalid payload: cannot find metrics array" }, { status: 400 });
  }

  console.log("[health-sync] Metric count:", metrics.length);
  console.log("[health-sync] Metric names:", metrics.map((m) => m.name));
  for (const m of metrics) {
    console.log(`[health-sync] metric="${m.name}" units="${m.units}" entries=${m.data?.length ?? 0}`);
    if (m.data?.length > 0) {
      console.log(`[health-sync]   first entry:`, JSON.stringify(m.data[0]));
      console.log(`[health-sync]   last entry:`, JSON.stringify(m.data[m.data.length - 1]));
    }
  }

  const supabase = createServiceClient();

  const { data: usersRaw, error: userErr } = await supabase
    .from("users")
    .select("id, calorie_target")
    .limit(1);
  if (userErr) {
    console.log("[health-sync] User fetch error:", userErr.message);
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
  const users = (usersRaw ?? []) as Pick<User, "id" | "calorie_target">[];
  if (!users.length) {
    console.log("[health-sync] No user found in DB");
    return Response.json({ error: "No user found" }, { status: 500 });
  }
  const { id: userId, calorie_target } = users[0];
  console.log("[health-sync] User found:", userId, "calorie_target:", calorie_target);

  const byName = new Map<string, HealthMetric>();
  for (const m of metrics) {
    byName.set(m.name, m);
  }

  const imported = { steps: 0, weights: 0, body_fat: 0, nutrition: 0, sleep: 0 };
  const errors: string[] = [];

  // --- WEIGHTS ---
  const bodyMass =
    byName.get("body_mass") ??
    byName.get("weight_body_mass") ??
    byName.get("HKQuantityTypeIdentifierBodyMass");
  console.log("[health-sync] body_mass metric found:", !!bodyMass, "entries:", bodyMass?.data?.length ?? 0);

  if (bodyMass) {
    for (const entry of bodyMass.data) {
      const timestamp = new Date(entry.date).toISOString();
      const fourHoursMs = 4 * 60 * 60 * 1000;
      const afterTime = new Date(new Date(entry.date).getTime() - fourHoursMs).toISOString();
      const beforeTime = new Date(new Date(entry.date).getTime() + fourHoursMs).toISOString();

      const { data: existingRaw } = await supabase
        .from("weight_logs")
        .select("id")
        .eq("user_id", userId)
        .gte("logged_at", afterTime)
        .lte("logged_at", beforeTime)
        .limit(1);
      const existing = (existingRaw ?? []) as { id: string }[];
      if (existing.length > 0) {
        console.log("[health-sync] weight duplicate skipped for", entry.date);
        continue;
      }

      const { error } = await supabase
        .from("weight_logs")
        .insert({
          user_id: userId,
          weight_kg: entry.qty,
          logged_at: timestamp,
        } as never);
      if (error) {
        console.log("[health-sync] weight insert error:", error.message, "entry:", JSON.stringify(entry));
        errors.push(`weight:${error.message}`);
      } else {
        console.log("[health-sync] weight inserted:", entry.qty, "kg on", entry.date);
        imported.weights++;
      }
    }
  }

  // --- BODY FAT ---
  const bodyFatMetric =
    byName.get("body_fat_percentage") ??
    byName.get("body_fat_percent") ??
    byName.get("bodyFatPercentage");
  console.log("[health-sync] body_fat metric found:", !!bodyFatMetric, "entries:", bodyFatMetric?.data?.length ?? 0);

  if (bodyFatMetric) {
    for (const entry of bodyFatMetric.data) {
      const fatPct = entry.qty;
      const entryTime = new Date(entry.date).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const afterTime = new Date(entryTime - oneDayMs).toISOString();
      const beforeTime = new Date(entryTime + oneDayMs).toISOString();

      // Find the weight_log closest in time to this body fat reading
      const { data: weightRowsRaw } = await supabase
        .from("weight_logs")
        .select("id, weight_kg")
        .eq("user_id", userId)
        .gte("logged_at", afterTime)
        .lte("logged_at", beforeTime)
        .order("logged_at", { ascending: false })
        .limit(1);
      const weightRows = (weightRowsRaw ?? []) as { id: string; weight_kg: number }[];

      if (!weightRows.length) {
        console.log("[health-sync] body fat: no weight_log found within 24h of", entry.date, "— skipping");
        continue;
      }

      const { id: weightLogId, weight_kg } = weightRows[0];
      const lean_mass_kg = weight_kg * (1 - fatPct / 100);

      const { error } = await supabase
        .from("weight_logs")
        .update({ body_fat_pct: fatPct, lean_mass_kg } as never)
        .eq("id", weightLogId);

      if (error) {
        console.log("[health-sync] body fat update error:", error.message);
        errors.push(`body_fat:${error.message}`);
      } else {
        console.log("[health-sync] body fat updated:", fatPct, "% → lean", lean_mass_kg.toFixed(2), "kg on", entry.date);
        imported.body_fat++;
      }
    }
  }

  // --- NUTRITION ---
  const energyMetric =
    byName.get("dietary_energy_consumed") ??
    byName.get("dietaryEnergyConsumed") ??
    byName.get("HKQuantityTypeIdentifierDietaryEnergyConsumed");
  const proteinMetric =
    byName.get("dietary_protein") ??
    byName.get("dietaryProtein") ??
    byName.get("HKQuantityTypeIdentifierDietaryProtein");
  const carbsMetric =
    byName.get("dietary_carbohydrates") ??
    byName.get("dietaryCarbohydrates") ??
    byName.get("HKQuantityTypeIdentifierDietaryCarbohydrates");
  const fatMetric =
    byName.get("dietary_fat_total") ??
    byName.get("dietaryFatTotal") ??
    byName.get("HKQuantityTypeIdentifierDietaryFatTotal");

  console.log("[health-sync] energy metric found:", !!energyMetric, "entries:", energyMetric?.data?.length ?? 0);
  console.log("[health-sync] protein metric found:", !!proteinMetric);
  console.log("[health-sync] carbs metric found:", !!carbsMetric);
  console.log("[health-sync] fat metric found:", !!fatMetric);

  if (energyMetric) {
    for (const entry of energyMetric.data) {
      const logDate = toDateStr(entry.date);
      const protein = proteinMetric?.data.find((d) => toDateStr(d.date) === logDate)?.qty ?? null;
      const carbs = carbsMetric?.data.find((d) => toDateStr(d.date) === logDate)?.qty ?? null;
      const fats = fatMetric?.data.find((d) => toDateStr(d.date) === logDate)?.qty ?? null;
      const calories = Math.round(entry.qty);
      const adherence_pct = Math.round((calories / calorie_target) * 10000) / 100;

      const { error } = await supabase
        .from("nutrition_logs")
        .upsert(
          {
            user_id: userId,
            log_date: logDate,
            calories,
            protein_g: protein,
            carbs_g: carbs,
            fats_g: fats,
            adherence_pct,
          } as never,
          { onConflict: "user_id,log_date" }
        );
      if (error) {
        console.log("[health-sync] nutrition upsert error:", error.message, "date:", logDate);
        errors.push(`nutrition:${error.message}`);
      } else {
        console.log("[health-sync] nutrition upserted:", calories, "kcal on", logDate);
        imported.nutrition++;
      }
    }
  }

  // --- STEPS (sum all hourly entries per day) + SLEEP (max value per day) ---
  const stepsMetric =
    byName.get("step_count") ??
    byName.get("stepCount") ??
    byName.get("HKQuantityTypeIdentifierStepCount");
  const sleepMetric =
    byName.get("sleep_analysis") ??
    byName.get("sleepAnalysis") ??
    byName.get("HKCategoryTypeIdentifierSleepAnalysis");

  console.log("[health-sync] steps metric found:", !!stepsMetric, "entries:", stepsMetric?.data?.length ?? 0);
  console.log("[health-sync] sleep metric found:", !!sleepMetric, "entries:", sleepMetric?.data?.length ?? 0);

  // Pre-aggregate before looping: sum steps per day, max sleep per day
  const stepsByDate: Map<string, number> = stepsMetric ? sumByDate(stepsMetric) : new Map();
  const sleepByDate: Map<string, number> = sleepMetric ? maxByDate(sleepMetric) : new Map();

  const habitDatesSet = new Set<string>([...Array.from(stepsByDate.keys()), ...Array.from(sleepByDate.keys())]);
  const habitDates = Array.from(habitDatesSet);
  console.log("[health-sync] habit dates to process:", habitDates.length);

  for (const habitDate of habitDates) {
    const { data: existingRaw } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("habit_date", habitDate)
      .maybeSingle();
    const existing = existingRaw as Habit | null;

    const stepsTotal = stepsByDate.get(habitDate);
    const sleepValue = sleepByDate.get(habitDate);

    const gym = existing?.gym ?? false;
    const diet_adherent = existing?.diet_adherent ?? false;
    const sleep_hours = sleepValue != null ? sleepValue : (existing?.sleep_hours ?? null);
    const meditation = existing?.meditation ?? false;
    const deep_work_hours = existing?.deep_work_hours ?? null;
    const vitamin_intake = existing?.vitamin_intake ?? false;
    const steps = stepsTotal != null ? Math.round(stepsTotal) : (existing?.steps ?? 0);

    const completion_status = calcCompletionStatus(
      gym,
      diet_adherent,
      sleep_hours,
      meditation,
      deep_work_hours,
      vitamin_intake,
      steps
    );

    const { error } = await supabase
      .from("habits")
      .upsert(
        {
          user_id: userId,
          habit_date: habitDate,
          gym,
          diet_adherent,
          sleep_hours,
          meditation,
          deep_work_hours,
          vitamin_intake,
          steps,
          completion_status,
        } as never,
        { onConflict: "user_id,habit_date" }
      );

    if (error) {
      console.log("[health-sync] habits upsert error:", error.message, "date:", habitDate);
      errors.push(`habits:${error.message}`);
    } else {
      if (stepsTotal != null) {
        console.log("[health-sync] steps upserted:", steps, "on", habitDate);
        imported.steps++;
      }
      if (sleepValue != null) {
        console.log("[health-sync] sleep upserted:", sleep_hours, "hrs on", habitDate);
        imported.sleep++;
      }
    }
  }

  console.log("[health-sync] Done. imported:", JSON.stringify(imported), "errors:", errors.length);
  return Response.json({ imported, errors: errors.length > 0 ? errors : undefined });
}
