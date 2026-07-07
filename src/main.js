import { officeSlackChats } from './boss_messages.js';
import { sound } from './utils/sound.js';

// Import All 14 Games
import * as racing from './games/racing.js';
import * as papertoss from './games/papertoss.js';
import * as jetstriker from './games/jetstriker.js';
import * as doodlejump from './games/doodlejump.js';
import * as snake from './games/snake.js';
import * as brickbreaker from './games/brickbreaker.js';
import * as suika from './games/suika.js';
import * as sokoban from './games/sokoban.js';
import * as minesweeper from './games/minesweeper.js';
import * as whackamanager from './games/whackamanager.js';
import * as memory from './games/memory.js';
import * as flappypig from './games/flappypig.js';
import * as gomoku from './games/gomoku.js';
import * as farming from './games/farming.js';

const GAMES = {
  racing: racing,
  bungee: papertoss,     // Paper Toss replaces Bungee Jump
  catcher: jetstriker,   // Jet Striker replaces Catcher
  doodlejump: doodlejump,
  snake: snake,
  brickbreaker: brickbreaker,
  suika: suika,
  sokoban: sokoban,
  minesweeper: minesweeper,
  whackamanager: whackamanager,
  memory: memory,
  flappypig: flappypig,
  gomoku: gomoku,
  farming: farming
};

// IMAGE TIERS (Asset Preloader definitions)
const TIERS = [
  { id: 'siumai', url: 'assets/siumai.jpg' },
  { id: 'eggtart', url: 'assets/eggtart.jpg' },
  { id: 'pineapple_bun', url: 'assets/pineapplebun.jpg' },
  { id: 'pig_eating', url: 'assets/pig_eating.jpg' },
  { id: 'pig_normal', url: 'assets/pig_normal.jpg' },
  { id: 'pig_scared', url: 'assets/pig_scared.jpg' },
  { id: 'pig_splat', url: 'assets/pig_splat.jpg' }
];

const WIDTH = 420;
const HEIGHT = 600;

let activeGame = 'racing';
try {
  const params = new URLSearchParams(window.location.search);
  activeGame = params.get('game') || 'racing';
  if (!GAMES[activeGame]) activeGame = 'racing';
} catch (e) {
  activeGame = 'racing';
}

let score = 0;
let highscore = 0;
let isCamouflage = false;
let isGameOver = false;
let isStarting = true;

const textures = {};
let mainCanvas, ctx;
let previewCanvas, pCtx;

// Input controls
const keys = { Left: false, Right: false, Up: false };
let isPointerActive = false;
let pointerX = WIDTH / 2;
let pointerY = HEIGHT / 2;
let isPointerStart = false;
let isPointerEnd = false;

// Boss Alert system
let bossAlertActive = false;
let bossAlertTimeRemaining = 0;
let nextBossAlertInterval = 600; // frames before boss checks in (approx 10s)

// Load highscores from local storage
try {
  highscore = parseInt(localStorage.getItem(`stupidpig_highscore_${activeGame}`) || '0');
} catch (e) {}

// Preload assets
let loadedImagesCount = 0;
TIERS.forEach(tier => {
  const img = new Image();
  img.src = tier.url;
  img.onload = () => {
    textures[tier.id] = img;
    loadedImagesCount++;
    if (loadedImagesCount === TIERS.length) {
      bootstrapGame();
    }
  };
  img.onerror = () => {
    // Fallback if image fails, count loaded anyway
    loadedImagesCount++;
    if (loadedImagesCount === TIERS.length) {
      bootstrapGame();
    }
  };
});

function bootstrapGame() {
  mainCanvas = document.getElementById('game-canvas');
  if (!mainCanvas) return;
  ctx = mainCanvas.getContext('2d');
  
  previewCanvas = document.getElementById('preview-canvas');
  pCtx = previewCanvas.getContext('2d');

  const hsEl = document.getElementById('highscore-val');
  if (hsEl) hsEl.innerText = highscore;
  const mhsEl = document.getElementById('mobile-highscore-val');
  if (mhsEl) mhsEl.innerText = highscore;

  // Initialize selected game
  GAMES[activeGame].init(mainCanvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, addSystemLog, triggerGameOver);

  setupInputListeners();
  
  // Game loops
  requestAnimationFrame(gameLoop);
  
  // Slack Chats Interval
  setInterval(simulateSlackChat, 3000);
}

function updateScore(newScore) {
  score = newScore;
  const sEl = document.getElementById('score-val');
  if (sEl) sEl.innerText = score;
  const msEl = document.getElementById('mobile-score-val');
  if (msEl) msEl.innerText = score;

  if (score > highscore) {
    highscore = score;
    const hsEl = document.getElementById('highscore-val');
    if (hsEl) hsEl.innerText = highscore;
    const mhsEl = document.getElementById('mobile-highscore-val');
    if (mhsEl) mhsEl.innerText = highscore;

    try {
      localStorage.setItem(`stupidpig_highscore_${activeGame}`, highscore);
    } catch (e) {}
  }
}

function triggerGameOver() {
  isGameOver = true;
  const goEl = document.getElementById('gameover-overlay');
  if (goEl) goEl.style.display = 'flex';
  const fsEl = document.getElementById('final-score');
  if (fsEl) fsEl.innerText = score;
  const fhEl = document.getElementById('final-highscore');
  if (fhEl) fhEl.innerText = highscore;
}

function resetGame() {
  score = 0;
  const sEl = document.getElementById('score-val');
  if (sEl) sEl.innerText = score;
  isGameOver = false;
  isStarting = false;
  const goEl = document.getElementById('gameover-overlay');
  if (goEl) goEl.style.display = 'none';
  const soEl = document.getElementById('start-overlay');
  if (soEl) soEl.style.display = 'none';

  GAMES[activeGame].reset();
}

// Global Alert timer
function updateBossAlert() {
  if (isStarting || isGameOver || isCamouflage) return;

  if (bossAlertActive) {
    bossAlertTimeRemaining -= 1/60; // assume 60fps
    if (bossAlertTimeRemaining <= 0) {
      // Caught slacking!
      bossAlertActive = false;
      addSystemLog("💀 CAUGHT SLACKING! 老細捉到你偷懶！");
      sound.playGameOver();
      triggerGameOver();
    }
  } else {
    nextBossAlertInterval--;
    if (nextBossAlertInterval <= 0) {
      bossAlertActive = true;
      bossAlertTimeRemaining = 3.5 + Math.random() * 2; // 3.5 to 5.5 seconds to react
      nextBossAlertInterval = 600 + Math.random() * 800; // next check in ~10-20 seconds
      sound.playWarning();
    }
  }
}

function gameLoop() {
  if (!isCamouflage && !isGameOver && !isStarting) {
    // 1. Update Alert state
    updateBossAlert();

    // 2. Update active game module
    GAMES[activeGame].update(keys, pointerX, pointerY, isPointerActive, isPointerStart, isPointerEnd);
    isPointerStart = false;
    isPointerEnd = false;
  }

  // Draw active game
  GAMES[activeGame].render(pCtx, isStarting, isGameOver);

  // Render warning banners
  if (bossAlertActive) {
    drawBossAlertBanner();
  }

  // Render camouflage
  if (isCamouflage) {
    drawCamouflage();
  }

  requestAnimationFrame(gameLoop);
}

function drawBossAlertBanner() {
  const pulse = Math.abs(Math.sin(Date.now() * 0.01));
  ctx.strokeStyle = `rgba(255, 69, 58, ${0.4 + pulse * 0.5})`;
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = 'rgba(255, 69, 58, 0.95)';
  ctx.fillRect(0, 0, WIDTH, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`⚠️ 老細黎緊！撳 ESC / P 鍵變身工作狂！ (${bossAlertTimeRemaining.toFixed(1)}s)`, WIDTH / 2, 22);
}

function drawCamouflage() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  ctx.fillStyle = '#107c41'; // Excel theme green header banner
  ctx.fillRect(0, 0, WIDTH, 35);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('StupidPig_Q3_Project_Model.xlsx - Saved', 15, 22);

  // draw spreadsheet cells grid layout
  ctx.strokeStyle = '#d1d1d6';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#1d1d1f';
  ctx.font = '9px monospace';

  // Excel headers
  ctx.fillStyle = '#f3f2f1';
  ctx.fillRect(0, 35, 30, HEIGHT);
  ctx.fillRect(0, 35, WIDTH, 20);

  // col letter indicators
  const colsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  colsLetters.forEach((letter, i) => {
    ctx.fillStyle = '#1d1d1f';
    ctx.fillText(letter, 45 + i * 50, 48);
  });

  // row lines
  for (let y = 55; y < HEIGHT; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();

    const rowNum = Math.floor((y - 55) / 22) + 1;
    ctx.fillText(rowNum.toString(), 8, y + 14);
  }

  // col lines
  for (let x = 30; x < WIDTH; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 35);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }

  // Fake chart values
  ctx.fillStyle = '#107c41';
  ctx.fillRect(80, 100, 30, 80);
  ctx.fillRect(130, 100, 30, 120);
  ctx.fillRect(180, 100, 30, 150);

  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText("Q3 Slacking Productivity Index", 45, 90);
  ctx.fillText("Total Slack Hour: 4.8 H", 45, 275);
}

function setupInputListeners() {
  // Restart buttons
  const startBtn = document.getElementById('start-game-btn');
  if (startBtn) startBtn.onclick = () => resetGame();
  
  const restartBtn = document.getElementById('restart-game-btn');
  if (restartBtn) restartBtn.onclick = () => resetGame();

  // Keyboard input listeners
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.Left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.Right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
      keys.Up = true;
      if (activeGame === 'racing') {
        racing.triggerNitro();
      }
    }
    
    // Excel camouflage boss panic button (Space/Esc)
    if (e.key === 'Escape' || e.key === 'p') {
      isCamouflage = !isCamouflage;
      bossAlertActive = false;
      const camEl = document.getElementById('camouflage-overlay');
      if (camEl) {
        if (isCamouflage) camEl.classList.remove('hidden');
        else camEl.classList.add('hidden');
      }
      sound.playClick();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.Left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.Right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.Up = false;
  });

  // Tap/touch pointer interaction
  const handlePointerStart = (x, y) => {
    isPointerActive = true;
    isPointerStart = true;
    const rect = mainCanvas.getBoundingClientRect();
    pointerX = ((x - rect.left) / rect.width) * WIDTH;
    pointerY = ((y - rect.top) / rect.height) * HEIGHT;
  };

  const handlePointerMove = (x, y) => {
    const rect = mainCanvas.getBoundingClientRect();
    pointerX = ((x - rect.left) / rect.width) * WIDTH;
    pointerY = ((y - rect.top) / rect.height) * HEIGHT;
  };

  const handlePointerEnd = () => {
    isPointerActive = false;
    isPointerEnd = true;
  };

  mainCanvas.addEventListener('mousedown', (e) => handlePointerStart(e.clientX, e.clientY));
  mainCanvas.addEventListener('mousemove', (e) => {
    if (isPointerActive) handlePointerMove(e.clientX, e.clientY);
  });
  mainCanvas.addEventListener('mouseup', handlePointerEnd);
  mainCanvas.addEventListener('mouseleave', handlePointerEnd);

  mainCanvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      handlePointerStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  mainCanvas.addEventListener('touchmove', (e) => {
    if (isPointerActive && e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  mainCanvas.addEventListener('touchend', handlePointerEnd);

  const camEl = document.getElementById('camouflage-overlay');
  if (camEl) {
    camEl.onclick = () => {
      isCamouflage = false;
      camEl.classList.add('hidden');
      sound.playClick();
    };
  }
}

function addSystemLog(text) {
  const feed = document.getElementById('chat-feed-box');
  if (!feed) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-msg';
  bubble.style.backgroundColor = '#fff8e1';
  bubble.style.borderLeft = '3px solid #ffb300';
  bubble.innerHTML = `
    <span class="chat-user" style="color: #b8860b;">🔒 SYSTEM LOG</span>
    <span class="chat-text" style="font-style: italic;">${text}</span>
  `;
  feed.appendChild(bubble);
  feed.scrollTop = feed.scrollHeight;
}

function simulateSlackChat() {
  const feed = document.getElementById('chat-feed-box');
  if (!feed || isCamouflage) return;

  const chat = officeSlackChats[Math.floor(Math.random() * officeSlackChats.length)];
  const bubble = document.createElement('div');
  bubble.className = 'chat-msg';
  bubble.innerHTML = `
    <span class="chat-user">${chat.user}</span>
    <span class="chat-text">${chat.text}</span>
  `;
  feed.appendChild(bubble);
  feed.scrollTop = feed.scrollHeight;

  if (feed.children.length > 25) {
    feed.removeChild(feed.firstChild);
  }
}

function spawnScoreTag(x, y, text) {
  const wrapper = document.querySelector('.canvas-wrapper');
  if (!wrapper) return;
  const tag = document.createElement('div');
  tag.className = 'canvas-score-tag';
  tag.innerText = text;
  
  const rect = mainCanvas.getBoundingClientRect();
  const scaleX = rect.width / WIDTH;
  const scaleY = rect.height / HEIGHT;

  tag.style.left = `${x * scaleX}px`;
  tag.style.top = `${y * scaleY}px`;
  tag.style.color = text.includes('💥') || text.includes('OUCH') ? '#ff2d55' : '#ff9500';
  wrapper.appendChild(tag);

  setTimeout(() => {
    tag.style.transform = 'translate(-50%, -40px)';
    tag.style.opacity = '0';
  }, 10);

  setTimeout(() => tag.remove(), 1000);
}

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'STUPIDPIG_RESTART_GAME') {
    resetGame();
  }
});

// Dom Boot Handshake
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  bootstrapGame();
} else {
  document.addEventListener('DOMContentLoaded', bootstrapGame);
}
