"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import EmptyState from "@/components/shared/EmptyState";

export interface WeightPoint {
  label: string;
  actualWeight: number | null;
  forecastWeight: number | null;
}

interface WeightChartProps {
  data: WeightPoint[];
  targetWeight: number | null;
  projectedDate: string | null;   // ISO date when target is hit
  slopeKgPerWeek: number;
  onTrack: boolean | null;
  rSquared: number;
}

const PHYSIQUE = "#14b8a6";
const PRIMARY  = "#3b86f7";
const AMBER    = "#f59e0b";
const BORDER   = "#1E2D45";
const MUTED    = "#64748b";
const FAINT    = "#1e293b";
const EMERALD  = "#10b981";
const RED      = "#ef4444";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number | null; dataKey: string; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const entry = payload.find((p) => p.value != null);
  if (!entry || entry.value == null) return null;
  const isForecast = entry.dataKey === "forecastWeight";
  return (
    <div
      style={{
        background: "#0D1525",
        border: `1px solid ${isForecast ? PRIMARY : PHYSIQUE}40`,
        borderLeft: `3px solid ${isForecast ? PRIMARY : PHYSIQUE}`,
        borderRadius: 8,
        padding: "8px 12px",
      }}
    >
      <div style={{ fontSize: 9, color: MUTED, marginBottom: 3, fontWeight: 700, letterSpacing: "0.1em" }}>
        {isForecast ? "FORECAST" : "RECORDED"} · {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>
        {entry.value.toFixed(1)}
        <span style={{ fontSize: 10, color: MUTED, marginLeft: 2 }}>kg</span>
      </div>
    </div>
  );
};

export default function WeightChart({
  data,
  targetWeight,
  projectedDate,
  slopeKgPerWeek,
  onTrack,
  rSquared,
}: WeightChartProps) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="⚖️"
        title="No weight entries yet"
        message="Log your first weigh-in to start tracking"
      />
    );
  }

  // Dynamic Y domain: cover all actual + forecast values + target, with padding
  const allValues = data
    .flatMap((d) => [d.actualWeight, d.forecastWeight, targetWeight])
    .filter((v): v is number => v != null);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = Math.max(0.5, (maxVal - minVal) * 0.12);
  const yMin = Math.floor((minVal - padding) * 2) / 2;
  const yMax = Math.ceil((maxVal + padding) * 2) / 2;

  // Format projected date for annotation
  const projectedLabel = projectedDate
    ? new Date(projectedDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase()
    : null;

  // Find the last actual weight for the annotation end-point
  const lastForecast = [...data].reverse().find((d) => d.forecastWeight != null);

  const trendColor = slopeKgPerWeek >= 0 ? EMERALD : RED;

  return (
    <div className="relative">
      {/* Chart */}
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={PHYSIQUE} stopOpacity={0.35} />
                <stop offset="95%" stopColor={PHYSIQUE} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={PRIMARY} stopOpacity={0.18} />
                <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={FAINT} vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: MUTED, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 9, fill: MUTED }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}kg`}
              width={46}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Target weight reference line */}
            {targetWeight !== null && (
              <ReferenceLine
                y={targetWeight}
                stroke={AMBER}
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{
                  value: `TARGET ${targetWeight}kg`,
                  position: "insideTopRight",
                  fill: AMBER,
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                }}
              />
            )}

            {/* Actual data area */}
            <Area
              type="monotone"
              dataKey="actualWeight"
              stroke={PHYSIQUE}
              strokeWidth={2.5}
              fill="url(#actualGrad)"
              dot={false}
              activeDot={{ r: 4, fill: PHYSIQUE, strokeWidth: 0 }}
              connectNulls={false}
            />

            {/* Forecast area — dashed line, lighter fill */}
            <Area
              type="monotone"
              dataKey="forecastWeight"
              stroke={PRIMARY}
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="url(#forecastGrad)"
              dot={false}
              activeDot={{ r: 4, fill: PRIMARY, strokeWidth: 0 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats row */}
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span style={{ width: 20, height: 2.5, background: PHYSIQUE, display: "inline-block", borderRadius: 2 }} />
            <span style={{ fontSize: 9, color: MUTED, fontWeight: 700 }}>ACTUAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="20" height="4" style={{ display: "inline-block" }}>
              <line x1="0" y1="2" x2="20" y2="2" stroke={PRIMARY} strokeWidth="2" strokeDasharray="5 3" />
            </svg>
            <span style={{ fontSize: 9, color: MUTED, fontWeight: 700 }}>FORECAST</span>
          </div>
          {targetWeight !== null && (
            <div className="flex items-center gap-1.5">
              <svg width="20" height="4" style={{ display: "inline-block" }}>
                <line x1="0" y1="2" x2="20" y2="2" stroke={AMBER} strokeWidth="1.5" strokeDasharray="4 2" />
              </svg>
              <span style={{ fontSize: 9, color: MUTED, fontWeight: 700 }}>TARGET</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* R² quality indicator */}
          <div style={{ fontSize: 9, color: MUTED, fontWeight: 700 }}>
            MODEL FIT{" "}
            <span style={{ color: rSquared >= 0.7 ? EMERALD : rSquared >= 0.4 ? AMBER : RED }}>
              R²={rSquared.toFixed(2)}
            </span>
          </div>

          {/* Trend rate */}
          <div
            style={{
              fontSize: 9, fontWeight: 800, color: trendColor,
              background: `${trendColor}15`,
              border: `1px solid ${trendColor}40`,
              borderRadius: 4,
              padding: "2px 7px",
              letterSpacing: "0.05em",
            }}
          >
            {slopeKgPerWeek >= 0 ? "+" : ""}{slopeKgPerWeek} KG/WK
          </div>
        </div>
      </div>

      {/* Forecast annotation bubble — shown if we have a projection */}
      {projectedLabel && lastForecast?.forecastWeight != null && (
        <div
          style={{
            position: "absolute",
            right: 56,
            top: 16,
            background: "#0D1525",
            border: `1px solid ${BORDER}`,
            borderTop: `3px solid ${onTrack === true ? EMERALD : onTrack === false ? AMBER : PRIMARY}`,
            borderRadius: 8,
            padding: "10px 14px",
            pointerEvents: "none",
            minWidth: 140,
          }}
        >
          <div style={{ fontSize: 8, color: PRIMARY, fontWeight: 800, marginBottom: 2, letterSpacing: "0.12em" }}>
            FORECAST · {projectedLabel}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
            {lastForecast.forecastWeight.toFixed(1)}{" "}
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>kg</span>
          </div>
          {onTrack !== null && (
            <div style={{ fontSize: 9, color: onTrack ? EMERALD : AMBER, marginTop: 3, fontWeight: 700 }}>
              {onTrack ? "✓ On track for goal" : "⚠ Behind schedule"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
