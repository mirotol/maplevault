import { fetchItemIcon } from "../api/mapleApi";
import type { Item } from "../types/maple";

interface ItemCardProps {
  item: Item;
}

const ItemCard = ({ item }: ItemCardProps) => {
  const icon = fetchItemIcon(item.id);

  return (
    <div className="w-full h-full bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 text-white/90 border border-white/5 transition-all duration-300 hover:bg-slate-700/50 hover:border-orange-500/30 flex flex-col items-center text-center group">
      {/* Icon */}
      <div className="w-16 h-16 mb-4 bg-black/20 rounded-lg p-2 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
        <img
          src={icon}
          alt={item.name}
          className="max-w-[90%] max-h-[90%] object-contain scale-150"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 w-full items-center">
        <h3 className="text-base font-medium group-hover:text-orange-400 transition-colors line-clamp-2 mb-1">
          {item.name}
        </h3>
        <span className="text-[10px] opacity-30 font-mono mb-3">ID: {item.id}</span>

        <div className="mt-auto">
          <span className="px-2 py-0.5 bg-white/5 text-white/60 text-[10px] font-bold rounded uppercase tracking-widest border border-white/5">
            {item.typeInfo.subCategory || "Other"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
