import logging
import json
import time
from contextlib import contextmanager
import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

TOKEN = os.getenv("CR_API_TOKEN")


class JsonFormatter(logging.Formatter):
    def format(self, record):
        log = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "message": record.getMessage(),
        }
        log.update(record.extra_fields)
        return json.dumps(log)


handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger = logging.getLogger("sync")
logger.addHandler(handler)
logger.setLevel(logging.INFO)


@contextmanager
def track_call(endpoint: str):
    start = time.perf_counter()
    extra = {"endpoint": endpoint}
    try:
        yield extra
        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "api_call_success",
            extra={"extra_fields": {**extra, "duration_ms": round(elapsed_ms, 1)}},
        )
    except Exception as e:
        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.error(
            "api_call_failure",
            extra={
                "extra_fields": {
                    **extra,
                    "duration_ms": round(elapsed_ms, 1),
                    "error": str(e),
                    "error_type": type(e).__name__,
                }
            },
        )
        raise


retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"],
)
adapter = HTTPAdapter(max_retries=retry_strategy)


BASE_URL = "https://api.clashroyale.com/v1"

endpoints =


def make_api_call(session,endpoint: str):
    with track_call(endpoint):
        res = session.get(f"{base_url}{endpoint}", params=params)
        res.raise_for_status()
        return res.json()


with requests.Session() as session:
    session.headers.update(
        {
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/json",
        }
    )
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({"Authorization": f"Bearer {TOKEN}"})

    for endpoint in endpoints:
        data = make_api_call(endpoint)
