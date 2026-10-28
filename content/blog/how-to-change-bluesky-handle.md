---
title: "How to Change Your Bluesky Handle (Username) or Use Your Own Domain"
description: Yes, you can change your Bluesky handle any time. Step-by-step for a new .bsky.social name or your own domain, what happens to old mentions and links, and display names.
h1: How to Change Your Bluesky Handle or Username
category: Bluesky
excerpt: You can change your Bluesky handle as often as you like, to a new .bsky.social name or a domain you own. Mentions keep pointing to you, but old profile links that use the old handle may break.
keyword: can you change your bluesky handle
date: 2026-10-28
---
Yes, you can change your Bluesky handle (your username, the part after @) whenever you like, and it's free. Go to **Settings > Account > Handle**, then pick a new `.bsky.social` name or connect a domain you own. Your followers, posts and likes stay with you, because your account is tied to a permanent ID, not to the handle. If you only want to change the name shown in bold above your handle, that's your display name, and you change it with **Edit profile**.

## Handle vs display name

| | Handle | Display name |
| --- | --- | --- |
| Looks like | @yourname.bsky.social or @yourdomain.com | Your Name |
| Unique | Yes | No |
| Where to change | Settings > Account > Handle | Profile > Edit profile |
| Limit | Must be a valid domain name | 64 characters |
| Used in mentions and profile links | Yes | No |

## How to change your handle to a new .bsky.social name

1. Open **Settings**, then **Account**, then **Handle**.
2. Type the new name. Bluesky checks whether it's available as you type.
3. Tap **Save** or **Change handle**.

The change is instant. Your old handle is released, so someone else could claim it later. Menu names can differ a little between the app and bsky.app.

## How to use your own domain as your handle

A domain handle such as @yourname.com is Bluesky's built-in form of verification: it proves you control that website.

1. Go to **Settings > Account > Handle** and choose **I have my own domain**.
2. Enter the domain (or a subdomain like `news.yourname.com`).
3. Bluesky shows a TXT record. In your domain's DNS settings, add a record with the host `_atproto` (or `_atproto.news` for a subdomain), type **TXT**, and the value Bluesky gives you, which starts with `did=did:plc:`.
4. Wait a few minutes, then tap **Verify DNS Record**. If it fails, wait a little longer and verify again; you don't need a second record.

No access to DNS? Choose the file option instead: host a plain text file at `https://yourdomain.com/.well-known/atproto-did` containing only your DID, then tap **Verify Text File**. The DID is public, so it's safe to publish.

## What happens when you change your handle

- **Followers, posts and likes stay.** They belong to your account's permanent ID (DID).
- **Mentions keep working.** Old posts that mention your previous handle still link to your profile.
- **Profile and post links can break.** A URL like `bsky.app/profile/oldname.bsky.social` stops working once the old handle no longer points to you. Update the link in your bio, email signature and website.
- **Third-party apps may need you to sign in again** with the new handle.

<!-- cta -->

## If you schedule Bluesky posts

Schedule For You signs in to Bluesky with the handle and app password you entered when you connected. After you change your handle, reconnect Bluesky from the Accounts screen with the new handle and your app password, otherwise scheduled posts will fail and you'll get an alert. The [Bluesky scheduler page](/bluesky) walks through connecting, and posts keep the same 300-character limit described in our [Bluesky character limit](/blog/bluesky-character-limit) guide.

## Frequently asked questions

### Can you change your Bluesky username?
Yes. Your username is your handle. Change it under Settings > Account > Handle, as often as you like.

### Is changing your Bluesky handle free?
Yes. A `.bsky.social` handle costs nothing. A custom domain handle is also free on Bluesky's side; you only pay for the domain itself.

### Can I go back to my old handle?
Only if it's still free. Once you switch, the old name is released and anyone can register it.

### Does a domain handle mean my account is verified?
It shows you control that domain, which is how many news outlets, companies and public figures prove who they are. Bluesky also adds blue checks to some notable accounts, but a domain handle is open to anyone.
