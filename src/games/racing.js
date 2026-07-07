let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

let raceX;
let raceY;
let raceRadius = 22;
let raceVx = 0;
let raceSpeed = 4;
let targetRaceSpeed = 4;
let raceDistance = 0;
let raceObstacles = [];
let raceCollectibles = [];
let raceSpeedLines = [];
let raceParticles = [];
let raceSkidMarks = [];
let raceScenery = [];
let raceNitro = 40;
let raceNitroActive = false;
let raceNitroTime = 0;

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
  raceX = WIDTH / 2;
  raceY = HEIGHT - 100;
  raceVx = 0;
  raceSpeed = 4;
  raceDistance = 0;
  raceObstacles = [];
  raceCollectibles = [];
  raceParticles = [];
  raceSkidMarks = [];
  raceScenery = [];
  raceNitro = 40;
  raceNitroActive = false;
  raceNitroTime = 0;
  raceSpeedLines = [];
  for (let i = 0; i < 6; i++) {
    raceSpeedLines.push({ x: WIDTH / 2, y: i * 120, length: 40 });
  }
}

export function triggerNitro() {
  if (raceNitro >= 100 && !raceNitroActive) {
    raceNitroActive = true;
    raceNitroTime = 180;
    sound.playDrop();
  }
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Nitro updates
  if (raceNitroActive) {
    targetRaceSpeed = 11;
    raceNitroTime--;
    raceNitro = Math.max(0, (raceNitroTime / 180) * 100);
    if (raceNitroTime <= 0) raceNitroActive = false;
  } else {
    const baseSpeed = 4;
    targetRaceSpeed = baseSpeed;
    raceNitro = Math.min(100, raceNitro + 0.06);
  }

  raceSpeed += (targetRaceSpeed - raceSpeed) * 0.1;
  raceDistance += raceSpeed * 0.05;
  const currentScore = Math.floor(raceDistance * 10);
  updateScore(currentScore);

  // Steer Player
  if (pActive) {
    const diff = pX - raceX;
    raceVx = diff * 0.15;
  } else {
    if (keys.Left) raceVx -= 0.6;
    if (keys.Right) raceVx += 0.6;
    raceVx *= 0.88;
  }
  raceX += raceVx;
  raceX = Math.max(raceRadius + 20, Math.min(WIDTH - raceRadius - 20, raceX));

  // Skid Marks
  if (Math.abs(raceVx) > 3.5) {
    raceSkidMarks.push({ x: raceX - 10, y: raceY + raceRadius - 4 });
    raceSkidMarks.push({ x: raceX + 10, y: raceY + raceRadius - 4 });
    if (raceSkidMarks.length > 80) raceSkidMarks.shift();
  }

  // Update speed lines background
  raceSpeedLines.forEach(line => {
    line.y += raceSpeed;
    if (line.y > HEIGHT) line.y = -line.length;
  });

  // Spawn Obstacles (Printers, trash cans)
  if (Math.random() < 0.02 && raceObstacles.length < 5) {
    const radius = 15 + Math.random() * 10;
    const type = Math.random() < 0.3 ? 'boss' : Math.random() < 0.65 ? 'copier' : 'trash';
    raceObstacles.push({
      x: 30 + Math.random() * (WIDTH - 60),
      y: -50,
      radius: radius,
      type: type,
      speed: 0
    });
  }

  // Update Obstacles
  raceObstacles.forEach((obs, idx) => {
    obs.y += raceSpeed;
    const dx = obs.x - raceX;
    const dy = obs.y - raceY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < obs.radius + raceRadius) {
      raceObstacles.splice(idx, 1);
      sound.playGameOver();

      if (obs.type === 'boss') {
        triggerGameOver();
      } else {
        const penalty = Math.floor(raceDistance * 0.15);
        raceDistance = Math.max(0, raceDistance - penalty);
        spawnScoreTag(obs.x, obs.y, "💥 SMASH! 撞飛！");
      }
    }
  });
  raceObstacles = raceObstacles.filter(o => o.y < HEIGHT + 50);

  // Spawn Collectibles (Milk Tea, Dim Sum)
  if (Math.random() < 0.015 && raceCollectibles.length < 4) {
    const isTea = Math.random() < 0.4;
    raceCollectibles.push({
      x: 30 + Math.random() * (WIDTH - 60),
      y: -50,
      radius: 12,
      type: isTea ? 'milktea' : Math.random() < 0.5 ? 'siumai' : 'eggtart'
    });
  }

  // Update Collectibles
  raceCollectibles.forEach((item, idx) => {
    item.y += raceSpeed;
    const dx = item.x - raceX;
    const dy = item.y - raceY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < item.radius + raceRadius) {
      raceCollectibles.splice(idx, 1);
      sound.playCashChime();
      if (item.type === 'milktea') {
        raceNitro = Math.min(100, raceNitro + 25);
        spawnScoreTag(item.x, item.y, "☕ 奶茶+25% Nitro!");
      } else {
        const reward = item.type === 'eggtart' ? 50 : 25;
        raceDistance += reward * 0.1;
        spawnScoreTag(item.x, item.y, `+${reward} 分 🥟`);
      }
    }
  });
  raceCollectibles = raceCollectibles.filter(c => c.y < HEIGHT + 50);

  // Spawn Scenery (Wall/Decorations)
  if (Math.random() < 0.02 && raceScenery.length < 6) {
    const types = ["💻", "🖨️", "🏢", "☕", "🗄️", "🪴"];
    const side = Math.random() < 0.5;
    raceScenery.push({
      x: side ? 10 : WIDTH - 10,
      y: -30,
      type: types[Math.floor(Math.random() * types.length)]
    });
  }

  // Update Scenery
  raceScenery.forEach((s, idx) => {
    s.y += raceSpeed;
    if (s.y > HEIGHT + 40) raceScenery.splice(idx, 1);
  });

  // Sparks/Particles
  if (raceNitroActive || Math.abs(raceVx) > 3) {
    raceParticles.push({
      x: raceX + (Math.random() - 0.5) * 20,
      y: raceY + raceRadius,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      life: 30,
      color: raceNitroActive ? '#ff2d55' : '#0071e3'
    });
  }
  raceParticles.forEach((p, idx) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) raceParticles.splice(idx, 1);
  });
}

export function render(pCtx, isStarting, isGameOver) {
  // 1. Draw light grey asphalt
  ctx.fillStyle = '#e5e5ea';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw side lanes
  ctx.fillStyle = '#d1d1d6';
  ctx.fillRect(0, 0, 20, HEIGHT);
  ctx.fillRect(WIDTH - 20, 0, 20, HEIGHT);

  // Draw curbs
  const curbHeight = 40;
  const step = Math.floor(raceDistance * 10) % (curbHeight * 2);
  ctx.fillStyle = '#ff3b30';
  for (let y = -curbHeight*2 + step; y < HEIGHT; y += curbHeight*2) {
    ctx.fillRect(16, y, 4, curbHeight);
    ctx.fillRect(WIDTH - 20, y, 4, curbHeight);
  }
  ctx.fillStyle = '#ffffff';
  for (let y = -curbHeight*2 + step + curbHeight; y < HEIGHT; y += curbHeight*2) {
    ctx.fillRect(16, y, 4, curbHeight);
    ctx.fillRect(WIDTH - 20, y, 4, curbHeight);
  }

  // 2. Draw road broken line dashes
  ctx.fillStyle = '#ffffff';
  raceSpeedLines.forEach(line => {
    ctx.fillRect(WIDTH / 2 - 4, line.y, 8, line.length);
  });

  // 3. Draw Skid Marks
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  raceSkidMarks.forEach(s => {
    ctx.fillRect(s.x - 2, s.y, 4, 8);
  });

  // 4. Draw Scenery on road side shoulders
  raceScenery.forEach(s => {
    ctx.fillStyle = '#1d1d1f';
    ctx.font = '16px sans-serif';
    ctx.fillText(s.type, s.x - 8, s.y);
  });

  // 5. Draw Collectibles (Siumai, Eggtarts)
  raceCollectibles.forEach(c => {
    const img = textures[c.type];
    if (img) {
      ctx.drawImage(img, c.x - c.radius, c.y - c.radius, c.radius * 2, c.radius * 2);
    } else if (c.type === 'milktea') {
      ctx.fillStyle = '#d2b48c';
      ctx.fillRect(c.x - 10, c.y - 12, 20, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.x - 12, c.y - 16, 24, 4);
    }
  });

  // 6. Draw Obstacles
  raceObstacles.forEach(o => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.arc(o.x - 3, o.y + o.radius - 2, o.radius, 0, 2 * Math.PI);
    ctx.fill();

    if (o.type === 'boss') {
      const img = textures['pig_splat'];
      if (img) ctx.drawImage(img, o.x - o.radius, o.y - o.radius, o.radius * 2, o.radius * 2);
      ctx.strokeStyle = 'rgba(255, 69, 58, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.radius + 6, 0, 2 * Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = o.type === 'copier' ? '#8e8e93' : '#d1d1d6';
      ctx.fillRect(o.x - o.radius, o.y - o.radius, o.radius * 2, o.radius * 2);
    }
  });

  // 7. Draw Sparks
  raceParticles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 30;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(1, p.life * 0.15), 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;

  // 8. Draw Player (Happy chair pig)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.arc(raceX - 4, raceY + raceRadius - 2, raceRadius, 0, 2 * Math.PI);
  ctx.fill();

  const pImg = textures['pig_eating'];
  if (pImg) {
    ctx.drawImage(pImg, raceX - raceRadius, raceY - raceRadius, raceRadius * 2, raceRadius * 2);
  }
  ctx.fillStyle = '#1d1d1f';
  ctx.fillRect(raceX - raceRadius, raceY + raceRadius - 6, 6, 6);
  ctx.fillRect(raceX + raceRadius - 6, raceY + raceRadius - 6, 6, 6);

  // 9. Nitro overlay
  if (raceNitroActive) {
    const pulse = Math.abs(Math.sin(Date.now() * 0.015));
    ctx.strokeStyle = `rgba(255, 45, 85, ${0.3 + pulse * 0.4})`;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, WIDTH - 8, HEIGHT - 8);
  }

  // 10. HUD overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(20, 20, 130, 60);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(20, 20, 130, 60);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`SPEED: ${Math.floor(raceSpeed * 22)} KM/H`, 28, 36);
  ctx.fillText(`DIST:  ${Math.floor(raceDistance)} M`, 28, 48);
  ctx.fillText(`SCORE: ${Math.floor(raceDistance * 10)}`, 28, 60);

  // Progress Nitro
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(WIDTH - 150, 20, 130, 30);
  ctx.strokeRect(WIDTH - 150, 20, 130, 30);
  ctx.fillStyle = '#e8e8ed';
  ctx.fillRect(WIDTH - 142, 34, 114, 10);
  ctx.fillStyle = raceNitroActive ? '#ff2d55' : raceNitro >= 100 ? '#34c759' : '#0071e3';
  ctx.fillRect(WIDTH - 142, 34, Math.floor(1.14 * raceNitro), 10);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = '8px -apple-system, sans-serif';
  ctx.fillText(raceNitroActive ? 'BOOSTING ⚡' : raceNitro >= 100 ? 'READY [UP ARROW]' : 'CHARGING MILK TEA', WIDTH - 142, 28);

  // Render Sidebar preview state
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#0071e3';
  pCtx.beginPath();
  pCtx.arc(50, 50, 22, 0, 2 * Math.PI);
  pCtx.fill();
  pCtx.strokeStyle = '#ffffff';
  pCtx.lineWidth = 2;
  pCtx.stroke();

  pCtx.fillStyle = '#1d1d1f';
  pCtx.font = 'bold 12px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText(`${Math.floor(raceSpeed * 22)} km/h`, 50, 48);

  document.getElementById('next-label').innerText = raceNitroActive ? '⚡ NITRO ACTIVE' : '⏱️ RACER SPEED';
  document.getElementById('mobile-next-emoji').innerText = '🏎️';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
