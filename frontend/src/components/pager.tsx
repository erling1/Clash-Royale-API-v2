"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fmtInt } from "@/lib/format";

/**
 * URL-driven pager for server-side pagination. Prev/Next are `<Link>`s that bump
 * the `page` query param, so navigation re-runs the server component and fetches
 * the next page. `hasNext` is typically `rows.length === PAGE_SIZE`.
 */
export function Pager({
  page,
  hasNext,
  total,
}: {
  page: number;
  hasNext: boolean;
  total?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const href = (p: number): Route => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p + 1));
    return `${pathname}?${params.toString()}` as Route;
  };

  return (
    <div className="flex items-center justify-between text-xs text-fg-muted">
      <div>
        Page {page + 1}
        {total !== undefined && ` · ${fmtInt(total)} results`}
      </div>
      <div className="flex items-center gap-2">
        {page === 0 ? (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={href(page - 1)} scroll={false}>
              Previous
            </Link>
          </Button>
        )}
        {hasNext ? (
          <Button asChild variant="outline" size="sm">
            <Link href={href(page + 1)} scroll={false}>
              Next
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
