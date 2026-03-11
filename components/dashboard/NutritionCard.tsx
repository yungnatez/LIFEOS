"use client";

import EmptyState from "@/components/shared/EmptyState";

interface MacroData {
  protein: number;
  proteinTarget: number;
  carbs: number;
  carbsTarget: number;
  fats: number;
  fatsTarget: number;
  calories: number;
  calorieTarget: number;
}

interface NutritionCardProps {
  data: MacroData | null;
  onLogNutrition?: () => void;
}

export default function NutritionCard({ data, onLogNutrition }: NutritionCardProps) {
  if (!data) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
          </svg>
          <p className="text-xs font-extrabold text-white uppercase tracking-wider">
            Nutrition Adherence
          </p>
        </div>
        <EmptyState
          icon="🍽️"
          title="No nutrition logged"
          message="Log today's nutrition to track macros"
          action={
            onLogNutrition
              ? { label: "+ Log Nutrition", onClick: onLogNutrition }
              : undefined
          }
        />
      </div>
    );
  }

  const macros = [
    {
      label: "PROTEIN",
      value: data.protein,
      target: data.proteinTarget,
      unit: "g",
      color: "#10b981",
    },
    {
      label: "CARBS",
      value: data.carbs,
      target: data.carbsTarget,
      unit: "g",
      color: "#f59e0b",
    },
    {
      label: "FATS",
      value: data.fats,
      target: data.fatsTarget,
      unit: "g",
      color: "#10b981",
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
          </svg>
          <p className="text-xs font-extrabold text-white uppercase tracking-wider">
            Nutrition Adherence
          </p>
        </div>
        <div className="flex gap-1">
          {[true, true, false].map((ok, i) => (
            <span
              key={i}
              className={`size-1.5 rounded-full ${
                ok ? "bg-[#10b981]" : "bg-[#ef4444]"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {macros.map((m) => {
          const pct = Math.min(100, Math.round((m.value / m.target) * 100));
          return (
            <div
              key={m.label}
              className="flex flex-col items-center p-2 bg-[#1e293b]/30 rounded-lg"
            >
              <span className="text-[9px] font-extrabold text-[#64748b] mb-1">
                {m.label}
              </span>
              <span className="text-sm font-black text-white">
                {m.value}
                {m.unit}
              </span>
              <span
                className="text-[8px] mt-1 font-extrabold"
                style={{ color: m.color }}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[10px] font-extrabold uppercase">
          <span className="text-[#64748b]">Daily Calorie Target</span>
          <span className="text-white">
            {data.calories.toLocaleString()} / {data.calorieTarget.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-3 bg-[#1e293b] rounded-full overflow-hidden border border-[#1E2D45]/50 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, (data.calories / data.calorieTarget) * 100)}%`,
              background: "linear-gradient(to right, #10b981, #3b86f7)",
            }}
          />
        </div>
      </div>

      <button
        onClick={onLogNutrition}
        className="mt-auto text-xs font-extrabold text-[#f59e0b] border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-2 rounded-lg hover:bg-[#f59e0b]/20 transition-colors w-full"
      >
        + Log Nutrition
      </button>
    </div>
  );
}
