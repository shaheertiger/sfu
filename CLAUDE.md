# Notes for Claude

## Writing blog posts (`content/blog/*.md`)

**Rule for every new page:** match the structure, heading style and depth of the page that ranks #1 in the same category. That means the Post Bridge posts for blog posts, the Postiz tool pages for tools, and Timeskip for the YouTube downloaders. Their outlines are in `research/reference-outlines.md`. Never copy their wording or numbers.

Every guide follows the layout of the top-ranking posts in our niche ("Who Doesn't Follow Me Back on Instagram? 3 Safe Ways", "How to See Who Liked a Comment on Instagram: Don't Tap", "Am I Shadowbanned on Twitter? (Most Tests Are Wrong)"). Reference implementations: `content/blog/who-doesnt-follow-me-back-on-instagram.md`, `how-to-see-who-liked-a-comment-on-instagram.md`, `am-i-shadowbanned-twitter.md`. In this order:

1. **A hook in the H1 and title.** The search question plus a promise or twist: "3 Safe Ways", "Don't Tap", "Most Tests Are Wrong".
2. **A short intro (2–4 paragraphs of 1–3 sentences).** Open with the reader's situation in the second person, give the answer in the same or the next paragraph (it must be readable without scrolling), say why it isn't obvious (the platform hides it, the tests mislead), then say what the guide covers.
3. **A "why" section.** Why the feature is hidden, what the thing actually is, or why it matters. Include a `###` such as "What most people don't know" and one `> **Key point:** …` callout.
4. **The `<!-- cta -->` line**, straight after that first section.
5. **The main method, step by step.** Give each step its own `###`, or use a numbered list for short ones. Call out the step people get wrong and add a `> **Pro tip:** …` callout. Note that menu labels change between app versions.
6. **At least one table, usually two.** For example: troubleshooting (Problem | Fix | Why it works), the methods compared (Method | Time | Skill | Privacy), or the signs (Normal | Affected).
7. **Other methods and edge cases**, one `##` each: desktop versus app, the official data download, hidden settings.
8. **The risky option, labelled "(Use With Caution)".** Covers third-party apps and checker sites, with `### The real risks`, a short safety checklist and a closing `> **Bottom line:** …` callout.
9. **The bigger problem, and Schedule For You.** Move from the topic to the time cost behind it with one concrete scenario: a named situation, with numbers. Include a small, fair table that compares native/manual, other tools and Schedule For You, says where we are not the best fit, and uses dashboard screenshots from `public/images/blog/`.
10. **What to do next.** Use numbered actions, ✓/✗ lists or two to four short scenarios.
11. **`## Frequently asked questions`** with 6–10 `###` questions (at least 3), each answered in its first sentence.
12. **`## The bottom line`.** Sum up each method in one line, say which one to pick, and link the next guide and two or three related free tools.

### Headlines matter more than anything else

Readers skim the headings first, so every heading has to make them want the section underneath.

- **H1/title:** the exact search question, then a hook. For example "Who Doesn't Follow Me Back on Instagram? 3 Safe Ways", "Am I Shadowbanned on X? (Most Tests Are Wrong)", "How to See Who Liked a Comment on Instagram: Don't Tap the Heart".
- **H2s in Title Case, phrased the way people search**, each with something specific: a number ("5 Tests That Actually Work"), a qualifier in brackets ("(Free Method)", "(Use With Caution)", "(Safe and Scalable)"), a contrast ("Shadowbanned or Just Lower Reach?") or a promise ("Step-by-Step Recovery Plan").
- **H3 steps name the action**: "Step 3: Long-Press, Don't Tap". Not "Step 3".
- **Data and money topics put the number in the H1**, along with the year: "YouTube Pays $0.04–$29 Per 1K Views (By Niche, 2026)". Back every number with a table, and add a "realistic scenarios" table (situation | inputs | result) plus a comparison with other platforms.
- **Most H2s and H3s are the reader's own question**: "How Does YouTube Pay Creators?", "What Is CPM vs RPM on YouTube?", "1. Which Niches Pay the Most?". Numbered question H3s work well for "what affects X" sections.
- Avoid flat labels such as "Overview", "Method 2", "Tips" or "Conclusion". Use "The Bottom Line" and "Frequently Asked Questions" (the FAQ heading match ignores case).

### Images: one under every main section

- **A hero card right after the answer paragraph**, then **one image directly under each main `##`**, usually 6–8 in total. Use dashboard screenshots (1440×900, see below) in the Schedule For You section and illustration cards everywhere else.
- **Illustration cards** are diagrams in our brand style, rendered by `node scripts/blog-illustrations.mjs <slug>` from `scripts/illustrations/<slug>.json` (tool pages: `--tools <slug>` from `scripts/illustrations/tools/<slug>.json`). Card types: hero, steps, versus, checklist, bars, lists, callout, answer, spec, grid, matrix, path and compare; fields are documented at the top of `scripts/illustrations/render.mjs`, the look in `scripts/illustrations/system.css` (art direction, type scale, colours, one elevation, icon rules). Each card is saved as `public/images/<blog|tools>/<slug>-<name>-1200x675.webp` plus a `-720x405.webp` variant. Match each card to its section: steps for a how-to, versus or checklist for do/don't, bars for comparing methods, spec for a size or limit, matrix for yes/no across platforms, path for a settings menu, callout for the bottom line. `npm run figures:specimen` renders one of every type to `docs/figures-specimen.png`.
- **Programmatic pages** (/does-it-notify, /best-time-to-post, /specs) get their figures from the same data the page renders (`lib/figures.js`); `npm run figures:programmatic` renders them to `public/images/figures/`, skipping unchanged cards.
- **Storage:** rendered cards are not committed. `npm run figures:upload` (needs `BLOB_READ_WRITE_TOKEN`, Blob store `sfu-figures`) puts them in Vercel Blob and records them in `scripts/illustrations/blob-uploads.json`; `next.config.mjs` serves them on our own domain at the same `/images/...` path, so image search credits scheduleforyou.com. Always reference cards by that site path, never by a Blob URL. After rendering new cards, run the upload and commit the upload log. Dashboard screenshots stay in `public/images/blog/`.
- Cards must not mock up another app's interface, never show a platform logo, and only show claims the text makes.
- Alt text describes what the image shows in a full sentence (8+ words) that includes the topic. Tool pages need 4+ images (tests enforce both).

Style: short paragraphs, plenty of tables and callouts, and never another site's wording.

House rules (enforced by `tests/content.test.ts`):

- Frontmatter: `title`, `description`, `h1`, `category`, `excerpt`, `keyword`, `date`.
- Exactly one `<!-- cta -->` line, after the core answer.
- Internal links must point at pages that exist.
- Plans: Free (3 accounts, up to 10 scheduled posts at a time, no card, a link back to us on posts; limits in `lib/plan-limits.js`), Solo and Studio (paid, with a 7-day trial that needs a card). Never say we have no free plan, never claim a no-card paid trial or "AI-powered" features, never say Free includes paid-only features (bulk, API/MCP, webhooks, RSS, approvals, preview links, shared calendar, repeat/evergreen, link tracking), and never say we post to Discord, Telegram, Reddit, Slack, Twitch or Roblox.
- Only describe product features that exist in the code. LinkedIn publishes to personal profiles only, not company pages.

## Writing tool pages (`content/tools/*.md`)

Tool pages copy the layout of the top-ranking free-tool pages (see `research/competitor-keyword-gaps.md`, section 3). The page template already renders the tool, a sticky sign-up card on desktop and a CTA bar on phones (`components/marketing/GrowCta.jsx`). The markdown supplies the rest:

1. **Title:** the tool name, a hook and the key specs, in 70 characters or fewer: "Discord Character Counter – 2,000 Limit (4,000 with Nitro)".
2. **Lead:** one line telling people what to do: "Paste your text below…".
3. **Sections, in this order:** what the tool does and why you need it; the specs or variants, one `###` each (each font style, size or limit); how to use the tool; **use cases by audience** (4–7 `###`, such as creators, ecommerce, local business or bot builders); best practices and caveats (where it doesn't work, accessibility); then the FAQ (6–8 questions) and the Schedule For You call to action.
4. **Aim for depth**, around 2,500–4,000 words, with real specs and examples, not filler.

## Screenshots

Dashboard screenshots come from the `/demo` page (sample data, no account needed) at 1440×900, saved as WebP in `public/images/blog/` and named `name-<width>x<height>.webp`. The size in the name becomes the image's `width` and `height`, so the page doesn't shift while it loads. Reference them as `![Alt text](/images/blog/name-1440x900.webp)`.

We don't have screenshots of other apps (TikTok, LinkedIn, Instagram…). Don't invent or describe screenshots we don't have; write the native steps as a numbered list and note that menu labels change between app versions.
