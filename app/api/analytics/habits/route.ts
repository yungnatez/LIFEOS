import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: habits, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("habit_date", { ascending: false })
    .limit(90);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Build per-habit matrix (6 habits × 90 days)
  type HabitStatus = "full" | "partial" | "missed";
  const habitKeys: {
    key: keyof typeof habits[0];
    label: string;
    threshold?: number;
  }[] = [
    { key: "gym", label: "Resistance Train" },
    { key: "diet_adherent", label: "Diet Adherent" },
    { key: "sleep_hours", label: "Sleep ≥ 7.5h", threshold: 7.5 },
    { key: "meditation", label: "Meditation (20m)" },
    { key: "deep_work_hours", label: "Deep Work (4h)", threshold: 4 },
    { key: "vitamin_intake", label: "Vitamin Intake" },
  ];

  const matrix: Record<string, HabitStatus[]> = {};
  const scores: Record<string, number> = {};

  for (const hk of habitKeys) {
    const days = (habits ?? []).map((h) => {
      const val = h[hk.key];
      let done: boolean;
      if (hk.threshold !== undefined) {
        done = typeof val === "number" && val >= hk.threshold;
      } else {
        done = val === true;
      }
      return done ? ("full" as HabitStatus) : ("missed" as HabitStatus);
    });
    matrix[hk.label] = days;
    const fullCount = days.filter((d) => d === "full").length;
    scores[hk.label] =
      days.length > 0 ? Math.round((fullCount / days.length) * 100) : 0;
  }

  return Response.json({
    matrix,
    scores,
    totalDays: habits?.length ?? 0,
  });
}
