import { test, expect } from '@playwright/test';

async function ready(page) {
  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start 4-Cut Session' })).toBeEnabled();
}
async function captureSingle(page) {
  await ready(page);
  await page.getByRole('button', { name: 'Take single shot' }).click();
  await expect(page.getByRole('heading', { name: 'Make the moment yours.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simpan Strip Foto' })).toBeEnabled();
}
test('real MediaStream → 4 frames → retake → customization → PNG → persistent gallery', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await ready(page);
  await page.screenshot({ path: 'artifacts/snapbooth-desktop.png', fullPage: true });
  expect(await page.locator('video').evaluate(v => v.srcObject instanceof MediaStream && v.videoWidth > 0)).toBe(true);
  await page.getByRole('button', { name: 'Soft Korean', exact: true }).click();
  await page.getByRole('button', { name: 'Start 4-Cut Session' }).click();
  await expect(page.locator('.countdown')).toHaveText('3');
  await expect(page.getByRole('heading', { name: 'Make the moment yours.' })).toBeVisible({ timeout: 25000 });
  await expect(page.locator('.pose-tile > img')).toHaveCount(4);
  const before = await page.locator('.pose-tile > img').evaluateAll(imgs => imgs.map(i => i.src));
  expect(new Set(before).size).toBe(4);
  expect(before.every(src => src.startsWith('data:image/jpeg'))).toBe(true);
  await page.getByRole('button', { name: 'Retake Pose 3', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retake Pose 3', exact: true }).first()).toBeEnabled();
  await page.locator('.shutter').click();
  await expect(page.getByRole('heading', { name: 'Make the moment yours.' })).toBeVisible({ timeout: 25000 });
  const after = await page.locator('.pose-tile > img').evaluateAll(imgs => imgs.map(i => i.src));
  expect(after[0]).toBe(before[0]); expect(after[1]).toBe(before[1]); expect(after[3]).toBe(before[3]); expect(after[2]).not.toBe(before[2]);

  // Stickers Tab: add a tactile sticker to the photostrip
  await page.getByRole('tab', { name: 'Stickers' }).click();
  await page.locator('.sticker-catalog-card').first().click();
  await expect(page.locator('.placed-sticker-wrapper')).toHaveCount(1);

  // Adjust & Theme Tab: location and custom keepsake message
  await page.getByRole('tab', { name: 'Adjust & Theme' }).click();
  await page.getByRole('textbox', { name: 'Location label' }).fill('Seoul, a little memory');
  await page.getByRole('switch', { name: 'Show Time' }).uncheck();
  await page.getByLabel('Keepsake Message').fill('The best kind of ordinary day ♡');
  await expect(page.getByRole('button', { name: 'Simpan Strip Foto' })).toBeEnabled();
  await page.screenshot({ path: 'artifacts/snapbooth-result.png', fullPage: true });
  const dimensions = await page.locator('.strip-image').evaluate(img => [img.naturalWidth, img.naturalHeight]);
  expect(dimensions[0]).toBeGreaterThanOrEqual(800);
  expect(dimensions[1]).toBeGreaterThanOrEqual(1800);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Simpan Strip Foto' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^SnapBooth-\d{8}-\d{4}\.png$/);
  await file.saveAs('artifacts/snapbooth-export.png');
  await expect(page.getByRole('status')).toContainText('PNG download started');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Gallery', exact: true }).click();
  await expect(page.locator('.gallery-card')).toHaveCount(1);
  await page.reload();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Gallery', exact: true }).click();
  await expect(page.locator('.gallery-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Delete photostrip' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep it', exact: true }).click();
  await expect(page.locator('.gallery-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Delete photostrip' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete photostrip' }).click();
  await expect(page.locator('.gallery-card')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('single capture, all layouts, adjustment, share fallback and honest print planner', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'canShare', { value: undefined }); });
  await captureSingle(page);
  await expect(page.locator('.pose-tile > img')).toHaveCount(1);

  // Filters Tab
  await page.getByRole('tab', { name: 'Filters' }).click();
  await page.getByRole('button', { name: 'B&W Classic', exact: true }).click();

  // Adjust Tab
  await page.getByRole('tab', { name: 'Adjust & Theme' }).click();
  await page.getByRole('slider', { name: 'Brightness' }).fill('15');
  await page.getByRole('switch', { name: 'Soft Glow' }).check();
  await page.getByRole('button', { name: 'Reset Filter, Efek & Adjust ke Default' }).click();
  await expect(page.getByRole('slider', { name: 'Brightness' })).toHaveValue('0');

  // Layout Tab
  await page.getByRole('tab', { name: 'Grid / Layout' }).click();
  await page.locator('.layout-card').first().click();
  await expect(page.getByRole('button', { name: 'Simpan Strip Foto' })).toBeEnabled();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  await download;
  await expect(page.getByRole('status')).toContainText('download started instead');
  await page.getByRole('button', { name: 'Pesan Cetak' }).click();
  await expect(page.getByRole('dialog')).toContainText('No order or payment will be submitted');
  await page.getByLabel('Copies', { exact: true }).selectOption('3');
  await expect(page.locator('.print-sheet img')).toHaveCount(3);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

for (const name of ['NotAllowedError', 'NotFoundError', 'NotReadableError', 'OverconstrainedError']) {
  test(`camera failure ${name} is recoverable`, async ({ page }) => {
    await page.addInitScript(errorName => {
      navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Camera test', errorName); };
    }, name);
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start 4-Cut Session' })).toBeDisabled();
    await page.getByRole('button', { name: 'Try Again' }).click();
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Aesthetic 4-Cut Photo Studio' })).toBeVisible();
  });
}

test('mobile and desktop stay within the viewport; theme and keyboard modal work', async ({ page }) => {
  await ready(page);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/snapbooth-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Use dark theme' }).click();
  await expect(page.locator('.snapbooth')).toHaveClass(/dark/);
  await page.screenshot({ path: 'artifacts/snapbooth-dark-mobile.png', fullPage: true });
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Gallery' }).click();
  await expect(page.getByText('Your photostrips will appear here.')).toBeVisible();
  await page.getByRole('button', { name: 'My space' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('cancelling capture and navigating away stops tracks and pending countdowns', async ({ page }) => {
  await page.addInitScript(() => {
    window.cameraTracks = [];
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async args => { const stream = await original(args); window.cameraTracks.push(...stream.getTracks()); return stream; };
  });
  await ready(page);
  await page.getByRole('button', { name: 'Start 4-Cut Session' }).click();
  await page.getByRole('button', { name: 'Cancel session' }).click();
  await expect(page.locator('.countdown')).toHaveCount(0);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Gallery' }).click();
  await expect.poll(() => page.evaluate(() => window.cameraTracks.every(track => track.readyState === 'ended'))).toBe(true);
  await page.waitForTimeout(3000);
  await expect(page.getByRole('heading', { name: 'A little collection of you.' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Studio' }).click();
  await expect(page.getByRole('button', { name: 'Start 4-Cut Session' })).toBeEnabled();
  await expect(page.locator('.pose-tile > img')).toHaveCount(0);
});

