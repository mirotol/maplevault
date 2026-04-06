import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import ScrollingSimulatorView from "../components/ScrollingSimulatorView";

const ScrollingSimulatorPage = () => {
  useEffect(() => {
    document.title = "Scrolling Simulator | MapleVault";
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <Link
          to="/tools"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors w-fit"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Tools</span>
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold font-heading">
            Scrolling Simulator
          </h1>
          <p className="text-white/60 text-lg">
            Test your luck with scroll simulations.
          </p>
        </div>
      </div>

      <ScrollingSimulatorView />
    </div>
  );
};

export default ScrollingSimulatorPage;
