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
      className="w-full p-6 rounded-xl border border-(--color-border) bg-(--color-bg) shadow-(--color-shadow) hover:shadow-xl hover:-translate-y-1 hover:border-(--color-accent) transition-all duration-300 cursor-pointer group flex flex-col items-center text-center outline-hidden focus:ring-2 focus:ring-(--color-accent) focus:ring-offset-2 dark:focus:ring-offset-(--color-bg)"
    >
      <span className="w-24 h-24 mb-4 rounded-lg bg-(--color-accent-bg) flex items-center justify-center text-(--color-accent) overflow-hidden">
        {isVisible ? (
          imageError ? (
            <ImageOff className="w-10 h-10 opacity-20" />
          ) : (
            <img
              src={iconUrl}
              alt={mob.name}
              className="max-w-[90%] max-h-[90%] object-contain group-hover:scale-110 transition-transform"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <span className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700 block" />
        )}
      </span>
      <div className="flex flex-col items-center gap-2 mb-2">
        <span className="text-2xl font-medium group-hover:text-(--color-accent) transition-colors block">
          {mob.name}
        </span>
        {mob.isBoss ? (
          <span className="px-2 py-0.5 bg-red-500 text-white text-sm font-black rounded uppercase tracking-widest shadow-sm shrink-0">
            Boss
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-slate-500 text-white text-sm font-black rounded uppercase tracking-widest shadow-sm shrink-0">
            Regular
          </span>
        )}
      </div>
      <span className="flex flex-col gap-1 text-lg opacity-60">
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
            <span className="opacity-40 italic text-base">
              Stats unavailable
            </span>
          )
        )}
      </span>
    </button>
  );
};

export default MobCard;
