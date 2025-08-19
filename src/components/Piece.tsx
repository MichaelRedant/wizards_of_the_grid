import type { Piece } from "../game/types";
import { baseStats } from "../game/chess";
import { cx } from "../utils/cx";
import type { IconType } from "react-icons";
import {
  GiWizardStaff,
  GiSpellBook,
  GiStoneTower,
  GiHolySymbol,
  GiMountedKnight,
  GiPointySword,
  GiShield,
} from "react-icons/gi";

const ICONS: Record<Piece["type"], IconType> = {
  king: GiWizardStaff,
  queen: GiSpellBook,
  rook: GiStoneTower,
  bishop: GiHolySymbol,
  knight: GiMountedKnight,
  pawn: GiPointySword,
};

export default function PieceView({ piece }: { piece: Piece }) {
  const max = baseStats(piece.type).maxHp;
  const hpPct = Math.max(0, Math.min(100, Math.round((piece.hp / max) * 100)));
  const fg = piece.faction === "white" ? "text-white" : "text-black";
  const glow = piece.faction === "white"
    ? "drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]"
    : "drop-shadow-[0_0_6px_rgba(0,0,0,0.5)]";

  const Icon = ICONS[piece.type];

  return (
    <div
      className={cx(
        "absolute inset-0 flex items-center justify-center text-4xl transition-transform duration-300",
        glow,
      )}
    >
      <div className={cx("relative transform hover:scale-110 hover:-translate-y-1", fg)}>
        <Icon />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-2 bg-slate-700 rounded">
          <div
            className="h-2 rounded bg-emerald-500"
            style={{ width: `${hpPct}%` }}
            title={`HP: ${piece.hp}/${max}`}
          />
        </div>
        {!!piece.shield && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] bg-indigo-600 px-1 rounded flex items-center gap-0.5">
            <GiShield /> {piece.shield}
          </div>
        )}
      </div>
    </div>
  );
}
