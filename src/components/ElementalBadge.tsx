import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";

interface ElementalBadgeProps {
  label: string;
  elements: string[];
  loading?: boolean;
}

export const ElementalBadge = ({
  label,
  elements,
  loading = false,
}: ElementalBadgeProps) => (
  <div className="space-y-3 p-4 rounded-xl border border-(--color-card-border)/50 bg-(--color-card-bg)/60">
    <span className="text-xs font-bold uppercase tracking-widest text-(--color-card-text) opacity-80 block">
      {label}
    </span>
    <div className="flex flex-wrap gap-2">
      {loading ? (
        <Skeleton className="h-7 w-20 rounded-lg" />
      ) : elements.length > 0 ? (
        elements.map((el) => <Badge key={el} label={el} variant={el} />)
      ) : (
        <span className="text-sm font-medium text-(--color-card-text) opacity-60 italic">
          None
        </span>
      )}
    </div>
  </div>
);
