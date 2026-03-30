import { Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMaps } from "../api/mapleApi";
import MapCard from "../components/MapCard";
import MapModal from "../components/MapModal";
import ScrollToTopButton from "../components/ScrollToTopButton";
import type { MapLookup } from "../types/maple";

const MapsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [maps, setMaps] = useState<MapLookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(40);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    document.title = id ? "Map | MapleVault" : "Maps | MapleVault";
  }, [id]);

  useEffect(() => {
    fetchMaps()
      .then((data) => {
        setMaps(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch maps:", err);
        setLoading(false);
      });
  }, []);

  const filteredMaps = useMemo(() => {
    if (!maps) return [];

    return Object.entries(maps)
      .map(([mapId, info]) => ({
        id: parseInt(mapId, 10),
        ...info,
      }))
      .filter((map) => {
        const query = searchQuery.toLowerCase();
        const name = map.name?.toLowerCase() || "";
        const streetName = map.streetName?.toLowerCase() || "";
        return name.includes(query) || streetName.includes(query);
      });
  }, [maps, searchQuery]);

  const displayedMaps = useMemo(() => {
    return filteredMaps.slice(0, displayCount);
  }, [filteredMaps, displayCount]);

  const hasMore = displayCount < filteredMaps.length;

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      const isMobile = window.innerWidth < 768;
      const rootMargin = isMobile ? "400px" : "800px";

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setDisplayCount((prev) => prev + 40);
          }
        },
        { rootMargin },
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const handleCloseModal = () => {
    navigate("/maps");
  };

  // Reset display count when filters change
  useEffect(() => {
    if (searchQuery) {
      setDisplayCount(40);
    }
  }, [searchQuery]);

  return (
    <>
      <h2 className="font-heading text-4xl font-semibold mb-8 flex items-center gap-3 text-white">
        <span className="drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]">Maps</span>
      </h2>

      {/* Unified Maps Panel */}
      <div className="bg-amber-950/40 backdrop-blur-xl border border-(--color-card-border)/10 rounded-2xl p-6 md:p-8 shadow-2xl relative mb-12 overflow-hidden">
        {/* Inner Highlight */}
        <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Search Bar Container */}
          <div
            className="
              relative z-20
              card-mob-bg
              border border-(--color-card-border)
              rounded-2xl
              p-3 mb-8
              flex flex-wrap md:flex-nowrap items-center gap-3
              shadow-inner backdrop-blur-sm
            "
          >
            {/* Search Bar */}
            <div className="relative group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-card-text)/60 group-focus-within:text-(--color-card-text) transition-colors" />
              <input
                type="text"
                placeholder="Search by map name or street..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-11 pr-10 bg-black/10 border border-black/5 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-900/40 text-(--color-card-text) placeholder:text-(--color-card-text)/40 text-base transition-all shadow-inner hover:bg-black/15 hover:border-black/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-(--color-card-text)/60 hover:text-(--color-card-text) transition-all"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Grid Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-(--color-accent) animate-spin" />
              <p className="text-white/50 font-medium animate-pulse">
                Mapping the world...
              </p>
            </div>
          ) : displayedMaps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedMaps.map((map, index) => (
                <div
                  key={map.id}
                  ref={
                    index === displayedMaps.length - 1 ? lastElementRef : null
                  }
                >
                  <MapCard
                    id={map.id}
                    name={map.name}
                    streetName={map.streetName}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-4">
                <Search className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-heading text-white font-medium mb-2">
                No maps found
              </h3>
              <p className="text-white/40">Try adjusting your search query</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Modal */}
      {id && <MapModal mapId={parseInt(id, 10)} onClose={handleCloseModal} />}

      <ScrollToTopButton />
    </>
  );
};

export default MapsPage;
