import json
from functools import cache

from nltk.stem.porter import PorterStemmer

_stemmer = PorterStemmer()


def names(raw: str, limit: int | None = None) -> list[str]:
    """The `name` of each entry in a TMDB JSON list column, optionally only the first `limit`."""
    entries: list[dict[str, object]] = json.loads(raw)
    return [str(e["name"]) for e in entries[:limit]]


def director(raw_crew: str) -> list[str]:
    """The first Director in a crew list, as a one-item list (empty when there is none)."""
    crew: list[dict[str, object]] = json.loads(raw_crew)
    return next(([str(p["name"])] for p in crew if p.get("job") == "Director"), [])


def squash(items: list[str]) -> list[str]:
    # "Sam Worthington" becomes one token, so it cannot match another Sam.
    return [item.replace(" ", "") for item in items]


@cache
def _stem_word(word: str) -> str:
    return _stemmer.stem(word)


def stem(text: str) -> str:
    return " ".join(_stem_word(word) for word in text.split())


def tags(
    overview: str,
    genres: list[str],
    keywords: list[str],
    cast: list[str],
    crew: list[str],
) -> str:
    """The text a movie is compared by: overview words plus squashed genres, keywords, top cast and director."""
    words = (
        overview.split()
        + squash(genres)
        + squash(keywords)
        + squash(cast)
        + squash(crew)
    )
    return stem(" ".join(words).lower())
