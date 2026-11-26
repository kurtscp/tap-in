/**
 * Tap In — Pure-JS QR Code & PNG Generator (Google Apps Script V8 compatible)
 *
 * Generates a plain black-on-white QR code PNG Blob containing ONLY the
 * supplied text (AttendeeID). Zero external/third-party QR services, no DOM,
 * and no logo overlay.
 *
 * Byte-mode QR encoder supporting Versions 1-10 (Error Correction Level M)
 * with GF(256) Reed-Solomon error correction, mask evaluation, and a pure-JS
 * uncompressed-zlib PNG encoder.
 */

const QR_PAD_COLOR = 255;
const QR_DARK_COLOR = 0;

/**
 * Creates a PNG Blob of a QR code encoding the given text.
 *
 * @param {string} text - Payload to encode (AttendeeID only).
 * @param {string=} filename - Output filename (defaults to "qr.png").
 * @param {number=} scale - Pixels per QR module (defaults to 8).
 * @param {number=} quietZone - Quiet zone modules around QR (defaults to 4).
 * @return {GoogleAppsScript.Base.Blob} PNG image blob.
 */
function createQrPngBlob(text, filename, scale, quietZone) {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("QR payload must be a non-empty string.");
  }
  const moduleScale = scale || 8;
  const margin = quietZone !== undefined ? quietZone : 4;
  const matrix = encodeQrMatrix_(text);
  const pngBytes = renderMatrixToPngBytes_(matrix, moduleScale, margin);
  return Utilities.newBlob(pngBytes, "image/png", filename || "qr.png");
}

// ---------------------------------------------------------------------------
// QR Matrix Encoder (Versions 1-10, Error Correction Level M, Byte Mode)
// ---------------------------------------------------------------------------

// [version, totalCodewords, ecCodewordsPerBlock, numBlocksGroup1, dataCwGroup1, numBlocksGroup2, dataCwGroup2]
// Error Correction Level M
const QR_VERSION_TABLE_M_ = [
  null,
  [1, 26, 10, 1, 16, 0, 0],
  [2, 44, 16, 1, 28, 0, 0],
  [3, 70, 26, 1, 44, 0, 0],
  [4, 100, 18, 2, 32, 0, 0],
  [5, 134, 24, 2, 43, 0, 0],
  [6, 172, 16, 4, 27, 0, 0],
  [7, 196, 18, 4, 31, 0, 0],
  [8, 242, 22, 2, 38, 2, 39],
  [9, 292, 22, 3, 36, 2, 37],
  [10, 346, 26, 4, 43, 1, 44]
];

const QR_ALIGNMENT_POSITIONS_ = [
  null,
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50]
];

function encodeQrMatrix_(text) {
  const utf8Bytes = toUtf8Bytes_(text);
  const version = selectQrVersion_(utf8Bytes.length);
  const spec = QR_VERSION_TABLE_M_[version];
  const totalDataCodewords = spec[3] * spec[4] + spec[5] * spec[6];

  // Build data bit stream: Mode (0100 = Byte), Char count (8 bits for v1-9, 16 bits for v10+), Data
  const bits = [];
  pushBits_(bits, 0b0100, 4);
  pushBits_(bits, utf8Bytes.length, version >= 10 ? 16 : 8);
  for (let i = 0; i < utf8Bytes.length; i++) {
    pushBits_(bits, utf8Bytes[i], 8);
  }

  const maxBits = totalDataCodewords * 8;
  // Terminator (up to 4 zero bits)
  const terminatorLen = Math.min(4, maxBits - bits.length);
  pushBits_(bits, 0, terminatorLen);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }
  // Pad codewords 0xEC, 0x11
  let padToggle = 0;
  while (bits.length < maxBits) {
    pushBits_(bits, padToggle === 0 ? 0xEC : 0x11, 8);
    padToggle ^= 1;
  }

  const dataCodewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | bits[i + b];
    }
    dataCodewords.push(byte);
  }

  // Split into blocks and compute Reed-Solomon EC codewords
  const ecLen = spec[2];
  const blocks = [];
  let offset = 0;
  for (let i = 0; i < spec[3]; i++) {
    const slice = dataCodewords.slice(offset, offset + spec[4]);
    offset += spec[4];
    blocks.push({ data: slice, ec: rsComputeEc_(slice, ecLen) });
  }
  for (let i = 0; i < spec[5]; i++) {
    const slice = dataCodewords.slice(offset, offset + spec[6]);
    offset += spec[6];
    blocks.push({ data: slice, ec: rsComputeEc_(slice, ecLen) });
  }

  // Interleave data and EC codewords
  const finalCodewords = [];
  const maxDataLen = Math.max(spec[4], spec[6]);
  for (let i = 0; i < maxDataLen; i++) {
    for (let b = 0; b < blocks.length; b++) {
      if (i < blocks[b].data.length) {
        finalCodewords.push(blocks[b].data[i]);
      }
    }
  }
  for (let i = 0; i < ecLen; i++) {
    for (let b = 0; b < blocks.length; b++) {
      finalCodewords.push(blocks[b].ec[i]);
    }
  }

  // Convert codewords to bit stream
  const finalBits = [];
  for (let i = 0; i < finalCodewords.length; i++) {
    pushBits_(finalBits, finalCodewords[i], 8);
  }

  // Build matrix and evaluate masks 0..7
  const size = version * 4 + 17;
  const base = createFunctionPatternMatrix_(version, size);
  placeDataBits_(base.matrix, base.isFunction, finalBits, size);

  let bestMatrix = null;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const candidate = cloneMatrix_(base.matrix);
    applyMask_(candidate, base.isFunction, mask, size);
    drawFormatInfo_(candidate, mask, size);
    if (version >= 7) {
      drawVersionInfo_(candidate, version, size);
    }
    const penalty = computePenalty_(candidate, size);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMatrix = candidate;
    }
  }

  return bestMatrix;
}

function selectQrVersion_(byteLen) {
  for (let v = 1; v < QR_VERSION_TABLE_M_.length; v++) {
    const spec = QR_VERSION_TABLE_M_[v];
    const dataCw = spec[3] * spec[4] + spec[5] * spec[6];
    const headerBits = 4 + (v >= 10 ? 16 : 8);
    if (headerBits + byteLen * 8 <= dataCw * 8) {
      return v;
    }
  }
  throw new Error("QR payload too long (max ~213 bytes for versions 1-10).");
}

function toUtf8Bytes_(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
    } else {
      bytes.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
    }
  }
  return bytes;
}

function pushBits_(arr, value, count) {
  for (let i = count - 1; i >= 0; i--) {
    arr.push((value >> i) & 1);
  }
}

// ---------------------------------------------------------------------------
// GF(256) Reed-Solomon (primitive polynomial 0x11D)
// ---------------------------------------------------------------------------

const GF_EXP_ = new Array(512);
const GF_LOG_ = new Array(256);
(function initGaloisField_() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP_[i] = x;
    GF_LOG_[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11D;
    }
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP_[i] = GF_EXP_[i - 255];
  }
})();

function gfMul_(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP_[GF_LOG_[a] + GF_LOG_[b]];
}

function rsGeneratorPoly_(ecLen) {
  let poly = [1];
  for (let i = 0; i < ecLen; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const root = GF_EXP_[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul_(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

function rsComputeEc_(data, ecLen) {
  const gen = rsGeneratorPoly_(ecLen);
  const res = new Array(ecLen).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    res.shift();
    res.push(0);
    if (factor !== 0) {
      for (let j = 0; j < ecLen; j++) {
        res[j] ^= gfMul_(gen[j + 1], factor);
      }
    }
  }
  return res;
}

// ---------------------------------------------------------------------------
// QR Matrix Layout, Masking & Format/Version Info
// ---------------------------------------------------------------------------

function createFunctionPatternMatrix_(version, size) {
  const matrix = Array.from({ length: size }, () => new Array(size).fill(0));
  const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));

  function setFn(r, c, val) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val ? 1 : 0;
      isFunction[r][c] = true;
    }
  }

  function drawFinder(top, left) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const inBox = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const isDark = inBox && (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        );
        setFn(top + r, left + c, isDark);
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const dark = i % 2 === 0;
    setFn(6, i, dark);
    setFn(i, 6, dark);
  }

  // Alignment patterns
  const alignPos = QR_ALIGNMENT_POSITIONS_[version];
  for (let i = 0; i < alignPos.length; i++) {
    for (let j = 0; j < alignPos.length; j++) {
      const rCenter = alignPos[i];
      const cCenter = alignPos[j];
      if (isFunction[rCenter][cCenter]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isDark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setFn(rCenter + dr, cCenter + dc, isDark);
        }
      }
    }
  }

  // Reserve format info & dark module
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      setFn(8, i, false);
      setFn(i, 8, false);
    }
  }
  for (let i = size - 8; i < size; i++) {
    setFn(8, i, false);
    setFn(i, 8, false);
  }
  setFn(size - 8, 8, true); // Dark module

  // Reserve version info for v7+
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        setFn(i, size - 11 + j, false);
        setFn(size - 11 + j, i, false);
      }
    }
  }

  return { matrix: matrix, isFunction: isFunction };
}

function placeDataBits_(matrix, isFunction, bits, size) {
  let bitIdx = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // Skip vertical timing column
    for (let step = 0; step < size; step++) {
      const r = upward ? size - 1 - step : step;
      for (let dx = 0; dx < 2; dx++) {
        const c = right - dx;
        if (!isFunction[r][c]) {
          matrix[r][c] = bitIdx < bits.length ? bits[bitIdx++] : 0;
        }
      }
    }
    upward = !upward;
  }
}

function cloneMatrix_(matrix) {
  return matrix.map((row) => row.slice());
}

function applyMask_(matrix, isFunction, mask, size) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFunction[r][c]) continue;
      let invert = false;
      switch (mask) {
        case 0: invert = (r + c) % 2 === 0; break;
        case 1: invert = r % 2 === 0; break;
        case 2: invert = c % 3 === 0; break;
        case 3: invert = (r + c) % 3 === 0; break;
        case 4: invert = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
        case 5: invert = ((r * c) % 2) + ((r * c) % 3) === 0; break;
        case 6: invert = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; break;
        case 7: invert = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0; break;
      }
      if (invert) {
        matrix[r][c] ^= 1;
      }
    }
  }
}

function drawFormatInfo_(matrix, mask, size) {
  // Error correction M = 00
  const data = (0b00 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ (((rem >> 9) & 1) * 0x537);
  }
  const bits = ((data << 10) | rem) ^ 0x5412;

  for (let i = 0; i <= 5; i++) matrix[8][i] = (bits >> i) & 1;
  matrix[8][7] = (bits >> 6) & 1;
  matrix[8][8] = (bits >> 7) & 1;
  matrix[7][8] = (bits >> 8) & 1;
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = (bits >> i) & 1;

  for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = (bits >> i) & 1;
  for (let i = 8; i < 15; i++) matrix[8][size - 15 + i] = (bits >> i) & 1;
}

function drawVersionInfo_(matrix, version, size) {
  let rem = version;
  for (let i = 0; i < 12; i++) {
    rem = (rem << 1) ^ (((rem >> 11) & 1) * 0x1F25);
  }
  const bits = (version << 12) | rem;
  for (let i = 0; i < 18; i++) {
    const val = (bits >> i) & 1;
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    matrix[b][a] = val;
    matrix[a][b] = val;
  }
}

function computePenalty_(matrix, size) {
  let penalty = 0;

  // Rule 1: 5+ consecutive same-color modules in row/col
  for (let r = 0; r < size; r++) {
    let runColor = matrix[r][0];
    let runLen = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        runColor = matrix[r][c];
        runLen = 1;
      }
    }
    if (runLen >= 5) penalty += 3 + (runLen - 5);
  }
  for (let c = 0; c < size; c++) {
    let runColor = matrix[0][c];
    let runLen = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === runColor) {
        runLen++;
      } else {
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        runColor = matrix[r][c];
        runLen = 1;
      }
    }
    if (runLen >= 5) penalty += 3 + (runLen - 5);
  }

  // Rule 2: 2x2 blocks of same color
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = matrix[r][c];
      if (v === matrix[r][c + 1] && v === matrix[r + 1][c] && v === matrix[r + 1][c + 1]) {
        penalty += 3;
      }
    }
  }

  // Rule 3: finder-like pattern 1:1:3:1:1
  function hasFinderPattern(line) {
    let count = 0;
    for (let i = 0; i <= line.length - 11; i++) {
      if (
        (line[i] === 1 && line[i + 1] === 0 && line[i + 2] === 1 && line[i + 3] === 1 && line[i + 4] === 1 &&
         line[i + 5] === 0 && line[i + 6] === 1 && line[i + 7] === 0 && line[i + 8] === 0 && line[i + 9] === 0 && line[i + 10] === 0) ||
        (line[i] === 0 && line[i + 1] === 0 && line[i + 2] === 0 && line[i + 3] === 0 && line[i + 4] === 1 &&
         line[i + 5] === 0 && line[i + 6] === 1 && line[i + 7] === 1 && line[i + 8] === 1 && line[i + 9] === 0 && line[i + 10] === 1)
      ) {
        count++;
      }
    }
    return count;
  }
  for (let r = 0; r < size; r++) {
    penalty += 40 * hasFinderPattern(matrix[r]);
  }
  for (let c = 0; c < size; c++) {
    const col = [];
    for (let r = 0; r < size; r++) col.push(matrix[r][c]);
    penalty += 40 * hasFinderPattern(col);
  }

  // Rule 4: dark module ratio
  let darkCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      darkCount += matrix[r][c];
    }
  }
  const total = size * size;
  const k = Math.floor(Math.abs(darkCount * 20 - total * 10) / total);
  penalty += k * 10;

  return penalty;
}

// ---------------------------------------------------------------------------
// Pure-JS PNG Encoder (8-bit Grayscale, zlib stored blocks)
// ---------------------------------------------------------------------------

const PNG_CRC_TABLE_ = (function () {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function pngCrc32_(bytes) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) {
    crc = PNG_CRC_TABLE_[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngAdler32_(bytes) {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function pushUint32BE_(arr, val) {
  arr.push((val >>> 24) & 0xFF, (val >>> 16) & 0xFF, (val >>> 8) & 0xFF, val & 0xFF);
}

function makePngChunk_(typeStr, dataBytes) {
  const chunk = [];
  pushUint32BE_(chunk, dataBytes.length);
  const typeAndData = [];
  for (let i = 0; i < 4; i++) {
    typeAndData.push(typeStr.charCodeAt(i));
  }
  for (let i = 0; i < dataBytes.length; i++) {
    typeAndData.push(dataBytes[i]);
  }
  for (let i = 0; i < typeAndData.length; i++) {
    chunk.push(typeAndData[i]);
  }
  pushUint32BE_(chunk, pngCrc32_(typeAndData));
  return chunk;
}

function renderMatrixToPngBytes_(matrix, scale, margin) {
  const modCount = matrix.length;
  const imgSize = (modCount + margin * 2) * scale;

  // Raw scanlines: 1 filter byte (0) + imgSize grayscale bytes per row
  const raw = [];
  for (let py = 0; py < imgSize; py++) {
    raw.push(0); // Filter type 0 (None)
    const mr = Math.floor(py / scale) - margin;
    for (let px = 0; px < imgSize; px++) {
      const mc = Math.floor(px / scale) - margin;
      const isDark = mr >= 0 && mr < modCount && mc >= 0 && mc < modCount && matrix[mr][mc] === 1;
      raw.push(isDark ? QR_DARK_COLOR : QR_PAD_COLOR);
    }
  }

  // Wrap raw scanlines in zlib stored blocks (max 65535 bytes per block)
  const zlib = [0x78, 0x01]; // CMF=0x78 (deflate 32K), FLG=0x01 (no dict, fastest)
  const maxBlock = 65535;
  for (let offset = 0; offset < raw.length; offset += maxBlock) {
    const end = Math.min(offset + maxBlock, raw.length);
    const len = end - offset;
    const isFinal = end === raw.length ? 1 : 0;
    zlib.push(isFinal);
    zlib.push(len & 0xFF, (len >>> 8) & 0xFF);
    const nlen = (~len) & 0xFFFF;
    zlib.push(nlen & 0xFF, (nlen >>> 8) & 0xFF);
    for (let i = offset; i < end; i++) {
      zlib.push(raw[i]);
    }
  }
  pushUint32BE_(zlib, pngAdler32_(raw));

  // Assemble PNG signature + IHDR + IDAT + IEND
  const png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

  const ihdr = [];
  pushUint32BE_(ihdr, imgSize);
  pushUint32BE_(ihdr, imgSize);
  ihdr.push(8); // Bit depth: 8
  ihdr.push(0); // Color type: 0 (Grayscale)
  ihdr.push(0); // Compression: 0
  ihdr.push(0); // Filter: 0
  ihdr.push(0); // Interlace: 0

  const ihdrChunk = makePngChunk_("IHDR", ihdr);
  const idatChunk = makePngChunk_("IDAT", zlib);
  const iendChunk = makePngChunk_("IEND", []);

  for (let i = 0; i < ihdrChunk.length; i++) png.push(ihdrChunk[i]);
  for (let i = 0; i < idatChunk.length; i++) png.push(idatChunk[i]);
  for (let i = 0; i < iendChunk.length; i++) png.push(iendChunk[i]);

  return png;
}
