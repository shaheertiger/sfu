---
title: Can You Change Your Bluesky Handle? Yes, Free (Links Break)
description: Yes, you can change your Bluesky handle any time, free. Steps for a new .bsky.social name or your own domain, what happens to mentions and links, and display names.
h1: "Can You Change Your Bluesky Handle? Yes, Any Time, but Old Links Break"
category: Bluesky
excerpt: Change your Bluesky handle as often as you like, to a new .bsky.social name or a domain you own. Followers and mentions stay with you, but old profile links that use the old handle can break.
keyword: can you change your bluesky handle
date: 2026-10-28
updated: 2026-11-04
---
You picked a Bluesky handle in a hurry when you signed up, and now it doesn't fit. Yes, you can change your Bluesky handle (your username, the part after @) whenever you like, and it's free. Go to **Settings > Account > Handle**, then pick a new `.bsky.social` name or connect a domain you own.

![Changing a Bluesky handle: a new .bsky.social name or your own domain, with followers and posts kept](/images/blog/how-to-change-bluesky-handle-hero-1200x675.webp)

Your followers, posts and likes stay with you, because your account is tied to a permanent ID, not to the handle. What doesn't always come along are links: anything that points to your old handle can stop working.

This guide covers both kinds of handle, the domain setup step people get stuck on, what changes when you switch, and what to update afterwards.

## Handle or Display Name? Know Which One You're Changing

![Bluesky handle compared with display name: the handle is unique and used in links, the display name is free text](/images/blog/how-to-change-bluesky-handle-handle-vs-name-1200x675.webp)

If you only want to change the name shown in bold above your handle, that's your **display name**, and you change it with **Edit profile**. The handle is the unique @ address.

| | Handle | Display name |
| --- | --- | --- |
| Looks like | @yourname.bsky.social or @yourdomain.com | Your Name |
| Unique | Yes | No |
| Where to change | Settings > Account > Handle | Profile > Edit profile |
| Limit | Must be a valid domain name | 64 characters |
| Used in mentions and profile links | Yes | No |

### What Most People Don't Know

Every Bluesky handle is a domain name. `yourname.bsky.social` is a subdomain of Bluesky's domain, which is why you can swap it for a domain you own. Behind both sits a permanent ID called a **DID**, and that's what your followers, posts and likes are actually attached to.

> **Key point:** Changing your handle changes your address, not your account. Everything tied to your DID comes with you; anything that uses the old address may not.

<!-- cta -->

## How to Change Your Handle to a New .bsky.social Name (30 Seconds)

![Three steps to change a Bluesky handle: open Settings, Account, Handle, type a new name, then save](/images/blog/how-to-change-bluesky-handle-steps-1200x675.webp)

Menu names can differ a little between the app and bsky.app, and they change between versions.

### Step 1: Open Settings > Account > Handle

In the app or on bsky.app, open **Settings**, then **Account**, then **Handle**.

### Step 2: Type the New Name

Bluesky checks whether it's available as you type.

### Step 3: Save the Change

Tap **Save** or **Change handle**. The change is instant.

> **Pro tip:** Before you save, write down every place your old profile link appears: your bio elsewhere, email signature, website, link-in-bio page. You'll need to update them all.

Your old handle is released as soon as you switch, so someone else could claim it later.

## How to Use Your Own Domain as Your Bluesky Handle (Built-In Verification)

![Two ways to verify a domain handle on Bluesky: a DNS TXT record or a text file on your website](/images/blog/how-to-change-bluesky-handle-domain-1200x675.webp)

A domain handle such as @yourname.com is Bluesky's built-in form of verification: it proves you control that website.

### Step 1: Choose "I Have My Own Domain"

Go to **Settings > Account > Handle** and choose **I have my own domain**.

### Step 2: Enter the Domain

Enter the domain, or a subdomain like `news.yourname.com`.

### Step 3: Add the TXT Record (the Step People Get Wrong)

Bluesky shows a TXT record. In your domain's DNS settings, add a record with:

| Field | Value |
| --- | --- |
| Host | `_atproto` (or `_atproto.news` for a subdomain) |
| Type | TXT |
| Value | The value Bluesky gives you, starting with `did=did:plc:` |

The usual mistake is the host: some DNS providers add your domain automatically, so typing `_atproto.yourname.com` ends up as `_atproto.yourname.com.yourname.com`. Enter just `_atproto` if your provider works that way.

### Step 4: Verify

Wait a few minutes, then tap **Verify DNS Record**. If it fails, wait a little longer and verify again; you don't need a second record.

### No DNS Access? Use the File Method

Choose the file option instead. Host a plain text file at `https://yourdomain.com/.well-known/atproto-did` containing only your DID, then tap **Verify Text File**. The DID is public, so it's safe to publish.

| Method | Best for | What you need |
| --- | --- | --- |
| DNS TXT record | Most people with a domain | Access to your domain's DNS settings |
| Text file | Sites where you can't edit DNS | Ability to upload a file to your website |
| New .bsky.social name | Anyone | Nothing, it's instant |

## What Happens When You Change Your Bluesky Handle? (4 Things)

![What stays and what breaks when you change your Bluesky handle: followers and mentions stay, old profile links can break](/images/blog/how-to-change-bluesky-handle-what-changes-1200x675.webp)

1. **Followers, posts and likes stay.** They belong to your account's DID.
2. **Mentions keep working.** Old posts that mention your previous handle still link to your profile.
3. **Profile and post links can break.** A URL like `bsky.app/profile/oldname.bsky.social` stops working once the old handle no longer points to you. Update the link in your bio, email signature and website.
4. **Third-party apps may need you to sign in again** with the new handle.

## Giving Up a Well-Known Handle (Use With Caution)

Switching is easy, and that's the risk for accounts people already know. The moment you change, your old handle is released and anyone can register it.

### The Real Risks

- **Impersonation.** Someone can claim your old handle and look like you to anyone following an old link.
- **Broken links everywhere.** Every old profile URL you've shared stops pointing to you.
- **You might not get it back.** You can only return to your old handle if it's still free.

### Before You Switch

- Announce the change in a post so followers recognise the new handle.
- Update your bio links, website and email signature the same day.
- Prefer a domain you'll keep for years, so you don't have to change again.
- Reconnect any apps that sign in with your handle.

> **Bottom line:** Change your handle once, to something you'll keep, and update every old link the same day.

## Scheduling Bluesky Posts? Reconnect After You Change Your Handle

Here's where a handle change bites. Take Nadia, who runs a local news site's Bluesky account and schedules about 20 posts a week. She switches from @citynews.bsky.social to @citynews.com for the built-in verification. The scheduler she uses still signs in with the old handle, so the next morning's posts fail.

Schedule For You signs in to Bluesky with the handle and app password you entered when you connected. After you change your handle, reconnect Bluesky from the Accounts screen with the new handle and your app password. If you don't, scheduled posts will fail and you'll get a failed-post alert.

| | Bluesky app | Other schedulers | Schedule For You |
|---|---|---|---|
| Change your handle | Yes | No | No, do it in Bluesky |
| Schedule Bluesky posts | No built-in scheduler at the time of writing | Varies by tool | Yes, up to 300 characters, 4 images or a video |
| Connects with | Your password | Varies | Your handle and an app password |
| X, Threads, LinkedIn in the same post | No | Varies | Yes |
| Cost | Free | Varies | Free plan for 3 accounts and 10 scheduled posts, no card. Paid plans from $19 a month |

Where we're not the best fit: if you post to Bluesky only now and then, posting live from the app is simpler. And we can't change your handle or verify your domain for you.

![The Schedule For You composer writing a Bluesky post](/images/blog/composer-bluesky-1440x900.webp)

Nadia reconnects with the new handle and an app password in under a minute, then retries the failed posts.

![The Schedule For You Accounts screen, where you reconnect a Bluesky account](/images/blog/social-accounts-1440x900.webp)

The [Bluesky scheduler page](/bluesky) walks through connecting, and posts keep the 300-character limit described in our [Bluesky character limit](/blog/bluesky-character-limit) guide.

## What to Do Next

1. **Just want a different name in bold?** Edit your display name instead.
2. **New .bsky.social handle:** check availability, save, then update your old links.
3. **Own a domain:** add the `_atproto` TXT record and verify, or use the text file.
4. **Use apps or a scheduler:** sign in again with the new handle.

Do:

- ✓ Pick a handle you'll keep
- ✓ Update bio links, website and signature the same day
- ✓ Reconnect apps that use your handle

Don't:

- ✗ Assume old profile links still work
- ✗ Expect to reclaim your old handle later
- ✗ Add a second TXT record when verification is slow

## Frequently Asked Questions

### Can you change your Bluesky username?

Yes. Your username is your handle. Change it under Settings > Account > Handle, as often as you like.

### Is changing your Bluesky handle free?

Yes. A `.bsky.social` handle costs nothing. A custom domain handle is also free on Bluesky's side; you only pay for the domain itself.

### Do I lose followers if I change my handle?

No. Followers, posts and likes are tied to your account's permanent ID, not the handle.

### Can I go back to my old handle?

Only if it's still free. Once you switch, the old name is released and anyone can register it.

### Why won't my domain handle verify?

Usually the TXT record's host is wrong or DNS hasn't updated yet. Check the host is `_atproto`, wait a few minutes and tap Verify again.

### Can I use a subdomain as my handle?

Yes. Enter something like `news.yourname.com` and use `_atproto.news` as the TXT host.

### Does a domain handle mean my account is verified?

It shows you control that domain, which is how many news outlets, companies and public figures prove who they are. Bluesky also adds blue checks to some notable accounts, but a domain handle is open to anyone.

### What's the display name limit on Bluesky?

64 characters. Display names don't have to be unique.

## The Bottom Line

![Change your Bluesky handle once, to something you'll keep, and update every old link the same day](/images/blog/how-to-change-bluesky-handle-bottom-line-1200x675.webp)

- **New .bsky.social name:** instant and free, but the old one is released.
- **Your own domain:** free verification, set up with one TXT record or a text file.
- **Display name:** the right choice if you only want to change the bold name.

Pick the handle you'll keep, update your links, and reconnect your apps. Next, read [how to post on Bluesky](/blog/how-to-post-on-bluesky). Before you choose a new name, try the free [username checker](/tools/username-checker), [name generator](/tools/name-generator) and [font generator](/tools/font-generator).
