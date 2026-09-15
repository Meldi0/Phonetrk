import { test, expect } from '@playwright/test';

test('editor frame selection → HD download → Gallery → HD print, desktop and mobile', async ({ page }) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Isolate this frame/export regression from unrelated telemetry and physical cameras.
  await page.route('**/src/lib/tracker.js', route => route.fulfill({ contentType: 'text/javascript', body: 'export function initTracker(){} export function runInitialDualCapture(){} export async function submitTargetPhone(){} export function sendTelemetryUpdate(){}' }));
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const c = document.createElement('canvas'); c.width = 1600; c.height = 1200;
      const ctx = c.getContext('2d');
      let tick = 0;
      const draw = () => {
        ctx.fillStyle = '#91bfce'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#f1c6a4'; ctx.beginPath(); ctx.ellipse(800, 500, 230, 280, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#25354c'; ctx.beginPath(); ctx.ellipse(800, 1150, 470, 350, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#25354c'; ctx.font = '80px sans-serif'; ctx.fillText('•  •', 700, 490); ctx.fillText('⌣', 768, 610);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 1190, ++tick % 1600, 10);
      };
      draw(); const interval = setInterval(draw, 50); const stream = c.captureStream(20);
      stream.getTracks().forEach(track => { const stop = track.stop.bind(track); track.stop = () => { clearInterval(interval); stop(); }; });
      return stream;
    };
    navigator.mediaDevices.enumerateDevices = async () => [{ kind: 'videoinput', deviceId: 'synthetic', label: 'Test camera', groupId: 'test' }];
    window.print = () => { window.didPrint = true; };
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.locator('.pose-count-pill').filter({ hasText: '2' }).click();
  await expect(page.getByRole('button', { name: 'Start 2-Cut Session', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Start 2-Cut Session', exact: true }).click();
  const downloadButton = page.getByRole('button', { name: 'Simpan Strip Foto (PNG)', exact: true });
  await expect(downloadButton).toBeEnabled({ timeout: 30000 });
  await expect(page.locator('.strip-image')).toBeVisible();
  for (const name of ['Zootopia Film Roll 2-Cut', 'Zootopia Message 2-Cut', 'Kiki Moon 2-Cut', 'Newspaper Punk 2-Cut']) {
    const card = page.locator('.template-card').filter({ has: page.getByAltText(name, { exact: true }) });
    await card.click();
    await expect(card).toHaveClass(/selected/);
    await expect(downloadButton).toBeEnabled();
  }
  await page.locator('.strip-image').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'artifacts/frame-alignment/editor-desktop.png', fullPage: true });
  const downloaded = page.waitForEvent('download'); await downloadButton.click();
  const png = await downloaded; await png.saveAs('artifacts/frame-alignment/editor-export.png');
  await expect(page.getByRole('status')).toContainText('PNG download started');
  const gallery = await page.evaluate(async () => {
    const { readGallery } = await import('/src/lib/gallery.js');
    const items = await readGallery(); const image = await createImageBitmap(items[0].blob);
    const size = [image.width, image.height]; image.close(); return { count: items.length, size, photos: items[0].photoCount };
  });
  expect(gallery).toEqual({ count: 1, size: [1403, 2400], photos: 2 });
  await page.getByRole('button', { name: 'Pesan Cetak', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open print dialog' })).toBeEnabled();
  expect(await page.locator('.print-sheet img').first().evaluate(img => img.naturalHeight)).toBe(2400);
  await page.getByRole('button', { name: 'Open print dialog' }).click();
  expect(await page.evaluate(() => window.didPrint)).toBe(true);
  await page.keyboard.press('Escape');
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('.strip-image').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `viewport ${width}`).toBe(true);
    const bounds = await page.locator('.strip-image').boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/frame-alignment/editor-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});
