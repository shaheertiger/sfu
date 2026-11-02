import { test } from 'node:test';
import assert from 'node:assert/strict';
import { composeParts, detectVideoFormat, planMatroska, planMp4, scrubMatroskaRegion, scrubMp4Region, videoFormatForMime } from '../lib/tools/video-meta.js';

const str = (s: string) => [...s].map((c) => c.charCodeAt(0));
const be32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const box = (type: string, ...payload: number[][]) => {
  const body = payload.flat();
  return [...be32(8 + body.length), ...str(type), ...body];
};
const fullBoxTimes = (type: string, extra: number[]) => box(type, [0, 0, 0, 0], be32(3_700_000_000 >>> 0), be32(3_700_000_001 >>> 0), extra);
const memReader = (bytes: Uint8Array) => async (start: number, len: number) => bytes.slice(start, start + len);

/** ftyp + mdat + moov(mvhd, trak(tkhd, mdia(mdhd), udta(©xyz)), udta(©xyz), meta) + uuid(XMP) — a phone recording, moov at the end. */
function mp4Fixture() {
  const mdat = box('mdat', str('VIDEO-SAMPLES-STAY-EXACTLY-AS-THEY-ARE'));
  const xyz = box('\xa9xyz', [0, 18, 0x15, 0xc7], str('+40.7128-074.0060/'));
  const trak = box('trak', fullBoxTimes('tkhd', [1, 2, 3, 4]), box('mdia', fullBoxTimes('mdhd', [9, 9])), box('udta', xyz));
  const moov = box('moov', fullBoxTimes('mvhd', be32(1000)), trak, box('udta', xyz), box('meta', str('com.apple.quicktime.make Apple')));
  const uuid = box('uuid', str('BE7ACFCB97A942E89C71999491E3AFAC<x:xmpmeta>exif:GPSLatitude</x:xmpmeta>'));
  return new Uint8Array([...box('ftyp', str('isom'), be32(512), str('isomiso2mp41')), ...mdat, ...moov, ...uuid]);
}

test('MP4: udta/meta/uuid become zeroed free boxes, timestamps drop to 0, mdat and length are untouched', async () => {
  const bytes = mp4Fixture();
  assert.equal(detectVideoFormat(bytes), 'mp4');
  const plan = await planMp4(bytes.length, memReader(bytes));
  assert.equal(plan.ok, true);
  assert.deepEqual(plan.regions.map((r) => r.type), ['moov', 'uuid']);
  const out = new Uint8Array(bytes);
  let hadGps = false;
  for (const r of plan.regions) {
    const s = scrubMp4Region(bytes.slice(r.start, r.end));
    assert.equal(s.changed, true);
    assert.equal(s.bytes.length, r.end - r.start);
    hadGps = hadGps || s.hadGps;
    out.set(s.bytes, r.start);
  }
  assert.equal(hadGps, true);
  assert.equal(out.length, bytes.length);
  const text = Buffer.from(out).toString('latin1');
  assert.ok(text.includes('VIDEO-SAMPLES-STAY-EXACTLY-AS-THEY-ARE'));
  for (const gone of ['+40.7128', 'quicktime.make', 'GPSLatitude', 'udta', 'meta', 'uuid']) assert.ok(!text.includes(gone), `${gone} should be gone`);
  assert.equal((text.match(/free/g) || []).length, 4); // trak/udta, moov/udta, moov/meta, top-level uuid
  // mvhd creation/modification time are zero now; the timescale after them is intact.
  const mvhdAt = text.indexOf('mvhd') - 4;
  assert.deepEqual([...out.slice(mvhdAt + 12, mvhdAt + 20)], [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual([...out.slice(mvhdAt + 20, mvhdAt + 24)], be32(1000));
  // Box sizes are unchanged, so a second plan walks the same structure.
  const again = await planMp4(out.length, memReader(out));
  assert.equal(again.ok, true);
  assert.equal(again.regions.length, 1); // only moov is left to look at; the uuid is now free
  const clean = scrubMp4Region(out.slice(again.regions[0].start, again.regions[0].end));
  assert.equal(clean.changed, false);
});

test('MP4: a 64-bit mdat and a capped walk still find moov; malformed sizes are refused', async () => {
  const big = [...be32(1), ...str('mdat'), ...be32(0), ...be32(24), ...str('12345678')];
  const moov = box('moov', box('udta', str('x')));
  const bytes = new Uint8Array([...box('ftyp', str('isom')), ...big, ...moov]);
  const plan = await planMp4(bytes.length, memReader(bytes));
  assert.equal(plan.ok, true);
  assert.deepEqual(plan.regions, [{ start: 12 + 24, end: bytes.length, type: 'moov' }]);
  const bad = new Uint8Array([...box('ftyp', str('isom')), ...be32(9999), ...str('moov')]);
  assert.equal((await planMp4(bad.length, memReader(bad))).ok, false);
});

/* ---- Matroska helpers: elements are [id bytes][size vint][payload] */
const el = (id: number[], payload: number[]) => {
  const n = payload.length;
  const size = n < 0x7f ? [0x80 | n] : [0x40 | (n >> 8), n & 255];
  return [...id, ...size, ...payload];
};
const uint = (id: number[], v: number) => el(id, [v]);

function webmFixture() {
  const ebml = el([0x1a, 0x45, 0xdf, 0xa3], el([0x42, 0x82], str('webm')));
  const infoBody = [...el([0x2a, 0xd7, 0xb1], [0x0f, 0x42, 0x40]), ...el([0x7b, 0xa9], str('My Secret Title')), ...el([0x44, 0x61], [1, 2, 3, 4, 5, 6, 7, 8]), ...el([0x4d, 0x80], str('Lavf60')), ...el([0x44, 0x89], [0x45, 0x7a, 0x00, 0x00])];
  const info = el([0x15, 0x49, 0xa9, 0x66], infoBody);
  const cluster = el([0x1f, 0x43, 0xb6, 0x75], [...uint([0xe7], 0), ...el([0xa3], str('FRAME-DATA-UNCHANGED'))]);
  const tags = el([0x12, 0x54, 0xc3, 0x67], el([0x73, 0x73], [...el([0x63, 0xc0], []), ...el([0x67, 0xc8], [...el([0x45, 0xa3], str('LOCATION')), ...el([0x44, 0x87], str('Brooklyn'))])]));
  // SeekHead points at Tags (position relative to the Segment data start); built after we know the layout.
  const seekHeadLen = 4 + 1 + (1 + 1 + (2 + 1 + 4) + (2 + 1 + 2)) + 0; // computed below instead
  void seekHeadLen;
  const seekFor = (pos: number) => el([0x11, 0x4d, 0x9b, 0x74], el([0x4d, 0xbb], [...el([0x53, 0xab], [0x12, 0x54, 0xc3, 0x67]), ...el([0x53, 0xac], [(pos >> 8) & 255, pos & 255])]));
  const seekHeadSize = seekFor(0).length;
  const tagsPos = seekHeadSize + info.length + cluster.length;
  const seekHead = seekFor(tagsPos);
  const segmentBody = [...seekHead, ...info, ...cluster, ...tags];
  const segment = [0x18, 0x53, 0x80, 0x67, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, ...segmentBody]; // unknown size, like MediaRecorder
  return new Uint8Array([...ebml, ...segment]);
}

test('WebM: Tags found through SeekHead become Void, Info keeps its timecode scale but loses title/date/app', async () => {
  const bytes = webmFixture();
  assert.equal(detectVideoFormat(bytes), 'matroska');
  assert.equal(videoFormatForMime('video/webm'), 'matroska');
  // Only the first 60 bytes are "head" so Tags must come from the SeekHead pointer, not the linear scan.
  const plan = await planMatroska(bytes.length, memReader(bytes), { headBytes: 60 });
  assert.equal(plan.ok, true);
  assert.deepEqual(plan.regions.map((r) => r.type), [0x1549a966, 0x1254c367]);
  const out = new Uint8Array(bytes);
  let hadGps = false;
  for (const r of plan.regions) {
    const s = scrubMatroskaRegion(bytes.slice(r.start, r.end));
    assert.equal(s.changed, true);
    assert.equal(s.bytes.length, r.end - r.start);
    hadGps = hadGps || s.hadGps;
    out.set(s.bytes, r.start);
  }
  assert.equal(hadGps, true);
  const text = Buffer.from(out).toString('latin1');
  assert.ok(text.includes('FRAME-DATA-UNCHANGED'));
  for (const gone of ['My Secret Title', 'Lavf60', 'Brooklyn', 'LOCATION']) assert.ok(!text.includes(gone), `${gone} should be gone`);
  assert.ok(text.includes('\x2a\xd7\xb1\x83\x0f\x42\x40'), 'TimecodeScale intact');
  assert.ok(text.includes('\x44\x89\x84\x45\x7a\x00\x00'), 'Duration intact');
  // The Tags element is now one Void element of the same length.
  const tagsRegion = plan.regions[1];
  assert.equal(out[tagsRegion.start], 0xec);
  // Structure is intact: planning again finds the same Info element and nothing more to change.
  const again = await planMatroska(out.length, memReader(out), { headBytes: 60 });
  assert.equal(again.ok, true);
  assert.equal(scrubMatroskaRegion(out.slice(again.regions[0].start, again.regions[0].end)).changed, false);
});

test('composeParts keeps every part but the last at least minPart by absorbing neighbours', () => {
  const MB = 1024 * 1024;
  // moov at the end of a 100 MB file: copy the first 99 MB, upload the patched tail.
  assert.deepEqual(composeParts(100 * MB, [{ start: 99 * MB, end: 100 * MB }], 5 * MB), [{ copy: [0, 99 * MB] }, { range: [99 * MB, 100 * MB] }]);
  // faststart moov at 32..1 MB: the tiny patch swallows the ftyp before it and just enough after it to reach 5 MB.
  assert.deepEqual(composeParts(100 * MB, [{ start: 32, end: MB }], 5 * MB), [{ range: [0, 5 * MB] }, { copy: [5 * MB, 100 * MB] }]);
  // Two patches far apart: copy, upload, copy, upload (last may be small).
  const q = composeParts(100 * MB, [{ start: 10 * MB, end: 16 * MB }, { start: 99 * MB, end: 100 * MB }], 5 * MB);
  assert.deepEqual(q, [{ copy: [0, 10 * MB] }, { range: [10 * MB, 16 * MB] }, { copy: [16 * MB, 99 * MB] }, { range: [99 * MB, 100 * MB] }]);
});
