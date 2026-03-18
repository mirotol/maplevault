import {
  ArrowUpDown,
  Filter,
  Loader2,
  Search,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMobs } from "../api/mapleApi";
import { CustomDropdown } from "../components/CustomDropdown";
import MobCard from "../components/MobCard";
import MobModal from "../components/MobModal";
import type { Mob } from "../types/maple";

const LEVEL_RANGES = [
  ...Array.from({ length: 18 }, (_, i) => ({
    min: i * 10 + 1,
    max: (i + 1) * 10,
    label: `${i * 10 + 1}-${(i + 1) * 10}`,
  })),
  { min: 181, max: 200, label: "181-200" },
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

  const handleCloseModal = () => {
    navigate("/mobs");
  };

  const handleSelectMob = (mob: Mob) => {
    navigate(`/mob/${mob.id}`);
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
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount((prev) => prev + 40);
        }
      });
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
      <div className="mb-8">
        <h2 className="font-heading text-3xl font-semibold mb-6 flex items-center gap-2">
          <img
            src="/icons/orange_mushroom.png"
            alt="Orange Mushroom"
            className="w-8 h-8 pointer-events-none select-none"
          />
          Mob List
        </h2>

        {/* Search and Filters Toolbar */}
        <div className="relative z-20 flex flex-col lg:flex-row items-stretch gap-4 mb-10">
          {/* Search Bar - Dominant */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--color-text-secondary) group-focus-within:text-(--color-accent) transition-colors" />
            <input
              type="text"
              placeholder="Search mobs by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-11 bg-(--color-bg) border border-(--color-border) rounded-lg focus:outline-hidden focus:ring-2 focus:ring-(--color-accent) focus:border-transparent transition-all shadow-sm text-base placeholder:opacity-50 text-(--color-card-text)"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-(--color-text-secondary) hover:text-(--color-accent) hover:bg-(--color-accent-bg) transition-all"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters and Sorting Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Mode */}
            <CustomDropdown
              className="h-11 min-w-35 flex-1 lg:flex-none"
              options={FILTER_MODE_OPTIONS}
              value={filterMode}
              onChange={(val) => setFilterMode(val as "all" | "boss" | "level")}
              leftIcon={
                <Filter className="w-4 h-4 text-white/20 transition-colors" />
              }
            />

            {/* Level Range - Conditional */}
            {filterMode === "level" && (
              <CustomDropdown
                className="h-11 min-w-30 flex-1 lg:flex-none"
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

            {/* Sorting */}
            <CustomDropdown
              className="h-11 min-w-35 flex-1 lg:flex-none"
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val as "name" | "level")}
              leftIcon={
                <ArrowUpDown className="w-4 h-4 text-white/20 transition-colors" />
              }
            />

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="h-11 w-11 flex items-center justify-center bg-black/40 border border-white/10 rounded-xl text-white/20 hover:text-white hover:bg-black/20 hover:border-white/20 transition-all cursor-pointer group shadow-inner shrink-0"
              title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-5 h-5 transition-transform group-hover:scale-110" />
              ) : (
                <SortDesc className="w-5 h-5 transition-transform group-hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center p-20 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-(--color-accent)" />
          <p className="text-xl font-medium opacity-50">Fetching mob data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {displayedMobs.map((mob, index) => {
              if (displayedMobs.length === index + 1) {
                return (
                  <div ref={lastMobElementRef} key={mob.id}>
                    <MobCard mob={mob} onClick={() => handleSelectMob(mob)} />
                  </div>
                );
              }
              return (
                <MobCard
                  key={mob.id}
                  mob={mob}
                  onClick={() => handleSelectMob(mob)}
                />
              );
            })}
          </div>

          {filteredAndSortedMobs.length === 0 && (
            <div className="text-center py-20 bg-(--color-bg) border border-dashed border-(--color-border) rounded-3xl">
              <p className="text-2xl font-medium opacity-50 mb-2">
                No mobs match your search
              </p>
              <p className="opacity-30">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center items-center p-8 mt-4">
              <Loader2 className="w-8 h-8 animate-spin text-(--color-accent)" />
            </div>
          )}
        </>
      )}

      {id && (
        <MobModal
          mobId={Number(id)}
          initialMob={selectedMob || undefined}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default MobsPage;
