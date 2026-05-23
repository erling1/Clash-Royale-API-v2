import marimo

__generated_with = "0.23.6"
app = marimo.App(width="medium")


@app.cell
def _():
    import requests
    import json
    import pyarrow as pa
    import pyarrow.parquet as pq
    from pathlib import Path
    import pandas as pd 
    import duckdb 

    DATA_DIR = Path(__file__).parent
    RAW_DIR = DATA_DIR / "raw"
    return RAW_DIR, duckdb


@app.cell
def _(RAW_DIR):
    RAW_DIR
    return


@app.cell
def _(RAW_DIR, duckdb):
    battle_deck_cards     = RAW_DIR / "battle_deck_cards.parquet"
    battle_participants   = RAW_DIR / "battle_participants.parquet"
    battle_support_cards  = RAW_DIR / "battle_support_cards.parquet"
    battles               = RAW_DIR / "battles.parquet"
    players               = RAW_DIR / "players.parquet"
    pol_rankings          = RAW_DIR / "pol_rankings_2026-04.parquet"

    battle_deck_cards_tbl    = duckdb.sql(f"select * from read_parquet('{battle_deck_cards}')").to_arrow_table()
    battle_participants_tbl  = duckdb.sql(f"select * from read_parquet('{battle_participants}')").to_arrow_table()
    battle_support_cards_tbl = duckdb.sql(f"select * from read_parquet('{battle_support_cards}')").to_arrow_table()
    battles_tbl              = duckdb.sql(f"select * from read_parquet('{battles}')").to_arrow_table()
    players_tbl              = duckdb.sql(f"select * from read_parquet('{players}')").to_arrow_table()
    pol_rankings_tbl         = duckdb.sql(f"select * from read_parquet('{pol_rankings}')").to_arrow_table()
    return (
        battle_deck_cards_tbl,
        battle_participants_tbl,
        battle_support_cards_tbl,
        battles_tbl,
        players_tbl,
        pol_rankings_tbl,
    )


@app.cell
def _(
    battle_deck_cards_tbl,
    battle_participants_tbl,
    battle_support_cards_tbl,
    battles_tbl,
    players_tbl,
    pol_rankings_tbl,
):
    battle_deck_cards_tbl
    battle_participants_tbl
    battle_support_cards_tbl
    battles_tbl 
    players_tbl 
    pol_rankings_tbl 
    return


if __name__ == "__main__":
    app.run()
