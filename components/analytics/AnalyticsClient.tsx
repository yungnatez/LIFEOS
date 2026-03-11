"use client";

import { useState } from "react";
import Card from "@/components/shared/Card";
import Badge from "@/components/shared/Badge";
import Label from "@/components/shared/Label";
import WeightChart from "@/components/analytics/WeightChart";
import StrengthChart from "@/components/analytics/StrengthChart";
import SavingsChart from "@/components/analytics/SavingsChart";
import CorrelationChart from "@/components/analytics/CorrelationChart";
import HabitMatrixFull from "@/components/analytics/HabitMatrixFull";
import ModelVariables from "@/components/analytics/ModelVariables";
import SavingsIntelligence from "@/components/analytics/SavingsIntelligence";

// ── TYPES ─────────────────────────────────────────────────────────────────────
type Tab = "weight" | "savings" | "correlation" | "habits";
type HabitStatus = "full" | "partial" | "missed";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const mockWeightData = [
  { month: "JAN", weight: 91.2 },
  { month: "FEB", weight: 90.4 },
  { month: "MAR", weight: 89.8 },
  { month: "APR", weight: 89.1 },
  { month: "MAY", weight: 88.3 },
  { month: "JUN", weight: 87.6 },
  { month: "JUL", weight: 86.9 },
  { month: "AUG", weight: 85.8 },
  { month: "SEP", weight: 84.5 },
  { month: "OCT", weight: 83.2, forecast: true },
  { month: "NOV", weight: 82.0, forecast: true },
  { month: "DEC", weight: 80.5, forecast: true },
];

const mockSavingsData = [
  { year: "2024", principal: 8500,   compound: 850   },
  { year: "2025", principal: 18200,  compound: 2100  },
  { year: "2026", principal: 29400,  compound: 4800  },
  { year: "2027", principal: 41800,  compound: 9200  },
  { year: "2028", principal: 55600,  compound: 15800 },
  { year: "2029", principal: 71000,  compound: 24500 },
  { year: "2030", principal: 88200,  compound: 35800 },
  { year: "2031", principal: 107500, compound: 50200 },
  { year: "2032", principal: 129000, compound: 68400 },
  { year: "2034", principal: 178000, compound: 114000 },
];

const mockStrengthHistory = [
  { week: "W1", bench: 100, squat: 140, dead: 175 },
  { week: "W2", bench: 102, squat: 142, dead: 178 },
  { week: "W3", bench: 105, squat: 145, dead: 180 },
  { week: "W4", bench: 107, squat: 147, dead: 183 },
  { week: "W5", bench: 110, squat: 150, dead: 185 },
  { week: "W6", bench: 112, squat: 152, dead: 188 },
  { week: "W7", bench: 115, squat: 157, dead: 192 },
  { week: "W8", bench: 115, squat: 160, dead: 195 },
];

const mockCorrelationData = Array.from({ length: 30 }, () => ({
  volume: 18000 + Math.random() * 16000,
  gain:   0.3   + Math.random() * 1.2,
}));

function makeHabitDays(fullProb: number, partialProb: number, count = 90): HabitStatus[] {
  return Array.from({ length: count }, () => {
    const r = Math.random();
    if (r < fullProb) return "full";
    if (r < fullProb + partialProb) return "partial";
    return "missed";
  });
}

const mockHabitData: Record<string, HabitStatus[]> = {
  "Deep Work (4h)":   makeHabitDays(0.65, 0.17),
  "Resistance Train": makeHabitDays(0.88, 0.06),
  "Meditation (20m)": makeHabitDays(0.35, 0.06),
  "Vitamin Intake":   makeHabitDays(0.95, 0.03),
  "Diet Adherent":    makeHabitDays(0.72, 0.12),
  "Sleep ≥ 7.5h":    makeHabitDays(0.60, 0.18),
};

const mockHabitScores: Record<string, number> = {
  "Deep Work (4h)":   82,
  "Resistance Train": 94,
  "Meditation (20m)": 41,
  "Vitamin Intake":   98,
  "Diet Adherent":    72,
  "Sleep ≥ 7.5h":    60,
};

const mockModelVars = [
  { name: "Daily Caloric Deficit", val: "-350 kcal", pct: 65,  color: "#3b86f7" },
  { name: "Activity Multiplier",   val: "1.45x",     pct: 72,  color: "#8b5cf6" },
  { name: "Protein Target",        val: "210g / day", pct: 100, color: "#10b981" },
  { name: "Sleep Quality",         val: "8h 12m",    pct: 85,  color: "#14b8a6" },
];

const mockSavingsMetrics = [
  { label: "Monthly Target",     val: "£1,400",   color: "#f59e0b" },
  { label: "Current Rate",       val: "£1,680",   color: "#10b981" },
  { label: "2034 Projection",    val: "£292,000", color: "#3b86f7" },
  { label: "Financial Freedom",  val: "AUG 2031", color: "#8b5cf6" },
];

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const PRIMARY  = "#3b86f7";
const EMERALD  = "#10b981";
const MUTED    = "#64748b";
const BORDER   = "#1E2D45";
const FAINT    = "#1e293b";

// ── TAB CONFIG ────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string }[] = [
  { id: "weight",      label: "Weight Model" },
  { id: "savings",     label: "Savings Forecast" },
  { id: "correlation", label: "Performance Correlation" },
  { id: "habits",      label: "Habit Matrix" },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function AnalyticsClient() {
  const [activeTab, setActiveTab] = useState<Tab>("weight");

  return (
    <div className="flex flex-col gap-5">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge color={EMERALD}>◉ SYSTEM STATUS: OPTIMAL</Badge>
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Mission Control: Deep Analytics
          </h1>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
            Real-time predictive modeling and cross-domain correlation engine
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            style={{
              padding: "10px 18px",
              background: PRIMARY,
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ⬇ Export Intelligence Report
          </button>
          <button
            style={{
              padding: "10px 18px",
              background: FAINT,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              color: MUTED,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🔄 Re-Sync
          </button>
        </div>
      </div>

      {/* ── TABS ──────────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: `1px solid ${BORDER}`,
          paddingBottom: 0,
        }}
      >
        {TABS.map(({ id, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px 8px 0 0",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                background: active ? `${PRIMARY}18` : "transparent",
                color: active ? PRIMARY : MUTED,
                borderBottom: active ? `2px solid ${PRIMARY}` : "2px solid transparent",
                transition: "all 0.2s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── WEIGHT MODEL ──────────────────────────────────────────────────────── */}
      {activeTab === "weight" && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 320px" }}>
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 16 }}>📊</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                    Weight Prediction Model
                  </span>
                </div>
                <p style={{ fontSize: 10, color: MUTED }}>
                  Projected trend based on current 2,400 kcal/day avg
                </p>
              </div>
              <Badge color={EMERALD}>On Track</Badge>
            </div>
            <WeightChart data={mockWeightData} />
          </Card>

          <Card>
            <ModelVariables
              variables={mockModelVars}
              insight="Your metabolic rate has adjusted +2% over the last 30 days due to increased resistance training frequency."
            />
          </Card>
        </div>
      )}

      {/* ── SAVINGS FORECAST ──────────────────────────────────────────────────── */}
      {activeTab === "savings" && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 320px" }}>
          <Card>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 16 }}>📈</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                  Portfolio Savings Forecast
                </span>
              </div>
              <p style={{ fontSize: 10, color: MUTED }}>
                10-year growth projections at 7% APY
              </p>
            </div>
            <SavingsChart data={mockSavingsData} />
          </Card>

          <Card>
            <SavingsIntelligence
              metrics={mockSavingsMetrics}
              insight="At current rate, you'll hit financial freedom 3 years ahead of schedule. Consider increasing Turbo Fund contributions by 15%."
            />
          </Card>
        </div>
      )}

      {/* ── PERFORMANCE CORRELATION ───────────────────────────────────────────── */}
      {activeTab === "correlation" && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 16 }}>🔗</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                  Cross-Domain Correlation
                </span>
              </div>
              <p style={{ fontSize: 10, color: MUTED }}>
                Training Volume vs Strength Gains Analysis
              </p>
            </div>
            <CorrelationChart data={mockCorrelationData} />
          </Card>

          <Card>
            <Label>Strength Progression</Label>
            <StrengthChart data={mockStrengthHistory} />
          </Card>
        </div>
      )}

      {/* ── HABIT MATRIX ──────────────────────────────────────────────────────── */}
      {activeTab === "habits" && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 16 }}>⊞</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                  Habit Consistency Matrix
                </span>
              </div>
              <p style={{ fontSize: 10, color: MUTED }}>
                12-month cross-habit performance density
              </p>
            </div>

            {/* Legend */}
            <div className="flex gap-4">
              {[
                { c: FAINT,          l: "MISSED" },
                { c: "#8b5cf655",    l: "PARTIAL" },
                { c: "#8b5cf6",      l: "FULL" },
              ].map(({ c, l }) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div
                    style={{ width: 10, height: 10, borderRadius: 2, background: c }}
                  />
                  <span
                    style={{
                      fontSize: 8,
                      color: MUTED,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <HabitMatrixFull data={mockHabitData} scores={mockHabitScores} />
        </Card>
      )}
    </div>
  );
}
