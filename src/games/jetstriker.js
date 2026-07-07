let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, addSystemLog, triggerGameOver;

let jetX;
let jetY;
let jetRadius = 20;
let jetBullets = [];
let jetEnemies = [];
let jetEnemyBullets = [];
let jetEnemySpawnTimer = 0;
let jetLives = 3;
let jetTripleShotTimer = 0;
let jetParticles = [];
let jetBossActive = false;
let jetBossHp = 100;
let jetBossMaxHp = 100;
let jetBossX;
let jetBossY = -100;
let jetBossDirection = 1;
let jetBossShootTimer = 0;
let jetShootCooldown = 0;
let jetPowerups = [];

const GRAVITY = 0.28;

export function init(_canvas, _ctx, _textures, _width, _height, _sound, _updateScore, _spawnScoreTag, _addSystemLog, _triggerGameOver) {
  canvas = _canvas;
  ctx = _ctx;
  textures = _textures;
  WIDTH = _width;
  HEIGHT = _height;
  sound = _sound;
  updateScore = _updateScore;
  spawnScoreTag = _spawnScoreTag;
  addSystemLog = _addSystemLog;
  triggerGameOver = _triggerGameOver;
  reset();
}

export function reset() {
  jetX = WIDTH / 2;
  jetY = HEIGHT - 70;
  jetBullets = [];
  jetEnemies = [];
  jetEnemyBullets = [];
  jetEnemySpawnTimer = 0;
  jetLives = 3;
  jetTripleShotTimer = 0;
  jetParticles = [];
  jetBossActive = false;
  jetBossHp = 100;
  jetBossX = WIDTH / 2;
  jetBossY = -100;
  jetBossDirection = 1;
  jetBossShootTimer = 0;
  jetShootCooldown = 0;
  jetPowerups = [];
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Update particles
  jetParticles.forEach((p, idx) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) jetParticles.splice(idx, 1);
  });

  // Move Jet Fighter
  if (pActive) {
    jetX += (pX - jetX) * 0.2;
  } else {
    if (keys.Left) jetX -= 6;
    if (keys.Right) jetX += 6;
  }
  jetX = Math.max(jetRadius + 20, Math.min(WIDTH - jetRadius - 20, jetX));

  // Automatic shooting
  jetShootCooldown--;
  if (jetShootCooldown <= 0) {
    jetShootCooldown = 12;
    sound.playClick();

    if (jetTripleShotTimer > 0) {
      jetBullets.push({ x: jetX, y: jetY - 15, vx: 0, vy: -7 });
      jetBullets.push({ x: jetX, y: jetY - 15, vx: -2, vy: -6.5 });
      jetBullets.push({ x: jetX, y: jetY - 15, vx: 2, vy: -6.5 });
      jetTripleShotTimer--;
    } else {
      jetBullets.push({ x: jetX, y: jetY - 15, vx: 0, vy: -7.5 });
    }
  }

  // Update Player Bullets
  jetBullets.forEach((b, idx) => {
    b.x += b.vx;
    b.y += b.vy;
    if (b.y < -20 || b.x < -10 || b.x > WIDTH + 10) {
      jetBullets.splice(idx, 1);
    }
  });

  // Spawn Enemies & Boss
  jetEnemySpawnTimer++;
  let scoreVal = parseInt(document.getElementById('score-val').innerText || '0');

  if (!jetBossActive && scoreVal < 800) {
    if (jetEnemySpawnTimer % 50 === 0) {
      const isLarge = Math.random() < 0.3;
      jetEnemies.push({
        x: 30 + Math.random() * (WIDTH - 60),
        y: -30,
        radius: isLarge ? 20 : 13,
        hp: isLarge ? 3 : 1,
        maxHp: isLarge ? 3 : 1,
        type: isLarge ? 'copier' : Math.random() < 0.5 ? 'computer' : 'mug',
        speed: isLarge ? 1.5 : 2.5 + Math.random() * 1.5
      });
    }
  } else if (scoreVal >= 800 && !jetBossActive && jetEnemies.length === 0) {
    jetBossActive = true;
    jetBossHp = 100;
    jetBossMaxHp = 100;
    jetBossX = WIDTH / 2;
    jetBossY = -100;
    jetBossDirection = 1;
    jetBossShootTimer = 0;
    addSystemLog("⚠️ BOSS INCOMING! 老細親自落場督師！");
  }

  // Update Boss
  if (jetBossActive) {
    if (jetBossY < 100) {
      jetBossY += 1.5;
    } else {
      jetBossX += 1.6 * jetBossDirection;
      if (jetBossX - 35 < 20 || jetBossX + 35 > WIDTH - 20) {
        jetBossDirection = -jetBossDirection;
      }

      jetBossShootTimer++;
      if (jetBossShootTimer % 70 === 0) {
        sound.playWarning();
        for (let i = -2; i <= 2; i++) {
          jetEnemyBullets.push({
            x: jetBossX,
            y: jetBossY + 20,
            vx: i * 1.2,
            vy: 3.5 - Math.abs(i) * 0.2,
            radius: 12
          });
        }
      }
    }
  }

  // Update Enemy Bullets
  jetEnemyBullets.forEach((eb, idx) => {
    eb.x += eb.vx;
    eb.y += eb.vy;
    
    const dx = eb.x - jetX;
    const dy = eb.y - jetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < eb.radius + jetRadius) {
      jetEnemyBullets.splice(idx, 1);
      playerHitDamage();
    }

    if (eb.y > HEIGHT + 20) {
      jetEnemyBullets.splice(idx, 1);
    }
  });

  // Update Enemies
  jetEnemies.forEach((e, eIdx) => {
    e.y += e.speed;

    const dx = e.x - jetX;
    const dy = e.y - jetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < e.radius + jetRadius) {
      jetEnemies.splice(eIdx, 1);
      playerHitDamage();
    }

    jetBullets.forEach((b, bIdx) => {
      const bDx = b.x - e.x;
      const bDy = b.y - e.y;
      const bDist = Math.sqrt(bDx * bDx + bDy * bDy);
      if (bDist < e.radius + 5) {
        jetBullets.splice(bIdx, 1);
        e.hp--;
        
        for (let i = 0; i < 4; i++) {
          jetParticles.push({
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 15,
            color: '#ffcc00'
          });
        }

        if (e.hp <= 0) {
          jetEnemies.splice(eIdx, 1);
          sound.playExplosion();
          const points = e.type === 'copier' ? 40 : 20;
          updateScore(scoreVal + points);
          spawnScoreTag(e.x, e.y, `💥 DESTROY! +${points}`);

          for (let i = 0; i < 10; i++) {
            jetParticles.push({
              x: e.x,
              y: e.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 20,
              color: e.type === 'copier' ? '#8e8e93' : '#ff3b30'
            });
          }

          if (Math.random() < 0.25) {
            const type = Math.random() < 0.5 ? 'milktea' : 'siumai';
            jetPowerups.push({
              x: e.x,
              y: e.y,
              type: type,
              radius: 12,
              speed: 1.8
            });
          }
        }
      }
    });

    if (e.y > HEIGHT + 35) {
      jetEnemies.splice(eIdx, 1);
    }
  });

  // Boss Bullet Collisions
  if (jetBossActive && jetBossY >= 100) {
    jetBullets.forEach((b, bIdx) => {
      const bDx = b.x - jetBossX;
      const bDy = b.y - jetBossY;
      const bDist = Math.sqrt(bDx * bDx + bDy * bDy);
      if (bDist < 35) {
        jetBullets.splice(bIdx, 1);
        jetBossHp--;

        for (let i = 0; i < 3; i++) {
          jetParticles.push({
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 15,
            color: '#ff3b30'
          });
        }

        if (jetBossHp <= 0) {
          jetBossActive = false;
          sound.playExplosion();
          updateScore(scoreVal + 500);
          spawnScoreTag(jetBossX, jetBossY, "🏆 DEFEATED! 爆機擊退老細！ +500");

          for (let i = 0; i < 40; i++) {
            jetParticles.push({
              x: jetBossX + (Math.random() - 0.5) * 40,
              y: jetBossY + (Math.random() - 0.5) * 40,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 40,
              color: '#ff9500'
            });
          }
        }
      }
    });
  }

  // Update Powerups
  jetPowerups.forEach((pu, idx) => {
    pu.y += pu.speed;

    const dx = pu.x - jetX;
    const dy = pu.y - jetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < pu.radius + jetRadius) {
      jetPowerups.splice(idx, 1);
      sound.playCashChime();

      if (pu.type === 'milktea') {
        jetTripleShotTimer = 250;
        spawnScoreTag(pu.x, pu.y, "🍵 TRIPLE LASER! 絲襪奶茶三倍彈！");
      } else {
        updateScore(scoreVal + 100);
        spawnScoreTag(pu.x, pu.y, "🥟 EXTRA BONUS! 燒賣金幣+100");
      }

      for (let i = 0; i < 8; i++) {
        jetParticles.push({
          x: jetX,
          y: jetY,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 20,
          color: '#34c759'
        });
      }
    }

    if (pu.y > HEIGHT + 20) {
      jetPowerups.splice(idx, 1);
    }
  });
}

function playerHitDamage() {
  jetLives--;
  sound.playGameOver();
  jetEnemies = [];
  jetEnemyBullets = [];

  for (let i = 0; i < 20; i++) {
    jetParticles.push({
      x: jetX,
      y: jetY,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 25,
      color: '#ff3b30'
    });
  }

  if (jetLives <= 0) {
    triggerGameOver();
  } else {
    spawnScoreTag(jetX, jetY, `🚨 HIT! 扣減生命 (餘 ${jetLives} 次)`);
  }
}

export function render(pCtx, isStarting, isGameOver) {
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = '#e3e3e8';
  ctx.lineWidth = 1;
  for (let y = 30; y < HEIGHT; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  jetEnemyBullets.forEach(eb => {
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(eb.x, eb.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eb.x, eb.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });

  jetBullets.forEach(b => {
    ctx.strokeStyle = '#0071e3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x, b.y + 12);
    ctx.stroke();
  });

  jetEnemies.forEach(e => {
    ctx.save();
    ctx.translate(e.x, e.y);

    if (e.type === 'copier') {
      ctx.fillStyle = '#8e8e93';
      ctx.fillRect(-18, -18, 36, 36);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(-12, -12, 6, 6);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(-15, -28, 30, 4);
      ctx.fillStyle = '#ff3b30';
      ctx.fillRect(-15, -28, Math.floor(30 * (e.hp / e.maxHp)), 4);
    } else if (e.type === 'computer') {
      ctx.fillStyle = '#aeaea2';
      ctx.fillRect(-14, -12, 28, 20);
      ctx.fillStyle = '#0071e3';
      ctx.fillRect(-11, -9, 22, 14);
    } else {
      ctx.fillStyle = '#ff453a';
      ctx.fillRect(-10, -10, 20, 20);
      ctx.strokeStyle = '#ff453a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(10, 0, 6, -Math.PI/2, Math.PI/2);
      ctx.stroke();
    }
    ctx.restore();
  });

  if (jetBossActive) {
    ctx.fillStyle = '#1c1c1e';
    ctx.fillRect(jetBossX - 45, jetBossY - 25, 90, 45);
    ctx.fillStyle = '#ff2d55';
    ctx.fillRect(jetBossX - 30, jetBossY + 5, 60, 8);
    ctx.fillStyle = '#545456';
    ctx.fillRect(jetBossX - 35, jetBossY + 20, 10, 10);
    ctx.fillRect(jetBossX + 25, jetBossY + 20, 10, 10);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(WIDTH / 2 - 100, 20, 200, 8);
    ctx.fillStyle = '#ff3b30';
    ctx.fillRect(WIDTH / 2 - 100, 20, Math.floor(200 * (jetBossHp / jetBossMaxHp)), 8);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(WIDTH / 2 - 100, 20, 200, 8);
  }

  jetPowerups.forEach(pu => {
    if (pu.type === 'milktea') {
      ctx.fillStyle = '#d2b48c';
      ctx.fillRect(pu.x - 8, pu.y - 10, 16, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pu.x - 10, pu.y - 12, 20, 4);
    } else {
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, pu.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#1d1d1f';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🥟', pu.x, pu.y);
    }
  });

  jetParticles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 20;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  });
  ctx.globalAlpha = 1.0;

  const flamePulse = Math.abs(Math.sin(Date.now() * 0.025));
  ctx.fillStyle = '#ff9500';
  ctx.beginPath();
  ctx.moveTo(jetX - 8, jetY + 12);
  ctx.lineTo(jetX, jetY + 22 + flamePulse * 8);
  ctx.lineTo(jetX + 8, jetY + 12);
  ctx.fill();

  const jetImg = textures['pig_eating'];
  if (jetImg) {
    ctx.drawImage(jetImg, jetX - jetRadius, jetY - jetRadius, jetRadius * 2, jetRadius * 2);
  } else {
    ctx.fillStyle = '#0071e3';
    ctx.beginPath();
    ctx.arc(jetX, jetY, jetRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.fillStyle = '#8e8e93';
  ctx.fillRect(jetX - jetRadius - 8, jetY + 4, 8, 4);
  ctx.fillRect(jetX + jetRadius, jetY + 4, 8, 4);

  // HUD
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(20, 20, 130, 48);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(20, 20, 130, 48);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`HEALTH: ${'❤️'.repeat(Math.max(0, jetLives))}`, 28, 34);
  ctx.fillText(`SCORE:  ${letScoreVal()}`, 28, 46);

  if (jetTripleShotTimer > 0) {
    ctx.fillStyle = '#34c759';
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`TRIPLE: ${Math.floor(jetTripleShotTimer / 6)}% 🔋`, 28, 56);
  }

  // Sidebar Preview Gauge
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#ff2d55';
  pCtx.font = '16px Arial';
  pCtx.textAlign = 'center';
  pCtx.fillText('❤️'.repeat(Math.max(0, jetLives)), 50, 52);

  document.getElementById('next-label').innerText = '❤️ FIGHTER HEALTH';
  document.getElementById('mobile-next-emoji').innerText = '🚀';
}

function letScoreVal() {
  return parseInt(document.getElementById('score-val').innerText || '0');
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
