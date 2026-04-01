import { ImageOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchItemIcon } from "../api/mapleApi";

interface DropBadgeProps {
  itemId: number;
  itemName: string;
  itemType?: string;
}

export const DropBadge = ({ itemId, itemName, itemType }: DropBadgeProps) => {
  const [imageError, setImageError] = useState(false);
  const iconUrl = fetchItemIcon(itemId);

  const linkPath =
    itemType === "Equip" ? `/equipment/${itemId}` : `/items/${itemId}`;

  return (
    <Link
      to={linkPath}
      className="group flex items-center gap-3 px-3.5 py-2 bg-(--color-card-bg)/60 border border-(--color-card-border)/50 rounded-[10px] transition-all hover:bg-(--color-location-hover-bg) shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(0,0,0,0.08)]"
      title={`${itemName} (ID: ${itemId})`}
    >
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        {imageError ? (
          <ImageOff className="w-5 h-5 opacity-20" />
        ) : (
          <img
            src={iconUrl}
            alt={itemName}
            className="max-w-full max-h-full object-contain"
            onError={() => setImageError(true)}
            style={{ imageRendering: "pixelated" }}
          />
        )}
      </div>
      <div className="min-w-0">
        <div className="text-base font-semibold text-(--color-card-text) leading-tight group-hover:text-(--color-accent) transition-colors">
          {itemName}
        </div>
      </div>
    </Link>
  );
};
