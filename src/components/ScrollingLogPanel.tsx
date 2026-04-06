import { History } from "lucide-react";
import type { LogEntry } from "./ScrollingSimulator.constants";

interface ScrollingLogPanelProps {
  logs: LogEntry[];
}

const ScrollingLogPanel = ({ logs }: ScrollingLogPanelProps) => {
  return (
    <div className="flex-1 min-h-[450px] rounded-3xl bg-black/20 border border-white/10 flex flex-col overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <History className="w-4 h-4 text-orange-400" />
          </div>
          <h3 className="font-bold text-white tracking-tight">Scroll Log</h3>
        </div>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
          {logs.length} attempts
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2 animate-in slide-in-from-top-4 duration-500"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                {log.scrollName} Scroll
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  log.result === "SUCCESS"
                    ? "bg-green-500/20 text-green-400 border border-green-500/20"
                    : log.result === "FAIL"
                      ? "bg-red-500/20 text-red-400 border border-red-500/20"
                      : "bg-black text-red-600 border border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]"
                }`}
              >
                {log.result}
              </span>
            </div>
            <p
              className={`text-sm font-bold tracking-tight leading-snug ${
                log.result === "SUCCESS" ? "text-green-200" : "text-white/60"
              }`}
            >
              {log.statChanges}
            </p>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full opacity-30">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <History className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">
              No attempts yet.
              <br />
              Choose a scroll to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollingLogPanel;
