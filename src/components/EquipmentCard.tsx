import type { ItemMeta } from "../types/maple";

interface EquipmentCardProps {
  name: string;
  icon: string;
  stats?: ItemMeta;
  requirements?: {
    level: number;
    str: number;
    dex: number;
    int: number;
    luk: number;
  };
  description?: string;
  requiredJobs?: string[];
}

const EquipmentCard = ({
  name,
  icon,
  stats,
  requirements,
  description,
  requiredJobs,
}: EquipmentCardProps) => {
  return (
    <div className="w-64 bg-slate-900/90 border border-blue-500/40 rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.2)] p-3 text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:border-blue-400/60 group">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-white/5 rounded p-1 flex items-center justify-center border border-white/10">
          <img src={icon} alt={name} className="max-w-full max-h-full object-contain" />
        </div>
        <h3 className="font-bold text-base leading-tight flex-1">{name}</h3>
      </div>

      <div className="h-px bg-white/10 my-2" />

      {/* Requirements */}
      <div className="space-y-0.5 mb-2">
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-400 font-bold">
          <span>REQ LVL : {requirements?.level ?? 0}</span>
        </div>
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-400">
          <span>REQ STR : {requirements?.str ?? 0}</span>
          <span>REQ DEX : {requirements?.dex ?? 0}</span>
        </div>
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-400">
          <span>REQ INT : {requirements?.int ?? 0}</span>
          <span>REQ LUK : {requirements?.luk ?? 0}</span>
        </div>
      </div>

      <div className="h-px bg-white/10 my-2" />

      {/* Stats */}
      <div className="space-y-0.5">
        {stats?.incPAD && (
          <div className="flex justify-between text-sm text-orange-400">
            <span>Weapon Attack</span>
            <span>+{stats.incPAD}</span>
          </div>
        )}
        {stats?.incMAD && (
          <div className="flex justify-between text-sm text-blue-400">
            <span>Magic Attack</span>
            <span>+{stats.incMAD}</span>
          </div>
        )}
        {stats?.incSTR && (
          <div className="flex justify-between text-sm">
            <span>STR</span>
            <span>+{stats.incSTR}</span>
          </div>
        )}
        {stats?.incDEX && (
          <div className="flex justify-between text-sm">
            <span>DEX</span>
            <span>+{stats.incDEX}</span>
          </div>
        )}
        {stats?.incINT && (
          <div className="flex justify-between text-sm">
            <span>INT</span>
            <span>+{stats.incINT}</span>
          </div>
        )}
        {stats?.incLUK && (
          <div className="flex justify-between text-sm">
            <span>LUK</span>
            <span>+{stats.incLUK}</span>
          </div>
        )}
        {stats?.incACC && (
          <div className="flex justify-between text-sm">
            <span>Accuracy</span>
            <span>+{stats.incACC}</span>
          </div>
        )}
        {stats?.incEVA && (
          <div className="flex justify-between text-sm">
            <span>Avoidability</span>
            <span>+{stats.incEVA}</span>
          </div>
        )}
        {stats?.incPDD && (
          <div className="flex justify-between text-sm">
            <span>Weapon Defense</span>
            <span>+{stats.incPDD}</span>
          </div>
        )}
        {stats?.incMDD && (
          <div className="flex justify-between text-sm">
            <span>Magic Defense</span>
            <span>+{stats.incMDD}</span>
          </div>
        )}
        {stats?.incSpeed && (
          <div className="flex justify-between text-sm">
            <span>Speed</span>
            <span>+{stats.incSpeed}</span>
          </div>
        )}
        {stats?.incJump && (
          <div className="flex justify-between text-sm">
            <span>Jump</span>
            <span>+{stats.incJump}</span>
          </div>
        )}
      </div>

      {/* Class Restriction */}
      {requiredJobs && requiredJobs.length > 0 && (
        <>
          <div className="h-px bg-white/10 my-2" />
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            {requiredJobs.join(" / ")}
          </div>
        </>
      )}

      {/* Flavor Text */}
      {description && (
        <>
          <div className="h-px bg-white/10 my-2" />
          <p className="text-[11px] italic text-gray-400 leading-tight">
            {description}
          </p>
        </>
      )}
    </div>
  );
};

export default EquipmentCard;
