import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type EffectType = "fail" | "success";

export type ScrollEffectHandle = {
  play: (type: EffectType) => void;
};

const EFFECTS: Record<
  EffectType,
  {
    sprite: string;
    frameWidth: number;
    frameHeight: number;
    columns: number;
    frameCount: number;
  }
> = {
  fail: {
    sprite: "/effects/scroll_failure.png",
    frameWidth: 200,
    frameHeight: 200,
    columns: 8,
    frameCount: 16,
  },
  success: {
    sprite: "/effects/scroll_success.png",
    frameWidth: 200,
    frameHeight: 200,
    columns: 8,
    frameCount: 21,
  },
};

const ScrollEffectCanvas = forwardRef<ScrollEffectHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  const canvasWidth = 200;
  const canvasHeight = 200;

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

    const { frameWidth, frameHeight, columns, frameCount } = effect;
    const ctx = canvasRef.current!.getContext("2d")!;
    let i = 0;

    // Calculate reference origin to center the animation visually on the item
    const targetX = canvasWidth / 2;
    const targetY = canvasHeight / 2;

    const playFrame = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const col = i % columns;
      const row = Math.floor(i / columns);

      ctx.drawImage(
        img,
        col * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        targetX - frameWidth / 2,
        targetY - frameHeight / 2,
        frameWidth,
        frameHeight,
      );

      i++;

      if (i < frameCount) {
        setTimeout(playFrame, 50); // Delay between frames
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
