import 'server-only';
import crypto from 'node:crypto';
import type Stripe from 'stripe';
import { PLANS, REFERRED_TRIAL_DAYS, stripe, TRIAL_DAYS, type PlanId } from './billing';
import { exec, now, one } from './db';
import { appUrl } from './url';

/*
 * Referral program ("give a month, get a month").
 * - Every workspace has a share code; the link is <app>/r/<code>. Opening it sets a 30-day cookie and
 *   lands on /signup. The workspace created at sign-up records the sender in `referred_by`.
 * - A referred workspace's free trial is REFERRED_TRIAL_DAYS instead of TRIAL_DAYS (billing.ts).
 * - The first time the referred workspace's subscription is `active` (its first real payment), the
 *   sender's Stripe customer gets one month of their plan as a credit, applied to their next invoice.
 *   The reward is claimed with one atomic UPDATE, so a replayed webhook can never pay twice.
 * - Sending your own link to yourself does nothing: a workspace owned by the sender is never attributed.
 */
export const COOKIE = 'sfy_ref';
export const COOKIE_MAX_AGE = 30 * 86400; // seconds
/** Codes are short, lowercase and free of look-alike characters (no 0/o, 1/l/i). */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
export const CODE_RE = /^[a-z0-9]{6,12}$/;
export { REFERRED_TRIAL_DAYS, TRIAL_DAYS };

export function newCode(length = 8): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export const normalizeCode = (raw: string | null | undefined): string | null => {
  const code = String(raw ?? '').trim().toLowerCase();
  return CODE_RE.test(code) ? code : null;
};

/** The referral code in a Cookie header, if any. */
export function readRefCookie(cookieHeader: string | null | undefined): string | null {
  for (const part of String(cookieHeader ?? '').split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === COOKIE) return normalizeCode(decodeURIComponent(rest.join('=')));
  }
  return null;
}

export const referralUrl = (code: string, req?: Request) => `${appUrl(req)}/r/${code}`;

/** The workspace's share code, made on first use. Old codes are kept so shared links keep working. */
export async function referralCode(workspaceId: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const row = await one('SELECT referral_code FROM workspaces WHERE id=$1', [workspaceId]);
    if (row?.referral_code) return row.referral_code;
    // A rare collision with another workspace's code fails the UNIQUE index; the loop tries another.
    await exec('UPDATE workspaces SET referral_code=$1 WHERE id=$2 AND referral_code IS NULL', [newCode(), workspaceId]).catch(() => 0);
  }
  throw new Error('Could not make a referral code');
}

/** Who a code belongs to, or null. */
export async function workspaceForCode(raw: string | null | undefined): Promise<{ id: string; owner_id: string } | null> {
  const code = normalizeCode(raw);
  if (!code) return null;
  return one('SELECT id, owner_id FROM workspaces WHERE referral_code=$1', [code]);
}

/**
 * Records that a brand-new workspace came from a referral link. Does nothing for an unknown code,
 * for the sender's own workspaces, or if the workspace already has a referrer.
 */
export async function attributeSignup(workspaceId: string, ownerId: string, code: string | null | undefined): Promise<string | null> {
  const ref = await workspaceForCode(code);
  if (!ref || ref.owner_id === ownerId || ref.id === workspaceId) return null;
  const n = await exec('UPDATE workspaces SET referred_by=$1 WHERE id=$2 AND owner_id=$3 AND referred_by IS NULL AND id<>$1', [ref.id, workspaceId, ownerId]);
  return n ? ref.id : null;
}

/** Credit in cents for one referral: a month of the sender's plan (Solo when they have no paid plan yet). */
export const creditCentsFor = (plan: string | null | undefined) => ((PLANS[plan as PlanId]?.amount ?? PLANS.solo.amount) * 100);

/**
 * Pays the sender for a referred workspace's first payment. Call when a subscription event leaves the
 * referred workspace `active`. Returns what was credited, or null when there was nothing to pay
 * (not referred, or already rewarded). A Stripe failure releases the claim and throws so the webhook retries.
 */
export async function rewardReferrer(referredWorkspaceId: string, client: Pick<Stripe, 'customers'> | null = null): Promise<{ referrer: string; cents: number } | null> {
  const t = now();
  const claimed = await one(
    'UPDATE workspaces SET referral_rewarded_at=$1 WHERE id=$2 AND referred_by IS NOT NULL AND referral_rewarded_at IS NULL RETURNING referred_by',
    [t, referredWorkspaceId],
  );
  if (!claimed?.referred_by) return null;
  const release = () => exec('UPDATE workspaces SET referral_rewarded_at=NULL WHERE id=$1 AND referral_rewarded_at=$2', [referredWorkspaceId, t]).catch(() => 0);
  try {
    const referrer = await one(
      'SELECT w.id, w.plan, w.stripe_customer_id, u.email, u.name FROM workspaces w JOIN users u ON u.id=w.owner_id WHERE w.id=$1',
      [claimed.referred_by],
    );
    if (!referrer) return null; // the sender's workspace is gone; nothing to credit, and nothing to retry
    const s = client ?? stripe();
    let customer: string | null = referrer.stripe_customer_id;
    if (!customer) {
      const c = await s.customers.create({ email: referrer.email, name: referrer.name || undefined, metadata: { workspace_id: referrer.id, app: 'schedule-for-you' } });
      await exec('UPDATE workspaces SET stripe_customer_id=COALESCE(stripe_customer_id,$1) WHERE id=$2', [c.id, referrer.id]);
      customer = (await one('SELECT stripe_customer_id FROM workspaces WHERE id=$1', [referrer.id]))?.stripe_customer_id ?? c.id;
    }
    const cents = creditCentsFor(referrer.plan);
    await s.customers.createBalanceTransaction(customer!, {
      amount: -cents,
      currency: 'usd',
      description: 'Referral credit: one free month (a workspace you invited started paying)',
      metadata: { app: 'schedule-for-you', referred_workspace_id: referredWorkspaceId },
    });
    return { referrer: referrer.id, cents };
  } catch (e) {
    await release();
    throw e;
  }
}

export type ReferralSummary = {
  code: string;
  url: string;
  signups: number;
  rewarded: number;
  credit_cents: number;
  trial_days: number;
  share_text: string;
};

/** What the dashboard shows: the link, how many came through it, and how many have paid. */
export async function referralSummary(workspaceId: string, plan: string | null | undefined, req?: Request): Promise<ReferralSummary> {
  const code = await referralCode(workspaceId);
  const url = referralUrl(code, req);
  const row = await one(
    'SELECT COUNT(*)::int AS signups, COUNT(referral_rewarded_at)::int AS rewarded FROM workspaces WHERE referred_by=$1',
    [workspaceId],
  );
  const credit_cents = creditCentsFor(plan);
  return {
    code,
    url,
    signups: row?.signups ?? 0,
    rewarded: row?.rewarded ?? 0,
    credit_cents,
    trial_days: REFERRED_TRIAL_DAYS,
    share_text: shareText(url),
  };
}

/** Plain text the share buttons prefill. People edit it before posting. */
export const shareText = (url: string) =>
  `I schedule my posts to X, Bluesky, Instagram, LinkedIn, Threads and more from one queue with Schedule For You. This link gets you a ${REFERRED_TRIAL_DAYS}-day free trial: ${url}`;
