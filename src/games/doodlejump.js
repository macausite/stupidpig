let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

let pigX;
let pigY;
let pigVx = 0;
let pigVy = 0;
const pigRadius = 18;
const GRAVITY = 0.22;
const BOUNCE_VELOCITY = -8;

let platforms = [];
let maxPigHeight = 0;
let cameraY = 0;
let jumpParticles = [];

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
  pigX = WIDTH / 2;
  pigY = HEIGHT - 150;
  pigVx = 0;
  pigVy = 0;
  maxPigHeight = 0;
  cameraY = 0;
  jumpParticles = [];

  // Generate initial platforms
  platforms = [];
  // Base starting platform
  platforms.push({ x: WIDTH / 2 - 40, y: HEIGHT - 100, width: 80, height: 10, type: 'normal' });

  for (let i = 0; i < 8; i++) {
    spawnPlatform(HEIGHT - 180 - i * 90);
  }
}

function spawnPlatform(y) {
  const width = 60 + Math.random() * 20;
  const x = Math.random() * (WIDTH - width);
  const type = Math.random() < 0.15 ? 'boost' : Math.random() < 0.2 ? 'fragile' : 'normal';
  platforms.push({ x, y, width, height: 10, type });
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Move Player
  if (pActive) {
    const diff = pX - pigX;
    pigVx = diff * 0.15;
  } else {
    if (keys.Left) pigVx -= 0.6;
    if (keys.Right) pigVx += 0.6;
    pigVx *= 0.88;
  }
  pigX += pigVx;
  
  // Wrap bounds
  if (pigX < -pigRadius) pigX = WIDTH + pigRadius;
  if (pigX > WIDTH + pigRadius) pigX = -pigRadius;

  // Apply gravity
  pigVy += GRAVITY;
  pigY += pigVy;

  // Track max height (score)
  const relativeY = HEIGHT - 150 - pigY;
  if (relativeY > maxPigHeight) {
    maxPigHeight = relativeY;
    updateScore(Math.floor(maxPigHeight * 0.1));
  }

  // Camera scroll
  if (pigY < HEIGHT * 0.4) {
    const diff = HEIGHT * 0.4 - pigY;
    pigY = HEIGHT * 0.4;
    cameraY += diff;
    platforms.forEach(p => p.y += diff);
    jumpParticles.forEach(pt => pt.y += diff);
  }

  // Spawn new platforms as old ones scroll off screen
  platforms.forEach((p, idx) => {
    if (p.y > HEIGHT) {
      platforms.splice(idx, 1);
      // Spawn new platform above the highest one
      let highestY = HEIGHT;
      platforms.forEach(pl => {
        if (pl.y < highestY) highestY = pl.y;
      });
      spawnPlatform(highestY - 90);
    }
  });

  // Collision with platforms (only when falling)
  if (pigVy > 0) {
    platforms.forEach((p, idx) => {
      if (
        pigX + pigRadius - 6 >= p.x &&
        pigX - pigRadius + 6 <= p.x + p.width &&
        pigY + pigRadius >= p.y &&
        pigY + pigRadius - pigVy <= p.y + p.height + 4
      ) {
        // Collided!
        if (p.type === 'fragile') {
          // Break platform, don't bounce
          platforms.splice(idx, 1);
          sound.playGameOver();
          spawnScoreTag(p.x + p.width/2, p.y, "💨 CRUMBLES!");
        } else if (p.type === 'boost') {
          // Mega jump
          pigVy = BOUNCE_VELOCITY * 1.8;
          sound.playCashChime();
          spawnScoreTag(pigX, pigY, "🚀 COFFEE BOOST!");
          // Particles
          for (let i = 0; i < 15; i++) {
            jumpParticles.push({
              x: pigX,
              y: pigY + pigRadius,
              vx: (Math.random() - 0.5) * 6,
              vy: Math.random() * 2 + 1,
              life: 30,
              color: '#ffcc00'
            });
          }
        } else {
          // Normal jump
          pigVy = BOUNCE_VELOCITY;
          sound.playDrop();
          // Particles
          for (let i = 0; i < 6; i++) {
            jumpParticles.push({
              x: pigX,
              y: pigY + pigRadius,
              vx: (Math.random() - 0.5) * 3,
              vy: Math.random() * 2,
              life: 20,
              color: '#34c759'
            });
          }
        }
      }
    });
  }

  // Update particles
  jumpParticles.forEach((p, idx) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) jumpParticles.splice(idx, 1);
  });

  // Check Game Over
  if (pigY - pigRadius > HEIGHT) {
    triggerGameOver();
  }
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple light grey background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw grid office background
  ctx.strokeStyle = '#e8e8ed';
  ctx.lineWidth = 1;
  const gridOffset = Math.floor(cameraY) % 50;
  for (let y = gridOffset; y < HEIGHT; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  // Draw platforms
  platforms.forEach(p => {
    if (p.type === 'boost') {
      ctx.fillStyle = '#ff9500'; // Orange boost
    } else if (p.type === 'fragile') {
      ctx.fillStyle = '#ff3b30'; // Red fragile folders
    } else {
      ctx.fillStyle = '#34c759'; // Green normal shelves
    }
    ctx.fillRect(p.x, p.y, p.width, p.height);
    // Draw folder tabs
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(p.x + 8, p.y + 2, 12, 6);
  });

  // Draw particles
  jumpParticles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 30;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  });
  ctx.globalAlpha = 1.0;

  // Draw Player Pig
  const img = textures['pig_eating'];
  if (img) {
    ctx.drawImage(img, pigX - pigRadius, pigY - pigRadius, pigRadius * 2, pigRadius * 2);
  } else {
    ctx.fillStyle = '#0071e3';
    ctx.beginPath();
    ctx.arc(pigX, pigY, pigRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  // HUD
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(20, 20, 130, 45);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(20, 20, 130, 45);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`HEIGHT: ${Math.floor(maxPigHeight)} M`, 28, 36);
  ctx.fillText(`SCORE:  ${Math.floor(maxPigHeight * 0.1)}`, 28, 50);

  // Sidebar Preview
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#34c759';
  pCtx.fillRect(20, 50, 60, 10);
  
  pCtx.fillStyle = '#1d1d1f';
  pCtx.font = 'bold 9px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText(`ALT: ${Math.floor(maxPigHeight)}m`, 50, 36);

  document.getElementById('next-label').innerText = '🦘 CLIMB ALTITUDE';
  document.getElementById('mobile-next-emoji').innerText = '🪜';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
