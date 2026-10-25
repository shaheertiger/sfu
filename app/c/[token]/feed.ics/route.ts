import { calendarIcs, loadCalendar } from '@/lib/server/calendar';

export const dynamic = 'force-dynamic';

/** iCal feed of the shared calendar: subscribe to it from Google Calendar, Apple Calendar or Outlook. */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const data = await loadCalendar(token).catch((e) => (console.error('[calendar]', e?.message || e), null));
  if (!data) return new Response('This calendar link does not exist or was turned off.', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex' } });
  return new Response(calendarIcs(data), {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': 'inline; filename="schedule-for-you.ics"',
      'cache-control': 'private, max-age=300',
      'x-robots-tag': 'noindex',
    },
  });
}
