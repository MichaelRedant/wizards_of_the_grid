import { ABILITIES } from "../game/abilities";
import { useGameStore } from "../store/useGameStore";

export default function AbilityBar() {
  const selected = useGameStore(s => s.selected);
  const pieces = useGameStore(s => s.pieces);
  const setAbility = useGameStore(s => s.selectAbility);
  const selectedAbility = useGameStore(s => s.selectedAbility);

  const piece = selected ? pieces[selected] : undefined;
  const available = piece ? ABILITIES.filter(a => !a.pieceTypes || a.pieceTypes.includes(piece.type)) : [];

  if (!piece) {
    return (
      <div className="p-3 rounded-2xl bg-slate-100/40 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-800">
        <div className="text-sm text-slate-600 dark:text-slate-400">Selecteer een stuk om abilities te zien.</div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-2xl bg-slate-100/40 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-800">
      <div className="text-sm font-semibold mb-2">Abilities</div>
      <div className="flex flex-wrap gap-2">
        {available.map(a => {
          const cd = piece.cooldowns[a.id] ?? 0;
          const disabled = cd > 0;
          const active = selectedAbility === a.id;
          return (
            <button
              key={a.id}
              className={[
                "px-3 py-1.5 rounded-lg text-sm transition",
                active ? "ring-2 ring-emerald-400" : "",
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100",
              ].join(" ")}
              onClick={() => !disabled && setAbility(active ? undefined : a.id)}
              title={a.desc}
            >
              {a.name} {cd > 0 ? `(${cd})` : ""}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">Tip: Ability selecteren, klik daarna op doel-tegel.</div>
    </div>
  );
}
