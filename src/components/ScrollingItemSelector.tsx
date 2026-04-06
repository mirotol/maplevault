import { fetchItemIcon } from "../api/mapleApi";
import { SIMULATOR_ITEMS } from "./ScrollingSimulator.constants";

interface ScrollingItemSelectorProps {
  selectedItemId: number;
  onSelectItem: (item: (typeof SIMULATOR_ITEMS)[0]) => void;
}

const ScrollingItemSelector = ({
  selectedItemId,
  onSelectItem,
}: ScrollingItemSelectorProps) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest px-1">
        Select Equipment
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 custom-scrollbar">
        {SIMULATOR_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item)}
            className={`relative p-3 rounded-2xl border-2 transition-all shrink-0 bg-white/5 hover:bg-white/10 group ${
              selectedItemId === item.id
                ? "border-orange-500 bg-orange-500/10"
                : "border-white/5"
            }`}
          >
            <img
              src={fetchItemIcon(item.id)}
              alt={item.name}
              className={`w-12 h-12 object-contain transition-transform duration-300 ${
                selectedItemId === item.id
                  ? "scale-110"
                  : "opacity-60 group-hover:opacity-100"
              }`}
              style={{ imageRendering: "pixelated" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScrollingItemSelector;
