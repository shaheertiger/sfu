---
title: Instagram 400 Session Invalid Error: Causes and Fixes
description: Seeing a 400 session invalid error from Instagram? Learn why Meta invalidated your access, how to reconnect your account and how to reschedule failed posts.
h1: How to Fix the "400 Session Invalid" Error on Instagram
category: Guides
excerpt: A 400 session invalid error means Meta has cancelled the access your scheduling tool was using. Here's why it happens and how to reconnect and recover failed posts.
keyword: 400 session invalid instagram
date: 2026-10-23
---
A "400 session invalid" error on Instagram means Meta has invalidated the access token a connected app was using to post for you. It usually happens after a password change, a security checkpoint, logging out of sessions, removing the app's permissions, unlinking your Facebook Page or changing your account type. The fix is to reconnect your Instagram account so the app gets a fresh token, then reschedule any posts that failed.

This guide explains what the error means, the common causes, and how to fix it in Schedule For You.

## What the error means

Apps that publish to Instagram, including scheduling tools, don't store your password. When you connect an account, Meta gives the app an access token: a key that lets it publish to that specific account with the permissions you approved.

Meta can cancel that token at any time. When it does, the next request the app makes is rejected with an HTTP 400 response. The message attached is usually something like "Error validating access token: the session has been invalidated" or "session is invalid," often alongside an OAuth error code. The exact wording varies, but the meaning is the same: **the connection needs to be renewed.**

It isn't a problem with your post, your image or your caption. Nothing you change in the post itself will fix it.

## Common causes at a glance

| What happened | Why it breaks the connection | What to do |
|---|---|---|
| You changed your Instagram or Facebook password | Meta ends existing sessions and tokens for security | Reconnect the account |
| Meta ran a security checkpoint | Suspicious-login checks can end active sessions | Complete the check in the app, then reconnect |
| You logged out of all sessions | Logging out everywhere can revoke app access | Reconnect the account |
| App permissions were removed | Someone removed the app in Business integrations or Accounts Center | Reconnect and approve permissions again |
| The Instagram account was unlinked from its Facebook Page | Publishing needs the Business or Creator account linked to a Page | Relink the account to the Page, then reconnect |
| The account type changed | Switching to a personal account removes API publishing access | Switch back to Business or Creator, then reconnect |
| Page access was lost | The person who connected no longer has full control of the Page | Reconnect with an account that has full control |

### Password changes and security checks

This is the most common cause. If you or someone on your team changed the Instagram or linked Facebook password, Meta treats existing sessions as untrusted and invalidates them. The same can happen after Meta asks you to confirm your identity following a login from an unusual location.

### Removed permissions or logged-out sessions

Removing an app from your Business integrations on Facebook, or from the connected experiences in Accounts Center, cancels its access. Logging out of all sessions can also end app access. Sometimes this is done on purpose during a security cleanup and the scheduling tool gets caught up in it.

### Account and Page changes

Schedule For You publishes to **Instagram Business or Creator accounts linked to a Facebook Page**. If the account is switched to a personal account, or the link to the Facebook Page is removed, the existing token stops working. A change in who has access to the Page can have the same effect.

<!-- cta -->

## How to fix it in Schedule For You

When a post fails because of an invalid session, Schedule For You sends a failed-post alert with a prompt to reconnect. Follow these steps:

1. **Secure your account first.** If you didn't change your password or log out of sessions yourself, open Instagram and check for security alerts. Complete any checkpoint Meta asks for in the app and make sure you can log in normally.
2. **Confirm the account type.** In the Instagram app, open your profile settings and check the account is still a Business or Creator account. If it's been switched to personal, switch it back to a professional account.
3. **Check the Facebook Page link.** Make sure the Instagram account is still linked to the right Facebook Page. You can check this from the Page's linked accounts settings or in Meta Business Suite. Menu names change from time to time, so look for "Linked accounts" or "Instagram" in the Page's settings.
4. **Check your Page access.** The Facebook account you'll reconnect with needs full control of that Page. If you only have partial access, ask a Page admin to upgrade it.
5. **Open the Accounts screen** in the right workspace in Schedule For You.
6. **Reconnect Instagram.** Start the Instagram connection again and log in through Meta's window with the account that manages the Page.
7. **Select the right Page and Instagram account.** In Meta's dialog, make sure the Page linked to your Instagram account is selected. If you previously left it unticked, choose the option to edit your earlier settings and select it.
8. **Approve every permission.** Leave all requested permissions turned on. Turning any off can stop posts from publishing.
9. **Retry or reschedule failed posts.** Open the posts that failed while the connection was broken and retry them, pick a new time, or add them back to your queue. Posts scheduled for later will publish normally once the account is reconnected.

The steps for checking Page access and selecting Pages in Meta's dialog are the same as for Facebook. Our guide on [how to connect a Facebook Page](/blog/connect-facebook-page) covers them in more detail.

## If reconnecting doesn't work

### The Instagram account doesn't appear

If Meta's dialog doesn't show your Instagram account, the link between the Instagram account and the Facebook Page is usually the issue. Relink them, then start the connection again. Also confirm you're logged in to the Facebook account that manages the Page, not a different one. Using a private browser window can help if your browser keeps signing in to the wrong account.

### The error comes back after a few days

Repeated invalidation often points to something that keeps happening in the background:

- Someone on your team keeps changing the password or logging out of all sessions.
- More than one person is reconnecting the account with different Facebook logins.
- The account is triggering Meta's security checks, for example from logins in many locations.

Agree on one person (or one business-owned login) to manage the connection, turn on two-factor authentication, and avoid sharing the password.

### The account is restricted or disabled

If Instagram has restricted or disabled the account, no app can post to it until that's resolved. Use Instagram's in-app appeal flow and the official [Instagram Help Center](https://help.instagram.com). Never pay a third-party "recovery service." Our guide to a [suspended Instagram account](/blog/suspended-instagram-account) explains the official routes.

## How to prevent it

- **Plan password changes.** After changing your Instagram or Facebook password, reconnect the account in Schedule For You straight away so scheduled posts aren't affected.
- **Use a long-term login.** Connect with a Facebook account that will keep full control of the Page, ideally one owned by the business.
- **Don't switch account types.** Switching from Business or Creator to personal, even briefly, breaks publishing.
- **Keep the Page link in place.** Don't unlink the Instagram account from its Facebook Page while posts are scheduled.
- **Watch your alerts.** Failed-post alerts and the daily digest show problems early, before several days of posts are missed.

## Frequently asked questions

### What does "400 session invalid" mean on Instagram?

It means Meta has cancelled the access token an app was using to post to your Instagram account. The app's next request is rejected with a 400 error. Reconnecting the account gives the app a new token.

### Did I get hacked if I see this error?

Not necessarily. Most of the time it follows a normal password change, a logout from all sessions or a permission change. If you didn't do any of those, check Instagram's security alerts, change your password and turn on two-factor authentication.

### Will my scheduled posts be lost?

Posts that were due while the connection was broken will fail, and you'll get a failed-post alert. After reconnecting, retry or reschedule them. Posts scheduled for after you reconnect will publish normally.

### Can I fix it without reconnecting?

No. The old token can't be revived. You need to reconnect from the Accounts screen so Meta issues a new one.

### Why does Schedule For You need my Instagram linked to a Facebook Page?

Schedule For You publishes to Instagram through a Business or Creator account linked to a Facebook Page, which is how Meta grants it permission to post. If that link is removed, the connection stops working until you relink and reconnect.
