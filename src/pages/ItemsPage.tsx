import { Loader2, Search, SortAsc, SortDesc, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchItems } from "../api/mapleApi";
import { CustomDropdown } from "../components/CustomDropdown";
import ItemCard from "../components/ItemCard";
import ScrollToTopButton from "../components/ScrollToTopButton";
import type { Item } from "../types/maple";

export const ITEM_GROUPS = {
  Use: {
    Consumables: ["Potion", "Food and Drink", "Consumable", "Status Cure"],
    Scrolls: ["Weapon Scroll", "Armor Scroll", "Special Scroll"],
    Utility: ["Teleport Item", "EXP Buff", "Time Saver"],
    Special: ["Equipment Box", "Other"],
  },
  Setup: {
    Main: ["Chair", "Title", "Decoration", "Event Item"],
  },
  Etc: {
    Drops: ["Monster Drop"],
    Crafting: ["Mineral Ore", "Herb", "Crafting Item"],
    Quest: ["Quest Item"],
    Currency: ["Coin"],
    Other: ["Other"],
  },
  Cash: {
    Cosmetics: ["Hair Coupon", "Face Coupon", "Skin Coupon"],
    Convenience: ["Teleport Rock", "Inventory Slot"],
    Gacha: ["Gachapon", "Surprise Box"],
    Pets: ["Pet Use", "Pet Food"],
    Enhancement: ["Miracle Cube", "Scroll"],
  },
};

type MainCategory = keyof typeof ITEM_GROUPS;

function getItemGroup(item: Item) {
  const overall = item.typeInfo.overallCategory as MainCategory;
  const sub = item.typeInfo.subCategory || "";

  const groups = ITEM_GROUPS[overall];
  if (!groups) return { main: overall, group: "Other" };

  for (const [groupName, values] of Object.entries(groups)) {
    if (values.some((v) => sub.includes(v))) {
      return { main: overall, group: groupName };
    }
  }

  return { main: overall, group: "Other" };
}

const MAIN_CATEGORIES: { id: MainCategory; label: string }[] = [
  { id: "Use", label: "Use" },
  { id: "Setup", label: "Setup" },
  { id: "Etc", label: "Etc" },
  { id: "Cash", label: "Cash" },
];

const ItemsPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mainCategory, setMainCategory] = useState<MainCategory>("Use");
  const [groupCategory, setGroupCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [displayCount, setDisplayCount] = useState(24);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    document.title = "Items | MapleVault";
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter(
      (item) => item.typeInfo.overallCategory !== "Equip",
    );

    // Filter by main category
    result = result.filter(
      (item) => item.typeInfo.overallCategory === mainCategory,
    );

    // Filter by group category
    if (groupCategory !== "all") {
      result = result.filter((item) => {
        const { group } = getItemGroup(item);
        return group === groupCategory;
      });
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }

    // Sort by name
    result.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [items, searchQuery, mainCategory, groupCategory, sortOrder]);

  const displayedItems = useMemo(() => {
    return filteredAndSortedItems.slice(0, displayCount);
  }, [filteredAndSortedItems, displayCount]);

  const hasMore = displayCount < filteredAndSortedItems.length;

  const lastItemElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      const isMobile = window.innerWidth < 768;
      const rootMargin = isMobile ? "400px" : "800px";

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setDisplayCount((prev) => prev + 24);
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
    fetchItems()
      .then((data) => {
        if (!active) return;
        setItems(data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to fetch items:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Reset display count when filters change
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset displayCount when filters change
  useEffect(() => {
    setDisplayCount(24);
  }, [filteredAndSortedItems]);

  // Reset groupCategory when mainCategory changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset groupCategory when mainCategory changes
  useEffect(() => {
    setGroupCategory("all");
  }, [mainCategory]);

  const currentGroups = useMemo(() => {
    return Object.keys(ITEM_GROUPS[mainCategory]);
  }, [mainCategory]);

  return (
    <>
      <h2 className="font-heading text-4xl font-semibold mb-8 flex items-center gap-3 text-white">
        <img
          src="/icons/orange_mushroom.png"
          alt="Items"
          className="w-12 h-12 pointer-events-none select-none"
        />
        <span className="drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]">Items</span>
      </h2>

      <div className="bg-amber-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative mb-12 overflow-hidden">
        <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Main Category Tabs */}
          <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start card-mob-bg p-3 rounded-2xl w-fit">
            {MAIN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setMainCategory(cat.id)}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  mainCategory === cat.id
                    ? "bg-linear-to-r from-orange-800 to-amber-600/80 text-white shadow-[0_0_20px_0px_rgba(245,158,11,0.4)]"
                    : "text-white/70 bg-white/10 hover:text-white hover:bg-orange-600/70"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="relative z-20 card-mob-bg border border-amber-500/30 rounded-2xl p-3 mb-8 flex flex-wrap md:flex-nowrap items-center gap-3 shadow-inner backdrop-blur-sm">
            {/* Search Bar */}
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-card-text)/60 group-focus-within:text-(--color-card-text) transition-colors" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-11 pr-10 bg-black/10 border border-black/5 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-900/40 text-(--color-card-text) placeholder:text-(--color-card-text)/40 text-sm transition-all shadow-inner hover:bg-black/15 hover:border-black/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-(--color-card-text)/60 hover:text-(--color-card-text) transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Group Filter */}
            <CustomDropdown
              variant="mob"
              className="h-10 min-w-45 flex-1 md:flex-none"
              options={[
                { label: "All Groups", value: "all" },
                ...currentGroups.map((g) => ({ label: g, value: g })),
              ]}
              value={groupCategory}
              onChange={setGroupCategory}
            />

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="h-10 w-10 flex items-center justify-center bg-black/10 border border-black/5 rounded-xl text-(--color-card-text)/60 hover:text-(--color-card-text) hover:bg-black/20 hover:border-black/10 transition-all cursor-pointer group shadow-inner shrink-0 md:ml-auto"
              title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-5 h-5 transition-transform group-hover:scale-110" />
              ) : (
                <SortDesc className="w-5 h-5 transition-transform group-hover:scale-110" />
              )}
            </button>
          </div>

          {/* Card Grid */}
          {loading ? (
            <div className="flex flex-col justify-center items-center p-20 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-(--color-accent)" />
              <p className="text-xl font-medium opacity-50 text-white">
                Fetching items data...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedItems.map((item, index) => {
                  const isLast = displayedItems.length === index + 1;
                  return (
                    <div
                      key={item.id}
                      ref={isLast ? lastItemElementRef : undefined}
                      className="flex h-full"
                    >
                      <ItemCard item={item} />
                    </div>
                  );
                })}
              </div>

              {filteredAndSortedItems.length === 0 && (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl w-full">
                  <p className="text-2xl font-medium opacity-50 mb-2 text-white">
                    No items match your search
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

      <ScrollToTopButton />
    </>
  );
};

export default ItemsPage;
