export function getCanvasDimensions(count) {
  switch(count) {
    case 1: return { width: 800, height: 1200 };
    case 2: return { width: 800, height: 1300 };
    case 4: return { width: 800, height: 2000 };
    case 6: return { width: 800, height: 1550 };
    default: return { width: 800, height: 1200 };
  }
}

export function getThemedPhotoSlots(count, frameStyle = 'white-thin', chinHeight = 0) {
  let slots = [];
  if (count === 1) {
    slots.push({ id: 1, x: 80, y: 140, width: 640, height: 860, borderRadius: 8, frameStyle, chinHeight });
  } else if (count === 2) {
    slots.push({ id: 1, x: 80, y: 120, width: 640, height: 460, borderRadius: 6, frameStyle, chinHeight });
    slots.push({ id: 2, x: 80, y: 620, width: 640, height: 460, borderRadius: 6, frameStyle, chinHeight });
  } else if (count === 4) {
    slots.push({ id: 1, x: 80, y: 90, width: 640, height: 380, borderRadius: 4, frameStyle, chinHeight });
    slots.push({ id: 2, x: 80, y: 490, width: 640, height: 380, borderRadius: 4, frameStyle, chinHeight });
    slots.push({ id: 3, x: 80, y: 890, width: 640, height: 380, borderRadius: 4, frameStyle, chinHeight });
    slots.push({ id: 4, x: 80, y: 1290, width: 640, height: 380, borderRadius: 4, frameStyle, chinHeight });
  } else if (count === 6) {
    // 2 columns x 3 rows
    slots.push({ id: 1, x: 70, y: 120, width: 310, height: 380, borderRadius: 4, frameStyle });
    slots.push({ id: 2, x: 420, y: 120, width: 310, height: 380, borderRadius: 4, frameStyle });
    slots.push({ id: 3, x: 70, y: 530, width: 310, height: 380, borderRadius: 4, frameStyle });
    slots.push({ id: 4, x: 420, y: 530, width: 310, height: 380, borderRadius: 4, frameStyle });
    slots.push({ id: 5, x: 70, y: 940, width: 310, height: 380, borderRadius: 4, frameStyle });
    slots.push({ id: 6, x: 420, y: 940, width: 310, height: 380, borderRadius: 4, frameStyle });
  }
  return slots;
}

const baseThemes = [
  {
    id: 'spider-web',
    name: 'Spider Web',
    category: 'Y2K',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#14121A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = 'rgba(120, 80, 160, 0.4)';
      ctx.lineWidth = 2;
      
      const drawWeb = (x, y, multX, multY) => {
        ctx.beginPath();
        for(let i = 1; i <= 5; i++) {
          ctx.moveTo(x, y + 30 * i * multY);
          ctx.quadraticCurveTo(x + 20 * i * multX, y + 20 * i * multY, x + 30 * i * multX, y);
        }
        ctx.stroke();
        
        ctx.beginPath();
        for(let i = 1; i <= 3; i++) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + 30 * 5 * multX * (i/4), y + 30 * 5 * multY * ((4-i)/4));
        }
        ctx.stroke();
      };
      
      drawWeb(0, 0, 1, 1);
      drawWeb(canvas.width, 0, -1, 1);
      drawWeb(0, canvas.height, 1, -1);
      drawWeb(canvas.width, canvas.height, -1, -1);
      
      ctx.beginPath();
      ctx.moveTo(100, 0);
      ctx.lineTo(100, 150);
      ctx.stroke();
      
      const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height));
      grad.addColorStop(0, 'rgba(80, 40, 120, 0.1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'motorsport-gp',
    name: 'Motorsport GP',
    category: 'Motorsport',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#18181C';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(0, 0, canvas.width, 60);
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
      
      ctx.fillStyle = '#FFFFFF';
      for(let x=0; x<canvas.width; x+=30) {
        if((x/30)%2===0) {
          ctx.fillRect(x, 60, 30, 20);
          ctx.fillRect(x+30, 80, 30, 20);
          ctx.fillRect(x, canvas.height - 80, 30, 20);
          ctx.fillRect(x+30, canvas.height - 100, 30, 20);
        }
      }
      
      ctx.fillStyle = '#E0E0E0';
      ctx.font = 'bold 24px monospace';
      ctx.fillText("RACE DAY // POLE POSITION", 20, 40);
      
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width - 150, 40);
      ctx.lineTo(canvas.width - 100, 40);
      ctx.lineTo(canvas.width - 80, 20);
      ctx.stroke();
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'arcade-pixel',
    name: 'Arcade Pixel',
    category: 'Retro',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#1B102E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#FF0055';
      for(let y=0; y<canvas.height; y+=40) {
        ctx.fillRect(10, y, 10, 20);
        ctx.fillRect(canvas.width - 20, y+20, 10, 20);
      }
      
      ctx.fillStyle = '#00FFFF';
      ctx.font = '20px monospace';
      ctx.fillText("1UP 00", 20, 40);
      ctx.fillText("HIGH SCORE 99990", canvas.width - 220, 40);
      
      ctx.fillStyle = '#FFFF00';
      ctx.fillText("INSERT COIN 25¢", canvas.width/2 - 90, canvas.height - 30);
      
      ctx.fillStyle = '#FF0000';
      const drawPixel = (x, y) => ctx.fillRect(x*10 + canvas.width/2 - 25, y*10 + canvas.height - 90, 10, 10);
      const heart = [
        [1,0], [2,0], [4,0], [5,0],
        [0,1], [3,1], [6,1],
        [0,2], [6,2],
        [1,3], [5,3],
        [2,4], [4,4],
        [3,5]
      ];
      heart.forEach(p => drawPixel(p[0], p[1]));
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'cyber-y2k',
    name: 'Cyber Y2K',
    category: 'Y2K',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#E8EAF0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#A0AABF';
      ctx.lineWidth = 1;
      for(let x=0; x<canvas.width; x+=50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for(let y=0; y<canvas.height; y+=50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      
      ctx.fillStyle = '#808B9F';
      ctx.beginPath();
      ctx.moveTo(50, 50); ctx.lineTo(60, 20); ctx.lineTo(70, 50); ctx.lineTo(100, 60);
      ctx.lineTo(70, 70); ctx.lineTo(60, 100); ctx.lineTo(50, 70); ctx.lineTo(20, 60);
      ctx.fill();
      
      ctx.fillStyle = '#1A1C23';
      ctx.font = 'italic bold 24px sans-serif';
      ctx.fillText("MILLENNIUM TECH", canvas.width - 240, 50);
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'horror-cute',
    name: 'Horror Cute',
    category: 'Cute',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#E8E2F2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#221C28';
      ctx.lineWidth = 3;
      for(let i=0; i<10; i++) {
        let cx = 30 + Math.random() * (canvas.width - 60);
        let cy = 30 + Math.random() * (canvas.height - 60);
        ctx.beginPath(); ctx.moveTo(cx-10, cy-10); ctx.lineTo(cx+10, cy+10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+10, cy-10); ctx.lineTo(cx-10, cy+10); ctx.stroke();
      }
      
      ctx.fillStyle = '#221C28';
      ctx.beginPath();
      ctx.arc(60, canvas.height - 60, 30, Math.PI, 0);
      ctx.lineTo(90, canvas.height - 20);
      ctx.lineTo(75, canvas.height - 35);
      ctx.lineTo(60, canvas.height - 20);
      ctx.lineTo(45, canvas.height - 35);
      ctx.lineTo(30, canvas.height - 20);
      ctx.fill();
      
      ctx.fillStyle = '#E8E2F2';
      ctx.beginPath(); ctx.arc(50, canvas.height - 60, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(70, canvas.height - 60, 5, 0, Math.PI*2); ctx.fill();
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'space-odyssey',
    name: 'Space Odyssey',
    category: 'Playful',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#0B1026';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#FFFFFF';
      for(let i=0; i<100; i++) {
        let r = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, r, 0, Math.PI*2);
        ctx.fill();
      }
      
      ctx.fillStyle = '#F4D03F';
      ctx.beginPath();
      ctx.arc(canvas.width - 80, 80, 40, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#0B1026';
      ctx.beginPath();
      ctx.arc(canvas.width - 90, 70, 40, 0, Math.PI*2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(100, canvas.height - 100, 80, 20, Math.PI/6, 0, Math.PI*2);
      ctx.stroke();
      
      ctx.fillStyle = '#8E44AD';
      ctx.beginPath();
      ctx.arc(100, canvas.height - 100, 30, 0, Math.PI*2);
      ctx.fill();
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 50); ctx.lineTo(120, 90); ctx.lineTo(90, 150); ctx.lineTo(160, 180);
      ctx.stroke();
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'graffiti-street',
    name: 'Graffiti Street',
    category: 'Playful',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#E5E2DC';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#333333';
      for(let i=0; i<30; i++) {
        let cx = Math.random() * canvas.width;
        let cy = Math.random() * canvas.height;
        for(let j=0; j<5; j++) {
          ctx.beginPath();
          ctx.arc(cx + (Math.random()-0.5)*40, cy + (Math.random()-0.5)*40, Math.random()*4, 0, Math.PI*2);
          ctx.fill();
        }
      }
      
      ctx.fillStyle = '#D32F2F';
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, 20);
      for(let x=20; x<canvas.width; x+=50) {
        ctx.moveTo(x, 20);
        ctx.lineTo(x+10, 20 + Math.random()*60 + 20);
        ctx.lineTo(x+20, 20);
      }
      ctx.fill();
      
      ctx.fillStyle = '#222222';
      ctx.font = 'bold 40px Impact, sans-serif';
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height - 40);
      ctx.rotate(-0.05);
      ctx.fillText("CISSPIC CREW", -120, 0);
      ctx.restore();
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'rockstar-stage',
    name: 'Rockstar Stage',
    category: 'Retro',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#1C1618';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#D32F2F';
      ctx.lineWidth = 5;
      
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.lineTo(60, 100);
      ctx.lineTo(30, 110);
      ctx.lineTo(80, 180);
      ctx.stroke();
      
      ctx.fillStyle = '#E0E0E0';
      ctx.beginPath();
      ctx.moveTo(canvas.width - 60, canvas.height - 100);
      ctx.quadraticCurveTo(canvas.width - 20, canvas.height - 100, canvas.width - 40, canvas.height - 40);
      ctx.quadraticCurveTo(canvas.width - 60, canvas.height - 20, canvas.width - 80, canvas.height - 40);
      ctx.quadraticCurveTo(canvas.width - 100, canvas.height - 100, canvas.width - 60, canvas.height - 100);
      ctx.fill();
      
      ctx.fillStyle = '#1C1618';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("TOUR", canvas.width - 80, canvas.height - 60);
      
      ctx.fillStyle = '#D32F2F';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText("LEVEL 11", 20, canvas.height - 40);
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'sport-varsity',
    name: 'Sport Varsity',
    category: 'Playful',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#0F2137';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#F7F4EC';
      ctx.fillRect(20, 0, 10, canvas.height);
      ctx.fillRect(40, 0, 5, canvas.height);
      
      ctx.fillRect(canvas.width - 45, 0, 5, canvas.height);
      ctx.fillRect(canvas.width - 30, 0, 10, canvas.height);
      
      ctx.font = 'bold 120px serif';
      ctx.fillStyle = 'rgba(247, 244, 236, 0.1)';
      ctx.fillText("07", canvas.width/2 - 60, canvas.height/2);
      
      ctx.fillStyle = '#F7F4EC';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("ATHLETIC DEPT / CHAMPIONS", canvas.width/2, canvas.height - 40);
      ctx.textAlign = 'left';
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'comic-pop',
    name: 'Comic Pop',
    category: 'Playful',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#FFF3C4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'rgba(0, 180, 216, 0.2)';
      for(let x=0; x<canvas.width; x+=15) {
        for(let y=0; y<canvas.height; y+=15) {
          ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
        }
      }
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      
      ctx.fillStyle = '#FF0055';
      ctx.beginPath();
      let cx = canvas.width - 80, cy = 80;
      for(let i=0; i<12; i++) {
        let angle = i * Math.PI / 6;
        let r = i%2===0 ? 60 : 30;
        ctx.lineTo(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.2);
      ctx.fillText("POW!", -35, 10);
      ctx.restore();
      
      ctx.fillStyle = '#FFF3C4';
      ctx.fillRect(30, canvas.height - 80, 200, 40);
      ctx.strokeRect(30, canvas.height - 80, 200, 40);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("MEANWHILE...", 40, canvas.height - 55);
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'cute-chaotic',
    name: 'Cute Chaotic',
    category: 'Cute',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#FFFDF0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#FF69B4'; // Bubblegum
      ctx.lineWidth = 3;
      for(let i=0; i<10; i++) {
        ctx.beginPath();
        let sx = Math.random() * canvas.width;
        let sy = Math.random() * canvas.height;
        ctx.moveTo(sx, sy);
        ctx.bezierCurveTo(sx+50, sy-50, sx-50, sy-100, sx, sy-150);
        ctx.stroke();
      }
      
      const drawDaisy = (x, y) => {
        ctx.fillStyle = '#FFFFFF';
        for(let i=0; i<8; i++) {
          ctx.beginPath();
          ctx.ellipse(x + Math.cos(i*Math.PI/4)*15, y + Math.sin(i*Math.PI/4)*15, 10, 5, i*Math.PI/4, 0, Math.PI*2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      };
      
      drawDaisy(80, 80);
      drawDaisy(canvas.width - 80, 150);
      drawDaisy(100, canvas.height - 100);
      
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(canvas.width - 80, canvas.height - 120);
      ctx.lineTo(canvas.width - 60, canvas.height - 60);
      ctx.lineTo(canvas.width - 10, canvas.height - 60);
      ctx.lineTo(canvas.width - 50, canvas.height - 20);
      ctx.lineTo(canvas.width - 30, canvas.height + 40);
      ctx.lineTo(canvas.width - 80, canvas.height + 10);
      ctx.lineTo(canvas.width - 130, canvas.height + 40);
      ctx.lineTo(canvas.width - 110, canvas.height - 20);
      ctx.lineTo(canvas.width - 150, canvas.height - 60);
      ctx.lineTo(canvas.width - 100, canvas.height - 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(canvas.width - 95, canvas.height - 30, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(canvas.width - 65, canvas.height - 30, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(canvas.width - 80, canvas.height - 15, 8, 0, Math.PI, false); ctx.stroke();
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'flower-garden',
    name: 'Flower Garden',
    category: 'Cute',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#FAF8F5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#EEF4EC';
      ctx.fillRect(15, 15, canvas.width - 30, canvas.height - 30);
      
      ctx.strokeStyle = '#8FBC8F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, 30);
      ctx.quadraticCurveTo(100, 50, 30, 100);
      ctx.quadraticCurveTo(100, 150, 30, 200);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(canvas.width - 30, canvas.height - 30);
      ctx.quadraticCurveTo(canvas.width - 100, canvas.height - 50, canvas.width - 30, canvas.height - 100);
      ctx.stroke();
      
      ctx.fillStyle = '#556B2F';
      ctx.font = 'italic 20px serif';
      const dateStr = new Date().toLocaleDateString();
      ctx.fillText(dateStr, canvas.width/2 - 40, canvas.height - 40);
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'denim-patchwork',
    name: 'Denim Patchwork',
    category: 'Denim',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#385273';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#DAA520';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#CD7F32';
      const drawRivet = (x, y) => {
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#8B4513';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#CD7F32';
      };
      drawRivet(40, 40);
      drawRivet(canvas.width - 40, 40);
      drawRivet(40, canvas.height - 40);
      drawRivet(canvas.width - 40, canvas.height - 40);
      
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(canvas.width/2 - 60, canvas.height - 70, 120, 50);
      ctx.strokeStyle = '#DAA520';
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(canvas.width/2 - 55, canvas.height - 65, 110, 40);
      ctx.setLineDash([]);
      ctx.fillStyle = '#DAA520';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText("CISSPIC", canvas.width/2 - 30, canvas.height - 40);
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'newspaper-press',
    name: 'Newspaper Press',
    category: 'Vintage',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#F4EFE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#222222';
      ctx.font = 'bold 40px serif';
      ctx.textAlign = 'center';
      ctx.fillText("THE DAILY CHRONICLE", canvas.width/2, 60);
      
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(20, 80); ctx.lineTo(canvas.width - 20, 80); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(20, 85); ctx.lineTo(canvas.width - 20, 85); ctx.stroke();
      
      ctx.font = '12px serif';
      ctx.fillText("VOL. 1 ISSUE 1", 80, 100);
      ctx.fillText("WEATHER: PERFECT", canvas.width - 100, 100);
      ctx.textAlign = 'left';
      
      ctx.beginPath(); ctx.moveTo(20, 110); ctx.lineTo(canvas.width - 20, 110); ctx.stroke();
      
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(canvas.width/2, 120); ctx.lineTo(canvas.width/2, canvas.height - 20); ctx.stroke();
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'internet-2000',
    name: 'Internet 2000',
    category: 'Y2K',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#000080';
      ctx.fillRect(4, 4, canvas.width - 8, 30);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText("Internet Explorer", 10, 24);
      
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(canvas.width - 70, 8, 20, 20);
      ctx.fillRect(canvas.width - 48, 8, 20, 20);
      ctx.fillRect(canvas.width - 26, 8, 20, 20);
      
      ctx.fillStyle = '#000000';
      ctx.fillText("_", canvas.width - 64, 20);
      ctx.strokeRect(canvas.width - 44, 12, 12, 12);
      ctx.fillText("X", canvas.width - 20, 24);
      
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(4, 34, canvas.width - 8, 40);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(60, 44, canvas.width - 70, 20);
      ctx.fillStyle = '#000000';
      ctx.font = '14px sans-serif';
      ctx.fillText("Address", 8, 58);
      ctx.fillText("http://cisspic.fun", 65, 58);
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, canvas.height); ctx.lineTo(0, 0); ctx.lineTo(canvas.width, 0); ctx.stroke();
      ctx.strokeStyle = '#808080';
      ctx.beginPath(); ctx.moveTo(canvas.width, 0); ctx.lineTo(canvas.width, canvas.height); ctx.lineTo(0, canvas.height); ctx.stroke();
      
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(4, canvas.height - 24, canvas.width - 8, 20);
      ctx.fillStyle = '#000000';
      ctx.fillText("Done", 10, canvas.height - 10);
    },
    renderForeground: (ctx, canvas) => {}
  },
  {
    id: 'street-racing',
    name: 'Street Racing',
    category: 'Motorsport',
    renderBackground: (ctx, canvas) => {
      ctx.fillStyle = '#16171A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#111111';
      for(let y=0; y<canvas.height; y+=10) {
        for(let x=0; x<canvas.width; x+=10) {
          if((x/10 + y/10) % 2 === 0) {
            ctx.fillRect(x, y, 10, 10);
          }
        }
      }
      
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 10;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 20;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = '#FF0055';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(100, canvas.height - 100, 60, Math.PI, 0);
      ctx.stroke();
      for(let i=0; i<=6; i++) {
        let angle = Math.PI + i * Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(100 + Math.cos(angle)*50, canvas.height - 100 + Math.sin(angle)*50);
        ctx.lineTo(100 + Math.cos(angle)*60, canvas.height - 100 + Math.sin(angle)*60);
        ctx.stroke();
      }
      ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(100, canvas.height - 100);
      ctx.lineTo(100 + Math.cos(Math.PI + 4 * Math.PI / 6)*50, canvas.height - 100 + Math.sin(Math.PI + 4 * Math.PI / 6)*50);
      ctx.stroke();
      
      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText("TURBO BOOST // STAGE 2", 180, canvas.height - 60);
    },
    renderForeground: (ctx, canvas) => {}
  }
];

export const THEMED_TEMPLATES = [];

baseThemes.forEach(theme => {
  const supportedPhotoCounts = [1, 2, 4, 6];
  const defaultBg = theme.background || ['#18181C'];
  const defaultText = theme.textColor || '#FFFFFF';
  
  THEMED_TEMPLATES.push({
    ...theme,
    background: defaultBg,
    textColor: defaultText,
    isBase: true,
    family: theme.id,
    canvas: getCanvasDimensions(4),
    photoSlots: getThemedPhotoSlots(4),
    supportedPhotoCounts
  });
  
  supportedPhotoCounts.forEach(count => {
    THEMED_TEMPLATES.push({
      ...theme,
      id: `${theme.id}-${count}`,
      name: `${theme.name} (${count} Photo${count > 1 ? 's' : ''})`,
      photoCount: count,
      background: defaultBg,
      textColor: defaultText,
      family: theme.id,
      canvas: getCanvasDimensions(count),
      dimensions: getCanvasDimensions(count),
      photoSlots: getThemedPhotoSlots(count),
      supportedPhotoCounts
    });
  });
});

import { IMAGE_FRAMES } from './imageFrames.js';
import { decodedImage } from './renderResources.js';

export function preloadTemplateAssets(templateId) {
  const imgFrame = IMAGE_FRAMES.find(f => f.id === templateId);
  if (imgFrame && imgFrame.src) {
    return decodedImage(imgFrame.src).catch(() => {
      throw new Error(`Frame “${imgFrame.name}” belum berhasil dimuat. Coba lagi; foto sesi tetap tersimpan.`);
    });
  }
  return Promise.resolve();
}
