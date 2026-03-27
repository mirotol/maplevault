import { Home, MonitorOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WorldMapViewer from "../components/WorldMapViewer";

const WorldMapPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.title = "World Map | MapleVault";

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center py-2 min-h-[500px] relative overflow-hidden">
      {isMobile ? (
        <>
          {/* Blurred Background Map */}
          <div
            className="absolute inset-0 opacity-10 blur-md grayscale pointer-events-none"
            style={{
              backgroundImage: "url(/worldmap/images/WorldMap_base.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl backdrop-blur-sm">
              <MonitorOff className="w-10 h-10 text-gray-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
              Desktop Experience
            </h2>

            <p className="text-white/80 text-lg leading-relaxed mb-10">
              World map navigation is best experienced on larger screens and
              does not support small screens currently.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
          </div>
        </>
      ) : (
        <WorldMapViewer />
      )}
    </div>
  );
};

export default WorldMapPage;
