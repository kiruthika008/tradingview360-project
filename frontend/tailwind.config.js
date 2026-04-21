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
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      colors: {
        void:    "#06080d",
        surface: "#0b0f18",
        card:    "#0f1420",
        elevated:"#141a28",
        gold: { DEFAULT:"#c9a227", light:"#e8bf5a", dim:"rgba(201,162,39,0.13)" },
        signal: { green:"#22c55e", red:"#ef4444", cyan:"#0ea5e9" },
      },
    },
  },
  plugins: [],
};
