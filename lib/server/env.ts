/**
 * Reads a setting from the environment, forgiving the two ways a Vercel variable is most often
 * mistyped: different capitalisation (X_Client_ID for X_CLIENT_ID) and a provider's own name for
 * the same value (Pinterest calls the App ID a "client id"; a Resend key saved as "Resend").
 * The canonical name always wins when it is set.
 */
const ALIASES: Record<string, string[]> = {
  PINTEREST_APP_ID: ['PINTEREST_CLIENT_ID'],
  PINTEREST_APP_SECRET: ['PINTEREST_CLIENT_SECRET'],
  RESEND_API_KEY: ['RESEND', 'RESEND_KEY'],
};

export function readEnv(name: string, source: Record<string, string | undefined> = process.env): string {
  for (const key of [name, ...(ALIASES[name] || [])]) {
    if (source[key]) return source[key] as string;
    const upper = key.toUpperCase();
    const loose = Object.keys(source).find((k) => k.toUpperCase() === upper && source[k]);
    if (loose) return source[loose] as string;
  }
  return '';
}
