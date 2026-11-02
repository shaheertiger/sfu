import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectFormat, exifOrientationSegment, readMetadata, stripJpegMetadata, stripMetadata, stripWebpMetadata, webpChunks } from '../lib/tools/exif.js';

/** A tiny baseline JPEG: SOI, APP0 JFIF, APP1 Exif (orientation 6 + GPS), COM, DQT stub, SOS stub, EOI. */
function jpegWithExif(orientation = 6, withGps = true) {
  const app0 = [0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00];
  // TIFF big-endian, IFD0 with Orientation and (optionally) a GPS IFD pointer to a GPS IFD holding a latitude.
  const entries: number[][] = [[0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, orientation, 0x00, 0x00]];
  let gps: number[] = [];
  if (withGps) {
    const ifd0Len = 2 + 12 * 2 + 4;
    const gpsOffset = 8 + ifd0Len;
    entries.push([0x88, 0x25, 0x00, 0x04, 0x00, 0x00, 0x00, 0x01, (gpsOffset >> 24) & 255, (gpsOffset >> 16) & 255, (gpsOffset >> 8) & 255, gpsOffset & 255]);
    const ro = (o: number) => [(o >> 24) & 255, (o >> 16) & 255, (o >> 8) & 255, o & 255];
    const latAt = gpsOffset + 2 + 12 * 4 + 4;
    const lonAt = latAt + 24;
    const rational = (n: number) => [0, 0, 0, n, 0, 0, 0, 1];
    gps = [
      0x00, 0x04,
      0x00, 0x01, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x4e, 0x00, 0x00, 0x00, // GPSLatitudeRef "N"
      0x00, 0x02, 0x00, 0x05, 0x00, 0x00, 0x00, 0x03, ...ro(latAt),           // GPSLatitude
      0x00, 0x03, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x57, 0x00, 0x00, 0x00, // GPSLongitudeRef "W"
      0x00, 0x04, 0x00, 0x05, 0x00, 0x00, 0x00, 0x03, ...ro(lonAt),           // GPSLongitude
      0, 0, 0, 0,
      ...rational(51), ...rational(30), ...rational(0),
      ...rational(0), ...rational(7), ...rational(0),
    ];
  }
  const ifd0 = [0x00, entries.length, ...entries.flat(), 0, 0, 0, 0];
  const tiff = [0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, ...ifd0, ...gps];
  const exifPayload = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, ...tiff];
  const app1 = [0xff, 0xe1, ((exifPayload.length + 2) >> 8) & 255, (exifPayload.length + 2) & 255, ...exifPayload];
  const com = [0xff, 0xfe, 0x00, 0x07, 0x68, 0x65, 0x6c, 0x6c, 0x6f];
  const dqt = [0xff, 0xdb, 0x00, 0x04, 0x00, 0x01];
  const sos = [0xff, 0xda, 0x00, 0x04, 0x01, 0x00, 0x12, 0x34, 0x56];
  return new Uint8Array([0xff, 0xd8, ...app0, ...app1, ...com, ...dqt, ...sos, 0xff, 0xd9]);
}

test('JPEG: GPS, comments and vendor blocks go; orientation survives as the only Exif field', () => {
  const src = jpegWithExif(6, true);
  const before = readMetadata(src);
  assert.equal(before.orientation, 6);
  assert.ok(before.gps, 'fixture has a GPS position');
  const out = stripJpegMetadata(src);
  const after = readMetadata(out);
  assert.equal(after.gps, null);
  assert.equal(after.hasComment, false);
  assert.equal(after.orientation, 6, 'orientation kept');
  assert.ok(out.length < src.length);
  // Image data untouched: the SOS payload and EOI are still there, in order.
  const tail = Array.from(src.slice(-9));
  assert.deepEqual(Array.from(out.slice(-9)), tail);
  // Orientation 1 means no Exif segment at all.
  const plain = stripJpegMetadata(jpegWithExif(1, true));
  assert.equal(readMetadata(plain).hasExif, false);
  assert.equal(exifOrientationSegment(8)[1], 0xe1);
});

test('stripMetadata reports what it removed and leaves clean files alone', () => {
  const r = stripMetadata(jpegWithExif(6, true));
  assert.equal(r.format, 'jpeg');
  assert.equal(r.changed, true);
  assert.equal(r.hadGps, true);
  const again = stripMetadata(r.bytes);
  assert.equal(again.changed, false, 'second pass is a no-op');
  assert.equal(again.hadGps, false);
  const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 1, 0, 1, 0, 0, 0, 0]);
  const g = stripMetadata(gif);
  assert.equal(g.changed, false);
  assert.equal(g.format, null);
});

test('WebP: EXIF and XMP chunks are dropped, VP8X flags cleared, RIFF size fixed', () => {
  const chunk = (type: string, data: number[]) => { const len = data.length; const pad = len & 1 ? [0] : []; return [...type.split('').map((c) => c.charCodeAt(0)), len & 255, (len >> 8) & 255, (len >> 16) & 255, (len >> 24) & 255, ...data, ...pad]; };
  const vp8x = chunk('VP8X', [0x2c, 0, 0, 0, 9, 0, 0, 9, 0, 0]); // ICC + EXIF + XMP + alpha flags
  const exif = chunk('EXIF', [0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0]);
  const xmp = chunk('XMP ', [0x3c, 0x78, 0x3e]);
  const vp8 = chunk('VP8 ', [1, 2, 3, 4]);
  const body = [...vp8x, ...exif, ...xmp, ...vp8];
  const size = body.length + 4;
  const src = new Uint8Array([0x52, 0x49, 0x46, 0x46, size & 255, (size >> 8) & 255, 0, 0, 0x57, 0x45, 0x42, 0x50, ...body]);
  assert.equal(detectFormat(src), 'webp');
  const out = stripWebpMetadata(src);
  const types = webpChunks(out).map((c) => c.type);
  assert.deepEqual(types, ['VP8X', 'VP8 ']);
  assert.equal(out[12 + 8] & 0x0c, 0, 'EXIF and XMP flags cleared');
  assert.equal(out[12 + 8] & 0x20, 0x20, 'ICC flag kept');
  assert.equal(out[4] | (out[5] << 8), out.length - 8, 'RIFF size matches');
  assert.deepEqual(Array.from(out.slice(-4)), [1, 2, 3, 4], 'pixels untouched');
});
