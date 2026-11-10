---
title: YouTube Video ID Finder – Get Video, Channel & Playlist IDs
description: Free YouTube video ID finder. Paste any watch, youtu.be, Shorts, live or embed link to pull out the video ID, channel ID, playlist ID, start time and thumbnails.
h1: YouTube Video ID Finder
lead: Paste a YouTube link to get its video ID, plus any channel ID, @handle, playlist ID and start time, with short and embed links and thumbnails.
keyword: youtube video id finder
---
## YouTube Link IDs at a Glance

![YouTube Video ID Finder: Get Video, Channel & Playlist IDs. Paste a YouTube link to get its video ID, plus any channel ID, @handle, playlist ID and start time, with short and embed links and thumbnails.](/images/tools/youtube-video-id-finder-hero-1200x675.webp)

A YouTube video ID is the 11-character code, such as `dQw4w9WgXcQ`, that identifies one video however the link is written. Paste a link above and the finder shows each of these that the link contains, with a copy button next to each one.

![YouTube Link IDs at a Glance: Channel ID, shown as 24 characters (24 characters).](/images/tools/youtube-video-id-finder-specs-1200x675.webp)

| Result | Example | When you get it |
|---|---|---|
| Video ID | `dQw4w9WgXcQ` | Watch, youtu.be, Shorts, live, embed and `/v/` links, or a bare ID |
| Channel ID | `UC…` (24 characters) | Links in the `/channel/UC…` form |
| Handle | `@channelname` | Links in the `/@handle` form |
| Playlist ID | `PL…` and others | Any link with a `list=` parameter |
| Start time | `42s`, `1m30s` or `90` | Links with a `t=` or `start=` parameter |
| Short link | `https://youtu.be/<id>` | Whenever there's a video ID |
| Embed link | `https://www.youtube.com/embed/<id>` | Whenever there's a video ID |
| Thumbnails | Max resolution, high and medium | Whenever there's a video ID |

## The IDs in a YouTube Link, Explained
### Video ID
The video ID is 11 characters long and uses letters, numbers, hyphens and underscores. It's case-sensitive: `abc` and `ABC` are different videos. It never changes, even if the creator edits the title or thumbnail, which is why tools and APIs use it instead of the title.

### Channel ID
A channel ID starts with `UC` and is 24 characters long. Like the video ID, it's permanent: a creator can change their name and @handle, but the channel ID stays the same. Many analytics tools, RSS readers and API calls ask for it.

### Handle
The @handle is the human-friendly channel name in links like `youtube.com/@channelname`. It's easy to read but can change. The finder shows it exactly as it appears in the link, decoded if it contains non-Latin letters.

### Playlist ID
The playlist ID comes from the `list=` part of a link. Regular playlists usually start with `PL`. Links opened from a mix or a channel's uploads can carry other kinds of list IDs, and the finder shows whatever is there.

### Start time
A `t=` or `start=` parameter tells YouTube to start playback at a set point. The finder shows the value as written in the link, which may be seconds (`90`) or a time like `1m30s`. Use it to rebuild a timestamped link or to set the start of an embed.

### Thumbnails
YouTube serves thumbnails for every public video at fixed addresses built from the video ID. The finder links to three:

- **Max resolution, 1280 × 720**: only exists for videos uploaded in HD. On older or low-resolution videos this link shows a grey placeholder.
- **High, 480 × 360**: available for every video. It's 4:3, so widescreen videos show black bars at the top and bottom.
- **Medium, 320 × 180**: a small 16:9 version, handy for lists and previews.

Select **Open** to view a thumbnail in a new tab, then save it from there.

## What the Video ID Finder Does

![Key point from the YouTube Video ID Finder page: The video ID finder pulls the video ID out of any YouTube link you paste, along with the other IDs a link can carry, and gives each one a copy button.](/images/tools/youtube-video-id-finder-key-point-1200x675.webp)

The video ID finder pulls the video ID out of any YouTube link you paste, along with the other IDs a link can carry, and gives each one a copy button.

You need a video ID more often than you'd think: to embed a video on a website, to use a WordPress or Notion block, to fill in a field in an analytics or ads tool, to call the YouTube Data API, or just to share a clean link without tracking parameters. Picking it out by hand is fiddly because YouTube links come in at least half a dozen shapes, and the ID sits in a different place in each.

Everything runs in your browser. The link you paste isn't sent anywhere, so it's safe to use with unlisted videos.

### Every link format it understands
YouTube has accumulated a lot of link styles. The finder recognises all the common ones, including links from the mobile site (`m.youtube.com`), YouTube Music (`music.youtube.com`) and privacy-enhanced embeds (`youtube-nocookie.com`). You can leave off `https://` and `www.`.

### Watch links
`https://www.youtube.com/watch?v=dQw4w9WgXcQ` is the standard desktop link. The ID is the `v=` value. Any other parameters, such as `&list=`, `&t=` or `&si=`, are read or ignored as appropriate.

### Short links
`https://youtu.be/dQw4w9WgXcQ` is what the **Share** button gives you. The ID is the path after the slash. Shared links often end in `?si=…`, a sharing code you can safely remove; the short link the finder gives you is clean.

### Shorts links
`https://www.youtube.com/shorts/dQw4w9WgXcQ` uses the same kind of 11-character ID as a regular video. Swap it into a watch link and the Short opens in the normal player, which is useful for viewing comments or the full description.

### Live links
`https://www.youtube.com/live/dQw4w9WgXcQ` is used for streams and premieres. The ID works like any other video ID once the stream is over.

### Embed links
`https://www.youtube.com/embed/dQw4w9WgXcQ` and the older `/v/` form appear inside the code of websites that embed a video. Paste the address from an iframe's `src` to find which video a page is showing.

### Channel and playlist links
`https://www.youtube.com/channel/UC…` gives you the channel ID, `https://www.youtube.com/@name` gives you the handle, and `https://www.youtube.com/playlist?list=PL…` gives you the playlist ID.

### Just the ID
Paste an 11-character video ID on its own and the finder recognises it, then builds the short link, embed link and thumbnail links for you.

## How to Find a YouTube Video ID

![How to Find a YouTube Video ID, in 3 steps: with the finder, by hand and finding a channel ID.](/images/tools/youtube-video-id-finder-how-to-1200x675.webp)

### With the finder
1. Open the video on YouTube and copy its link. On the app or mobile site, tap **Share**, then **Copy link**. On a computer, copy the address bar.
2. Paste the link into the box above. Results appear as you paste; there's no button to press.
3. Select the copy button next to the video ID, short link or embed link you need.
4. Scroll down to open a thumbnail if you need one.

### By hand
If you'd rather not use a tool, here's where the ID sits in each format:

1. In a watch link, it's the text after `v=` and before the next `&`.
2. In a youtu.be link, it's the text after `youtu.be/` and before any `?`.
3. In a Shorts, live or embed link, it's the text after `/shorts/`, `/live/` or `/embed/`.

Count the characters: a video ID is always 11. If you have 12 or more, you've probably picked up part of a parameter.

### Finding a channel ID
The finder can only show a channel ID that's written in the link. Video links and @handle links don't contain one. To get it:

- **For your own channel:** in YouTube, open **Settings**, then **Advanced settings**, where your channel ID is listed. Menu labels change between versions.
- **For any channel:** paste the channel or video link into the [YouTube PFP downloader](/tools/youtube-pfp-downloader). The **Open the channel** link it shows usually uses the `/channel/UC…` form, which you can paste back here to copy the ID.

## Using a Video ID: Links and Embeds You Can Build
Once you have the 11-character ID, you can build every common YouTube link yourself. Replace `VIDEO_ID` with the ID from the finder.

| What you need | Format |
|---|---|
| Watch link | `https://www.youtube.com/watch?v=VIDEO_ID` |
| Short share link | `https://youtu.be/VIDEO_ID` |
| Link that starts at 1:30 | `https://youtu.be/VIDEO_ID?t=90` |
| Video inside a playlist | `https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID` |
| Embed address | `https://www.youtube.com/embed/VIDEO_ID` |
| Embed that starts at 1:30 | `https://www.youtube.com/embed/VIDEO_ID?start=90` |
| Privacy-enhanced embed | `https://www.youtube-nocookie.com/embed/VIDEO_ID` |
| Thumbnail | `https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg` |

### Embedding on a website
Most website builders accept a plain YouTube link and turn it into a player. If yours wants HTML instead, the embed address goes in the `src` of an iframe:

`<iframe src="https://www.youtube.com/embed/VIDEO_ID" width="560" height="315" title="Video title" allowfullscreen></iframe>`

Give the iframe a `title` that describes the video, so screen-reader users know what the player is. Note that embed links use `start=` with a number of seconds, while watch and short links use `t=`.

### Privacy-enhanced mode
The `youtube-nocookie.com` version of the embed address is YouTube's privacy-enhanced mode, which YouTube says doesn't store information about visitors on your site unless they play the video. The finder reads these links too, so you can paste one from a page's code to find the video ID.

## Who Needs a YouTube Video ID (and What For)
### Bloggers and website owners
Most website builders and CMS blocks embed a video from its link or its ID. If an embed misbehaves, the embed link from the finder (`youtube.com/embed/<id>`) is the cleanest thing to paste. To start the embed at a set point, add `?start=` followed by a number of seconds.

### Creators organising their own uploads
When you're building end screens, cards, pinned comments or a "watch next" list in a description, using clean youtu.be links keeps descriptions tidy and avoids carrying someone else's `si=` sharing code. It's also handy when you're logging uploads in a content calendar or spreadsheet: the ID is a short, permanent key for each video.

### Developers and data analysts
The YouTube Data API, analytics exports and most scraping or reporting scripts work with video IDs and channel IDs, not links. Paste a batch of links one at a time to collect IDs for a test, or use the finder to check the IDs your own code extracts.

### Marketers and ad managers
Ad platforms, influencer reports and campaign trackers often ask for a video ID or a clean URL. The finder strips the tracking and sharing parameters people leave in links they send you, so your reports point at the right video every time.

### Teachers and trainers
Learning platforms and slide tools often embed YouTube from an ID or an embed link. Start-time values let you send students straight to the part of a lecture that matters without making them scrub through.

### Moderators and researchers
When you're reviewing reported content or citing a video in research, the video ID is the stable reference. Titles change and links get shortened, but the ID points to the same video for as long as it exists.

## Tips and Limits

![YouTube Video ID Finder: tips and Limits: do IDs outlive titles, not deletions, the finder reads links, not YouTube, custom and legacy channel links and clean links before you share.](/images/tools/youtube-video-id-finder-best-practices-1200x675.webp)

### IDs outlive titles, not deletions
A video ID stays the same through title, description and thumbnail changes. If the video is deleted or made private, the ID still exists in your notes but no longer plays. Our guide on [finding deleted YouTube videos](/blog/how-to-find-deleted-youtube-videos) covers what you can still recover.

### The finder reads links, not YouTube
Because it works offline in your browser, the finder can't tell whether a video exists, is public, or belongs to a particular channel. A well-formed but made-up ID will still produce results. Open the short link to confirm the video plays.

### Custom and legacy channel links
Old `/c/name` and `/user/name` channel links don't contain an ID or handle, so the finder can't read anything from them. Use the PFP downloader route above to get the channel ID instead.

### Clean links before you share
Shared YouTube links often carry an `si=` code that ties the link back to the person who shared it. The short link and embed link the finder gives you leave it out.

### Thumbnails belong to the creator
Opening a thumbnail to check how it looks is fine. Reusing it in your own content needs the creator's permission, just like reusing their video.

## Frequently asked questions
### What is a YouTube video ID?
A YouTube video ID is the 11-character code that identifies a video, made of letters, numbers, hyphens and underscores. In `youtube.com/watch?v=dQw4w9WgXcQ`, the ID is `dQw4w9WgXcQ`.

### How do I find the ID of a YouTube Short?
Paste the Shorts link into the finder, or copy the 11 characters after `/shorts/` in the link. Shorts use the same kind of ID as regular videos.

### Can I get a channel ID from a video link?
No, not from the link alone, because a video link doesn't contain the channel ID. Paste the video link into the [YouTube PFP downloader](/tools/youtube-pfp-downloader), open the channel from there, and paste that channel link back into the finder.

### Does the video ID ever change?
No. A video keeps the same ID for as long as it exists, even if the title, thumbnail or channel name changes. Re-uploading a video creates a new ID.

### How do I get a YouTube thumbnail from the video ID?
Paste the link or ID into the finder and select **Open** next to the thumbnail size you want. The max-resolution version only exists for HD uploads; the 480 × 360 version always exists.

### What does t= mean in a YouTube link?
The `t=` parameter is the start time: it opens the video that many seconds in, or at a time written like `1m30s`. The finder shows the value so you can reuse it.

### Why does the max-resolution thumbnail show a grey image?
The grey image means the video has no 1280 × 720 thumbnail, which happens when it wasn't uploaded in HD. Use the 480 × 360 or 320 × 180 link instead; those exist for every video.

### Is the link I paste sent anywhere?
No. The finder works entirely in your browser and doesn't contact YouTube or our servers.

## Schedule Your YouTube Uploads with Schedule For You
Once you're managing videos by ID, you're probably publishing on a schedule too. Schedule For You uploads your videos to YouTube at the time you choose, with a title of up to 100 characters, a description of up to 5,000 and a public, unlisted or private setting, and it plans the posts that promote them on Instagram, TikTok, Facebook Pages, X, LinkedIn, Threads, Bluesky, Pinterest and Google Business Profile from the same calendar.

The Free plan covers 3 accounts and up to 10 scheduled posts at a time, with no card needed. [Start free](/signup), and read [how to schedule YouTube videos and Shorts](/blog/how-to-schedule-youtube-videos-and-shorts) to see how it works.
