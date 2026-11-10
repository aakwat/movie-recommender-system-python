from recommender import features

CAST = '[{"name": "Sam Worthington"}, {"name": "Zoe Saldana"}, {"name": "Sigourney Weaver"}, {"name": "Stephen Lang"}]'
CREW = '[{"job": "Producer", "name": "Jon Landau"}, {"job": "Director", "name": "James Cameron"}]'


def test_names_reads_json_and_limits() -> None:
    assert features.names(CAST, limit=3) == [
        "Sam Worthington",
        "Zoe Saldana",
        "Sigourney Weaver",
    ]
    assert features.names("[]") == []


def test_director_finds_the_first_director() -> None:
    assert features.director(CREW) == ["James Cameron"]
    assert features.director('[{"job": "Writer", "name": "X"}]') == []


def test_tags_squash_names_lowercase_and_stem() -> None:
    text = features.tags(
        "Marines fighting aliens",
        ["Science Fiction"],
        [],
        ["Sam Worthington"],
        ["James Cameron"],
    )
    assert text == "marin fight alien sciencefict samworthington jamescameron"
