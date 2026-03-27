import { useEffect, useRef, useState } from "react";
import type { WorldMapData, WorldMapNode } from "../types/maple";

const NODE_ICONS: Record<number, string> = {
  0: "/worldmap/nodes/node_0.png",
  1: "/worldmap/nodes/node_1.png",
  2: "/worldmap/nodes/node_2.png",
  3: "/worldmap/nodes/node_3.png",
};

const MAP_SCALE = 1.5; // Zoom scale factor

export default function WorldMapViewer() {
  const [maps, setMaps] = useState<WorldMapData[]>([]);
  const [currentMap, setCurrentMap] = useState<WorldMapData | null>(null);

  const [history, setHistory] = useState<WorldMapData[]>([]);

  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<WorldMapNode | null>(null);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const linkRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    fetch("/worldmap.json")
      .then((res) => res.json())
      .then((data: WorldMapData[]) => {
        setMaps(data);

        const root = data.find((m) => m.Name === "WorldMap");
        setCurrentMap(root || data[0]);
      });
  }, []);

  // ─────────────────────────────────────────────
  // Pixel-perfect hit detection
  // ─────────────────────────────────────────────
  const checkPixelHit = (img: HTMLImageElement, x: number, y: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    ctx.drawImage(img, 0, 0);
    const pixel = ctx.getImageData(x, y, 1, 1).data;

    return pixel[3] > 10;
  };

  // ─────────────────────────────────────────────
  // Mouse handling
  // ─────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!currentMap) return;

    const rect = e.currentTarget.getBoundingClientRect();

    // Map screen coordinates back to unscaled 800x600 coordinates
    const mapMouseX = (e.clientX - rect.left - rect.width / 2) / MAP_SCALE;
    const mapMouseY = (e.clientY - rect.top - rect.height / 2) / MAP_SCALE;

    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    // NODE hover
    const NODE_RADIUS = 12;
    let foundNode: WorldMapNode | null = null;

    for (const node of currentMap.Maps) {
      const dx = mapMouseX - node.X;
      const dy = mapMouseY - node.Y;

      if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) {
        foundNode = node;
        break;
      }
    }

    setHoveredNode(foundNode);

    // LINK hover
    let foundLink: number | null = null;

    for (let i = 0; i < currentMap.Links.length; i++) {
      const link = currentMap.Links[i];
      const btn = linkRefs.current[i];
      const img = btn?.querySelector("img");

      if (!img || !link.Image) continue;

      const localX = mapMouseX + link.OriginX;
      const localY = mapMouseY + link.OriginY;

      if (
        localX >= 0 &&
        localY >= 0 &&
        localX < img.width &&
        localY < img.height &&
        checkPixelHit(img, localX, localY)
      ) {
        foundLink = i;
        break;
      }
    }

    setHoveredLink(foundLink);
  };

  const handleBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;

      const newHistory = [...prev];
      const last = newHistory.pop();

      if (last) setCurrentMap(last);

      return newHistory;
    });
  };

  if (!currentMap) return <div>Loading...</div>;

  return (
    <div
      role="application"
      className="worldmap-viewer"
      style={{
        width: 800 * MAP_SCALE,
        height: 600 * MAP_SCALE,
      }}
      onMouseMove={handleMouseMove}
    >
      <div
        style={{
          transform: `scale(${MAP_SCALE})`,
          transformOrigin: "top left",
          width: 800,
          height: 600,
          position: "relative",
        }}
      >
        {/* BASE MAP */}
        {currentMap.BaseImage && (
          <img
            src={`/worldmap/images/${currentMap.BaseImage}`}
            alt="map"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          />
        )}

        {/* FLIGHT PATHS */}
        {hoveredNode?.Paths?.map((path) => (
          <img
            key={path.Image}
            src={`/worldmap/images/${path.Image}`}
            alt=""
            className="absolute z-10 pointer-events-none"
            style={{
              left: `calc(50% + ${-path.OriginX}px)`,
              top: `calc(50% + ${-path.OriginY}px)`,
            }}
          />
        ))}

        {/* HIGHLIGHTS (PIXEL-PERFECT CLICK FIXED) */}
        {currentMap.Links.map((link, i) => (
          <button
            key={`${link.Image}_${link.Target}_${link.OriginX}_${link.OriginY}`}
            type="button"
            ref={(el) => {
              linkRefs.current[i] = el;
            }}
            onClick={(e) => {
              const btn = linkRefs.current[i];
              const img = btn?.querySelector("img");

              if (!img || !link.Image) return;

              const rect =
                e.currentTarget.parentElement!.getBoundingClientRect();

              // Map screen coordinates back to unscaled 800x600 coordinates
              const mapMouseX =
                (e.clientX - rect.left - rect.width / 2) / MAP_SCALE;
              const mapMouseY =
                (e.clientY - rect.top - rect.height / 2) / MAP_SCALE;

              const localX = mapMouseX + link.OriginX;
              const localY = mapMouseY + link.OriginY;

              if (
                localX < 0 ||
                localY < 0 ||
                localX >= img.width ||
                localY >= img.height ||
                !checkPixelHit(img, localX, localY)
              ) {
                return; // ignore transparent clicks (region not highlighted)
              }

              if (!link.Target) return;

              const next = maps.find((m) => m.Name === link.Target);
              if (!next) return;

              setHistory((prev) => [...prev, currentMap]);
              setCurrentMap(next);
            }}
            className={`absolute border-none bg-transparent p-0 ${hoveredLink === i ? "opacity-100" : "opacity-0"}`}
            style={{
              left: `calc(50% + ${-link.OriginX}px)`,
              top: `calc(50% + ${-link.OriginY}px)`,
            }}
          >
            <img src={`/worldmap/images/${link.Image}`} alt="" />
          </button>
        ))}

        {/* NODES */}
        {currentMap.Maps.map((node) => {
          const icon = NODE_ICONS[node.Type] || NODE_ICONS[0];

          return (
            <button
              key={node.MapId}
              type="button"
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => {
                if (!currentMap) return;

                // find matching link using SAME pixel logic
                for (let i = 0; i < currentMap.Links.length; i++) {
                  const link = currentMap.Links[i];
                  const btn = linkRefs.current[i];
                  const img = btn?.querySelector("img");

                  if (!img || !link.Image) continue;

                  const localX = node.X + link.OriginX;
                  const localY = node.Y + link.OriginY;

                  if (
                    localX >= 0 &&
                    localY >= 0 &&
                    localX < img.width &&
                    localY < img.height &&
                    checkPixelHit(img, localX, localY)
                  ) {
                    if (!link.Target) return;

                    const next = maps.find((m) => m.Name === link.Target);
                    if (!next) return;

                    setHistory((prev) => [...prev, currentMap]);
                    setCurrentMap(next);
                    return;
                  }
                }
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 border-none bg-transparent p-0 z-20"
              style={{
                left: `calc(50% + ${node.X}px)`,
                top: `calc(50% + ${node.Y}px)`,
              }}
            >
              <img src={icon} alt="" width={16} height={16} />
            </button>
          );
        })}
      </div>

      {/* UI OVERLAYS (UNSCALED) */}
      {/* BACK BUTTON */}
      {history.length > 0 && (
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-2.5 left-2.5 z-1000"
        >
          ← Back
        </button>
      )}

      {/* TOOLTIP */}
      {hoveredNode && (
        <div
          className="worldmap-tooltip"
          style={{
            left: mouse.x + 14,
            top: mouse.y + 14,
          }}
        >
          {hoveredNode.StreetName && (
            <div className="text-[12px] opacity-70">
              {hoveredNode.StreetName}
            </div>
          )}

          <div className="font-bold">
            {hoveredNode.MapName ?? `Map ${hoveredNode.MapId}`}
          </div>

          {hoveredNode.Description && (
            <div className="mt-1 opacity-85">{hoveredNode.Description}</div>
          )}
        </div>
      )}
    </div>
  );
}
