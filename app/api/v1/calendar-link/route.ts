import { z } from 'zod';
import { body, handler } from '@/lib/server/api';
import { calendarToken, calendarUrls, disableCalendarLink, enableCalendarLink } from '@/lib/server/calendar';
import { requireEditor } from '@/lib/server/roles';
import { requirePaid } from '@/lib/server/billing';

/** Whether the shared calendar link is on, and its URLs. */
export const GET = handler(async ({ req, workspace }) => {
  const token = await calendarToken(workspace.id);
  return { enabled: !!token, ...(token ? calendarUrls(token, req) : { url: null, ics_url: null }) };
});

/** Turns the link on (keeping the current one) or, with `rotate: true`, replaces it so old copies stop working. */
export const POST = handler(async ({ req, workspace }) => {
  requireEditor(workspace);
  requirePaid(workspace, 'calendar');
  const b = z.object({ rotate: z.boolean().optional() }).parse(await body(req).catch(() => ({})));
  const token = await enableCalendarLink(workspace.id, !!b.rotate);
  return { enabled: true, ...calendarUrls(token, req) };
});

/** Turns the link off. Every copy of it stops working at once. */
export const DELETE = handler(async ({ workspace }) => {
  requireEditor(workspace);
  await disableCalendarLink(workspace.id);
  return { enabled: false, url: null, ics_url: null };
});
