import { colorMatrix, cropRect, LAYOUT_OPTIONS, STRIP_TEMPLATES } from './presets.js';
import { executeEffect } from './effects.js';
import { drawSticker, renderPlacedStickers } from './stickers.js';
import { ARTISTIC_TEMPLATES } from './artisticTemplates.js';
import { renderArtworkStrip } from './templateRenderer.js';

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
  const canvas = makeCanvas(width, (width * 3) / 4);
  const ctx = canvas.getContext('2d');
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
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
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
  const templateId = style.template || style.frame || 'airmail-love';
  const artistic = ARTISTIC_TEMPLATES.find(t => t.id === templateId);
  if (artistic || STRIP_TEMPLATES.find(t => t.id === templateId && t.photoSlots)) {
    return renderArtworkStrip(processed, style, timestamp);
  }

  const count = Math.max(1, processed.length);

  // Layout resolution: supports 1, 2, 4, 6 photos
  let cols = 1;
  let rows = count;
  const layoutKey = style.layout || '4-vertical';

  const matchedLayout = LAYOUT_OPTIONS.find(l => l.id === layoutKey);
  if (matchedLayout) {
    cols = matchedLayout.cols;
    rows = matchedLayout.rows;
  } else if (layoutKey === 'grid' || layoutKey === '4-grid') {
    cols = 2;
    rows = Math.ceil(count / cols);
  } else if (layoutKey === 'wide' || layoutKey === '4-wide') {
    cols = count;
    rows = 1;
  } else if (layoutKey === '1-single' || count === 1) {
    cols = 1;
    rows = 1;
  } else if (layoutKey === '2-vertical' || count === 2) {
    cols = 1;
    rows = 2;
  } else if (layoutKey === '6-grid' || count === 6) {
    cols = 2;
    rows = 3;
  } else {
    cols = 1;
    rows = count;
  }

  // Dimension scaling based on number of columns
  const photoWidth = cols >= 3 ? 640 : cols === 2 ? 760 : 1000;
  const photoHeight = photoWidth * 0.75;
  const pad = 58;
  const gap = 24;
  const headerHeight = 160;
  const footerHeight = 250;

  const width = pad * 2 + cols * photoWidth + (cols - 1) * gap;
  const height = headerHeight + rows * photoHeight + (rows - 1) * gap + footerHeight;

  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Find template definition
  const template = STRIP_TEMPLATES.find(t => t.id === templateId) || STRIP_TEMPLATES[0];

  // 1. Render Strip Background (custom override or template background)
  if (style.customBg) {
    ctx.fillStyle = style.customBg;
    ctx.fillRect(0, 0, width, height);
  } else if (template.background.length > 1) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    template.background.forEach((color, i) => gradient.addColorStop(i / (template.background.length - 1), color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = template.background[0];
    ctx.fillRect(0, 0, width, height);
  }

  // Retro film background scanlines
  if (template.category === 'Retro') {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let py = 0; py < height; py += 12) {
      ctx.fillRect(0, py, width, 1);
    }
    ctx.restore();
  }

  const fontFamily =
    template.font === 'serif' ? 'Georgia, "Times New Roman", serif' : 'DM Sans, Manrope, Arial, sans-serif';

  // 2. Render Photos into the grid slots
  const renderLimit = Math.min(processed.length, cols * rows);
  for (let i = 0; i < renderLimit; i++) {
    const photo = processed[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * (photoWidth + gap);
    const y = headerHeight + row * (photoHeight + gap);

    ctx.save();
    // Photo Borders & Framing
    const borderType = style.borderStyle || template.border;
    if (borderType === 'white-thin' || borderType === 'polaroid') {
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(x - 5, y - 5, photoWidth + 10, photoHeight + 10);
      ctx.shadowColor = 'transparent';
    } else if (borderType === 'subtle') {
      ctx.strokeStyle = template.accentColor + '55';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, photoWidth + 4, photoHeight + 4);
    } else if (borderType === 'film' || borderType === 'photolab') {
      ctx.fillStyle = '#0F0E11';
      ctx.fillRect(x - 6, y - 6, photoWidth + 12, photoHeight + 12);

      // Sprocket holes on outer margins
      if (cols === 1) {
        ctx.fillStyle = template.textColor + '33';
        const holeW = 14,
          holeH = 10;
        const holeLeft = pad - 30;
        const holeRight = width - pad + 16;
        for (let hy = y + 10; hy < y + photoHeight - 10; hy += 28) {
          ctx.fillRect(holeLeft, hy, holeW, holeH);
          ctx.fillRect(holeRight, hy, holeW, holeH);
        }
        ctx.font = '600 13px monospace';
        ctx.fillStyle = template.accentColor || '#D87A38';
        ctx.textAlign = 'left';
        ctx.fillText(`▶ ${String(i + 1).padStart(2, '0')}A`, pad, y - 10);
      }
    } else if (borderType === 'comic') {
      ctx.strokeStyle = '#151515';
      ctx.lineWidth = 6;
      ctx.strokeRect(x - 3, y - 3, photoWidth + 6, photoHeight + 6);
    } else if (borderType === 'silver') {
      ctx.strokeStyle = '#C2C6CF';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 3, y - 3, photoWidth + 6, photoHeight + 6);
      ctx.strokeStyle = '#FFFFFF88';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 5, y - 5, photoWidth + 10, photoHeight + 10);
    } else if (borderType === 'pixel') {
      ctx.strokeStyle = template.accentColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 2, y - 2, photoWidth + 4, photoHeight + 4);
    }

    ctx.drawImage(photo, x, y, photoWidth, photoHeight);
    ctx.restore();
  }

  // 3. Render Template Graphic Decorations
  if (template.decorations && template.decorations.length > 0) {
    template.decorations.forEach(deco => {
      if (deco.type === 'sticker' && deco.stickerType) {
        drawSticker(
          ctx,
          deco.stickerType,
          deco.x * width,
          deco.y * height,
          deco.size || 42,
          deco.rotation || 0,
          deco.color || template.accentColor
        );
      } else if (deco.type === 'text') {
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

  // 4. Render User-selected Custom Graphic Stickers
  if (Array.isArray(style.userStickers) && style.userStickers.length > 0) {
    renderPlacedStickers(ctx, style.userStickers, width, height);
  }

  // 5. Header & Branding
  ctx.save();
  ctx.fillStyle = template.textColor;
  ctx.textAlign = 'center';

  const headerTitle = style.header ? style.header : template.header || 'CISSPIC';
  fitText(ctx, headerTitle, width / 2, 78, width - pad * 2, 38, '700', fontFamily);

  const subHeaderTitle = template.subHeader || 'AESTHETIC SELF PHOTO STUDIO';
  ctx.fillStyle = template.accentColor || template.textColor;
  fitText(ctx, subHeaderTitle, width / 2, 116, width - pad * 2, 18, '500', fontFamily);
  ctx.restore();

  // 6. Footer Content
  let y = height - footerHeight + 60;
  if (Array.isArray(style.userStickers) && style.userStickers.length > 0) {
    y += 28; // Give space below user stickers
  }

  ctx.textAlign = 'center';

  // Classic sticker / emoji if set
  if (style.sticker) {
    ctx.font = '38px Arial, "Segoe UI Emoji", sans-serif';
    ctx.fillText(style.sticker, width / 2, y);
    y += 44;
  } else {
    y += 12;
  }

  // Custom User Message
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
    fitText(ctx, `CISSPIC • ${date.getFullYear()}`, width / 2, height - 24, width - pad * 2, 16, '700', fontFamily);
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
      await navigator.share({ files: [file], title: 'My CissPic photostrip' });
      return 'shared';
    } catch (error) {
      if (error.name === 'AbortError') return 'cancelled';
    }
  }
  downloadBlob(blob, name);
  return 'downloaded';
}
