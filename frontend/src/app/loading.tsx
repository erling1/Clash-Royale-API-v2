import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level fallback shown while a force-dynamic page resolves its data, so
 * navigation paints a skeleton immediately instead of stalling on the prior page.
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
