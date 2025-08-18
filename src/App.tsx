import Board from "./components/Board";
import HUD from "./components/HUD";
import DMLog from "./components/DMLog";
import AbilityBar from "./components/AbilityBar";

export default function App() {
  return (
    <div className="min-h-full grid grid-rows-[auto_1fr_auto] bg-slate-900 text-slate-100 antialiased">
      <header className="p-4 border-b border-slate-800 sticky top-0 z-10 bg-slate-900/80 backdrop-blur">
        <h1 className="text-xl font-bold">🧙 Wizards of the Grid</h1>
        <p className="text-sm text-slate-400">
          DnD-geïnspireerd schaken. HP, abilities, cooldowns. Minder zout, meer vuurballen.
        </p>
      </header>

      <main className="p-4 grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl p-3 bg-slate-800/40 border border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <Board />
        </div>

        <div className="flex flex-col gap-4">
          <HUD />
          <AbilityBar />
          <DMLog />
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Wizards of the Grid. Gemaakt in React + Tailwind.
      </footer>
    </div>
  );
}
