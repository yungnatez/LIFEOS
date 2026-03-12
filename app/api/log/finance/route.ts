import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Goal, Finance } from "@/lib/supabase/types";
import { recalcAndPersistScores } from "@/lib/calculations/recalc-scores";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    turbo_fund_pence?: number;
    safety_buffer_pence?: number;
    investment_pence?: number;
    monthly_income_pence?: number;
    monthly_expenses_pence?: number;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { monthly_income_pence, monthly_expenses_pence } = body;
  const savings_rate_pct =
    monthly_income_pence && monthly_expenses_pence && monthly_income_pence > 0
      ? ((monthly_income_pence - monthly_expenses_pence) /
          monthly_income_pence) *
        100
      : null;

  const today = new Date().toISOString().slice(0, 10);

  const { data: row, error } = await supabase
    .from("finances")
    .upsert(
      {
        user_id: user.id,
        log_date: today,
        turbo_fund_pence: body.turbo_fund_pence ?? 0,
        safety_buffer_pence: body.safety_buffer_pence ?? 0,
        investment_pence: body.investment_pence ?? 0,
        monthly_income_pence: monthly_income_pence ?? null,
        monthly_expenses_pence: monthly_expenses_pence ?? null,
        savings_rate_pct:
          savings_rate_pct != null
            ? Math.round(savings_rate_pct * 100) / 100
            : null,
      } as never,
      { onConflict: "user_id,log_date" }
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const financeRow = row as Finance;

  // Update finance goals progress
  const { data: goalsRaw } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("category", "finance")
    .eq("status", "active");

  const goals = (goalsRaw ?? []) as Goal[];

  for (const goal of goals) {
    let current_value = goal.current_value;
    if (goal.title.toLowerCase().includes("turbo")) {
      current_value = (financeRow.turbo_fund_pence ?? 0) / 100;
    } else if (
      goal.title.toLowerCase().includes("safety") ||
      goal.title.toLowerCase().includes("buffer")
    ) {
      current_value = (financeRow.safety_buffer_pence ?? 0) / 100;
    } else if (goal.title.toLowerCase().includes("invest")) {
      current_value = (financeRow.investment_pence ?? 0) / 100;
    }
    const progress_pct = Math.min(
      100,
      (current_value / goal.target_value) * 100
    );
    await supabase
      .from("goals")
      .update({
        current_value,
        progress_pct,
        status: progress_pct >= 100 ? "complete" : "active",
      } as never)
      .eq("id", goal.id);
  }

  // Recalculate all scores immediately
  await recalcAndPersistScores(supabase, user.id);

  return Response.json(financeRow);
}
