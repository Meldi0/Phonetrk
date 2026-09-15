// Pure Canvas 2D image processing effects for SnapBooth

export function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  return canvas;
}

export function applyPixelBlur(ctx, width, height, intensity = 50) {
  // intensity 0..100 -> pixel size from 4px to 32px
  const factor = Math.max(4, Math.round(4 + (intensity / 100) * 28));
  const smallW = Math.max(1, Math.floor(width / factor));
  const smallH = Math.max(1, Math.floor(height / factor));

  const offscreen = makeCanvas(smallW, smallH);
  const offCtx = offscreen.getContext('2d');
  offCtx.drawImage(ctx.canvas, 0, 0, smallW, smallH);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, smallW, smallH, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
}

export function apply8Bit(ctx, width, height, intensity = 50) {
  // 1. Pixelate
  const factor = Math.max(4, Math.round(4 + (intensity / 100) * 20));
  const smallW = Math.max(1, Math.floor(width / factor));
  const smallH = Math.max(1, Math.floor(height / factor));

  const offscreen = makeCanvas(smallW, smallH);
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  offCtx.drawImage(ctx.canvas, 0, 0, smallW, smallH);

  // 2. Reduce color palette (color quantization / posterization)
  const imgData = offCtx.getImageData(0, 0, smallW, smallH);
  const data = imgData.data;
  // Steps between 4 and 8 levels per channel
  const levels = Math.max(4, Math.round(8 - (intensity / 100) * 4));
  const step = 255 / (levels - 1);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }
  offCtx.putImageData(imgData, 0, 0);

  // 3. Draw back scaled with sharp pixel edges
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, smallW, smallH, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
}

export function applyDreamGlow(ctx, width, height, intensity = 50) {
  const norm = intensity / 100;
  // Create downscaled bright bloom layer
  const scale = 0.25;
  const bloomW = Math.max(1, Math.floor(width * scale));
  const bloomH = Math.max(1, Math.floor(height * scale));

  const bloomCanvas = makeCanvas(bloomW, bloomH);
  const bCtx = bloomCanvas.getContext('2d', { willReadFrequently: true });
  bCtx.drawImage(ctx.canvas, 0, 0, bloomW, bloomH);

  const imgData = bCtx.getImageData(0, 0, bloomW, bloomH);
  const d = imgData.data;
  // Extract bright highlights
  const threshold = 120 - norm * 40;
  for (let i = 0; i < d.length; i += 4) {
    const luma = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (luma < threshold) {
      d[i + 3] = 0;
    } else {
      const alphaFactor = Math.min(1, (luma - threshold) / (255 - threshold));
      d[i + 3] = Math.round(255 * alphaFactor);
    }
  }
  bCtx.putImageData(imgData, 0, 0);

  // Draw bloom layer back with screen / lighten blend mode and soft alpha
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.25 + norm * 0.45;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(bloomCanvas, 0, 0, bloomW, bloomH, 0, 0, width, height);

  // Subtle warm highlight wash
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = `rgba(255, 235, 230, ${0.15 + norm * 0.2})`;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function applyFilmGrain(ctx, width, height, intensity = 50) {
  const grainCanvas = makeCanvas(Math.min(500, width), Math.min(500, height));
  const gCtx = grainCanvas.getContext('2d');
  const imgData = gCtx.createImageData(grainCanvas.width, grainCanvas.height);
  const d = imgData.data;
  const strength = (intensity / 100) * 45;

  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * strength;
    const val = Math.max(0, Math.min(255, 128 + noise));
    d[i] = val;
    d[i + 1] = val;
    d[i + 2] = val;
    d[i + 3] = 255;
  }
  gCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.18 + (intensity / 100) * 0.32;
  const pattern = ctx.createPattern(grainCanvas, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

export function applyRgbShift(ctx, width, height, intensity = 50) {
  const shift = Math.max(2, Math.round(2 + (intensity / 100) * 12));
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;

  // Make a copy of the pixel buffer
  const copy = new Uint8ClampedArray(d);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x * 4;

      // Shift Red left
      const redX = Math.max(0, x - shift);
      const redIdx = rowOffset + redX * 4;
      d[idx] = copy[redIdx];

      // Green stays centered
      d[idx + 1] = copy[idx + 1];

      // Shift Blue right
      const blueX = Math.min(width - 1, x + shift);
      const blueIdx = rowOffset + blueX * 4;
      d[idx + 2] = copy[blueIdx + 2];
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

export function applyVhs(ctx, width, height, intensity = 50) {
  // 1. Subtle RGB shift
  applyRgbShift(ctx, width, height, Math.min(45, intensity * 0.7));

  // 2. Scanlines
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
  const step = Math.max(3, Math.round(3 + (100 - intensity) * 0.02));
  for (let y = 0; y < height; y += step) {
    ctx.fillRect(0, y, width, 1);
  }

  // 3. Subtle noise
  applyFilmGrain(ctx, width, height, intensity * 0.6);

  // 4. Subtle color tint wash
  ctx.globalCompositeOperation = 'color';
  ctx.fillStyle = 'rgba(230, 240, 255, 0.08)';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function applyLowRes(ctx, width, height, intensity = 50) {
  // Downscale to simulate early 2000s phone or webcam
  const factor = Math.max(3, Math.round(3 + (intensity / 100) * 10));
  const smallW = Math.max(1, Math.floor(width / factor));
  const smallH = Math.max(1, Math.floor(height / factor));

  const offscreen = makeCanvas(smallW, smallH);
  const offCtx = offscreen.getContext('2d');
  offCtx.drawImage(ctx.canvas, 0, 0, smallW, smallH);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, smallW, smallH, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;

  // Add digital sensor noise
  applyFilmGrain(ctx, width, height, Math.min(50, intensity * 0.8));
}

export function applySoftBlur(ctx, width, height, intensity = 50) {
  const scale = Math.max(0.1, 0.4 - (intensity / 100) * 0.28);
  const smallW = Math.max(1, Math.floor(width * scale));
  const smallH = Math.max(1, Math.floor(height * scale));

  const offscreen = makeCanvas(smallW, smallH);
  const offCtx = offscreen.getContext('2d');
  offCtx.imageSmoothingEnabled = true;
  offCtx.drawImage(ctx.canvas, 0, 0, smallW, smallH);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = 0.85;
  ctx.drawImage(offscreen, 0, 0, smallW, smallH, 0, 0, width, height);
  ctx.restore();
}

export function applyMotionBlur(ctx, width, height, intensity = 50) {
  const distance = Math.max(3, Math.round(4 + (intensity / 100) * 24));
  const steps = 6;
  const offscreen = makeCanvas(width, height);
  const offCtx = offscreen.getContext('2d');
  offCtx.drawImage(ctx.canvas, 0, 0);

  ctx.save();
  ctx.globalAlpha = 1 / steps;
  for (let i = 1; i <= steps; i++) {
    const offset = (i / steps) * distance;
    ctx.drawImage(offscreen, -offset, 0);
    ctx.drawImage(offscreen, offset, 0);
  }
  ctx.restore();
}

export function applyPrivacy(ctx, width, height, privacyType, box = { x: 0.25, y: 0.2, width: 0.5, height: 0.35 }, intensity = 60) {
  const targetBox = box || { x: 0.25, y: 0.2, width: 0.5, height: 0.35 };
  const rx = Math.max(0, Math.min(width, Math.round(targetBox.x * width)));
  const ry = Math.max(0, Math.min(height, Math.round(targetBox.y * height)));
  const rw = Math.max(10, Math.min(width - rx, Math.round(targetBox.width * width)));
  const rh = Math.max(10, Math.min(height - ry, Math.round(targetBox.height * height)));

  if (privacyType === 'black-bar') {
    ctx.save();
    ctx.fillStyle = '#121115';
    const radius = Math.min(8, Math.floor(rh / 4));
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, radius);
      ctx.fill();
    } else {
      ctx.fillRect(rx, ry, rw, rh);
    }
    ctx.strokeStyle = '#FFFFFF33';
    ctx.lineWidth = 1;
    if (ctx.roundRect) {
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (privacyType === 'pixel-face') {
    const factor = Math.max(4, Math.round(6 + (intensity / 100) * 18));
    const smallW = Math.max(1, Math.floor(rw / factor));
    const smallH = Math.max(1, Math.floor(rh / factor));

    const patch = makeCanvas(smallW, smallH);
    const pCtx = patch.getContext('2d');
    pCtx.drawImage(ctx.canvas, rx, ry, rw, rh, 0, 0, smallW, smallH);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(patch, 0, 0, smallW, smallH, rx, ry, rw, rh);
    ctx.restore();
    return;
  }

  if (privacyType === 'blur-face') {
    const scale = 0.08;
    const smallW = Math.max(2, Math.floor(rw * scale));
    const smallH = Math.max(2, Math.floor(rh * scale));

    const patch = makeCanvas(smallW, smallH);
    const pCtx = patch.getContext('2d');
    pCtx.drawImage(ctx.canvas, rx, ry, rw, rh, 0, 0, smallW, smallH);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(patch, 0, 0, smallW, smallH, rx, ry, rw, rh);
    ctx.restore();
  }
}

export function applyLightLeak(ctx, width, height, intensity = 50) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const alpha = (intensity / 100) * 0.8;
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(width, height) * 0.8);
  gradient.addColorStop(0, `rgba(255, 120, 50, ${alpha})`);
  gradient.addColorStop(0.5, `rgba(255, 210, 100, ${alpha * 0.5})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function applyCrtScanlines(ctx, width, height, intensity = 50) {
  ctx.save();
  const alpha = 0.1 + (intensity / 100) * 0.3;
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }
  
  const gradient = ctx.createRadialGradient(width / 2, height / 2, Math.max(width, height) * 0.3, width / 2, height / 2, Math.max(width, height) * 0.7);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(0,0,0,${alpha * 1.5})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function applyLensFlare(ctx, width, height, intensity = 50) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const alpha = (intensity / 100) * 0.7;
  const cx = width * 0.3;
  const cy = height * 0.3;
  
  const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.2);
  orb.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  orb.addColorStop(0.2, `rgba(255, 230, 180, ${alpha * 0.8})`);
  orb.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, width, height);
  
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.5, width * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(150, 200, 255, ${alpha * 0.3})`;
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(width * 0.65, height * 0.65, width * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 150, 150, ${alpha * 0.2})`;
  ctx.fill();
  ctx.restore();
}

export function applyHalftone(ctx, width, height, intensity = 50) {
  const gridSize = Math.max(6, Math.round(14 - (intensity / 100) * 8));
  
  const offscreen = makeCanvas(width, height);
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  offCtx.drawImage(ctx.canvas, 0, 0);
  const imgData = offCtx.getImageData(0, 0, width, height);
  const d = imgData.data;

  const dotCanvas = makeCanvas(width, height);
  const dotCtx = dotCanvas.getContext('2d');
  dotCtx.fillStyle = '#f5f5f0';
  dotCtx.fillRect(0, 0, width, height);
  dotCtx.fillStyle = '#111';

  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
      const idx = (y * width + x) * 4;
      const luma = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
      const radius = (1 - luma / 255) * (gridSize / 2);
      
      if (radius > 0.5) {
        dotCtx.beginPath();
        dotCtx.arc(x, y, radius, 0, Math.PI * 2);
        dotCtx.fill();
      }
    }
  }

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(dotCanvas, 0, 0);
  ctx.restore();
}

export function applyRisograph(ctx, width, height, intensity = 50) {
  const offscreen = makeCanvas(width, height);
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  offCtx.drawImage(ctx.canvas, 0, 0);
  const imgData = offCtx.getImageData(0, 0, width, height);
  const d = imgData.data;

  const color1 = [0, 128, 128];
  const color2 = [255, 127, 80];

  const strength = (intensity / 100) * 40;

  for (let i = 0; i < d.length; i += 4) {
    const luma = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const noise = (Math.random() - 0.5) * strength;
    const val = Math.max(0, Math.min(255, luma + noise));

    const factor = val / 255;
    
    d[i] = color1[0] * (1 - factor) + color2[0] * factor;
    d[i + 1] = color1[1] * (1 - factor) + color2[1] * factor;
    d[i + 2] = color1[2] * (1 - factor) + color2[2] * factor;
  }
  
  offCtx.putImageData(imgData, 0, 0);
  ctx.save();
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
}

export function executeEffect(ctx, width, height, effectId, intensity = 50, privacyBox = null) {
  if (!effectId || effectId === 'none') return;
  switch (effectId) {
    case 'pixel-blur':
      applyPixelBlur(ctx, width, height, intensity);
      break;
    case 'eight-bit':
      apply8Bit(ctx, width, height, intensity);
      break;
    case 'dream-glow':
      applyDreamGlow(ctx, width, height, intensity);
      break;
    case 'film-grain':
      applyFilmGrain(ctx, width, height, intensity);
      break;
    case 'rgb-shift':
      applyRgbShift(ctx, width, height, intensity);
      break;
    case 'vhs':
      applyVhs(ctx, width, height, intensity);
      break;
    case 'low-res':
      applyLowRes(ctx, width, height, intensity);
      break;
    case 'soft-blur':
      applySoftBlur(ctx, width, height, intensity);
      break;
    case 'motion-blur':
      applyMotionBlur(ctx, width, height, intensity);
      break;
    case 'light-leak':
      applyLightLeak(ctx, width, height, intensity);
      break;
    case 'crt-scanlines':
      applyCrtScanlines(ctx, width, height, intensity);
      break;
    case 'lens-flare':
      applyLensFlare(ctx, width, height, intensity);
      break;
    case 'halftone-print':
      applyHalftone(ctx, width, height, intensity);
      break;
    case 'risograph':
      applyRisograph(ctx, width, height, intensity);
      break;
    case 'pixel-face':
    case 'blur-face':
    case 'black-bar':
      applyPrivacy(ctx, width, height, effectId, privacyBox, intensity);
      break;
    default:
      break;
  }
}
