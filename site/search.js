// Title search with no DOM, so it can be unit-tested on its own.

/** Lowercase and strip accents, so "amelie" finds "Amélie". */
export function fold(text) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// Letters and digits only, so "spiderman" matches "Spider-Man" and "wall e" matches "WALL·E".
export function compact(text) {
  return fold(text).replace(/[^\p{L}\p{N}]/gu, "");
}

/**
 * Done once per title: the compact title, and the compact rest of the title from each word on,
 * so a query can match from the start of any word ("knight" → "The Dark Knight").
 * @param {string} title
 * @returns {{ whole: string, fromWords: string[] }}
 */
export function prepare(title) {
  const words = fold(title).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return { whole: words.join(""), fromWords: words.slice(1).map((_, i) => words.slice(i + 1).join("")) };
}

/**
 * Indices of titles matching `query`: the title starts with it, then a word starts with it,
 * then it appears anywhere; shorter titles first within each group.
 * @param {ReturnType<typeof prepare>[]} prepared
 * @param {string} query
 * @param {number} limit
 * @returns {number[]}
 */
export function search(prepared, query, limit = 8) {
  const q = compact(query);
  if (!q) return [];
  const rank = (t) => {
    if (t.whole.startsWith(q)) return 0;
    if (t.fromWords.some((rest) => rest.startsWith(q))) return 1;
    return t.whole.includes(q) ? 2 : -1;
  };
  return prepared
    .map((t, index) => ({ index, r: rank(t), len: t.whole.length }))
    .filter((m) => m.r >= 0)
    .sort((a, b) => a.r - b.r || a.len - b.len || a.index - b.index)
    .slice(0, limit)
    .map((m) => m.index);
}
