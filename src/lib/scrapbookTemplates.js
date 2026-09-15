/**
 * 5 Tactile Scrapbook & Comic Masterpiece Templates for CissPic
 * Directly based on real user visual references:
 * 1. Spider-Verse Comic Scrapbook (3-cut polaroid collage with camera-holding Spider-Man)
 * 2. Spider-Gwen Street Punk Poster (1-shot hero with pink polaroid & spider webs)
 * 3. Spectacular Vintage Comic (1-shot hero with crumpled blue/red paper & 3D title)
 * 4. Kraft Gingham Picnic Scrapbook (2-cut duo with red gingham cloth & spidey hand sign)
 * 5. Denim Ocean Wave & Nikon Digicam (4-cut and 1-shot with camera LCD screen as photo slot)
 */

import {
  drawSpiderComicBackground,
  drawSpiderManHoldingCamera,
  drawHangingSpiderMan,
  drawSpiderWebCorners,
  drawSpiderGwenStreetPoster,
  drawSpiderGwenForeground,
  drawHangingBlackSpider,
  drawSpectacularComicCollage,
  drawSpiderManTitleBadge,
  drawComicLightningSparks,
  drawKraftGinghamScrapbook,
  drawSpideyHandSign,
  drawFavoritePersonTape,
  drawVintageTicketStub,
  drawDenimOceanWaves,
  drawWatercolorJellyfish,
  drawSnoopyVinylRecord,
  drawSilverNikonDigicam,
  drawSatinBow,
  drawPearlBorder,
  drawCoquetteBackground,
  drawMidnightGothBackground,
  drawCuteSkullBow,
  drawBatWingsOnFrame,
  drawShoujoMangaBackground,
  drawMangaDialogueBubble,
  drawCyberAngelBackground,
  drawCatEarsOnFrame,
} from './scrapbookTextures.js';

export const SCRAPBOOK_MASTERPIECE_TEMPLATES = [
  // ==========================================
  // 1. SPIDER-VERSE COMIC SCRAPBOOK (3 Photos - Image 1 Reference)
  // ==========================================
  {
    id: 'spider-comic-scrapbook',
    family: 'spider-comic',
    name: 'Spider-Verse Scrapbook',
    variantLabel: '3-Cut Collage',
    category: 'Scrapbook',
    description: 'Black & white Marvel comic panels, tilted polaroids, camera-holding Spider-Man & Spider-Gwen',
    background: ['#EBE7DF', '#751119'],
    textColor: '#1E1E24',
    supportedPhotoCounts: [3, 1, 2, 4],
    recommendedFor: 3,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      // Slot 1: Top-Left Tilted Polaroid
      { id: 1, x: 90, y: 220, width: 420, height: 460, rotation: -0.10, borderRadius: 2, frameStyle: 'polaroid' },
      // Slot 2: Middle-Right Tilted Polaroid
      { id: 2, x: 570, y: 440, width: 420, height: 500, rotation: 0.05, borderRadius: 2, frameStyle: 'polaroid' },
      // Slot 3: Bottom-Left Landscape Polaroid
      { id: 3, x: 70, y: 1180, width: 520, height: 380, rotation: -0.02, borderRadius: 2, frameStyle: 'polaroid' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawSpiderComicBackground(ctx, width, height);
    },
    renderForeground(ctx, canvas, style) {
      const { width, height } = canvas;

      // 1. Tom & Zendaya Cutout Strip at top center
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.fillRect(260, 110, 200, 70);
      ctx.strokeRect(260, 110, 200, 70);
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#111';
      ctx.fillText('PETER & MJ // 2024', 280, 150);
      ctx.restore();

      // 2. Hanging Spider-Man from top right
      drawHangingSpiderMan(ctx, 880, 180, 1.2);

      // 3. Heart Spidey sticker under slot 1
      ctx.save();
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(320, 730, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#FFF';
      ctx.textAlign = 'center';
      ctx.fillText('🕷️', 320, 736);
      ctx.restore();

      // 4. "Favorite person" vintage tape on left
      drawFavoritePersonTape(ctx, 30, 1020, 1.1);

      // 5. "I love you" ransom letters under slot 2
      ctx.save();
      ctx.font = '900 20px "Courier New", monospace';
      ctx.fillStyle = '#111';
      ctx.fillRect(800, 970, 130, 32);
      ctx.fillStyle = '#FFF';
      ctx.fillText('I LOVE YOU', 810, 992);
      ctx.restore();

      // 6. Red lipstick kiss mark stamp near slot 3
      ctx.save();
      ctx.font = '36px sans-serif';
      ctx.fillText('💋', 540, 1370);
      ctx.restore();

      // 7. Large Spider-Man holding retro camera in bottom right!
      drawSpiderManHoldingCamera(ctx, width - 420, height - 480, 1.5);
    },
  },

  // ==========================================
  // 2. SPIDER-GWEN STREET PUNK POSTER (1 Photo Hero - Image 2 Reference)
  // ==========================================
  {
    id: 'spider-gwen-punk-1',
    family: 'spider-gwen-punk',
    name: 'Spider-Gwen Punk Street',
    variantLabel: '1 Hero Shot',
    category: 'Scrapbook',
    description: 'Tokyo street wheatpaste poster with hot pink graffiti, web corners & Spider-Gwen action',
    background: ['#18151D', '#BE185D'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [1, 2],
    recommendedFor: 1,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 190, y: 440, width: 700, height: 740, borderRadius: 2, frameStyle: 'polaroid-pink' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawSpiderGwenStreetPoster(ctx, width, height);

      // Outer Pink Polaroid Frame Backing (x: 170, y: 410, w: 740, h: 840)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 14;
      ctx.fillStyle = '#FBCFE8'; // Pastel Pink Frame
      ctx.strokeStyle = '#F472B6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(160, 410, 760, 840, 8);
      ctx.fill();
      ctx.stroke();

      // Inner photo window
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(190, 440, 700, 740);
      ctx.restore();
    },
    renderForeground(ctx, canvas) {
      // 1. Spider Web in top corners of polaroid frame
      drawSpiderWebCorners(ctx, 190, 440, 180, 180, '#FFFFFF');
      drawSpiderWebCorners(ctx, 890, 440, -180, 180, '#FFFFFF');

      // 2. Black Spider hanging down right edge of the polaroid
      drawHangingBlackSpider(ctx, 920, 680, 1.3);

      // 3. Spider-Gwen foreground action pose in bottom-left
      drawSpiderGwenForeground(ctx, 20, 1180, 2.2);

      // 4. Street Barcode in bottom right
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(720, 1680, 280, 60);
      ctx.fillStyle = '#000000';
      for (let b = 730; b < 980; b += (b % 14 === 0 ? 8 : 4)) {
        ctx.fillRect(b, 1690, 2.5, 40);
      }
      ctx.font = 'bold 12px monospace';
      ctx.fillText('@aidigital_sens', 760, 1770);
      ctx.restore();
    },
  },

  // ==========================================
  // 3. SPECTACULAR VINTAGE COMIC (1 Photo Hero - Image 3 Reference)
  // ==========================================
  {
    id: 'vintage-spider-comic-1',
    family: 'vintage-spider-comic',
    name: 'Spectacular Vintage Comic',
    variantLabel: '1 Hero Shot',
    category: 'Vintage',
    description: 'Torn vintage comic magazine page, crumpled dark red & navy blue paper, 3D Spider-Man title',
    background: ['#F1ECE1', '#831818'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [1, 2, 4],
    recommendedFor: 1,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 190, y: 520, width: 700, height: 720, borderRadius: 2, frameStyle: 'polaroid-maroon' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawSpectacularComicCollage(ctx, width, height);

      // Dark Maroon Textured Polaroid Frame
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#5C1D24'; // Dark Maroon
      ctx.strokeStyle = '#4A141A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(160, 480, 760, 830, 6);
      ctx.fill();
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(190, 520, 700, 720);
      ctx.restore();
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;

      // 1. Cutout comic eyes strip in top-right
      ctx.save();
      ctx.fillStyle = '#DC2626';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.fillRect(720, 280, 260, 110);
      ctx.strokeRect(720, 280, 260, 110);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(800, 335, 38, 24, 0, 0, Math.PI * 2);
      ctx.ellipse(900, 335, 38, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 2. Comic Lightning soundwave sparks
      drawComicLightningSparks(ctx, 110, 1360, 1.4);
      drawComicLightningSparks(ctx, 240, 1420, 1.1);

      // 3. 3D Yellow Comic SPIDER-MAN Title Badge
      drawSpiderManTitleBadge(ctx, width / 2 + 80, 1340, 1.35);
    },
  },

  // ==========================================
  // 4. KRAFT GINGHAM & SPIDEY SCRAPBOOK (2 Photos - Image 4 Reference)
  // ==========================================
  {
    id: 'kraft-gingham-spidey-2',
    family: 'kraft-gingham-spidey',
    name: 'Kraft & Gingham Picnic',
    variantLabel: '2-Cut Duo',
    category: 'Cute',
    description: 'Warm kraft paper with red & white picnic gingham cloth, tilted polaroids, spidey hand sign',
    background: ['#F5EFE6', '#DC2626'],
    textColor: '#1E293B',
    supportedPhotoCounts: [2, 1, 4],
    recommendedFor: 2,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      // Top Polaroid (Tilted slightly left)
      { id: 1, x: 260, y: 170, width: 640, height: 660, rotation: -0.05, borderRadius: 2, frameStyle: 'polaroid' },
      // Bottom Polaroid (Tilted slightly right)
      { id: 2, x: 100, y: 920, width: 680, height: 700, rotation: 0.04, borderRadius: 2, frameStyle: 'polaroid' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawKraftGinghamScrapbook(ctx, width, height);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;

      // 1. Spidey Red Web-Shooter Hand Sign in top-left
      drawSpideyHandSign(ctx, 30, 280, 1.45);

      // 2. "Favorite person" Kraft tape in top-right
      drawFavoritePersonTape(ctx, 720, 140, 1.15);

      // 3. Vintage postal ticket "good things are coming" on middle-right
      drawVintageTicketStub(ctx, width - 260, 940, 1.1);

      // 4. Red comic action starburst explosion sticker ("POW / BAM") in bottom-right
      ctx.save();
      ctx.translate(720, 1540);
      ctx.fillStyle = '#DC2626';
      ctx.strokeStyle = '#1E1E24';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const points = 12;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? 70 : 35;
        const a = (i * Math.PI) / points;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SNAP!', 0, 8);
      ctx.restore();

      // 5. Black crawling spiders
      drawHangingBlackSpider(ctx, 160, 180, 0.9);
      drawHangingBlackSpider(ctx, 880, 1340, 0.9);
      drawHangingBlackSpider(ctx, 180, 1720, 1.0);
    },
  },

  // ==========================================
  // 5. DENIM OCEAN WAVES & DIGICAM (4 Photos - Image 5 Reference)
  // ==========================================
  {
    id: 'denim-ocean-digicam-4',
    family: 'denim-ocean-digicam',
    name: 'Denim Ocean Wave & Digicam',
    variantLabel: '4-Cut Multi',
    category: 'Vintage',
    description: 'Japanese rolling Great Waves, floating polaroids, and silver Nikon digicam with LCD screen slot',
    background: ['#263D5C', '#1B2E47'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [4, 1, 2, 6],
    recommendedFor: 4,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      // Slot 1: Silver Nikon Digicam LCD Screen (Bottom)
      { id: 1, x: 75, y: 1300, width: 560, height: 400, borderRadius: 8, frameStyle: 'none' },
      // Slot 2: Center Floating Polaroid
      { id: 2, x: 400, y: 500, width: 420, height: 480, rotation: -0.04, borderRadius: 2, frameStyle: 'polaroid' },
      // Slot 3: Top-Right Polaroid
      { id: 3, x: 620, y: 120, width: 380, height: 430, rotation: 0.05, borderRadius: 2, frameStyle: 'polaroid' },
      // Slot 4: Lower-Right Polaroid
      { id: 4, x: 660, y: 840, width: 360, height: 420, rotation: -0.03, borderRadius: 2, frameStyle: 'polaroid' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawDenimOceanWaves(ctx, width, height);

      // Classic 4-frame vertical photostrip collage graphic on the left
      ctx.save();
      ctx.fillStyle = '#FAF8F5';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 16;
      ctx.fillRect(40, 90, 260, 1080);
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#1E293B';
      for (let s = 0; s < 4; s++) {
        ctx.fillRect(60, 120 + s * 260, 220, 220);
      }
      ctx.restore();
    },
    renderForeground(ctx, canvas) {
      // 1. Realistic Silver Nikon Digicam Body framing Slot 1
      drawSilverNikonDigicam(ctx, 20, 1220, 780, 560, 75, 1300, 560, 400);

      // 2. Floating Watercolor Jellyfish at top
      drawWatercolorJellyfish(ctx, 360, 40, 1.35);

      // 3. Snoopy wearing DJ headphones holding vinyl record
      drawSnoopyVinylRecord(ctx, 330, 960, 1.4);

      // 4. Denim metallic stars
      ctx.save();
      ctx.font = '40px sans-serif';
      ctx.fillStyle = '#93C5FD';
      ctx.shadowColor = 'rgba(147, 197, 253, 0.6)';
      ctx.shadowBlur = 10;
      ctx.fillText('★', 880, 340);
      ctx.fillText('★', 790, 410);
      ctx.restore();
    },
  },

  // Dedicated 1-Photo Hero Variant for Denim Digicam:
  {
    id: 'denim-ocean-digicam-1',
    family: 'denim-ocean-digicam',
    name: 'Denim Digicam Solo Screen',
    variantLabel: '1 Hero Digicam',
    category: 'Vintage',
    description: 'Full-focus silver Nikon digicam LCD display on Japanese rolling wave ocean background',
    background: ['#263D5C', '#1B2E47'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 150, y: 720, width: 680, height: 500, borderRadius: 10, frameStyle: 'none' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawDenimOceanWaves(ctx, width, height);
    },
    renderForeground(ctx, canvas) {
      // Large Centered Nikon Digicam framing Slot 1
      drawSilverNikonDigicam(ctx, 70, 620, 940, 700, 150, 720, 680, 500);

      // Floating Watercolor Jellyfish
      drawWatercolorJellyfish(ctx, 420, 60, 1.6);

      // Snoopy at bottom
      drawSnoopyVinylRecord(ctx, 120, 1420, 1.5);
    },
  },

  // ==========================================
  // 6. SPIDER-GWEN PUNK STREET - 2 POSE DUO (Lampiran 3 Extended)
  // ==========================================
  {
    id: 'spider-gwen-punk-2',
    family: 'spider-gwen-punk',
    name: 'Spider-Gwen Duo Punk',
    variantLabel: '2-Cut Duo',
    category: 'Scrapbook',
    description: 'Tokyo street wheatpaste poster with 2 pink polaroid frames, web corners & Spider-Gwen',
    background: ['#18151D', '#BE185D'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [2],
    recommendedFor: 2,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 200, y: 320, width: 680, height: 580, borderRadius: 2, frameStyle: 'polaroid-pink' },
      { id: 2, x: 200, y: 1020, width: 680, height: 580, borderRadius: 2, frameStyle: 'polaroid-pink' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawSpiderGwenStreetPoster(ctx, width, height);
    },
    renderForeground(ctx, canvas) {
      // Spiderwebs in polaroid corners
      drawSpiderWebCorners(ctx, 200, 320, 140, 140, '#FFFFFF');
      drawSpiderWebCorners(ctx, 880, 320, -140, 140, '#FFFFFF');
      drawSpiderWebCorners(ctx, 200, 1020, 140, 140, '#FFFFFF');
      drawSpiderWebCorners(ctx, 880, 1020, -140, 140, '#FFFFFF');

      // Hanging spider
      drawHangingBlackSpider(ctx, 910, 540, 1.2);

      // Gwen foreground cutout in bottom left
      drawSpiderGwenForeground(ctx, 20, 1520, 1.6);

      // Street Barcode in bottom right
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(720, 1720, 280, 55);
      ctx.fillStyle = '#000000';
      for (let b = 730; b < 980; b += (b % 14 === 0 ? 8 : 4)) {
        ctx.fillRect(b, 1728, 2.5, 38);
      }
      ctx.font = 'bold 12px monospace';
      ctx.fillText('GWEN STACY // 65', 760, 1795);
      ctx.restore();
    },
  },

  // ==========================================
  // 7. SPIDER-GWEN PUNK STREET - 4 CUT STRIP (Lampiran 3 Extended)
  // ==========================================
  {
    id: 'spider-gwen-punk-4',
    family: 'spider-gwen-punk',
    name: 'Spider-Gwen 4-Cut Strip',
    variantLabel: '4-Cut Strip',
    category: 'Scrapbook',
    description: 'Tokyo street style classic 4-cut photostrip with hot pink neon glow, web corners & street graffiti',
    background: ['#18151D', '#BE185D'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 90, y: 140, width: 620, height: 370, borderRadius: 3, frameStyle: 'polaroid-pink' },
      { id: 2, x: 90, y: 560, width: 620, height: 370, borderRadius: 3, frameStyle: 'polaroid-pink' },
      { id: 3, x: 90, y: 980, width: 620, height: 370, borderRadius: 3, frameStyle: 'polaroid-pink' },
      { id: 4, x: 90, y: 1400, width: 620, height: 370, borderRadius: 3, frameStyle: 'polaroid-pink' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawSpiderGwenStreetPoster(ctx, width, height);

      // Neon magenta back-glow behind photo strip
      ctx.save();
      ctx.shadowColor = '#F43F5E';
      ctx.shadowBlur = 30;
      ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
      ctx.fillRect(70, 120, 660, 1670);
      ctx.restore();
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      // Web corners on slot 1 and slot 4
      drawSpiderWebCorners(ctx, 90, 140, 120, 120, '#FFFFFF');
      drawSpiderWebCorners(ctx, 710, 140, -120, 120, '#FFFFFF');
      drawSpiderWebCorners(ctx, 90, 1400, 120, 120, '#FFFFFF');
      drawSpiderWebCorners(ctx, 710, 1400, -120, 120, '#FFFFFF');

      // Little dangling spider
      drawHangingBlackSpider(ctx, 720, 480, 1.1);

      // Bottom typography & barcode
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(width / 2 - 140, 1850, 280, 50);
      ctx.fillStyle = '#000000';
      for (let b = width / 2 - 130; b < width / 2 + 130; b += (b % 14 === 0 ? 8 : 4)) {
        ctx.fillRect(b, 1858, 2.5, 34);
      }
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GWEN STACY // 電脳都市 // CISSPIC', width / 2, 1930);
      ctx.restore();
    },
  },

  // ==========================================
  // 8. SPIDER-GWEN PUNK STREET - 6 GRID STORY
  // ==========================================
  {
    id: 'spider-gwen-punk-6',
    family: 'spider-gwen-punk',
    name: 'Spider-Gwen 6-Grid Story',
    variantLabel: '6-Cut Grid',
    category: 'Scrapbook',
    description: '2x3 grid street punk photobooth with hot pink graffiti, neon aura & Gwen mask',
    background: ['#18151D', '#BE185D'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [6],
    recommendedFor: 6,
    canvas: { width: 1200, height: 1800 },
    photoSlots: [
      { id: 1, x: 70, y: 150, width: 500, height: 420, borderRadius: 3, frameStyle: 'polaroid-pink' },
      { id: 2, x: 630, y: 150, width: 500, height: 420, borderRadius: 3, frameStyle: 'polaroid-pink' },
      { id: 3, x: 70, y: 640, width: 500, height: 420, borderRadius: 3, frameStyle: 'polaroid-pink' },
      { id: 4, x: 630, y: 640, width: 500, height: 420, borderRadius: 3, frameStyle: 'polaroid-pink' },
      { id: 5, x: 70, y: 1130, width: 500, height: 420, borderRadius: 3, frameStyle: 'polaroid-pink' },
      { id: 6, x: 630, y: 1130, width: 500, height: 420, borderRadius: 3, frameStyle: 'polaroid-pink' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawSpiderGwenStreetPoster(ctx, width, height);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      drawSpiderWebCorners(ctx, 70, 150, 110, 110, '#FFFFFF');
      drawSpiderWebCorners(ctx, 1130, 150, -110, 110, '#FFFFFF');
      drawHangingBlackSpider(ctx, 580, 240, 1.2);

      // Gwen cutout in bottom center
      drawSpiderGwenForeground(ctx, width / 2 - 100, 1560, 1.2);
    },
  },

  // ==========================================
  // 9. SPECTACULAR SPIDER COMIC - 2 POSE DUO (Lampiran 4 Extended)
  // ==========================================
  {
    id: 'vintage-spider-comic-2',
    family: 'vintage-spider-comic',
    name: 'Spectacular Comic Duo',
    variantLabel: '2-Cut Duo',
    category: 'Vintage',
    description: 'Torn comic magazine page, dark maroon polaroids, comic lightning & 3D title',
    background: ['#F1ECE1', '#831818'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [2],
    recommendedFor: 2,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 200, y: 400, width: 680, height: 560, borderRadius: 2, frameStyle: 'polaroid-maroon' },
      { id: 2, x: 200, y: 1060, width: 680, height: 560, borderRadius: 2, frameStyle: 'polaroid-maroon' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawSpectacularComicCollage(ctx, width, height);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      drawComicLightningSparks(ctx, 90, 960, 1.3);
      drawComicLightningSparks(ctx, 920, 960, 1.3);
      drawSpiderManTitleBadge(ctx, width / 2, 1720, 1.35);
    },
  },

  // ==========================================
  // 10. SPECTACULAR SPIDER COMIC - 4 CUT STRIP (Lampiran 4 Extended)
  // ==========================================
  {
    id: 'vintage-spider-comic-4',
    family: 'vintage-spider-comic',
    name: 'Spectacular Comic 4-Cut',
    variantLabel: '4-Cut Strip',
    category: 'Vintage',
    description: '4-cut comic strip on crumpled red & navy comic book page with lightning & title',
    background: ['#F1ECE1', '#831818'],
    textColor: '#FFFFFF',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 90, y: 150, width: 620, height: 360, borderRadius: 2, frameStyle: 'polaroid-maroon' },
      { id: 2, x: 90, y: 550, width: 620, height: 360, borderRadius: 2, frameStyle: 'polaroid-maroon' },
      { id: 3, x: 90, y: 950, width: 620, height: 360, borderRadius: 2, frameStyle: 'polaroid-maroon' },
      { id: 4, x: 90, y: 1350, width: 620, height: 360, borderRadius: 2, frameStyle: 'polaroid-maroon' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawSpectacularComicCollage(ctx, width, height);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      drawComicLightningSparks(ctx, 40, 1750, 1.2);
      drawSpiderManTitleBadge(ctx, width / 2, 1830, 1.2);
    },
  },

  // ==========================================
  // 11. COQUETTE BALLETCORE & SILK PEARLS - 1 HERO (Cewe Favorite)
  // ==========================================
  {
    id: 'coquette-pearl-1',
    family: 'coquette-pearl',
    name: 'Coquette Ribbon & Pearls',
    variantLabel: '1 Hero Shot',
    category: 'Cute',
    description: 'Blush pink satin, pearl border frame, delicate silk bows & vintage rose romance',
    background: ['#FFF5F8', '#FDE8EE'],
    textColor: '#831843',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 160, y: 440, width: 760, height: 860, borderRadius: 6, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawCoquetteBackground(ctx, width, height);

      // Pearl border around the photo slot
      drawPearlBorder(ctx, 150, 430, 780, 880, 6);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      // Satin bows on top corners and center
      drawSatinBow(ctx, width / 2, 420, 52, '#F472B6');
      drawSatinBow(ctx, 160, 1310, 42, '#FB7185');
      drawSatinBow(ctx, 920, 1310, 42, '#FB7185');

      // Delicate French cursive text
      ctx.save();
      ctx.font = 'italic 38px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#9D174D';
      ctx.textAlign = 'center';
      ctx.fillText('mon chéri  •  toujours avec toi', width / 2, 1460);
      ctx.font = '300 20px "DM Sans", sans-serif';
      ctx.fillStyle = '#BE185D';
      ctx.fillText('L’AMOUR ÉTERNEL ♡ CISSPIC KEEPSAKE', width / 2, 1510);
      ctx.restore();
    },
  },

  // ==========================================
  // 12. COQUETTE BALLETCORE & SILK PEARLS - 2 POSE DUO
  // ==========================================
  {
    id: 'coquette-pearl-2',
    family: 'coquette-pearl',
    name: 'Coquette Ribbon Duo',
    variantLabel: '2-Cut Duo',
    category: 'Cute',
    description: '2 romantic portraits framed with shimmering pearls and pink satin ribbon bows',
    background: ['#FFF5F8', '#FDE8EE'],
    textColor: '#831843',
    supportedPhotoCounts: [2],
    recommendedFor: 2,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 180, y: 280, width: 720, height: 600, borderRadius: 6, frameStyle: 'white-thin' },
      { id: 2, x: 180, y: 1020, width: 720, height: 600, borderRadius: 6, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawCoquetteBackground(ctx, width, height);
      drawPearlBorder(ctx, 170, 270, 740, 620, 5.5);
      drawPearlBorder(ctx, 170, 1010, 740, 620, 5.5);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      drawSatinBow(ctx, width / 2, 265, 46, '#F472B6');
      drawSatinBow(ctx, width / 2, 1005, 46, '#F472B6');

      ctx.save();
      ctx.font = 'italic 34px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#9D174D';
      ctx.textAlign = 'center';
      ctx.fillText('sweet moments  •  mon amour ♡', width / 2, 1760);
      ctx.restore();
    },
  },

  // ==========================================
  // 13. COQUETTE BALLETCORE & SILK PEARLS - 4 CUT STRIP
  // ==========================================
  {
    id: 'coquette-pearl-4',
    family: 'coquette-pearl',
    name: 'Coquette Balletcore 4-Cut',
    variantLabel: '4-Cut Strip',
    category: 'Cute',
    description: 'Classic 4-cut photostrip with silk satin bows, pearl borders, and vintage lace',
    background: ['#FFF5F8', '#FDE8EE'],
    textColor: '#831843',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 90, y: 150, width: 620, height: 360, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 2, x: 90, y: 550, width: 620, height: 360, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 3, x: 90, y: 950, width: 620, height: 360, borderRadius: 4, frameStyle: 'white-thin' },
      { id: 4, x: 90, y: 1350, width: 620, height: 360, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawCoquetteBackground(ctx, width, height);

      // Pearl borders around all 4 slots
      for (let i = 0; i < 4; i++) {
        drawPearlBorder(ctx, 82, 142 + i * 400, 636, 376, 4.5);
      }
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      // Bows at slot tops
      drawSatinBow(ctx, width / 2, 138, 42, '#F472B6');
      drawSatinBow(ctx, width / 2, 538, 42, '#F472B6');
      drawSatinBow(ctx, width / 2, 938, 42, '#F472B6');
      drawSatinBow(ctx, width / 2, 1338, 42, '#F472B6');

      // Delicate signature footer
      ctx.save();
      ctx.font = 'italic 30px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#9D174D';
      ctx.textAlign = 'center';
      ctx.fillText('chérie  •  little love notes ♡', width / 2, 1840);
      ctx.font = '300 16px "DM Sans", sans-serif';
      ctx.fillStyle = '#BE185D';
      ctx.fillText('CISSPIC BALLETCORE STUDIO', width / 2, 1885);
      ctx.restore();
    },
  },

  // ==========================================
  // 14. MIDNIGHT KUROMI GOTH-KAWAII - 1 HERO
  // ==========================================
  {
    id: 'midnight-kuromi-1',
    family: 'midnight-kuromi',
    name: 'Midnight Kuromi Goth',
    variantLabel: '1 Hero Shot',
    category: 'Y2K',
    description: 'Dark purple & black lolita goth, bat wings on frame, cute skull with pink bow',
    background: ['#160924', '#0B0512'],
    textColor: '#E9D5FF',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 190, y: 480, width: 700, height: 780, borderRadius: 4, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawMidnightGothBackground(ctx, width, height);

      // Neon purple glow behind photo slot
      ctx.save();
      ctx.shadowColor = '#C084FC';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#2E1065';
      ctx.fillRect(170, 460, 740, 820);
      ctx.restore();
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      // Bat wings sprouting from top corners
      drawBatWingsOnFrame(ctx, width / 2, 480, 700, 780);

      // Cute skull with bow in bottom center
      drawCuteSkullBow(ctx, width / 2, 1420, 1.3);

      ctx.save();
      ctx.font = '900 32px "Impact", sans-serif';
      ctx.fillStyle = '#F3E8FF';
      ctx.textAlign = 'center';
      ctx.fillText('BABY GOTH ♡ 100% UNHOLY CUTE', width / 2, 1560);
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillStyle = '#C084FC';
      ctx.fillText('CISSPIC // DARK AESTHETIC', width / 2, 1610);
      ctx.restore();
    },
  },

  // ==========================================
  // 15. MIDNIGHT KUROMI GOTH-KAWAII - 4 CUT STRIP
  // ==========================================
  {
    id: 'midnight-kuromi-4',
    family: 'midnight-kuromi',
    name: 'Midnight Kuromi 4-Cut',
    variantLabel: '4-Cut Strip',
    category: 'Y2K',
    description: 'Dark purple 4-cut photostrip with neon purple glow, bat wings, and cute skull decals',
    background: ['#160924', '#0B0512'],
    textColor: '#E9D5FF',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 90, y: 150, width: 620, height: 360, borderRadius: 3, frameStyle: 'white-thin' },
      { id: 2, x: 90, y: 550, width: 620, height: 360, borderRadius: 3, frameStyle: 'white-thin' },
      { id: 3, x: 90, y: 950, width: 620, height: 360, borderRadius: 3, frameStyle: 'white-thin' },
      { id: 4, x: 90, y: 1350, width: 620, height: 360, borderRadius: 3, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawMidnightGothBackground(ctx, width, height);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      drawBatWingsOnFrame(ctx, width / 2, 150, 620, 360);
      drawCuteSkullBow(ctx, width / 2, 1810, 1.1);

      ctx.save();
      ctx.font = '900 24px "Impact", sans-serif';
      ctx.fillStyle = '#F3E8FF';
      ctx.textAlign = 'center';
      ctx.fillText('KUROMI MOOD // 真夜中', width / 2, 1910);
      ctx.restore();
    },
  },

  // ==========================================
  // 16. 90s VINTAGE SHOUJO MANGA ROMANCE - 1 HERO
  // ==========================================
  {
    id: 'shoujo-manga-1',
    family: 'shoujo-manga',
    name: '90s Shoujo Romance',
    variantLabel: '1 Hero Shot',
    category: 'Vintage',
    description: 'Authentic 90s shoujo anime manga page with screentone dots, speedlines & dialogue bubble',
    background: ['#FBF8F2', '#F5EFE6'],
    textColor: '#1E1B2E',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 150, y: 380, width: 780, height: 900, borderRadius: 2, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawShoujoMangaBackground(ctx, width, height);
    },
    renderForeground(ctx, canvas) {
      // Manga speech bubble
      drawMangaDialogueBubble(ctx, 760, 1340, '大好き！♡');

      ctx.save();
      ctx.font = 'italic 28px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#1E1B2E';
      ctx.fillText('CHAPTER 04: THE SPARKS OF YOUTH', 150, 1420);
      ctx.font = '16px "Courier New", monospace';
      ctx.fillStyle = '#71717A';
      ctx.fillText('P. 128  •  CISSPIC SHOUJO MEMOIR', 150, 1460);
      ctx.restore();
    },
  },

  // ==========================================
  // 17. 90s VINTAGE SHOUJO MANGA ROMANCE - 4 CUT
  // ==========================================
  {
    id: 'shoujo-manga-4',
    family: 'shoujo-manga',
    name: 'Shoujo Manga 4-Koma',
    variantLabel: '4-Cut Strip',
    category: 'Vintage',
    description: 'Classic 4-koma Japanese manga strip with screentone dots, speedlines & manga dialogue bubble',
    background: ['#FBF8F2', '#F5EFE6'],
    textColor: '#1E1B2E',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 90, y: 150, width: 620, height: 360, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 2, x: 90, y: 550, width: 620, height: 360, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 3, x: 90, y: 950, width: 620, height: 360, borderRadius: 2, frameStyle: 'white-thin' },
      { id: 4, x: 90, y: 1350, width: 620, height: 360, borderRadius: 2, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawShoujoMangaBackground(ctx, width, height);
    },
    renderForeground(ctx, canvas) {
      drawMangaDialogueBubble(ctx, 640, 1760, 'ドキドキ ♡');
    },
  },

  // ==========================================
  // 18. Y2K CYBER ANGEL - 1 HERO
  // ==========================================
  {
    id: 'cyber-angel-1',
    family: 'cyber-angel',
    name: 'Y2K Cyber Angel',
    variantLabel: '1 Hero Shot',
    category: 'Y2K',
    description: 'Futuristic metallic silver, digital camera HUD, chrome tribal stars & cyber lilac glow',
    background: ['#E4E7F2', '#C8CEE6'],
    textColor: '#3B0764',
    supportedPhotoCounts: [1],
    recommendedFor: 1,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 170, y: 440, width: 740, height: 860, borderRadius: 8, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      drawCyberAngelBackground(ctx, width, height);
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      ctx.save();
      ctx.font = '900 36px "Impact", sans-serif';
      ctx.fillStyle = '#4C1D95';
      ctx.textAlign = 'center';
      ctx.fillText('✧ CYBER ANGEL 2004 ✧', width / 2, 1420);
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#6D28D9';
      ctx.fillText('DIGITAL KEEPSAKE • OPTICAL DRIVE', width / 2, 1465);
      ctx.restore();
    },
  },

  // ==========================================
  // 19. MEOW CAT CAFE & KITTY EARS - 2 POSE DUO
  // ==========================================
  {
    id: 'meow-cafe-2',
    family: 'meow-cafe',
    name: 'Meow Cafe Kitty Duo',
    variantLabel: '2-Cut Duo',
    category: 'Cute',
    description: 'Fluffy cat ears on top of polaroids, cute paws, strawberry gingham & doodle fish stamps',
    background: ['#FFF8F0', '#FDE8E8'],
    textColor: '#9A3412',
    supportedPhotoCounts: [2],
    recommendedFor: 2,
    canvas: { width: 1080, height: 1920 },
    photoSlots: [
      { id: 1, x: 200, y: 320, width: 680, height: 580, borderRadius: 8, frameStyle: 'white-thin' },
      { id: 2, x: 200, y: 1040, width: 680, height: 580, borderRadius: 8, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#FFF8F0';
      ctx.fillRect(0, 0, width, height);

      // Gingham check pattern
      ctx.fillStyle = 'rgba(254, 205, 211, 0.35)';
      for (let y = 0; y < height; y += 40) {
        ctx.fillRect(0, y, width, 20);
      }
      for (let x = 0; x < width; x += 40) {
        ctx.fillRect(x, 0, 20, height);
      }
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      // Cat ears on top of slots
      drawCatEarsOnFrame(ctx, width / 2, 320, 680, 580);
      drawCatEarsOnFrame(ctx, width / 2, 1040, 680, 580);

      ctx.save();
      ctx.font = '900 36px "DM Sans", sans-serif';
      ctx.fillStyle = '#EA580C';
      ctx.textAlign = 'center';
      ctx.fillText('NYAN NYAN! 🐾 MEOW CAFE', width / 2, 1750);
      ctx.restore();
    },
  },

  // ==========================================
  // 20. MEOW CAT CAFE & KITTY EARS - 4 CUT STRIP
  // ==========================================
  {
    id: 'meow-cafe-4',
    family: 'meow-cafe',
    name: 'Meow Cafe 4-Cut Strip',
    variantLabel: '4-Cut Strip',
    category: 'Cute',
    description: 'Cat ears on every photo slot, cute paw prints, strawberry gingham & doodle hearts',
    background: ['#FFF8F0', '#FDE8E8'],
    textColor: '#9A3412',
    supportedPhotoCounts: [4],
    recommendedFor: 4,
    canvas: { width: 800, height: 2000 },
    photoSlots: [
      { id: 1, x: 90, y: 150, width: 620, height: 360, borderRadius: 6, frameStyle: 'white-thin' },
      { id: 2, x: 90, y: 550, width: 620, height: 360, borderRadius: 6, frameStyle: 'white-thin' },
      { id: 3, x: 90, y: 950, width: 620, height: 360, borderRadius: 6, frameStyle: 'white-thin' },
      { id: 4, x: 90, y: 1350, width: 620, height: 360, borderRadius: 6, frameStyle: 'white-thin' },
    ],
    renderBackground(ctx, canvas) {
      const { width, height } = canvas;
      ctx.fillStyle = '#FFF8F0';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(254, 205, 211, 0.35)';
      for (let y = 0; y < height; y += 36) { ctx.fillRect(0, y, width, 18); }
      for (let x = 0; x < width; x += 36) { ctx.fillRect(x, 0, 18, height); }
    },
    renderForeground(ctx, canvas) {
      const { width } = canvas;
      drawCatEarsOnFrame(ctx, width / 2, 150, 620, 360);
      drawCatEarsOnFrame(ctx, width / 2, 550, 620, 360);
      drawCatEarsOnFrame(ctx, width / 2, 950, 620, 360);
      drawCatEarsOnFrame(ctx, width / 2, 1350, 620, 360);

      ctx.save();
      ctx.font = '900 28px "DM Sans", sans-serif';
      ctx.fillStyle = '#EA580C';
      ctx.textAlign = 'center';
      ctx.fillText('PURR PURR! 🐾 CAT CAFE', width / 2, 1820);
      ctx.font = '16px monospace';
      ctx.fillStyle = '#C2410C';
      ctx.fillText('CISSPIC SWEET PETS BOOTH', width / 2, 1865);
      ctx.restore();
    },
  },
];
