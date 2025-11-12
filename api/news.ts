import { readJson } from "../lib/storage/index.js";

export const config = { runtime: "nodejs18.x" };

export default async function handler(req: any, res: any) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const days = Number(url.searchParams.get("days") || 365);
  const brand = url.searchParams.get("brand");
  const theme = url.searchParams.get("theme");
  const region = url.searchParams.get("region");
  const limit = Number(url.searchParams.get("limit") || 100);

  const all = (await readJson("news.json")) || [];
  const cutoff = Date.now() - days * 86400000;

  const filtered = all.filter((n: any) => {
    const matchBrand = !brand || n.brand === brand;
    const matchTheme = !theme || n.theme === theme;
    const matchRegion = !region || n.region === region;
    const matchTime = new Date(n.dateISO).getTime() >= cutoff;
    return matchBrand && matchTheme && matchRegion && matchTime;
  }).slice(0, limit);

  res.setHeader("cache-control", "s-maxage=600, stale-while-revalidate=86400");
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify(filtered));
}
