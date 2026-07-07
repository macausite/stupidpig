let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

let tossBallX;
let tossBallY;
let tossBallVx = 0;
let tossBallVy = 0;
let tossBallRadius = 15;
let isTossDragging = false;
let isTossFlying = false;

let tossDragStartX = 0;
let tossDragStartY = 0;

let tossBinX;
let tossBinY = 150;
let tossBinWidth = 60;
let tossBinHeight = 70;
let tossBinSpeed = 1.6;
let tossBinDirection = 1;

let tossWind = 0;
let tossCoworkerX = -100;
let tossCoworkerY = 150;
let tossCoworkerVisible = false;
let tossCoworkerTimer = 0;
let tossCoworkerHit = false;
let tossParticles = [];
const GRAVITY = 0.28;

export function init(_canvas, _ctx, _textures, _width, _height, _sound, _updateScore, _spawnScoreTag, _addSystemLog, _triggerGameOver) {
  canvas = _canvas;
  ctx = _ctx;
  textures = _textures;
  WIDTH = _width;
  HEIGHT = _height;
  sound = _sound;
  updateScore = _updateScore;
  spawnScoreTag = _spawnScoreTag;
  triggerGameOver = _triggerGameOver;
  reset();
}

export function reset() {
  resetTossBall();
  tossBinX = WIDTH / 2;
  tossBinY = 150;
  tossBinSpeed = 1.6;
  tossBinDirection = 1;
  randomizeTossWind();
  tossCoworkerX = -50;
  tossCoworkerVisible = false;
  tossCoworkerTimer = 180;
  tossCoworkerHit = false;
  tossParticles = [];
}

function resetTossBall() {
  tossBallX = WIDTH / 2;
  tossBallY = HEIGHT - 80;
  tossBallVx = 0;
  tossBallVy = 0;
  isTossFlying = false;
  isTossDragging = false;
}

function randomizeTossWind() {
  tossWind = (Math.random() * 6 - 3); // Wind between -3.0 and +3.0
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Update particles
  tossParticles.forEach((p, idx) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) tossParticles.splice(idx, 1);
  });

  // Move Trash Bin
  tossBinX += tossBinSpeed * tossBinDirection;
  if (tossBinX - tossBinWidth/2 < 30) {
    tossBinX = 30 + tossBinWidth/2;
    tossBinDirection = 1;
  } else if (tossBinX + tossBinWidth/2 > WIDTH - 30) {
    tossBinX = WIDTH - 30 - tossBinWidth/2;
    tossBinDirection = -1;
  }

  // Update coworker/boss popup
  tossCoworkerTimer--;
  if (tossCoworkerTimer <= 0) {
    if (!tossCoworkerVisible) {
      tossCoworkerVisible = true;
      tossCoworkerX = Math.random() < 0.5 ? -40 : WIDTH + 40;
      tossCoworkerY = 130 + Math.random() * 40;
      tossCoworkerHit = false;
      tossCoworkerTimer = 240;
    } else {
      tossCoworkerVisible = false;
      tossCoworkerTimer = 300 + Math.random() * 300;
    }
  }

  if (tossCoworkerVisible) {
    if (tossCoworkerX < WIDTH / 2) {
      tossCoworkerX += 1.5;
    } else {
      tossCoworkerX -= 1.5;
    }
  }

  // Swipe events
  if (pStart && !isTossFlying) {
    const dx = pX - tossBallX;
    const dy = pY - tossBallY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < tossBallRadius + 25) {
      isTossDragging = true;
      tossDragStartX = pX;
      tossDragStartY = pY;
      sound.playClick();
    }
  }

  if (isTossDragging) {
    tossBallX = pX;
    tossBallY = Math.max(HEIGHT / 2, pY);
  }

  if (pEnd && isTossDragging) {
    isTossDragging = false;
    const dx = tossBallX - tossDragStartX;
    const dy = tossBallY - tossDragStartY;
    if (dy < -15) {
      tossBallVx = dx * 0.12;
      tossBallVy = dy * 0.16;
      isTossFlying = true;
      sound.playDrop();
    } else {
      resetTossBall();
    }
  }

  // Flight updates
  if (isTossFlying) {
    tossBallVx += tossWind * 0.05;
    tossBallVy += GRAVITY * 0.65;

    tossBallX += tossBallVx;
    tossBallY += tossBallVy;

    tossParticles.push({
      x: tossBallX,
      y: tossBallY,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      life: 20,
      color: 'rgba(150, 150, 255, 0.4)'
    });

    // Hit coworker/boss
    if (tossCoworkerVisible && !tossCoworkerHit) {
      const cdx = tossBallX - tossCoworkerX;
      const cdy = tossBallY - tossCoworkerY;
      const dist = Math.sqrt(cdx * cdx + cdy * cdy);
      if (dist < tossBallRadius + 22) {
        tossCoworkerHit = true;
        sound.playExplosion();
        updateScore(100); // add bonus score
        spawnScoreTag(tossCoworkerX, tossCoworkerY, "🎯 HEADSHOT! 掟中老細！ +100");
        
        for (let i = 0; i < 12; i++) {
          tossParticles.push({
            x: tossBallX,
            y: tossBallY,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 25,
            color: '#ff2d55'
          });
        }
      }
    }

    // Hit target (Trash Bin)
    if (tossBallVy > 0 && tossBallY >= tossBinY && tossBallY - tossBallVy <= tossBinY + 15) {
      if (tossBallX >= tossBinX - tossBinWidth/2 && tossBallX <= tossBinX + tossBinWidth/2) {
        sound.playCashChime();
        updateScore(50);
        spawnScoreTag(tossBinX, tossBinY - 20, "🗑️ SWISH! 入筒！ +50");

        for (let i = 0; i < 15; i++) {
          tossParticles.push({
            x: tossBinX,
            y: tossBinY + 10,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 2,
            life: 30,
            color: '#ff9500'
          });
        }
        resetTossBall();
        randomizeTossWind();
      }
    }

    // Out of bounds
    if (tossBallY > HEIGHT + 40 || tossBallX < -20 || tossBallX > WIDTH + 20) {
      sound.playClick();
      spawnScoreTag(WIDTH / 2, HEIGHT - 150, "❌ MISSED! 投偏咗");
      resetTossBall();
      randomizeTossWind();
    }
  }
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple light grey background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = '#e8e8ed';
  ctx.lineWidth = 1;
  for (let x = 40; x < WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }

  // Draw the trash bin
  ctx.fillStyle = '#c7c7cc';
  ctx.fillRect(tossBinX - tossBinWidth/2, tossBinY, tossBinWidth, tossBinHeight);
  ctx.fillStyle = '#8e8e93';
  ctx.fillRect(tossBinX - tossBinWidth/2 - 4, tossBinY, tossBinWidth + 8, 8);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  for (let o = tossBinX - tossBinWidth/2 + 8; o < tossBinX + tossBinWidth/2; o += 12) {
    ctx.beginPath();
    ctx.moveTo(o, tossBinY + 8);
    ctx.lineTo(o, tossBinY + tossBinHeight);
    ctx.stroke();
  }

  // Draw Coworker/Boss popping up
  if (tossCoworkerVisible) {
    ctx.fillStyle = '#ff9500';
    ctx.beginPath();
    ctx.arc(tossCoworkerX, tossCoworkerY, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tossCoworkerX - 6, tossCoworkerY - 4, 4, 0, 2 * Math.PI);
    ctx.arc(tossCoworkerX + 6, tossCoworkerY - 4, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(tossCoworkerX - 6, tossCoworkerY - 4, 1.5, 0, 2 * Math.PI);
    ctx.arc(tossCoworkerX + 6, tossCoworkerY - 4, 1.5, 0, 2 * Math.PI);
    ctx.fill();
    if (tossCoworkerHit) {
      ctx.strokeStyle = '#ff3b30';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tossCoworkerX - 8, tossCoworkerY + 8);
      ctx.quadraticCurveTo(tossCoworkerX, tossCoworkerY + 2, tossCoworkerX + 8, tossCoworkerY + 8);
      ctx.stroke();
      ctx.fillStyle = '#ff3b30';
      ctx.font = 'bold 9px -apple-system, sans-serif';
      ctx.fillText("💢 ANGRY BOSS!", tossCoworkerX - 30, tossCoworkerY - 26);
    } else {
      ctx.strokeStyle = '#1d1d1f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(tossCoworkerX, tossCoworkerY + 4, 6, 0, Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#ff2d55';
      ctx.font = 'bold 8px -apple-system, sans-serif';
      ctx.fillText("💼 BOSS", tossCoworkerX - 16, tossCoworkerY - 26);
    }
  }

  // Draw Particles
  tossParticles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 30;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(1, p.life * 0.12), 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;

  // Draw Paper Ball
  const pImg = textures['pig_scared'];
  if (isTossFlying) {
    if (pImg) {
      ctx.drawImage(pImg, tossBallX - tossBallRadius, tossBallY - tossBallRadius, tossBallRadius * 2, tossBallRadius * 2);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tossBallX, tossBallY, tossBallRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#d1d1d6';
      ctx.stroke();
    }
  } else {
    if (isTossDragging) {
      ctx.strokeStyle = 'rgba(0, 113, 227, 0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tossDragStartX, tossDragStartY);
      ctx.lineTo(tossBallX, tossBallY);
      ctx.stroke();
    }
    if (pImg) {
      ctx.drawImage(pImg, tossBallX - tossBallRadius, tossBallY - tossBallRadius, tossBallRadius * 2, tossBallRadius * 2);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tossBallX, tossBallY, tossBallRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#d1d1d6';
      ctx.stroke();
    }
  }

  // Help Text
  if (!isTossFlying && !isTossDragging) {
    ctx.fillStyle = '#8e8e93';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("👆 往上拖動/滑動紙團投進垃圾桶", WIDTH / 2, HEIGHT - 120);
    ctx.textAlign = 'left';
  }

  // Sidebar Preview Gauge
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = tossWind >= 0 ? '#34c759' : '#ff3b30';
  const wWidth = Math.min(35, Math.floor(Math.abs(tossWind) * 10));
  pCtx.fillRect(50, 45, tossWind >= 0 ? wWidth : -wWidth, 10);

  pCtx.fillStyle = '#1d1d1f';
  pCtx.font = 'bold 9px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText(`W: ${tossWind >= 0 ? 'R' : 'L'} ${Math.abs(tossWind).toFixed(1)}`, 50, 32);

  document.getElementById('next-label').innerText = '💨 WIND VELOCITY';
  document.getElementById('mobile-next-emoji').innerText = '🗑️';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
