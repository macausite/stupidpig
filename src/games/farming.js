let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

const PLOTS = [
  { x: 40, y: 150, w: 150, h: 120, crop: null, stage: 0, growth: 0, maxGrowth: 200, watered: false },
  { x: 230, y: 150, w: 150, h: 120, crop: null, stage: 0, growth: 0, maxGrowth: 200, watered: false },
  { x: 40, y: 310, w: 150, h: 120, crop: null, stage: 0, growth: 0, maxGrowth: 200, watered: false },
  { x: 230, y: 310, w: 150, h: 120, crop: null, stage: 0, growth: 0, maxGrowth: 200, watered: false }
];

const SEED_TYPES = {
  siumai: { name: '燒賣 (Siumai)', emoji: '🥟', cost: 0, yield: 15, time: 180, textureKey: 'siumai' },
  eggtart: { name: '蛋撻 (Eggtart)', emoji: '🥧', cost: 15, yield: 45, time: 300, textureKey: 'eggtart' },
  pineapple_bun: { name: '菠蘿包 (Bun)', emoji: '🍍', cost: 40, yield: 110, time: 480, textureKey: 'pineapple_bun' }
};

let selectedSeed = 'siumai';
let localCash = 30;
let localScore = 0;

// Boss Warning system
let bossWarningTimer = 0;
let bossWarningActive = false;
let isHidden = false;
let nextBossTimer = 400; // frames before first boss check

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
  localCash = 30;
  selectedSeed = 'siumai';
  bossWarningTimer = 0;
  bossWarningActive = false;
  isHidden = false;
  nextBossTimer = 400;

  PLOTS.forEach(plot => {
    plot.crop = null;
    plot.stage = 0;
    plot.growth = 0;
    plot.watered = false;
  });
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Update Boss Alert Cycles
  if (!isHidden) {
    if (bossWarningActive) {
      bossWarningTimer--;
      if (bossWarningTimer <= 0) {
        // Boss arrives and catches player!
        bossWarningActive = false;
        confiscateCrops();
        nextBossTimer = 400 + Math.random() * 300;
      }
    } else {
      nextBossTimer--;
      if (nextBossTimer <= 0) {
        // Trigger Boss Warning
        bossWarningActive = true;
        bossWarningTimer = 160; // 160 frames to react (approx 2.5 seconds)
        if (sound && sound.playWarning) {
          try { sound.playWarning(); } catch(e) {}
        }
      }
    }
  } else {
    // If hidden, boss checks in and leaves after some time
    if (bossWarningActive) {
      bossWarningTimer--;
      if (bossWarningTimer <= 0) {
        // Boss walks away safely
        bossWarningActive = false;
        isHidden = false;
        nextBossTimer = 500 + Math.random() * 350;
      }
    }
  }

  // Update Crop Growth
  if (!isHidden) {
    PLOTS.forEach(plot => {
      if (plot.crop) {
        // Watered crops grow twice as fast
        const speed = plot.watered ? 1.5 : 0.75;
        plot.growth = Math.min(plot.maxGrowth, plot.growth + speed);

        // Stage thresholds
        if (plot.growth >= plot.maxGrowth) {
          plot.stage = 3; // Ready to harvest!
        } else if (plot.growth >= plot.maxGrowth * 0.6) {
          plot.stage = 2; // Growing
        } else if (plot.growth >= plot.maxGrowth * 0.15) {
          plot.stage = 1; // Seedling
        }
      }
    });
  }

  // Handle pointer clicks
  if (pStart) {
    // Check shop buttons at top (y: 60 - 110)
    if (pY >= 60 && pY <= 110) {
      if (pX >= 20 && pX <= 130) {
        selectedSeed = 'siumai';
      } else if (pX >= 150 && pX <= 260) {
        selectedSeed = 'eggtart';
      } else if (pX >= 280 && pX <= 390) {
        selectedSeed = 'pineapple_bun';
      }
    }

    // Check Hide/Camouflage button at bottom (y: 470 - 520)
    if (pY >= 460 && pY <= 510) {
      if (pX >= 110 && pX <= 290) {
        if (bossWarningActive) {
          isHidden = true;
          bossWarningTimer = 100; // Stay hidden for 100 frames while boss inspects
        }
      }
    }

    // Check plot clicks
    if (!isHidden) {
      PLOTS.forEach((plot, idx) => {
        if (pX >= plot.x && pX <= plot.x + plot.w && pY >= plot.y && pY <= plot.y + plot.h) {
          handlePlotInteraction(plot, idx);
        }
      });
    }
  }
}

function handlePlotInteraction(plot, idx) {
  if (plot.crop === null) {
    // Plant selected seed if cash is sufficient
    const seedInfo = SEED_TYPES[selectedSeed];
    if (localCash >= seedInfo.cost) {
      localCash -= seedInfo.cost;
      plot.crop = selectedSeed;
      plot.stage = 0;
      plot.growth = 0;
      plot.maxGrowth = seedInfo.time;
      plot.watered = false;
      if (sound && sound.playClick) {
        try { sound.playClick(); } catch(e) {}
      }
    }
  } else if (plot.stage === 3) {
    // Harvest fully grown crop
    const seedInfo = SEED_TYPES[plot.crop];
    localCash += seedInfo.yield;
    localScore += seedInfo.yield;
    updateScore(localScore);

    if (spawnScoreTag) {
      spawnScoreTag(`+${seedInfo.yield} 💰`, plot.x + plot.w / 2, plot.y + 20);
    }

    plot.crop = null;
    plot.stage = 0;
    plot.growth = 0;
    plot.watered = false;
    
    if (sound && sound.playPowerup) {
      try { sound.playPowerup(); } catch(e) {}
    }
  } else if (!plot.watered) {
    // Water the crop to grow faster
    plot.watered = true;
    if (spawnScoreTag) {
      spawnScoreTag('💧', plot.x + plot.w / 2, plot.y + 20);
    }
  }
}

function confiscateCrops() {
  let count = 0;
  PLOTS.forEach(plot => {
    if (plot.crop !== null) {
      plot.crop = null;
      plot.stage = 0;
      plot.growth = 0;
      plot.watered = false;
      count++;
    }
  });

  // Deduct penalty score
  localScore = Math.max(0, localScore - 20);
  localCash = Math.max(0, localCash - 15);
  updateScore(localScore);

  if (spawnScoreTag) {
    spawnScoreTag('沒收! -20 💔', WIDTH / 2, HEIGHT / 2);
  }
}

export function render(pCtx, isStarting, isGameOver) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Background Office board texture style
  ctx.fillStyle = '#1c1b30';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw Header / Inventory
  ctx.fillStyle = '#ffb300';
  ctx.font = 'bold 15px Arial';
  ctx.fillText(`資金: $${localCash} 💰`, 20, 35);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`種植作物: ${SEED_TYPES[selectedSeed].emoji} ${SEED_TYPES[selectedSeed].name}`, 180, 35);

  // Draw Shop seed selector buttons
  Object.keys(SEED_TYPES).forEach((key, index) => {
    const seed = SEED_TYPES[key];
    const bx = 20 + index * 130;
    const by = 60;
    const bw = 110;
    const bh = 50;

    // Selected border highlight
    ctx.fillStyle = selectedSeed === key ? '#2b294a' : '#141324';
    ctx.strokeStyle = selectedSeed === key ? '#ffb300' : '#44415a';
    ctx.lineWidth = selectedSeed === key ? 2 : 1;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${seed.emoji} ${seed.name.split(' ')[0]}`, bx + bw / 2, by + 22);
    ctx.fillStyle = seed.cost === 0 ? '#4cd964' : '#8c89ad';
    ctx.fillText(seed.cost === 0 ? '免費' : `$${seed.cost} 粒`, bx + bw / 2, by + 40);
  });

  // Draw Plots (Cubicles)
  ctx.textAlign = 'left';
  PLOTS.forEach(plot => {
    ctx.fillStyle = '#141324';
    ctx.strokeStyle = '#44415a';
    ctx.lineWidth = 1;
    ctx.fillRect(plot.x, plot.y, plot.w, plot.h);
    ctx.strokeRect(plot.x, plot.y, plot.w, plot.h);

    // Draw grid cubicle partition style
    ctx.fillStyle = '#2b294a';
    ctx.fillRect(plot.x, plot.y, plot.w, 18);
    ctx.fillStyle = '#8c89ad';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('💻 辦公桌花盆', plot.x + 8, plot.y + 12);

    if (plot.crop) {
      const seed = SEED_TYPES[plot.crop];
      const cx = plot.x + plot.w / 2;
      const cy = plot.y + plot.h / 2 + 10;

      // Draw growing state or actual item texture if fully grown
      if (plot.stage === 0) {
        ctx.fillStyle = '#8b5a2b'; // Dirt mound
        ctx.beginPath();
        ctx.arc(cx, cy + 15, 10, 0, Math.PI, true);
        ctx.fill();
        ctx.fillStyle = '#4cd964';
        ctx.fillText('🌱 播種中...', plot.x + 12, plot.y + 40);
      } else if (plot.stage === 1) {
        // Sprout
        ctx.fillStyle = '#4cd964';
        ctx.font = '24px sans-serif';
        ctx.fillText('🌱', cx - 12, cy + 10);
        ctx.font = '9px sans-serif';
        ctx.fillText('幼苗階段', plot.x + 12, plot.y + 40);
      } else if (plot.stage === 2) {
        // Budding
        ctx.fillStyle = '#4cd964';
        ctx.font = '28px sans-serif';
        ctx.fillText('🌿', cx - 14, cy + 10);
        ctx.font = '9px sans-serif';
        ctx.fillText('快速生長中', plot.x + 12, plot.y + 40);
      } else if (plot.stage === 3) {
        // Fully grown - Draw texture image
        const img = textures[seed.textureKey];
        if (img) {
          ctx.drawImage(img, cx - 22, cy - 22, 44, 44);
        } else {
          ctx.font = '32px sans-serif';
          ctx.fillText(seed.emoji, cx - 16, cy + 10);
        }
        ctx.fillStyle = '#ff9500';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('🎁 點擊收割！', plot.x + 12, plot.y + 40);
      }

      // Progress bar
      const barWidth = plot.w - 24;
      const progress = plot.growth / plot.maxGrowth;
      ctx.fillStyle = '#222';
      ctx.fillRect(plot.x + 12, plot.y + plot.h - 22, barWidth, 6);
      ctx.fillStyle = plot.watered ? '#0071e3' : '#4cd964';
      ctx.fillRect(plot.x + 12, plot.y + plot.h - 22, barWidth * progress, 6);

      // Water indicator
      if (!plot.watered && plot.stage < 3) {
        ctx.fillStyle = '#ff3b30';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('⚠️ 需要淋水', plot.x + 12, plot.y + plot.h - 8);
      } else if (plot.stage < 3) {
        ctx.fillStyle = '#0071e3';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('💧 已澆水 (加速中)', plot.x + 12, plot.y + plot.h - 8);
      }
    } else {
      ctx.fillStyle = '#8c89ad';
      ctx.font = '9px sans-serif';
      ctx.fillText('🕳️ 空置花盆', plot.x + 12, plot.y + 40);
      ctx.fillText('點擊種植選中種子', plot.x + 12, plot.y + 60);
    }
  });

  // Draw Boss Warning Header Banner
  if (bossWarningActive && !isHidden) {
    ctx.fillStyle = 'rgba(255, 45, 85, 0.95)';
    ctx.fillRect(0, 0, WIDTH, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('⚠️ 老細行緊過黎！(BOSS ALERT!)', 20, 30);
    const reactTime = Math.ceil(bossWarningTimer / 60);
    ctx.fillText(`倒數: ${reactTime}s`, WIDTH - 80, 30);
  }

  // Draw Camouflage (Hide) Button at bottom
  const hx = 110;
  const hy = 460;
  const hw = 180;
  const hh = 45;
  ctx.fillStyle = bossWarningActive ? '#ff2d55' : '#2b294a';
  ctx.strokeStyle = '#44415a';
  ctx.fillRect(hx, hy, hw, hh);
  ctx.strokeRect(hx, hy, hw, hh);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isHidden ? '🙈 扮做嘢中...' : '🙈 扮做嘢 (Hide Farm)', hx + hw / 2, hy + 26);

  // Draw Excel Camouflage Screen Cover
  if (isHidden) {
    ctx.fillStyle = '#107c41'; // Excel Green
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Draw spreadsheet-like grids
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Microsoft Excel - Annual_Report.xlsx', WIDTH / 2, HEIGHT / 2 - 50);
    
    ctx.font = '12px Arial';
    ctx.fillText('數據運算中，老細企喺側邊監工...', WIDTH / 2, HEIGHT / 2);
    
    // Quick grid drawing
    for (let r = 0; r < 8; r++) {
      ctx.beginPath();
      ctx.moveTo(30, HEIGHT / 2 + 30 + r * 20);
      ctx.lineTo(WIDTH - 30, HEIGHT / 2 + 30 + r * 20);
      ctx.stroke();
    }
  }

  // Global window preview sidebar context
  if (window.pCtx) {
    const pCtx = window.pCtx;
    pCtx.fillStyle = '#e8e8ed';
    pCtx.fillRect(10, 15, 80, 70);
    pCtx.fillStyle = '#4cd964';
    pCtx.font = 'bold 12px Arial';
    pCtx.textAlign = 'center';
    pCtx.fillText('🌱 FARM', 50, 48);
  }

  // Set next-label text
  try {
    document.getElementById('next-label').innerText = '🧑‍🌾 FARM ALERT';
    document.getElementById('mobile-next-emoji').innerText = '🌱';
  } catch(e) {}
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
