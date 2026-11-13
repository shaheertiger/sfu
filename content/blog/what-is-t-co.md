---
title: What Is t.co? X's Link Shortener (Why Links Count as 23)
description: What is t.co? It's X's (Twitter's) link shortener. Why every link on X becomes t.co, how it counts toward 280 characters, if it's safe, and why it shows in analytics.
h1: "What Is t.co? X's Link Shortener (Why Every Link Counts as 23 Characters)"
category: X
excerpt: t.co is the link shortener X (formerly Twitter) uses for every link posted on the platform. It counts every link as 23 characters, checks links for malware and lets X count clicks. It's why t.co shows up in your website analytics.
keyword: what is t.co
date: 2026-10-28
updated: 2026-11-04
---
You spotted `t.co` in your website analytics, or a friend sent you a t.co link and you're not sure whether to click it. **t.co is X's link shortener.** Every link posted on X (formerly Twitter), in posts, bios and DMs, is wrapped in a `https://t.co/...` address. When someone clicks it, X checks the link and then sends them on to the real site.

![What is t.co: X's link shortener, which wraps every link, counts it as 23 characters, screens it and counts clicks](/images/blog/what-is-t-co-hero-1200x675.webp)

It's run by X itself, so a t.co link isn't a scam on its own; what matters is where it points. It's also why visitors from X show up as "t.co" in your analytics.

This guide covers what t.co does, how it changes X's character count, how to tell whether a t.co link is safe, and how to track clicks from X properly.

## Why Every Link on X Becomes a t.co Link (4 Jobs It Does)

![What t.co does for X, like screening and counting clicks, compared with what it means for you, like 23 characters per link](/images/blog/what-is-t-co-jobs-1200x675.webp)

| Job | What it means for you |
| --- | --- |
| Shortens every link | Any URL counts as **23 characters** toward the 280-character limit, however long it is |
| Screens links | X checks destinations against lists of malicious and spam sites and can block or warn |
| Counts clicks | X knows how many people clicked, which feeds its link-click metrics |
| Shows a clean preview | Readers see the domain and part of the path, not the t.co code |

### What Most People Don't Know

You don't create t.co links yourself and can't turn them off. Paste a normal link into a post, and X converts it when you publish. X has run t.co since 2011, so it's been part of every link on the platform for years.

> **Key point:** t.co itself is legitimate and owned by X. The question to ask about any t.co link isn't "is t.co safe?" but "where does this one go?"

<!-- cta -->

## How t.co Links Count Toward X's 280-Character Limit

![Bar chart of how X counts links: a short URL and a 200-character tracking URL both count as 23 characters](/images/blog/what-is-t-co-characters-1200x675.webp)

Because every link becomes a t.co address, X counts **every link as 23 characters**, whether it's `example.com` or a 200-character tracking URL.

| Your link | Actual length | Counted by X |
| --- | --- | --- |
| `example.com` | 11 characters | 23 |
| A product page URL | Around 60 characters | 23 |
| A long URL with tracking tags | 200 characters | 23 |

That leaves about 256 characters for text in a standard post with one link (257 minus the space before it). The flip side: a very short link still uses 23 characters.

> **Pro tip:** Because long links cost no extra, add full UTM tags to every link you post on X. They don't eat into your 280 characters.

Our [X character counter](/tools/x-character-counter) counts links the same way, so you can check a draft before posting.

## Is t.co Safe? How to Check a t.co Link Before You Click (4 Habits)

The t.co domain belongs to X and is legitimate. A t.co link can still lead anywhere the poster chose, including a scam site X hasn't caught yet.

1. **Read the visible domain** on the post or card before you click.
2. **Be careful with t.co links in DMs** from accounts you don't know.
3. **Don't log in** on a page you reached from a link unless you checked the address bar.
4. **Treat t.co links outside X**, for example in an email, like any unknown shortened link.

If X flags a link, you'll see a warning page instead of being sent straight on.

### How to See Where a t.co Link Goes

Hover over the link on X's website to see the destination, or open the post: the card shows the real domain. You can also paste the t.co address into a link-expander tool to see where it redirects without visiting it.

## Why t.co Shows Up in Your Analytics (and How to Fix It)

![Steps to track clicks from X: add UTM tags, post the link, and read the campaign in your analytics instead of the t.co referrer](/images/blog/what-is-t-co-analytics-1200x675.webp)

When someone clicks a link on X, the visit passes through t.co, so tools like Google Analytics often list the referrer as **t.co** rather than x.com.

| What you see | What it means | What to do |
| --- | --- | --- |
| Referrer: t.co | Visits from links posted on X | Count them as X traffic |
| All X posts lumped together | t.co doesn't say which post | Add UTM tags per post or campaign |
| UTM tags missing | They weren't on the link you posted | Add them before posting; t.co keeps them |

To separate one campaign or post from another, add UTM parameters to your links, for example `utm_source=x&utm_medium=social&utm_campaign=launch`. The t.co wrapper keeps them, and they don't cost extra characters.

## Stacking Other Link Shorteners on X (Use With Caution)

Some people shorten a link with another service before posting it on X, so the link is wrapped twice.

### The Real Risks

- **It hides the destination.** Readers see the other shortener's domain on the card, not your site's, which makes the link look less trustworthy.
- **It adds a redirect.** Each extra hop is one more thing that can break or slow the click.
- **It saves no characters.** X counts every link as 23 characters anyway.
- **Scammers use the same trick** to disguise where a link goes, so readers are right to be wary of it.

### A Short Checklist

- Post the full link, with UTM tags, and let t.co shorten it.
- If you need click counts, use UTM tags in your analytics.
- Check that the card shows your real domain before you publish.

> **Bottom line:** On X, a second shortener costs trust and gains you nothing. The full link with UTM tags is cleaner and easier to measure.

## Posting Tagged Links to X and Other Networks? Set Them Once

UTM tags are easy to forget when you post by hand. Take Daniel, who runs a newsletter and shares each new issue on X, LinkedIn, Threads and Bluesky, twice a week. To see which network sends readers, each link needs its own `utm_source`. That's eight posts and eight hand-edited links a week, and one wrong tag muddles his numbers for the whole issue.

In Schedule For You, Daniel writes each post once, tailors the caption per network with live character-limit checks that count X links the way X does, and pastes a link tagged for each network into each version. He can also put the link in a first comment on X, LinkedIn, Threads and Bluesky. On the paid plans, link click tracking can swap links for short links that count clicks; on X, those are wrapped by t.co like any other link.

![One post with a tagged link prepared for X, LinkedIn and other networks in the Schedule For You composer](/images/blog/composer-four-platforms-1440x900.webp)

| | X's own composer | Other schedulers | Schedule For You |
| --- | --- | --- | --- |
| Counts links as 23 characters | Yes | Varies | Yes, the way X counts them |
| A different link per network | One network only | Varies | Yes, a caption per platform |
| Link in a first comment | Post a reply yourself | Some tools | Yes, on X, LinkedIn, Threads, Bluesky, Instagram and Facebook |
| Click counts | X's own metrics | Varies | Paid plans (link click tracking) |
| Cost | Free | Usually paid | Free for 3 accounts and 10 scheduled posts, no card. Paid from $19 a month |

Where we're not the best fit: if you only post links to X occasionally, X's composer is enough and its own metrics show link clicks. Daniel's four networks are also one more than the Free plan's three accounts, and click tracking needs a paid plan.

![A week of newsletter posts for X, LinkedIn, Threads and Bluesky in the Schedule For You queue](/images/blog/queue-1440x900.webp)

See the [X scheduler page](/x) and our guide on [how to schedule tweets](/blog/how-to-schedule-tweets).

## What to Do Next

- **Saw t.co in your analytics?** It's X traffic. Add UTM tags to tell posts apart.
- **Got a t.co link from a stranger?** Check the domain on the card, or expand it first.
- **Writing a post with a link?** Budget 23 characters for it.
- **Using another shortener on X?** Stop; post the full tagged link.

## Frequently Asked Questions

### What is t.co?

It's X's link shortener. Every link posted on X is wrapped in a t.co address that screens the destination and counts clicks.

### Who owns t.co?

X, the company formerly called Twitter. It has run t.co since 2011.

### Can I turn off t.co on X?

No. Every link on X is wrapped automatically, in posts, bios and DMs.

### Why do all my links count as 23 characters on X?

Because X replaces them with t.co links, which are a fixed length. That's handy for long URLs and means UTM tags don't eat into your 280 characters.

### Is a t.co link a virus?

No. It's a redirect run by X. The destination could still be unsafe, so check the domain before clicking, especially in DMs from strangers.

### How do I find the original link behind t.co?

Hover over it on X's website, look at the card's domain, or paste it into a link-expander tool.

### Why does t.co appear in Google Analytics?

Clicks from X pass through t.co, so analytics tools often list it as the referrer. Add UTM tags to see which post or campaign sent the visit.

### Does t.co remove UTM tags?

No. The t.co wrapper keeps them, and they don't cost extra characters.

## The Bottom Line

![t.co is X's own link shortener: legitimate, fixed at 23 characters, and the reason X traffic shows as t.co](/images/blog/what-is-t-co-bottom-line-1200x675.webp)

- **What it is:** X's own link shortener, on every link.
- **Characters:** every link counts as 23.
- **Safety:** t.co is legitimate; check where each link goes.
- **Analytics:** t.co means X; UTM tags tell posts apart.

Post the full tagged link and let t.co do the rest. Next up: [am I shadowbanned on X?](/blog/am-i-shadowbanned-twitter) Free tools that help: the [X character counter](/tools/x-character-counter), [X bio generator](/tools/x-bio-generator) and [X name generator](/tools/x-name-generator).
