import * as Gi from "react-icons/gi";
import type { IconType } from "react-icons";
import type { Piece, Terrain } from "../game/types";
import { baseStats } from "../game/chess";
import { cx } from "../utils/cx";

// DnD-stijl iconen per stuktype (eerste die bestaat wordt gebruikt)
const ICON_OPTIONS: Record<Piece["type"], string[]> = {
  king:   ["GiWizardHat", "GiWizardStaff", "GiCrown", "GiMagicSwirl"],
  queen:  ["GiCrystalBall", "GiSpellBook", "GiMagicSwirl"],
  rook:   ["GiCastle", "GiFortress", "GiGuardedTower", "GiMagicSwirl"],
  bishop: ["GiHolyGrail", "GiHealing", "GiAngelOutfit", "GiMagicSwirl"],
  knight: ["GiHorseHead", "GiWarhorse", "GiUnicorn", "GiMagicSwirl"],
  pawn:   ["GiPlainDagger", "GiPointySword", "GiSwordHilt", "GiMagicSwirl"],
};

function pickIcon(type: Piece["type"]): IconType {
  const names = ICON_OPTIONS[type];
  for (const name of names) {
    const Candidate = (Gi as any)[name] as IconType | undefined;
    if (Candidate) return Candidate;
  }
  return (Gi as any).GiMagicSwirl as IconType;
}

// Status icons
function pickPoisonIcon(): IconType {
  return (Gi as any).GiPoisonBottle ?? (Gi as any).GiPoisonCloud ?? (Gi as any).GiDeathSkull;
}
function pickStunIcon(): IconType {
  return (Gi as any).GiPunchBlast ?? (Gi as any).GiStunGrenade ?? (Gi as any).GiLightningTrio;
}

export default function PieceView({ piece, terrain }: { piece: Piece; terrain?: Terrain }) {
  const Icon = pickIcon(piece.type);
  const PoisonIcon = pickPoisonIcon();
  const StunIcon = pickStunIcon();

  const max = baseStats(piece.type).maxHp;
  const hpPct = Math.max(0, Math.min(100, Math.round((piece.hp / max) * 100)));

  const baseCls =
    piece.faction === "white"
      ? "mini-base mini-base--gold"
      : "mini-base mini-base--obsidian";

  const iconColor = piece.faction === "white" ? "text-slate-900" : "text-slate-100";

  const auraCls =
    terrain === "heal"   ? "base-aura base-aura--heal" :
    terrain === "arcane" ? "base-aura base-aura--arcane" :
    terrain === "trap"   ? "base-aura base-aura--trap" : "";

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className={cx(baseCls, (piece.stunned ?? 0) > 0 ? "ring-2 ring-yellow-400/60" : "")}>
        {/* Terrain aura rond de base */}
        {auraCls && <div className={auraCls} />}

        <Icon className={cx("piece-icon", iconColor)} />

        {/* HP bar */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-2 bg-black/35 rounded">
          <div
            className="h-2 rounded bg-emerald-500"
            style={{ width: `${hpPct}%` }}
            title={`HP: ${piece.hp}/${max}`}
          />
        </div>

        {/* Shield indicator */}
        {!!piece.shield && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] bg-indigo-600 px-1 rounded">
            🛡 {piece.shield}
          </div>
        )}

        {/* Poison badge (linksboven) */}
        {(piece.poison ?? 0) > 0 && (
          <div className="absolute -top-2 -left-2 h-5 w-5 rounded-full bg-emerald-600 text-white grid place-items-center shadow">
            <PoisonIcon className="text-[11px]" title={`Poison: ${piece.poison}`} />
          </div>
        )}

        {/* Stun badge (rechtsboven) */}
        {(piece.stunned ?? 0) > 0 && (
          <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-yellow-500 text-black grid place-items-center shadow">
            <StunIcon className="text-[11px]" title={`Stunned: ${piece.stunned}`} />
          </div>
        )}
      </div>
    </div>
  );
}
