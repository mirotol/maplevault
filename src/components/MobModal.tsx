import {
  Flame,
  Ghost,
  Heart,
  ImageOff,
  Info,
  Loader2,
  type LucideIcon,
  MapPin,
  Shield,
  Target,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMobDetail, fetchMobIcon } from "../api/mapleApi";
import type { Mob, MobDetail } from "../types/maple";

interface MobModalProps {
  mob: Mob;
  onClose: () => void;
}

const MobModal = ({ mob, onClose }: MobModalProps) => {
  const [detail, setDetail] = useState<MobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let currentActive = true;
    setLoading(true);
    fetchMobDetail(mob.id)
      .then((data) => {
        if (currentActive) setDetail(data);
      })
      .catch((err) => {
        console.error("Failed to fetch mob details in modal:", err);
      })
      .finally(() => {
        if (currentActive) setLoading(false);
      });

    return () => {
      currentActive = false;
    };
  }, [mob.id]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  const iconUrl = fetchMobIcon(mob.id);

  const StatItem = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: LucideIcon;
    label: string;
    value: string | number | undefined;
    color: string;
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-(--color-border) bg-(--color-accent-bg) bg-opacity-5">
      <div
        className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs opacity-50 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="font-bold text-lg">{value?.toLocaleString() ?? "???"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-(--color-bg) border border-(--color-border) rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-(--color-border)">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-(--color-accent-bg) flex items-center justify-center text-(--color-accent) shrink-0 shadow-inner">
              {imageError ? (
                <ImageOff className="w-12 h-12 opacity-30" />
              ) : (
                <img
                  src={iconUrl}
                  alt={mob.name}
                  className="max-w-[90%] max-h-[90%] object-contain scale-125"
                  style={{ imageRendering: "pixelated" }}
                  onError={() => setImageError(true)}
                />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                {mob.name}
                {mob.isBoss && (
                  <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full uppercase tracking-tighter">
                    Boss
                  </span>
                )}
              </h2>
              <p className="text-sm opacity-50">Monster ID: {mob.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-(--color-accent-bg) transition-colors text-(--color-text) opacity-50 hover:opacity-100 hover:text-(--color-accent)"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-(--color-accent)" />
              <p className="opacity-50 animate-pulse">
                Fetching monster data...
              </p>
            </div>
          ) : (
            <>
              {/* Basic Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatItem
                  icon={Info}
                  label="Level"
                  value={mob.level}
                  color="text-blue-500"
                />
                <StatItem
                  icon={Heart}
                  label="HP"
                  value={detail?.meta?.maxHP}
                  color="text-red-500"
                />
                <StatItem
                  icon={Zap}
                  label="MP"
                  value={detail?.meta?.maxMP}
                  color="text-cyan-500"
                />
                <StatItem
                  icon={Flame}
                  label="EXP"
                  value={detail?.meta?.exp}
                  color="text-orange-500"
                />
                <StatItem
                  icon={Shield}
                  label="Phys Def"
                  value={detail?.meta?.physicalDefense}
                  color="text-emerald-500"
                />
                <StatItem
                  icon={Shield}
                  label="Magic Def"
                  value={detail?.meta?.magicDefense}
                  color="text-purple-500"
                />
              </div>

              {/* Combat Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm opacity-50 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Combat Attributes
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded-lg border border-(--color-border) text-sm">
                      <span className="opacity-60">Accuracy</span>
                      <span className="font-mono">
                        {detail?.meta?.accuracy ?? "???"}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg border border-(--color-border) text-sm">
                      <span className="opacity-60">Evasion</span>
                      <span className="font-mono">
                        {detail?.meta?.evasion ?? "???"}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg border border-(--color-border) text-sm">
                      <span className="opacity-60">Speed</span>
                      <span className="font-mono">
                        {detail?.meta?.speed ?? "???"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm opacity-50 flex items-center gap-2">
                    <Ghost className="w-4 h-4" /> Special Properties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {detail?.meta?.isBodyAttack && (
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-lg border border-amber-500/20">
                        Body Attack
                      </span>
                    )}
                    {detail?.meta?.isUndead && (
                      <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-bold rounded-lg border border-purple-500/20">
                        Undead
                      </span>
                    )}
                    {mob.isBoss && (
                      <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg border border-red-500/20">
                        Boss Type
                      </span>
                    )}
                    {!detail?.meta?.isBodyAttack &&
                      !detail?.meta?.isUndead &&
                      !mob.isBoss && (
                        <span className="opacity-40 italic text-xs">
                          No special properties found.
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {/* Locations */}
              {detail?.foundAt && detail.foundAt.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm opacity-50 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Locations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {detail.foundAt.map((mapId) => (
                      <span
                        key={mapId}
                        className="px-2 py-1 bg-(--color-bg) border border-(--color-border) rounded text-xs opacity-70 hover:opacity-100 hover:border-(--color-accent) transition-colors cursor-help"
                        title={`Map ID: ${mapId}`}
                      >
                        {mapId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-(--color-accent-bg) bg-opacity-5 border-t border-(--color-border) text-center">
          <p className="text-[10px] opacity-30 uppercase tracking-[0.2em]">
            MapleVault Database System
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobModal;
