---
layout: legal
title: Privacy Policy
description: How Schedule For You collects, uses, stores and deletes your data, including the data we access from Facebook, Instagram, X, TikTok, YouTube and every platform we support.
h1: Privacy Policy
lead: What we collect, why, who processes it, and how to get it deleted.
updated: 2026-10-23
---
This Privacy Policy explains how Schedule For You ("Schedule For You", "we", "us") handles personal information when you visit scheduleforyou.com, use our free tools, or use the Schedule For You app to schedule and publish social media posts. Schedule For You is operated from Canada.

If you have a question or request about your data, email **[privacy@scheduleforyou.com](mailto:privacy@scheduleforyou.com)**.

## Summary

- We collect what we need to run a social media scheduler: your account details, the posts and media you create, and access to the social accounts you choose to connect.
- We use platform access only to publish the posts you schedule and to show which accounts are connected. We don't read your private messages, sell your data, or use it for advertising.
- Access tokens for connected platforms are encrypted at rest.
- You can disconnect any platform at any time, and you can ask us to delete all of your data. See [how to delete your data](/data-deletion).
- Our free tools on scheduleforyou.com/tools run in your browser. Text you type and images or files you choose there are not uploaded to us.

## Information we collect

### Account information
When you sign up we collect your name, email address and password. Passwords are handled by our authentication provider and are never stored by us in readable form. We also store your workspace name, time zone, settings and, if you invite teammates, their email addresses and roles.

### Content you create
We store the posts you write (captions, per-platform versions, scheduled times, labels, approval status), the media files you upload (images and videos), your posting time slots, signatures, RSS feed addresses, webhook addresses and API keys (stored as a hash, not in readable form).

### Connected social accounts
When you connect a social account, the platform sends us an access token (and sometimes a refresh token) plus basic profile details such as the account ID, username, display name and profile picture. For Bluesky, you provide your handle and an app password instead. Tokens and app passwords are encrypted with AES-256 before they are stored. The specific data we access on each platform is listed under [Platform data](#platform-data).

### Client preview links
If you share a post for review, anyone with the link can view that post and leave a comment or approval with the name they type. We store that name and comment with the post. The reviewer's browser remembers the name they typed (in local storage) so they don't have to retype it.

### Billing information
Payments are processed by Stripe. Card details go directly to Stripe and are never stored on our servers. We store your Stripe customer ID, plan, subscription status and trial dates.

### Usage and technical data
Our hosting provider records standard server logs (such as IP address, browser type and request time) to keep the service secure and working. We use Vercel Web Analytics to count page views. It doesn't use cookies and doesn't identify you personally.

## How we use information

We use your information to:

- provide the service: save your drafts, publish your posts at the times you choose, show your queue and calendar, and run automations you set up (RSS auto-post, webhooks, signatures);
- send service emails, such as post reminders, failed-post alerts, the daily digest (which you can turn off), team invites, review notifications and billing notices;
- process payments and manage your subscription;
- keep the service secure, prevent abuse and fix problems;
- comply with the law.

We don't sell or rent personal information, we don't use your content or platform data for advertising, and we don't use it to train AI models.

## Platform data

You choose which accounts to connect. For each platform, we request only the permissions needed to publish your posts and identify the connected account. We use this data only to provide the features you use in Schedule For You, and we don't share it with anyone except the platform itself when we publish on your behalf.

| Platform | What we access | What we use it for |
|---|---|---|
| Facebook | List of Pages you manage, permission to publish to those Pages, Page name and picture (`pages_show_list`, `pages_manage_posts`, `pages_read_engagement`, `business_management`) | Showing which Pages you can connect and publishing the posts you schedule to them |
| Instagram | Instagram professional account linked to your Facebook Page: ID, username, name, profile picture, and permission to publish (`instagram_basic`, `instagram_content_publish`, plus the Page permissions above) | Publishing your photos, Reels and carousels |
| Threads | Profile ID, username and permission to publish (`threads_basic`, `threads_content_publish`) | Publishing your Threads posts |
| X | Profile ID and username, and permission to post and upload media (`tweet.read`, `tweet.write`, `users.read`, `media.write`, `offline.access`) | Publishing your posts and media to X |
| LinkedIn | Name, profile picture and member ID from LinkedIn sign-in, and permission to post (`openid`, `profile`, `w_member_social`) | Publishing posts to your personal LinkedIn profile |
| TikTok | Basic profile info and permission to upload and publish videos and photos (`user.info.basic`, `video.upload`, `video.publish`) | Publishing your videos and photo posts with the privacy setting you choose |
| YouTube | Channel ID, name and thumbnail, and permission to upload videos (`youtube.upload`, `youtube.readonly`) | Uploading your videos with the title, description and privacy you set |
| Google Business Profile | Business accounts and locations you manage and permission to post updates (`business.manage`) | Publishing your updates to the locations you choose |
| Pinterest | Account info, boards and permission to create pins (`user_accounts:read`, `boards:read`, `pins:read`, `pins:write`) | Listing your boards and publishing your pins |
| Bluesky | Your handle and an app password you create in Bluesky | Signing in to Bluesky to publish your posts |

We don't access private or direct messages, contacts, followers lists, ads accounts, or analytics on any platform.

### Google and YouTube
Schedule For You's use and transfer of information received from Google APIs to any other app will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements. By connecting a YouTube channel, you agree to the [YouTube Terms of Service](https://www.youtube.com/t/terms), and Google's handling of your data is described in the [Google Privacy Policy](https://policies.google.com/privacy). Schedule For You uses YouTube API Services.

### Revoking platform access
You can disconnect any account in the Accounts screen of Schedule For You, which deletes its stored tokens and profile details from our database. You can also revoke our access directly with each platform:

- Facebook and Instagram: Facebook Settings → Business integrations (or Accounts Center), then remove Schedule For You
- Threads: Threads settings → Account → Website permissions
- X: Settings → Security and account access → Apps and sessions → Connected apps
- LinkedIn: Settings → Data privacy → Permitted services
- TikTok: Settings and privacy → Security and permissions → Apps and services permissions
- Google and YouTube: [Google Account permissions](https://myaccount.google.com/permissions)
- Pinterest: Settings → Security and logins → Apps
- Bluesky: Settings → Privacy and security → App passwords, then delete the app password

After you revoke access, we can no longer publish to that account. Menu names change from time to time; check each platform's help center if a path above has moved.

## Who processes your data

We use these service providers to run Schedule For You. They process data on our behalf and only as needed to provide their service:

| Provider | Purpose | Data involved |
|---|---|---|
| Vercel | Hosting, server logs and cookie-free page analytics | Requests to our site and app |
| Neon | Database, sign-in (authentication) and media file storage | Account details, posts, media, encrypted platform tokens |
| Stripe | Payments and subscriptions | Billing details and card information (held by Stripe) |
| Resend | Sending service emails | Your email address and the email content |

When we publish a post, we send its content and media to the platform you selected. That platform's own privacy policy then applies to the published content.

We may disclose information if required by law, to protect our rights or users, or as part of a merger or sale of the business, in which case this policy would continue to apply to your information.

## Where your data is stored

Our service providers store and process data in the United States. This means your information may be accessible to authorities in the United States under its laws. We take steps to protect it, including encryption in transit (HTTPS) and encryption of platform tokens at rest.

## How long we keep data

- **Account, workspace and content data:** for as long as your account is active. You can delete posts, media and connected accounts at any time.
- **Connected account tokens:** until you disconnect the account or delete your account.
- **Billing records:** as long as needed for tax and accounting obligations.
- **After you ask us to delete your account:** we delete your data within 30 days. Copies in database backups expire on a rolling basis after that.

## Your rights

Under Canada's privacy law (PIPEDA) and similar laws elsewhere, you can ask to access the personal information we hold about you, correct it, or have it deleted, and you can withdraw your consent to our processing (which may mean we can no longer provide the service). Email [privacy@scheduleforyou.com](mailto:privacy@scheduleforyou.com) and we'll respond within 30 days. We may need to confirm your identity first. If you're not satisfied with our response, you can contact the Office of the Privacy Commissioner of Canada or your local data protection authority.

## Cookies and local storage

We use cookies only to keep you signed in to the app. Our page analytics don't use cookies. The client preview page stores the reviewer's name in the browser, and our free tools run entirely in your browser.

## Security

We protect your information with HTTPS, encrypted platform tokens, hashed API keys, access controls by workspace role, and providers with strong security practices. No system is perfectly secure, so please use a strong password and tell us right away at [privacy@scheduleforyou.com](mailto:privacy@scheduleforyou.com) if you suspect a problem.

## Children

Schedule For You is not intended for children under 13, and you must meet the minimum age of each platform you connect. We don't knowingly collect information from children under 13.

## Changes to this policy

If we make important changes, we'll update the date at the top of this page and, where appropriate, let you know by email or in the app.

## Contact

Schedule For You
Email: [privacy@scheduleforyou.com](mailto:privacy@scheduleforyou.com)
