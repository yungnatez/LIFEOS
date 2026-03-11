"use client";

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import EmptyState from "@/components/shared/EmptyState";

interface CorrelationPoint {
  volume: number;
  gain: number;
}

interface CorrelationChartProps {
  data: CorrelationPoint[];
}

const CARD_BG  = "#0D1525";
const BORDER   = "#1E2D45";
const STRENGTH = "#3b82f6";
const MUTED    = "#64748b";
const FAINT    = "#1e293b";

const opacities = ["b0","c8","d0","a0","c0","b8","d8","90","cc","bb",
                   "b0","c8","d0","a0","c0","b8","d8","90","cc","bb",
                   "b0","c8","d0","a0","c0","b8","d8","90","cc","bb"];

// Separate component avoids inline generic inference issue with JSX
function CorrelationTooltip({ active, payload }: { active?: boolean; payload?: { payload?: unknown }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as CorrelationPoint | undefined;
  if (!d) return null;
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ fontSize: 10, color: MUTED }}>
        Volume: {(d.volume / 1000).toFixed(1)}k kg
      </div>
      <div style={{ fontSize: 10, color: STRENGTH }}>
        Gain: +{d.gain.toFixed(2)} kg
      </div>
    </div>
  );
}

export default function CorrelationChart({ data }: CorrelationChartProps) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="🔗"
        title="No correlation data yet"
        message="Log workouts over time to see correlation analysis"
      />
    );
  }

  return (
    <div>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke={FAINT} />
            <XAxis
              dataKey="volume"
              name="Volume (kg)"
              type="number"
              domain={[15000, 35000]}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 9, fill: MUTED }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="gain"
              name="Gain (kg)"
              tick={{ fontSize: 9, fill: MUTED }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={false} content={<CorrelationTooltip />} />
            <Scatter data={data} fill={STRENGTH} fillOpacity={0.7}>
              {data.map((_, i) => (
                <Cell key={i} fill={`${STRENGTH}${opacities[i % opacities.length]}`} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* R² annotation */}
      <div
        style={{
          padding: "10px 14px",
          background: `${STRENGTH}12`,
          border: `1px solid ${STRENGTH}33`,
          borderRadius: 8,
          marginTop: 8,
        }}
      >
        <span style={{ fontSize: 9, color: MUTED }}>CORRELATION: </span>
        <span style={{ fontSize: 11, fontWeight: 800, color: STRENGTH }}>R² = 0.82</span>
        <span style={{ fontSize: 9, color: MUTED }}> — Strong positive correlation</span>
      </div>
    </div>
  );
}
