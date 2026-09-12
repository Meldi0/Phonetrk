/**
 * Unified Canvas Template Rendering Engine.
 * Source of truth for both the live interactive preview and high-resolution export PNG.
 * Executes the data-driven photo slot cover crop, layering, and physical material pipeline.
 */

import { makeCanvas } from './photos.js';
import { ARTISTIC_TEMPLATES } from './artisticTemplates.js';
import { drawPolaroidFrame, drawStitches } from './canvasTextures.js';
import { STRIP_TEMPLATES } from './presets.js';

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

  const canvasWidth = tpl.canvas?.width || 800;
  const canvasHeight = tpl.canvas?.height || 2000;

  const canvas = makeCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // 2. Render Background Material & Layering
  if (tpl.renderBackground) {
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
  const photos = processedPhotos || [];

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
    if (slot.frameStyle === 'polaroid') {
      const chin = slot.chinHeight || 60;
      const padSide = 22;
      const padTop = 22;
      const frameW = sw + padSide * 2;
      const frameH = sh + padTop + chin;

      // Draw Polaroid Paper Card
      drawPolaroidFrame(ctx, 0, (chin - padTop) / 2, frameW, frameH, chin, {
        bgColor: '#FDFCFA',
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
    } else {
      // Aesthetic placeholder card when fewer poses were taken
      ctx.fillStyle = '#222026';
      ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

      ctx.fillStyle = '#EBE7F3';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 16px "DM Sans", sans-serif';
      ctx.fillText('SNAPBOOTH', 0, -14);
      ctx.font = '12px "Courier New", monospace';
      ctx.fillStyle = '#A8A0B2';
      ctx.fillText('MEMOIR ★ POSE ' + (idx + 1), 0, 14);
    }

    ctx.restore();
  });

  // 4. Render Foreground Material, Stamps, Typography & Decorations
  if (tpl.renderForeground) {
    tpl.renderForeground(ctx, canvas, style, timestamp);
  }

  return canvas;
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
      ctx.fillText(style.header || legacy.header || 'SNAPBOOTH', width / 2, height - 140);
      ctx.font = '500 16px "DM Sans", sans-serif';
      ctx.fillStyle = legacy.accentColor || '#7061A8';
      ctx.fillText(legacy.subHeader || 'K-STYLE SELF PHOTO STUDIO', width / 2, height - 105);
      ctx.restore();
    },
  };
}
