import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    calories: number;
    protein_g?: number;
    carbs_g?: number;
    fats_g?: number;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.calories || isNaN(body.calories)) {
    return Response.json({ error: "calories is required" }, { status: 400 });
  }

  const { data: userDataRaw } = await supabase
    .from("users")
    .select("calorie_target")
    .eq("id", user.id)
    .single();
  const userData = userDataRaw as { calorie_target: number } | null;

  const calorie_target = userData?.calorie_target ?? 3000;
  const adherence_pct = (body.calories / calorie_target) * 100;
  const today = new Date().toISOString().slice(0, 10);

  const { data: row, error } = await supabase
    .from("nutrition_logs")
    .upsert(
      {
        user_id: user.id,
        log_date: today,
        calories: body.calories,
        protein_g: body.protein_g ?? null,
        carbs_g: body.carbs_g ?? null,
        fats_g: body.fats_g ?? null,
        adherence_pct: Math.round(adherence_pct * 100) / 100,
      } as never,
      { onConflict: "user_id,log_date" }
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(row);
}
