import { useGameStore } from "../store/useGameStore";
import { ABILITIES } from "../game/abilities";

export default function HUD() {
  const turn = useGameStore(s => s.turn);
  const selected = useGameStore(s => s.selected);
  const piece = useGameStore(s => (selected ? s.pieces[selected] : undefined));
  const endTurn = useGameStore(s => s.endTurn);
  const startGame = useGameStore(s => s.startGame);
  const endGame = useGameStore(s => s.endGame);
  const restartGame = useGameStore(s => s.restartGame);
  const status = useGameStore(s => s.status);

  const fogEnabled = useGameStore(s => s.fogEnabled);
  const visionRange = useGameStore(s => s.visionRange);
  const perPieceVision = useGameStore(s => s.perPieceVisionEnabled);
  const setFogEnabled = useGameStore(s => s.setFogEnabled);
  const setVisionRange = useGameStore(s => s.setVisionRange);
  const setPerPieceVisionEnabled = useGameStore(s => s.setPerPieceVisionEnabled);

  const abilities = piece ? ABILITIES.filter(a => !a.pieceTypes || a.pieceTypes.includes(piece.type)) : [];

  return (
    <div className="p-3 rounded-2xl bg-slate-100/40 border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-slate-800/40 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">
          <div className="font-semibold">Beurt: {turn}</div>
          {piece ? (
            <div className="text-slate-600 dark:text-slate-400">
              Geselecteerd: <span className="font-mono">{piece.id}</span> ({piece.type})
              {" · "}HP {piece.hp}
              {" · "}XP {piece.xp}
            </div>
          ) : (
            <div className="text-slate-500">Geen stuk geselecteerd.</div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {status === "running" ? (
            <>
              <button className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100" onClick={endTurn}>Einde beurt</button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100" onClick={restartGame}>Herstart</button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100" onClick={endGame}>Stop</button>
            </>
          ) : (
            <button className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100" onClick={status === "idle" ? startGame : restartGame}>
              {status === "idle" ? "Start" : "Opnieuw"}
            </button>
          )}
        </div>
      </div>

      {/* Fog-of-war controls */}
      <div className="mt-3 grid gap-2 sm:grid-cols-3 items-center">
        <div className="col-span-1 text-xs text-slate-600 dark:text-slate-400">Fog of War</div>
        <div className="col-span-2 flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded-lg text-sm ${fogEnabled ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"}`}
            onClick={() => setFogEnabled(!fogEnabled)}
          >
            {fogEnabled ? "Aan" : "Uit"}
          </button>

          <label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            Zicht:
            <input
              type="range"
              min={1}
              max={6}
              value={visionRange}
              onChange={(e) => setVisionRange(Number(e.target.value))}
            />
            <span className="font-mono">{visionRange}</span>
          </label>

          <label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            Per-stuk vision
            <input
              type="checkbox"
              checked={perPieceVision}
              onChange={(e) => setPerPieceVisionEnabled(e.target.checked)}
            />
          </label>
        </div>
      </div>

      {piece && abilities.length > 0 && (
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Abilities: {abilities.map(a => a.name).join(", ")}
        </div>
      )}
    </div>
  );
}
