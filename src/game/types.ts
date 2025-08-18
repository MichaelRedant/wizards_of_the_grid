export type Faction = "white" | "black";
export type Terrain = "none" | "heal" | "arcane" | "trap";
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

export type Coord = { x: number; y: number }; // x: 0-7, y: 0-7

export interface Ability {
  id: string;
  name: string;
  desc: string;
  cooldown: number;
  target: "tile" | "self" | "ally" | "enemy" | "area";
  radius?: number;
  range?: number;
  pieceTypes?: PieceType[];
}

export interface Piece {
  id: string;
  type: PieceType;
  faction: Faction;
  pos: Coord;
  hp: number;
  xp: number;
  cooldowns: Record<string, number>;
  shield?: number;
}

export interface Square {
  coord: Coord;
  terrain: Terrain;
  pieceId?: string;
}

export interface GameState {
  board: Square[];
  pieces: Record<string, Piece>;
  turn: Faction;
  selected?: string;        // pieceId
  selectedAbility?: string; // abilityId
  legalMoves: Coord[];
  log: string[];
}

export type ApplyResult = {
  killedIds?: string[];
  moved?: { id: string; to: Coord };
  healed?: { id: string; amount: number }[];
  shielded?: { id: string; amount: number; turns: number }[];
  damaged?: { id: string; amount: number }[];
  text?: string;
};
