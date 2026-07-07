let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

const GRID_SIZE = 20;
let cols, rows;
let snake = [];
let dir = { x: 0, y: -1 };
let nextDir = { x: 0, y: -1 };
let food = null;
let gameSpeed = 10; // frames per step
let frameCount = 0;
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
  
  cols = Math.floor(WIDTH / GRID_SIZE);
  rows = Math.floor(HEIGHT / GRID_SIZE);
  reset();
}

export function reset() {
  const startX = Math.floor(cols / 2);
  const startY = Math.floor(rows / 2);
  snake = [
    { x: startX, y: startY },
    { x: startX, y: startY + 1 },
    { x: startX, y: startY + 2 }
  ];
  dir = { x: 0, y: -1 };
  nextDir = { x: 0, y: -1 };
  localScore = 0;
  spawnFood();
}

function spawnFood() {
  let valid = false;
  let fx, fy;
  while (!valid) {
    fx = Math.floor(Math.random() * (cols - 2)) + 1;
    fy = Math.floor(Math.random() * (rows - 4)) + 2;
    valid = true;
    for (let segment of snake) {
      if (segment.x === fx && segment.y === fy) {
        valid = false;
        break;
      }
    }
  }
  food = {
    x: fx,
    y: fy,
    type: Math.random() < 0.5 ? 'siumai' : 'eggtart'
  };
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Input direction changes
  if (keys.Left && dir.x === 0) nextDir = { x: -1, y: 0 };
  if (keys.Right && dir.x === 0) nextDir = { x: 1, y: 0 };
  if (keys.Up && dir.y === 0) nextDir = { x: 0, y: -1 };
  // Since keys only contains Left/Right/Up, let's map Down or screen swipe if needed
  
  // Screen Swipes (Swipe map)
  if (pActive) {
    const dx = pX - (WIDTH / 2);
    const dy = pY - (HEIGHT - 100);
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -30 && dir.x === 0) nextDir = { x: -1, y: 0 };
      if (dx > 30 && dir.x === 0) nextDir = { x: 1, y: 0 };
    } else {
      if (dy < -30 && dir.y === 0) nextDir = { x: 0, y: -1 };
      if (dy > 30 && dir.y === 0) nextDir = { x: 0, y: 1 };
    }
  }

  frameCount++;
  if (frameCount >= gameSpeed) {
    frameCount = 0;
    dir = nextDir;
    
    // Calculate new head
    const head = snake[0];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows) {
      sound.playGameOver();
      triggerGameOver();
      return;
    }

    // Body collision
    for (let segment of snake) {
      if (segment.x === newHead.x && segment.y === newHead.y) {
        sound.playGameOver();
        triggerGameOver();
        return;
      }
    }

    // Add head
    snake.unshift(newHead);

    // Food check
    if (newHead.x === food.x && newHead.y === food.y) {
      sound.playCashChime();
      const points = food.type === 'eggtart' ? 50 : 25;
      localScore += points;
      updateScore(localScore);
      spawnScoreTag(food.x * GRID_SIZE, food.y * GRID_SIZE, `+${points} 🥟`);
      spawnFood();
    } else {
      snake.pop();
    }
  }
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple style grid cell background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle grid cells
  ctx.strokeStyle = '#e8e8ed';
  ctx.lineWidth = 0.5;
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * GRID_SIZE, 0);
    ctx.lineTo(c * GRID_SIZE, HEIGHT);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * GRID_SIZE);
    ctx.lineTo(WIDTH, r * GRID_SIZE);
    ctx.stroke();
  }

  // Draw food
  if (food) {
    const img = textures[food.type];
    if (img) {
      ctx.drawImage(img, food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    } else {
      ctx.fillStyle = '#ff9500';
      ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    }
  }

  // Draw Snake
  snake.forEach((segment, idx) => {
    if (idx === 0) {
      // Head (Happy Pig face if available)
      const pImg = textures['pig_eating'];
      if (pImg) {
        ctx.drawImage(pImg, segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      } else {
        ctx.fillStyle = '#0071e3';
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      }
    } else {
      // Body folders
      ctx.fillStyle = '#8e8e93';
      ctx.fillRect(segment.x * GRID_SIZE + 2, segment.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
      // Folder tabs
      ctx.fillStyle = '#c7c7cc';
      ctx.fillRect(segment.x * GRID_SIZE + 4, segment.y * GRID_SIZE + 2, 6, 2);
    }
  });

  // HUD
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(20, 20, 130, 45);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(20, 20, 130, 45);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`LENGTH: ${snake.length}`, 28, 36);
  ctx.fillText(`SCORE:  ${localScore}`, 28, 50);

  // Sidebar Preview
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#0071e3';
  pCtx.font = 'bold 10px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText(`LEN: ${snake.length}`, 50, 48);

  document.getElementById('next-label').innerText = '🍏 SNAKE LENGTH';
  document.getElementById('mobile-next-emoji').innerText = '🐍';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
