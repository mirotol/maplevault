import { ImageOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchItem, fetchItemIcon } from "../api/mapleApi";
import type { Item } from "../types/maple";
import { formatDescription } from "../utils/mapleDescription";
import { Skeleton } from "./Skeleton";

interface ItemModalProps {
  itemId: number;
  initialItem?: Item;
  onClose: () => void;
}

const ItemModal = ({ itemId, initialItem, onClose }: ItemModalProps) => {
  const [detail, setDetail] = useState<Item | null>(
    initialItem?.desc ? initialItem : null,
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

  const icon = fetchItemIcon(itemId);

  const Divider = () => (
    <div className="border-t border-white/10 w-full my-8" />
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
      <div className="card-equipment-bg relative w-full max-w-md border border-white/20 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[95vh] text-white animate-in zoom-in-95 duration-300 mx-4 sm:mx-0">
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

        <div className="p-6 pb-8 pt-0 relative z-10 flex flex-col items-center">
          {/* Name and category */}
          <div className="text-center mb-8">
            <h2 className="font-bold text-3xl leading-tight wrap-break-word text-center drop-shadow-sm">
              {detail?.name || initialItem?.name || (
                <Skeleton className="h-8 w-48 mx-auto opacity-20" />
              )}
            </h2>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 opacity-80">
              {detail?.typeInfo.subCategory ||
                initialItem?.typeInfo.subCategory || (
                  <Skeleton className="h-3 w-24 mx-auto opacity-20" />
                )}
            </div>
          </div>

          {/* Icon */}
          <div className="w-48 h-48 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner group overflow-hidden relative">
            <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
            {loading ? (
              <Skeleton className="w-20 h-20 rounded-lg opacity-20" />
            ) : error ? (
              <ImageOff className="w-10 h-10 opacity-20" />
            ) : (
              <img
                src={icon}
                alt={detail?.name || initialItem?.name}
                className="max-w-[70%] max-h-[70%] object-contain scale-300 group-hover:scale-350 transition-transform duration-500"
                style={{ imageRendering: "pixelated" }}
              />
            )}
          </div>

          <Divider />

          {/* Description */}
          <div className="w-full text-center px-4 min-h-16 flex items-center justify-center">
            {loading ? (
              <div className="space-y-3 w-full">
                <Skeleton className="h-4 w-full opacity-10" />
                <Skeleton className="h-4 w-5/6 mx-auto opacity-10" />
              </div>
            ) : detail?.desc ? (
              <p className="text-xl text-white/90 leading-relaxed font-medium italic">
                {formatDescription(detail.desc)}
              </p>
            ) : (
              !error && (
                <p className="text-white/30 italic text-lg">
                  No description provided
                </p>
              )
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4 text-red-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {error}
            </div>
          )}
        </div>

        {/* Footer padding */}
        <div className="h-4 shrink-0" />
      </div>
    </div>
  );
};

export default ItemModal;
