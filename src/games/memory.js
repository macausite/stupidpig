let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

const CARD_SIZE = 65;
let gridOffset = { x: 50, y: 150 };

const ITEM_TYPES = ['siumai', 'eggtart', 'milktea', 'pineapple_bun', 'pig_normal', 'pig_scared', 'pig_eating', 'pig_splat'];

let cards = []; // card: { id, type, flipped, matched }
let selectedCards = [];
let localScore = 0;
let flipBackTimer = 0;

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
  selectedCards = [];
  flipBackTimer = 0;
  generateCards();
}

function generateCards() {
  // Create pairs
  const deck = [];
  ITEM_TYPES.forEach((type, idx) => {
    deck.push({ id: idx * 2, type: type, flipped: false, matched: false });
    deck.push({ id: idx * 2 + 1, type: type, flipped: false, matched: false });
  });

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  cards = deck;
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // If waiting to flip back, decrement timer
  if (flipBackTimer > 0) {
    flipBackTimer--;
    if (flipBackTimer <= 0) {
      selectedCards.forEach(c => c.flipped = false);
      selectedCards = [];
    }
    return;
  }

  if (pStart && selectedCards.length < 2) {
    const rx = pX - gridOffset.x;
    const ry = pY - gridOffset.y;

    // Grid size is 4x4
    const col = Math.floor(rx / (CARD_SIZE + 10));
    const row = Math.floor(ry / (CARD_SIZE + 10));

    if (row >= 0 && row < 4 && col >= 0 && col < 4) {
      const idx = row * 4 + col;
      const card = cards[idx];

      if (!card.flipped && !card.matched) {
        card.flipped = true;
        selectedCards.push(card);
        sound.playClick();

        if (selectedCards.length === 2) {
          checkMatch();
        }
      }
    }
  }
}

function checkMatch() {
  const [c1, c2] = selectedCards;
  if (c1.type === c2.type) {
    // Match!
    c1.matched = true;
    c2.matched = true;
    selectedCards = [];
    localScore += 100;
    updateScore(localScore);
    sound.playCashChime();
    spawnScoreTag(WIDTH / 2, HEIGHT - 120, "🎉 MATCHED! 配對成功！ +100");

    // Check Win
    if (cards.every(c => c.matched)) {
      setTimeout(() => {
        localScore += 500;
        updateScore(localScore);
        spawnScoreTag(WIDTH / 2, HEIGHT / 2, "🏆 BOARD CLEAR! 完美通關！ +500");
        setTimeout(reset, 2000);
      }, 1000);
    }
  } else {
    // No match -> flip back timer
    flipBackTimer = 45; // ~0.75 seconds delay
    sound.playGameOver();
  }
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple light grey background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw 4x4 cards grid
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c;
      const card = cards[idx];
      const x = gridOffset.x + c * (CARD_SIZE + 10);
      const y = gridOffset.y + r * (CARD_SIZE + 10);

      if (card.flipped || card.matched) {
        // Draw card face (item icon)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, CARD_SIZE, CARD_SIZE);
        ctx.strokeStyle = '#d1d1d6';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, CARD_SIZE, CARD_SIZE);

        const img = textures[card.type] || textures['siumai'];
        if (img) {
          ctx.drawImage(img, x + 8, y + 8, CARD_SIZE - 16, CARD_SIZE - 16);
        }
      } else {
        // Draw card back (Apple blue or grey cover)
        ctx.fillStyle = '#0071e3';
        ctx.fillRect(x, y, CARD_SIZE, CARD_SIZE);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, CARD_SIZE, CARD_SIZE);

        // Pattern inside card back
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + 12, y + 12, CARD_SIZE - 24, CARD_SIZE - 24);
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
  ctx.fillText("PAIRS GAME", 28, 36);
  ctx.fillText(`SCORE: ${localScore}`, 28, 50);

  // Sidebar Preview matches
  const matchedPairs = cards.filter(c => c.matched).length / 2;
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#0071e3';
  pCtx.font = 'bold 10px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText(`MATCH: ${matchedPairs}/8`, 50, 48);

  document.getElementById('next-label').innerText = '🃏 MEMORY MATCH';
  document.getElementById('mobile-next-emoji').innerText = '📇';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
