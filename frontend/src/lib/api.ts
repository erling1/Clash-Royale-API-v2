/**
 * Typed fetchers for the actix-web backend.
 * All calls run server-side (React Server Components) — no CORS.
 * On API failure each fetcher returns `null` (or empty array for lists)
 * so pages can render a degraded state instead of crashing.
 */

import type {
  Arena,
  Battle,
  BattleDeckCard,
  BattleParticipant,
  BattleSupportCard,
  Card,
  Clan,
  GameMode,
  Player,
  PolRanking,
  SupportCard,
} from "./types";

const BASE = process.env.API_BASE_URL ?? "http://localhost:3000/api/v1";

type FetchOpts = { revalidate?: number };

async function getJSON<T>(path: string, opts: FetchOpts = {}): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate: opts.revalidate ?? 60 },
    });
    if (!res.ok) {
      console.warn(`[api] ${path} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[api] ${path} → ${(err as Error).message}`);
    return null;
  }
}

async function getList<T>(path: string, opts: FetchOpts = {}): Promise<T[]> {
  const data = await getJSON<T[]>(path, opts);
  return data ?? [];
}

/* ─────────────── cards ─────────────── */

export const listCards = () => getList<Card>("/cards", { revalidate: 3600 });

export const getCard = (id: number) => getJSON<Card>(`/cards/${id}`, { revalidate: 3600 });

export const listSupportCards = () =>
  getList<SupportCard>("/support-cards", { revalidate: 3600 });

/* ─────────────── arenas / modes ─────────────── */

export const listArenas = () => getList<Arena>("/arenas", { revalidate: 3600 });

export const listGameModes = () =>
  getList<GameMode>("/game-modes", { revalidate: 3600 });

/* ─────────────── players ─────────────── */

export const listPlayers = (limit = 100) =>
  getList<Player>(`/players?limit=${limit}`, { revalidate: 120 });

export const getPlayer = (tag: string) =>
  getJSON<Player>(`/players/${encodeURIComponent(tag)}`, { revalidate: 120 });

/* ─────────────── rankings ─────────────── */

export const listRankings = (limit = 100, seasonId?: string) => {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (seasonId) qs.set("season_id", seasonId);
  return getList<PolRanking>(`/rankings?${qs.toString()}`, { revalidate: 120 });
};

/* ─────────────── battles ─────────────── */

export const listBattles = (params: { playerTag?: string; limit?: number } = {}) => {
  const qs = new URLSearchParams();
  if (params.playerTag) qs.set("player_tag", params.playerTag);
  if (params.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return getList<Battle>(`/battles${q ? `?${q}` : ""}`, { revalidate: 60 });
};

export const getBattle = (id: string) =>
  getJSON<Battle>(`/battles/${encodeURIComponent(id)}`, { revalidate: 600 });

export const listBattleParticipants = (id: string) =>
  getList<BattleParticipant>(
    `/battles/${encodeURIComponent(id)}/participants`,
    { revalidate: 600 },
  );

export const listBattleDeckCards = (id: string) =>
  getList<BattleDeckCard>(
    `/battles/${encodeURIComponent(id)}/deck-cards`,
    { revalidate: 600 },
  );

export const listBattleSupportCards = (id: string) =>
  getList<BattleSupportCard>(
    `/battles/${encodeURIComponent(id)}/support-cards`,
    { revalidate: 600 },
  );

/* ─────────────── clans ─────────────── */

export const listClans = () => getList<Clan>("/clans", { revalidate: 3600 });

export const getClan = (tag: string) =>
  getJSON<Clan>(`/clans/${encodeURIComponent(tag)}`, { revalidate: 600 });
