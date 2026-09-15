import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const fixture = '/tests/e2e/fixtures/frame-harness.html';
const proofDir = 'artifacts/frame-alignment';
test.beforeEach(async ({ page }) => { await page.goto(fixture); });

test('all 66 real apertures contain photos and preserve surrounding artwork', async ({ page }) => {
  const reports = await page.evaluate(async () => {
    const { IMAGE_FRAMES } = await import('/src/lib/imageFrames.js');
    const { renderArtworkStrip } = await import('/src/lib/templateRenderer.js');
    const { aperturePath } = await import('/src/lib/photoSlots.js');
    const { decodedImage } = await import('/src/lib/renderResources.js');
    const photo = document.createElement('canvas'); photo.width = 1600; photo.height = 1200;
    const color = [251, 19, 167]; photo.getContext('2d').fillStyle = `rgb(${color})`; photo.getContext('2d').fillRect(0, 0, 1600, 1200);
    const reports = [];
    for (const frame of IMAGE_FRAMES) {
      const source = await decodedImage(frame.src);
      const actual = await renderArtworkStrip(frame.slots.map(() => photo), { template: frame.id });
      const ctx = actual.getContext('2d', { willReadFrequently: true });
      const pixels = ctx.getImageData(0, 0, actual.width, actual.height).data;
      const reference = document.createElement('canvas'); reference.width = frame.frameW; reference.height = frame.frameH;
      const ref = reference.getContext('2d', { willReadFrequently: true }); ref.drawImage(source, 0, 0);
      const original = ref.getImageData(0, 0, reference.width, reference.height).data;
      const paths = frame.slots.map(aperturePath);
      ctx.lineWidth = 6;
      let inside = 0, covered = 0, outside = 0, changedOutside = 0;
      for (let y = 3; y < actual.height - 3; y += 5) for (let x = 3; x < actual.width - 3; x += 5) {
        const index = (y * actual.width + x) * 4;
        const isInside = (dx, dy) => paths.some(p => ctx.isPointInPath(p, x + dx, y + dy, 'evenodd'));
        if ([[-2, -2], [2, -2], [-2, 2], [2, 2], [0, 0]].every(([dx, dy]) => isInside(dx, dy))) {
          inside++;
          if (color.every((c, i) => Math.abs(c - pixels[index + i]) < 12)) covered++;
        } else if (!paths.some(p => ctx.isPointInPath(p, x + 0.5, y + 0.5, 'evenodd') || ctx.isPointInStroke(p, x + 0.5, y + 0.5))) {
          outside++;
          if ([0, 1, 2].some(i => Math.abs(pixels[index + i] - original[index + i]) > 2)) changedOutside++;
        }
      }
      reports.push({ id: frame.id, covered: covered / inside, changedOutside, outside,
        size: [actual.width, actual.height], expected: [source.naturalWidth, source.naturalHeight] });
      actual.width = reference.width = 1;
    }
    return reports;
  });
  await fs.mkdir(proofDir, { recursive: true });
  await fs.writeFile(path.join(proofDir, 'pixel-coverage.json'), JSON.stringify(reports, null, 2));
  for (const report of reports) {
    expect(report.size, report.id).toEqual(report.expected);
    expect(report.covered, `${report.id}: photo coverage`).toBeGreaterThan(0.99);
    expect(report.changedOutside, `${report.id}: decorations changed`).toBe(0);
    expect(report.outside).toBeGreaterThan(500);
  }
});

test('preview and HD export align; source aspect ratios and artwork masks survive scaling', async ({ page }) => {
  const results = await page.evaluate(async () => {
    const { IMAGE_FRAMES } = await import('/src/lib/imageFrames.js');
    const { renderArtworkStrip } = await import('/src/lib/templateRenderer.js');
    const photo = document.createElement('canvas'); photo.width = 1600; photo.height = 1200;
    const ctx = photo.getContext('2d');
    ctx.fillStyle = '#5b91ad'; ctx.fillRect(0, 0, 1600, 1200);
    ctx.fillStyle = '#efc3a0'; ctx.beginPath(); ctx.ellipse(800, 540, 270, 330, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#242b40'; ctx.beginPath(); ctx.ellipse(800, 1180, 550, 340, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(700, 500, 24, 0, Math.PI * 2); ctx.arc(900, 500, 24, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(800, 610, 85, 0.1, Math.PI - 0.1); ctx.stroke();
    ctx.strokeStyle = '#fff8'; ctx.lineWidth = 3;
    for (let x = 0; x <= 1600; x += 200) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1200); ctx.stroke(); }
    for (let y = 0; y <= 1200; y += 200) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1600, y); ctx.stroke(); }
    window.testPhoto = photo.toDataURL();
    const sheet = document.createElement('canvas'); sheet.width = 1440; sheet.height = 1800;
    const sheetCtx = sheet.getContext('2d'); sheetCtx.fillStyle = '#e1e9ed'; sheetCtx.fillRect(0, 0, sheet.width, sheet.height);
    const results = [];
    for (const [index, frame] of IMAGE_FRAMES.entries()) {
      const photos = frame.slots.map(() => photo);
      const preview = await renderArtworkStrip(photos, { template: frame.id }, null, { maxDimension: 800 });
      const hd = await renderArtworkStrip(photos, { template: frame.id }, null, { maxDimension: 2400 });
      const down = document.createElement('canvas'); down.width = preview.width; down.height = preview.height;
      const dctx = down.getContext('2d'); dctx.imageSmoothingQuality = 'high'; dctx.drawImage(hd, 0, 0, down.width, down.height);
      const a = preview.getContext('2d').getImageData(0, 0, down.width, down.height).data;
      const b = dctx.getImageData(0, 0, down.width, down.height).data;
      let error = 0;
      for (let n = 0; n < a.length; n += 4) error += Math.abs(a[n] - b[n]) + Math.abs(a[n + 1] - b[n + 1]) + Math.abs(a[n + 2] - b[n + 2]);
      const x = index % 6 * 240, y = Math.floor(index / 6) * 450;
      sheetCtx.drawImage(hd, x + 5, y + 30, 230, 230 * hd.height / hd.width);
      sheetCtx.fillStyle = '#182838'; sheetCtx.font = '12px sans-serif'; sheetCtx.fillText(frame.name, x + 5, y + 18, 230);
      const proof = ['frame-kiki-moon-2cut', 'frame-newspaper-punk-2cut', 'frame-zootopia-film-2cut', 'frame-zootopia-message-2cut'].includes(frame.id) ? hd.toDataURL() : null;
      results.push({ id: frame.id, error: error / (a.length / 4 * 3), hdHeight: hd.height, proof });
      preview.width = hd.width = down.width = 1;
    }
    return { results, sheet: sheet.toDataURL() };
  });
  await fs.mkdir(proofDir, { recursive: true });
  await fs.writeFile(path.join(proofDir, 'all-frames-after.png'), Buffer.from(results.sheet.split(',')[1], 'base64'));
  for (const row of results.results) {
    expect(row.error, `${row.id}: preview/export mean color difference`).toBeLessThan(6);
    expect(row.hdHeight).toBe(2400);
    if (row.proof) await fs.writeFile(path.join(proofDir, `${row.id}-hd.png`), Buffer.from(row.proof.split(',')[1], 'base64'));
  }
});

test('rapid selection keeps last frame, export freezes selection, and missing poses are never duplicated', async ({ page }) => {
  await page.evaluate(() => {
    const source = document.createElement('canvas'); source.width = 1600; source.height = 1200;
    const ctx = source.getContext('2d'); ctx.fillStyle = '#e184bc'; ctx.fillRect(0, 0, 1600, 1200);
    window.mountStripFixture([source.toDataURL(), source.toDataURL()]);
  });
  await expect(page.locator('output')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(async () => {
    const ids = ['frame-kiki-moon-2cut', 'frame-zootopia-film-2cut', 'frame-zootopia-message-2cut', 'frame-newspaper-punk-2cut'];
    for (let i = 0; i < 50; i++) { window.fixture.choose(ids[i % 4]); await new Promise(resolve => setTimeout(resolve, 12)); }
    window.fixture.choose('frame-newspaper-punk-2cut');
  });
  await expect(page.locator('output')).toHaveAttribute('data-ready', 'true');
  const frozen = await page.evaluate(async () => {
    const result = window.fixture.strip.result;
    const exporting = result.getExport();
    window.fixture.choose('frame-kiki-moon-2cut');
    const hd = await exporting;
    const image = await createImageBitmap(hd.blob); const size = [image.width, image.height]; image.close();
    return { template: result.templateId, size };
  });
  expect(frozen.template).toBe('frame-newspaper-punk-2cut');
  expect(frozen.size).toEqual([1403, 2400]);
  await expect(page.locator('output')).toHaveText('frame-kiki-moon-2cut');
  await expect(page.locator('output')).toHaveAttribute('data-ready', 'true');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const missing = await page.evaluate(async () => {
    const { IMAGE_FRAMES } = await import('/src/lib/imageFrames.js');
    const { renderImageFrame } = await import('/src/lib/templateRenderer.js');
    const { decodedImage } = await import('/src/lib/renderResources.js');
    const frame = IMAGE_FRAMES.find(f => f.id === 'frame-kiki-moon-2cut');
    const photo = document.createElement('canvas'); photo.width = photo.height = 100;
    photo.getContext('2d').fillStyle = 'red'; photo.getContext('2d').fillRect(0, 0, 100, 100);
    const render = await renderImageFrame([photo], frame);
    const original = document.createElement('canvas'); original.width = frame.frameW; original.height = frame.frameH;
    original.getContext('2d').drawImage(await decodedImage(frame.src), 0, 0);
    return { actual: [...render.getContext('2d').getImageData(500, 900, 1, 1).data], expected: [...original.getContext('2d').getImageData(500, 900, 1, 1).data] };
  });
  expect(missing.actual).toEqual(missing.expected);
});
