"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import EmptyState from "@/components/shared/EmptyState";

interface WeightEntry {
  month: string;
  weight: number;
}

interface PhysiqueCardProps {
  weightData: WeightEntry[];
  bodyFatPct: number | null;
  leanMassKg: number | null;
  onLogWeight?: () => void;
}

export default function PhysiqueCard({
  weightData,
  bodyFatPct,
  leanMassKg,
  onLogWeight,
}: PhysiqueCardProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16" />
          </svg>
          <p className="text-xs font-extrabold text-white uppercase tracking-wider">
            Physique Analytics
          </p>
        </div>
        <span
          className="text-[9px] font-extrabold px-2 py-0.5 rounded"
          style={{
            background: "#14b8a626",
            border: "1px solid #14b8a666",
            color: "#14b8a6",
          }}
        >
          WEEKLY TREND
        </span>
      </div>

      {weightData.length === 0 ? (
        <EmptyState
          icon="⚖️"
          title="No weight entries"
          message="Log your first weigh-in to start tracking"
          action={
            onLogWeight
              ? { label: "+ Log Weight", onClick: onLogWeight }
              : undefined
          }
        />
      ) : (
        <>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weightData}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
                <Tooltip
                  contentStyle={{
                    background: "#0D1525",
                    border: "1px solid #1E2D45",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(val) => [`${val}kg`, "Weight"]}
                  cursor={{ fill: "#14b8a610" }}
                />
                <Bar dataKey="weight" radius={[3, 3, 0, 0]}>
                  {weightData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === weightData.length - 1 ? "#14b8a6" : "#14b8a630"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1e293b]/40 p-3 rounded-lg border border-[#1E2D45]/50">
              <p className="text-[9px] text-[#64748b] font-extrabold uppercase mb-1">
                Body Fat
              </p>
              <p className="text-xl font-black text-white">
                {bodyFatPct !== null ? `${bodyFatPct}%` : "–"}
                {bodyFatPct !== null && (
                  <span className="text-xs text-[#10b981] ml-1">▼0.4</span>
                )}
              </p>
            </div>
            <div className="bg-[#1e293b]/40 p-3 rounded-lg border border-[#1E2D45]/50">
              <p className="text-[9px] text-[#64748b] font-extrabold uppercase mb-1">
                Lean Mass
              </p>
              <p className="text-xl font-black text-white">
                {leanMassKg !== null ? `${leanMassKg}kg` : "–"}
                {leanMassKg !== null && (
                  <span className="text-xs text-[#10b981] ml-1">▲0.2</span>
                )}
              </p>
            </div>
          </div>
        </>
      )}

      <button
        onClick={onLogWeight}
        className="mt-auto text-xs font-extrabold text-[#14b8a6] border border-[#14b8a6]/40 bg-[#14b8a6]/10 px-4 py-2 rounded-lg hover:bg-[#14b8a6]/20 transition-colors w-full"
      >
        + Log Weight
      </button>
    </div>
  );
}
