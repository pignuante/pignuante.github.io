import type { Biome, CountryBiomeEntry } from "./types";

/**
 * Manual biome classification for major countries.
 * Key = ISO 3166-1 numeric code (string).
 * Countries not listed here use latitude-based fallback in useWorldPixelGrid.
 */
export const COUNTRY_BIOMES: ReadonlyArray<CountryBiomeEntry> = [
  // ── East Asia ──
  { biome: "temperate", id: "156", nameKo: "중국", visited: false },
  { biome: "temperate", id: "392", nameKo: "일본", visited: true },
  { biome: "continental", id: "496", nameKo: "몽골", visited: false },
  { biome: "temperate", id: "410", nameKo: "대한민국", visited: true },
  { biome: "temperate", id: "408", nameKo: "북한", visited: false },
  { biome: "temperate", id: "158", nameKo: "대만", visited: false },

  // ── Southeast Asia ──
  { biome: "tropical", id: "360", nameKo: "인도네시아", visited: false },
  { biome: "tropical", id: "458", nameKo: "말레이시아", visited: false },
  { biome: "tropical", id: "608", nameKo: "필리핀", visited: false },
  { biome: "tropical", id: "702", nameKo: "싱가포르", visited: false },
  { biome: "tropical", id: "764", nameKo: "태국", visited: false },
  { biome: "tropical", id: "704", nameKo: "베트남", visited: false },
  { biome: "tropical", id: "104", nameKo: "미얀마", visited: false },
  { biome: "tropical", id: "116", nameKo: "캄보디아", visited: false },
  { biome: "tropical", id: "418", nameKo: "라오스", visited: false },

  // ── South Asia ──
  { biome: "tropical", id: "356", nameKo: "인도", visited: false },
  { biome: "tropical", id: "050", nameKo: "방글라데시", visited: false },
  { biome: "tropical", id: "144", nameKo: "스리랑카", visited: false },
  { biome: "arid", id: "586", nameKo: "파키스탄", visited: false },
  { biome: "continental", id: "524", nameKo: "네팔", visited: false },

  // ── Central Asia & Middle East (Arid belt) ──
  { biome: "arid", id: "682", nameKo: "사우디아라비아", visited: false },
  { biome: "arid", id: "364", nameKo: "이란", visited: false },
  { biome: "arid", id: "368", nameKo: "이라크", visited: false },
  { biome: "arid", id: "784", nameKo: "아랍에미리트", visited: false },
  { biome: "arid", id: "376", nameKo: "이스라엘", visited: false },
  { biome: "arid", id: "818", nameKo: "이집트", visited: false },
  { biome: "temperate", id: "792", nameKo: "튀르키예", visited: false },
  { biome: "arid", id: "004", nameKo: "아프가니스탄", visited: false },
  { biome: "arid", id: "398", nameKo: "카자흐스탄", visited: false },
  { biome: "arid", id: "795", nameKo: "투르크메니스탄", visited: false },
  { biome: "arid", id: "860", nameKo: "우즈베키스탄", visited: false },

  // ── Europe ──
  { biome: "temperate", id: "826", nameKo: "영국", visited: false },
  { biome: "temperate", id: "250", nameKo: "프랑스", visited: false },
  { biome: "temperate", id: "276", nameKo: "독일", visited: false },
  { biome: "temperate", id: "380", nameKo: "이탈리아", visited: false },
  { biome: "temperate", id: "724", nameKo: "스페인", visited: false },
  { biome: "temperate", id: "620", nameKo: "포르투갈", visited: false },
  { biome: "temperate", id: "756", nameKo: "스위스", visited: true },
  { biome: "temperate", id: "040", nameKo: "오스트리아", visited: false },
  { biome: "temperate", id: "528", nameKo: "네덜란드", visited: false },
  { biome: "temperate", id: "056", nameKo: "벨기에", visited: false },
  { biome: "continental", id: "616", nameKo: "폴란드", visited: false },
  { biome: "continental", id: "203", nameKo: "체코", visited: false },
  { biome: "continental", id: "348", nameKo: "헝가리", visited: false },
  { biome: "continental", id: "642", nameKo: "루마니아", visited: false },
  { biome: "temperate", id: "300", nameKo: "그리스", visited: false },
  { biome: "continental", id: "804", nameKo: "우크라이나", visited: false },
  { biome: "continental", id: "643", nameKo: "러시아", visited: false },
  { biome: "continental", id: "246", nameKo: "핀란드", visited: false },
  { biome: "continental", id: "752", nameKo: "스웨덴", visited: false },
  { biome: "continental", id: "578", nameKo: "노르웨이", visited: false },
  { biome: "continental", id: "208", nameKo: "덴마크", visited: false },
  { biome: "polar", id: "352", nameKo: "아이슬란드", visited: false },
  { biome: "temperate", id: "372", nameKo: "아일랜드", visited: false },

  // ── North America ──
  { biome: "temperate", id: "840", nameKo: "미국", visited: true },
  { biome: "continental", id: "124", nameKo: "캐나다", visited: false },
  { biome: "arid", id: "484", nameKo: "멕시코", visited: false },
  { biome: "tropical", id: "192", nameKo: "쿠바", visited: false },

  // ── South America ──
  { biome: "tropical", id: "076", nameKo: "브라질", visited: false },
  { biome: "temperate", id: "032", nameKo: "아르헨티나", visited: false },
  { biome: "temperate", id: "152", nameKo: "칠레", visited: false },
  { biome: "tropical", id: "170", nameKo: "콜롬비아", visited: false },
  { biome: "tropical", id: "604", nameKo: "페루", visited: false },
  { biome: "tropical", id: "862", nameKo: "베네수엘라", visited: false },
  { biome: "tropical", id: "218", nameKo: "에콰도르", visited: false },

  // ── Africa ──
  { biome: "arid", id: "012", nameKo: "알제리", visited: false },
  { biome: "arid", id: "434", nameKo: "리비아", visited: false },
  { biome: "arid", id: "736", nameKo: "수단", visited: false },
  { biome: "arid", id: "466", nameKo: "말리", visited: false },
  { biome: "arid", id: "562", nameKo: "니제르", visited: false },
  { biome: "arid", id: "148", nameKo: "차드", visited: false },
  { biome: "tropical", id: "566", nameKo: "나이지리아", visited: false },
  { biome: "tropical", id: "180", nameKo: "콩고민주공화국", visited: false },
  { biome: "tropical", id: "404", nameKo: "케냐", visited: false },
  { biome: "tropical", id: "834", nameKo: "탄자니아", visited: false },
  { biome: "tropical", id: "231", nameKo: "에티오피아", visited: false },
  { biome: "temperate", id: "710", nameKo: "남아프리카공화국", visited: false },
  { biome: "arid", id: "504", nameKo: "모로코", visited: false },
  { biome: "arid", id: "478", nameKo: "모리타니", visited: false },
  { biome: "arid", id: "706", nameKo: "소말리아", visited: false },
  { biome: "arid", id: "516", nameKo: "나미비아", visited: false },

  // ── Oceania ──
  { biome: "arid", id: "036", nameKo: "호주", visited: false },
  { biome: "temperate", id: "554", nameKo: "뉴질랜드", visited: false },
  { biome: "tropical", id: "598", nameKo: "파푸아뉴기니", visited: false },

  // ── Polar ──
  { biome: "polar", id: "304", nameKo: "그린란드", visited: false },
  { biome: "polar", id: "010", nameKo: "남극", visited: false },
];

/** Quick lookup: country ID → biome entry */
export const COUNTRY_BIOME_MAP: ReadonlyMap<string, CountryBiomeEntry> =
  new Map(COUNTRY_BIOMES.map((entry) => [entry.id, entry]));

/** Quick lookup: country ID → visited flag */
export const VISITED_COUNTRIES: ReadonlySet<string> = new Set(
  COUNTRY_BIOMES.filter((e) => e.visited).map((e) => e.id),
);

/**
 * Fallback biome classification based on centroid latitude.
 * Used for countries not manually classified in COUNTRY_BIOMES.
 */
export function biomeFromLatitude(lat: number): Biome {
  const absLat = Math.abs(lat);
  if (absLat > 60) return "polar";
  if (absLat > 45) return "continental";
  if (absLat < 23.5) return "tropical";
  return "temperate";
}
