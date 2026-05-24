/** Tabular-number formatters. All assume Berkeley/JetBrains Mono with tnum. */

export const fmtPct = (n: number, digits = 1) =>
  `${n.toFixed(digits)}%`;

export const fmtDelta = (n: number, digits = 1) => {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}`;
};

export const fmtInt = (n: number) =>
  n.toLocaleString("en-US");

export const fmtElixir = (n: number | null) =>
  n == null ? "—" : n.toFixed(1);

export const fmtDate = (iso: string) => {
  // Backend already CASTs to VARCHAR; could be "YYYY-MM-DD" or full ISO.
  if (iso.length === 10) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 16).replace("T", " ");
};

export const fmtRelative = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/** Clash Royale tags often arrive with or without a leading "#" — normalize. */
export const normalizeTag = (raw: string) =>
  raw.startsWith("#") ? raw.slice(1) : raw;

export const displayTag = (raw: string) =>
  raw.startsWith("#") ? raw : `#${raw}`;
