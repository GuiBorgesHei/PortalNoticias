import { attachBrands, enrich, fetchRssMany } from "../lib/rss.js";
import { clampDays, dedupe } from "../lib/utils.js";
import { writeJson } from "../lib/storage/index.js";

export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  const MAX_DAYS = Number(process.env.MAX_DAYS || 365);
  const MAX_ITEMS = Number(process.env.MAX_ITEMS || 400);
  const rssList = (process.env.RSS_SOURCES || "").split(",").map(s => s.trim()).filter(Boolean);
  const brands = (process.env.BRAND_QUERIES || "").split(",").map(s => s.trim()).filter(Boolean);

  if (!rssList.length || !brands.length) {
    res.status(400).json({ ok: false, error: "Configure RSS_SOURCES e BRAND_QUERIES" });
    return;
  }

  const raw = await fetchRssMany(rssList);
  const byBrand = attachBrands(raw, brands);

  let items = enrich(byBrand)
    .filter(n => clampDays(n.dateISO, MAX_DAYS))
    .sort((a, b) => +new Date(b.dateISO) - +new Date(a.dateISO));

  items = dedupe(items, n => n.url).slice(0, MAX_ITEMS);

  await writeJson("news.json", items);
  res.status(200).json({ ok: true, count: items.length });
}
