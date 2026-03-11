"use client";

import { useState, useEffect } from "react";
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

interface WeightChartPoint {
  month: string;
  weight: number;
  forecast?: boolean;
}

interface SavingsPoint {
  year: string;
  principal: number;
  compound: number;
}

interface StrengthPoint {
  week: string;
  bench: number;
  squat: number;
  dead: number;
}

interface CorrelationPoint {
  volume: number;
  gain: number;
}

interface ModelVar {
  name: string;
  val: string;
  pct: number;
  color: string;
}

interface SavingsMetric {
  label: string;
  val: string;
  color: string;
}

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const PRIMARY = "#3b86f7";
const EMERALD = "#10b981";
const MUTED   = "#64748b";
const BORDER  = "#1E2D45";
const FAINT   = "#1e293b";

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

  // Weight tab state
  const [weightData, setWeightData] = useState<WeightChartPoint[]>([]);
  const [modelVars, setModelVars] = useState<ModelVar[]>([]);
  const [weightLoading, setWeightLoading] = useState(false);

  // Savings tab state
  const [savingsData, setSavingsData] = useState<SavingsPoint[]>([]);
  const [savingsMetrics, setSavingsMetrics] = useState<SavingsMetric[]>([]);
  const [savingsInsight, setSavingsInsight] = useState("");
  const [savingsLoading, setSavingsLoading] = useState(false);

  // Correlation / strength tab state
  const [strengthHistory, setStrengthHistory] = useState<StrengthPoint[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationPoint[]>([]);
  const [strengthLoading, setStrengthLoading] = useState(false);

  // Habits tab state
  const [habitMatrix, setHabitMatrix] = useState<Record<string, HabitStatus[]>>({});
  const [habitScores, setHabitScores] = useState<Record<string, number>>({});
  const [habitsLoading, setHabitsLoading] = useState(false);

  // Fetch weight data when weight tab is active
  useEffect(() => {
    if (activeTab !== "weight") return;
    setWeightLoading(true);
    fetch("/api/analytics/weight")
      .then((r) => r.json())
      .then((d: { forecast?: { date: string; weight_kg: number; forecast: boolean }[]; user?: { calorie_target: number; protein_target_g: number } }) => {
        const points: WeightChartPoint[] = (d.forecast ?? []).map((p) => ({
          month: new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase(),
          weight: Math.round(p.weight_kg * 10) / 10,
          forecast: p.forecast,
        }));
        setWeightData(points);
        if (d.user) {
          setModelVars([
            { name: "Calorie Target",  val: `${d.user.calorie_target} kcal`, pct: 75, color: PRIMARY },
            { name: "Protein Target",  val: `${d.user.protein_target_g}g / day`, pct: 100, color: "#10b981" },
            { name: "Activity Multiplier", val: "1.45x", pct: 72, color: "#8b5cf6" },
            { name: "Sleep Quality",   val: "7.5h avg", pct: 80, color: "#14b8a6" },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setWeightLoading(false));
  }, [activeTab]);

  // Fetch savings data when savings tab is active
  useEffect(() => {
    if (activeTab !== "savings") return;
    setSavingsLoading(true);
    fetch("/api/analytics/savings")
      .then((r) => r.json())
      .then((d: { forecast?: SavingsPoint[]; metrics?: SavingsMetric[]; insight?: string }) => {
        setSavingsData(d.forecast ?? []);
        setSavingsMetrics(d.metrics ?? []);
        setSavingsInsight(d.insight ?? "");
      })
      .catch(() => {})
      .finally(() => setSavingsLoading(false));
  }, [activeTab]);

  // Fetch strength / correlation data when correlation tab is active
  useEffect(() => {
    if (activeTab !== "correlation") return;
    setStrengthLoading(true);
    fetch("/api/analytics/strength")
      .then((r) => r.json())
      .then((d: {
        exercises?: { name: string }[];
        strengthHistory?: Record<string, unknown>[];
        correlationData?: CorrelationPoint[];
      }) => {
        const exNames = (d.exercises ?? []).map((e) => e.name);
        const e0 = exNames[0] ?? "Bench Press";
        const e1 = exNames[1] ?? "Squat";
        const e2 = exNames[2] ?? "Deadlift";

        const mapped: StrengthPoint[] = (d.strengthHistory ?? []).map((row) => ({
          week: String(row.week ?? ""),
          bench: (row[e0] as number) ?? 0,
          squat: (row[e1] as number) ?? 0,
          dead: (row[e2] as number) ?? 0,
        }));
        setStrengthHistory(mapped);
        setCorrelationData(d.correlationData ?? []);
      })
      .catch(() => {})
      .finally(() => setStrengthLoading(false));
  }, [activeTab]);

  // Fetch habits data when habits tab is active
  useEffect(() => {
    if (activeTab !== "habits") return;
    setHabitsLoading(true);
    fetch("/api/analytics/habits")
      .then((r) => r.json())
      .then((d: { matrix?: Record<string, HabitStatus[]>; scores?: Record<string, number> }) => {
        setHabitMatrix(d.matrix ?? {});
        setHabitScores(d.scores ?? {});
      })
      .catch(() => {})
      .finally(() => setHabitsLoading(false));
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-5">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge color={EMERALD}>◉ SYSTEM STATUS: OPTIMAL</Badge>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", margin: 0 }}>
            Mission Control: Deep Analytics
          </h1>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
            Real-time predictive modeling and cross-domain correlation engine
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            style={{ padding: "10px 18px", background: PRIMARY, border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            ⬇ Export Intelligence Report
          </button>
          <button
            style={{ padding: "10px 18px", background: FAINT, border: `1px solid ${BORDER}`, borderRadius: 8, color: MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            🔄 Re-Sync
          </button>
        </div>
      </div>

      {/* ── TABS ──────────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${BORDER}`, paddingBottom: 0 }}>
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
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Weight Prediction Model</span>
                </div>
                <p style={{ fontSize: 10, color: MUTED }}>Projected trend based on current intake and training</p>
              </div>
              <Badge color={EMERALD}>On Track</Badge>
            </div>
            {weightLoading ? (
              <div className="h-64 bg-[#1e293b] rounded-lg animate-pulse" />
            ) : (
              <WeightChart data={weightData} />
            )}
          </Card>

          <Card>
            <ModelVariables
              variables={modelVars}
              insight="Your metabolic rate has adjusted due to increased resistance training frequency."
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
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Portfolio Savings Forecast</span>
              </div>
              <p style={{ fontSize: 10, color: MUTED }}>10-year growth projections at 7% APY</p>
            </div>
            {savingsLoading ? (
              <div className="h-64 bg-[#1e293b] rounded-lg animate-pulse" />
            ) : (
              <SavingsChart data={savingsData} />
            )}
          </Card>

          <Card>
            <SavingsIntelligence metrics={savingsMetrics} insight={savingsInsight} />
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
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Cross-Domain Correlation</span>
              </div>
              <p style={{ fontSize: 10, color: MUTED }}>Training Volume vs Strength Gains Analysis</p>
            </div>
            {strengthLoading ? (
              <div className="h-64 bg-[#1e293b] rounded-lg animate-pulse" />
            ) : (
              <CorrelationChart data={correlationData} />
            )}
          </Card>

          <Card>
            <Label>Strength Progression</Label>
            {strengthLoading ? (
              <div className="h-64 bg-[#1e293b] rounded-lg animate-pulse" />
            ) : (
              <StrengthChart data={strengthHistory} />
            )}
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
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Habit Consistency Matrix</span>
              </div>
              <p style={{ fontSize: 10, color: MUTED }}>12-month cross-habit performance density</p>
            </div>
            <div className="flex gap-4">
              {[
                { c: FAINT,       l: "MISSED" },
                { c: "#8b5cf655", l: "PARTIAL" },
                { c: "#8b5cf6",   l: "FULL" },
              ].map(({ c, l }) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                  <span style={{ fontSize: 8, color: MUTED, fontWeight: 700, letterSpacing: "0.1em" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          {habitsLoading ? (
            <div className="h-48 bg-[#1e293b] rounded-lg animate-pulse" />
          ) : (
            <HabitMatrixFull data={habitMatrix} scores={habitScores} />
          )}
        </Card>
      )}
    </div>
  );
}
