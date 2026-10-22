import { handler } from '@/lib/server/api';
import { listAccounts } from '@/lib/server/posts';

export const GET = handler(async ({ workspace }) => ({ accounts: await listAccounts(workspace.id), limit: workspace.account_limit }));
