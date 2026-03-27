import { useEffect } from "react";
import WorldMapViewer from "../components/WorldMapViewer";

const WorldMapPage = () => {
  useEffect(() => {
    document.title = "World Map | MapleVault";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <WorldMapViewer />
    </div>
  );
};

export default WorldMapPage;
