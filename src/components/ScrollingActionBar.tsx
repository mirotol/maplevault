import { Hammer, RotateCcw } from "lucide-react";

interface ScrollingActionBarProps {
  onApply: () => void;
  onReset: () => void;
  isAnimating: boolean;
  isBoomed: boolean;
  selectedScrollName?: string;
  canApply: boolean;
}

const ScrollingActionBar = ({
  onApply,
  onReset,
  isAnimating,
  isBoomed,
  selectedScrollName,
  canApply,
}: ScrollingActionBarProps) => {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        disabled={!canApply && !isBoomed}
        onClick={onApply}
        className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl ${
          isBoomed
            ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/40 active:scale-[0.98]"
            : !canApply
              ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-900/40 active:scale-[0.98] active:brightness-110"
        }`}
      >
        {isAnimating ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Applying...</span>
          </div>
        ) : isBoomed ? (
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6" />
            <span>Try Again</span>
          </div>
        ) : (
          <>
            <Hammer className="w-6 h-6" />{" "}
            <span>Apply {selectedScrollName || "Scroll"}</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onReset}
        className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-[0.95] group"
        title="Reset Item"
      >
        <RotateCcw className="w-6 h-6 group-hover:rotate-[-45deg] transition-transform" />
      </button>
    </div>
  );
};

export default ScrollingActionBar;
