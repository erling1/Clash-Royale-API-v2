import { Crown, Twitter, Youtube, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-bg-panel">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-royal-bright to-royal">
              <Crown className="h-4 w-4 text-gold-bright" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm tracking-tight text-fg">ARENA</span>
              <span className="-mt-0.5 font-display text-sm tracking-tight text-crystal">
                INSIGHTS
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-muted">
            This material is unofficial and is not endorsed by Supercell. For more information see
            Supercell&rsquo;s Fan Content Policy:{" "}
            <a
              href="https://www.supercell.com/fan-content-policy"
              target="_blank"
              rel="noreferrer noopener"
              className="text-success underline-offset-2 hover:underline"
            >
              www.supercell.com/fan-content-policy
            </a>
            .
          </p>
          <p className="mt-3 max-w-md text-xs text-fg-dim">
            Arena Insights is a non-commercial fan project. Card data and assets are sourced from the
            official developer API. Game names and trademarks belong to their respective owners.
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Resources</h4>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            <li>
              <a href="#" className="transition-colors hover:text-fg">
                API Docs
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-fg">
                About
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-fg">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Follow us</h4>
          <div className="mt-3 flex items-center gap-2">
            {[Twitter, MessageCircle, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social link"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-crystal/10 text-crystal transition-colors hover:bg-crystal/20"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="mt-6 text-xs text-fg-dim">
            © 2024 Arena Insights
            <br />
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
