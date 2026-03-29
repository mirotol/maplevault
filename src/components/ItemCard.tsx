import { fetchItemIcon } from "../api/mapleApi";
import type { Item } from "../types/maple";

interface ItemCardProps {
  item: Item;
}

const ItemCard = ({ item }: ItemCardProps) => {
  const icon = fetchItemIcon(item.id);

  return (
    <div className="w-full h-full card-equipment-bg rounded-lg shadow-xl p-6 text-white/90 border border-transparent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[5px_15px_30px_-5px_rgba(5,12,41,0.8)] hover:border-orange-600/60 group flex flex-col items-center text-center relative overflow-hidden">
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 border border-white/5 rounded-lg pointer-events-none" />

      {/* Icon */}
      <div className="w-20 h-20 mb-4 bg-white/20 rounded-lg p-2 flex items-center justify-center border border-white/10 shrink-0 group-hover:border-white/20 transition-all shadow-inner relative z-10">
        <img
          src={icon}
          alt={item.name}
          className="max-w-[90%] max-h-[90%] object-contain scale-160"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 w-full items-center">
        <h3 className="text-2xl font-medium group-hover:text-orange-400 transition-colors block mb-4 line-clamp-2">
          {item.name}
        </h3>
        <span className="text-[10px] opacity-30 font-mono mb-3">
          ID: {item.id}
        </span>

        <div className="mt-auto">
          <span className="px-2 py-0.5 bg-slate-700/90 text-white/90 text-sm font-black rounded uppercase tracking-widest shadow-sm shrink-0">
            {item.typeInfo.subCategory || "Other"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
