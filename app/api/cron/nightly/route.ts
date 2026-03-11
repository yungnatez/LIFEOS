import { createServiceClient } from "@/lib/supabase/server";
import {
  calcPhysiqueScore,
  calcStrengthScore,
  calcFinanceScore,
  calcMissionScore,
} from "@/lib/calculations/mission-score";
import { calcHabitScore } from "@/lib/calculations/habit-completion";
import { generateCommanderBrief } from "@/lib/calculations/commander-brief";
import { checkAlertConditions } from "@/lib/calculations/alerts";
import type { User, Workout, WorkoutSet, WeightLog, Habit, Finance, Goal } from "@/lib/supabase/types";

export async function POST(req: Request) {
  // Verify CRON_SECRET
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get all users
  const { data: usersRaw, error: usersError } = await supabase.from("users").select("*");
  if (usersError || !usersRaw) {
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
  const users = usersRaw as User[];

  let processed = 0;

  for (const user of users) {
    try {
      // Fetch all data in parallel
      const [weightLogsRes, workoutsRes, habitsRes, financesRes, goalsRes] = await Promise.all([
        supabase
          .from("weight_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false })
          .limit(60),
        supabase
          .from("workouts")
          .select("*, sets:workout_sets(*)")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false })
          .limit(60),
        supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .order("habit_date", { ascending: false })
          .limit(30),
        supabase
          .from("finances")
          .select("*")
          .eq("user_id", user.id)
          .order("log_date", { ascending: false })
          .limit(5),
        supabase.from("goals").select("*").eq("user_id", user.id),
      ]);

      const weightLogs = (weightLogsRes.data ?? []) as WeightLog[];
      const workouts = (workoutsRes.data ?? []) as (Workout & { sets: WorkoutSet[] })[];
      const habits = (habitsRes.data ?? []) as Habit[];
      const finances = (financesRes.data ?? []) as Finance[];
      const goals = (goalsRes.data ?? []) as Goal[];

      // Calculate scores
      const physique_score = calcPhysiqueScore(weightLogs, user);
      const strength_score = calcStrengthScore(workouts);
      const finance_score = calcFinanceScore(goals);
      const habit_score = calcHabitScore(habits);
      const mission_score = calcMissionScore(physique_score, strength_score, finance_score, habit_score);

      // Update goal progress
      for (const goal of goals.filter((g) => g.status === "active")) {
        let current_value = goal.current_value;
        let progress_pct = goal.progress_pct;

        if (goal.category === "physique" && weightLogs.length > 0) {
          current_value = weightLogs[0].weight_kg;
          const start = goal.start_value ?? current_value;
          const range = Math.abs(goal.target_value - start);
          const done = Math.abs(current_value - start);
          progress_pct = range === 0 ? 0 : Math.min(100, (done / range) * 100);
        } else if (goal.category === "finance" && finances.length > 0) {
          const f = finances[0];
          if (goal.title.toLowerCase().includes("turbo")) {
            current_value = (f.turbo_fund_pence ?? 0) / 100;
          } else if (goal.title.toLowerCase().includes("safety") || goal.title.toLowerCase().includes("buffer")) {
            current_value = (f.safety_buffer_pence ?? 0) / 100;
          } else if (goal.title.toLowerCase().includes("invest")) {
            current_value = (f.investment_pence ?? 0) / 100;
          }
          progress_pct = Math.min(100, (current_value / goal.target_value) * 100);
        }

        await supabase
          .from("goals")
          .update({
            current_value,
            progress_pct,
            status: progress_pct >= 100 ? "complete" : "active",
          } as never)
          .eq("id", goal.id);
      }

      // Re-fetch goals after update for brief generation
      const { data: updatedGoalsRaw } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id);
      const updatedGoals = updatedGoalsRaw as Goal[] | null;

      // Generate commander brief
      const { brief, status, efficiency } = generateCommanderBrief({
        weightLogs,
        workouts,
        finances,
        goals: updatedGoals ?? goals,
        habitScore: habit_score,
        user,
      });

      // Upsert system_state
      await supabase.from("system_state").upsert(
        {
          user_id: user.id,
          mission_score,
          physique_score,
          strength_score,
          finance_score,
          habit_score,
          commander_brief: brief,
          status,
          efficiency_pct: efficiency,
          last_updated: new Date().toISOString(),
        } as never,
        { onConflict: "user_id" }
      );

      // Check alerts
      const alertCandidates = checkAlertConditions({
        weightLogs,
        workouts,
        habits,
        finances,
        goals: updatedGoals ?? goals,
        habitScore: habit_score,
      });

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      for (const candidate of alertCandidates) {
        // Check if similar unread alert already exists in last 3 days
        const { data: existing } = await supabase
          .from("alerts")
          .select("id")
          .eq("user_id", user.id)
          .eq("title", candidate.title)
          .eq("read", false)
          .gte("created_at", threeDaysAgo.toISOString())
          .limit(1);

        if (!existing?.length) {
          await supabase.from("alerts").insert({
            user_id: user.id,
            type: candidate.type,
            title: candidate.title,
            message: candidate.message,
          } as never);
        }
      }

      processed++;
    } catch {
      // Continue processing other users even if one fails
    }
  }

  return Response.json({ ok: true, processed });
}
