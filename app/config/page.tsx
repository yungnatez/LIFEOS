"use client";

import { useState } from "react";
import Nav from "@/components/shared/Nav";
import Footer from "@/components/shared/Footer";
import Card from "@/components/shared/Card";
import GoalManager from "@/components/config/GoalManager";
import ExerciseManager from "@/components/config/ExerciseManager";
import AlertSettings from "@/components/config/AlertSettings";
import ProfileSettings from "@/components/config/ProfileSettings";

type Tab = "Goals" | "Exercises" | "Alerts" | "Profile";
const TABS: Tab[] = ["Goals", "Exercises", "Alerts", "Profile"];

export default function ConfigPage() {
  const [tab, setTab] = useState<Tab>("Goals");

  return (
    <>
      <Nav />
      <main className="max-w-[1440px] mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="size-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[9px] font-extrabold tracking-[0.2em] text-[#64748b] uppercase">
              System Status: Nominal
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Configuration</h1>
          <p className="text-xs text-[#64748b] mt-1">
            Manage goals, exercises, alerts, and profile settings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b border-[#1E2D45]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-xs font-bold transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "text-[#3b86f7] border-[#3b86f7] bg-[#3b86f7]/10"
                  : "text-[#64748b] border-transparent hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Card>
          {tab === "Goals" && <GoalManager />}
          {tab === "Exercises" && <ExerciseManager />}
          {tab === "Alerts" && <AlertSettings />}
          {tab === "Profile" && <ProfileSettings />}
        </Card>
      </main>
      <Footer />
    </>
  );
}
