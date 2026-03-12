import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { calcCompletionStatus } from "@/lib/calculations/habit-completion";
import type { User, Habit } from "@/lib/supabase/types";

interface HealthEntry {
  date: string;
  qty: number;
  source?: string;
  min?: number;
  max?: number;
}

interface HealthMetric {
  name: string;
  units: string;
  data: HealthEntry[];
}

interface HealthPayloadWrapped {
  data: { metrics: HealthMetric[] };
}
interface HealthPayloadFlat {
  metrics: HealthMetric[];
}
type HealthPayload = HealthPayloadWrapped | HealthPayloadFlat | HealthMetric[];

// "2026-03-11 22:00:00 +0000" → "2026-03-11"
function toDateStr(dateStr: string): string {
  return dateStr.slice(0, 10);
}

// Sum all qty values for the same date
function sumByDate(entries: HealthEntry[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const e of entries) {
    const d = toDateStr(e.date);
    totals.set(d, (totals.get(d) ?? 0) + e.qty);
  }
  return totals;
}

// Average qty values for the same date
function avgByDate(entries: HealthEntry[]): Map<string, number> {
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();
  for (const e of entries) {
    const d = toDateStr(e.date);
    sums.set(d, (sums.get(d) ?? 0) + e.qty);
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const result = new Map<string, number>();
  for (const [d, sum] of Array.from(sums.entries())) {
    result.set(d, sum / (counts.get(d) ?? 1));
  }
  return result;
}

// For point-in-time metrics: take the latest entry per date by timestamp string
function latestByDate(entries: HealthEntry[]): Map<string, number> {
  const best = new Map<string, { ts: string; qty: number }>();
  for (const e of entries) {
    const d = toDateStr(e.date);
    const prev = best.get(d);
    if (!prev || e.date > prev.ts) best.set(d, { ts: e.date, qty: e.qty });
  }
  const out = new Map<string, number>();
  for (const [d, v] of Array.from(best.entries())) out.set(d, v.qty);
  return out;
}

function extractMetrics(body: HealthPayload): HealthMetric[] | null {
  if (Array.isArray(body)) return body;
  if ("data" in body && body.data && Array.isArray((body as HealthPayloadWrapped).data.metrics)) {
    return (body as HealthPayloadWrapped).data.metrics;
  }
  if ("metrics" in body && Array.isArray((body as HealthPayloadFlat).metrics)) {
    return (body as HealthPayloadFlat).metrics;
  }
  return null;
}

// Helper: get aggregated map for a named metric, or empty map if not present
function getSum(byName: Map<string, HealthMetric>, name: string): Map<string, number> {
  const m = byName.get(name);
  return m ? sumByDate(m.data) : new Map();
}
function getLatest(byName: Map<string, HealthMetric>, name: string): Map<string, number> {
  const m = byName.get(name);
  return m ? latestByDate(m.data) : new Map();
}
// avgByDate exposed for walking metrics
function getAvg(byName: Map<string, HealthMetric>, name: string): Map<string, number> {
  const m = byName.get(name);
  return m ? avgByDate(m.data) : new Map();
}

export async function GET() {
  return Response.json({
    status: "ok",
    supported_metrics: [
      // Body
      "weight_body_mass", "body_fat_percentage", "lean_body_mass", "body_mass_index", "height",
      // Nutrition (energy in kJ — converted to kcal on ingest)
      "dietary_energy", "protein", "carbohydrates", "total_fat", "fiber", "dietary_sugar",
      "saturated_fat", "monounsaturated_fat", "polyunsaturated_fat", "cholesterol", "sodium",
      "dietary_water",
      // Minerals
      "calcium", "iron", "magnesium", "phosphorus", "potassium", "zinc", "copper", "manganese", "selenium",
      // Vitamins
      "vitamin_a", "vitamin_c", "vitamin_d", "vitamin_e", "vitamin_k",
      "vitamin_b6", "vitamin_b12", "niacin", "riboflavin", "thiamin", "folate", "pantothenic_acid",
      // Activity
      "step_count", "walking_running_distance", "flights_climbed",
      // Sleep
      "sleep_analysis",
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

  const metrics = extractMetrics(rawBody);
  if (!metrics) {
    console.log("[health-sync] Could not extract metrics. Payload:", JSON.stringify(rawBody).slice(0, 500));
    return Response.json({ error: "Invalid payload: cannot find metrics array" }, { status: 400 });
  }

  console.log("[health-sync] metrics received:", metrics.map((m) => m.name));
  for (const m of metrics) {
    console.log(`[health-sync] metric="${m.name}" units="${m.units}" entries=${m.data?.length ?? 0}`);
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
    return Response.json({ error: "No user found" }, { status: 500 });
  }
  const { id: userId, calorie_target } = users[0];

  // Build metric lookup map
  const byName = new Map<string, HealthMetric>();
  for (const m of metrics) byName.set(m.name, m);

  const results: Record<string, string> = {};
  const errors: string[] = [];

  // ─── WEIGHT / BODY METRICS ──────────────────────────────────────────────────
  // Point-in-time: take the latest reading per day
  const weightByDate   = getLatest(byName, "weight_body_mass");
  const bodyFatByDate  = getLatest(byName, "body_fat_percentage");
  const leanMassByDate = getLatest(byName, "lean_body_mass");
  const bmiByDate      = getLatest(byName, "body_mass_index");

  const weightDates = Array.from(weightByDate.keys());
  let weightCount = 0;

  for (const date of weightDates) {
    const weight_kg     = weightByDate.get(date)!;
    const body_fat_pct  = bodyFatByDate.get(date) ?? null;
    const lean_from_hk  = leanMassByDate.get(date) ?? null;
    const lean_mass_kg  = lean_from_hk ?? (body_fat_pct != null ? weight_kg * (1 - body_fat_pct / 100) : null);
    const bmi           = bmiByDate.get(date) ?? null;

    const { error } = await supabase
      .from("weight_logs")
      .upsert(
        {
          user_id: userId,
          log_date: date,
          weight_kg,
          body_fat_pct,
          lean_mass_kg,
          bmi,
          logged_at: new Date(date + "T12:00:00Z").toISOString(),
        } as never,
        { onConflict: "user_id,log_date" }
      );

    if (error) {
      console.log("[health-sync] weight upsert error:", error.message, "date:", date);
      errors.push(`weight:${error.message}`);
    } else {
      console.log("[health-sync] weight upserted:", weight_kg, "kg on", date, "| fat:", body_fat_pct, "% | lean:", lean_mass_kg);
      weightCount++;
    }
  }
  results.weight = `${weightCount} entries`;

  // ─── NUTRITION ──────────────────────────────────────────────────────────────
  // Core macros — sum all entries per day
  const energyByDate = getSum(byName, "dietary_energy"); // kJ → convert to kcal
  const proteinByDate = getSum(byName, "protein");
  const carbsByDate   = getSum(byName, "carbohydrates");
  const fatByDate     = getSum(byName, "total_fat");

  // Extended macros
  const fiberByDate    = getSum(byName, "fiber");
  const sugarByDate    = getSum(byName, "dietary_sugar");
  const satFatByDate   = getSum(byName, "saturated_fat");
  const monoFatByDate  = getSum(byName, "monounsaturated_fat");
  const polyFatByDate  = getSum(byName, "polyunsaturated_fat");
  const cholByDate     = getSum(byName, "cholesterol");
  const sodiumByDate   = getSum(byName, "sodium");
  const waterByDate    = getSum(byName, "dietary_water");

  // Minerals
  const calciumByDate  = getSum(byName, "calcium");
  const ironByDate     = getSum(byName, "iron");
  const magByDate      = getSum(byName, "magnesium");
  const phosphByDate   = getSum(byName, "phosphorus");
  const potByDate      = getSum(byName, "potassium");
  const zincByDate     = getSum(byName, "zinc");
  const copperByDate   = getSum(byName, "copper");
  const mangByDate     = getSum(byName, "manganese");
  const seByDate       = getSum(byName, "selenium");

  // Vitamins
  const vitAByDate     = getSum(byName, "vitamin_a");
  const vitCByDate     = getSum(byName, "vitamin_c");
  const vitDByDate     = getSum(byName, "vitamin_d");
  const vitEByDate     = getSum(byName, "vitamin_e");
  const vitKByDate     = getSum(byName, "vitamin_k");
  const vitB6ByDate    = getSum(byName, "vitamin_b6");
  const vitB12ByDate   = getSum(byName, "vitamin_b12");
  const niacinByDate   = getSum(byName, "niacin");
  const ribofByDate    = getSum(byName, "riboflavin");
  const thiaminByDate  = getSum(byName, "thiamin");
  const folateByDate   = getSum(byName, "folate");
  const pantoByDate    = getSum(byName, "pantothenic_acid");

  // Activity
  const stepsByDate    = getSum(byName, "step_count");
  const distByDate     = getSum(byName, "walking_running_distance");
  const flightsByDate  = getSum(byName, "flights_climbed");

  // Only process days that have energy data (calories is NOT NULL in schema)
  const nutritionDates = Array.from(energyByDate.keys()).sort();
  let nutritionCount = 0;

  for (const date of nutritionDates) {
    const kj            = energyByDate.get(date)!;
    const calories_kcal = Math.round((kj / 4.184) * 10) / 10;
    const calories      = Math.round(calories_kcal);
    const adherence_pct = Math.round((calories / calorie_target) * 10000) / 100;
    const protein_g     = proteinByDate.get(date) ?? null;
    const carbs_g       = carbsByDate.get(date) ?? null;
    const fat_g         = fatByDate.get(date) ?? null;
    const steps         = stepsByDate.has(date) ? Math.round(stepsByDate.get(date)!) : null;
    const flights       = flightsByDate.has(date) ? Math.round(flightsByDate.get(date)!) : null;

    // Log first day so we can verify kJ→kcal conversion in Vercel logs
    if (nutritionCount === 0) {
      console.log(
        `[health-sync] nutrition sample date=${date} kJ=${kj} kcal=${calories_kcal} protein=${protein_g}g carbs=${carbs_g}g fat=${fat_g}g`
      );
    }

    const { error } = await supabase
      .from("nutrition_logs")
      .upsert(
        {
          user_id: userId,
          log_date: date,
          calories,
          calories_kcal,
          protein_g,
          carbs_g,
          fats_g: fat_g,         // keep legacy column populated
          fat_g,
          adherence_pct,
          fiber_g:               fiberByDate.get(date)  ?? null,
          sugar_g:               sugarByDate.get(date)  ?? null,
          saturated_fat_g:       satFatByDate.get(date) ?? null,
          monounsaturated_fat_g: monoFatByDate.get(date) ?? null,
          polyunsaturated_fat_g: polyFatByDate.get(date) ?? null,
          cholesterol_mg:        cholByDate.get(date)   ?? null,
          sodium_mg:             sodiumByDate.get(date) ?? null,
          water_ml:              waterByDate.get(date)  ?? null,
          calcium_mg:            calciumByDate.get(date) ?? null,
          iron_mg:               ironByDate.get(date)   ?? null,
          magnesium_mg:          magByDate.get(date)    ?? null,
          phosphorus_mg:         phosphByDate.get(date) ?? null,
          potassium_mg:          potByDate.get(date)    ?? null,
          zinc_mg:               zincByDate.get(date)   ?? null,
          copper_mg:             copperByDate.get(date) ?? null,
          manganese_mg:          mangByDate.get(date)   ?? null,
          selenium_mcg:          seByDate.get(date)     ?? null,
          vitamin_a_mcg:         vitAByDate.get(date)   ?? null,
          vitamin_c_mg:          vitCByDate.get(date)   ?? null,
          vitamin_d_mcg:         vitDByDate.get(date)   ?? null,
          vitamin_e_mg:          vitEByDate.get(date)   ?? null,
          vitamin_k_mcg:         vitKByDate.get(date)   ?? null,
          vitamin_b6_mg:         vitB6ByDate.get(date)  ?? null,
          vitamin_b12_mcg:       vitB12ByDate.get(date) ?? null,
          niacin_mg:             niacinByDate.get(date) ?? null,
          riboflavin_mg:         ribofByDate.get(date)  ?? null,
          thiamin_mg:            thiaminByDate.get(date) ?? null,
          folate_mcg:            folateByDate.get(date) ?? null,
          pantothenic_acid_mg:   pantoByDate.get(date)  ?? null,
          steps,
          distance_km:           distByDate.get(date)   ?? null,
          flights_climbed:       flights,
        } as never,
        { onConflict: "user_id,log_date" }
      );

    if (error) {
      console.log("[health-sync] nutrition upsert error:", error.message, "date:", date);
      errors.push(`nutrition:${error.message}`);
    } else {
      nutritionCount++;
    }
  }
  results.nutrition = `${nutritionCount} days`;
  console.log("[health-sync] nutrition upserted:", nutritionCount, "days");

  // ─── HABITS (sleep + steps) ──────────────────────────────────────────────────
  // Sleep: max value per day
  const sleepMetric =
    byName.get("sleep_analysis") ??
    byName.get("sleepAnalysis") ??
    byName.get("HKCategoryTypeIdentifierSleepAnalysis");

  const sleepByDate = new Map<string, number>();
  if (sleepMetric) {
    for (const e of sleepMetric.data) {
      const d = toDateStr(e.date);
      if (e.qty > (sleepByDate.get(d) ?? 0)) sleepByDate.set(d, e.qty);
    }
  }

  const habitDatesSet = new Set<string>([
    ...Array.from(stepsByDate.keys()),
    ...Array.from(sleepByDate.keys()),
  ]);
  let habitCount = 0;

  for (const habitDate of Array.from(habitDatesSet)) {
    const { data: existingRaw } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("habit_date", habitDate)
      .maybeSingle();
    const existing = existingRaw as Habit | null;

    const stepsTotal = stepsByDate.get(habitDate);
    const sleepValue = sleepByDate.get(habitDate);

    const gym             = existing?.gym ?? false;
    const diet_adherent   = existing?.diet_adherent ?? false;
    const sleep_hours     = sleepValue ?? existing?.sleep_hours ?? null;
    const meditation      = existing?.meditation ?? false;
    const deep_work_hours = existing?.deep_work_hours ?? null;
    const vitamin_intake  = existing?.vitamin_intake ?? false;
    const steps           = stepsTotal != null ? Math.round(stepsTotal) : (existing?.steps ?? 0);

    const completion_status = calcCompletionStatus(
      gym, diet_adherent, sleep_hours, meditation, deep_work_hours, vitamin_intake, steps
    );

    const { error } = await supabase
      .from("habits")
      .upsert(
        {
          user_id: userId,
          habit_date: habitDate,
          gym, diet_adherent, sleep_hours, meditation, deep_work_hours, vitamin_intake,
          steps, completion_status,
        } as never,
        { onConflict: "user_id,habit_date" }
      );

    if (error) {
      console.log("[health-sync] habits upsert error:", error.message, "date:", habitDate);
      errors.push(`habits:${error.message}`);
    } else {
      habitCount++;
    }
  }
  results.habits = `${habitCount} days`;
  console.log("[health-sync] habits upserted:", habitCount, "days");

  console.log("[health-sync] Done. results:", JSON.stringify(results), "errors:", errors.length);
  return Response.json({
    success: true,
    metrics_received: metrics.length,
    results,
    errors: errors.length > 0 ? errors : undefined,
  });
}
