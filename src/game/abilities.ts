import type { Ability, ApplyResult, GameState, Piece } from "./types";
import { distance } from "./chess";
import { baseStats } from "./chess";

export const ABILITIES: Ability[] = [
  { id: "fireball", name: "Fireball", desc: "3x3 gebied, 2 dmg. Bereik 3.", cooldown: 3, target: "tile", radius: 1, range: 3, pieceTypes: ["queen"] },
  { id: "smite",    name: "Smite",    desc: "2 dmg op vijand in bereik 3.",  cooldown: 2, target: "enemy", range: 3, pieceTypes: ["rook"] },
  { id: "heal",     name: "Healing",  desc: "Genees bondgenoot 2 HP (r=2).", cooldown: 2, target: "ally",  range: 2, pieceTypes: ["bishop","king"] },
  { id: "shield",   name: "Shield",   desc: "Schild 2 HP (zelf).",           cooldown: 3, target: "self",  pieceTypes: ["king"] },
];

function hit(p: Piece, amount: number) {
  const block = p.shield ? 1 : 0;
  const dmg = Math.max(0, amount - block);
  if (p.shield) p.shield = Math.max(0, p.shield - amount);
  p.hp -= dmg;
}

export function canCastAbility(piece: Piece, abilityId: string) {
  const a = ABILITIES.find(x => x.id === abilityId);
  if (!a) return false;
  if (a.pieceTypes && !a.pieceTypes.includes(piece.type)) return false;
  return (piece.cooldowns[abilityId] ?? 0) <= 0;
}

export function castAbility(
  state: GameState,
  caster: Piece,
  abilityId: string,
  targetSquareIndex: number
): ApplyResult | null {
  const ability = ABILITIES.find(a => a.id === abilityId);
  if (!ability) return null;

  const targetSq = state.board[targetSquareIndex];
  if (!targetSq) return null;
  const inRange = ability.range == null || distance(caster.pos, targetSq.coord) <= ability.range;
  if (!inRange) return { text: "Doel buiten bereik." };

  const res: ApplyResult = { text: "" };

  if (ability.id === "fireball") {
    const area = state.board.filter(sq =>
      Math.max(Math.abs(sq.coord.x - targetSq.coord.x), Math.abs(sq.coord.y - targetSq.coord.y)) <= (ability.radius ?? 1)
    );
    const killed: string[] = [];
    const damaged: { id: string; amount: number }[] = [];
    for (const sq of area) {
      if (!sq.pieceId) continue;
      const p = state.pieces[sq.pieceId];
      if (p.faction !== caster.faction) {
        hit(p, 2);
        damaged.push({ id: p.id, amount: 2 });
        if (p.hp <= 0) killed.push(p.id);
      }
    }
    res.damaged = damaged;
    res.killedIds = killed;
    res.text = `🔥 ${caster.id} cast Fireball.`;
  }

  if (ability.id === "smite") {
    const victId = targetSq.pieceId;
    if (!victId) return { text: "Geen doelwit op de tile." };
    const v = state.pieces[victId];
    if (v.faction === caster.faction) return { text: "Doelwit is geen vijand." };
    hit(v, 2);
    res.damaged = [{ id: v.id, amount: 2 }];
    if (v.hp <= 0) res.killedIds = [v.id];
    res.text = `⚡ ${caster.id} smite ${v.id}.`;
  }

  if (ability.id === "heal") {
    const allyId = targetSq.pieceId;
    if (!allyId) return { text: "Geen bondgenoot op de tile." };
    const ally = state.pieces[allyId];
    if (ally.faction !== caster.faction) return { text: "Doelwit is geen bondgenoot." };
    const maxHp = baseStats(ally.type).maxHp;
    ally.hp = Math.min(maxHp, ally.hp + 2);
    res.healed = [{ id: ally.id, amount: 2 }];
    res.text = `✨ ${caster.id} healt ${ally.id} voor 2.`;
  }

  if (ability.id === "shield") {
    caster.shield = Math.max(0, caster.shield ?? 0) + 2;
    res.shielded = [{ id: caster.id, amount: 2, turns: 2 }];
    res.text = `🛡️ ${caster.id} activeert shield.`;
  }

  caster.cooldowns[abilityId] = ability.cooldown;
  return res;
}
