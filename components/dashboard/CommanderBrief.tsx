interface CommanderBriefProps {
  brief: string;
  status: string;
  efficiency: number;
}

export default function CommanderBrief({ brief, status, efficiency }: CommanderBriefProps) {
  const isNominal = status === "NOMINAL";
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#3b86f7"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#64748b]">
            Commander Brief
          </p>
        </div>
        <p className="text-xl font-medium text-[#f1f5f9] leading-relaxed italic">
          &ldquo;{brief}&rdquo;
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-[#1E2D45]/50 flex items-center justify-between">
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] text-[#64748b] uppercase font-extrabold">Status</p>
            <p
              className={`text-sm font-extrabold ${
                isNominal ? "text-[#10b981]" : "text-[#f59e0b]"
              }`}
            >
              {status}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#64748b] uppercase font-extrabold">Efficiency</p>
            <p className="text-sm font-extrabold text-white">{efficiency.toFixed(1)}%</p>
          </div>
        </div>
        <button className="text-xs font-extrabold text-[#3b86f7] hover:underline uppercase tracking-widest">
          Full Intel Report →
        </button>
      </div>
    </div>
  );
}
