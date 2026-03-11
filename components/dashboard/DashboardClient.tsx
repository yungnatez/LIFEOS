"use client";

import { useState } from "react";
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

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const mockWeightData = [
  { month: "MAR", weight: 89.8 },
  { month: "APR", weight: 89.1 },
  { month: "MAY", weight: 88.3 },
  { month: "JUN", weight: 87.6 },
  { month: "JUL", weight: 86.9 },
  { month: "AUG", weight: 85.8 },
  { month: "SEP", weight: 84.5 },
];

const mockLifts = [
  { name: "Bench Press", weight: 115, reps: 5, progressPct: 90 },
  { name: "Squat", weight: 160, reps: 3, progressPct: 82 },
  { name: "Deadlift", weight: 195, reps: 1, progressPct: 95 },
];

const mockAccounts = [
  {
    id: "1",
    label: "Turbo Fund",
    currentPence: 285000,
    targetPence: 350000,
    icon: "turbo" as const,
    color: "#f59e0b",
  },
  {
    id: "2",
    label: "Safety Buffer",
    currentPence: 1200000,
    targetPence: 1200000,
    icon: "savings" as const,
    color: "#64748b",
  },
];

const mockNutrition = {
  protein: 210,
  proteinTarget: 210,
  carbs: 340,
  carbsTarget: 370,
  fats: 85,
  fatsTarget: 87,
  calories: 2850,
  calorieTarget: 3000,
};

// Generate 48 days of mock habit data
const mockHabitDays = Array.from({ length: 48 }, (_, i) => {
  const rand = Math.sin(i * 7.3) * 0.5 + 0.5; // deterministic pseudo-random
  return {
    date: new Date(Date.now() - (47 - i) * 86400000).toISOString().slice(0, 10),
    status:
      rand > 0.7
        ? ("full" as const)
        : rand > 0.3
        ? ("partial" as const)
        : ("missed" as const),
  };
});

const mockMilestones = [
  {
    id: "1",
    title: "Project Start",
    date: "AUG 01",
    status: "complete" as const,
    progress: 100,
    color: "#10b981",
    xPct: 5,
  },
  {
    id: "2",
    title: "Reach 84kg",
    date: "SEP 12",
    status: "complete" as const,
    progress: 100,
    color: "#14b8a6",
    xPct: 33,
  },
  {
    id: "3",
    title: "Turbo Fund £3.5k",
    date: "OCT 30",
    status: "active" as const,
    progress: 81,
    color: "#f59e0b",
    xPct: 60,
  },
  {
    id: "4",
    title: "Reach 90kg",
    date: "DEC 30",
    status: "upcoming" as const,
    progress: 20,
    color: "#64748b",
    xPct: 90,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

type ModalType = "weight" | "workout" | "nutrition" | "habit" | "finance" | null;

export default function DashboardClient() {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      {/* Row 1: Mission Score | Commander Brief | Priority Objective */}
      <div className="grid grid-cols-12 gap-6">
        {/* Mission Score */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="flex flex-col items-center justify-center py-6" glow="#3b86f7">
            <MissionRing
              missionScore={88}
              physiqueScore={72}
              strengthScore={85}
              financeScore={81}
              habitScore={93}
              trend="+4% ▲"
            />
          </Card>
        </div>

        {/* Commander Brief */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="h-full">
            <CommanderBrief
              brief="Body mass trending downward. Strength volume up 7%. Savings rate ahead of schedule. Your trajectory is optimal."
              status="NOMINAL"
              efficiency={94.2}
            />
          </Card>
        </div>

        {/* Priority Objective */}
        <div className="col-span-12 lg:col-span-3">
          <div
            className="bg-[#3b86f7]/10 border border-[#3b86f7]/20 rounded-xl p-5 h-full"
            style={{ boxShadow: "0 0 30px #3b86f722" }}
          >
            <PriorityObjective
              title="Reach 90kg Bodyweight"
              currentValue={84.5}
              targetValue={90}
              unit="kg"
              progressPct={82}
              daysRemaining={19}
              onTrack={true}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Strategy Map */}
      <Card className="p-8">
        <StrategyMap milestones={mockMilestones} />
      </Card>

      {/* Row 3: Physique | Strength | Finance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <PhysiqueCard
            weightData={mockWeightData}
            bodyFatPct={14.2}
            leanMassKg={72.4}
            onLogWeight={() => setModal("weight")}
          />
        </Card>
        <Card>
          <StrengthCard
            lifts={mockLifts}
            totalVolumeKg={32400}
            projectedSBD={485}
            onLogWorkout={() => setModal("workout")}
          />
        </Card>
        <Card>
          <FinancialTerminal
            accounts={mockAccounts}
            savingsRatePct={62}
            projectedFreedomYear="AUG 2031"
            onLogFinance={() => setModal("finance")}
          />
        </Card>
      </div>

      {/* Row 4: Nutrition | Consistency Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <NutritionCard
            data={mockNutrition}
            onLogNutrition={() => setModal("nutrition")}
          />
        </Card>
        <div className="md:col-span-2">
          <Card>
            <ConsistencyTracker
              habitDays={mockHabitDays}
              streaks={{ gym: 14, sleep: "8h 12m", meditation: 5 }}
              onLogHabits={() => setModal("habit")}
            />
          </Card>
        </div>
      </div>

      {/* Modals */}
      <LogWeightModal open={modal === "weight"} onClose={() => setModal(null)} />
      <LogWorkoutModal
        open={modal === "workout"}
        onClose={() => setModal(null)}
        exercises={[]}
      />
      <LogNutritionModal
        open={modal === "nutrition"}
        onClose={() => setModal(null)}
      />
      <LogHabitModal open={modal === "habit"} onClose={() => setModal(null)} />
      <LogFinanceModal
        open={modal === "finance"}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
