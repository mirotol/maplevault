interface BadgeProps {
  label: string;
  variant: string;
  sublabel?: string;
}

export const Badge = ({ label, variant, sublabel }: BadgeProps) => {
  const variantStyles: Record<string, string> = {
    Fire: "bg-(--color-element-fire)",
    Poison: "bg-(--color-element-poison)",
    Ice: "bg-(--color-element-ice)",
    Lightning: "bg-(--color-element-lightning) text-black!",
    Holy: "bg-(--color-element-holy)",
    Dark: "bg-(--color-element-dark)",
    Undead: "bg-(--color-trait-undead)",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest text-white shadow-sm transition-transform hover:scale-105 select-none ${
          variantStyles[variant] || "bg-slate-500"
        }`}
      >
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50 whitespace-nowrap">
          {sublabel}
        </span>
      )}
    </div>
  );
};
