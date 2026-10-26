/**
 * Photo metadata reader and stripper for the EXIF / location remover. Pure functions on
 * Uint8Arrays, no DOM.
 *
 *  - readMetadata(bytes): JPEG (APP1 Exif → TIFF: IFD0, Exif IFD, GPS IFD; XMP; APP13 IPTC),
 *    PNG (eXIf, text chunks) and WebP (EXIF, XMP chunks).
 *  - stripJpegMetadata(bytes): drops Exif/XMP (APP1), IPTC/Photoshop (APP13), comments and other
 *    vendor APPn segments, keeps JFIF (APP0), the ICC colour profile (APP2), Adobe (APP14), and
 *    copies the compressed image data byte for byte. Anything after the end-of-image marker
 *    (multi-picture extras such as gain maps or motion-photo video) is dropped too.
 *  - stripPngMetadata(bytes): drops eXIf, tEXt, iTXt, zTXt and tIME chunks.
 */

const ascii = (bytes, start, len) => {
  let s = '';
  for (let i = start; i < start + len && i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
};
const u16be = (b, i) => (b[i] << 8) | b[i + 1];
const u32be = (b, i) => ((b[i] << 24) >>> 0) + ((b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]);

export function detectFormat(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length >= 8 && ascii(bytes, 0, 8) === '\x89PNG\r\n\x1a\n') return 'png';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp' && /^(hei|hev|mif|msf|avi)/.test(ascii(bytes, 8, 4))) return 'heif';
  return null;
}

/**
 * @typedef {{
 *   format: string | null, orientation: number, make: string | null, model: string | null, lens: string | null,
 *   serial: string | null, artist: string | null, copyright: string | null, dateTime: string | null,
 *   software: string | null, gps: { lat: number, lon: number } | null, hasExif: boolean, hasXmp: boolean,
 *   hasIptc: boolean, hasComment: boolean, hasText: boolean
 * }} PhotoMetadata
 */

/**
 * An empty result: what a photo with no metadata reports.
 * @param {string | null} [format]
 * @returns {PhotoMetadata}
 */
export function emptyMetadata(format = null) {
  return {
    format,
    orientation: 1,
    make: null,
    model: null,
    lens: null,
    serial: null,
    artist: null,
    copyright: null,
    dateTime: null,
    software: null,
    gps: null,
    hasExif: false,
    hasXmp: false,
    hasIptc: false,
    hasComment: false,
    hasText: false,
  };
}

/* TIFF / EXIF --------------------------------------------------------------------------------- */

const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };

/**
 * Reads the tags we care about from a TIFF block (the payload of an Exif segment or a PNG eXIf
 * chunk) that occupies bytes[start, end). Never throws on damaged data: unreadable tags are skipped.
 */
export function parseTiff(bytes, start = 0, end = bytes.length) {
  const out = emptyMetadata();
  if (end - start < 8) return out;
  const order = ascii(bytes, start, 2);
  if (order !== 'II' && order !== 'MM') return out;
  const le = order === 'II';
  const view = new DataView(bytes.buffer, bytes.byteOffset + start, end - start);
  const size = end - start;
  const U16 = (o) => view.getUint16(o, le);
  const U32 = (o) => view.getUint32(o, le);
  if (U16(2) !== 42) return out;
  out.hasExif = true;

  /** Values of one IFD entry at offset `e`: numbers, rationals as numbers, ASCII as a string. */
  function value(e) {
    const type = U16(e + 2);
    const count = U32(e + 4);
    const unit = TYPE_SIZE[type];
    if (!unit || count > 100000) return null;
    const total = unit * count;
    const at = total <= 4 ? e + 8 : U32(e + 8);
    if (at + total > size) return null;
    if (type === 2) {
      let s = '';
      for (let i = 0; i < count; i++) {
        const c = view.getUint8(at + i);
        if (c === 0) break;
        s += String.fromCharCode(c);
      }
      // EXIF ASCII is nominally 7-bit, but cameras and apps write UTF-8; decode it when valid.
      try {
        s = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(s, (ch) => ch.charCodeAt(0)));
      } catch {
        /* keep the Latin-1 reading */
      }
      return s.trim() || null;
    }
    const vals = [];
    for (let i = 0; i < Math.min(count, 64); i++) {
      const o = at + i * unit;
      if (type === 3) vals.push(U16(o));
      else if (type === 4) vals.push(U32(o));
      else if (type === 9) vals.push(view.getInt32(o, le));
      else if (type === 5) vals.push(U32(o + 4) ? U32(o) / U32(o + 4) : NaN);
      else if (type === 10) vals.push(view.getInt32(o + 4, le) ? view.getInt32(o, le) / view.getInt32(o + 4, le) : NaN);
      else vals.push(view.getUint8(o));
    }
    return vals;
  }

  /** Reads one IFD into a Map(tag → value). */
  function ifd(offset, seen) {
    const tags = new Map();
    if (!offset || offset + 2 > size || seen.has(offset)) return tags;
    seen.add(offset);
    const n = U16(offset);
    for (let i = 0; i < n; i++) {
      const e = offset + 2 + i * 12;
      if (e + 12 > size) break;
      try {
        tags.set(U16(e), value(e));
      } catch {
        /* skip a damaged entry */
      }
    }
    return tags;
  }

  const seen = new Set();
  const ifd0 = ifd(U32(4), seen);
  const first = (v) => (Array.isArray(v) ? v[0] : null);
  const str = (v) => (typeof v === 'string' ? v : null);
  const exifPtr = first(ifd0.get(0x8769));
  const gpsPtr = first(ifd0.get(0x8825));
  const exif = exifPtr ? ifd(exifPtr, seen) : new Map();
  const gps = gpsPtr ? ifd(gpsPtr, seen) : new Map();

  const o = first(ifd0.get(0x0112));
  out.orientation = o >= 1 && o <= 8 ? o : 1;
  out.make = str(ifd0.get(0x010f));
  out.model = str(ifd0.get(0x0110));
  out.software = str(ifd0.get(0x0131));
  out.artist = str(ifd0.get(0x013b)) || str(exif.get(0xa430));
  out.copyright = str(ifd0.get(0x8298));
  out.dateTime = str(exif.get(0x9003)) || str(exif.get(0x9004)) || str(ifd0.get(0x0132));
  out.lens = str(exif.get(0xa434));
  out.serial = str(exif.get(0xa431));
  out.gps = gpsCoords(gps);
  return out;
}

const TIFF_FIELDS = ['orientation', 'make', 'model', 'lens', 'serial', 'artist', 'copyright', 'dateTime', 'software', 'gps', 'hasExif'];

/** Copies what parseTiff found into a file's result without touching the XMP/IPTC flags. */
function mergeTiff(out, tiff) {
  for (const k of TIFF_FIELDS) out[k] = tiff[k];
  return out;
}

/** Degrees/minutes/seconds + N/S/E/W → signed decimal degrees. */
function dms(v, ref) {
  if (!Array.isArray(v) || !v.length || v.some((n) => !Number.isFinite(n))) return null;
  const deg = (v[0] || 0) + (v[1] || 0) / 60 + (v[2] || 0) / 3600;
  return ref === 'S' || ref === 'W' ? -deg : deg;
}

function gpsCoords(gps) {
  const lat = dms(gps.get(0x0002), gps.get(0x0001));
  const lon = dms(gps.get(0x0004), gps.get(0x0003));
  if (lat === null || lon === null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  // 0,0 with no reference letters is what some apps write when location was off.
  if (lat === 0 && lon === 0 && !gps.get(0x0001)) return null;
  return { lat, lon };
}

/** '2024:05:06 14:03:22' → '2024-05-06 14:03'. Returns the input unchanged when it isn't EXIF-shaped. */
export function formatExifDate(s) {
  if (!s) return null;
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/.exec(s);
  return m ? `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}` : s;
}

/* JPEG ---------------------------------------------------------------------------------------- */

/**
 * Walks a JPEG's segments. Each item: { marker, start, end } where [start, end) covers the
 * marker bytes, the length field and the payload; a scan (SOS) segment also covers its
 * entropy-coded data up to the next marker. Stops after EOI; `trailer` is where any data after
 * the image starts. Throws on a file that isn't a JPEG.
 */
export function jpegSegments(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('Not a JPEG');
  const n = bytes.length;
  const segments = [];
  let pos = 2;
  while (pos < n) {
    if (bytes[pos] !== 0xff) throw new Error('Damaged JPEG');
    while (pos + 1 < n && bytes[pos + 1] === 0xff) pos++; // fill bytes
    if (pos + 1 >= n) break;
    const marker = bytes[pos + 1];
    if (marker === 0xd9) {
      segments.push({ marker, start: pos, end: pos + 2 });
      return { segments, trailer: pos + 2 };
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      segments.push({ marker, start: pos, end: pos + 2 });
      pos += 2;
      continue;
    }
    if (pos + 4 > n) throw new Error('Damaged JPEG');
    let end = pos + 2 + u16be(bytes, pos + 2);
    if (end > n) throw new Error('Damaged JPEG');
    if (marker === 0xda) {
      // Entropy-coded data runs until a marker other than a stuffed 0xFF00 or a restart marker.
      let i = end;
      while (i < n) {
        if (bytes[i] === 0xff && i + 1 < n) {
          const b = bytes[i + 1];
          if (b === 0x00 || (b >= 0xd0 && b <= 0xd7)) {
            i += 2;
            continue;
          }
          if (b !== 0xff) break;
        }
        i++;
      }
      end = Math.min(i, n);
    }
    segments.push({ marker, start: pos, end });
    pos = end;
  }
  return { segments, trailer: n };
}

const isExif = (b, s) => b[s.start + 1] === 0xe1 && ascii(b, s.start + 4, 6) === 'Exif\0\0';
const isXmp = (b, s) => b[s.start + 1] === 0xe1 && ascii(b, s.start + 4, 28).startsWith('http://ns.adobe.com/xap/1.0/');
const isIcc = (b, s) => b[s.start + 1] === 0xe2 && ascii(b, s.start + 4, 12) === 'ICC_PROFILE\0';

/** Does a Photoshop APP13 block hold an IPTC record (8BIM resource 0x0404)? */
function photoshopHasIptc(bytes, start, end) {
  if (ascii(bytes, start, 14) !== 'Photoshop 3.0\0') return false;
  let i = start + 14;
  while (i + 12 <= end && ascii(bytes, i, 4) === '8BIM') {
    const id = u16be(bytes, i + 4);
    if (id === 0x0404) return true;
    const nameLen = bytes[i + 6];
    let j = i + 7 + nameLen;
    if ((nameLen + 1) % 2) j++; // the Pascal name is padded to an even length
    const len = u32be(bytes, j);
    i = j + 4 + len + (len % 2);
  }
  return false;
}

export function readJpegMetadata(bytes) {
  const out = emptyMetadata('jpeg');
  const { segments } = jpegSegments(bytes);
  for (const s of segments) {
    if (isExif(bytes, s) && !out.hasExif) mergeTiff(out, parseTiff(bytes, s.start + 10, s.end));
    else if (isXmp(bytes, s) || (s.marker === 0xe1 && ascii(bytes, s.start + 4, 34).startsWith('http://ns.adobe.com/xmp/extension/'))) out.hasXmp = true;
    else if (s.marker === 0xed && photoshopHasIptc(bytes, s.start + 4, s.end)) out.hasIptc = true;
    else if (s.marker === 0xfe) out.hasComment = true;
  }
  return out;
}

/** Which segments the lossless strip keeps: everything that isn't metadata. */
function keepJpegSegment(bytes, s) {
  const m = s.marker;
  if (m === 0xfe) return false; // COM
  if (m === 0xe0 || m === 0xee) return true; // JFIF, Adobe (colour transform: needed to decode)
  if (m === 0xe2) return isIcc(bytes, s); // keep the colour profile, drop MPF and FlashPix
  if (m >= 0xe1 && m <= 0xef) return false; // Exif, XMP, IPTC/Photoshop and vendor blocks
  return true;
}

/** Lossless metadata removal: the compressed image data is copied byte for byte. */
export function stripJpegMetadata(bytes) {
  const { segments } = jpegSegments(bytes);
  const kept = segments.filter((s) => keepJpegSegment(bytes, s));
  const out = new Uint8Array(2 + kept.reduce((n, s) => n + s.end - s.start, 0));
  out[0] = 0xff;
  out[1] = 0xd8;
  let at = 2;
  for (const s of kept) {
    out.set(bytes.subarray(s.start, s.end), at);
    at += s.end - s.start;
  }
  return out;
}

/* PNG ----------------------------------------------------------------------------------------- */

export function pngChunks(bytes) {
  if (detectFormat(bytes) !== 'png') throw new Error('Not a PNG');
  const chunks = [];
  let pos = 8;
  while (pos + 12 <= bytes.length) {
    const len = u32be(bytes, pos);
    const type = ascii(bytes, pos + 4, 4);
    const end = pos + 12 + len;
    if (end > bytes.length) throw new Error('Damaged PNG');
    chunks.push({ type, start: pos, dataStart: pos + 8, end });
    pos = end;
    if (type === 'IEND') break;
  }
  return chunks;
}

const PNG_METADATA = new Set(['eXIf', 'tEXt', 'iTXt', 'zTXt', 'tIME']);

export function readPngMetadata(bytes) {
  const out = emptyMetadata('png');
  for (const c of pngChunks(bytes)) {
    if (c.type === 'eXIf' && !out.hasExif) {
      // Some writers keep the JPEG-style "Exif\0\0" prefix inside the chunk.
      const skip = ascii(bytes, c.dataStart, 6) === 'Exif\0\0' ? 6 : 0;
      mergeTiff(out, parseTiff(bytes, c.dataStart + skip, c.end - 4));
    } else if (c.type === 'iTXt' && ascii(bytes, c.dataStart, 18) === 'XML:com.adobe.xmp\0') out.hasXmp = true;
    else if (c.type === 'tEXt' || c.type === 'iTXt' || c.type === 'zTXt' || c.type === 'tIME') out.hasText = true;
  }
  return out;
}

/** Lossless: whole chunks are copied (with their CRCs), metadata chunks are left out. */
export function stripPngMetadata(bytes) {
  const kept = pngChunks(bytes).filter((c) => !PNG_METADATA.has(c.type));
  const out = new Uint8Array(8 + kept.reduce((n, c) => n + c.end - c.start, 0));
  out.set(bytes.subarray(0, 8));
  let at = 8;
  for (const c of kept) {
    out.set(bytes.subarray(c.start, c.end), at);
    at += c.end - c.start;
  }
  return out;
}

/* WebP (read only: the widget re-encodes WebP) ------------------------------------------------ */

export function readWebpMetadata(bytes) {
  const out = emptyMetadata('webp');
  let pos = 12;
  while (pos + 8 <= bytes.length) {
    const type = ascii(bytes, pos, 4);
    const len = bytes[pos + 4] | (bytes[pos + 5] << 8) | (bytes[pos + 6] << 16) | (bytes[pos + 7] << 24);
    const start = pos + 8;
    const end = Math.min(bytes.length, start + len);
    if (type === 'EXIF' && !out.hasExif) {
      const skip = ascii(bytes, start, 6) === 'Exif\0\0' ? 6 : 0;
      mergeTiff(out, parseTiff(bytes, start + skip, end));
    } else if (type === 'XMP ') out.hasXmp = true;
    pos = start + len + (len % 2);
  }
  return out;
}

/** Metadata of a JPEG, PNG or WebP file; other formats get an empty result with `format` set. */
export function readMetadata(bytes) {
  const format = detectFormat(bytes);
  if (format === 'jpeg') return readJpegMetadata(bytes);
  if (format === 'png') return readPngMetadata(bytes);
  if (format === 'webp') return readWebpMetadata(bytes);
  return emptyMetadata(format);
}

/** True when anything personal or identifying was found. */
export function hasAnyMetadata(m) {
  return !!(m.hasExif || m.hasXmp || m.hasIptc || m.hasComment || m.hasText);
}
