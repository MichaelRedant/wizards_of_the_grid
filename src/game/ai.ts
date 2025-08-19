import { legalMoves, getSquare, isEnemy } from "./chess";
import type { GameState, Faction, Coord } from "./types";

export function chooseMove(state: GameState, faction: Faction): { pieceId: string; to: Coord } | null {
  const candidates = Object.values(state.pieces)
    .filter(p => p.faction === faction)
    .map(piece => {
      const moves = legalMoves(state, piece).filter(m => {
        const sq = getSquare(state.board, m);
        if (!sq) return false;
        if (!sq.pieceId) return true;
        const target = state.pieces[sq.pieceId];
        return isEnemy(piece, target);
      });
      return { piece, moves };
    })
    .filter(entry => entry.moves.length > 0);

  if (candidates.length === 0) return null;
  const { piece, moves } = candidates[Math.floor(Math.random() * candidates.length)];
  const to = moves[Math.floor(Math.random() * moves.length)];
  return { pieceId: piece.id, to };
}
