import { Skeleton } from "./Skeleton";

interface StatBadgeProps {
  label: string;
  value: string | number | undefined;
  variant?: "default" | "hp" | "mp" | "exp";
  loading?: boolean;
}

export const StatBadge = ({
  label,
  value,
  variant = "default",
  loading = false,
}: StatBadgeProps) => {
  const variantStyles = {
    default:
      "bg-(--color-accent-bg) bg-opacity-5 border-(--color-card-border)/50",
    hp: "bg-[image:var(--stat-hp-gradient)] border-white text-white text-shadow-lg shadow-md",
    mp: "bg-[image:var(--stat-mp-gradient)] border-white text-white text-shadow-lg shadow-md",
    exp: "bg-[image:var(--stat-exp-gradient)] border-white text-white text-shadow-lg shadow-md",
  };

  return (
    <div className={`py-2.5 px-4 rounded-lg border ${variantStyles[variant]}`}>
      <div className="text-sm font-bold uppercase tracking-widest leading-none mb-1">
        {label}
      </div>
      <div className="font-bold text-xl leading-none">
        {loading ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          (value?.toLocaleString() ?? "???")
        )}
      </div>
    </div>
  );
};
