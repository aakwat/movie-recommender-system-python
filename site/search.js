// Title search with no DOM, so it can be unit-tested on its own.

/** Lowercase and strip accents, so "amelie" finds "Amélie". */
export function fold(text) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/**
 * Indices of titles matching `query`: titles that start with it first, then words that do,
 * then any substring; shorter titles first within each group.
 * @param {string[]} folded titles already passed through fold()
 * @param {string} query
 * @param {number} limit
 * @returns {number[]}
 */
export function search(folded, query, limit = 8) {
  const q = fold(query.trim());
  if (!q) return [];
  const rank = (title) => {
    if (title.startsWith(q)) return 0;
    if (title.includes(` ${q}`)) return 1;
    return title.includes(q) ? 2 : -1;
  };
  return folded
    .map((title, index) => ({ index, r: rank(title), len: title.length }))
    .filter((m) => m.r >= 0)
    .sort((a, b) => a.r - b.r || a.len - b.len || a.index - b.index)
    .slice(0, limit)
    .map((m) => m.index);
}
