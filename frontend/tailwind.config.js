/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        void: "#080a0f",
        surface: "#0d1117",
        card: "#111620",
        elevated: "#161d2b",
        gold: {
          DEFAULT: "#d4a843",
          light: "#f0c96a",
          dim: "rgba(212,168,67,0.15)",
        },
        signal: {
          green: "#22c55e",
          red: "#ef4444",
          cyan: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
};
