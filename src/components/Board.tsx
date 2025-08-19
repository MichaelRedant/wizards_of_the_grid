import { useGameStore } from "../store/useGameStore";
import Square from "./Square";
import PieceView from "./Piece";
import { cx } from "../utils/cx";

export default function Board() {
  const board = useGameStore(s => s.board);
  const pieces = useGameStore(s => s.pieces);
  const legalMoves = useGameStore(s => s.legalMoves);
  const selected = useGameStore(s => s.selected);
  const selectSquare = useGameStore(s => s.selectSquare);
  const status = useGameStore(s => s.status);

  return (
    <div className="relative grid grid-cols-8 aspect-square rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
      {board.map((sq, i) => {
        const isLight = (sq.coord.x + sq.coord.y) % 2 === 0;
        const on = () => selectSquare(sq.coord);
        const isMove = legalMoves.some(m => m.x === sq.coord.x && m.y === sq.coord.y);
        const isSelected =
          selected ? pieces[selected]?.pos.x === sq.coord.x && pieces[selected]?.pos.y === sq.coord.y : false;

        return (
          <div
            key={i}
            onClick={status === "running" ? on : undefined}
            className={cx(
              "relative cursor-pointer select-none",
              isLight ? "bg-boardLight" : "bg-boardDark",
              "hover:brightness-110"
            )}
          >
            <Square square={sq} isSelected={isSelected} isLegal={isMove} />
            {sq.pieceId && <PieceView piece={pieces[sq.pieceId]} />}
          </div>
        );
      })}
      {status !== "running" && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
          {status === "idle" ? "Start het spel." : "Spel beëindigd."}
        </div>
      )}
    </div>
  );
}
