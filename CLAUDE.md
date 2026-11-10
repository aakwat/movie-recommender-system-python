# CLAUDE.md

Rules for agents working in this repo. If a rule needs a paragraph to justify
itself, it is probably wrong.

## Working agreement

- Verify before claiming. Read the file, run the command, quote the output.
  Never report something as working that you have not seen work.
- Do not run builds, test suites or migrations unprompted. Name the command and
  let me run it.
- State the blast radius before editing: which files, which callers.
- Finish the task you were given. If you find a second problem, name it; do not
  silently widen scope.
- Ambiguity that changes the work is worth one question. Ambiguity that does not
  is worth a default and a sentence saying which you picked.
- Do not trust existing code or comments. They were right once.

## Comments

- One line. If it needs three, fix the code instead.
- Explain why, never what. `// increment i` is noise.
- One comment, one reason. Do not staple two unrelated facts together.
- Comment the non-obvious: a workaround, an ordering requirement, a constraint
  that is not visible locally, a deliberate omission.
- No commented-out code. Git remembers it.
- A stale comment is worse than none. Change it with the code or delete it.

## Commits

- One-line subject, imperative, no trailing period.
- No body unless the change is genuinely non-obvious. No trailers, no
  Co-Authored-By, no emoji.
- One logical change per commit. Use `git commit -- <path>` rather than sweeping
  in unrelated files.
- Never commit working-tree changes you did not make.

## Structure

- Single responsibility at every level: function, module, layer.
- No single large file. Split a file when it starts doing two things, not after
  it does four.
- Layer by layer. Dependencies point inward: the core knows nothing about
  transport, storage or frameworks.
- Module by module. A module exposes a small surface and hides the rest.
- Before adding an abstraction, say what breaks without it. One implementation
  needs no interface; a value that never changes needs no config.
- Deleting code is a valid change, and usually the better one.
- Shortest correct change in the right place. A small diff in the wrong place is
  a second bug.
- Re-think before you build: is this worth its own file, layer, or dependency?
  Most of the time the answer is no.

## Python

### Tooling

- `uv` owns dependencies. `uv add` / `uv sync`, and `uv.lock` is committed.
  Nix provides the interpreter and tooling, not the libraries.
- `ruff check` and `ruff format`. One tool, no black/isort/flake8 stack.
- Type hints on every public function. `basedpyright` runs in strict mode where
  the code allows it.

### Style

- No bare `except:`. Catch the exception you can actually handle.
- No mutable default arguments. `def f(x=[])` is a bug with a delay.
- Dataclasses or Pydantic models over dicts passed between layers. A dict is an
  undocumented schema.
- f-strings, not `%` or `.format()`.
- `pathlib.Path`, not string paths.

### Layering

```
domain      plain classes; no ORM, no framework imports
services    use cases; the transaction boundary
repositories  data access; the only place that knows the ORM exists
api / views  HTTP only — parse, delegate, serialise
```

Framework-specific notes:

- Django: fat models are a trap once a model is used by two flows. Keep
  behaviour in services and let the model hold data and invariants.
- FastAPI: Pydantic schemas are the wire contract, not the domain type.
  Convert at the boundary.
- Flask: blueprints per feature, app factory, no module-level global state.
