import marimo

__generated_with = "0.23.6"
app = marimo.App(width="medium")


@app.cell
def _():
    import time
    import json
    import requests
    import urllib.parse
    import pandas as pd
    import pyarrow as pa
    import pyarrow.parquet as pq
    import duckdb
    from pathlib import Path

    DATA_DIR = Path(__file__).parent
    RAW_DIR = DATA_DIR / "raw"
    RAW_DIR.mkdir(exist_ok=True)
    return RAW_DIR, duckdb, pa, pd, pq, requests, time, urllib


@app.cell
def _(RAW_DIR):
    RAW_DIR
    return


@app.cell
def _():
    import os

    token = os.getenv("CR_API_TOKEN")
    if not token:
        raise RuntimeError(
            "CR_API_TOKEN not set — run `direnv allow` or `source .envrc`"
        )
    base_url = "https://api.clashroyale.com/v1"
    headers = {"Authorization": f"Bearer {token}"}
    return base_url, headers


@app.cell
def _(requests, time, urllib):
    def encode_tag(tag: str) -> str:
        # tags start with '#', URL-encode -> '%23'
        return urllib.parse.quote(tag, safe="")

    def get(url, headers, params=None, max_retries=3):
        # tiny helper: handles 429 by sleeping per Retry-After, raises on other errors
        for _ in range(max_retries):
            res = requests.get(url, headers=headers, params=params, timeout=30)
            if res.status_code == 200:
                return res.json()
            if res.status_code == 429:
                wait = int(res.headers.get("Retry-After", "2"))
                time.sleep(wait)
                continue
            res.raise_for_status()
        raise RuntimeError(f"giving up on {url} after {max_retries} tries")

    return encode_tag, get


@app.cell
def _(RAW_DIR, base_url, get, headers, pa, pd, pq):
    # ---- 1. fetch Path of Legend top 100 ----
    SEASON_ID = "2026-04"  # change as needed; current season may be "2026-05"
    LIMIT = 100

    pol_url = f"{base_url}/locations/global/pathoflegend/{SEASON_ID}/rankings/players"
    pol_raw = get(pol_url, headers, params={"limit": LIMIT})

    # flat - all fields are scalar except `clan` (one nested object per row)
    pol_df = pd.json_normalize(pol_raw["items"])
    pol_df["seasonId"] = SEASON_ID

    pq.write_table(
        pa.Table.from_pandas(pol_df),
        RAW_DIR / f"pol_rankings_{SEASON_ID}.parquet",
    )
    pol_df.head()
    return (pol_df,)


@app.cell
def _(pol_df):
    # ---- 2. extract player tags for chained calls ----
    player_tags = pol_df["tag"].tolist()
    len(player_tags), player_tags[:5]
    return (player_tags,)


@app.cell
def _(base_url, encode_tag, get, headers, player_tags, time):
    # ---- 3. fetch battlelog for each top player ----
    # battlelog endpoint returns a LIST (not wrapped in {"items": ...})
    def _fetch_battlelogs(tags):
        out = {}
        for idx, t in enumerate(tags):
            url = f"{base_url}/players/{encode_tag(t)}/battlelog"
            try:
                out[t] = get(url, headers)
            except Exception as e:
                print(f"[{idx}] {t} failed: {e}")
                out[t] = []
            time.sleep(0.1)  # gentle throttle
        return out

    battlelogs = _fetch_battlelogs(player_tags)
    sum(len(v) for v in battlelogs.values()), len(battlelogs)
    return (battlelogs,)


@app.cell
def _(battlelogs, pd):
    # ---- 4. normalize battlelogs into 4 flat tables ----
    # battle_id = queried_player_tag + battleTime (composite key)
    # one battle row, N participant rows (team + opponent), 8 card rows per participant
    def _normalize(logs):
        battles_rows = []
        participants_rows = []
        deck_cards_rows = []
        support_cards_rows = []

        for queried_tag, battles in logs.items():
            for b in battles:
                battle_id = f"{queried_tag}|{b.get('battleTime')}"

                battles_rows.append({
                    "battle_id": battle_id,
                    "queried_player_tag": queried_tag,
                    "type": b.get("type"),
                    "battleTime": b.get("battleTime"),
                    "isLadderTournament": b.get("isLadderTournament"),
                    "isHostedMatch": b.get("isHostedMatch"),
                    "leagueNumber": b.get("leagueNumber"),
                    "deckSelection": b.get("deckSelection"),
                    "arena_id": (b.get("arena") or {}).get("id"),
                    "arena_name": (b.get("arena") or {}).get("name"),
                    "gameMode_id": (b.get("gameMode") or {}).get("id"),
                    "gameMode_name": (b.get("gameMode") or {}).get("name"),
                })

                for side_name, side in (("team", b.get("team") or []), ("opponent", b.get("opponent") or [])):
                    for slot, p in enumerate(side):
                        participant_id = f"{battle_id}|{side_name}|{slot}"
                        clan = p.get("clan") or {}
                        pt_hp = p.get("princessTowersHitPoints") or []

                        participants_rows.append({
                            "participant_id": participant_id,
                            "battle_id": battle_id,
                            "side": side_name,
                            "slot": slot,
                            "player_tag": p.get("tag"),
                            "player_name": p.get("name"),
                            "startingTrophies": p.get("startingTrophies"),
                            "trophyChange": p.get("trophyChange"),
                            "crowns": p.get("crowns"),
                            "kingTowerHitPoints": p.get("kingTowerHitPoints"),
                            "princessTower1HP": pt_hp[0] if len(pt_hp) > 0 else None,
                            "princessTower2HP": pt_hp[1] if len(pt_hp) > 1 else None,
                            "clan_tag": clan.get("tag"),
                            "clan_name": clan.get("name"),
                            "clan_badgeId": clan.get("badgeId"),
                            "globalRank": p.get("globalRank"),
                            "elixirLeaked": p.get("elixirLeaked"),
                        })

                        for card_slot, c in enumerate(p.get("cards") or []):
                            deck_cards_rows.append({
                                "participant_id": participant_id,
                                "battle_id": battle_id,
                                "deck_slot": card_slot,
                                "card_id": c.get("id"),
                                "card_name": c.get("name"),
                                "level": c.get("level"),
                                "starLevel": c.get("starLevel"),
                                "evolutionLevel": c.get("evolutionLevel"),
                                "maxLevel": c.get("maxLevel"),
                                "maxEvolutionLevel": c.get("maxEvolutionLevel"),
                                "rarity": c.get("rarity"),
                                "elixirCost": c.get("elixirCost"),
                            })

                        for sc_slot, sc in enumerate(p.get("supportCards") or []):
                            support_cards_rows.append({
                                "participant_id": participant_id,
                                "battle_id": battle_id,
                                "support_slot": sc_slot,
                                "card_id": sc.get("id"),
                                "card_name": sc.get("name"),
                                "level": sc.get("level"),
                                "maxLevel": sc.get("maxLevel"),
                                "rarity": sc.get("rarity"),
                            })

        return (
            pd.DataFrame(battles_rows),
            pd.DataFrame(participants_rows),
            pd.DataFrame(deck_cards_rows),
            pd.DataFrame(support_cards_rows),
        )

    battles_df, participants_df, deck_cards_df, support_cards_df = _normalize(battlelogs)
    (len(battles_df), len(participants_df), len(deck_cards_df), len(support_cards_df))
    return battles_df, deck_cards_df, participants_df, support_cards_df


@app.cell
def _(
    RAW_DIR,
    battles_df,
    deck_cards_df,
    pa,
    participants_df,
    pq,
    support_cards_df,
):
    # ---- 5. write flat tables to parquet ----
    pq.write_table(pa.Table.from_pandas(battles_df), RAW_DIR / "battles.parquet")
    pq.write_table(pa.Table.from_pandas(participants_df), RAW_DIR / "battle_participants.parquet")
    pq.write_table(pa.Table.from_pandas(deck_cards_df), RAW_DIR / "battle_deck_cards.parquet")
    pq.write_table(pa.Table.from_pandas(support_cards_df), RAW_DIR / "battle_support_cards.parquet")
    list(RAW_DIR.glob("*.parquet"))
    return


@app.cell
def _(
    RAW_DIR,
    base_url,
    encode_tag,
    get,
    headers,
    pa,
    pd,
    player_tags,
    pq,
    time,
):
    # ---- 6. (optional) enrich with /players/{tag} for each top player ----
    # this is FLAT-ish at top level; arrays like `cards`, `currentDeck`, `badges`
    # we drop those array columns here and only keep scalar fields for now.
    def _fetch_players(tags):
        scalar_keep = [
            "tag", "name", "expLevel", "trophies", "bestTrophies", "wins", "losses",
            "battleCount", "threeCrownWins", "donations", "donationsReceived",
            "totalDonations", "clanCardsCollected", "starPoints", "expPoints",
            "totalExpPoints", "warDayWins", "challengeCardsWon", "challengeMaxWins",
            "tournamentCardsWon", "tournamentBattleCount", "currentWinLoseStreak",
            "legacyTrophyRoadHighScore", "role",
        ]
        rows = []
        for idx, t in enumerate(tags):
            try:
                pl = get(f"{base_url}/players/{encode_tag(t)}", headers)
            except Exception as e:
                print(f"[{idx}] {t} failed: {e}")
                continue
            row = {k: pl.get(k) for k in scalar_keep}
            pl_clan = pl.get("clan") or {}
            row["clan_tag"] = pl_clan.get("tag")
            row["clan_name"] = pl_clan.get("name")
            row["clan_badgeId"] = pl_clan.get("badgeId")
            pl_arena = pl.get("arena") or {}
            row["arena_id"] = pl_arena.get("id")
            row["arena_name"] = pl_arena.get("name")
            rows.append(row)
            time.sleep(0.1)
        return pd.DataFrame(rows)

    players_df = _fetch_players(player_tags)
    pq.write_table(pa.Table.from_pandas(players_df), RAW_DIR / "players.parquet")
    players_df.head()
    return


@app.cell
def _(RAW_DIR, duckdb):
    # ---- 7. sanity-check with duckdb: most-played cards across top-100 PoL battles ----
    con = duckdb.connect()
    top_cards = con.execute(f"""
        SELECT card_name, COUNT(*) AS uses
        FROM read_parquet('{RAW_DIR / "battle_deck_cards.parquet"}')
        GROUP BY card_name
        ORDER BY uses DESC
        LIMIT 20
    """).fetch_df()
    top_cards
    return


@app.cell
def _(RAW_DIR):
    print(type(RAW_DIR))
    return


@app.cell
def _(RAW_DIR, duckdb):
    battle_deck_cards = RAW_DIR / "battle_deck_cards.parquet"
    print(battle_deck_cards)
    duckdb.sql(f"""select * from read_parquet('{battle_deck_cards}') where participant_id = '#GU2YR209R|20260519T001051.000Z|team|0' """).to_arrow_table()
    duckdb.sql(f"""select * from read_parquet('{battle_deck_cards}') """).to_arrow_table()
    return


if __name__ == "__main__":
    app.run()
