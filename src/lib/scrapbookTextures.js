/**
 * Procedural tactile artwork & illustration generators for CissPic Scrapbook & Comic Frames.
 * Inspired directly by real tactile references: Spider-Verse Comic Scrapbook, Spider-Gwen Street Punk,
 * Spectacular Vintage Comic, Kraft Gingham Picnic, and Denim Ocean Wave & Digicam.
 */
import { drawChromeStar } from './canvasTextures.js';

/**
 * 1. Spider Comic Scrapbook Background (Grayscale action panels + crumpled red corner)
 */
export function drawSpiderComicBackground(ctx, width, height) {
  ctx.save();
  // Base yellowed newsprint
  ctx.fillStyle = '#EBE7DF';
  ctx.fillRect(0, 0, width, height);

  // Halftone dot pattern in background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  for (let y = 0; y < height; y += 14) {
    for (let x = 0; x < width; x += 14) {
      ctx.beginPath();
      ctx.arc(x + (y % 28 === 0 ? 7 : 0), y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw comic panels layout
  ctx.strokeStyle = '#1E1E24';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#F5F2EB';

  // Top header panel
  ctx.strokeRect(30, 30, width - 60, 160);
  ctx.save();
  ctx.clip();
  ctx.font = '900 24px Impact, sans-serif';
  ctx.fillStyle = '#222';
  ctx.fillText('AMERICA! WHY MUST THIS HAPPEN NOW...?', 50, 75);
  ctx.font = 'italic 16px "Courier New", monospace';
  ctx.fillText('MEANWHILE, ACROSS TOWN AT THE DAILY BUGLE...', 50, 110);
  ctx.fillText('PETER PARKER READIES HIS TRUSTY CAMERA!', 50, 135);
  ctx.restore();

  // Left comic strip panel
  ctx.strokeRect(30, 210, 240, 480);
  ctx.save();
  ctx.beginPath();
  ctx.rect(30, 210, 240, 480);
  ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = -100; i < 600; i += 12) {
    ctx.beginPath();
    ctx.moveTo(30, 210 + i);
    ctx.lineTo(270, 210 + i + 100);
    ctx.stroke();
  }
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#111';
  ctx.fillText('HE IS FREE!', 45, 260);
  ctx.fillText('THWIP!', 45, 300);
  ctx.restore();

  // Center bottom panel
  ctx.strokeRect(30, 710, 500, 380);
  ctx.save();
  ctx.beginPath();
  ctx.rect(30, 710, 500, 380);
  ctx.clip();
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#333';
  ctx.fillText('OH NO! HE\'S REACHING FOR THE CONTROLS!', 50, 750);
  ctx.font = 'italic 14px "Courier New", monospace';
  ctx.fillText('“JUST HOLD ON! SPIDER-SENSE IS TINGLING!”', 50, 780);
  ctx.restore();

  // Right middle panel
  ctx.strokeRect(width - 280, 710, 250, 380);
  ctx.save();
  ctx.beginPath();
  ctx.rect(width - 280, 710, 250, 380);
  ctx.clip();
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#222';
  ctx.fillText('EVEN WITHOUT HIS', width - 260, 750);
  ctx.fillText('GLASSES, HE CAN', width - 260, 775);
  ctx.fillText('KEEP THEM AT BAY!', width - 260, 800);
  ctx.restore();

  // Diagonal torn crimson paper in bottom right corner
  ctx.beginPath();
  ctx.moveTo(width - 480, height);
  ctx.lineTo(width, height - 520);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = '#6B141C';
  ctx.fill();

  // Creases & shadow on red paper
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width - 480, height);
  ctx.lineTo(width, height - 520);
  ctx.stroke();

  // Top-left spider web corner
  drawSpiderWebCorners(ctx, 0, 0, 220, 220, '#C92A2A');

  ctx.restore();
}

/**
 * Draw decorative Spider-Web in corners
 */
export function drawSpiderWebCorners(ctx, x, y, w, h, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.85;

  const spokes = 6;
  for (let i = 0; i <= spokes; i++) {
    const angle = (Math.PI / 2) * (i / spokes);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * w, y + Math.sin(angle) * h);
    ctx.stroke();
  }

  // Concentric web arcs
  for (let r = 0.25; r <= 1.0; r += 0.25) {
    ctx.beginPath();
    for (let i = 0; i <= spokes; i++) {
      const angle = (Math.PI / 2) * (i / spokes);
      const px = x + Math.cos(angle) * w * r;
      const py = y + Math.sin(angle) * h * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Spider-Man holding retro SLR camera pointed at the viewer (Image 1 Bottom Right)
 */
export function drawSpiderManHoldingCamera(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Soft drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 8;

  // 1. Spider-Man Head & Shoulder Base
  ctx.fillStyle = '#BA2323';
  ctx.beginPath();
  ctx.arc(80, 80, 95, 0, Math.PI * 2);
  ctx.fill();

  // Head web lines
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#220808';
  ctx.lineWidth = 3;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(80, 80);
    ctx.lineTo(80 + Math.cos(a) * 95, 80 + Math.sin(a) * 95);
    ctx.stroke();
  }
  for (let r = 30; r < 95; r += 24) {
    ctx.beginPath();
    ctx.arc(80, 80, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Mask Eye (Left visible eye)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(25, 45);
  ctx.quadraticCurveTo(60, 20, 85, 55);
  ctx.quadraticCurveTo(55, 85, 25, 45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. Vintage SLR Camera in Spidey's Hands
  ctx.fillStyle = '#1A1C1E'; // Dark textured body
  ctx.strokeStyle = '#E2E8F0'; // Metallic silver accents
  ctx.lineWidth = 4;

  // Camera Body
  ctx.beginPath();
  ctx.roundRect(-40, 110, 220, 130, 14);
  ctx.fill();
  ctx.stroke();

  // Top camera prism & dial
  ctx.fillStyle = '#C4C9CE';
  ctx.beginPath();
  ctx.moveTo(35, 110);
  ctx.lineTo(55, 75);
  ctx.lineTo(115, 75);
  ctx.lineTo(135, 110);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shutter button & flash mount
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, 104, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Large Lens facing viewer
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(70, 175, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Inner lens glass ring & blue-cyan reflection
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(70, 175, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(65, 170, 22, -Math.PI / 4, Math.PI / 2);
  ctx.stroke();

  // Lens glass glare highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(62, 162, 7, 0, Math.PI * 2);
  ctx.fill();

  // 3. Spider-Man Hands Gripping the Camera
  ctx.fillStyle = '#BA2323';
  ctx.strokeStyle = '#220808';
  ctx.lineWidth = 3;

  // Left hand fingers on left side
  ctx.beginPath();
  ctx.roundRect(-65, 130, 32, 22, 10);
  ctx.roundRect(-65, 155, 32, 22, 10);
  ctx.roundRect(-65, 180, 32, 22, 10);
  ctx.fill();
  ctx.stroke();

  // Right hand fingers on top/right
  ctx.beginPath();
  ctx.roundRect(170, 130, 32, 22, 10);
  ctx.roundRect(170, 155, 32, 22, 10);
  ctx.roundRect(170, 180, 32, 22, 10);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Hanging Spider-Man upside down (Image 1 Top Right)
 */
export function drawHangingSpiderMan(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Web strand from ceiling
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -120);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // Spidey upside down body
  ctx.fillStyle = '#C02626';
  ctx.beginPath();
  ctx.arc(0, 35, 30, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-10, 38, 9, 6, Math.PI / 6, 0, Math.PI * 2);
  ctx.ellipse(10, 38, 9, 6, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Legs tucked in web pose
  ctx.strokeStyle = '#1E3A8A';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-18, 12);
  ctx.lineTo(-40, -15);
  ctx.lineTo(0, -2);
  ctx.moveTo(18, 12);
  ctx.lineTo(40, -15);
  ctx.lineTo(0, -2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Spider-Gwen Street Punk Poster Background (Image 2)
 */
export function drawSpiderGwenStreetPoster(ctx, width, height) {
  ctx.save();
  // Base dark Tokyo/NYC street poster wall
  ctx.fillStyle = '#18151D';
  ctx.fillRect(0, 0, width, height);

  // Hot pink spray graffiti patches
  const pinkGrad = ctx.createRadialGradient(width * 0.7, height * 0.35, 50, width * 0.7, height * 0.35, 450);
  pinkGrad.addColorStop(0, '#E11D48');
  pinkGrad.addColorStop(0.5, '#BE185D');
  pinkGrad.addColorStop(1, 'rgba(24, 21, 29, 0)');
  ctx.fillStyle = pinkGrad;
  ctx.fillRect(0, 0, width, height);

  // Cyan electric contrast
  const cyanGrad = ctx.createRadialGradient(width * 0.2, height * 0.75, 40, width * 0.2, height * 0.75, 350);
  cyanGrad.addColorStop(0, '#0284C7');
  cyanGrad.addColorStop(1, 'rgba(24, 21, 29, 0)');
  ctx.fillStyle = cyanGrad;
  ctx.fillRect(0, 0, width, height);

  // Halftone newsprint ripped layers
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let y = 0; y < height; y += 16) {
    for (let x = 0; x < width; x += 16) {
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Japanese typography & street stickers
  ctx.font = '900 70px "Impact", "Arial Black", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.fillText('GWEN STACY // 65', 50, 180);
  ctx.font = '900 110px "Hiragino Kaku Gothic Pro", "Yu Gothic", sans-serif';
  ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
  ctx.fillText('電脳都市', 60, 320);

  // Top Spider-Gwen Hooded Silhouette looking down
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(width / 2, 80, 110, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(width / 2, 85, 80, 0, Math.PI);
  ctx.fill();
  // Pink hood webbing
  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let a = 0; a <= Math.PI; a += Math.PI / 6) {
    ctx.moveTo(width / 2, 85);
    ctx.lineTo(width / 2 + Math.cos(a) * 80, 85 + Math.sin(a) * 80);
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * Spider-Gwen Foreground Web-Shooter Pose (Image 2 Bottom Left)
 */
export function drawSpiderGwenForeground(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 20;

  // White Hood Outline
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(30, 20);
  ctx.quadraticCurveTo(120, -60, 220, 20);
  ctx.quadraticCurveTo(270, 150, 230, 260);
  ctx.lineTo(20, 260);
  ctx.closePath();
  ctx.fill();

  // Inner hood cyan & pink web lining
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.moveTo(60, 45);
  ctx.quadraticCurveTo(120, -10, 190, 45);
  ctx.quadraticCurveTo(220, 130, 180, 210);
  ctx.lineTo(70, 210);
  ctx.closePath();
  ctx.fill();

  // Pink Web lines inside hood
  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(70 + i * 25, 45);
    ctx.lineTo(120, 130);
    ctx.stroke();
  }

  // Gwen Mask Face
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(125, 140, 50, 68, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing Red/Cyan Eyes
  ctx.shadowColor = '#F43F5E';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E11D48';
  ctx.lineWidth = 5;

  // Left Eye
  ctx.beginPath();
  ctx.moveTo(85, 120);
  ctx.quadraticCurveTo(105, 95, 125, 125);
  ctx.quadraticCurveTo(105, 145, 85, 120);
  ctx.fill();
  ctx.stroke();

  // Right Eye
  ctx.beginPath();
  ctx.moveTo(135, 125);
  ctx.quadraticCurveTo(155, 95, 175, 120);
  ctx.quadraticCurveTo(155, 145, 135, 125);
  ctx.fill();
  ctx.stroke();

  // Web-shooter Hand reaching forward
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.roundRect(180, 180, 110, 45, 16);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Hanging Black Spider (Image 2 Right side of polaroid)
 */
export function drawHangingBlackSpider(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Thread
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -180);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // Spider Body
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(0, -18, 9, 0, Math.PI * 2);
  ctx.fill();

  // 8 Bent Legs
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  const legAngles = [-0.6, -0.2, 0.2, 0.6];
  for (const a of legAngles) {
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-10, -5 + a * 20);
    ctx.lineTo(-30, -15 + a * 25);
    ctx.lineTo(-45, a * 30);
    ctx.stroke();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(10, -5 + a * 20);
    ctx.lineTo(30, -15 + a * 25);
    ctx.lineTo(45, a * 30);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Spectacular Vintage Comic Collage Background (Image 3)
 */
export function drawSpectacularComicCollage(ctx, width, height) {
  ctx.save();
  // 1. Top left vintage comic magazine page
  ctx.fillStyle = '#F1ECE1';
  ctx.fillRect(0, 0, width, height);

  // Crumpled red paper strip (left/bottom)
  ctx.fillStyle = '#831818';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.4);
  ctx.lineTo(width * 0.45, height * 0.6);
  ctx.lineTo(width * 0.35, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Crumpled deep navy blue kraft paper (top right)
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.moveTo(width * 0.55, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, height * 0.55);
  ctx.lineTo(width * 0.6, height * 0.4);
  ctx.closePath();
  ctx.fill();

  // Comic Header box (Top Left)
  ctx.fillStyle = '#BA1A1A';
  ctx.fillRect(40, 40, width * 0.52, 100);
  ctx.font = '900 22px Impact, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('THE GREATEST EVENT', 55, 75);
  ctx.fillText('IN THE HISTORY OF COMIC MAGAZINES!', 55, 110);

  // Classic bottom right comic action panels
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(width * 0.35, height * 0.68, width * 0.6, height * 0.28);
  ctx.strokeRect(width * 0.35, height * 0.68, width * 0.6, height * 0.28);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#111';
  ctx.fillText('HOTSHOT ISN\'T SO HOT ANY MORE!', width * 0.38, height * 0.74);
  ctx.fillText('THANKS TO HOSTESS TWINKIES CAKES!', width * 0.38, height * 0.77);

  ctx.restore();
}

/**
 * 3D Yellow Comic SPIDER-MAN Title Badge (Image 3)
 */
export function drawSpiderManTitleBadge(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.font = '900 44px Impact, "Arial Black", sans-serif';
  ctx.textAlign = 'center';

  // 3D Extrusion Shadow (Red)
  ctx.fillStyle = '#991B1B';
  for (let off = 6; off >= 1; off--) {
    ctx.fillText('SPIDER-MAN', off, 40 + off);
  }

  // Black Outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeText('SPIDER-MAN', 0, 40);

  // Yellow Face
  ctx.fillStyle = '#FBBF24';
  ctx.fillText('SPIDER-MAN', 0, 40);

  ctx.restore();
}

/**
 * Comic Lightning / Spider-Sense sparks (Image 3)
 */
export function drawComicLightningSparks(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#2563EB'; // Blue outer spark
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'bevel';

  const drawBolt = () => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(25, -20);
    ctx.lineTo(15, -45);
    ctx.lineTo(45, -70);
    ctx.stroke();
  };

  drawBolt();

  // Inner Red spark
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 4;
  drawBolt();

  ctx.restore();
}

/**
 * Kraft Gingham Picnic Scrapbook Background (Image 4)
 */
export function drawKraftGinghamScrapbook(ctx, width, height) {
  ctx.save();
  // Warm natural kraft linen
  ctx.fillStyle = '#F5EFE6';
  ctx.fillRect(0, 0, width, height);

  // Red & White Gingham Checkered Cloth Patches (Top left & bottom right)
  const drawGinghamPatch = (px, py, pw, ph) => {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 4);
    ctx.clip();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(px, py, pw, ph);

    const checkSize = 22;
    for (let y = py; y < py + ph; y += checkSize) {
      for (let x = px; x < px + pw; x += checkSize) {
        const isDark = ((Math.floor((x - px) / checkSize) + Math.floor((y - py) / checkSize)) % 2 === 0);
        ctx.fillStyle = isDark ? '#DC2626' : '#FCA5A5';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }
    ctx.restore();
  };

  drawGinghamPatch(40, 100, 260, 220);
  drawGinghamPatch(width - 300, height - 360, 260, 240);

  // Vintage cursive letter manuscript paper scrap (Right side)
  ctx.fillStyle = '#FAF7F0';
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  ctx.save();
  ctx.translate(width - 240, 280);
  ctx.rotate(0.04);
  ctx.fillRect(0, 0, 220, 480);
  ctx.strokeRect(0, 0, 220, 480);

  // Manuscript text lines
  ctx.fillStyle = 'rgba(75, 85, 99, 0.4)';
  for (let l = 20; l < 460; l += 24) {
    ctx.fillRect(20, l, 180, 2);
  }
  ctx.restore();

  ctx.restore();
}

/**
 * Spidey Red Web-Shooter Hand Gesture (Image 4 Top Left)
 */
export function drawSpideyHandSign(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 12;

  // Hand Base (Red with Black Web pattern)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = '#1E1E24';
  ctx.lineWidth = 4;

  // Palm
  ctx.beginPath();
  ctx.roundRect(0, 40, 110, 90, 20);
  ctx.fill();
  ctx.stroke();

  // Thumb extended left
  ctx.beginPath();
  ctx.roundRect(-45, 50, 55, 30, 15);
  ctx.fill();
  ctx.stroke();

  // Index finger up
  ctx.beginPath();
  ctx.roundRect(0, -45, 28, 90, 14);
  ctx.fill();
  ctx.stroke();

  // Middle & Ring fingers curled down
  ctx.beginPath();
  ctx.roundRect(32, 25, 24, 45, 12);
  ctx.roundRect(58, 25, 24, 45, 12);
  ctx.fill();
  ctx.stroke();

  // Pinky finger up
  ctx.beginPath();
  ctx.roundRect(84, -40, 26, 85, 13);
  ctx.fill();
  ctx.stroke();

  // Web lines on hand
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#1E1E24';
  ctx.lineWidth = 2.5;
  for (let i = 10; i < 110; i += 25) {
    ctx.beginPath();
    ctx.moveTo(i, 40);
    ctx.lineTo(i, 130);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * "Favorite person" Kraft Paper Tape Sticker with red arrow
 */
export function drawFavoritePersonTape(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.rotate(-0.08);

  // Kraft tape banner
  ctx.fillStyle = '#E8DEC8';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(-10, -5, 240, 70, 6);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.font = 'italic 700 28px Georgia, "Times New Roman", serif';
  ctx.fillStyle = '#991B1B';
  ctx.fillText('Favorite', 10, 30);
  ctx.fillText('person', 25, 56);

  // Red hand-drawn curved arrow
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(135, 45);
  ctx.quadraticCurveTo(180, 50, 195, 75);
  ctx.stroke();
  // Arrow head
  ctx.beginPath();
  ctx.moveTo(185, 75);
  ctx.lineTo(195, 75);
  ctx.lineTo(195, 65);
  ctx.stroke();

  ctx.restore();
}

/**
 * Vintage ticket stub "48645235 · good things are coming" (Image 4)
 */
export function drawVintageTicketStub(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#FDFBF7';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(0, 0, 220, 100, 8);
  ctx.fill();
  ctx.stroke();

  // Red ticket number bar on left
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(0, 0, 42, 100);
  ctx.save();
  ctx.translate(26, 90);
  ctx.rotate(-Math.PI / 2);
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('48645235', 0, 0);
  ctx.restore();

  // Text
  ctx.font = '900 20px sans-serif';
  ctx.fillStyle = '#1E293B';
  ctx.fillText('good', 56, 40);
  ctx.fillText('things', 56, 62);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#E11D48';
  ctx.fillText('are coming', 56, 84);

  ctx.restore();
}

/**
 * Denim Ocean Waves & Digicam Background (Image 5)
 */
export function drawDenimOceanWaves(ctx, width, height) {
  ctx.save();
  // Deep denim blue paper
  ctx.fillStyle = '#263D5C';
  ctx.fillRect(0, 0, width, height);

  // Denim weave texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let y = 0; y < height; y += 8) {
    ctx.fillRect(0, y, width, 1.5);
  }

  // Japanese Rolling Great Waves at the bottom
  const drawWaveCrest = (baseY, color, frothColor) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, baseY);
    for (let x = 0; x <= width; x += 180) {
      ctx.bezierCurveTo(x + 60, baseY - 90, x + 120, baseY + 60, x + 180, baseY);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Seafoam Froth
    ctx.strokeStyle = frothColor;
    ctx.lineWidth = 5;
    ctx.stroke();
  };

  drawWaveCrest(height - 240, '#1B2E47', '#E2E8F0');
  drawWaveCrest(height - 180, '#28466E', '#FFFFFF');
  drawWaveCrest(height - 100, '#386399', '#FFFFFF');

  // Top ocean wave corner
  ctx.save();
  ctx.translate(width, 0);
  ctx.rotate(Math.PI);
  drawWaveCrest(height - 120, '#1B2E47', '#FFFFFF');
  ctx.restore();

  // Torn newspaper excerpts on sides
  ctx.fillStyle = '#F1ECE1';
  ctx.fillRect(width - 160, 520, 140, 320);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (let l = 540; l < 820; l += 14) {
    ctx.fillRect(width - 145, l, 110, 2);
  }

  ctx.restore();
}

/**
 * Watercolor Blue Jellyfish Floating (Image 5 Top)
 */
export function drawWatercolorJellyfish(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
  ctx.shadowBlur = 16;

  // Jellyfish Bell (Mushroom Cap)
  const bellGrad = ctx.createRadialGradient(80, 70, 10, 80, 70, 70);
  bellGrad.addColorStop(0, '#7DD3FC');
  bellGrad.addColorStop(0.7, '#0284C7');
  bellGrad.addColorStop(1, '#0369A1');

  ctx.fillStyle = bellGrad;
  ctx.beginPath();
  ctx.moveTo(10, 80);
  ctx.bezierCurveTo(20, -10, 140, -10, 150, 80);
  ctx.bezierCurveTo(120, 95, 40, 95, 10, 80);
  ctx.closePath();
  ctx.fill();

  // Flowing Tentacles
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';

  for (let i = 25; i <= 135; i += 22) {
    ctx.beginPath();
    ctx.moveTo(i, 85);
    ctx.bezierCurveTo(i - 20, 140, i + 25, 200, i - 10, 270);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Snoopy with DJ Headphones holding a vinyl record (Image 5)
 */
export function drawSnoopyVinylRecord(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;

  // Snoopy Head
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#1E1E24';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.roundRect(20, 20, 75, 55, 26);
  ctx.fill();
  ctx.stroke();

  // Nose
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(18, 48, 7, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.arc(45, 38, 4, 0, Math.PI * 2);
  ctx.fill();

  // Black Ear
  ctx.beginPath();
  ctx.roundRect(75, 35, 22, 45, 11);
  ctx.fill();

  // DJ Headphones
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(60, 30, 42, Math.PI, 0);
  ctx.stroke();
  // Ear cushion
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.roundRect(14, 25, 16, 32, 8);
  ctx.roundRect(88, 25, 16, 32, 8);
  ctx.fill();

  // Vinyl Record held in paws
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(58, 115, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Grooves & Center Label
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(58, 115, 32, 0, Math.PI * 2);
  ctx.arc(58, 115, 22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.arc(58, 115, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Realistic Silver Nikon Digicam Body with LCD Screen as Photo Slot (Image 5)
 */
export function drawSilverNikonDigicam(ctx, x, y, w, h, screenX, screenY, screenW, screenH) {
  ctx.save();

  // Camera Outer Body Beveled Metallic Gradient
  const bodyGrad = ctx.createLinearGradient(x, y, x, y + h);
  bodyGrad.addColorStop(0, '#FFFFFF');
  bodyGrad.addColorStop(0.15, '#E2E8F0');
  bodyGrad.addColorStop(0.85, '#CBD5E1');
  bodyGrad.addColorStop(1, '#94A3B8');

  // Drop shadow for camera
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 12;

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 28);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  // Inner beveled highlight line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 24);
  ctx.stroke();

  // Top Shutter Dial
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x + 120, y - 16, 90, 18, 6);
  ctx.fill();
  ctx.stroke();

  // Top Flash Bezel
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.roundRect(x + w - 180, y + 18, 60, 22, 6);
  ctx.fill();
  ctx.stroke();

  // Nikon Branding
  ctx.font = 'italic 900 24px "Arial Black", sans-serif';
  ctx.fillStyle = '#1E293B';
  ctx.fillText('Nikon', x + 160, y + h - 22);

  // Digicam Control Buttons (Right of screen)
  const btnX = x + w - 110;
  const centerY = y + h / 2 + 10;

  // Scene / Mode button
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.roundRect(btnX - 25, y + 80, 50, 26, 6);
  ctx.fill();
  ctx.stroke();
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'center';
  ctx.fillText('SCENE', btnX, y + 97);

  // Directional D-Pad (OK Button in center)
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.arc(btnX, centerY, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F1F5F9';
  ctx.beginPath();
  ctx.arc(btnX, centerY, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('OK', btnX, centerY + 5);

  // Flash icon, flower macro, timer icons on D-Pad
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('⚡', btnX, centerY - 25);
  ctx.fillText('🗑', btnX, y + h - 50);
  ctx.fillText('MENU', btnX - 35, y + h - 50);

  // Screen Inset Bevel Frame (Where photo renders)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(screenX - 8, screenY - 8, screenW + 16, screenH + 16, 12);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Coquette Balletcore Satin Ribbon Bow
 */
export function drawSatinBow(ctx, x, y, size = 36, color = '#F472B6') {
  ctx.save();
  ctx.translate(x, y);

  // Soft shadow
  ctx.shadowColor = 'rgba(219, 39, 119, 0.4)';
  ctx.shadowBlur = 10;

  // Left Loop
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(-size * 0.45, -size * 0.1, size * 0.45, size * 0.28, -Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();

  // Right Loop
  ctx.beginPath();
  ctx.ellipse(size * 0.45, -size * 0.1, size * 0.45, size * 0.28, Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();

  // Loop highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(-size * 0.45, -size * 0.15, size * 0.25, size * 0.1, -Math.PI / 8, 0, Math.PI * 2);
  ctx.ellipse(size * 0.45, -size * 0.15, size * 0.25, size * 0.1, Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();

  // Left Ribbon Tail
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, size * 0.1);
  ctx.quadraticCurveTo(-size * 0.35, size * 0.5, -size * 0.4, size * 0.9);
  ctx.lineTo(-size * 0.2, size * 0.85);
  ctx.quadraticCurveTo(-size * 0.1, size * 0.45, 0, size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Right Ribbon Tail
  ctx.beginPath();
  ctx.moveTo(size * 0.15, size * 0.1);
  ctx.quadraticCurveTo(size * 0.35, size * 0.5, size * 0.4, size * 0.9);
  ctx.lineTo(size * 0.2, size * 0.85);
  ctx.quadraticCurveTo(size * 0.1, size * 0.45, 0, size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Center Knot
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Knot pearl highlight
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-size * 0.05, -size * 0.05, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Pearl Border along a rectangle
 */
export function drawPearlBorder(ctx, x, y, w, h, radius = 4.5) {
  ctx.save();
  const spacing = radius * 2.6;
  const drawPearl = (px, py) => {
    // Pearl drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;
    // Pearl body
    ctx.fillStyle = '#FDFBF7';
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
    // Pearl iridescence sheen
    ctx.shadowColor = 'transparent';
    const grad = ctx.createRadialGradient(px - radius * 0.3, py - radius * 0.3, 1, px, py, radius);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.6, '#FEE2E2');
    grad.addColorStop(1, '#E2E8F0');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  // Top & Bottom edges
  for (let px = x; px <= x + w; px += spacing) {
    drawPearl(px, y);
    drawPearl(px, y + h);
  }
  // Left & Right edges
  for (let py = y + spacing; py < y + h; py += spacing) {
    drawPearl(x, py);
    drawPearl(x + w, py);
  }
  ctx.restore();
}

/**
 * Coquette Balletcore Dreamy Background
 */
export function drawCoquetteBackground(ctx, width, height) {
  ctx.save();
  // Soft blush cream silk gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#FFF5F8');
  grad.addColorStop(0.5, '#FDE8EE');
  grad.addColorStop(1, '#FFF0F5');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle vintage lace border pattern around canvas
  ctx.strokeStyle = 'rgba(244, 114, 182, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(30, 30, width - 60, height - 60);
  ctx.setLineDash([]);

  // Floating rose petals and soft glitter stars
  const stars = [
    { x: 70, y: 120, s: 20 },
    { x: width - 80, y: 180, s: 26 },
    { x: 90, y: height - 160, s: 24 },
    { x: width - 110, y: height - 220, s: 28 },
    { x: width / 2, y: 80, s: 18 },
  ];
  stars.forEach(({ x, y, s }) => {
    ctx.fillStyle = 'rgba(244, 114, 182, 0.5)';
    ctx.font = `${s}px sans-serif`;
    ctx.fillText('✧', x, y);
  });

  ctx.restore();
}

/**
 * Cute Kuromi / Midnight Goth Lolita Background
 */
export function drawMidnightGothBackground(ctx, width, height) {
  ctx.save();
  // Dark royal purple to jet black gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#160924');
  grad.addColorStop(0.6, '#0B0512');
  grad.addColorStop(1, '#1A0B2B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Neon Purple & Magenta radial glow
  const glow = ctx.createRadialGradient(width * 0.8, height * 0.4, 40, width * 0.8, height * 0.4, 500);
  glow.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
  glow.addColorStop(0.7, 'rgba(217, 70, 239, 0.15)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Gothic black lace dot matrix
  ctx.fillStyle = 'rgba(216, 180, 254, 0.08)';
  for (let y = 0; y < height; y += 18) {
    for (let x = 0; x < width; x += 18) {
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Stylish Gothic Japanese text
  ctx.font = '900 60px "Impact", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillText('MIDNIGHT // KUROMI MOOD', 50, 160);
  ctx.font = '900 90px "Hiragino Kaku Gothic Pro", "Yu Gothic", sans-serif';
  ctx.fillStyle = 'rgba(192, 132, 252, 0.22)';
  ctx.fillText('真夜中黒猫', 55, 280);

  ctx.restore();
}

/**
 * Cute Skull with Ribbon Bow (Kuromi aesthetic)
 */
export function drawCuteSkullBow(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 12;

  // White Skull Head
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fill();

  // Jaw
  ctx.beginPath();
  ctx.roundRect(-16, 18, 32, 18, 4);
  ctx.fill();

  // Heart-shaped eye sockets
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#180B26';
  ctx.beginPath();
  ctx.arc(-11, -2, 7, 0, Math.PI * 2);
  ctx.arc(11, -2, 7, 0, Math.PI * 2);
  ctx.fill();

  // Heart glint in eye
  ctx.fillStyle = '#F472B6';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('♥', -15, 2);
  ctx.fillText('♥', 7, 2);

  // Nose
  ctx.fillStyle = '#180B26';
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(-3, 16);
  ctx.lineTo(3, 16);
  ctx.closePath();
  ctx.fill();

  // Cute Hot Pink Bow on forehead
  drawSatinBow(ctx, 0, -28, 28, '#E11D48');

  ctx.restore();
}

/**
 * Bat Wings on top corners of a photo frame
 */
export function drawBatWingsOnFrame(ctx, cx, cy, w, h) {
  ctx.save();
  ctx.fillStyle = '#0F0618';
  ctx.strokeStyle = '#C084FC';
  ctx.lineWidth = 2.5;

  // Left Wing
  ctx.save();
  ctx.translate(cx - w / 2 - 10, cy - h / 2 + 30);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-60, -50, -110, -20);
  ctx.quadraticCurveTo(-90, 20, -50, 25);
  ctx.quadraticCurveTo(-30, 40, 0, 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right Wing
  ctx.save();
  ctx.translate(cx + w / 2 + 10, cy - h / 2 + 30);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(60, -50, 110, -20);
  ctx.quadraticCurveTo(90, 20, 50, 25);
  ctx.quadraticCurveTo(30, 40, 0, 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 90s Vintage Shoujo Manga Romance Background
 */
export function drawShoujoMangaBackground(ctx, width, height) {
  ctx.save();
  // Warm off-white manga paper
  ctx.fillStyle = '#FBF8F2';
  ctx.fillRect(0, 0, width, height);

  // Manga Screentone Dots pattern
  ctx.fillStyle = 'rgba(30, 27, 46, 0.08)';
  for (let y = 0; y < height; y += 14) {
    for (let x = 0; x < width; x += 14) {
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Black & Pink Manga Title Bar
  ctx.fillStyle = '#1E1B2E';
  ctx.fillRect(40, 70, width - 80, 56);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 24px "Impact", sans-serif';
  ctx.fillText('SHOUJO ROMANCE // VOL. 04', 60, 108);

  ctx.fillStyle = '#F43F5E';
  ctx.font = 'bold 20px "Hiragino Kaku Gothic Pro", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('少女のきらめき ♡', width - 60, 107);

  // Dramatic manga speed lines in corners
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(width - 200 + i * 25, 0);
    ctx.lineTo(width, 100 + i * 25);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Manga dialogue bubble
 */
export function drawMangaDialogueBubble(ctx, x, y, text = '大好き！♡') {
  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#1E1B2E';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.ellipse(0, 0, 95, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Little pointer tail
  ctx.beginPath();
  ctx.moveTo(-15, 40);
  ctx.lineTo(-30, 65);
  ctx.lineTo(5, 42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#E11D48';
  ctx.font = '900 22px "Hiragino Kaku Gothic Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 0, 7);

  ctx.restore();
}

/**
 * Y2K Cyber Angel Background
 */
export function drawCyberAngelBackground(ctx, width, height) {
  ctx.save();
  // Metallic futuristic lilac/silver gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#E4E7F2');
  grad.addColorStop(0.5, '#D5D9EC');
  grad.addColorStop(1, '#C8CEE6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Cyber digital grid lines
  ctx.strokeStyle = 'rgba(124, 58, 237, 0.12)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  // Cyber Digicam UI HUD Overlay
  ctx.fillStyle = '#4C1D95';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('● REC [00:42:19]  30FPS', 50, 70);
  ctx.textAlign = 'right';
  ctx.fillText('SD CARD [98%] 🔋', width - 50, 70);

  // Silver chrome stars
  drawChromeStar(ctx, 80, height - 90, 45);
  drawChromeStar(ctx, width - 80, height - 90, 45);

  ctx.restore();
}

/**
 * Cat Ears on Frame (Meow Cafe aesthetic)
 */
export function drawCatEarsOnFrame(ctx, cx, cy, w, h) {
  ctx.save();
  const topY = cy - h / 2;
  const leftX = cx - w / 2 + 50;
  const rightX = cx + w / 2 - 50;

  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 8;

  // Left Outer Ear
  ctx.fillStyle = '#FED7AA';
  ctx.strokeStyle = '#EA580C';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftX - 45, topY + 6);
  ctx.lineTo(leftX - 10, topY - 55);
  ctx.lineTo(leftX + 25, topY + 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left Inner Pink Ear
  ctx.fillStyle = '#FDA4AF';
  ctx.beginPath();
  ctx.moveTo(leftX - 35, topY + 4);
  ctx.lineTo(leftX - 10, topY - 40);
  ctx.lineTo(leftX + 15, topY + 4);
  ctx.closePath();
  ctx.fill();

  // Right Outer Ear
  ctx.fillStyle = '#FED7AA';
  ctx.strokeStyle = '#EA580C';
  ctx.beginPath();
  ctx.moveTo(rightX - 25, topY + 6);
  ctx.lineTo(rightX + 10, topY - 55);
  ctx.lineTo(rightX + 45, topY + 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Inner Pink Ear
  ctx.fillStyle = '#FDA4AF';
  ctx.beginPath();
  ctx.moveTo(rightX - 15, topY + 4);
  ctx.lineTo(rightX + 10, topY - 40);
  ctx.lineTo(rightX + 35, topY + 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

