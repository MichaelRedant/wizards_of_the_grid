import type { Square } from "../game/types";
import { cx } from "../utils/cx";

export default function SquareView({
  square,
  isSelected,
  isLegal,
}: {
  square: Square;
  isSelected: boolean;
  isLegal: boolean;
}) {
  const ring =
    square.terrain === "heal" ? "ring-2 ring-emerald-500/70" :
    square.terrain === "arcane" ? "ring-2 ring-purple-500/70" :
    square.terrain === "trap" ? "ring-2 ring-red-500/70" : "";

  return (
    <div className={cx("w-full h-full", ring)}>
      {isSelected && <div className="absolute inset-0 border-2 border-yellow-400 pointer-events-none" />}
      {isLegal && <div className="absolute inset-0 bg-emerald-400/20 mix-blend-overlay pointer-events-none" />}
      <div className="absolute bottom-0 right-1 text-[10px] text-white/60">
        {String.fromCharCode(97 + square.coord.x)}
        {8 - square.coord.y}
      </div>
    </div>
  );
}
