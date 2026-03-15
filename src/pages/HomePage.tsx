import { Database } from "lucide-react";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 mb-8 rounded-3xl bg-(--color-accent-bg) flex items-center justify-center text-(--color-accent)">
        <Database className="w-12 h-12" />
      </div>
      <h1 className="font-heading text-5xl font-bold mb-6">
        Welcome to MapleVault
      </h1>
      <p className="text-2xl opacity-70 max-w-2xl leading-relaxed">
        MapleStory database for mobs and items. Based on GMS v.83
      </p>
    </div>
  );
};

export default HomePage;
