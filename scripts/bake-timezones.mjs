/**
 * Bake IANA time-zone coordinates for the visitor-location pin.
 *
 * The travel map guesses the visitor's country from the browser time zone
 * (Intl.DateTimeFormat().resolvedOptions().timeZone) without asking for
 * permission. Each tzdb zone names a principal city with coordinates; the
 * map projects that point and looks up the country in the world grid.
 *
 * Sources (pinned tzdb release):
 *   zone.tab     one row per country+zone, e.g. Europe/Amsterdam -> NL
 *   zone1970.tab merged rows; used only for zones zone.tab lacks
 *   backward     legacy names (Asia/Calcutta) that browsers may still report
 * zone.tab wins over zone1970.tab so countries sharing a merged zone since
 * 1970 (Europe/Amsterdam is a link to Europe/Brussels) keep their own city.
 *
 * Output (committed): src/pages/travel/timezone-coords.json
 *   { "Asia/Seoul": [37.55, 126.97], ... }   [latitude, longitude]
 *
 * Usage: node scripts/bake-timezones.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TZDB_VERSION = "2026d";
const BASE = `https://raw.githubusercontent.com/eggert/tz/${TZDB_VERSION}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/pages/travel/timezone-coords.json");

async function fetchText(name) {
  const response = await fetch(`${BASE}/${name}`);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  return response.text();
}

/** ISO 6709 "+DDMM[SS]+DDDMM[SS]" -> [lat, lon] in degrees */
function parseIso6709(value) {
  const match = /^([+-])(\d{2})(\d{2})(\d{2})?([+-])(\d{3})(\d{2})(\d{2})?$/.exec(value);
  if (!match) throw new Error(`bad coordinate ${value}`);
  const [, ls, ld, lm, lsec = "0", os, od, om, osec = "0"] = match;
  const toDeg = (sign, d, m, s) => (sign === "-" ? -1 : 1) * (+d + +m / 60 + +s / 3600);
  const round = (v) => Math.round(v * 100) / 100;
  return [round(toDeg(ls, ld, lm, lsec)), round(toDeg(os, od, om, osec))];
}

function parseTab(text) {
  const rows = new Map();
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const [, coords, zone] = line.split("\t");
    rows.set(zone, parseIso6709(coords));
  }
  return rows;
}

const [zoneTab, zone1970, backward] = await Promise.all([
  fetchText("zone.tab"),
  fetchText("zone1970.tab"),
  fetchText("backward"),
]);

const coords = new Map(parseTab(zone1970));
for (const [zone, point] of parseTab(zoneTab)) coords.set(zone, point);

let aliases = 0;
for (const line of backward.split("\n")) {
  // "Link TARGET ALIAS [# comment]"; column spacing varies, and some rows
  // end with a "#= TARGET1" annotation, so strip comments and split on runs.
  const [kind, target, alias] = line.replace(/#.*/, "").trim().split(/\s+/);
  if (kind !== "Link" || !alias || coords.has(alias)) continue;
  const point = coords.get(target);
  if (point) {
    coords.set(alias, point);
    aliases++;
  }
}

const sorted = Object.fromEntries([...coords].sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, `${JSON.stringify(sorted)}\n`);
console.log(`tzdb ${TZDB_VERSION}: ${coords.size} zones (${aliases} aliases) -> ${OUT}`);
