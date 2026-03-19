import {
  X,
  ShieldAlert,
  Swords,
  Zap,
  Star,
  Trophy,
  History,
  ImageOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchItem, fetchItemIcon } from "../api/mapleApi";
import type { Item } from "../types/maple";
import { Skeleton } from "./Skeleton";

interface EquipmentModalProps {
  itemId: number;
  initialItem?: Item;
  onClose: () => void;
}

const EquipmentModal = ({ itemId, initialItem, onClose }: EquipmentModalProps) => {
  const [detail, setDetail] = useState<Item | null>(
    initialItem?.metaInfo ? initialItem : null,
  );
  const [loading, setLoading] = useState(!detail);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (detail) return;

    let currentActive = true;
    setLoading(true);
    setError(null);

    fetchItem(itemId)
      .then((data) => {
        if (!currentActive) return;
        if (data) {
          setDetail(data);
        } else {
          setError("No detailed information available for this item");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch item details in modal:", err);
        if (currentActive) setError("Failed to load item details");
      })
      .finally(() => {
        if (currentActive) setLoading(false);
      });

    return () => {
      currentActive = false;
    };
  }, [itemId, detail]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  const stats = detail?.metaInfo;
  const icon = fetchItemIcon(itemId);
  const requirements = stats
    ? {
        level: stats.reqLevel ?? detail.requiredLevel,
        str: stats.reqSTR ?? 0,
        dex: stats.reqDEX ?? 0,
        int: stats.reqINT ?? 0,
        luk: stats.reqLUK ?? 0,
      }
    : {
        level: initialItem?.requiredLevel ?? 0,
        str: 0,
        dex: 0,
        int: 0,
        luk: 0,
      };

  const Divider = () => (
    <div className="border-t border-white/10 my-4" />
  );

  const StatRow = ({ label, value, colorClass = "text-white" }: { label: string; value: number | undefined; colorClass?: string }) => {
    if (value === undefined || value === 0) return null;
    return (
      <div className="flex justify-between items-center text-sm py-0.5">
        <span className="text-gray-400 font-medium uppercase tracking-tight text-[11px]">{label}</span>
        <span className={`font-bold ${colorClass}`}>+{value}</span>
      </div>
    );
  };

  const ReqStat = ({ label, value }: { label: string; value: number }) => (
    <div className="flex flex-col items-center p-2 bg-black/30 rounded-lg border border-white/5 min-w-[60px]">
      <span className="text-[9px] text-gray-500 font-bold uppercase">{label}</span>
      <span className={`text-sm font-black ${value > 0 ? "text-yellow-500" : "text-gray-600"}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="card-equipment-bg relative w-full max-w-md border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] text-white animate-in zoom-in-95 duration-300">
        {/* Subtle inner highlight */}
        <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl hover:bg-white/10 transition-all text-white/50 hover:text-white"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="p-6 pb-4 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner group">
              {loading ? (
                <Skeleton className="w-16 h-16 rounded-lg opacity-20" />
              ) : error ? (
                <ImageOff className="w-8 h-8 opacity-20" />
              ) : (
                <img
                  src={icon}
                  alt={detail?.name || initialItem?.name}
                  className="max-w-[70%] max-h-[70%] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform duration-500 group-hover:scale-110"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-2xl leading-tight text-white mb-2 drop-shadow-sm">
                {detail?.name || initialItem?.name || <Skeleton className="h-8 w-40 opacity-20" />}
              </h2>
              <span className="inline-block px-3 py-1 bg-orange-600/20 border border-orange-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-orange-400">
                {detail?.typeInfo.subCategory || initialItem?.typeInfo.subCategory || <Skeleton className="h-3 w-20 opacity-20" />}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-1 custom-scrollbar relative z-10">
          {error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Failed to load</h3>
                <p className="text-sm opacity-60 max-w-[200px] mx-auto">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <Divider />

              {/* Requirements Section */}
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] text-gray-500 uppercase font-black tracking-tighter flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" /> REQ LEVEL
                  </span>
                  <span className="text-xl font-black text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                    {requirements.level}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <ReqStat label="STR" value={requirements.str} />
                  <ReqStat label="DEX" value={requirements.dex} />
                  <ReqStat label="INT" value={requirements.int} />
                  <ReqStat label="LUK" value={requirements.luk} />
                </div>
              </section>

              <Divider />

              {/* Stats Section */}
              <section className="space-y-3">
                <h3 className="text-[11px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-1.5 px-1">
                  <Swords className="w-3.5 h-3.5" /> Combat Attributes
                </h3>
                
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-1">
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full opacity-10" />
                      <Skeleton className="h-4 w-3/4 opacity-10" />
                    </div>
                  ) : (
                    <>
                      <StatRow label="Weapon Attack" value={stats?.incPAD} colorClass="text-orange-400" />
                      <StatRow label="Magic Attack" value={stats?.incMAD} colorClass="text-blue-400" />
                      {(!loading && stats?.attackSpeed) && (
                        <div className="flex justify-between items-center text-sm py-0.5">
                          <span className="text-gray-400 font-medium uppercase tracking-tight text-[11px]">Attack Speed</span>
                          <span className="font-bold text-gray-200">{stats.attackSpeed}</span>
                        </div>
                      )}
                      <StatRow label="STR" value={stats?.incSTR} />
                      <StatRow label="DEX" value={stats?.incDEX} />
                      <StatRow label="INT" value={stats?.incINT} />
                      <StatRow label="LUK" value={stats?.incLUK} />
                      <StatRow label="Max HP" value={stats?.incMHP} colorClass="text-red-400" />
                      <StatRow label="Max MP" value={stats?.incMMP} colorClass="text-blue-300" />
                      <StatRow label="Weapon Defense" value={stats?.incPDD} />
                      <StatRow label="Magic Defense" value={stats?.incMDD} />
                      <StatRow label="Accuracy" value={stats?.incACC} colorClass="text-yellow-200" />
                      <StatRow label="Avoidability" value={stats?.incEVA} colorClass="text-green-300" />
                      <StatRow label="Speed" value={stats?.incSpeed} colorClass="text-sky-300" />
                      <StatRow label="Jump" value={stats?.incJump} colorClass="text-purple-300" />
                      
                      {!loading && !stats && (
                        <div className="text-center py-2 opacity-30 text-xs italic">
                          No additional stats
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>

              {(!loading && stats?.tuc && stats.tuc > 0) && (
                <>
                  <Divider />
                  <section className="flex items-center justify-between px-1 py-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-[11px] text-gray-400 uppercase font-black tracking-widest">
                        Available Upgrades
                      </span>
                    </div>
                    <span className="text-lg font-black text-amber-400">
                      {stats.tuc}
                    </span>
                  </section>
                </>
              )}
            </>
          )}
        </div>
        
        {/* Footer padding */}
        <div className="h-6 shrink-0" />
      </div>
    </div>
  );
};

export default EquipmentModal;
