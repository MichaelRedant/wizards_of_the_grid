import { useEffect, useRef } from "react";
import type { IconType } from "react-icons";
import {
  GiSkullCrossedBones,
  GiUpgrade,
  GiCrossedSwords,
  GiPuzzle,
  GiHeartPlus,
  GiExplosionRays,
  GiMagicSwirl,
  GiShield,
  GiBleedingWound,
  GiFireball,
  GiLightningTrio,
  GiHealing,
} from "react-icons/gi";
import { useGameStore } from "../store/useGameStore";

const ICONS: Partial<Record<string, IconType>> = {
  "☠️": GiSkullCrossedBones,
  "🔺": GiUpgrade,
  "⚔️": GiCrossedSwords,
  "🧩": GiPuzzle,
  "💚": GiHeartPlus,
  "💥": GiExplosionRays,
  "🔮": GiMagicSwirl,
  "🛡️": GiShield,
  "💢": GiBleedingWound,
  "🔥": GiFireball,
  "⚡": GiLightningTrio,
  "✨": GiHealing,
};

export default function DMLog() {
  const log = useGameStore(s => s.log);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  return (
    <div
      className="p-3 rounded-2xl bg-slate-100/40 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 h-64 overflow-auto"
      ref={ref}
    >
      <div className="text-sm font-semibold mb-2">Dungeon Master Log</div>
      <ul className="space-y-1 text-sm">
        {log.map((line, i) => {
          const [symbol, ...rest] = line.split(" ");
          const Icon = ICONS[symbol];
          const text = Icon ? rest.join(" ") : line;
          return (
            <li key={i} className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
              {Icon ? <Icon /> : null}
              <span>{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
