import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Scrapbook sticker editor, tactile asset library, and new photostrip templates', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('Failed to load resource')) {
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto('/');

  // 1. Verify Sticker Library, Canvas Parity, and New Templates in Browser Context
  const testResults = await page.evaluate(async () => {
    const { STICKER_LIBRARY, preloadStickerAssets, renderPlacedStickers } = await import('/src/lib/stickers.js');
    const { ARTISTIC_TEMPLATES } = await import('/src/lib/artisticTemplates.js');
    const { renderArtworkStrip } = await import('/src/lib/templateRenderer.js');
    const { makeCanvas } = await import('/src/lib/photos.js');

    // Create 4 dummy photo canvases
    const dummyPhotos = [];
    const colors = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A'];
    for (let i = 0; i < 4; i++) {
      const c = makeCanvas(800, 600);
      const ctx = c.getContext('2d');
      ctx.fillStyle = colors[i];
      ctx.fillRect(0, 0, 800, 600);
      dummyPhotos.push(c);
    }

    // A. Preload stickers
    const placedStickers = [
      {
        instanceId: 'stk_test_star',
        stickerId: 'red-stitched-star',
        x: 0.25,
        y: 0.35,
        scale: 0.22,
        rotation: 15,
        flipX: false,
        zIndex: 1,
      },
      {
        instanceId: 'stk_test_lily',
        stickerId: 'burgundy-lily',
        x: 0.75,
        y: 0.70,
        scale: 0.25,
        rotation: -20,
        flipX: true,
        zIndex: 2,
      },
    ];

    await preloadStickerAssets(placedStickers);

    // B. Test renderPlacedStickers onto a test canvas
    const testCanvas = makeCanvas(900, 2100);
    const testCtx = testCanvas.getContext('2d');
    testCtx.fillStyle = '#FFFFFF';
    testCtx.fillRect(0, 0, 900, 2100);
    await renderPlacedStickers(testCtx, placedStickers, 900, 2100);
    const placedDataUrl = testCanvas.toDataURL('image/png');

    // C. Test all 4 new templates rendering with user stickers
    const newTemplateIds = ['version-1-clean', 'version-2-balanced', 'version-4-retro', 'version-6-expressive'];
    const renderedTemplates = [];

    for (const tplId of newTemplateIds) {
      const canvas = renderArtworkStrip(
        dummyPhotos,
        {
          template: tplId,
          header: 'SNAPBOOTH EDITORIAL',
          userStickers: placedStickers,
        },
        new Date('2026-09-12T15:30:00Z')
      );
      renderedTemplates.push({
        id: tplId,
        width: canvas.width,
        height: canvas.height,
        dataUrl: canvas.toDataURL('image/png'),
      });
    }

    return {
      stickerCount: STICKER_LIBRARY.length,
      placedDataUrlLength: placedDataUrl.length,
      renderedTemplates,
    };
  });

  expect(testResults.stickerCount).toBeGreaterThanOrEqual(40);
  expect(testResults.placedDataUrlLength).toBeGreaterThan(10000);

  // Verify all 4 new templates rendered successfully and save artifacts
  const outDir = path.resolve('artifacts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const tpl of testResults.renderedTemplates) {
    expect(tpl.width).toBeGreaterThanOrEqual(900);
    expect(tpl.height).toBeGreaterThanOrEqual(2100);
    expect(tpl.dataUrl.startsWith('data:image/png;base64,')).toBe(true);

    const base64Data = tpl.dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(path.join(outDir, `${tpl.id}-rendered.png`), base64Data, 'base64');
  }

  expect(consoleErrors).toEqual([]);
});
