/** Crop maths for the image cropper (components/dashboard/ImageCropper.jsx). */

export const RATIOS = [
  { id: 'original', label: 'Original', hint: 'No crop' },
  { id: '1:1', label: '1:1', w: 1080, h: 1080, hint: 'Square feed post' },
  { id: '4:5', label: '4:5', w: 1080, h: 1350, hint: 'Portrait feed post' },
  { id: '9:16', label: '9:16', w: 1080, h: 1920, hint: 'Reels, Stories, TikTok' },
  { id: '16:9', label: '16:9', w: 1920, h: 1080, hint: 'Landscape, YouTube, X' },
  { id: '1.91:1', label: '1.91:1', w: 1200, h: 628, hint: 'Link-style landscape' },
];

/** Where the image sits in the frame: scale and top-left offset, clamped so the image always covers the frame. */
export function coverLayout(imgW, imgH, frameW, frameH, zoom, offX, offY) {
  const scale = Math.max(frameW / imgW, frameH / imgH) * zoom;
  const w = imgW * scale, h = imgH * scale;
  const x = Math.min(0, Math.max(frameW - w, offX));
  const y = Math.min(0, Math.max(frameH - h, offY));
  return { scale, x, y, w, h };
}

/** The source rectangle (in image pixels) that the frame shows. */
export function sourceRect(layout, frameW, frameH) {
  return { sx: -layout.x / layout.scale, sy: -layout.y / layout.scale, sw: frameW / layout.scale, sh: frameH / layout.scale };
}
