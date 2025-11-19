const fs = require("fs");
const { PNG } = require("pngjs");
const path = require("path");

// ----------------- Configuration -----------------
const inputFile = "./assets/logo.png"; // your original logo
const outputFile = "./assets/logoBase64.ts"; // output TS file
const targetWidth = 384;

// ----------------- Load PNG -----------------
const data = fs.readFileSync(inputFile);
const png = PNG.sync.read(data);

// ----------------- Resize if needed -----------------
// Simple nearest-neighbor resize for width only
const scale = targetWidth / png.width;
const targetHeight = Math.floor(png.height * scale);
const resizedData = Buffer.alloc(targetWidth * targetHeight * 4);

for (let y = 0; y < targetHeight; y++) {
  const srcY = Math.floor(y / scale);
  for (let x = 0; x < targetWidth; x++) {
    const srcX = Math.floor(x / scale);
    const srcIdx = (srcY * png.width + srcX) * 4;
    const dstIdx = (y * targetWidth + x) * 4;
    resizedData[dstIdx] = png.data[srcIdx];
    resizedData[dstIdx + 1] = png.data[srcIdx + 1];
    resizedData[dstIdx + 2] = png.data[srcIdx + 2];
    resizedData[dstIdx + 3] = png.data[srcIdx + 3];
  }
}

// ----------------- Convert to 1-bit monochrome -----------------
const rowBytes = Math.ceil(targetWidth / 8);
const monoBuffer = Buffer.alloc(rowBytes * targetHeight);

for (let y = 0; y < targetHeight; y++) {
  for (let x = 0; x < targetWidth; x++) {
    const idx = (y * targetWidth + x) * 4;
    const r = resizedData[idx];
    const g = resizedData[idx + 1];
    const b = resizedData[idx + 2];
    const alpha = resizedData[idx + 3] / 255;

    const grayscale = alpha === 0 ? 255 : 0.299 * r + 0.587 * g + 0.114 * b;
    if (grayscale < 128) {
      const byteIndex = y * rowBytes + (x >> 3);
      monoBuffer[byteIndex] |= 0x80 >> (x % 8);
    }
  }
}

// ----------------- Encode as Base64 -----------------
const base64 = monoBuffer.toString("base64");

// ----------------- Save as TS -----------------
const tsContent = `export const logoBase64 = "${base64}";\n`;
fs.writeFileSync(outputFile, tsContent);

console.log("✅ Logo Base64 saved to", outputFile);
