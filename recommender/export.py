import json
from collections.abc import Mapping, Sequence
from pathlib import Path

from recommender.dataset import Movie


def write(
    movies: Sequence[Movie],
    similar: Sequence[Sequence[int]],
    posters: Mapping[int, str | None],
    out: Path,
) -> None:
    """Compact JSON for the site: movies as [id, title, year, poster], and similar as indices into that list."""
    data = {
        "movies": [[m.id, m.title, m.year, posters.get(m.id)] for m in movies],
        "similar": similar,
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
