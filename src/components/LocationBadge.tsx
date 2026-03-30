import { getMapInfo } from "../api/mapleApi";

interface LocationBadgeProps {
  mapId?: number;
  loading?: boolean;
}

export const LocationBadge = ({
  mapId,
  loading = false,
}: LocationBadgeProps) => {
  if (loading || !mapId) {
    return (
      <div className="h-13.5 bg-gray-200 dark:bg-gray-700/50 animate-pulse rounded-[10px]" />
    );
  }

  const info = getMapInfo(mapId);
  return (
    <div
      className="flex items-center gap-3 px-3.5 py-2 bg-(--color-card-bg)/60 border border-(--color-card-border)/50 rounded-[10px] transition-all group hover:bg-(--color-location-hover-bg) shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(0,0,0,0.08)]"
      title={`Map ID: ${mapId}`}
    >
      <div className="min-w-0">
        <div className="text-base font-semibold text-(--color-card-text) leading-tight mb-0.5 truncate">
          {info?.name || "Unknown Map"}
        </div>
        <div className="text-sm text-(--color-card-text) leading-tight truncate">
          {info?.streetName || "Unknown Area"}
        </div>
      </div>
    </div>
  );
};
