import type { Ability, ApplyResult, GameState, Piece } from "./types";
import { distance } from "./chess";
import { baseStats } from "./chess";

export const ABILITIES: Ability[] = [
  // Bestaand
  { id: "fireball",  name: "Fireball",  desc: "3x3 gebied, 2 dmg. Bereik 3. (Queen)", cooldown: 3, target: "tile", radius: 1, range: 3, pieceTypes: ["queen"] },
  { id: "smite",     name: "Smite",     desc: "2 dmg op vijand in bereik 3. (Rook)",  cooldown: 2, target: "enemy", range: 3, pieceTypes: ["rook"] },
  { id: "heal",      name: "Healing",   desc: "Genees bondgenoot 2 HP (r=2). (Bishop/King)", cooldown: 2, target: "ally",  range: 2, pieceTypes: ["bishop","king"] },
  { id: "shield",    name: "Shield",    desc: "Schild 2 HP (zelf). (King)",           cooldown: 3, target: "self",  pieceTypes: ["king"] },

  // Eerder toegevoegd
  { id: "poison",    name: "Poison Strike", desc: "Vergiftig vijand (2 beurten). r=1 (Pawn/Knight)", cooldown: 2, target: "enemy", range: 1, pieceTypes: ["pawn","knight"] },
  { id: "stun",      name: "Stunning Blow", desc: "Stun vijand 1 beurt. r=1 (Knight)",             cooldown: 3, target: "enemy", range: 1, pieceTypes: ["knight"] },
  { id: "blink",     name: "Blink",     desc: "Teleporteer naar lege tile binnen r=3 (King)",      cooldown: 3, target: "tile", range: 3, pieceTypes: ["king"] },

  // Nieuw voor zones/fog-of-war
  { id: "rune_flame", name: "Rune of Flames", desc: "Creëer 2 beurten lang een vurig rune-veld (r=1) dat vijanden 1 dmg doet aan beurt-einde. (Queen)", cooldown: 3, target: "tile", radius: 1, range: 3, pieceTypes: ["queen"] },
  { id: "sanctuary",  name: "Sanctuary",     desc: "Creëer 2 beurten een heilig dome (r=1) dat bondgenoten +1 healt aan beurt-einde. (Bishop)", cooldown: 3, target: "tile", radius: 1, range: 2, pieceTypes: ["bishop"] },
  { id: "scry",       name: "Scry",          desc: "Onthul 2 beurten lang een gebied (r=2) voor jouw team. (Queen)", cooldown: 3, target: "tile", radius: 2, range: 4, pieceTypes: ["queen"] },
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
  if ((piece.cooldowns[abilityId] ?? 0) > 0) return false;
  if ((piece.stunned ?? 0) > 0) return false;
  return true;
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

  // Directe effecten
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

  if (ability.id === "poison") {
    const victId = targetSq.pieceId;
    if (!victId) return { text: "Geen doelwit op de tile." };
    const v = state.pieces[victId];
    if (v.faction === caster.faction) return { text: "Doelwit is geen vijand." };
    v.poison = Math.max(v.poison ?? 0, 2);
    res.text = `💀 ${caster.id} vergiftigt ${v.id}.`;
  }

  if (ability.id === "stun") {
    const victId = targetSq.pieceId;
    if (!victId) return { text: "Geen doelwit op de tile." };
    const v = state.pieces[victId];
    if (v.faction === caster.faction) return { text: "Doelwit is geen vijand." };
    v.stunned = Math.max(v.stunned ?? 0, 1);
    res.text = `💫 ${caster.id} stunnt ${v.id}.`;
  }

  if (ability.id === "blink") {
    if (targetSq.pieceId) return { text: "Tile is bezet." };
    caster.pos = { ...targetSq.coord };
    res.moved = { id: caster.id, to: targetSq.coord };
    res.text = `🌀 ${caster.id} blinkt naar (${targetSq.coord.x},${targetSq.coord.y}).`;
  }

  // Zones (tijdelijke velden)
  if (ability.id === "rune_flame") {
    const id = `z-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    state.zones.push({
      id,
      kind: "rune_flame",
      center: targetSq.coord,
      radius: ability.radius ?? 1,
      ttl: 2,
      faction: caster.faction,
      createdBy: caster.id,
    });
    res.text = `🜂 ${caster.id} plaatst een Rune of Flames.`;
  }

  if (ability.id === "sanctuary") {
    const id = `z-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    state.zones.push({
      id,
      kind: "sanctuary",
      center: targetSq.coord,
      radius: ability.radius ?? 1,
      ttl: 2,
      faction: caster.faction,
      createdBy: caster.id,
    });
    res.text = `🕊️ ${caster.id} schept een Sanctuary.`;
  }

  if (ability.id === "scry") {
    const id = `z-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    state.zones.push({
      id,
      kind: "reveal",
      center: targetSq.coord,
      radius: ability.radius ?? 2,
      ttl: 2,
      faction: caster.faction,
      createdBy: caster.id,
    });
    res.text = `👁️ ${caster.id} scryt de omgeving.`;
  }

  caster.cooldowns[abilityId] = ability.cooldown;
  return res;
}
