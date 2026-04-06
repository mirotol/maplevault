import { Sparkles } from "lucide-react";
import { SCROLLS, type Scroll } from "./ScrollingSimulator.constants";

interface ScrollingScrollSelectorProps {
  selectedScroll: Scroll | null;
  onSelectScroll: (scroll: Scroll) => void;
  disabled: boolean;
}

const ScrollingScrollSelector = ({
  selectedScroll,
  onSelectScroll,
  disabled,
}: ScrollingScrollSelectorProps) => {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.15em] px-1">
        Choose Scroll
      </h4>
      <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
        {SCROLLS.map((scroll) => (
          <button
            key={scroll.name}
            type="button"
            disabled={disabled}
            onClick={() => onSelectScroll(scroll)}
            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 group relative overflow-hidden ${
              selectedScroll?.name === scroll.name
                ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500 shadow-lg shadow-orange-900/20"
                : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <div
              className={`absolute inset-0 ${scroll.color} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
            <Sparkles
              className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${
                selectedScroll?.name === scroll.name
                  ? "text-orange-400"
                  : "text-white/40"
              }`}
            />
            <span className="text-xs font-bold text-white tracking-tight">
              {scroll.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScrollingScrollSelector;
