/** Photo apertures use logical template pixels, independent of preview/export size. */
export function coverCrop(sourceWidth, sourceHeight, width, height, position = {}) {
  if (![sourceWidth, sourceHeight, width, height].every(n => Number.isFinite(n) && n > 0)) {
    throw new Error('Photo and slot dimensions must be positive.');
  }
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const cropWidth = Math.min(sourceWidth, width / scale);
  const cropHeight = Math.min(sourceHeight, height / scale);
  const clamp = n => Math.min(1, Math.max(0, n));
  return {
    x: (sourceWidth - cropWidth) * clamp(position.x ?? 0.5),
    y: (sourceHeight - cropHeight) * clamp(position.y ?? 0.5),
    width: cropWidth, height: cropHeight,
  };
}

export function slotCorners(slot) {
  if (slot.corners) return slot.corners;
  const { x, y, width, height, rotation = 0 } = slot;
  const cx = x + width / 2, cy = y + height / 2;
  return [[-width / 2, -height / 2], [width / 2, -height / 2], [width / 2, height / 2], [-width / 2, height / 2]]
    .map(([px, py]) => [cx + px * Math.cos(rotation) - py * Math.sin(rotation), cy + px * Math.sin(rotation) + py * Math.cos(rotation)]);
}

function polygon(path, points) {
  path.moveTo(...points[0]);
  points.slice(1).forEach(point => path.lineTo(...point));
  path.closePath();
}

/** Mask vertices are in template coordinates; exclusions retain foreground artwork. */
export function aperturePath(slot) {
  const path = new Path2D();
  if (slot.mask?.polygon) polygon(path, slot.mask.polygon);
  else if (slot.borderRadius && !slot.corners) {
    const local = new Path2D();
    local.roundRect(-slot.width / 2, -slot.height / 2, slot.width, slot.height, slot.borderRadius);
    const transform = new DOMMatrix().translate(slot.x + slot.width / 2, slot.y + slot.height / 2).rotate((slot.rotation || 0) * 180 / Math.PI);
    path.addPath(local, transform);
  } else polygon(path, slotCorners(slot));
  (slot.mask?.exclude || []).forEach(points => polygon(path, points));
  return path;
}

/** Unit square → artwork quadrilateral. Handles perspective as well as rotation. */
export function quadProjection(corners) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = corners;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const determinant = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(determinant) < 1e-8) throw new Error('Degenerate photo-slot quadrilateral.');
  const g = (dx3 * dy2 - dx2 * dy3) / determinant;
  const h = (dx1 * dy3 - dx3 * dy1) / determinant;
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3;
  const d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
  const affine = Math.hypot(dx3, dy3) < 0.25;
  return {
    affine,
    matrix: affine ? [x1 - x0, y1 - y0, x3 - x0, y3 - y0, x0, y0] : [a, d, b, e, x0, y0],
    point: (u, v) => [(a * u + b * v + x0) / (g * u + h * v + 1), (d * u + e * v + y0) / (g * u + h * v + 1)],
  };
}

function drawTriangle(ctx, photo, crop, source, dest) {
  const [[u0, v0], [u1, v1], [u2, v2]] = source;
  const [[x0, y0], [x1, y1], [x2, y2]] = dest;
  const det = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0);
  const a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / det;
  const b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / det;
  const c = ((x2 - x0) * (u1 - u0) - (x1 - x0) * (u2 - u0)) / det;
  const d = ((y2 - y0) * (u1 - u0) - (y1 - y0) * (u2 - u0)) / det;
  ctx.save();
  // Overlap only internal mesh edges by a subpixel; the outer aperture clip stays exact.
  const mx = (x0 + x1 + x2) / 3, my = (y0 + y1 + y2) / 3;
  const t = ctx.getTransform(), padding = 1.1 / Math.max(Math.hypot(t.a, t.b), Math.hypot(t.c, t.d));
  const distanceToEdges = dest.map(([x, y], i) => {
    const [nx, ny] = dest[(i + 1) % 3];
    return Math.abs((nx - x) * (y - my) - (x - mx) * (ny - y)) / Math.hypot(nx - x, ny - y);
  });
  const expansion = 1 + padding / Math.min(...distanceToEdges);
  const edge = dest.map(([x, y]) => [mx + (x - mx) * expansion, my + (y - my) * expansion]);
  const path = new Path2D(); polygon(path, edge); ctx.clip(path);
  ctx.transform(a, b, c, d, x0 - a * u0 - c * v0, y0 - b * u0 - d * v0);
  ctx.drawImage(photo, crop.x, crop.y, crop.width, crop.height, 0, 0, 1, 1);
  ctx.restore();
}

/** One crop from the original processed photo; never resize an intermediate bitmap. */
export function drawPhotoInSlot(ctx, photo, slot) {
  const corners = slotCorners(slot);
  const project = quadProjection(corners);
  const crop = coverCrop(photo.naturalWidth || photo.videoWidth || photo.width, photo.naturalHeight || photo.videoHeight || photo.height, slot.width, slot.height, slot.crop?.position);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clip(aperturePath(slot), 'evenodd');
  if (project.affine) {
    ctx.transform(...project.matrix);
    ctx.drawImage(photo, crop.x, crop.y, crop.width, crop.height, 0, 0, 1, 1);
  } else {
    const steps = 8;
    for (let y = 0; y < steps; y++) for (let x = 0; x < steps; x++) {
      const a = [x / steps, y / steps], b = [(x + 1) / steps, y / steps];
      const c = [(x + 1) / steps, (y + 1) / steps], d = [x / steps, (y + 1) / steps];
      for (const triangle of [[a, b, c], [a, c, d]]) drawTriangle(ctx, photo, crop, triangle, triangle.map(p => project.point(...p)));
    }
  }
  ctx.restore();
}
