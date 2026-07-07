let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

const GRID_ROWS = 8;
const GRID_COLS = 8;
const CELL_SIZE = 35;
let boardOffset = { x: 70, y: 150 };

let board = []; // cell: { mine, revealed, flagged, count }
let gameOverTriggered = false;
let flagModeActive = false;
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
  gameOverTriggered = false;
  flagModeActive = false;
  localScore = 0;
  generateBoard();
}

function generateBoard() {
  board = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      row.push({ mine: false, revealed: false, flagged: false, count: 0 });
    }
    board.push(row);
  }

  // Plant 10 mines
  let minesPlanted = 0;
  while (minesPlanted < 10) {
    const r = Math.floor(Math.random() * GRID_ROWS);
    const c = Math.floor(Math.random() * GRID_COLS);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      minesPlanted++;
    }
  }

  // Calculate adjacent mine counts
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
            if (board[nr][nc].mine) count++;
          }
        }
      }
      board[r][c].count = count;
    }
  }
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Steer mode toggles with keys
  if (keys.Left) {
    keys.Left = false;
    flagModeActive = !flagModeActive;
    sound.playClick();
  }

  if (pStart) {
    // Check click coordinates relative to board
    const rx = pX - boardOffset.x;
    const ry = pY - boardOffset.y;

    const c = Math.floor(rx / CELL_SIZE);
    const r = Math.floor(ry / CELL_SIZE);

    if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
      const cell = board[r][c];
      
      if (flagModeActive) {
        // Toggle flag
        cell.flagged = !cell.flagged;
        sound.playDrop();
      } else {
        // Reveal cell
        if (cell.flagged || cell.revealed) return;
        cell.revealed = true;
        
        if (cell.mine) {
          // Explode!
          sound.playExplosion();
          revealAll();
          triggerGameOver();
        } else {
          sound.playClick();
          if (cell.count === 0) {
            revealEmptyNeighbors(r, c);
          }
          checkWinCondition();
        }
      }
    }
  }
}

function revealEmptyNeighbors(startR, startC) {
  const queue = [{ r: startR, c: startC }];
  while (queue.length > 0) {
    const { r, c } = queue.shift();
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
          const cell = board[nr][nc];
          if (!cell.revealed && !cell.mine && !cell.flagged) {
            cell.revealed = true;
            if (cell.count === 0) {
              queue.push({ r: nr, c: nc });
            }
          }
        }
      }
    }
  }
}

function revealAll() {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      board[r][c].revealed = true;
    }
  }
}

function checkWinCondition() {
  let won = true;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!board[r][c].mine && !board[r][c].revealed) {
        won = false;
      }
    }
  }

  if (won) {
    localScore += 500;
    updateScore(localScore);
    spawnScoreTag(WIDTH / 2, HEIGHT / 2, "🏆 WORKBOOK CLEARED! 報表完成！ +500");
    sound.playCashChime();
    setTimeout(reset, 2000);
  }
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple light grey background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw Grid
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = board[r][c];
      const x = boardOffset.x + c * CELL_SIZE;
      const y = boardOffset.y + r * CELL_SIZE;

      if (cell.revealed) {
        if (cell.mine) {
          ctx.fillStyle = '#ff3b30'; // red bomb
          ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👔', x + CELL_SIZE/2, y + CELL_SIZE/2 + 4);
        } else {
          ctx.fillStyle = '#e8e8ed'; // revealed floor
          ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          if (cell.count > 0) {
            ctx.fillStyle = ['#0071e3', '#34c759', '#ff3b30', '#5856d6', '#ff9500'][cell.count - 1] || '#ff2d55';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(cell.count.toString(), x + CELL_SIZE/2, y + CELL_SIZE/2 + 4);
          }
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        ctx.strokeStyle = '#d1d1d6';
        ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

        if (cell.flagged) {
          ctx.fillStyle = '#ff9500';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🚩', x + CELL_SIZE/2, y + CELL_SIZE/2 + 4);
        }
      }
    }
  }

  // Draw toggle button reminder
  ctx.fillStyle = '#8e8e93';
  ctx.font = '9px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`MODE: ${flagModeActive ? '🚩 FLAG (插旗模式)' : '🔍 DIG (挖開模式)'}`, WIDTH / 2, HEIGHT - 80);
  ctx.fillText("(撳 LEFT 鍵切換模式 / Click to interact)", WIDTH / 2, HEIGHT - 65);
  ctx.textAlign = 'left';

  // HUD
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(20, 20, 130, 45);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(20, 20, 130, 45);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText("BOMBS:  10", 28, 36);
  ctx.fillText(`SCORE:  ${localScore}`, 28, 50);

  // Sidebar Preview
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#ff3b30';
  pCtx.font = 'bold 10px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText('👔 BOSS', 50, 40);
  pCtx.fillText('10 DETECT', 50, 56);

  document.getElementById('next-label').innerText = '💣 WORK SCANNER';
  document.getElementById('mobile-next-emoji').innerText = '📁';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
