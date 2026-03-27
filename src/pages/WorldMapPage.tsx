import { useEffect } from "react";
import WorldMapViewer from "../components/WorldMapViewer";

const WorldMapPage = () => {
  useEffect(() => {
    document.title = "World Map | MapleVault";
  }, []);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center py-2">
      <WorldMapViewer />
    </div>
  );
};

export default WorldMapPage;
