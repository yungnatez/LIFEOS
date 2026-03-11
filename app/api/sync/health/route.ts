import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { calcCompletionStatus } from "@/lib/calculations/habit-completion";
import type { User, Habit } from "@/lib/supabase/types";

interface HealthEntry {
  date: string;
  qty: number;
}

interface HealthMetric {
  name: string;
  units: string;
  data: HealthEntry[];
}

interface HealthPayload {
  data: {
    metrics: HealthMetric[];
  };
}

function toDateStr(dateStr: string): string {
  return dateStr.slice(0, 10);
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.HEALTH_SYNC_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: HealthPayload;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const metrics = body?.data?.metrics;
  if (!Array.isArray(metrics)) {
    return Response.json({ error: "Invalid payload: missing metrics array" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Single-user personal app — fetch the one user
  const { data: usersRaw } = await supabase
    .from("users")
    .select("id, calorie_target")
    .limit(1);
  const users = (usersRaw ?? []) as Pick<User, "id" | "calorie_target">[];
  if (!users.length) {
    return Response.json({ error: "No user found" }, { status: 500 });
  }
  const { id: userId, calorie_target } = users[0];

  const byName = new Map<string, HealthMetric>();
  for (const m of metrics) {
    byName.set(m.name, m);
  }

  const imported = { steps: 0, weights: 0, nutrition: 0, sleep: 0 };

  // --- WEIGHTS ---
  const bodyMass = byName.get("body_mass");
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
      if (existing.length > 0) continue;

      const { error } = await supabase
        .from("weight_logs")
        .insert({
          user_id: userId,
          weight_kg: entry.qty,
          logged_at: timestamp,
        } as never);
      if (!error) imported.weights++;
    }
  }

  // --- NUTRITION ---
  const energyMetric = byName.get("dietary_energy_consumed");
  const proteinMetric = byName.get("dietary_protein");
  const carbsMetric = byName.get("dietary_carbohydrates");
  const fatMetric = byName.get("dietary_fat_total");

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
      if (!error) imported.nutrition++;
    }
  }

  // --- STEPS + SLEEP (both upsert into habits) ---
  const stepsMetric = byName.get("step_count");
  const sleepMetric = byName.get("sleep_analysis");

  const habitDatesSet = new Set<string>();
  if (stepsMetric) for (const e of stepsMetric.data) habitDatesSet.add(toDateStr(e.date));
  if (sleepMetric) for (const e of sleepMetric.data) habitDatesSet.add(toDateStr(e.date));
  const habitDates = Array.from(habitDatesSet);

  for (const habitDate of habitDates) {
    const { data: existingRaw } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("habit_date", habitDate)
      .maybeSingle();
    const existing = existingRaw as Habit | null;

    const stepsEntry = stepsMetric?.data.find((d) => toDateStr(d.date) === habitDate);
    const sleepEntry = sleepMetric?.data.find((d) => toDateStr(d.date) === habitDate);

    const gym = existing?.gym ?? false;
    const diet_adherent = existing?.diet_adherent ?? false;
    const sleep_hours = sleepEntry != null ? sleepEntry.qty : (existing?.sleep_hours ?? null);
    const meditation = existing?.meditation ?? false;
    const deep_work_hours = existing?.deep_work_hours ?? null;
    const vitamin_intake = existing?.vitamin_intake ?? false;
    const steps = stepsEntry != null ? Math.round(stepsEntry.qty) : (existing?.steps ?? 0);

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

    if (!error) {
      if (stepsEntry != null) imported.steps++;
      if (sleepEntry != null) imported.sleep++;
    }
  }

  return Response.json({ imported });
}
