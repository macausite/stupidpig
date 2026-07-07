let canvas, ctx, textures, WIDTH, HEIGHT, sound, updateScore, spawnScoreTag, triggerGameOver;

let paddleX;
let paddleY;
const paddleWidth = 80;
const paddleHeight = 12;

let balls = [];
let bricks = [];
let localScore = 0;
let localBricksBroken = 0;

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
  paddleX = WIDTH / 2 - paddleWidth / 2;
  paddleY = HEIGHT - 80;
  localScore = 0;
  localBricksBroken = 0;

  balls = [
    { x: WIDTH / 2, y: HEIGHT - 120, vx: 2, vy: -3, radius: 8 }
  ];

  // Generate brick spreadsheet grid
  bricks = [];
  const rows = 5;
  const cols = 6;
  const brickWidth = (WIDTH - 40) / cols;
  const brickHeight = 20;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const type = r === 0 ? 'header' : Math.random() < 0.25 ? 'coffee' : 'normal';
      bricks.push({
        x: 20 + c * brickWidth,
        y: 100 + r * (brickHeight + 4),
        width: brickWidth - 4,
        height: brickHeight,
        type: type,
        hp: type === 'header' ? 2 : 1
      });
    }
  }
}

export function update(keys, pX, pY, pActive, pStart, pEnd) {
  // Steer Paddle
  if (pActive) {
    paddleX = pX - paddleWidth / 2;
  } else {
    if (keys.Left) paddleX -= 6;
    if (keys.Right) paddleX += 6;
  }
  paddleX = Math.max(10, Math.min(WIDTH - paddleWidth - 10, paddleX));

  // Update Balls
  balls.forEach((ball, bIdx) => {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounces
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = -ball.vx;
      sound.playClick();
    }
    if (ball.x + ball.radius > WIDTH) {
      ball.x = WIDTH - ball.radius;
      ball.vx = -ball.vx;
      sound.playClick();
    }
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy;
      sound.playClick();
    }

    // Paddle collision
    if (
      ball.y + ball.radius >= paddleY &&
      ball.y - ball.radius <= paddleY + paddleHeight &&
      ball.x >= paddleX &&
      ball.x <= paddleX + paddleWidth
    ) {
      ball.y = paddleY - ball.radius;
      // Change bounce angle depending on hit location
      const relativeHit = (ball.x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
      ball.vx = relativeHit * 3.5;
      ball.vy = -Math.abs(ball.vy);
      sound.playDrop();
    }

    // Brick Collisions
    bricks.forEach((brick, brIdx) => {
      if (
        ball.x + ball.radius >= brick.x &&
        ball.x - ball.radius <= brick.x + brick.width &&
        ball.y + ball.radius >= brick.y &&
        ball.y - ball.radius <= brick.y + brick.height
      ) {
        // Collided! Bounce ball y
        ball.vy = -ball.vy;
        brick.hp--;

        // Hit sparks
        sound.playClick();

        if (brick.hp <= 0) {
          bricks.splice(brIdx, 1);
          sound.playCashChime();
          const points = brick.type === 'header' ? 60 : 30;
          localScore += points;
          updateScore(localScore);
          localBricksBroken++;
          spawnScoreTag(brick.x + brick.width/2, brick.y, `+${points} 📊`);

          if (brick.type === 'coffee') {
            // Powerup: Spawn extra ball!
            balls.push({
              x: ball.x,
              y: ball.y,
              vx: (Math.random() - 0.5) * 4,
              vy: -3,
              radius: 8
            });
            spawnScoreTag(brick.x, brick.y, "☕ DOUBLE BALL!");
          }
        }
      }
    });

    // Check bottom drop
    if (ball.y > HEIGHT) {
      balls.splice(bIdx, 1);
    }
  });

  // Check Game Over
  if (balls.length === 0) {
    triggerGameOver();
  }
}

export function render(pCtx, isStarting, isGameOver) {
  // Apple light grey background
  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw Excel Grid outline layout
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(10, 80, WIDTH - 20, HEIGHT - 180);
  ctx.strokeStyle = '#e8e8ed';
  ctx.strokeRect(10, 80, WIDTH - 20, HEIGHT - 180);

  // Draw Bricks (Excel spreadsheet headers/cells!)
  bricks.forEach(br => {
    if (br.type === 'header') {
      ctx.fillStyle = '#107c41'; // Excel dark green header
      ctx.fillRect(br.x, br.y, br.width, br.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HEADER', br.x + br.width / 2, br.y + br.height / 2);
    } else {
      ctx.fillStyle = br.type === 'coffee' ? '#ffebeb' : '#faf9f8';
      ctx.fillRect(br.x, br.y, br.width, br.height);
      ctx.strokeStyle = '#e1dfdd';
      ctx.strokeRect(br.x, br.y, br.width, br.height);
      
      ctx.fillStyle = br.type === 'coffee' ? '#ff3b30' : '#323130';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(br.type === 'coffee' ? '☕ COFFEE' : 'DATA_VAL', br.x + br.width / 2, br.y + br.height / 2);
    }
  });

  // Draw paddle (wooden slacking desk)
  ctx.fillStyle = '#8e8e93';
  ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
  ctx.fillStyle = '#c7c7cc';
  ctx.fillRect(paddleX + 2, paddleY + 2, paddleWidth - 4, 3); // table top edge

  // Draw Balls
  balls.forEach(ball => {
    const pImg = textures['pig_eating'];
    if (pImg) {
      ctx.drawImage(pImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
    } else {
      ctx.fillStyle = '#0071e3';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  });

  // HUD
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(20, 20, 130, 45);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(20, 20, 130, 45);
  ctx.fillStyle = '#1d1d1f';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`BALLS: ${balls.length}`, 28, 36);
  ctx.fillText(`SCORE: ${localScore}`, 28, 50);

  // Sidebar Preview
  pCtx.fillStyle = '#e8e8ed';
  pCtx.fillRect(10, 15, 80, 70);
  pCtx.fillStyle = '#107c41';
  pCtx.fillRect(20, 45, 60, 12);

  pCtx.fillStyle = '#1d1d1f';
  pCtx.font = 'bold 9px monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText(`BRK: ${localBricksBroken}`, 50, 36);

  document.getElementById('next-label').innerText = '🧱 SHEETS BROKEN';
  document.getElementById('mobile-next-emoji').innerText = '📊';
}

export function pointerDown(x, y) {}
export function pointerMove(x, y) {}
export function pointerUp() {}
