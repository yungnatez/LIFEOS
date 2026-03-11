import { createClient } from "@/lib/supabase/server";
import type { Finance } from "@/lib/supabase/types";

export async function getLatestBalances(userId: string) {
  if (process.env.ACTUAL_ENABLED === "true") {
    throw new Error("Actual Budget not implemented yet");
  }
  const supabase = createClient();
  const { data } = await supabase
    .from("finances")
    .select("*")
    .eq("user_id", userId)
    .order("logged_at", { ascending: false })
    .limit(1)
    .single();
  return data as Finance | null;
}

export async function getMonthlyFlow(userId: string, months = 12) {
  const supabase = createClient();
  const { data } = await supabase
    .from("finances")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(months);
  return (data ?? []) as Finance[];
}

export async function getSavingsRate(userId: string) {
  const latest = await getLatestBalances(userId);
  if (!latest?.monthly_income_pence || !latest.monthly_expenses_pence)
    return null;
  return (
    ((latest.monthly_income_pence - latest.monthly_expenses_pence) /
      latest.monthly_income_pence) *
    100
  );
}
