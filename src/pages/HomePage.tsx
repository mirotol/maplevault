import { Ghost, LayoutGrid, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2">
          <LayoutGrid className="w-8 h-8 text-(--color-accent)" />
          Categories
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link
          to="/monsters"
          className="p-8 rounded-2xl border border-(--color-border) bg-(--color-bg) shadow-(--color-shadow) hover:border-(--color-accent) transition-all duration-300 group"
        >
          <div className="w-20 h-20 mb-6 rounded-xl bg-(--color-accent-bg) flex items-center justify-center text-(--color-accent) group-hover:scale-110 transition-transform">
            <Ghost className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-bold mb-2 group-hover:text-(--color-accent) transition-colors">
            Monster List
          </h3>
          <p className="text-xl opacity-70">
            Explore the complete database of MapleStory mobs, including stats
            and drops.
          </p>
        </Link>

        <Link
          to="/items"
          className="p-8 rounded-2xl border border-(--color-border) bg-(--color-bg) shadow-(--color-shadow) hover:border-(--color-accent) transition-all duration-300 group"
        >
          <div className="w-20 h-20 mb-6 rounded-xl bg-(--color-accent-bg) flex items-center justify-center text-(--color-accent) group-hover:scale-110 transition-transform">
            <Shield className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-bold mb-2 group-hover:text-(--color-accent) transition-colors">
            Item List
          </h3>
          <p className="text-xl opacity-70">
            Browse through all available items, equipment, and consumables.
          </p>
        </Link>
      </div>
    </>
  );
};

export default HomePage;
