import {
  ChevronDown,
  ChevronUp,
  ImageOff,
  MapPin,
  ShieldAlert,
  Sparkles,
  Swords,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMaps, fetchMobDetail, fetchMobRenderUrl } from "../api/mapleApi";
import type { Mob, MobDetail } from "../types/maple";
import { getElementalInfo } from "../utils/elemental";
import { Badge } from "./Badge";
import { ElementalBadge } from "./ElementalBadge";
import { LocationBadge } from "./LocationBadge";
import { Skeleton } from "./Skeleton";
import { StatBadge } from "./StatBadge";

interface MobModalProps {
  mobId: number;
  initialMob?: Mob;
  onClose: () => void;
}

const MobModal = ({ mobId, initialMob, onClose }: MobModalProps) => {
  const [detail, setDetail] = useState<MobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLocations, setExpandedLocations] = useState(false);

  useEffect(() => {
    let currentActive = true;
    setLoading(true);
    setError(null);

    Promise.all([fetchMobDetail(mobId), fetchMaps()])
      .then(([data, _maps]) => {
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
  const elementalInfo = getElementalInfo(detail?.meta?.elementalAttributes);

  const CombatStat = ({
    label,
    value,
  }: {
    label: string;
    value: number | undefined;
  }) => (
    <div className="flex justify-between items-center py-2 px-1 text-lg text-(--color-card-text) border-b border-(--color-card-border)/60 last:border-0">
      <span>{label}</span>
      <span className="font-bold">
        {loading ? (
          <Skeleton className="h-4 w-12" />
        ) : (
          (value?.toLocaleString() ?? "???")
        )}
      </span>
    </div>
  );

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
          className="absolute top-6 right-6 z-10 p-2 rounded-xl hover:bg-orange-500/10 transition-all text-(--color-text) opacity-50 hover:opacity-100"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center p-6 border-b border-(--color-card-border)/50">
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
                <h2 className="font-heading text-4xl text-(--color-card-text) tracking-tight">
                  {detail?.name || initialMob?.name || (
                    <Skeleton className="h-10 w-48" />
                  )}
                </h2>
                {initialMob?.isBoss ? (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-base font-black rounded uppercase tracking-widest shadow-sm shrink-0">
                    Boss
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-500 text-white text-base font-black rounded uppercase tracking-widest shadow-sm shrink-0">
                    Regular
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xl opacity-80 font-medium">
                <span className="flex items-center gap-1.5 text-(--color-card-text)">
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
                className="px-6 py-2 bg-orange-500 text-white rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                Close Portal
              </button>
            </div>
          ) : (
            <>
              <section className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-(--color-card-text)">
                  <StatBadge
                    label="HP"
                    value={detail?.meta?.maxHP}
                    variant="hp"
                    loading={loading}
                  />
                  <StatBadge
                    label="MP"
                    value={detail?.meta?.maxMP}
                    variant="mp"
                    loading={loading}
                  />
                  <StatBadge
                    label="EXP"
                    value={detail?.meta?.exp}
                    variant="exp"
                    loading={loading}
                  />
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h3 className="text-base uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                    <Swords className="w-5 h-5" /> Combat Stats
                  </h3>
                  <div className="grid grid-cols-1 p-4 rounded-xl border border-(--color-card-border)/50 bg-(--color-card-bg)/60">
                    <CombatStat
                      label="Weapon Attack"
                      value={detail?.meta?.physicalDamage}
                    />
                    <CombatStat
                      label="Weapon Defense"
                      value={detail?.meta?.physicalDefense}
                    />
                    <CombatStat
                      label="Magic Attack"
                      value={detail?.meta?.magicDamage}
                    />
                    <CombatStat
                      label="Magic Defense"
                      value={detail?.meta?.magicDefense}
                    />
                    <CombatStat
                      label="Accuracy"
                      value={detail?.meta?.accuracy}
                    />
                    <CombatStat
                      label="Avoidability"
                      value={detail?.meta?.evasion}
                    />
                    <CombatStat label="Speed" value={detail?.meta?.speed} />
                  </div>
                </section>

                <div className="space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-base uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                      <Zap className="w-5 h-5" /> Elemental Info
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <ElementalBadge
                        label="Weak against"
                        elements={elementalInfo.weak}
                        loading={loading}
                      />
                      <ElementalBadge
                        label="Normal against"
                        elements={elementalInfo.normal}
                        loading={loading}
                      />
                      <ElementalBadge
                        label="Strong against"
                        elements={elementalInfo.strong}
                        loading={loading}
                      />
                      <ElementalBadge
                        label="Immune to"
                        elements={elementalInfo.immune}
                        loading={loading}
                      />
                    </div>
                  </section>

                  {/* Special Traits */}
                  {(loading || detail?.meta?.isUndead) && (
                    <section className="space-y-4">
                      <h3 className="text-base uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <Sparkles className="w-5 h-5" /> Special Traits
                      </h3>
                      <div className="p-4 rounded-xl border border-(--color-card-border)/50 bg-(--color-card-bg)/60">
                        <div className="flex flex-wrap gap-4">
                          {loading ? (
                            <Skeleton className="h-10 w-24 rounded-lg" />
                          ) : (
                            detail?.meta?.isUndead && (
                              <Badge label="Undead" variant="Undead" />
                            )
                          )}
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Locations */}
              {(loading || (detail?.foundAt && detail.foundAt.length > 0)) && (
                <section className="space-y-4">
                  <h3 className="text-base uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Locations
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {loading
                      ? [1, 2, 3, 4].map((i) => (
                          <LocationBadge key={i} loading={true} />
                        ))
                      : detail?.foundAt
                          .slice(0, expandedLocations ? undefined : 4)
                          .map((mapId) => (
                            <LocationBadge key={mapId} mapId={mapId} />
                          ))}
                  </div>

                  {!loading && detail?.foundAt && detail.foundAt.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setExpandedLocations(!expandedLocations)}
                      className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-(--color-location-icon) hover:text-(--color-location-text) transition-colors ml-1"
                    >
                      {expandedLocations ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />+{" "}
                          {detail.foundAt.length - 4} more locations
                        </>
                      )}
                    </button>
                  )}
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
