import 'server-only';
import { readUrl } from './storage';

export async function publicMedia(m: any) {
  return { id: m.id, filename: m.filename, mime: m.mime, size: m.size, folder: m.folder, created_at: m.created_at, url: await readUrl(m.object_key, 3600) };
}
