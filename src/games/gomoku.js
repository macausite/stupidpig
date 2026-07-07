let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

const BOARD_SIZE = 11; // 11x11 Gomoku board (fits perfectly in 420x600 canvas)
const TILE_SIZE = 30;
let boardOffset = { x: 45, y: 150 };

let board = []; // 0 = empty, 1 = player (X/Black), 2 = AI (O/White)
let currentPlayer = 1; // 1 = player, 2 = AI
let gameOverState = false;
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
  gameOverState = false;
  localScore = 0;
  board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      row.push(0);
    }
    board.push(row);
  }
  currentPlayer = 1;
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  if (gameOverState) return;

  if (currentPlayer === 1 && pStart) {
    const rx = pX - boardOffset.x;
    const ry = pY - boardOffset.y;

    const c = Math.round(rx / TILE_SIZE);
    const r = Math.round(ry / TILE_SIZE);

    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      if (board[r][c] === 0) {
        board[r][c] = 1;
        sound.playDrop();
        
        if (checkWin(r, c, 1)) {
          gameOverState = true;
          localScore += 300;
          updateScore(localScore);
          sound.playCashChime();
          spawnScoreTag(boardOffset.x + c * TILE_SIZE, boardOffset.y + r * TILE_SIZE - 20, "🏆 YOU WIN! 你贏咗！ +300");
          return;
        }

        currentPlayer = 2; // AI Turn
        setTimeout(makeAIMove, 600); // slight delay for natural slacking response
      }
    }
  }
}

function makeAIMove() {
  if (gameOverState) return;

  // AI Logic: Find best spot to win or block player Connect 5
  let bestScore = -1;
  let bestR = -1;
  let bestC = -1;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) {
        const scoreVal = evaluateSpot(r, c);
        if (scoreVal > bestScore) {
          bestScore = scoreVal;
          bestR = r;
          bestC = c;
        }
      }
    }
  }

  if (bestR !== -1 && bestC !== -1) {
    board[bestR][bestC] = 2;
    sound.playDrop();

    if (checkWin(bestR, bestC, 2)) {
      gameOverState = true;
      sound.playGameOver();
      spawnScoreTag(boardOffset.x + bestC * TILE_SIZE, boardOffset.y + bestR * TILE_SIZE - 20, "💀 AI WIN! 老細嬴左！");
      return;
    }

    currentPlayer = 1;
  }
}

function evaluateSpot(r, c) {
  // Simple heuristic weight
  let scoreVal = 0;

  // 1. Attack weight (AI trying to connect thumbtacks)
  scoreVal += checkConsecutive(r, c, 2) * 1.5;

  // 2. Defense weight (AI blocking Player thumbtacks)
  scoreVal += checkConsecutive(r, c, 1);

  return scoreVal;
}

function checkConsecutive(r, c, pType) {
  const dirs = [
    { dr: 1, dc: 0 }, // vertical
    { dr: 0, dc: 1 }, // horizontal
    { dr: 1, dc: 1 }, // diagonal down-right
    { dr: 1, dc: -1 } // diagonal down-left
  ];

  let maxConsecutive = 0;

  dirs.forEach(d => {
    let count = 0;
    // Positive dir
    for (let i = 1; i <= 4; i++) {
      const nr = r + d.dr * i;
      const nc = c + d.dc * i;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === pType) {
        count++;
      } else {
        break;
      }
    }
    // Negative dir
    for (let i = 1; i <= 4; i++) {
      const nr = r - d.dr * i;
      const nc = c - d.dc * i;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === pType) {
        count++;
      } else {
        break;
      }
    }
    if (count > maxConsecutive) maxConsecutive = count;
  });

  return maxConsecutive;
}

function checkWin(r, c, pType) {
  const dirs = [
    { dr: 1, dc: 0 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 }
  ];

  for (let d of dirs) {
    let count = 1; // include current spot
    // Positive
    for (let i = 1; i <= 4; i++) {
      const nr = r + d.dr * i;
      const nc = c + d.dc * i;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === pType) {
        count++;
      } else {
        break;
      }
    }
    // Negative
    for (let i = 1; i <= 4; i++) {
      const nr = r - d.dr * i;
      const nc = c - d.dc * i;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === pType) {
        count++;
      } else {
        break;
      }
    }
    if (count >= 5) return true;
  }
  return false;
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple light grey background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw Gomoku wood/corkboard grid lines
  ctx.strokeStyle = '#8e8e93';
  ctx.lineWidth = 1;
  for (let i = 0; i < BOARD_SIZE; i++) {
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(boardOffset.x + i * TILE_SIZE, boardOffset.y);
    ctx.lineTo(boardOffset.x + i * TILE_SIZE, boardOffset.y + (BOARD_SIZE - 1) * TILE_SIZE);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(boardOffset.x, boardOffset.y + i * TILE_SIZE);
    ctx.lineTo(boardOffset.x + (BOARD_SIZE - 1) * TILE_SIZE, boardOffset.y + i * TILE_SIZE);
    ctx.stroke();
  }

  // Draw checkers (Black/White thumbtacks)
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const tile = board[r][c];
      const x = boardOffset.x + c * TILE_SIZE;
      const y = boardOffset.y + r * TILE_SIZE;

      if (tile === 1) {
        // Player: Black tack
        ctx.fillStyle = '#1d1d1f';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (tile === 2) {
        // AI: White tack
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#8e8e93';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // Draw whose turn
  ctx.fillStyle = '#8e8e93';
  ctx.font = '9px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(gameOverState ? "遊戲結束" : currentPlayer === 1 ? "🔴 你的回合 (Your Turn)" : "⚪ 老細/同事思考中...", WIDTH / 2, HEIGHT - 80);
  ctx.textAlign = 'left';

  // HUD
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(20, 20, 130, 45);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(20, 20, 130, 45);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText("SLACKING GOMOKU", 28, 36);
  ctx.fillText(`SCORE: ${localScore}`, 28, 50);

  // Sidebar Preview
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#1d1d1f';
  pCtx.font = 'bold 10px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText('⚪ CONNECT 5', 50, 48);

  document.getElementById('next-label').innerText = '⚪ CONNECT GOMOKU';
  document.getElementById('mobile-next-emoji').innerText = '🏁';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
