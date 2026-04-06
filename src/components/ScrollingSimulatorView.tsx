import { useRef } from "react";
import { useSound } from "../context/SoundContext";
import ScrollEffectCanvas, {
  type ScrollEffectHandle,
} from "./ScrollEffectCanvas";

const ScrollingSimulatorView = () => {
  const effectRef = useRef<ScrollEffectHandle>(null);
  const { playSound } = useSound();

  const handlePlayEffect = (type: "fail" | "success") => {
    effectRef.current?.play(type);
    if (type === "fail") {
      playSound("/sounds/scroll_fail.mp3");
    } else {
      playSound("/sounds/scroll_success.mp3");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-white/80">
        Scrolling Simulator
      </h2>

      {/* Test buttons */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => handlePlayEffect("fail")}
          className="px-6 py-3 bg-red-500 rounded-lg hover:bg-red-600 transition"
        >
          Fail
        </button>

        <button
          type="button"
          onClick={() => handlePlayEffect("success")}
          className="px-6 py-3 bg-green-500 rounded-lg hover:bg-green-600 transition"
        >
          Success
        </button>
      </div>

      <ScrollEffectCanvas ref={effectRef} />
    </div>
  );
};

export default ScrollingSimulatorView;
