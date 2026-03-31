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
      <div className="card-paper relative w-full max-w-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-(--color-card-text) animate-in zoom-in-95 duration-300 mx-4 sm:mx-0">
        {/* Top bar (Close button) */}
        <div className="flex justify-end p-2 sm:p-4 absolute right-0 top-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 rounded-xl hover:bg-orange-500/10 transition-all text-(--color-card-text) opacity-70 hover:opacity-100"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
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
          <>
            {/* Header Section */}
            <div className="p-6 sm:p-8 pb-4 sm:pb-6 flex flex-col items-center text-center border-b border-white/10 relative overflow-hidden shrink-0">
              <div className="w-40 h-40 sm:w-56 sm:h-56 p-4 mb-4 flex items-center justify-center group">
                <img
                  src={iconUrl}
                  alt={detail.name || `NPC ${npcId}`}
                  className="max-w-[95%] max-h-[95%] object-contain scale-110 group-hover:scale-125 transition-transform duration-500"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-1 wrap-break-word max-w-[85%] mx-auto">
                {detail.name || `NPC ${npcId}`}
              </h2>
              {detail.function && (
                <p className="text-(--color-accent) font-medium uppercase tracking-widest text-xs sm:text-sm mb-4 max-w-[90%] mx-auto">
                  {detail.function}
                </p>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Left Column: Dialogue / Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base text-(--color-card-text) uppercase tracking-[0.2em] flex items-center gap-2">
                      <MessageCircle
                        size={20}
                        className="text-(--color-card-text)"
                      />
                      Dialogue
                    </h3>
                    <div className="bg-black/10 rounded-xl my-4 p-4 border border-white/5 space-y-3">
                      {detail.dialogue &&
                      Object.keys(detail.dialogue).length > 0 ? (
                        Object.entries(detail.dialogue).map(([key, text]) => (
                          <p
                            key={key}
                            className="text-(--color-card-text) italic text-sm leading-relaxed wrap-break-word"
                          >
                            "{text}"
                          </p>
                        ))
                      ) : (
                        <p className="text-(--color-card-text) italic text-sm">
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
                  <h3 className="text-base text-(--color-card-text) uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Locations ({uniqueMapIds.length})
                  </h3>
                  <div className="my-4 grid grid-cols-1 gap-2 max-h-60 sm:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
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
          </>
        )}
      </div>
    </div>
  );
};

export default NpcModal;
