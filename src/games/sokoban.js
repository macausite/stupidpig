let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

const TILE_SIZE = 40;
let gridOffset = { x: 50, y: 150 };

// Sokoban Level Map (1 = Wall, 2 = Target, 3 = Box, 4 = Player, 0 = Empty)
const LEVELS = [
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 3, 2, 0, 0, 4, 1],
    [1, 0, 2, 3, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ],
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 4, 0, 0, 1, 0, 0, 1],
    [1, 0, 3, 2, 0, 3, 2, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ]
];

let map = [];
let player = { x: 0, y: 0 };
let currentLevel = 0;
let movesCount = 0;
let localScore = 0;

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
  movesCount = 0;
  loadLevel(currentLevel);
}

function loadLevel(lvlIdx) {
  const template = LEVELS[lvlIdx % LEVELS.length];
  map = [];
  for (let r = 0; r < template.length; r++) {
    map.push([...template[r]]);
  }

  // Find player
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] === 4) {
        player = { x: c, y: r };
        map[r][c] = 0; // Clear start pos in grid map
      }
    }
  }
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  let dx = 0, dy = 0;
  if (keys.Left) { keys.Left = false; dx = -1; }
  if (keys.Right) { keys.Right = false; dx = 1; }
  if (keys.Up) { keys.Up = false; dy = -1; }
  
  // Custom screen tap triggers direction movement
  if (pStart) {
    const rx = pX - WIDTH / 2;
    const ry = pY - (HEIGHT - 100);
    if (Math.abs(rx) > Math.abs(ry)) {
      dx = rx > 0 ? 1 : -1;
    } else {
      dy = ry > 0 ? 1 : -1;
    }
  }

  if (dx !== 0 || dy !== 0) {
    const tx = player.x + dx;
    const ty = player.y + dy;

    // Check bounds
    if (ty >= 0 && ty < map.length && tx >= 0 && tx < map[ty].length) {
      const tile = map[ty][tx];
      if (tile === 0 || tile === 2) {
        // Move empty
        player.x = tx;
        player.y = ty;
        movesCount++;
        sound.playDrop();
      } else if (tile === 3) {
        // Push box! Check next tile
        const bx = tx + dx;
        const by = ty + dy;
        if (by >= 0 && by < map.length && bx >= 0 && bx < map[by].length) {
          const nextTile = map[by][bx];
          if (nextTile === 0 || nextTile === 2) {
            // Push box
            map[ty][tx] = nextTile === 2 ? 2 : 0; // restore target if box was on it
            map[by][bx] = 3;
            player.x = tx;
            player.y = ty;
            movesCount++;
            sound.playCashChime();

            // Check level clear
            checkLevelClear();
          }
        }
      }
    }
  }
}

function checkLevelClear() {
  // Check if any box is NOT on a target
  // A box is on a target if it overlapping a target position.
  // Wait! In map structure, box is 3. If target spots are 2,
  // we can check if targets are fully occupied.
  const template = LEVELS[currentLevel % LEVELS.length];
  let clear = true;

  for (let r = 0; r < template.length; r++) {
    for (let c = 0; c < template[r].length; c++) {
      if (template[r][c] === 2) {
        // Target spot: map[r][c] must be 3
        if (map[r][c] !== 3) {
          clear = false;
        }
      }
    }
  }

  if (clear) {
    localScore += 200;
    updateScore(localScore);
    spawnScoreTag(player.x * TILE_SIZE + gridOffset.x, player.y * TILE_SIZE + gridOffset.y, "🏆 CLEAR! 關卡完成！ +200");
    currentLevel++;
    setTimeout(() => loadLevel(currentLevel), 1000);
  }
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple light grey background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw board
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      const tile = map[r][c];
      const x = gridOffset.x + c * TILE_SIZE;
      const y = gridOffset.y + r * TILE_SIZE;

      if (tile === 1) {
        // Wall
        ctx.fillStyle = '#1d1d1f';
        ctx.fillRect(x, y, TILE_SIZE - 2, TILE_SIZE - 2);
      } else if (tile === 2) {
        // Target
        ctx.strokeStyle = '#ff9500';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 10, TILE_SIZE - 10);
      } else if (tile === 3) {
        // Box
        ctx.fillStyle = '#d2b48c'; // Cardboard Box
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 6, TILE_SIZE - 6);
        ctx.strokeStyle = '#b8860b';
        ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 6, TILE_SIZE - 6);
      } else {
        // Floor
        ctx.fillStyle = '#e8e8ed';
        ctx.fillRect(x, y, TILE_SIZE - 2, TILE_SIZE - 2);
      }
    }
  }

  // Draw Player
  const pImg = textures['pig_eating'];
  const px = gridOffset.x + player.x * TILE_SIZE;
  const py = gridOffset.y + player.y * TILE_SIZE;
  if (pImg) {
    ctx.drawImage(pImg, px, py, TILE_SIZE - 2, TILE_SIZE - 2);
  } else {
    ctx.fillStyle = '#0071e3';
    ctx.fillRect(px, py, TILE_SIZE - 2, TILE_SIZE - 2);
  }

  // HUD
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(20, 20, 130, 45);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(20, 20, 130, 45);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`MOVES: ${movesCount}`, 28, 36);
  ctx.fillText(`SCORE: ${localScore}`, 28, 50);

  // Sidebar Preview
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#ff9500';
  pCtx.font = 'bold 10px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText(`LVL: ${currentLevel + 1}`, 50, 48);

  document.getElementById('next-label').innerText = '📦 SOKOBAN STAGE';
  document.getElementById('mobile-next-emoji').innerText = '🗄️';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
