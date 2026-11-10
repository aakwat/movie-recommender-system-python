from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from recommender import features


@dataclass(frozen=True)
class Movie:
    id: int
    title: str
    year: int | None
    tags: str


def _year(release_date: object) -> int | None:
    return (
        int(str(release_date)[:4])
        if isinstance(release_date, str) and release_date[:4].isdigit()
        else None
    )


def load(directory: Path) -> list[Movie]:
    """Movies with an overview, merged with their credits by id (titles repeat, ids do not)."""
    movies = pd.read_csv(directory / "tmdb_5000_movies.csv")
    credits = pd.read_csv(directory / "tmdb_5000_credits.csv").drop(columns="title")
    merged = movies.merge(credits, left_on="id", right_on="movie_id").dropna(
        subset=["overview"]
    )
    records: list[dict[str, object]] = merged.to_dict("records")  # pyright: ignore[reportAssignmentType]
    return [_movie(row) for row in records]


def _movie(row: dict[str, object]) -> Movie:
    text = {
        key: str(row[key]) for key in ("overview", "genres", "keywords", "cast", "crew")
    }
    return Movie(
        id=int(str(row["id"])),
        title=str(row["title"]),
        year=_year(row["release_date"]),
        tags=features.tags(
            overview=text["overview"],
            genres=features.names(text["genres"]),
            keywords=features.names(text["keywords"]),
            cast=features.names(text["cast"], limit=3),
            crew=features.director(text["crew"]),
        ),
    )
