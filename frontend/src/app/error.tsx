"use client";

import { Button } from "@/components/ui/button";

/**
 * Route error boundary — replaces Next's bare crash screen when a server page
 * throws (e.g. an ApiError that isn't a 404), with a retry that re-renders the
 * segment.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h2 className="font-display text-2xl text-fg">Something went wrong</h2>
      <p className="max-w-md text-sm text-fg-muted">
        We couldn’t load this page. This is usually temporary — please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
