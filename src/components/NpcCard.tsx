import { User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { fetchNpcIcon } from "../api/mapleApi";
import { npcLookupJson } from "../data/staticData";

interface NpcCardProps {
  id: number;
  name: string;
}

const NpcCard = ({ id, name }: NpcCardProps) => {
  const [imageError, setImageError] = useState(false);
  const iconUrl = fetchNpcIcon(id);

  const placements = npcLookupJson.npcs[id.toString()] || [];
  const firstPlacement = placements[0];
  const remainingCount = placements.length - 1;

  return (
    <Link
      to={`/npcs/${id}`}
      className="group bg-(--color-card-bg) border border-(--color-card-border) rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className="aspect-square bg-black/5 relative flex items-center justify-center p-4 overflow-hidden">
        {!imageError ? (
          <img
            src={iconUrl}
            alt={name}
            className="max-w-20 max-h-20 object-contain group-hover:scale-110 transition-transform duration-500"
            style={{ imageRendering: "pixelated" }}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-(--color-card-text)/30">
            <User size={48} className="mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">
              No Icon
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-(--color-card-text) leading-tight mb-2 group-hover:text-(--color-accent) transition-colors">
          {name}
        </h3>
        {firstPlacement ? (
          <div className="mt-auto">
            <p className="text-xs text-(--color-card-text)/60 italic mb-1">
              Found in:
            </p>
            <p className="text-sm font-medium text-(--color-card-text)/80 line-clamp-1">
              {firstPlacement.streetName} - {firstPlacement.mapName}
            </p>
            {remainingCount > 0 && (
              <p className="text-xs text-(--color-accent)/70 font-semibold mt-1">
                + {remainingCount} more location{remainingCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-auto">
            <p className="text-xs text-(--color-card-text)/40 italic">
              Location unknown
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default NpcCard;
