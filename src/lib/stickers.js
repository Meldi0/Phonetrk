// High-resolution Vector & Canvas Graphic Stickers for SnapBooth

export const STICKER_CATALOG = [
  // Cute / Ribbons
  { id: 'ribbon-pink', name: 'Pink Bow', category: 'Cute', emoji: '🎀', type: 'bow-pink' },
  { id: 'ribbon-red', name: 'Red Satin Bow', category: 'Cute', emoji: '🎀', type: 'bow-red' },
  { id: 'ribbon-cream', name: 'Cream Tie', category: 'Cute', emoji: '୨୧', type: 'bow-cream' },
  { id: 'cherry-pair', name: 'Sweet Cherries', category: 'Cute', emoji: '🍒', type: 'cherry' },
  { id: 'strawberry', name: 'Strawberry', category: 'Cute', emoji: '🍓', type: 'strawberry' },
  { id: 'bunny-cute', name: 'Little Bunny', category: 'Cute', emoji: '🐰', type: 'bunny' },
  { id: 'cat-paw', name: 'Cat Paw', category: 'Cute', emoji: '🐾', type: 'cat-paw' },
  { id: 'sakura-flower', name: 'Sakura Petal', category: 'Cute', emoji: '🌸', type: 'sakura' },
  { id: 'clover-leaf', name: 'Lucky Clover', category: 'Cute', emoji: '🍀', type: 'clover' },

  // Hearts & Sparkles
  { id: 'heart-pastel', name: 'Pastel Heart', category: 'Hearts', emoji: '💖', type: 'heart-pastel' },
  { id: 'heart-glitter', name: 'Sparkle Heart', category: 'Hearts', emoji: '✨', type: 'heart-sparkle' },
  { id: 'heart-chrome', name: 'Chrome Heart', category: 'Hearts', emoji: '🩶', type: 'heart-chrome' },
  { id: 'heart-pixel', name: 'Pixel Heart', category: 'Hearts', emoji: '👾', type: 'heart-pixel' },

  // Stars & Y2K
  { id: 'star-y2k', name: 'Cyber Star', category: 'Y2K', emoji: '✦', type: 'star-4point' },
  { id: 'star-sparkle', name: 'Twinkle Star', category: 'Y2K', emoji: '✨', type: 'star-twinkle' },
  { id: 'butterfly-blue', name: 'Blue Butterfly', category: 'Y2K', emoji: '🦋', type: 'butterfly' },
  { id: 'smiley-happy', name: 'Retro Smiley', category: 'Y2K', emoji: '☺', type: 'smiley' },
  { id: 'digicam-rec', name: 'REC Dot', category: 'Y2K', emoji: '●', type: 'rec-badge' },

  // Badges & Stamps
  { id: 'badge-love', name: 'LOVE Stamp', category: 'Stamps', emoji: '♥', type: 'badge-love' },
  { id: 'badge-besties', name: 'BESTIES', category: 'Stamps', emoji: '★', type: 'badge-besties' },
  { id: 'badge-kstyle', name: 'K-PHOTO', category: 'Stamps', emoji: '✦', type: 'badge-kstyle' },
  { id: 'badge-memories', name: 'MEMORIES', category: 'Stamps', emoji: '✿', type: 'badge-memories' },
];

// Helper to draw clean vector shapes on Canvas context
export function drawSticker(ctx, type, cx, cy, size = 40, rotation = 0, color = null) {
  ctx.save();
  ctx.translate(cx, cy);
  if (rotation) ctx.rotate((rotation * Math.PI) / 180);

  const half = size / 2;

  switch (type) {
    case 'bow-pink':
    case 'bow-red':
    case 'bow-cream': {
      const mainColor = type === 'bow-pink' ? '#F48FB1' : type === 'bow-red' ? '#E53935' : '#D7CCC8';
      const shadowColor = type === 'bow-pink' ? '#EC407A' : type === 'bow-red' ? '#C62828' : '#BCAAA4';

      // Left loop
      ctx.beginPath();
      ctx.fillStyle = mainColor;
      ctx.moveTo(-4, 0);
      ctx.bezierCurveTo(-half, -half * 0.8, -half * 0.9, half * 0.5, -4, 2);
      ctx.fill();

      // Right loop
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.bezierCurveTo(half, -half * 0.8, half * 0.9, half * 0.5, 4, 2);
      ctx.fill();

      // Tails
      ctx.beginPath();
      ctx.fillStyle = shadowColor;
      ctx.moveTo(-6, 2);
      ctx.lineTo(-half * 0.7, half * 0.9);
      ctx.lineTo(-half * 0.3, half * 0.7);
      ctx.lineTo(-2, 3);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(6, 2);
      ctx.lineTo(half * 0.7, half * 0.9);
      ctx.lineTo(half * 0.3, half * 0.7);
      ctx.lineTo(2, 3);
      ctx.fill();

      // Center knot
      ctx.beginPath();
      ctx.fillStyle = shadowColor;
      ctx.ellipse(0, 1, half * 0.28, half * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF88';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
    }

    case 'heart-pastel':
    case 'heart-sparkle':
    case 'heart-chrome': {
      const heartColor =
        color || (type === 'heart-chrome' ? '#9E9E9E' : type === 'heart-sparkle' ? '#FF6B8B' : '#FFA8B8');

      ctx.beginPath();
      ctx.fillStyle = heartColor;
      ctx.moveTo(0, half * 0.7);
      ctx.bezierCurveTo(-half * 0.9, 0, -half * 0.8, -half * 0.75, 0, -half * 0.25);
      ctx.bezierCurveTo(half * 0.8, -half * 0.75, half * 0.9, 0, 0, half * 0.7);
      ctx.fill();

      if (type === 'heart-chrome') {
        // Metallic sheen
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-half * 0.35, -half * 0.35, half * 0.2, Math.PI * 0.8, Math.PI * 1.6);
        ctx.stroke();
      } else {
        // Soft white highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(-half * 0.3, -half * 0.3, half * 0.15, half * 0.08, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'heart-pixel': {
      const p = size / 10;
      ctx.fillStyle = color || '#F06292';
      const matrix = [
        [0, 1, 1, 0, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0],
      ];
      matrix.forEach((row, ry) => {
        row.forEach((cell, rx) => {
          if (cell) {
            ctx.fillRect((rx - 4) * p, (ry - 3) * p, p, p);
          }
        });
      });
      break;
    }

    case 'star-4point':
    case 'star-twinkle': {
      ctx.fillStyle = color || '#B388FF';
      ctx.beginPath();
      ctx.moveTo(0, -half);
      ctx.quadraticCurveTo(0, 0, half, 0);
      ctx.quadraticCurveTo(0, 0, 0, half);
      ctx.quadraticCurveTo(0, 0, -half, 0);
      ctx.quadraticCurveTo(0, 0, 0, -half);
      ctx.fill();

      // Center bright core
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, half * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'cherry': {
      // Stems
      ctx.strokeStyle = '#4E7D42';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -half * 0.8);
      ctx.quadraticCurveTo(-half * 0.4, -half * 0.4, -half * 0.35, half * 0.2);
      ctx.moveTo(0, -half * 0.8);
      ctx.quadraticCurveTo(half * 0.3, -half * 0.3, half * 0.35, half * 0.3);
      ctx.stroke();

      // Cherries
      ctx.fillStyle = '#D32F2F';
      ctx.beginPath();
      ctx.arc(-half * 0.35, half * 0.3, half * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(half * 0.35, half * 0.4, half * 0.36, 0, Math.PI * 2);
      ctx.fill();

      // Highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(-half * 0.45, half * 0.2, half * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(half * 0.25, half * 0.3, half * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'strawberry': {
      // Berry body
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.moveTo(0, half * 0.8);
      ctx.bezierCurveTo(-half * 0.9, 0, -half * 0.7, -half * 0.6, 0, -half * 0.5);
      ctx.bezierCurveTo(half * 0.7, -half * 0.6, half * 0.9, 0, 0, half * 0.8);
      ctx.fill();

      // Seeds
      ctx.fillStyle = '#FFF59D';
      [
        [-half * 0.3, -half * 0.1],
        [0, 0],
        [half * 0.3, -half * 0.1],
        [-half * 0.15, half * 0.3],
        [half * 0.15, half * 0.3],
      ].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.ellipse(sx, sy, 1.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Leaves
      ctx.fillStyle = '#43A047';
      ctx.beginPath();
      ctx.moveTo(0, -half * 0.8);
      ctx.lineTo(-half * 0.4, -half * 0.5);
      ctx.lineTo(-half * 0.1, -half * 0.45);
      ctx.lineTo(0, -half * 0.4);
      ctx.lineTo(half * 0.1, -half * 0.45);
      ctx.lineTo(half * 0.4, -half * 0.5);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'clover': {
      ctx.fillStyle = '#4CAF50';
      const leafR = half * 0.35;
      [
        [0, -half * 0.35],
        [half * 0.35, 0],
        [0, half * 0.35],
        [-half * 0.35, 0],
      ].forEach(([lx, ly]) => {
        ctx.beginPath();
        ctx.arc(lx, ly, leafR, 0, Math.PI * 2);
        ctx.fill();
      });

      // Stem
      ctx.strokeStyle = '#388E3C';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(half * 0.2, half * 0.6, half * 0.3, half * 0.9);
      ctx.stroke();
      break;
    }

    case 'sakura': {
      ctx.fillStyle = '#F8BBD0';
      const petalDist = half * 0.4;
      for (let a = 0; a < 5; a++) {
        const rad = (a * 72 * Math.PI) / 180;
        const px = Math.cos(rad) * petalDist;
        const py = Math.sin(rad) * petalDist;
        ctx.beginPath();
        ctx.ellipse(px, py, half * 0.3, half * 0.18, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      // Center
      ctx.fillStyle = '#E91E63';
      ctx.beginPath();
      ctx.arc(0, 0, half * 0.15, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'badge-love':
    case 'badge-besties':
    case 'badge-kstyle':
    case 'badge-memories': {
      const badgeText =
        type === 'badge-love'
          ? '♥ LOVE ♥'
          : type === 'badge-besties'
          ? '★ BESTIES ★'
          : type === 'badge-kstyle'
          ? '✦ K-PHOTO ✦'
          : 'MEMORIES';

      const badgeW = size * 1.8;
      const badgeH = size * 0.6;
      ctx.fillStyle = color || '#30293D';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 6);
        ctx.fill();
      } else {
        ctx.fillRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH);
      }

      ctx.strokeStyle = '#FFFFFF55';
      ctx.lineWidth = 1;
      if (ctx.roundRect) {
        ctx.stroke();
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.round(size * 0.28)}px 'DM Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, 0, 1);
      break;
    }

    default:
      // Fallback: draw as clean emoji text
      ctx.font = `${Math.round(size * 0.8)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(color || '★', 0, 0);
      break;
  }

  ctx.restore();
}
