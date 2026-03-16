export const Skeleton = ({ className }: { className: string }) => (
  <span
    className={`animate-pulse bg-gray-200 dark:bg-gray-700/50 rounded inline-block ${className}`}
  />
);
