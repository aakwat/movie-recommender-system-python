// Run: node --test tests/*.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { compact, fold, prepare, search } from "../site/search.js";

const raw = ["The Dark Knight", "Batman Begins", "The Dark Knight Rises", "Dark City", "Amélie", "Darkman", "Spider-Man 3", "WALL·E"];
const titles = raw.map(prepare);

test("fold lowercases and strips accents; compact also drops punctuation", () => {
  assert.equal(fold("Amélie"), "amelie");
  assert.equal(compact("Spider-Man 3"), "spiderman3");
});

test("title start beats word start beats anywhere, shorter first", () => {
  assert.deepEqual(search(titles, "dark"), [5, 3, 0, 2]);
});

test("hyphens, spaces and dots do not matter", () => {
  assert.deepEqual(search(titles, "spiderman"), [6]);
  assert.deepEqual(search(titles, "spider man"), [6]);
  assert.deepEqual(search(titles, "wall e"), [7]);
});

test("a query can start at any word", () => {
  assert.deepEqual(search(titles, "knight"), [0, 2]);
});

test("accents and case do not matter", () => {
  assert.deepEqual(search(titles, "AMELIE"), [4]);
});

test("blank queries and no matches return nothing", () => {
  assert.deepEqual(search(titles, "  - "), []);
  assert.deepEqual(search(titles, "zzz"), []);
});

test("limit caps the result", () => {
  assert.equal(search(titles, "a", 2).length, 2);
});
