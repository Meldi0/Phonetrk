import { test, expect } from '@playwright/test';

test('Deep Improvements: 16 Themed Collections, Filters, Effects, and Rapid Switching Stress Test', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('Failed to load resource') && !text.includes('NotReadableError') && !text.includes('Device in use') && !text.includes('NotFoundError')) {
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto('/');

  // 1. Verify Themed Templates and Canvas Rendering in browser context
  const testResults = await page.evaluate(async () => {
    const { THEMED_TEMPLATES } = await import('/src/lib/themedTemplates.js');
    const { FILTERS, FILTER_CATEGORIES, EFFECTS, EFFECT_CATEGORIES, STRIP_TEMPLATES } = await import('/src/lib/presets.js');
    const { renderArtworkStrip } = await import('/src/lib/templateRenderer.js');
    const { makeCanvas } = await import('/src/lib/photos.js');

    // Create 4 dummy photo canvases
    const dummyPhotos = [];
    const colors = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A'];
    for (let i = 0; i < 4; i++) {
      const c = makeCanvas(640, 480);
      const ctx = c.getContext('2d');
      ctx.fillStyle = colors[i];
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`Pose ${i + 1}`, 320, 240);
      dummyPhotos.push(c);
    }

    // Test all 16 themed collections rendering
    let renderedCount = 0;
    const baseThemes = THEMED_TEMPLATES.filter(t => t.isBase);
    for (const tpl of baseThemes) {
      const canvas = renderArtworkStrip(dummyPhotos, { template: tpl.id }, new Date(), { maxDimension: 800 });
      if (canvas && canvas.width > 0 && canvas.height > 0) {
        renderedCount++;
      }
    }

    // Rapid switching stress simulation: switch across 25 different templates with signal cancellation
    let stressPassed = 0;
    for (let i = 0; i < Math.min(25, STRIP_TEMPLATES.length); i++) {
      const t = STRIP_TEMPLATES[i];
      const controller = new AbortController();
      // Rapid render
      const c = renderArtworkStrip(dummyPhotos, { template: t.id }, new Date(), { maxDimension: 600, signal: controller.signal });
      if (c && c.width > 0) stressPassed++;
    }

    return {
      themedCount: THEMED_TEMPLATES.length,
      baseThemeCount: baseThemes.length,
      renderedBaseThemes: renderedCount,
      filtersCount: FILTERS.length,
      filterCategoriesCount: FILTER_CATEGORIES.length,
      effectsCount: EFFECTS.length,
      effectCategoriesCount: EFFECT_CATEGORIES.length,
      totalTemplates: STRIP_TEMPLATES.length,
      stressPassed,
    };
  });

  // Verify all 16 themed collections exist
  expect(testResults.baseThemeCount).toBe(16);
  expect(testResults.themedCount).toBe(80); // 16 * 5 (base + 4 variants)
  expect(testResults.renderedBaseThemes).toBe(16);

  // Verify expanded filter system (25 filters, 10 categories including All & Favorites)
  expect(testResults.filtersCount).toBeGreaterThanOrEqual(25);
  expect(testResults.filterCategoriesCount).toBeGreaterThanOrEqual(8);

  // Verify expanded effects system
  expect(testResults.effectsCount).toBeGreaterThanOrEqual(18);
  expect(testResults.effectCategoriesCount).toBeGreaterThanOrEqual(6);

  // Verify stress test passed all 25 rapid renders without crash
  expect(testResults.stressPassed).toBe(25);

  // Verify no fatal console errors
  expect(consoleErrors).toEqual([]);
});
