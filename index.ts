import { s3Read, s3Write } from "./s3.js";
import { writeFile, readFile } from "fs/promises";

const DRIVER = process.env.STORAGE_DRIVER || "FILE";
const FILE_PATH = "/tmp/news.json";

export async function writeJson(key: string, data: any) {
  const body = JSON.stringify(data);
  if (DRIVER === "S3") return s3Write(key, body);
  try { await writeFile(FILE_PATH, body, "utf8"); } catch {}
}

export async function readJson(key: string): Promise<any[] | null> {
  if (DRIVER === "S3") { const s = await s3Read(key); return s ? JSON.parse(s) : null; }
  try { const text = await readFile(FILE_PATH, "utf8"); return JSON.parse(text); } catch { return null; }
}
