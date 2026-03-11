"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import EmptyState from "@/components/shared/EmptyState";

interface WeightPoint {
  month: string;
  weight: number;
  forecast?: boolean;
}

interface WeightChartProps {
  data: WeightPoint[];
}

const BORDER  = "#1E2D45";
const STRENGTH = "#3b82f6";
const PRIMARY  = "#3b86f7";
const MUTED   = "#64748b";
const FAINT   = "#1e293b";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0D1E35", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: STRENGTH }}>{payload[0].value}kg</div>
    </div>
  );
};

export default function WeightChart({ data }: WeightChartProps) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="⚖️"
        title="No weight entries yet"
        message="Log your first weigh-in to start tracking"
      />
    );
  }

  const forecastStart = data.find(d => d.forecast)?.month;

  return (
    <div className="relative">
      <div style={{ height: 260, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={STRENGTH} stopOpacity={0.4} />
                <stop offset="95%" stopColor={STRENGTH} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="wgf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.2} />
                <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={FAINT} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9, fill: MUTED }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[79, 92]}
              tick={{ fontSize: 9, fill: MUTED }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="weight"
              stroke={STRENGTH}
              fill="url(#wg)"
              strokeWidth={2.5}
              dot={false}
            />
            {forecastStart && (
              <ReferenceLine
                x={forecastStart}
                stroke={PRIMARY}
                strokeDasharray="4 4"
                label={{ value: "Forecast", fill: PRIMARY, fontSize: 9 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Forecast annotation bubble */}
        <div
          style={{
            position: "absolute",
            right: 80,
            top: 60,
            background: "#0D1E35",
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "10px 14px",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 8, color: PRIMARY, fontWeight: 800, marginBottom: 2, letterSpacing: "0.1em" }}>
            FORECAST: OCT 2024
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>83.2 kg</div>
          <div style={{ fontSize: 9, color: "#10b981", marginTop: 2 }}>
            Increasing protein 10% → +0.5kg/mo
          </div>
        </div>
      </div>
    </div>
  );
}
