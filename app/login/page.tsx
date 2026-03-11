"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#060B17]">
      <div
        className="w-full max-w-sm rounded-xl p-8 border border-[#1E2D45]"
        style={{ background: "#0D1525" }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 bg-[#3b86f7]/10 border border-[#3b86f7]/30 rounded-full px-3 py-1">
            <span className="size-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[9px] font-extrabold tracking-[0.2em] text-[#3b86f7] uppercase">
              System Online
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">LIFEOS v2.4</h1>
          <p className="text-xs text-[#64748b] mt-1">
            {mode === "login"
              ? "Authenticate to access mission control"
              : "Create your commander account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-[#3b86f7] transition-colors"
              placeholder="commander@lifeos.app"
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-[#64748b] uppercase tracking-[0.15em] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full bg-[#1e293b] border border-[#1E2D45] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-[#3b86f7] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#3b86f7] text-white font-bold text-sm py-2.5 rounded-lg hover:bg-[#3b86f7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading
              ? "Authenticating..."
              : mode === "login"
              ? "Enter System"
              : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          className="w-full text-xs text-[#64748b] hover:text-[#3b86f7] text-center mt-5 transition-colors"
        >
          {mode === "login"
            ? "No account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
