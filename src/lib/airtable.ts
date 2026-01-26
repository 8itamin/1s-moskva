import { z } from "zod";

const AIRTABLE_TOKEN = import.meta.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE = import.meta.env.AIRTABLE_BASE;
const API_URL = import.meta.env.AIRTABLE_API_URL ?? "https://api.airtable.com/v0";

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE) {
  throw new Error("Missing AIRTABLE_TOKEN or AIRTABLE_BASE in .env");
}

type AirtableRecord<T> = { id: string; fields: T };

async function airtableList<TFields>(
  table: string,
  params: Record<string, string> = {}
): Promise<AirtableRecord<TFields>[]> {
  const url = new URL(`${API_URL}/${AIRTABLE_BASE}/${encodeURIComponent(table)}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Airtable error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.records as AirtableRecord<TFields>[];
}

/** ---- Schemas (пример) ---- */
export const CitySchema = z.object({
  slug: z.string(),
  name: z.string(),
  phone_main: z.string().optional(),
  phone_city: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  work_hours: z.string().optional(),
  messengers: z.string().optional(),
  hero_quote: z.string().optional(),
  hero_title: z.string().optional(),
  hero_cta_text: z.string().optional(),
});

export type City = z.infer<typeof CitySchema> & { id: string };

export async function getCities(): Promise<City[]> {
  const records = await airtableList<any>("Cities", { "sort[0][field]": "name" });
  return records.map(r => ({ id: r.id, ...CitySchema.parse(r.fields) }));
}

export const ServiceSchema = z.object({
  slug: z.string(),
  name: z.string(),
  group: z.string(),
  short: z.string().optional(),
  content: z.string().optional(),
  priority: z.number().optional(),
});

export type Service = z.infer<typeof ServiceSchema> & { id: string };

export async function getServices(): Promise<Service[]> {
  const records = await airtableList<any>("Services", { "sort[0][field]": "priority" });
  return records.map(r => ({ id: r.id, ...ServiceSchema.parse(r.fields) }));
}

export async function getHomeData(citySlug: string) {
  // упрощённо: берём город + списки услуг по group
  const [cities, services] = await Promise.all([getCities(), getServices()]);
  const city = cities.find(c => c.slug === citySlug) ?? cities[0];
  const groups = {
    products: services.filter(s => s.group === "products"),
    training: services.filter(s => s.group === "training"),
    support: services.filter(s => s.group === "support"),
    dev: services.filter(s => s.group === "dev"),
  };
  return { city, groups };
}
