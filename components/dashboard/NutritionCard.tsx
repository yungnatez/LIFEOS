"use client";

interface MacroData {
  protein: number;
  proteinTarget: number;
  carbs: number;
  carbsTarget: number;
  fats: number;
  fatsTarget: number;
  calories: number;
  calorieTarget: number;
  isLogged: boolean;    // false = no entry for today (fasting / not yet logged)
  displayDate: string;  // e.g. "TODAY · 12 MAR"
}

interface NutritionCardProps {
  data: MacroData;
  onLogNutrition?: () => void;
}

export default function NutritionCard({ data, onLogNutrition }: NutritionCardProps) {
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
      {/* Header */}
      <div className="flex justify-between items-start">
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
          <div>
            <p className="text-xs font-extrabold text-white uppercase tracking-wider">
              Nutrition Adherence
            </p>
            <p className="text-[9px] text-[#64748b] font-extrabold mt-0.5">
              {data.displayDate}
            </p>
          </div>
        </div>
        {/* Status indicator: fasting badge or macro dots */}
        {data.isLogged ? (
          <div className="flex gap-1">
            {macros.map((m) => {
              const ok = m.value / m.target >= 0.8;
              return (
                <span
                  key={m.label}
                  className={`size-1.5 rounded-full ${ok ? "bg-[#10b981]" : "bg-[#ef4444]"}`}
                />
              );
            })}
          </div>
        ) : (
          <span
            className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              background: "#64748b18",
              border: "1px solid #64748b40",
              color: "#64748b",
            }}
          >
            NO DATA
          </span>
        )}
      </div>

      {/* Macro tiles — always shown, zeros when not logged */}
      <div className="grid grid-cols-3 gap-2">
        {macros.map((m) => {
          const pct = m.target > 0 ? Math.min(100, Math.round((m.value / m.target) * 100)) : 0;
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

      {/* Calorie bar */}
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
              width: `${Math.min(100, data.calorieTarget > 0 ? (data.calories / data.calorieTarget) * 100 : 0)}%`,
              background: data.isLogged
                ? "linear-gradient(to right, #10b981, #3b86f7)"
                : "#1e293b",
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
