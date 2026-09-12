import test from 'node:test';
import assert from 'node:assert/strict';
import {
  colorMatrix,
  cropRect,
  DEFAULT_ADJUST,
  filename,
  FILTERS,
  STRIP_TEMPLATES,
  EFFECTS,
  CAPTURE_PACES,
} from '../src/lib/presets.js';

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
  const normal = colorMatrix('natural'),
    warm = colorMatrix('natural', { ...DEFAULT_ADJUST, warmth: 30 });
  assert.ok(warm[4] > normal[4]);
  assert.ok(warm[14] < normal[14]);
  assert.deepEqual(warm.slice(15), [0, 0, 0, 1, 0]);
});

test('download names use local capture date with padding', () => {
  assert.equal(filename(new Date(2026, 0, 2, 3, 4)), 'SnapBooth-20260102-0304.png');
});

test('studio filters collection includes at least 16 tasteful filters', () => {
  assert.ok(FILTERS.length >= 16);
  const ids = FILTERS.map(f => f.id);
  assert.ok(ids.includes('natural'));
  assert.ok(ids.includes('korean'));
  assert.ok(ids.includes('retro'));
  assert.ok(ids.includes('disposable'));
  assert.ok(ids.includes('dreamy'));
  assert.ok(ids.includes('sakura'));
  assert.ok(ids.includes('bw'));
});

test('strip templates covers Clean, Cute, Playful, Retro, and Y2K with >= 20 templates', () => {
  assert.ok(STRIP_TEMPLATES.length >= 20);
  const categories = new Set(STRIP_TEMPLATES.map(t => t.category));
  assert.ok(categories.has('Clean'));
  assert.ok(categories.has('Cute'));
  assert.ok(categories.has('Playful'));
  assert.ok(categories.has('Retro'));
  assert.ok(categories.has('Y2K'));

  for (const t of STRIP_TEMPLATES) {
    assert.ok(t.id && t.name && t.category && t.background && t.textColor);
  }
});

test('creative and privacy effects are properly defined', () => {
  const effectIds = EFFECTS.map(e => e.id);
  assert.ok(effectIds.includes('pixel-blur'));
  assert.ok(effectIds.includes('eight-bit'));
  assert.ok(effectIds.includes('dream-glow'));
  assert.ok(effectIds.includes('film-grain'));
  assert.ok(effectIds.includes('rgb-shift'));
  assert.ok(effectIds.includes('pixel-face'));
  assert.ok(effectIds.includes('blur-face'));
  assert.ok(effectIds.includes('black-bar'));
});

test('capture paces define timing intervals', () => {
  const paceIds = CAPTURE_PACES.map(p => p.id);
  assert.ok(paceIds.includes('relaxed'));
  assert.ok(paceIds.includes('normal'));
  assert.ok(paceIds.includes('fast'));
});
