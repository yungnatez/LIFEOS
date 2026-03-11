"use client";

import { useState } from "react";

interface LogWeightModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LogWeightModal({ open, onClose, onSuccess }: LogWeightModalProps) {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/log/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_kg: parseFloat(weight),
          body_fat_pct: bodyFat ? parseFloat(bodyFat) : undefined,
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D1525] border border-[#1E2D45] rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#64748b]">
            Log Weight
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
          <div>
            <label className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#64748b] block mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="84.5"
              required
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3b86f7] transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#64748b] block mb-2">
              Body Fat % (optional)
            </label>
            <input
              type="number"
              step="0.1"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="14.2"
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3b86f7] transition-colors"
            />
          </div>
          {error && (
            <p className="text-xs text-[#ef4444]">{error}</p>
          )}
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
              className="flex-1 px-4 py-2 text-xs font-extrabold text-white bg-[#3b86f7] rounded-lg hover:bg-[#3b86f7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
