import { Trash2 } from "lucide-react";
import { fetchItemIcon } from "../api/mapleApi";
import ScrollEffectCanvas, {
  type ScrollEffectHandle,
} from "./ScrollEffectCanvas";
import { Skeleton } from "./Skeleton";

interface ScrollingItemDisplayProps {
  itemId: number;
  itemName: string;
  isBoomed: boolean;
  loading: boolean;
  effectRef: React.RefObject<ScrollEffectHandle | null>;
}

const ScrollingItemDisplay = ({
  itemId,
  itemName,
  isBoomed,
  loading,
  effectRef,
}: ScrollingItemDisplayProps) => {
  return (
    <div className="relative w-full md:w-64 aspect-square rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden bg-black/20 shrink-0">
      {isBoomed ? (
        <div className="flex flex-col items-center gap-3 text-center animate-in zoom-in duration-500 px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Destroyed</h3>
            <p className="text-white/40 text-xs">Unlucky!</p>
          </div>
        </div>
      ) : (
        <div className="relative group flex items-center justify-center">
          {loading ? (
            <Skeleton className="w-32 h-32 rounded-3xl" />
          ) : (
            <img
              src={fetchItemIcon(itemId)}
              alt={itemName}
              className="w-32 h-32 object-contain scale-125"
              style={{ imageRendering: "pixelated" }}
            />
          )}
          {/* Effect Canvas on top */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <ScrollEffectCanvas ref={effectRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollingItemDisplay;
