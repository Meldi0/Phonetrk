import { test, expect } from '@playwright/test';

test('Digicam trio SVG frames, F1 motorsport templates, Y2K stickers, custom text with non-formal fonts, and color wheel work flawlessly', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    if (
      msg.type() === 'error' &&
      !text.includes('Failed to load resource') &&
      !text.includes('NotReadableError') &&
      !text.includes('Device in use') &&
      !text.includes('NotFoundError') &&
      !text.includes('start() caught error')
    ) {
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto('/');

  // 1. Evaluate template rendering and text rendering in browser context
  const results = await page.evaluate(async () => {
    const { STRIP_TEMPLATES } = await import('/src/lib/presets.js');
    const { STICKER_LIBRARY } = await import('/src/lib/stickers.js');
    const { renderArtworkStrip, renderPlacedTexts } = await import('/src/lib/templateRenderer.js');
    const { makeCanvas } = await import('/src/lib/photos.js');

    // Create 4 dummy photo canvases
    const dummyPhotos = [];
    const colors = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#9B5DE5', '#F4A261'];
    for (let i = 0; i < 6; i++) {
      const c = makeCanvas(800, 600);
      const ctx = c.getContext('2d');
      ctx.fillStyle = colors[i];
      ctx.fillRect(0, 0, 800, 600);
      dummyPhotos.push(c);
    }

    // A. Verify Digicam & F1 Templates
    const testTemplateIds = [
      'digicam-trio-3',
      'digicam-silver-1',
      'digicam-pink-1',
      'digicam-black-1',
      'digicam-duo-2',
      'digicam-quad-4',
      'f1-racing-4',
      'f1-monaco-1',
      'f1-pitlane-2',
      'f1-night-race-6',
      'y2k-cyber-cd-4',
      'cinema-ticket-4'
    ];

    const renderedTemplates = [];
    for (const tid of testTemplateIds) {
      const tpl = STRIP_TEMPLATES.find(t => t.id === tid);
      if (!tpl) throw new Error(`Template ${tid} not found in STRIP_TEMPLATES`);

      const canvas = renderArtworkStrip(
        dummyPhotos.slice(0, tpl.photoSlots?.length || 4),
        {
          template: tpl.id,
          header: 'CISSPIC VIP',
          text: 'F1 & Digicam Memories',
          userTexts: [
            {
              id: 'txt_1',
              text: 'GRAND PRIX 2026 ★',
              font: 'Permanent Marker',
              fontSize: 32,
              color: '#FACC15',
              hasBg: true,
              bgColor: 'rgba(0,0,0,0.85)',
              x: 0.5,
              y: 0.85,
              scale: 1.0,
              rotation: -2,
            }
          ]
        },
        new Date('2026-09-13T12:00:00Z')
      );

      const dataUrl = canvas.toDataURL('image/png');
      renderedTemplates.push({
        id: tid,
        width: canvas.width,
        height: canvas.height,
        dataLength: dataUrl.length,
      });
    }

    // B. Verify Y2K & Motorsport Stickers
    const y2kStickerIds = [
      'y2k-cyber-sigil',
      'y2k-chrome-star',
      'y2k-tamagotchi',
      'y2k-flip-phone',
      'y2k-holo-cd',
      'y2k-murakami-flower',
      'y2k-chick-cute',
      'f1-racing-helmet',
      'f1-checkered-flag',
      'f1-speedometer',
      'f1-starting-lights',
      'f1-drs-badge'
    ];

    const foundStickers = y2kStickerIds.map(id => {
      const s = STICKER_LIBRARY.find(item => item.id === id);
      return { id, found: !!s, src: s?.src, category: s?.category };
    });

    // C. Verify Custom Background Color Rendering
    const customBgCanvas = renderArtworkStrip(
      dummyPhotos.slice(0, 4),
      {
        template: 'clean-white',
        customBg: '#FF1493', // Deep pink
      },
      new Date()
    );
    const customBgPixel = customBgCanvas.getContext('2d').getImageData(10, 10, 1, 1).data;

    return {
      renderedTemplates,
      foundStickers,
      customBgPixel: [customBgPixel[0], customBgPixel[1], customBgPixel[2]],
    };
  });

  // Assertions for template renderings
  expect(results.renderedTemplates.length).toBe(12);
  for (const t of results.renderedTemplates) {
    expect(t.width).toBeGreaterThanOrEqual(800);
    expect(t.height).toBeGreaterThanOrEqual(800);
    expect(t.dataLength).toBeGreaterThan(50000);
  }

  // Assertions for Y2K & F1 stickers
  for (const s of results.foundStickers) {
    expect(s.found).toBe(true);
    expect(s.src.startsWith('/stickers/')).toBe(true);
  }

  // Assertions for custom background color
  // Pixel at (10, 10) in clean-white with customBg #FF1493 should match [255, 20, 147]
  expect(results.customBgPixel[0]).toBe(255);
  expect(results.customBgPixel[1]).toBe(20);
  expect(results.customBgPixel[2]).toBe(147);

  expect(consoleErrors).toEqual([]);
});
