let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

const MERGE_TIERS = [
  { id: 'siumai', radius: 14, score: 4 },
  { id: 'eggtart', radius: 20, score: 8 },
  { id: 'pineapple_bun', radius: 28, score: 16 },
  { id: 'pig_normal', radius: 38, score: 32 },
  { id: 'pig_scared', radius: 50, score: 64 },
  { id: 'pig_eating', radius: 66, score: 128 },
  { id: 'pig_splat', radius: 84, score: 256 }
];

let items = [];
let currentTier = 0;
let nextTier = 0;
let dropperX;
let dangerTimer = 0;
const DANGER_LINE_Y = 120;
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
  items = [];
  currentTier = 0;
  nextTier = Math.floor(Math.random() * 3); // next item index (0 to 2)
  dropperX = WIDTH / 2;
  dangerTimer = 0;
  localScore = 0;
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Move dropper
  if (pActive) {
    dropperX = pX;
  }
  dropperX = Math.max(30, Math.min(WIDTH - 30, dropperX));

  // Drop on click release
  if (pEnd) {
    dropItem();
  }

  // Update physics for dropped items
  const gravity = 0.35;
  const bounce = 0.22;

  // Apply forces
  items.forEach(item => {
    item.vy += gravity;
    item.x += item.vx;
    item.y += item.vy;

    // Wall bounces
    if (item.x - item.radius < 10) {
      item.x = 10 + item.radius;
      item.vx = -item.vx * bounce;
    }
    if (item.x + item.radius > WIDTH - 10) {
      item.x = WIDTH - 10 - item.radius;
      item.vx = -item.vx * bounce;
    }
    if (item.y + item.radius > HEIGHT - 20) {
      item.y = HEIGHT - 20 - item.radius;
      item.vy = -item.vy * bounce;
      item.vx *= 0.95; // Ground friction
    }
  });

  // Resolve item collisions (elastic pushes)
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius;

      if (dist < minDist) {
        // Hitting same tier merges them!
        if (a.tierIndex === b.tierIndex) {
          mergeItems(i, j);
          return; // restart frame calculations to prevent out of bounds splice indexing
        }

        // Push away / Resolve overlapping
        const overlap = minDist - dist;
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        // Displace equally
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;

        // Bounce velocities
        const kx = a.vx - b.vx;
        const ky = a.vy - b.vy;
        const p = 2 * (nx * kx + ny * ky) / 2;
        a.vx -= nx * p * bounce;
        a.vy -= ny * p * bounce;
        b.vx += nx * p * bounce;
        b.vy += ny * p * bounce;
      }
    }
  }

  // Check Danger Overflow Line
  let overflow = false;
  items.forEach(item => {
    // If settled and resting above danger line
    if (item.y - item.radius < DANGER_LINE_Y && Math.abs(item.vy) < 0.8) {
      overflow = true;
    }
  });

  if (overflow) {
    dangerTimer++;
    document.getElementById('danger-line').style.display = 'block';
    if (dangerTimer >= 180) {
      // 3 seconds overflow -> Game Over!
      triggerGameOver();
    }
  } else {
    dangerTimer = 0;
    document.getElementById('danger-line').style.display = 'none';
  }
}

function dropItem() {
  const tier = MERGE_TIERS[currentTier];
  items.push({
    x: dropperX,
    y: DANGER_LINE_Y - 30,
    vx: 0,
    vy: 1,
    radius: tier.radius,
    tierIndex: currentTier
  });
  sound.playDrop();

  // Load next item
  currentTier = nextTier;
  nextTier = Math.floor(Math.random() * 3); // siumai, eggtart, pineapple
}

function mergeItems(i, j) {
  const a = items[i];
  const b = items[j];
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const nextTierIndex = a.tierIndex + 1;

  // Remove the two items
  items.splice(Math.max(i, j), 1);
  items.splice(Math.min(i, j), 1);

  sound.playMerge();

  // If not top tier, spawn merged item
  if (nextTierIndex < MERGE_TIERS.length) {
    const nextTierItem = MERGE_TIERS[nextTierIndex];
    items.push({
      x: midX,
      y: midY,
      vx: 0,
      vy: -1,
      radius: nextTierItem.radius,
      tierIndex: nextTierIndex
    });
    
    const reward = nextTierItem.score;
    localScore += reward;
    updateScore(localScore);
    spawnScoreTag(midX, midY, `🎉 UPGRADE! +${reward}`);
  } else {
    // Merged the ultimate item!
    localScore += 500;
    updateScore(localScore);
    spawnScoreTag(midX, midY, "🏆 ULTIMATE PIG! 笨豬王! +500");
  }
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple light grey background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Play container walls
  ctx.fillStyle = '#e8e8ed';
  ctx.fillRect(0, 0, 10, HEIGHT);
  ctx.fillRect(WIDTH - 10, 0, 10, HEIGHT);
  ctx.fillRect(0, HEIGHT - 20, WIDTH, 20);

  // Draw Warning Line
  ctx.strokeStyle = dangerTimer > 0 ? '#ff3b30' : 'rgba(255, 69, 58, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(10, DANGER_LINE_Y);
  ctx.lineTo(WIDTH - 10, DANGER_LINE_Y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw dropper guides
  if (!isGameOver) {
    ctx.strokeStyle = 'rgba(0, 113, 227, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dropperX, DANGER_LINE_Y - 40);
    ctx.lineTo(dropperX, HEIGHT - 20);
    ctx.stroke();

    // Draw active dropper item
    const activeTier = MERGE_TIERS[currentTier];
    const img = textures[activeTier.id];
    if (img) {
      ctx.drawImage(img, dropperX - activeTier.radius, DANGER_LINE_Y - 30 - activeTier.radius, activeTier.radius * 2, activeTier.radius * 2);
    } else {
      ctx.fillStyle = '#0071e3';
      ctx.beginPath();
      ctx.arc(dropperX, DANGER_LINE_Y - 30, activeTier.radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // Draw dropped items
  items.forEach(item => {
    const tier = MERGE_TIERS[item.tierIndex];
    const img = textures[tier.id];
    if (img) {
      ctx.drawImage(img, item.x - item.radius, item.y - item.radius, item.radius * 2, item.radius * 2);
    } else {
      ctx.fillStyle = '#8e8e93';
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  });

  // HUD
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(20, 20, 130, 45);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(20, 20, 130, 45);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`ITEMS: ${items.length}`, 28, 36);
  ctx.fillText(`SCORE: ${localScore}`, 28, 50);

  // Sidebar Preview next queue
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#1d1d1f';
  pCtx.font = 'bold 8px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText('NEXT:', 50, 28);
  
  const nextTierItem = MERGE_TIERS[nextTier];
  const nextImg = textures[nextTierItem.id];
  if (nextImg) {
    pCtx.drawImage(nextImg, 50 - nextTierItem.radius/2, 48 - nextTierItem.radius/2, nextTierItem.radius, nextTierItem.radius);
  } else {
    pCtx.fillStyle = '#0071e3';
    pCtx.beginPath();
    pCtx.arc(50, 48, nextTierItem.radius/2, 0, 2 * Math.PI);
    pCtx.fill();
  }

  document.getElementById('next-label').innerText = '🍍 NEXT ITEM';
  document.getElementById('mobile-next-emoji').innerText = '🥟';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
