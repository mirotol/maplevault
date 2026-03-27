import { useMemo, useState } from "react";

type Leaf = {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  swayDuration: number;
  swayAmount: number;
  rotation: number;
};

interface FallingEffectProps {
  image: string;
  count?: number;
  minSize?: number;
  maxSize?: number;
  minDuration?: number;
  maxDuration?: number;
}

const FallingLeaf = ({ leaf, image }: { leaf: Leaf; image: string }) => {
  const [offset, setOffset] = useState(0);

  const handleJump = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setOffset((prev) => prev - 60);
  };

  return (
    <div
      className="falling-image-wrapper"
      onClick={handleJump}
      onTouchStart={handleJump}
      role="presentation"
      aria-hidden="true"
      style={{
        left: leaf.left,
        animationDuration: `${leaf.duration}s`,
        animationDelay: `${leaf.delay}s`,
        transform: `translateY(${offset}px)`,
        transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <img
        src={image}
        alt=""
        className="falling-image"
        style={
          {
            width: `${leaf.size}px`,
            height: "auto",
            animationDuration: `${leaf.swayDuration}s`,
            "--sway-amount": `${leaf.swayAmount}px`,
            transform: `rotate(${leaf.rotation}deg)`,
            imageRendering: "pixelated",
          } as React.CSSProperties
        }
      />
    </div>
  );
};

const FallingEffect = ({
  image,
  count = 10,
  minSize = 20,
  maxSize = 40,
  minDuration = 8,
  maxDuration = 20,
}: FallingEffectProps) => {
  const leaves = useMemo((): Leaf[] => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * (maxSize - minSize) + minSize,
      duration: Math.random() * (maxDuration - minDuration) + minDuration,
      delay: Math.random() * -maxDuration,
      swayDuration: Math.random() * 4 + 3,
      swayAmount: Math.random() * 100 + 50,
      rotation: Math.random() * 360,
    }));
  }, [count, minSize, maxSize, minDuration, maxDuration]);

  return (
    <div className="falling-container" aria-hidden="true">
      {leaves.map((leaf) => (
        <FallingLeaf key={leaf.id} leaf={leaf} image={image} />
      ))}
    </div>
  );
};

export default FallingEffect;
