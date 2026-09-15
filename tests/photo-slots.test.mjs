import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { coverCrop, quadProjection, slotCorners } from '../src/lib/photoSlots.js';
import { IMAGE_FRAMES, getImageFrameTemplates } from '../src/lib/imageFrames.js';

test('all catalog frames are existing build-managed JPEG assets, not unserved /frames URLs', () => {
  for (const frame of IMAGE_FRAMES) {
    const url = new URL(frame.src);
    assert.equal(url.protocol, 'file:');
    assert.ok(url.pathname.includes('/src/assets/frames/'));
    const bytes = readFileSync(url);
    assert.equal(bytes.readUInt16BE(0), 0xffd8, `${frame.id}: JPEG header`);
    assert.ok(bytes.length > 1000);
  }
});

test('cover crop preserves aspect ratio, stays inside source, and supports headroom', () => {
  for (const source of [[1600, 1200], [1080, 1920], [300, 300]]) {
    for (const target of [[400, 600], [600, 250], [400, 400]]) {
      const crop = coverCrop(...source, ...target, { x: 0.5, y: 0.4 });
      assert.ok(Math.abs(crop.width / crop.height - target[0] / target[1]) < 1e-10);
      assert.ok(crop.x >= 0 && crop.y >= 0);
      assert.ok(crop.x + crop.width <= source[0] + 1e-9);
      assert.ok(crop.y + crop.height <= source[1] + 1e-9);
      assert.ok(crop.y <= coverCrop(...source, ...target).y);
    }
  }
  assert.throws(() => coverCrop(0, 1200, 400, 600));
});

test('all 34 frame configurations expose the real 86 apertures and consistent catalog geometry', () => {
  assert.equal(IMAGE_FRAMES.length, 34);
  assert.equal(IMAGE_FRAMES.reduce((n, frame) => n + frame.slots.length, 0), 86);
  const catalog = getImageFrameTemplates();
  for (const frame of IMAGE_FRAMES) {
    assert.deepEqual(frame.supportedPhotoCounts, [frame.slots.length]);
    const rendered = catalog.find(t => t.id === frame.id);
    assert.deepEqual(rendered.canvas, { width: frame.frameW, height: frame.frameH });
    for (const slot of frame.slots) {
      assert.ok(slot.width > 0 && slot.height > 0);
      assert.equal(slot.corners.length, 4);
      assert.ok(slot.mask.polygon.length >= 4);
      for (const [x, y] of [...slot.corners, ...slot.mask.polygon]) {
        assert.ok(x >= 0 && x <= frame.frameW && y >= 0 && y <= frame.frameH, `${frame.id}: out of bounds`);
      }
      const project = quadProjection(slot.corners);
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach((uv, i) => {
        const point = project.point(...uv);
        assert.ok(Math.hypot(point[0] - slot.corners[i][0], point[1] - slot.corners[i][1]) < 1e-7);
      });
    }
  }
});

test('rotation acts around slot center and perspective maps every corner exactly', () => {
  const corners = slotCorners({ x: 10, y: 20, width: 80, height: 40, rotation: Math.PI / 2 });
  assert.deepEqual(corners.map(p => p.map(n => Math.round(n) || 0)), [[70, 0], [70, 80], [30, 80], [30, 0]]);
  const project = quadProjection([[10, 10], [90, 20], [100, 120], [0, 100]]);
  assert.equal(project.affine, false);
  assert.deepEqual(project.point(0, 0), [10, 10]);
  assert.throws(() => quadProjection([[0, 0], [1, 0], [2, 0], [3, 0]]));
});

test('regression: screenshot frames use measured native dimensions and artwork angles', () => {
  const find = id => IMAGE_FRAMES.find(f => f.id === id);
  assert.deepEqual([find('frame-newspaper-punk-2cut').frameW, find('frame-newspaper-punk-2cut').frameH], [735, 1257]);
  assert.ok(find('frame-kiki-moon-2cut').slots[0].rotation < 0);
  assert.ok(find('frame-kiki-moon-2cut').slots[1].rotation > 0);
  assert.ok(find('frame-zootopia-film-2cut').slots[0].width < 400);
  assert.deepEqual(find('frame-snoopy-spiderman-2cut').supportedPhotoCounts, [2]);
  assert.deepEqual(find('frame-film-strip-stars-2cut').supportedPhotoCounts, [6]);
});
