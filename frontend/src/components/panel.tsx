import type { ReactNode } from "react";
import { Kbd } from "./kbd";

interface PanelProps {
  title: string;
  folio?: string;          // "§ I.", "§ II.", optional editorial mark
  keybind?: string;        // "G D", "/" — rendered in <Kbd>
  rightSlot?: ReactNode;   // any custom right-aligned content (overrides keybind)
  children: ReactNode;
  noPadding?: boolean;
}

export function Panel({
  title,
  folio,
  keybind,
  rightSlot,
  children,
  noPadding = false,
}: PanelProps) {
  return (
    <section className="border border-[var(--color-rule)] bg-[var(--color-bg-elev)]">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-rule)]">
        <div className="flex items-baseline gap-3">
          {folio && (
            <span className="label-dim">{folio}</span>
          )}
          <h2 className="label-section">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {rightSlot ?? (keybind && <Kbd>{keybind}</Kbd>)}
        </div>
      </header>
      <div className={noPadding ? "" : "px-4 py-3"}>{children}</div>
    </section>
  );
}
