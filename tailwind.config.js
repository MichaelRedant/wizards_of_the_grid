/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        boardDark: "#2a2e37",
        boardLight: "#d8dfe6",
        arcane: "#7c3aed",
        heal: "#16a34a",
        trap: "#dc2626",
      },
      boxShadow: { soft: "0 8px 30px rgba(0,0,0,0.08)" },
    },
  },
  plugins: [],
};
