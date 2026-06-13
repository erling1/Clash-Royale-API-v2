"""
Extract Clash Royale Path-of-Legend data and write to dbt's hive-partitioned raw layer.

Output layout (relative to project root):
    dbt/data/raw/<table>/dt=<YYYY-MM-DD>/<file>.parquet

Tables produced (one parquet per run):
    pol_rankings, battles, battle_participants,
    battle_deck_cards, battle_support_cards, players, cards

Run manually:
    uv run python extract/extract.py

Environment:
    CR_API_TOKEN    required - Supercell developer token
    POL_LIMIT       optional - top N players, default = 1000

Cron example (every day at 03:00):
    0 3 * * * cd /Users/erlnup/Documents/ClashRoyale && \
        CR_API_TOKEN=xxx /opt/homebrew/bin/uv run python extract/extract.py \
        >> logs/extract.log 2>&1
"""

import json
import logging
import os
import sys
import time
import urllib.parse
from contextlib import contextmanager
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ---- config ----------------------------------------------------------------
TOKEN = os.getenv("CR_API_TOKEN")
BASE_URL = "https://api.clashroyale.com/v1"
# PoL rankings publish only for completed seasons → always last month.
SEASON_ID = (date.today().replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
LIMIT = int(os.getenv("POL_LIMIT", "1000"))
TODAY = date.today().strftime("%Y-%m-%d")

# extract/extract.py -> project root
ROOT = Path(__file__).resolve().parent.parent
RAW_ROOT = ROOT / "dbt" / "data" / "raw"


# ---- logging ---------------------------------------------------------------
class JsonFormatter(logging.Formatter):
    def format(self, record):
        log = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "message": record.getMessage(),
        }
        log.update(getattr(record, "extra_fields", {}))
        return json.dumps(log)


handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger = logging.getLogger("extract")
logger.addHandler(handler)
logger.setLevel(logging.INFO)


@contextmanager
def track_call(endpoint: str):
    start = time.perf_counter()
    try:
        yield
        elapsed = (time.perf_counter() - start) * 1000
        logger.info(
            "api_ok",
            extra={"extra_fields": {"endpoint": endpoint, "ms": round(elapsed, 1)}},
        )
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        logger.error(
            "api_err",
            extra={
                "extra_fields": {
                    "endpoint": endpoint,
                    "ms": round(elapsed, 1),
                    "err": str(e),
                    "err_type": type(e).__name__,
                }
            },
        )
        raise


# ---- http ------------------------------------------------------------------
def encode_tag(tag: str) -> str:
    return urllib.parse.quote(tag, safe="")


def build_session() -> requests.Session:
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"],
    )
    s = requests.Session()
    s.headers.update(
        {"Authorization": f"Bearer {TOKEN}", "Accept": "application/json"}
    )
    s.mount("https://", HTTPAdapter(max_retries=retry))
    return s


def get(session: requests.Session, endpoint: str, params=None):
    with track_call(endpoint):
        res = session.get(f"{BASE_URL}{endpoint}", params=params, timeout=30)
        res.raise_for_status()
        return res.json()


# ---- io --------------------------------------------------------------------
def write_parquet(df: pd.DataFrame, table_name: str, filename: str | None = None) -> Path:
    out_dir = RAW_ROOT / table_name / f"dt={TODAY}"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / (filename or f"{table_name}.parquet")
    pq.write_table(pa.Table.from_pandas(df), out_path)
    logger.info(
        "wrote_parquet",
        extra={
            "extra_fields": {
                "table": table_name,
                "rows": len(df),
                "path": str(out_path.relative_to(ROOT)),
            }
        },
    )
    return out_path


# ---- fetchers --------------------------------------------------------------
def fetch_pol_rankings(session) -> pd.DataFrame:
    data = get(
        session,
        f"/locations/global/pathoflegend/{SEASON_ID}/rankings/players",
        params={"limit": LIMIT},
    )
    df = pd.json_normalize(data["items"])
    df["seasonId"] = SEASON_ID
    return df


def fetch_battlelogs(session, tags: list[str]) -> dict:
    out = {}
    for idx, t in enumerate(tags):
        try:
            out[t] = get(session, f"/players/{encode_tag(t)}/battlelog")
        except Exception as e:
            logger.warning(
                "battlelog_failed",
                extra={"extra_fields": {"player": t, "idx": idx, "err": str(e)}},
            )
            out[t] = []
        time.sleep(0.1)
    return out


def fetch_cards(session) -> pd.DataFrame:
    data = get(session, "/cards", params={"limit": 500})
    rows = []
    for c in data.get("items", []):
        icons = c.get("iconUrls") or {}
        rows.append({
            "id": c.get("id"),
            "name": c.get("name"),
            "rarity": c.get("rarity"),
            "elixirCost": c.get("elixirCost"),
            "maxLevel": c.get("maxLevel"),
            "maxEvolutionLevel": c.get("maxEvolutionLevel"),
            "iconUrls_medium": icons.get("medium"),
            "iconUrls_heroMedium": icons.get("heroMedium"),
            "iconUrls_evolutionMedium": icons.get("evolutionMedium"),
        })
    return pd.DataFrame(rows)


def fetch_players(session, tags: list[str]) -> pd.DataFrame:
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
            pl = get(session, f"/players/{encode_tag(t)}")
        except Exception as e:
            logger.warning(
                "player_failed",
                extra={"extra_fields": {"player": t, "idx": idx, "err": str(e)}},
            )
            continue
        row = {k: pl.get(k) for k in scalar_keep}
        clan = pl.get("clan") or {}
        row["clan_tag"] = clan.get("tag")
        row["clan_name"] = clan.get("name")
        row["clan_badgeId"] = clan.get("badgeId")
        arena = pl.get("arena") or {}
        row["arena_id"] = arena.get("id")
        row["arena_name"] = arena.get("name")
        rows.append(row)
        time.sleep(0.1)
    return pd.DataFrame(rows)


# ---- normalizer ------------------------------------------------------------
def normalize_battlelogs(logs: dict):
    """battlelog json -> 4 flat tables (battles, participants, deck_cards, support_cards)."""
    battles_rows, participants_rows, deck_rows, support_rows = [], [], [], []

    for queried_tag, battles in logs.items():
        for b in battles:
            battles_rows.append({
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
                    clan = p.get("clan") or {}
                    pt_hp = p.get("princessTowersHitPoints") or []

                    participants_rows.append({
                        "queried_player_tag": queried_tag,
                        "battleTime": b.get("battleTime"),
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
                        deck_rows.append({
                            "queried_player_tag": queried_tag,
                            "battleTime": b.get("battleTime"),
                            "side": side_name,
                            "slot": slot,
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
                        support_rows.append({
                            "queried_player_tag": queried_tag,
                            "battleTime": b.get("battleTime"),
                            "side": side_name,
                            "slot": slot,
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
        pd.DataFrame(deck_rows),
        pd.DataFrame(support_rows),
    )


# ---- main ------------------------------------------------------------------
def main():
    if not TOKEN:
        logger.error("missing_token", extra={"extra_fields": {"hint": "set CR_API_TOKEN"}})
        sys.exit(1)

    logger.info(
        "starting",
        extra={
            "extra_fields": {
                "season": SEASON_ID,
                "limit": LIMIT,
                "dt": TODAY,
                "raw_root": str(RAW_ROOT.relative_to(ROOT)),
            }
        },
    )

    session = build_session()

    pol_df = fetch_pol_rankings(session)
    write_parquet(pol_df, "pol_rankings", f"pol_rankings_{SEASON_ID}.parquet")

    tags = pol_df["tag"].tolist()

    logs = fetch_battlelogs(session, tags)
    battles_df, participants_df, deck_df, support_df = normalize_battlelogs(logs)
    write_parquet(battles_df, "battles")
    write_parquet(participants_df, "battle_participants")
    write_parquet(deck_df, "battle_deck_cards")
    write_parquet(support_df, "battle_support_cards")

    players_df = fetch_players(session, tags)
    write_parquet(players_df, "players")

    cards_df = fetch_cards(session)
    write_parquet(cards_df, "cards")

    logger.info("done")


if __name__ == "__main__":
    main()
