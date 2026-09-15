/**
 * Data-driven Photo Strip & Artwork Template System.
 * Defines dimensions, physical materials, photo slot geometry, and custom layer renderers
 * based on the 5 visual references:
 * 1. Airmail Love (Vintage Airmail Photostrip)
 * 2. Denim Booth (Denim Polaroid Collage / 35mm Film)
 * 3. Denim Scrapbook (Multi-material Scrapbook Collage)
 * 4. Vinyl Memories (Vinyl Record + Scattered Polaroids)
 * 5. Denim Note (Denim Card + Ripped Paper)
 * + Curated derivative variants.
 */

import {
  createDenimPattern,
  createPaperPattern,
  drawAirmailBorder,
  drawChromeStar,
  drawCurlyPhoneCord,
  drawDenimStar,
  drawFilmSprockets,
  drawGooglyEyes,
  drawJeansPocket,
  drawLaceOverlay,
  drawMascotPatch,
  drawPerforatedDots,
  drawPolaroidFrame,
  drawPostmark,
  drawReceipt,
  drawRetroCamera,
  drawSafetyPin,
  drawStitches,
  drawVinylRecord,
  drawNewspaperHeader,
  drawTornNewspaperFrame,
  drawMusicPlayerCard,
  drawLaceDenimBackground,
  drawVintageDigicam,
  drawFabricBow,
  drawCuteCherries,
  drawWashiTapeStrip,
} from './canvasTextures.js';
import { ADDITIONAL_TEMPLATES } from './additionalTemplates.js';
import { THEMED_TEMPLATES } from './themedTemplates.js';
import { SCRAPBOOK_MASTERPIECE_TEMPLATES } from './scrapbookTemplates.js';

const BASE_ARTISTIC_TEMPLATES = [
  // ==========================================
  // TEMPLATE 01: VINTAGE AIRMAIL PHOTO STRIP
  // ==========================================
  {
    id: 'airmail-love',
    name: 'Airmail Love',
    category: 'Vintage',
    description: 'Vintage kraft paper with diagonal red & navy airmail border, postmark & stamp',
    background: ['#E8DEC8'],
    textColor: '#1D3557',
    recommendedPoses: 3,
    defaultFilter: 'vintage',
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 75, width: 640, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 2, x: 80, y: 530, width: 640, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 3, x: 80, y: 985, width: 640, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      // Kraft paper background
      const pattern = createPaperPattern(ctx, 'kraft');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);

      // Diagonal Red & Navy airmail border
      drawAirmailBorder(ctx, width, height, 26, 0);

      // Inner cream border with rounded inner rectangle
      ctx.fillStyle = '#F5EEDC';
      ctx.fillRect(52, 52, width - 104, height - 104);

      // Subtle perforated dots dividing the photo slots
      drawPerforatedDots(ctx, 70, 510, width - 70, 510, 12, 2, '#9C886B');
      drawPerforatedDots(ctx, 70, 965, width - 70, 965, 12, 2, '#9C886B');
      drawPerforatedDots(ctx, 70, 1420, width - 70, 1420, 12, 2, '#9C886B');
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateFormatted = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(-2)}`;

      // Typography in the large bottom section
      const title = style.header || 'SNAP & BOOTH';
      const subtitle = style.text || 'got hitched!';

      ctx.save();
      ctx.textAlign = 'center';

      // Title (Vintage condensed slab)
      ctx.fillStyle = '#1D3557';
      ctx.font = '900 44px "DM Sans", "Arial Black", sans-serif';
      ctx.fillText(title, width / 2, 1490);

      // Script "&" accent
      ctx.fillStyle = '#C0392B';
      ctx.font = 'italic 700 38px Georgia, serif';
      ctx.fillText('&', width / 2, 1540);

      // Secondary line
      ctx.fillStyle = '#1D3557';
      ctx.font = '900 42px "DM Sans", "Arial Black", sans-serif';
      ctx.fillText('STUDIO MEMORIES', width / 2, 1590);

      // Script subtitle
      ctx.fillStyle = '#C0392B';
      ctx.font = 'italic 600 28px Georgia, serif';
      ctx.fillText(subtitle, width / 2, 1645);

      // Date Stamp
      if (style.showDate !== false) {
        ctx.fillStyle = '#2B3A42';
        ctx.font = '900 36px "DM Sans", sans-serif';
        ctx.fillText(dateFormatted, width / 2, 1710);
      }

      // Studio subline
      ctx.fillStyle = '#6E6252';
      ctx.font = '700 16px "DM Sans", sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('K-STYLE PHOTO STUDIO', width / 2, 1760);

      // Circular postal cancellation stamp with wavy lines
      drawPostmark(ctx, 240, 1820, 62, 'LUCKY IN LOVE', dateFormatted, 'rgba(29, 53, 87, 0.75)');

      ctx.restore();
    },
  },

  // ==========================================
  // TEMPLATE 02: DENIM POLAROID COLLAGE / FILM
  // ==========================================
  {
    id: 'denim-booth',
    name: 'Denim Booth',
    category: 'Denim',
    description: 'Dark navy twill denim background, 4-cut 35mm film negative, retro camera & cute patch',
    background: ['#162035'],
    textColor: '#FFFFFF',
    recommendedPoses: 4,
    defaultFilter: 'korean',
    canvas: { width: 1000, height: 1800 },
    photoSlots: [
      { id: 1, x: 365, y: 295, width: 270, height: 220, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 2, x: 365, y: 550, width: 270, height: 220, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 3, x: 365, y: 805, width: 270, height: 220, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 4, x: 365, y: 1060, width: 270, height: 220, borderRadius: 2, frameStyle: 'film-slot' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      // Realistic navy denim twill pattern
      const denim = createDenimPattern(ctx, 'navy');
      ctx.fillStyle = denim;
      ctx.fillRect(0, 0, width, height);

      // Vintage telephone receiver + curly cord on left
      drawCurlyPhoneCord(ctx, 210, 240, 210, 660);

      // Center vertical 35mm film negative strip
      drawFilmSprockets(ctx, 310, 260, 380, 1050, ['4', '3', '3A', '2A']);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;

      // Top: Retro Instant Camera (Polaroid OneStep style)
      drawRetroCamera(ctx, width / 2 - 150, 35, 300, 205);

      // Top-Left: Googly Eyes & cursor pointer
      drawGooglyEyes(ctx, 60, 70, 44);

      // Cursor pointer sticker
      ctx.save();
      ctx.translate(180, 230);
      ctx.rotate(-0.3);
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 36);
      ctx.lineTo(10, 27);
      ctx.lineTo(20, 44);
      ctx.lineTo(27, 40);
      ctx.lineTo(17, 23);
      ctx.lineTo(28, 23);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Bottom-Left: 3D Chrome Metallic Puffy Star
      drawChromeStar(ctx, 150, 1540, 88);

      // Bottom-Right: Original Beagle Dog Fabric Patch Mascot
      drawMascotPatch(ctx, 840, 1500, 125);
    },
  },

  // ==========================================
  // TEMPLATE 03: DENIM SCRAPBOOK FILM
  // ==========================================
  {
    id: 'denim-scrapbook',
    name: 'Denim Scrapbook',
    category: 'Scrapbook',
    description: 'Layered collage with blue lace, store receipt, tilted denim patch & jeans pocket',
    background: ['#ECE9E2'],
    textColor: '#221911',
    recommendedPoses: 3,
    defaultFilter: 'retro',
    canvas: { width: 1000, height: 1800 },
    photoSlots: [
      { id: 1, x: 310, y: 240, width: 340, height: 235, rotation: -0.045, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 2, x: 322, y: 505, width: 340, height: 235, rotation: -0.045, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 3, x: 334, y: 770, width: 340, height: 235, rotation: -0.045, borderRadius: 2, frameStyle: 'film-slot' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      // Neutral light grey collage base
      ctx.fillStyle = '#ECE9E2';
      ctx.fillRect(0, 0, width, height);

      // LEFT: Vintage blue floral lace
      ctx.fillStyle = '#39537E';
      ctx.fillRect(0, 0, 480, height);
      drawLaceOverlay(ctx, 0, 0, 480, height);

      // TOP RIGHT: Store receipt with barcode
      drawReceipt(ctx, 510, 15, 450, 600);

      // BOTTOM RIGHT: Vintage notebook paper pattern with blue sketches
      ctx.save();
      ctx.fillStyle = '#FAF8F3';
      ctx.fillRect(470, 620, width - 470, height - 620);
      ctx.strokeStyle = '#DDE3ED';
      ctx.lineWidth = 1;
      for (let ly = 640; ly < height; ly += 24) {
        ctx.beginPath();
        ctx.moveTo(470, ly);
        ctx.lineTo(width, ly);
        ctx.stroke();
      }
      ctx.restore();

      // CENTER: Tilted dark denim patch card
      ctx.save();
      ctx.translate(485, 525);
      ctx.rotate(-0.045);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;

      const denim = createDenimPattern(ctx, 'navy');
      ctx.fillStyle = denim;
      ctx.fillRect(-260, -420, 520, 840);

      ctx.shadowColor = 'transparent';

      // White running stitches around perimeter of denim patch
      drawStitches(ctx, { rect: { x: -250, y: -410, w: 500, h: 820 } }, '#FFFFFF', 2.2, [8, 5]);

      // 3-cut 35mm film negative on the denim patch
      drawFilmSprockets(ctx, -210, -380, 420, 760, ['WY-11', 'WY-12', 'WY-13']);

      ctx.restore();
    },
    renderForeground(ctx) {
      // BOTTOM: Large realistic denim jeans back pocket with gold stitching & brass rivet
      drawJeansPocket(ctx, 200, 1070, 600, 680, 'SB #1 NORRIS');
    },
  },

  // ==========================================
  // TEMPLATE 04: VINYL POLAROID COLLAGE
  // ==========================================
  {
    id: 'vinyl-memories',
    name: 'Vinyl Memories',
    category: 'Polaroid',
    description: 'Black 33 RPM vinyl record with micro-grooves and 5 scattered casually tilted Polaroids',
    background: ['#F7F6F2'],
    textColor: '#222222',
    recommendedPoses: 5,
    defaultFilter: 'dreamy',
    canvas: { width: 1000, height: 1800 },
    photoSlots: [
      // 5 scattered Polaroid frames (slot dimensions define the inner photo window, Polaroid frame renders around it)
      { id: 1, x: 330, y: 140, width: 280, height: 260, rotation: -0.12, frameStyle: 'polaroid', chinHeight: 70 },
      { id: 2, x: 740, y: 230, width: 280, height: 260, rotation: 0.1, frameStyle: 'polaroid', chinHeight: 70 },
      { id: 3, x: 620, y: 670, width: 290, height: 270, rotation: -0.06, frameStyle: 'polaroid', chinHeight: 70 },
      { id: 4, x: 720, y: 1140, width: 290, height: 270, rotation: 0.08, frameStyle: 'polaroid', chinHeight: 70 },
      { id: 5, x: 330, y: 1280, width: 280, height: 260, rotation: -0.07, frameStyle: 'polaroid', chinHeight: 70 },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      // Clean off-white paper
      const paper = createPaperPattern(ctx, 'cream');
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, width, height);

      // Giant black vinyl record bleeding off canvas to the left
      drawVinylRecord(ctx, -140, 890, 660, 'STEREO');
    },
    renderForeground(ctx, canvas, style) {
      const { width, height } = canvas;
      // Minimalist editorial branding in upper-left / lower margin
      ctx.save();
      ctx.textAlign = 'left';
      ctx.fillStyle = '#222';
      ctx.font = 'bold 16px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'CISSPIC ARCHIVE', 38, 54);
      ctx.font = '12px "Courier New", monospace';
      ctx.fillStyle = '#666';
      ctx.fillText('COLLECTED POLAROIDS • VOLUME 01', 38, 76);

      ctx.textAlign = 'right';
      ctx.font = 'bold 13px "DM Sans", sans-serif';
      ctx.fillStyle = '#555';
      ctx.fillText('SIDE A • 33⅓ RPM', width - 38, height - 32);
      ctx.restore();
    },
  },

  // ==========================================
  // TEMPLATE 05: DENIM PATCH NOTE
  // ==========================================
  {
    id: 'denim-note',
    name: 'Denim Note',
    category: 'Scrapbook',
    description: 'Deep navy denim card with perimeter white stitches, safety pin & torn paper photo frame',
    background: ['#E8E5DF'],
    textColor: '#FFFFFF',
    recommendedPoses: 1,
    defaultFilter: 'soft-blur',
    canvas: { width: 1000, height: 1800 },
    photoSlots: [
      { id: 1, x: 195, y: 550, width: 610, height: 860, rotation: -0.025, borderRadius: 6, frameStyle: 'torn-paper' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      // Clean neutral presentation background
      ctx.fillStyle = '#E8E5DF';
      ctx.fillRect(0, 0, width, height);

      // Center tilted deep navy denim patch card
      ctx.save();
      ctx.translate(width / 2, height / 2 + 60);
      ctx.rotate(-0.025);

      // Denim card shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 10;

      const denimW = 750;
      const denimH = 1350;
      const denim = createDenimPattern(ctx, 'navy');
      ctx.fillStyle = denim;
      ctx.beginPath();
      ctx.roundRect(-denimW / 2, -denimH / 2, denimW, denimH, 16);
      ctx.fill();

      ctx.shadowColor = 'transparent';

      // Perimeter white running stitches
      drawStitches(ctx, { rect: { x: -denimW / 2 + 18, y: -denimH / 2 + 18, w: denimW - 36, h: denimH - 36, r: 12 } }, '#FFFFFF', 2.4, [9, 6]);

      // Ripped/torn cream paper base for the photo
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#F8F4EA';
      ctx.fillRect(-320, -180, 640, 900);

      ctx.restore();
    },
    renderForeground(ctx) {
      // Top-Left: Large Vintage Metal Safety Pin
      drawSafetyPin(ctx, 40, 160, 240, 0.46);

      // Pinned Layered Blue Denim Star Patch
      drawDenimStar(ctx, 220, 280, 105, -0.22);
    },
  },

  // ==========================================
  // CURATED DERIVATIVE VARIANTS (Total 14)
  // ==========================================
  {
    id: 'airmail-midnight',
    name: 'Airmail Midnight',
    category: 'Vintage',
    description: 'Dark navy airmail strip with aged dark parchment and vintage postmark',
    background: ['#1D212A'],
    textColor: '#E2E8F0',
    recommendedPoses: 3,
    defaultFilter: 'sepia',
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 75, width: 640, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 2, x: 80, y: 530, width: 640, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 3, x: 80, y: 985, width: 640, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#1D212A';
      ctx.fillRect(0, 0, width, height);
      drawAirmailBorder(ctx, width, height, 26, 0);
      ctx.fillStyle = '#252B38';
      ctx.fillRect(52, 52, width - 104, height - 104);
      drawPerforatedDots(ctx, 70, 510, width - 70, 510, 12, 2, '#4E5A73');
      drawPerforatedDots(ctx, 70, 965, width - 70, 965, 12, 2, '#4E5A73');
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateFormatted = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(-2)}`;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '900 44px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'MIDNIGHT POST', width / 2, 1490);

      ctx.fillStyle = '#E63946';
      ctx.font = 'italic 700 38px Georgia, serif';
      ctx.fillText('&', width / 2, 1540);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '700 24px "DM Sans", sans-serif';
      ctx.fillText(style.text || 'AIRMAIL SPECIAL EDITION', width / 2, 1600);

      drawPostmark(ctx, 240, 1810, 62, 'CISSPIC EXPRESS', dateFormatted, 'rgba(226, 232, 240, 0.7)');
      ctx.restore();
    },
  },

  {
    id: 'acid-wash-denim',
    name: 'Acid Wash Denim',
    category: 'Denim',
    description: 'Distressed light acid-wash denim with silver star patches and 4-cut film',
    background: ['#2F4870'],
    textColor: '#FFFFFF',
    recommendedPoses: 4,
    defaultFilter: 'disposable',
    canvas: { width: 1000, height: 1800 },
    photoSlots: [
      { id: 1, x: 365, y: 295, width: 270, height: 220, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 2, x: 365, y: 550, width: 270, height: 220, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 3, x: 365, y: 805, width: 270, height: 220, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 4, x: 365, y: 1060, width: 270, height: 220, borderRadius: 2, frameStyle: 'film-slot' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      const denim = createDenimPattern(ctx, 'acid');
      ctx.fillStyle = denim;
      ctx.fillRect(0, 0, width, height);
      drawFilmSprockets(ctx, 310, 260, 380, 1050, ['A1', 'A2', 'A3', 'A4']);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      drawChromeStar(ctx, width / 2, 150, 75);
      drawChromeStar(ctx, 160, 1530, 85);
      drawChromeStar(ctx, 840, 1530, 85);
    },
  },

  {
    id: 'denim-pocket-duo',
    name: 'Denim Pocket Duo',
    category: 'Denim',
    description: '2 large hero poses over rich dark denim and stitched jeans pocket',
    background: ['#1B2A4A'],
    textColor: '#FFFFFF',
    recommendedPoses: 2,
    defaultFilter: 'warm-studio',
    canvas: { width: 1000, height: 1800 },
    photoSlots: [
      { id: 1, x: 180, y: 120, width: 640, height: 460, borderRadius: 4, frameStyle: 'white-border' },
      { id: 2, x: 180, y: 640, width: 640, height: 460, borderRadius: 4, frameStyle: 'white-border' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      const denim = createDenimPattern(ctx, 'navy');
      ctx.fillStyle = denim;
      ctx.fillRect(0, 0, width, height);
      drawStitches(ctx, { rect: { x: 20, y: 20, w: width - 40, h: height - 40 } }, '#D4A359', 3, [10, 6]);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      drawJeansPocket(ctx, width / 2 - 250, 1160, 500, 580, 'SB JEANS CO.');
    },
  },

  {
    id: 'classic-35mm',
    name: 'Classic 35mm Strip',
    category: 'Film',
    description: 'Darkroom 35mm film negative strip with true frame markings and analog numbers',
    background: ['#0B0A0F'],
    textColor: '#F4A261',
    recommendedPoses: 4,
    defaultFilter: 'retro',
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 160, y: 160, width: 480, height: 350, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 2, x: 160, y: 560, width: 480, height: 350, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 3, x: 160, y: 960, width: 480, height: 350, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 4, x: 160, y: 1360, width: 480, height: 350, borderRadius: 2, frameStyle: 'film-slot' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#0B0A0F';
      ctx.fillRect(0, 0, width, height);
      drawFilmSprockets(ctx, 80, 80, 640, 1680, ['01', '02', '03', '04']);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F4A261';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('35MM COLOR FILM • ISO 400', width / 2, 1830);
      ctx.fillStyle = '#CCC';
      ctx.font = '14px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'CISSPIC ANALOG ARCHIVE', width / 2, 1865);
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, 1895);
      ctx.restore();
    },
  },

  {
    id: 'sepia-darkroom',
    name: 'Sepia Darkroom Film',
    category: 'Film',
    description: 'Aged contact sheet with sepia tones and warm analog markings',
    background: ['#1C1612'],
    textColor: '#D4A359',
    recommendedPoses: 3,
    defaultFilter: 'sepia',
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 140, y: 180, width: 520, height: 390, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 2, x: 140, y: 630, width: 520, height: 390, borderRadius: 2, frameStyle: 'film-slot' },
      { id: 3, x: 140, y: 1080, width: 520, height: 390, borderRadius: 2, frameStyle: 'film-slot' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#1C1612';
      ctx.fillRect(0, 0, width, height);
      drawFilmSprockets(ctx, 70, 90, 660, 1460, ['11A', '12A', '13A']);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#D4A359';
      ctx.font = '900 28px Georgia, serif';
      ctx.fillText(style.header || 'SEPIA DARKROOM', width / 2, 1680);
      ctx.font = 'italic 16px Georgia, serif';
      ctx.fillText(style.text || 'Silver Gelatin Print • Studio Archive', width / 2, 1720);
      ctx.restore();
    },
  },

  {
    id: 'polaroid-pinboard',
    name: 'Polaroid Pinboard',
    category: 'Polaroid',
    description: '4 polaroids casually scattered with washi tape accents on warm linen paper',
    background: ['#F7F2E7'],
    textColor: '#3A3832',
    recommendedPoses: 4,
    defaultFilter: 'faded',
    canvas: { width: 1000, height: 1800 },
    photoSlots: [
      { id: 1, x: 300, y: 220, width: 320, height: 300, rotation: -0.06, frameStyle: 'polaroid', chinHeight: 70 },
      { id: 2, x: 700, y: 320, width: 320, height: 300, rotation: 0.08, frameStyle: 'polaroid', chinHeight: 70 },
      { id: 3, x: 320, y: 920, width: 320, height: 300, rotation: 0.05, frameStyle: 'polaroid', chinHeight: 70 },
      { id: 4, x: 680, y: 1040, width: 320, height: 300, rotation: -0.07, frameStyle: 'polaroid', chinHeight: 70 },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      const linen = createPaperPattern(ctx, 'cream');
      ctx.fillStyle = linen;
      ctx.fillRect(0, 0, width, height);
    },
    renderForeground(ctx, canvas, style) {
      const { width, height } = canvas;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 32px "DM Sans", sans-serif';
      ctx.fillStyle = '#3A3832';
      ctx.fillText(style.header || 'PINNED MOMENTS', width / 2, height - 120);
      ctx.font = '16px Georgia, serif';
      ctx.fillStyle = '#787265';
      ctx.fillText('CissPic Keepsake Memoir', width / 2, height - 85);
      ctx.restore();
    },
  },

  {
    id: 'paper-lace-collage',
    name: 'Paper & Lace Collage',
    category: 'Scrapbook',
    description: 'Floral lace, aged kraft paper and stacked polaroids',
    background: ['#E8DEC8'],
    textColor: '#4A3E31',
    recommendedPoses: 3,
    defaultFilter: 'sakura',
    canvas: { width: 1000, height: 1800 },
    photoSlots: [
      { id: 1, x: 500, y: 240, width: 380, height: 320, rotation: -0.04, frameStyle: 'polaroid', chinHeight: 70 },
      { id: 2, x: 520, y: 720, width: 380, height: 320, rotation: 0.03, frameStyle: 'polaroid', chinHeight: 70 },
      { id: 3, x: 500, y: 1200, width: 380, height: 320, rotation: -0.02, frameStyle: 'polaroid', chinHeight: 70 },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      const kraft = createPaperPattern(ctx, 'kraft');
      ctx.fillStyle = kraft;
      ctx.fillRect(0, 0, width, height);

      // Lace band on left
      ctx.fillStyle = '#4B6B94';
      ctx.fillRect(0, 0, 260, height);
      drawLaceOverlay(ctx, 0, 0, 260, height);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '900 24px "DM Sans", sans-serif';
      ctx.fillStyle = '#4A3E31';
      ctx.fillText(style.header || 'LACE & MEMORIES', width / 2, 1720);
      ctx.restore();
    },
  },

  // ==========================================
  // MINIMAL TEMPLATES
  // ==========================================
  {
    id: 'clean-white',
    name: 'Clean Studio White',
    category: 'Minimal',
    description: 'Minimalist clean white Korean self-photo studio strip',
    header: 'CISSPIC',
    subHeader: 'AESTHETIC SELF PHOTO STUDIO',
    background: ['#FFFFFF'],
    textColor: '#1D1D21',
    recommendedPoses: 4,
    defaultFilter: 'korean',
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 100, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 2, x: 80, y: 510, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 3, x: 80, y: 920, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 4, x: 80, y: 1330, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width, height } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1D1D21';
      ctx.font = '900 32px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'CISSPIC', width / 2, height - 160);
      ctx.font = '500 16px "DM Sans", sans-serif';
      ctx.fillStyle = '#7061A8';
      ctx.fillText('AESTHETIC SELF PHOTO STUDIO', width / 2, height - 120);
      ctx.fillStyle = '#999';
      ctx.font = '13px monospace';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, height - 85);
      ctx.restore();
    },
  },

  {
    id: 'minimal-black',
    name: 'Studio Noir',
    category: 'Minimal',
    description: 'Deep black monochrome studio photostrip with crisp white typography',
    background: ['#141318'],
    textColor: '#FFFFFF',
    recommendedPoses: 4,
    defaultFilter: 'noir',
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 100, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 2, x: 80, y: 510, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 3, x: 80, y: 920, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 4, x: 80, y: 1330, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      ctx.fillStyle = '#141318';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width, height } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 32px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'CISSPIC', width / 2, height - 160);
      ctx.font = '500 16px "DM Sans", sans-serif';
      ctx.fillStyle = '#A0A0B0';
      ctx.fillText('MONOCHROME STUDIO EDITION', width / 2, height - 120);
      ctx.fillStyle = '#666';
      ctx.font = '13px monospace';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, height - 85);
      ctx.restore();
    },
  },

  {
    id: 'studio-beige',
    name: 'Studio Beige',
    category: 'Minimal',
    description: 'Warm cream beige minimal card with soft serif branding',
    background: ['#F5F1EB'],
    textColor: '#3E3832',
    recommendedPoses: 4,
    defaultFilter: 'warm-studio',
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 100, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 2, x: 80, y: 510, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 3, x: 80, y: 920, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 4, x: 80, y: 1330, width: 640, height: 380, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      ctx.fillStyle = '#F5F1EB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width, height } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#3E3832';
      ctx.font = '700 32px Georgia, serif';
      ctx.fillText(style.header || 'STUDIO BEIGE', width / 2, height - 160);
      ctx.font = 'italic 16px Georgia, serif';
      ctx.fillStyle = '#8C7E72';
      ctx.fillText('Photobooth Archive • Keepsake', width / 2, height - 120);
      ctx.fillStyle = '#9C9084';
      ctx.font = '13px "DM Sans", sans-serif';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, height - 85);
      ctx.restore();
    },
  },

  // ==========================================
  // VERSION 1: CLEAN WHITESPACE MINIMAL
  // ==========================================
  {
    id: 'version-1-clean',
    name: 'Version 1: Clean Minimal',
    category: 'Minimal',
    description: 'Generous whitespace with ultra-clean frames, leaving spacious room for user stickers',
    background: ['#FAF9F6'],
    textColor: '#1A1A1E',
    recommendedPoses: 4,
    defaultFilter: 'clean',
    canvas: { width: 900, height: 2100 },
    photoSlots: [
      { id: 1, x: 130, y: 160, width: 640, height: 380, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 2, x: 130, y: 580, width: 640, height: 380, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 3, x: 130, y: 1000, width: 640, height: 380, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 4, x: 130, y: 1420, width: 640, height: 380, borderRadius: 2, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#FAF9F6';
      ctx.fillRect(0, 0, width, height);
      // Delicate perimeter pencil border
      ctx.strokeStyle = '#E8E5DD';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 30, width - 60, height - 60);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width, height } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A1A1E';
      ctx.font = '500 24px "DM Sans", sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText(style.header || 'STUDIO MEMORIES', width / 2, height - 150);
      ctx.font = '300 13px "Courier New", monospace';
      ctx.fillStyle = '#888892';
      ctx.fillText(date.toISOString().split('T')[0].replace(/-/g, ' . ') + '  •  NO. 01', width / 2, height - 110);
      ctx.restore();
    },
  },

  // ==========================================
  // VERSION 2: BALANCED SCRAPBOOK
  // ==========================================
  {
    id: 'version-2-balanced',
    name: 'Version 2: Balanced Scrapbook',
    category: 'Scrapbook',
    description: 'Layered paper cards, subtle kraft textures, and dedicated negative space for stickers',
    background: ['#F5EFE4'],
    textColor: '#2D2824',
    recommendedPoses: 3,
    defaultFilter: 'warmth',
    canvas: { width: 900, height: 2100 },
    photoSlots: [
      { id: 1, x: 110, y: 170, width: 680, height: 440, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 2, x: 110, y: 650, width: 680, height: 440, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 3, x: 110, y: 1130, width: 680, height: 440, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      const pat = createPaperPattern(ctx, 'kraft');
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, width, height);

      // Subtle ticket accent on top right corner
      ctx.save();
      ctx.translate(width - 120, 90);
      ctx.rotate(0.08);
      ctx.fillStyle = '#E8DEC8';
      ctx.fillRect(-80, -30, 160, 60);
      ctx.strokeStyle = '#BBAE9A';
      ctx.lineWidth = 1;
      ctx.strokeRect(-80, -30, 160, 60);
      ctx.fillStyle = '#5A4E3E';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ ADMIT ONE ★', 0, 4);
      ctx.restore();
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width, height } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2D2824';
      ctx.font = 'bold 30px Georgia, serif';
      ctx.fillText(style.header || 'SCRAPBOOK & MEMORIES', width / 2, height - 170);
      ctx.font = 'italic 15px Georgia, serif';
      ctx.fillStyle = '#7A6E5E';
      ctx.fillText('Collected moments • Volume II', width / 2, height - 130);
      ctx.font = '12px "DM Sans", sans-serif';
      ctx.fillStyle = '#948878';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, height - 95);
      ctx.restore();
    },
  },

  // ==========================================
  // VERSION 4: THE DAILY CHRONICLE (RETRO NEWSPAPER)
  // ==========================================
  {
    id: 'version-4-retro',
    name: 'Version 4: The Daily Chronicle',
    category: 'Vintage',
    description: 'Vintage newspaper masthead & torn deckle clipping frames (New York Times style)',
    background: ['#F3EFE6'],
    textColor: '#151518',
    recommendedPoses: 3,
    defaultFilter: 'monochrome',
    canvas: { width: 900, height: 2100 },
    photoSlots: [
      { id: 1, x: 120, y: 230, width: 660, height: 430, borderRadius: 2, frameStyle: 'paper-perforated' },
      { id: 2, x: 120, y: 730, width: 660, height: 430, borderRadius: 2, frameStyle: 'paper-perforated' },
      { id: 3, x: 120, y: 1230, width: 660, height: 430, borderRadius: 2, frameStyle: 'paper-perforated' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      // Newsprint textured background
      const pat = createPaperPattern(ctx, 'parchment');
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, width, height);

      // Newspaper Masthead at Top
      drawNewspaperHeader(
        ctx,
        width,
        'The Daily Chronicle',
        "All the Memories That's Fit to Print",
        'SPECIAL PHOTOBOOTH EDITION'
      );

      // Torn newspaper frames under photo slots
      drawTornNewspaperFrame(ctx, width / 2, 230 + 215, 660, 430, 'HIGHER SMILES FOR PHOTOBOOTH');
      drawTornNewspaperFrame(ctx, width / 2, 730 + 215, 660, 430, 'NEW YORK JOURNAL ARCHIVE');
      drawTornNewspaperFrame(ctx, width / 2, 1230 + 215, 660, 430, 'TIMELESS PORTRAITS OF TODAY');
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width, height } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      // Bottom newspaper footer & dateline
      ctx.strokeStyle = '#18181A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(35, height - 170);
      ctx.lineTo(width - 35, height - 170);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#18181A';
      ctx.font = '900 24px Georgia, serif';
      ctx.fillText(style.header || 'THE DAILY MEMORIES', width / 2, height - 130);
      ctx.font = 'italic 13px Georgia, serif';
      ctx.fillStyle = '#55555A';
      ctx.fillText('Printed and preserved directly on your browser  •  Vol. IV', width / 2, height - 95);
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, height - 65);
      ctx.restore();
    },
  },

  // ==========================================
  // VERSION 6: CD & MUSIC MEMORIES (EXPRESSIVE)
  // ==========================================
  {
    id: 'version-6-expressive',
    name: 'Version 6: CD Music Memories',
    category: 'Vintage',
    description: 'Dark noir aesthetic with optical CD disc, playback controller, and Paris card styling',
    background: ['#121216'],
    textColor: '#FFFFFF',
    recommendedPoses: 3,
    defaultFilter: 'darkroom',
    canvas: { width: 900, height: 2100 },
    photoSlots: [
      { id: 1, x: 110, y: 190, width: 680, height: 430, borderRadius: 16, frameStyle: 'white-thin' },
      { id: 2, x: 110, y: 690, width: 680, height: 430, borderRadius: 16, frameStyle: 'white-thin' },
      { id: 3, x: 110, y: 1220, width: 680, height: 430, borderRadius: 16, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      // Rich noir background
      ctx.fillStyle = '#141418';
      ctx.fillRect(0, 0, width, height);

      // Large optical CD disc at top-left edge
      ctx.save();
      ctx.translate(140, 140);
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Concentric iridescent grooves
      for (let r = 60; r < 155; r += 8) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.stroke();
      }
      ctx.restore();

      // Music player widget card in header
      drawMusicPlayerCard(ctx, width / 2, 90, 480, 70, 'For You Memories');
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width, height } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 28px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'NOW PLAYING : MEMORIES', width / 2, height - 170);

      // Track playback progress bar
      ctx.strokeStyle = '#33333C';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 180, height - 130);
      ctx.lineTo(width / 2 + 180, height - 130);
      ctx.stroke();

      ctx.strokeStyle = '#7061A8';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 180, height - 130);
      ctx.lineTo(width / 2 - 40, height - 130);
      ctx.stroke();

      ctx.fillStyle = '#8E8E93';
      ctx.font = '12px "Courier New", monospace';
      ctx.fillText('02:45  /  04:12   •   TRACK 06', width / 2, height - 95);
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, height - 65);
      ctx.restore();
    },
  },
];

const ENRICHED_BASE_TEMPLATES = BASE_ARTISTIC_TEMPLATES.map(t => ({
  family: t.family || t.id.replace(/-\d+$/, ''),
  supportedPhotoCounts: t.supportedPhotoCounts || [t.photoSlots?.length || 4],
  ...t,
}));

export const ARTISTIC_TEMPLATES = [
  ...SCRAPBOOK_MASTERPIECE_TEMPLATES,
  ...ADDITIONAL_TEMPLATES,
  ...THEMED_TEMPLATES,
  ...ENRICHED_BASE_TEMPLATES,
];

export const ARTISTIC_CATEGORIES = [
  'All',
  'Favorites',
  'Y2K',
  'Motorsport',
  'Cute',
  'Clean',
  'Scrapbook',
  'Denim',
  'Vintage',
  'Film',
  'Polaroid',
  'Minimal',
];

