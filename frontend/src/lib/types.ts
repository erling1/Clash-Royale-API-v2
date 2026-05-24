/**
 * Wire types — mirror src/models/*.rs exactly.
 * If the Rust side changes a field, this is the file to update.
 */

export interface Card {
  card_id: number;
  card_name: string;
  rarity: string;
  elixir_cost: number | null;
  max_level: number;
  max_evolution_level: number | null;
}

export interface SupportCard {
  card_id: number;
  card_name: string;
  rarity: string;
  max_level: number;
}

export interface Arena {
  arena_id: number;
  arena_name: string;
}

export interface GameMode {
  game_mode_id: number;
  game_mode_name: string;
}

export interface Clan {
  clan_tag: string;
  clan_name: string;
  clan_badge_id: number | null;
}

export interface Player {
  player_tag: string;
  player_name: string;
  exp_level: number;
  trophies: number;
  best_trophies: number;
  wins: number;
  losses: number;
  battle_count: number;
  three_crown_wins: number;
  donations: number;
  donations_received: number;
  total_donations: number;
  clan_cards_collected: number;
  star_points: number;
  exp_points: number;
  total_exp_points: number;
  war_day_wins: number;
  challenge_cards_won: number;
  challenge_max_wins: number;
  tournament_cards_won: number;
  tournament_battle_count: number;
  current_win_lose_streak: number;
  legacy_trophy_road_high_score: number | null;
  clan_role: string | null;
  clan_tag: string | null;
  arena_id: number;
  win_rate: number | null;
  extracted_date: string;
}

export interface Battle {
  queried_player_tag: string;
  battle_time: string;
  battle_type: string;
  is_ladder_tournament: boolean;
  is_hosted_match: boolean;
  league_number: number | null;
  deck_selection: string;
  arena_id: number;
  game_mode_id: number;
  team_crowns: number;
  opponent_crowns: number;
  winner_side: string;
  extracted_date: string;
}

export interface BattleParticipant {
  queried_player_tag: string;
  battle_time: string;
  participant_side: string;
  slot: number;
  player_tag: string;
  player_name: string;
  starting_trophies: number | null;
  trophy_change: number | null;
  crowns: number;
  king_tower_hit_points: number;
  princess_tower_1_hp: number | null;
  princess_tower_2_hp: number | null;
  total_tower_hp_remaining: number | null;
  clan_tag: string | null;
  global_rank: number | null;
  elixir_leaked: number | null;
  is_winner: boolean | null;
  extracted_date: string;
}

export interface BattleDeckCard {
  queried_player_tag: string;
  battle_time: string;
  participant_side: string;
  slot: number;
  deck_slot: number;
  card_id: number;
  card_level: number;
  star_level: number | null;
  evolution_level: number | null;
  extracted_date: string;
}

export interface BattleSupportCard {
  queried_player_tag: string;
  battle_time: string;
  participant_side: string;
  slot: number;
  support_slot: number;
  card_id: number;
  card_level: number;
  extracted_date: string;
}

export interface PolRanking {
  season_id: string;
  player_rank: number;
  player_tag: string;
  player_name: string;
  exp_level: number;
  elo_rating: number;
  clan_tag: string | null;
  extracted_date: string;
}

export interface DeckMeta {
  deck_hash: string;
  deck_label: string | null;
  total_elixir_cost: number | null;
  avg_elixir_cost: number | null;
  appearance_count: number;
  win_count: number;
  loss_count: number;
  draw_count: number;
  win_rate: number | null;
  avg_trophy_change: number | null;
  avg_crowns: number | null;
  first_seen_at: string;
  last_seen_at: string;
  popularity_rank: number;
}

export interface CardMeta {
  card_id: number;
  card_name: string | null;
  rarity: string | null;
  elixir_cost: number | null;
  appearance_count: number;
  inclusion_rate: number | null;
  usage_pct: number | null;
  win_count: number;
  loss_count: number;
  draw_count: number;
  win_rate: number | null;
  evolution_count: number;
  evolution_pct: number | null;
  avg_card_level: number | null;
  popularity_rank: number;
}

export interface CardPair {
  card_id_a: number;
  card_name_a: string | null;
  card_id_b: number;
  card_name_b: string | null;
  co_occurrence_count: number;
  win_count: number;
  loss_count: number;
  draw_count: number;
  joint_win_rate: number | null;
  popularity_rank: number;
}
