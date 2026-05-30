export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-bg/60">
      <div className="mx-auto max-w-7xl px-6 py-8 text-sm leading-relaxed text-fg-muted">
        <p>
          This material is unofficial and is not endorsed by Supercell. For more information see Supercell&rsquo;s Fan
          Content Policy:{" "}
          <a
            href="https://www.supercell.com/fan-content-policy"
            target="_blank"
            rel="noreferrer noopener"
            className="text-crystal-bright underline-offset-2 hover:underline"
          >
            www.supercell.com/fan-content-policy
          </a>
          .
        </p>
        <p className="mt-3 text-xs text-fg-dim">
          Arena Insights is a non-commercial fan project. Card data and assets are sourced from the
          official developer API. Game names and trademarks belong to their respective owners.
        </p>
      </div>
    </footer>
  );
}
