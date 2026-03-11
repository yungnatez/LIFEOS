"use client";

import { useState } from "react";

interface LogNutritionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LogNutritionModal({ open, onClose, onSuccess }: LogNutritionModalProps) {
  const [form, setForm] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/log/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: parseInt(form.calories),
          protein_g: form.protein ? parseFloat(form.protein) : undefined,
          carbs_g: form.carbs ? parseFloat(form.carbs) : undefined,
          fats_g: form.fats ? parseFloat(form.fats) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  const fields: Array<{
    key: keyof typeof form;
    label: string;
    unit: string;
    placeholder: string;
    step: string;
  }> = [
    { key: "calories", label: "Calories", unit: "kcal", placeholder: "2850", step: "1" },
    { key: "protein", label: "Protein", unit: "g", placeholder: "210", step: "0.1" },
    { key: "carbs", label: "Carbs", unit: "g", placeholder: "340", step: "0.1" },
    { key: "fats", label: "Fats", unit: "g", placeholder: "85", step: "0.1" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D1525] border border-[#1E2D45] rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#64748b]">
            Log Nutrition
          </p>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-white transition-colors"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#64748b] block mb-2">
                {f.label} ({f.unit})
              </label>
              <input
                type="number"
                step={f.step}
                value={form[f.key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                required={f.key === "calories"}
                className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b] transition-colors"
              />
            </div>
          ))}
          {error && <p className="text-xs text-[#ef4444]">{error}</p>}
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
              disabled={submitting}
              className="flex-1 px-4 py-2 text-xs font-extrabold text-white bg-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
