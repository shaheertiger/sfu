# Notes for Claude

## Writing blog posts (`content/blog/*.md`)

Every guide follows this structure, in this order:

1. **Answer the search question immediately.** The first paragraph is the answer, not a lead-in.
2. **Show the native or manual method**, step by step, with screenshots where we have them.
3. **Explain where that method becomes inconvenient**, using one concrete scenario (a named situation, not a generic claim).
4. **Compare the alternatives fairly in a small table** (native app, manual, other tools, Schedule For You), including where Schedule For You is not the best fit.
5. **Demonstrate Schedule For You solving that scenario**, with dashboard screenshots from `public/images/blog/`.
6. **Answer follow-up questions** under `## Frequently asked questions` (at least 3 `###` questions) **and link to the next guide**.

House rules (enforced by `tests/content.test.ts`):

- Frontmatter: `title`, `description`, `h1`, `category`, `excerpt`, `keyword`, `date`.
- Exactly one `<!-- cta -->` line, after the core answer.
- Internal links must point at pages that exist.
- Never claim a free plan, no-card trial or "AI-powered" features for our product, and never say we post to Discord, Telegram, Reddit, Slack, Twitch or Roblox.
- Only describe product features that exist in the code. LinkedIn publishes to personal profiles only, not company pages.

## Screenshots

Dashboard screenshots come from the `/demo` page (sample data, no account needed) at 1440×900, saved as WebP in `public/images/blog/` and named `name-<width>x<height>.webp`. The size in the name becomes the image's `width` and `height`, so the page doesn't shift while it loads. Reference them as `![Alt text](/images/blog/name-1440x900.webp)`.

We don't have screenshots of other apps (TikTok, LinkedIn, Instagram…). Don't invent or describe screenshots we don't have; write the native steps as a numbered list and note that menu labels change between app versions.
