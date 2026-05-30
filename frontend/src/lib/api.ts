import { z } from "zod";
import { apiBase } from "./env";
import {
  ArenaSchema,
  BattleDeckCardSchema,
  BattleParticipantSchema,
  BattleSchema,
  BattleSupportCardSchema,
  CardMetaSchema,
  CardPairSchema,
  CardSchema,
  ClanSchema,
  DeckMetaSchema,
  GameModeSchema,
  PlayerSchema,
  PolRankingSchema,
  SupportCardSchema,
  type Arena,
  type Battle,
  type BattleDeckCard,
  type BattleParticipant,
  type BattleSupportCard,
  type Card,
  type CardMeta,
  type CardPair,
  type Clan,
  type DeckMeta,
  type GameMode,
  type Player,
  type PolRanking,
  type SupportCard,
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

// ---- Arenas ----------------------------------------------------------------

export const api = {
  listArenas: (opts?: FetchOptions): Promise<Arena[]> =>
    getJSON("/api/v1/arenas", listSchema(ArenaSchema), opts),

  getArena: (id: number, opts?: FetchOptions): Promise<Arena> =>
    getJSON(`/api/v1/arenas/${id}`, ArenaSchema, opts),

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

  listClans: (limit?: number, opts?: FetchOptions): Promise<Clan[]> =>
    getJSON(`/api/v1/clans${qs({ limit })}`, listSchema(ClanSchema), opts),

  getClan: (tag: string, opts?: FetchOptions): Promise<Clan> =>
    getJSON(`/api/v1/clans/${encodeURIComponent(tag)}`, ClanSchema, opts),

  // ---- Decks --------------------------------------------------------------

  listDecks: (limit?: number, opts?: FetchOptions): Promise<DeckMeta[]> =>
    getJSON(`/api/v1/decks${qs({ limit })}`, listSchema(DeckMetaSchema), opts),

  getDeck: (hash: string, opts?: FetchOptions): Promise<DeckMeta> =>
    getJSON(`/api/v1/decks/${encodeURIComponent(hash)}`, DeckMetaSchema, opts),

  // ---- Game modes ---------------------------------------------------------

  listGameModes: (opts?: FetchOptions): Promise<GameMode[]> =>
    getJSON("/api/v1/game-modes", listSchema(GameModeSchema), opts),

  getGameMode: (id: number, opts?: FetchOptions): Promise<GameMode> =>
    getJSON(`/api/v1/game-modes/${id}`, GameModeSchema, opts),

  // ---- Support cards ------------------------------------------------------

  listSupportCards: (opts?: FetchOptions): Promise<SupportCard[]> =>
    getJSON("/api/v1/support-cards", listSchema(SupportCardSchema), opts),

  getSupportCard: (id: number, opts?: FetchOptions): Promise<SupportCard> =>
    getJSON(`/api/v1/support-cards/${id}`, SupportCardSchema, opts),

  // ---- Players ------------------------------------------------------------

  listPlayers: (limit?: number, opts?: FetchOptions): Promise<Player[]> =>
    getJSON(`/api/v1/players${qs({ limit })}`, listSchema(PlayerSchema), opts),

  getPlayer: (tag: string, opts?: FetchOptions): Promise<Player> =>
    getJSON(`/api/v1/players/${encodeURIComponent(tag)}`, PlayerSchema, opts),

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

  getBattle: (
    player_tag: string,
    battle_time: string,
    opts?: FetchOptions,
  ): Promise<Battle> =>
    getJSON(
      `/api/v1/battles/${encodeURIComponent(player_tag)}/${encodeURIComponent(battle_time)}`,
      BattleSchema,
      opts,
    ),

  listBattleParticipants: (
    player_tag: string,
    battle_time: string,
    opts?: FetchOptions,
  ): Promise<BattleParticipant[]> =>
    getJSON(
      `/api/v1/battles/${encodeURIComponent(player_tag)}/${encodeURIComponent(battle_time)}/participants`,
      listSchema(BattleParticipantSchema),
      opts,
    ),

  listBattleDeckCards: (
    player_tag: string,
    battle_time: string,
    opts?: FetchOptions,
  ): Promise<BattleDeckCard[]> =>
    getJSON(
      `/api/v1/battles/${encodeURIComponent(player_tag)}/${encodeURIComponent(battle_time)}/deck-cards`,
      listSchema(BattleDeckCardSchema),
      opts,
    ),

  listBattleSupportCards: (
    player_tag: string,
    battle_time: string,
    opts?: FetchOptions,
  ): Promise<BattleSupportCard[]> =>
    getJSON(
      `/api/v1/battles/${encodeURIComponent(player_tag)}/${encodeURIComponent(battle_time)}/support-cards`,
      listSchema(BattleSupportCardSchema),
      opts,
    ),

  // ---- Rankings -----------------------------------------------------------

  listRankings: (
    args?: { season_id?: string; limit?: number },
    opts?: FetchOptions,
  ): Promise<PolRanking[]> =>
    getJSON(
      `/api/v1/rankings${qs({ season_id: args?.season_id, limit: args?.limit })}`,
      listSchema(PolRankingSchema),
      opts,
    ),
};
