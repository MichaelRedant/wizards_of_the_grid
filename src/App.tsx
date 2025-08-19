import Board from "./components/Board";
import HUD from "./components/HUD";
import DMLog from "./components/DMLog";
import AbilityBar from "./components/AbilityBar";
import Onboarding from "./components/Onboarding";
import { useState } from "react";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showOnboarding, setShowOnboarding] = useState(false);
  return (
    <div className={theme === "dark" ? "dark h-screen" : "h-screen"}>
      <div className="grid h-full grid-rows-[auto_1fr_auto] bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 antialiased">
        <header className={`p-4 border-b sticky top-0 z-10 backdrop-blur ${theme === "dark" ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white/80"}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🧙 Wizards of the Grid</h1>
              <p className="text-sm text-slate-400">
                DnD-geïnspireerd schaken. HP, abilities, cooldowns. Minder zout, meer vuurballen.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
                onClick={() => setShowOnboarding(true)}
              >
                Info
              </button>
              <button
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "Light" : "Dark"} mode
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 grid gap-4 md:grid-cols-[1fr_320px] h-full">
          <div className="rounded-2xl p-3 border shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-slate-100/40 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 flex items-center justify-center h-full">
            <Board />
          </div>

          <div className="flex flex-col gap-4">
            <HUD />
            <AbilityBar />
            <DMLog />
          </div>
        </main>

        <footer className="p-4 text-center text-xs text-slate-600 dark:text-slate-500">
          © {new Date().getFullYear()} Wizards of the Grid. Gemaakt in React + Tailwind.
        </footer>
      </div>
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}
