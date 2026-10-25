import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captionFromFilename } from '../lib/bulk-caption.js';

test('names people wrote become captions', () => {
  assert.equal(captionFromFilename('Bulk Upload Ad.mp4'), 'Bulk Upload Ad');
  assert.equal(captionFromFilename('scheduling-reel_v2.mp4'), 'Scheduling reel');
  assert.equal(captionFromFilename('Dr. Aisha Tabassum Hospital.png'), 'Dr. Aisha Tabassum Hospital');
  assert.equal(captionFromFilename('autumn menu (1).jpg'), 'Autumn menu');
});

test('names a camera or app made start empty', () => {
  for (const n of ['WhatsApp Image 2026-10-15 at 7.26.29 PM.jpeg', 'IMG_4821.jpg', 'IMG-20261015-WA0003.jpg', 'DSC_0042.JPG', 'PXL_20261015_192629123.mp4', 'Screenshot 2026-10-01 at 09.12.33.png', 'Screen Recording 2026-10-01.mov', '2026-10-15 19.26.29.jpg', '20261015_192629.jpg', 'FB_IMG_1697392389.jpg', 'VID_20261015.mp4', '3f9c2a71-b8d0-4e65-9a1c-0f6e2d9a4c71.png', 'Untitled 3.png', 'image (4).png']) {
    assert.equal(captionFromFilename(n), '', n);
  }
});
