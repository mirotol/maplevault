import { Filter, Loader2, Search, SortAsc, SortDesc, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMobs } from "../api/mapleApi";
import { CustomDropdown } from "../components/CustomDropdown";
import MobCard from "../components/MobCard";
import MobModal from "../components/MobModal";
import ScrollToTopButton from "../components/ScrollToTopButton";
import type { Mob } from "../types/maple";

const LEVEL_RANGES = [
  ...Array.from({ length: 18 }, (_, i) => ({
    min: i * 10 + 1,
    max: (i + 1) * 10,
    label: `${i * 10 + 1}-${(i + 1) * 10}`,
  })),
  { min: 181, max: 200, label: "181-200" },
  { min: 201, max: Number.MAX_SAFE_INTEGER, label: "200+" },
];

const FILTER_MODE_OPTIONS = [
  { label: "All Mobs", value: "all" },
  { label: "Bosses", value: "boss" },
  { label: "Level Range", value: "level" },
];

const SORT_OPTIONS = [
  { label: "Sort by Level", value: "level" },
  { label: "Sort by Name", value: "name" },
];

const MobsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mobs, setMobs] = useState<Mob[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "boss" | "level">("all");
  const [levelRange, setLevelRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "level">("level");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [displayCount, setDisplayCount] = useState(40);
  const observer = useRef<IntersectionObserver | null>(null);

  const selectedMob = id ? mobs.find((m) => m.id === Number(id)) : null;

  useEffect(() => {
    document.title = id ? "Mob | MapleVault" : "Mobs | MapleVault";
  }, [id]);

  const handleCloseModal = useCallback(() => {
    navigate("/mobs");
  }, [navigate]);

  const handleSelectMob = (mob: Mob) => {
    navigate(`/mobs/${mob.id}`);
  };

  const filteredAndSortedMobs = useMemo(() => {
    let result = [...mobs];

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }

    // Filter by mode
    if (filterMode === "boss") {
      result = result.filter((m) => m.isBoss);
    } else if (filterMode === "level" && levelRange !== "all") {
      const range = LEVEL_RANGES.find((r) => r.label === levelRange);
      if (range) {
        result = result.filter(
          (m) => m.level >= range.min && m.level <= range.max,
        );
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = a.level - b.level;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [mobs, searchQuery, filterMode, levelRange, sortBy, sortOrder]);

  const displayedMobs = useMemo(() => {
    return filteredAndSortedMobs.slice(0, displayCount);
  }, [filteredAndSortedMobs, displayCount]);

  const hasMore = displayCount < filteredAndSortedMobs.length;

  const lastMobElementRef = useCallback(
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

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchMobs()
      .then((data) => {
        if (!active) return;
        setMobs(data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to fetch mobs:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Reset display count when filters change
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset displayCount when filters/sort change
  useEffect(() => {
    setDisplayCount(40);
  }, [filteredAndSortedMobs]);

  return (
    <>
      <h2 className="font-heading text-4xl font-semibold mb-8 flex items-center gap-3 text-white">
        <img
          src="/icons/orange_mushroom.png"
          alt="Orange Mushroom"
          className="w-12 h-12 pointer-events-none select-none"
          style={{ imageRendering: "pixelated" }}
        />
        <span className="drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]">Mobs</span>
      </h2>

      {/* Unified Mobs Panel */}
      <div className="bg-amber-950/40 backdrop-blur-xl border border-(--color-card-border)/10 rounded-2xl p-6 md:p-8 shadow-2xl relative mb-12 overflow-hidden">
        {/* Inner Highlight */}
        <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Filter Bar */}
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
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-card-text)/60 group-focus-within:text-(--color-card-text) transition-colors" />
              <input
                type="text"
                placeholder="Search mobs..."
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

            {/* Filter Mode */}
            <CustomDropdown
              variant="mob"
              className="h-10 min-w-35 flex-1 md:flex-none"
              options={FILTER_MODE_OPTIONS}
              value={filterMode}
              onChange={(val) => setFilterMode(val as "all" | "boss" | "level")}
              leftIcon={
                <Filter className="w-4 h-4 text-(--color-card-text)/60 transition-colors" />
              }
            />

            {/* Level Range - Conditional */}
            {filterMode === "level" && (
              <CustomDropdown
                variant="mob"
                className="h-10 min-w-30 flex-1 md:flex-none"
                options={[
                  { label: "Any Level", value: "all" },
                  ...LEVEL_RANGES.map((r) => ({
                    label: r.label,
                    value: r.label,
                  })),
                ]}
                value={levelRange}
                onChange={setLevelRange}
              />
            )}

            <div className="flex flex-wrap items-center gap-3">
              <CustomDropdown
                variant="mob"
                className="h-10 min-w-35"
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val as "name" | "level")}
              />
              <button
                type="button"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="w-10 h-10 flex items-center justify-center bg-black/10 border border-black/5 rounded-xl text-(--color-card-text)/60 hover:text-(--color-card-text) hover:bg-black/20 hover:border-black/10 transition-all cursor-pointer"
                title={
                  sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"
                }
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="w-5 h-5" />
                ) : (
                  <SortDesc className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-(--color-accent) animate-spin" />
              <p className="text-white/50 font-medium animate-pulse">
                Summoning mobs...
              </p>
            </div>
          ) : displayedMobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedMobs.map((mob, index) => (
                <div
                  key={mob.id}
                  className="flex h-full"
                  ref={
                    index === displayedMobs.length - 1
                      ? lastMobElementRef
                      : null
                  }
                >
                  <MobCard mob={mob} onClick={() => handleSelectMob(mob)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-4">
                <Search className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-heading text-white font-medium mb-2">
                No mobs found
              </h3>
              <p className="text-white/40">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {id && (
        <MobModal
          mobId={Number(id)}
          initialMob={selectedMob || undefined}
          onClose={handleCloseModal}
        />
      )}

      <ScrollToTopButton />
    </>
  );
};

export default MobsPage;
