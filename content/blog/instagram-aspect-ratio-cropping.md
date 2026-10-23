---
title: Why Instagram Crops Your Photos (and How to Stop It)
description: Instagram crops photos outside its 4:5 to 1.91:1 feed range and trims your profile grid to 3:4. See the right sizes and how to avoid failed scheduled posts.
h1: Why Instagram Crops Your Photos and How to Prevent It
category: Guides
excerpt: Instagram feed photos must sit between 4:5 portrait and 1.91:1 landscape, and the grid shows a 3:4 crop. Here are the sizes to use and how to avoid failed posts.
keyword: instagram crops
date: 2026-10-23
---
Instagram crops photos because its feed only accepts images between 4:5 portrait and 1.91:1 landscape, at the time of writing. If your image is taller or wider than that, the Instagram app makes you crop it to fit, and your profile grid then trims every post to a 3:4 thumbnail on top of that. When you schedule posts, the rules work differently: Schedule For You doesn't crop or resize images, so a photo outside the allowed range is rejected by Instagram and you get a failed-post alert.

The fix in both cases is the same: export your images at a supported size before you post. This guide shows which sizes to use and how to keep important details out of the crop.

## Instagram image sizes at a glance

| Format | Aspect ratio | Recommended size | Notes |
|---|---|---|---|
| Portrait feed post | 4:5 | 1080×1350 | Tallest feed shape allowed; takes up the most screen space |
| Square feed post | 1:1 | 1080×1080 | Safe default; fits the grid with little cropping |
| Landscape feed post | 1.91:1 | 1080×566 | Widest shape allowed; looks small in the feed |
| Reels | 9:16 | 1080×1920 | Full-screen vertical video |
| Stories | 9:16 | 1080×1920 | Not published by Schedule For You |
| Profile grid thumbnail | 3:4 | Displayed crop | The grid shows a 3:4 crop of each post |

All of these values are correct at the time of writing. Instagram adjusts its formats from time to time, so check the [Instagram Help Center](https://help.instagram.com) if something looks different.

## Why Instagram crops your photos

### Your image is outside the feed range

Instagram's feed accepts any shape from 4:5 (a bit taller than square) to 1.91:1 (wide landscape). A quick way to check is to divide the width by the height:

- **0.8 to 1.91:** inside the range, so no forced crop.
- **Below 0.8:** too tall. A 3:4 photo (0.75), a 2:3 photo (0.67) or a 9:16 phone screenshot (0.56) falls here.
- **Above 1.91:** too wide. A 2:1 banner or a panorama falls here.

Most phone cameras shoot at 3:4 in portrait mode, which is just outside the range. That's why so many photos get trimmed slightly at the top and bottom when you post them from the app.

Instagram has started allowing taller 3:4 photos in its own app, so you may see uncropped 3:4 posts from other accounts. Posts published through Instagram's publishing API, which schedulers including Schedule For You use, are still documented as 4:5 to 1.91:1 at the time of writing. Resizing 3:4 photos to 4:5 before you schedule them is the safe choice.

### The profile grid shows a 3:4 crop

Even an image that fits the feed range perfectly is cropped again on your profile. At the time of writing, the profile grid shows each post as a 3:4 rectangle. A 4:5 portrait loses a small strip on the left and right, and a square photo loses more from the sides. Your post itself isn't changed, but the thumbnail people see on your profile is.

That matters most for text-heavy graphics, logos near the edges, and grid layouts that split one picture across several posts.

### Carousels use one shape

A carousel is shown at a single shape, generally set by the first item. If you mix portrait and landscape slides, the later ones can be cropped to match. Export every slide at the same ratio.

### Reels covers in the grid and feed

Reels are 9:16, but the cover is shown cropped in the profile grid. Keep the subject and any title text near the center of the cover frame so it reads well in both places.

<!-- cta -->

## How scheduling changes the picture

When you post from the Instagram app, cropping is interactive. The app shows the crop frame and lets you drag the image around. When you schedule a post with Schedule For You, there's no crop step:

- **Schedule For You doesn't crop or resize images.** It sends the file you uploaded to Instagram as is.
- **Instagram checks the shape when it publishes.** If the image is outside the 4:5 to 1.91:1 range, Instagram rejects the post.
- **You get a failed-post alert.** The alert tells you the post didn't publish, so you can fix the image and reschedule.

This is deliberate. Automatic cropping can cut off faces, logos or text without you noticing. Preparing the image yourself means the post looks exactly the way you designed it.

### How to fix a rejected image

1. **Check the ratio.** Divide width by height. If it's under 0.8 or over 1.91, it needs resizing.
2. **Resize to a supported shape.** Use our free [Instagram photo resizer](/tools/instagram-photo-resizer) and pick the portrait (1080×1350), square (1080×1080) or landscape (1080×566) preset.
3. **Choose fill or fit.** "Fill" crops the image to the new shape, and you decide what gets trimmed. "Fit" keeps the whole image and adds a background color around it, which is useful for screenshots and graphics.
4. **Replace the image in the post.** Open the failed post in Schedule For You, swap in the resized image and reschedule it.

## How to stop Instagram cropping your photos

### Shoot or design for 4:5

If you create graphics, start with a 1080×1350 canvas. It's the tallest shape the feed allows, it fills the most screen space, and it loses only thin strips at the sides in the 3:4 grid. For photos, consider shooting at 4:5 if your camera app offers it, or leave room around the subject so you can crop later.

### Keep a safe zone

For any feed image, keep important text and faces inside the central part of the frame. A rough rule: leave a margin on the left and right of 4:5 images so the 3:4 grid thumbnail doesn't clip anything.

### Use "fit" for screenshots and tall images

Phone screenshots (about 9:16) and tall infographics can't fit the feed without losing a lot. Placing them on a 4:5 background with "fit" keeps everything visible.

### Plan grid layouts around the 3:4 crop

If you split one image across several posts to create a big picture on your profile, use a tool that accounts for the grid crop. Our [Instagram grid maker](/tools/instagram-grid-maker) splits an image into 3×1 to 3×4 tiles at 1080×1350 or 1080×1080 and numbers them in posting order. Keep important detail away from tile edges, since each tile is cropped to 3:4 on the grid.

### Export at 1080 pixels wide

Instagram displays feed images at up to 1080 pixels wide at the time of writing. Smaller images get stretched and can look soft, and much larger ones are scaled down. Exporting at 1080 wide in the right shape gives Instagram the least to change.

## Quick reference: common sizes and what happens

| Your image | Ratio (W÷H) | In the Instagram app | Scheduled with Schedule For You |
|---|---|---|---|
| 1080×1350 | 0.8 | Posts as is | Publishes |
| 1080×1080 | 1.0 | Posts as is | Publishes |
| 1920×1080 (16:9) | 1.78 | Posts as is | Publishes |
| 1080×566 | 1.91 | Posts as is | Publishes |
| 3024×4032 phone photo (3:4) | 0.75 | You crop to 4:5 | Rejected; resize first |
| 1080×1920 screenshot (9:16) | 0.56 | You crop to 4:5 | Rejected; resize first |
| 3000×1000 panorama (3:1) | 3.0 | You crop to 1.91:1 | Rejected; resize or split |

For a wide panorama, splitting it into a seamless carousel is often better than squeezing it into one image.

## Frequently asked questions

### Why does Instagram crop my photos?

Instagram's feed only accepts images between 4:5 portrait and 1.91:1 landscape at the time of writing. Anything taller or wider has to be cropped to fit. Separately, the profile grid shows each post as a 3:4 thumbnail, which trims the sides.

### What size should I use to avoid cropping?

1080×1350 (4:5) for portrait and 1080×1080 (1:1) for square both fit the feed without a forced crop. Keep key details away from the left and right edges, because the profile grid shows a 3:4 crop.

### Does Schedule For You crop images for Instagram?

No. Schedule For You doesn't crop or resize images. If an image is outside Instagram's allowed range, Instagram rejects the post and you get a failed-post alert so you can resize it and reschedule.

### Why do my posts look cut off on my profile grid?

At the time of writing, the grid shows every post as a 3:4 rectangle, regardless of the post's real shape. The full image is still visible when someone opens the post.

### What aspect ratio should Reels use?

9:16, ideally 1080×1920. The cover is cropped in the profile grid, so keep the main subject and any text near the center.
