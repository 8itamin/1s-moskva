const TOKEN = import.meta.env.AIRTABLE_TOKEN;
const BASE = import.meta.env.AIRTABLE_BASE;

export async function list(table: string, filter?: string) {
  const url = new URL(`https://api.airtable.com/v0/${BASE}/${table}`);
  if (filter) url.searchParams.set("filterByFormula", filter);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("Airtable error:", json);
    return [];
  }

  const records = Array.isArray(json.records) ? json.records : [];
  return records.map((r: any) => ({ id: r.id, ...r.fields }));
}

export async function getRandomStatement(citySlug: string) {
  try {
    const statements = await list("Statements", `{city_slug}='${citySlug}'`);
    if (!statements.length) return '...';
    const statement  = statements[Math.floor(Math.random() * statements.length)];
    return `${statement.notes} /${statement.name}/`;
  } catch (e) {
    console.error(e);
    return null;
  }
}


/**
 * Генерирует пути для Astro:
 * /[lang]/[country]/[city]
 */
export async function getLangCountryCityPaths() {
  const cities = await list("Cities");

  return cities
    .map((c: any) => {
      const lang = Array.isArray(c.lang_slug) ? c.lang_slug[0] : c.lang_slug;
      const country = Array.isArray(c.country_slug)
        ? c.country_slug[0]
        : c.country_slug;
      const city = c.slug;

      if (!lang || !country || !city) return null;

      return {
        params: { lang, country, city },
      };
    })
    .filter(Boolean);
}


export async function getHome(citySlug: string) {
  const cities = await list("Cities", `{slug}='${citySlug}'`);
  const city = cities?.[0];

  const cityId = city?.id;

  const actions = cityId
    ? await list("Actions", `FIND('${cityId}', ARRAYJOIN({city}))`)
    : [];

  const faq = cityId
    ? await list("FAQ", `FIND('${cityId}', ARRAYJOIN({city}))`)
    : [];

  return {
    city: city?.name ?? "Москва",
    phone: city?.phone ?? "",
    address: city?.address ?? "",
    hero_title: city?.hero_title ?? "Проконсультируем прямо сейчас!",
    hero_subtitle: city?.hero_subtitle ?? "",
    actions,
    faq,
  };
}


