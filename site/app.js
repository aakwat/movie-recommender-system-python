import { fold, search } from "./search.js";

const IMAGES = "https://image.tmdb.org/t/p/";
const SUGGEST = ["The Avengers", "Toy Story", "The Dark Knight", "Inception", "Spirited Away", "The Notebook"];
// Wait for a short pause in typing before ranking 4,800 titles.
const TYPING_PAUSE_MS = 120;

const $ = (id) => document.getElementById(id);
const input = $("q");

/** @typedef {[id: number, title: string, year: number | null, poster: string | null]} Movie */
/** @type {{ movies: Movie[], similar: number[][] }} */
let data;
/** @type {string[]} */
let folded = [];
let current = -1;

const label = (m) => (m[2] ? `${m[1]} (${m[2]})` : m[1]);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function poster(m) {
  const box = el("div", "poster");
  if (m[3]) {
    const img = el("img");
    img.src = `${IMAGES}w342${m[3]}`;
    img.srcset = `${IMAGES}w185${m[3]} 185w, ${IMAGES}w342${m[3]} 342w, ${IMAGES}w500${m[3]} 500w`;
    img.sizes = "(max-width: 40rem) 45vw, 20vw";
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    box.append(img);
  } else {
    box.append(el("span", "no-poster", m[1]));
  }
  return box;
}

function card(index) {
  const m = data.movies[index];
  const item = el("li");
  const link = el("a", "card");
  link.href = `?m=${m[0]}`;
  link.dataset.index = String(index);
  link.append(poster(m), el("span", "t", m[1]), el("span", "y", m[2] ? String(m[2]) : ""));
  item.append(link);
  return item;
}

function setView(view) {
  $("result").hidden = view !== "result";
  $("empty").hidden = view !== "empty";
  $("nomatch").hidden = view !== "nomatch";
}

// history: "push" for a deliberate pick, "replace" while typing, "none" when coming from the URL.
function show(index, history, fillInput) {
  const m = data.movies[index];
  if (!m) return;
  if (index !== current) {
    $("because").textContent = `Because you picked ${label(m)}`;
    $("recs").replaceChildren(...data.similar[index].map(card));
    current = index;
  }
  setView("result");
  if (fillInput) input.value = m[1];
  document.title = `Movies like ${m[1]}`;
  if (history === "push") window.history.pushState(null, "", `?m=${m[0]}`);
  if (history === "replace") window.history.replaceState(null, "", `?m=${m[0]}`);
}

function clear() {
  current = -1;
  setView("empty");
  document.title = "Movies like this · a content-based recommender";
  window.history.replaceState(null, "", location.pathname);
}

function typed() {
  const text = input.value.trim();
  if (!text) return clear();
  const [best] = search(folded, text, 1);
  if (best === undefined) {
    $("nomatch").textContent = `No film matches "${text}".`;
    setView("nomatch");
    return;
  }
  show(best, "replace", false);
}

function fromUrl() {
  const id = Number(new URLSearchParams(location.search).get("m"));
  const index = data.movies.findIndex((m) => m[0] === id);
  if (index >= 0) show(index, "none", true);
  else {
    input.value = "";
    current = -1;
    setView("empty");
  }
}

function wire() {
  let timer = 0;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(typed, TYPING_PAUSE_MS);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      clearTimeout(timer);
      typed();
      input.blur();
    }
  });
  $("recs").addEventListener("click", (e) => {
    const link = e.target.closest("a[data-index]");
    if (link && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      show(Number(link.dataset.index), "push", true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
  window.addEventListener("popstate", fromUrl);
}

function suggestions() {
  const titles = data.movies.map((m) => m[1]);
  $("suggest").replaceChildren(
    ...SUGGEST.map((t) => titles.indexOf(t))
      .filter((i) => i >= 0)
      .map((i) => {
        const chip = el("button", "chip", data.movies[i][1]);
        chip.type = "button";
        chip.addEventListener("click", () => show(i, "push", true));
        return chip;
      }),
  );
}

async function main() {
  try {
    const response = await fetch("/data/recommendations.json");
    if (!response.ok) throw new Error(String(response.status));
    data = await response.json();
  } catch {
    $("error").hidden = false;
    return;
  }
  folded = data.movies.map((m) => fold(m[1]));
  $("count").textContent = `Content-based recommender · ${data.movies.length.toLocaleString("en")} films`;
  suggestions();
  wire();
  fromUrl();
}

main();
