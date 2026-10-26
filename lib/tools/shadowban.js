/**
 * The guided shadowban test. No platform lets outsiders see whether an account's reach is limited,
 * so this is a checklist of tests anyone can run themselves (logged-out searches, a friend's view,
 * the platform's own status page), scored into a plain-language verdict. Nothing is fetched.
 *
 * Each check: id, q (the question), how (what to do), link(handle)? (a page that runs the test),
 * and `bad`: the answer that points to a restriction ('yes' or 'no'). `strong` checks are the
 * platform's own word (a status page or notice) and settle the verdict on their own.
 */

const enc = encodeURIComponent;

export const SHADOWBAN_PLATFORMS = {
  x: {
    label: 'X (Twitter)',
    handle: 'X username',
    status: 'Settings and privacy → Your account → Account status (or search Settings for “account status”)',
    checks: [
      { id: 'status', strong: true, bad: 'yes', q: 'Does your Account status page list a restriction?', how: 'Open X’s Account status page. “No restrictions” rules out an account-wide limit.' },
      { id: 'search', bad: 'no', q: 'Do your recent posts show up in a logged-out search?', how: 'Open the link in a private window (or ask someone who doesn’t follow you) and look at the Latest tab. If X asks you to log in, use a friend’s account instead.', link: (h) => `https://x.com/search?q=${enc(`from:${h}`)}&f=live` },
      { id: 'suggest', bad: 'no', q: 'Does your account appear when a friend starts typing your name in search?', how: 'A non-follower types your name or @username into X’s search box. Missing from the suggestions is what people call a “search suggestion ban”. New accounts often take a while to appear.' },
      { id: 'replies', bad: 'yes', q: 'Are your replies hidden behind “Show more replies” for other people?', how: 'Ask a friend to open a recent conversation you replied to and see where your reply sits.' },
      { id: 'drop', bad: 'yes', q: 'Did views drop by more than half overnight on posts like the ones that used to do well?', how: 'Compare similar posts in your analytics. A slow decline or one quiet post is normal variation.' },
    ],
  },
  instagram: {
    label: 'Instagram',
    handle: 'Instagram username',
    status: 'Settings → Account Status (search Settings for it if the menu has moved)',
    checks: [
      { id: 'status', strong: true, bad: 'yes', q: 'Does Account Status say some of your content or your account can’t be recommended?', how: 'Open Settings and search for “Account Status”. Instagram lists removed posts and whether your account is eligible to be recommended to non-followers.' },
      { id: 'hashtag', bad: 'no', q: 'Does a new post appear in the Recent results for a niche hashtag you used?', how: 'Ask a friend who doesn’t follow you to search a small, specific hashtag from your latest post. Big hashtags move too fast to tell.' },
      { id: 'profile', bad: 'no', q: 'Does your account appear when a non-follower searches your username?', how: 'Have a friend type your exact username into search.' },
      { id: 'nonfollowers', bad: 'yes', q: 'Did reach from non-followers fall close to zero in Insights?', how: 'Open Insights on recent posts and check “Accounts reached” split into followers and non-followers.' },
      { id: 'drop', bad: 'yes', q: 'Did reach drop by more than half overnight, across several posts?', how: 'Compare similar posts. Reach naturally varies by format, topic and posting time.' },
    ],
  },
  tiktok: {
    label: 'TikTok',
    handle: 'TikTok username',
    status: 'Settings and privacy → Account → Account status',
    checks: [
      { id: 'status', strong: true, bad: 'yes', q: 'Does Account status show a violation or a restriction?', how: 'TikTok lists violations and features you can’t use there. A video that isn’t eligible for the For You feed may also carry a notice in its details.' },
      { id: 'fyp', bad: 'yes', q: 'Do new videos get almost no views from the For You feed?', how: 'Open a recent video’s analytics → Traffic source. Near 0% from “For You” on several videos is a warning sign.' },
      { id: 'search', bad: 'no', q: 'Does your account appear when a friend searches your username?', how: 'A non-follower searches your exact @username in TikTok search.', link: (h) => `https://www.tiktok.com/@${h}` },
      { id: 'zero', bad: 'yes', q: 'Do new uploads sit at 0 views for hours?', how: 'Videos stuck at 0 can also be still processing or under review; check again after a few hours.' },
      { id: 'drop', bad: 'yes', q: 'Did views drop sharply across several videos, not just one?', how: 'One weak video is normal on TikTok. A pattern across a week is worth investigating.' },
    ],
  },
  youtube: {
    label: 'YouTube',
    handle: 'YouTube handle',
    status: 'YouTube Studio → Dashboard and Settings → Channel → Feature eligibility; Copyright and Community Guidelines notices',
    checks: [
      { id: 'status', strong: true, bad: 'yes', q: 'Does YouTube Studio show a strike, a warning or a feature you lost?', how: 'Check the Studio dashboard, your email and Settings → Channel → Feature eligibility.' },
      { id: 'search', bad: 'no', q: 'Does a recent video appear when a logged-out viewer searches its exact title?', how: 'Open the link in a private window. New videos can take a while to be indexed.', link: (h) => `https://www.youtube.com/@${h}/videos` },
      { id: 'comments', bad: 'yes', q: 'Do your comments on other channels disappear for people who are logged out?', how: 'Post a comment, then open the video in a private window and sort comments by newest. Channels can hold comments for review or hide users, which looks the same.' },
      { id: 'chat', bad: 'yes', q: 'Do your live chat messages show for you but not for others in a stream?', how: 'Ask a friend in the same chat. Channel moderators can hide a user, which is per channel, not YouTube-wide.' },
      { id: 'drop', bad: 'yes', q: 'Did impressions in YouTube Analytics fall sharply on several new videos?', how: 'Compare impressions and click-through rate. Lower clicks on thumbnails is more common than a restriction.' },
    ],
  },
  facebook: {
    label: 'Facebook',
    handle: 'Facebook Page username',
    status: 'Your Page → Professional dashboard → Page status (or Account status for a profile)',
    checks: [
      { id: 'status', strong: true, bad: 'yes', q: 'Does Page status or Account status list a restriction or content that “can’t be recommended”?', how: 'Facebook shows recommendation limits and removed content there, with a way to request a review.' },
      { id: 'search', bad: 'no', q: 'Does your Page appear when someone who doesn’t follow it searches the name?', how: 'Ask a friend to search your exact Page name.' },
      { id: 'notice', bad: 'yes', q: 'Did you get a notice that a post goes against Community Standards or was fact-checked?', how: 'Check notifications and Support inbox. Fact-checked or borderline posts are shown to fewer people.' },
      { id: 'drop', bad: 'yes', q: 'Did reach fall by more than half across several posts, beyond the usual ups and downs?', how: 'Compare similar posts in Meta Business Suite insights.' },
    ],
  },
  reddit: {
    label: 'Reddit',
    handle: 'Reddit username',
    status: 'Reddit messages and email (site-wide suspensions are announced); r/ShadowBan lets you test with a post',
    checks: [
      { id: 'profile', strong: true, bad: 'no', q: 'Does your profile page open when you’re logged out?', how: 'Open the link in a private window. A site-wide shadowban usually shows your profile as not found to everyone else.', link: (h) => `https://www.reddit.com/user/${enc(h)}/` },
      { id: 'comments', bad: 'yes', q: 'Do your comments show as [removed] or go missing when you’re logged out?', how: 'Open a thread you commented in from a private window. Removal in one subreddit is a moderator or AutoModerator action, not a shadowban.' },
      { id: 'votes', bad: 'yes', q: 'Do all your posts stay at exactly 1 point with no replies?', how: 'This alone is weak evidence on a quiet subreddit, but together with the profile test it’s telling.' },
    ],
  },
};

/**
 * Turns answers ({ [checkId]: 'yes' | 'no' }) into a verdict:
 * { level: 'unknown' | 'clear' | 'watch' | 'likely' | 'confirmed', bad, answered, total }.
 */
export function shadowbanVerdict(platform, answers = {}) {
  const p = SHADOWBAN_PLATFORMS[platform];
  if (!p) return { level: 'unknown', bad: 0, answered: 0, total: 0 };
  let bad = 0;
  let answered = 0;
  let strongBad = false;
  let strongClear = false;
  for (const c of p.checks) {
    const a = answers[c.id];
    if (a !== 'yes' && a !== 'no') continue;
    answered++;
    if (a === c.bad) {
      bad++;
      if (c.strong) strongBad = true;
    } else if (c.strong) strongClear = true;
  }
  const total = p.checks.length;
  if (strongBad) return { level: 'confirmed', bad, answered, total };
  if (answered === 0) return { level: 'unknown', bad, answered, total };
  if (bad >= 2) return { level: 'likely', bad, answered, total };
  if (bad === 1) return { level: 'watch', bad, answered, total };
  return { level: strongClear || answered >= Math.ceil(total / 2) ? 'clear' : 'unknown', bad, answered, total };
}

export const VERDICT_TEXT = {
  unknown: { title: 'Answer a few questions', body: 'Run the tests below and answer what you can. The account status check counts most.' },
  clear: { title: 'No sign of a shadowban', body: 'Your answers don’t point to limited visibility. A dip in reach is more likely timing, topic or format: compare posts like for like before changing anything.' },
  watch: { title: 'One warning sign, probably not a ban', body: 'One test failed. That’s often normal variation or a single post being limited. Re-run the tests in a few days and check the platform’s status page.' },
  likely: { title: 'Your reach looks limited', body: 'Several tests point to reduced visibility. Check the platform’s status page, remove or edit anything that may break its rules, pause automation and posting bursts, and keep posting normally for a couple of weeks.' },
  confirmed: { title: 'Strong sign of a restriction', body: 'The platform’s own status page or notice (on Reddit, your logged-out profile) is the most reliable test there is. Read which rule or post it names, fix or delete it, and use the appeal or review option it offers.' },
};
