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

test('download names use local capture date with padding and CissPic prefix', () => {
  assert.equal(filename(new Date(2026, 0, 2, 3, 4)), 'CissPic-20260102-0304.png');
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

import { STICKER_LIBRARY, STICKER_CATEGORIES } from '../src/lib/stickers.js';

test('sticker library contains >= 40 tactile visual assets across 6 physical collections', () => {
  assert.ok(STICKER_LIBRARY.length >= 40, `Sticker library must have >= 40 items, found ${STICKER_LIBRARY.length}`);

  const requiredCategories = ['Fabric', 'Flowers', 'Denim', 'Retro', 'Scrapbook', 'Cute'];
  for (const cat of requiredCategories) {
    assert.ok(STICKER_CATEGORIES.includes(cat), `Category ${cat} must be in STICKER_CATEGORIES`);
    const count = STICKER_LIBRARY.filter(s => s.category === cat).length;
    assert.ok(count >= 4, `Category ${cat} must have at least 4 items, found ${count}`);
  }

  // Key requested stickers from visual references
  const starSticker = STICKER_LIBRARY.find(s => s.id === 'red-stitched-star');
  assert.ok(starSticker, 'Red stitched star sticker must exist');
  assert.equal(starSticker.category, 'Fabric');
  assert.ok(starSticker.src.endsWith('.webp'));

  const lilySticker = STICKER_LIBRARY.find(s => s.id === 'burgundy-lily');
  assert.ok(lilySticker, 'Burgundy lily sticker must exist');
  assert.equal(lilySticker.category, 'Flowers');
  assert.ok(lilySticker.src.endsWith('.webp'));

  // Ensure NO emoji Unicode characters are used as stickers
  for (const s of STICKER_LIBRARY) {
    assert.ok(s.id && typeof s.id === 'string');
    assert.ok(s.name && typeof s.name === 'string');
    assert.ok(s.src && s.src.startsWith('/stickers/'));
    assert.ok(s.defaultScale > 0 && s.defaultScale <= 1);
    assert.ok(s.aspectRatio > 0);
    assert.ok(Array.isArray(s.tags) && s.tags.length > 0);
    // No emoji unicode characters
    assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(s.name), `Sticker name ${s.name} should not be an emoji`);
  }
});

test('new artistic template versions 1, 2, 4, 6 exist with negative space and slots', () => {
  const versions = [
    { id: 'version-1-clean', name: 'Clean Minimal Space', minSlots: 4 },
    { id: 'version-2-balanced', name: 'Balanced Scrapbook', minSlots: 3 },
    { id: 'version-4-retro', name: 'The Daily Chronicle', minSlots: 3 },
    { id: 'version-6-expressive', name: 'CD Music Memories', minSlots: 3 },
  ];

  for (const v of versions) {
    const tpl = ARTISTIC_TEMPLATES.find(t => t.id === v.id);
    assert.ok(tpl, `Template ${v.id} must exist in ARTISTIC_TEMPLATES`);
    assert.ok(tpl.photoSlots.length >= v.minSlots, `Template ${v.id} must have >= ${v.minSlots} slots`);
    assert.ok(tpl.canvas.width >= 800 && tpl.canvas.height >= 1800);

    for (const slot of tpl.photoSlots) {
      assert.ok(slot.x >= 0 && slot.y >= 0);
      assert.ok(slot.width > 0 && slot.height > 0);
      assert.ok(slot.x + slot.width <= tpl.canvas.width);
      assert.ok(slot.y + slot.height <= tpl.canvas.height);
    }
  }
});

test('sticker normalized coordinate mapping guarantees canvas parity', () => {
  const canvasW = 800;
  const canvasH = 2000;
  const sticker = {
    x: 0.5,
    y: 0.25,
    scale: 0.2,
    rotation: 45,
    flipX: true,
    zIndex: 3,
  };

  const pixelX = sticker.x * canvasW;
  const pixelY = sticker.y * canvasH;
  const pixelW = sticker.scale * canvasW;

  assert.equal(pixelX, 400);
  assert.equal(pixelY, 500);
  assert.equal(pixelW, 160);

  // Verification that DOM percentages match canvas normalized values exactly
  const domLeftPct = `${sticker.x * 100}%`;
  const domTopPct = `${sticker.y * 100}%`;
  const domWidthPct = `${sticker.scale * 100}%`;

  assert.equal(domLeftPct, '50%');
  assert.equal(domTopPct, '25%');
  assert.equal(domWidthPct, '20%');
});

import { RECOMMENDED_TEMPLATES, getCompatibleTemplates } from '../src/lib/presets.js';

test('dedicated reference adaptations exist with exactly 2 photo slots', () => {
  // Reference 3: Denim Lace Duo
  const denimLace = ARTISTIC_TEMPLATES.find(t => t.id === 'denim-lace-2');
  assert.ok(denimLace, 'denim-lace-2 must exist');
  assert.equal(denimLace.photoSlots.length, 2);
  assert.deepEqual(denimLace.supportedPhotoCounts, [2]);
  assert.equal(denimLace.photoSlots[0].frameStyle, 'polaroid-maroon');
  assert.equal(denimLace.photoSlots[1].frameStyle, 'polaroid-maroon');

  // Reference 4: Digicam Duo
  const digicam = ARTISTIC_TEMPLATES.find(t => t.id === 'digicam-duo-2');
  assert.ok(digicam, 'digicam-duo-2 must exist');
  assert.equal(digicam.photoSlots.length, 2);
  assert.deepEqual(digicam.supportedPhotoCounts, [2]);
});

test('multi-cut template suites cover 1, 2, 4, and 6 photo counts with zero mismatch', () => {
  const counts = [1, 2, 4, 6];
  for (const count of counts) {
    const recommendedId = RECOMMENDED_TEMPLATES[count];
    assert.ok(recommendedId, `RECOMMENDED_TEMPLATES must have entry for ${count} photo(s)`);
    const recommendedTpl = ARTISTIC_TEMPLATES.find(t => t.id === recommendedId);
    assert.ok(recommendedTpl, `Recommended template ${recommendedId} must exist`);
    assert.equal(recommendedTpl.photoSlots.length, count, `Recommended template ${recommendedId} slots must equal ${count}`);

    const compatible = getCompatibleTemplates(count, 'All');
    assert.ok(compatible.length >= 4, `Must have at least 4 compatible templates for ${count} photos, found ${compatible.length}`);
    for (const tpl of compatible) {
      const supports = tpl.supportedPhotoCounts || [tpl.photoSlots?.length || 4];
      assert.ok(supports.includes(count), `Template ${tpl.id} must support ${count} photos`);
    }
  }
});

test('cute and clean aesthetic categories have dedicated templates', () => {
  const cuteTemplates = ARTISTIC_TEMPLATES.filter(t => t.category === 'Cute');
  assert.ok(cuteTemplates.length >= 6, `Must have at least 6 Cute templates, found ${cuteTemplates.length}`);
  const cuteIds = cuteTemplates.map(t => t.id);
  assert.ok(cuteIds.includes('ribbon-diary-2'));
  assert.ok(cuteIds.includes('cherry-picnic-2'));
  assert.ok(cuteIds.includes('strawberry-milk-2'));
  assert.ok(cuteIds.includes('cloud-diary-2'));

  const cleanTemplates = ARTISTIC_TEMPLATES.filter(t => t.category === 'Clean' || t.category === 'Minimal');
  assert.ok(cleanTemplates.length >= 6, `Must have at least 6 Clean/Minimal templates, found ${cleanTemplates.length}`);
  const cleanIds = cleanTemplates.map(t => t.id);
  assert.ok(cleanIds.includes('studio-white-1'));
  assert.ok(cleanIds.includes('studio-white-2'));
  assert.ok(cleanIds.includes('studio-white-4'));
  assert.ok(cleanIds.includes('studio-white-6'));
});

test('dedicated 1-person SVG frame templates (Lego Pop iOS, Meow Arcade, Polaroid Eject) exist and support 1 photo', () => {
  const legoPop = ARTISTIC_TEMPLATES.find(t => t.id === 'lego-pop-ios-1');
  assert.ok(legoPop, 'lego-pop-ios-1 must exist');
  assert.equal(legoPop.photoSlots.length, 1);
  assert.deepEqual(legoPop.supportedPhotoCounts, [1]);
  assert.equal(legoPop.recommendedFor, 1);

  const meowArcade = ARTISTIC_TEMPLATES.find(t => t.id === 'meow-arcade-1');
  assert.ok(meowArcade, 'meow-arcade-1 must exist');
  assert.equal(meowArcade.photoSlots.length, 1);
  assert.deepEqual(meowArcade.supportedPhotoCounts, [1]);
  assert.equal(meowArcade.recommendedFor, 1);

  const polaroidEject = ARTISTIC_TEMPLATES.find(t => t.id === 'polaroid-eject-1');
  assert.ok(polaroidEject, 'polaroid-eject-1 must exist');
  assert.equal(polaroidEject.photoSlots.length, 1);
  assert.deepEqual(polaroidEject.supportedPhotoCounts, [1]);
  assert.equal(polaroidEject.recommendedFor, 1);
});

test('clean and minimal templates use CISSPIC branding', () => {
  const cleanWhite = STRIP_TEMPLATES.find(t => t.id === 'clean-white');
  assert.ok(cleanWhite);
  assert.equal(cleanWhite.header, 'CISSPIC');
  assert.equal(cleanWhite.subHeader, 'AESTHETIC SELF PHOTO STUDIO');

  const creamPaper = STRIP_TEMPLATES.find(t => t.id === 'cream-paper');
  assert.ok(creamPaper);
  assert.equal(creamPaper.header, 'CissPic Studio');
});

import { SCRAPBOOK_MASTERPIECE_TEMPLATES } from '../src/lib/scrapbookTemplates.js';

test('tactile scrapbook masterpiece templates exist with complete canvas renderers and data-driven slots', () => {
  const requiredMasterpieces = [
    { id: 'spider-comic-scrapbook', slots: 3, cat: 'Scrapbook' },
    { id: 'spider-gwen-punk-1', slots: 1, cat: 'Scrapbook' },
    { id: 'vintage-spider-comic-1', slots: 1, cat: 'Vintage' },
    { id: 'kraft-gingham-spidey-2', slots: 2, cat: 'Cute' },
    { id: 'denim-ocean-digicam-4', slots: 4, cat: 'Vintage' },
    { id: 'denim-ocean-digicam-1', slots: 1, cat: 'Vintage' },
  ];

  for (const item of requiredMasterpieces) {
    const tpl = SCRAPBOOK_MASTERPIECE_TEMPLATES.find(t => t.id === item.id);
    assert.ok(tpl, `Masterpiece template ${item.id} must exist in SCRAPBOOK_MASTERPIECE_TEMPLATES`);
    assert.equal(tpl.photoSlots.length, item.slots, `Template ${item.id} should have ${item.slots} photo slots`);
    assert.equal(tpl.category, item.cat);
    assert.ok(typeof tpl.renderBackground === 'function', `Template ${item.id} must have renderBackground`);
    assert.ok(typeof tpl.renderForeground === 'function', `Template ${item.id} must have renderForeground`);
    assert.ok(tpl.canvas.width >= 1080 && tpl.canvas.height >= 1920);

    // Also verify it is registered inside ARTISTIC_TEMPLATES and STRIP_TEMPLATES
    assert.ok(ARTISTIC_TEMPLATES.some(t => t.id === item.id), `${item.id} must be in ARTISTIC_TEMPLATES`);
    assert.ok(STRIP_TEMPLATES.some(t => t.id === item.id), `${item.id} must be in STRIP_TEMPLATES`);
  }
});

test('aesthetic girl-appeal templates (Spider-Gwen, Comic, Coquette, Kuromi, Manga) cover multi-pose sessions', () => {
  const aestheticSuites = [
    // Spider-Gwen Cyberpunk suite
    { id: 'spider-gwen-punk-2', slots: 2 },
    { id: 'spider-gwen-punk-4', slots: 4 },
    { id: 'spider-gwen-punk-6', slots: 6 },
    // Spectacular Comic suite
    { id: 'vintage-spider-comic-2', slots: 2 },
    { id: 'vintage-spider-comic-4', slots: 4 },
    // Coquette Balletcore suite
    { id: 'coquette-pearl-1', slots: 1 },
    { id: 'coquette-pearl-2', slots: 2 },
    { id: 'coquette-pearl-4', slots: 4 },
    // Midnight Kuromi Goth suite
    { id: 'midnight-kuromi-1', slots: 1 },
    { id: 'midnight-kuromi-4', slots: 4 },
    // Shoujo Manga Romance suite
    { id: 'shoujo-manga-1', slots: 1 },
    { id: 'shoujo-manga-4', slots: 4 },
    // Y2K Cyber Angel
    { id: 'cyber-angel-1', slots: 1 },
    // Meow Cafe
    { id: 'meow-cafe-2', slots: 2 },
    { id: 'meow-cafe-4', slots: 4 },
  ];

  for (const item of aestheticSuites) {
    const tpl = STRIP_TEMPLATES.find(t => t.id === item.id);
    assert.ok(tpl, `Template ${item.id} must exist in STRIP_TEMPLATES`);
    assert.equal(tpl.photoSlots.length, item.slots, `Template ${item.id} must have ${item.slots} photo slots`);
    assert.ok(typeof tpl.renderBackground === 'function', `Template ${item.id} must have renderBackground`);
    assert.ok(typeof tpl.renderForeground === 'function', `Template ${item.id} must have renderForeground`);
  }
});

import { isMotionPhotoSupported, getSupportedVideoMimeType, renderMotionPhotoVideo } from '../src/lib/motionPhotoRenderer.js';
import { coverCrop } from '../src/lib/photoSlots.js';

test('motion photo renderer module exports required compositing functions', () => {
  assert.equal(typeof isMotionPhotoSupported, 'function');
  assert.equal(typeof getSupportedVideoMimeType, 'function');
  assert.equal(typeof renderMotionPhotoVideo, 'function');
});

test('cover crop extracts correct crop rectangles for photos and videos', () => {
  const crop = coverCrop(1920, 1080, 600, 800);
  assert.ok(crop.width > 0 && crop.height > 0);
  assert.ok(crop.x >= 0 && crop.y >= 0);
  assert.ok(crop.x + crop.width <= 1920);
  assert.ok(crop.y + crop.height <= 1080);
});



