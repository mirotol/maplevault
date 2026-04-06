import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchItem } from "../api/mapleApi";
import { useSound } from "../context/SoundContext";
import type { ItemMeta } from "../types/maple";
import type { ScrollEffectHandle } from "./ScrollEffectCanvas";
import ScrollingActionBar from "./ScrollingActionBar";
import ScrollingItemDisplay from "./ScrollingItemDisplay";
import ScrollingItemSelector from "./ScrollingItemSelector";
import ScrollingLogPanel from "./ScrollingLogPanel";
import ScrollingScrollSelector from "./ScrollingScrollSelector";
import {
  type LogEntry,
  type Scroll,
  SIMULATOR_ITEMS,
  STAT_LABELS,
} from "./ScrollingSimulator.constants";
import ScrollingStatsPanel from "./ScrollingStatsPanel";

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
        <ScrollingItemSelector
          selectedItemId={selectedItemInfo.id}
          onSelectItem={setSelectedItemInfo}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT SIDE (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <ScrollingItemDisplay
                itemId={selectedItemInfo.id}
                itemName={selectedItemInfo.name}
                isBoomed={isBoomed}
                loading={loading}
                effectRef={effectRef}
              />

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
                <ScrollingStatsPanel
                  stats={currentStats}
                  slots={availableSlots}
                />
              </div>
            </div>

            <ScrollingScrollSelector
              selectedScroll={selectedScroll}
              onSelectScroll={setSelectedScroll}
              disabled={isBoomed || isAnimating}
            />

            <ScrollingActionBar
              onApply={
                isBoomed
                  ? () => setSelectedItemInfo({ ...selectedItemInfo })
                  : handleApplyScroll
              }
              onReset={() => setSelectedItemInfo({ ...selectedItemInfo })}
              isAnimating={isAnimating}
              isBoomed={isBoomed}
              selectedScrollName={selectedScroll?.name}
              canApply={!!selectedScroll && availableSlots > 0 && !isAnimating}
            />
          </div>

          {/* RIGHT SIDE (2/5) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ScrollingLogPanel logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollingSimulatorView;
