# Movie Recommender

Pick a film and get the 50 most similar ones, ranked by content.

Live: <https://movies.aungkokolwin.workers.dev>

## How it works

1. **Build (Python, offline).** `python -m recommender` reads the TMDB 5000 dataset, turns each
   movie's overview, genres, keywords, top cast and director into one stemmed tag string, counts
   words (scikit-learn `CountVectorizer`, 5000 features) and keeps each film's 50 nearest
   neighbours by cosine similarity. Posters come from the TMDB API and are cached between runs.
2. **Site (static).** The result is one JSON file (`site/data/recommendations.json`, about 1.4 MB,
   640 KB over the wire). The page searches titles in the browser as you type, ignoring
   punctuation ("spiderman" finds "Spider-Man"), and scrolls through the ranked results.
3. **Hosting.** Cloudflare static assets only, with no Worker script and no server: free, and
   nothing to cold-start.

```
dataset/*.csv  ->  python -m recommender  ->  site/data/recommendations.json  ->  Cloudflare
```

## Setup

Needs [Nix](https://nixos.org) (or Python 3.14 and [uv](https://docs.astral.sh/uv/) yourself).

```sh
nix develop
uv sync
```

Download the [TMDB 5000 dataset](https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata) and put
`tmdb_5000_movies.csv` and `tmdb_5000_credits.csv` in `dataset/`.

For posters, put a TMDB API key (v3 "API Key") in `.env`, which git ignores:

```sh
TMDB_API_KEY=your-key-here
```

## Build the data

```sh
uv run --env-file .env python -m recommender
```

Options: `--top 50` (similar films kept per movie), `--no-posters` (skip TMDB, no key needed),
`--data` and `--out` for other paths.

## Test

```sh
uv run pytest
node --test tests/*.test.mjs
```

## Run and deploy

```sh
npx wrangler dev      # local preview of site/
npx wrangler deploy   # publish to Cloudflare
```

## Layout

- `recommender/`: the build: `dataset.py` (load and merge), `features.py` (tags), `model.py`
  (similarity), `posters.py` (TMDB with a cache), `export.py` (JSON for the site).
- `site/`: the static page: `index.html`, `app.js`, `search.js`, `style.css`, `_headers`.
- `tests/`: Python tests for features and model, Node tests for search.

## License

MIT, see [LICENSE](LICENSE). Movie data and posters from [TMDB](https://www.themoviedb.org); this
product uses the TMDB API but is not endorsed or certified by TMDB.
