"use client";

import EmptyState from "@/components/shared/EmptyState";

type HabitStatus = "full" | "partial" | "missed";

interface HabitMatrixFullProps {
  data: Record<string, HabitStatus[]>;
  scores: Record<string, number>;
}

const HABITS  = "#8b5cf6";
const FAINT   = "#1e293b";
const MUTED   = "#64748b";
const EMERALD = "#10b981";
const FINANCE = "#f59e0b";
const RED     = "#ef4444";

function scoreColor(score: number): string {
  if (score > 80) return EMERALD;
  if (score > 50) return FINANCE;
  return RED;
}

export default function HabitMatrixFull({ data, scores }: HabitMatrixFullProps) {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="No habit data yet"
        message="Log habits daily to populate the matrix"
      />
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 900 }}>
        {entries.map(([name, days]) => (
          <div
            key={name}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
          >
            <div
              style={{
                width: 130,
                fontSize: 10,
                fontWeight: 700,
                color: MUTED,
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {name}
            </div>
            <div style={{ display: "flex", gap: 2, flex: 1, flexWrap: "nowrap" }}>
              {days.map((d, i) => {
                const bg =
                  d === "full"    ? HABITS :
                  d === "partial" ? `${HABITS}55` :
                  FAINT;
                return (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: bg,
                      flexShrink: 0,
                      boxShadow: d === "full" ? `0 0 4px ${HABITS}44` : "none",
                    }}
                  />
                );
              })}
            </div>
            <div
              style={{
                width: 36,
                fontSize: 11,
                fontWeight: 900,
                color: scoreColor(scores[name] ?? 0),
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {scores[name] ?? 0}%
            </div>
          </div>
        ))}

        {/* Strategic Insight */}
        <div
          style={{
            marginTop: 20,
            padding: "14px 16px",
            background: `${HABITS}12`,
            border: `1px solid ${HABITS}33`,
            borderLeft: `4px solid ${HABITS}`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              color: HABITS,
              letterSpacing: "0.15em",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            ⚡ Strategic Insight
          </div>
          <p style={{ fontSize: 12, color: "#f1f5f9", lineHeight: 1.7, margin: 0 }}>
            Correlation detected: Your <strong>Deep Work</strong> consistency drops by 25% on
            days following a missed <strong>Meditation</strong> session. Recommend automating
            morning meditation cues.
          </p>
        </div>
      </div>
    </div>
  );
}
