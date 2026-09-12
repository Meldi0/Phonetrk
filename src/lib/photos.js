import { colorMatrix, cropRect, STRIP_TEMPLATES } from './presets.js';
import { executeEffect } from './effects.js';

export function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
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
  const ctx = canvas.getContext('2d');
  // Capture clean original camera frame without destructive mirror or filters
  ctx.drawImage(video, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.96);
}

export async function processPhoto(src, filter = 'korean', adjust = null, effect = null, mirrorResult = false) {
  const image = await loadImage(src);
  const canvas = makeCanvas(image.naturalWidth, image.naturalHeight);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // 1. Mirror orientation if mirrorResult is enabled
  if (mirrorResult) {
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
  } else {
    ctx.drawImage(image, 0, 0);
  }

  // 2. Apply color matrix (Filter + Tone Adjustments)
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = pixels.data;
  const m = colorMatrix(filter, adjust);
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    d[i] = m[0] * r + m[1] * g + m[2] * b + m[4] * 255;
    d[i + 1] = m[5] * r + m[6] * g + m[7] * b + m[9] * 255;
    d[i + 2] = m[10] * r + m[11] * g + m[12] * b + m[14] * 255;
  }
  ctx.putImageData(pixels, 0, 0);

  // 3. Apply Creative Effect / Privacy Censor (if active)
  if (effect && effect.id && effect.id !== 'none') {
    executeEffect(ctx, canvas.width, canvas.height, effect.id, effect.intensity ?? 50, effect.privacyBox);
  }

  return canvas;
}

function fitText(ctx, text, x, y, maxWidth, initialSize, weight = '400', fontFamily = 'Arial, sans-serif') {
  if (!text) return;
  const clean = String(text).replace(/\s+/g, ' ').trim();
  let size = initialSize;
  ctx.font = `${weight} ${size}px ${fontFamily}`;
  while (ctx.measureText(clean).width > maxWidth && size > 10) {
    size -= 1;
    ctx.font = `${weight} ${size}px ${fontFamily}`;
  }
  ctx.fillText(clean, x, y, maxWidth);
}

export function composeStrip(processed, style, timestamp) {
  const count = Math.max(1, processed.length);
  const cols = style.layout === 'grid' ? Math.min(2, count) : style.layout === 'wide' ? count : 1;
  const rows = Math.ceil(count / cols);
  const photoWidth = style.layout === 'wide' ? 720 : 1000;
  const photoHeight = photoWidth * 0.75;
  const pad = 60, gap = 26, headerHeight = 165, footerHeight = 250;
  const width = pad * 2 + cols * photoWidth + (cols - 1) * gap;
  const height = headerHeight + rows * photoHeight + (rows - 1) * gap + footerHeight;

  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Find template definition
  const templateId = style.template || style.frame || 'lavender-minimal';
  const template = STRIP_TEMPLATES.find(t => t.id === templateId) || STRIP_TEMPLATES[0];

  // 1. Render Strip Background (solid or gradient)
  if (template.background.length > 1) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    template.background.forEach((color, i) => gradient.addColorStop(i / (template.background.length - 1), color));
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = template.background[0];
  }
  ctx.fillRect(0, 0, width, height);

  // Subtle paper grain or film margin accents
  if (template.category === 'Retro') {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let py = 0; py < height; py += 12) {
      ctx.fillRect(0, py, width, 1);
    }
    ctx.restore();
  }

  const fontFamily = template.font === 'serif' ? 'Georgia, "Times New Roman", serif' : 'DM Sans, Manrope, Arial, sans-serif';

  // 2. Render Photos with template-specific styling
  processed.forEach((photo, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * (photoWidth + gap);
    const y = headerHeight + row * (photoHeight + gap);

    ctx.save();
    // Photo Border & Framing
    if (template.border === 'white-thin') {
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(x - 4, y - 4, photoWidth + 8, photoHeight + 8);
      ctx.shadowColor = 'transparent';
    } else if (template.border === 'subtle') {
      ctx.strokeStyle = template.accentColor + '44';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, photoWidth + 4, photoHeight + 4);
    } else if (template.border === 'film' || template.border === 'photolab') {
      ctx.fillStyle = '#0F0E11';
      ctx.fillRect(x - 6, y - 6, photoWidth + 12, photoHeight + 12);

      // Sprocket holes on sides for vertical strips
      if (style.layout === 'vertical') {
        ctx.fillStyle = template.textColor + '33';
        const holeW = 14, holeH = 10;
        const holeLeft = pad - 30;
        const holeRight = width - pad + 16;
        for (let hy = y + 10; hy < y + photoHeight - 10; hy += 28) {
          ctx.fillRect(holeLeft, hy, holeW, holeH);
          ctx.fillRect(holeRight, hy, holeW, holeH);
        }
        // Small frame number
        ctx.font = '600 13px monospace';
        ctx.fillStyle = template.accentColor || '#D87A38';
        ctx.textAlign = 'left';
        ctx.fillText(`▶ ${String(i + 1).padStart(2, '0')}A`, pad, y - 10);
      }
    } else if (template.border === 'comic') {
      ctx.strokeStyle = '#151515';
      ctx.lineWidth = 6;
      ctx.strokeRect(x - 3, y - 3, photoWidth + 6, photoHeight + 6);
    } else if (template.border === 'silver') {
      ctx.strokeStyle = '#C2C6CF';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 3, y - 3, photoWidth + 6, photoHeight + 6);
      ctx.strokeStyle = '#FFFFFF88';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 5, y - 5, photoWidth + 10, photoHeight + 10);
    } else if (template.border === 'pixel') {
      ctx.strokeStyle = template.accentColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 2, y - 2, photoWidth + 4, photoHeight + 4);
    } else if (template.border === 'doodle') {
      ctx.strokeStyle = '#2D2B30';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 3, y - 3, photoWidth + 6, photoHeight + 6);
    }

    ctx.drawImage(photo, x, y, photoWidth, photoHeight);
    ctx.restore();
  });

  // 3. Render Template Decorations (placed in whitespace/margins, NEVER covering faces)
  if (template.decorations && template.decorations.length > 0) {
    template.decorations.forEach(deco => {
      if (deco.type === 'text') {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = deco.font || `${deco.size || 22}px ${fontFamily}`;
        ctx.fillStyle = deco.color || template.accentColor || template.textColor;
        ctx.fillText(deco.text, deco.x * width, deco.y * height);
        ctx.restore();
      }
    });
  }

  // 4. Header & Branding
  ctx.save();
  ctx.fillStyle = template.textColor;
  ctx.textAlign = 'center';

  const headerTitle = style.header ? style.header : template.header || 'SNAPBOOTH';
  fitText(ctx, headerTitle, width / 2, 78, width - pad * 2, 38, '700', fontFamily);

  const subHeaderTitle = template.subHeader || 'K-STYLE SELF PHOTO STUDIO';
  ctx.fillStyle = template.accentColor || template.textColor;
  fitText(ctx, subHeaderTitle, width / 2, 116, width - pad * 2, 18, '500', fontFamily);
  ctx.restore();

  // 5. Footer Content
  let y = height - footerHeight + 54;
  ctx.textAlign = 'center';

  // Sticker
  if (style.sticker) {
    ctx.font = '38px Arial, "Segoe UI Emoji", sans-serif';
    ctx.fillText(style.sticker, width / 2, y);
    y += 44;
  } else {
    y += 15;
  }

  // User Custom Text
  if (style.text) {
    ctx.fillStyle = template.textColor;
    fitText(ctx, style.text, width / 2, y, width - pad * 2, 28, '500', fontFamily);
    y += 40;
  }

  // Location
  if (style.showLocation && style.location) {
    ctx.fillStyle = template.accentColor || template.textColor;
    fitText(ctx, style.location, width / 2, y, width - pad * 2, 22, '400', fontFamily);
    y += 33;
  }

  // Timestamp
  const date = timestamp ? new Date(timestamp) : new Date();
  const stamp = [
    style.showDate && date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    style.showTime && date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  ].filter(Boolean).join(' • ');

  if (stamp) {
    ctx.fillStyle = template.textColor;
    fitText(ctx, stamp, width / 2, y, width - pad * 2, 20, '400', fontFamily);
  }

  // Brand Stamp
  if (style.showBrand) {
    ctx.fillStyle = template.accentColor || template.textColor;
    fitText(ctx, `SNAPBOOTH • ${date.getFullYear()}`, width / 2, height - 24, width - pad * 2, 16, '700', fontFamily);
  }

  return canvas;
}

export function canvasBlob(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Could not generate the PNG. Please try again.'))),
      'image/png'
    )
  );
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function shareBlob(blob, name) {
  const file = new File([blob], name, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'My SnapBooth photostrip' });
      return 'shared';
    } catch (error) {
      if (error.name === 'AbortError') return 'cancelled';
    }
  }
  downloadBlob(blob, name);
  return 'downloaded';
}
