import {
  ArrowUpDown,
  Database,
  Filter,
  Loader2,
  Search,
  SortAsc,
  SortDesc,
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

const MonstersPage = () => {
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

  const handleCloseModal = () => {
    navigate("/monsters");
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
      result = result.filter((m) => m.isBoss || m.level >= 100);
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
          Monster List
        </h2>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
            <input
              type="text"
              placeholder="Search monsters by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-(--color-bg) border border-(--color-border) rounded-xl focus:outline-hidden focus:ring-2 focus:ring-(--color-accent) transition-all text-lg"
            />
          </div>

          {/* Filter Mode */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <select
                value={filterMode}
                onChange={(e) =>
                  setFilterMode(e.target.value as "all" | "boss" | "level")
                }
                className="w-full pl-10 pr-4 py-3 bg-(--color-bg) border border-(--color-border) rounded-xl focus:outline-hidden focus:ring-2 focus:ring-(--color-accent) text-lg"
              >
                <option value="all">All Monsters</option>
                <option value="boss">Bosses Only</option>
                <option value="level">Level Range</option>
              </select>
            </div>
            {filterMode === "level" && (
              <select
                value={levelRange}
                onChange={(e) => setLevelRange(e.target.value)}
                className="flex-1 px-4 py-3 bg-(--color-bg) border border-(--color-border) rounded-xl focus:outline-hidden focus:ring-2 focus:ring-(--color-accent) text-lg"
              >
                <option value="all">Any Level</option>
                {LEVEL_RANGES.map((r) => (
                  <option key={r.label} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sorting */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "level")}
                className="w-full pl-10 pr-4 py-3 bg-(--color-bg) border border-(--color-border) rounded-xl focus:outline-hidden focus:ring-2 focus:ring-(--color-accent) text-lg"
              >
                <option value="level">Sort by Level</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="p-3 bg-(--color-bg) border border-(--color-border) rounded-xl hover:bg-(--color-accent-bg) hover:text-(--color-accent) transition-all"
              title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-6 h-6" />
              ) : (
                <SortDesc className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center p-20 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-(--color-accent)" />
          <p className="text-xl font-medium opacity-50">
            Fetching monster data...
          </p>
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
                No monsters match your search
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

          {!hasMore && filteredAndSortedMobs.length > 0 && (
            <p className="text-center p-8 opacity-30 text-lg">
              Showing all {filteredAndSortedMobs.length} monsters.
            </p>
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

export default MonstersPage;
