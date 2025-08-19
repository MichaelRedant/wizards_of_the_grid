import { legalMoves, getSquare, isEnemy, distance } from "./chess";
import type { GameState, Faction, Coord, AiDifficulty, PieceType } from "./types";

const PIECE_VALUES: Record<PieceType, number> = {
  king: 100,
  queen: 9,
  rook: 5,
  bishop: 3,
  knight: 3,
  pawn: 1,
};

export function chooseMove(
  state: GameState,
  faction: Faction,
  difficulty: AiDifficulty
): { pieceId: string; to: Coord } | null {
  const candidates = Object.values(state.pieces)
    .filter(p => p.faction === faction && (p.stunned ?? 0) === 0)
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

  if (difficulty === "easy") {
    const { piece, moves } = candidates[Math.floor(Math.random() * candidates.length)];
    const to = moves[Math.floor(Math.random() * moves.length)];
    return { pieceId: piece.id, to };
  }

  if (difficulty === "medium") {
    const captureMoves: { pieceId: string; to: Coord }[] = [];
    for (const { piece, moves } of candidates) {
      for (const to of moves) {
        const targetSq = getSquare(state.board, to);
        if (targetSq?.pieceId && isEnemy(piece, state.pieces[targetSq.pieceId])) {
          captureMoves.push({ pieceId: piece.id, to });
        }
      }
    }
    if (captureMoves.length > 0) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    const { piece, moves } = candidates[Math.floor(Math.random() * candidates.length)];
    const to = moves[Math.floor(Math.random() * moves.length)];
    return { pieceId: piece.id, to };
  }

  let best: { pieceId: string; to: Coord; score: number } | null = null;
  const enemies = Object.values(state.pieces).filter(p => p.faction !== faction);

  for (const { piece, moves } of candidates) {
    for (const to of moves) {
      const sq = getSquare(state.board, to);
      const target = sq?.pieceId ? state.pieces[sq.pieceId] : undefined;
      let score = 0;
      if (target && isEnemy(piece, target)) {
        score += PIECE_VALUES[target.type] * 10;
      }
      const dists = enemies.map(e => distance(to, e.pos));
      const minDist = dists.length ? Math.min(...dists) : 0;
      score -= minDist;
      if (!best || score > best.score) {
        best = { pieceId: piece.id, to, score };
      }
    }
  }

  if (best) return { pieceId: best.pieceId, to: best.to };

  const { piece, moves } = candidates[Math.floor(Math.random() * candidates.length)];
  const to = moves[Math.floor(Math.random() * moves.length)];
  return { pieceId: piece.id, to };
}
