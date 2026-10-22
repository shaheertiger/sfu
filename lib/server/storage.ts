import 'server-only';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HttpError } from './http-error';

/**
 * Media storage over the S3 API. Browsers upload straight to the bucket with a presigned PUT,
 * so large videos never pass through a Vercel function.
 *
 * Neon Object Storage is the default. Credentials come from STORAGE_ENDPOINT, STORAGE_ACCESS_KEY_ID,
 * STORAGE_SECRET_ACCESS_KEY and STORAGE_REGION. Vercel reserves the AWS_* names Neon uses (and fills
 * them with its own keys), so on Vercel the STORAGE_* names are required. Elsewhere (local dev,
 * `neon env pull`) Neon's AWS_ENDPOINT_URL_S3 / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION
 * work too. The bucket is STORAGE_BUCKET (default `sfy-media`, declared in neon.ts).
 * Cloudflare R2 still works through the R2_* variables when neither is set.
 */
type Config = { endpoint: string; region: string; accessKeyId: string; secretAccessKey: string; bucket: string; forcePathStyle: boolean };

const neon = (endpoint: string, region: string | undefined, accessKeyId: string, secretAccessKey: string): Config => ({
  endpoint,
  region: region || 'us-east-2',
  accessKeyId,
  secretAccessKey,
  bucket: process.env.STORAGE_BUCKET || 'sfy-media',
  forcePathStyle: true, // Neon only supports path-style addressing
});

function config(): Config | null {
  const e = process.env;
  if (e.STORAGE_ENDPOINT && e.STORAGE_ACCESS_KEY_ID && e.STORAGE_SECRET_ACCESS_KEY) {
    return neon(e.STORAGE_ENDPOINT, e.STORAGE_REGION, e.STORAGE_ACCESS_KEY_ID, e.STORAGE_SECRET_ACCESS_KEY);
  }
  if (!e.VERCEL && e.AWS_ENDPOINT_URL_S3 && e.AWS_ACCESS_KEY_ID && e.AWS_SECRET_ACCESS_KEY) {
    return neon(e.AWS_ENDPOINT_URL_S3, e.AWS_REGION, e.AWS_ACCESS_KEY_ID, e.AWS_SECRET_ACCESS_KEY);
  }
  const r2Endpoint = e.R2_ENDPOINT || (e.R2_ACCOUNT_ID ? `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');
  const r2Bucket = e.STORAGE_BUCKET || e.R2_BUCKET;
  if (r2Endpoint && e.R2_ACCESS_KEY_ID && e.R2_SECRET_ACCESS_KEY && r2Bucket) {
    return {
      endpoint: r2Endpoint,
      region: 'auto',
      accessKeyId: e.R2_ACCESS_KEY_ID,
      secretAccessKey: e.R2_SECRET_ACCESS_KEY,
      bucket: r2Bucket,
      forcePathStyle: !!e.R2_ENDPOINT,
    };
  }
  return null;
}

let client: S3Client | null = null;
function s3() {
  if (client) return client;
  const c = config();
  if (!c) {
    throw new HttpError(503, 'Media storage is not configured. Set STORAGE_ENDPOINT, STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY (or the R2_* variables).');
  }
  client = new S3Client({
    region: c.region,
    endpoint: c.endpoint,
    forcePathStyle: c.forcePathStyle,
    credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey },
  });
  return client;
}
const bucket = () => config()!.bucket;

export const storageConfigured = () => config() !== null;

export async function presignUpload(key: string, mime: string, size: number) {
  return getSignedUrl(s3(), new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: mime, ContentLength: size }), { expiresIn: 15 * 60 });
}

/** URL platforms (Instagram, Threads, TikTok photos, Google) can fetch. Public base URL if set, else a 24h signed URL. */
export async function readUrl(key: string, ttlSeconds = 24 * 3600) {
  const pub = process.env.STORAGE_PUBLIC_URL || process.env.R2_PUBLIC_URL;
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
