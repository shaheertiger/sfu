import { isComingSoon } from '@/lib/coming-soon';
import { handler } from '@/lib/server/api';
import { PLATFORM_LIST, platformConfigured } from '@/lib/server/platforms';

// Server setup details (environment variable names, developer-console notes) stay private.
export const GET = handler(async () => ({ platforms: PLATFORM_LIST.map(({ envKeys, notes, ...p }) => ({ ...p, configured: platformConfigured({ id: p.id, envKeys }), coming_soon: isComingSoon(p.id) })) }));
