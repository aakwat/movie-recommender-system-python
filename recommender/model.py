from collections.abc import Sequence

import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

MAX_FEATURES = 5000


def similar(tags: Sequence[str], k: int = 5) -> list[list[int]]:
    """For each document, the indices of the k most similar others by cosine similarity of word counts."""
    vectors = CountVectorizer(
        max_features=MAX_FEATURES, stop_words="english"
    ).fit_transform(tags)
    scores = cosine_similarity(vectors)
    # A movie is always most similar to itself; exclude it explicitly rather than skipping rank 0,
    # which would drop a different film when two have identical tags.
    np.fill_diagonal(scores, -1.0)
    # Stable sort, so ties keep dataset order and the output is reproducible.
    order = np.argsort(-scores, axis=1, kind="stable")[:, :k]
    return [[int(i) for i in row] for row in order]
