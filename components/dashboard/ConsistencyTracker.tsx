"use client";

interface HabitDay {
  date: string;
  status: "full" | "partial" | "missed";
}

interface ConsistencyTrackerProps {
  habitDays: HabitDay[];
  streaks: { gym: number; sleep: string; meditation: number };
  todaySteps?: number;
  onLogHabits?: () => void;
}

const statusColor: Record<string, string> = {
  full: "#8b5cf6",
  partial: "#8b5cf660",
  missed: "#1e293b",
};

const statusGlow: Record<string, string | undefined> = {
  full: "0 0 5px rgba(139,92,246,0.3)",
  partial: undefined,
  missed: undefined,
};

const STEPS_GOAL = 8000;

export default function ConsistencyTracker({
  habitDays,
  streaks,
  todaySteps = 0,
  onLogHabits,
}: ConsistencyTrackerProps) {
  const stepsPct = Math.min(100, Math.round((todaySteps / STEPS_GOAL) * 100));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-xs font-extrabold text-white uppercase tracking-wider">
            Consistency Tracker
          </p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "MISSED", bg: "#1e293b" },
            { label: "PARTIAL", bg: "#8b5cf660" },
            { label: "FULL", bg: "#8b5cf6" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1">
              <span
                className="size-2 rounded-sm"
                style={{ background: s.bg }}
              />
              <span className="text-[9px] font-extrabold text-[#64748b]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap grid — 48 days, displayed as 2 rows × 24 cols */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(24, 1fr)" }}
      >
        {habitDays.slice(-48).map((day, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm"
            title={`${day.date}: ${day.status}`}
            style={{
              background: statusColor[day.status],
              boxShadow: statusGlow[day.status],
            }}
          />
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#64748b] font-extrabold uppercase">
            Gym Streak
          </span>
          <span className="text-xs font-black text-[#8b5cf6]">
            {streaks.gym} DAYS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#64748b] font-extrabold uppercase">
            Sleep Opt.
          </span>
          <span className="text-xs font-black text-[#8b5cf6]">{streaks.sleep}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#64748b] font-extrabold uppercase">
            Meditation
          </span>
          <span className="text-xs font-black text-[#8b5cf6]">
            {streaks.meditation} DAYS
          </span>
        </div>
      </div>

      {/* Today's steps */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase text-[#64748b]">Today&apos;s Steps</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-white">
              {todaySteps.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#64748b]">/ 8,000</span>
            {todaySteps >= STEPS_GOAL && (
              <span className="text-[9px] font-extrabold text-[#10b981] ml-1">GOAL</span>
            )}
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-[#1e293b] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${stepsPct}%`,
              background: todaySteps >= STEPS_GOAL
                ? "#10b981"
                : "linear-gradient(90deg, #8b5cf6, #3b86f7)",
            }}
          />
        </div>
      </div>

      {onLogHabits && (
        <button
          onClick={onLogHabits}
          className="text-xs font-extrabold text-[#8b5cf6] border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-4 py-2 rounded-lg hover:bg-[#8b5cf6]/20 transition-colors w-full"
        >
          + Log Habits
        </button>
      )}
    </div>
  );
}
