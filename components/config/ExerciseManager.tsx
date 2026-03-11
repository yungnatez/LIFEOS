"use client";

import { useState, useEffect, useCallback } from "react";
import type { Exercise } from "@/lib/supabase/types";

const EQUIPMENT_ICON: Record<string, string> = {
  barbell: "🏋️",
  dumbbell: "💪",
  cable: "🔗",
  machine: "⚙️",
  bodyweight: "🤸",
  plate: "🔄",
  other: "•",
};

const CATEGORIES = ["push", "pull", "legs", "cardio", "other"];
const EQUIPMENTS = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "bodyweight",
  "plate",
  "other",
];

interface ExerciseForm {
  name: string;
  category: string;
  equipment: string;
  is_primary: boolean;
}

const EMPTY_FORM: ExerciseForm = {
  name: "",
  category: "push",
  equipment: "barbell",
  is_primary: false,
};

export default function ExerciseManager() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("All");
  const [eqFilter, setEqFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [form, setForm] = useState<ExerciseForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/exercises");
    const data = await res.json();
    setExercises(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = exercises.filter((e) => {
    if (catFilter !== "All" && e.category !== catFilter.toLowerCase())
      return false;
    if (eqFilter !== "All" && e.equipment !== eqFilter.toLowerCase())
      return false;
    return true;
  });

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setWarning("");
    setShowModal(true);
  }

  function openEdit(ex: Exercise) {
    setEditing(ex);
    setForm({
      name: ex.name,
      category: ex.category,
      equipment: ex.equipment,
      is_primary: ex.is_primary,
    });
    setError("");
    setWarning("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Exercise name is required.");
      return;
    }
    setSaving(true);
    setError("");
    setWarning("");

    const url = editing ? `/api/exercises/${editing.id}` : "/api/exercises";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Save failed");
      setSaving(false);
      return;
    }
    if (data.warning) setWarning(data.warning);
    await load();
    setShowModal(false);
    setSaving(false);
  }

  async function togglePrimary(ex: Exercise) {
    setWarning("");
    const res = await fetch(`/api/exercises/${ex.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_primary: !ex.is_primary }),
    });
    const data = await res.json();
    if (data.warning) setWarning(data.warning);
    await load();
  }

  async function handleArchive(ex: Exercise) {
    if (
      !confirm(
        `Archive "${ex.name}"? It will be hidden from dropdowns but history is preserved.`
      )
    )
      return;
    await fetch(`/api/exercises/${ex.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    });
    await load();
  }

  async function handleReorder(ex: Exercise, dir: "up" | "down") {
    const idx = exercises.findIndex((e) => e.id === ex.id);
    const swap = dir === "up" ? exercises[idx - 1] : exercises[idx + 1];
    if (!swap) return;
    await Promise.all([
      fetch(`/api/exercises/${ex.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: swap.display_order }),
      }),
      fetch(`/api/exercises/${swap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: ex.display_order }),
      }),
    ]);
    await load();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase">
          Exercises
        </p>
        <button
          onClick={openAdd}
          className="text-xs font-bold bg-[#3b86f7]/10 border border-[#3b86f7]/40 text-[#3b86f7] px-3 py-1.5 rounded-lg hover:bg-[#3b86f7]/20 transition-colors"
        >
          + Add Exercise
        </button>
      </div>

      {warning && (
        <p className="text-xs text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg px-3 py-2 mb-3">
          {warning}
        </p>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          <option>All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={eqFilter}
          onChange={(e) => setEqFilter(e.target.value)}
          className="bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          <option>All</option>
          {EQUIPMENTS.map((eq) => (
            <option key={eq} value={eq}>
              {eq.charAt(0).toUpperCase() + eq.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 bg-[#1e293b] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Header row */}
          <div className="grid grid-cols-[32px_1fr_80px_70px_80px_90px] gap-3 px-3 py-1">
            {["", "Name", "Category", "Primary", "Order", "Actions"].map(
              (h) => (
                <span
                  key={h}
                  className="text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em]"
                >
                  {h}
                </span>
              )
            )}
          </div>

          {filtered.map((ex) => {
            const globalIdx = exercises.findIndex((e) => e.id === ex.id);
            return (
              <div
                key={ex.id}
                className="grid grid-cols-[32px_1fr_80px_70px_80px_90px] gap-3 items-center px-3 py-2.5 rounded-xl border border-[#1E2D45] hover:border-[#3b86f7]/30 transition-colors"
                style={{ background: "#060B17" }}
              >
                <span className="text-base">
                  {EQUIPMENT_ICON[ex.equipment] ?? "•"}
                </span>
                <span className="text-sm font-bold text-white truncate">
                  {ex.name}
                </span>
                <span className="text-[10px] font-bold text-[#64748b] capitalize">
                  {ex.category}
                </span>

                {/* Primary toggle */}
                <button
                  onClick={() => togglePrimary(ex)}
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded transition-colors ${
                    ex.is_primary
                      ? "bg-[#3b86f7]/15 border border-[#3b86f7]/40 text-[#3b86f7]"
                      : "bg-[#1e293b] border border-[#1E2D45] text-[#64748b]"
                  }`}
                >
                  {ex.is_primary ? "ON" : "OFF"}
                </button>

                {/* Reorder */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleReorder(ex, "up")}
                    disabled={globalIdx === 0}
                    className="text-[#64748b] hover:text-white disabled:opacity-30 text-xs"
                  >
                    ↑
                  </button>
                  <span className="text-[10px] text-[#64748b] w-4 text-center">
                    {ex.display_order}
                  </span>
                  <button
                    onClick={() => handleReorder(ex, "down")}
                    disabled={globalIdx === exercises.length - 1}
                    className="text-[#64748b] hover:text-white disabled:opacity-30 text-xs"
                  >
                    ↓
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(ex)}
                    className="text-[9px] font-bold text-[#64748b] border border-[#1E2D45] px-2 py-0.5 rounded-lg hover:text-white hover:border-[#64748b] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchive(ex)}
                    className="text-[9px] font-bold text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 px-2 py-0.5 rounded-lg hover:bg-[#ef4444]/20 transition-colors"
                  >
                    Arc
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center py-6 text-xs text-[#64748b]">
              No exercises match the selected filters.
            </p>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-sm rounded-xl border border-[#1E2D45] p-6 space-y-4"
            style={{ background: "#0D1525" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {editing ? "Edit Exercise" : "Add Exercise"}
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
                  Exercise Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
                  placeholder="e.g. Bench Press"
                />
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
                  Equipment
                </label>
                <select
                  value={form.equipment}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, equipment: e.target.value }))
                  }
                  className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3b86f7] transition-colors"
                >
                  {EQUIPMENTS.map((eq) => (
                    <option key={eq} value={eq}>
                      {eq.charAt(0).toUpperCase() + eq.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary toggle */}
              <div className="flex items-center justify-between p-3 bg-[#1e293b] rounded-lg border border-[#1E2D45]">
                <div>
                  <p className="text-xs font-bold text-white">
                    Mark as Primary
                  </p>
                  <p className="text-[9px] text-[#64748b]">
                    Shown on main dashboard strength card
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, is_primary: !f.is_primary }))
                  }
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    form.is_primary ? "bg-[#3b86f7]" : "bg-[#1E2D45]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                      form.is_primary ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
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
                {saving ? "Saving..." : "Save Exercise"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
