let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

const GRID_COLS = 3;
const GRID_ROWS = 3;
const CELL_SIZE = 80;
let gridOffset = { x: 90, y: 150 };

// Holes containing: { type: 'none'|'manager'|'coffee', timer: 0, hit: false }
let holes = [];
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
  localScore = 0;
  spawnTimer = 0;
  holes = [];
  for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
    holes.push({ type: 'none', timer: 0, hit: false });
  }
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Update popup timers
  holes.forEach(hole => {
    if (hole.type !== 'none') {
      hole.timer--;
      if (hole.timer <= 0) {
        hole.type = 'none';
        hole.hit = false;
      }
    }
  });

  // Spawn popups
  spawnTimer++;
  if (spawnTimer % 35 === 0) {
    const emptyHoles = [];
    holes.forEach((h, idx) => {
      if (h.type === 'none') emptyHoles.push(idx);
    });

    if (emptyHoles.length > 0) {
      const idx = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
      const type = Math.random() < 0.25 ? 'coffee' : 'manager';
      holes[idx] = {
        type: type,
        timer: 60 + Math.random() * 30, // visible for ~1.5s
        hit: false
      };
    }
  }

  // Check clicks
  if (pStart) {
    holes.forEach((hole, idx) => {
      if (hole.type === 'none' || hole.hit) return;

      const r = Math.floor(idx / GRID_COLS);
      const c = idx % GRID_COLS;
      const x = gridOffset.x + c * (CELL_SIZE + 10) + CELL_SIZE / 2;
      const y = gridOffset.y + r * (CELL_SIZE + 10) + CELL_SIZE / 2;

      const dx = pX - x;
      const dy = pY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CELL_SIZE / 2) {
        hole.hit = true;
        
        if (hole.type === 'manager') {
          sound.playExplosion();
          localScore += 50;
          updateScore(localScore);
          spawnScoreTag(x, y - 20, "💥 WHACK! +50");
        } else if (hole.type === 'coffee') {
          sound.playGameOver();
          localScore = Math.max(0, localScore - 100);
          updateScore(localScore);
          spawnScoreTag(x, y - 20, "☕ COFFEE SPILT! -100");
        }
      }
    });
  }
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple light grey background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw 3x3 holes (office cubicles)
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const x = gridOffset.x + c * (CELL_SIZE + 10);
      const y = gridOffset.y + r * (CELL_SIZE + 10);
      const idx = r * GRID_COLS + c;
      const hole = holes[idx];

      // Draw cubicle walls
      ctx.fillStyle = '#e8e8ed';
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = '#d1d1d6';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

      // Draw popup content
      if (hole.type !== 'none') {
        const cx = x + CELL_SIZE / 2;
        const cy = y + CELL_SIZE / 2;
        
        if (hole.type === 'manager') {
          // Draw Boss head shape
          ctx.fillStyle = hole.hit ? '#ff3b30' : '#ff9500';
          ctx.beginPath();
          ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(hole.hit ? '💢' : '👔', cx, cy + 5);
        } else if (hole.type === 'coffee') {
          // Coffee cup shape
          ctx.fillStyle = '#d2b48c';
          ctx.fillRect(cx - 10, cy - 8, 20, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 12, cy - 12, 24, 4);
          if (hole.hit) {
            ctx.fillStyle = '#ff3b30';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('☕ SPILT', cx - 18, cy + 22);
          }
        }
      }
    }
  }

  // HUD
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(20, 20, 130, 45);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(20, 20, 130, 45);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText("TARGET: BOSSES", 28, 36);
  ctx.fillText(`SCORE:  ${localScore}`, 28, 50);

  // Sidebar Preview
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#ff9500';
  pCtx.font = 'bold 12px Arial';
  pCtx.textAlign = 'center';
  pCtx.fillText('👔 WHACK!', 50, 48);

  document.getElementById('next-label').innerText = '🎯 CUBICLE ALERTS';
  document.getElementById('mobile-next-emoji').innerText = '🏢';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
