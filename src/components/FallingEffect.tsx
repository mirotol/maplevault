import { useMemo, useState } from "react";

interface FallingEffectProps {
  image: string;
  count?: number;
  minSize?: number;
  maxSize?: number;
  minDuration?: number;
  maxDuration?: number;
}

const FallingLeaf = ({ leaf, image }: { leaf: any; image: string }) => {
  const [offset, setOffset] = useState(0);

  const handleJump = (e: React.MouseEvent | React.TouchEvent) => {
    // Stop propagation to avoid any parent click events
    e.stopPropagation();
    
    // Every jump adds to the current offset, keeping the new position
    setOffset((prev) => prev - 60);
  };

  return (
    <div
      className="falling-image-wrapper"
      onClick={handleJump}
      onTouchStart={handleJump}
      style={
        {
          left: leaf.left,
          animationDuration: `${leaf.duration}s`,
          animationDelay: `${leaf.delay}s`,
          transform: `translateY(${offset}px)`,
          // Fast jump up, no return transition needed anymore
          transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        } as React.CSSProperties
      }
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
  const leaves = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * (maxSize - minSize) + minSize,
      duration: Math.random() * (maxDuration - minDuration) + minDuration,
      delay: Math.random() * -maxDuration, // Negative delay to start mid-animation
      swayDuration: Math.random() * 4 + 3, // 3s to 7s
      swayAmount: Math.random() * 100 + 50, // 50px to 150px
      rotation: Math.random() * 360, // Initial random rotation
    }));
  }, [count, minSize, maxSize, minDuration, maxDuration]);

  return (
    <div className="falling-container">
      {leaves.map((leaf) => (
        <FallingLeaf key={leaf.id} leaf={leaf} image={image} />
      ))}
    </div>
  );
};

export default FallingEffect;
