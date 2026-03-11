"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/shared/Nav";
import Footer from "@/components/shared/Footer";
import Card from "@/components/shared/Card";
import SavingsChart from "@/components/analytics/SavingsChart";
import type { Finance, Goal } from "@/lib/supabase/types";
import type { SavingsDataPoint } from "@/lib/supabase/types";
import { formatPence, formatPct } from "@/lib/utils/format";

interface SavingsMetric {
  label: string;
  val: string;
  color: string;
}

interface SavingsApiResponse {
  forecast: SavingsDataPoint[];
  metrics: SavingsMetric[];
  finances: Finance | null;
  goals: Goal[];
  insight: string;
}

export default function CapitalPage() {
  const [data, setData] = useState<SavingsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/savings")
      .then((r) => r.json())
      .then((d: SavingsApiResponse) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const f = data?.finances;
  const totalSavings = f
    ? f.turbo_fund_pence + f.safety_buffer_pence + f.investment_pence
    : null;
  const monthlySurplus =
    f?.monthly_income_pence && f?.monthly_expenses_pence
      ? f.monthly_income_pence - f.monthly_expenses_pence
      : null;

  const accounts = f
    ? [
        { label: "Turbo Fund", value: f.turbo_fund_pence, color: "#f59e0b" },
        {
          label: "Safety Buffer",
          value: f.safety_buffer_pence,
          color: "#10b981",
        },
        {
          label: "Investment",
          value: f.investment_pence,
          color: "#3b86f7",
        },
      ]
    : [];

  return (
    <>
      <Nav />
      <main className="max-w-[1440px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="size-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase">
              Financial Terminal
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Capital Overview</h1>
          <p className="text-xs text-[#64748b] mt-1">
            Savings intelligence and 10-year wealth projection
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6">
          {/* Total Savings */}
          <Card glow="#f59e0b">
            <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase mb-3">
              Total Savings
            </p>
            {loading ? (
              <div className="h-8 bg-[#1e293b] rounded animate-pulse" />
            ) : (
              <>
                <p className="text-3xl font-black text-white">
                  {totalSavings != null ? formatPence(totalSavings) : "—"}
                </p>
                <p className="text-[10px] text-[#64748b] mt-1">
                  Across all accounts
                </p>
              </>
            )}
          </Card>

          {/* Monthly Inflow */}
          <Card glow="#10b981">
            <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase mb-3">
              Monthly Net Inflow
            </p>
            {loading ? (
              <div className="h-8 bg-[#1e293b] rounded animate-pulse" />
            ) : (
              <>
                <p className="text-3xl font-black text-white">
                  {monthlySurplus != null ? formatPence(monthlySurplus) : "—"}
                </p>
                <p className="text-[10px] text-[#64748b] mt-1">
                  Income minus expenses
                </p>
              </>
            )}
          </Card>

          {/* Savings Rate */}
          <Card glow="#3b86f7">
            <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase mb-3">
              Savings Rate
            </p>
            {loading ? (
              <div className="h-8 bg-[#1e293b] rounded animate-pulse" />
            ) : (
              <>
                <p className="text-3xl font-black text-white">
                  {f?.savings_rate_pct != null
                    ? formatPct(f.savings_rate_pct)
                    : "—"}
                </p>
                <p className="text-[10px] text-[#64748b] mt-1">
                  Of monthly income
                </p>
              </>
            )}
          </Card>
        </div>

        {/* 10-Year Savings Forecast */}
        <Card>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase mb-1">
                10-Year Projection
              </p>
              <p className="text-sm font-bold text-white">
                Savings Forecast
              </p>
            </div>
            <span className="text-[9px] font-extrabold px-2 py-1 rounded bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981]">
              On Track
            </span>
          </div>
          {loading ? (
            <div className="h-72 bg-[#1e293b] rounded-xl animate-pulse" />
          ) : (
            <SavingsChart data={data?.forecast ?? []} />
          )}
        </Card>

        {/* Account Balances + Goals */}
        <div className="grid grid-cols-2 gap-6">
          {/* Accounts */}
          <Card>
            <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase mb-4">
              Account Balances
            </p>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-[#1e293b] rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-xs text-[#64748b] text-center py-6">
                No financial data yet. Log your first entry.
              </p>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => {
                  const total = accounts.reduce((s, a) => s + a.value, 0);
                  const pct = total > 0 ? (acc.value / total) * 100 : 0;
                  return (
                    <div key={acc.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: acc.color }}
                          />
                          <span className="text-xs font-bold text-white">
                            {acc.label}
                          </span>
                        </div>
                        <span className="text-xs font-black text-white">
                          {formatPence(acc.value)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: acc.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Financial Goals */}
          <Card>
            <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase mb-4">
              Financial Goals
            </p>
            {loading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-[#1e293b] rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : !data?.goals?.length ? (
              <p className="text-xs text-[#64748b] text-center py-6">
                No financial goals set.
              </p>
            ) : (
              <div className="space-y-4">
                {data.goals.map((g) => (
                  <div key={g.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {g.title}
                      </span>
                      <span className="text-xs font-black text-[#f59e0b] shrink-0 ml-2">
                        {g.unit
                          ? `${g.current_value}${g.unit}`
                          : String(g.current_value)}{" "}
                        /{" "}
                        {g.unit
                          ? `${g.target_value}${g.unit}`
                          : String(g.target_value)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#f59e0b]"
                        style={{
                          width: `${Math.min(100, g.progress_pct ?? 0)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-[#64748b]">
                        {Math.round(g.progress_pct ?? 0)}% complete
                      </span>
                      <span className="text-[9px] text-[#64748b]">
                        Target{" "}
                        {new Date(g.target_date).toLocaleDateString("en-GB", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* AI Insight */}
        {data?.insight && (
          <Card>
            <div className="flex items-start gap-3">
              <div
                className="w-1 self-stretch rounded-full shrink-0"
                style={{ background: "#8b5cf6" }}
              />
              <div>
                <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#8b5cf6] uppercase mb-1">
                  Savings Intelligence
                </p>
                <p className="text-sm text-[#f1f5f9]">{data.insight}</p>
              </div>
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </>
  );
}
