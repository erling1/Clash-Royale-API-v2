use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct BattleParticipant {
    pub queried_player_tag: String,
    pub battle_time: String,
    pub participant_side: String,
    pub slot: i64,
    pub player_tag: String,
    pub player_name: String,
    pub starting_trophies: Option<f64>,
    pub trophy_change: Option<f64>,
    pub crowns: i64,
    pub king_tower_hit_points: i64,
    pub princess_tower_1_hp: Option<f64>,
    pub princess_tower_2_hp: Option<f64>,
    pub total_tower_hp_remaining: Option<f64>,
    pub clan_tag: Option<String>,
    pub global_rank: Option<f64>,
    pub elixir_leaked: Option<f64>,
    pub is_winner: Option<bool>,
    pub extracted_date: String,
}

impl BattleParticipant {
    pub const COLUMNS: &'static str = "queried_player_tag, strftime(battle_time, '%Y-%m-%dT%H:%M:%S') AS battle_time, participant_side, slot, player_tag, player_name, starting_trophies, trophy_change, crowns, king_tower_hit_points, princess_tower_1_hp, princess_tower_2_hp, total_tower_hp_remaining, clan_tag, global_rank, elixir_leaked, is_winner, CAST(extracted_date AS VARCHAR) AS extracted_date";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            queried_player_tag: row.get(0)?,
            battle_time: row.get(1)?,
            participant_side: row.get(2)?,
            slot: row.get(3)?,
            player_tag: row.get(4)?,
            player_name: row.get(5)?,
            starting_trophies: row.get(6)?,
            trophy_change: row.get(7)?,
            crowns: row.get(8)?,
            king_tower_hit_points: row.get(9)?,
            princess_tower_1_hp: row.get(10)?,
            princess_tower_2_hp: row.get(11)?,
            total_tower_hp_remaining: row.get(12)?,
            clan_tag: row.get(13)?,
            global_rank: row.get(14)?,
            elixir_leaked: row.get(15)?,
            is_winner: row.get(16)?,
            extracted_date: row.get(17)?,
        })
    }
}
