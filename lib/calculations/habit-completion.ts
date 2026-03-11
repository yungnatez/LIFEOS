import type { Habit } from "@/lib/supabase/types";

export function calcCompletionStatus(
  gym: boolean,
  dietAdherent: boolean,
  sleepHours: number | null,
  meditation: boolean,
  deepWorkHours: number | null,
  vitaminIntake: boolean
): "full" | "partial" | "missed" {
  const tracked = [
    gym,
    dietAdherent,
    (sleepHours ?? 0) >= 7.5,
    meditation,
    (deepWorkHours ?? 0) >= 4,
    vitaminIntake,
  ];
  const completed = tracked.filter(Boolean).length;
  if (completed === 6) return "full";
  if (completed > 0) return "partial";
  return "missed";
}

export function isWithinLastNDays(dateStr: string, n: number): boolean {
  const date = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - n);
  return date >= cutoff;
}

export function calcHabitScore(habits: Habit[]): number {
  const last30 = habits.filter((h) => isWithinLastNDays(h.habit_date, 30));
  const fullDays = last30.filter(
    (h) => h.completion_status === "full"
  ).length;
  return Math.round((fullDays / 30) * 100);
}

export function calcStreaks(habits: Habit[]): {
  gym: number;
  sleep: number;
  meditation: number;
} {
  const sorted = [...habits].sort(
    (a, b) =>
      new Date(b.habit_date).getTime() - new Date(a.habit_date).getTime()
  );

  function streak(pred: (h: Habit) => boolean): number {
    let count = 0;
    for (const h of sorted) {
      if (pred(h)) count++;
      else break;
    }
    return count;
  }

  return {
    gym: streak((h) => h.gym),
    sleep: streak((h) => (h.sleep_hours ?? 0) >= 7.5),
    meditation: streak((h) => h.meditation),
  };
}
