import {
  ImageOff,
  Map as MapIcon,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchMapDetail,
  fetchMobs,
  fetchNpcIcon,
  fetchNpcName,
  getMapMinimapUrl,
  getMapRenderUrl,
  getMobName,
  getNpcName,
} from "../api/mapleApi";
import type { MapDetail } from "../types/maple";
import { MobBadge } from "./MobBadge";

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
  const scrollContainerRef = useRef<HTMLButtonElement>(null);
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
  const minimapUrl = getMapMinimapUrl(mapId);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.6));
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
  const uniqueMobs = useMemo(() => {
    return detail ? Array.from(new Set(detail.mobs.map((m) => m.id))) : [];
  }, [detail]);

  const uniqueNpcs = useMemo(() => {
    return detail ? Array.from(new Set(detail.npcs.map((n) => n.id))) : [];
  }, [detail]);

  const [mobNames, setMobNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (uniqueMobs.length > 0) {
      const allResolved = uniqueMobs.every((id) => !!getMobName(id));
      if (allResolved) {
        const names: Record<number, string> = {};
        let hasChanges = false;
        for (const id of uniqueMobs) {
          const name = getMobName(id)!;
          if (mobNames[id] !== name) {
            names[id] = name;
            hasChanges = true;
          }
        }
        if (hasChanges) {
          setMobNames((prev) => ({ ...prev, ...names }));
        }
      } else {
        fetchMobs()
          .then(() => {
            const names: Record<number, string> = {};
            for (const id of uniqueMobs) {
              const name = getMobName(id);
              if (name) names[id] = name;
            }
            setMobNames(names);
          })
          .catch((err) =>
            console.error("Failed to fetch mob names for map modal:", err),
          );
      }
    }
  }, [uniqueMobs, mobNames]);

  const [npcNames, setNpcNames] = useState<Record<number, string>>({});
  const [showMapOnMobile, setShowMapOnMobile] = useState(true);

  useEffect(() => {
    if (uniqueNpcs.length > 0) {
      const newNames: Record<number, string> = {};
      let hasChanges = false;

      for (const id of uniqueNpcs) {
        const cachedName = getNpcName(id);
        if (cachedName && npcNames[id] !== cachedName) {
          newNames[id] = cachedName;
          hasChanges = true;
        } else if (!cachedName && !npcNames[id]) {
          fetchNpcName(id)
            .then((name) => {
              if (name) {
                setNpcNames((prev) => ({ ...prev, [id]: name }));
              }
            })
            .catch((err) =>
              console.error(`Failed to fetch NPC name for ${id}:`, err),
            );
        }
      }

      if (hasChanges) {
        setNpcNames((prev) => ({ ...prev, ...newNames }));
      }
    }
  }, [uniqueNpcs, npcNames]);

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
      <div className="card-paper relative w-full max-w-6xl h-full max-h-[90vh] bg-(--color-card-bg) border border-(--color-card-border) rounded-2xl shadow-2xl flex flex-col overflow-hidden">
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMapOnMobile(!showMapOnMobile)}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-black/5 hover:bg-black/10 rounded-lg transition-colors text-(--color-card-text) text-sm font-bold border border-black/5"
            >
              <MapIcon size={18} />
              {showMapOnMobile ? "Hide Map" : "Show Map"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-orange-500/10 rounded-xl transition-colors text-(--color-card-text)"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Map Image Viewer */}
          <div
            className={`flex-1 min-h-[300px] md:min-h-0 bg-black/90 relative overflow-hidden group ${
              !showMapOnMobile ? "hidden md:flex" : ""
            }`}
          >
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
                {/* Mobile Minimap View */}
                <div className="md:hidden absolute inset-0 flex items-center justify-center p-4">
                  <img
                    src={minimapUrl}
                    alt={`${detail?.name} Minimap`}
                    className="max-w-full max-h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={() => {
                      setImageError(true);
                    }}
                  />
                </div>

                {/* Desktop Rendered Map View */}
                <button
                  type="button"
                  ref={scrollContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  className={`hidden md:block absolute inset-0 overflow-auto p-8 scrollbar-hide select-none border-none bg-transparent w-full h-full text-left font-normal outline-none ${
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

                {/* Controls - Only visible on desktop */}
                <div className="hidden md:flex absolute bottom-4 right-4 flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

                <div className="hidden md:block absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white/70 text-sm border border-white/10 pointer-events-none">
                  {Math.round(zoom * 100)}% Zoom
                </div>
              </>
            )}
          </div>

          {/* Sidebar - Mobs & NPCs */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-(--color-card-border) flex flex-col bg-(--color-card-bg2) overflow-hidden flex-1 md:flex-none">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Mobs Section */}
              <section>
                <div className="flex items-center gap-2 mb-4 text-(--color-card-text)">
                  <h3 className="font-bold text-lg">
                    Mobs ({uniqueMobs.length})
                  </h3>
                </div>
                {uniqueMobs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {uniqueMobs.map((id) => (
                      <MobBadge
                        key={id}
                        id={id}
                        name={mobNames[id] || getMobName(id) || ""}
                        className="group flex items-center gap-3 p-2 bg-(--color-card-bg) border border-(--color-card-border) rounded-lg hover:border-(--color-accent) hover:bg-(--color-card-bg2) transition-all shadow-sm"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-(--color-card-text)/50 italic bg-(--color-card-bg) p-4 rounded-lg border border-dashed border-(--color-card-border)">
                    No mobs inhabit this area.
                  </div>
                )}
              </section>

              {/* NPCs Section */}
              <section>
                <div className="flex items-center gap-2 mb-4 text-(--color-card-text)">
                  <h3 className="font-bold text-lg">
                    NPCs ({uniqueNpcs.length})
                  </h3>
                </div>
                {uniqueNpcs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {uniqueNpcs.map((id) => (
                      <Link
                        key={id}
                        to={`/npcs/${id}`}
                        className="group flex items-center gap-3 p-2 bg-(--color-card-bg) border border-(--color-card-border) rounded-lg hover:border-(--color-accent) hover:bg-(--color-card-bg2) transition-all shadow-sm"
                        title={`View NPC: ${npcNames[id] || getNpcName(id) || id}`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center shrink-0">
                          <img
                            src={fetchNpcIcon(id)}
                            alt="NPC"
                            className="max-w-full max-h-full object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-(--color-card-text) truncate">
                            {npcNames[id] || getNpcName(id) || "Loading..."}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-(--color-card-text)/50 italic bg-(--color-card-bg) p-4 rounded-lg border border-dashed border-(--color-card-border)">
                    No NPCs found here.
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
