let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

let pigY;
let pigVx = 0;
let pigVy = 0;
const pigX = 100;
const pigRadius = 18;
const GRAVITY = 0.28;
const FLAP_VELOCITY = -5.8;

let obstacles = []; // Pipe columns: { x, topHeight, bottomHeight, passed, width }
let localScore = 0;
let spawnTimer = 0;

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
  pigY = HEIGHT / 2;
  pigVy = 0;
  localScore = 0;
  spawnTimer = 0;
  obstacles = [];
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Bouncing/Flapping
  if (pStart || keys.Up) {
    if (keys.Up) keys.Up = false; // consume event
    pigVy = FLAP_VELOCITY;
    sound.playDrop();
  }

  // Physics
  pigVy += GRAVITY;
  pigY += pigVy;

  // Ground / Ceiling Collisions
  if (pigY - pigRadius < 0) {
    pigY = pigRadius;
    pigVy = 0;
  }
  if (pigY + pigRadius > HEIGHT - 20) {
    sound.playGameOver();
    triggerGameOver();
    return;
  }

  // Spawn Obstacles
  spawnTimer++;
  if (spawnTimer % 90 === 0) {
    const pipeWidth = 50;
    const gap = 130;
    const minHeight = 50;
    const maxHeight = HEIGHT - gap - minHeight - 60;
    const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
    const bottomHeight = HEIGHT - topHeight - gap;

    obstacles.push({
      x: WIDTH,
      topHeight,
      bottomHeight,
      width: pipeWidth,
      passed: false
    });
  }

  // Update Obstacles
  obstacles.forEach((obs, idx) => {
    obs.x -= 2.2; // scroll speed

    // Hit Collision checks
    if (
      pigX + pigRadius - 4 >= obs.x &&
      pigX - pigRadius + 4 <= obs.x + obs.width
    ) {
      if (pigY - pigRadius + 4 < obs.topHeight || pigY + pigRadius - 4 > HEIGHT - obs.bottomHeight) {
        // Hit!
        sound.playGameOver();
        triggerGameOver();
        return;
      }
    }

    // Pass check
    if (!obs.passed && obs.x + obs.width < pigX) {
      obs.passed = true;
      localScore += 50;
      updateScore(localScore);
      sound.playCashChime();
      spawnScoreTag(pigX, pigY - 20, "+50 🏆");
    }

    if (obs.x + obs.width < -10) {
      obstacles.splice(idx, 1);
    }
  });
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple light grey background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw grid background scrolling
  ctx.strokeStyle = '#e8e8ed';
  ctx.lineWidth = 1;
  const gridOffset = Math.floor(spawnTimer * 2.2) % 40;
  for (let x = -gridOffset; x < WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }

  // Draw Obstacles (Green filing cabinets/binders!)
  obstacles.forEach(o => {
    // Top column
    ctx.fillStyle = '#34c759';
    ctx.fillRect(o.x, 0, o.width, o.topHeight);
    ctx.fillStyle = '#107c41'; // rim edge
    ctx.fillRect(o.x - 2, o.topHeight - 12, o.width + 4, 12);

    // Bottom column
    ctx.fillStyle = '#34c759';
    ctx.fillRect(o.x, HEIGHT - o.bottomHeight, o.width, o.bottomHeight);
    ctx.fillStyle = '#107c41';
    ctx.fillRect(o.x - 2, HEIGHT - o.bottomHeight, o.width + 4, 12);
  });

  // Draw bottom floor warning line
  ctx.fillStyle = '#e8e8ed';
  ctx.fillRect(0, HEIGHT - 20, WIDTH, 20);
  ctx.strokeStyle = '#ff3b30';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT - 20);
  ctx.lineTo(WIDTH, HEIGHT - 20);
  ctx.stroke();

  // Draw Player Flappy Pig
  const pImg = textures['pig_scared'];
  if (pImg) {
    ctx.drawImage(pImg, pigX - pigRadius, pigY - pigRadius, pigRadius * 2, pigRadius * 2);
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
  ctx.fillText("FLAPPY ESCAPE", 28, 36);
  ctx.fillText(`SCORE: ${localScore}`, 28, 50);

  // Sidebar Preview
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#34c759';
  pCtx.font = 'bold 10px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText(`SCO: ${localScore}`, 50, 48);

  document.getElementById('next-label').innerText = '🪶 FLAP OBSTACLES';
  document.getElementById('mobile-next-emoji').innerText = '🪂';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
