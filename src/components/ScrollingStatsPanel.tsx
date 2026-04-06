import type { ItemMeta } from "../types/maple";
import { STAT_LABELS } from "./ScrollingSimulator.constants";

interface ScrollingStatsPanelProps {
  stats: ItemMeta | null;
  slots: number;
}

const ScrollingStatsPanel = ({ stats, slots }: ScrollingStatsPanelProps) => {
  if (!stats) return null;

  const displayStats = Object.entries(STAT_LABELS)
    .map(([key, label]) => ({
      label,
      value: stats[key as keyof ItemMeta] as number | undefined,
    }))
    .filter((s) => s.value !== undefined && s.value !== 0);

  return (
    <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <span className="text-orange-200 font-bold uppercase text-xs tracking-wider">
          Attributes
        </span>
        <span className="text-sm font-bold text-white bg-orange-600/50 px-2 py-0.5 rounded">
          Slots: {slots}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {displayStats.map((s) => (
          <div key={s.label} className="flex justify-between text-sm">
            <span className="text-white/50">{s.label}</span>
            <span className="text-white font-medium">
              {s.value! > 0 ? "+" : ""}
              {s.value}
            </span>
          </div>
        ))}
        {displayStats.length === 0 && (
          <span className="col-span-2 text-white/30 text-center py-2 italic text-xs">
            No bonus stats
          </span>
        )}
      </div>
    </div>
  );
};

export default ScrollingStatsPanel;
