import { useEffect, useState } from "react";
import { fetchItem, fetchItemIcon } from "../api/mapleApi";
import type { Item } from "../types/maple";

interface EquipmentCardProps {
  item: Item;
}

const EquipmentCard = ({ item }: EquipmentCardProps) => {
  const [detail, setDetail] = useState<Item | null>(
    item.metaInfo ? item : null,
  );
  const [loading, setLoading] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  useEffect(() => {
    if (!detail && !loading && !fetchAttempted) {
      setLoading(true);
      fetchItem(item.id)
        .then((data) => {
          if (data) setDetail(data);
        })
        .catch(() => {
          // Silent catch
        })
        .finally(() => {
          setLoading(false);
          setFetchAttempted(true);
        });
    }
  }, [item.id, detail, loading, fetchAttempted]);

  const stats = detail?.metaInfo;
  const requirements = stats
    ? {
        level: stats.reqLevel ?? item.requiredLevel,
        str: stats.reqSTR ?? 0,
        dex: stats.reqDEX ?? 0,
        int: stats.reqINT ?? 0,
        luk: stats.reqLUK ?? 0,
      }
    : {
        level: item.requiredLevel,
        str: 0,
        dex: 0,
        int: 0,
        luk: 0,
      };

  const icon = fetchItemIcon(item.id);
  const subCategory = item.typeInfo.subCategory;

  return (
    <div className="w-full h-full card-equipment-bg rounded-lg shadow-xl p-6 text-white/90 border border-transparent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[5px_15px_30px_-5px_rgba(5,12,41,0.8)] hover:border-orange-600/60 group flex flex-col items-center text-center relative overflow-hidden">
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 border border-white/5 rounded-lg pointer-events-none" />

      {/* Icon */}
      <div className="w-24 h-24 mb-4 bg-white/20 rounded-lg p-2 flex items-center justify-center border border-white/10 shrink-0 group-hover:border-white/20 transition-all shadow-inner relative z-10">
        <img
          src={icon}
          alt={item.name}
          className="max-w-[90%] max-h-[90%] object-contain scale-160"
        />
      </div>

      {/* Content wrapper */}
      <div className="flex flex-col flex-1 w-full items-center">
        {/* Header (name) */}
        <h3 className="text-2xl font-medium group-hover:text-orange-400 transition-colors block mb-8 line-clamp-2">
          {item.name}
        </h3>

        {/* Bottom section */}
        <div className="mt-auto flex flex-col items-center">
          {/* Subcategory */}
          <span className="px-2 py-0.5 bg-slate-700/90 text-white/90 text-sm font-black rounded uppercase tracking-widest shadow-sm shrink-0">
            {subCategory}
          </span>
          {/* Info */}
          <div className="my-2 text-[#f0daba]/90 flex flex-col gap-1 text-lg">
            <span>Required Level: {requirements.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
