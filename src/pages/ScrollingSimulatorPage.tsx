import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import ScrollingSimulatorView from "../components/ScrollingSimulatorView";

const ScrollingSimulatorPage = () => {
  useEffect(() => {
    document.title = "Scrolling Simulator | MapleVault";
  }, []);

  return (
    <div className="space-y-2 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <Link
          to="/tools"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors w-fit"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Tools</span>
        </Link>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-4xl font-semibold mb-8 flex items-center gap-3 text-white">
            <span className="drop-shadow-[0_3px_0_rgba(0,0,0,0.3)]">
              Scrolling Simulator
            </span>
          </h2>
        </div>
      </div>

      <ScrollingSimulatorView />
    </div>
  );
};

export default ScrollingSimulatorPage;
