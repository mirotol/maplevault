import { Map as MapIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getMapMinimapUrl } from "../api/mapleApi";

interface MapCardProps {
  id: number;
  name: string;
  streetName: string;
}

const MapCard = ({ id, name, streetName }: MapCardProps) => {
  const [imageError, setImageError] = useState(false);
  const minimapUrl = getMapMinimapUrl(id);

  return (
    <Link
      to={`/maps/${id}`}
      className="group bg-(--color-card-bg) border border-(--color-card-border) rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className="aspect-[4/3] bg-black/5 relative flex items-center justify-center p-4 overflow-hidden">
        {!imageError ? (
          <img
            src={minimapUrl}
            alt={name}
            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
            style={{ imageRendering: "pixelated" }}
            loading="lazy"
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-(--color-card-text)/30">
            <MapIcon size={48} className="mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">
              No Minimap
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs font-bold text-(--color-accent) uppercase tracking-wider mb-1">
          {streetName}
        </div>
        <h3 className="text-lg font-bold text-(--color-card-text) leading-tight mb-2 group-hover:text-(--color-accent) transition-colors">
          {name}
        </h3>
        <div className="mt-auto text-xs text-(--color-text)/60 font-mono">
          ID: {id}
        </div>
      </div>
    </Link>
  );
};

export default MapCard;
