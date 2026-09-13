import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('SnapBooth 5 Core Artistic Templates and variants render high-res PNG without errors', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('Failed to load resource') && !text.includes('NotReadableError') && !text.includes('Device in use')) {
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto('/');

  // Execute full canvas rendering in browser context for all 5 core templates
  const results = await page.evaluate(async () => {
    const { ARTISTIC_TEMPLATES } = await import('/src/lib/artisticTemplates.js');
    const { renderArtworkStrip } = await import('/src/lib/templateRenderer.js');
    const { composeStrip, makeCanvas } = await import('/src/lib/photos.js');

    // Create 4 dummy user photo canvases
    const dummyPhotos = [];
    const colors = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#9B5DE5'];
    for (let i = 0; i < 5; i++) {
      const c = makeCanvas(800, 600);
      const ctx = c.getContext('2d');
      ctx.fillStyle = colors[i];
      ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Pose ${i + 1}`, 400, 300);
      dummyPhotos.push(c);
    }

    const output = [];
    for (const tpl of ARTISTIC_TEMPLATES) {
      const canvas = renderArtworkStrip(dummyPhotos, { template: tpl.id, header: 'TEST & BOOTH', text: 'Special Memories' }, new Date('2026-09-12T12:00:00Z'));
      const dataUrl = canvas.toDataURL('image/png');
      output.push({
        id: tpl.id,
        name: tpl.name,
        category: tpl.category,
        width: canvas.width,
        height: canvas.height,
        dataUrlPrefix: dataUrl.slice(0, 30),
        dataUrlLength: dataUrl.length,
        dataUrl: dataUrl,
      });
    }

    // Also test composeStrip dispatcher
    const dispatchCanvas = composeStrip(dummyPhotos, { template: 'denim-booth' }, new Date());

    return {
      output,
      dispatchOk: dispatchCanvas && dispatchCanvas.width === 1000 && dispatchCanvas.height === 1800,
    };
  });

  expect(results.dispatchOk).toBe(true);
  expect(results.output.length).toBeGreaterThanOrEqual(14);

  // Verify all 5 core templates are present and rendered with high resolution
  const coreIds = ['airmail-love', 'denim-booth', 'denim-scrapbook', 'vinyl-memories', 'denim-note'];
  for (const cid of coreIds) {
    const item = results.output.find(o => o.id === cid);
    expect(item).toBeTruthy();
    expect(item.width).toBeGreaterThanOrEqual(800);
    expect(item.height).toBeGreaterThanOrEqual(1800);
    expect(item.dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(item.dataUrlLength).toBeGreaterThan(50000); // Must be a substantial high-res PNG!

    // Save rendered PNG artifact for inspection
    const base64Data = item.dataUrl.replace(/^data:image\/png;base64,/, '');
    const outDir = path.resolve('artifacts');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `${cid}-rendered.png`), base64Data, 'base64');
  }

  // Verify navigation to Edit tab and Template categories UI
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByText('First, a little camera time.')).toBeVisible();

  expect(consoleErrors).toEqual([]);
});
