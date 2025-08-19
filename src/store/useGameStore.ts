import { create } from "zustand";
import { castAbility, canCastAbility } from "../game/abilities";
import { chooseMove } from "../game/ai";
import type { ApplyResult, Coord, Faction, GameState, Piece, AiDifficulty } from "../game/types";
import { baseStats, getSquare, idx, initialPieces, initialTerrain, isEnemy, legalMoves, rebuildBoard } from "../game/chess";

type Actions = {
  selectSquare: (coord: Coord) => void;
  selectAbility: (abilityId: string | undefined) => void;
  movePiece: (to: Coord) => void;
  endTurn: () => void;
  startGame: (faction: Faction) => void;
  endGame: () => void;
  restartGame: () => void;
  runAiTurn: () => void;

  // Nieuwe toggles/instellingen
  setFogEnabled: (on: boolean) => void;
  setVisionRange: (n: number) => void;
  setPerPieceVisionEnabled: (on: boolean) => void;
  setDifficulty: (d: AiDifficulty) => void;
};

const createGameState = (player: Faction): GameState => {
  const board = initialTerrain();
  const pieces = initialPieces();
  const state: GameState = {
    board,
    pieces,
    turn: player,
    player,
    status: "running",
    selected: undefined,
    selectedAbility: undefined,
    legalMoves: [],
    log: [`Spel gestart. ${player} begint.`],
    hasMoved: false,
    zones: [],
    fogEnabled: true,
    visionRange: 3,
    perPieceVisionEnabled: true,
    difficulty: "easy",
  };
  rebuildBoard(state.board, state.pieces);
  return state;
};

const idleState = (): GameState => {
  const board = initialTerrain();
  const pieces: Record<string, Piece> = {};
  const state: GameState = {
    board,
    pieces,
    turn: "white",
    player: "white",
    status: "idle",
    selected: undefined,
    selectedAbility: undefined,
    legalMoves: [],
    log: ["Klik start om te beginnen."],
    hasMoved: false,
    zones: [],
    fogEnabled: true,
    visionRange: 3,
    perPieceVisionEnabled: true,
    difficulty: "easy",
  };
  rebuildBoard(state.board, state.pieces);
  return state;
};

export const useGameStore = create<GameState & Actions>((set, get) => ({
  ...idleState(),

  // Settings
  setFogEnabled: (on) => set({ fogEnabled: on }),
  setVisionRange: (n) => set({ visionRange: Math.max(1, Math.min(6, Math.floor(n))) }),
  setPerPieceVisionEnabled: (on) => set({ perPieceVisionEnabled: on }),
  setDifficulty: (d) => set({ difficulty: d }),

  // Lifecycle
  startGame: (faction) => set(createGameState(faction)),
  endGame: () => set({ status: "ended", log: [...get().log, "Spel beëindigd."] }),
  restartGame: () => set(state => createGameState(state.player)),
  selectAbility: (abilityId) => set({ selectedAbility: abilityId }),

  runAiTurn: () => {
    const state = get();
    if (state.status !== "running") return;
    const move = chooseMove(state, state.turn, state.difficulty);
    if (!move) {
      set({ log: [...state.log, "🤖 geen zet beschikbaar."] });
      get().endTurn();
      return;
    }
    const log = [...state.log, `🤖 ${move.pieceId} -> (${move.to.x},${move.to.y})`];
    set({ selected: move.pieceId, legalMoves: [move.to], log });
    get().movePiece(move.to);
    get().endTurn();
  },

  selectSquare: (coord) => {
    const state = get();
    if (state.status !== "running") return;
    if (state.hasMoved) {
      set({ log: [...state.log, "Je mag maar één actie per beurt uitvoeren."] });
      return;
    }
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
    if (state.status !== "running") return;
    if (!state.selected) return;
    if (state.hasMoved) {
      set({ log: [...state.log, "Je mag maar één actie per beurt uitvoeren."] });
      return;
    }

    const piece = state.pieces[state.selected];

    // Stunned blokkeert bewegen
    if ((piece.stunned ?? 0) > 0) {
      set({ log: [...state.log, `💫 ${piece.id} is stunned en kan niet bewegen.`] });
      return;
    }

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

    // Terrains
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
    set({ selected: undefined, legalMoves: [], log, hasMoved: true });
  },

  endTurn: () => {
    const state = get();
    if (state.status !== "running") return;

    const log = [...state.log];

    // Cooldowns + status ticks
    for (const p of Object.values(state.pieces)) {
      // cooldowns
      for (const key of Object.keys(p.cooldowns)) p.cooldowns[key] = Math.max(0, p.cooldowns[key] - 1);

      // poison tick (1 dmg)
      if ((p.poison ?? 0) > 0) {
        p.hp -= 1;
        p.poison = Math.max(0, (p.poison ?? 0) - 1);
        log.push(`☠️ ${p.id} lijdt 1 poison damage.`);
        if (p.hp <= 0) {
          delete state.pieces[p.id];
          log.push(`☠️ ${p.id} bezwijkt aan het gif.`);
        }
      }

      // stun tick
      if ((p.stunned ?? 0) > 0) {
        p.stunned = Math.max(0, (p.stunned ?? 0) - 1);
        if (p.stunned === 0) log.push(`💫 ${p.id} herstelt van stun.`);
      }
    }

    // Zone effecten (eind van beurt)
    const zones = state.zones;
    const cheb = (a: {x:number;y:number}, b:{x:number;y:number}) => Math.max(Math.abs(a.x-b.x), Math.abs(a.y-b.y));

    for (const z of zones) {
      if (z.kind === "rune_flame") {
        for (const p of Object.values(state.pieces)) {
          if (cheb(p.pos, z.center) <= z.radius && p.faction !== z.faction) {
            p.hp -= 1;
            log.push(`🜂 ${p.id} verbrandt 1 HP op Rune of Flames.`);
            if (p.hp <= 0) {
              delete state.pieces[p.id];
              log.push(`☠️ ${p.id} gaat ten onder in het vuur.`);
            }
          }
        }
      } else if (z.kind === "sanctuary") {
        for (const p of Object.values(state.pieces)) {
          if (cheb(p.pos, z.center) <= z.radius && p.faction === z.faction) {
            const max = baseStats(p.type).maxHp;
            const before = p.hp;
            p.hp = Math.min(max, p.hp + 1);
            if (p.hp > before) log.push(`🕊️ ${p.id} wordt geheeld (+1) in Sanctuary.`);
          }
        }
      }
      // reveal: UI only
      z.ttl = Math.max(0, z.ttl - 1);
    }

    // Verwijder verlopen zones
    state.zones = zones.filter(z => z.ttl > 0);

    // beurt wisselen
    const next: Faction = state.turn === "white" ? "black" : "white";
    rebuildBoard(state.board, state.pieces);
    set({
      turn: next,
      selected: undefined,
      selectedAbility: undefined,
      legalMoves: [],
      log: [...log, `— Einde beurt. ${next} is aan zet.`],
      zones: state.zones,
      hasMoved: false,
    });
    if (next !== state.player) {
      setTimeout(() => get().runAiTurn(), 500);
    }
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
  set({ selected: undefined, selectedAbility: undefined, legalMoves: [], log, hasMoved: true });
}
