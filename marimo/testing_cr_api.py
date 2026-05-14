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

    DATA_DIR = Path(__file__).parent
    return DATA_DIR, pa, pd, pq, requests


@app.cell
def _(DATA_DIR, pa, pd, pq, requests):
    token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjcxYTM1MDZlLTA5ZmUtNGIwNy04OGY1LTZmODJiZDFkYmRhOSIsImlhdCI6MTc3ODc3MjUxOCwic3ViIjoiZGV2ZWxvcGVyL2E3ZTllYjU4LWJiYzYtOGMyMS0xNDdjLWI0MzQ5NTQ2YmJjOCIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIxMDkuMTc5LjM0Ljc3Il0sInR5cGUiOiJjbGllbnQifV19.mqVye38joJKmqlbHxqTcazUCbo40EjMTQ8WT_ceT4vgPD5pTd5Ve9K3xFyTwjXJKXjxGahcew_SoxWV58R7aFQ"


    headers = {"Authorization": f"Bearer {token}"}

    params = {"minScore": 60000}

    base_url = "https://api.clashroyale.com/v1"



    ENDPOINTS_not_nested = [
        "/cards",              # full card catalog
        "/leaderboards",       # list of available leaderboards
        "/globaltournaments",  # active global tournaments
        #"/events",             # current in-game events
        #"/tournaments",        # search tournaments (technically takes optional query params)
        "/locations",          # all locations (if you ever want them)
    ]

    ENDPOINTS_NESTED = [ "/cards",  ]

    top_players = "/locations/global/rankings/players"
    params = {"limit": 10}

    leaderboard = "/leaderboards"
    for endpoint in ENDPOINTS_not_nested:
        res = requests.get(f"{base_url}{endpoint}",headers=headers)


        print("Status:", res.status_code)
        print("URL called:", res.url)            # shows the final URL with params expanded
        print("Body:", res.json())

    
        arrow = pa.Table.from_pylist(res.json()["items"])

        pq.write_table(arrow, DATA_DIR / f"{endpoint.strip('/')}.parquet")

    for endpoint in ENDPOINTS_NESTED:

        res = requests.get(f"{base_url}{endpoint}", headers=headers)

        df = pd.json_normalize(res.json()["items"])
        arrow = pa.Table.from_pandas(df)
        pq.write_table(arrow, DATA_DIR / f"{endpoint.strip('/')}.parquet")
    
    

    return


@app.cell
def _(DATA_DIR, pq):
    cards = pq.read_table(DATA_DIR / "cards.parquet")
    leaderboards = pq.read_table(DATA_DIR / "leaderboards.parquet")
    globaltournaments = pq.read_table(DATA_DIR / "globaltournaments.parquet")
    locations = pq.read_table(DATA_DIR / "locations.parquet")
    return (locations,)


@app.cell
def _(locations):
    locations

    return


if __name__ == "__main__":
    app.run()
