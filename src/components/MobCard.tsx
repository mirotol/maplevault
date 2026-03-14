import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchMobDetail, fetchMobIcon } from "../api/mapleApi";
import type { Mob, MobDetail } from "../types/maple";

interface MobCardProps {
  mob: Mob;
  onClick?: () => void;
}

const MobCard = ({ mob, onClick }: MobCardProps) => {
  const [detail, setDetail] = useState<MobDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && !detail && !loading && !attempted) {
      setLoading(true);
      fetchMobDetail(mob.id)
        .then(setDetail)
        .catch(() => {
          // Silent catch to prevent uncaught promise rejection
          // attempted will be set to true anyway to prevent retries
        })
        .finally(() => {
          setLoading(false);
          setAttempted(true);
        });
    }
  }, [isVisible, mob.id, detail, loading, attempted]);

  const iconUrl = fetchMobIcon(mob.id);

  return (
    <button
      type="button"
      ref={cardRef}
      onClick={onClick}
      className="w-full p-6 rounded-xl border border-(--color-border) bg-(--color-bg) shadow-(--color-shadow) hover:border-(--color-accent) transition-all duration-200 cursor-pointer group flex flex-col items-center text-center outline-hidden focus:ring-2 focus:ring-(--color-accent) focus:ring-offset-2 dark:focus:ring-offset-(--color-bg)"
    >
      <span className="w-16 h-16 mb-4 rounded-lg bg-(--color-accent-bg) flex items-center justify-center text-(--color-accent) overflow-hidden">
        {isVisible ? (
          imageError ? (
            <ImageOff className="w-8 h-8 opacity-20" />
          ) : (
            <img
              src={iconUrl}
              alt={mob.name}
              className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <span className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700 block" />
        )}
      </span>
      <span className="text-xl font-medium mb-1 group-hover:text-(--color-accent) transition-colors block">
        {mob.name}
      </span>
      <span className="flex flex-col gap-1 text-sm opacity-60">
        <span>Level: {mob.level}</span>
        {detail ? (
          <>
            <span>HP: {detail.meta?.maxHP?.toLocaleString() ?? "???"}</span>
            <span>EXP: {detail.meta?.exp?.toLocaleString() ?? "???"}</span>
          </>
        ) : loading ? (
          <span className="animate-pulse">Loading stats...</span>
        ) : (
          attempted && (
            <span className="opacity-40 italic text-xs">Stats unavailable</span>
          )
        )}
      </span>
    </button>
  );
};

export default MobCard;
