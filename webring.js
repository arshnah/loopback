const CONFIG = {
  name: "vibering",
  baseUrl: "https://arshnah.github.io/vibering",
  dataUrl: "webring.json",
};

async function loadMembers() {
  const res = await fetch(CONFIG.dataUrl, { cache: "no-store" });
  if (!res.ok) throw new Error("couldn't load " + CONFIG.dataUrl + " (" + res.status + ")");
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("webring.json must be an array");
  return data;
}

function norm(s) {
  return String(s || "").trim().toLowerCase();
}

function indexOfName(members, name) {
  return members.findIndex((m) => norm(m.name) === norm(name));
}

function neighbor(members, from, dir) {
  const i = indexOfName(members, from);
  if (i === -1) return null;
  const len = members.length;
  const j = dir === "prev" ? (i - 1 + len) % len : (i + 1) % len;
  return members[j];
}

function randomMember(members, exclude) {
  const pool = members.filter((m) => norm(m.name) !== norm(exclude));
  const list = pool.length ? pool : members;
  return list[Math.floor(Math.random() * list.length)];
}

function resolveTarget(members, params) {
  const dir = (params.get("dir") || "next").toLowerCase();
  const from = params.get("from") || "";
  if (dir === "random") return randomMember(members, from);
  return neighbor(members, from, dir);
}
