import {
  AlertTriangle,
  Hammer,
  History,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchItem, fetchItemIcon } from "../api/mapleApi";
import { useSound } from "../context/SoundContext";
import type { ItemMeta } from "../types/maple";
import ScrollEffectCanvas, {
  type ScrollEffectHandle,
} from "./ScrollEffectCanvas";
import { Skeleton } from "./Skeleton";

const SIMULATOR_ITEMS = [
  { id: 1082002, name: "Work Gloves", defaultSlots: 5 },
  { id: 1082149, name: "Brown Work Gloves", defaultSlots: 5 },
  { id: 1082223, name: "Stormcaster Gloves", defaultSlots: 5 },
  { id: 1002357, name: "Zakum Helmet", defaultSlots: 10 },
  { id: 1102041, name: "Pink Adventurer Cape", defaultSlots: 5 },
  { id: 1072344, name: "Facestompers", defaultSlots: 5 },
  { id: 1122000, name: "Horntail Necklace", defaultSlots: 3 },
];

type Scroll = {
  name: string;
  successRate: number;
  boomRate: number;
  stats: Partial<ItemMeta>;
  isChaos?: boolean;
  isCleanSlate?: boolean;
  color: string;
};

const SCROLLS: Scroll[] = [
  {
    name: "100%",
    successRate: 1.0,
    boomRate: 0,
    stats: {
      incPAD: 1,
      incMAD: 1,
      incSTR: 1,
      incDEX: 1,
      incINT: 1,
      incLUK: 1,
    },
    color: "bg-blue-500/20",
  },
  {
    name: "70%",
    successRate: 0.7,
    boomRate: 0.15,
    stats: {
      incPAD: 2,
      incMAD: 2,
      incSTR: 2,
      incDEX: 2,
      incINT: 2,
      incLUK: 2,
    },
    color: "bg-green-500/20",
  },
  {
    name: "60%",
    successRate: 0.6,
    boomRate: 0,
    stats: {
      incPAD: 2,
      incMAD: 2,
      incSTR: 2,
      incDEX: 2,
      incINT: 2,
      incLUK: 2,
    },
    color: "bg-yellow-500/20",
  },
  {
    name: "30%",
    successRate: 0.3,
    boomRate: 0.5,
    stats: {
      incPAD: 3,
      incMAD: 3,
      incSTR: 3,
      incDEX: 3,
      incINT: 3,
      incLUK: 3,
    },
    color: "bg-orange-500/20",
  },
  {
    name: "10%",
    successRate: 0.1,
    boomRate: 0.5,
    stats: {
      incPAD: 5,
      incMAD: 5,
      incSTR: 5,
      incDEX: 5,
      incINT: 5,
      incLUK: 5,
    },
    color: "bg-red-500/20",
  },
  {
    name: "Chaos",
    isChaos: true,
    successRate: 0.6,
    boomRate: 0,
    stats: {},
    color: "bg-purple-500/20",
  },
  {
    name: "Clean Slate",
    isCleanSlate: true,
    successRate: 0.1,
    boomRate: 0.1,
    stats: {},
    color: "bg-slate-500/20",
  },
];

type LogEntry = {
  id: number;
  scrollName: string;
  result: "SUCCESS" | "FAIL" | "BOOM";
  statChanges: string;
  timestamp: Date;
};

const STAT_LABELS: Partial<Record<keyof ItemMeta, string>> = {
  incSTR: "STR",
  incDEX: "DEX",
  incINT: "INT",
  incLUK: "LUK",
  incPAD: "Weapon Attack",
  incMAD: "Magic Attack",
  incPDD: "Weapon Defense",
  incMDD: "Magic Defense",
  incACC: "Accuracy",
  incEVA: "Evasion",
  incSpeed: "Speed",
  incJump: "Jump",
  incMHP: "HP",
  incMMP: "MP",
};

const StatsPanel = ({
  stats,
  slots,
}: {
  stats: ItemMeta | null;
  slots: number;
}) => {
  if (!stats) return null;

  const displayStats = Object.entries(STAT_LABELS)
    .map(([key, label]) => ({
      label,
      value: stats[key as keyof ItemMeta] as number | undefined,
    }))
    .filter((s) => s.value !== undefined && s.value !== 0);

  return (
    <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <span className="text-orange-200 font-bold uppercase text-xs tracking-wider">
          Attributes
        </span>
        <span className="text-sm font-bold text-white bg-orange-600/50 px-2 py-0.5 rounded">
          Slots: {slots}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {displayStats.map((s) => (
          <div key={s.label} className="flex justify-between text-sm">
            <span className="text-white/50">{s.label}</span>
            <span className="text-white font-medium">
              {s.value! > 0 ? "+" : ""}
              {s.value}
            </span>
          </div>
        ))}
        {displayStats.length === 0 && (
          <span className="col-span-2 text-white/30 text-center py-2 italic text-xs">
            No bonus stats
          </span>
        )}
      </div>
    </div>
  );
};

const ScrollingSimulatorView = () => {
  const [selectedItemInfo, setSelectedItemInfo] = useState(SIMULATOR_ITEMS[0]);
  const [currentStats, setCurrentStats] = useState<ItemMeta | null>(null);
  const [availableSlots, setAvailableSlots] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedScroll, setSelectedScroll] = useState<Scroll | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBoomed, setIsBoomed] = useState(false);
  const [loading, setLoading] = useState(true);

  const effectRef = useRef<ScrollEffectHandle>(null);
  const { playSound } = useSound();

  // Reset/Initial load
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setIsBoomed(false);
    setLogs([]);
    setSelectedScroll(null);

    fetchItem(selectedItemInfo.id).then((item) => {
      if (isMounted && item) {
        setCurrentStats({ ...item.metaInfo });
        setAvailableSlots(item.metaInfo?.tuc ?? selectedItemInfo.defaultSlots);
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedItemInfo]);

  const handleApplyScroll = () => {
    if (!selectedScroll || isAnimating || availableSlots <= 0 || isBoomed)
      return;

    setIsAnimating(true);
    const roll = Math.random();
    let result: "SUCCESS" | "FAIL" | "BOOM" = "FAIL";

    if (roll < selectedScroll.successRate) {
      result = "SUCCESS";
    } else if (roll < selectedScroll.successRate + selectedScroll.boomRate) {
      result = "BOOM";
    }

    // Play animation after a short delay
    setTimeout(() => {
      if (result === "SUCCESS") {
        effectRef.current?.play("success");
        playSound("/sounds/scroll_success.mp3");
      } else {
        effectRef.current?.play("fail");
        playSound("/sounds/scroll_fail.mp3");
      }

      // Update state after animation finishes
      setTimeout(() => {
        let statChangesStr = "";
        if (result === "SUCCESS") {
          if (selectedScroll.isChaos) {
            const newStats = { ...currentStats };
            const changes: string[] = [];
            for (const key of Object.keys(STAT_LABELS)) {
              const currentVal = newStats[key as keyof ItemMeta] as
                | number
                | undefined;
              if (typeof currentVal === "number" && currentVal !== 0) {
                const delta = Math.floor(Math.random() * 11) - 5;
                if (delta !== 0) {
                  (newStats[key as keyof ItemMeta] as number) += delta;
                  changes.push(
                    `${STAT_LABELS[key as keyof ItemMeta]} ${
                      delta > 0 ? "+" : ""
                    }${delta}`,
                  );
                }
              }
            }
            setCurrentStats(newStats);
            statChangesStr = changes.join(", ") || "No change";
          } else if (selectedScroll.isCleanSlate) {
            setAvailableSlots((prev) => prev + 1);
            statChangesStr = "+1 Slot";
          } else {
            const newStats = { ...currentStats };
            const changes: string[] = [];
            for (const [key, val] of Object.entries(selectedScroll.stats)) {
              if (typeof val === "number") {
                (newStats[key as keyof ItemMeta] as number) =
                  ((newStats[key as keyof ItemMeta] as number) || 0) + val;
                changes.push(`${STAT_LABELS[key as keyof ItemMeta]} +${val}`);
              }
            }
            setCurrentStats(newStats);
            statChangesStr = changes.join(", ");
          }
          if (!selectedScroll.isCleanSlate) {
            setAvailableSlots((prev) => prev - 1);
          }
        } else if (result === "FAIL") {
          if (!selectedScroll.isCleanSlate) {
            setAvailableSlots((prev) => prev - 1);
          }
          statChangesStr = "Slot lost";
        } else if (result === "BOOM") {
          setIsBoomed(true);
          statChangesStr = "Item destroyed";
        }

        setLogs((prev) => [
          {
            id: Date.now(),
            scrollName: selectedScroll.name,
            result,
            statChanges: statChangesStr,
            timestamp: new Date(),
          },
          ...prev,
        ]);

        setIsAnimating(false);
      }, 1000);
    }, 100);
  };

  return (
    <div className="card-equipment-bg border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
      {/* Background subtle decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-8">
        {/* Item Selector Row */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest px-1">
            Select Equipment
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 custom-scrollbar">
            {SIMULATOR_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItemInfo(item)}
                className={`relative p-3 rounded-2xl border-2 transition-all shrink-0 bg-white/5 hover:bg-white/10 group ${
                  selectedItemInfo.id === item.id
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-white/5"
                }`}
              >
                <img
                  src={fetchItemIcon(item.id)}
                  alt={item.name}
                  className={`w-12 h-12 object-contain transition-transform duration-300 ${
                    selectedItemInfo.id === item.id
                      ? "scale-110"
                      : "opacity-60 group-hover:opacity-100"
                  }`}
                  style={{ imageRendering: "pixelated" }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT SIDE (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Compact Item Display */}
              <div className="relative w-full md:w-64 aspect-square rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden bg-black/20 shrink-0">
                {isBoomed ? (
                  <div className="flex flex-col items-center gap-3 text-center animate-in zoom-in duration-500 px-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                      <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Destroyed
                      </h3>
                      <p className="text-white/40 text-xs">Unlucky!</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative group flex items-center justify-center">
                    {loading ? (
                      <Skeleton className="w-32 h-32 rounded-3xl" />
                    ) : (
                      <img
                        src={fetchItemIcon(selectedItemInfo.id)}
                        alt={selectedItemInfo.name}
                        className="w-32 h-32 object-contain scale-125 group-hover:scale-135 transition-transform duration-700"
                        style={{ imageRendering: "pixelated" }}
                      />
                    )}
                    {/* Effect Canvas on top */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <ScrollEffectCanvas ref={effectRef} />
                    </div>
                  </div>
                )}
              </div>

              {/* Item Info and Stats Area */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {selectedItemInfo.name}
                  </h3>
                  {availableSlots === 0 && !isBoomed && (
                    <div className="flex items-center gap-1.5 text-yellow-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Fully Upgraded
                      </span>
                    </div>
                  )}
                </div>
                <StatsPanel stats={currentStats} slots={availableSlots} />
              </div>
            </div>

            {/* Choose Scroll Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.15em] px-1">
                Choose Scroll
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {SCROLLS.map((scroll) => (
                  <button
                    key={scroll.name}
                    type="button"
                    disabled={isBoomed || isAnimating}
                    onClick={() => setSelectedScroll(scroll)}
                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 group relative overflow-hidden ${
                      selectedScroll?.name === scroll.name
                        ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500 shadow-lg shadow-orange-900/20"
                        : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 ${scroll.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                    <Sparkles
                      className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${
                        selectedScroll?.name === scroll.name
                          ? "text-orange-400"
                          : "text-white/40"
                      }`}
                    />
                    <span className="text-xs font-bold text-white tracking-tight">
                      {scroll.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Area */}
            <div className="flex gap-4">
              <button
                type="button"
                disabled={
                  (!selectedScroll || availableSlots <= 0 || isAnimating) &&
                  !isBoomed
                }
                onClick={
                  isBoomed
                    ? () => setSelectedItemInfo({ ...selectedItemInfo })
                    : handleApplyScroll
                }
                className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl ${
                  isBoomed
                    ? "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/40 active:scale-[0.98]"
                    : !selectedScroll || availableSlots <= 0 || isAnimating
                      ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-900/40 active:scale-[0.98] active:brightness-110"
                }`}
              >
                {isAnimating ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Applying...</span>
                  </div>
                ) : isBoomed ? (
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-6 h-6" />
                    <span>Try Again</span>
                  </div>
                ) : (
                  <>
                    <Hammer className="w-6 h-6" />{" "}
                    <span>Apply {selectedScroll?.name || "Scroll"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedItemInfo({ ...selectedItemInfo })}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-[0.95] group"
                title="Reset Item"
              >
                <RotateCcw className="w-6 h-6 group-hover:rotate-[-45deg] transition-transform" />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE (2/5) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Scroll Log Panel */}
            <div className="flex-1 min-h-[450px] rounded-3xl bg-black/20 border border-white/10 flex flex-col overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <History className="w-4 h-4 text-orange-400" />
                  </div>
                  <h3 className="font-bold text-white tracking-tight">
                    Scroll Log
                  </h3>
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
                        log.result === "SUCCESS"
                          ? "text-green-200"
                          : "text-white/60"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollingSimulatorView;
