const TOKEN = import.meta.env.AIRTABLE_TOKEN;
const BASE = import.meta.env.AIRTABLE_BASE;

async function list(table: string, filter?: string) {
  const url = new URL(`https://api.airtable.com/v0/${BASE}/${table}`);
  if (filter) url.searchParams.set("filterByFormula", filter);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const json = await res.json();
  return json.records.map((r: any) => r.fields);
}

export async function getHome(citySlug: string) {
  const cities = await list("Cities", `{slug}='${citySlug}'`);
  const city = cities?.[0];

  const actions = await list("Actions", `{city}='${citySlug}'`);
  const faq = await list("FAQ", `{city}='${citySlug}'`);

  return {
    city: city?.name ?? "Москва",
    phone: city?.phone ?? "",
    address: city?.address ?? "",
    hero_title: city?.hero_title ?? "Проконсультируем прямо сейчас!",
    hero_subtitle: city?.hero_subtitle ?? "",
    actions: Array.isArray(actions) ? actions : [],
    faq: Array.isArray(faq) ? faq : [],
  };
}

