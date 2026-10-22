import { handler } from '@/lib/server/api';
import { PLATFORM_LIST, platformConfigured } from '@/lib/server/platforms';

export const GET = handler(async () => ({ platforms: PLATFORM_LIST.map((p) => ({ ...p, configured: platformConfigured(p) })) }));
