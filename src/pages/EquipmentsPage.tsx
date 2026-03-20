import { Loader2, Search, SortAsc, SortDesc, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchItems } from "../api/mapleApi";
import { CustomDropdown } from "../components/CustomDropdown";
import EquipmentCard from "../components/EquipmentCard";
import EquipmentModal from "../components/EquipmentModal";
import type { Item } from "../types/maple";

type PrimaryCategory = "Weapon" | "Armor" | "Accessory" | "Mount";

const PRIMARY_CATEGORIES: { id: PrimaryCategory; label: string }[] = [
  { id: "Weapon", label: "Weapons" },
  { id: "Armor", label: "Armor" },
  { id: "Accessory", label: "Accessories" },
  { id: "Mount", label: "Mob Taming" },
];

const SUB_CATEGORIES: Record<PrimaryCategory, string[]> = {
  Weapon: [
    "One-Handed Sword",
    "One-Handed Axe",
    "One-Handed Blunt Weapon",
    "Dagger",
    "Wand",
    "Staff",
    "Two-Handed Sword",
    "Two-Handed Axe",
    "Two-Handed Blunt",
    "Spear",
    "Pole Arm",
    "Bow",
    "Crossbow",
    "Claw",
    "Knuckle",
    "Gun",
  ],
  Armor: [
    "Hat",
    "Cape",
    "Top",
    "Glove",
    "Overall",
    "Bottom",
    "Shield",
    "Shoes",
  ],
  Accessory: [
    "Face Accessory",
    "Eye Decoration",
    "Earrings",
    "Pendant",
    "Belt",
    "Medal",
    "Ring",
  ],
  Mount: ["Mount"],
};

const CLASS_OPTIONS = [
  { label: "All Classes", value: "all" },
  { label: "Beginner", value: "Beginner" },
  { label: "Warrior", value: "Warrior" },
  { label: "Magician", value: "Magician" },
  { label: "Bowman", value: "Bowman" },
  { label: "Thief", value: "Thief" },
  { label: "Pirate", value: "Pirate" },
];

const SORT_OPTIONS = [
  { label: "Sort by Level", value: "level" },
  { label: "Sort by Name", value: "name" },
];

const EquipmentsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [primaryCategory, setPrimaryCategory] =
    useState<PrimaryCategory>("Weapon");
  const [subCategory, setSubCategory] = useState<string>("all");
  const [itemClass, setItemClass] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "level">("level");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [displayCount, setDisplayCount] = useState(24);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    document.title = id ? "Item | MapleVault" : "Equipment | MapleVault";
  }, [id]);

  const handleCloseModal = () => {
    navigate("/equipment");
  };

  const selectedItem = id ? items.find((m) => m.id === Number(id)) : null;

  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter(
      (item) => item.typeInfo.overallCategory === "Equip" && !item.isCash,
    );

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }

    // Filter by primary category
    result = result.filter((m) => {
      const cat = m.typeInfo.category;
      if (primaryCategory === "Weapon") {
        return (
          cat === "One-Handed Weapon" ||
          cat === "Two-Handed Weapon" ||
          cat === "Weapon"
        );
      }
      if (primaryCategory === "Armor") {
        return cat === "Armor";
      }
      if (primaryCategory === "Accessory") {
        return cat === "Accessory";
      }
      if (primaryCategory === "Mount") {
        return cat === "Mount";
      }
      return false;
    });

    // Filter by sub category
    if (subCategory !== "all") {
      result = result.filter((m) => m.typeInfo.subCategory === subCategory);
    }

    // Filter by class
    if (itemClass !== "all") {
      result = result.filter(
        (m) =>
          m.requiredJobs?.includes("Beginner") ||
          m.requiredJobs?.includes(itemClass),
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = (a.requiredLevel || 0) - (b.requiredLevel || 0);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    items,
    searchQuery,
    primaryCategory,
    subCategory,
    sortBy,
    sortOrder,
    itemClass,
  ]);

  const displayedItems = useMemo(() => {
    return filteredAndSortedItems.slice(0, displayCount);
  }, [filteredAndSortedItems, displayCount]);

  const hasMore = displayCount < filteredAndSortedItems.length;

  const lastItemElementRef = useCallback(
    (node: HTMLButtonElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount((prev) => prev + 24);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchItems()
      .then((data) => {
        if (!active) return;
        setItems(data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to fetch equipment:", err);
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
    setDisplayCount(24);
  }, [filteredAndSortedItems]);

  // Reset subCategory when primaryCategory changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset subCategory when primaryCategory changes
  useEffect(() => {
    setSubCategory("all");
  }, [primaryCategory]);

  return (
    <>
      <h2 className="font-heading text-4xl font-semibold mb-8 flex items-center gap-3 text-white">
        <img
          src="/icons/zakum_helmet.png"
          alt="Zakum Helmet"
          className="w-12 h-12 pointer-events-none select-none"
        />
        <span className="drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]">Equipment</span>
      </h2>

      {/* Unified Equipment Panel */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative mb-12 overflow-hidden">
        {/* Inner Highlight */}
        <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Primary Category Tabs */}
          <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start card-equipment-bg p-3 rounded-2xl w-fit">
            {PRIMARY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setPrimaryCategory(cat.id)}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  primaryCategory === cat.id
                    ? "bg-linear-to-r from-red-700 to-orange-500/80 text-white shadow-[0_0_20px_0px_rgba(251,146,60,0.4)]"
                    : "text-white/70 bg-white/10 hover:text-white hover:bg-orange-600/70"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div
            className="
              relative z-20
              card-equipment-bg
              border border-blue-500/30
              rounded-2xl
              p-3 mb-8
              flex flex-wrap md:flex-nowrap items-center gap-3
              shadow-inner backdrop-blur-sm
            "
          >
            {" "}
            {/* Search Bar */}
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/90 group-focus-within:text-orange-400 transition-colors" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-11 pr-10 bg-black/40 border border-white/10 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-orange-500/50 text-white placeholder:text-white/20 text-sm transition-all shadow-inner hover:bg-black/20 hover:border-white/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/90 hover:text-white transition-all"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Class Filter */}
            <CustomDropdown
              className="h-10 min-w-35 flex-1 md:flex-none"
              options={CLASS_OPTIONS}
              value={itemClass}
              onChange={setItemClass}
            />
            {/* Sub Category Filter */}
            {primaryCategory !== "Mount" && (
              <CustomDropdown
                className="h-10 min-w-45 flex-1 md:flex-none"
                options={[
                  { label: "All Categories", value: "all" },
                  ...SUB_CATEGORIES[primaryCategory].map((sub) => ({
                    label: sub,
                    value: sub,
                  })),
                ]}
                value={subCategory}
                onChange={setSubCategory}
              />
            )}
            {/* Sorting */}
            <CustomDropdown
              className="h-10 min-w-35 flex-1 md:flex-none"
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val as "name" | "level")}
            />
            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="h-10 w-10 flex items-center justify-center bg-black/40 border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-black/20 hover:border-white/20 transition-all cursor-pointer group shadow-inner shrink-0"
              title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-5 h-5 transition-transform group-hover:scale-110" />
              ) : (
                <SortDesc className="w-5 h-5 transition-transform group-hover:scale-110" />
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5 mb-8" />

          {/* Card Grid / Content */}
          {loading ? (
            <div className="flex flex-col justify-center items-center p-20 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-(--color-accent)" />
              <p className="text-xl font-medium opacity-50">
                Fetching equipment data...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {displayedItems.map((item, index) => {
                  const isLast = displayedItems.length === index + 1;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      ref={isLast ? lastItemElementRef : undefined}
                      onClick={() => navigate(`/equipment/${item.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/equipment/${item.id}`);
                        }
                      }}
                      className="cursor-pointer flex h-full focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg w-full text-left"
                    >
                      <EquipmentCard item={item} />
                    </button>
                  );
                })}
              </div>

              {filteredAndSortedItems.length === 0 && (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl w-full">
                  <p className="text-2xl font-medium opacity-50 mb-2 text-white">
                    No equipment match your search
                  </p>
                  <p className="opacity-30 text-white">
                    Try adjusting your filters or search query.
                  </p>
                </div>
              )}

              {hasMore && (
                <div className="flex justify-center items-center p-8 mt-4 w-full">
                  <Loader2 className="w-8 h-8 animate-spin text-(--color-accent)" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {id && (
        <EquipmentModal
          itemId={Number(id)}
          initialItem={selectedItem || undefined}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default EquipmentsPage;
