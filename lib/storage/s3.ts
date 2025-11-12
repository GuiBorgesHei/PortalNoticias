import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const { S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

const s3 = new S3Client({
  region: S3_REGION || "auto",
  endpoint: S3_ENDPOINT,
  credentials: S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY ? {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  } : undefined,
  forcePathStyle: true,
});

export async function s3Write(key: string, body: string) {
  if (!S3_BUCKET) throw new Error("Missing S3_BUCKET");
  await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: body, ContentType: "application/json" }));
}

export async function s3Read(key: string): Promise<string | null> {
  if (!S3_BUCKET) throw new Error("Missing S3_BUCKET");
  try { const r: any = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key })); return await r.Body.transformToString(); }
  catch { return null; }
}
