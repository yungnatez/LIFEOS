"use client";

import { useState, useEffect, useCallback } from "react";
import type { Goal } from "@/lib/supabase/types";

const CAT_COLOR: Record<string, string> = {
  physique: "#14b8a6",
  strength: "#3b82f6",
  finance: "#f59e0b",
  habit: "#8b5cf6",
};

const STATUS_COLOR: Record<string, string> = {
  active: "#10b981",
  complete: "#3b86f7",
  paused: "#64748b",
};

interface GoalFormData {
  title: string;
  category: "physique" | "strength" | "finance" | "habit";
  target_value: string;
  current_value: string;
  start_value: string;
  unit: string;
  target_date: string;
  priority: string;
}

const EMPTY_FORM: GoalFormData = {
  title: "",
  category: "physique",
  target_value: "",
  current_value: "",
  start_value: "",
  unit: "",
  target_date: "",
  priority: "99",
};

export default function GoalManager() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState<GoalFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  }

  function openEdit(g: Goal) {
    setEditing(g);
    setForm({
      title: g.title,
      category: g.category,
      target_value: String(g.target_value),
      current_value: String(g.current_value),
      start_value: String(g.start_value ?? g.current_value),
      unit: g.unit ?? "",
      target_date: g.target_date.slice(0, 10),
      priority: String(g.priority),
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title || !form.target_value || !form.target_date) {
      setError("Title, target value, and date are required.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      category: form.category,
      target_value: parseFloat(form.target_value),
      current_value: parseFloat(form.current_value || "0"),
      start_value: parseFloat(form.start_value || form.current_value || "0"),
      unit: form.unit || null,
      target_date: form.target_date,
      priority: parseInt(form.priority || "99"),
    };

    const url = editing ? `/api/goals/${editing.id}` : "/api/goals";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Save failed");
      setSaving(false);
      return;
    }

    await load();
    setShowModal(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this goal?")) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleStatus(
    id: string,
    status: "active" | "complete" | "paused"
  ) {
    await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase">
          Goals
        </p>
        <button
          onClick={openAdd}
          className="text-xs font-bold bg-[#3b86f7]/10 border border-[#3b86f7]/40 text-[#3b86f7] px-3 py-1.5 rounded-lg hover:bg-[#3b86f7]/20 transition-colors"
        >
          + Add Goal
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 bg-[#1e293b] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-10 text-[#64748b] text-sm">
          No goals yet. Add your first goal to start tracking.
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => {
            const color = CAT_COLOR[g.category] ?? "#64748b";
            const sc = STATUS_COLOR[g.status] ?? "#64748b";
            return (
              <div
                key={g.id}
                className="rounded-xl border border-[#1E2D45] p-4"
                style={{ background: "#060B17" }}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-[0.1em] px-2 py-0.5 rounded"
                        style={{
                          background: `${color}20`,
                          border: `1px solid ${color}40`,
                          color,
                        }}
                      >
                        {g.category}
                      </span>
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-[0.1em] px-2 py-0.5 rounded"
                        style={{
                          background: `${sc}15`,
                          border: `1px solid ${sc}40`,
                          color: sc,
                        }}
                      >
                        {g.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">
                      {g.title}
                    </p>
                    <p className="text-[10px] text-[#64748b] mt-0.5">
                      {g.current_value}
                      {g.unit ? ` ${g.unit}` : ""} /{" "}
                      {g.target_value}
                      {g.unit ? ` ${g.unit}` : ""} · Target{" "}
                      {new Date(g.target_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(g)}
                      className="text-[10px] font-bold text-[#64748b] border border-[#1E2D45] px-2.5 py-1 rounded-lg hover:text-white hover:border-[#64748b] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-[10px] font-bold text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 px-2.5 py-1 rounded-lg hover:bg-[#ef4444]/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, g.progress_pct ?? 0)}%`,
                      background: color,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-[#64748b] font-bold">
                    {Math.round(g.progress_pct ?? 0)}% complete
                  </span>
                  {g.status !== "complete" && (
                    <div className="flex gap-2">
                      {(
                        ["active", "paused", "complete"] as const
                      )
                        .filter((s) => s !== g.status)
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatus(g.id, s)}
                            className="text-[9px] font-bold text-[#64748b] hover:text-white transition-colors capitalize"
                          >
                            → {s}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-xl border border-[#1E2D45] p-6 space-y-4"
            style={{ background: "#0D1525" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {editing ? "Edit Goal" : "Add Goal"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#64748b] hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
                  placeholder="e.g. Reach 90kg Bodyweight"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category: e.target.value as GoalFormData["category"],
                      }))
                    }
                    className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
                  >
                    <option value="physique">Physique</option>
                    <option value="strength">Strength</option>
                    <option value="finance">Finance</option>
                    <option value="habit">Habit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
                    Unit
                  </label>
                  <input
                    value={form.unit}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, unit: e.target.value }))
                    }
                    className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
                    placeholder="kg, £, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={form.target_value}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, target_value: e.target.value }))
                    }
                    className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
                    placeholder="90"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
                    Start Value
                  </label>
                  <input
                    type="number"
                    value={form.start_value}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, start_value: e.target.value }))
                    }
                    className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
                    placeholder="84.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, target_date: e.target.value }))
                    }
                    className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priority: e.target.value }))
                    }
                    className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 text-sm font-bold text-[#64748b] border border-[#1E2D45] py-2 rounded-lg hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 text-sm font-bold bg-[#3b86f7] text-white py-2 rounded-lg hover:bg-[#3b86f7]/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Goal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
