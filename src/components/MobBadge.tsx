import { Link } from "react-router-dom";
import { fetchMobIcon } from "../api/mapleApi";

interface MobBadgeProps {
  id: number;
  name: string;
  className?: string;
}

export const MobBadge = ({ id, name, className }: MobBadgeProps) => {
  const defaultClassName =
    "group flex items-center gap-3 p-2 bg-black/20 border border-white/10 rounded-lg hover:border-orange-500/50 hover:bg-black/40 transition-all shadow-sm";

  return (
    <Link
      to={`/mobs/${id}`}
      className={className || defaultClassName}
      title={`View Mob: ${name || id}`}
    >
      <div className="w-12 h-12 flex items-center justify-center shrink-0">
        <img
          src={fetchMobIcon(id)}
          alt={name}
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: "pixelated" }}
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold truncate group-hover:text-white">
          {name || "Loading..."}
        </div>
      </div>
    </Link>
  );
};
