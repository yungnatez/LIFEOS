"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/shared/Card";
import MissionRing from "@/components/dashboard/MissionRing";
import CommanderBrief from "@/components/dashboard/CommanderBrief";
import PriorityObjective from "@/components/dashboard/PriorityObjective";
import StrategyMap from "@/components/dashboard/StrategyMap";
import PhysiqueCard from "@/components/dashboard/PhysiqueCard";
import StrengthCard from "@/components/dashboard/StrengthCard";
import FinancialTerminal from "@/components/dashboard/FinancialTerminal";
import NutritionCard from "@/components/dashboard/NutritionCard";
import ConsistencyTracker from "@/components/dashboard/ConsistencyTracker";
import LogWeightModal from "@/components/modals/LogWeightModal";
import LogWorkoutModal from "@/components/modals/LogWorkoutModal";
import LogNutritionModal from "@/components/modals/LogNutritionModal";
import LogHabitModal from "@/components/modals/LogHabitModal";
import LogFinanceModal from "@/components/modals/LogFinanceModal";
import type {
  SystemState,
  Goal,
  WeightLog,
  NutritionLog,
  User,
} from "@/lib/supabase/types";
import type { LiftSummary, HabitDay, FinanceSummary } from "@/lib/supabase/types";

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface DashboardData {
  systemState: SystemState | null;
  priorityGoal: (Goal & { daysRemaining: number; onTrack: boolean }) | null;
  recentWeights: WeightLog[];
  latestWeight: WeightLog | null;
  primaryLifts: LiftSummary[];
  totalVolumeWeek: number;
  projectedSBD: number;
  latestNutrition: NutritionLog | null;
  habitHeatmap: HabitDay[];
  streaks: { gym: number; sleep: string; meditation: number };
  todaySteps: number;
  finances: FinanceSummary | null;
  financialGoals: Goal[];
  allGoals: Goal[];
  unreadAlerts: unknown[];
  userData: User | null;
  projectedFreedomYear: string;
}

type ModalType = "weight" | "workout" | "nutrition" | "habit" | "finance" | null;

// ── HELPERS ───────────────────────────────────────────────────────────────────

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
}

function mapWeightData(logs: WeightLog[]) {
  return [...logs].reverse().map((w) => ({
    month: shortDate(w.logged_at),
    weight: w.weight_kg,
  }));
}

function mapLifts(primaryLifts: LiftSummary[]) {
  return primaryLifts.map((l) => {
    const [weightStr, repsStr] = l.best_set.split(" × ");
    return {
      name: l.name,
      weight: parseFloat(weightStr) || 0,
      reps: parseInt(repsStr) || 0,
      progressPct: l.progress_pct,
    };
  });
}

function mapAccounts(finances: FinanceSummary | null, financialGoals: Goal[]) {
  if (!finances) return [];
  const turboGoal = financialGoals.find((g) => g.title.toLowerCase().includes("turbo"));
  const safetyGoal = financialGoals.find((g) =>
    g.title.toLowerCase().includes("safety") || g.title.toLowerCase().includes("buffer")
  );
  return [
    {
      id: "turbo",
      label: "Turbo Fund",
      currentPence: finances.turbo_fund_pence,
      targetPence: turboGoal ? Math.round(turboGoal.target_value * 100) : 350000,
      icon: "turbo" as const,
      color: "#f59e0b",
    },
    {
      id: "safety",
      label: "Safety Buffer",
      currentPence: finances.safety_buffer_pence,
      targetPence: safetyGoal ? Math.round(safetyGoal.target_value * 100) : 1200000,
      icon: "savings" as const,
      color: "#64748b",
    },
  ];
}

function mapMilestones(goals: Goal[]) {
  const active = goals.filter((g) => g.status !== "paused");
  if (active.length === 0) return [];

  const dates = active.map((g) => new Date(g.target_date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const range = maxDate - minDate;

  return active
    .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
    .map((g) => {
      const xPct =
        range === 0
          ? 50
          : Math.round(5 + ((new Date(g.target_date).getTime() - minDate) / range) * 90);
      const color =
        g.status === "complete" ? "#10b981" : g.status === "active" ? "#3b86f7" : "#64748b";
      return {
        id: g.id,
        title: g.title,
        date: new Date(g.target_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }).toUpperCase(),
        status: g.status as "complete" | "active" | "upcoming",
        progress: g.progress_pct,
        color,
        xPct,
      };
    });
}

function mapNutrition(nutrition: NutritionLog | null, user: User | null) {
  if (!nutrition || !user) return null;
  return {
    calories: nutrition.calories,
    calorieTarget: user.calorie_target,
    protein: nutrition.protein_g ?? 0,
    proteinTarget: user.protein_target_g,
    carbs: nutrition.carbs_g ?? 0,
    carbsTarget: 370,
    fats: nutrition.fats_g ?? 0,
    fatsTarget: 87,
  };
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onSuccess = useCallback(() => {
    setModal(null);
    fetchDashboard();
  }, [fetchDashboard]);

  // Derive component props from data
  const ss = data?.systemState;
  const pg = data?.priorityGoal;
  const weightData = mapWeightData(data?.recentWeights ?? []);
  const lifts = mapLifts(data?.primaryLifts ?? []);
  const accounts = mapAccounts(data?.finances ?? null, data?.financialGoals ?? []);
  const milestones = mapMilestones(data?.allGoals ?? []);
  const nutritionData = mapNutrition(data?.latestNutrition ?? null, data?.userData ?? null);
  const habitDays = (data?.habitHeatmap ?? []).map((h) => ({
    date: h.date,
    status: h.completion_status,
  }));

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3 h-64 bg-[#0D1525] rounded-xl border border-[#1E2D45]" />
          <div className="col-span-12 lg:col-span-6 h-64 bg-[#0D1525] rounded-xl border border-[#1E2D45]" />
          <div className="col-span-12 lg:col-span-3 h-64 bg-[#0D1525] rounded-xl border border-[#1E2D45]" />
        </div>
        <div className="h-48 bg-[#0D1525] rounded-xl border border-[#1E2D45]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-[#0D1525] rounded-xl border border-[#1E2D45]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-[#0D1525] rounded-xl border border-[#1E2D45]" />
          <div className="md:col-span-2 h-64 bg-[#0D1525] rounded-xl border border-[#1E2D45]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      {/* Row 1: Mission Score | Commander Brief | Priority Objective */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <Card className="flex flex-col items-center justify-center py-6" glow="#3b86f7">
            <MissionRing
              missionScore={ss?.mission_score ?? 0}
              physiqueScore={ss?.physique_score ?? 0}
              strengthScore={ss?.strength_score ?? 0}
              financeScore={ss?.finance_score ?? 0}
              habitScore={ss?.habit_score ?? 0}
              trend="+0% –"
            />
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Card className="h-full">
            <CommanderBrief
              brief={ss?.commander_brief ?? "Awaiting data…"}
              status={ss?.status ?? "NOMINAL"}
              efficiency={ss?.efficiency_pct ?? 0}
            />
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <div
            className="bg-[#3b86f7]/10 border border-[#3b86f7]/20 rounded-xl p-5 h-full"
            style={{ boxShadow: "0 0 30px #3b86f722" }}
          >
            {pg ? (
              <PriorityObjective
                title={pg.title}
                currentValue={pg.current_value}
                targetValue={pg.target_value}
                unit={pg.unit ?? ""}
                progressPct={pg.progress_pct}
                daysRemaining={pg.daysRemaining}
                onTrack={pg.onTrack}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-[#64748b]">No active goals</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Strategy Map */}
      <Card className="p-8">
        <StrategyMap milestones={milestones} />
      </Card>

      {/* Row 3: Physique | Strength | Finance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <PhysiqueCard
            weightData={weightData}
            bodyFatPct={data?.latestWeight?.body_fat_pct ?? null}
            leanMassKg={data?.latestWeight?.lean_mass_kg ?? null}
            onLogWeight={() => setModal("weight")}
          />
        </Card>
        <Card>
          <StrengthCard
            lifts={lifts}
            totalVolumeKg={data?.totalVolumeWeek ?? 0}
            projectedSBD={data?.projectedSBD ?? 0}
            onLogWorkout={() => setModal("workout")}
          />
        </Card>
        <Card>
          <FinancialTerminal
            accounts={accounts}
            savingsRatePct={data?.finances?.savings_rate_pct ?? 0}
            projectedFreedomYear={data?.projectedFreedomYear ?? "—"}
            onLogFinance={() => setModal("finance")}
          />
        </Card>
      </div>

      {/* Row 4: Nutrition | Consistency Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <NutritionCard
            data={nutritionData}
            onLogNutrition={() => setModal("nutrition")}
          />
        </Card>
        <div className="md:col-span-2">
          <Card>
            <ConsistencyTracker
              habitDays={habitDays}
              streaks={data?.streaks ?? { gym: 0, sleep: "0h 00m", meditation: 0 }}
              todaySteps={data?.todaySteps ?? 0}
              onLogHabits={() => setModal("habit")}
            />
          </Card>
        </div>
      </div>

      {/* Modals */}
      <LogWeightModal
        open={modal === "weight"}
        onClose={() => setModal(null)}
        onSuccess={onSuccess}
      />
      <LogWorkoutModal
        open={modal === "workout"}
        onClose={() => setModal(null)}
        onSuccess={onSuccess}
      />
      <LogNutritionModal
        open={modal === "nutrition"}
        onClose={() => setModal(null)}
        onSuccess={onSuccess}
      />
      <LogHabitModal
        open={modal === "habit"}
        onClose={() => setModal(null)}
        onSuccess={onSuccess}
      />
      <LogFinanceModal
        open={modal === "finance"}
        onClose={() => setModal(null)}
        onSuccess={onSuccess}
      />
    </div>
  );
}
