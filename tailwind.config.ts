import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:       "var(--bg)",
        card:     "var(--card)",
        border:   "var(--border)",
        faint:    "var(--faint)",
        primary:  "var(--primary)",
        physique: "var(--physique)",
        strength: "var(--strength)",
        finance:  "var(--finance)",
        habits:   "var(--habits)",
        emerald:  "var(--emerald)",
        red:      "var(--red)",
        text:     "var(--text)",
        muted:    "var(--muted)",
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
