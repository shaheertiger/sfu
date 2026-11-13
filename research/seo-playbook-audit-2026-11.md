# SEO audit against the Master SEO Playbook (13 Nov 2026)

What was checked: the whole repo, a local production build, and all 1,234 sitemap URLs fetched and parsed. That covers 187 blog posts, 874 programmatic pages, 97 tools, 43 translated pages and the landing pages.

What was **not** available:
- The live site (blocked from this session).
- Semrush (no API units left).
- Search Console (connector access was not granted).

Every count below comes from the code or the rendered HTML. Traffic impact is estimated from the playbook's case studies, not measured on our site.

## Verdict in one paragraph

The site gets the **page-level** mechanics mostly right. Titles carry the answer on the programmatic pages, every page has a FAQ in FAQPage schema, the answers are in the server HTML, the breadcrumbs work, every page is within 3 clicks of home, and canonicals are clean.

The risk is **site-level**. 71% of the sitemap (874 of 1,234 URLs) comes from four templates, and three of them repeat the same text and often the same answer across siblings:
- post-ideas: 66–74% 5-gram overlap
- best-time weekday pages: 89%
- best-time country pages: 45–66%

That is the guntherheller / September-2026-spam-update pattern ("one template multiplied"), not the NutriScan pattern (about 2–3% overlap, demand-gated).

The second problem is **two pages per query with different numbers**. The blog and the programmatic pages compete for the same searches and disagree on the facts. The third is **missing trust plumbing**: no methodology page, no sources in 80% of posts, no visible "Updated" date, no named authors, no legal entity.

## Scorecard: the 12 mechanics plus the later rules

| # | Playbook rule | Status | Evidence |
|---|---|---|---|
| 1 | Pick a query class, gate pages on demand | **FAIL** | Every combination is generated: 10 platforms × 25 countries, 10 × 7 weekdays, 40 industries × 7 weekdays. There is no demand data in the repo. Combinations include "Google Business in the UAE" and "Monday post ideas for accounting firms". |
| 2 | Own a real database and add one proprietary column | PARTIAL | Specs and notify facts are hand-written and dated (good). Best-time: only **6 countries are measured** (Google Trends). 14 countries are estimates from Wikipedia traffic × the measured pattern. 5 countries (AU, MX, AE, IE, NZ: 55 pages) show a hand-made `baselineGrid()`, yet the titles state an exact slot. The hub description claims "real scheduling data" (`app/best-time-to-post/page.jsx:22`). |
| 3 | Answer in the title | PARTIAL | Programmatic pages: yes ("Instagram Story size (2026): 1080 × 1920 px"). Blog: only **34%** of titles carry a real answer number. About 19 fact posts hide the answer behind a hook. Post-ideas titles carry only a count. |
| 4 | Answer again in the first screen | PARTIAL | Programmatic pages have an answer banner. Blog posts put the answer at about word 30, but there is **no Quick answer block in 0 of 187**, and the median intro is 136 words before the first H2. 13 posts, including all the "best/free" posts, give no answer in the first 100 words. |
| 5 | One H2 per sub-intent, phrased as the query | PARTIAL | 57% of blog H2s start with a question word, but only 4% are real questions. "What Most People Don't Know" appears in 187 posts, "What to Do Next" in 161 and "(Use With Caution)" in 140. That is the Founderpath repeated-sibling-headings pattern. |
| 6 | FAQ on every page, as FAQPage, answers under 50 words | **PASS** | Every page has one. Blog answers have a median of 25 words; 0.6% run over 50. Schema matches the visible text. (FAQ rich results are gone for ordinary sites; keep FAQPage for answer engines.) |
| 7 | Interactive element, crawlable | PASS | The tools are above the fold and server-rendered (409 styled characters in the font generator's HTML). The best-time heatmap is a plain `<table>`. |
| 8 | Tight hierarchy, 3 clicks, BreadcrumbList | PASS / PARTIAL | 1,232 of 1,234 URLs are within 3 clicks. **0 of 187 posts link to /specs, /does-it-notify or /post-ideas**, and only 7 link to /best-time-to-post. 35 posts get no inbound link from another post. Hubs `/specs` (256 words) and `/post-ideas` (119 words) are thin and compute no stats. |
| 9 | Variant pages only with distinct numbers | **FAIL** | Bluesky and Pinterest show the same answer on all 7 weekday pages, and Instagram on 6 of 7. The titles differ only by the day name. |
| 10 | Trust block, date, /methodology | PARTIAL | Specs and notify show "verified/checked" dates and a "Report a change" link (good). **No /methodology page exists** (0 links). 80% of posts have **zero outbound links** and 0 have a Sources section. Blog pages show no "Updated" date, although schema sends `dateModified`. |
| 11 | Locale mirrors: translated slugs, hreflang, native titles, only where there is demand | PARTIAL | hreflang is reciprocal with x-default, and titles and headings are native (good). 42 of 43 slugs are English. `<html lang="en">` is hardcoded on every locale (`app/layout.jsx`). There is no demand evidence: 15 of 16 ja pages are generic tools (tier list, EXIF, blur). |
| 12 | App CTA with UTM per placement | **FAIL** | About 20 CTA placements link to a bare `/signup`. Nothing records which page or widget converts. |
| — | robots: allow AI search bots, block backlink crawlers | PARTIAL | AI search bots are allowed by name. Ahrefs, DataForSEO and SE Ranking are not blocked. **Bug:** `Disallow: /brand` and `/app` are prefix matches, so they block `/brand/logo-512.png` (the Organization logo in every page's JSON-LD) and `/apple-icon.png`. |
| — | One sitemap per family, honest lastmod | **FAIL** | There is one flat file. 1,046 URLs have no lastmod, and 356 say `daily`. 186 of 188 blog lastmods are the same bulk date. `/signup` is listed at priority 0.8. |
| — | IndexNow on every deploy | FAIL | It only runs as the manual `npm run seo:indexnow`, and it sends the whole sitemap. |
| — | Dataset schema on tables of measured values | PARTIAL | Best-time pages have it. The 61 specs and platform-spec pages don't. |
| — | Hub pages with ItemList | PARTIAL | /tools, /blog and /compare have ItemList. /best-time-to-post, /specs, /does-it-notify and /post-ideas don't. |
| — | Tool pages: WebApplication + FAQPage + HowTo + Breadcrumb, promise in title | PARTIAL | HowTo is missing on all 97. 54 titles say "Free"; only 2 say "No Sign-Up". |
| — | Entity kit (About, how it works, "is X legit", "X vs Y") | **FAIL** | The About page has no people, founding date, place or contact. The Organization schema has no contactPoint or sameAs, and the footer has no legal name. No page answers "Is Schedule For You legit?" or "Schedule For You vs Buffer". |
| — | Commercial "best X" pages on the Slo template | **FAIL** | The 6 blog posts and 5 landing pages are "types of tool" explainers. Five of the six blog posts name almost no competitors, and none has picks at a glance, a dated how-we-picked section, a Sources list or ItemList. (Honest "not the best fit" lines are already a strength.) |
| — | Social title equals page title | PARTIAL | Homepage og:title is "Write it once. Post it everywhere.", but the page title is different. The homepage H1 has no query words. |
| — | Bing: `max-image-preview:large` in robots meta | PARTIAL | It is only in the `googlebot` meta (`app/layout.jsx:24`); Bing reads `robots`. |

## 1. Scaled-content exposure (the biggest risk)

| Family | Pages | Median words | Sibling overlap | Playbook verdict |
|---|---|---|---|---|
| post-ideas industry × weekday | 280 | 522 | **70–74%** | Prune |
| post-ideas industry | 40 | 756 | **66%** | Cut to demand and rewrite |
| best-time platform × weekday | 70 | 1,111 | **89%** (prose 96%) | Merge into hubs |
| best-time platform × country | 250 | 1,817 | 45% (66% same country, other platform) | Gate on demand |
| best-time social × country | 25 | 1,877 | 48% | Keep, add local content |
| specs spec pages | 50 | 302 | 55% | Thin; fold or deepen |
| does-it-notify actions | 126 | 575 | 46–62% | Keep facts, trim shared prose |
| tools | 97 | 1,281 | 8–17% | OK |
| blog | 187 | 1,875 | median 0.8% | OK |

Bugs that confirm "machine-filled" to a reader and to quality raters:
- 109 post-ideas titles misspell plurals ("Post Ideas for **Bakerys**", "Agencys", "HVAC Companys", "Small Businesss").
- 143 post-ideas headings use the wrong article ("a accounting firm", "a online store").
- Specs "Same spec on other platforms" links are wrong: the Instagram Story page links to "TikTok profile picture size".
- Best-time "Nearby countries" links show the UTC offset, not that country's best time.

## 2. Facts that disagree between our own pages

The playbook's rule: never let the numbers disagree between blocks. These need one answer, sourced and dated:

| Topic | Page A | Page B |
|---|---|---|
| Threads media per post | `/blog/threads-character-limit` title: "Up to 20 Photos" | `/specs/threads/*`: "Up to 10" (probably the app-vs-API split; say so on both) |
| TikTok caption limit | `/specs/tiktok/caption-character-limit`: 4,000 (says it reflects what we enforce) | `lib/server/platforms.ts:63` enforces `maxChars: 2200` |
| LinkedIn post image | `/specs/linkedin/post-image-size`: 1200×627 | Blog title: 1080×1350 |
| Instagram Reels length | Long-video post: 3 min "in the app" | Specs: 3 min API / 15 min app |
| Best time on Facebook | Blog: "7–10 AM weekdays" | `/best-time-to-post/facebook`: "Sunday at 8 PM" |
| Best time on TikTok | Blog: "6–9 PM" | Data page: "Sunday at 10 PM" |
| Best-time philosophy | Blog: "any article that names one perfect hour is guessing" | Our hub names one hour in its title |
| Network count | Footer: "ten networks" (`components/marketing/Chrome.jsx:93`) | Everywhere else: nine |

## 3. Two pages per query: choose the owner

| Query | Competing URLs | Recommended owner | Other page becomes |
|---|---|---|---|
| best time to post on {instagram, facebook, tiktok, youtube} | 6 blog posts vs `/best-time-to-post/{p}` | `/best-time-to-post/{p}` (data, Dataset schema) | Blog retitled "How to Find *Your* Best Time on X (Insights)" and linked to the hub with an exact-match anchor. Today the anchor points 10× to the blog and 1× to the hub. |
| best time to post on instagram on monday | blog post vs `/best-time-to-post/instagram/monday` | One page only | 301 the other |
| {platform} {spec} size / limit | About 10–12 blog posts vs `/specs/{p}/{spec}` | The blog post where it is the deeper page; specs where the blog doesn't cover it | Cross-link both ways (0 links today) |
| does tiktok notify screenshots | blog vs `/does-it-notify/tiktok/screenshot-*` | `/does-it-notify` | Blog links to it, or 301 |
| who doesn't follow me back on instagram | blog post (25% overlap with who-unfollowed-me) vs `/tools/instagram-unfollowers-checker` with the same title | Tool for "checker", blog for "how to see" | Merge who-unfollowed-me into the blog post; retitle the tool |
| buffer alternative | `/buffer-alternative` vs `/best-buffer-alternatives` | `/best-buffer-alternatives` | 301 |
| free social media scheduler | best-free-social-media-schedulers, free-social-media-management-tools, free-hootsuite-alternative (same first answer) | Keep 2 | Merge 1 |
| username / name generator | name-generator vs username-generator; youtube-page-name-generator vs youtube-name-generator; x-page-name-generator vs x-name-generator | username-generator, youtube-name-generator, x-name-generator | 301 (YouTube and X have no "pages") |

## 4. Blog (187 posts)

- **Topic fit.** Only 68 posts (36%) are about publishing or scheduling. 18 are trivia, meanings or news, and 6 are downloaders. The playbook's Livity and Noise Foundation cases show generic explainers are what AI Overviews take first.
  - **Prune or noindex:** what-does-67-mean-on-tiktok, tiktok-slang, what-is-group-7-on-tiktok, what-does-bluesky-mean, what-does-nudge-mean-on-tiktok, what-does-the-green-dot-mean-on-linkedin, when-did-tiktok-come-out, who-made-youtube, can-you-get-paid-to-scroll-on-tiktok.
  - **Merge** the 6 downloaders into one "save your own videos to repost" guide.
  - **Gate** the 47 settings posts on Search Console after 90 days.
- **Titles.** About 19 fact posts hide the answer. Examples, using facts already in the body:
  - "Best Time to Post on YouTube: 1–4 PM Weekdays (2026)"
  - "Go Live on TikTok: 1,000 Followers, 18+, Then 5 Taps"
  - "How Many TikTok Accounts Can You Have? No Cap, ~3 per Phone"
  - "Delete Your TikTok Account: 7 Steps, Gone After 30 Days"

  `how-much-does-facebook-reels-pay-per-1000-views` promises a "(2026 Range)" but the body says its figures are hypothetical: fix the title or source a range.
- **Sources and dates.**
  - 150 of 187 posts have zero outbound links, and there are 55 outbound links in the whole blog.
  - 124 posts say "at the time of writing" instead of "checked Nov 2026".
  - Number-heavy posts with no source: who-owns-tiktok, who-has-the-most-followers-on-tiktok, how-does-bluesky-make-money, who-made-youtube, content-performance-analysis.
  - The model to copy is social-media-management-software-cost: 7 pricing links and "Checked October 2026".
- **Freshness.** 31 titles say "2026" and will be stale on 1 Jan 2027, seven weeks from now. They need a real fact check, not a find-and-replace. Show "Updated <date>" on the page (`components/marketing/Article.jsx` shows only `date`), and change `updated` only when facts change.
- **Answer block.** Add a short "Quick answer" (1–2 sentences that name the entity, quotable on their own) under the hero for fact posts.
- **Headings.** Replace the three fixed headings above with topic-specific ones. Drop the forced product pivot and the "(Use With Caution)" section from off-product posts.

## 5. Commercial pages ("best X", alternatives, compare)

Rebuild them on the Slo / Steps Club template:
- a title with a count and the axis where we really win (for example "Best Free Social Media Schedulers 2026: 7 Compared, No Card")
- the criteria and the answer in the first two sentences
- picks at a glance
- one wide table: free tier, paid price, account limits, platforms, checked date
- "N. Tool: best for …" H2s with **Best for / Consider** lines
- "We make Schedule For You" at the top, with our real limits (Free: 3 accounts, 10 queued posts, a link back to us on posts)
- how we picked, with dates
- a dated Sources H2
- ItemList + SoftwareApplication + Offer schema
- a re-check every 6–8 weeks

| Page | Biggest gaps |
|---|---|
| best-buffer-alternatives | Closest to the template (it has a price table and "Prices checked Oct 2026"). Missing: picks at a glance, a Sources list, ItemList. Absorb `/buffer-alternative`. |
| best-cross-posting-tools, best-linkedin-scheduling-tools | Grouped "by type"; tables full of "Check" cells. Rewrite as counted lists with real prices. |
| buffer / later / postiz-alternative | One H2 skeleton on all three (21–35% overlap). |
| Blog: best-free-…, free-…-tools, free-hootsuite-alternative, best-…-for-creators, best-…-for-small-business | Name the tools (the Hootsuite page names 0 alternatives), add the table and the disclosure. |
| `/compare/{brandwatch,later}/recurpost` | Two competitors compared, nothing of ours, prices "check vendor". Momental's brand-vs-brand pages got about 0 traffic. **Don't build the 17 planned RecurPost pages** until these two show impressions. Build "Schedule For You vs Buffer" and "Buffer pricing" (1,300 searches a month in research) first. |

## 6. Tools (97)

- **Coverage.**
  - 28 tools serve networks we don't publish to: Discord 9, Telegram 7, Reddit 5, Roblox 2 and others. That is allowed by CLAUDE.md as long as the copy doesn't claim we post there.
  - 17 are generic.
  - There are **no Bluesky tools**, although we publish to Bluesky.
  - Research records demand for about 40 of the 97. Check Search Console before cutting any.
- **Template.** Add HowTo schema. Add "No Sign-Up" to titles where it is true. About 55 pages run 980–1,300 words against the 2,500–4,000 house target. Deepen the ones competitors beat us on first:
  - discord-bold-text-generator (15.3K)
  - x-character-counter (6.8K)
  - instagram-bold-text-generator (6K)
  - instagram-bio-generator (5.2K)
  - telegram-bio-generator (4.2K)
- **Use-case H3s for named destinations with their limits.** Only about 24 tools have them (pdfaid and ihatepdf pattern). Examples: "resize for a LinkedIn banner (1584×396)", "Instagram bio (150 characters)".

## 7. Technical fixes

1. **robots.txt** (`lib/md/identity.js:4`).
   - Use `/brand$` instead of `/brand`, and `/app$` plus `/app/` instead of `/app`, so the logo and `apple-icon.png` are crawlable.
   - Name Applebot and Google-Extended.
   - Optionally disallow AhrefsBot, DataForSeoBot and SERankingBacklinksBot.
2. **Sitemaps** (`app/sitemap.js`).
   - Use `generateSitemaps` to split per family and per locale.
   - Send lastmod from the specs "verified" date, the notify "checked" date and the best-time `computedAt` date.
   - Use a real per-post `updated` on the blog.
   - Drop `/signup` and noindex `/demo`.
3. **IndexNow.** Post the changed URLs after each production deploy.
4. **Homepage.**
   - Make og:title equal the page title.
   - Put the query words ("social media scheduler") in the H1 or the first line.
   - Send FAQPage to every user agent; today it goes only to phones (`app/page.jsx:27`).
   - Add contactPoint, email (`CONTACT_EMAIL` exists but isn't used) and sameAs to the Organization schema.
5. **Robots meta.** Add `max-image-preview:large` to the generic `robots` meta, not only to `googlebot`.
6. **Images.** Use the page's hero card as og:image and `Article.image`, not the generic `/opengraph-image`. Make the blog hero eager-load (`lib/content.js:63` lazy-loads every image).
7. **Schema.**
   - Dataset on the 61 specs pages.
   - ItemList on the 4 programmatic hubs.
   - HowTo on tools.
   - Person authors with jobTitle and knowsAbout on posts.
8. **i18n.** Set `<html lang>` per locale. Add ogLocale for pt. Translate slugs for any page that shows traction.
9. **CTA attribution.** Use `/signup?utm_source=site&utm_medium=<tool|blog-inline|blog-end|sticky>&utm_content=<slug>` and store the first touch on the account. Measure sign-ups per 1,000 sessions by family (the playbook's "installs, not sessions").
10. **www.** Add a host-based 308 from www to apex in `proxy.ts` as a safety net. The code doesn't redirect www today, so this depends on Vercel's domain settings, which I couldn't check.

## 8. Ordered action plan

### This week (fixes that need no data)
1. Fix the robots prefix bug, the "ten networks" footer, the post-ideas plural and article bugs, and the specs sibling-link matching.
2. Reconcile the 8 fact conflicts in section 2.
3. Remove "real scheduling data" from the best-time hub copy unless it is live. Stop calling the hand-made curve "our published baseline". Say plainly on the hub that 6 countries are measured.
4. Publish `/methodology` (sources for best-time, specs and notify; the refresh cadence; what is measured vs estimated) and link it from every programmatic page.
5. Show "Updated <date>" on blog posts. Add the legal entity to the footer and the Organization schema. Rewrite About with people, place and start date.

### Next 2–4 weeks (structure)
6. **Post-ideas:** take the 280 weekday pages out of the sitemap and 301 each to `/post-ideas/{industry}`. Cut the 40 industries to the 10–15 with demand, and write industry-specific sections for those.
7. **Best-time weekday:** merge the 70 pages into the 10 platform hubs (301 to a `#by-day` section).
8. **Best-time country:** noindex the 55 baseline pages now. Noindex the low-demand platform × country combinations (Bluesky, Threads, Pinterest, Google Business: about 100 pages) until Search Console shows impressions.
9. **Owners:** apply the section 3 table (retitle the blog best-time posts, 301 the duplicates, cross-link specs and blog, merge the Instagram followers posts).
10. **Commercial pages:** rebuild best-buffer-alternatives and best-free-social-media-schedulers on the Slo template first, then the rest. Add "Schedule For You vs Buffer" and "Buffer pricing".
11. **Sitemaps and IndexNow:** split the sitemaps with honest lastmod, and run IndexNow on deploy.
12. Add UTM tags to every signup CTA.

### Before 1 Jan 2027
13. Fact-check and re-date the 31 "2026" posts and every "best X" page. Retitle the about 19 answer-hiding fact posts.
14. Prune or merge the 9 trivia posts and the 6 downloaders.
15. Rebuild `/specs` as the "Social Media Image Sizes 2026" head-term hub: one table, one question H2 per platform, and stats computed from its children.

### At 90 days (needs Search Console)
16. Prune by family: tools, settings posts, notify actions, translated pages and locales with 0 impressions. Pull the 28-day "impressions up, clicks flat" list weekly and rewrite only the title, meta and first paragraph on those pages.

## 9. House rules (CLAUDE.md) versus the playbook

These are the places where following CLAUDE.md produces what the playbook warns against. Consider updating the house rules:

- **Title hooks** ("Don't Tap", "5 Checks Before You Pay") vs **the answer or number in the title**. Keep a hook only after the answer.
- **One fixed skeleton for every post** ("What Most People Don't Know", "(Use With Caution)", "What to Do Next", a forced product section) creates repeated sibling headings. Make them conditional on the topic.
- **The house template has no rule for** sources, dated checks, how-we-picked, ownership disclosure or ItemList, and it prescribes a "types" explainer for commercial pages instead of a ranked list.
- **The tool-page rule asks for 2,500–4,000 words.** The playbook's winners are depth on the hottest tools (PDFTechno's compress page, about 2,100 words) and 650–820 words elsewhere. Put depth where demand is, not on every tool.
