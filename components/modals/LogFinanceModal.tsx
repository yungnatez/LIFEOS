"use client";

import { useState } from "react";

interface LogFinanceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LogFinanceModal({ open, onClose }: LogFinanceModalProps) {
  const [form, setForm] = useState({
    turbo_fund: "",
    safety_buffer: "",
    investment: "",
    monthly_income: "",
    monthly_expenses: "",
  });

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      turbo_fund_pence: form.turbo_fund
        ? Math.round(parseFloat(form.turbo_fund) * 100)
        : undefined,
      safety_buffer_pence: form.safety_buffer
        ? Math.round(parseFloat(form.safety_buffer) * 100)
        : undefined,
      investment_pence: form.investment
        ? Math.round(parseFloat(form.investment) * 100)
        : undefined,
      monthly_income_pence: form.monthly_income
        ? Math.round(parseFloat(form.monthly_income) * 100)
        : undefined,
      monthly_expenses_pence: form.monthly_expenses
        ? Math.round(parseFloat(form.monthly_expenses) * 100)
        : undefined,
    };
    console.log("Log finance:", data);
    onClose();
  }

  const fields: Array<{ key: keyof typeof form; label: string }> = [
    { key: "turbo_fund", label: "Turbo Fund (£)" },
    { key: "safety_buffer", label: "Safety Buffer (£)" },
    { key: "investment", label: "Investments (£)" },
    { key: "monthly_income", label: "Monthly Income (£)" },
    { key: "monthly_expenses", label: "Monthly Expenses (£)" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D1525] border border-[#1E2D45] rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#64748b]">
            Log Finance
          </p>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-white transition-colors"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#64748b] block mb-2">
                {f.label}
              </label>
              <input
                type="number"
                step="0.01"
                value={form[f.key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                placeholder="0.00"
                className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b] transition-colors"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-extrabold text-[#64748b] border border-[#1E2D45] rounded-lg hover:bg-[#1e293b] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-xs font-extrabold text-white bg-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/90 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
