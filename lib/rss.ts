import { XMLParser } from "fast-xml-parser";
import { NewsItem, classifyTheme, coerceISO, detectRegion, normalizeUrl } from "./utils.js";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });

const getDomain = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

export async function fetchRss(url: string): Promise<NewsItem[]> {
  const res = await fetch(url, { headers: { "user-agent": "portal-noticias/1.0" } });
  const xml = await res.text();
  const j = parser.parse(xml);
  const items = j?.rss?.channel?.item || j?.feed?.entry || [];
  return (Array.isArray(items) ? items : [items]).map((it: any) => {
    const link = it.link?.href || it.link || it.guid || it.url || "";
    const title = (it.title?.["#text"] ?? it.title ?? "").toString();
    const description = (it.description ?? it.summary ?? "").toString();
    const pub = it.pubDate || it.published || it.updated;
    const urlN = normalizeUrl(link);
    return {
      brand: "",
      topic: "",
      title,
      url: urlN,
      dateISO: coerceISO(pub),
      source: getDomain(urlN) || "rss",
      summary: description.replace(/<[^>]+>/g, "").slice(0, 300),
    } as NewsItem;
  });
}

export async function fetchRssMany(urls: string[]): Promise<NewsItem[]> {
  const chunks = await Promise.all(urls.map(u => fetchRss(u).catch(() => [])));
  return chunks.flat();
}

export function attachBrands(items: NewsItem[], brandQueries: string[]): NewsItem[] {
  const synonyms: Record<string, string[]> = {
    "Brahma": ["Brahma", "Sociedade Anônima Brahma", "Sociedade Anonima Brahma", "SAB"],
    "Budweiser": ["Budweiser", "AB InBev", "AB-InBev", "Anheuser-Busch"],
    "Ambev": ["Ambev", "ABEV3"],
    "Stella Artois": ["Stella Artois", "Stella", "Pure Gold"],
    "Corona": ["Corona", "Corona Sunsets", "Luau MTV"],
    "Spaten": ["Spaten", "Spaten Fight Night"],
    "Grupo Petrópolis": ["Grupo Petrópolis", "Grupo Petropolis", "Petropolis", "Itaipava", "TNT Energy"],
    "Skol": ["Skol"],
    "Petra": ["Petra"],
    "Império": ["Império", "Imperio"]
  };
  const labelList = Array.from(new Set([...(brandQueries || []), ...Object.keys(synonyms)]));
  const patterns = labelList.map(label => {
    const words = synonyms[label] || [label];
    const re = new RegExp(words.map(w => `(^|\W)${w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}($|\W)`).join("|"), "i");
    return { label, re };
  });
  return items.map(it => {
    const text = `${it.title} ${it.summary}`;
    const found = patterns.find(p => p.re.test(text));
    return found ? { ...it, brand: found.label } : it;
  }).filter(it => !!it.brand);
}

export function enrich(items: NewsItem[]): NewsItem[] {
  return items.map(it => ({ ...it, theme: it.theme || classifyTheme(it), region: it.region || detectRegion(it) }));
}
