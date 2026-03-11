interface BadgeProps {
  children: React.ReactNode;
  color: string; // hex colour
  className?: string;
}

export default function Badge({ children, color, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-[0.1em] ${className}`}
      style={{
        background: `${color}26`,
        border: `1px solid ${color}66`,
        color: color,
      }}
    >
      {children}
    </span>
  );
}
