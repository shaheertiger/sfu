import 'server-only';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Cloudflare R2 (S3-compatible). Browsers upload straight to R2 with a presigned PUT,
 * so large videos never pass through a Vercel function.
 */
let client: S3Client | null = null;
function s3() {
  if (client) return client;
  const accountId = process.env.R2_ACCOUNT_ID;
  const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');
  if (!endpoint || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET) {
    throw new Error('R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET.');
  }
  client = new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: !!process.env.R2_ENDPOINT,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  });
  return client;
}
const bucket = () => process.env.R2_BUCKET as string;

export const r2Configured = () =>
  !!((process.env.R2_ACCOUNT_ID || process.env.R2_ENDPOINT) && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);

export async function presignUpload(key: string, mime: string, size: number) {
  return getSignedUrl(s3(), new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: mime, ContentLength: size }), { expiresIn: 15 * 60 });
}

/** URL platforms (Instagram, Threads, TikTok photos, Google) can fetch. Public bucket domain if set, else a 24h signed URL. */
export async function readUrl(key: string, ttlSeconds = 24 * 3600) {
  const pub = process.env.R2_PUBLIC_URL;
  if (pub) return `${pub.replace(/\/$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`;
  return getSignedUrl(s3(), new GetObjectCommand({ Bucket: bucket(), Key: key }), { expiresIn: ttlSeconds });
}

export async function head(key: string) {
  try {
    const r = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return { size: Number(r.ContentLength || 0), mime: r.ContentType || '' };
  } catch {
    return null;
  }
}

export async function getBytes(key: string): Promise<Buffer> {
  const r = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  return Buffer.from(await r.Body!.transformToByteArray());
}

export async function remove(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
