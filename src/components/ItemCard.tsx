import { useEffect, useRef, useState } from "react";
import { fetchItem, fetchItemIcon } from "../api/mapleApi";
import type { Item } from "../types/maple";

interface ItemCardProps {
  item: Item;
}

const ItemCard = ({ item }: ItemCardProps) => {
  const [detail, setDetail] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const rootMargin = isMobile ? "200px" : "400px";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && !detail && !loading && !fetchAttempted) {
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
  }, [isVisible, item.id, detail, loading, fetchAttempted]);

  const icon = fetchItemIcon(item.id);

  return (
    <div
      ref={cardRef}
      className="w-full h-full card-equipment-bg rounded-lg shadow-xl p-6 text-white/90 border border-transparent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[5px_15px_30px_-5px_rgba(5,12,41,0.8)] hover:border-orange-600/60 group flex flex-col items-center text-center relative overflow-hidden"
    >
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 border border-white/5 rounded-lg pointer-events-none" />

      {/* Icon */}
      <div className="w-20 h-20 mb-4 bg-white/20 rounded-lg p-2 flex items-center justify-center border border-white/10 shrink-0 group-hover:border-white/20 transition-all shadow-inner relative z-10">
        <img
          src={icon}
          alt={item.name}
          className="max-w-[90%] max-h-[90%] object-contain scale-160"
          style={{ imageRendering: "pixelated" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 w-full items-center">
        <h3 className="text-xl font-medium transition-colors block mb-4 line-clamp-2">
          {item.name}
        </h3>

        <div className="mt-auto">
          <span className="px-2 py-0.5 bg-slate-700/90 text-white/90 text-sm font-black rounded uppercase tracking-widest shadow-sm shrink-0">
            {item.typeInfo.subCategory || "Other"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
