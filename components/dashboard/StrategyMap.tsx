"use client";

import { useState } from "react";

interface Milestone {
  id: string;
  title: string;
  date: string;
  status: "complete" | "active" | "upcoming";
  progress: number;
  color: string;
  xPct: number; // 0-100 position along path
}

interface StrategyMapProps {
  milestones: Milestone[];
}

const statusColors = {
  complete: "#10b981",
  active: "#3b86f7",
  upcoming: "#64748b",
};
const statusLabels = {
  complete: "COMPLETE",
  active: "ACTIVE",
  upcoming: "UPCOMING",
};

// Approximate y position along the cubic bezier path for a given x percentage (0–100)
function getPathY(xPct: number): number {
  return 80 + Math.sin((xPct / 100) * Math.PI * 1.5) * 30;
}

export default function StrategyMap({ milestones }: StrategyMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="relative w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#64748b]">
            Strategy Visualization Map
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            Timeline projection for Q3 – Q4 2024
          </p>
        </div>
        <div className="flex gap-2">
          <button className="size-8 bg-[#1e293b] rounded flex items-center justify-center text-[#64748b] hover:text-white transition-colors">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <button className="size-8 bg-[#1e293b] rounded flex items-center justify-center text-[#64748b] hover:text-white transition-colors">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative" style={{ height: 160 }}>
        <svg
          width="100%"
          height="160"
          preserveAspectRatio="none"
          viewBox="0 0 1000 160"
        >
          <defs>
            <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b86f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Dashed future path */}
          <path
            d="M 0 80 C 200 50 400 110 500 80 C 650 50 800 110 1000 80"
            fill="none"
            stroke="url(#pathGrad)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            opacity="0.4"
          />
          {/* Solid completed path */}
          <path
            d="M 0 80 C 200 50 400 110 500 80"
            fill="none"
            stroke="#3b86f7"
            strokeWidth="2.5"
            filter="url(#glow)"
          />
        </svg>

        {/* Milestone nodes */}
        {milestones.map((m) => {
          const yPx = getPathY(m.xPct);
          const color = statusColors[m.status];
          const isHovered = hoveredId === m.id;
          const isActive = m.status === "active";
          const isComplete = m.status === "complete";

          return (
            <div
              key={m.id}
              className="absolute"
              style={{
                left: `${m.xPct}%`,
                top: yPx,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Pulse ring for active */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: color, opacity: 0.3, margin: -6 }}
                />
              )}
              <div
                className="rounded-full flex items-center justify-center cursor-pointer relative z-10"
                style={{
                  width: isActive ? 20 : 14,
                  height: isActive ? 20 : 14,
                  background: isComplete || isActive ? color : "#1e293b",
                  border: `${isActive ? 3 : 2}px solid ${
                    isComplete || isActive ? color : "#64748b"
                  }`,
                  boxShadow:
                    isComplete || isActive
                      ? `0 0 16px ${color}80`
                      : undefined,
                }}
              >
                {isComplete && (
                  <svg
                    width="8"
                    height="8"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    viewBox="0 0 10 10"
                  >
                    <polyline points="2 5 4 7 8 3" />
                  </svg>
                )}
                {isActive && (
                  <div className="size-2 rounded-full bg-white" />
                )}
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute z-20 w-36 bg-[#0D1525] rounded-lg overflow-hidden shadow-2xl"
                  style={{
                    bottom: "calc(100% + 12px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    border: `1px solid ${color}40`,
                    borderTopColor: color,
                    borderTopWidth: 2,
                  }}
                >
                  <div className="p-2">
                    <p
                      className="text-[9px] font-extrabold uppercase"
                      style={{ color }}
                    >
                      {statusLabels[m.status]}
                    </p>
                    <p className="text-xs font-extrabold text-white mt-0.5">
                      {m.title}
                    </p>
                    <p className="text-[9px] text-[#64748b] mt-1">
                      {m.date} · {m.progress}%
                    </p>
                  </div>
                </div>
              )}

              {/* Label below node */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <p className="text-[8px] font-extrabold" style={{ color }}>
                  {m.title}
                </p>
                <p className="text-[7px] text-[#64748b]">{m.date}</p>
              </div>
            </div>
          );
        })}

        {/* Footer labels */}
        <div className="absolute bottom-0 left-0">
          <p className="text-[8px] text-[#64748b]">AUG 01 / Project Start</p>
        </div>
        <div className="absolute bottom-0 right-0 text-right">
          <p className="text-[8px] text-[#64748b]">DEC 2024 / Final Target</p>
        </div>
      </div>
    </div>
  );
}
