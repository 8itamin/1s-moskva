import { getLangCountryCityTriples } from "../airtable/pages";

export type LangCountryCityParams = {
  lang: string;
  country: string;
  city: string;
};

/**
 * Для страниц внутри src/pages/[lang]/[country]/[city]/...
 * Возвращает params: { lang, country, city }
 */
export async function getLangCountryCityStaticPaths() {  
  const triples = await getLangCountryCityTriples();

  return triples.map((t) => ({
    params: {
      lang: t.lang,
      country: t.country,
      city: t.city,
    },
  }));
}
