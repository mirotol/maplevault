import { ImageOff, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchItem, fetchItemIcon } from "../api/mapleApi";
import type { Item } from "../types/maple";
import { formatAttackSpeed } from "../utils/item";
import { Skeleton } from "./Skeleton";

interface EquipmentModalProps {
  itemId: number;
  initialItem?: Item;
  onClose: () => void;
}

const EquipmentModal = ({
  itemId,
  initialItem,
  onClose,
}: EquipmentModalProps) => {
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
          console.log("Fetched item details for modal:", data);
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
        jobs: detail.requiredJobs || initialItem?.requiredJobs || [],
      }
    : {
        level: initialItem?.requiredLevel ?? 0,
        str: 0,
        dex: 0,
        int: 0,
        luk: 0,
        jobs: initialItem?.requiredJobs || [],
      };

  const JOBS = [
    { name: "Beginner" },
    { name: "Warrior" },
    { name: "Magician" },
    { name: "Bowman" },
    { name: "Thief" },
    { name: "Pirate" },
  ];

  const Divider = () => <div className="border-t border-white/10 my-4" />;

  const StatRow = ({
    label,
    value,
  }: {
    label: string;
    value: number | string | undefined;
    colorClass?: string;
  }) => {
    if (value === undefined || (value === 0 && label !== "Available Upgrades"))
      return null;
    return (
      <div className="text-[#f0daba] font-medium flex items-center text-md py-0.5 px-1 leading-none">
        <span className="flex items-center gap-0.5">
          <span>{label}</span>
          <span className="opacity-90">:</span>
        </span>

        <span className="text-white/80 mx-1">
          {label === "Available Upgrades"
            ? value
            : label === "Attack Speed"
              ? formatAttackSpeed(value as number)
              : `+${value}`}{" "}
        </span>
      </div>
    );
  };

  const ReqStat = ({ label, value }: { label: string; value: number }) => (
    <div className="flex justify-between items-center text-base py-0 px-1 leading-tight">
      <span className="text-white/80 font-medium uppercase">
        {label}: {value}
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
      <div className="card-equipment-bg relative w-full max-w-md border border-white/20 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[95vh] text-white animate-in zoom-in-95 duration-300">
        {/* Top bar (Close button row) */}
        <div className="flex justify-end p-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-white/90 hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 pb-0 pt-0 relative z-10">
          {/* Name and category */}
          <div className="text-center mb-2">
            <h2 className="font-bold text-2xl leading-tight wrap-break-word text-center">
              {detail?.name || initialItem?.name || (
                <Skeleton className="h-6 w-32 mx-auto opacity-20" />
              )}
            </h2>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">
              {detail?.typeInfo.subCategory ||
                initialItem?.typeInfo.subCategory || (
                  <Skeleton className="h-3 w-16 mx-auto opacity-20" />
                )}
            </div>
          </div>

          <Divider />

          {/* Icon and Requirements */}
          <div className="flex items-center gap-4 mt-2">
            <div className="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-inner group overflow-hidden">
              {loading ? (
                <Skeleton className="w-12 h-12 rounded-lg opacity-20" />
              ) : error ? (
                <ImageOff className="w-6 h-6 opacity-20" />
              ) : (
                <img
                  src={icon}
                  alt={detail?.name || initialItem?.name}
                  className="max-w-[80%] max-h-[80%] object-contain scale-200 group-hover:scale-225 transition-transform duration-500"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="space-y-0.5">
                <ReqStat label="REQ LEVEL" value={requirements.level} />
                <ReqStat label="REQ STR" value={requirements.str} />
                <ReqStat label="REQ DEX" value={requirements.dex} />
                <ReqStat label="REQ INT" value={requirements.int} />
                <ReqStat label="REQ LUK" value={requirements.luk} />
              </div>
            </div>
          </div>

          {/* Job requirements */}
          <div className="flex flex-nowrap gap-x-1.5 mt-4 justify-between">
            {JOBS.map((job) => {
              const isAllowed =
                requirements.jobs.includes("Beginner") ||
                requirements.jobs.includes(job.name);
              return (
                <span
                  key={job.name}
                  className={`text-sm uppercase font-bold tracking-tight transition-colors whitespace-nowrap ${
                    isAllowed ? "text-orange-500" : "text-white/20"
                  }`}
                >
                  {job.name}
                </span>
              );
            })}
          </div>
          <Divider />
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-0.5 custom-scrollbar relative z-10">
          {error ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Failed to load</h3>
                <p className="text-[11px] opacity-60 max-w-[160px] mx-auto">
                  {error}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Section */}
              <div className="space-y-0">
                {loading ? (
                  <div className="space-y-1.5 px-1 py-2">
                    <Skeleton className="h-3.5 w-full opacity-10" />
                    <Skeleton className="h-3.5 w-3/4 opacity-10" />
                    <Skeleton className="h-3.5 w-1/2 opacity-10" />
                  </div>
                ) : (
                  <>
                    <StatRow label="STR" value={stats?.incSTR} />
                    <StatRow label="DEX" value={stats?.incDEX} />
                    <StatRow label="INT" value={stats?.incINT} />
                    <StatRow label="LUK" value={stats?.incLUK} />
                    <StatRow label="HP" value={stats?.incMHP} />
                    <StatRow label="MP" value={stats?.incMMP} />
                    <StatRow label="Weapon Attack" value={stats?.incPAD} />
                    <StatRow label="Weapon Defense" value={stats?.incPDD} />
                    <StatRow label="Magic Attack" value={stats?.incMAD} />
                    <StatRow label="Accuracy" value={stats?.incACC} />
                    <StatRow label="Attack Speed" value={stats?.attackSpeed} />
                    <StatRow label="Magic Defense" value={stats?.incMDD} />
                    <StatRow label="Avoidability" value={stats?.incEVA} />
                    <StatRow label="Speed" value={stats?.incSpeed} />
                    <StatRow label="Jump" value={stats?.incJump} />
                    <StatRow
                      label="Available Upgrades"
                      value={stats?.tuc ?? 0}
                    />

                    {/* Description */}
                    {initialItem?.desc && (
                      <>
                        <Divider />
                        <p className="px-1 text-base text-gray-500 italic leading-relaxed">
                          {initialItem.desc}
                        </p>
                      </>
                    )}

                    {!loading && !stats && (
                      <div className="text-center py-2 opacity-30 text-xs italic">
                        No additional stats
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer padding */}
        <div className="h-4 shrink-0" />
      </div>
    </div>
  );
};

export default EquipmentModal;
