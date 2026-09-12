/**
 * Procedural texture and artwork generators for SnapBooth Canvas Renderer.
 * Creates physical, tactile materials: denim twill weave, kraft/parchment paper,
 * vinyl grooves, vintage receipt, lace, retro camera, phone cord, chrome star,
 * embroidered beagle patch, safety pin, airmail borders, and postmarks.
 */

// Helper to create an offscreen canvas
function createOffscreen(width, height) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.floor(width));
  c.height = Math.max(1, Math.floor(height));
  return c;
}

/**
 * Generates a seamless denim fabric twill weave pattern
 */
export function createDenimPattern(ctx, type = 'navy') {
  const size = 32;
  const off = createOffscreen(size, size);
  const octx = off.getContext('2d');

  let baseColor = '#1B2A4A'; // dark navy twill
  let darkYarn = '#121C33';
  let lightYarn = '#2C4374';
  let weftColor = '#7E8EA8';

  if (type === 'light') {
    baseColor = '#4A6B9C';
    darkYarn = '#36537D';
    lightYarn = '#688BBF';
    weftColor = '#B8CBE6';
  } else if (type === 'black') {
    baseColor = '#18181C';
    darkYarn = '#0F0F12';
    lightYarn = '#2A2A30';
    weftColor = '#6E6E78';
  } else if (type === 'acid') {
    baseColor = '#2F4870';
    darkYarn = '#1E3250';
    lightYarn = '#5C7CAE';
    weftColor = '#C2D5F0';
  }

  // Base wash
  octx.fillStyle = baseColor;
  octx.fillRect(0, 0, size, size);

  // 3/1 right-hand twill diagonal ribs
  octx.lineWidth = 1.6;
  for (let i = -size; i < size * 2; i += 4) {
    // Dark warp groove
    octx.strokeStyle = darkYarn;
    octx.beginPath();
    octx.moveTo(i, 0);
    octx.lineTo(i + size, size);
    octx.stroke();

    // Light warp thread highlight
    octx.strokeStyle = lightYarn;
    octx.beginPath();
    octx.moveTo(i + 1.2, 0);
    octx.lineTo(i + 1.2 + size, size);
    octx.stroke();

    // Occasional white weft fiber flecks
    octx.strokeStyle = weftColor;
    octx.beginPath();
    octx.moveTo(i + 2.5, 0);
    octx.lineTo(i + 2.5 + size, size);
    octx.setLineDash([1, 7]);
    octx.stroke();
    octx.setLineDash([]);
  }

  // Micro noise for cotton fiber texture
  const imgData = octx.getImageData(0, 0, size, size);
  const d = imgData.data;
  for (let p = 0; p < d.length; p += 4) {
    const noise = (Math.random() - 0.5) * 24;
    d[p] = Math.min(255, Math.max(0, d[p] + noise));
    d[p + 1] = Math.min(255, Math.max(0, d[p + 1] + noise));
    d[p + 2] = Math.min(255, Math.max(0, d[p + 2] + noise));
  }
  octx.putImageData(imgData, 0, 0);

  return ctx.createPattern(off, 'repeat');
}

/**
 * Generates an aged kraft or vintage paper pattern
 */
export function createPaperPattern(ctx, type = 'kraft') {
  const size = 64;
  const off = createOffscreen(size, size);
  const octx = off.getContext('2d');

  let base = '#E8DEC8'; // warm aged kraft
  if (type === 'cream') base = '#F7F2E7';
  if (type === 'worn') base = '#DFCEB1';
  if (type === 'white') base = '#FAFAF8';

  octx.fillStyle = base;
  octx.fillRect(0, 0, size, size);

  // Subtle paper fibers
  octx.fillStyle = 'rgba(120, 95, 65, 0.07)';
  for (let i = 0; i < 40; i++) {
    const fx = Math.random() * size;
    const fy = Math.random() * size;
    const len = 2 + Math.random() * 5;
    const angle = Math.random() * Math.PI;
    octx.fillRect(fx, fy, Math.cos(angle) * len, Math.sin(angle) * len);
  }

  // Micro grain
  const imgData = octx.getImageData(0, 0, size, size);
  const d = imgData.data;
  for (let p = 0; p < d.length; p += 4) {
    const grain = (Math.random() - 0.5) * 16;
    d[p] = Math.min(255, Math.max(0, d[p] + grain));
    d[p + 1] = Math.min(255, Math.max(0, d[p + 1] + grain));
    d[p + 2] = Math.min(255, Math.max(0, d[p + 2] + grain));
  }
  octx.putImageData(imgData, 0, 0);

  return ctx.createPattern(off, 'repeat');
}

/**
 * Draws diagonal vintage airmail stripes around canvas borders
 */
export function drawAirmailBorder(ctx, width, height, stripeWidth = 26, margin = 0) {
  ctx.save();
  const stripeLen = 42;
  const colors = ['#C0392B', '#1E3A60', '#F2E8D2']; // Red, Navy, Cream gap
  let colorIdx = 0;

  // Top border
  for (let x = -stripeLen; x < width + stripeLen; x += stripeLen) {
    ctx.fillStyle = colors[colorIdx % 3];
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x + stripeLen * 0.7, margin);
    ctx.lineTo(x + stripeLen * 0.7 - stripeWidth, margin + stripeWidth);
    ctx.lineTo(x - stripeWidth, margin + stripeWidth);
    ctx.closePath();
    ctx.fill();
    colorIdx++;
  }

  // Bottom border
  for (let x = -stripeLen; x < width + stripeLen; x += stripeLen) {
    ctx.fillStyle = colors[colorIdx % 3];
    ctx.beginPath();
    ctx.moveTo(x, height - margin);
    ctx.lineTo(x + stripeLen * 0.7, height - margin);
    ctx.lineTo(x + stripeLen * 0.7 + stripeWidth, height - margin - stripeWidth);
    ctx.lineTo(x + stripeWidth, height - margin - stripeWidth);
    ctx.closePath();
    ctx.fill();
    colorIdx++;
  }

  // Left border
  for (let y = stripeWidth; y < height - stripeWidth; y += stripeLen) {
    ctx.fillStyle = colors[colorIdx % 3];
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(margin, y + stripeLen * 0.7);
    ctx.lineTo(margin + stripeWidth, y + stripeLen * 0.7 - stripeWidth);
    ctx.lineTo(margin + stripeWidth, y - stripeWidth);
    ctx.closePath();
    ctx.fill();
    colorIdx++;
  }

  // Right border
  for (let y = stripeWidth; y < height - stripeWidth; y += stripeLen) {
    ctx.fillStyle = colors[colorIdx % 3];
    ctx.beginPath();
    ctx.moveTo(width - margin, y);
    ctx.lineTo(width - margin, y + stripeLen * 0.7);
    ctx.lineTo(width - margin - stripeWidth, y + stripeLen * 0.7 + stripeWidth);
    ctx.lineTo(width - margin - stripeWidth, y + stripeWidth);
    ctx.closePath();
    ctx.fill();
    colorIdx++;
  }

  ctx.restore();
}

/**
 * Draws vintage postal perforation dots
 */
export function drawPerforatedDots(ctx, x1, y1, x2, y2, dotSpacing = 16, radius = 2.5, color = '#6E5C4A') {
  ctx.save();
  ctx.fillStyle = color;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const steps = Math.floor(dist / dotSpacing);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws an inked circular postal stamp and cancellation wavy lines
 */
export function drawPostmark(ctx, cx, cy, radius = 64, title = 'LUCKY IN LOVE', dateStr = '12.09.26', color = 'rgba(35, 50, 75, 0.75)') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.15); // Authentic slight stamp tilt

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.8;

  // Outer circle with slight ink irregularity
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  // Curving text
  ctx.font = `bold ${Math.round(radius * 0.18)}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 0, -radius * 0.35);
  ctx.fillText('★ SNAPBOOTH ★', 0, radius * 0.35);

  // Date in center
  ctx.font = `900 ${Math.round(radius * 0.22)}px "DM Sans", sans-serif`;
  ctx.fillText(dateStr, 0, 0);

  // Wavy postal cancellation lines flowing to the right
  ctx.lineWidth = 1.8;
  const waveStartX = radius + 8;
  const waveEndX = radius + 110;
  const waveYOffsets = [-24, -8, 8, 24];

  waveYOffsets.forEach(wy => {
    ctx.beginPath();
    ctx.moveTo(waveStartX, wy);
    for (let wx = waveStartX; wx <= waveEndX; wx += 8) {
      const sinY = wy + Math.sin((wx - waveStartX) * 0.15) * 4;
      ctx.lineTo(wx, sinY);
    }
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Draws realistic fabric running stitches
 */
export function drawStitches(ctx, points, color = '#E6E8EE', lineWidth = 2, dash = [8, 6]) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1.5;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  if (Array.isArray(points[0])) {
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
  } else if (typeof points === 'object' && points.rect) {
    const { x, y, w, h, r = 0 } = points.rect;
    if (r > 0) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a realistic denim jeans back pocket with gold double stitching and copper rivet
 */
export function drawJeansPocket(ctx, x, y, width, height, emblemText = 'SB #1 NORRIS') {
  ctx.save();
  ctx.translate(x, y);

  // Pocket drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;

  const ptY = height;
  const sideH = height * 0.78;
  const w = width;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, sideH);
  ctx.lineTo(w / 2, ptY);
  ctx.lineTo(0, sideH);
  ctx.closePath();

  const pocketGrad = ctx.createLinearGradient(0, 0, 0, height);
  pocketGrad.addColorStop(0, '#263D62');
  pocketGrad.addColorStop(0.3, '#35527F');
  pocketGrad.addColorStop(0.7, '#23395C');
  pocketGrad.addColorStop(1, '#1A2943');
  ctx.fillStyle = pocketGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Double gold/amber stitching
  const goldStitch = '#D4A359';
  const stitchPoints1 = [
    [4, 4], [w - 4, 4], [w - 4, sideH - 2], [w / 2, ptY - 4], [4, sideH - 2], [4, 4]
  ];
  const stitchPoints2 = [
    [10, 10], [w - 10, 10], [w - 10, sideH - 6], [w / 2, ptY - 11], [10, sideH - 6], [10, 10]
  ];

  drawStitches(ctx, stitchPoints1, goldStitch, 2.2, [6, 4]);
  drawStitches(ctx, stitchPoints2, goldStitch, 2.2, [6, 4]);

  // Curved arch pocket stitch
  ctx.save();
  ctx.strokeStyle = goldStitch;
  ctx.lineWidth = 2.2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(14, sideH * 0.45);
  ctx.quadraticCurveTo(w / 4, sideH * 0.72, w / 2, sideH * 0.5);
  ctx.quadraticCurveTo((3 * w) / 4, sideH * 0.72, w - 14, sideH * 0.45);
  ctx.stroke();
  ctx.restore();

  // Copper Rivet
  ctx.save();
  ctx.fillStyle = '#C2843A';
  ctx.beginPath();
  ctx.arc(14, 14, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5A3812';
  ctx.beginPath();
  ctx.arc(14, 14, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Vintage emblem patch
  if (emblemText) {
    ctx.save();
    ctx.translate(w / 2, sideH * 0.48);
    ctx.rotate(-0.04);

    ctx.fillStyle = '#D9C6A5';
    ctx.strokeStyle = '#6E5230';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-52, -26, 104, 52);
    ctx.strokeRect(-52, -26, 104, 52);

    ctx.fillStyle = '#221911';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 17px "DM Sans", sans-serif';
    ctx.fillText('★ 1 ★', 0, -10);
    ctx.font = '800 13px "Courier New", monospace';
    ctx.fillText(emblemText, 0, 10);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws a large black vinyl record with realistic circular micro-grooves,
 * specular reflection arcs, and center label
 */
export function drawVinylRecord(ctx, cx, cy, radius = 340, labelText = 'STEREO') {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;

  ctx.fillStyle = '#101012';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Micro-grooves
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.055)';
  ctx.lineWidth = 1;
  const minR = radius * 0.38;
  for (let r = minR; r < radius - 8; r += 3.5) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Anisotropic specular sheen reflection cones
  const sheen = ctx.createRadialGradient(0, 0, minR, 0, 0, radius);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.07)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

  for (let angle of [-0.65, 0.9]) {
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, -0.28, 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, Math.PI - 0.28, Math.PI + 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Center Spindle Paper Label
  const labelR = radius * 0.34;
  ctx.fillStyle = '#F0ECE1';
  ctx.beginPath();
  ctx.arc(0, 0, labelR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#D1C9B7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, labelR - 4, 0, Math.PI * 2);
  ctx.stroke();

  // Label text
  ctx.fillStyle = '#2B2824';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 15px "DM Sans", sans-serif';
  ctx.fillText('SNAPBOOTH', 0, -labelR * 0.52);

  ctx.font = '800 11px monospace';
  ctx.fillText(labelText, 0, -labelR * 0.28);

  ctx.font = '10px "DM Sans", sans-serif';
  ctx.fillStyle = '#6E675D';
  ctx.fillText('SIDE A • 33⅓ RPM', 0, labelR * 0.35);
  ctx.fillText('HIGH FIDELITY STEREO', 0, labelR * 0.55);

  // Spindle hole
  ctx.fillStyle = '#FAFAF8';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#857D70';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws vintage store receipt with barcode, tracklist, and coffee stain
 */
export function drawReceipt(ctx, x, y, width, height) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.03);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = '#FAF7EE';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let sx = 0; sx < width; sx += 8) {
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx + 4, 3);
    ctx.lineTo(sx + 8, 0);
    ctx.fill();
  }

  ctx.shadowColor = 'transparent';

  ctx.fillStyle = '#3A3833';
  ctx.font = '700 12px "Courier New", monospace';
  ctx.textAlign = 'left';

  let py = 24;
  ctx.fillText('ORDER #0001 FOR SNAPBOOTH', 14, py); py += 16;
  ctx.fillText('SEP 12, 2026 12:00 PM', 14, py); py += 22;

  ctx.font = '900 13px "Courier New", monospace';
  ctx.fillText('BRUTAL', 14, py); py += 16;
  ctx.fillText('TRAITOR', 14, py); py += 16;
  ctx.fillText('DRIVERS LICENSE', 14, py); py += 16;
  ctx.fillText('1 STEP FORWARD, 3 STEPS BACK', 14, py); py += 16;
  ctx.fillText('DEJA VU', 14, py); py += 16;
  ctx.fillText('GOOD 4 U', 14, py); py += 20;

  ctx.font = '11px "Courier New", monospace';
  ctx.fillText('------------------------------', 14, py); py += 16;
  ctx.fillText('SUBTOTAL:           $ 00.00', 14, py); py += 16;
  ctx.fillText('MEMORIES:         PRICELESS', 14, py); py += 28;

  // Barcode
  const barH = 34;
  ctx.fillStyle = '#1A1916';
  let bx = 14;
  const barPattern = [2, 1, 4, 1, 2, 3, 1, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4, 3, 1, 2, 1, 3, 2];
  barPattern.forEach((w, i) => {
    if (i % 2 === 0) {
      ctx.fillRect(bx, py, w * 2.2, barH);
    }
    bx += w * 2.2;
  });
  py += barH + 14;

  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('1 2 7 1 1 2 0 1 7', width / 2, py); py += 14;
  ctx.fillText('KEEP FOR YOUR RECORDS', width / 2, py);

  // Coffee stain
  ctx.save();
  ctx.strokeStyle = 'rgba(160, 115, 75, 0.18)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(width * 0.72, height * 0.35, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * Draws delicate vintage blue floral lace pattern
 */
export function drawLaceOverlay(ctx, x, y, width, height) {
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.2;

  const grid = 22;
  for (let gx = 0; gx < width; gx += grid) {
    for (let gy = 0; gy < height; gy += grid) {
      ctx.beginPath();
      ctx.arc(gx + grid / 2, gy + grid / 2, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + grid, gy + grid);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(gx + grid, gy);
      ctx.lineTo(gx, gy + grid);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Draws vintage Polaroid OneStep instant camera
 */
export function drawRetroCamera(ctx, x, y, width = 280, height = 200) {
  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 7;

  // Camera body
  ctx.fillStyle = '#EFECE6';
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height * 0.76, [16, 16, 6, 6]);
  ctx.fill();

  // Dark lower base
  ctx.fillStyle = '#1D1D21';
  ctx.beginPath();
  ctx.roundRect(width * 0.05, height * 0.7, width * 0.9, height * 0.3, [4, 4, 12, 12]);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Rainbow stripe
  const rainbowColors = ['#E63946', '#F4A261', '#E9C46A', '#2A9D8F', '#264653'];
  const stripeW = 8;
  const stripeStartX = width * 0.22;
  rainbowColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(stripeStartX + i * stripeW, height * 0.77, stripeW, 10);
  });

  // "Polaroid" text
  ctx.fillStyle = '#EFECE6';
  ctx.font = 'bold 15px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Polaroid', width * 0.6, height * 0.86);

  // Lens assembly
  const lensCx = width / 2;
  const lensCy = height * 0.42;

  ctx.fillStyle = '#1E1E22';
  ctx.beginPath();
  ctx.arc(lensCx, lensCy, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0F1824';
  ctx.beginPath();
  ctx.arc(lensCx, lensCy, 40, 0, Math.PI * 2);
  ctx.fill();

  const opticGrad = ctx.createRadialGradient(lensCx - 10, lensCy - 10, 5, lensCx, lensCy, 36);
  opticGrad.addColorStop(0, 'rgba(92, 184, 150, 0.6)');
  opticGrad.addColorStop(0.6, 'rgba(40, 80, 110, 0.4)');
  opticGrad.addColorStop(1, 'rgba(10, 20, 35, 0.95)');
  ctx.fillStyle = opticGrad;
  ctx.beginPath();
  ctx.arc(lensCx, lensCy, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(lensCx - 6, lensCy - 6, 22, -Math.PI * 0.6, -Math.PI * 0.1);
  ctx.stroke();

  // Red Shutter Button
  ctx.fillStyle = '#E63946';
  ctx.beginPath();
  ctx.arc(width * 0.16, height * 0.58, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#9B1B26';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Flash Unit
  ctx.fillStyle = '#D3D0C8';
  ctx.fillRect(width * 0.12, height * 0.12, 38, 52);
  ctx.strokeStyle = '#A8A49C';
  ctx.lineWidth = 1.5;
  for (let fy = height * 0.14; fy < height * 0.12 + 50; fy += 6) {
    ctx.beginPath();
    ctx.moveTo(width * 0.12, fy);
    ctx.lineTo(width * 0.12 + 38, fy);
    ctx.stroke();
  }

  // Viewfinder
  ctx.fillStyle = '#1B1B1E';
  ctx.beginPath();
  ctx.roundRect(width * 0.74, height * 0.14, 38, 38, 8);
  ctx.fill();
  ctx.fillStyle = '#4080B0';
  ctx.beginPath();
  ctx.roundRect(width * 0.77, height * 0.17, 26, 26, 4);
  ctx.fill();

  ctx.fillStyle = '#222';
  ctx.font = 'bold 12px "DM Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('OneStep 2', width * 0.88, height * 0.6);

  ctx.restore();
}

/**
 * Draws vintage telephone handset and coiled curly cord
 */
export function drawCurlyPhoneCord(ctx, startX, startY, endX, endY) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;

  ctx.fillStyle = '#1A1A1E';
  const hx = endX;
  const hy = endY;

  ctx.beginPath();
  ctx.roundRect(hx - 22, hy - 40, 44, 110, 20);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(hx, hy - 32, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx, hy + 62, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(hx - 10, hy - 34, 16, -Math.PI * 0.7, -Math.PI * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(hx - 10, hy + 60, 16, -Math.PI * 0.7, -Math.PI * 0.2);
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = '#282830';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  const loops = 18;
  const loopH = (hy - 60 - startY) / loops;
  const loopW = 18;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  for (let i = 0; i < loops; i++) {
    const cy = startY + i * loopH;
    ctx.bezierCurveTo(
      startX - loopW, cy + loopH * 0.3,
      startX + loopW, cy + loopH * 0.7,
      startX, cy + loopH
    );
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws plastic googly eyes
 */
export function drawGooglyEyes(ctx, x, y, size = 32) {
  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = '#FAFAF8';
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(size * 0.12, size * 0.1, size * 0.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FAFAF8';
  ctx.beginPath();
  ctx.arc(size * 1.25, -size * 0.15, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(size * 1.35, -size * 0.05, size * 0.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws 3D puffy metallic chrome star
 */
export function drawChromeStar(ctx, cx, cy, size = 68) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;

  const grad = ctx.createRadialGradient(-size * 0.2, -size * 0.2, size * 0.05, 0, 0, size);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.2, '#E2E8F0');
  grad.addColorStop(0.5, '#718096');
  grad.addColorStop(0.8, '#2D3748');
  grad.addColorStop(1, '#A0AEC0');

  ctx.fillStyle = grad;

  const s = size * 0.9;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.15, -s * 0.15, s, 0);
  ctx.quadraticCurveTo(s * 0.15, s * 0.15, 0, s);
  ctx.quadraticCurveTo(-s * 0.15, s * 0.15, -s, 0);
  ctx.quadraticCurveTo(-s * 0.15, -s * 0.15, 0, -s);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, -size * 0.15);
  ctx.quadraticCurveTo(-size * 0.1, -size * 0.1, 0, -size * 0.5);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws cute original Beagle Dog fabric patch mascot
 */
export function drawMascotPatch(ctx, x, y, size = 110) {
  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.38)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;

  const w = size;
  const h = size * 1.35;

  ctx.fillStyle = '#EBDDC5';
  ctx.beginPath();
  ctx.roundRect(-w * 0.5, -h * 0.5, w, h, 28);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  drawStitches(ctx, { rect: { x: -w * 0.46, y: -h * 0.46, w: w * 0.92, h: h * 0.92, r: 24 } }, '#9E8563', 1.8, [4, 3]);

  // Head
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, -h * 0.18, w * 0.34, 0, Math.PI * 2);
  ctx.fill();

  // Beagle ears
  ctx.fillStyle = '#1E2A44';
  ctx.beginPath();
  ctx.ellipse(-w * 0.28, -h * 0.22, w * 0.14, h * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.28, -h * 0.22, w * 0.14, h * 0.18, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Sunglasses
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.roundRect(-w * 0.28, -h * 0.25, w * 0.26, h * 0.1, 6);
  ctx.roundRect(w * 0.02, -h * 0.25, w * 0.26, h * 0.1, 6);
  ctx.fill();

  ctx.fillRect(-w * 0.04, -h * 0.22, w * 0.08, 4);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(-w * 0.24, -h * 0.23, 8, 3);
  ctx.fillRect(w * 0.06, -h * 0.23, 8, 3);

  // Snout
  ctx.fillStyle = '#1F2937';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.09, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Orange hoodie
  ctx.fillStyle = '#E65A36';
  ctx.beginPath();
  ctx.roundRect(-w * 0.28, -h * 0.02, w * 0.56, h * 0.38, 14);
  ctx.fill();

  // White paws
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-w * 0.14, h * 0.34, 12, 0, Math.PI * 2);
  ctx.arc(w * 0.14, h * 0.34, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws vintage metal safety pin
 */
export function drawSafetyPin(ctx, x, y, length = 110, angle = 0.4) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  const w = length;
  const pinColor = '#C5B59C';
  const darkEdge = '#645743';

  ctx.strokeStyle = pinColor;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(w - 24, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(14, 8, 10, -Math.PI * 0.5, Math.PI * 0.8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(14 + 7, 16);
  ctx.lineTo(w - 18, 16);
  ctx.stroke();

  ctx.fillStyle = pinColor;
  ctx.strokeStyle = darkEdge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(w - 26, -6, 26, 28, 4);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws layered denim star patch
 */
export function drawDenimStar(ctx, cx, cy, size = 70, angle = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;

  const drawStarPath = (r) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x1 = Math.cos(a) * r;
      const y1 = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);

      const a2 = a + Math.PI / 5;
      const x2 = Math.cos(a2) * (r * 0.45);
      const y2 = Math.sin(a2) * (r * 0.45);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
  };

  drawStarPath(size);
  ctx.fillStyle = '#4A6B9C';
  ctx.fill();

  ctx.shadowColor = 'transparent';
  drawStarPath(size * 0.72);
  ctx.fillStyle = '#1A2943';
  ctx.fill();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 3]);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws realistic 35mm film negative border with sprocket perforations
 */
export function drawFilmSprockets(ctx, x, y, width, height, frameNumbers = ['4', '3', '3A', '2A']) {
  ctx.save();
  ctx.fillStyle = '#0E0D12';
  ctx.fillRect(x, y, width, height);

  const holeW = 15;
  const holeH = 11;
  const holeR = 2.5;
  const marginL = x + 7;
  const marginR = x + width - holeW - 7;
  const spacing = 28;

  ctx.fillStyle = '#FFFFFF';
  for (let py = y + 14; py < y + height - 14; py += spacing) {
    ctx.beginPath();
    ctx.roundRect(marginL, py, holeW, holeH, holeR);
    ctx.roundRect(marginR, py, holeW, holeH, holeR);
    ctx.fill();
  }

  ctx.fillStyle = '#F4A261';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';

  const markStep = height / (frameNumbers.length || 4);
  frameNumbers.forEach((num, idx) => {
    const my = y + idx * markStep + markStep * 0.5;
    ctx.fillText(`▶ ${num}`, marginL + holeW + 6, my);
    ctx.fillText('SAFETY FILM', marginL + holeW + 6, my + 14);
  });

  ctx.restore();
}

/**
 * Draws a classic Polaroid frame with soft shadow and wide bottom chin
 */
export function drawPolaroidFrame(ctx, x, y, width, height, chinHeight = 60, options = {}) {
  ctx.save();
  ctx.translate(x, y);
  if (options.rotation) {
    ctx.rotate(options.rotation);
  }

  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 8;

  ctx.fillStyle = options.bgColor || '#FDFCFA';
  ctx.fillRect(-width / 2, -height / 2, width, height);

  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-width / 2, -height / 2, width, height);

  ctx.restore();
}

/**
 * Draws vintage newspaper masthead inspired by New York Times reference
 */
export function drawNewspaperHeader(ctx, width, title = 'The Daily Chronicle', subtitle = "All the Memories That's Fit to Print", dateStr = 'Saturday, February 23, 2026') {
  ctx.save();
  // Double top rule
  ctx.strokeStyle = '#18181A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(35, 45);
  ctx.lineTo(width - 35, 45);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, 50);
  ctx.lineTo(width - 35, 50);
  ctx.stroke();

  // Left ear motto
  ctx.font = 'italic 11px Georgia, serif';
  ctx.fillStyle = '#222226';
  ctx.textAlign = 'left';
  ctx.fillText(subtitle, 40, 72);

  // Right ear edition
  ctx.textAlign = 'right';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText('SPECIAL EDITION ★', width - 40, 72);

  // Main Masthead Title
  ctx.textAlign = 'center';
  ctx.font = '900 48px "Playfair Display", "Times New Roman", Georgia, serif';
  ctx.fillText(title, width / 2, 125);

  // Bottom dateline bar between double rules
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, 145);
  ctx.lineTo(width - 35, 145);
  ctx.moveTo(35, 165);
  ctx.lineTo(width - 35, 165);
  ctx.stroke();

  ctx.font = '11px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('VOL. CXXIV ... No. 4,812', 40, 158);
  ctx.textAlign = 'center';
  ctx.fillText(dateStr, width / 2, 158);
  ctx.textAlign = 'right';
  ctx.fillText('PRICE $2.50', width - 40, 158);

  ctx.restore();
}

/**
 * Draws a torn deckle-edge newspaper clipping photo frame
 */
export function drawTornNewspaperFrame(ctx, x, y, width, height, headline = 'BREAKING MEMORY') {
  ctx.save();
  ctx.translate(x, y);

  // Soft drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;

  // Aged newsprint clipping background
  ctx.fillStyle = '#FAF7EE';
  ctx.fillRect(-width / 2 - 16, -height / 2 - 32, width + 32, height + 56);
  ctx.shadowColor = 'transparent';

  // Headline on clipping
  ctx.fillStyle = '#111';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(headline.toUpperCase(), -width / 2 - 10, -height / 2 - 14);

  // Column rule and article filler lines
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = '#666';
  ctx.beginPath();
  ctx.moveTo(-width / 2 - 12, height / 2 + 8);
  ctx.lineTo(width / 2 + 12, height / 2 + 8);
  ctx.stroke();

  ctx.fillStyle = '#444';
  ctx.font = '8px "Times New Roman", serif';
  ctx.fillText('Yesterday, amid joyful smiles and unforgettable light, memorable poses were captured.', -width / 2 - 10, height / 2 + 18);

  ctx.restore();
}

/**
 * Draws retro music player widget inspired by media reference
 */
export function drawMusicPlayerCard(ctx, x, y, width, height, title = 'For You Memories') {
  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;

  // Dark card
  ctx.fillStyle = '#141418';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 18);
    ctx.fill();
  } else {
    ctx.fillRect(-width / 2, -height / 2, width, height);
  }
  ctx.shadowColor = 'transparent';

  // White header
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "DM Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, -width / 2 + 24, -height / 2 + 32);

  ctx.fillStyle = '#8E8E93';
  ctx.font = '12px "DM Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('See All', width / 2 - 24, -height / 2 + 32);

  ctx.restore();
}
