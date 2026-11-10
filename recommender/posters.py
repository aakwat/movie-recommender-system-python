import json
import time
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Iterable
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

API = "https://api.themoviedb.org/3/movie/"
WORKERS = 8


def _fetch(movie_id: int, api_key: str) -> str | None:
    url = f"{API}{movie_id}?{urllib.parse.urlencode({'api_key': api_key})}"
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=15) as response:
                path = json.load(response).get("poster_path")
                return str(path) if path else None
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return None
            # 429 and 5xx are worth another try; anything else is a real failure.
            if error.code != 429 and error.code < 500:
                raise
        except urllib.error.URLError:
            pass
        time.sleep(2**attempt)
    raise RuntimeError(f"TMDB kept failing for movie {movie_id}")


SAVE_EVERY = 200


def _save(cache: Path, known: dict[int, str | None]) -> None:
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(known))


def poster_paths(
    ids: Iterable[int], api_key: str, cache: Path
) -> dict[int, str | None]:
    """TMDB poster path per movie id; already-known ids come from the cache file, so reruns are quick."""
    known: dict[int, str | None] = {}
    if cache.exists():
        known = {int(k): v for k, v in json.loads(cache.read_text()).items()}
    missing = [i for i in ids if i not in known]
    with ThreadPoolExecutor(WORKERS) as pool:
        futures = {pool.submit(_fetch, i, api_key): i for i in missing}
        # Saved as it goes, so an interrupted run keeps what it already fetched.
        for done, future in enumerate(as_completed(futures), start=1):
            known[futures[future]] = future.result()
            if done % SAVE_EVERY == 0:
                _save(cache, known)
    _save(cache, known)
    return known
