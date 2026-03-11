"use client";

import { useState, useEffect } from "react";
import type { User } from "@/lib/supabase/types";

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    calorie_target: "",
    protein_target_g: "",
    weight_goal_kg: "",
    weight_direction: "gain",
    savings_apy_pct: "",
    monthly_savings_target_pounds: "",
  });

  useEffect(() => {
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((data: User) => {
        setForm({
          name: data.name ?? "",
          calorie_target: String(data.calorie_target ?? ""),
          protein_target_g: String(data.protein_target_g ?? ""),
          weight_goal_kg: data.weight_goal_kg != null ? String(data.weight_goal_kg) : "",
          weight_direction: data.weight_direction ?? "gain",
          savings_apy_pct: String(data.savings_apy_pct ?? ""),
          monthly_savings_target_pounds: String(
            Math.round((data.monthly_savings_target_pence ?? 0) / 100)
          ),
        });
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        calorie_target: parseInt(form.calorie_target),
        protein_target_g: parseInt(form.protein_target_g),
        weight_goal_kg: form.weight_goal_kg
          ? parseFloat(form.weight_goal_kg)
          : null,
        weight_direction: form.weight_direction,
        savings_apy_pct: parseFloat(form.savings_apy_pct),
        monthly_savings_target_pence: Math.round(
          parseFloat(form.monthly_savings_target_pounds) * 100
        ),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Save failed");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-[#1e293b] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-lg">
      <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase mb-4">
        Profile Settings
      </p>

      {/* Identity */}
      <div>
        <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
          Commander Name
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
          placeholder="Commander"
        />
      </div>

      {/* Nutrition */}
      <div className="border-t border-[#1E2D45] pt-5">
        <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#14b8a6] uppercase mb-3">
          Nutrition Targets
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
              Daily Calories
            </label>
            <input
              type="number"
              value={form.calorie_target}
              onChange={(e) =>
                setForm((f) => ({ ...f, calorie_target: e.target.value }))
              }
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
              placeholder="3000"
            />
          </div>
          <div>
            <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
              Daily Protein (g)
            </label>
            <input
              type="number"
              value={form.protein_target_g}
              onChange={(e) =>
                setForm((f) => ({ ...f, protein_target_g: e.target.value }))
              }
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
              placeholder="210"
            />
          </div>
        </div>
      </div>

      {/* Physique */}
      <div className="border-t border-[#1E2D45] pt-5">
        <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#14b8a6] uppercase mb-3">
          Physique Target
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
              Goal Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.weight_goal_kg}
              onChange={(e) =>
                setForm((f) => ({ ...f, weight_goal_kg: e.target.value }))
              }
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
              placeholder="90"
            />
          </div>
          <div>
            <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
              Direction
            </label>
            <select
              value={form.weight_direction}
              onChange={(e) =>
                setForm((f) => ({ ...f, weight_direction: e.target.value }))
              }
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
            >
              <option value="gain">Gain</option>
              <option value="lose">Lose</option>
              <option value="maintain">Maintain</option>
            </select>
          </div>
        </div>
      </div>

      {/* Finance */}
      <div className="border-t border-[#1E2D45] pt-5">
        <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#f59e0b] uppercase mb-3">
          Finance Settings
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
              Monthly Savings Target (£)
            </label>
            <input
              type="number"
              value={form.monthly_savings_target_pounds}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  monthly_savings_target_pounds: e.target.value,
                }))
              }
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
              placeholder="1400"
            />
          </div>
          <div>
            <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
              Investment APY (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.savings_apy_pct}
              onChange={(e) =>
                setForm((f) => ({ ...f, savings_apy_pct: e.target.value }))
              }
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
              placeholder="7.00"
            />
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="border-t border-[#1E2D45] pt-5">
        <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase mb-3">
          Integrations
        </p>
        <div
          className="flex items-center justify-between p-4 rounded-xl border border-[#1E2D45]"
          style={{ background: "#060B17" }}
        >
          <div>
            <p className="text-sm font-bold text-white">Actual Budget</p>
            <p className="text-xs text-[#64748b] mt-0.5">Manual entry active</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-extrabold px-2 py-1 rounded bg-[#1e293b] border border-[#1E2D45] text-[#64748b]">
              Not Connected
            </span>
            <span className="text-[9px] text-[#3b86f7]">Learn how →</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg px-3 py-2">
          Profile saved successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-[#3b86f7] text-white font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-[#3b86f7]/90 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
