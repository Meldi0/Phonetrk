/**
 * Unified Canvas Template Rendering Engine.
 * Source of truth for both the live interactive preview and high-resolution export PNG.
 * Executes the data-driven photo slot cover crop, layering, and physical material pipeline.
 */

import { makeCanvas } from './photos.js';
import { ARTISTIC_TEMPLATES } from './artisticTemplates.js';
import { drawPolaroidFrame, drawStitches } from './canvasTextures.js';
import { STRIP_TEMPLATES, RECOMMENDED_TEMPLATES } from './presets.js';
import { renderPlacedStickers } from './stickers.js';

/**
 * Fits an image into a destination rectangle using object-fit: cover
 * Returns exact source coordinates and destination dimensions without distortion.
 */
export function fitCover(srcW, srcH, destW, destH) {
  const scale = Math.max(destW / srcW, destH / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const drawX = (destW - drawW) / 2;
  const drawY = (destH - drawH) / 2;
  return { drawX, drawY, drawW, drawH };
}

/**
 * Renders a complete high-resolution artwork photostrip onto a Canvas
 */
export function renderArtworkStrip(processedPhotos, style, timestamp) {
  const templateId = style.template || style.frame || 'airmail-love';

  // 1. Locate artistic template or fallback
  let tpl = ARTISTIC_TEMPLATES.find(t => t.id === templateId);

  // If not found in artistic templates, check legacy STRIP_TEMPLATES
  if (!tpl) {
    const legacy = STRIP_TEMPLATES.find(t => t.id === templateId);
    if (legacy) {
      tpl = convertLegacyTemplate(legacy);
    } else {
      tpl = ARTISTIC_TEMPLATES[0];
    }
  }

  // Auto-resolve template variant to match actual photo count if provided
  const photos = processedPhotos || [];
  const photoCount = photos.length;
  if (photoCount > 0 && tpl.supportedPhotoCounts && !tpl.supportedPhotoCounts.includes(photoCount)) {
    const family = tpl.family || tpl.id.replace(/-\d+$/, '');
    const familyVariant = ARTISTIC_TEMPLATES.find(
      t => (t.family === family || (family && t.id.startsWith(family + '-'))) &&
           t.supportedPhotoCounts?.includes(photoCount)
    );
    if (familyVariant) {
      tpl = familyVariant;
    }
  }

  const canvasWidth = tpl.canvas?.width || 800;
  const canvasHeight = tpl.canvas?.height || 2000;

  const canvas = makeCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // 2. Render Background Material & Layering
  if (style?.customBg) {
    ctx.fillStyle = style.customBg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else if (tpl.renderBackground) {
    tpl.renderBackground(ctx, canvas, style);
  } else if (tpl.background) {
    if (tpl.background.length > 1) {
      const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      tpl.background.forEach((col, i) => grad.addColorStop(i / (tpl.background.length - 1), col));
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = tpl.background[0];
    }
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 3. Render Photo Slots
  const slots = tpl.photoSlots || [];

  slots.forEach((slot, idx) => {
    const photo = photos[idx];
    const isPlaceholder = !photo;

    ctx.save();

    // Slot position and rotation
    const cx = slot.x + slot.width / 2;
    const cy = slot.y + slot.height / 2;
    ctx.translate(cx, cy);

    if (slot.rotation) {
      ctx.rotate(slot.rotation);
    }

    const sw = slot.width;
    const sh = slot.height;
    const r = slot.borderRadius || 0;

    // A. Frame Styles (Outer Decorations)
    if (slot.frameStyle === 'polaroid' || slot.frameStyle === 'polaroid-maroon') {
      const chin = slot.chinHeight || 60;
      const padSide = 22;
      const padTop = 22;
      const frameW = sw + padSide * 2;
      const frameH = sh + padTop + chin;
      const bgColor = slot.frameStyle === 'polaroid-maroon' ? '#7A1C28' : '#FDFCFA';

      // Draw Polaroid Paper Card
      drawPolaroidFrame(ctx, 0, (chin - padTop) / 2, frameW, frameH, chin, {
        bgColor,
      });

      // Subtle drop shadow inside image cutout
      ctx.fillStyle = '#181716';
      ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    } else if (slot.frameStyle === 'paper-perforated') {
      // Thin cream margin & soft shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#FDFBF7';
      ctx.fillRect(-sw / 2 - 4, -sh / 2 - 4, sw + 8, sh + 8);
      ctx.shadowColor = 'transparent';

    } else if (slot.frameStyle === 'white-thin' || slot.frameStyle === 'white-border') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      if (r > 0) ctx.roundRect(-sw / 2 - 6, -sh / 2 - 6, sw + 12, sh + 12, r + 2);
      else ctx.rect(-sw / 2 - 6, -sh / 2 - 6, sw + 12, sh + 12);
      ctx.fill();
      ctx.shadowColor = 'transparent';

    } else if (slot.frameStyle === 'torn-paper') {
      // Deckle edge ripped paper underlay
      ctx.fillStyle = '#F5EFE0';
      ctx.fillRect(-sw / 2 - 12, -sh / 2 - 12, sw + 24, sh + 24);
    }

    // B. Clip Image Area with rounded corners
    ctx.beginPath();
    if (r > 0) {
      ctx.roundRect(-sw / 2, -sh / 2, sw, sh, r);
    } else {
      ctx.rect(-sw / 2, -sh / 2, sw, sh);
    }
    ctx.clip();

    // C. Draw Photo with object-fit: cover algorithm
    if (photo) {
      const cover = fitCover(photo.width, photo.height, sw, sh);
      ctx.drawImage(
        photo,
        0, 0, photo.width, photo.height,
        -sw / 2 + cover.drawX,
        -sh / 2 + cover.drawY,
        cover.drawW,
        cover.drawH
      );
    }

    ctx.restore();
  });

  // 4. Render Foreground Material, Stamps, Typography & Decorations
  if (tpl.renderForeground) {
    tpl.renderForeground(ctx, canvas, style, timestamp);
  }

  // 5. Render Placed User Stickers (Ordered by zIndex)
  if (Array.isArray(style?.userStickers) && style.userStickers.length > 0) {
    renderPlacedStickers(ctx, style.userStickers, canvasWidth, canvasHeight);
  }

  // 6. Render Placed User Custom Texts (Ordered by zIndex)
  if (Array.isArray(style?.userTexts) && style.userTexts.length > 0) {
    renderPlacedTexts(ctx, style.userTexts, canvasWidth, canvasHeight);
  }

  return canvas;
}

/**
 * Renders custom user text overlays on Canvas with non-formal fonts
 */
export function renderPlacedTexts(ctx, userTexts, canvasWidth, canvasHeight) {
  if (!Array.isArray(userTexts) || userTexts.length === 0) return;
  const sorted = [...userTexts].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const item of sorted) {
    if (!item.text || !item.text.trim()) continue;
    const cx = (item.x ?? 0.5) * canvasWidth;
    const cy = (item.y ?? 0.85) * canvasHeight;
    const size = (item.fontSize || 42) * (item.scale || 1.0) * (canvasWidth / 800);
    const font = item.font || 'Caveat';

    ctx.save();
    ctx.translate(cx, cy);
    if (item.rotation) {
      ctx.rotate((item.rotation * Math.PI) / 180);
    }

    // Non-formal aesthetic font mapping
    let fontSpec;
    if (font === 'Permanent Marker') fontSpec = `bold ${size}px "Permanent Marker", cursive, sans-serif`;
    else if (font === 'Pacifico') fontSpec = `${size}px "Pacifico", cursive, sans-serif`;
    else if (font === 'Fredoka') fontSpec = `600 ${size}px "Fredoka", sans-serif`;
    else if (font === 'VT323') fontSpec = `${size * 1.3}px "VT323", monospace`;
    else if (font === 'Shantell Sans') fontSpec = `700 ${size}px "Shantell Sans", cursive, sans-serif`;
    else if (font === 'Courier Prime') fontSpec = `bold ${size}px "Courier Prime", monospace`;
    else fontSpec = `700 ${size}px "Caveat", cursive, sans-serif`;

    ctx.font = fontSpec;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = String(item.text).split('\n');
    const lineHeight = size * 1.25;
    const totalHeight = lines.length * lineHeight;

    // Optional background tag / highlight pill
    if (item.hasBg) {
      const maxWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
      const padX = size * 0.45;
      const padY = size * 0.25;
      ctx.fillStyle = item.bgColor || 'rgba(18, 20, 24, 0.85)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-maxWidth / 2 - padX, -totalHeight / 2 - padY, maxWidth + padX * 2, totalHeight + padY * 2, size * 0.25);
      else ctx.rect(-maxWidth / 2 - padX, -totalHeight / 2 - padY, maxWidth + padX * 2, totalHeight + padY * 2);
      ctx.fill();
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
    }

    ctx.fillStyle = item.color || '#FFFFFF';
    lines.forEach((line, lineIdx) => {
      const ly = -totalHeight / 2 + (lineIdx + 0.5) * lineHeight;
      ctx.fillText(line, 0, ly);
    });

    ctx.restore();
  }
}

/**
 * Fallback converter for legacy minimal templates
 */
function convertLegacyTemplate(legacy) {
  return {
    id: legacy.id,
    name: legacy.name,
    category: legacy.category || 'Minimal',
    canvas: { width: 800, height: 2000 },
    background: legacy.background,
    photoSlots: [
      { id: 1, x: 80, y: 120, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 2, x: 80, y: 530, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 3, x: 80, y: 940, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 4, x: 80, y: 1350, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderForeground(ctx, canvas, style, timestamp) {
      const { width, height } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = legacy.textColor || '#222';
      ctx.font = '900 32px "DM Sans", sans-serif';
      ctx.fillText(style.header || legacy.header || 'CISSPIC', width / 2, height - 140);
      ctx.font = '500 16px "DM Sans", sans-serif';
      ctx.fillStyle = legacy.accentColor || '#7061A8';
      ctx.fillText(legacy.subHeader || 'AESTHETIC SELF PHOTO STUDIO', width / 2, height - 105);
      ctx.restore();
    },
  };
}
