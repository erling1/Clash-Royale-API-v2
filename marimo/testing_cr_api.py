import marimo

__generated_with = "0.23.6"
app = marimo.App(width="medium")


@app.cell
def _(battle_deck_cards_tbl, battle_support_cards_tbl):
    battle_deck_cards_tbl
    battle_support_cards_tbl
    return


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



    import duckdb

    # Dictionary mapping table names to their Arrow tables
    tables = {
        "battle_deck_cards": battle_deck_cards_tbl,
        "battle_participants": battle_participants_tbl,
        "battle_support_cards": battle_support_cards_tbl,
        "battles": battles_tbl,
        "players": players_tbl,
        "pol_rankings": pol_rankings_tbl,
    }

    con = duckdb.connect()

    for name, arrow_tbl in tables.items():
        # Register the arrow table so DuckDB can query it
        con.register(name, arrow_tbl)

        print("=" * 100)
        print(f"TABLE: {name}")
        print("=" * 100)

        # --- Row & column counts ---
        row_count = con.sql(f"SELECT COUNT(*) AS n FROM {name}").fetchone()[0]
        col_count = len(arrow_tbl.schema)
        print(f"\nRows: {row_count:,}  |  Columns: {col_count}")

        # --- Schema (column name + type) ---
        print("\n--- SCHEMA ---")
        schema_df = con.sql(f"DESCRIBE SELECT * FROM {name}").df()
        print(schema_df.to_string(index=False))

        # --- Per-column stats: null count, distinct count, min, max ---
        print("\n--- COLUMN STATS (nulls, distinct, min, max) ---")
        stats_rows = []
        for col_name, col_type in zip(schema_df["column_name"], schema_df["column_type"]):
            quoted = f'"{col_name}"'
            try:
                nulls, distinct = con.sql(f"""
                    SELECT
                        SUM(CASE WHEN {quoted} IS NULL THEN 1 ELSE 0 END),
                        COUNT(DISTINCT {quoted})
                    FROM {name}
                """).fetchone()
            except Exception as e:
                nulls, distinct = f"err: {e}", "-"

            # min/max only for types where it makes sense
            mn, mx = "-", "-"
            if any(t in col_type.upper() for t in
                   ["INT", "DECIMAL", "DOUBLE", "FLOAT", "REAL",
                    "DATE", "TIMESTAMP", "TIME", "VARCHAR", "BIGINT", "HUGEINT"]):
                try:
                    mn, mx = con.sql(
                        f"SELECT MIN({quoted}), MAX({quoted}) FROM {name}"
                    ).fetchone()
                except Exception:
                    mn, mx = "-", "-"

            stats_rows.append((col_name, col_type, nulls, distinct, mn, mx))

        # Pretty-print stats table
        header = f"{'column':<35} {'type':<25} {'nulls':>10} {'distinct':>10}  min / max"
        print(header)
        print("-" * len(header))
        for col_name, col_type, nulls, distinct, mn, mx in stats_rows:
            print(f"{col_name[:34]:<35} {col_type[:24]:<25} {str(nulls):>10} {str(distinct):>10}  {mn} / {mx}")

        # --- Sample rows ---
        print("\n--- SAMPLE ROWS (first 5) ---")
        sample = con.sql(f"SELECT * FROM {name} LIMIT 5").df()
        # Show full content without truncation
        with_opts = sample.to_string(index=False, max_colwidth=60)
        print(with_opts)

        # --- For low-cardinality columns: show value distribution ---
        print("\n--- VALUE DISTRIBUTIONS (categorical-looking columns, <=20 distinct) ---")
        any_shown = False
        for col_name, col_type, nulls, distinct, _, _ in stats_rows:
            if isinstance(distinct, int) and 1 < distinct <= 20:
                quoted = f'"{col_name}"'
                try:
                    dist_df = con.sql(f"""
                        SELECT {quoted} AS value, COUNT(*) AS n
                        FROM {name}
                        GROUP BY 1
                        ORDER BY n DESC
                    """).df()
                    print(f"\n  {col_name} ({distinct} distinct):")
                    print(dist_df.to_string(index=False))
                    any_shown = True
                except Exception:
                    pass
        if not any_shown:
            print("  (none)")

        print("\n")
    return battle_deck_cards_tbl, battle_support_cards_tbl


if __name__ == "__main__":
    app.run()
