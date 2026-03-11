"use client";

import ProgressBar from "@/components/shared/ProgressBar";
import EmptyState from "@/components/shared/EmptyState";

interface LiftSummary {
  name: string;
  weight: number;
  reps: number;
  progressPct: number;
}

interface StrengthCardProps {
  lifts: LiftSummary[];
  totalVolumeKg: number;
  projectedSBD: number;
  onLogWorkout?: () => void;
}

export default function StrengthCard({
  lifts,
  totalVolumeKg,
  projectedSBD,
  onLogWorkout,
}: StrengthCardProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 4v16M18 4v16M4 8h2M18 8h2M4 16h2M18 16h2M8 4h8M8 20h8" />
          </svg>
          <p className="text-xs font-extrabold text-white uppercase tracking-wider">
            Strength Volume
          </p>
        </div>
        <span className="text-[10px] font-extrabold text-[#64748b]">
          VOLUME {totalVolumeKg.toLocaleString()}KG
        </span>
      </div>

      {lifts.length === 0 ? (
        <EmptyState
          icon="🏋️"
          title="No workouts logged"
          message="Log your first workout to track strength"
          action={
            onLogWorkout
              ? { label: "+ Log Workout", onClick: onLogWorkout }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3 flex-1">
          {lifts.map((lift) => (
            <div key={lift.name} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-extrabold">
                <span className="text-[#e2e8f0]">{lift.name.toUpperCase()}</span>
                <span className="text-white">
                  {lift.weight}kg × {lift.reps}
                </span>
              </div>
              <ProgressBar value={lift.progressPct} color="#3b82f6" height={6} />
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/20 p-3 rounded-lg flex items-center justify-between">
        <span className="text-xs font-extrabold text-[#3b82f6]">
          Projected Max (SBD)
        </span>
        <span className="text-lg font-black text-white tracking-tighter">
          {projectedSBD}kg
        </span>
      </div>

      <button
        onClick={onLogWorkout}
        className="text-xs font-extrabold text-[#3b82f6] border border-[#3b82f6]/40 bg-[#3b82f6]/10 px-4 py-2 rounded-lg hover:bg-[#3b82f6]/20 transition-colors w-full"
      >
        + Log Workout
      </button>
    </div>
  );
}
