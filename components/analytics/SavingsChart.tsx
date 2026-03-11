"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import EmptyState from "@/components/shared/EmptyState";

interface SavingsPoint {
  year: string;
  principal: number;
  compound: number;
}

interface SavingsChartProps {
  data: SavingsPoint[];
}

const CARD_BG = "#0D1525";
const BORDER  = "#1E2D45";
const STRENGTH = "#3b82f6";
const HABITS  = "#8b5cf6";
const MUTED   = "#64748b";
const FAINT   = "#1e293b";

export default function SavingsChart({ data }: SavingsChartProps) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="📈"
        title="No financial data yet"
        message="Log finances to see savings forecast"
      />
    );
  }

  const lastYear = data[data.length - 1];
  const lastTotal = lastYear
    ? `£${((lastYear.principal + lastYear.compound) / 1000).toFixed(0)}k Total`
    : "";

  const legend = [
    { color: STRENGTH, label: "Principal" },
    { color: HABITS,   label: "Compounding" },
  ];

  return (
    <div>
      <div style={{ height: 280, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={FAINT} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 9, fill: MUTED }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 9, fill: MUTED }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => `£${Number(value).toLocaleString()}`}
              contentStyle={{
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                fontSize: 10,
              }}
            />
            <Bar dataKey="principal" stackId="a" fill={STRENGTH} radius={[0, 0, 0, 0]} name="Principal" />
            <Bar dataKey="compound"  stackId="a" fill={HABITS}   radius={[4, 4, 0, 0]} name="Compounding" />
          </BarChart>
        </ResponsiveContainer>

        {/* 2034 Target annotation on last bar */}
        {lastYear && (
          <div
            style={{
              position: "absolute",
              right: 2,
              top: 4,
              background: CARD_BG,
              border: `1px solid ${STRENGTH}`,
              borderRadius: 6,
              padding: "6px 10px",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 900, color: STRENGTH, letterSpacing: "0.1em" }}>
              {lastYear.year} TARGET
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{lastTotal}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3">
        {legend.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 9, color: MUTED }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
