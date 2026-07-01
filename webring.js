/* =========================================================================
 * loopback — shared webring logic
 * -------------------------------------------------------------------------
 * Everything you need to rebrand the ring lives in CONFIG below.
 * The ring is fully static: members live in webring.json, and prev/next/
 * random navigation is resolved client-side in go.html. No backend.
 * ========================================================================= */

const CONFIG = {
  // the ring's name — shown in the header + used in the embed snippet
  name: "loopback",
  // one-line description under the title
  tagline: "a hand-made ring of personal websites — no algorithm, just doors",
  // the absolute URL where THIS site is deployed.
  // used to generate the copy-paste embed snippet. no trailing slash.
  baseUrl: "https://arshnah.github.io/loopback",
  // where the member list lives (relative to this deployment)
  dataUrl: "webring.json",
};

/* ------------------------------------------------------------------ data */

// loadMembers fetches and returns the ordered member array.
async function loadMembers() {
  const res = await fetch(CONFIG.dataUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`could not load ${CONFIG.dataUrl} (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("webring.json must be an array");
  return data;
}

/* --------------------------------------------------------------- helpers */

// norm lowercases + trims a name so lookups are forgiving.
const norm = (s) => String(s || "").trim().toLowerCase();

// indexOfName returns the position of `name` in the ring, or -1.
function indexOfName(members, name) {
  const n = norm(name);
  return members.findIndex((m) => norm(m.name) === n);
}

// neighbor returns the member `dir` ("prev" | "next") of `from`, wrapping
// around the ends of the ring. returns null if `from` isn't a member.
function neighbor(members, from, dir) {
  const i = indexOfName(members, from);
  if (i === -1) return null;
  const len = members.length;
  const j = dir === "prev" ? (i - 1 + len) % len : (i + 1) % len;
  return members[j];
}

// randomMember returns a random member, avoiding `exclude` when possible.
function randomMember(members, exclude) {
  const pool = members.filter((m) => norm(m.name) !== norm(exclude));
  const list = pool.length ? pool : members;
  // deterministic-enough randomness without Math.random dependency concerns
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

// hostOf strips scheme + leading www. for compact display.
function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// initialOf returns the first character, uppercased (letter avatar fallback).
function initialOf(name) {
  const s = String(name || "").trim();
  return s ? s[0].toUpperCase() : "?";
}

// resolveTarget maps ?from=&dir= query params to a destination member.
// dir defaults to "next". supports "prev" | "next" | "random".
function resolveTarget(members, params) {
  const dir = (params.get("dir") || "next").toLowerCase();
  const from = params.get("from") || "";
  if (dir === "random") return randomMember(members, from);
  return neighbor(members, from, dir);
}
