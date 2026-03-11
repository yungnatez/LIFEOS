import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, ReferenceLine
} from "recharts";

// ─── THEME / DESIGN TOKENS ───────────────────────────────────────────────────
const C = {
  bg: "#060B17",
  card: "#0D1525",
  border: "#1E2D45",
  primary: "#3b86f7",
  physique: "#14b8a6",
  strength: "#3b82f6",
  finance: "#f59e0b",
  habits: "#8b5cf6",
  emerald: "#10b981",
  red: "#ef4444",
  text: "#f1f5f9",
  muted: "#64748b",
  faint: "#1e293b",
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const weightData = [
  { month: "JAN", weight: 91.2 }, { month: "FEB", weight: 90.4 },
  { month: "MAR", weight: 89.8 }, { month: "APR", weight: 89.1 },
  { month: "MAY", weight: 88.3 }, { month: "JUN", weight: 87.6 },
  { month: "JUL", weight: 86.9 }, { month: "AUG", weight: 85.8 },
  { month: "SEP", weight: 84.5 }, { month: "OCT", weight: 83.2, forecast: true },
  { month: "NOV", weight: 82.0, forecast: true }, { month: "DEC", weight: 80.5, forecast: true },
];

const savingsData = [
  { year: "2024", principal: 8500, compound: 850 },
  { year: "2025", principal: 18200, compound: 2100 },
  { year: "2026", principal: 29400, compound: 4800 },
  { year: "2027", principal: 41800, compound: 9200 },
  { year: "2028", principal: 55600, compound: 15800 },
  { year: "2029", principal: 71000, compound: 24500 },
  { year: "2030", principal: 88200, compound: 35800 },
  { year: "2031", principal: 107500, compound: 50200 },
  { year: "2032", principal: 129000, compound: 68400 },
  { year: "2034", principal: 178000, compound: 114000 },
];

const physData = [
  { week: "W1", bf: 15.8 }, { week: "W2", bf: 15.6 },
  { week: "W3", bf: 15.4 }, { week: "W4", bf: 15.2 },
  { week: "W5", bf: 15.0 }, { week: "W6", bf: 14.8 },
  { week: "W7", bf: 14.5 }, { week: "W8", bf: 14.2 },
];

const strengthHistory = [
  { week: "W1", bench: 100, squat: 140, dead: 175 },
  { week: "W2", bench: 102, squat: 142, dead: 178 },
  { week: "W3", bench: 105, squat: 145, dead: 180 },
  { week: "W4", bench: 107, squat: 147, dead: 183 },
  { week: "W5", bench: 110, squat: 150, dead: 185 },
  { week: "W6", bench: 112, squat: 152, dead: 188 },
  { week: "W7", bench: 115, squat: 157, dead: 192 },
  { week: "W8", bench: 115, squat: 160, dead: 195 },
];

const correlationData = Array.from({ length: 30 }, (_, i) => ({
  volume: 18000 + Math.random() * 16000,
  gain: 0.3 + Math.random() * 1.2,
  size: 4 + Math.random() * 8,
}));

const habitData = {
  "Deep Work (4h)": Array.from({ length: 90 }, () => Math.random() > 0.18 ? (Math.random() > 0.15 ? "full" : "partial") : "missed"),
  "Resistance Train": Array.from({ length: 90 }, () => Math.random() > 0.06 ? "full" : "missed"),
  "Meditation (20m)": Array.from({ length: 90 }, () => Math.random() > 0.59 ? (Math.random() > 0.3 ? "full" : "partial") : "missed"),
  "Vitamin Intake": Array.from({ length: 90 }, () => Math.random() > 0.02 ? "full" : "missed"),
};
const habitScores = { "Deep Work (4h)": 82, "Resistance Train": 94, "Meditation (20m)": 41, "Vitamin Intake": 98 };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function ring(r) {
  return 2 * Math.PI * r;
}
function offset(r, pct) {
  return ring(r) * (1 - pct / 100);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function MissionRing({ scores }) {
  const total = (scores.physique * 0.4 + scores.strength * 0.25 + scores.finance * 0.25 + scores.habits * 0.1).toFixed(0);
  const rings = [
    { r: 44, color: C.physique, pct: scores.physique, label: "Physique" },
    { r: 34, color: C.strength, pct: scores.strength, label: "Strength" },
    { r: 24, color: C.finance, pct: scores.finance, label: "Finance" },
    { r: 14, color: C.habits, pct: scores.habits, label: "Habits" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase" }}>Mission Score</div>
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
          {rings.map(({ r, color, pct }, i) => (
            <g key={i}>
              <circle cx="80" cy="80" r={r} fill="none" stroke={C.faint} strokeWidth="7" />
              <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="7"
                strokeDasharray={ring(r)} strokeDashoffset={offset(r, pct)}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
            </g>
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: C.emerald, marginTop: 2 }}>+4% ▲</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {rings.map(({ color, label }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 8, color: C.muted, textTransform: "uppercase" }}>{label.slice(0, 3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ children, style, glow }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: 20, position: "relative", overflow: "hidden",
      boxShadow: glow ? `0 0 30px ${glow}22` : "none",
      ...style
    }}>
      {children}
    </div>
  );
}

function Label({ children, color }) {
  return <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: color || C.muted, textTransform: "uppercase", marginBottom: 8 }}>{children}</div>;
}

function ProgressBar({ value, max, color, height = 6 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: "100%", height, background: C.faint, borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.8s ease" }} />
    </div>
  );
}

function Badge({ children, color }) {
  return <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>{children}</span>;
}

function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 16px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
      background: active ? `${C.primary}22` : "transparent",
      color: active ? C.primary : C.muted,
      borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent",
      transition: "all 0.2s"
    }}>{children}</button>
  );
}

// Strategy Visualization Map
function StrategyMap({ milestones }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const total = milestones.length;
  return (
    <div style={{ position: "relative", width: "100%", height: 160, userSelect: "none" }}>
      {/* Path line */}
      <svg width="100%" height="160" style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={C.primary} stopOpacity="0.8" />
            <stop offset="60%" stopColor={C.primary} stopOpacity="0.4" />
            <stop offset="100%" stopColor={C.muted} stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {/* Curved path */}
        <path d="M 40,100 C 120,100 140,60 240,60 C 340,60 370,80 480,75 C 590,70 620,90 720,88 C 820,86 870,100 960,100"
          fill="none" stroke="url(#pathGrad)" strokeWidth="2.5" strokeDasharray="6 4" />
        {/* Completed solid portion */}
        <path d="M 40,100 C 120,100 140,60 240,60 C 340,60 370,80 480,75"
          fill="none" stroke={C.primary} strokeWidth="2.5" filter="url(#glow)" />
      </svg>

      {/* Nodes */}
      {milestones.map((m, i) => {
        const positions = [
          { x: "4%", y: 80 }, { x: "22%", y: 44 }, { x: "46%", y: 56 },
          { x: "68%", y: 68 }, { x: "92%", y: 82 },
        ];
        const pos = positions[i] || { x: `${(i / (total - 1)) * 90 + 5}%`, y: 80 };
        const isActive = i === 1;
        const isPast = i === 0;
        const isFuture = i > 1;
        return (
          <div key={i} style={{ position: "absolute", left: pos.x, top: pos.y - 10, transform: "translateX(-50%)" }}
            onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
            {/* Tooltip */}
            {hoveredIdx === i && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 12px)", left: "50%", transform: "translateX(-50%)",
                background: "#0D1E35", border: `1px solid ${isPast ? C.emerald : isActive ? C.primary : C.muted}`,
                borderRadius: 8, padding: "8px 12px", whiteSpace: "nowrap", zIndex: 10,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: isPast ? C.emerald : isActive ? C.primary : C.muted, marginBottom: 2, letterSpacing: "0.1em" }}>
                  {isPast ? "✓ COMPLETE" : isActive ? "◉ ACTIVE" : "◌ UPCOMING"}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{m.label}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{m.date} · {m.pct}%</div>
              </div>
            )}
            {/* Node */}
            <div style={{
              width: isActive ? 20 : 14, height: isActive ? 20 : 14,
              borderRadius: "50%",
              background: isPast ? C.emerald : isActive ? C.primary : C.faint,
              border: `2px solid ${isPast ? C.emerald : isActive ? C.primary : C.muted}`,
              boxShadow: isActive ? `0 0 16px ${C.primary}88` : "none",
              cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {isPast && <span style={{ color: "#fff", fontSize: 7, fontWeight: 900 }}>✓</span>}
              {isActive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
            </div>
            {/* Label below */}
            <div style={{ textAlign: "center", marginTop: 8, whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: isPast ? C.emerald : isActive ? C.primary : C.muted }}>{m.label}</div>
              <div style={{ fontSize: 7, color: C.muted }}>{m.date}</div>
            </div>
          </div>
        );
      })}

      {/* Start label */}
      <div style={{ position: "absolute", left: "4%", top: 108, transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ fontSize: 8, color: C.muted }}>AUG 01</div>
        <div style={{ fontSize: 8, fontWeight: 700, color: C.muted }}>Project Start</div>
      </div>
      <div style={{ position: "absolute", right: "2%", top: 108, textAlign: "right" }}>
        <div style={{ fontSize: 8, color: C.muted }}>DEC 2024</div>
        <div style={{ fontSize: 8, fontWeight: 700, color: C.muted }}>Final Target</div>
      </div>
    </div>
  );
}

// Habit Heatmap Row
function HabitRow({ name, data, score }) {
  const colorMap = { full: C.habits, partial: `${C.habits}66`, missed: C.faint };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ width: 120, fontSize: 9, fontWeight: 700, color: C.muted, textAlign: "right", flexShrink: 0 }}>{name}</div>
      <div style={{ display: "flex", gap: 2, flex: 1 }}>
        {data.slice(0, 60).map((d, i) => (
          <div key={i} style={{ flex: 1, aspectRatio: "1", borderRadius: 2, background: colorMap[d], boxShadow: d === "full" ? `0 0 4px ${C.habits}55` : "none" }} />
        ))}
      </div>
      <div style={{ width: 32, fontSize: 10, fontWeight: 900, color: score > 80 ? C.emerald : score > 50 ? C.finance : C.red, textAlign: "right", flexShrink: 0 }}>{score}%</div>
    </div>
  );
}

// Custom Tooltip for charts
const ChartTip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0D1E35", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px" }}>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.name}: {p.value}{unit || ""}</div>
      ))}
    </div>
  );
};

// Log Entry Modal
function LogModal({ title, fields, onSave, onClose }) {
  const [vals, setVals] = useState({});
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, minWidth: 340, maxWidth: 420 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 20 }}>{title}</div>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{f.label}</label>
            <input type={f.type || "number"} placeholder={f.placeholder}
              onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
              style={{ width: "100%", background: C.faint, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, cursor: "pointer", fontSize: 12 }}>Cancel</button>
          <button onClick={() => { onSave(vals); onClose(); }} style={{ flex: 1, padding: "10px", background: C.primary, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Save Entry</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function LifeOS() {
  const [page, setPage] = useState("dashboard");
  const [analyticsTab, setAnalyticsTab] = useState("weight");
  const [modal, setModal] = useState(null);
  const [alerts, setAlerts] = useState([
    { id: 1, type: "warning", msg: "Muscle loss risk: Weight loss > 0.8%/week detected. Increase protein intake.", time: "2h ago" },
    { id: 2, type: "info", msg: "Turbo Fund milestone approaching: £2,850 / £3,500", time: "1d ago" },
    { id: 3, type: "success", msg: "14-day gym streak maintained. Consistency score: 94%", time: "Today" },
  ]);
  const [showAlerts, setShowAlerts] = useState(false);

  // Live state data
  const [liveData, setLiveData] = useState({
    weight: 84.5, bodyFat: 14.2, leanMass: 72.4,
    bench: 115, squat: 160, dead: 195,
    protein: 210, carbs: 340, fats: 85, calories: 2850,
    turboFund: 2850, safetyBuffer: 12000,
    scores: { physique: 78, strength: 85, finance: 72, habits: 88 },
  });

  const [weightLog, setWeightLog] = useState(weightData);
  const [notes, setNotes] = useState("");

  const milestones = [
    { label: "Project Start", date: "Aug 01", pct: 100 },
    { label: "Reach 90kg", date: "Sep 12", pct: 80 },
    { label: "Turbo £3.5k", date: "Oct 30", pct: 81 },
    { label: "Reach 85kg", date: "Nov 20", pct: 28 },
    { label: "Final Target", date: "Dec 30", pct: 0 },
  ];

  const missionScore = (
    liveData.scores.physique * 0.4 +
    liveData.scores.strength * 0.25 +
    liveData.scores.finance * 0.25 +
    liveData.scores.habits * 0.1
  ).toFixed(0);

  const commanderBrief = `Body mass trending downward. Strength volume up 7%. Savings rate ahead of schedule. Your trajectory is optimal.`;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "capital", label: "Capital", icon: "💰" },
    { id: "config", label: "Config", icon: "⚙" },
  ];

  const handleLogWeight = (vals) => {
    if (vals.weight) {
      setLiveData(d => ({ ...d, weight: parseFloat(vals.weight) }));
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Space Grotesk', 'DM Mono', system-ui, sans-serif" }}>
      {/* HEADER */}
      <header style={{ borderBottom: `1px solid ${C.border}`, background: `${C.bg}cc`, backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50, padding: "0 24px" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, #6366f1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚀</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.03em", color: "#fff" }}>LIFEOS <span style={{ fontSize: 10, color: `${C.primary}99`, fontWeight: 500 }}>v2.4</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.emerald, animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 8, fontWeight: 800, color: C.muted, letterSpacing: "0.2em", textTransform: "uppercase" }}>System Active</span>
              </div>
            </div>
          </div>
          {/* Nav */}
          <nav style={{ display: "flex", gap: 4 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                background: page === n.id ? `${C.primary}18` : "transparent",
                color: page === n.id ? C.primary : C.muted,
                fontSize: 12, fontWeight: 700,
                borderBottom: page === n.id ? `2px solid ${C.primary}` : "2px solid transparent",
              }}>
                <span>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowAlerts(!showAlerts)} style={{ width: 36, height: 36, borderRadius: 8, background: C.faint, border: `1px solid ${C.border}`, cursor: "pointer", color: C.muted, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>🔔</button>
              <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: C.red, border: `2px solid ${C.bg}` }} />
              {showAlerts && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 340, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, zIndex: 100, boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, marginBottom: 12, letterSpacing: "0.15em", textTransform: "uppercase" }}>Active Alerts</div>
                  {alerts.map(a => (
                    <div key={a.id} style={{ padding: "10px 12px", background: C.faint, borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${a.type === "warning" ? C.red : a.type === "success" ? C.emerald : C.primary}` }}>
                      <div style={{ fontSize: 11, color: C.text, marginBottom: 4 }}>{a.msg}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>{a.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ width: 1, height: 28, background: C.border }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${C.faint}`, border: `1px solid ${C.border}`, borderRadius: 999, padding: "4px 14px 4px 6px" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, #6366f1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>C</div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>COMMANDER</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {page === "dashboard" && (
          <>
            {/* ROW 1: Mission Score + Brief + Objective */}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 280px", gap: 16 }}>
              {/* Mission Score */}
              <Card glow={C.primary}>
                <MissionRing scores={liveData.scores} />
              </Card>

              {/* Commander Brief */}
              <Card>
                <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{ color: C.primary, fontSize: 16 }}>▶</span>
                      <Label>Commander Brief</Label>
                    </div>
                    <p style={{ fontSize: 17, fontWeight: 500, color: "#e2e8f0", lineHeight: 1.65, fontStyle: "italic" }}>
                      "Body mass trending downward. Strength volume up{" "}
                      <span style={{ color: C.strength, fontWeight: 800 }}>7%</span>.{" "}
                      Savings rate ahead of schedule. Your trajectory is optimal."
                    </p>
                  </div>
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 24 }}>
                      <div>
                        <div style={{ fontSize: 8, color: C.muted, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Status</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: C.emerald }}>NOMINAL</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 8, color: C.muted, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Efficiency</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>94.2%</div>
                      </div>
                    </div>
                    <button onClick={() => setPage("analytics")} style={{ fontSize: 10, fontWeight: 800, color: C.primary, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}>FULL INTEL REPORT →</button>
                  </div>
                </div>
              </Card>

              {/* Priority Objective */}
              <Card glow={C.primary} style={{ background: `${C.primary}12`, border: `1px solid ${C.primary}33` }}>
                <Label color={C.primary}>Priority Objective</Label>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Reach 90kg Bodyweight</div>
                <ProgressBar value={84.5} max={90} color={C.primary} height={6} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9, color: C.muted }}>
                  <span>{liveData.weight}kg CURRENT</span><span>90kg TARGET</span>
                </div>
                <div style={{ marginTop: 16, padding: 12, background: `${C.primary}18`, borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⏱</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: C.primary }}>19 Days</div>
                    <div style={{ fontSize: 9, color: C.muted }}>Projected: On track</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ROW 2: Strategy Map */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <Label>Strategy Visualization Map</Label>
                  <div style={{ fontSize: 10, color: C.muted }}>Timeline projection for Q3 – Q4 2024</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ width: 32, height: 32, borderRadius: 8, background: C.faint, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>🔍</button>
                  <button style={{ width: 32, height: 32, borderRadius: 8, background: C.faint, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>⋮</button>
                </div>
              </div>
              <StrategyMap milestones={milestones} />
            </Card>

            {/* ROW 3: Physique + Strength + Finance */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {/* Physique Analytics */}
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: C.physique, fontSize: 16 }}>💪</span>
                    <Label color={C.physique}>Physique Analytics</Label>
                  </div>
                  <Badge color={C.physique}>Weekly Trend</Badge>
                </div>
                <div style={{ height: 100, marginBottom: 12 }}>
                  <ResponsiveContainer>
                    <BarChart data={physData} barSize={8}>
                      <Bar dataKey="bf" fill={C.physique} radius={[2, 2, 0, 0]} />
                      <Tooltip content={<ChartTip unit="%" />} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ padding: "10px 12px", background: C.faint, borderRadius: 8 }}>
                    <div style={{ fontSize: 8, color: C.muted, marginBottom: 4, textTransform: "uppercase" }}>Body Fat</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{liveData.bodyFat}%</div>
                    <div style={{ fontSize: 9, color: C.emerald }}>▼ 0.4</div>
                  </div>
                  <div style={{ padding: "10px 12px", background: C.faint, borderRadius: 8 }}>
                    <div style={{ fontSize: 8, color: C.muted, marginBottom: 4, textTransform: "uppercase" }}>Lean Mass</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{liveData.leanMass}kg</div>
                    <div style={{ fontSize: 9, color: C.emerald }}>▲ 0.2</div>
                  </div>
                </div>
                <button onClick={() => setModal("weight")} style={{ width: "100%", marginTop: 10, padding: "8px", background: `${C.physique}18`, border: `1px solid ${C.physique}44`, borderRadius: 8, color: C.physique, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Log Weight</button>
              </Card>

              {/* Strength Volume */}
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🏋️</span>
                    <Label color={C.strength}>Strength Volume</Label>
                  </div>
                  <span style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>32,400KG</span>
                </div>
                {[
                  { name: "BENCH PRESS", val: `${liveData.bench}kg × 5`, pct: 74 },
                  { name: "SQUAT", val: `${liveData.squat}kg × 3`, pct: 85 },
                  { name: "DEADLIFT", val: `${liveData.dead}kg × 1`, pct: 92 },
                ].map(l => (
                  <div key={l.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: C.muted, letterSpacing: "0.1em" }}>{l.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{l.val}</span>
                    </div>
                    <ProgressBar value={l.pct} max={100} color={C.strength} height={5} />
                  </div>
                ))}
                <div style={{ padding: "12px", background: `${C.strength}18`, border: `1px solid ${C.strength}33`, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>Projected Max (SBD)</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: C.strength }}>485kg</span>
                </div>
                <button onClick={() => setModal("workout")} style={{ width: "100%", marginTop: 10, padding: "8px", background: `${C.strength}18`, border: `1px solid ${C.strength}44`, borderRadius: 8, color: C.strength, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Log Workout</button>
              </Card>

              {/* Financial Terminal */}
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: C.finance, fontSize: 16 }}>💳</span>
                    <Label color={C.finance}>Financial Terminal</Label>
                  </div>
                  <span style={{ fontSize: 14, color: C.muted }}>🔒</span>
                </div>
                {[
                  { name: "Turbo Fund", icon: "🚀", val: liveData.turboFund, max: 3500, color: C.finance },
                  { name: "Safety Buffer", icon: "🛡", val: liveData.safetyBuffer, max: 12000, color: C.emerald },
                ].map(g => (
                  <div key={g.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${g.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{g.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{g.name}</span>
                          <span style={{ fontSize: 10, color: g.color, fontWeight: 800 }}>£{g.val.toLocaleString()} / £{g.max.toLocaleString()}</span>
                        </div>
                        <ProgressBar value={g.val} max={g.max} color={g.color} height={5} />
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 8, color: C.muted, textTransform: "uppercase", marginBottom: 2 }}>Projected Freedom</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.finance }}>AUG 2031</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 8, color: C.muted, textTransform: "uppercase", marginBottom: 2 }}>Savings Rate</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.emerald }}>62%</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ROW 4: Nutrition + Consistency */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
              {/* Nutrition */}
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🍽️</span>
                    <Label>Nutrition Adherence</Label>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[C.emerald, C.emerald, C.red].map((c, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />)}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "Protein", val: liveData.protein + "g", pct: "100%", color: C.emerald },
                    { label: "Carbs", val: liveData.carbs + "g", pct: "92%", color: C.finance },
                    { label: "Fats", val: liveData.fats + "g", pct: "98%", color: C.emerald },
                  ].map(m => (
                    <div key={m.label} style={{ padding: "10px 8px", background: C.faint, borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: 8, color: C.muted, marginBottom: 4, textTransform: "uppercase" }}>{m.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{m.val}</div>
                      <div style={{ fontSize: 9, color: m.color, marginTop: 2 }}>{m.pct}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Daily Calorie Target</span>
                  <span style={{ fontSize: 9, color: "#fff", fontWeight: 800 }}>{liveData.calories.toLocaleString()} / 3,000</span>
                </div>
                <ProgressBar value={liveData.calories} max={3000} color={`${C.emerald}`} height={8} />
                <button onClick={() => setModal("nutrition")} style={{ width: "100%", marginTop: 12, padding: "8px", background: `${C.emerald}18`, border: `1px solid ${C.emerald}44`, borderRadius: 8, color: C.emerald, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Log Nutrition</button>
              </Card>

              {/* Consistency Tracker */}
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: C.habits, fontSize: 16 }}>📅</span>
                    <Label color={C.habits}>Consistency Tracker</Label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {[{ c: C.faint, l: "Missed" }, { c: `${C.habits}44`, l: "Partial" }, { c: C.habits, l: "Full" }].map(({ c, l }) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                        <span style={{ fontSize: 8, color: C.muted }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {Object.entries(habitData).map(([name, data]) => (
                  <HabitRow key={name} name={name} data={data} score={habitScores[name]} />
                ))}
                <div style={{ marginTop: 16, padding: "12px 14px", background: `${C.habits}12`, border: `1px solid ${C.habits}33`, borderRadius: 8 }}>
                  <div style={{ fontSize: 8, fontWeight: 900, color: C.habits, letterSpacing: "0.15em", marginBottom: 6, textTransform: "uppercase" }}>⚡ Strategic Insight</div>
                  <p style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                    Correlation detected: Your <strong>Deep Work</strong> consistency drops by 25% on days following a missed <strong>Meditation</strong> session. Recommend automating morning meditation cues.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                  {[["Gym Streak", "14 DAYS"], ["Sleep Opt.", "8h 12m"], ["Meditation", "5 DAYS"]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 8, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>{l}</span>
                      <span style={{ fontSize: 10, fontWeight: 900, color: C.habits }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* ── ANALYTICS PAGE ── */}
        {page === "analytics" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Badge color={C.emerald}>◉ SYSTEM STATUS: OPTIMAL</Badge>
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", margin: 0 }}>Mission Control: Deep Analytics</h1>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Real-time predictive modeling and cross-domain correlation engine</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ padding: "10px 18px", background: C.primary, border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  ⬇ Export Intelligence Report
                </button>
                <button style={{ padding: "10px 18px", background: C.faint, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  🔄 Re-Sync
                </button>
              </div>
            </div>

            {/* Analytics Tabs */}
            <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
              {["weight", "savings", "correlation", "habits"].map(t => (
                <Pill key={t} active={analyticsTab === t} onClick={() => setAnalyticsTab(t)}>
                  {{ weight: "Weight Model", savings: "Savings Forecast", correlation: "Performance Correlation", habits: "Habit Matrix" }[t]}
                </Pill>
              ))}
            </div>

            {analyticsTab === "weight" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>📊</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Weight Prediction Model</span>
                      </div>
                      <p style={{ fontSize: 10, color: C.muted }}>Projected trend based on current 2,400 kcal/day avg</p>
                    </div>
                    <Badge color={C.emerald}>On Track</Badge>
                  </div>
                  <div style={{ height: 260, position: "relative" }}>
                    <ResponsiveContainer>
                      <AreaChart data={weightLog}>
                        <defs>
                          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={C.strength} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={C.strength} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="wgf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={C.primary} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.faint} />
                        <XAxis dataKey="month" tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                        <YAxis domain={[79, 92]} tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTip unit="kg" />} />
                        <Area type="monotone" dataKey="weight" stroke={C.strength} fill="url(#wg)" strokeWidth={2.5} dot={false} />
                        <ReferenceLine x="OCT" stroke={C.primary} strokeDasharray="4 4" label={{ value: "Forecast", fill: C.primary, fontSize: 9 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    {/* Forecast annotation */}
                    <div style={{ position: "absolute", right: 80, top: 80, background: "#0D1E35", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 8, color: C.primary, fontWeight: 800, marginBottom: 2 }}>FORECAST: OCT 2024</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>83.2 kg</div>
                      <div style={{ fontSize: 9, color: C.emerald, marginTop: 2 }}>Increasing protein 10% → +0.5kg/mo</div>
                    </div>
                  </div>
                </Card>
                <Card>
                  <Label>Core Model Variables</Label>
                  {[
                    { name: "Daily Caloric Deficit", val: "-350 kcal", pct: 65, color: C.primary },
                    { name: "Activity Multiplier", val: "1.45x", pct: 72, color: C.habits },
                    { name: "Protein Target", val: "210g / day", pct: 100, color: C.emerald },
                    { name: "Sleep Quality", val: "8h 12m", pct: 85, color: C.physique },
                  ].map(v => (
                    <div key={v.name} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{v.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{v.val}</span>
                      </div>
                      <ProgressBar value={v.pct} max={100} color={v.color} height={5} />
                    </div>
                  ))}
                  <div style={{ marginTop: 16, padding: 12, background: C.faint, borderRadius: 8, borderLeft: `3px solid ${C.primary}` }}>
                    <p style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, fontStyle: "italic" }}>
                      "Your metabolic rate has adjusted +2% over the last 30 days due to increased resistance training frequency."
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {analyticsTab === "savings" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
                <Card>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>📈</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Portfolio Savings Forecast</span>
                    </div>
                    <p style={{ fontSize: 10, color: C.muted }}>10-year growth projections at 7% APY</p>
                  </div>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={savingsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.faint} />
                        <XAxis dataKey="year" tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => `£${v.toLocaleString()}`} contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
                        <Bar dataKey="principal" stackId="a" fill={C.strength} radius={[0, 0, 0, 0]} name="Principal" />
                        <Bar dataKey="compound" stackId="a" fill={C.habits} radius={[4, 4, 0, 0]} name="Compounding" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                    {[{ c: C.strength, l: "Principal" }, { c: C.habits, l: "Compounding" }].map(({ c, l }) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                        <span style={{ fontSize: 9, color: C.muted }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <Label>Savings Intelligence</Label>
                  {[
                    { label: "Monthly Target", val: "£1,400", color: C.finance },
                    { label: "Current Rate", val: "£1,680", color: C.emerald },
                    { label: "2034 Projection", val: "£292,000", color: C.primary },
                    { label: "Financial Freedom", val: "AUG 2031", color: C.habits },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ padding: "12px 14px", background: C.faint, borderRadius: 8, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color }}>{val}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, padding: 12, background: `${C.finance}12`, border: `1px solid ${C.finance}33`, borderRadius: 8 }}>
                    <div style={{ fontSize: 8, fontWeight: 900, color: C.finance, marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase" }}>AI Insight</div>
                    <p style={{ fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
                      At current rate, you'll hit financial freedom 3 years ahead of schedule. Consider increasing Turbo Fund contributions by 15%.
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {analyticsTab === "correlation" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Card>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>🔗</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Cross-Domain Correlation</span>
                    </div>
                    <p style={{ fontSize: 10, color: C.muted }}>Training Volume vs Strength Gains Analysis</p>
                  </div>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.faint} />
                        <XAxis dataKey="volume" name="Volume (kg)" type="number" domain={[15000, 35000]} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9, fill: C.muted }} axisLine={false} />
                        <YAxis dataKey="gain" name="Gain (kg)" tick={{ fontSize: 9, fill: C.muted }} axisLine={false} />
                        <Tooltip cursor={false} content={({ active, payload }) => active && payload?.length ? (
                          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px" }}>
                            <div style={{ fontSize: 10, color: C.muted }}>Volume: {(payload[0]?.payload?.volume / 1000).toFixed(1)}k kg</div>
                            <div style={{ fontSize: 10, color: C.strength }}>Gain: +{payload[0]?.payload?.gain?.toFixed(2)} kg</div>
                          </div>
                        ) : null} />
                        <Scatter data={correlationData} fill={C.strength} fillOpacity={0.7}>
                          {correlationData.map((_, i) => <Cell key={i} fill={`${C.strength}${Math.floor(50 + Math.random() * 150).toString(16)}`} />)}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ padding: "10px 14px", background: `${C.strength}12`, border: `1px solid ${C.strength}33`, borderRadius: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 9, color: C.muted }}>CORRELATION: </span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.strength }}>R² = 0.82</span>
                    <span style={{ fontSize: 9, color: C.muted }}> — Strong positive correlation</span>
                  </div>
                </Card>
                <Card>
                  <Label>Strength Progression</Label>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer>
                      <LineChart data={strengthHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.faint} />
                        <XAxis dataKey="week" tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 10 }} />
                        <Line type="monotone" dataKey="bench" stroke={C.primary} strokeWidth={2} dot={false} name="Bench" />
                        <Line type="monotone" dataKey="squat" stroke={C.physique} strokeWidth={2} dot={false} name="Squat" />
                        <Line type="monotone" dataKey="dead" stroke={C.finance} strokeWidth={2} dot={false} name="Deadlift" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                    {[{ c: C.primary, l: "Bench" }, { c: C.physique, l: "Squat" }, { c: C.finance, l: "Deadlift" }].map(({ c, l }) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 20, height: 3, borderRadius: 2, background: c }} />
                        <span style={{ fontSize: 9, color: C.muted }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {analyticsTab === "habits" && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>⊞</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Habit Consistency Matrix</span>
                    </div>
                    <p style={{ fontSize: 10, color: C.muted }}>12-month cross-habit performance density</p>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {[{ c: C.faint, l: "MISSED" }, { c: `${C.habits}44`, l: "PARTIAL" }, { c: C.habits, l: "FULL" }].map(({ c, l }) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                        <span style={{ fontSize: 8, color: C.muted, fontWeight: 700, letterSpacing: "0.1em" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  {Object.entries(habitData).map(([name, data]) => (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 130, fontSize: 10, fontWeight: 700, color: C.muted, textAlign: "right", flexShrink: 0 }}>{name}</div>
                      <div style={{ display: "flex", gap: 2, flex: 1 }}>
                        {data.map((d, i) => {
                          const bg = d === "full" ? C.habits : d === "partial" ? `${C.habits}55` : C.faint;
                          return <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: bg, flexShrink: 0, boxShadow: d === "full" ? `0 0 4px ${C.habits}44` : "none" }} />;
                        })}
                      </div>
                      <div style={{ width: 36, fontSize: 11, fontWeight: 900, color: habitScores[name] > 80 ? C.emerald : habitScores[name] > 50 ? C.finance : C.red, textAlign: "right", flexShrink: 0 }}>{habitScores[name]}%</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, padding: "14px 16px", background: `${C.habits}12`, border: `1px solid ${C.habits}33`, borderRadius: 8, borderLeft: `4px solid ${C.habits}` }}>
                  <div style={{ fontSize: 9, fontWeight: 900, color: C.habits, letterSpacing: "0.15em", marginBottom: 8, textTransform: "uppercase" }}>⚡ Strategic Insight</div>
                  <p style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
                    Correlation detected: Your <strong>Deep Work</strong> consistency drops by 25% on days following a missed <strong>Meditation</strong> session. Recommend automating morning meditation cues.
                  </p>
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── CAPITAL PAGE ── */}
        {page === "capital" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>Capital Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                { name: "Total Savings", val: "£14,850", change: "+£680", color: C.emerald },
                { name: "Monthly Inflow", val: "£4,200", change: "+£200 vs target", color: C.primary },
                { name: "Net Worth", val: "£28,400", change: "+12.4% YTD", color: C.finance },
              ].map(c => (
                <Card key={c.name}>
                  <Label>{c.name}</Label>
                  <div style={{ fontSize: 30, fontWeight: 900, color: "#fff" }}>{c.val}</div>
                  <div style={{ fontSize: 10, color: c.color, marginTop: 4 }}>▲ {c.change}</div>
                </Card>
              ))}
            </div>
            <Card>
              <Label>Savings Forecast (10yr)</Label>
              <div style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={savingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.faint} />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => `£${v.toLocaleString()}`} contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
                    <Bar dataKey="principal" stackId="a" fill={C.strength} name="Principal" />
                    <Bar dataKey="compound" stackId="a" fill={C.habits} radius={[4, 4, 0, 0]} name="Compounding" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* ── CONFIG PAGE ── */}
        {page === "config" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>System Configuration</div>
            {[
              { section: "Goals", items: [["Weight Target", "80 kg"], ["Calorie Target", "3,000 kcal"], ["Protein Target", "210 g"]] },
              { section: "Finance", items: [["Turbo Fund Target", "£3,500"], ["Safety Buffer", "£12,000"], ["Monthly Savings Target", "£1,400"]] },
              { section: "Alerts", items: [["Weight loss > 1%/wk", "Enabled"], ["Savings rate below target", "Enabled"], ["Habit consistency < 70%", "Enabled"]] },
            ].map(({ section, items }) => (
              <Card key={section}>
                <Label>{section}</Label>
                {items.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.faint}` }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{v}</span>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 24px", borderTop: `1px solid ${C.border}50`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: C.muted, textTransform: "uppercase" }}>System Entropy: <span style={{ color: C.emerald }}>LOW</span></span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.border, display: "inline-block" }} />
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: C.muted, textTransform: "uppercase" }}>Uptime: 242:14:02</span>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.3em", color: `${C.muted}55`, textTransform: "uppercase" }}>Continuity Protocol Established</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: C.muted }}>LIFEOS v2.4.0</span>
          <div style={{ background: `${C.primary}22`, border: `1px solid ${C.primary}44`, padding: "2px 8px", borderRadius: 6 }}>
            <span style={{ fontSize: 8, fontWeight: 800, color: C.primary }}>ENCRYPTED</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {modal === "weight" && (
        <LogModal title="📊 Log Weight Entry" fields={[
          { key: "weight", label: "Body Weight (kg)", placeholder: "84.5" },
          { key: "bodyFat", label: "Body Fat % (optional)", placeholder: "14.2" },
        ]} onSave={handleLogWeight} onClose={() => setModal(null)} />
      )}
      {modal === "workout" && (
        <LogModal title="🏋️ Log Workout" fields={[
          { key: "bench", label: "Bench Press (kg × reps)", placeholder: "115 × 5" },
          { key: "squat", label: "Squat (kg × reps)", placeholder: "160 × 3" },
          { key: "dead", label: "Deadlift (kg × reps)", placeholder: "195 × 1" },
        ]} onSave={() => {}} onClose={() => setModal(null)} />
      )}
      {modal === "nutrition" && (
        <LogModal title="🍽️ Log Nutrition" fields={[
          { key: "calories", label: "Total Calories", placeholder: "2850" },
          { key: "protein", label: "Protein (g)", placeholder: "210" },
          { key: "carbs", label: "Carbs (g)", placeholder: "340" },
          { key: "fats", label: "Fats (g)", placeholder: "85" },
        ]} onSave={(vals) => {
          if (vals.calories) setLiveData(d => ({ ...d, calories: parseInt(vals.calories) }));
          if (vals.protein) setLiveData(d => ({ ...d, protein: parseInt(vals.protein) }));
        }} onClose={() => setModal(null)} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.faint}; border-radius: 2px; }
        button { font-family: inherit; }
        input { font-family: inherit; }
      `}</style>
    </div>
  );
}
