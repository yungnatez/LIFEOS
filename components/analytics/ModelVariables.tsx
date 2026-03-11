import ProgressBar from "@/components/shared/ProgressBar";
import Label from "@/components/shared/Label";

interface Variable {
  name: string;
  val: string;
  pct: number;
  color: string;
}

interface ModelVariablesProps {
  variables: Variable[];
  insight?: string;
}

const FAINT  = "#1e293b";
const MUTED  = "#64748b";
const PRIMARY = "#3b86f7";

export default function ModelVariables({ variables, insight }: ModelVariablesProps) {
  return (
    <div className="flex flex-col h-full">
      <Label>Core Model Variables</Label>

      <div className="flex flex-col gap-4 flex-1">
        {variables.map((v) => (
          <div key={v.name}>
            <div className="flex justify-between mb-1.5">
              <span style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>{v.name}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{v.val}</span>
            </div>
            <ProgressBar value={v.pct} color={v.color} height={5} />
          </div>
        ))}
      </div>

      {insight && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: FAINT,
            borderRadius: 8,
            borderLeft: `3px solid ${PRIMARY}`,
          }}
        >
          <p style={{ fontSize: 10, color: MUTED, lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>
            &ldquo;{insight}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
