/**
 * Extended Photo Strip Template Suite with dedicated 1-Photo, 2-Cut, 4-Cut, and 6-Cut variants.
 * Guarantees that every template has matching photo slots and zero empty slots.
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
  createLegoPattern,
  drawModernPaperclip,
  drawHolographicMiniCd,
  drawFriedEggSticker,
  drawRetroUfoAlien,
  drawLemonSlice,
  drawOffTheWallPill,
  drawIosPhotoCardFrame,
  createGinghamPattern,
  drawRetroStorybooks,
  drawRetroPayphoneIcon,
  drawRetroHandheldConsole,
  createNotebookGridPattern,
  drawPolaroidInstantCamera,
  drawCuteSillyObjectBadge,
  drawPointerArrow3D,
  drawCuteStarCharacter,
  drawVintagePhoneCordAndHandset,
  drawExclamationBadge,
} from './canvasTextures.js';

export const ADDITIONAL_TEMPLATES = [
  // ==========================================
  // 1. AIRMAIL LOVE (Vintage Postal Variants)
  // ==========================================
  {
    id: 'airmail-love-1',
    family: 'airmail-love',
    name: 'Airmail Love',
    variantLabel: '1 Hero Photo',
    category: 'Vintage',
    description: 'Large hero vintage airmail portrait with kraft paper and red-navy border',
    background: ['#E8DEC8'],
    textColor: '#1D3557',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 100, width: 640, height: 860, borderRadius: 4, frameStyle: 'paper-perforated' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createPaperPattern(ctx, 'kraft');
      ctx.fillRect(0, 0, width, height);
      drawAirmailBorder(ctx, width, height, 26, 0);
      ctx.fillStyle = '#F5EEDC';
      ctx.fillRect(52, 52, width - 104, height - 104);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateFormatted = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(-2)}`;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1D3557';
      ctx.font = '900 48px "DM Sans", "Arial Black", sans-serif';
      ctx.fillText(style.header || 'SNAP & BOOTH', width / 2, 1080);
      ctx.fillStyle = '#C0392B';
      ctx.font = 'italic 700 42px Georgia, serif';
      ctx.fillText('&', width / 2, 1140);
      ctx.fillStyle = '#1D3557';
      ctx.font = '900 36px "DM Sans", sans-serif';
      ctx.fillText('STUDIO MEMORIES', width / 2, 1195);
      ctx.fillStyle = '#C0392B';
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillText(style.text || 'forever yours', width / 2, 1245);
      ctx.fillStyle = '#1D3557';
      ctx.font = 'bold 30px "Courier New", monospace';
      ctx.fillText(dateFormatted, width / 2, 1300);
      drawPostmark(ctx, width / 2, 1460, 80, 'AIR MAIL PAR AVION', dateFormatted, '#1D3557');
      ctx.restore();
    },
  },
  {
    id: 'airmail-love-2',
    family: 'airmail-love',
    name: 'Airmail Love',
    variantLabel: '2 Cut Duo',
    category: 'Vintage',
    description: 'Two vertical airmail keepsake photos with postmark and airmail border',
    background: ['#E8DEC8'],
    textColor: '#1D3557',
    supportedPhotoCounts: [2],
    recommendedFor: 2,
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 90, width: 640, height: 520, borderRadius: 4, frameStyle: 'paper-perforated' },
      { id: 2, x: 80, y: 650, width: 640, height: 520, borderRadius: 4, frameStyle: 'paper-perforated' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createPaperPattern(ctx, 'kraft');
      ctx.fillRect(0, 0, width, height);
      drawAirmailBorder(ctx, width, height, 26, 0);
      ctx.fillStyle = '#F5EEDC';
      ctx.fillRect(52, 52, width - 104, height - 104);
      drawPerforatedDots(ctx, 70, 630, width - 70, 630, 12, 2, '#9C886B');
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateFormatted = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(-2)}`;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1D3557';
      ctx.font = '900 42px "DM Sans", "Arial Black", sans-serif';
      ctx.fillText(style.header || 'SNAP & BOOTH', width / 2, 1260);
      ctx.fillStyle = '#C0392B';
      ctx.font = 'italic 700 36px Georgia, serif';
      ctx.fillText('&', width / 2, 1310);
      ctx.fillStyle = '#1D3557';
      ctx.font = '900 32px "DM Sans", sans-serif';
      ctx.fillText('STUDIO MEMORIES', width / 2, 1360);
      ctx.fillStyle = '#C0392B';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillText(style.text || 'got hitched!', width / 2, 1405);
      ctx.fillStyle = '#1D3557';
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.fillText(dateFormatted, width / 2, 1450);
      drawPostmark(ctx, width / 2, 1580, 75, 'LUCKY IN LOVE', dateFormatted, '#1D3557');
      ctx.restore();
    },
  },
  {
    id: 'airmail-love-4',
    family: 'airmail-love',
    name: 'Airmail Love',
    variantLabel: '4 Cut Strip',
    category: 'Vintage',
    description: 'Classic 4-cut photostrip with airmail border and vintage postal markings',
    background: ['#E8DEC8'],
    textColor: '#1D3557',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 70, width: 640, height: 350, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 2, x: 80, y: 445, width: 640, height: 350, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 3, x: 80, y: 820, width: 640, height: 350, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 4, x: 80, y: 1195, width: 640, height: 350, borderRadius: 3, frameStyle: 'paper-perforated' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createPaperPattern(ctx, 'kraft');
      ctx.fillRect(0, 0, width, height);
      drawAirmailBorder(ctx, width, height, 26, 0);
      ctx.fillStyle = '#F5EEDC';
      ctx.fillRect(52, 52, width - 104, height - 104);
      drawPerforatedDots(ctx, 70, 430, width - 70, 430, 12, 2, '#9C886B');
      drawPerforatedDots(ctx, 70, 805, width - 70, 805, 12, 2, '#9C886B');
      drawPerforatedDots(ctx, 70, 1180, width - 70, 1180, 12, 2, '#9C886B');
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateFormatted = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(-2)}`;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1D3557';
      ctx.font = '900 38px "DM Sans", "Arial Black", sans-serif';
      ctx.fillText(style.header || 'SNAP & BOOTH', width / 2, 1630);
      ctx.fillStyle = '#C0392B';
      ctx.font = 'italic 700 32px Georgia, serif';
      ctx.fillText('&', width / 2, 1675);
      ctx.fillStyle = '#1D3557';
      ctx.font = '900 28px "DM Sans", sans-serif';
      ctx.fillText('STUDIO MEMORIES', width / 2, 1715);
      ctx.fillStyle = '#C0392B';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText(style.text || 'got hitched!', width / 2, 1755);
      ctx.fillStyle = '#1D3557';
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillText(dateFormatted, width / 2, 1795);
      drawPostmark(ctx, width / 2, 1895, 62, 'LUCKY IN LOVE', dateFormatted, '#1D3557');
      ctx.restore();
    },
  },
  {
    id: 'airmail-love-6',
    family: 'airmail-love',
    name: 'Airmail Love',
    variantLabel: '6 Cut Studio',
    category: 'Vintage',
    description: '6-photo studio airmail sheet in 2 columns × 3 rows layout',
    background: ['#E8DEC8'],
    textColor: '#1D3557',
    supportedPhotoCounts: [6],
    recommendedFor: 6,
    canvas: { width: 900, height: 1800 },
    photoSlots: [
      { id: 1, x: 70, y: 100, width: 360, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 2, x: 470, y: 100, width: 360, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 3, x: 70, y: 550, width: 360, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 4, x: 470, y: 550, width: 360, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 5, x: 70, y: 1000, width: 360, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
      { id: 6, x: 470, y: 1000, width: 360, height: 420, borderRadius: 3, frameStyle: 'paper-perforated' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createPaperPattern(ctx, 'kraft');
      ctx.fillRect(0, 0, width, height);
      drawAirmailBorder(ctx, width, height, 26, 0);
      ctx.fillStyle = '#F5EEDC';
      ctx.fillRect(52, 52, width - 104, height - 104);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateFormatted = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(-2)}`;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1D3557';
      ctx.font = '900 36px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'SNAPBOOTH AIRMAIL ARCHIVE', width / 2, 1510);
      ctx.fillStyle = '#C0392B';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillText('6-POSE MEMORY COLLECTION • ' + dateFormatted, width / 2, 1555);
      drawPostmark(ctx, width / 2, 1660, 65, 'SEOUL - BANDUNG', dateFormatted, '#1D3557');
      ctx.restore();
    },
  },

  // =========================================================================
  // 2. DENIM LACE DUO (Direct adaptation from User Reference Image 3)
  // =========================================================================
  {
    id: 'denim-lace-2',
    family: 'denim-lace',
    name: 'Denim Lace Duo',
    variantLabel: '2 Cut Duo',
    category: 'Denim',
    description: 'Authentic navy denim with scalloped white lace trim, burgundy polka dots, and tilted maroon polaroids',
    background: ['#6B101E'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [2],
    recommendedFor: 2,
    canvas: { width: 960, height: 1720 },
    photoSlots: [
      { id: 1, x: 330, y: 130, width: 490, height: 460, rotation: -0.06, borderRadius: 2, frameStyle: 'polaroid-maroon', chinHeight: 90 },
      { id: 2, x: 270, y: 780, width: 510, height: 480, rotation: 0.08, borderRadius: 2, frameStyle: 'polaroid-maroon', chinHeight: 90 },
    ],
    renderBackground(ctx, canvas) {
      drawLaceDenimBackground(ctx, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style) {
      const { width, height } = canvas;
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'italic 700 24px Georgia, serif';
      ctx.textAlign = 'right';
      ctx.fillText('cherished moments ✦', width - 40, 75);
      ctx.font = '600 14px "DM Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('SNAPBOOTH • DENIM & LACE EDITION', width - 40, height - 50);
      ctx.restore();
    },
  },

  // =========================================================================
  // 3. VINTAGE DIGICAM DUO (Direct adaptation from User Reference Image 4)
  // =========================================================================
  {
    id: 'digicam-duo-2',
    family: 'digicam-duo',
    name: 'Vintage Digicam Duo',
    variantLabel: '2 Cut Duo',
    category: 'Y2K',
    description: 'Dual silver Canon vintage digital cameras with LCD screen photo viewfinders & glitter hearts',
    background: ['#F6F6EA'],
    textColor: '#242220',
    supportedPhotoCounts: [2],
    recommendedFor: 2,
    canvas: { width: 900, height: 1600 },
    photoSlots: [
      { id: 1, x: 100, y: 220, width: 440, height: 330, rotation: -0.08, borderRadius: 4 },
      { id: 2, x: 140, y: 920, width: 450, height: 340, rotation: 0.04, borderRadius: 4 },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#F4F5E6';
      ctx.fillRect(0, 0, width, height);
      drawVintageDigicam(ctx, 420, 390, 760, 480, { rotation: -0.08 });
      drawVintageDigicam(ctx, 470, 1090, 770, 490, { rotation: 0.04 });
      ctx.save();
      const drawGlitterHeart = (hx, hy, sz) => {
        ctx.save();
        ctx.translate(hx, hy);
        ctx.fillStyle = '#D90429';
        ctx.shadowColor = 'rgba(217, 4, 41, 0.4)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, sz * 0.3);
        ctx.bezierCurveTo(-sz * 0.6, -sz * 0.3, -sz, sz * 0.3, 0, sz);
        ctx.bezierCurveTo(sz, sz * 0.3, sz * 0.6, -sz * 0.3, 0, sz * 0.3);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(-sz * 0.25, sz * 0.3, sz * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawGlitterHeart(730, 640, 22);
      drawGlitterHeart(680, 750, 18);
      drawGlitterHeart(780, 840, 26);
      drawGlitterHeart(710, 940, 20);
      drawGlitterHeart(810, 1020, 22);
      ctx.restore();
    },
    renderForeground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.save();
      ctx.fillStyle = '#4A4A45';
      ctx.font = '700 14px "DM Sans", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✦ DIGITAL MEMORIES • EARLY 2000s DIGICAM ✦', width / 2, height - 35);
      ctx.restore();
    },
  },

  // =========================================================================
  // 4. DENIM BOOTH VARIANTS
  // =========================================================================
  {
    id: 'denim-booth-1',
    family: 'denim-booth',
    name: 'Denim Booth',
    variantLabel: '1 Hero Photo',
    category: 'Denim',
    description: 'Deep navy denim with gold jeans pocket stitches and single hero portrait',
    background: ['#1B2A4A'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [1],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 150, width: 640, height: 860, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createDenimPattern(ctx, 'navy');
      ctx.fillRect(0, 0, width, height);
      drawStitches(ctx, [{ x: 35, y: 35 }, { x: width - 35, y: 35 }, { x: width - 35, y: height - 35 }, { x: 35, y: height - 35 }, { x: 35, y: 35 }], '#C8963E', 3, [12, 8]);
      drawDenimStar(ctx, width / 2, 1260, 90, 0.1);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.font = '900 36px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'DENIM & STUDIO', width / 2, 1450);
      ctx.fillStyle = '#DDB055';
      ctx.font = '600 20px "Courier New", monospace';
      ctx.fillText('AUTHENTIC TWILL MEMORIES', width / 2, 1500);
      ctx.restore();
    },
  },
  {
    id: 'denim-booth-2',
    family: 'denim-booth',
    name: 'Denim Booth',
    variantLabel: '2 Cut Duo',
    category: 'Denim',
    description: 'Navy denim duo with gold stitches and denim star emblem',
    background: ['#1B2A4A'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [2],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 100, width: 640, height: 530, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 2, x: 80, y: 680, width: 640, height: 530, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createDenimPattern(ctx, 'navy');
      ctx.fillRect(0, 0, width, height);
      drawStitches(ctx, [{ x: 35, y: 35 }, { x: width - 35, y: 35 }, { x: width - 35, y: height - 35 }, { x: 35, y: height - 35 }, { x: 35, y: 35 }], '#C8963E', 3, [12, 8]);
      drawDenimStar(ctx, width / 2, 1380, 80, 0);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.font = '900 34px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'DENIM PHOTO DUO', width / 2, 1540);
      ctx.fillStyle = '#DDB055';
      ctx.font = '600 18px "Courier New", monospace';
      ctx.fillText('SNAPBOOTH JEANS CO.', width / 2, 1585);
      ctx.restore();
    },
  },
  {
    id: 'denim-booth-4',
    family: 'denim-booth',
    name: 'Denim Booth',
    variantLabel: '4 Cut Strip',
    category: 'Denim',
    description: 'Classic 4-cut photostrip with navy denim fabric and copper stitches',
    background: ['#1B2A4A'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [4],
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 70, width: 640, height: 360, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 2, x: 80, y: 460, width: 640, height: 360, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 3, x: 80, y: 850, width: 640, height: 360, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 4, x: 80, y: 1240, width: 640, height: 360, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createDenimPattern(ctx, 'navy');
      ctx.fillRect(0, 0, width, height);
      drawStitches(ctx, [{ x: 35, y: 35 }, { x: width - 35, y: 35 }, { x: width - 35, y: height - 35 }, { x: 35, y: height - 35 }, { x: 35, y: 35 }], '#C8963E', 3, [12, 8]);
      drawDenimStar(ctx, width / 2, 1740, 70, 0);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.font = '900 36px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'SNAPBOOTH DENIM', width / 2, 1870);
      ctx.fillStyle = '#DDB055';
      ctx.font = '600 18px "Courier New", monospace';
      ctx.fillText('AUTHENTIC JEANSWEAR MEMORIES', width / 2, 1915);
      ctx.restore();
    },
  },
  {
    id: 'denim-booth-6',
    family: 'denim-booth',
    name: 'Denim Booth',
    variantLabel: '6 Cut Studio',
    category: 'Denim',
    description: '6-photo denim twill collage with copper stitches',
    background: ['#1B2A4A'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [6],
    canvas: { width: 900, height: 1800 },
    photoSlots: [
      { id: 1, x: 70, y: 100, width: 360, height: 430, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 2, x: 470, y: 100, width: 360, height: 430, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 3, x: 70, y: 560, width: 360, height: 430, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 4, x: 470, y: 560, width: 360, height: 430, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 5, x: 70, y: 1020, width: 360, height: 430, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 6, x: 470, y: 1020, width: 360, height: 430, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createDenimPattern(ctx, 'navy');
      ctx.fillRect(0, 0, width, height);
      drawStitches(ctx, [{ x: 30, y: 30 }, { x: width - 30, y: 30 }, { x: width - 30, y: height - 30 }, { x: 30, y: height - 30 }, { x: 30, y: 30 }], '#C8963E', 3, [12, 8]);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.font = '900 32px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'DENIM ARCHIVE 6-CUT', width / 2, 1550);
      ctx.restore();
    },
  },

  // =========================================================================
  // 5. CUTE COLLECTION (Ribbon Diary, Cherry Picnic, Strawberry Milk, Cloud Diary)
  // =========================================================================
  {
    id: 'ribbon-diary-1',
    family: 'ribbon-diary',
    name: 'Ribbon Diary',
    variantLabel: '1 Hero Photo',
    category: 'Cute',
    description: 'Cream card with elegant satin fabric bow and handwriting cursive script',
    background: ['#FDF9F3'],
    textColor: '#5E303E',
    supportedPhotoCounts: [1],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 140, width: 640, height: 860, borderRadius: 8, frameStyle: 'white-border' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#FAF5ED';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#D9899A';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(40, 40, width - 80, height - 80);
      ctx.setLineDash([]);
      drawFabricBow(ctx, width / 2, 115, 75, '#D94364');
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#5E303E';
      ctx.textAlign = 'center';
      ctx.font = 'italic 700 44px Georgia, serif';
      ctx.fillText(style.header || 'Sweet Memories', width / 2, 1140);
      ctx.font = '400 22px "DM Sans", sans-serif';
      ctx.fillStyle = '#B06377';
      ctx.fillText('A little love, captured today ♡', width / 2, 1200);
      drawFabricBow(ctx, width / 2, 1340, 60, '#D94364');
      ctx.restore();
    },
  },
  {
    id: 'ribbon-diary-2',
    family: 'ribbon-diary',
    name: 'Ribbon Diary',
    variantLabel: '2 Cut Duo',
    category: 'Cute',
    description: 'Warm cream paper with two photos and double satin ribbon accents',
    background: ['#FDF9F3'],
    textColor: '#5E303E',
    supportedPhotoCounts: [2],
    recommendedFor: 2,
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 120, width: 640, height: 510, borderRadius: 8, frameStyle: 'white-border' },
      { id: 2, x: 80, y: 690, width: 640, height: 510, borderRadius: 8, frameStyle: 'white-border' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#FAF5ED';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#D9899A';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(40, 40, width - 80, height - 80);
      ctx.setLineDash([]);
      drawFabricBow(ctx, 120, 95, 60, '#D94364');
      drawFabricBow(ctx, width - 120, 95, 60, '#D94364');
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#5E303E';
      ctx.textAlign = 'center';
      ctx.font = 'italic 700 40px Georgia, serif';
      ctx.fillText(style.header || 'Sweet Diary', width / 2, 1330);
      ctx.font = '500 20px "DM Sans", sans-serif';
      ctx.fillStyle = '#B06377';
      ctx.fillText('SNAPBOOTH • LOVELY MOMENTS', width / 2, 1385);
      drawFabricBow(ctx, width / 2, 1490, 65, '#D94364');
      ctx.restore();
    },
  },
  {
    id: 'ribbon-diary-4',
    family: 'ribbon-diary',
    name: 'Ribbon Diary',
    variantLabel: '4 Cut Strip',
    category: 'Cute',
    description: 'Classic 4-cut photostrip with delicate cream paper and pink satin bows',
    background: ['#FDF9F3'],
    textColor: '#5E303E',
    supportedPhotoCounts: [4],
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 70, width: 640, height: 360, borderRadius: 6, frameStyle: 'white-border' },
      { id: 2, x: 80, y: 460, width: 640, height: 360, borderRadius: 6, frameStyle: 'white-border' },
      { id: 3, x: 80, y: 850, width: 640, height: 360, borderRadius: 6, frameStyle: 'white-border' },
      { id: 4, x: 80, y: 1240, width: 640, height: 360, borderRadius: 6, frameStyle: 'white-border' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#FAF5ED';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#D9899A';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(40, 40, width - 80, height - 80);
      ctx.setLineDash([]);
      drawFabricBow(ctx, 120, 60, 50, '#D94364');
      drawFabricBow(ctx, width - 120, 60, 50, '#D94364');
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#5E303E';
      ctx.textAlign = 'center';
      ctx.font = 'italic 700 38px Georgia, serif';
      ctx.fillText(style.header || 'Sweet Ribbon Diary', width / 2, 1720);
      ctx.font = '500 18px "DM Sans", sans-serif';
      ctx.fillStyle = '#B06377';
      ctx.fillText('SNAPBOOTH • LOVELY MOMENTS', width / 2, 1770);
      drawFabricBow(ctx, width / 2, 1860, 65, '#D94364');
      ctx.restore();
    },
  },
  {
    id: 'cherry-picnic-1',
    family: 'cherry-picnic',
    name: 'Cherry Picnic',
    variantLabel: '1 Hero Photo',
    category: 'Cute',
    description: 'Fresh cream paper with red gingham borders and glossy twin cherry accents',
    background: ['#FAF6EE'],
    textColor: '#800F2F',
    supportedPhotoCounts: [1],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 140, width: 640, height: 860, borderRadius: 8, frameStyle: 'white-border' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#FAF6EE';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(201, 24, 74, 0.15)';
      ctx.fillRect(0, 0, width, 40);
      ctx.fillRect(0, height - 40, width, 40);
      drawCuteCherries(ctx, width / 2, 90, 60);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#800F2F';
      ctx.textAlign = 'center';
      ctx.font = '900 42px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'CHERRY DAYS', width / 2, 1140);
      ctx.font = 'italic 700 24px Georgia, serif';
      ctx.fillStyle = '#C9184A';
      ctx.fillText('A sweet little afternoon', width / 2, 1200);
      drawCuteCherries(ctx, width / 2, 1340, 70);
      ctx.restore();
    },
  },
  {
    id: 'cherry-picnic-2',
    family: 'cherry-picnic',
    name: 'Cherry Picnic',
    variantLabel: '2 Cut Duo',
    category: 'Cute',
    description: 'Two photo slots framed with red gingham pattern and cherry doodles',
    background: ['#FAF6EE'],
    textColor: '#800F2F',
    supportedPhotoCounts: [2],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 120, width: 640, height: 510, borderRadius: 8, frameStyle: 'white-border' },
      { id: 2, x: 80, y: 690, width: 640, height: 510, borderRadius: 8, frameStyle: 'white-border' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#FAF6EE';
      ctx.fillRect(0, 0, width, height);
      drawCuteCherries(ctx, 120, 80, 50);
      drawCuteCherries(ctx, width - 120, 80, 50);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#800F2F';
      ctx.textAlign = 'center';
      ctx.font = '900 38px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'CHERRY PICNIC', width / 2, 1330);
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillStyle = '#C9184A';
      ctx.fillText('SWEET MEMORIES DUO', width / 2, 1380);
      drawCuteCherries(ctx, width / 2, 1490, 65);
      ctx.restore();
    },
  },
  {
    id: 'cherry-picnic-4',
    family: 'cherry-picnic',
    name: 'Cherry Picnic',
    variantLabel: '4 Cut Strip',
    category: 'Cute',
    description: '4-cut photostrip with cherry accents and fresh picnic borders',
    background: ['#FAF6EE'],
    textColor: '#800F2F',
    supportedPhotoCounts: [4],
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 70, width: 640, height: 360, borderRadius: 6, frameStyle: 'white-border' },
      { id: 2, x: 80, y: 460, width: 640, height: 360, borderRadius: 6, frameStyle: 'white-border' },
      { id: 3, x: 80, y: 850, width: 640, height: 360, borderRadius: 6, frameStyle: 'white-border' },
      { id: 4, x: 80, y: 1240, width: 640, height: 360, borderRadius: 6, frameStyle: 'white-border' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#FAF6EE';
      ctx.fillRect(0, 0, width, height);
      drawCuteCherries(ctx, 110, 50, 44);
      drawCuteCherries(ctx, width - 110, 50, 44);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#800F2F';
      ctx.textAlign = 'center';
      ctx.font = '900 36px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'CHERRY PICNIC', width / 2, 1720);
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillStyle = '#C9184A';
      ctx.fillText('SNAPBOOTH • SWEET MOMENTS', width / 2, 1770);
      drawCuteCherries(ctx, width / 2, 1860, 60);
      ctx.restore();
    },
  },
  {
    id: 'strawberry-milk-2',
    family: 'strawberry-milk',
    name: 'Strawberry Milk',
    variantLabel: '2 Cut Duo',
    category: 'Cute',
    description: 'Pastel strawberry milk pink canvas with white scalloped borders',
    background: ['#FDF0F3', '#FCE4EC'],
    textColor: '#880E4F',
    supportedPhotoCounts: [2],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 120, width: 640, height: 510, borderRadius: 12, frameStyle: 'white-border' },
      { id: 2, x: 80, y: 690, width: 640, height: 510, borderRadius: 12, frameStyle: 'white-border' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#FDF0F3');
      grad.addColorStop(1, '#F8D7E3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#880E4F';
      ctx.textAlign = 'center';
      ctx.font = '900 38px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'STRAWBERRY MILK', width / 2, 1340);
      ctx.font = '500 20px "DM Sans", sans-serif';
      ctx.fillStyle = '#AD1457';
      ctx.fillText('Sweetest Day Ever ♡', width / 2, 1390);
      ctx.restore();
    },
  },
  {
    id: 'cloud-diary-2',
    family: 'cloud-diary',
    name: 'Cloud Diary',
    variantLabel: '2 Cut Duo',
    category: 'Cute',
    description: 'Soft baby blue canvas with fluffy cloud patches and sparkles',
    background: ['#EDF5FC'],
    textColor: '#1A365D',
    supportedPhotoCounts: [2],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 120, width: 640, height: 510, borderRadius: 12, frameStyle: 'white-border' },
      { id: 2, x: 80, y: 690, width: 640, height: 510, borderRadius: 12, frameStyle: 'white-border' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#EDF5FC';
      ctx.fillRect(0, 0, width, height);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#1A365D';
      ctx.textAlign = 'center';
      ctx.font = '900 38px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'CLOUD DIARY', width / 2, 1340);
      ctx.font = 'italic 700 22px Georgia, serif';
      ctx.fillStyle = '#2B6CB0';
      ctx.fillText('Walking on sunshine & soft clouds', width / 2, 1390);
      ctx.restore();
    },
  },

  // =========================================================================
  // 6. CLEAN & MINIMAL (Studio White, Soft Black)
  // =========================================================================
  {
    id: 'studio-white-1',
    family: 'studio-white',
    name: 'Studio White',
    variantLabel: '1 Hero Photo',
    category: 'Clean',
    description: 'Pure white gallery presentation with subtle shadow and minimalist serif dateline',
    background: ['#FFFFFF'],
    textColor: '#1D1D20',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 120, width: 640, height: 920, borderRadius: 2, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      ctx.fillStyle = '#FDFCFA';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1D1D20';
      ctx.font = '900 38px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'STUDIO MEMOIR', width / 2, 1200);
      ctx.fillStyle = '#6E6D7A';
      ctx.font = '500 18px "DM Sans", sans-serif';
      ctx.fillText(style.text || 'PORTRAIT ARCHIVE', width / 2, 1250);
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, 1300);
      ctx.restore();
    },
  },
  {
    id: 'studio-white-2',
    family: 'studio-white',
    name: 'Studio White',
    variantLabel: '2 Cut Duo',
    category: 'Clean',
    description: 'Two vertical photos with pure white borders and quiet editorial typography',
    background: ['#FFFFFF'],
    textColor: '#1D1D20',
    supportedPhotoCounts: [2],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 120, width: 640, height: 530, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 2, x: 80, y: 710, width: 640, height: 530, borderRadius: 2, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      ctx.fillStyle = '#FDFCFA';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1D1D20';
      ctx.font = '900 36px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'SNAPBOOTH STUDIO', width / 2, 1390);
      ctx.fillStyle = '#6E6D7A';
      ctx.font = '500 18px "DM Sans", sans-serif';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, 1440);
      ctx.restore();
    },
  },
  {
    id: 'studio-white-4',
    family: 'studio-white',
    name: 'Studio White',
    variantLabel: '4 Cut Strip',
    category: 'Clean',
    description: 'Classic 4-cut clean white photostrip',
    background: ['#FFFFFF'],
    textColor: '#1D1D20',
    supportedPhotoCounts: [4],
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 70, width: 640, height: 365, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 2, x: 80, y: 465, width: 640, height: 365, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 3, x: 80, y: 860, width: 640, height: 365, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 4, x: 80, y: 1255, width: 640, height: 365, borderRadius: 2, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      ctx.fillStyle = '#FDFCFA';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1D1D20';
      ctx.font = '900 36px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'SNAPBOOTH STUDIO', width / 2, 1750);
      ctx.fillStyle = '#6E6D7A';
      ctx.font = '500 18px "DM Sans", sans-serif';
      ctx.fillText('SEOUL SELF PHOTO STUDIO', width / 2, 1800);
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, 1845);
      ctx.restore();
    },
  },
  {
    id: 'studio-white-6',
    family: 'studio-white',
    name: 'Studio White',
    variantLabel: '6 Cut Studio',
    category: 'Clean',
    description: 'Clean white 6-photo studio contact gallery (2 × 3)',
    background: ['#FFFFFF'],
    textColor: '#1D1D20',
    supportedPhotoCounts: [6],
    canvas: { width: 900, height: 1800 },
    photoSlots: [
      { id: 1, x: 70, y: 90, width: 360, height: 440, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 2, x: 470, y: 90, width: 360, height: 440, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 3, x: 70, y: 560, width: 360, height: 440, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 4, x: 470, y: 560, width: 360, height: 440, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 5, x: 70, y: 1030, width: 360, height: 440, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 6, x: 470, y: 1030, width: 360, height: 440, borderRadius: 2, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      ctx.fillStyle = '#FDFCFA';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#1D1D20';
      ctx.textAlign = 'center';
      ctx.font = '900 32px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'STUDIO WHITE • 6-CUT ARCHIVE', width / 2, 1580);
      ctx.restore();
    },
  },
  {
    id: 'soft-black-1',
    family: 'soft-black',
    name: 'Soft Black',
    variantLabel: '1 Hero Photo',
    category: 'Clean',
    description: 'Matte dark luxury background with crisp white typography and hero portrait',
    background: ['#141318'],
    textColor: '#F5F4F8',
    supportedPhotoCounts: [1],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 120, width: 640, height: 920, borderRadius: 2, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      ctx.fillStyle = '#141318';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F5F4F8';
      ctx.font = '900 38px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'NOIR ARCHIVE', width / 2, 1200);
      ctx.fillStyle = '#ACA2C7';
      ctx.font = '500 18px "DM Sans", sans-serif';
      ctx.fillText('STUDIO EDITION • MONOCHROME', width / 2, 1250);
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, 1300);
      ctx.restore();
    },
  },
  {
    id: 'soft-black-2',
    family: 'soft-black',
    name: 'Soft Black',
    variantLabel: '2 Cut Duo',
    category: 'Clean',
    description: 'Two vertical photos over matte studio black backdrop',
    background: ['#141318'],
    textColor: '#F5F4F8',
    supportedPhotoCounts: [2],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 120, width: 640, height: 530, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 2, x: 80, y: 710, width: 640, height: 530, borderRadius: 2, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      ctx.fillStyle = '#141318';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F5F4F8';
      ctx.font = '900 36px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'SNAPBOOTH NOIR', width / 2, 1390);
      ctx.fillStyle = '#ACA2C7';
      ctx.font = '500 18px "DM Sans", sans-serif';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, 1440);
      ctx.restore();
    },
  },
  {
    id: 'soft-black-4',
    family: 'soft-black',
    name: 'Soft Black',
    variantLabel: '4 Cut Strip',
    category: 'Clean',
    description: 'Matte dark studio 4-cut photostrip with white typography',
    background: ['#141318'],
    textColor: '#F5F4F8',
    supportedPhotoCounts: [4],
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 80, y: 70, width: 640, height: 365, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 2, x: 80, y: 465, width: 640, height: 365, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 3, x: 80, y: 860, width: 640, height: 365, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 4, x: 80, y: 1255, width: 640, height: 365, borderRadius: 2, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      ctx.fillStyle = '#141318';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F5F4F8';
      ctx.font = '900 36px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'SNAPBOOTH NOIR', width / 2, 1750);
      ctx.fillStyle = '#ACA2C7';
      ctx.font = '500 18px "DM Sans", sans-serif';
      ctx.fillText('STUDIO EDITION • MONOCHROME', width / 2, 1800);
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, 1845);
      ctx.restore();
    },
  },

  // =========================================================================
  // 7. FILM & ANALOG (Classic 35mm & Contact Sheet)
  // =========================================================================
  {
    id: 'classic-35mm-1',
    family: 'classic-35mm',
    name: 'Classic 35mm',
    variantLabel: '1 Hero Frame',
    category: 'Film',
    description: 'Black film negative frame with authentic sprocket holes and frame numbers',
    background: ['#0C0B0E'],
    textColor: '#E59866',
    supportedPhotoCounts: [1],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 90, y: 160, width: 620, height: 860, borderRadius: 2 },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#0C0B0E';
      ctx.fillRect(0, 0, width, height);
      drawFilmSprockets(ctx, 0, 0, width, height, ['01A']);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.fillStyle = '#E59866';
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(style.header || 'KODAK SAFETY FILM 5063', width / 2, 1200);
      ctx.fillText(date.toDateString().toUpperCase(), width / 2, 1250);
      ctx.restore();
    },
  },
  {
    id: 'classic-35mm-2',
    family: 'classic-35mm',
    name: 'Classic 35mm',
    variantLabel: '2 Cut Duo',
    category: 'Film',
    description: '35mm film negative strip with two frames and sprockets',
    background: ['#0C0B0E'],
    textColor: '#E59866',
    supportedPhotoCounts: [2],
    recommendedFor: 2,
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 90, y: 120, width: 620, height: 520, borderRadius: 2 },
      { id: 2, x: 90, y: 690, width: 620, height: 520, borderRadius: 2 },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#0C0B0E';
      ctx.fillRect(0, 0, width, height);
      drawFilmSprockets(ctx, 0, 0, width, height, ['01A', '02A']);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.fillStyle = '#E59866';
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(style.header || 'KODAK SAFETY FILM 5063', width / 2, 1380);
      ctx.fillText('FRAME 01A - 02A • ' + date.toDateString().toUpperCase(), width / 2, 1430);
      ctx.restore();
    },
  },
  {
    id: 'classic-35mm-4',
    family: 'classic-35mm',
    name: 'Classic 35mm',
    variantLabel: '4 Cut Strip',
    category: 'Film',
    description: 'Classic 4-frame 35mm film negative photostrip with sprockets',
    background: ['#0C0B0E'],
    textColor: '#E59866',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 90, y: 70, width: 620, height: 360, borderRadius: 2 },
      { id: 2, x: 90, y: 460, width: 620, height: 360, borderRadius: 2 },
      { id: 3, x: 90, y: 850, width: 620, height: 360, borderRadius: 2 },
      { id: 4, x: 90, y: 1240, width: 620, height: 360, borderRadius: 2 },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#0C0B0E';
      ctx.fillRect(0, 0, width, height);
      drawFilmSprockets(ctx, 0, 0, width, height, ['01A', '02A', '03A', '04A']);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.fillStyle = '#E59866';
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(style.header || 'KODAK SAFETY FILM 5063', width / 2, 1750);
      ctx.fillText('SNAPBOOTH ANALOG DARKROOM • ' + date.toDateString().toUpperCase(), width / 2, 1800);
      ctx.restore();
    },
  },
  {
    id: 'contact-sheet-6',
    family: 'contact-sheet',
    name: 'Contact Sheet',
    variantLabel: '6 Cut Studio',
    category: 'Film',
    description: 'Photographer darkroom proof sheet with grease pencil crop marks (2 × 3)',
    background: ['#0D0D10'],
    textColor: '#E59866',
    supportedPhotoCounts: [6],
    recommendedFor: 6,
    canvas: { width: 900, height: 1800 },
    photoSlots: [
      { id: 1, x: 70, y: 90, width: 360, height: 440, borderRadius: 1 },
      { id: 2, x: 470, y: 90, width: 360, height: 440, borderRadius: 1 },
      { id: 3, x: 70, y: 560, width: 360, height: 440, borderRadius: 1 },
      { id: 4, x: 470, y: 560, width: 360, height: 440, borderRadius: 1 },
      { id: 5, x: 70, y: 1030, width: 360, height: 440, borderRadius: 1 },
      { id: 6, x: 470, y: 1030, width: 360, height: 440, borderRadius: 1 },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#0D0D10';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#D90429';
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 80, 380, 460);
      ctx.strokeRect(460, 1020, 380, 460);
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#E59866';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(style.header || 'SNAPBOOTH CONTACT PROOF SHEET', width / 2, 1580);
      ctx.restore();
    },
  },

  // =========================================================================
  // 8. POLAROID FAMILY
  // =========================================================================
  {
    id: 'polaroid-hero-1',
    family: 'polaroid',
    name: 'Polaroid Hero',
    variantLabel: '1 Hero Photo',
    category: 'Polaroid',
    description: 'Giant single Polaroid photo with wide bottom chin for signature and handwritten date',
    background: ['#EDEAE2'],
    textColor: '#222026',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 140, width: 640, height: 760, borderRadius: 2, frameStyle: 'polaroid', chinHeight: 140 },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createPaperPattern(ctx, 'worn');
      ctx.fillRect(0, 0, width, height);
      drawWashiTapeStrip(ctx, width / 2, 80, 160, 40, 'rgba(255, 235, 205, 0.85)', -0.04);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.fillStyle = '#222026';
      ctx.textAlign = 'center';
      ctx.font = 'italic 700 36px Georgia, serif';
      ctx.fillText(style.header || 'A moment in time', width / 2, 1000);
      ctx.font = '20px "Courier New", monospace';
      ctx.fillStyle = '#555';
      ctx.fillText(date.toDateString(), width / 2, 1045);
      ctx.restore();
    },
  },
  {
    id: 'polaroid-duo-2',
    family: 'polaroid',
    name: 'Polaroid Duo',
    variantLabel: '2 Cut Duo',
    category: 'Polaroid',
    description: 'Two classic white Polaroids stacked with translucent washi tape',
    background: ['#EDEAE2'],
    textColor: '#222026',
    supportedPhotoCounts: [2],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 120, width: 640, height: 500, borderRadius: 2, frameStyle: 'polaroid', chinHeight: 80 },
      { id: 2, x: 80, y: 730, width: 640, height: 500, borderRadius: 2, frameStyle: 'polaroid', chinHeight: 80 },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createPaperPattern(ctx, 'worn');
      ctx.fillRect(0, 0, width, height);
      drawWashiTapeStrip(ctx, 160, 70, 140, 36, 'rgba(255, 235, 205, 0.85)', -0.06);
      drawWashiTapeStrip(ctx, width - 160, 680, 140, 36, 'rgba(255, 235, 205, 0.85)', 0.05);
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      ctx.save();
      ctx.fillStyle = '#222026';
      ctx.textAlign = 'center';
      ctx.font = '900 34px "DM Sans", sans-serif';
      ctx.fillText(style.header || 'POLAROID MEMORIES', width / 2, 1440);
      ctx.font = 'italic 700 22px Georgia, serif';
      ctx.fillStyle = '#666';
      ctx.fillText('keepsake edition • ' + date.toDateString(), width / 2, 1490);
      ctx.restore();
    },
  },

  // =========================================================================
  // 9. THE DAILY CHRONICLE (Vintage Newspaper)
  // =========================================================================
  {
    id: 'old-newspaper-1',
    family: 'the-daily-chronicle',
    name: 'The Daily Chronicle',
    variantLabel: '1 Hero Headline',
    category: 'Vintage',
    description: 'Authentic vintage newspaper front page with deckle-edge torn newsprint clipping',
    background: ['#F2EBD9'],
    textColor: '#1A1815',
    supportedPhotoCounts: [1],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 220, width: 640, height: 860, borderRadius: 0, frameStyle: 'torn-paper' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createPaperPattern(ctx, 'kraft');
      ctx.fillRect(0, 0, width, height);
      drawNewspaperHeader(ctx, width, 'The Daily Chronicle', "All the Memories That's Fit to Print");
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#1A1815';
      ctx.textAlign = 'center';
      ctx.font = '900 38px "Times New Roman", serif';
      ctx.fillText(style.header || 'HISTORIC SMILES RECORDED', width / 2, 1180);
      ctx.restore();
    },
  },
  {
    id: 'old-newspaper-2',
    family: 'the-daily-chronicle',
    name: 'The Daily Chronicle',
    variantLabel: '2 Cut Duo',
    category: 'Vintage',
    description: 'Two vintage torn newsprint photo clippings with newspaper headlines',
    background: ['#F2EBD9'],
    textColor: '#1A1815',
    supportedPhotoCounts: [2],
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 200, width: 640, height: 500, borderRadius: 0, frameStyle: 'torn-paper' },
      { id: 2, x: 80, y: 770, width: 640, height: 500, borderRadius: 0, frameStyle: 'torn-paper' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createPaperPattern(ctx, 'kraft');
      ctx.fillRect(0, 0, width, height);
      drawNewspaperHeader(ctx, width, 'The Daily Chronicle', "All the Memories That's Fit to Print");
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();
      ctx.fillStyle = '#1A1815';
      ctx.textAlign = 'center';
      ctx.font = '900 34px "Times New Roman", serif';
      ctx.fillText(style.header || 'EXTRA! EXTRA! MEMORIES MADE', width / 2, 1380);
      ctx.restore();
    },
  },

  // ==========================================
  // 13. SNAP DAYS DESKTOP DIARY (Y2K / Aesthetic Reference)
  // ==========================================
  {
    id: 'blue-desktop-diary-4',
    family: 'blue-desktop-diary',
    name: 'Snap Days Desktop Diary',
    variantLabel: '4 Cut Classic',
    category: 'Y2K',
    description: 'Early-2000s desktop photo booth with retro window bars, doodles, and baby blue diary aesthetic',
    background: ['#BFD7E8'],
    textColor: '#20252A',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 230, width: 640, height: 260, borderRadius: 4, frameStyle: 'classic' },
      { id: 2, x: 80, y: 560, width: 640, height: 260, borderRadius: 4, frameStyle: 'classic' },
      { id: 3, x: 80, y: 890, width: 640, height: 260, borderRadius: 4, frameStyle: 'classic' },
      { id: 4, x: 80, y: 1220, width: 640, height: 260, borderRadius: 4, frameStyle: 'classic' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      // Powder baby blue canvas
      ctx.fillStyle = '#BFD7E8';
      ctx.fillRect(0, 0, width, height);

      // Status Bar at very top
      ctx.fillStyle = '#AEC7DA';
      ctx.fillRect(0, 0, width, 40);
      ctx.fillStyle = '#20252A';
      ctx.font = '500 16px "DM Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SnapBooth Studio  •  Wifi  ••••', 30, 26);
      ctx.textAlign = 'right';
      ctx.fillText('100% [=] 12:00', width - 30, 26);

      // Top Editorial Masthead
      ctx.textAlign = 'left';
      ctx.fillStyle = '#33495D';
      ctx.font = '600 14px "DM Mono", monospace';
      ctx.fillText('A SNAPBOOTH ORIGINAL / K-STYLE SELF PHOTO STUDIO', 80, 80);

      ctx.font = 'italic 700 76px "Libre Caslon Display", Georgia, serif';
      ctx.fillStyle = '#20252A';
      ctx.fillText('SNAP DAYS', 80, 150);

      ctx.font = '500 15px "DM Mono", monospace';
      ctx.fillStyle = '#4D606C';
      ctx.fillText('VOL. 01 — YOUR EVERYDAY ARCHIVE', 80, 180);

      // Horizontal double rule
      ctx.strokeStyle = '#20252A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 195);
      ctx.lineTo(width - 80, 195);
      ctx.moveTo(80, 199);
      ctx.lineTo(width - 80, 199);
      ctx.stroke();

      // Draw Retro Window Bars for each slot
      const slotsY = [230, 560, 890, 1220];
      const slotTitles = ['live_pose_01.jpg', 'favorite_moment.png', 'strike_a_pose.jpg', 'keepsake_final.png'];
      slotsY.forEach((sy, idx) => {
        // Window title bar
        ctx.fillStyle = '#D8DCD9';
        ctx.fillRect(80, sy - 30, 640, 30);
        ctx.strokeStyle = '#20252A';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(80, sy - 30, 640, 30);

        // Three window control dots
        const dots = ['#C88F83', '#D6C58C', '#A0B8A6'];
        dots.forEach((dotColor, di) => {
          ctx.beginPath();
          ctx.arc(95 + di * 14, sy - 15, 4, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();
          ctx.strokeStyle = '#6D6A66';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Window title
        ctx.fillStyle = '#293A45';
        ctx.font = '500 13px "DM Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(slotTitles[idx], 145, sy - 10);

        // Photo slot outline
        ctx.strokeStyle = '#20252A';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(80, sy, 640, 260);
      });
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width, height } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateFormatted = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;

      ctx.save();
      // Whimsical Line Sun doodle
      ctx.strokeStyle = '#33495D';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width - 120, 120, 16, 0, Math.PI * 2);
      ctx.stroke();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(width - 120 + Math.cos(a) * 20, 120 + Math.sin(a) * 20);
        ctx.lineTo(width - 120 + Math.cos(a) * 27, 120 + Math.sin(a) * 27);
        ctx.stroke();
      }

      // Cloud doodle with rain at bottom
      ctx.beginPath();
      ctx.arc(120, 1560, 18, 0, Math.PI * 2);
      ctx.arc(142, 1550, 24, 0, Math.PI * 2);
      ctx.arc(168, 1560, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Editorial Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#20252A';
      ctx.font = 'italic 26px Georgia, serif';
      ctx.fillText(style.header || 'stay a little. strike a pose.', width / 2, 1560);

      ctx.font = '500 16px "DM Mono", monospace';
      ctx.fillStyle = '#4D606C';
      ctx.fillText(`${style.text || 'PERSONAL PHOTO DIARY'}  •  ${dateFormatted}`, width / 2, 1610);

      // Bottom rule & copyright
      ctx.strokeStyle = '#20252A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 1650);
      ctx.lineTo(width - 80, 1650);
      ctx.stroke();

      ctx.font = '13px "DM Mono", monospace';
      ctx.fillStyle = '#657D8E';
      ctx.fillText('END OF PAGE — KEEP THE MEMORIES / SNAPBOOTH', width / 2, 1685);
      ctx.restore();
    },
  },

  // ==========================================
  // 14. DIGITAL CRUSH COLLAGE (Y2K / Scrapbook)
  // ==========================================
  {
    id: 'digital-crush-4',
    family: 'digital-crush',
    name: 'Digital Crush Collage',
    variantLabel: '4 Cut Collage',
    category: 'Y2K',
    description: 'Playful desktop collage with speech bubbles, orbit circles, sticker stamps, and pastel blue aesthetic',
    background: ['#B8D0E3'],
    textColor: '#1A2E40',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 90, y: 220, width: 620, height: 260, borderRadius: 2, frameStyle: 'classic' },
      { id: 2, x: 90, y: 540, width: 620, height: 260, borderRadius: 2, frameStyle: 'classic' },
      { id: 3, x: 90, y: 860, width: 620, height: 260, borderRadius: 2, frameStyle: 'classic' },
      { id: 4, x: 90, y: 1180, width: 620, height: 260, borderRadius: 2, frameStyle: 'classic' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#B8D0E3';
      ctx.fillRect(0, 0, width, height);

      // Subtle desktop grid lines
      ctx.strokeStyle = '#CADDEB';
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 40; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Top title
      ctx.fillStyle = '#1A2E40';
      ctx.font = 'italic 700 68px "Libre Caslon Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('PHOTO DIARY', width / 2, 130);

      ctx.font = '500 14px "DM Mono", monospace';
      ctx.fillStyle = '#3E576B';
      ctx.fillText('MEMORY FILES / VOL. 01', width / 2, 165);

      // Photo Frames
      [220, 540, 860, 1180].forEach(sy => {
        ctx.fillStyle = '#F4F3EF';
        ctx.fillRect(80, sy - 10, 640, 280);
        ctx.strokeStyle = '#223647';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, sy - 10, 640, 280);
      });
    },
    renderForeground(ctx, canvas, style) {
      const { width } = canvas;
      ctx.save();

      // Speech bubble 1: "i want you"
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(100, 180, 120, 34, 12);
      ctx.fill();
      ctx.strokeStyle = '#223647';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#223647';
      ctx.font = 'italic bold 15px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('i want you', 160, 203);

      // Speech bubble 2: "i love you"
      ctx.fillStyle = '#C4DCED';
      ctx.beginPath();
      ctx.roundRect(width - 240, 500, 130, 34, 12);
      ctx.fill();
      ctx.strokeStyle = '#223647';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#203344';
      ctx.fillText('i love you', width - 175, 523);

      // Speech bubble 3: "i need you"
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(100, 820, 120, 34, 12);
      ctx.fill();
      ctx.strokeStyle = '#223647';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#223647';
      ctx.fillText('i need you', 160, 843);

      // Editorial quote below photos
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A2E40';
      ctx.font = 'italic 700 36px "Libre Caslon Display", Georgia, serif';
      ctx.fillText('little things, big feelings.', width / 2, 1540);

      // Mini Desktop Dock Representation
      const dockW = 260;
      const dockX = (width - dockW) / 2;
      const dockY = 1600;
      ctx.fillStyle = '#FFFFFF99';
      ctx.beginPath();
      ctx.roundRect(dockX, dockY, dockW, 44, 12);
      ctx.fill();
      ctx.strokeStyle = '#223647';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mini colorful dock icons
      const dockColors = ['#4686B8', '#73C991', '#E74C3C', '#F39C12', '#9B59B6', '#3498DB'];
      dockColors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(dockX + 16 + i * 40, dockY + 8, 28, 28, 6);
        ctx.fill();
        ctx.strokeStyle = '#223647';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Keepsake text
      ctx.font = '500 14px "DM Mono", monospace';
      ctx.fillStyle = '#3E576B';
      ctx.fillText(style.text || 'SELF PHOTO CLUB  •  OPEN EVERY DAY', width / 2, 1700);

      ctx.restore();
    },
  },

  // ==========================================
  // 15. PHOTO ARCHIVE 2004 (Vintage Desktop / Retro Browser)
  // ==========================================
  {
    id: 'photo-archive-2004-4',
    family: 'photo-archive-2004',
    name: 'Photo Archive 2004',
    variantLabel: '4 Cut File Window',
    category: 'Vintage',
    description: 'Retro file explorer window with title bar, folder tabs, timestamps, and nostalgic desktop palette',
    background: ['#CBD8E2'],
    textColor: '#1D2A35',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 1800 },
    photoSlots: [
      { id: 1, x: 80, y: 270, width: 640, height: 260, borderRadius: 0, frameStyle: 'classic' },
      { id: 2, x: 80, y: 590, width: 640, height: 260, borderRadius: 0, frameStyle: 'classic' },
      { id: 3, x: 80, y: 910, width: 640, height: 260, borderRadius: 0, frameStyle: 'classic' },
      { id: 4, x: 80, y: 1230, width: 640, height: 260, borderRadius: 0, frameStyle: 'classic' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#CBD8E2';
      ctx.fillRect(0, 0, width, height);

      // Main Explorer Window Card
      const winX = 50;
      const winY = 60;
      const winW = width - 100;
      const winH = height - 120;

      ctx.fillStyle = '#F4F3EF';
      ctx.fillRect(winX, winY, winW, winH);
      ctx.strokeStyle = '#1D2A35';
      ctx.lineWidth = 2;
      ctx.strokeRect(winX, winY, winW, winH);

      // Window Title Bar (Windows 2000 / XP Classic style)
      ctx.fillStyle = '#33495D';
      ctx.fillRect(winX, winY, winW, 40);
      ctx.strokeStyle = '#1D2A35';
      ctx.strokeRect(winX, winY, winW, 40);

      // Window title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px "DM Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('📁 C:\\SnapBooth\\Memories\\Archive_2004', winX + 16, winY + 26);

      // Window controls [ _ ] [ □ ] [ X ]
      const cx = winX + winW - 90;
      ctx.fillStyle = '#DFE7EB';
      ctx.fillRect(cx, winY + 6, 24, 26);
      ctx.fillRect(cx + 28, winY + 6, 24, 26);
      ctx.fillRect(cx + 56, winY + 6, 24, 26);
      ctx.strokeStyle = '#1D2A35';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, winY + 6, 24, 26);
      ctx.strokeRect(cx + 28, winY + 6, 24, 26);
      ctx.strokeRect(cx + 56, winY + 6, 24, 26);

      ctx.fillStyle = '#1D2A35';
      ctx.font = 'bold 14px "DM Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('_', cx + 12, winY + 22);
      ctx.fillText('□', cx + 40, winY + 22);
      ctx.fillText('×', cx + 68, winY + 24);

      // Address bar
      ctx.fillStyle = '#E8ECEE';
      ctx.fillRect(winX, winY + 40, winW, 36);
      ctx.strokeStyle = '#1D2A35';
      ctx.strokeRect(winX, winY + 40, winW, 36);

      ctx.fillStyle = '#1D2A35';
      ctx.font = '14px "DM Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Address: https://diary.snapbooth.app/archive/2004', winX + 16, winY + 64);

      // Photo slot borders
      [270, 590, 910, 1230].forEach(sy => {
        ctx.strokeStyle = '#1D2A35';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, sy, 640, 260);
      });
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const { width, height } = canvas;
      const date = timestamp ? new Date(timestamp) : new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateFormatted = `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;

      ctx.save();
      // Photo labels
      const labels = ['FILE_001.RAW', 'FILE_002.RAW', 'FILE_003.RAW', 'FILE_004.RAW'];
      [270, 590, 910, 1230].forEach((sy, i) => {
        ctx.fillStyle = '#33495D';
        ctx.fillRect(80, sy - 24, 180, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '500 13px "DM Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(labels[i], 90, sy - 7);
      });

      // Bottom Status Bar
      const winX = 50;
      const winW = width - 100;
      const winH = height - 120;
      const bottomBarY = winX + winH - 60;

      ctx.fillStyle = '#DFE7EB';
      ctx.fillRect(winX, bottomBarY, winW, 30);
      ctx.strokeStyle = '#1D2A35';
      ctx.lineWidth = 1;
      ctx.strokeRect(winX, bottomBarY, winW, 30);

      ctx.fillStyle = '#1D2A35';
      ctx.font = '13px "DM Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`4 object(s)  •  ${dateFormatted}  •  ${style.text || 'SnapBooth Memory System'}`, winX + 16, bottomBarY + 20);

      ctx.textAlign = 'right';
      ctx.fillText('Local Intranet', winX + winW - 16, bottomBarY + 20);

      ctx.restore();
    },
  },

  // ==========================================
  // 12. LEGO POP iOS (Frame 1 - 1 Photo Hero)
  // ==========================================
  {
    id: 'lego-pop-ios-1',
    family: 'lego-pop-ios',
    name: 'Lego Pop iOS',
    variantLabel: '1 Hero Card',
    category: 'Playful',
    description: 'Bright yellow Lego studs with iOS photo card, holographic mini-CD, UFO alien & fried egg sticker',
    background: ['#F5AF00'],
    textColor: '#111827',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 70, y: 614, width: 940, height: 710, borderRadius: 0, frameStyle: 'none' },
    ],
    renderBackground(ctx, canvas, style) {
      const { width, height } = canvas;
      // 1. Lego base studs pattern
      ctx.fillStyle = createLegoPattern(ctx, '#F5AF00');
      ctx.fillRect(0, 0, width, height);

      // 2. White iOS Card Container (x: 70, y: 500, w: 940, h: 940)
      drawIosPhotoCardFrame(ctx, 70, 500, 940, 940, 70, 614, 940, 710, style?.timestamp);
    },
    renderForeground(ctx) {
      // Scale: 2x (matching 1080x1920 canvas from 540x960 SVG)
      // Top-Left: Modern Silver Paperclip
      drawModernPaperclip(ctx, 80, 260, 2, -0.61);

      // Top-Right: Mini Holographic CD
      drawHolographicMiniCd(ctx, 680, 200, 2);

      // Top-Right: Sunny-side up Fried Egg Sticker over CD edge
      drawFriedEggSticker(ctx, 800, 210, 2);

      // Bottom-Left: Cute Retro Alien UFO with indicator LEDs
      drawRetroUfoAlien(ctx, 90, 1480, 2);

      // Bottom-Center: Fresh Lemon Slice with radial wedges
      drawLemonSlice(ctx, 450, 1570, 2);

      // Bottom-Right: "OFF THE WALL / STAY CURIOUS" Pill Capsule Sticker
      drawOffTheWallPill(ctx, 650, 1420, -0.14, 2);
    },
  },

  // ==========================================
  // 13. MEOW'S ARCADE CONSOLE (Frame 2 - 1 Photo Hero)
  // ==========================================
  {
    id: 'meow-arcade-1',
    family: 'meow-arcade',
    name: 'Meow Arcade Console',
    variantLabel: '1 Hero Screen',
    category: 'Retro',
    description: 'Pastel gingham tablecloth with retro handheld game console screen, storybooks & red phone',
    background: ['#FCF3EE', '#F37C76'],
    textColor: '#3A404C',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 1000, height: 1778 },
    photoSlots: [
      { id: 1, x: 190, y: 470, width: 620, height: 540, borderRadius: 18, frameStyle: 'none' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      // 1. Gingham tablecloth pattern
      ctx.fillStyle = createGinghamPattern(ctx, '#FCF3EE', '#F37C76');
      ctx.fillRect(0, 0, width, height);

      // 2. Bottom curved wave with strawberry accents
      ctx.save();
      ctx.fillStyle = '#FCF3EE';
      ctx.beginPath();
      ctx.moveTo(1000, 1400);
      ctx.bezierCurveTo(1000, 1400, 600, 1300, 300, 1400);
      ctx.bezierCurveTo(150, 1450, 0, 1500, 0, 1600);
      ctx.lineTo(0, 1778);
      ctx.lineTo(1000, 1778);
      ctx.closePath();
      ctx.fill();

      // Strawberry seeds along bottom wave
      ctx.fillStyle = '#E57373';
      const seeds = [
        [180, 1470], [320, 1440], [480, 1420], [640, 1410],
        [780, 1430], [900, 1460], [120, 1580], [250, 1550],
        [420, 1530], [580, 1520], [740, 1540], [870, 1570],
      ];
      seeds.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.ellipse(sx, sy, 4, 2.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 3. Top-Right Storybooks
      drawRetroStorybooks(ctx, 740, 60, 1);

      // 4. Bottom-Left Red Telephone Booth
      drawRetroPayphoneIcon(ctx, 50, 1570, 1);

      // 5. Center Retro Handheld Console Shell
      drawRetroHandheldConsole(ctx, 60, 360, 880, 760, {
        color: '#586BA4',
        title: "MEOW'S ADVENTURE",
        leftText1: 'FUN',
        leftText2: 'PLAY!',
        screenX: 190,
        screenY: 470,
        screenW: 620,
        screenH: 540,
      });

      // Dark CRT screen background behind photo slot
      ctx.fillStyle = '#2A2F3A';
      if (ctx.roundRect) ctx.roundRect(190, 470, 620, 540, 18);
      else ctx.rect(190, 470, 620, 540);
      ctx.fill();
    },
    renderForeground(ctx) {
      // Screen glass sheen reflection across top portion
      ctx.save();
      const glass = ctx.createLinearGradient(190, 470, 190, 650);
      glass.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      glass.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
      glass.addColorStop(1, 'transparent');

      ctx.fillStyle = glass;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(190, 470, 620, 180, [18, 18, 0, 0]);
      else ctx.rect(190, 470, 620, 180);
      ctx.fill();

      // Console scanline details
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS START • LEVEL 01 • READY', 500, 1160);

      ctx.restore();
    },
  },

  // ==========================================
  // 14. POLAROID EJECT AIRMAIL (Frame 3 - 1 Photo Hero)
  // ==========================================
  {
    id: 'polaroid-eject-1',
    family: 'polaroid-eject',
    name: 'Polaroid Eject Airmail',
    variantLabel: '1 Ejected Photo',
    category: 'Vintage',
    description: 'Vintage Polaroid camera spitting out airmail keepsake photo with phone handset & retro stickers',
    background: ['#F6F2E7'],
    textColor: '#1B3A57',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 1200, height: 2160 },
    photoSlots: [
      { id: 1, x: 368, y: 560, width: 464, height: 580, borderRadius: 6, frameStyle: 'paper-perforated' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      // 1. Notebook Graph Grid Paper Background
      ctx.fillStyle = createNotebookGridPattern(ctx, '#F6F2E7', '#DFD7C2');
      ctx.fillRect(0, 0, width, height);

      // 2. Ejected Photo Strip Base Card (at x: 320, y: 520, w: 560, h: 1240)
      ctx.save();
      ctx.shadowColor = 'rgba(44, 62, 80, 0.26)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 24;

      ctx.fillStyle = '#FBF8F0';
      if (ctx.roundRect) ctx.roundRect(320, 520, 560, 1240, 8);
      else ctx.rect(320, 520, 560, 1240);
      ctx.fill();

      ctx.shadowColor = 'transparent';

      // Left & Right Airmail chevron borders
      const barH = 48;
      const stripeW = 24;
      for (let y = 520; y < 1760; y += barH) {
        ctx.fillStyle = (Math.floor((y - 520) / barH) % 2 === 0) ? '#1B4F72' : '#C0392B';
        ctx.beginPath();
        ctx.moveTo(320, y);
        ctx.lineTo(320 + stripeW, y + stripeW);
        ctx.lineTo(320 + stripeW, y + barH);
        ctx.lineTo(320, y + barH - stripeW);
        ctx.closePath();
        ctx.fill();
      }
      for (let y = 520; y < 1760; y += barH) {
        ctx.fillStyle = (Math.floor((y - 520) / barH) % 2 === 0) ? '#C0392B' : '#1B4F72';
        ctx.beginPath();
        ctx.moveTo(880 - stripeW, y);
        ctx.lineTo(880, y + stripeW);
        ctx.lineTo(880, y + barH);
        ctx.lineTo(880 - stripeW, y + barH - stripeW);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const date = timestamp ? new Date(timestamp) : new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateFormatted = `${pad(date.getMonth() + 1)}.${pad(date.getDate())}.${String(date.getFullYear()).slice(-2)}`;

      // 1. Vintage Polaroid Instant Camera at Top (x: 300, y: 90, scale: 2)
      drawPolaroidInstantCamera(ctx, 300, 90, 2);

      // 2. Embellishments & Stickers (scale: 2)
      // Top-Left: 3D Pointer Arrow pointing to shutter
      drawPointerArrow3D(ctx, 224, 284, -0.38, 2);

      // Top-Right: "CUTE SILLY OBJECT★" badge
      drawCuteSillyObjectBadge(ctx, 770, 350, 0.15, 2);

      // Left-Center: Cute Smiling Star Character
      drawCuteStarCharacter(ctx, 70, 460, -0.17, 2);

      // Left-Side: Telephone Receiver + Spiral Cable
      drawVintagePhoneCordAndHandset(ctx, 260, 520, 2);

      // Left-Bottom: Exclamation Pop Badge
      drawExclamationBadge(ctx, 200, 1280, -0.1, 2);

      // 3. Ejected Photo Strip Bottom Typography & Stamps
      ctx.save();
      ctx.textAlign = 'center';

      // Dashed separator line
      ctx.strokeStyle = '#D5C8AD';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(360, 1220);
      ctx.lineTo(840, 1220);
      ctx.stroke();
      ctx.setLineDash([]);

      // Typography
      ctx.fillStyle = '#1B3A57';
      ctx.font = '900 56px Impact, "Arial Black", sans-serif';
      ctx.fillText(style.header || 'MEMORIES', 600, 1300);

      ctx.fillStyle = '#C0392B';
      ctx.font = 'italic bold 36px Georgia, serif';
      ctx.fillText('&', 600, 1345);

      ctx.fillStyle = '#1B3A57';
      ctx.font = '900 64px Impact, "Arial Black", sans-serif';
      ctx.fillText('STORIES', 600, 1410);

      ctx.fillStyle = '#555555';
      ctx.font = 'italic 34px "Brush Script MT", "Bickham Script Pro", cursive, serif';
      ctx.fillText(style.text || 'captured in time', 600, 1465);

      // Circular Postmark Stamp
      drawPostmark(ctx, 480, 1590, 68, 'AIR MAIL PAR AVION', dateFormatted, '#8C7B6C');

      // Date Stamp in Impact font
      ctx.fillStyle = '#333333';
      ctx.font = '900 44px Impact, sans-serif';
      ctx.fillText(dateFormatted, 730, 1605);

      // Wavy Cancellation Lines
      ctx.strokeStyle = '#8C7B6C';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.65;
      for (let offset = -14; offset <= 14; offset += 14) {
        ctx.beginPath();
        for (let x = 620; x <= 820; x += 30) {
          const y = 1530 + offset + Math.sin((x / 30) * Math.PI) * 7;
          if (x === 620) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      ctx.restore();
    },
  },

  // Multi-cut adaptations of the references
  {
    id: 'polaroid-eject-2',
    family: 'polaroid-eject',
    name: 'Polaroid Eject Airmail',
    variantLabel: '2 Cut Duo',
    category: 'Vintage',
    description: 'Vintage Polaroid camera ejecting two airmail keepsake photos with phone cord & stickers',
    background: ['#F6F2E7'],
    textColor: '#1B3A57',
    supportedPhotoCounts: [2],
    recommendedFor: 2,
    canvas: { width: 1200, height: 2160 },
    photoSlots: [
      { id: 1, x: 368, y: 560, width: 464, height: 320, borderRadius: 6, frameStyle: 'paper-perforated' },
      { id: 2, x: 368, y: 920, width: 464, height: 320, borderRadius: 6, frameStyle: 'paper-perforated' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createNotebookGridPattern(ctx, '#F6F2E7', '#DFD7C2');
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.shadowColor = 'rgba(44, 62, 80, 0.26)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 24;
      ctx.fillStyle = '#FBF8F0';
      if (ctx.roundRect) ctx.roundRect(320, 520, 560, 1240, 8);
      else ctx.rect(320, 520, 560, 1240);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      const barH = 48;
      const stripeW = 24;
      for (let y = 520; y < 1760; y += barH) {
        ctx.fillStyle = (Math.floor((y - 520) / barH) % 2 === 0) ? '#1B4F72' : '#C0392B';
        ctx.beginPath();
        ctx.moveTo(320, y);
        ctx.lineTo(320 + stripeW, y + stripeW);
        ctx.lineTo(320 + stripeW, y + barH);
        ctx.lineTo(320, y + barH - stripeW);
        ctx.closePath();
        ctx.fill();
      }
      for (let y = 520; y < 1760; y += barH) {
        ctx.fillStyle = (Math.floor((y - 520) / barH) % 2 === 0) ? '#C0392B' : '#1B4F72';
        ctx.beginPath();
        ctx.moveTo(880 - stripeW, y);
        ctx.lineTo(880, y + stripeW);
        ctx.lineTo(880, y + barH);
        ctx.lineTo(880 - stripeW, y + barH - stripeW);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    },
    renderForeground(ctx, canvas, style, timestamp) {
      const date = timestamp ? new Date(timestamp) : new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateFormatted = `${pad(date.getMonth() + 1)}.${pad(date.getDate())}.${String(date.getFullYear()).slice(-2)}`;

      drawPolaroidInstantCamera(ctx, 300, 90, 2);
      drawPointerArrow3D(ctx, 224, 284, -0.38, 2);
      drawCuteSillyObjectBadge(ctx, 770, 350, 0.15, 2);
      drawCuteStarCharacter(ctx, 70, 460, -0.17, 2);
      drawVintagePhoneCordAndHandset(ctx, 260, 520, 2);
      drawExclamationBadge(ctx, 200, 1280, -0.1, 2);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#D5C8AD';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(360, 1280);
      ctx.lineTo(840, 1280);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#1B3A57';
      ctx.font = '900 48px Impact, "Arial Black", sans-serif';
      ctx.fillText(style.header || 'MEMORIES', 600, 1350);

      ctx.fillStyle = '#C0392B';
      ctx.font = 'italic bold 32px Georgia, serif';
      ctx.fillText('&', 600, 1390);

      ctx.fillStyle = '#1B3A57';
      ctx.font = '900 54px Impact, "Arial Black", sans-serif';
      ctx.fillText('STORIES', 600, 1445);

      drawPostmark(ctx, 480, 1580, 68, 'AIR MAIL PAR AVION', dateFormatted, '#8C7B6C');
      ctx.fillStyle = '#333333';
      ctx.font = '900 44px Impact, sans-serif';
      ctx.fillText(dateFormatted, 730, 1595);
      ctx.restore();
    },
  },

  {
    id: 'meow-arcade-3',
    family: 'meow-arcade',
    name: 'Meow Arcade Console',
    variantLabel: '3 Stacked Consoles',
    category: 'Retro',
    description: 'Pastel gingham tablecloth with 3 stacked retro handheld game consoles (Dark Blue, Yellow, Lavender)',
    background: ['#FCF3EE', '#F37C76'],
    textColor: '#3A404C',
    supportedPhotoCounts: [3],
    recommendedFor: 3,
    canvas: { width: 1000, height: 1778 },
    photoSlots: [
      { id: 1, x: 250, y: 250, width: 500, height: 300, borderRadius: 15, frameStyle: 'none' },
      { id: 2, x: 250, y: 700, width: 500, height: 300, borderRadius: 15, frameStyle: 'none' },
      { id: 3, x: 250, y: 1150, width: 500, height: 300, borderRadius: 15, frameStyle: 'none' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = createGinghamPattern(ctx, '#FCF3EE', '#F37C76');
      ctx.fillRect(0, 0, width, height);

      // Bottom curved wave
      ctx.save();
      ctx.fillStyle = '#FCF3EE';
      ctx.beginPath();
      ctx.moveTo(1000, 1400);
      ctx.bezierCurveTo(1000, 1400, 600, 1300, 300, 1400);
      ctx.bezierCurveTo(150, 1450, 0, 1500, 0, 1600);
      ctx.lineTo(0, 1778);
      ctx.lineTo(1000, 1778);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      drawRetroStorybooks(ctx, 740, 50, 1);
      drawRetroPayphoneIcon(ctx, 40, 1600, 1);

      // Console 1: Dark Blue
      drawRetroHandheldConsole(ctx, 100, 200, 800, 400, {
        color: '#586BA4',
        title: "MEOW'S ADVENTURE",
        leftText1: 'START',
        leftText2: 'READY',
        screenX: 250,
        screenY: 250,
        screenW: 500,
        screenH: 300,
      });

      // Console 2: Yellow
      drawRetroHandheldConsole(ctx, 100, 650, 800, 400, {
        color: '#FCD78C',
        title: 'RETRO SNAP',
        leftText1: 'FUN',
        leftText2: 'PLAY!',
        screenX: 250,
        screenY: 700,
        screenW: 500,
        screenH: 300,
      });

      // Console 3: Light Blue
      drawRetroHandheldConsole(ctx, 100, 1100, 800, 400, {
        color: '#A0B4FF',
        title: 'GHOST STORIES',
        leftText1: 'STAGE',
        leftText2: 'CLEAR',
        screenX: 250,
        screenY: 1150,
        screenW: 500,
        screenH: 300,
      });
    },
    renderForeground(ctx) {
      // Small screen gloss overlays
      ctx.save();
      [250, 700, 1150].forEach(sy => {
        const glass = ctx.createLinearGradient(250, sy, 250, sy + 100);
        glass.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        glass.addColorStop(1, 'transparent');
        ctx.fillStyle = glass;
        if (ctx.roundRect) ctx.roundRect(250, sy, 500, 100, [15, 15, 0, 0]);
        else ctx.fillRect(250, sy, 500, 100);
        ctx.fill();
      });
      ctx.restore();
    },
  },
];
