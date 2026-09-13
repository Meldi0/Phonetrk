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
  ctx.fillText('★ CISSPIC ★', 0, radius * 0.35);

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
  ctx.fillText('CISSPIC', 0, -labelR * 0.52);

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
  ctx.fillText('ORDER #0001 FOR CISSPIC', 14, py); py += 16;
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

/**
 * Draws Denim & White Lace with Burgundy Polka Dots background (Ref Image 3)
 */
export function drawLaceDenimBackground(ctx, width, height) {
  ctx.save();

  // 1. Right area: Deep Burgundy Red with White Polka Dots
  ctx.fillStyle = '#6B101E'; // rich velvety burgundy red
  ctx.fillRect(0, 0, width, height);

  // White polka dot grid
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  const dotSpacing = 38;
  for (let dy = -dotSpacing; dy < height + dotSpacing; dy += dotSpacing) {
    const rowIdx = Math.floor(dy / dotSpacing);
    const offsetX = (rowIdx % 2 === 0) ? 0 : dotSpacing / 2;
    for (let dx = 180 + offsetX; dx < width + dotSpacing; dx += dotSpacing) {
      ctx.beginPath();
      ctx.arc(dx, dy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Left side: Authentic Denim Strip (~210px)
  const denimW = 195;
  const denimPattern = createDenimPattern(ctx, 'navy');
  ctx.fillStyle = denimPattern;
  ctx.fillRect(0, 0, denimW, height);

  // Denim edge seam shadow
  const grad = ctx.createLinearGradient(denimW - 10, 0, denimW + 15, 0);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(denimW - 10, 0, 25, height);

  // Golden copper seam stitches on denim edge
  drawStitches(ctx, [{ x: denimW - 22, y: 0 }, { x: denimW - 22, y: height }], '#C8963E', 2.5, [10, 6]);
  drawStitches(ctx, [{ x: denimW - 32, y: 0 }, { x: denimW - 32, y: height }], '#DDB055', 1.8, [8, 5]);

  // 3. Intricate White Lace Trim along the seam
  ctx.save();
  ctx.translate(denimW - 20, 0);
  // Scalloped lace border
  const scallopR = 14;
  for (let ly = 0; ly < height; ly += scallopR * 2) {
    // Semi-transparent lace background
    ctx.fillStyle = 'rgba(253, 250, 244, 0.88)';
    ctx.beginPath();
    ctx.arc(15, ly + scallopR, scallopR, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Floral lace loops & picots
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(15, ly + scallopR, scallopR, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Inner eyelet dots
    ctx.fillStyle = '#6B101E';
    ctx.beginPath();
    ctx.arc(15 + scallopR * 0.45, ly + scallopR, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Small lace decorative dots
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(6, ly + scallopR - 5, 1.8, 0, Math.PI * 2);
    ctx.arc(6, ly + scallopR + 5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}

/**
 * Draws Vintage Silver Canon Digicam Frame (Ref Image 4)
 * Places a silver compact digital camera with LCD screen cutout at [x, y]
 */
export function drawVintageDigicam(ctx, x, y, width, height, options = {}) {
  ctx.save();
  ctx.translate(x, y);
  if (options.rotation) {
    ctx.rotate(options.rotation);
  }

  const w = width;
  const h = height;

  // Camera drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;

  // Outer camera body (Champagne silver metallic rounded rectangle)
  const bodyRadius = 24;
  const bodyGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  bodyGrad.addColorStop(0, '#E4E3DE');
  bodyGrad.addColorStop(0.3, '#C7C5BD');
  bodyGrad.addColorStop(0.7, '#DEDCD6');
  bodyGrad.addColorStop(1, '#B0AEA6');

  ctx.fillStyle = bodyGrad;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, bodyRadius);
    ctx.fill();
  } else {
    ctx.fillRect(-w / 2, -h / 2, w, h);
  }
  ctx.shadowColor = 'transparent';

  // Inner beveled highlight edge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 3;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, bodyRadius - 2);
    ctx.stroke();
  }

  // Top camera details (flash, optical viewfinder window, red LED)
  // Optical viewfinder
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-w / 2 + 230, -h / 2 + 38, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Glass reflection on viewfinder
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(-w / 2 + 226, -h / 2 + 34, 4, 0, Math.PI * 2);
  ctx.fill();

  // Mode / Flash window
  ctx.fillStyle = '#333';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(w / 2 - 250, -h / 2 + 22, 95, 30, 6);
    ctx.fill();
  }
  // Flash grooves
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  for (let fx = w / 2 - 245; fx < w / 2 - 160; fx += 8) {
    ctx.beginPath();
    ctx.moveTo(fx, -h / 2 + 24);
    ctx.lineTo(fx, -h / 2 + 50);
    ctx.stroke();
  }

  // Canon Logo above LCD
  ctx.fillStyle = '#242220';
  ctx.font = 'bold italic 22px "Times New Roman", serif';
  ctx.textAlign = 'left';
  ctx.fillText('Canon', -w / 2 + 80, -h / 2 + 96);

  // Right-hand side circular Control Wheel (Jog dial)
  const dialX = w / 2 - 125;
  const dialY = 0;
  const dialR = 70;

  // Dial outer ring
  const dialGrad = ctx.createRadialGradient(dialX, dialY, 20, dialX, dialY, dialR);
  dialGrad.addColorStop(0, '#E8E7E2');
  dialGrad.addColorStop(0.8, '#BEBCB4');
  dialGrad.addColorStop(1, '#9C9A92');
  ctx.fillStyle = dialGrad;
  ctx.beginPath();
  ctx.arc(dialX, dialY, dialR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#777';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dial center button (FUNC SET)
  ctx.fillStyle = '#333';
  ctx.font = 'bold 9px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('JUMP', dialX, dialY - 50);
  ctx.fillText('FUNC', dialX, dialY - 6);
  ctx.fillText('SET', dialX, dialY + 6);

  // Small playback and menu buttons
  const btnY = dialY - dialR - 35;
  ctx.fillStyle = '#CFCDBF';
  ctx.beginPath();
  ctx.arc(dialX - 35, btnY, 14, 0, Math.PI * 2);
  ctx.arc(dialX + 35, btnY, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws cute fabric ribbon bow (for Cute templates)
 */
export function drawFabricBow(ctx, cx, cy, size = 60, color = '#E63946') {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = color;

  // Left Loop
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.6, -size * 0.5, -size, -size * 0.2, -size * 0.8, size * 0.2);
  ctx.bezierCurveTo(-size * 0.6, size * 0.4, -size * 0.2, size * 0.2, 0, 0);
  ctx.fill();

  // Right Loop
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.6, -size * 0.5, size, -size * 0.2, size * 0.8, size * 0.2);
  ctx.bezierCurveTo(size * 0.6, size * 0.4, size * 0.2, size * 0.2, 0, 0);
  ctx.fill();

  // Left Ribbon Tail
  ctx.beginPath();
  ctx.moveTo(-4, 4);
  ctx.lineTo(-size * 0.5, size * 0.8);
  ctx.lineTo(-size * 0.35, size * 0.7);
  ctx.lineTo(-size * 0.2, size * 0.8);
  ctx.lineTo(0, 4);
  ctx.fill();

  // Right Ribbon Tail
  ctx.beginPath();
  ctx.moveTo(4, 4);
  ctx.lineTo(size * 0.5, size * 0.8);
  ctx.lineTo(size * 0.35, size * 0.7);
  ctx.lineTo(size * 0.2, size * 0.8);
  ctx.lineTo(0, 4);
  ctx.fill();

  // Center knot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.16, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws cute twin cherries with leaf
 */
export function drawCuteCherries(ctx, cx, cy, size = 50) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  // Stems (curved brown-green lines meeting at top)
  ctx.strokeStyle = '#4A6B3A';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, size * 0.3);
  ctx.quadraticCurveTo(-size * 0.1, -size * 0.4, 0, -size * 0.6);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(size * 0.3, size * 0.4);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.3, 0, -size * 0.6);
  ctx.stroke();

  // Leaf
  ctx.fillStyle = '#588157';
  ctx.beginPath();
  ctx.ellipse(size * 0.2, -size * 0.65, size * 0.25, size * 0.12, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Cherries (glossy deep red spheres)
  // Left cherry
  const grad1 = ctx.createRadialGradient(-size * 0.3 - 4, size * 0.3 - 4, 2, -size * 0.3, size * 0.3, size * 0.3);
  grad1.addColorStop(0, '#FF4D6D');
  grad1.addColorStop(0.7, '#C9184A');
  grad1.addColorStop(1, '#800F2F');
  ctx.fillStyle = grad1;
  ctx.beginPath();
  ctx.arc(-size * 0.3, size * 0.3, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Right cherry
  const grad2 = ctx.createRadialGradient(size * 0.3 - 4, size * 0.4 - 4, 2, size * 0.3, size * 0.4, size * 0.3);
  grad2.addColorStop(0, '#FF4D6D');
  grad2.addColorStop(0.7, '#C9184A');
  grad2.addColorStop(1, '#800F2F');
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.arc(size * 0.3, size * 0.4, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(-size * 0.38, size * 0.22, size * 0.07, 0, Math.PI * 2);
  ctx.arc(size * 0.22, size * 0.32, size * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws translucent Washi Tape strip with jagged torn ends
 */
export function drawWashiTapeStrip(ctx, x, y, width, height, color = 'rgba(240, 225, 200, 0.8)', angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-width / 2, -height / 2);
  // Top edge
  ctx.lineTo(width / 2, -height / 2);
  // Right jagged edge
  for (let step = 0; step < 5; step++) {
    const jy = -height / 2 + ((step + 0.5) * height) / 5;
    const jx = width / 2 + (step % 2 === 0 ? 5 : -4);
    ctx.lineTo(jx, jy);
  }
  ctx.lineTo(width / 2, height / 2);
  // Bottom edge
  ctx.lineTo(-width / 2, height / 2);
  // Left jagged edge
  for (let step = 0; step < 5; step++) {
    const jy = height / 2 - ((step + 0.5) * height) / 5;
    const jx = -width / 2 + (step % 2 === 0 ? -5 : 4);
    ctx.lineTo(jx, jy);
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Generates yellow Lego stud pattern
 */
export function createLegoPattern(ctx, baseColor = '#F5AF00') {
  const size = 60;
  const off = createOffscreen(size, size);
  const octx = off.getContext('2d');

  octx.fillStyle = baseColor;
  octx.fillRect(0, 0, size, size);

  // 3D Stud circle layers
  octx.fillStyle = '#E0A100';
  octx.globalAlpha = 0.45;
  octx.beginPath();
  octx.arc(30, 30, 19, 0, Math.PI * 2);
  octx.fill();

  octx.globalAlpha = 1.0;
  octx.fillStyle = '#FFD13B';
  octx.beginPath();
  octx.arc(28, 27, 17, 0, Math.PI * 2);
  octx.fill();

  octx.fillStyle = '#FFDB4D';
  octx.beginPath();
  octx.arc(27, 25, 14, 0, Math.PI * 2);
  octx.fill();

  octx.fillStyle = '#FFE76A';
  octx.globalAlpha = 0.6;
  octx.beginPath();
  octx.arc(25, 23, 10, 0, Math.PI * 2);
  octx.fill();
  octx.globalAlpha = 1.0;

  return ctx.createPattern(off, 'repeat');
}

export function drawModernPaperclip(ctx, x, y, scale = 1, angle = -0.6) {
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 4;

  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.lineTo(0, 20);
  ctx.arc(15, 20, 15, Math.PI, 0, false);
  ctx.lineTo(30, 80);
  ctx.arc(5, 80, 25, 0, Math.PI, false);
  ctx.lineTo(-20, 10);
  ctx.arc(15, 10, 35, Math.PI, 0, false);
  ctx.lineTo(50, 70);
  ctx.stroke();

  // White specular highlight
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.lineTo(0, 20);
  ctx.arc(15, 20, 15, Math.PI, 0, false);
  ctx.lineTo(30, 80);
  ctx.arc(5, 80, 25, 0, Math.PI, false);
  ctx.lineTo(-20, 10);
  ctx.arc(15, 10, 35, Math.PI, 0, false);
  ctx.lineTo(50, 70);
  ctx.stroke();

  ctx.restore();
}

export function drawHolographicMiniCd(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;

  // Sheen gradient
  const sheen = ctx.createLinearGradient(-50, -50, 50, 50);
  sheen.addColorStop(0, '#E0E7FF');
  sheen.addColorStop(0.25, '#FBCFE8');
  sheen.addColorStop(0.5, '#FEF08A');
  sheen.addColorStop(0.75, '#A7F3D0');
  sheen.addColorStop(1, '#BAE6FD');

  ctx.fillStyle = sheen;
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(45, 45, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(45, 45, 46, 0, Math.PI * 2);
  ctx.stroke();

  // Spindle ring
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#94A3B8';
  ctx.beginPath();
  ctx.arc(45, 45, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Center hole
  ctx.fillStyle = '#F5AF00';
  ctx.beginPath();
  ctx.arc(45, 45, 8, 0, Math.PI * 2);
  ctx.fill();

  // Arc groove
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.arc(45, 45, 30, Math.PI * 0.7, Math.PI * 1.3);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label text
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 7px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SWEET MEMORIES • 2026', 45, 26);

  ctx.restore();
}

export function drawFriedEggSticker(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // Organic egg white shape
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(35, 10);
  ctx.bezierCurveTo(60, 5, 85, 20, 80, 45);
  ctx.bezierCurveTo(75, 70, 60, 80, 35, 75);
  ctx.bezierCurveTo(10, 70, 0, 55, 5, 35);
  ctx.bezierCurveTo(10, 15, 20, 12, 35, 10);
  ctx.closePath();
  ctx.fill();

  // Yolk with warm orange-gold radial gradient
  const yolkGrad = ctx.createRadialGradient(42, 42, 2, 45, 45, 18);
  yolkGrad.addColorStop(0, '#FFB703');
  yolkGrad.addColorStop(0.7, '#FB8500');
  yolkGrad.addColorStop(1, '#D46000');

  ctx.fillStyle = yolkGrad;
  ctx.beginPath();
  ctx.arc(45, 45, 18, 0, Math.PI * 2);
  ctx.fill();

  // White gloss highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.ellipse(40, 39, 5, 3, -0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawRetroUfoAlien(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;

  // Glass dome
  ctx.fillStyle = 'rgba(186, 230, 253, 0.8)';
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(65, 40, 32, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cute green alien
  ctx.fillStyle = '#A7F3D0';
  ctx.beginPath();
  ctx.arc(65, 42, 15, 0, Math.PI * 2);
  ctx.fill();

  // Alien eyes & smile
  ctx.fillStyle = '#065F46';
  ctx.beginPath();
  ctx.arc(60, 38, 2.5, 0, Math.PI * 2);
  ctx.arc(70, 38, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#065F46';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(65, 45, 4, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Flying saucer rim
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(65, 56, 60, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner saucer top
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.ellipse(65, 54, 45, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Indicator lights
  const lights = [
    { x: 35, y: 58, color: '#EF4444' },
    { x: 50, y: 62, color: '#3B82F6' },
    { x: 65, y: 63, color: '#22C55E' },
    { x: 80, y: 62, color: '#A855F7' },
    { x: 95, y: 58, color: '#EC4899' },
  ];
  lights.forEach(l => {
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

export function drawLemonSlice(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  const lemonGrad = ctx.createRadialGradient(40, 40, 5, 40, 40, 38);
  lemonGrad.addColorStop(0, '#FEF08A');
  lemonGrad.addColorStop(0.7, '#FACC15');
  lemonGrad.addColorStop(1, '#CA8A04');

  ctx.fillStyle = lemonGrad;
  ctx.beginPath();
  ctx.arc(40, 40, 38, 0, Math.PI * 2);
  ctx.fill();

  // White pith
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(40, 40, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(40, 40, 30, 0, Math.PI * 2);
  ctx.fill();

  // 8 pulp segments
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const a1 = (i * Math.PI) / 4 + 0.08;
    const a2 = ((i + 1) * Math.PI) / 4 - 0.08;
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.arc(40, 40, 26, a1, a2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Center core
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(40, 40, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawOffTheWallPill(ctx, x, y, angle = -0.14, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;

  // Navy pill base with white border
  const w = 165;
  const h = 52;
  ctx.fillStyle = '#1E3A8A';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 0, w, h, 26);
  else ctx.rect(0, 0, w, h);
  ctx.fill();
  ctx.stroke();

  // Inner dashed border
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#93C5FD';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(4, 4, w - 8, h - 8, 22);
  else ctx.rect(4, 4, w - 8, h - 8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Typography
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 14px "Arial Black", Impact, sans-serif';
  ctx.fillText('OFF THE WALL', w / 2, 25);

  ctx.fillStyle = '#93C5FD';
  ctx.font = '700 9px -apple-system, sans-serif';
  ctx.fillText('STAY CURIOUS', w / 2, 40);

  ctx.restore();
}

export function drawIosPhotoCardFrame(ctx, x, y, width, height, slotX, slotY, slotW, slotH, timestamp) {
  ctx.save();

  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 10;

  // White Card Outer Frame
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, width, height, 20);
  else ctx.rect(x, y, width, height);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Date and Time calculation
  const d = timestamp ? new Date(timestamp) : new Date();
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // 1. Header Section
  const headerH = slotY - y;
  // Back Chevron (<)
  ctx.strokeStyle = '#007AFF';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 35, y + headerH * 0.35);
  ctx.lineTo(x + 24, y + headerH * 0.5);
  ctx.lineTo(x + 35, y + headerH * 0.65);
  ctx.stroke();

  // Date & Time center text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#111827';
  ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Today', x + width / 2, y + headerH * 0.44);

  ctx.fillStyle = '#8E8E93';
  ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(timeStr || '9:41 AM', x + width / 2, y + headerH * 0.72);

  // Edit Action (Right)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#007AFF';
  ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Edit', x + width - 30, y + headerH * 0.58);

  // Header bottom hairline divider
  ctx.strokeStyle = '#F2F2F7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, slotY);
  ctx.lineTo(x + width, slotY);
  ctx.stroke();

  // 2. Footer Section
  const footerY = slotY + slotH;
  const footerH = y + height - footerY;

  // Footer top hairline divider
  ctx.strokeStyle = '#E5E5EA';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, footerY);
  ctx.lineTo(x + width, footerY);
  ctx.stroke();

  // Share icon (Left)
  ctx.strokeStyle = '#007AFF';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  const shareX = x + 35;
  const shareY = footerY + footerH * 0.35;
  if (ctx.roundRect) ctx.roundRect(shareX, shareY + 8, 20, 18, 4);
  else ctx.rect(shareX, shareY + 8, 20, 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(shareX + 10, shareY + 15);
  ctx.lineTo(shareX + 10, shareY);
  ctx.lineTo(shareX + 5, shareY + 5);
  ctx.moveTo(shareX + 10, shareY);
  ctx.lineTo(shareX + 15, shareY + 5);
  ctx.stroke();

  // Heart icon (Center)
  const hx = x + width / 2;
  const hy = footerY + footerH * 0.36;
  ctx.beginPath();
  ctx.moveTo(hx, hy + 5);
  ctx.bezierCurveTo(hx - 10, hy - 4, hx - 16, hy + 4, hx, hy + 20);
  ctx.bezierCurveTo(hx + 16, hy + 4, hx + 10, hy - 4, hx, hy + 5);
  ctx.stroke();

  // Trash icon (Right)
  const tx = x + width - 50;
  const ty = footerY + footerH * 0.35;
  ctx.beginPath();
  ctx.moveTo(tx, ty + 6);
  ctx.lineTo(tx + 18, ty + 6);
  ctx.moveTo(tx + 5, ty + 6);
  ctx.lineTo(tx + 5, ty + 2);
  ctx.lineTo(tx + 13, ty + 2);
  ctx.lineTo(tx + 13, ty + 6);
  ctx.moveTo(tx + 2, ty + 6);
  ctx.lineTo(tx + 4, ty + 22);
  ctx.lineTo(tx + 14, ty + 22);
  ctx.lineTo(tx + 16, ty + 6);
  ctx.stroke();

  ctx.restore();
}

export function createGinghamPattern(ctx, baseColor = '#FCF3EE', stripeColor = '#F37C76') {
  const size = 100;
  const off = createOffscreen(size, size);
  const octx = off.getContext('2d');

  octx.fillStyle = baseColor;
  octx.fillRect(0, 0, size, size);

  octx.fillStyle = stripeColor;
  octx.globalAlpha = 0.3;
  octx.fillRect(0, 0, 50, 100);
  octx.fillRect(0, 0, 100, 50);
  octx.globalAlpha = 1.0;

  return ctx.createPattern(off, 'repeat');
}

export function drawRetroStorybooks(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;

  // Book 1: Red "STORY" (rotate -5 deg)
  ctx.save();
  ctx.rotate(-0.09);
  ctx.fillStyle = '#D02D2C';
  if (ctx.roundRect) ctx.roundRect(0, 0, 200, 32, 4);
  else ctx.fillRect(0, 0, 200, 32);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STORY', 100, 21);
  ctx.restore();

  // Book 2: Yellow "FUN TALES" (rotate +2 deg)
  ctx.save();
  ctx.translate(-30, 42);
  ctx.rotate(0.04);
  ctx.fillStyle = '#FCD78C';
  if (ctx.roundRect) ctx.roundRect(0, 0, 250, 36, 4);
  else ctx.fillRect(0, 0, 250, 36);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#3A404C';
  ctx.font = 'bold 15px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FUN TALES', 125, 24);
  ctx.restore();

  ctx.restore();
}

export function drawRetroPayphoneIcon(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;

  // Red phone booth box
  ctx.fillStyle = '#D02D2C';
  if (ctx.roundRect) ctx.roundRect(0, 0, 100, 150, 8);
  else ctx.fillRect(0, 0, 100, 150);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(20, 20, 60, 90);

  // Keypad grid lines
  ctx.beginPath();
  ctx.moveTo(30, 42); ctx.lineTo(70, 42);
  ctx.moveTo(30, 65); ctx.lineTo(70, 65);
  ctx.moveTo(30, 88); ctx.lineTo(70, 88);
  ctx.stroke();

  ctx.restore();
}

export function drawRetroHandheldConsole(ctx, x, y, width, height, options = {}) {
  const {
    color = '#586BA4',
    title = "MEOW'S ADVENTURE",
    leftText1 = 'FUN',
    leftText2 = 'PLAY!',
    screenX = x + 150,
    screenY = y + 50,
    screenW = width - 300,
    screenH = height - 100,
  } = options;

  ctx.save();

  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;

  // Console outer shell
  ctx.fillStyle = color;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, width, height, 32);
  else ctx.rect(x, y, width, height);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Title above screen
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px Verdana, sans-serif';
  ctx.fillText(title, x + width / 2, screenY - 14);

  // Left Controls
  const leftCX = x + (screenX - x) / 2;
  // Left Analog Joystick
  ctx.fillStyle = '#FCF3EE';
  ctx.beginPath();
  ctx.arc(leftCX, screenY + screenH * 0.35, 30, 0, Math.PI * 2);
  ctx.fill();

  // D-Pad
  const dpadY = screenY + screenH * 0.72;
  ctx.strokeStyle = '#FCF3EE';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(leftCX - 22, dpadY);
  ctx.lineTo(leftCX + 22, dpadY);
  ctx.moveTo(leftCX, dpadY - 22);
  ctx.lineTo(leftCX, dpadY + 22);
  ctx.stroke();

  // Left texts
  ctx.fillStyle = '#3A404C';
  ctx.font = 'bold 15px Verdana, sans-serif';
  ctx.fillText(leftText1, leftCX, screenY + screenH * 0.15);
  ctx.fillText(leftText2, leftCX, screenY + screenH * 0.95);

  // Right Controls
  const rightCX = screenX + screenW + (x + width - (screenX + screenW)) / 2;
  // Action buttons (A, B, X, Y)
  ctx.fillStyle = '#FCF3EE';
  ctx.beginPath();
  ctx.arc(rightCX, screenY + screenH * 0.25, 26, 0, Math.PI * 2);
  ctx.fill();

  // Right Analog Joystick
  ctx.beginPath();
  ctx.arc(rightCX, screenY + screenH * 0.72, 30, 0, Math.PI * 2);
  ctx.fill();

  // Bottom small option pills
  ctx.beginPath();
  ctx.arc(leftCX, y + height - 28, 9, 0, Math.PI * 2);
  ctx.arc(rightCX, y + height - 28, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function createNotebookGridPattern(ctx, bg = '#F6F2E7', grid = '#DFD7C2') {
  const size = 24;
  const off = createOffscreen(size, size);
  const octx = off.getContext('2d');

  octx.fillStyle = bg;
  octx.fillRect(0, 0, size, size);

  octx.strokeStyle = grid;
  octx.lineWidth = 0.9;
  octx.beginPath();
  octx.moveTo(size, 0);
  octx.lineTo(0, 0);
  octx.lineTo(0, size);
  octx.stroke();

  return ctx.createPattern(off, 'repeat');
}

export function drawPolaroidInstantCamera(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(44, 62, 80, 0.28)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 12;

  // Main Camera Body (300 x 235)
  const bodyGrad = ctx.createLinearGradient(0, 0, 0, 235);
  bodyGrad.addColorStop(0, '#FDFDFD');
  bodyGrad.addColorStop(0.85, '#EAEAEA');
  bodyGrad.addColorStop(1, '#D5D5D5');

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#DCDCDC';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 0, 300, 235, 28);
  else ctx.rect(0, 0, 300, 235);
  ctx.fill();
  ctx.stroke();

  // Inner highlight
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(5, 5, 290, 225, 24);
  ctx.stroke();

  // Viewfinder (Top Right: 210, 18, 60x42)
  ctx.fillStyle = '#2B2D42';
  ctx.strokeStyle = '#4A4E69';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(210, 18, 60, 42, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1B1C24';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(216, 23, 48, 32, 6);
  ctx.fill();

  ctx.fillStyle = 'rgba(67, 97, 238, 0.4)';
  ctx.beginPath();
  ctx.arc(240, 39, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(243, 36, 4, 0, Math.PI * 2);
  ctx.fill();

  // Flash Unit (Top Left: 25, 16, 64x62)
  ctx.fillStyle = '#E5E5E5';
  ctx.strokeStyle = '#BCBCBC';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(25, 16, 64, 62, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F8F9FA';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(29, 20, 56, 54, 5);
  ctx.fill();

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  for (let gx = 37; gx <= 77; gx += 8) {
    ctx.beginPath();
    ctx.moveTo(gx, 20);
    ctx.lineTo(gx, 74);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 209, 102, 0.4)';
  ctx.beginPath();
  ctx.arc(57, 47, 14, 0, Math.PI * 2);
  ctx.fill();

  // Red Shutter Button (32, 92)
  ctx.fillStyle = '#D90429';
  ctx.strokeStyle = '#B00020';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(48, 108, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EF233C';
  ctx.beginPath();
  ctx.arc(46, 106, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 117, 143, 0.8)';
  ctx.beginPath();
  ctx.ellipse(43, 103, 6, 3, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Center Big Lens Assembly (cx: 150, cy: 96)
  const lensGrad = ctx.createRadialGradient(150, 96, 5, 150, 96, 58);
  lensGrad.addColorStop(0, '#1F2429');
  lensGrad.addColorStop(0.75, '#0F1215');
  lensGrad.addColorStop(1, '#2D3436');

  ctx.fillStyle = lensGrad;
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(150, 96, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#212529';
  ctx.strokeStyle = '#343A40';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(150, 96, 53, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#181A1B';
  ctx.beginPath();
  ctx.arc(150, 96, 48, 0, Math.PI * 2);
  ctx.fill();

  // Emerald Glass Lens
  const glassGrad = ctx.createRadialGradient(150 - 5, 96 - 5, 4, 150, 96, 40);
  glassGrad.addColorStop(0, 'rgba(56, 239, 125, 0.6)');
  glassGrad.addColorStop(0.25, 'rgba(17, 153, 142, 0.7)');
  glassGrad.addColorStop(0.6, '#0F2027');
  glassGrad.addColorStop(1, '#050A0D');

  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.arc(150, 96, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#080D11';
  ctx.beginPath();
  ctx.arc(150, 96, 26, 0, Math.PI * 2);
  ctx.fill();

  // Reflections
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.beginPath();
  ctx.ellipse(138, 82, 10, 6, -0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(56, 239, 125, 0.5)';
  ctx.beginPath();
  ctx.ellipse(164, 110, 5, 3, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(145, 89, 3, 0, Math.PI * 2);
  ctx.fill();

  // Model Badge (208, 92)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#666666';
  ctx.font = '900 10px "Arial Black", sans-serif';
  ctx.fillText('RETRO', 208, 92);
  ctx.fillStyle = '#EF233C';
  ctx.font = '900 12px "Arial Black", sans-serif';
  ctx.fillText('SNAP', 208, 104);
  ctx.fillStyle = '#F77F00';
  ctx.fillText('77', 246, 104);

  // Lower Chin (0, 162 to 300, 235)
  ctx.fillStyle = '#212529';
  ctx.beginPath();
  ctx.moveTo(0, 162);
  ctx.lineTo(300, 162);
  ctx.lineTo(300, 215);
  ctx.quadraticCurveTo(300, 235, 274, 235);
  ctx.lineTo(26, 235);
  ctx.quadraticCurveTo(0, 235, 0, 215);
  ctx.closePath();
  ctx.fill();

  // Ejection Slot
  ctx.fillStyle = '#0A0A0C';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(25, 174, 250, 10, 4);
  else ctx.rect(25, 174, 250, 10);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.fillRect(30, 176, 240, 4);

  // Rainbow Vintage Stripes (32, 196)
  const rainbow = ['#D90429', '#F77F00', '#FCBF49', '#2A9D8F', '#457B9D'];
  rainbow.forEach((col, idx) => {
    ctx.fillStyle = col;
    ctx.fillRect(32, 196 + idx * 3, 30, 3);
  });

  // Brand Label
  ctx.textAlign = 'center';
  ctx.fillStyle = '#F1FAEE';
  ctx.font = 'bold 13px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('INSTASLOT', 150, 209);

  ctx.restore();
}

export function drawCuteSillyObjectBadge(ctx, x, y, angle = 0.15, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // White Die-cut outline
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-10, -8, 168, 66, 33);
  ctx.fill();
  ctx.stroke();

  // Maroon inner
  ctx.fillStyle = '#800020';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-6, -4, 160, 58, 29);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 17px Impact, "Arial Black", sans-serif';
  ctx.fillText('CUTE SILLY', 74, 22);

  ctx.fillStyle = '#FFD166';
  ctx.font = '900 22px Impact, "Arial Black", sans-serif';
  ctx.fillText('OBJECT★', 74, 44);

  ctx.restore();
}

export function drawPointerArrow3D(ctx, x, y, angle = -0.38, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = '#F8F9FA';
  ctx.strokeStyle = '#2B2D42';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(12, 42);
  ctx.lineTo(22, 30);
  ctx.lineTo(38, 44);
  ctx.lineTo(44, 38);
  ctx.lineTo(28, 24);
  ctx.lineTo(42, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bevel facet
  ctx.fillStyle = '#E9ECEF';
  ctx.beginPath();
  ctx.moveTo(4, 7);
  ctx.lineTo(13, 34);
  ctx.lineTo(19, 26);
  ctx.lineTo(36, 40);
  ctx.lineTo(39, 37);
  ctx.lineTo(24, 22);
  ctx.lineTo(36, 16);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export function drawCuteStarCharacter(ctx, x, y, angle = -0.17, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // Star body with yellow gradient
  const starGrad = ctx.createLinearGradient(0, 0, 100, 100);
  starGrad.addColorStop(0, '#FFF176');
  starGrad.addColorStop(1, '#FBC02D');

  ctx.fillStyle = starGrad;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(50, 5);
  ctx.lineTo(63, 35);
  ctx.lineTo(96, 38);
  ctx.lineTo(71, 60);
  ctx.lineTo(78, 92);
  ctx.lineTo(50, 75);
  ctx.lineTo(22, 92);
  ctx.lineTo(29, 60);
  ctx.lineTo(4, 38);
  ctx.lineTo(37, 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cute eyes
  ctx.fillStyle = '#1F2429';
  ctx.beginPath();
  ctx.ellipse(44, 50, 3.5, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(56, 50, 3.5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye shines
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(43, 47, 1.5, 0, Math.PI * 2);
  ctx.arc(55, 47, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(255, 123, 0, 0.4)';
  ctx.beginPath();
  ctx.arc(37, 58, 4, 0, Math.PI * 2);
  ctx.arc(63, 58, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawVintagePhoneCordAndHandset(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(17, 17, 17, 0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 8;

  // Curled Phone Cable
  ctx.strokeStyle = '#212529';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.quadraticCurveTo(15, 30, 28, 60);
  ctx.quadraticCurveTo(15, 90, 28, 120);
  ctx.quadraticCurveTo(15, 150, 28, 180);
  ctx.quadraticCurveTo(20, 200, 24, 220);
  ctx.stroke();

  // Inner highlight on cord
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.quadraticCurveTo(15, 30, 28, 60);
  ctx.quadraticCurveTo(15, 90, 28, 120);
  ctx.quadraticCurveTo(15, 150, 28, 180);
  ctx.quadraticCurveTo(20, 200, 24, 220);
  ctx.stroke();

  // Black Vintage Handset at y = 205
  ctx.save();
  ctx.translate(0, 205);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;

  // Earpiece
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(12, 20);
  ctx.bezierCurveTo(5, 20, -2, 32, 4, 46);
  ctx.bezierCurveTo(10, 60, 25, 58, 26, 45);
  ctx.bezierCurveTo(27, 32, 20, 20, 12, 20);
  ctx.fill();

  // Handle
  ctx.fillStyle = '#2D3136';
  ctx.beginPath();
  ctx.moveTo(6, 42);
  ctx.bezierCurveTo(-10, 80, -10, 105, 6, 140);
  ctx.bezierCurveTo(14, 128, 15, 55, 6, 42);
  ctx.fill();

  // Mouthpiece
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(8, 135);
  ctx.bezierCurveTo(-1, 148, 6, 168, 18, 168);
  ctx.bezierCurveTo(30, 168, 34, 148, 24, 136);
  ctx.bezierCurveTo(18, 130, 12, 128, 8, 135);
  ctx.fill();

  // Highlights on Handset
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(108, 117, 125, 0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(2, 55);
  ctx.bezierCurveTo(-5, 80, -5, 100, 3, 125);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.ellipse(14, 32, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(18, 155, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawExclamationBadge(ctx, x, y, angle = -0.1, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // Starburst outer circle
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fill();

  // Vibrant red inner
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, 0, 27, 0, Math.PI * 2);
  ctx.fill();

  // Exclamation mark
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 36px "Impact", "Arial Black", sans-serif';
  ctx.fillText('!', 0, 2);

  ctx.restore();
}

/**
 * ============================================================================
 * RETRO DIGICAM SVG ENGINE (Silver, Matte Black, Baby Pink)
 * High-fidelity vector rendering derived from the user's custom SVG
 * ============================================================================
 */
export function drawDigicamSVG(ctx, x, y, width, height, theme = 'silver', options = {}) {
  ctx.save();
  ctx.translate(x, y);

  const baseW = 444;
  const baseH = 268;
  const scale = Math.min(width / baseW, height / baseH);
  ctx.scale(scale, scale);

  // Soft drop shadow
  ctx.shadowColor = 'rgba(21, 27, 38, 0.25)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 10;

  // 1. Camera Body Gradients
  let bodyGrad, bevelGrad, dialGrad, screenBezelGrad;
  if (theme === 'black') {
    bodyGrad = ctx.createLinearGradient(0, 0, 0, baseH);
    bodyGrad.addColorStop(0, '#32363d');
    bodyGrad.addColorStop(0.35, '#24272c');
    bodyGrad.addColorStop(0.8, '#191b1f');
    bodyGrad.addColorStop(1, '#101114');

    bevelGrad = ctx.createLinearGradient(0, 0, 0, baseH);
    bevelGrad.addColorStop(0, '#555a64');
    bevelGrad.addColorStop(1, '#090a0c');

    screenBezelGrad = ctx.createLinearGradient(0, 0, 0, 212);
    screenBezelGrad.addColorStop(0, '#0c0d0f');
    screenBezelGrad.addColorStop(1, '#2c3036');
  } else if (theme === 'pink') {
    bodyGrad = ctx.createLinearGradient(0, 0, 0, baseH);
    bodyGrad.addColorStop(0, '#fad2e1');
    bodyGrad.addColorStop(0.25, '#f2b5ce');
    bodyGrad.addColorStop(0.7, '#e89cb9');
    bodyGrad.addColorStop(1, '#d47fa1');

    bevelGrad = ctx.createLinearGradient(0, 0, 0, baseH);
    bevelGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    bevelGrad.addColorStop(1, 'rgba(168, 73, 112, 0.5)');

    dialGrad = ctx.createRadialGradient(baseW * 0.8, 140, 2, baseW * 0.8, 140, 35);
    dialGrad.addColorStop(0, '#ffffff');
    dialGrad.addColorStop(0.6, '#edd1dd');
    dialGrad.addColorStop(1, '#b5879a');
  } else {
    // Silver default
    bodyGrad = ctx.createLinearGradient(0, 0, 0, baseH);
    bodyGrad.addColorStop(0, '#ebeae6');
    bodyGrad.addColorStop(0.3, '#dedcd6');
    bodyGrad.addColorStop(0.7, '#cbc7be');
    bodyGrad.addColorStop(1, '#b8b3a8');

    bevelGrad = ctx.createLinearGradient(0, 0, 0, baseH);
    bevelGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    bevelGrad.addColorStop(1, 'rgba(138, 133, 123, 0.6)');

    dialGrad = ctx.createRadialGradient(340, 74, 2, 340, 74, 30);
    dialGrad.addColorStop(0, '#ffffff');
    dialGrad.addColorStop(0.6, '#d8d4cb');
    dialGrad.addColorStop(1, '#9e998e');
  }

  // Draw Main Body
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = theme === 'black' ? '#1c1e22' : theme === 'pink' ? '#b56788' : '#a19c92';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 0, baseW, baseH, 24);
  else ctx.rect(0, 0, baseW, baseH);
  ctx.fill();
  ctx.stroke();

  // Draw Bevel Inner Highlight
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = bevelGrad;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(3, 3, baseW - 6, baseH - 6, 21);
  else ctx.rect(3, 3, baseW - 6, baseH - 6);
  ctx.stroke();

  // Corner Screws
  const screwColor = theme === 'black' ? '#33373e' : theme === 'pink' ? '#c48da3' : '#8c877d';
  const screwBorder = theme === 'black' ? '#1b1d22' : theme === 'pink' ? '#8a4361' : '#5e5a52';
  [[15, 15], [baseW - 15, 15], [15, baseH - 15], [baseW - 15, baseH - 15]].forEach(([sx, sy]) => {
    ctx.fillStyle = screwColor;
    ctx.strokeStyle = screwBorder;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Top Viewfinder & Optical Sensors
  if (theme === 'silver') {
    ctx.fillStyle = '#a8a49c';
    ctx.strokeStyle = '#837f76';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(200, 10, 70, 26, 8);
    else ctx.rect(200, 10, 70, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1b1f24';
    ctx.beginPath();
    ctx.arc(218, 23, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38ef7d';
    ctx.beginPath();
    ctx.arc(219, 22, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9534f';
    ctx.beginPath();
    ctx.arc(256, 23, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'black') {
    // Top ridge
    ctx.fillStyle = '#444952';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(150, 2, 100, 6, 3);
    else ctx.rect(150, 2, 100, 6);
    ctx.fill();

    // Red record button
    ctx.fillStyle = '#24272c';
    ctx.strokeStyle = '#444952';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(378, 30, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(378, 30, 5.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'pink') {
    ctx.fillStyle = '#4a2538';
    ctx.strokeStyle = '#7e405e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(64, 12, 36, 24, 6);
    else ctx.rect(64, 12, 36, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1b151a';
    ctx.beginPath();
    ctx.arc(82, 24, 6, 0, Math.PI * 2);
    ctx.fill();

    // Indicator LEDs
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(140, 20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(148, 20, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Zoom toggle
    ctx.fillStyle = '#e8c2d2';
    ctx.strokeStyle = '#9e5675';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(365, 12, 64, 26, 13);
    else ctx.rect(365, 12, 64, 26);
    ctx.fill();
    ctx.stroke();
  }

  // Right Control Panel (Dials, Buttons, Speaker Grille)
  if (theme === 'silver') {
    // Mode toggle
    ctx.fillStyle = '#cac5ba';
    ctx.strokeStyle = '#948f85';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(290, 14, 76, 20, 4);
    else ctx.rect(290, 14, 76, 20);
    ctx.fill();
    ctx.stroke();

    // Speaker grille dots
    ctx.fillStyle = '#5e5a52';
    const dots = [[390, 68], [397, 68], [404, 68], [393.5, 74], [400.5, 74], [397, 80]];
    dots.forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(dx, dy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Multi-Selector Wheel (D-pad)
    ctx.save();
    ctx.translate(356, 145);
    ctx.fillStyle = dialGrad || '#d8d4cb';
    ctx.strokeStyle = '#7e7a72';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d2cdc3';
    ctx.strokeStyle = '#a8a399';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Direction arrows
    ctx.fillStyle = '#4a463f';
    [[0, -32, -4, -26, 4, -26], [0, 32, -4, 26, 4, 26], [-32, 0, -26, -4, -26, 4], [32, 0, 26, -4, 26, 4]].forEach(
      ([p1, p2, p3, p4, p5, p6]) => {
        ctx.beginPath();
        ctx.moveTo(p1, p2);
        ctx.lineTo(p3, p4);
        ctx.lineTo(p5, p6);
        ctx.closePath();
        ctx.fill();
      }
    );

    // Center button
    ctx.fillStyle = dialGrad || '#ffffff';
    ctx.strokeStyle = '#7e7a72';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Bottom Function Buttons
    ctx.fillStyle = dialGrad || '#d8d4cb';
    ctx.strokeStyle = '#8e897e';
    ctx.lineWidth = 1.2;
    [[325, 222], [387, 222]].forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx, by, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else if (theme === 'black') {
    // Buttons & D-Pad for Black Digicam
    ctx.fillStyle = '#2a2e35';
    ctx.strokeStyle = '#444953';
    ctx.lineWidth = 1.2;
    [[310, 80], [366, 80], [310, 204], [366, 204]].forEach(([bx, by]) => {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, 46, 22, 5);
      else ctx.rect(bx, by, 46, 22);
      ctx.fill();
      ctx.stroke();
    });

    // Center D-Pad
    ctx.save();
    ctx.translate(360, 150);
    ctx.fillStyle = '#24272d';
    ctx.strokeStyle = '#40454f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1b1c20';
    ctx.strokeStyle = '#33373e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (theme === 'pink') {
    // Mode Dial Top
    ctx.save();
    ctx.translate(376, 92);
    ctx.fillStyle = dialGrad || '#f4e4ec';
    ctx.strokeStyle = '#8c4765';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // D-Pad
    ctx.save();
    ctx.translate(368, 192);
    ctx.fillStyle = dialGrad || '#f4e4ec';
    ctx.strokeStyle = '#9e5675';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 2. THEMED OVERLAY STICKERS FROM USER SVG
  if (options.stickers !== false) {
    if (theme === 'silver') {
      // "I ♥ YOU" ticket (top left)
      ctx.save();
      ctx.translate(14, -10);
      ctx.rotate(-0.07);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#fdfbf7';
      ctx.strokeStyle = '#caa27d';
      ctx.lineWidth = 1.2;
      ctx.fillRect(0, 0, 78, 34);
      ctx.strokeRect(0, 0, 78, 34);

      ctx.fillStyle = '#e63946';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('I ♥ YOU', 39, 21);
      ctx.restore();

      // Cute Pink Hibiscus Flower (top right)
      ctx.save();
      ctx.translate(390, -10);
      ctx.fillStyle = '#ff758f';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const fx = Math.cos(angle) * 14;
        const fy = Math.sin(angle) * 14;
        ctx.arc(fx, fy, 8, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = '#ffb703';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (theme === 'black') {
      // Row of colorful hearts above screen
      const heartColors = ['#ff758f', '#fbbf24', '#ef4444', '#a855f7', '#38bdf8'];
      heartColors.forEach((hc, i) => {
        ctx.save();
        ctx.translate(28 + i * 20, 10);
        ctx.fillStyle = hc;
        ctx.beginPath();
        ctx.arc(-3, -3, 3, Math.PI, 0);
        ctx.arc(3, -3, 3, Math.PI, 0);
        ctx.lineTo(0, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Rainbow & Cloud Sticker (top right)
      ctx.save();
      ctx.translate(310, 12);
      ctx.rotate(-0.1);
      const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
      rainbowColors.forEach((rc, ri) => {
        ctx.strokeStyle = rc;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(36, 36, 26 - ri * 3, Math.PI, 0);
        ctx.stroke();
      });
      // Clouds
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, 36, 8, 0, Math.PI * 2);
      ctx.arc(60, 36, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Murakami Rainbow Smiling Flower (mid right)
      ctx.save();
      ctx.translate(325, 126);
      const murakamiCols = ['#fbbf24', '#fb923c', '#f87171', '#ec4899', '#a855f7', '#60a5fa', '#34d399', '#a3e635'];
      murakamiCols.forEach((mc, mi) => {
        const ma = (mi * Math.PI * 2) / 8;
        ctx.fillStyle = mc;
        ctx.beginPath();
        ctx.arc(Math.cos(ma) * 14, Math.sin(ma) * 14, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Smile
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(-3, -2, 1.2, 0, Math.PI * 2);
      ctx.arc(3, -2, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 1, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.restore();

      // Yellow Cute Chick (bottom left)
      ctx.save();
      ctx.translate(-10, 215);
      ctx.rotate(0.08);
      ctx.fillStyle = '#ffdd00';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(20, 20, 16, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Eye & beak
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(16, 16, 1.8, 0, Math.PI * 2);
      ctx.arc(24, 16, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(20, 18);
      ctx.lineTo(17, 22);
      ctx.lineTo(23, 22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

/**
 * ============================================================================
 * FORMULA 1 / MOTORSPORT VECTOR GRAPHICS ENGINE
 * ============================================================================
 */

/**
 * Checkered racing flag border pattern
 */
export function drawCheckeredFlagBorder(ctx, x, y, width, height, tileSize = 16) {
  ctx.save();
  const cols = Math.ceil(width / tileSize);
  const rows = Math.ceil(height / tileSize);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#111111' : '#FFFFFF';
      ctx.fillRect(x + c * tileSize, y + r * tileSize, tileSize, tileSize);
    }
  }
  ctx.restore();
}

/**
 * Formula 1 Speed & Telemetry HUD Overlay
 */
export function drawF1TelemetryHUD(ctx, x, y, width, height, options = {}) {
  ctx.save();
  ctx.translate(x, y);

  const {
    rpm = 13500,
    speed = 328,
    gear = 7,
    lap = '44 / 44',
    sectorTime = '1:21.432',
    drs = true,
  } = options;

  // Carbon fiber badge plate
  ctx.fillStyle = 'rgba(15, 17, 21, 0.94)';
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 0, width, height, 10);
  else ctx.rect(0, 0, width, height);
  ctx.fill();
  ctx.stroke();

  // Top Red Accent Line
  ctx.fillStyle = '#E10600';
  ctx.fillRect(4, 4, width - 8, 4);

  // Tachometer / RPM LED Bar
  const totalLeds = 15;
  const ledW = (width - 40) / totalLeds;
  for (let i = 0; i < totalLeds; i++) {
    let ledColor = '#10B981'; // Green
    if (i >= 6 && i < 11) ledColor = '#F59E0B'; // Amber
    if (i >= 11) ledColor = '#EF4444'; // Red shift indicator
    ctx.fillStyle = i < 13 ? ledColor : '#374151';
    ctx.fillRect(20 + i * ledW, 16, ledW - 3, 8);
  }

  // Speed & Gear Display
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 36px "DM Sans", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${speed}`, 20, 68);

  ctx.font = '700 14px "DM Sans", sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText('KM/H', 88, 55);

  // Large Gear Indicator
  ctx.fillStyle = '#F59E0B';
  ctx.font = '900 42px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${gear}`, width / 2, 70);

  // DRS Status Box
  ctx.save();
  ctx.fillStyle = drs ? '#10B981' : '#4B5563';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(width - 100, 36, 80, 24, 4);
  else ctx.rect(width - 100, 36, 80, 24);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 11px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DRS ACTIVE', width - 60, 52);
  ctx.restore();

  // Bottom Status Bar: Lap & Sector Time
  ctx.fillStyle = '#E5E7EB';
  ctx.font = '600 12px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`LAP ${lap}  •  BEST ${sectorTime}`, 20, 94);

  // Pirelli Tire Compound Tag (Right)
  ctx.fillStyle = '#E10600';
  ctx.beginPath();
  ctx.arc(width - 28, 90, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 9px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('S', width - 28, 93);

  ctx.restore();
}

/**
 * F1 Starting Lights (5 red gantry lights)
 */
export function drawF1StartingLights(ctx, x, y, width = 240, height = 36) {
  ctx.save();
  ctx.translate(x, y);

  // Gantry casing
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 0, width, height, 6);
  else ctx.rect(0, 0, width, height);
  ctx.fill();
  ctx.stroke();

  const lightGap = width / 6;
  for (let i = 1; i <= 5; i++) {
    const lx = i * lightGap;
    const ly = height / 2;
    // Outer black bezel
    ctx.fillStyle = '#1F2937';
    ctx.beginPath();
    ctx.arc(lx, ly, 10, 0, Math.PI * 2);
    ctx.fill();
    // Glowing red bulb
    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(lx, ly, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // Glass highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(lx - 2, ly - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Grand Prix Monaco Laurel Wreath / Champion Badge
 */
export function drawGrandPrixBadge(ctx, x, y, title = 'MONACO GP', year = '2004') {
  ctx.save();
  ctx.translate(x, y);

  // Gold Crest Shield
  ctx.fillStyle = '#151515';
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-45, -35);
  ctx.lineTo(45, -35);
  ctx.lineTo(40, 20);
  ctx.lineTo(0, 45);
  ctx.lineTo(-40, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gold Star
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(0, -16, 6, 0, Math.PI * 2);
  ctx.fill();

  // Typography
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 10px "DM Sans", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 0, 4);

  ctx.font = '700 8px "Courier New", monospace';
  ctx.fillStyle = '#F59E0B';
  ctx.fillText(`★ ${year} ★`, 0, 18);

  ctx.restore();
}

/**
 * Holographic CD-ROM Disc with iridescent rainbow sheen
 */
export function drawHoloCDRom(ctx, x, y, radius = 120) {
  ctx.save();
  ctx.translate(x, y);

  // Outer drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;

  // Base metallic disc
  const discGrad = ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, radius);
  discGrad.addColorStop(0, '#E5E7EB');
  discGrad.addColorStop(0.35, '#F3F4F6');
  discGrad.addColorStop(0.7, '#D1D5DB');
  discGrad.addColorStop(1, '#9CA3AF');
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Spectral Rainbow Iridescent Sheen
  ctx.shadowColor = 'transparent';
  ctx.globalAlpha = 0.45;
  const specGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
  specGrad.addColorStop(0, '#F43F5E');
  specGrad.addColorStop(0.2, '#FB923C');
  specGrad.addColorStop(0.4, '#FACC15');
  specGrad.addColorStop(0.6, '#34D399');
  specGrad.addColorStop(0.8, '#38BDF8');
  specGrad.addColorStop(1, '#C084FC');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Track Grooves
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  [0.45, 0.6, 0.75, 0.88].forEach(pct => {
    ctx.beginPath();
    ctx.arc(0, 0, radius * pct, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Center Clear Spindle Ring & Center Hole
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#E5E7EB';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Hole Cutout
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}


