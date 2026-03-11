import Label from "@/components/shared/Label";

interface MetricTile {
  label: string;
  val: string;
  color: string;
}

interface SavingsIntelligenceProps {
  metrics: MetricTile[];
  insight?: string;
}

const FAINT   = "#1e293b";
const MUTED   = "#64748b";
const FINANCE = "#f59e0b";

export default function SavingsIntelligence({ metrics, insight }: SavingsIntelligenceProps) {
  return (
    <div>
      <Label>Savings Intelligence</Label>

      <div className="flex flex-col gap-2">
        {metrics.map(({ label, val, color }) => (
          <div
            key={label}
            style={{
              padding: "12px 14px",
              background: FAINT,
              borderRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color }}>{val}</span>
          </div>
        ))}
      </div>

      {insight && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: `${FINANCE}12`,
            border: `1px solid ${FINANCE}33`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              color: FINANCE,
              marginBottom: 6,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            AI Insight
          </div>
          <p style={{ fontSize: 10, color: MUTED, lineHeight: 1.6, margin: 0 }}>
            {insight}
          </p>
        </div>
      )}
    </div>
  );
}
