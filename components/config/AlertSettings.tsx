"use client";

import { useState, useEffect, useCallback } from "react";
import type { Alert } from "@/lib/supabase/types";

const TYPE_COLOR: Record<string, string> = {
  warning: "#f59e0b",
  info: "#3b86f7",
  success: "#10b981",
  danger: "#ef4444",
};

export default function AlertSettings() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/alerts");
    const data = await res.json();
    setAlerts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: string) {
    await fetch(`/api/alerts/${id}/read`, { method: "POST" });
    await load();
  }

  async function markAllRead() {
    const unread = alerts.filter((a) => !a.read);
    await Promise.all(
      unread.map((a) =>
        fetch(`/api/alerts/${a.id}/read`, { method: "POST" })
      )
    );
    await load();
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 bg-[#1e293b] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase">
          Alerts ({unreadCount} unread)
        </p>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-[#64748b] border border-[#1E2D45] px-3 py-1.5 rounded-lg hover:text-white transition-colors"
          >
            Mark All Read
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-10 text-[#64748b] text-sm">
          No alerts. System nominal.
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => {
            const color = TYPE_COLOR[a.type] ?? "#64748b";
            return (
              <div
                key={a.id}
                className={`rounded-xl p-4 transition-opacity ${
                  a.read ? "opacity-50" : ""
                }`}
                style={{
                  background: "#060B17",
                  border: `1px solid ${a.read ? "#1E2D45" : `${color}40`}`,
                  borderLeftWidth: 3,
                  borderLeftColor: color,
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-[0.1em] px-2 py-0.5 rounded"
                        style={{
                          background: `${color}15`,
                          border: `1px solid ${color}40`,
                          color,
                        }}
                      >
                        {a.type}
                      </span>
                      <span className="text-[9px] text-[#64748b]">
                        {new Date(a.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">{a.title}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">{a.message}</p>
                  </div>
                  {!a.read && (
                    <button
                      onClick={() => markRead(a.id)}
                      className="text-[9px] font-bold text-[#64748b] border border-[#1E2D45] px-2.5 py-1 rounded-lg hover:text-white hover:border-[#64748b] transition-colors shrink-0"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
