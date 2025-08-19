export type Faction = "white" | "black";
export type Terrain = "none" | "heal" | "arcane" | "trap";
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

export type Coord = { x: number; y: number }; // x: 0-7, y: 0-7
export type GameStatus = "idle" | "running" | "ended";

/** Tijdelijke zones op het bord met effecten per beurt */
export type ZoneKind = "rune_flame" | "sanctuary" | "reveal";
export interface Zone {
  id: string;
  kind: ZoneKind;
  center: Coord;
  radius: number;
  ttl: number;          // beurten resterend
  faction: Faction;     // eigenaar/controller van de zone
  createdBy?: string;   // pieceId (optioneel)
}

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

  // DnD statuseffecten
  poison?: number;   // doet 1 dmg bij endTurn
  stunned?: number;  // blokkeert move/ability
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
  player: Faction;
  status: GameStatus;
  selected?: string;        // pieceId
  selectedAbility?: string; // abilityId
  legalMoves: Coord[];
  log: string[];

  // Zones & Fog-of-war
  zones: Zone[];
  fogEnabled: boolean;
  visionRange: number;           // globaal zicht (Chebyshev)
  perPieceVisionEnabled: boolean; // of board per-stuk vision gebruikt
}

export type ApplyResult = {
  killedIds?: string[];
  moved?: { id: string; to: Coord };
  healed?: { id: string; amount: number }[];
  shielded?: { id: string; amount: number; turns: number }[];
  damaged?: { id: string; amount: number }[];
  text?: string;
};
