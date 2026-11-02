/**
 * Video metadata scrubber for MP4 / MOV (ISO base media) and WebM / Matroska. Pure functions,
 * no DOM, no ffmpeg: nothing is re-encoded and the file keeps its exact length, so every
 * sample offset inside it stays valid and a 1 GB video can be cleaned by rewriting a few KB.
 *
 * Everything works on *regions*: a plan step finds the byte ranges that can carry metadata
 * (`moov`, top-level `meta`/`udta`/`uuid` boxes; Matroska `Info`, `Tags`, `Attachments`), and a
 * scrub step rewrites each region in place:
 *
 *   MP4/MOV  `udta`, `meta` and `uuid` boxes (anywhere in `moov`, inside each `trak`, or at the
 *            top level) are renamed to `free` and zero-filled. That covers Android's `©xyz` GPS
 *            string, iPhone's `com.apple.quicktime.location.ISO6709`, make/model/software,
 *            Adobe XMP, and anything else a camera app wrote. Creation and modification times in
 *            `mvhd`, `tkhd` and `mdhd` are set to 0 (the "unknown" value every player accepts).
 *   WebM     `Tags` and `Attachments` become `Void` elements; inside `Info`, `Title`, `DateUTC`,
 *            `MuxingApp` and `WritingApp` become `Void`. Track data, cues and the timecode scale
 *            are untouched.
 *
 * The reader is `read(start, length) -> Promise<Uint8Array>` so the server can use ranged GETs.
 */

const ascii = (b, i, n) => {
  let s = '';
  for (let k = i; k < i + n && k < b.length; k++) s += String.fromCharCode(b[k]);
  return s;
};
const u32 = (b, i) => ((b[i] << 24) >>> 0) + ((b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]);
const u64 = (b, i) => u32(b, i) * 4294967296 + u32(b, i + 4);
const FREE = [0x66, 0x72, 0x65, 0x65]; // 'free'

/** Byte patterns that mean a location was present. Checked before the bytes are zeroed. */
const GPS_MARKERS = ['\xa9xyz', 'loci', 'ISO6709', 'GPSLatitude', 'GPSLongitude', 'location'];
function containsAny(bytes, needles) {
  const text = ascii(bytes, 0, bytes.length);
  return needles.some((n) => text.includes(n));
}

export function detectVideoFormat(bytes) {
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') return 'mp4';
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'matroska';
  return null;
}

export const videoFormatForMime = (mime) =>
  mime === 'video/mp4' || mime === 'video/quicktime' ? 'mp4' : mime === 'video/webm' || mime === 'video/x-matroska' ? 'matroska' : null;

/* ------------------------------------------------------------------ MP4 / MOV */

const MP4_SCRUB = new Set(['moov', 'meta', 'udta', 'uuid']);
const MP4_RECURSE = new Set(['moov', 'trak', 'mdia']);

/** Parses one box header at `b[i]`. Returns { type, size, header } with size 0 meaning "to end of file". */
function boxHeader(b, i) {
  if (i + 8 > b.length) return null;
  let size = u32(b, i);
  const type = ascii(b, i + 4, 4);
  let header = 8;
  if (size === 1) {
    if (i + 16 > b.length) return null;
    size = u64(b, i + 8);
    header = 16;
  }
  return { type, size, header };
}

/**
 * Finds the top-level regions of an MP4/MOV that can hold metadata. Stops after `maxBoxes`
 * headers (fragmented files have thousands of `moof`/`mdat` pairs); `moov` is always near one
 * end, so a capped walk still finds it.
 */
export async function planMp4(size, read, { maxBoxes = 200, maxRegionBytes = 64 * 1024 * 1024 } = {}) {
  const regions = [];
  let o = 0;
  let boxes = 0;
  let truncated = false;
  while (o + 8 <= size) {
    if (++boxes > maxBoxes) { truncated = true; break; }
    const hdr = boxHeader(await read(o, Math.min(16, size - o)), 0);
    if (!hdr) break;
    const len = hdr.size === 0 ? size - o : hdr.size;
    if (len < hdr.header || o + len > size) return { ok: false, reason: 'malformed', regions: [] };
    if (MP4_SCRUB.has(hdr.type)) {
      if (len > maxRegionBytes) return { ok: false, reason: 'region-too-large', regions: [] };
      regions.push({ start: o, end: o + len, type: hdr.type });
    }
    o += len;
  }
  return { ok: true, regions, truncated };
}

function blankBox(b, i, len, header) {
  for (let k = 0; k < 4; k++) b[i + 4 + k] = FREE[k];
  b.fill(0, i + header, i + len);
}

/** Zeroes creation/modification time in a FullBox header (mvhd, tkhd, mdhd). Returns true if any was non-zero. */
function zeroTimes(b, i, header, len) {
  const version = b[i + header];
  const at = i + header + 4;
  const width = version === 1 ? 8 : 4;
  if (at + width * 2 > i + len) return false;
  let had = false;
  for (let k = 0; k < width * 2; k++) {
    if (b[at + k]) had = true;
    b[at + k] = 0;
  }
  return had;
}

function scrubMp4Children(b, start, end, state) {
  let i = start;
  while (i + 8 <= end) {
    const hdr = boxHeader(b, i);
    if (!hdr) break;
    const len = hdr.size === 0 ? end - i : hdr.size;
    if (len < hdr.header || i + len > end) break;
    if (MP4_SCRUB.has(hdr.type) && hdr.type !== 'moov') {
      if (containsAny(b.subarray(i, i + len), GPS_MARKERS)) state.hadGps = true;
      state.hadAny = true;
      blankBox(b, i, len, hdr.header);
    } else if (hdr.type === 'mvhd' || hdr.type === 'tkhd' || hdr.type === 'mdhd') {
      if (zeroTimes(b, i, hdr.header, len)) state.hadAny = true;
    } else if (MP4_RECURSE.has(hdr.type)) {
      scrubMp4Children(b, i + hdr.header, i + len, state);
    }
    i += len;
  }
}

/** Rewrites one top-level region in place. `bytes` is the whole box; returns { bytes, changed, hadGps, hadAny }. */
export function scrubMp4Region(bytes) {
  const b = new Uint8Array(bytes);
  const hdr = boxHeader(b, 0);
  if (!hdr) return { bytes: b, changed: false, hadGps: false, hadAny: false };
  const state = { hadGps: false, hadAny: false };
  if (hdr.type === 'moov') scrubMp4Children(b, hdr.header, b.length, state);
  else {
    if (containsAny(b, GPS_MARKERS)) state.hadGps = true;
    state.hadAny = true;
    blankBox(b, 0, b.length, hdr.header);
  }
  const changed = b.some((v, k) => v !== bytes[k]);
  return { bytes: b, changed, hadGps: state.hadGps, hadAny: state.hadAny };
}

/* ------------------------------------------------------------------ WebM / Matroska */

const ID_EBML = 0x1a45dfa3;
const ID_SEGMENT = 0x18538067;
const ID_SEEKHEAD = 0x114d9b74;
const ID_SEEK = 0x4dbb;
const ID_SEEKID = 0x53ab;
const ID_SEEKPOS = 0x53ac;
const ID_INFO = 0x1549a966;
const ID_CLUSTER = 0x1f43b675;
const ID_TAGS = 0x1254c367;
const ID_ATTACHMENTS = 0x1941a469;
const ID_VOID = 0xec;
const MKV_SCRUB = new Set([ID_INFO, ID_TAGS, ID_ATTACHMENTS]);
const INFO_SCRUB = new Set([0x7ba9 /* Title */, 0x4461 /* DateUTC */, 0x4d80 /* MuxingApp */, 0x5741 /* WritingApp */]);

/** Reads an EBML element ID (kept with its marker bits) at b[i]. */
function ebmlId(b, i) {
  if (i >= b.length) return null;
  const first = b[i];
  const len = first >= 0x80 ? 1 : first >= 0x40 ? 2 : first >= 0x20 ? 3 : first >= 0x10 ? 4 : 0;
  if (!len || i + len > b.length) return null;
  let v = 0;
  for (let k = 0; k < len; k++) v = v * 256 + b[i + k];
  return { id: v, len };
}

/** Reads an EBML size vint at b[i]. `unknown` is true for the all-ones "unknown size". */
function ebmlSize(b, i) {
  if (i >= b.length) return null;
  const first = b[i];
  let len = 1;
  let mask = 0x80;
  while (len <= 8 && !(first & mask)) { len++; mask >>= 1; }
  if (len > 8 || i + len > b.length) return null;
  let v = first & (mask - 1);
  let allOnes = v === mask - 1;
  for (let k = 1; k < len; k++) {
    v = v * 256 + b[i + k];
    if (b[i + k] !== 0xff) allOnes = false;
  }
  return { size: v, len, unknown: allOnes };
}

function ebmlElement(b, i) {
  const id = ebmlId(b, i);
  if (!id) return null;
  const sz = ebmlSize(b, i + id.len);
  if (!sz) return null;
  return { id: id.id, header: id.len + sz.len, size: sz.size, unknown: sz.unknown };
}

function ebmlUint(b, i, n) {
  let v = 0;
  for (let k = 0; k < n; k++) v = v * 256 + b[i + k];
  return v;
}

/**
 * Finds the Info, Tags and Attachments elements of a WebM/Matroska file from the first
 * `headBytes` plus the SeekHead's pointers (Tags usually sit at the very end, after the clusters).
 */
export async function planMatroska(size, read, { headBytes = 256 * 1024, maxRegionBytes = 64 * 1024 * 1024 } = {}) {
  const head = await read(0, Math.min(headBytes, size));
  const ebml = ebmlElement(head, 0);
  if (!ebml || ebml.id !== ID_EBML) return { ok: false, reason: 'malformed', regions: [] };
  let o = ebml.header + ebml.size;
  const seg = ebmlElement(head, o);
  if (!seg || seg.id !== ID_SEGMENT) return { ok: false, reason: 'malformed', regions: [] };
  const segStart = o + seg.header;
  const segEnd = seg.unknown ? size : Math.min(size, segStart + seg.size);
  const found = new Map();
  const pointers = [];
  o = segStart;
  while (o + 2 <= head.length) {
    const el = ebmlElement(head, o);
    if (!el) break;
    if (el.id === ID_CLUSTER) break;
    const end = el.unknown ? segEnd : o + el.header + el.size;
    if (MKV_SCRUB.has(el.id) && !el.unknown) found.set(o, { start: o, end, type: el.id });
    if (el.id === ID_SEEKHEAD && !el.unknown && end <= head.length) {
      let p = o + el.header;
      while (p < end) {
        const s = ebmlElement(head, p);
        if (!s) break;
        if (s.id === ID_SEEK) {
          let q = p + s.header;
          let sid = 0;
          let pos = -1;
          const sEnd = p + s.header + s.size;
          while (q < sEnd) {
            const f = ebmlElement(head, q);
            if (!f) break;
            if (f.id === ID_SEEKID) sid = ebmlUint(head, q + f.header, f.size);
            if (f.id === ID_SEEKPOS) pos = ebmlUint(head, q + f.header, f.size);
            q += f.header + f.size;
          }
          if (MKV_SCRUB.has(sid) && pos >= 0) pointers.push(segStart + pos);
        }
        p += s.header + s.size;
      }
    }
    if (el.unknown) break;
    o = end;
  }
  for (const at of pointers) {
    if (found.has(at) || at + 12 > size) continue;
    const el = ebmlElement(await read(at, Math.min(12, size - at)), 0);
    if (!el || !MKV_SCRUB.has(el.id) || el.unknown) continue;
    const end = at + el.header + el.size;
    if (end <= size) found.set(at, { start: at, end, type: el.id });
  }
  const regions = [...found.values()].sort((a, b) => a.start - b.start);
  if (regions.some((r) => r.end - r.start > maxRegionBytes)) return { ok: false, reason: 'region-too-large', regions: [] };
  return { ok: true, regions };
}

/** Overwrites `total` bytes at b[i] with one Void element of exactly that length. */
function writeVoid(b, i, total) {
  if (total < 2) { b.fill(0, i, i + total); return; }
  let sizeLen = 1;
  while (sizeLen < 8 && total - 1 - sizeLen >= 2 ** (7 * sizeLen) - 1) sizeLen++;
  const payload = total - 1 - sizeLen;
  b[i] = ID_VOID;
  let v = payload;
  for (let k = sizeLen - 1; k >= 0; k--) { b[i + 1 + k] = v & 0xff; v = Math.floor(v / 256); }
  b[i + 1] |= 0x80 >> (sizeLen - 1);
  b.fill(0, i + 1 + sizeLen, i + total);
}

/** Rewrites one Matroska region (Info, Tags or Attachments) in place. */
export function scrubMatroskaRegion(bytes) {
  const b = new Uint8Array(bytes);
  const el = ebmlElement(b, 0);
  if (!el) return { bytes: b, changed: false, hadGps: false, hadAny: false };
  const state = { hadGps: false, hadAny: false };
  if (el.id === ID_INFO) {
    let i = el.header;
    const end = Math.min(b.length, el.header + el.size);
    while (i < end) {
      const c = ebmlElement(b, i);
      if (!c) break;
      const len = c.header + c.size;
      if (i + len > end) break;
      if (INFO_SCRUB.has(c.id)) { state.hadAny = true; writeVoid(b, i, len); }
      i += len;
    }
  } else {
    state.hadAny = true;
    if (containsAny(b, ['GPS', 'LOCATION', 'ISO6709', 'location'])) state.hadGps = true;
    writeVoid(b, 0, b.length);
  }
  const changed = b.some((v, k) => v !== bytes[k]);
  return { bytes: b, changed, hadGps: state.hadGps, hadAny: state.hadAny };
}

/* ------------------------------------------------------------------ shared */

export const planVideo = (format, size, read, opts) => (format === 'mp4' ? planMp4(size, read, opts) : planMatroska(size, read, opts));
export const scrubVideoRegion = (format, bytes) => (format === 'mp4' ? scrubMp4Region(bytes) : scrubMatroskaRegion(bytes));

/**
 * Turns patched regions into an ordered list of output parts for a multipart "compose":
 * `{ copy: [start, end] }` for untouched ranges of the original object and `{ range: [start, end] }`
 * for ranges that must be re-uploaded with `patches` applied. Every part but the last is at
 * least `minPart` bytes (S3's 5 MB rule), so small patched regions absorb their neighbours.
 */
export function composeParts(size, patches, minPart = 5 * 1024 * 1024) {
  const sorted = [...patches].sort((a, b) => a.start - b.start);
  const parts = [];
  let o = 0;
  for (const p of sorted) {
    if (p.start > o) parts.push({ copy: [o, p.start] });
    parts.push({ range: [p.start, p.end] });
    o = p.end;
  }
  if (o < size) parts.push({ copy: [o, size] });
  const span = (p) => p.copy || p.range;
  const len = (p) => span(p)[1] - span(p)[0];
  const merged = [];
  for (const part of parts) {
    const prev = merged[merged.length - 1];
    if (!prev || len(prev) >= minPart) { merged.push(part); continue; }
    const a = span(prev)[0];
    if (prev.range && part.copy && len(part) > minPart - len(prev)) {
      // Take only what the small upload needs from the copy; the rest stays a server-side copy.
      const cut = a + minPart;
      merged[merged.length - 1] = { range: [a, cut] };
      merged.push({ copy: [cut, part.copy[1]] });
    } else {
      merged[merged.length - 1] = prev.copy && part.copy ? { copy: [a, span(part)[1]] } : { range: [a, span(part)[1]] };
    }
  }
  return merged;
}
