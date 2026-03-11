import { ReactNode } from "react";

export default function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#64748b] mb-2">
      {children}
    </p>
  );
}
