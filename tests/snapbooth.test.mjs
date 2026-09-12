import test from 'node:test';
import assert from 'node:assert/strict';
import { colorMatrix, cropRect, DEFAULT_ADJUST, filename } from '../src/lib/presets.js';

test('crop centers a wide and portrait sensor without stretching', () => {
  assert.deepEqual(cropRect(1920, 1080), { x: 240, y: 0, width: 1440, height: 1080 });
  assert.deepEqual(cropRect(1080, 1920), { x: 0, y: 555, width: 1080, height: 810 });
});
test('monochrome presets remove chroma in all output channels', () => {
  for (const name of ['bw', 'noir']) {
    const m = colorMatrix(name, DEFAULT_ADJUST);
    assert.deepEqual(m.slice(0, 5), m.slice(5, 10));
    assert.deepEqual(m.slice(5, 10), m.slice(10, 15));
    assert.deepEqual(m.slice(15), [0, 0, 0, 1, 0]);
  }
});
test('warmth moves red and blue oppositely while preserving alpha', () => {
  const normal = colorMatrix('natural'), warm = colorMatrix('natural', { ...DEFAULT_ADJUST, warmth: 30 });
  assert.ok(warm[4] > normal[4]); assert.ok(warm[14] < normal[14]);
  assert.deepEqual(warm.slice(15), [0, 0, 0, 1, 0]);
});
test('download names use local capture date with padding', () => {
  assert.equal(filename(new Date(2026, 0, 2, 3, 4)), 'SnapBooth-20260102-0304.png');
});
