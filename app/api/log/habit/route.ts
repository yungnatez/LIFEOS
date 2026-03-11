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

  let body: {
    gym?: boolean;
    diet_adherent?: boolean;
    sleep_hours?: number;
    meditation?: boolean;
    deep_work_hours?: number;
    vitamin_intake?: boolean;
    steps?: number;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const completion_status = calcCompletionStatus(
    body.gym ?? false,
    body.diet_adherent ?? false,
    body.sleep_hours ?? null,
    body.meditation ?? false,
    body.deep_work_hours ?? null,
    body.vitamin_intake ?? false,
    body.steps ?? null
  );

  const today = new Date().toISOString().slice(0, 10);

  const { data: row, error } = await supabase
    .from("habits")
    .upsert(
      {
        user_id: user.id,
        habit_date: today,
        gym: body.gym ?? false,
        diet_adherent: body.diet_adherent ?? false,
        sleep_hours: body.sleep_hours ?? null,
        meditation: body.meditation ?? false,
        deep_work_hours: body.deep_work_hours ?? null,
        vitamin_intake: body.vitamin_intake ?? false,
        steps: body.steps ?? 0,
        completion_status,
      } as never,
      { onConflict: "user_id,habit_date" }
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(row);
}
