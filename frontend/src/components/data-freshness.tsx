import { Clock } from "lucide-react";
import { fmtDate, fmtRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Small "data as of" badge. Shows a relative time with the absolute timestamp
 * on hover, so users can gauge how fresh the underlying snapshot is.
 */
export function DataFreshness({
  iso,
  className,
}: {
  iso: string | null | undefined;
  className?: string;
}) {
  if (!iso) return null;
  return (
    <span
      title={fmtDate(iso)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-panel-hover px-2 py-0.5 text-xs text-fg-muted",
        className,
      )}
    >
      <Clock className="h-3 w-3" />
      Updated {fmtRelative(iso)}
    </span>
  );
}
