const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Simple pure-Node.js RGBA PNG encoder
function createPng(width, height, getPixelRgba) {
  const rowBytes = width * 4 + 1; // 1 filter byte (0) per row
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type 0: None

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression: 0 (Deflate)
  ihdr[11] = 0; // Filter: 0
  ihdr[12] = 0; // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
      byte >>>= 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcData = chunk.subarray(4, 8 + len);
  const crcVal = crc32(crcData);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

// Generate AssetCare icon pixel shader
function getAssetCarePixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Rounded rectangle radius
  const cornerR = w * 0.22;
  const boxW = w * 0.44;
  const boxH = h * 0.44;

  const inBoxX = Math.abs(dx) <= boxW;
  const inBoxY = Math.abs(dy) <= boxH;
  const inCorner = Math.abs(dx) > boxW - cornerR && Math.abs(dy) > boxH - cornerR;

  let inIconBg = false;
  if (inBoxX && inBoxY) {
    if (inCorner) {
      const cdx = Math.abs(dx) - (boxW - cornerR);
      const cdy = Math.abs(dy) - (boxH - cornerR);
      if (Math.sqrt(cdx * cdx + cdy * cdy) <= cornerR) {
        inIconBg = true;
      }
    } else {
      inIconBg = true;
    }
  }

  if (!inIconBg) {
    return [0, 0, 0, 0]; // Transparent outside rounded squircle
  }

  // Base background gradient: #1d4ed8 (Blue-700) to #0f172a (Slate-900)
  const gradT = (y / h) * 0.8 + (x / w) * 0.2;
  let r = Math.round(29 * (1 - gradT) + 15 * gradT);
  let g = Math.round(78 * (1 - gradT) + 23 * gradT);
  let b = Math.round(216 * (1 - gradT) + 42 * gradT);
  let a = 255;

  // Inner Brand Graphic: Shield & Stylized 'A' + QR Pattern
  // Top left & top right QR locator markers
  const qrScale = w / 192;
  const qx = dx / qrScale;
  const qy = dy / qrScale;

  // Center Shield/Diamond Shape
  if (Math.abs(qx) + Math.abs(qy) < 32 && Math.abs(qx) + Math.abs(qy) > 20) {
    // Cyan glow ring
    r = 56; g = 189; b = 248; // Sky-400
  } else if (Math.abs(qx) < 14 && Math.abs(qy) < 14) {
    // Emerald green core
    r = 16; g = 185; b = 129; // Emerald-500
  } else if (
    (Math.abs(qx + 36) < 12 && Math.abs(qy + 36) < 12) ||
    (Math.abs(qx - 36) < 12 && Math.abs(qy + 36) < 12) ||
    (Math.abs(qx + 36) < 12 && Math.abs(qy - 36) < 12)
  ) {
    // QR outer corner markers (White)
    if (
      Math.abs(qx + 36) > 8 || Math.abs(qy + 36) > 8 ||
      Math.abs(qx - 36) > 8 || Math.abs(qy + 36) > 8 ||
      Math.abs(qx + 36) > 8 || Math.abs(qy - 36) > 8
    ) {
      r = 255; g = 255; b = 255;
    } else if (
      Math.abs(qx + 36) < 5 && Math.abs(qy + 36) < 5 ||
      Math.abs(qx - 36) < 5 && Math.abs(qy + 36) < 5 ||
      Math.abs(qx + 36) < 5 && Math.abs(qy - 36) < 5
    ) {
      r = 59; g = 130; b = 246; // Inner blue dot
    }
  }

  return [r, g, b, a];
}

const publicDir = path.join(__dirname, 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// 1. Generate 192x192 icon
const icon192 = createPng(192, 192, getAssetCarePixel);
fs.writeFileSync(path.join(iconsDir, 'assetcare-192.png'), icon192);
fs.writeFileSync(path.join(publicDir, 'assetcare-192.png'), icon192);
console.log('✅ Generated assetcare-192.png (192x192)');

// 2. Generate 512x512 icon
const icon512 = createPng(512, 512, getAssetCarePixel);
fs.writeFileSync(path.join(iconsDir, 'assetcare-512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'assetcare-512.png'), icon512);
console.log('✅ Generated assetcare-512.png (512x512)');

// 3. Generate favicon.svg
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#1d4ed8"/>
  <path d="M256 64 L416 128 L416 256 C416 352 256 448 256 448 C256 448 96 352 96 256 L96 128 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="16"/>
  <rect x="192" y="192" width="128" height="128" rx="24" fill="#10b981"/>
  <path d="M256 160 L256 352 M160 256 L352 256" stroke="#ffffff" stroke-width="20" stroke-linecap="round"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon);
console.log('✅ Generated favicon.svg');
