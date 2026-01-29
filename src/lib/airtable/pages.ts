const TOKEN = import.meta.env.AIRTABLE_TOKEN;
const BASE = import.meta.env.AIRTABLE_BASE;
const API_URL = import.meta.env.AIRTABLE_API_URL ?? "https://api.airtable.com/v0";

if (!TOKEN || !BASE) throw new Error("Missing AIRTABLE_TOKEN or AIRTABLE_BASE");

type AirtableRecord<T> = { id: string; fields: T };

async function list<TFields>(table: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_URL}/${BASE}/${encodeURIComponent(table)}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return (json.records as AirtableRecord<TFields>[]).map((r) => r.fields);
}

// ⚠️ Ожидаемые таблицы:
// - CityServices (ключевая для city+service)
// - Cities (контакты)
// - Services (названия услуг)
// - FAQ (вопрос-ответ)
// Для простоты берём всё через CityServices + подтягиваем нужные поля прямо там.

export async function getStaticRouteParams(): Promise<
  { lang: string; country: string; city: string; service: string }[]
> {
  const rows = await list<any>("CityServices", { "pageSize": "100" });
  return rows.map((r) => ({
    lang: r.lang,
    country: r.country,
    city: r.city_slug,
    service: r.service_slug,
  }));
}


// 1️⃣ ВСЕ допустимые комбинации lang + country
export async function getLangCountryPairs(): Promise<
  { lang: string; country: string }[]
> {
  const rows = await list<any>("Cities", { pageSize: "100" });

  const map = new Map<string, { lang: string; country: string }>();

  for (const r of rows) {
    if (!r.lang || !r.country) continue;
    const key = `${r.lang}-${r.country}`;
    if (!map.has(key)) {
      map.set(key, { lang: r.lang, country: r.country });
    }
  }

  return Array.from(map.values());
}

// 2️⃣ Города для конкретного lang + country
export async function getCitiesByLangCountry(input: {
  lang: string;
  country: string;
}) {
  const formula = `AND({lang}='${input.lang}',{country}='${input.country}')`;

  const rows = await list<any>("Cities", {
    filterByFormula: formula,
    pageSize: "100",
  });

  return rows.map((r: any) => ({
    slug: r.slug,
    name: r.name,
  }));
}


export async function getServicesByLangCountry(input: {
  lang: string;
  country: string;
}) {
  // Вариант 1 (простой): если услуги не зависят от страны/языка — просто берём Services
  // Тогда можно игнорировать input и вернуть все.
  const rows = await list<any>("Services", { pageSize: "100" });

  return rows
    .filter((r) => r.slug && r.name)
    .map((r) => ({ slug: r.slug, name: r.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}


// Все уникальные комбинации lang + country + city
export async function getLangCountryCityTriples(): Promise<
  { lang: string; country: string; city: string }[]
> {
  const rows = await list<any>("Cities", { pageSize: "100" });

  const map = new Map<string, { lang: string; country: string; city: string }>();

  for (const r of rows) {
    if (!r.lang.slug || !r.country.slug || !r.slug) continue;

    const key = `${r.lang.slug}-${r.country.slug}-${r.slug}`;
    if (!map.has(key)) {
      map.set(key, {
        lang: r.lang.slug,
        country: r.country.slug,
        city: r.slug,
      });
    }
  }

  return Array.from(map.values());
}



export async function getCityServicePage(input: {
  lang: string;
  country: string;
  citySlug: string;
  serviceSlug: string;
}) {
  const formula = `AND({lang}='${input.lang}',{country}='${input.country}',{city_slug}='${input.citySlug}',{service_slug}='${input.serviceSlug}')`;

  const rows = await list<any>("CityServices", {
    filterByFormula: formula,
    pageSize: "1",
  });

  const r = rows[0];
  if (!r) {
    // Чтобы сборка не падала: возвращаем минимальные данные
    return {
      city_name: input.citySlug,
      service_name: input.serviceSlug,
      faq: [],
      task_list: [],
      local_bullets: [],
    };
  }

  // Приводим списки: если ты хранишь их как текст с переносами
  const splitLines = (v: any) =>
    typeof v === "string" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : Array.isArray(v) ? v : [];

  return {
    // SEO
    title: r.title,
    meta_description: r.meta_description,
    h1: r.h1,

    // Сущности
    city_name: r.city_name ?? input.citySlug,
    service_name: r.service_name ?? input.serviceSlug,

    // Контакты / локалка
    brand_name: r.brand_name ?? "Programister",
    city_phone: r.city_phone, // +7499...
    city_phone_display: r.city_phone_display, // +7 (499)...
    city_email: r.city_email,
    city_address: r.city_address, // "127323, Москва, Кослькая 1"
    city_street: r.city_street, // "Кослькая 1" (опционально)
    city_postal_code: r.city_postal_code, // 127323
    city_work_hours: r.city_work_hours, // Mo-Fr 09:00-19:00
    areas_served: r.areas_served,

    // Контент
    intro: r.intro,
    task_list: splitLines(r.task_list),
    local_bullets: splitLines(r.local_bullets),
    price_from: r.price_from,
    pricing_text: r.pricing_text,

    // FAQ (если хранишь как массив объектов — ок; если ссылками — лучше денормализовать)
    faq: Array.isArray(r.faq)
      ? r.faq
      : [], // ожидаем [{question, answer}, ...]
  };
}
