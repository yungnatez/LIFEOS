import { createClient } from "@/lib/supabase/server";
import { calcWeightForecast } from "@/lib/calculations/forecasts";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: weightLogs, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: true })
    .limit(24);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const forecast = calcWeightForecast(weightLogs ?? []);

  return Response.json({ forecast, user: userData });
}
