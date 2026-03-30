import { Loader2, MapPin, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMaps, fetchNpcDetail, fetchNpcIcon } from "../api/mapleApi";
import { npcLookupJson } from "../data/staticData";
import type { NpcDetail } from "../types/maple";
import { LocationBadge } from "./LocationBadge";

interface NpcModalProps {
  npcId: number;
  onClose: () => void;
}

const NpcModal = ({ npcId, onClose }: NpcModalProps) => {
  const [detail, setDetail] = useState<NpcDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Fetch both NPC details and map lookup for names
    Promise.all([fetchNpcDetail(npcId), fetchMaps()])
      .then(([data, _maps]) => {
        if (isMounted) {
          if (data) {
            setDetail(data);
            if (data.relatedQuests) {
              console.log(`NPC ${npcId} related quests:`, data.relatedQuests);
            }
          } else {
            setError("NPC not found");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load NPC details:", err);
          setError("Failed to load NPC details");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [npcId]);

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

  const placements = npcLookupJson.npcs[npcId.toString()] || [];
  const uniqueMapIds = Array.from(new Set(placements.map((p) => p.mapId)));
  const iconUrl = fetchNpcIcon(npcId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Container */}
      <div className="card-mob-bg relative w-full max-w-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-(--color-card-text) animate-in zoom-in-95 duration-300 mx-4 sm:mx-0">
        {/* Top bar (Close button) */}
        <div className="flex justify-end p-2 sm:p-4 absolute right-0 top-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-black/10 hover:bg-black/20 border border-white/10 transition-all text-white/50 hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-(--color-accent) animate-spin" />
            <p className="text-(--color-card-text) font-medium">
              Finding NPC...
            </p>
          </div>
        ) : error || !detail ? (
          <div className="p-12 text-center">
            <p className="text-xl text-red-400 font-medium">
              {error || "Something went wrong"}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
            {/* Header Section */}
            <div className="p-6 sm:p-8 pb-4 sm:pb-6 flex flex-col items-center text-center border-b border-white/10 relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-(--color-accent)/10 blur-[100px] rounded-full -z-10" />

              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-2xl p-4 mb-4 border border-white/10 flex items-center justify-center shadow-inner relative group shrink-0">
                <img
                  src={iconUrl}
                  alt={detail.name || `NPC ${npcId}`}
                  className="max-w-full max-h-full object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-1 break-words max-w-[85%] mx-auto">
                {detail.name || `NPC ${npcId}`}
              </h2>
              {detail.function && (
                <p className="text-(--color-accent) font-medium uppercase tracking-widest text-xs sm:text-sm mb-4 max-w-[90%] mx-auto">
                  {detail.function}
                </p>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Left Column: Dialogue / Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-3 text-(--color-card-text)">
                    <MessageCircle
                      size={20}
                      className="text-(--color-accent)"
                    />
                    Dialogue
                  </h3>
                  <div className="bg-black/10 rounded-xl p-4 border border-white/5 space-y-3">
                    {detail.dialogue &&
                    Object.keys(detail.dialogue).length > 0 ? (
                      Object.entries(detail.dialogue).map(([key, text]) => (
                        <p
                          key={key}
                          className="text-(--color-card-text) italic text-sm leading-relaxed break-words"
                        >
                          "{text}"
                        </p>
                      ))
                    ) : (
                      <p className="text-white/30 italic text-sm">
                        No recorded dialogue.
                      </p>
                    )}
                  </div>
                </div>

                {detail.isShop && (
                  <div className="bg-(--color-accent)/10 border border-(--color-accent)/20 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-(--color-accent) flex items-center justify-center text-black">
                      <span className="font-bold text-xs">$</span>
                    </div>
                    <p className="text-sm font-semibold text-(--color-accent)">
                      This NPC operates a shop.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Locations */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-3 text-(--color-card-text)">
                  <MapPin size={20} className="text-(--color-accent)" />
                  Locations ({uniqueMapIds.length})
                </h3>
                <div className="grid grid-cols-1 gap-2 max-h-60 sm:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {uniqueMapIds.length > 0 ? (
                    uniqueMapIds.map((mapId) => (
                      <LocationBadge key={mapId} mapId={mapId} />
                    ))
                  ) : (
                    <p className="text-white/90 italic text-base p-4 bg-black/20 rounded-xl border border-white/5">
                      No location data available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NpcModal;
