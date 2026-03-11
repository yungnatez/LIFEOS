"use client";

import { useState } from "react";

interface LogHabitModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LogHabitModal({ open, onClose }: LogHabitModalProps) {
  const [form, setForm] = useState({
    gym: false,
    diet_adherent: false,
    sleep_hours: "7.5",
    meditation: false,
    deep_work_hours: "4.0",
    vitamin_intake: false,
  });

  if (!open) return null;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const booleanFields: Array<{ key: "gym" | "diet_adherent" | "meditation" | "vitamin_intake"; label: string }> = [
    { key: "gym", label: "Gym Session" },
    { key: "diet_adherent", label: "Diet Adherent" },
    { key: "meditation", label: "Meditation" },
    { key: "vitamin_intake", label: "Vitamins" },
  ];

  const tracked = [
    form.gym,
    form.diet_adherent,
    parseFloat(form.sleep_hours) >= 7.5,
    form.meditation,
    parseFloat(form.deep_work_hours) >= 4,
    form.vitamin_intake,
  ];
  const completed = tracked.filter(Boolean).length;
  const status: "full" | "partial" | "missed" =
    completed === 6 ? "full" : completed > 0 ? "partial" : "missed";

  const statusColors = {
    full: "#10b981",
    partial: "#f59e0b",
    missed: "#ef4444",
  };
  const statusLabels = { full: "FULL", partial: "PARTIAL", missed: "MISSED" };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Log habit:", { ...form, completion_status: status });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D1525] border border-[#1E2D45] rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#64748b]">
            Log Today&apos;s Habits
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
        <p className="text-[10px] text-[#64748b] mb-5">{today}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {booleanFields.map((f) => (
            <div key={f.key} className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-[#f1f5f9]">
                {f.label}
              </span>
              <div className="flex gap-2">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, [f.key]: val }))
                    }
                    className={`px-3 py-1 text-[10px] font-extrabold rounded transition-colors ${
                      form[f.key] === val
                        ? val
                          ? "bg-[#10b981] text-white"
                          : "bg-[#ef4444] text-white"
                        : "bg-[#1e293b] text-[#64748b] hover:bg-[#1e293b]/80"
                    }`}
                  >
                    {val ? "YES" : "NO"}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-[#f1f5f9]">
              Sleep Hours
            </span>
            <input
              type="number"
              step="0.25"
              value={form.sleep_hours}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sleep_hours: e.target.value }))
              }
              className="w-20 bg-[#1e293b] border border-[#1E2D45] rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-[#f1f5f9]">
              Deep Work Hours
            </span>
            <input
              type="number"
              step="0.25"
              value={form.deep_work_hours}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  deep_work_hours: e.target.value,
                }))
              }
              className="w-20 bg-[#1e293b] border border-[#1E2D45] rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          <div className="flex items-center justify-between py-3 mt-2 border-t border-[#1E2D45]">
            <span className="text-[10px] font-extrabold uppercase text-[#64748b]">
              Completion
            </span>
            <span
              className="text-sm font-extrabold"
              style={{ color: statusColors[status] }}
            >
              {statusLabels[status]}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-extrabold text-[#64748b] border border-[#1E2D45] rounded-lg hover:bg-[#1e293b] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-xs font-extrabold text-white bg-[#8b5cf6] rounded-lg hover:bg-[#8b5cf6]/90 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
