import argparse
import os
from pathlib import Path

from recommender import dataset, export, model, posters


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build recommendations.json from the TMDB 5000 dataset."
    )
    parser.add_argument("--data", type=Path, default=Path("dataset"))
    parser.add_argument("--out", type=Path, default=Path("site/data/recommendations.json"))
    parser.add_argument(
        "--no-posters", action="store_true", help="skip TMDB; posters stay empty"
    )
    args = parser.parse_args()

    movies = dataset.load(args.data)
    similar = model.similar([m.tags for m in movies])
    found: dict[int, str | None] = {}
    if not args.no_posters:
        key = os.environ.get("TMDB_API_KEY")
        if not key:
            raise SystemExit(
                "TMDB_API_KEY is not set; run with: uv run --env-file .env python -m recommender"
            )
        found = posters.poster_paths(
            (m.id for m in movies), key, Path("build/posters-cache.json")
        )
    export.write(movies, similar, found, args.out)
    with_poster = sum(1 for m in movies if found.get(m.id))
    print(
        f"{len(movies)} movies, {with_poster} with posters -> {args.out} ({args.out.stat().st_size // 1024} KB)"
    )


if __name__ == "__main__":
    main()
