import { colorMatrix, cropRect, FRAMES } from './presets.js';

export function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This photo could not be opened. Please retake it.'));
    image.src = src;
  });
}
export function captureVideo(video) {
  if (!video || video.readyState < 2 || !video.videoWidth || video.paused) {
    throw new Error('The camera is not ready. Wait for the live preview, then try again.');
  }
  const crop = cropRect(video.videoWidth, video.videoHeight);
  const width = Math.min(1600, Math.floor(crop.width / 4) * 4);
  if (width < 4) throw new Error('The camera returned an empty frame. Please try again.');
  const canvas = makeCanvas(width, width * 3 / 4);
  canvas.getContext('2d').drawImage(video, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', .96);
}
export async function processPhoto(src, filter, adjust) {
  const image = await loadImage(src);
  const canvas = makeCanvas(image.naturalWidth, image.naturalHeight);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = pixels.data, m = colorMatrix(filter, adjust);
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    d[i] = m[0] * r + m[1] * g + m[2] * b + m[4] * 255;
    d[i + 1] = m[5] * r + m[6] * g + m[7] * b + m[9] * 255;
    d[i + 2] = m[10] * r + m[11] * g + m[12] * b + m[14] * 255;
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}
function fitText(ctx, text, x, y, width, size, weight = '400') {
  const clean = text.replace(/\s+/g, ' ').trim();
  ctx.font = `${weight} ${size}px Arial, sans-serif`;
  while (ctx.measureText(clean).width > width && size > 12) {
    size -= 1;
    ctx.font = `${weight} ${size}px Arial, sans-serif`;
  }
  ctx.fillText(clean, x, y, width);
}
export function composeStrip(processed, style, timestamp) {
  const count = Math.max(1, processed.length);
  const cols = style.layout === 'grid' ? Math.min(2, count) : style.layout === 'wide' ? count : 1;
  const rows = Math.ceil(count / cols);
  const photoWidth = style.layout === 'wide' ? 720 : 1000;
  const photoHeight = photoWidth * .75, pad = 60, gap = 24, header = 165, footer = 250;
  const width = pad * 2 + cols * photoWidth + (cols - 1) * gap;
  const height = header + rows * photoHeight + (rows - 1) * gap + footer;
  const canvas = makeCanvas(width, height), ctx = canvas.getContext('2d');
  const frame = FRAMES.find(f => f.id === style.frame) || FRAMES[0];
  if (frame.colors.length > 1) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    frame.colors.forEach((color, i) => gradient.addColorStop(i / (frame.colors.length - 1), color));
    ctx.fillStyle = gradient;
  } else ctx.fillStyle = frame.colors[0];
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = frame.ink;
  ctx.textAlign = 'center';
  fitText(ctx, `★ ${style.header || 'SNAPBOOTH'} ★`, width / 2, 77, width - pad * 2, 39, '700');
  fitText(ctx, 'K-STYLE SELF PHOTO STUDIO', width / 2, 116, width - pad * 2, 19);
  processed.forEach((photo, i) => {
    const x = pad + (i % cols) * (photoWidth + gap), y = header + Math.floor(i / cols) * (photoHeight + gap);
    ctx.drawImage(photo, x, y, photoWidth, photoHeight);
  });
  let y = height - footer + 54;
  if (style.sticker) {
    ctx.font = '38px Arial, "Segoe UI Emoji", sans-serif';
    ctx.fillText(style.sticker, width / 2, y);
  }
  y += 45;
  fitText(ctx, style.text, width / 2, y, width - pad * 2, 29, '500');
  y += 41;
  if (style.showLocation) fitText(ctx, style.location, width / 2, y, width - pad * 2, 23);
  y += 34;
  const date = timestamp ? new Date(timestamp) : new Date();
  const stamp = [style.showDate && date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), style.showTime && date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })].filter(Boolean).join(' • ');
  fitText(ctx, stamp, width / 2, y, width - pad * 2, 21);
  if (style.showBrand) fitText(ctx, `SNAPBOOTH • ${date.getFullYear()}`, width / 2, height - 25, width - pad * 2, 17, '700');
  return canvas;
}
export function canvasBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not generate the PNG. Please try again.')), 'image/png'));
}
export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name;
  document.body.append(anchor); anchor.click(); anchor.remove();
  // Browsers need time to consume the URL after a download starts.
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export async function shareBlob(blob, name) {
  const file = new File([blob], name, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'My SnapBooth photostrip' }); return 'shared'; }
    catch (error) { if (error.name === 'AbortError') return 'cancelled'; }
  }
  downloadBlob(blob, name);
  return 'downloaded';
}
