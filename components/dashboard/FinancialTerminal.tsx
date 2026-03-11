"use client";

interface FinancialAccount {
  id: string;
  label: string;
  currentPence: number;
  targetPence: number;
  icon: "turbo" | "savings";
  color: string;
}

interface FinancialTerminalProps {
  accounts: FinancialAccount[];
  savingsRatePct: number;
  projectedFreedomYear: string;
  onLogFinance?: () => void;
}

function formatPence(p: number) {
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`;
}

const TurboIcon = (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const SavingsIcon = (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.8 1.7-1.5 2-3h1v-4h-2c0-1-.5-1.5-1-2z" />
  </svg>
);

export default function FinancialTerminal({
  accounts,
  savingsRatePct,
  projectedFreedomYear,
  onLogFinance,
}: FinancialTerminalProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <p className="text-xs font-extrabold text-white uppercase tracking-wider">
            Financial Terminal
          </p>
        </div>
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <div className="space-y-4 flex-1">
        {accounts.map((acc) => {
          const pct = Math.min(100, (acc.currentPence / acc.targetPence) * 100);
          const isComplete = pct >= 100;
          return (
            <div key={acc.id} className="flex items-center gap-4">
              <div
                className="size-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${acc.color}20`, color: acc.color }}
              >
                {acc.icon === "turbo" ? TurboIcon : SavingsIcon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-extrabold text-white">
                    {acc.label}
                  </span>
                  <span className="text-[10px] font-extrabold text-[#64748b]">
                    {formatPence(acc.currentPence)} / {formatPence(acc.targetPence)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: isComplete ? "#10b981" : acc.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#1E2D45] pt-4 grid grid-cols-2">
        <div>
          <p className="text-[9px] text-[#64748b] font-extrabold uppercase">
            Projected Freedom
          </p>
          <p className="text-xs font-extrabold text-white">{projectedFreedomYear}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-[#64748b] font-extrabold uppercase">
            Savings Rate
          </p>
          <p className="text-xs font-extrabold text-[#10b981]">{savingsRatePct}%</p>
        </div>
      </div>

      {onLogFinance && (
        <button
          onClick={onLogFinance}
          className="text-xs font-extrabold text-[#f59e0b] border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-2 rounded-lg hover:bg-[#f59e0b]/20 transition-colors w-full"
        >
          + Log Finance
        </button>
      )}
    </div>
  );
}
