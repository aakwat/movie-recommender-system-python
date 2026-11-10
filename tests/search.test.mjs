// Run: node --test tests/
import assert from "node:assert/strict";
import { test } from "node:test";
import { fold, search } from "../site/search.js";

const titles = ["The Dark Knight", "Batman Begins", "The Dark Knight Rises", "Dark City", "Amélie", "Darkman"].map(fold);

test("fold lowercases and strips accents", () => {
  assert.equal(fold("Amélie"), "amelie");
});

test("prefix beats word start beats substring, shorter first", () => {
  assert.deepEqual(search(titles, "dark"), [5, 3, 0, 2]);
});

test("accents and case do not matter", () => {
  assert.deepEqual(search(titles, "AMELIE"), [4]);
});

test("blank queries and no matches return nothing", () => {
  assert.deepEqual(search(titles, "   "), []);
  assert.deepEqual(search(titles, "zzz"), []);
});

test("limit caps the result", () => {
  assert.equal(search(titles, "a", 2).length, 2);
});
