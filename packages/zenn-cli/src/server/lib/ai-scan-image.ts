function isAnimatedPng(bytes: Uint8Array) {
  const view = Buffer.from(bytes);
  let offset = 8;
  while (offset + 8 <= view.length) {
    const length = view.readUInt32BE(offset);
    const type = view.toString('ascii', offset + 4, offset + 8);
    if (type === 'acTL') return true;
    if (type === 'IDAT' || type === 'IEND') return false;
    offset += 12 + length;
  }
  return false;
}

function isAnimatedWebp(bytes: Uint8Array) {
  const view = Buffer.from(bytes);
  let offset = 12;
  while (offset + 8 <= view.length) {
    const type = view.toString('ascii', offset, offset + 4);
    const length = view.readUInt32LE(offset + 4);
    if (type === 'ANIM' || type === 'ANMF') return true;
    // VP8Xのフラグのbit 1はアニメーションを表す
    if (type === 'VP8X' && offset + 8 < view.length) {
      if ((view[offset + 8] & 0x02) !== 0) return true;
    }
    offset += 8 + length + (length % 2);
  }
  return false;
}

function skipGifSubBlocks(bytes: Uint8Array, offset: number) {
  while (offset < bytes.length && bytes[offset] !== 0) {
    offset += bytes[offset] + 1;
  }
  return offset + 1;
}

// 解析できないGIFは全フレームを確認できないため、アニメーションとして扱う
function isAnimatedGif(bytes: Uint8Array) {
  if (bytes.length < 13) return true;
  let offset = 13;
  if ((bytes[10] & 0x80) !== 0) offset += 3 * 2 ** ((bytes[10] & 0x07) + 1);
  let frames = 0;
  while (offset < bytes.length) {
    const block = bytes[offset];
    if (block === 0x3b) return frames > 1;
    if (block === 0x21) {
      offset = skipGifSubBlocks(bytes, offset + 2);
    } else if (block === 0x2c) {
      frames += 1;
      if (frames > 1) return true;
      if (offset + 10 > bytes.length) return true;
      const flags = bytes[offset + 9];
      offset += 10;
      if ((flags & 0x80) !== 0) offset += 3 * 2 ** ((flags & 0x07) + 1);
      offset = skipGifSubBlocks(bytes, offset + 1);
    } else {
      return true;
    }
  }
  return true;
}

export function isAnimatedImage(bytes: Uint8Array, contentType: string) {
  if (contentType === 'image/gif') return isAnimatedGif(bytes);
  if (contentType === 'image/png') return isAnimatedPng(bytes);
  if (contentType === 'image/webp') return isAnimatedWebp(bytes);
  return false;
}
