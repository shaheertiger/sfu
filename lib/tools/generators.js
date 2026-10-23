/**
 * Template-based idea generators for names, bios and comments. No AI and no network: everything is
 * built from the word lists below, shuffled with a seed so "More ideas" gives a fresh set.
 */

/** Small seeded PRNG (mulberry32) so results are stable for a given input and seed. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str) {
  let h = 2166136261;
  for (const c of String(str)) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

function shuffle(list, rand) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = (list, rand) => list[Math.floor(rand() * list.length)];
const cap = (w) => (w ? w[0].toUpperCase() + w.slice(1) : w);
const title = (s) => s.split(/\s+/).map(cap).join(' ');

/* ----------------------------------------------------------------------------------------------
 * Names
 * -------------------------------------------------------------------------------------------- */

export const NAME_STYLES = [
  { id: 'cool', label: 'Cool' },
  { id: 'aesthetic', label: 'Aesthetic' },
  { id: 'funny', label: 'Funny' },
  { id: 'professional', label: 'Professional' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'minimal', label: 'Minimal' },
];

const NAME_BANK = {
  cool: {
    pre: ['neo', 'nova', 'zen', 'ultra', 'prime', 'echo', 'vivid', 'swift', 'urban', 'astro', 'solar', 'north', 'bold', 'wild'],
    suf: ['wave', 'verse', 'zone', 'craft', 'pulse', 'shift', 'lab', 'loop', 'spark', 'drift', 'forge', 'line', 'mode', 'club'],
  },
  aesthetic: {
    pre: ['soft', 'lunar', 'dreamy', 'velvet', 'misty', 'golden', 'petal', 'cloud', 'honey', 'sage', 'ivory', 'dusk', 'rose', 'linen'],
    suf: ['bloom', 'haze', 'glow', 'diary', 'muse', 'skies', 'aura', 'daze', 'garden', 'notes', 'light', 'tides', 'room', 'days'],
  },
  funny: {
    pre: ['not', 'totally', 'captain', 'lowkey', 'accidental', 'chaotic', 'sleepy', 'hungry', 'certified', 'tiny', 'mostly', 'part-time', 'mildly', 'unpaid'],
    suf: ['enthusiast', 'gremlin', 'goblin', 'nugget', 'potato', 'noodle', 'wizard', 'overlord', 'bandit', 'situation', 'department', 'era', 'menace', 'intern'],
  },
  professional: {
    pre: ['the', 'go', 'get', 'try', 'hey', 'meet', 'team', 'studio', 'ask', 'with', 'all', 'true', 'clear', 'first'],
    suf: ['hq', 'studio', 'co', 'labs', 'works', 'group', 'collective', 'media', 'daily', 'pro', 'partners', 'hub', 'academy', 'journal'],
  },
  gaming: {
    pre: ['dark', 'shadow', 'pixel', 'frag', 'glitch', 'rogue', 'ninja', 'frost', 'blaze', 'turbo', 'ghost', 'void', 'storm', 'neon'],
    suf: ['gg', 'plays', 'gaming', 'main', 'legend', 'slayer', 'clutch', 'rage', 'op', 'arcade', 'quest', 'respawn', 'spawn', 'lobby'],
  },
  minimal: {
    pre: ['by', 'its', 'just', 'hi', 'the', 'one', 'only', 'hey', 'so', 'ok', 'im', 'via', 'and', 'yes'],
    suf: ['co', 'jr', 'only', 'one', 'now', 'here', 'too', 'and', 'daily', 'mk', 'io', 'xyz', 'is', 'ok'],
  },
};
const NUMBERS = { cool: ['7', '21', '88'], aesthetic: ['', '22'], funny: ['101', '404', '2am'], professional: [''], gaming: ['7', '99', '404', '360', '1337', 'x'], minimal: ['', '1', '0'] };

/**
 * Per-platform naming rules.
 * - handle: lowercase/allowed characters only, no spaces
 * - display: words with spaces, title case
 */
export const NAME_RULES = {
  x: { mode: 'handle', min: 4, max: 15, allowed: /[^A-Za-z0-9_]/g, seps: ['', '_'], camel: true, label: 'X username' },
  instagram: { mode: 'handle', min: 1, max: 30, allowed: /[^a-z0-9._]/g, lower: true, seps: ['', '.', '_'], label: 'Instagram username' },
  tiktok: { mode: 'handle', min: 2, max: 24, allowed: /[^a-z0-9._]/g, lower: true, seps: ['', '.', '_'], label: 'TikTok username' },
  reddit: { mode: 'handle', min: 3, max: 20, allowed: /[^A-Za-z0-9_-]/g, seps: ['', '_', '-'], camel: true, label: 'Reddit username' },
  telegram: { mode: 'handle', min: 5, max: 32, allowed: /[^a-z0-9_]/g, lower: true, seps: ['', '_'], startLetter: true, label: 'Telegram username' },
  discord: { mode: 'handle', min: 2, max: 32, allowed: /[^a-z0-9_.]/g, lower: true, seps: ['', '.', '_'], label: 'Discord username' },
  generic: { mode: 'handle', min: 3, max: 15, allowed: /[^a-z0-9_]/g, lower: true, seps: ['', '_'], label: 'Username that fits every major platform' },
  youtube: { mode: 'display', min: 3, max: 50, label: 'YouTube channel name' },
  youtubeBrand: { mode: 'display', min: 3, max: 50, brand: true, label: 'YouTube brand channel name' },
  facebookPage: { mode: 'display', min: 3, max: 50, brand: true, label: 'Facebook Page name' },
  xPage: { mode: 'display', min: 3, max: 50, brand: true, label: 'X display name' },
  facebook: { mode: 'display', min: 2, max: 40, nickname: true, label: 'Nickname' },
};

const BRAND_WORDS = ['Studio', 'Co.', 'Collective', 'Supply', 'House', 'Works', 'Lab', 'Kitchen', 'Club', 'Journal', 'Academy', 'Market', 'Workshop', 'Society'];

function keywords(input) {
  const words = String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .slice(0, 3);
  return words.length ? words : ['maple'];
}

function cleanHandle(raw, rule) {
  let s = rule.lower ? raw.toLowerCase() : raw;
  s = s.replace(/[\s-]+/g, rule.allowed.test('-') ? '_' : '-');
  rule.allowed.lastIndex = 0;
  s = s.replace(rule.allowed, '');
  rule.allowed.lastIndex = 0;
  s = s.replace(/([._-])\1+/g, '$1').replace(/^[._-]+|[._-]+$/g, '');
  if (rule.lower) s = s.replace(/\.{2,}/g, '.');
  return s;
}

function validName(name, rule) {
  const len = Array.from(name).length;
  if (len < rule.min || len > rule.max) return false;
  if (rule.startLetter && !/^[a-z]/i.test(name)) return false;
  return true;
}

function handleCandidates(words, style, rule, rand) {
  const bank = NAME_BANK[style];
  const kw = words.join('');
  const first = words[0];
  const camelKw = words.map(cap).join('');
  const k = rule.camel || rule.mode === 'handle' && !rule.lower ? camelKw : kw;
  const out = [];
  const nums = NUMBERS[style];
  for (const sep of rule.seps) {
    for (const p of bank.pre) out.push(`${rule.camel ? cap(p) : p}${sep}${k}`);
    for (const s of bank.suf) out.push(`${k}${sep}${rule.camel ? cap(s) : s}`);
    for (let i = 0; i < 6; i++) out.push(`${pick(bank.pre, rand)}${sep}${first}${sep}${pick(bank.suf, rand)}`);
  }
  for (const n of nums) if (n) out.push(`${k}${n}`, `${pick(bank.pre, rand)}${first}${n}`);
  if (words.length > 1) out.push(words.map((w) => w[0]).join('') + pick(bank.suf, rand), first + words[words.length - 1].slice(0, 3));
  out.push(`real${k}`, `${k}hq`, `its${k}`);
  return out.map((c) => cleanHandle(c, rule));
}

function displayCandidates(words, style, rule, rand) {
  const bank = NAME_BANK[style];
  const kw = title(words.join(' '));
  const first = cap(words[0]);
  const out = [];
  for (const p of bank.pre) if (!['the', 'its', 'im', 'and', 'by', 'via', 'with'].includes(p)) out.push(`${title(p)} ${kw}`);
  // Two-letter tags (gg, op, co) read fine in a handle but not as words in a display name.
  const suf = bank.suf.filter((s) => s.length > 2);
  for (const s of suf) out.push(`${kw} ${title(s)}`);
  for (let i = 0; i < 8; i++) out.push(`The ${title(pick(bank.pre, rand))} ${first}`, `${first} & ${title(pick(suf, rand))}`);
  if (rule.brand) {
    for (const b of BRAND_WORDS) out.push(`${kw} ${b}`, `The ${kw} ${b}`);
  }
  if (rule.nickname) {
    out.push(`${first}y`, `Lil ${first}`, `${first} the ${title(pick(suf, rand))}`, `Big ${first}`);
  }
  if (style === 'gaming') out.push(`${kw} Plays`, `${kw} Live`, `${first} Gaming`);
  if (style === 'minimal') out.push(kw, `${first}.`, `just ${first}`);
  return out.map((c) => c.replace(/\s+/g, ' ').trim());
}

/** Thirty ideas that follow the platform's rules. `seed` changes the set. */
export function generateNames({ keyword, style = 'cool', platform = 'generic', seed = 0, count = 30 }) {
  const rule = NAME_RULES[platform] || NAME_RULES.generic;
  const words = keywords(keyword);
  const st = NAME_BANK[style] ? style : 'cool';
  const rand = rng(hash(`${words.join(' ')}|${st}|${platform}|${seed}`));
  const raw = rule.mode === 'display' ? displayCandidates(words, st, rule, rand) : handleCandidates(words, st, rule, rand);
  const seen = new Set();
  const result = [];
  for (const name of shuffle(raw, rand)) {
    const key = name.toLowerCase();
    if (!name || seen.has(key) || !validName(name, rule)) continue;
    seen.add(key);
    result.push(name);
    if (result.length >= count) break;
  }
  return result;
}

/* ----------------------------------------------------------------------------------------------
 * Bios
 * -------------------------------------------------------------------------------------------- */

export const BIO_TONES = [
  { id: 'friendly', label: 'Friendly' },
  { id: 'professional', label: 'Professional' },
  { id: 'funny', label: 'Funny' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'aesthetic', label: 'Aesthetic' },
];

/** Bio limits per platform, in characters. `long` platforms get paragraph-style templates. */
export const BIO_PLATFORMS = {
  instagram: { limit: 150, lines: true, cta: ['New posts every week', 'Say hi in the DMs', 'Latest post below', 'Tap the link for more'] },
  tiktok: { limit: 80, lines: true, cta: ['New videos weekly', 'Follow for more', 'Part 2 soon'] },
  x: { limit: 160, lines: false, cta: ['Posts are my own', 'DMs open', 'Threads most weeks'] },
  telegram: { limit: 70, lines: false, cta: ['DMs open', 'Updates daily'] },
  discord: { limit: 190, lines: true, cta: ['DMs open for collabs', 'Say hi', 'Usually online evenings'] },
  youtube: { limit: 1000, long: true, cta: ['Subscribe so you never miss one.', 'New videos every week.', 'Turn on notifications to catch new uploads.'] },
};

const EMOJI = {
  friendly: ['👋', '😊', '🌱', '✌️', '💬', '☕'],
  professional: ['📍', '💼', '📈', '✉️', '🔗', '📌'],
  funny: ['🙃', '🍕', '🤷', '😅', '🦆', '🥲'],
  minimal: ['·', '—', '/', '→', '•', '✦'],
  aesthetic: ['✨', '🌙', '🤍', '🌿', '☁️', '🕊️'],
};

const BIO_TEMPLATES = {
  friendly: [
    '{e} {Role} sharing {topic}',
    'Hi! I’m a {role} who loves {topic} {e}',
    '{Role} | {topic} | {cta} {e}',
    'Here for {topic} and good conversations {e}',
    '{e} {Role}\n{Topic}, one post at a time\n{cta}',
    'Just a {role} figuring out {topic} out loud {e}',
    '{Topic} tips from a {role} who’s been there {e}',
    'Your friendly {role} for all things {topic} {e}',
    '{e} {Topic} • {role} • {cta}',
    'Making {topic} a little easier for everyone {e}',
    'Glad you’re here! {Topic} from a {role} {e}',
    '{Role} by day, {topic} fan always {e}',
    '{e} Learning, sharing, repeating: {topic}',
    '{Topic}, made friendly. {cta} {e}',
  ],
  professional: [
    '{Role} specializing in {topic}. {cta}',
    '{e} {Role} | {Topic} | {cta}',
    'Helping people with {topic}. {Role}.',
    '{Role}. Practical insights on {topic}.',
    '{Topic} for teams that want results. {e}',
    '{Role} focused on {topic} {e} {cta}',
    '{e} {Topic}\n{Role}\n{cta}',
    'I help clients with {topic}. {Role}.',
    'Notes on {topic} from a working {role}.',
    '{Role} · {Topic} · Open to projects {e}',
    '{Topic}, explained clearly. {cta}',
    'Experienced {role}. Writing about {topic}.',
    '{e} {Role} sharing what works in {topic}',
  ],
  funny: [
    '{Role} by trade, {topic} by obsession {e}',
    'Professional {role}. Amateur at everything except {topic} {e}',
    'I post about {topic} so my friends don’t have to listen {e}',
    '{Role}. Powered by coffee and {topic} {e}',
    '{e} 90% {topic}, 10% wondering where my keys are',
    'Certified {topic} enthusiast (self-certified) {e}',
    'Talking about {topic} until someone stops me {e}',
    '{Role} with strong opinions on {topic} {e}',
    'If it’s {topic}, I’ve probably overthought it {e}',
    '{e} Here for {topic}. Staying for the snacks.',
    'My mom says my {topic} posts are great {e}',
    'Recovering {topic} addict. Not recovering. {e}',
    '{Role} | {topic} | chaos coordinator {e}',
  ],
  minimal: [
    '{Role} {e} {topic}',
    '{Topic}.',
    '{Role}. {Topic}.',
    '{topic} {e} {role}',
    '{Role}\n{Topic}',
    '{Topic} {e} {cta}',
    'Mostly {topic}.',
    '{role} / {topic}',
    '{Topic}, simply.',
    'On {topic}.',
    '{Role} {e} based online',
    '{Topic} notes {e} {role}',
  ],
  aesthetic: [
    '{e} {topic} & slow mornings',
    '{Role} {e} collecting {topic} moments',
    '{e} soft days, {topic} and good light',
    'a little corner for {topic} {e}',
    '{e} {Role}\n{topic} diaries\n{cta}',
    '{topic}, coffee and quiet places {e}',
    '{e} finding beauty in {topic}',
    'living for {topic} {e} {role}',
    'golden hour & {topic} {e}',
    '{e} {topic} · {role} · daydreamer',
    'romanticizing {topic} {e}',
    '{e} {role} with a soft spot for {topic}',
  ],
};

const LONG_TEMPLATES = {
  friendly: [
    'Welcome! I’m a {role}, and this channel is all about {topic}. {e}\n\nEvery video is something I’ve tried myself, explained the way I wish someone had explained it to me. Expect honest takes, simple steps and the occasional mistake I’ve learned from.\n\n{cta}',
    'Hi, I’m glad you found this channel {e}\n\nHere you’ll find {topic} videos from a {role} who loves sharing what works. Ask questions in the comments: they shape what I make next.\n\n{cta}',
  ],
  professional: [
    'Practical {topic} from a working {role}.\n\nThis channel covers clear, step-by-step videos you can apply the same day: walkthroughs, breakdowns and lessons from real projects. No fluff and no hype.\n\n{cta}\n\nFor business inquiries, use the email address in the channel details.',
    '{Topic}, explained by a {role}. {e}\n\nVideos here focus on what actually works: frameworks, examples and common mistakes to avoid. Whether you’re starting out or leveling up, there’s something for you.\n\n{cta}',
  ],
  funny: [
    'I’m a {role} who talks about {topic} way more than is socially acceptable, so I started a channel. {e}\n\nExpect useful stuff, questionable jokes and at least one tangent per video.\n\n{cta}',
    'This is the {topic} channel your friends warned you about. {e}\n\nMade by a {role} with too many opinions and not enough sleep. Come for the tips, stay for the bloopers.\n\n{cta}',
  ],
  minimal: [
    '{Topic}. Made by a {role}.\n\n{cta}',
    'Videos about {topic}.\n\nShort, clear and to the point. {cta}',
  ],
  aesthetic: [
    '{e} a quiet little channel about {topic}.\n\nslow videos, soft light and the small moments in between. made with love by a {role}.\n\n{cta}',
    '{e} {topic} diaries, filmed and shared by a {role}.\n\nput the kettle on and stay a while. {cta}',
  ],
};

function fill(tpl, { role, topic, cta, e, emoji }) {
  // Without emoji, an emoji that sat between two words becomes a separator dot.
  let s = (emoji ? tpl : tpl.replace(/(\S) \{e\} (\S)/g, '$1 · $2'))
    .replaceAll('{Role}', cap(role))
    .replaceAll('{role}', role)
    .replaceAll('{Topic}', cap(topic))
    .replaceAll('{topic}', topic)
    .replaceAll('{cta}', cta)
    .replaceAll('{e}', emoji ? e : '');
  if (!emoji) s = s.replace(/[ \t]{2,}/g, ' ').replace(/^ +| +$/gm, '').replace(/\|\s*\|/g, '|').replace(/^[|·•]\s*|\s*[|·•]$/gm, '');
  return s.trim();
}

/** Twelve bios that fit the platform's limit. */
export function generateBios({ role, topic, tone = 'friendly', platform = 'instagram', emoji = true, seed = 0, count = 12 }) {
  const cfg = BIO_PLATFORMS[platform] || BIO_PLATFORMS.instagram;
  const t = BIO_TEMPLATES[tone] ? tone : 'friendly';
  const r = String(role || 'creator').trim().toLowerCase() || 'creator';
  const tp = String(topic || 'everyday life').trim() || 'everyday life';
  const rand = rng(hash(`${r}|${tp}|${t}|${platform}|${emoji}|${seed}`));
  const pool = cfg.long ? [...LONG_TEMPLATES[t], ...LONG_TEMPLATES[t === 'minimal' ? 'professional' : 'minimal'], ...BIO_TEMPLATES[t]] : BIO_TEMPLATES[t];
  const out = [];
  const seen = new Set();
  for (const tpl of cfg.long ? pool : shuffle(pool, rand)) {
    let text = fill(tpl, { role: r, topic: tp, cta: pick(cfg.cta, rand), e: pick(EMOJI[t], rand), emoji });
    if (!cfg.lines && !cfg.long) text = text.replace(/\n+/g, ' · ');
    if (Array.from(text).length > cfg.limit || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
    if (out.length >= count) break;
  }
  return out;
}

/* ----------------------------------------------------------------------------------------------
 * Comments
 * -------------------------------------------------------------------------------------------- */

export const COMMENT_TONES = [
  { id: 'supportive', label: 'Supportive' },
  { id: 'question', label: 'Curious question' },
  { id: 'funny', label: 'Funny' },
  { id: 'professional', label: 'Professional' },
  { id: 'hype', label: 'Hype' },
];

const COMMENTS = {
  supportive: [
    'This is such a helpful take on {topic}. Thank you for sharing it.',
    'Love how clearly you explained {topic}. Saving this one.',
    'You can tell how much work went into this. {Topic} done right.',
    'Needed this today. {Topic} has been on my mind all week.',
    'Really well put together. The {topic} part was my favorite.',
    'Your posts about {topic} keep getting better.',
    'This made {topic} feel a lot less intimidating. Thank you!',
    'Sharing this with a friend who’s been asking about {topic}.',
    'Such a thoughtful post. More on {topic} please!',
    'I appreciate how honest you are about {topic}.',
    'This is the kind of {topic} content I follow you for.',
    'Bookmarked. I’ll be coming back to this {topic} tip.',
  ],
  question: [
    'How long did it take you to get comfortable with {topic}?',
    'What’s the one thing you wish you knew before starting {topic}?',
    'Would this approach to {topic} work for a total beginner?',
    'Do you have a go-to resource for learning more about {topic}?',
    'What was the hardest part of {topic} for you?',
    'Curious: would you do {topic} differently if you started today?',
    'Any tips for doing {topic} on a small budget?',
    'How do you stay consistent with {topic}?',
    'Is there a common {topic} mistake people should avoid?',
    'Could you do a follow-up on {topic}? I have so many questions.',
    'What tools do you use for {topic}?',
    'How did you first get into {topic}?',
  ],
  funny: [
    'Me, pretending I understood {topic} before this post.',
    'Adding “{topic} expert” to my resume after watching this.',
    'My {topic} skills just went from zero to slightly above zero.',
    'I came for {topic} and left with a whole new personality.',
    'Showing this to everyone who said {topic} was “just a phase”.',
    'Okay but who gave you permission to be this good at {topic}?',
    'My bank account seeing me get into {topic} after this.',
    'Me at 2am: just one more {topic} post.',
    'Not me taking notes on {topic} like there’s a test tomorrow.',
    'The way I immediately tried this {topic} tip and failed. Respect.',
    'Officially obsessed with {topic} now. Thanks, I guess.',
    'This {topic} post lives in my head rent-free.',
  ],
  professional: [
    'Great breakdown of {topic}. The practical steps are especially useful.',
    'Clear and actionable. This is a strong overview of {topic}.',
    'Valuable perspective on {topic}. Thanks for putting this together.',
    'Well said. {Topic} is often overcomplicated, and this cuts through it.',
    'Useful framework for thinking about {topic}. I’ll be sharing it with my team.',
    'This matches what we’ve seen with {topic}. Good to see it laid out so clearly.',
    'Insightful post. I’d add that consistency matters most with {topic}.',
    'Appreciate the specifics here. {Topic} advice is rarely this concrete.',
    'Solid points on {topic}. Looking forward to your next post.',
    'Thanks for sharing your experience with {topic}. Very relevant right now.',
    'A helpful reminder of the basics of {topic}.',
    'Excellent post on {topic}. Bookmarking for reference.',
  ],
  hype: [
    'This {topic} post is everything!',
    'Okay, {topic} just got a whole lot cooler.',
    'Absolutely nailed it. Best {topic} content I’ve seen this week.',
    'Can’t stop rewatching this. {Topic} perfection.',
    'You make {topic} look so easy. Incredible.',
    'The {topic} glow-up we all needed.',
    'Instant follow. This {topic} post is too good.',
    'This deserves way more attention. {Topic} at its best.',
    'Every {topic} post you make is a hit.',
    'Wow. Just wow. {Topic} done perfectly.',
    'Top-tier {topic} content, as always.',
    'Saving, sharing and coming back to this {topic} post.',
  ],
};

const PLATFORM_COMMENTS = {
  youtube: { question: ['Could you make a full video just on {topic}?', 'Is there a part two coming on {topic}?'], supportive: ['Watched this twice. The section on {topic} finally made it click.', 'Subscribed for more {topic} videos like this.'] },
  tiktok: { funny: ['The {topic} part had me rewatching five times.'], question: ['Part 2 on {topic}? Please?'], supportive: ['This {topic} video deserves to blow up.'] },
  instagram: { supportive: ['Saving this for later. {Topic} is exactly what I needed.'], question: ['Would love a carousel breaking down {topic} step by step!'] },
};

/** Twelve comment ideas to edit and post yourself. */
export function generateComments({ topic, tone = 'supportive', platform = 'generic', seed = 0, count = 12 }) {
  const t = COMMENTS[tone] ? tone : 'supportive';
  const tp = String(topic || 'this').trim().replace(/[.!?]+$/, '') || 'this';
  const rand = rng(hash(`${tp}|${t}|${platform}|${seed}`));
  const extra = PLATFORM_COMMENTS[platform]?.[t] || [];
  const pool = shuffle([...extra, ...COMMENTS[t]], rand);
  return pool.slice(0, count).map((tpl) => tpl.replaceAll('{Topic}', cap(tp)).replaceAll('{topic}', tp));
}
