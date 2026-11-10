from recommender import model


def test_similar_ranks_closest_and_never_returns_itself() -> None:
    tags = [
        "space alien war",
        "space alien battle",
        "cooking pasta kitchen",
        "space war fleet",
    ]
    result = model.similar(tags, k=2)
    assert all(i not in row for i, row in enumerate(result))
    assert result[0][0] in (1, 3)
    assert 2 not in result[0]


def test_identical_documents_still_find_each_other() -> None:
    result = model.similar(
        ["same words here", "same words here", "other text entirely"], k=1
    )
    assert result == [[1], [0], [0]]
