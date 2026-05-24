/**
 * Visible flag that a panel is rendering invented data.
 * Stays until the backing endpoint exists, then delete the banner
 * from the relevant page and swap to a real fetcher in src/lib/api.ts.
 */
export function MockBanner({ endpoint }: { endpoint: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 mb-3 border border-[var(--color-warn)]/40 bg-[var(--color-warn)]/5">
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-warn)]">
        mock
      </span>
      <span className="text-[var(--color-fg-dim)] text-xs">
        awaiting endpoint <span className="text-[var(--color-fg)]">{endpoint}</span>
      </span>
    </div>
  );
}
