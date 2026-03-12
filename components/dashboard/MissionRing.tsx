"use client";

import { useEffect, useState } from "react";

interface MissionRingProps {
  missionScore: number;
  physiqueScore: number;
  strengthScore: number;
  financeScore: number;
  habitScore: number;
  trend?: string;
}

const rings = [
  { r: 44, color: "#14b8a6", label: "PHY", key: "physique" as const },
  { r: 34, color: "#3b82f6", label: "STR", key: "strength" as const },
  { r: 24, color: "#f59e0b", label: "FIN", key: "finance" as const },
  { r: 14, color: "#8b5cf6", label: "HAB", key: "habits" as const },
];

export default function MissionRing({
  missionScore,
  physiqueScore,
  strengthScore,
  financeScore,
  habitScore,
  trend = "+4% ▲",
}: MissionRingProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const scores: Record<string, number> = {
    physique: physiqueScore,
    strength: strengthScore,
    finance: financeScore,
    habits: habitScore,
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#64748b] mb-4">
        Mission Score
      </p>
      <div className="relative" style={{ width: 160, height: 160 }}>
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          style={{ transform: "rotate(-90deg)" }}
        >
          {rings.map((ring) => {
            const circ = 2 * Math.PI * ring.r;
            const score = scores[ring.key] ?? 0;
            const offset = animated ? circ * (1 - score / 100) : circ;
            return (
              <g key={ring.key}>
                {/* Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={ring.r}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="7"
                />
                {/* Fill */}
                <circle
                  cx="80"
                  cy="80"
                  r={ring.r}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 1.2s ease" }}
                />
              </g>
            );
          })}
        </svg>
        {/* Centre text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: "none" }}
        >
          <span className="text-[38px] font-black text-white leading-none">
            {missionScore}
          </span>
          <span className="text-[9px] font-extrabold text-[#10b981] mt-1">{trend}</span>
        </div>
      </div>
      {/* Legend with per-pillar scores */}
      <div className="grid grid-cols-4 gap-3 mt-6 w-full px-4">
        {rings.map((ring) => (
          <div key={ring.key} className="flex flex-col items-center gap-0.5">
            <span className="size-2 rounded-full" style={{ background: ring.color }} />
            <span className="text-[11px] font-black text-white leading-none">
              {Math.round(scores[ring.key])}
            </span>
            <span className="text-[9px] font-extrabold text-[#64748b]">{ring.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
