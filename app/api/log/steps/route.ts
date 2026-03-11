import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calcCompletionStatus } from "@/lib/calculations/habit-completion";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { steps: number; logged_date?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.steps !== "number" || body.steps < 0) {
    return Response.json({ error: "steps must be a non-negative number" }, { status: 400 });
  }

  const habitDate = body.logged_date ?? new Date().toISOString().slice(0, 10);

  // Fetch existing row for that date so we can recalculate completion_status
  const { data: existing } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .eq("habit_date", habitDate)
    .single();

  const row = existing as {
    gym: boolean;
    diet_adherent: boolean;
    sleep_hours: number | null;
    meditation: boolean;
    deep_work_hours: number | null;
    vitamin_intake: boolean;
  } | null;

  const completion_status = calcCompletionStatus(
    row?.gym ?? false,
    row?.diet_adherent ?? false,
    row?.sleep_hours ?? null,
    row?.meditation ?? false,
    row?.deep_work_hours ?? null,
    row?.vitamin_intake ?? false,
    body.steps
  );

  const { data: upserted, error } = await supabase
    .from("habits")
    .upsert(
      {
        user_id: user.id,
        habit_date: habitDate,
        gym: row?.gym ?? false,
        diet_adherent: row?.diet_adherent ?? false,
        sleep_hours: row?.sleep_hours ?? null,
        meditation: row?.meditation ?? false,
        deep_work_hours: row?.deep_work_hours ?? null,
        vitamin_intake: row?.vitamin_intake ?? false,
        steps: body.steps,
        completion_status,
      } as never,
      { onConflict: "user_id,habit_date" }
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(upserted);
}
