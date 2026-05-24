use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Player {
    pub player_tag: String,
    pub player_name: String,
    pub exp_level: i64,
    pub trophies: i64,
    pub best_trophies: i64,
    pub wins: i64,
    pub losses: i64,
    pub battle_count: i64,
    pub three_crown_wins: i64,
    pub donations: i64,
    pub donations_received: i64,
    pub total_donations: i64,
    pub clan_cards_collected: i64,
    pub star_points: i64,
    pub exp_points: i64,
    pub total_exp_points: i64,
    pub war_day_wins: i64,
    pub challenge_cards_won: i64,
    pub challenge_max_wins: i64,
    pub tournament_cards_won: i64,
    pub tournament_battle_count: i64,
    pub current_win_lose_streak: i64,
    pub legacy_trophy_road_high_score: Option<f64>,
    pub clan_role: Option<String>,
    pub clan_tag: Option<String>,
    pub arena_id: i64,
    pub win_rate: Option<f64>,
    pub extracted_date: String,
}

impl Player {
    pub const COLUMNS: &'static str = "player_tag, player_name, exp_level, trophies, best_trophies, wins, losses, battle_count, three_crown_wins, donations, donations_received, total_donations, clan_cards_collected, star_points, exp_points, total_exp_points, war_day_wins, challenge_cards_won, challenge_max_wins, tournament_cards_won, tournament_battle_count, current_win_lose_streak, legacy_trophy_road_high_score, clan_role, clan_tag, arena_id, win_rate, CAST(extracted_date AS VARCHAR) AS extracted_date";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            player_tag: row.get(0)?,
            player_name: row.get(1)?,
            exp_level: row.get(2)?,
            trophies: row.get(3)?,
            best_trophies: row.get(4)?,
            wins: row.get(5)?,
            losses: row.get(6)?,
            battle_count: row.get(7)?,
            three_crown_wins: row.get(8)?,
            donations: row.get(9)?,
            donations_received: row.get(10)?,
            total_donations: row.get(11)?,
            clan_cards_collected: row.get(12)?,
            star_points: row.get(13)?,
            exp_points: row.get(14)?,
            total_exp_points: row.get(15)?,
            war_day_wins: row.get(16)?,
            challenge_cards_won: row.get(17)?,
            challenge_max_wins: row.get(18)?,
            tournament_cards_won: row.get(19)?,
            tournament_battle_count: row.get(20)?,
            current_win_lose_streak: row.get(21)?,
            legacy_trophy_road_high_score: row.get(22)?,
            clan_role: row.get(23)?,
            clan_tag: row.get(24)?,
            arena_id: row.get(25)?,
            win_rate: row.get(26)?,
            extracted_date: row.get(27)?,
        })
    }
}
