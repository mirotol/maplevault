import {
  ArrowUpDown,
  ChevronDown,
  Database,
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
        <h2 className="text-3xl font-semibold mb-6 flex items-center gap-2">
          <Database className="w-8 h-8 text-(--color-accent)" />
          Mob List
        </h2>

        {/* Search and Filters Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-10">
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
            <div className="relative group min-w-35 flex-1 lg:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-text-secondary) group-focus-within:text-(--color-accent) transition-colors pointer-events-none" />
              <select
                value={filterMode}
                onChange={(e) =>
                  setFilterMode(e.target.value as "all" | "boss" | "level")
                }
                className="cursor-hover w-full h-11 pl-9 pr-10 bg-(--color-bg) border border-(--color-border) rounded-lg focus:outline-hidden focus:ring-2 focus:ring-(--color-accent) appearance-none cursor-pointer shadow-sm text-sm font-medium transition-all text-(--color-card-text)"
              >
                <option value="all">All Mobs</option>
                <option value="boss">Bosses</option>
                <option value="level">Level Range</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-card-text) opacity-40 pointer-events-none" />
            </div>

            {/* Level Range - Conditional */}
            {filterMode === "level" && (
              <div className="relative group min-w-30 flex-1 lg:flex-none">
                <select
                  value={levelRange}
                  onChange={(e) => setLevelRange(e.target.value)}
                  className="cursor-hover w-full h-11 px-4 pr-10 bg-(--color-bg) border border-(--color-border) rounded-lg focus:outline-hidden focus:ring-2 focus:ring-(--color-accent) appearance-none cursor-pointer shadow-sm text-sm font-medium transition-all text-(--color-card-text)"
                >
                  <option value="all">Any Level</option>
                  {LEVEL_RANGES.map((r) => (
                    <option key={r.label} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-card-text) opacity-40 pointer-events-none" />
              </div>
            )}

            {/* Sorting */}
            <div className="relative group min-w-35 flex-1 lg:flex-none">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-text-secondary) group-focus-within:text-(--color-accent) transition-colors pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "level")}
                className="cursor-hover w-full h-11 pl-9 pr-10 bg-(--color-bg) border border-(--color-border) rounded-lg focus:outline-hidden focus:ring-2 focus:ring-(--color-accent) appearance-none cursor-pointer shadow-sm text-sm font-medium transition-all text-(--color-card-text)"
              >
                <option value="level">Sort by Level</option>
                <option value="name">Sort by Name</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-card-text) opacity-40 pointer-events-none" />
            </div>

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="h-11 w-11 flex items-center justify-center bg-(--color-bg) border border-(--color-border) rounded-lg hover:bg-(--color-accent-bg) hover:text-(--color-accent) transition-all shadow-sm group shrink-0"
              title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-5 h-5 text-(--color-text-secondary) group-hover:text-(--color-accent)" />
              ) : (
                <SortDesc className="w-5 h-5 text-(--color-text-secondary) group-hover:text-(--color-accent)" />
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
