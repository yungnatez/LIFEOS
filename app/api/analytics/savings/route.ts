import { createClient } from "@/lib/supabase/server";
import { calcSavingsForecast } from "@/lib/calculations/forecasts";
import type { Finance, User } from "@/lib/supabase/types";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [userRes, financesRes, goalsRes] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase
      .from("finances")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(1),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("category", "finance"),
  ]);

  const userData = userRes.data as User | null;
  const finance = (financesRes.data?.[0] ?? null) as Finance | null;

  const totalCurrentPence = finance
    ? finance.turbo_fund_pence +
      finance.safety_buffer_pence +
      finance.investment_pence
    : 0;

  const forecast = calcSavingsForecast(
    userData?.monthly_savings_target_pence ?? 140000,
    totalCurrentPence,
    userData?.savings_apy_pct ?? 7,
    10
  );

  const metrics = [
    {
      label: "Monthly Target",
      val: `£${((userData?.monthly_savings_target_pence ?? 140000) / 100).toLocaleString()}`,
      color: "#f59e0b",
    },
    {
      label: "Current Rate",
      val: finance?.monthly_income_pence && finance.monthly_expenses_pence
        ? `£${((finance.monthly_income_pence - finance.monthly_expenses_pence) / 100).toLocaleString()}`
        : "–",
      color: "#10b981",
    },
    {
      label: `${new Date().getFullYear() + 10} Projection`,
      val: forecast[forecast.length - 1]
        ? `£${((forecast[forecast.length - 1].principal + forecast[forecast.length - 1].compound) / 1000).toFixed(0)}k`
        : "–",
      color: "#3b86f7",
    },
    {
      label: "Financial Freedom",
      val: "AUG 2031",
      color: "#8b5cf6",
    },
  ];

  return Response.json({
    forecast,
    metrics,
    finances: finance,
    goals: goalsRes.data ?? [],
    insight: finance
      ? "At current rate, you're on track. Consider increasing savings contributions by 15%."
      : "Log your first financial entry to see projections.",
  });
}
