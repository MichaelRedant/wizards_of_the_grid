import type {
  Coord,
  Piece,
  PieceType,
  GameState,
  Faction,
  Square,
  CharacterOptions,
  CharacterClass,
  Ancestry,
  Background,
} from "./types";

export function inBounds(c: Coord) { return c.x >= 0 && c.x < 8 && c.y >= 0 && c.y < 8; }
export function idx(c: Coord) { return c.y * 8 + c.x; }

export function getSquare(board: Square[], c: Coord): Square | undefined {
  if (!inBounds(c)) return;
  return board[idx(c)];
}
export function isEnemy(a: Piece, b?: Piece) { return !!b && a.faction !== b.faction; }

export function initialTerrain(): Square[] {
  const board: Square[] = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    let terrain: Square["terrain"] = "none";
    if ((x === 3 && y === 3) || (x === 4 && y === 4)) terrain = "arcane";
    if ((x === 2 && y === 5) || (x === 5 && y === 2)) terrain = "heal";
    if ((x === 1 && y === 1) || (x === 6 && y === 6)) terrain = "trap";
    board.push({ coord: { x, y }, terrain });
  }
  return board;
}

export function baseStats(type: PieceType) {
  switch (type) {
    case "king":   return { maxHp: 8, attack: 2, range: 2, armor: 1 };
    case "queen":  return { maxHp: 6, attack: 3, range: 3, armor: 0 };
    case "rook":   return { maxHp: 6, attack: 2, range: 2, armor: 1 };
    case "bishop": return { maxHp: 5, attack: 2, range: 2, armor: 0 };
    case "knight": return { maxHp: 5, attack: 2, range: 1, armor: 0 };
    case "pawn":   return { maxHp: 3, attack: 1, range: 1, armor: 0 };
  }
}

function defaultOptions(type: PieceType, faction: Faction): CharacterOptions {
  const ancestry: Ancestry = faction === "white" ? "human" : "elf";
  let background: Background = "commoner";
  let cls: CharacterClass = "fighter";
  const perks: string[] = [];

  switch (type) {
    case "king":
      cls = "artificer";
      background = "noble";
      perks.push("arcane_engineer");
      break;
    case "queen":
      cls = "bloodmage";
      background = "noble";
      perks.push("blood_pact");
      break;
    case "knight":
      cls = "shadow_monk";
      background = "soldier";
      perks.push("shadow_step");
      break;
    case "bishop":
      background = "scholar";
      break;
    case "rook":
      background = "noble";
      break;
    case "pawn":
      background = "commoner";
      break;
  }

  return { class: cls, ancestry, background, perks };
}


function pawnOptions(faction: Faction, cls: CharacterClass): CharacterOptions {
  const ancestry: Ancestry = faction === "white" ? "human" : "elf";
  const background: Background = "commoner";
  const perks: string[] = [];
  if (cls === "artificer") perks.push("arcane_engineer");
  else if (cls === "bloodmage") perks.push("blood_pact");
  else if (cls === "shadow_monk") perks.push("shadow_step");
  return { class: cls, ancestry, background, perks };
}

export function initialPieces(playerFaction: Faction, pawnCls: CharacterClass): Record<string, Piece> {
  const pieces: Record<string, Piece> = {};
  const add = (id: string, type: PieceType, faction: Faction, x: number, y: number) => {
    const s = baseStats(type);
    let options = defaultOptions(type, faction);
    if (type === "pawn" && faction === playerFaction) {
      options = pawnOptions(faction, pawnCls);
    }

    pieces[id] = {
      id,
      type,
      faction,
      pos: { x, y },
      hp: s.maxHp,
      xp: 0,
      cooldowns: {},

      options,

    };
  };

  // white
  add("w_r1","rook","white",0,7); add("w_n1","knight","white",1,7); add("w_b1","bishop","white",2,7);
  add("w_q","queen","white",3,7); add("w_k","king","white",4,7);
  add("w_b2","bishop","white",5,7); add("w_n2","knight","white",6,7); add("w_r2","rook","white",7,7);
  for (let x = 0; x < 8; x++) add(`w_p${x}`,"pawn","white",x,6);

  // black
  add("b_r1","rook","black",0,0); add("b_n1","knight","black",1,0); add("b_b1","bishop","black",2,0);
  add("b_q","queen","black",3,0); add("b_k","king","black",4,0);
  add("b_b2","bishop","black",5,0); add("b_n2","knight","black",6,0); add("b_r2","rook","black",7,0);
  for (let x = 0; x < 8; x++) add(`b_p${x}`,"pawn","black",x,1);

  return pieces;
}

export function rebuildBoard(board: Square[], pieces: Record<string, Piece>) {
  for (const s of board) s.pieceId = undefined;
  for (const p of Object.values(pieces)) {
    const s = getSquare(board, p.pos);
    if (s) s.pieceId = p.id;
  }
}

function lineMoves(state: GameState, piece: Piece, dirs: Coord[]) {
  const moves: Coord[] = [];
  for (const d of dirs) {
    let x = piece.pos.x + d.x, y = piece.pos.y + d.y;
    while (inBounds({ x, y })) {
      const sq = getSquare(state.board, { x, y })!;
      moves.push({ x, y });
      if (sq.pieceId) break;
      x += d.x; y += d.y;
    }
  }
  return moves;
}

export function legalMoves(state: GameState, piece: Piece): Coord[] {
  switch (piece.type) {
    case "rook":   return lineMoves(state, piece, [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]);
    case "bishop": return lineMoves(state, piece, [{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1}]);
    case "queen":  return lineMoves(state, piece, [
      {x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1},{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1}
    ]);
    case "king": {
      const deltas = [-1,0,1].flatMap(dx => [-1,0,1].map(dy => ({x:piece.pos.x+dx,y:piece.pos.y+dy})))
        .filter(c => !(c.x===piece.pos.x && c.y===piece.pos.y));
      return deltas.filter(inBounds);
    }
    case "knight": {
      const ds = [
        {x:2,y:1},{x:2,y:-1},{x:-2,y:1},{x:-2,y:-1},{x:1,y:2},{x:1,y:-2},{x:-1,y:2},{x:-1,y:-2}
      ].map(d => ({x: piece.pos.x + d.x, y: piece.pos.y + d.y}));
      let moves = ds.filter(inBounds);
      if (piece.options.perks.includes("shadow_step")) {
        const extra = [-1,0,1].flatMap(dx =>
          [-1,0,1].map(dy => ({x: piece.pos.x + dx, y: piece.pos.y + dy}))
        ).filter(c => !(c.x===piece.pos.x && c.y===piece.pos.y));
        moves = moves.concat(extra.filter(inBounds));
      }
      return moves;
    }
    case "pawn": {
      const dir = piece.faction === "white" ? -1 : 1;
      const fwd = { x: piece.pos.x, y: piece.pos.y + dir };
      const moves: Coord[] = [];
      const fwdSq = getSquare(state.board, fwd);
      if (fwdSq && !fwdSq.pieceId) moves.push(fwd);
      const caps = [{ x: piece.pos.x + 1, y: piece.pos.y + dir }, { x: piece.pos.x - 1, y: piece.pos.y + dir }]
        .filter(inBounds);
      moves.push(...caps);
      return moves;
    }
  }
}

export function distance(a: Coord, b: Coord) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
