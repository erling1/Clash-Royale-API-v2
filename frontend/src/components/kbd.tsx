import type { ReactNode } from "react";

/**
 * Keybind hint chip. 10–11px bordered box.
 * Examples: <Kbd>/</Kbd>, <Kbd>G D</Kbd>, <Kbd>Esc</Kbd>
 */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-fg-dim)] border border-[var(--color-rule)] font-mono">
      {children}
    </kbd>
  );
}
