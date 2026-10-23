import 'server-only';

/**
 * Transactional email through Resend (https://resend.com/docs/api-reference/emails/send-email).
 * RESEND_API_KEY: API key. EMAIL_FROM: sender on a domain verified in Resend.
 * Without a key, emails are logged and skipped so local runs and tests never send.
 */
const DEFAULT_FROM = 'Schedule For You <notifications@scheduleforyou.com>';

export const emailConfigured = () => !!process.env.RESEND_API_KEY;

export type Email = { to: string | string[]; subject: string; html: string; text: string; replyTo?: string };

export async function sendEmail(mail: Email): Promise<{ id?: string; skipped?: boolean }> {
  const to = [...new Set([mail.to].flat().filter(Boolean))];
  if (!to.length) return { skipped: true };
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email] RESEND_API_KEY not set, skipped "${mail.subject}" to ${to.join(', ')}`);
    return { skipped: true };
  }
  const res = await fetch(process.env.RESEND_API_URL || 'https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${res.status}: ${body?.message || body?.name || 'send failed'}`);
  return { id: body.id };
}

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const SETTINGS_FOOTER = 'Turn these emails on or off in Settings.';

/**
 * Simple branded HTML wrapper. `body` must already be escaped HTML.
 * `opts.footer`: plain text (escaped here) replacing the default Settings note; `null` leaves the footer out.
 * `opts.afterCta`: escaped HTML placed under the button, inside the card.
 */
export function layout(title: string, body: string, cta?: { label: string; url: string }, opts: { footer?: string | null; afterCta?: string } = {}) {
  const button = cta
    ? `<p style="margin:24px 0 0"><a href="${esc(cta.url)}" style="display:inline-block;background:#dcff2e;color:#15171a;font-weight:600;text-decoration:none;padding:12px 18px;border-radius:10px">${esc(cta.label)}</a></p>`
    : '';
  const footerText = opts.footer === undefined ? SETTINGS_FOOTER : opts.footer;
  const footer = footerText ? `\n<p style="margin:16px 4px 0;font-size:12px;color:#7a7d82">${esc(footerText)}</p>` : '';
  return `<!doctype html><html><body style="margin:0;background:#f6f6f3;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#15171a">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="margin:0 0 20px;font-weight:700;font-size:15px">schedule for you</p>
<div style="background:#fff;border-radius:14px;padding:24px;border:1px solid #e7e7e2">
<h1 style="margin:0 0 12px;font-size:20px;line-height:1.3">${esc(title)}</h1>
${body}${button}${opts.afterCta || ''}
</div>${footer}
</div></body></html>`;
}
