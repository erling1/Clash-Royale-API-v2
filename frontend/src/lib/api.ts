import { z } from "zod";
import { apiBase } from "./env";
import {
  BattleDeckCardSchema,
  BattleSchema,
  CardMetaSchema,
  CardPairSchema,
  CardSchema,
  ClanSchema,
  DeckMatchupSchema,
  DeckMetaSchema,
  PlayerSchema,
  PolRankingSchema,
  type Battle,
  type BattleDeckCard,
  type Card,
  type CardMeta,
  type CardPair,
  type Clan,
  type DeckMatchup,
  type DeckMeta,
  type Player,
  type PolRanking,
} from "./types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = {
  /** Next.js RSC cache options. Defaults to a 60s revalidate. */
  revalidate?: number;
  signal?: AbortSignal;
};

async function getJSON<T>(
  path: string,
  schema: z.ZodType<T>,
  opts: FetchOptions = {},
): Promise<T> {
  const url = `${apiBase()}${path}`;
  const init: RequestInit & { next?: { revalidate?: number } } = {
    signal: opts.signal,
    headers: { Accept: "application/json" },
  };
  if (typeof window === "undefined") {
    init.next = { revalidate: opts.revalidate ?? 60 };
  }
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText, `GET ${path} → ${res.status}`);
  }
  const json = (await res.json()) as unknown;
  return schema.parse(json);
}

function listSchema<T>(schema: z.ZodType<T>) {
  return z.array(schema);
}

function qs(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (entries.length === 0) return "";
  const u = new URLSearchParams();
  for (const [k, v] of entries) u.set(k, String(v));
  return `?${u.toString()}`;
}

const CountSchema = z.object({ count: z.number().int() });

export const api = {
  // ---- Cards --------------------------------------------------------------

  listCards: (opts?: FetchOptions): Promise<Card[]> =>
    getJSON("/api/v1/cards", listSchema(CardSchema), opts),

  getCard: (id: number, opts?: FetchOptions): Promise<Card> =>
    getJSON(`/api/v1/cards/${id}`, CardSchema, opts),

  listCardMeta: (limit?: number, opts?: FetchOptions): Promise<CardMeta[]> =>
    getJSON(`/api/v1/card-meta${qs({ limit })}`, listSchema(CardMetaSchema), opts),

  getCardMeta: (id: number, opts?: FetchOptions): Promise<CardMeta> =>
    getJSON(`/api/v1/card-meta/${id}`, CardMetaSchema, opts),

  listCardPairs: (
    args?: { card_id?: number; limit?: number },
    opts?: FetchOptions,
  ): Promise<CardPair[]> =>
    getJSON(
      `/api/v1/card-pairs${qs({ card_id: args?.card_id, limit: args?.limit })}`,
      listSchema(CardPairSchema),
      opts,
    ),

  // ---- Clans --------------------------------------------------------------

  listClans: (
    args?: { limit?: number; offset?: number },
    opts?: FetchOptions,
  ): Promise<Clan[]> =>
    getJSON(
      `/api/v1/clans${qs({ limit: args?.limit, offset: args?.offset })}`,
      listSchema(ClanSchema),
      opts,
    ),

  // ---- Decks --------------------------------------------------------------

  listDecks: (
    args?: {
      limit?: number;
      offset?: number;
      card_id?: number;
      sort?: string;
      dir?: "asc" | "desc";
    },
    opts?: FetchOptions,
  ): Promise<DeckMeta[]> =>
    getJSON(
      `/api/v1/decks${qs({
        limit: args?.limit,
        offset: args?.offset,
        card_id: args?.card_id,
        sort: args?.sort,
        dir: args?.dir,
      })}`,
      listSchema(DeckMetaSchema),
      opts,
    ),

  countDecks: (opts?: FetchOptions): Promise<number> =>
    getJSON("/api/v1/decks/count", CountSchema, opts).then((r) => r.count),

  getDeck: (hash: string, opts?: FetchOptions): Promise<DeckMeta> =>
    getJSON(`/api/v1/decks/${encodeURIComponent(hash)}`, DeckMetaSchema, opts),

  // ---- Matchups -----------------------------------------------------------

  getDeckMatchups: (
    hash: string,
    args?: { limit?: number },
    opts?: FetchOptions,
  ): Promise<DeckMatchup[]> =>
    getJSON(
      `/api/v1/matchups/${encodeURIComponent(hash)}${qs({ limit: args?.limit })}`,
      listSchema(DeckMatchupSchema),
      opts,
    ),

  // ---- Players ------------------------------------------------------------

  listPlayers: (
    args?: { limit?: number; offset?: number },
    opts?: FetchOptions,
  ): Promise<Player[]> =>
    getJSON(
      `/api/v1/players${qs({ limit: args?.limit, offset: args?.offset })}`,
      listSchema(PlayerSchema),
      opts,
    ),

  countPlayers: (opts?: FetchOptions): Promise<number> =>
    getJSON("/api/v1/players/count", CountSchema, opts).then((r) => r.count),

  getPlayer: (tag: string, opts?: FetchOptions): Promise<Player> =>
    getJSON(`/api/v1/players/${encodeURIComponent(tag)}`, PlayerSchema, opts),

  /** Deck cards for a player's most-recent battles, in one request. */
  getPlayerBattleDeckCards: (
    tag: string,
    args?: { limit?: number },
    opts?: FetchOptions,
  ): Promise<BattleDeckCard[]> =>
    getJSON(
      `/api/v1/players/${encodeURIComponent(tag)}/battle-deck-cards${qs({ limit: args?.limit })}`,
      listSchema(BattleDeckCardSchema),
      opts,
    ),

  // ---- Battles ------------------------------------------------------------

  listBattles: (
    args?: { player_tag?: string; limit?: number },
    opts?: FetchOptions,
  ): Promise<Battle[]> =>
    getJSON(
      `/api/v1/battles${qs({ player_tag: args?.player_tag, limit: args?.limit })}`,
      listSchema(BattleSchema),
      opts,
    ),

  // ---- Rankings -----------------------------------------------------------

  listRankings: (
    args?: { season_id?: string; limit?: number; offset?: number },
    opts?: FetchOptions,
  ): Promise<PolRanking[]> =>
    getJSON(
      `/api/v1/rankings${qs({ season_id: args?.season_id, limit: args?.limit, offset: args?.offset })}`,
      listSchema(PolRankingSchema),
      opts,
    ),
};
