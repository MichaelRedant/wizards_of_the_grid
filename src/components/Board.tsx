import { useGameStore } from "../store/useGameStore";
import Square from "./Square";
import PieceView from "./Piece";
import { cx } from "../utils/cx";
import type { Coord, PieceType } from "../game/types";

export default function Board() {
  const board = useGameStore(s => s.board);
  const pieces = useGameStore(s => s.pieces);
  const legalMoves = useGameStore(s => s.legalMoves);
  const selected = useGameStore(s => s.selected);
  const selectSquare = useGameStore(s => s.selectSquare);
  const status = useGameStore(s => s.status);
  const zones = useGameStore(s => s.zones);
  const fogEnabled = useGameStore(s => s.fogEnabled);
  const visionGlobal = useGameStore(s => s.visionRange);
  const perPieceVision = useGameStore(s => s.perPieceVisionEnabled);
  const turn = useGameStore(s => s.turn);

  const cheb = (a: Coord, b: Coord) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  const key = (c: Coord) => `${c.x},${c.y}`;

  // Basiszicht per stuktype
  const BASE_VISION: Record<PieceType, number> = {
    king: 3,
    queen: 4,
    rook: 4,
    bishop: 4,
    knight: 3,
    pawn: 2,
  };

  // Speciale regels
  const TRUE_SIGHT = 5;   // queen
  const NIGHT_VISION = 5; // bishop
  const TORCH_RADIUS = 3; // pawn

  // Sets voor zicht + “glow”-overlays
  const visible = new Set<string>();
  const torchTiles = new Set<string>();
  const nightTiles = new Set<string>();
  const trueTiles = new Set<string>();

  // Helper om een vierkante Chebyshev radius te itereren
  function addRadius(center: Coord, r: number, into: Set<string>) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = center.x + dx, y = center.y + dy;
        if (x >= 0 && x < 8 && y >= 0 && y < 8) into.add(`${x},${y}`);
      }
    }
  }

  if (!fogEnabled) {
    for (const sq of board) visible.add(key(sq.coord));
  } else {
    // Zicht door eigen stukken
    for (const p of Object.values(pieces)) {
      if (p.faction !== turn) continue;

      const base = perPieceVision ? (BASE_VISION[p.type] ?? visionGlobal) : visionGlobal;

      // Pas specials toe
      let r = base;
      if (p.type === "queen") r = Math.max(r, TRUE_SIGHT);
      if (p.type === "bishop") r = Math.max(r, NIGHT_VISION);

      // Algemene zichtcirkel
      addRadius(p.pos, r, visible);

      // Glows voor overlays
      if (p.type === "queen") addRadius(p.pos, r, trueTiles);
      if (p.type === "bishop") addRadius(p.pos, r, nightTiles);

      // Pawn torchlight (warmer, duidelijk zichtbaar)
      if (p.type === "pawn") {
        const torchR = Math.max(base, TORCH_RADIUS);
        addRadius(p.pos, torchR, visible);
        addRadius(p.pos, torchR, torchTiles);
      }

      // Altijd de eigen tile
      visible.add(key(p.pos));
    }

    // Reveal-zones (scry)
    for (const z of zones) {
      if (z.kind !== "reveal" || z.faction !== turn) continue;
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        const c = { x, y };
        if (cheb(c, z.center) <= z.radius) visible.add(key(c));
      }
    }
  }

  return (
    <div className="relative grid grid-cols-8 h-full max-w-full aspect-square rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
      {board.map((sq, i) => {
        const isLight = (sq.coord.x + sq.coord.y) % 2 === 0;
        const on = () => selectSquare(sq.coord);
        const isMove = legalMoves.some(m => m.x === sq.coord.x && m.y === sq.coord.y);
        const isSelected =
          selected ? pieces[selected]?.pos.x === sq.coord.x && pieces[selected]?.pos.y === sq.coord.y : false;

        const tileClass = isLight ? "dnd-tile dnd-tile--light" : "dnd-tile dnd-tile--dark";

        // Zone overlays (runes/sanctuary/reveal)
        const zoneClasses: string[] = [];
        for (const z of zones) {
          if (cheb(sq.coord, z.center) <= z.radius) {
            if (z.kind === "rune_flame") zoneClasses.push("zone-rune");
            else if (z.kind === "sanctuary") zoneClasses.push("zone-sanctuary");
            else if (z.kind === "reveal") zoneClasses.push("zone-reveal");
          }
        }

        // Vision overlays
        const k = key(sq.coord);
        if (torchTiles.has(k)) zoneClasses.push("vision-torch");
        if (nightTiles.has(k)) zoneClasses.push("vision-night");
        if (trueTiles.has(k)) zoneClasses.push("vision-true");

        const isVisible = visible.has(k);
        const dimmed = fogEnabled && !isVisible;

        const pieceId = sq.pieceId;
        const piece = pieceId ? pieces[pieceId] : undefined;
        const showPiece = piece ? (piece.faction === turn || !dimmed) : false;

        return (
          <div
            key={i}
            onClick={status === "running" ? on : undefined}
            className={cx("relative cursor-pointer select-none", tileClass, "hover:brightness-110")}
          >
            <Square
              square={sq}
              isSelected={isSelected}
              isLegal={isMove}
              zoneClasses={zoneClasses}
              dimmed={dimmed}
            />
            {piece && showPiece && <PieceView piece={piece} terrain={sq.terrain} />}
          </div>
        );
      })}

      {status !== "running" && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
          {status === "idle" ? "Kies een kleur om te starten." : "Spel beëindigd."}
        </div>
      )}
    </div>
  );
}
