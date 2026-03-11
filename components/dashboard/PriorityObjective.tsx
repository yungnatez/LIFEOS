interface PriorityObjectiveProps {
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPct: number;
  daysRemaining: number;
  onTrack: boolean;
}

export default function PriorityObjective({
  title,
  currentValue,
  targetValue,
  unit,
  progressPct,
  daysRemaining,
  onTrack,
}: PriorityObjectiveProps) {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#3b86f7] mb-4">
          Priority Objective
        </p>
        <p className="text-lg font-extrabold text-white mb-3">{title}</p>
        <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: "#3b86f7",
              boxShadow: "0 0 8px rgba(59,134,247,0.5)",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-extrabold text-[#64748b]">
          <span>
            {currentValue}
            {unit} CURRENT
          </span>
          <span>
            {targetValue}
            {unit} TARGET
          </span>
        </div>
      </div>
      <div className="bg-[#060B17]/50 rounded-lg p-3 mt-4 flex items-center gap-3">
        <div className="size-8 rounded-lg bg-[#3b86f7]/20 flex items-center justify-center">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#3b86f7"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-extrabold text-white">{daysRemaining} Days Remaining</p>
          <p className="text-[10px] text-[#64748b] italic">
            Projected: {onTrack ? "On track" : "Behind"}
          </p>
        </div>
      </div>
    </div>
  );
}
