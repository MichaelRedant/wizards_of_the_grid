import { create } from "zustand";
import { castAbility, canCastAbility } from "../game/abilities";
import type { ApplyResult, Coord, Faction, GameState } from "../game/types";
import { baseStats, getSquare, idx, initialPieces, initialTerrain, isEnemy, legalMoves, rebuildBoard } from "../game/chess";

type Actions = {
  selectSquare: (coord: Coord) => void;
  selectAbility: (abilityId: string | undefined) => void;
  movePiece: (to: Coord) => void;
  endTurn: () => void;
  reset: () => void;
};

const initialState = (): GameState => {
  const board = initialTerrain();
  const pieces = initialPieces();
  const state: GameState = {
    board,
    pieces,
    turn: "white",
    selected: undefined,
    selectedAbility: undefined,
    legalMoves: [],
    log: ["Spel gestart. White begint."],
  };
  rebuildBoard(state.board, state.pieces);
  return state;
};

export const useGameStore = create<GameState & Actions>((set, get) => ({
  ...initialState(),

  reset: () => set(initialState()),
  selectAbility: (abilityId) => set({ selectedAbility: abilityId }),

  selectSquare: (coord) => {
    const state = get();
    const sq = getSquare(state.board, coord);
    if (!sq) return;

    // Ability target mode
    if (state.selected && state.selectedAbility) {
      const caster = state.pieces[state.selected];
      if (caster.faction !== state.turn) return;

      if (!canCastAbility(caster, state.selectedAbility)) {
        set({ log: [...state.log, "Ability niet beschikbaar."] });
        return;
      }

      const res = castAbility(state, caster, state.selectedAbility, idx(coord));
      applyResult(set, get, res);
      return;
    }

    // Select piece or attempt move
    if (sq.pieceId) {
      const p = state.pieces[sq.pieceId];
      if (p.faction !== state.turn) return;
      const moves = legalMoves(state, p);
      set({ selected: p.id, legalMoves: moves, selectedAbility: undefined });
    } else if (state.selected) {
      get().movePiece(coord);
    }
  },

  movePiece: (to) => {
    const state = get();
    if (!state.selected) return;
    const piece = state.pieces[state.selected];
    const allowed = state.legalMoves.some(m => m.x === to.x && m.y === to.y);
    if (!allowed) return;

    const destSq = getSquare(state.board, to)!;
    const log = [...state.log];

    if (destSq.pieceId) {
      const target = state.pieces[destSq.pieceId];
      if (isEnemy(piece, target)) {
        const atk = baseStats(piece.type).attack;
        const armor = baseStats(target.type).armor ?? 0;
        const block = target.shield ? 1 : 0;
        const dmg = Math.max(0, atk - armor - block);
        if (target.shield) target.shield = Math.max(0, (target.shield ?? 0) - atk);
        target.hp -= dmg;

        if (target.hp <= 0) {
          log.push(`☠️ ${piece.id} verslaat ${target.id}.`);
          piece.xp += 1;
          if (piece.type === "pawn" && piece.xp >= 2) {
            piece.type = "knight";
            const st = baseStats(piece.type);
            piece.hp = Math.max(piece.hp, st.maxHp);
            log.push(`🔺 ${piece.id} promoveert tot Knight.`);
          }
          delete state.pieces[target.id];
          piece.pos = { ...to };
        } else {
          log.push(`⚔️ ${piece.id} valt ${target.id} aan voor ${dmg} dmg.`);
        }
      } else return;
    } else {
      piece.pos = { ...to };
      log.push(`🧩 ${piece.id} verplaatst.`);
    }

    rebuildBoard(state.board, state.pieces);
    const tile = getSquare(state.board, piece.pos)!;
    if (tile.terrain === "heal") {
      piece.hp = Math.min(baseStats(piece.type).maxHp, piece.hp + 1);
      log.push(`💚 ${piece.id} +1 HP op Healing Spring.`);
    } else if (tile.terrain === "trap") {
      piece.hp -= 1;
      log.push(`💥 ${piece.id} trapt op een val (-1 HP).`);
      if (piece.hp <= 0) {
        log.push(`☠️ ${piece.id} sneuvelt op de val.`);
        delete state.pieces[piece.id];
      }
    } else if (tile.terrain === "arcane") {
      for (const k of Object.keys(piece.cooldowns)) piece.cooldowns[k] = Math.max(0, piece.cooldowns[k] - 1);
      log.push(`🔮 Arcane Rift vermindert cooldowns van ${piece.id}.`);
    }

    rebuildBoard(state.board, state.pieces);
    set({ selected: undefined, legalMoves: [], log });
  },

  endTurn: () => {
    const state = get();
    for (const p of Object.values(state.pieces)) {
      for (const key of Object.keys(p.cooldowns)) p.cooldowns[key] = Math.max(0, p.cooldowns[key] - 1);
    }
    const next: Faction = state.turn === "white" ? "black" : "white";
    set({
      turn: next,
      selected: undefined,
      selectedAbility: undefined,
      legalMoves: [],
      log: [...state.log, `— Einde beurt. ${next} is aan zet.`],
    });
  },
}));

function applyResult(
  set: (partial: Partial<GameState>) => void,
  get: () => GameState,
  res: ApplyResult | null
) {
  const state = get();
  if (!res) return;
  const log = [...state.log];
  if (res.text) log.push(res.text);

  if (res.killedIds?.length) {
    for (const id of res.killedIds) {
      const killer = state.selected ? state.pieces[state.selected] : undefined;
      if (killer) killer.xp += 1;
      delete state.pieces[id];
      log.push(`☠️ ${id} is verslagen.`);
    }
  }
  if (res.healed) for (const h of res.healed) log.push(`💚 ${h.id} +${h.amount} HP.`);
  if (res.shielded) for (const s of res.shielded) log.push(`🛡️ ${s.id} krijgt schild (${s.amount}).`);
  if (res.damaged) for (const d of res.damaged) log.push(`💢 ${d.id} -${d.amount} HP.`);

  rebuildBoard(state.board, state.pieces);
  set({ selectedAbility: undefined, legalMoves: [], log });
}
