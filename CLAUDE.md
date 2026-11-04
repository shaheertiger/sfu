# Notes for Claude

## Writing blog posts (`content/blog/*.md`)

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
- Avoid flat labels such as "Overview", "Method 2", "Tips" or "Conclusion". Use "The Bottom Line" and "Frequently Asked Questions" (the FAQ heading match ignores case).

### Images: one under every main section

- **A hero card right after the answer paragraph**, then **one image directly under each main `##`**, usually 6–8 in total. Use dashboard screenshots (1440×900, see below) in the Schedule For You section and illustration cards everywhere else.
- **Illustration cards** are diagrams in our brand style, rendered by `node scripts/blog-illustrations.mjs <slug>` from `scripts/illustrations/<slug>.json`. The card types are hero, steps, versus, checklist, bars, lists and callout, and each is saved as `public/images/blog/<slug>-<name>-1200x675.webp`. Match each card to its section: steps for a how-to, versus or checklist for do/don't, bars for comparing methods, callout for the bottom line.
- Cards must not mock up another app's interface, and they only show claims the text makes.
- Alt text describes what the image shows in a full sentence that includes the topic.

Style: short paragraphs, plenty of tables and callouts, and never another site's wording.

House rules (enforced by `tests/content.test.ts`):

- Frontmatter: `title`, `description`, `h1`, `category`, `excerpt`, `keyword`, `date`.
- Exactly one `<!-- cta -->` line, after the core answer.
- Internal links must point at pages that exist.
- Plans: Free (3 accounts, up to 10 scheduled posts at a time, no card, a link back to us on posts; limits in `lib/plan-limits.js`), Solo and Studio (paid, with a 7-day trial that needs a card). Never say we have no free plan, never claim a no-card paid trial or "AI-powered" features, never say Free includes paid-only features (bulk, API/MCP, webhooks, RSS, approvals, preview links, shared calendar, repeat/evergreen, link tracking), and never say we post to Discord, Telegram, Reddit, Slack, Twitch or Roblox.
- Only describe product features that exist in the code. LinkedIn publishes to personal profiles only, not company pages.

## Screenshots

Dashboard screenshots come from the `/demo` page (sample data, no account needed) at 1440×900, saved as WebP in `public/images/blog/` and named `name-<width>x<height>.webp`. The size in the name becomes the image's `width` and `height`, so the page doesn't shift while it loads. Reference them as `![Alt text](/images/blog/name-1440x900.webp)`.

We don't have screenshots of other apps (TikTok, LinkedIn, Instagram…). Don't invent or describe screenshots we don't have; write the native steps as a numbered list and note that menu labels change between app versions.
