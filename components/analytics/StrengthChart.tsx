"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import EmptyState from "@/components/shared/EmptyState";

interface StrengthPoint {
  week: string;
  bench: number;
  squat: number;
  dead: number;
}

interface StrengthChartProps {
  data: StrengthPoint[];
}

const CARD_BG = "#0D1525";
const BORDER  = "#1E2D45";
const PRIMARY  = "#3b86f7";
const PHYSIQUE = "#14b8a6";
const FINANCE  = "#f59e0b";
const MUTED   = "#64748b";
const FAINT   = "#1e293b";

export default function StrengthChart({ data }: StrengthChartProps) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="🏋️"
        title="No workout data yet"
        message="Log workouts to see strength progression"
      />
    );
  }

  const legend = [
    { color: PRIMARY,  label: "Bench" },
    { color: PHYSIQUE, label: "Squat" },
    { color: FINANCE,  label: "Deadlift" },
  ];

  return (
    <div>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={FAINT} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 9, fill: MUTED }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: MUTED }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                fontSize: 10,
              }}
            />
            <Line
              type="monotone"
              dataKey="bench"
              stroke={PRIMARY}
              strokeWidth={2}
              dot={false}
              name="Bench"
            />
            <Line
              type="monotone"
              dataKey="squat"
              stroke={PHYSIQUE}
              strokeWidth={2}
              dot={false}
              name="Squat"
            />
            <Line
              type="monotone"
              dataKey="dead"
              stroke={FINANCE}
              strokeWidth={2}
              dot={false}
              name="Deadlift"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3">
        {legend.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 20, height: 3, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 9, color: MUTED }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
