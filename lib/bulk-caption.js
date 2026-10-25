/**
 * A starting caption from a file name, for bulk uploads. Names people wrote ("Autumn menu launch.jpg")
 * become captions; names a camera or app made ("IMG_4821.jpg", "WhatsApp Image 2026-10-15 at
 * 7.26.29 PM.jpeg", "Screenshot 2026-10-01 at 09.12.33.png") become an empty caption, which the
 * bulk screen flags, instead of junk that would be posted as written.
 */
const AUTO_NAME = /^(IMG|DSC[NF]?|DCIM|PXL|VID|MOV|MVI|GOPR|GX|DJI|P\d{7}|FB_IMG|received_|Snapchat|Screen ?[Ss]hot|Screen ?[Rr]ecording|Capture|WhatsApp (Image|Video|Audio)|Photo|Image|Video|Untitled|Download|unnamed|file|scan)[\s_\-]*[\d(]/i;
const MOSTLY_NUMBERS = /^[\d\s_\-.:()]+$/;
const DATE_FIRST = /^\d{4}[-_.]?\d{2}[-_.]?\d{2}/;

export function captionFromFilename(name) {
  const base = String(name || '').replace(/\.[^.]+$/, '').trim();
  if (!base || AUTO_NAME.test(base) || MOSTLY_NUMBERS.test(base) || DATE_FIRST.test(base)) return '';
  // Also catch "IMG_20261015_192629" style names with the prefix removed, and UUID-ish names.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(base)) return '';
  const words = base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  // A copy suffix ("(1)") or a version tag isn't part of a caption.
  const clean = words.replace(/\s*\(\d+\)$/, '').replace(/\s+(copy|final|v\d+)$/i, '');
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : '';
}
