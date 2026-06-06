"use client";

import dynamic from "next/dynamic";

// recharts (+ its d3 deps) is one of the largest client deps. The home charts
// sit below the fold, so we code-split them into their own chunk and render a
// lightweight skeleton until they load instead of shipping recharts up front.
const ChartSkeleton = () => (
  <div className="h-80 w-full animate-pulse rounded-md bg-bg-panel-hover" />
);

export const TopCardsByWinrate = dynamic(
  () => import("./dashboard-charts-impl").then((m) => m.TopCardsByWinrate),
  { ssr: false, loading: ChartSkeleton },
);

export const TopDecksByPopularity = dynamic(
  () => import("./dashboard-charts-impl").then((m) => m.TopDecksByPopularity),
  { ssr: false, loading: ChartSkeleton },
);
