import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: string; // colour hex e.g. "#14b8a6"
}

export default function Card({ children, className = "", glow }: CardProps) {
  return (
    <div
      className={`bg-[#0D1525] border border-[#1E2D45] rounded-xl p-5 relative overflow-hidden ${className}`}
      style={glow ? { boxShadow: `0 0 30px ${glow}22` } : undefined}
    >
      {children}
    </div>
  );
}
