import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Crosshair,
  Flame,
  Ghost,
  Heart,
  ImageOff,
  Info,
  MapPin,
  Move,
  ShieldAlert,
  Skull,
  Target,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMobDetail, fetchMobRenderUrl } from "../api/mapleApi";
import type { Mob, MobDetail } from "../types/maple";

interface MobModalProps {
  mobId: number;
  initialMob?: Mob;
  onClose: () => void;
}

const MobModal = ({ mobId, initialMob, onClose }: MobModalProps) => {
  const [detail, setDetail] = useState<MobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let currentActive = true;
    setLoading(true);
    setError(null);

    fetchMobDetail(mobId)
      .then((data) => {
        if (!currentActive) return;
        if (data) {
          setDetail(data);
        } else {
          setError("No detailed information available for this mob");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch mob details in modal:", err);
        if (currentActive) setError("Failed to load mob details");
      })
      .finally(() => {
        if (currentActive) setLoading(false);
      });

    return () => {
      currentActive = false;
    };
  }, [mobId]);

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

  const renderUrl = fetchMobRenderUrl(mobId);

  const Skeleton = ({ className }: { className: string }) => (
    <span
      className={`animate-pulse bg-gray-200 dark:bg-gray-700/50 rounded inline-block ${className}`}
    />
  );

  const StatBadge = ({
    icon: Icon,
    label,
    value,
    colorClass,
  }: {
    icon: LucideIcon;
    label: string;
    value: string | number | undefined;
    colorClass: string;
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-(--color-border) bg-(--color-accent-bg) bg-opacity-5">
      <div
        className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${colorClass}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm opacity-50 font-bold uppercase tracking-widest leading-none mb-1">
          {label}
        </div>
        <div className="font-bold text-xl leading-none">
          {loading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            (value?.toLocaleString() ?? "???")
          )}
        </div>
      </div>
    </div>
  );

  const CombatStat = ({
    label,
    value,
  }: {
    label: string;
    value: number | undefined;
  }) => (
    <div className="flex justify-between items-center p-2 rounded-lg border border-(--color-border) text-lg">
      <span className="opacity-60">{label}</span>
      <span className="font-bold">
        {loading ? (
          <Skeleton className="h-4 w-12" />
        ) : (
          (value?.toLocaleString() ?? "???")
        )}
      </span>
    </div>
  );

  const SpecialBadge = ({
    label,
    active,
    icon: Icon,
  }: {
    label: string;
    active?: boolean;
    icon: LucideIcon;
  }) => {
    if (!active && !loading) return null;
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-base font-bold tracking-wide transition-all ${
          loading
            ? "opacity-50 grayscale"
            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        {loading ? <Skeleton className="h-3 w-16" /> : label}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="card-paper relative w-full max-w-2xl border-2 border-(--color-card-border) rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-xl hover:bg-(--color-accent-bg) transition-all text-(--color-text) opacity-50 hover:opacity-100"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center p-6 border-b border-(--color-border)">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-2xl flex items-center justify-center shrink-0 relative group">
              {loading ? (
                <Skeleton className="w-full h-full rounded-2xl" />
              ) : error ? (
                <ImageOff className="w-10 h-10 opacity-20" />
              ) : (
                <img
                  src={renderUrl}
                  alt={detail?.name || initialMob?.name}
                  className="max-w-[90%] max-h-[90%] object-contain scale-110 group-hover:scale-140 transition-transform duration-500"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-4xl font-black tracking-tight">
                  {detail?.name || initialMob?.name || (
                    <Skeleton className="h-10 w-48" />
                  )}
                </h2>
                {Boolean(initialMob?.isBoss) ||
                (detail?.meta?.level !== undefined &&
                  detail.meta.level >= 100) ? (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-base font-black rounded uppercase tracking-widest shadow-sm shrink-0">
                    Boss
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-500 text-white text-base font-black rounded uppercase tracking-widest shadow-sm shrink-0">
                    Regular
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-lg opacity-50 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="text-(--color-accent)">#</span>
                  {mobId}
                </span>
                <span className="flex items-center gap-1.5">
                  <Info className="w-5 h-5 text-(--color-accent)" />
                  Level{" "}
                  {detail?.meta?.level ||
                    initialMob?.level ||
                    (loading ? "..." : "???")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Something went wrong</h3>
                <p className="opacity-60 max-w-xs mx-auto">{error}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-(--color-accent) text-white rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                Close Portal
              </button>
            </div>
          ) : (
            <>
              {/* Core Stats Grid */}
              <section className="space-y-4">
                <h3 className="text-base font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Core Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatBadge
                    icon={Heart}
                    label="HP"
                    value={detail?.meta?.maxHP}
                    colorClass="text-red-500"
                  />
                  <StatBadge
                    icon={Zap}
                    label="MP"
                    value={detail?.meta?.maxMP}
                    colorClass="text-cyan-500"
                  />
                  <StatBadge
                    icon={Flame}
                    label="EXP"
                    value={detail?.meta?.exp}
                    colorClass="text-orange-500"
                  />
                  <StatBadge
                    icon={Move}
                    label="Movement Speed"
                    value={detail?.meta?.speed}
                    colorClass="text-emerald-500"
                  />
                  <StatBadge
                    icon={Target}
                    label="Accuracy"
                    value={detail?.meta?.accuracy}
                    colorClass="text-blue-500"
                  />
                  <StatBadge
                    icon={Crosshair}
                    label="Evasion Rate"
                    value={detail?.meta?.evasion}
                    colorClass="text-purple-500"
                  />
                </div>
              </section>

              {/* Combat & Properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Combat Stats */}
                <section className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <CombatStat
                      label="Weapon Attack"
                      value={detail?.meta?.physicalDamage}
                    />
                    <CombatStat
                      label="Magic Attack"
                      value={detail?.meta?.magicDamage}
                    />
                    <CombatStat
                      label="Weapon Defense"
                      value={detail?.meta?.physicalDefense}
                    />
                    <CombatStat
                      label="Magic Defense"
                      value={detail?.meta?.magicDefense}
                    />
                  </div>
                </section>

                {/* Special Properties */}
                <section className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <SpecialBadge
                      label="Body Attack"
                      active={detail?.meta?.isBodyAttack}
                      icon={Activity}
                    />
                    <SpecialBadge
                      label="Undead"
                      active={detail?.meta?.isUndead}
                      icon={Skull}
                    />
                    <SpecialBadge
                      label="Revivable"
                      active={!!detail?.meta?.revivesMonsterId?.length}
                      icon={Ghost}
                    />
                    {!loading &&
                      !detail?.meta?.isBodyAttack &&
                      !detail?.meta?.isUndead &&
                      !initialMob?.isBoss &&
                      !detail?.meta?.summonType &&
                      !detail?.meta?.revivesMonsterId?.length && (
                        <p className="text-base opacity-40 italic py-2">
                          No special attributes found.
                        </p>
                      )}
                  </div>
                </section>
              </div>

              {/* Locations */}
              {(loading || (detail?.foundAt && detail.foundAt.length > 0)) && (
                <section className="space-y-4">
                  <h3 className="text-base font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Habitat Regions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {loading
                      ? [1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-8 w-20 rounded-full" />
                        ))
                      : detail?.foundAt.map((mapId) => (
                          <span
                            key={mapId}
                            className="px-4 py-1.5 bg-(--color-bg) border border-(--color-border) rounded-full text-base font-bold tracking-wide opacity-70 hover:opacity-100 hover:border-(--color-accent) hover:text-(--color-accent) transition-all cursor-help shadow-sm"
                            title={`Map ID: ${mapId}`}
                          >
                            {mapId}
                          </span>
                        ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobModal;
