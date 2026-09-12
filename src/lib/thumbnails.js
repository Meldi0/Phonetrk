/**
 * Thumbnail generator for the SnapBooth template selector.
 * Pre-renders realistic miniature previews for each template showing the actual
 * background texture, borders, photo slots, decorations, and sample poses.
 */

import { ARTISTIC_TEMPLATES } from './artisticTemplates.js';
import { renderArtworkStrip } from './templateRenderer.js';
import { makeCanvas } from './photos.js';

// Cache generated thumbnail URLs so they are only rendered once
const thumbnailCache = new Map();

/**
 * Creates dummy sample portrait photos for thumbnail rendering
 */
function createSamplePhotos() {
  const photos = [];
  const poses = [
    { bg: '#FFD1DC', hair: '#332211', skin: '#FCD8B8', eyes: '#222' }, // cute pose 1
    { bg: '#D0E6FF', hair: '#1A2332', skin: '#F5CBA7', eyes: '#222' }, // peace sign 2
    { bg: '#E2F0D9', hair: '#4A3525', skin: '#FDE3D2', eyes: '#222' }, // smile 3
    { bg: '#FFF0D4', hair: '#201A15', skin: '#FAD7A0', eyes: '#222' }, // wink 4
    { bg: '#E8D7F1', hair: '#1A1A24', skin: '#F5C6A5', eyes: '#222' }, // pose 5
  ];

  for (let p of poses) {
    const c = makeCanvas(400, 300);
    const ctx = c.getContext('2d');

    // Pastel studio background
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, 400, 300);

    // Cute stylized cartoon silhouette
    // Shoulders
    ctx.fillStyle = '#4A5568';
    ctx.beginPath();
    ctx.ellipse(200, 290, 110, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = p.skin;
    ctx.beginPath();
    ctx.arc(200, 155, 68, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = p.hair;
    ctx.beginPath();
    ctx.arc(200, 140, 74, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = p.eyes;
    ctx.beginPath();
    ctx.arc(175, 155, 6, 0, Math.PI * 2);
    ctx.arc(225, 155, 6, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = '#FF99A8';
    ctx.beginPath();
    ctx.arc(162, 170, 10, 0, Math.PI * 2);
    ctx.arc(238, 170, 10, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(200, 172, 14, 0.1, Math.PI - 0.1);
    ctx.stroke();

    photos.push(c);
  }

  return photos;
}

const samplePhotos = createSamplePhotos();

/**
 * Returns a high quality rendered thumbnail data URL for a given template ID
 */
export function getTemplateThumbnail(templateId) {
  if (thumbnailCache.has(templateId)) {
    return thumbnailCache.get(templateId);
  }

  try {
    const tpl = ARTISTIC_TEMPLATES.find(t => t.id === templateId) || ARTISTIC_TEMPLATES[0];
    const fullCanvas = renderArtworkStrip(samplePhotos, { template: tpl.id }, new Date());

    // Scale down to thumbnail size (width: 140px, keeping aspect ratio)
    const thumbW = 140;
    const thumbH = Math.round((thumbW / fullCanvas.width) * fullCanvas.height);

    const thumbCanvas = makeCanvas(thumbW, thumbH);
    const tctx = thumbCanvas.getContext('2d');
    tctx.imageSmoothingEnabled = true;
    tctx.imageSmoothingQuality = 'high';
    tctx.drawImage(fullCanvas, 0, 0, thumbW, thumbH);

    const url = thumbCanvas.toDataURL('image/jpeg', 0.88);
    thumbnailCache.set(templateId, url);
    return url;
  } catch (err) {
    console.error('Thumbnail generation error for ' + templateId, err);
    return null;
  }
}
