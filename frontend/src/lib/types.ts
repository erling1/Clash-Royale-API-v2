import { z } from "zod";

/**
 * Hand-mirrored from src/models/*.rs. Until the Rust API exposes an OpenAPI
 * schema (utoipa), these schemas are the contract source of truth on the
 * frontend side and must be kept in sync with the Rust structs.
 */

export const ArenaSchema = z.object({
  arena_id: z.number().int(),
  arena_name: z.string(),
});
export type Arena = z.infer<typeof ArenaSchema>;

export const CardSchema = z.object({
  card_id: z.number().int(),
  card_name: z.string(),
  rarity: z.string(),
  elixir_cost: z.number().nullable(),
  max_level: z.number().int(),
  max_evolution_level: z.number().nullable(),
  icon_url: z.string().nullable(),
  // Variant icons. nullish so the frontend keeps parsing before the backend
  // change that pivots dim_cards is applied (they arrive once it ships).
  icon_url_evolution: z.string().nullish(),
  icon_url_hero: z.string().nullish(),
});
export type Card = z.infer<typeof CardSchema>;

export const CardMetaSchema = z.object({
  card_id: z.number().int(),
  card_name: z.string().nullable(),
  rarity: z.string().nullable(),
  elixir_cost: z.number().nullable(),
  appearance_count: z.number().int(),
  inclusion_rate: z.number().nullable(),
  usage_pct: z.number().nullable(),
  win_count: z.number().int(),
  loss_count: z.number().int(),
  draw_count: z.number().int(),
  win_rate: z.number().nullable(),
  evolution_count: z.number().int(),
  evolution_pct: z.number().nullable(),
  avg_card_level: z.number().nullable(),
  popularity_rank: z.number().int(),
});
export type CardMeta = z.infer<typeof CardMetaSchema>;

export const CardPairSchema = z.object({
  card_id_a: z.number().int(),
  card_name_a: z.string().nullable(),
  card_id_b: z.number().int(),
  card_name_b: z.string().nullable(),
  co_occurrence_count: z.number().int(),
  win_count: z.number().int(),
  loss_count: z.number().int(),
  draw_count: z.number().int(),
  joint_win_rate: z.number().nullable(),
  popularity_rank: z.number().int(),
});
export type CardPair = z.infer<typeof CardPairSchema>;

export const ClanSchema = z.object({
  clan_tag: z.string(),
  clan_name: z.string(),
  clan_badge_id: z.number().nullable(),
});
export type Clan = z.infer<typeof ClanSchema>;

export const DeckMetaSchema = z.object({
  deck_hash: z.string(),
  deck_label: z.string().nullable(),
  card_ids: z.array(z.number().int()),
  total_elixir_cost: z.number().nullable(),
  avg_elixir_cost: z.number().nullable(),
  appearance_count: z.number().int(),
  win_count: z.number().int(),
  loss_count: z.number().int(),
  draw_count: z.number().int(),
  win_rate: z.number().nullable(),
  avg_trophy_change: z.number().nullable(),
  avg_crowns: z.number().nullable(),
  first_seen_at: z.string(),
  last_seen_at: z.string(),
  popularity_rank: z.number().int(),
});
export type DeckMeta = z.infer<typeof DeckMetaSchema>;

export const DeckMatchupSchema = z.object({
  deck_hash: z.string(),
  deck_label: z.string().nullable(),
  opponent_deck_hash: z.string(),
  opponent_deck_label: z.string().nullable(),
  matchup_count: z.number().int(),
  win_count: z.number().int(),
  loss_count: z.number().int(),
  draw_count: z.number().int(),
  win_rate: z.number().nullable(),
});
export type DeckMatchup = z.infer<typeof DeckMatchupSchema>;

export const GameModeSchema = z.object({
  game_mode_id: z.number().int(),
  game_mode_name: z.string(),
});
export type GameMode = z.infer<typeof GameModeSchema>;

export const PlayerSchema = z.object({
  player_tag: z.string(),
  player_name: z.string(),
  exp_level: z.number().int(),
  trophies: z.number().int(),
  best_trophies: z.number().int(),
  wins: z.number().int(),
  losses: z.number().int(),
  battle_count: z.number().int(),
  three_crown_wins: z.number().int(),
  donations: z.number().int(),
  donations_received: z.number().int(),
  total_donations: z.number().int(),
  clan_cards_collected: z.number().int(),
  star_points: z.number().int(),
  exp_points: z.number().int(),
  total_exp_points: z.number().int(),
  war_day_wins: z.number().int(),
  challenge_cards_won: z.number().int(),
  challenge_max_wins: z.number().int(),
  tournament_cards_won: z.number().int(),
  tournament_battle_count: z.number().int(),
  current_win_lose_streak: z.number().int(),
  legacy_trophy_road_high_score: z.number().nullable(),
  clan_role: z.string().nullable(),
  clan_tag: z.string().nullable(),
  arena_id: z.number().int(),
  win_rate: z.number().nullable(),
  extracted_date: z.string(),
});
export type Player = z.infer<typeof PlayerSchema>;

export const PolRankingSchema = z.object({
  season_id: z.string(),
  player_rank: z.number().int(),
  player_tag: z.string(),
  player_name: z.string(),
  exp_level: z.number().int(),
  elo_rating: z.number().int(),
  clan_tag: z.string().nullable(),
  extracted_date: z.string(),
});
export type PolRanking = z.infer<typeof PolRankingSchema>;

export const SupportCardSchema = z.object({
  card_id: z.number().int(),
  card_name: z.string(),
  rarity: z.string(),
  max_level: z.number().int(),
});
export type SupportCard = z.infer<typeof SupportCardSchema>;

export const BattleSchema = z.object({
  queried_player_tag: z.string(),
  battle_time: z.string(),
  battle_type: z.string(),
  is_ladder_tournament: z.boolean(),
  is_hosted_match: z.boolean(),
  league_number: z.number().int().nullable(),
  deck_selection: z.string(),
  arena_id: z.number().int(),
  game_mode_id: z.number().int(),
  team_crowns: z.number().int(),
  opponent_crowns: z.number().int(),
  winner_side: z.string(),
  extracted_date: z.string(),
});
export type Battle = z.infer<typeof BattleSchema>;

export const BattleParticipantSchema = z.object({
  queried_player_tag: z.string(),
  battle_time: z.string(),
  participant_side: z.string(),
  slot: z.number().int(),
  player_tag: z.string(),
  player_name: z.string(),
  starting_trophies: z.number().nullable(),
  trophy_change: z.number().nullable(),
  crowns: z.number().int(),
  king_tower_hit_points: z.number().int(),
  princess_tower_1_hp: z.number().nullable(),
  princess_tower_2_hp: z.number().nullable(),
  total_tower_hp_remaining: z.number().nullable(),
  clan_tag: z.string().nullable(),
  global_rank: z.number().nullable(),
  elixir_leaked: z.number().nullable(),
  is_winner: z.boolean().nullable(),
  extracted_date: z.string(),
});
export type BattleParticipant = z.infer<typeof BattleParticipantSchema>;

export const BattleDeckCardSchema = z.object({
  queried_player_tag: z.string(),
  battle_time: z.string(),
  participant_side: z.string(),
  slot: z.number().int(),
  deck_slot: z.number().int(),
  card_id: z.number().int(),
  card_level: z.number().int(),
  star_level: z.number().nullable(),
  evolution_level: z.number().nullable(),
  card_variant: z.string(),
  extracted_date: z.string(),
});
export type BattleDeckCard = z.infer<typeof BattleDeckCardSchema>;

export const BattleSupportCardSchema = z.object({
  queried_player_tag: z.string(),
  battle_time: z.string(),
  participant_side: z.string(),
  slot: z.number().int(),
  support_slot: z.number().int(),
  card_id: z.number().int(),
  card_level: z.number().int(),
  extracted_date: z.string(),
});
export type BattleSupportCard = z.infer<typeof BattleSupportCardSchema>;
