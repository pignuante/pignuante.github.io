/**
 * Bake IANA time-zone coordinates for the visitor-location pin.
 *
 * The travel map guesses the visitor's location from the browser time zone
 * (Intl.DateTimeFormat().resolvedOptions().timeZone) without asking for
 * permission. Each tzdb zone names a principal city with coordinates and
 * its ISO country; the map pins that city and names that country.
 *
 * Sources (pinned tzdb release):
 *   zone.tab     one row per country+zone, e.g. Europe/Amsterdam -> NL
 *   zone1970.tab merged rows; used only for zones zone.tab lacks
 *   backward     legacy names (Asia/Calcutta) that browsers may still report
 *   backzone     where a legacy name really is (see "Legacy names" below)
 * zone.tab wins over zone1970.tab so countries sharing a merged zone since
 * 1970 (Europe/Amsterdam is a link to Europe/Brussels) keep their own city.
 *
 * Legacy names: browsers report ICU canonical IDs, many of which are old
 * tzdb names (Africa/Asmera, Pacific/Ponape, Iceland). `backward` links
 * those to any zone with the same clock, often in another country
 * (Africa/Asmera -> Africa/Nairobi, Kenya). For the location we want the
 * geographic zone, so an alias resolves in this order: the link in
 * `backzone` (incl. "#PACKRATLIST zone.tab Link" lines, e.g. Timbuktu ->
 * Bamako), then the "#= TARGET1" annotation in `backward`, then its target.
 *
 * Each zone also carries its ISO 3166-1 alpha-2 country (zone.tab column 1),
 * which names the country directly, e.g. Asia/Hong_Kong -> HK even though the
 * map grid is too coarse to resolve Hong Kong. Alpha-2 -> numeric (the map's
 * country id) comes from a pinned lukes/ISO-3166-Countries-with-Regional-Codes.
 *
 * Output (committed): src/pages/travel/timezone-coords.json
 *   { "zones": { "Asia/Seoul": [37.5667, 126.9667, "KR"], ... },
 *     "numeric": { "KR": "410", ... } }
 *
 * Usage: node scripts/bake-timezones.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TZDB_VERSION = "2026d";
const ISO_3166_COMMIT = "145f1ad3caff212ed25f42b0ee2c8b92a75af895";
const ISO_3166_URL = `https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/${ISO_3166_COMMIT}/all/all.json`;
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
  const match =
    /^([+-])(\d{2})(\d{2})(\d{2})?([+-])(\d{3})(\d{2})(\d{2})?$/.exec(value);
  if (!match) throw new Error(`bad coordinate ${value}`);
  const [, ls, ld, lm, lsec = "0", os, od, om, osec = "0"] = match;
  const toDeg = (sign, d, m, s) =>
    (sign === "-" ? -1 : 1) * (+d + +m / 60 + +s / 3600);
  // 1e-4° ≈ 11 m: keeps the source's arcsecond precision.
  const round = (v) => Math.round(v * 1e4) / 1e4;
  return [round(toDeg(ls, ld, lm, lsec)), round(toDeg(os, od, om, osec))];
}

/** zone -> [lat, lon, alpha2]; multi-country rows (CH,DE,LI) keep the first */
function parseTab(text) {
  const rows = new Map();
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const [countries, coords, zone] = line.split("\t");
    rows.set(zone, [...parseIso6709(coords), countries.split(",")[0]]);
  }
  return rows;
}

const [zoneTab, zone1970, backward, backzone, iso3166] = await Promise.all([
  fetchText("zone.tab"),
  fetchText("zone1970.tab"),
  fetchText("backward"),
  fetchText("backzone"),
  fetch(ISO_3166_URL).then((r) => {
    if (!r.ok) throw new Error(`ISO 3166: HTTP ${r.status}`);
    return r.json();
  }),
]);

const coords = new Map(parseTab(zone1970));
for (const [zone, point] of parseTab(zoneTab)) coords.set(zone, point);

// backzone: geographic target of a legacy name
const geographic = new Map();
for (const line of backzone.split("\n")) {
  const body = line.replace(/^#PACKRATLIST zone\.tab /, "");
  const [kind, target, alias] = body.replace(/#.*/, "").trim().split(/\s+/);
  if (kind === "Link" && alias) geographic.set(alias, target);
}

let aliases = 0;
let relocated = 0;
for (const line of backward.split("\n")) {
  // "Link TARGET ALIAS [#= TARGET1]"; column spacing varies.
  const annotation = /#=\s*(\S+)/.exec(line)?.[1];
  const [kind, target, alias] = line.replace(/#.*/, "").trim().split(/\s+/);
  if (kind !== "Link" || !alias || coords.has(alias)) continue;
  const place = [geographic.get(alias), annotation, target].find((zone) =>
    coords.has(zone),
  );
  if (!place) continue;
  coords.set(alias, coords.get(place));
  aliases++;
  if (place !== target) relocated++;
}

// Code-point order: locale-independent, so regeneration is byte-stable.
const byKey = ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0);
const zones = Object.fromEntries([...coords].sort(byKey));
const used = new Set([...coords.values()].map(([, , code]) => code));
const numeric = Object.fromEntries(
  iso3166
    .filter((entry) => used.has(entry["alpha-2"]))
    .map((entry) => [entry["alpha-2"], entry["country-code"]])
    .sort(byKey),
);
const missing = [...used].filter((code) => !(code in numeric));
writeFileSync(OUT, `${JSON.stringify({ numeric, zones })}\n`);
console.log(
  `tzdb ${TZDB_VERSION}: ${coords.size} zones (${aliases} aliases, ${relocated} placed by backzone/#=), ` +
    `${Object.keys(numeric).length} countries` +
    (missing.length ? `, no numeric code for ${missing.join(",")}` : "") +
    ` -> ${OUT}`,
);
