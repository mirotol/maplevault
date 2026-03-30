import {
  Ghost,
  ImageOff,
  Maximize2,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchMapDetail,
  fetchMobIcon,
  fetchMobs,
  fetchNpcName,
  getMapRenderUrl,
  getMobName,
  getNpcName,
} from "../api/mapleApi";
import type { MapDetail } from "../types/maple";

interface MapModalProps {
  mapId: number;
  onClose: () => void;
}

const MapModal = ({ mapId, onClose }: MapModalProps) => {
  const [detail, setDetail] = useState<MapDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchMapDetail(mapId)
      .then((data) => {
        if (isMounted) {
          if (data) setDetail(data);
          else setError("Map not found");
          setLoading(false);
        }
      })
      .catch((_err) => {
        if (isMounted) {
          setError("Failed to load map details");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [mapId]);

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

  const renderUrl = getMapRenderUrl(mapId);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.1));
  const handleResetZoom = () => setZoom(1);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setStartY(e.pageY - scrollContainerRef.current.offsetTop);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setScrollTop(scrollContainerRef.current.scrollTop);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const y = e.pageY - scrollContainerRef.current.offsetTop;
    const walkX = (x - startX) * 2; // Scroll speed multiplier
    const walkY = (y - startY) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
    scrollContainerRef.current.scrollTop = scrollTop - walkY;
  };

  // Group unique mobs and npcs by ID to show a simple list
  const uniqueMobs = detail
    ? Array.from(new Set(detail.mobs.map((m) => m.id)))
    : [];
  const uniqueNpcs = detail
    ? Array.from(new Set(detail.npcs.map((n) => n.id)))
    : [];

  useEffect(() => {
    if (uniqueMobs.length > 0) {
      const needsFetch = uniqueMobs.some((id) => !getMobName(id));
      if (needsFetch) {
        fetchMobs().catch((err) =>
          console.error("Failed to fetch mob names for map modal:", err),
        );
      }
    }
  }, [uniqueMobs]);

  useEffect(() => {
    if (uniqueNpcs.length > 0) {
      for (const id of uniqueNpcs) {
        if (!getNpcName(id)) {
          fetchNpcName(id).catch((err) =>
            console.error(`Failed to fetch NPC name for ${id}:`, err),
          );
        }
      }
    }
  }, [uniqueNpcs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-(--color-card-bg) border border-(--color-card-border) rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-(--color-card-border) flex items-center justify-between bg-(--color-card-bg2)">
          <div>
            <div className="text-sm font-bold text-(--color-accent) uppercase tracking-widest mb-1">
              {detail?.streetName || "..."}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-(--color-card-text)">
              {detail?.name || "Loading Map..."}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-(--color-card-text)"
          >
            <X size={28} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Map Image Viewer */}
          <div className="flex-1 bg-black/90 relative overflow-hidden group">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-(--color-accent)"></div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                {error}
              </div>
            ) : imageError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 p-8 text-center">
                <ImageOff size={64} className="mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  No map render available
                </h3>
                <p className="text-sm max-w-xs">
                  A high-resolution render of this map could not be found in the
                  database.
                </p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  ref={scrollContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  className={`absolute inset-0 overflow-auto p-8 scrollbar-hide select-none border-none bg-transparent block w-full h-full text-left font-normal ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                >
                  <img
                    src={renderUrl}
                    alt={detail?.name}
                    className="origin-top-left transition-transform duration-200 pointer-events-none"
                    style={{
                      transform: `scale(${zoom})`,
                      imageRendering: "pixelated",
                    }}
                    onError={() => {
                      setImageError(true);
                    }}
                  />
                </button>

                {/* Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-all shadow-lg border border-white/10"
                    title="Zoom In"
                  >
                    <ZoomIn size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-all shadow-lg border border-white/10"
                    title="Zoom Out"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-all shadow-lg border border-white/10"
                    title="Reset Zoom"
                  >
                    <Maximize2 size={20} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white/70 text-sm border border-white/10 pointer-events-none">
                  {Math.round(zoom * 100)}% Zoom • Scroll to explore
                </div>
              </>
            )}
          </div>

          {/* Sidebar - Mobs & NPCs */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-(--color-card-border) flex flex-col bg-(--color-card-bg2) overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Mobs Section */}
              <section>
                <div className="flex items-center gap-2 mb-4 text-(--color-card-text)">
                  <Ghost size={20} className="text-(--color-accent)" />
                  <h3 className="font-bold text-lg">
                    Monsters ({uniqueMobs.length})
                  </h3>
                </div>
                {uniqueMobs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {uniqueMobs.map((id) => (
                      <Link
                        key={id}
                        to={`/mobs/${id}`}
                        className="group flex items-center gap-3 p-2 bg-(--color-card-bg) border border-(--color-card-border) rounded-lg hover:border-(--color-accent) hover:bg-(--color-card-bg2) transition-all shadow-sm"
                        title={`View Mob: ${getMobName(id) || id}`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center shrink-0">
                          <img
                            src={fetchMobIcon(id)}
                            alt="Mob"
                            className="max-w-full max-h-full object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-(--color-card-text) truncate">
                            {getMobName(id) || "Loading..."}
                          </div>
                          <div className="text-[10px] text-(--color-card-text)/40 font-mono">
                            ID: {id}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-(--color-card-text)/50 italic bg-(--color-card-bg) p-4 rounded-lg border border-dashed border-(--color-card-border)">
                    No monsters inhabit this area.
                  </div>
                )}
              </section>

              {/* NPCs Section */}
              <section>
                <div className="flex items-center gap-2 mb-4 text-(--color-card-text)">
                  <Users size={20} className="text-(--color-accent)" />
                  <h3 className="font-bold text-lg">
                    NPCs ({uniqueNpcs.length})
                  </h3>
                </div>
                {uniqueNpcs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {uniqueNpcs.map((id) => (
                      <div
                        key={id}
                        className="group flex items-center gap-3 p-2 bg-(--color-card-bg) border border-(--color-card-border) rounded-lg hover:border-(--color-accent) transition-all shadow-sm"
                        title={`NPC ID: ${id}`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center shrink-0">
                          <img
                            src={`https://maplestory.io/api/gms/83/npc/${id}/icon`}
                            alt="NPC"
                            className="max-w-full max-h-full object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-(--color-card-text) truncate">
                            {getNpcName(id) || "Loading..."}
                          </div>
                          <div className="text-[10px] text-(--color-card-text)/40 font-mono">
                            ID: {id}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-(--color-card-text)/50 italic bg-(--color-card-bg) p-4 rounded-lg border border-dashed border-(--color-card-border)">
                    No NPCs found here.
                  </div>
                )}
              </section>
            </div>

            <div className="p-4 bg-black/5 text-[10px] text-(--color-card-text)/40 text-center font-mono">
              MAP ID: {mapId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
