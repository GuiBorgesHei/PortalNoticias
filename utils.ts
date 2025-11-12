export type NewsItem = {
  brand: string;
  topic?: string;
  theme?: string;
  title: string;
  url: string;
  dateISO: string;
  source: string;
  summary?: string;
  insight?: string;
  region?: string;
};

export const normalizeUrl = (u: string) => {
  try { const url = new URL(u); url.hash = ""; return url.toString(); } catch { return u; }
};

export const dedupe = <T>(arr: T[], key: (t: T) => string) => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of arr) { const k = key(it) || ""; if (seen.has(k)) continue; seen.add(k); out.push(it); }
  return out;
};

const has = (text: string, words: string[]) => {
  const t = (text || "").toLowerCase();
  return words.some(w => t.includes(w.toLowerCase()));
};

export const classifyTheme = (n: Partial<NewsItem>) => {
  const s = `${n.title ?? ""} ${n.summary ?? ""} ${n.topic ?? ""}`;
  if (has(s, ["champions","uefa","futebol","clubes","torcedor","campeonato"])) return "Futebol";
  if (has(s, ["luta","mma","boxe","fight"])) return "Esportes de Combate";
  if (has(s, ["festival","show","turnê","música","luau"])) return "Música/Entretenimento";
  if (has(s, ["resultado","lucro","recompra","ab inbev","ambev","guidance"])) return "Empresa/Mercado";
  if (has(s, ["patrocínio","patrocinio","ativação","camarote","evento"])) return "Eventos/Patrocínios";
  if (has(s, ["bar","bares","gastronomia","roteiro"])) return "Gastronomia";
  return "Outros";
};

const UF_MAP: Record<string,string> = {
  "fortaleza": "Brasil (CE)", "ceará": "Brasil (CE)",
  "salvador": "Brasil (BA)", "bahia": "Brasil (BA)",
  "rio de janeiro": "Brasil (RJ)", "rj": "Brasil (RJ)",
  "são paulo": "Brasil (SP)", "sao paulo": "Brasil (SP)", "sp": "Brasil (SP)",
  "minas": "Brasil (MG)", "belo horizonte": "Brasil (MG)",
  "gramado": "Brasil (RS)"
};

export const detectRegion = (n: Partial<NewsItem>) => {
  const text = `${n.title ?? ""} ${n.summary ?? ""}`.toLowerCase();
  for (const k of Object.keys(UF_MAP)) { if (text.includes(k)) return UF_MAP[k]; }
  try { const host = new URL(n.url || "").hostname; if (host.endsWith(".br")) return "Brasil (Nacional)"; } catch {}
  return "Internacional";
};

export const clampDays = (iso: string, maxDays: number) => {
  const ts = new Date(iso).getTime();
  const cutoff = Date.now() - maxDays * 86400000;
  return ts >= cutoff;
};

export const coerceISO = (d?: string) => {
  if (!d) return new Date().toISOString();
  const t = new Date(d);
  return isNaN(+t) ? new Date().toISOString() : t.toISOString();
};
