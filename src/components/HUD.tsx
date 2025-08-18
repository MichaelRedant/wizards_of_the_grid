import { useGameStore } from "../store/useGameStore";
import { ABILITIES } from "../game/abilities";

export default function HUD() {
  const turn = useGameStore(s => s.turn);
  const selected = useGameStore(s => s.selected);
  const piece = useGameStore(s => (selected ? s.pieces[selected] : undefined));
  const endTurn = useGameStore(s => s.endTurn);
  const reset = useGameStore(s => s.reset);

  const abilities = piece ? ABILITIES.filter(a => !a.pieceTypes || a.pieceTypes.includes(piece.type)) : [];

  return (
    <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">
          <div className="font-semibold">Beurt: {turn}</div>
          {piece ? (
            <div className="text-slate-400">
              Geselecteerd: <span className="font-mono">{piece.id}</span> ({piece.type})
              {" · "}HP {piece.hp}
              {" · "}XP {piece.xp}
            </div>
          ) : (
            <div className="text-slate-500">Geen stuk geselecteerd.</div>
          )}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm" onClick={endTurn}>Einde beurt</button>
          <button className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm" onClick={reset}>Reset</button>
        </div>
      </div>
      {piece && abilities.length > 0 && (
        <div className="text-xs text-slate-400">Abilities: {abilities.map(a => a.name).join(", ")}</div>
      )}
    </div>
  );
}
