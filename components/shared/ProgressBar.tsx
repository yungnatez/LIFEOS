interface ProgressBarProps {
  value: number; // 0-100
  color: string; // hex
  height?: number; // px, default 6
  glow?: boolean;
}

export default function ProgressBar({ value, color, height = 6, glow = false }: ProgressBarProps) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#1e293b" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: color,
          boxShadow: glow ? `0 0 8px ${color}80` : undefined,
        }}
      />
    </div>
  );
}
