import { Hammer } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const ToolsPage = () => {
  useEffect(() => {
    document.title = "Tools | MapleVault";
  }, []);

  const tools = [
    {
      title: "Scrolling Simulator",
      description: "Test your luck with scroll simulations.",
      icon: <Hammer className="w-8 h-8 text-orange-400" />,
      to: "/tools/scrolling-simulator",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-heading">Tools</h1>
        <p className="text-white/60 text-lg">
          Useful utilities and simulators for MapleVault.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {tool.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">{tool.title}</h2>
              <p className="text-white/50 text-sm">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ToolsPage;
