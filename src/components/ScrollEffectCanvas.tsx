import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type EffectType = "fail" | "success";

export type ScrollEffectHandle = {
  play: (type: EffectType) => void;
};

const FRAME_WIDTH = 96;
const FRAME_HEIGHT = 122;

const EFFECTS = {
  fail: {
    sprite: "/effects/scroll_failure.png",
    frames: [
      { originX: 16, originY: 130, delay: 50 },
      { originX: 16, originY: 130, delay: 50 },
      { originX: 16, originY: 130, delay: 50 },
      { originX: 20, originY: 141, delay: 50 },
      { originX: 24, originY: 154, delay: 50 },
      { originX: 20, originY: 155, delay: 50 },
      { originX: 24, originY: 154, delay: 50 },
      { originX: 31, originY: 153, delay: 50 },
      { originX: 35, originY: 153, delay: 50 },
      { originX: 42, originY: 151, delay: 50 },
      { originX: 42, originY: 148, delay: 50 },
      { originX: 45, originY: 139, delay: 50 },
      { originX: 44, originY: 132, delay: 50 },
      { originX: 43, originY: 123, delay: 50 },
      { originX: 62, originY: 108, delay: 50 },
      { originX: 62, originY: 108, delay: 50 },
    ],
  },

  // placeholder for later
  success: {
    sprite: "/effects/scroll_success.png",
    frames: [], // add later
  },
};

const ScrollEffectCanvas = forwardRef<ScrollEffectHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  const canvasWidth = 300;
  const canvasHeight = 300;

  // Preload all effect images once
  useEffect(() => {
    Object.entries(EFFECTS).forEach(([key, effect]) => {
      const img = new Image();
      img.src = effect.sprite;
      imagesRef.current[key] = img;
    });
  }, []);

  const play = (type: EffectType) => {
    const effect = EFFECTS[type];
    const img = imagesRef.current[type];

    if (!effect || !img) return;

    const ctx = canvasRef.current!.getContext("2d")!;
    let i = 0;

    const targetX = canvasWidth / 2;
    const targetY = canvasHeight / 2;

    const playFrame = () => {
      const frame = effect.frames[i];
      if (!frame) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.drawImage(
        img,
        i * FRAME_WIDTH,
        0,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        targetX - frame.originX,
        targetY - frame.originY,
        FRAME_WIDTH,
        FRAME_HEIGHT,
      );

      i++;

      if (i < effect.frames.length) {
        setTimeout(playFrame, frame.delay);
      } else {
        setTimeout(() => {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        }, 100);
      }
    };

    if (!img.complete) {
      img.onload = playFrame;
    } else {
      playFrame();
    }
  };

  useImperativeHandle(ref, () => ({
    play,
  }));

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{ imageRendering: "pixelated" }}
    />
  );
});

export default ScrollEffectCanvas;
