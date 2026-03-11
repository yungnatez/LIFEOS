"use client";

import { useState, useEffect } from "react";

interface Exercise {
  id: string;
  name: string;
  category: string;
}

interface WorkoutSet {
  exerciseId: string;
  weightKg: number;
  reps: number;
  setNumber: number;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: WorkoutSet[];
}

interface LogWorkoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function calc1RM(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30));
}

function totalVolume(entries: ExerciseEntry[]): number {
  return entries.reduce((total, entry) => {
    return total + entry.sets.reduce((s, set) => s + set.weightKg * set.reps, 0);
  }, 0);
}

const categoryOrder = ["push", "pull", "legs", "other"];

export default function LogWorkoutModal({ open, onClose, onSuccess }: LogWorkoutModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [notes, setNotes] = useState("");
  const [showExSelect, setShowExSelect] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/exercises")
      .then((r) => r.json())
      .then((data: Exercise[]) => {
        if (Array.isArray(data)) setExercises(data);
      })
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  function addExercise(ex: Exercise) {
    if (entries.find((e) => e.exercise.id === ex.id)) return;
    setEntries((prev) => [
      ...prev,
      {
        exercise: ex,
        sets: [{ exerciseId: ex.id, weightKg: 0, reps: 5, setNumber: 1 }],
      },
    ]);
    setShowExSelect(false);
  }

  function removeExercise(exId: string) {
    setEntries((prev) => prev.filter((e) => e.exercise.id !== exId));
  }

  function addSet(exId: string) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.exercise.id !== exId) return e;
        const lastSet = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              exerciseId: exId,
              weightKg: lastSet?.weightKg ?? 0,
              reps: lastSet?.reps ?? 5,
              setNumber: e.sets.length + 1,
            },
          ],
        };
      })
    );
  }

  function updateSet(exId: string, setIdx: number, field: "weightKg" | "reps", value: number) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.exercise.id !== exId) return e;
        const sets = e.sets.map((s, i) => (i === setIdx ? { ...s, [field]: value } : s));
        return { ...e, sets };
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (entries.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const sets = entries.flatMap((entry) =>
        entry.sets.map((s) => ({
          exercise_id: s.exerciseId,
          weight_kg: s.weightKg,
          reps: s.reps,
          set_number: s.setNumber,
        }))
      );
      const res = await fetch("/api/log/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sets, notes: notes || undefined }),
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

  const grouped = categoryOrder
    .map((cat) => ({
      cat,
      exercises: exercises.filter(
        (ex) => ex.category === cat && !entries.find((en) => en.exercise.id === ex.id)
      ),
    }))
    .filter((g) => g.exercises.length > 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D1525] border border-[#1E2D45] rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0D1525] border-b border-[#1E2D45] p-5 flex items-center justify-between">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#64748b]">
            Workout Logger
          </p>
          <button onClick={onClose} className="text-[#64748b] hover:text-white transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {entries.map((entry) => (
            <div key={entry.exercise.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-white uppercase tracking-wide">
                  {entry.exercise.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeExercise(entry.exercise.id)}
                  className="text-[#64748b] hover:text-[#ef4444] transition-colors text-xs"
                >
                  × Remove
                </button>
              </div>
              {entry.sets.map((set, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] text-[#64748b] font-extrabold w-10">
                    Set {i + 1}
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={set.weightKg || ""}
                    placeholder="0"
                    onChange={(e) =>
                      updateSet(entry.exercise.id, i, "weightKg", parseFloat(e.target.value) || 0)
                    }
                    className="w-20 bg-[#1e293b] border border-[#1E2D45] rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-[#3b86f7]"
                  />
                  <span className="text-[10px] text-[#64748b]">kg ×</span>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(entry.exercise.id, i, "reps", parseInt(e.target.value) || 0)
                    }
                    className="w-14 bg-[#1e293b] border border-[#1E2D45] rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-[#3b86f7]"
                  />
                  <span className="text-[10px] text-[#64748b]">reps</span>
                  <span className="text-[10px] text-[#64748b] ml-auto">
                    → 1RM: {calc1RM(set.weightKg, set.reps)}kg
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSet(entry.exercise.id)}
                className="text-[10px] font-extrabold text-[#3b86f7] hover:text-[#3b86f7]/80 transition-colors"
              >
                + Add Set
              </button>
            </div>
          ))}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExSelect(!showExSelect)}
              className="text-xs font-extrabold text-[#64748b] border border-[#1E2D45] px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
            >
              + Add Exercise ▼
            </button>
            {showExSelect && (
              <div className="absolute top-full mt-1 left-0 z-10 bg-[#0D1525] border border-[#1E2D45] rounded-lg w-64 max-h-48 overflow-y-auto shadow-xl">
                {grouped.length === 0 && (
                  <p className="text-xs text-[#64748b] p-3">No exercises available</p>
                )}
                {grouped.map((g) => (
                  <div key={g.cat}>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748b] px-3 py-1.5 bg-[#1e293b]/50">
                      {g.cat}
                    </p>
                    {g.exercises.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => addExercise(ex)}
                        className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#1e293b] transition-colors"
                      >
                        {ex.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#64748b] block mb-2">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3b86f7] transition-colors"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-t border-[#1E2D45]">
            <span className="text-[10px] font-extrabold uppercase text-[#64748b]">Total Volume</span>
            <span className="text-sm font-black text-white">
              {totalVolume(entries).toLocaleString()}kg
            </span>
          </div>

          {error && <p className="text-xs text-[#ef4444]">{error}</p>}

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
              disabled={entries.length === 0 || submitting}
              className="flex-1 px-4 py-2 text-xs font-extrabold text-white bg-[#3b86f7] rounded-lg hover:bg-[#3b86f7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : "Save Workout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
