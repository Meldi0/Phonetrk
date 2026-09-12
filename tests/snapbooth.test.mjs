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

import { ARTISTIC_TEMPLATES, ARTISTIC_CATEGORIES } from '../src/lib/artisticTemplates.js';
import { fitCover } from '../src/lib/templateRenderer.js';

test('artistic templates collection includes all 5 core reference templates with data-driven photo slots', () => {
  const coreIds = ['airmail-love', 'denim-booth', 'denim-scrapbook', 'vinyl-memories', 'denim-note'];
  for (const id of coreIds) {
    const tpl = ARTISTIC_TEMPLATES.find(t => t.id === id);
    assert.ok(tpl, `Template ${id} must exist in ARTISTIC_TEMPLATES`);
    assert.ok(tpl.name, `Template ${id} must have a name`);
    assert.ok(tpl.category, `Template ${id} must have a category`);
    assert.ok(tpl.canvas && tpl.canvas.width >= 800 && tpl.canvas.height >= 1800, `Template ${id} must have high-res canvas`);
    assert.ok(Array.isArray(tpl.photoSlots) && tpl.photoSlots.length >= 1, `Template ${id} must have photoSlots array`);
    for (const slot of tpl.photoSlots) {
      assert.ok(typeof slot.x === 'number' && typeof slot.y === 'number', `Slot in ${id} must have x and y`);
      assert.ok(slot.width > 0 && slot.height > 0, `Slot in ${id} must have positive dimensions`);
    }
  }
});

test('fitCover scales and centers photos without distorting aspect ratio', () => {
  // Landscape into portrait slot
  const res1 = fitCover(1600, 1200, 400, 400);
  assert.ok(Math.abs(res1.drawW - 533.33) < 0.1);
  assert.equal(res1.drawH, 400);
  assert.ok(Math.abs(res1.drawX - (-66.66)) < 0.1);
  assert.equal(res1.drawY, 0);

  // Portrait into landscape slot
  const res2 = fitCover(1200, 1600, 600, 300);
  assert.equal(res2.drawW, 600);
  assert.equal(res2.drawH, 800);
  assert.equal(res2.drawX, 0);
  assert.equal(res2.drawY, -250);
});

test('categories include Scrapbook, Denim, Vintage, Film, Polaroid, Minimal', () => {
  assert.ok(ARTISTIC_CATEGORIES.includes('Scrapbook'));
  assert.ok(ARTISTIC_CATEGORIES.includes('Denim'));
  assert.ok(ARTISTIC_CATEGORIES.includes('Vintage'));
  assert.ok(ARTISTIC_CATEGORIES.includes('Film'));
  assert.ok(ARTISTIC_CATEGORIES.includes('Polaroid'));
  assert.ok(ARTISTIC_CATEGORIES.includes('Minimal'));
});
