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
      backgroundImage: {
        "dnd-light":
          "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 40 40\'%3E%3Crect width=\'40\' height=\'40\' fill=\'%23f2e9d6\'/%3E%3Cpath d=\'M0 0L40 40M40 0L0 40\' stroke=\'%23d3c4a3\' stroke-width=\'2\' opacity=\'0.2\'/%3E%3C/svg%3E')",
        "dnd-dark":
          "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 40 40\'%3E%3Crect width=\'40\' height=\'40\' fill=\'%234b3621\'/%3E%3Cpath d=\'M0 0L40 40M40 0L0 40\' stroke=\'%233a2a18\' stroke-width=\'2\' opacity=\'0.2\'/%3E%3C/svg%3E')",
        "dnd-light-dark":
          "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 40 40\'%3E%3Crect width=\'40\' height=\'40\' fill=\'%233a2f22\'/%3E%3Cpath d=\'M0 0L40 40M40 0L0 40\' stroke=\'%232c2318\' stroke-width=\'2\' opacity=\'0.2\'/%3E%3C/svg%3E')",
        "dnd-dark-dark":
          "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 40 40\'%3E%3Crect width=\'40\' height=\'40\' fill=\'%231e1b16\'/%3E%3Cpath d=\'M0 0L40 40M40 0L0 40\' stroke=\'%232a2217\' stroke-width=\'2\' opacity=\'0.2\'/%3E%3C/svg%3E')",
      },
      boxShadow: { soft: "0 8px 30px rgba(0,0,0,0.08)" },
    },
  },
  plugins: [],
};
