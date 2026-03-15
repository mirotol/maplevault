import { Database, Shield } from "lucide-react";
import { useEffect } from "react";

const ItemsPage = () => {
  useEffect(() => {
    document.title = "Items | MapleVault";
  }, []);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2">
          <Database className="w-8 h-8 text-(--color-accent)" />
          Item List
        </h2>
      </div>

      {/* Responsive Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Placeholder Grid Items */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="p-6 rounded-xl border border-(--color-border) bg-(--color-bg) shadow-(--color-shadow) hover:border-(--color-accent) transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 mb-4 rounded-lg bg-(--color-accent-bg) flex items-center justify-center text-(--color-accent)">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-medium mb-1 group-hover:text-(--color-accent) transition-colors">
              Item #{item}
            </h3>
            <p className="text-base opacity-60">
              Click to view more details about this item in the MapleVault.
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default ItemsPage;
