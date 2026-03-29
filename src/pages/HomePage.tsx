import { useEffect, useState } from "react";
import FallingEffect from "../components/FallingEffect";

const HomePage = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.title = "Home | MapleVault";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center">
      <FallingEffect image="/effects/maple_leaf.png" count={7} />

      <img
        src="/effects/library.gif"
        alt="MapleVault Library"
        onLoad={() => setLoaded(true)}
        className={`w-86 mb-6 mt-2 md:mb-10 md:mt-4 pointer-events-none select-none drop-shadow-xl ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ imageRendering: "pixelated" }}
      />

      {loaded && (
        <>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]">
            Welcome to MapleVault
          </h1>

          <p className="text-lg md:text-2xl text-white/80 drop-shadow-sm max-w-2xl leading-relaxed px-4">
            MapleStory database for mobs and items. Based on GMS v.83
          </p>
        </>
      )}
    </div>
  );
};

export default HomePage;
