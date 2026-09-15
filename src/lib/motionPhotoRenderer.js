import { makeCanvas, processPhoto } from './photos.js';
import { IMAGE_FRAMES } from './imageFrames.js';
import { STRIP_TEMPLATES } from './presets.js';
import { ARTISTIC_TEMPLATES } from './artisticTemplates.js';
import { drawPolaroidFrame } from './canvasTextures.js';
import { drawPhotoInSlot, coverCrop } from './photoSlots.js';
import { renderPlacedStickers, preloadStickerAssets } from './stickers.js';
import { renderPlacedTexts } from './templateRenderer.js';
import { preloadTemplateAssets, getThemedPhotoSlots } from './themedTemplates.js';
import { decodedImage } from './renderResources.js';
import { executeEffect } from './effects.js';

/**
 * Checks if Motion Photo recording is supported in the current environment.
 */
export function isMotionPhotoSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function' &&
    typeof MediaRecorder !== 'undefined'
  );
}

/**
 * Resolves the best supported video MIME type for recording.
 */
export function getSupportedVideoMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  return candidates.find(cand => MediaRecorder.isTypeSupported(cand)) || '';
}

/**
 * Renders a full-composition Motion Photo video (MP4 or WebM).
 * Combines template artwork / frame, playing live clips in designated apertures,
 * filter color matrix, tone adjustments, mirror orientation, visual effects,
 * user stickers, and typography.
 */
export async function renderMotionPhotoVideo({
  photos = [],
  liveClips = {},
  style = {},
  filter = 'korean',
  adjust = null,
  effect = null,
  mirrorResult = false,
  filterId = null,
  timestamp = null,
  onProgress = null,
}) {
  if (!isMotionPhotoSupported()) {
    throw new Error('Perekaman Motion Photo (canvas stream) tidak didukung oleh browser ini.');
  }

  const mimeType = getSupportedVideoMimeType();
  const isMp4 = mimeType.includes('mp4');
  const extension = isMp4 ? 'mp4' : 'webm';

  const photoCount = Math.max(photos.length, Object.keys(liveClips).length, style.poseCount || 4);
  const templateId = style.template || style.frame || 'airmail-love';

  // 1. Preload external template and sticker assets
  onProgress?.({ percent: 10, stage: 'Memuat aset stiker dan template…' });
  await Promise.all([
    preloadTemplateAssets(templateId),
    preloadStickerAssets(style.userStickers || []),
  ]);

  // 2. Prepare video and still elements for each slot
  onProgress?.({ percent: 25, stage: 'Menyiapkan klip video gerak…' });
  const videoElements = {};
  const processedStill = {};
  const slotCanvases = {};

  const clipIndices = Object.keys(liveClips).map(Number);
  const videoLoadPromises = clipIndices.map(idx => {
    return new Promise(resolve => {
      const item = liveClips[idx];
      const url = item?.url || item;
      if (!url) return resolve({ idx, video: null });

      const video = document.createElement('video');
      video.src = url;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = 'auto';

      let resolved = false;
      const done = (vid) => {
        if (!resolved) {
          resolved = true;
          resolve({ idx, video: vid });
        }
      };

      video.onloadeddata = () => done(video);
      video.onerror = () => done(null);
      setTimeout(() => done(video), 2500); // Safety fallback timeout
    });
  });

  const loadedVideos = await videoLoadPromises;
  loadedVideos.forEach(({ idx, video }) => {
    if (video) videoElements[idx] = video;
  });

  // Prepare still processed photos for slots that don't have video clips
  for (let i = 0; i < photoCount; i++) {
    if (!videoElements[i] && photos[i]) {
      try {
        processedStill[i] = await processPhoto(photos[i], filter, adjust, effect, mirrorResult, 1000);
      } catch (_) {
        // Fallback still
      }
    }
  }

  // 3. Resolve template layout and dimensions
  let imgFrame = IMAGE_FRAMES.find(f => f.id === templateId);
  if (imgFrame && photoCount > 0 && imgFrame.supportedPhotoCounts && !imgFrame.supportedPhotoCounts.includes(photoCount)) {
    const familyAlt = IMAGE_FRAMES.find(
      f => f.family === imgFrame.family && f.supportedPhotoCounts?.includes(photoCount)
    );
    if (familyAlt) imgFrame = familyAlt;
  }

  let tpl = null;
  if (!imgFrame) {
    tpl = STRIP_TEMPLATES.find(t => t.id === templateId) || ARTISTIC_TEMPLATES[0];
    if (photoCount > 0 && tpl.supportedPhotoCounts && !tpl.supportedPhotoCounts.includes(photoCount)) {
      const family = tpl.family || tpl.id.replace(/-\d+$/, '');
      const variant = STRIP_TEMPLATES.find(
        t => (t.family === family || t.id.startsWith(family + '-')) && t.supportedPhotoCounts?.includes(photoCount)
      );
      if (variant) tpl = variant;
    }
  }

  let frameImage = null;
  let logicalW = 800;
  let logicalH = 2000;

  if (imgFrame) {
    logicalW = imgFrame.frameW;
    logicalH = imgFrame.frameH;
    frameImage = await decodedImage(imgFrame.src);
  } else if (tpl) {
    logicalW = tpl.canvas?.width || 800;
    logicalH = tpl.canvas?.height || 2000;
  }

  // Dimension scaling for crisp export quality (max dimension ~1400px for 30fps fluidity)
  const maxDim = 1400;
  const scale = Math.min(1.0, maxDim / Math.max(logicalW, logicalH));
  const renderW = Math.round(logicalW * scale);
  const renderH = Math.round(logicalH * scale);

  const masterCanvas = makeCanvas(renderW, renderH);
  const ctx = masterCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 4. Create intermediate slot canvases for video rendering (with filter + mirror + effect)
  Object.keys(videoElements).forEach(idx => {
    const v = videoElements[idx];
    const sw = v.videoWidth || 640;
    const sh = v.videoHeight || 480;
    const sc = makeCanvas(sw, sh);
    slotCanvases[idx] = sc;
  });

  // Calculate target duration
  let durationSec = 2.4;
  const videoList = Object.values(videoElements);
  if (videoList.length > 0) {
    const validDurs = videoList.map(v => v.duration).filter(d => Number.isFinite(d) && d > 1);
    if (validDurs.length > 0) {
      durationSec = Math.min(3.2, Math.max(1.8, Math.max(...validDurs)));
    }
  }

  onProgress?.({ percent: 40, stage: 'Memulai compositing canvas stream…' });

  // Reset and play all videos synchronized
  videoList.forEach(v => {
    v.currentTime = 0;
    v.play().catch(() => {});
  });

  // Setup Canvas Stream & MediaRecorder
  const fps = 30;
  const stream = masterCanvas.captureStream(fps);
  const recorderOptions = mimeType ? { mimeType, videoBitsPerSecond: 6_000_000 } : {};
  const recorder = new MediaRecorder(stream, recorderOptions);
  const chunks = [];

  recorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const totalFrames = Math.round(durationSec * fps);
  let frameCount = 0;

  // Single Frame Draw Procedure
  const drawCompositeFrame = () => {
    // 1. Update intermediate slot canvases with live video frame + filter + mirror + effect
    Object.keys(videoElements).forEach(idx => {
      const v = videoElements[idx];
      const sc = slotCanvases[idx];
      if (!v || !sc) return;

      const sCtx = sc.getContext('2d');
      sCtx.save();
      sCtx.imageSmoothingEnabled = true;

      // Mirror result
      if (mirrorResult) {
        sCtx.translate(sc.width, 0);
        sCtx.scale(-1, 1);
      }

      // Filter
      if (filterId) {
        sCtx.filter = `url(#${filterId})`;
      }

      sCtx.drawImage(v, 0, 0, sc.width, sc.height);
      sCtx.restore();

      // Effect
      if (effect && effect.id && effect.id !== 'none') {
        executeEffect(sCtx, sc.width, sc.height, effect.id, effect.intensity ?? 50, effect.privacyBox);
      }
    });

    // 2. Render Full Photostrip Canvas
    ctx.save();
    ctx.scale(scale, scale);

    if (imgFrame && frameImage) {
      // Image-based frame rendering
      ctx.drawImage(frameImage, 0, 0, imgFrame.frameW, imgFrame.frameH);

      const slots = imgFrame.slots || [];
      slots
        .map((slot, index) => ({ slot, index }))
        .sort((a, b) => (a.slot.zIndex || 0) - (b.slot.zIndex || 0))
        .forEach(({ slot, index }) => {
          const media = slotCanvases[index] || processedStill[index];
          if (media) drawPhotoInSlot(ctx, media, slot);
        });

      if (style.userStickers?.length) {
        renderPlacedStickers(ctx, style.userStickers, imgFrame.frameW, imgFrame.frameH);
      }
      if (style.userTexts?.length) {
        renderPlacedTexts(ctx, style.userTexts, imgFrame.frameW, imgFrame.frameH);
      }
    } else if (tpl) {
      // Procedural / Artistic template rendering
      const canvasWidth = tpl.canvas?.width || 800;
      const canvasHeight = tpl.canvas?.height || 2000;
      const logicalCanvas = { width: canvasWidth, height: canvasHeight };

      // Background
      if (style?.customBg) {
        ctx.fillStyle = style.customBg;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else if (tpl.renderBackground) {
        ctx.save();
        try { tpl.renderBackground(ctx, logicalCanvas, style); } catch (_) {}
        ctx.restore();
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

      // Photo Slots
      const slots = (photoCount > 0 && (!tpl.photoSlots?.length || tpl.photoSlots.length < photoCount))
        ? getThemedPhotoSlots(photoCount, tpl.photoSlots?.[0]?.frameStyle || 'white-thin')
        : (tpl.photoSlots || []);

      slots.forEach((slot, idx) => {
        const media = slotCanvases[idx] || processedStill[idx];
        if (!media) return;

        ctx.save();
        const cx = slot.x + slot.width / 2;
        const cy = slot.y + slot.height / 2;
        ctx.translate(cx, cy);
        if (slot.rotation) ctx.rotate(slot.rotation);

        const sw = slot.width;
        const sh = slot.height;
        const r = slot.borderRadius || 0;

        // Frame styling
        if (slot.frameStyle === 'polaroid' || slot.frameStyle === 'polaroid-maroon' || slot.frameStyle === 'polaroid-pink') {
          const chin = slot.chinHeight || 60;
          const padSide = 22;
          const padTop = 22;
          const frameW = sw + padSide * 2;
          const frameH = sh + padTop + chin;
          const bgColor = slot.frameStyle === 'polaroid-maroon' ? '#7A1C28' : slot.frameStyle === 'polaroid-pink' ? '#FBCFE8' : '#FDFCFA';
          drawPolaroidFrame(ctx, 0, (chin - padTop) / 2, frameW, frameH, chin, { bgColor });
          ctx.fillStyle = '#181716';
          ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
        } else if (slot.frameStyle === 'white-thin' || slot.frameStyle === 'white-border') {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          if (r > 0) ctx.roundRect(-sw / 2 - 6, -sh / 2 - 6, sw + 12, sh + 12, r + 2);
          else ctx.rect(-sw / 2 - 6, -sh / 2 - 6, sw + 12, sh + 12);
          ctx.fill();
        }

        // Aperture Clip
        ctx.beginPath();
        if (r > 0) ctx.roundRect(-sw / 2, -sh / 2, sw, sh, r);
        else ctx.rect(-sw / 2, -sh / 2, sw, sh);
        ctx.clip();

        // Draw photo with cover crop
        const crop = coverCrop(media.width, media.height, sw, sh, slot.crop?.position);
        ctx.drawImage(media, crop.x, crop.y, crop.width, crop.height, -sw / 2, -sh / 2, sw, sh);

        ctx.restore();
      });

      // Foreground decorations
      if (tpl.renderForeground) {
        ctx.save();
        try { tpl.renderForeground(ctx, logicalCanvas, style, timestamp); } catch (_) {}
        ctx.restore();
      }

      // User Stickers & Texts
      if (Array.isArray(style?.userStickers) && style.userStickers.length > 0) {
        renderPlacedStickers(ctx, style.userStickers, canvasWidth, canvasHeight);
      }
      if (Array.isArray(style?.userTexts) && style.userTexts.length > 0) {
        renderPlacedTexts(ctx, style.userTexts, canvasWidth, canvasHeight);
      }
    }

    ctx.restore();
  };

  // Render initial frame before recording starts
  drawCompositeFrame();

  return new Promise((resolve, reject) => {
    recorder.onerror = err => {
      videoList.forEach(v => { try { v.pause(); } catch (_) {} });
      reject(err);
    };

    recorder.onstop = () => {
      videoList.forEach(v => { try { v.pause(); } catch (_) {} });
      const finalType = recorder.mimeType || mimeType || (isMp4 ? 'video/mp4' : 'video/webm');
      const blob = new Blob(chunks, { type: finalType });
      const url = URL.createObjectURL(blob);

      onProgress?.({ percent: 100, stage: 'Motion Photo selesai dirender!' });
      resolve({
        blob,
        url,
        mimeType: finalType,
        extension,
        width: renderW,
        height: renderH,
      });
    };

    recorder.start(100);

    const frameIntervalMs = 1000 / fps;
    const intervalId = setInterval(() => {
      frameCount++;
      drawCompositeFrame();

      const progress = Math.min(98, 40 + Math.round((frameCount / totalFrames) * 58));
      onProgress?.({ percent: progress, stage: `Merender frame ${frameCount} / ${totalFrames}…` });

      if (frameCount >= totalFrames) {
        clearInterval(intervalId);
        try {
          recorder.stop();
        } catch (e) {
          reject(e);
        }
      }
    }, frameIntervalMs);
  });
}
