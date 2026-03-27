import { useEffect, useRef, useState } from "react";
import type { WorldMapData, WorldMapNode } from "../types/maple";

const NODE_ICONS: Record<number, string> = {
  0: "/worldmap/nodes/node_0.png",
  1: "/worldmap/nodes/node_1.png",
  2: "/worldmap/nodes/node_2.png",
  3: "/worldmap/nodes/node_3.png",
};

export default function WorldMapViewer() {
  const [maps, setMaps] = useState<WorldMapData[]>([]);
  const [currentMap, setCurrentMap] = useState<WorldMapData | null>(null);

  const [history, setHistory] = useState<WorldMapData[]>([]);

  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<WorldMapNode | null>(null);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const linkRefs = useRef<(HTMLImageElement | null)[]>([]);

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

    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    // ── NODE HOVER
    const NODE_RADIUS = 12;
    let foundNode: WorldMapNode | null = null;

    for (const node of currentMap.Maps) {
      const dx = mouseX - node.X;
      const dy = mouseY - node.Y;

      if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) {
        foundNode = node;
        break;
      }
    }

    setHoveredNode(foundNode);

    // ── LINK HOVER (ALWAYS RUN)
    let foundLink: number | null = null;

    for (let i = 0; i < currentMap.Links.length; i++) {
      const link = currentMap.Links[i];
      const img = linkRefs.current[i];

      if (!img || !link.Image) continue;

      const localX = mouseX + link.OriginX;
      const localY = mouseY + link.OriginY;

      if (
        localX >= 0 &&
        localY >= 0 &&
        localX < img.width &&
        localY < img.height
      ) {
        if (checkPixelHit(img, localX, localY)) {
          foundLink = i;
          break;
        }
      }
    }

    setHoveredLink(foundLink);
  };

  // ─────────────────────────────────────────────
  // Navigation (forward)
  // ─────────────────────────────────────────────
  const handleClick = () => {
    if (hoveredLink === null || !currentMap) return;

    const link = currentMap.Links[hoveredLink];
    if (!link.Target) return;

    const next = maps.find((m) => m.Name === link.Target);
    if (!next) return;

    setHistory((prev) => [...prev, currentMap]);
    setCurrentMap(next);
  };

  // ─────────────────────────────────────────────
  // Navigation (back)
  // ─────────────────────────────────────────────
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
      style={{
        position: "relative",
        width: "800px",
        height: "600px",
        border: "1px solid #333",
        overflow: "hidden",
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* BACK BUTTON */}
      {history.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleBack();
          }}
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 1000,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            border: "1px solid #555",
            padding: "6px 10px",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      )}

      {/* MAP NAME */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          color: "white",
          background: "rgba(0,0,0,0.6)",
          padding: "4px 8px",
          borderRadius: 4,
          zIndex: 1000,
        }}
      >
        {currentMap.Name}
      </div>

      {/* BASE MAP */}
      {currentMap.BaseImage && (
        <img
          src={`/worldmap/images/${currentMap.BaseImage}`}
          alt="map"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* 🔵 FLIGHT PATHS */}
      {hoveredNode?.Paths?.map((path, i) => {
        if (!path.Image) return null;

        return (
          <img
            key={i}
            src={`/worldmap/images/${path.Image}`}
            alt="path"
            style={{
              position: "absolute",
              left: `calc(50% + ${-path.OriginX}px)`,
              top: `calc(50% + ${-path.OriginY}px)`,
              pointerEvents: "none",
              zIndex: 6 + path.Z,
              opacity: 1,
            }}
          />
        );
      })}

      {/* HIGHLIGHTS */}
      {currentMap.Links.map((link, i) => {
        if (!link.Image) return null;

        return (
          <img
            key={i}
            ref={(el) => {
              linkRefs.current[i] = el;
            }}
            src={`/worldmap/images/${link.Image}`}
            alt="highlight"
            style={{
              position: "absolute",
              left: `calc(50% + ${-link.OriginX}px)`,
              top: `calc(50% + ${-link.OriginY}px)`,
              opacity: hoveredLink === i ? (hoveredNode ? 0.8 : 1) : 0,
              pointerEvents: "none",
              zIndex: 5 + link.Z,
              transition: "opacity 0.15s ease",
            }}
          />
        );
      })}

      {/* TOOLTIP */}
      {hoveredNode && (
        <div
          style={{
            position: "absolute",
            left: mouse.x + 14,
            top: mouse.y + 14,
            background: "rgba(20, 20, 30, 0.95)",
            color: "white",
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: 12,
            maxWidth: 220,
            lineHeight: 1.4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            pointerEvents: "none",
            zIndex: 999,
          }}
        >
          {hoveredNode.StreetName && (
            <div style={{ fontSize: 10, opacity: 0.7 }}>
              {hoveredNode.StreetName}
            </div>
          )}

          <div style={{ fontWeight: "bold" }}>
            {hoveredNode.MapName ?? `Map ${hoveredNode.MapId}`}
          </div>

          {hoveredNode.Description && (
            <div style={{ marginTop: 4, opacity: 0.85 }}>
              {hoveredNode.Description}
            </div>
          )}
        </div>
      )}

      {/* NODES */}
      {currentMap.Maps.map((node, i) => {
        const icon = NODE_ICONS[node.Type] || NODE_ICONS[0];

        return (
          <img
            key={i}
            src={icon}
            alt="node"
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              position: "absolute",
              left: `calc(50% + ${node.X}px)`,
              top: `calc(50% + ${node.Y}px)`,
              transform: "translate(-50%, -50%)",
              width: 16,
              height: 16,
              zIndex: 20,
              cursor: "pointer",
            }}
          />
        );
      })}
    </div>
  );
}
