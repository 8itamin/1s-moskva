import { getLangCountryPairs } from "../airtable/pages";

export type LangCountryParams = { lang: string; country: string };

/**
 * Для страниц внутри src/pages/[lang]/[country]/...
 * Возвращает список params: { lang, country }
 */
export async function getLangCountryStaticPaths() {
  const pairs = await getLangCountryPairs();

  // ВАЖНО: Astro ждёт именно { params: {...} }
  return pairs.map((p) => ({
    params: { lang: p.lang, country: p.country },
  }));
}
