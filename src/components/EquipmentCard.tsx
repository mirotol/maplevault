import { useEffect, useState } from "react";
import { fetchItem, fetchItemIcon } from "../api/mapleApi";
import type { Item } from "../types/maple";
import { Skeleton } from "./Skeleton";

interface EquipmentCardProps {
  item: Item;
}

const EquipmentCard = ({ item }: EquipmentCardProps) => {
  const [detail, setDetail] = useState<Item | null>(
    item.metaInfo ? item : null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!detail && !loading) {
      setLoading(true);
      fetchItem(item.id)
        .then((data) => {
          if (data) setDetail(data);
        })
        .catch(() => {
          // Silent catch
        })
        .finally(() => setLoading(false));
    }
  }, [item.id, detail, loading]);

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
    <div className="w-full min-h-[200px] bg-linear-to-b from-slate-800/95 via-slate-900/98 to-slate-950/98 border border-blue-500/30 rounded-lg shadow-xl p-5 text-white transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(251,191,36,0.3)] hover:border-amber-500/40 group flex flex-col relative overflow-hidden">
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 border border-white/5 rounded-lg pointer-events-none" />

      {/* Header */}
      <div className="flex items-start gap-4 mb-5 relative z-10">
        <div className="w-14 h-14 bg-black/40 rounded-lg p-2 flex items-center justify-center border border-white/10 shrink-0 group-hover:border-white/20 transition-all shadow-inner">
          <img
            src={icon}
            alt={item.name}
            className="max-w-full max-h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg leading-tight text-yellow-400 group-hover:text-amber-300 transition-colors line-clamp-2">
            {item.name}
          </h3>
          <span className="text-[10px] text-gray-400/60 uppercase tracking-widest block mt-1 font-semibold">
            {subCategory}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 relative z-10">
        {/* Requirement */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-tighter font-bold">
            REQ LVL
          </span>
          <span className="text-sm font-bold text-yellow-500 group-hover:text-yellow-400 transition-colors">
            {requirements.level}
          </span>
        </div>

        {/* Key Stats */}
        <div className="space-y-2 min-h-[1.5rem]">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full opacity-10" />
            </div>
          ) : (
            <>
              {stats?.incPAD && stats.incPAD > 0 && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-400 font-medium">
                    Weapon Attack
                  </span>
                  <span className="font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                    +{stats.incPAD}
                  </span>
                </div>
              )}
              {stats?.incMAD && stats.incMAD > 0 && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-400 font-medium">
                    Magic Attack
                  </span>
                  <span className="font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                    +{stats.incMAD}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      {!loading && stats?.tuc && stats.tuc > 0 ? (
        <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-500/80">Upgrades</span>
            <span className="text-amber-400/90 group-hover:text-amber-400 transition-colors">
              {stats.tuc}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-2 border-t border-transparent h-[1px]" />
      )}
    </div>
  );
};

export default EquipmentCard;
