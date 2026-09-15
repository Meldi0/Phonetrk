import { test, expect } from '@playwright/test';

test.describe('Asset-based Image Frames System', () => {
  test('All 24 image frames render correctly with sample photos and match aspect ratios', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('Failed to load resource') && !text.includes('NotReadableError') && !text.includes('Device in use')) {
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.goto('/tests/e2e/fixtures/frame-harness.html');

    const results = await page.evaluate(async () => {
      const { IMAGE_FRAMES } = await import('/src/lib/imageFrames.js');
      const { renderArtworkStrip } = await import('/src/lib/templateRenderer.js');
      const { makeCanvas } = await import('/src/lib/photos.js');

      // Create 6 test photos with distinct colors
      const testPhotos = [];
      const colors = ['#E11D48', '#2563EB', '#16A34A', '#D97706', '#9333EA', '#0D9488'];
      for (let i = 0; i < 6; i++) {
        const c = makeCanvas(640, 480);
        const ctx = c.getContext('2d');
        ctx.fillStyle = colors[i];
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(`P${i + 1}`, 300, 240);
        testPhotos.push(c);
      }

      const report = [];

      for (const frame of IMAGE_FRAMES) {
        const needed = frame.slots.length;
        const photosForFrame = testPhotos.slice(0, needed);
        
        // Render artwork strip with the image frame
        const canvas = await renderArtworkStrip(photosForFrame, { template: frame.id }, new Date());
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        report.push({
          id: frame.id,
          name: frame.name,
          category: frame.category,
          slotCount: frame.slots.length,
          width: canvas.width,
          height: canvas.height,
          expectedW: frame.frameW,
          expectedH: frame.frameH,
          hasValidDataUrl: dataUrl.startsWith('data:image/jpeg;base64,'),
          dataLength: dataUrl.length,
        });
      }

      return report;
    });

    expect(consoleErrors).toHaveLength(0);
    expect(results).toHaveLength(24);

    for (const r of results) {
      expect(r.hasValidDataUrl).toBe(true);
      expect(r.dataLength).toBeGreaterThan(5000);
      expect(r.width).toBe(r.expectedW);
      expect(r.height).toBe(r.expectedH);
      expect(r.slotCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('Image Frames metadata, thumbnails, multi-slot support, and overlay compositing', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('Failed to load resource') && !text.includes('NotReadableError') && !text.includes('Device in use') && !text.includes('NotFoundError')) {
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.goto('/tests/e2e/fixtures/frame-harness.html');

    const check = await page.evaluate(async () => {
      const { IMAGE_FRAMES } = await import('/src/lib/imageFrames.js');
      const { STRIP_TEMPLATES, TEMPLATE_CATEGORIES, RECOMMENDED_TEMPLATES, RECOMMENDED_FRAME_TEMPLATES } = await import('/src/lib/presets.js');
      const { getTemplateThumbnail } = await import('/src/lib/thumbnails.js');
      const { renderArtworkStrip } = await import('/src/lib/templateRenderer.js');
      const { makeCanvas } = await import('/src/lib/photos.js');

      // 1. Verify thumbnails and compositor use the same build-managed assets.
      const thumbnailChecks = IMAGE_FRAMES.map(f => ({
        id: f.id,
        thumb: getTemplateThumbnail(f.id),
      }));

      // 2. Verify STRIP_TEMPLATES contains all image frames
      const inStripTemplates = IMAGE_FRAMES.every(f => STRIP_TEMPLATES.some(t => t.id === f.id));

      // 3. Verify slot counts: must support 1, 2, 3, 4, and 6 slots
      const slotCounts = new Set(IMAGE_FRAMES.map(f => f.slots.length));

      // 4. Test compositing with user sticker and text overlay on an image frame
      const dummyPhoto = makeCanvas(640, 480);
      const ctx = dummyPhoto.getContext('2d');
      ctx.fillStyle = '#FF5500';
      ctx.fillRect(0, 0, 640, 480);

      const frameToTest = IMAGE_FRAMES[0];
      const photos = Array(frameToTest.slots.length).fill(dummyPhoto);

      const styleWithOverlays = {
        template: frameToTest.id,
        userStickers: [
          { instanceId: 'test_1', stickerId: 'red-stitched-star', x: 0.5, y: 0.5, scale: 0.2, rotation: 0, zIndex: 1 }
        ],
        userTexts: [
          { id: 'txt_1', text: 'CissPic Memories', x: 0.5, y: 0.9, fontSize: 32, font: 'Caveat', color: '#FFFFFF', zIndex: 2 }
        ],
      };

      const canvasWithOverlays = await renderArtworkStrip(photos, styleWithOverlays, new Date());
      const dataUrl = canvasWithOverlays.toDataURL('image/jpeg', 0.85);

      return {
        frameCount: IMAGE_FRAMES.length,
        allThumbsValid: thumbnailChecks.every(t => t.thumb === IMAGE_FRAMES.find(f => f.id === t.id).src && !new URL(t.thumb, location.href).pathname.startsWith('/frames/')),
        inStripTemplates,
        slotCounts: Array.from(slotCounts).sort(),
        hasOverlaysCanvas: canvasWithOverlays.width > 0 && canvasWithOverlays.height > 0,
        hasOverlaysDataUrl: dataUrl.startsWith('data:image/jpeg;base64,'),
        categories: TEMPLATE_CATEGORIES,
        recommended: RECOMMENDED_TEMPLATES,
        recommendedFrame: RECOMMENDED_FRAME_TEMPLATES,
      };
    });

    expect(consoleErrors).toHaveLength(0);
    expect(check.frameCount).toBe(24);
    expect(check.allThumbsValid).toBe(true);
    expect(check.inStripTemplates).toBe(true);
    expect(check.slotCounts).toEqual([1, 2, 3, 4, 6]);
    expect(check.hasOverlaysCanvas).toBe(true);
    expect(check.hasOverlaysDataUrl).toBe(true);
    expect(check.categories).toContain('Spidey');
    expect(check.categories).toContain('Kawaii');
    expect(check.categories).toContain('Disney');
    expect(check.recommendedFrame[1]).toBe('frame-snoopy-1cut');
    expect(check.recommendedFrame[3]).toBe('frame-spiderman-3cut');
  });
});
