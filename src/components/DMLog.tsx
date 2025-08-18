import { useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";

export default function DMLog() {
  const log = useGameStore(s => s.log);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  return (
    <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 h-64 overflow-auto" ref={ref}>
      <div className="text-sm font-semibold mb-2">Dungeon Master Log</div>
      <ul className="space-y-1 text-sm">
        {log.map((line, i) => (
          <li key={i} className="text-slate-300">{line}</li>
        ))}
      </ul>
    </div>
  );
}
