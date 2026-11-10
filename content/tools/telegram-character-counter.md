---
title: Telegram Character Counter – 4,096 Message & 1,024 Caption Limit
description: Free Telegram character counter for messages (4,096), media captions (1,024), channel descriptions (255) and bios (70, or 140 with Premium). Paste and check live.
h1: Telegram Character Counter
lead: Paste a Telegram message, caption, channel description or bio to see how many characters you've used and how many are left for each limit.
keyword: telegram character counter
---
## Why You Need a Telegram Character Counter

![Telegram Character Counter: 4,096 Message & 1,024 Caption Limit. Paste a Telegram message, caption, channel description or bio to see how many characters you've used and how many are left for each limit.](/images/tools/telegram-character-counter-hero-1200x675.webp)

Telegram's limits are generous for messages but surprisingly tight everywhere else. A channel post with a photo has a quarter of the room of a text post, a bio fits about one sentence, and you often only find out you're over when the app splits your message, refuses to save your bio, or moves your caption into a separate message.

![Why You Need a Telegram Character Counter, a table of Message, Media caption, Channel description, Bio and Bio with Telegram Premium by Limit at the time of writing and In the counter.](/images/tools/telegram-character-counter-table-1200x675.webp)

This Telegram character counter checks your text against five limits at once, as you type:

| Where on Telegram | Limit at the time of writing | In the counter |
|---|---|---|
| Message | 4,096 characters | Yes |
| Media caption | 1,024 characters | Yes |
| Channel description | 255 characters | Yes |
| Bio | 70 characters | Yes |
| Bio with Telegram Premium | 140 characters | Yes |

For each one, the counter shows how many characters you have left or how far over you are. It also counts words and lines. It all runs in your browser: nothing you paste is uploaded, which matters for private channel drafts.

## Telegram Character Limits by Surface

### Message limit (4,096 characters)

A single Telegram message can hold 4,096 characters, about 600 words of English. That's plenty for a chat, but channel admins writing digests, newsletters or long announcements reach it regularly. When you paste a longer text, most Telegram apps split it into several messages automatically, which can break a post in the middle of a sentence or a list. Counting first lets you choose where the break goes.

### Media caption limit (1,024 characters)

When you send a photo, video, file or album with text, the text becomes a caption, and captions are limited to 1,024 characters for regular accounts. This is the limit channel admins hit most: a post that fits easily as a text message is far too long as a photo caption. Telegram Premium raises the caption limit; the counter checks the standard 1,024 because your readers' and co-admins' accounts may not have Premium.

If a caption is too long, the usual options are to shorten it, send the text as a message with the photo as a link preview, or post the photo first and the text as a reply.

### Channel description limit (255 characters)

A channel's description, shown on its info page and in previews when people find the channel, can be up to 255 characters. That's two or three short sentences: what the channel is about, how often you post, and maybe a contact or link.

### Bio limit (70 characters, 140 with Premium)

Your personal bio (the "About" line on your profile) is limited to 70 characters for regular accounts and 140 with Telegram Premium. 70 characters is roughly ten words, so every word has to earn its place. The [Telegram bio generator](/tools/telegram-bio-generator) can suggest short options that fit.

### What counts toward each limit

- **Every character, space and line break.** Blank lines between paragraphs add up in long posts.
- **Emoji.** This counter counts each Unicode code point as one. Simple emoji are one, but flags, skin tones and family emoji are several characters joined together. Telegram measures some text differently internally and may count emoji as two, so leave a small margin if your post is emoji-heavy.
- **Styled Unicode letters.** Letters from a [Telegram font generator](/tools/telegram-font-generator) are separate characters too, and the underline and strikethrough styles add a hidden mark to every letter, doubling the count.

### What doesn't count: Telegram's own formatting

When you make text bold, italic or a link using Telegram's formatting menu or keyboard shortcuts, the formatting is stored separately from the text, so it doesn't use any characters. The same applies to bot messages: the Bot API's limit applies to the text after the HTML or Markdown markup is parsed. If you paste a draft that still contains `**asterisks**` or `<b>tags</b>`, this counter will count them, so remove the markup to see the real count.

### What costs characters and what doesn't

| Element | Costs characters? |
|---|---|
| Bold, italic, underline, strikethrough, spoiler or monospace applied with the menu or a shortcut | No |
| Hidden links (text with a link applied through the menu) | Only the visible text |
| A pasted URL | Yes, at full length |
| Markup typed as text that isn't converted (`**`, `<b>`) | Yes |
| Emoji | Yes, sometimes two or more |
| Unicode "font" letters | Yes; underline and strikethrough styles cost two per letter |
| Line breaks and blank lines | Yes, one each |

The practical lesson: format with Telegram's tools, apply links to words instead of pasting long URLs, and your caption goes further.

### Examples that fit (and don't)

| Text | Characters | Fits |
|---|---|---|
| Coffee roaster in Lisbon. Small batches, shipped Tuesdays. | 58 | Bio (70) |
| Product designer · I write about UX and side projects | 53 | Bio (70) |
| Daily market notes at 7 a.m. Crypto, stocks and FX in plain English. No signals, no hype. | 89 | Bio with Premium (140) and channel description (255), not a regular bio |

### Telegram's limits compared with other platforms

| Platform | Main text limit at the time of writing |
|---|---|
| Telegram message | 4,096 |
| Telegram media caption | 1,024 |
| Instagram caption | 2,200 |
| Discord message | 2,000 (4,000 with Nitro) |
| Threads post | 500 |
| X post | 280 (weighted) |

A full Telegram message is roughly twice an Instagram caption and fifteen X posts, so channel content almost always needs a shorter version for other networks. The [Discord character counter](/tools/discord-character-counter) and [X character counter](/tools/x-character-counter) check those.

### Limits the counter doesn't check

Names, usernames, group and channel titles, poll options, and bot command descriptions all have their own limits, which this counter doesn't cover. For usernames, the [Telegram username checker](/tools/telegram-username-checker) checks the format rules.

## How to Use the Telegram Character Counter

![How to Use the Telegram Character Counter, in 4 steps: paste or write your text, read the limit rows, check the stats and trim or split.](/images/tools/telegram-character-counter-how-to-1200x675.webp)

1. **Paste or write your text** in the box.
2. **Read the limit rows.** Message, Media caption, Channel description, Bio and Bio with Premium each show characters left or over. Look at the one that matches what you're writing.
3. **Check the stats**: characters, words and lines update as you type.
4. **Trim or split.** If you're over, shorten the text, or decide where to split it into two messages.
5. **Copy it into Telegram** and apply bold, italic and links with Telegram's own formatting, which costs nothing.

## What to Do When You're Over the Limit

| Problem | Fix | Why it works |
|---|---|---|
| Caption over 1,024 | Send the text as a message and the media separately, or as a reply | Messages allow 4,096, four times as much |
| Message over 4,096 | Split it yourself at a heading or between items | You control the break instead of the app |
| Bio over 70 | Drop filler words and keep a role plus one detail | Short bios read better anyway, and Premium isn't universal |
| Channel description over 255 | Keep what the channel is and how often it posts; move rules to a pinned post | The description only has to convince people to join |
| Long links | Apply the link to a word with the formatting menu | Hidden links count only the visible text |
| Markup counted twice | Remove `**` or tags from the draft before counting | Telegram's own formatting is free |

## Common Use Cases

### Channel posts with a photo or video

The most common surprise. Draft the caption here first; if it's over 1,024, cut it, or move the long version into a text message and attach the media separately.

### Daily digests and newsletters

Digest channels that post market notes, news roundups or job lists often run close to 4,096. Count before posting so each item stays whole, and split between items rather than in the middle of one.

### Bot developers

Bot messages and captions follow the same limits. When building long responses, such as search results or reports, check sample outputs here and add your own splitting logic in the bot. Remember the limit applies after the markup is parsed.

### Channel and group setup

Write the channel description here so it fits 255 characters and reads well in previews. Put the most important information, what the channel is for, at the start.

### Your personal bio

70 characters is tight. Try several versions in the counter and keep the one that says who you are and what you do in the fewest words. With Premium, you get 140.

### Community admins and moderators

Pinned rules, welcome messages and FAQs get edited over time. Counting while you draft keeps a long rules message from being split when someone adds a new rule.

## Best Practices for Writing Within Telegram's Limits

![Best Practices for Writing Within Telegram's Limits: do write for the caption, then expand, use formatting instead of decoration, split on purpose and keep links short.](/images/tools/telegram-character-counter-best-practices-1200x675.webp)

### Write for the caption, then expand

If a post might go out with a photo, write it to fit 1,024 characters first. You can always add detail in a follow-up message.

### Use formatting instead of decoration

Telegram's bold, italic, spoilers and quotes don't cost characters. Unicode styled letters and emoji dividers do. If you're tight on space, use native formatting.

### Split on purpose

When a message must be long, split it at a heading or between list items, and number the parts ("1/2", "2/2") so readers know there's more.

### Keep links short

Links count at their full length. Remove tracking parameters you don't need.

### Mind accessibility

Unicode fonts look striking in a channel title or bio, but screen readers read them poorly, and they're harder to search. Keep key information in plain text.

### Leave a margin

If your text is full of emoji or special symbols, aim a little under the limit, because Telegram may count some characters as two.

## Frequently Asked Questions

### What is the Telegram message character limit?

A Telegram message can be up to 4,096 characters. Longer text is usually split into several messages by the app.

### What is the Telegram caption limit?

Captions on photos, videos and files are limited to 1,024 characters for regular accounts. Telegram Premium raises this limit.

### How long can a Telegram bio be?

A Telegram bio can be 70 characters, or 140 with Telegram Premium.

### What is the character limit for a Telegram channel description?

A channel description can be up to 255 characters.

### Does bold or italic formatting count toward Telegram's limit?

No, not when you apply it with Telegram's formatting menu, shortcuts or a bot's parse mode. The formatting is stored separately. Markup typed as text, like asterisks that aren't converted, does count.

### Do emoji count as one character on Telegram?

Not always. Telegram may count many emoji as two, and combined emoji such as flags count as more. This counter counts most simple emoji as one, so leave a small margin.

### What happens if my message is too long?

Most Telegram apps split a long message into several automatically. Captions that are too long may be refused or need to be shortened before sending, depending on the app.

### Is my text sent anywhere?

No. The Telegram character counter runs in your browser and your text never leaves your device.

## Schedule For You Doesn't Post to Telegram, but It Covers Your Other Channels

Schedule For You doesn't post to Telegram. If you also publish on Instagram, Facebook Pages, [X](/x), LinkedIn, [Threads](/threads), Bluesky, TikTok, YouTube, Pinterest or Google Business Profile, it lets you write one post, tailor it per platform with live character checks, and schedule everything from one calendar, so your Telegram channel isn't the only place you're consistent.

[Start free](/signup) with 3 accounts and up to 10 scheduled posts at a time, no card needed. Solo ($19/month) and Studio ($59/month) add more accounts and unlimited scheduling, with a 7-day trial that requires a card.
