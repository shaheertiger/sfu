import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectFormat,
  formatExifDate,
  hasAnyMetadata,
  jpegSegments,
  readMetadata,
  stripJpegMetadata,
  stripPngMetadata,
} from '../lib/tools/exif.js';
import { crc32 } from '../lib/tools/zip.js';

/* Builders for synthetic files --------------------------------------------------------------- */

type Entry = { tag: number; type: number; value: string | number[] | [number, number][] };

const enc = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const cat = (...parts: (Uint8Array | number[])[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
};

function entryBytes(e: Entry, le: boolean) {
  if (e.type === 2) return { count: (e.value as string).length + 1, data: cat(enc(e.value as string), [0]) };
  const vals = e.value as any[];
  const unit = e.type === 3 ? 2 : e.type === 4 ? 4 : 8;
  const data = new Uint8Array(vals.length * unit);
  const v = new DataView(data.buffer);
  vals.forEach((x, i) => {
    if (e.type === 3) v.setUint16(i * 2, x, le);
    else if (e.type === 4) v.setUint32(i * 4, x, le);
    else {
      v.setUint32(i * 8, x[0], le);
      v.setUint32(i * 8 + 4, x[1], le);
    }
  });
  return { count: vals.length, data };
}

/** A TIFF block with IFD0 and optional Exif and GPS sub-IFDs, in either byte order. */
function tiff(le: boolean, ifd0: Entry[], exif: Entry[] = [], gps: Entry[] = []) {
  const buf = new Uint8Array(8192);
  const view = new DataView(buf.buffer);
  buf.set(enc(le ? 'II' : 'MM'));
  view.setUint16(2, 42, le);
  view.setUint32(4, 8, le);
  const blockSize = (entries: Entry[]) =>
    6 + entries.length * 12 + entries.reduce((n, e) => { const d = entryBytes(e, le).data.length; return n + (d > 4 ? d + (d % 2) : 0); }, 0);
  const root: Entry[] = [...ifd0];
  if (exif.length) root.push({ tag: 0x8769, type: 4, value: [0] });
  if (gps.length) root.push({ tag: 0x8825, type: 4, value: [0] });
  const exifAt = 8 + blockSize(root);
  const gpsAt = exifAt + (exif.length ? blockSize(exif) : 0);
  for (const e of root) {
    if (e.tag === 0x8769) e.value = [exifAt];
    if (e.tag === 0x8825) e.value = [gpsAt];
  }
  let end = 0;
  const write = (at: number, entries: Entry[]) => {
    entries = [...entries].sort((a, b) => a.tag - b.tag);
    view.setUint16(at, entries.length, le);
    let data = at + 2 + entries.length * 12 + 4;
    entries.forEach((e, i) => {
      const o = at + 2 + i * 12;
      const { count, data: d } = entryBytes(e, le);
      view.setUint16(o, e.tag, le);
      view.setUint16(o + 2, e.type, le);
      view.setUint32(o + 4, count, le);
      if (d.length <= 4) buf.set(d, o + 8);
      else {
        view.setUint32(o + 8, data, le);
        buf.set(d, data);
        data += d.length + (d.length % 2);
      }
    });
    end = Math.max(end, data);
  };
  write(8, root);
  if (exif.length) write(exifAt, exif);
  if (gps.length) write(gpsAt, gps);
  return buf.slice(0, end);
}

const seg = (marker: number, payload: Uint8Array | number[]) => {
  const len = payload.length + 2;
  return cat([0xff, marker, len >> 8, len & 0xff], payload);
};

const camera = (le: boolean, orientation = 1) =>
  tiff(
    le,
    [
      { tag: 0x010f, type: 2, value: 'Apple' },
      { tag: 0x0110, type: 2, value: 'iPhone 15 Pro' },
      { tag: 0x0112, type: 3, value: [orientation] },
      { tag: 0x0131, type: 2, value: '17.4.1' },
      { tag: 0x0132, type: 2, value: '2024:05:07 09:00:00' },
    ],
    [
      { tag: 0x9003, type: 2, value: '2024:05:06 14:03:22' },
      { tag: 0xa434, type: 2, value: 'iPhone 15 Pro back camera' },
    ],
    [
      { tag: 0x0001, type: 2, value: 'N' },
      { tag: 0x0002, type: 5, value: [[35, 1], [40, 1], [5316, 100]] },
      { tag: 0x0003, type: 2, value: 'E' },
      { tag: 0x0004, type: 5, value: [[139, 1], [46, 1], [120, 10]] },
    ],
  );

const APP0 = seg(0xe0, cat(enc('JFIF\0'), [1, 1, 0, 0, 1, 0, 1, 0, 0]));
const ICC = seg(0xe2, cat(enc('ICC_PROFILE\0'), [1, 1], enc('fake profile')));
const MPF = seg(0xe2, cat(enc('MPF\0'), [1, 2, 3, 4]));
const XMP = seg(0xe1, cat(enc('http://ns.adobe.com/xap/1.0/\0'), enc('<x:xmpmeta>gps</x:xmpmeta>')));
const IPTC = seg(0xed, cat(enc('Photoshop 3.0\0'), enc('8BIM'), [0x04, 0x04, 0, 0], [0, 0, 0, 4], enc('abcd')));
const COM = seg(0xfe, enc('shot by someone'));
const DQT = seg(0xdb, [0, ...new Array(64).fill(1)]);
const SOF = seg(0xc2, [8, 0, 16, 0, 16, 1, 1, 0x11, 0]);
const DHT = seg(0xc4, [0, ...new Array(16).fill(0)]);
// Scan headers plus entropy-coded data with a stuffed 0xFF00, a restart marker and fill bytes.
const SCAN1 = cat(seg(0xda, [1, 1, 0, 0, 63, 0]), [0x12, 0xff, 0x00, 0x34, 0xff, 0xd0, 0x56, 0xd9, 0x00]);
const SCAN2 = cat(seg(0xda, [1, 1, 0, 1, 63, 0]), [0xab, 0xff, 0x00, 0xcd, 0xff, 0xff]);
const EOI = [0xff, 0xd9];

function jpeg(exif: Uint8Array) {
  return cat([0xff, 0xd8], APP0, seg(0xe1, cat(enc('Exif\0\0'), exif)), XMP, ICC, MPF, IPTC, COM, DQT, SOF, DHT, SCAN1, DHT, SCAN2, EOI, enc('TRAILER-with-more-exif'));
}

/* Tests ------------------------------------------------------------------------------------- */

test('reads camera, date, software and GPS from a little-endian JPEG', () => {
  const m = readMetadata(jpeg(camera(true)));
  assert.equal(m.format, 'jpeg');
  assert.equal(m.make, 'Apple');
  assert.equal(m.model, 'iPhone 15 Pro');
  assert.equal(m.software, '17.4.1');
  assert.equal(m.dateTime, '2024:05:06 14:03:22', 'DateTimeOriginal wins over DateTime');
  assert.equal(m.lens, 'iPhone 15 Pro back camera');
  assert.equal(m.orientation, 1);
  assert.ok(m.gps);
  assert.equal(m.gps!.lat.toFixed(3), '35.681');
  assert.equal(m.gps!.lon.toFixed(3), '139.770');
  assert.equal(m.hasXmp, true);
  assert.equal(m.hasIptc, true);
  assert.equal(m.hasComment, true);
  assert.equal(hasAnyMetadata(m), true);
});

test('big-endian TIFF, southern and western coordinates, orientation', () => {
  const t = tiff(
    false,
    [{ tag: 0x010f, type: 2, value: 'Canon' }, { tag: 0x0110, type: 2, value: 'Canon EOS R5' }, { tag: 0x0112, type: 3, value: [6] }],
    [],
    [
      { tag: 0x0001, type: 2, value: 'S' },
      { tag: 0x0002, type: 5, value: [[33, 1], [52, 1], [0, 1]] },
      { tag: 0x0003, type: 2, value: 'W' },
      { tag: 0x0004, type: 5, value: [[70, 1], [30, 1], [0, 1]] },
    ],
  );
  const m = readMetadata(cat([0xff, 0xd8], seg(0xe1, cat(enc('Exif\0\0'), t)), DQT, SCAN1, EOI));
  assert.equal(m.orientation, 6);
  assert.equal(m.model, 'Canon EOS R5');
  assert.equal(m.gps!.lat.toFixed(3), '-33.867');
  assert.equal(m.gps!.lon.toFixed(3), '-70.500');
  assert.equal(m.hasXmp, false);
  assert.equal(m.hasIptc, false);
});

test('a photo without metadata reports nothing, and 0,0 without refs is not a location', () => {
  const t = tiff(true, [{ tag: 0x0131, type: 2, value: 'Editor' }], [], [
    { tag: 0x0002, type: 5, value: [[0, 1], [0, 1], [0, 1]] },
    { tag: 0x0004, type: 5, value: [[0, 1], [0, 1], [0, 1]] },
  ]);
  assert.equal(readMetadata(cat([0xff, 0xd8], seg(0xe1, cat(enc('Exif\0\0'), t)), SCAN1, EOI)).gps, null);
  const bare = readMetadata(cat([0xff, 0xd8], APP0, DQT, SCAN1, EOI));
  assert.equal(hasAnyMetadata(bare), false);
  assert.equal(bare.gps, null);
  // A Photoshop block without an IPTC record is not reported as IPTC.
  const ps = seg(0xed, cat(enc('Photoshop 3.0\0'), enc('8BIM'), [0x03, 0xed, 0, 0], [0, 0, 0, 2], [1, 2]));
  assert.equal(readMetadata(cat([0xff, 0xd8], ps, SCAN1, EOI)).hasIptc, false);
});

test('JPEG strip is lossless: keeps JFIF, ICC, tables and scans byte for byte, drops the rest', () => {
  const src = jpeg(camera(true));
  const out = stripJpegMetadata(src);
  assert.deepEqual(out, cat([0xff, 0xd8], APP0, ICC, DQT, SOF, DHT, SCAN1, DHT, SCAN2, EOI));
  const m = readMetadata(out);
  assert.equal(hasAnyMetadata(m), false);
  assert.equal(m.gps, null);
  const markers = jpegSegments(out).segments.map((s: any) => s.marker);
  assert.deepEqual(markers, [0xe0, 0xe2, 0xdb, 0xc2, 0xc4, 0xda, 0xc4, 0xda, 0xd9]);
  assert.deepEqual(stripJpegMetadata(out), out, 'stripping twice changes nothing');
});

test('PNG: reads eXIf and text chunks, strips them with chunk CRCs intact', () => {
  const chunk = (type: string, data: Uint8Array | number[]) => {
    const body = cat(enc(type), data);
    const len = new Uint8Array(4);
    new DataView(len.buffer).setUint32(0, data.length);
    const crc = new Uint8Array(4);
    new DataView(crc.buffer).setUint32(0, crc32(body));
    return cat(len, body, crc);
  };
  const IHDR = chunk('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0]);
  const IDAT = chunk('IDAT', [0x78, 0x9c, 0x63, 0, 0, 0, 0, 1]);
  const IEND = chunk('IEND', []);
  const iCCP = chunk('iCCP', cat(enc('icc\0'), [0, 1, 2]));
  const src = cat(
    enc('\x89PNG\r\n\x1a\n'),
    IHDR,
    iCCP,
    chunk('tEXt', enc('Author\0Someone')),
    chunk('eXIf', camera(false, 1)),
    chunk('iTXt', cat(enc('XML:com.adobe.xmp\0'), [0, 0, 0, 0], enc('<x/>'))),
    IDAT,
    chunk('tIME', [7, 232, 5, 6, 14, 3, 22]),
    IEND,
  );
  assert.equal(detectFormat(src), 'png');
  const m = readMetadata(src);
  assert.equal(m.model, 'iPhone 15 Pro');
  assert.equal(m.gps!.lat.toFixed(3), '35.681');
  assert.equal(m.hasXmp, true);
  assert.equal(m.hasText, true);
  const out = stripPngMetadata(src);
  assert.deepEqual(out, cat(enc('\x89PNG\r\n\x1a\n'), IHDR, iCCP, IDAT, IEND));
  assert.equal(hasAnyMetadata(readMetadata(out)), false);
});

test('WebP EXIF chunk is read; unknown formats come back empty', () => {
  const exif = camera(true);
  const body = cat(enc('WEBP'), enc('VP8X'), [10, 0, 0, 0], new Array(10).fill(0), enc('EXIF'), [exif.length & 0xff, exif.length >> 8, 0, 0], exif, exif.length % 2 ? [0] : []);
  const size = body.length;
  const webp = cat(enc('RIFF'), [size & 0xff, (size >> 8) & 0xff, 0, 0], body);
  const m = readMetadata(webp);
  assert.equal(m.format, 'webp');
  assert.equal(m.make, 'Apple');
  assert.ok(m.gps);
  const heic = cat([0, 0, 0, 24], enc('ftypheic'), new Array(12).fill(0));
  assert.equal(readMetadata(heic).format, 'heif');
  assert.equal(readMetadata(enc('hello world!')).format, null);
});

test('EXIF dates format for people', () => {
  assert.equal(formatExifDate('2024:05:06 14:03:22'), '2024-05-06 14:03');
  assert.equal(formatExifDate('sometime'), 'sometime');
  assert.equal(formatExifDate(null), null);
});
