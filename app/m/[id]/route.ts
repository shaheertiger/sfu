import { NextResponse } from 'next/server';
import { one } from '@/lib/server/db';
import { getBytes, storageConfigured } from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

/**
 * The original bytes of an uploaded image, served under a stable URL so Next's image optimizer can
 * make and cache thumbnails of it (see thumbUrlFor in lib/server/media.ts). Media IDs are 64 random
 * bits, the same guard the signed storage links rely on; videos are never served here, so nothing
 * large is ever buffered. A file's bytes never change, so the response is cacheable for a year.
 */
const ID_RE = /^med_[0-9a-f]{16}$/;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ID_RE.test(id) || !storageConfigured()) return new NextResponse('Not found', { status: 404 });
  try {
    const m = await one('SELECT object_key, mime FROM media WHERE id=$1 AND uploaded AND mime LIKE $2', [id, 'image/%']);
    if (!m) return new NextResponse('Not found', { status: 404 });
    const bytes = await getBytes(m.object_key);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'content-type': m.mime,
        'content-length': String(bytes.length),
        'cache-control': 'public, max-age=31536000, immutable',
        'content-disposition': 'inline',
        'x-robots-tag': 'noindex',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
