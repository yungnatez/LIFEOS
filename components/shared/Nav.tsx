"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mockAlerts = [
  { id: "1", type: "warning" as const, title: "Savings Rate Falling", message: "Savings rate below target for 2 consecutive entries.", created_at: new Date().toISOString(), read: false },
  { id: "2", type: "info" as const, title: "Milestone Approaching", message: "Turbo Fund: 19 days remaining. Progress: 81%.", created_at: new Date().toISOString(), read: false },
  { id: "3", type: "success" as const, title: "Goal Achieved", message: "Safety Buffer: Congratulations! Target reached.", created_at: new Date().toISOString(), read: true },
];

const alertColors: Record<string, string> = {
  warning: "#f59e0b",
  info: "#3b86f7",
  success: "#10b981",
  danger: "#ef4444",
};

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/capital", label: "Capital" },
  { href: "/config", label: "Config" },
];

export default function Nav() {
  const pathname = usePathname();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState(mockAlerts);
  const unreadCount = alerts.filter((a) => !a.read).length;

  function markRead(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }

  return (
    <header className="border-b border-[#1E2D45] bg-[#060B17]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-white">
              LIFEOS{" "}
              <span className="text-xs font-medium text-[#3b86f7]/80 ml-1">v2.4</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#10b981] animate-pulse" />
              <p className="text-[10px] uppercase tracking-widest text-[#64748b] font-extrabold">
                System Active
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-[#3b86f7] bg-[#3b86f7]/10 border border-[#3b86f7]/20"
                    : "text-[#64748b] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setAlertsOpen(!alertsOpen)}
              className="p-2 hover:bg-[#1e293b] rounded-lg text-[#64748b] transition-colors relative"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-2 bg-[#ef4444] rounded-full border-2 border-[#060B17]" />
              )}
            </button>

            {alertsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#0D1525] border border-[#1E2D45] rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-[#1E2D45] flex items-center justify-between">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#64748b]">
                    Alerts
                  </p>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-extrabold bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 px-2 py-0.5 rounded">
                      {unreadCount} UNREAD
                    </span>
                  )}
                </div>
                <div className="divide-y divide-[#1E2D45] max-h-72 overflow-y-auto">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 flex gap-3 hover:bg-[#1e293b] transition-colors cursor-pointer ${
                        alert.read ? "opacity-50" : ""
                      }`}
                      onClick={() => markRead(alert.id)}
                    >
                      <span
                        className="size-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: alertColors[alert.type] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{alert.title}</p>
                        <p className="text-[10px] text-[#64748b] mt-0.5 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-[#1E2D45]" />

          {/* Avatar */}
          <div className="flex items-center gap-3 bg-[#1e293b]/50 p-1.5 pr-4 rounded-full border border-[#1E2D45]">
            <div className="size-8 rounded-full bg-gradient-to-br from-[#3b86f7] to-indigo-600 flex items-center justify-center text-xs font-extrabold border border-white/10">
              C
            </div>
            <span className="text-xs font-extrabold text-[#f1f5f9]">COMMANDER</span>
          </div>
        </div>
      </div>
    </header>
  );
}
