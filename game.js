// HTTP Monkey: Debug the Maze
// Side-scrolling runner - collect codes and destroy 400/500 errors for unlimited points

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0a0a1a',
  scene: {
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let p1, p2, codes = [], enemies = [], bananas = [];
let p1Collected = 0, p2Collected = 0, p1Points = 0, p2Points = 0, timer = 120000;
let timerText, scoreText1, scoreText2, gameOver = false;
let graphics, scene, twoPlayer = false;
let p1Immune = false, p2Immune = false;
let immuneTimer1 = 0, immuneTimer2 = 0;
let p1Alive = true, p2Alive = true;
let speed = 4, groundY = 500;
let spawnTimer = 0, codeSpawnTimer = 0;
let p1Jumping = false, p1JumpVel = 0, p1DoubleJumpUsed = false;
let p2Jumping = false, p2JumpVel = 0, p2DoubleJumpUsed = false;
let cameraX = 0, lastObstacleX = 600;
let cursors, wasd, spaceKey;
let bannerText = null, starMusicOsc = null, starMusicGain = null, musicTime = 0, starMusicOsc2 = null;

// Simple digit patterns - 5x7 grid, bold and clear
function drawDigit(g, x, y, digit, size) {
  const patterns = {
    '0': [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    '2': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
    '4': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1]],
    '5': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,1]]
  };
  const p = patterns[digit];
  if (!p) return;
  // Draw with black outline for contrast
  g.fillStyle(0x000000, 0.9);
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (p[row][col]) {
        g.fillRect(x + col * size - 1, y + row * size - 1, size + 2, size + 2);
      }
    }
  }
  // Draw white fill
  g.fillStyle(0xffffff, 1);
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (p[row][col]) {
        g.fillRect(x + col * size, y + row * size, size, size);
      }
    }
  }
}

function create() {
  scene = this;
  graphics = this.add.graphics();
  
  p1 = { x: 100, y: groundY, w: 35, h: 45 };
  twoPlayer = false;
  
  timerText = this.add.text(10, 10, 'Time: 120', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ffff'
  });
  
  scoreText1 = this.add.text(10, 35, 'P1: 0', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff00'
  });
  
  scoreText2 = this.add.text(10, 60, 'P2: 0', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00aa00',
    visible: false
  });
  
  this.add.text(10, 570, 'UP: Jump | SPACE: Add P2', {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#888888'
  });
  
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys('W,S,A,D');
  spaceKey = this.input.keyboard.addKey('SPACE');
  
  cursors.up.on('down', () => {
    if (p1Alive && !gameOver) {
      if (!p1Jumping && p1.y >= groundY) {
        p1Jumping = true;
        p1JumpVel = -13;
        p1DoubleJumpUsed = false;
        playTone(300, 0.1);
      } else if (p1Jumping && p1.y < groundY && !p1DoubleJumpUsed && p1.y < groundY - 10) {
        p1JumpVel = -13;
        p1DoubleJumpUsed = true;
        playTone(350, 0.1);
      }
    }
  });
  
  wasd.W.on('down', () => {
    if (twoPlayer && p2 && p2Alive && !gameOver) {
      if (!p2Jumping && p2.y >= groundY) {
        p2Jumping = true;
        p2JumpVel = -13;
        p2DoubleJumpUsed = false;
        playTone(300, 0.1);
      } else if (p2Jumping && p2.y < groundY && !p2DoubleJumpUsed && p2.y < groundY - 10) {
        p2JumpVel = -13;
        p2DoubleJumpUsed = true;
        playTone(350, 0.1);
      }
    }
  });
  
  this.input.keyboard.on('keydown-SPACE', () => {
    if (!gameOver && !twoPlayer) {
      p1Collected = 0;
      p2Collected = 0;
      p1Points = 0;
      p2Points = 0;
      timer = 120000;
      codes = [];
      enemies = [];
      bananas = [];
      p1Immune = false;
      p2Immune = false;
      p1Alive = true;
      p2Alive = true;
      cameraX = 0;
      lastObstacleX = 600;
      spawnTimer = 0;
      codeSpawnTimer = 0;
      p1Jumping = false;
      p1JumpVel = 0;
      p1DoubleJumpUsed = false;
      p2Jumping = false;
      p2JumpVel = 0;
      p2DoubleJumpUsed = false;
      p1.x = 100;
      p1.y = groundY;
      twoPlayer = true;
      p2 = { x: 150, y: groundY, w: 35, h: 45 };
      scoreText2.setVisible(true);
        for (let i = 0; i < 5; i++) {
          codes.push({ x: 400 + i * 150, y: groundY - 50 - Math.random() * 100, r: 18 });
        }
      spawnObstacle();
    }
  });
  
  for (let i = 0; i < 5; i++) {
    codes.push({ x: 400 + i * 150, y: groundY - 50 - Math.random() * 100, r: 18 });
  }
  spawnObstacle();
  
  drawGame();
}

function spawnObstacle() {
  const types = [400, 400, 400, 500, 500];
  const type = types[Math.floor(Math.random() * types.length)];
  const gap = 350 + Math.random() * 250;
  // Different height levels: ground (60%), mid (30%), high (10%)
  const rand = Math.random();
  let height;
  if (rand < 0.6) {
    height = groundY; // Ground level - most common
  } else if (rand < 0.9) {
    height = groundY - 150; // Mid level
  } else {
    height = groundY - 280; // High level
  }
  enemies.push({ x: lastObstacleX + gap, y: height, type, w: 45, h: 55, pulse: 0 });
  lastObstacleX = lastObstacleX + gap;
}

function spawnCode() {
  const y = groundY - 30 - Math.random() * 120;
  codes.push({ x: cameraX + 500 + Math.random() * 200, y, r: 18 });
}

function update(time, delta) {
  if (gameOver) return;
  
  timer -= delta;
  if (timer <= 0) {
    endGame(false);
    return;
  }
  
  cameraX += speed;
  
  if (p1Immune) {
    immuneTimer1 -= delta;
    if (immuneTimer1 <= 0) {
      p1Immune = false;
      if (bannerText) bannerText.setVisible(false);
      stopStarMusic();
    }
  }
  if (p2Immune && twoPlayer) {
    immuneTimer2 -= delta;
    if (immuneTimer2 <= 0) {
      p2Immune = false;
      if (bannerText) bannerText.setVisible(false);
      stopStarMusic();
    }
  }
  
  if ((p1Immune || (twoPlayer && p2Immune)) && starMusicOsc) {
    musicTime += delta * 0.004;
    const beat = Math.floor(musicTime * 1.5) % 4;
    if (beat < 2) {
      starMusicOsc.frequency.value = 330;
      if (starMusicOsc2) starMusicOsc2.frequency.value = 392;
    } else {
      starMusicOsc.frequency.value = 392;
      if (starMusicOsc2) starMusicOsc2.frequency.value = 466;
    }
  } else {
    musicTime = 0;
  }
  
  if (p1Alive) {
    if (p1Jumping || p1.y < groundY) {
      p1.y += p1JumpVel;
      p1JumpVel += 0.55;
      
      if (p1.y >= groundY) {
        p1.y = groundY;
        p1Jumping = false;
        p1JumpVel = 0;
        p1DoubleJumpUsed = false;
      }
    }
  }
  
  if (twoPlayer && p2 && p2Alive) {
    if (p2Jumping || p2.y < groundY) {
      p2.y += p2JumpVel;
      p2JumpVel += 0.55;
      
      if (p2.y >= groundY) {
        p2.y = groundY;
        p2Jumping = false;
        p2JumpVel = 0;
        p2DoubleJumpUsed = false;
      }
    }
    
    codes = codes.filter(c => {
      if (Math.abs(p2.x - (c.x - cameraX)) < 25 && Math.abs(p2.y - c.y) < 25) {
        p2Collected += 200;
        playTone(600, 0.1);
        return false;
      }
      return true;
    });
    
    bananas = bananas.filter(b => {
      if (Math.abs(p2.x - (b.x - cameraX)) < 25 && Math.abs(p2.y - b.y) < 25) {
        p2Immune = true;
        immuneTimer2 = 5000;
        showBanner();
        playStarMusic();
        return false;
      }
      return true;
    });
    
    if (!p2Immune) {
      for (let e of enemies) {
        const ex = e.x - cameraX;
        if (ex < p2.x + p2.w && ex + e.w > p2.x && e.y < p2.y + p2.h && e.y + e.h > p2.y) {
          p2Alive = false;
          if (!p1Alive) {
            endGame(false);
            return;
          }
          break;
        }
      }
    } else {
      for (let e of enemies) {
        const ex = e.x - cameraX;
        if (ex < p2.x + p2.w && ex + e.w > p2.x && e.y < p2.y + p2.h && e.y + e.h > p2.y) {
          const idx = enemies.indexOf(e);
          if (idx >= 0) {
            p2Points += e.type;
            enemies.splice(idx, 1);
            playTone(400, 0.2);
          }
        }
      }
    }
  }
  
  if (p1Alive) {
    codes = codes.filter(c => {
      if (Math.abs(p1.x - (c.x - cameraX)) < 25 && Math.abs(p1.y - c.y) < 25) {
        p1Collected += 200;
        playTone(600, 0.1);
        return false;
      }
      return true;
    });
    
    bananas = bananas.filter(b => {
      if (Math.abs(p1.x - (b.x - cameraX)) < 25 && Math.abs(p1.y - b.y) < 25) {
        p1Immune = true;
        immuneTimer1 = 5000;
        showBanner();
        playStarMusic();
        return false;
      }
      return true;
    });
  }
  
  spawnTimer += delta * speed * 0.5;
  if (spawnTimer > 200) {
    spawnTimer = 0;
    spawnObstacle();
  }
  
  codeSpawnTimer += delta * speed * 0.3;
  if (codeSpawnTimer > 120 && codes.length < 15) {
    codeSpawnTimer = 0;
    spawnCode();
  }
  
  if (Math.random() < 0.006 && bananas.length < 5) {
    bananas.push({ x: cameraX + 900, y: groundY - 25, r: 10, t: 0 });
  }
  
  bananas.forEach(b => b.t += delta);
  bananas = bananas.filter(b => b.t < 15000);
  
  if (p1Alive) {
    if (!p1Immune) {
      for (let e of enemies) {
        const ex = e.x - cameraX;
        if (ex < p1.x + p1.w && ex + e.w > p1.x && e.y < p1.y + p1.h && e.y + e.h > p1.y) {
          p1Alive = false;
          if (!twoPlayer || !p2Alive) {
            endGame(false);
            return;
          }
          break;
        }
      }
    } else {
      for (let e of enemies) {
        const ex = e.x - cameraX;
        if (ex < p1.x + p1.w && ex + e.w > p1.x && e.y < p1.y + p1.h && e.y + e.h > p1.y) {
          const idx = enemies.indexOf(e);
          if (idx >= 0) {
            p1Points += e.type;
            enemies.splice(idx, 1);
            playTone(400, 0.2);
          }
        }
      }
    }
  }
  
  enemies = enemies.filter(e => e.x - cameraX > -100);
  codes = codes.filter(c => c.x - cameraX > -100);
  
  timerText.setText('Time: ' + Math.ceil(timer / 1000));
  scoreText1.setText('P1: ' + (p1Collected + p1Points));
  if (twoPlayer) {
    scoreText2.setText('P2: ' + (p2Collected + p2Points));
  }
  
  drawGame();
}

function drawGame() {
  if (!graphics) return;
  graphics.clear();
  
  graphics.lineStyle(3, 0x00ffff, 0.5);
  graphics.moveTo(0, groundY + 28);
  graphics.lineTo(800, groundY + 28);
  graphics.strokePath();
  
  for (let i = 0; i < 40; i++) {
    const x = (i * 20 - cameraX % 20);
    if (x >= -20 && x <= 820) {
      graphics.lineStyle(1, 0x00ffff, 0.1);
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 600);
      graphics.strokePath();
    }
  }
  
  codes.forEach(c => {
    const x = c.x - cameraX;
    if (x > -50 && x < 850) {
      graphics.fillStyle(0x00ff00, 0.9);
      graphics.fillCircle(x, c.y, c.r);
      graphics.lineStyle(2, 0x00ff00, 1);
      graphics.strokeCircle(x, c.y, c.r);
      
      // Draw "200" - clear and large
      const cx = x;
      const cy = c.y - 14;
      drawDigit(graphics, cx - 16, cy, '2', 2);
      drawDigit(graphics, cx - 4, cy, '0', 2);
      drawDigit(graphics, cx + 8, cy, '0', 2);
    }
  });
  
  bananas.forEach(b => {
    const x = b.x - cameraX;
    if (x > -50 && x < 850) {
      graphics.fillStyle(0xffff00, 0.9);
      graphics.fillCircle(x, b.y, b.r);
      graphics.lineStyle(2, 0xffaa00, 1);
      graphics.strokeCircle(x, b.y, b.r);
    }
  });
  
  enemies.forEach(e => {
    const x = e.x - cameraX;
    if (x > -50 && x < 850) {
      e.pulse = (e.pulse || 0) + 0.12;
      const pulseScale = 1 + Math.sin(e.pulse) * 0.15;
      const color = e.type === 400 ? 0xff6600 : 0xff0000;
      
      graphics.fillStyle(color, 0.25);
      graphics.fillCircle(x + e.w/2, e.y + e.h/2, e.w * 0.7 * pulseScale);
      
      graphics.fillStyle(color, 1);
      graphics.fillRect(x, e.y, e.w, e.h);
      graphics.lineStyle(4, 0xffffff, 1);
      graphics.strokeRect(x, e.y, e.w, e.h);
      
      // Draw numbers - clear and large
      const cx = x + e.w/2;
      const cy = e.y + e.h/2 - 16;
      if (e.type === 400) {
        drawDigit(graphics, cx - 16, cy, '4', 2);
        drawDigit(graphics, cx - 4, cy, '0', 2);
        drawDigit(graphics, cx + 8, cy, '0', 2);
      } else {
        drawDigit(graphics, cx - 16, cy, '5', 2);
        drawDigit(graphics, cx - 4, cy, '0', 2);
        drawDigit(graphics, cx + 8, cy, '0', 2);
      }
    }
  });
  
  if (p1) {
    const p1Color = p1Alive ? (p1Immune ? 0x00ffff : 0xffdd00) : 0x808080;
    const cx = p1.x + p1.w/2;
    const cy = p1.y + p1.h/2;
    
    graphics.fillStyle(p1Color, 1);
    graphics.beginPath();
    graphics.arc(cx, cy, p1.w/2, 0, Math.PI * 2);
    graphics.fillPath();
    
    graphics.lineStyle(3, p1Alive ? 0xffaa00 : 0x555555, 1);
    graphics.beginPath();
    graphics.arc(cx, cy, p1.w/2, 0, Math.PI * 2);
    graphics.strokePath();
    
    if (p1Alive) {
      graphics.fillStyle(0xffffaa, 0.6);
      graphics.fillCircle(cx - 7, cy - 5, 7);
      
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(cx - 4, cy - 4, 3);
      graphics.fillCircle(cx + 4, cy - 4, 3);
      graphics.fillRect(cx - 2, cy + 2, 4, 2);
    }
  }
  
  if (twoPlayer && p2) {
    const p2Color = p2Alive ? (p2Immune ? 0x00ffff : 0x00ff88) : 0x808080;
    const cx2 = p2.x + p2.w/2;
    const cy2 = p2.y + p2.h/2;
    
    graphics.fillStyle(p2Color, 1);
    graphics.beginPath();
    graphics.arc(cx2, cy2, p2.w/2, 0, Math.PI * 2);
    graphics.fillPath();
    
    graphics.lineStyle(3, p2Alive ? 0x00aa66 : 0x555555, 1);
    graphics.beginPath();
    graphics.arc(cx2, cy2, p2.w/2, 0, Math.PI * 2);
    graphics.strokePath();
    
    if (p2Alive) {
      graphics.fillStyle(0x88ffaa, 0.6);
      graphics.fillCircle(cx2 - 7, cy2 - 5, 7);
      
      graphics.fillStyle(0x000000, 1);
      graphics.fillCircle(cx2 - 4, cy2 - 4, 3);
      graphics.fillCircle(cx2 + 4, cy2 - 4, 3);
      graphics.fillRect(cx2 - 2, cy2 + 2, 4, 2);
    }
  }
}

function endGame(won) {
  gameOver = true;
  playTone(won ? 880 : 220, 0.5);
  
  const overlay = scene.add.graphics();
  overlay.fillStyle(0x000000, 0.8);
  overlay.fillRect(0, 0, 800, 600);
  
  const msg = won ? 'VICTORY!' : 'GAME OVER';
  const color = won ? '#00ff00' : '#ff0000';
  scene.add.text(400, 250, msg, {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: color,
    stroke: '#000000',
    strokeThickness: 8
  }).setOrigin(0.5);
  
  const p1Total = p1Collected + p1Points;
  const p2Total = p2Collected + p2Points;
  scene.add.text(400, 330, 'P1: ' + p1Total, {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  if (twoPlayer) {
    scene.add.text(400, 370, 'P2: ' + p2Total, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    scene.add.text(400, 410, 'Total: ' + (p1Total + p2Total), {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);
  }
  
  const restartY = twoPlayer ? 450 : 400;
  scene.add.text(400, restartY, 'Press R to Restart', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  scene.input.keyboard.once('keydown-R', () => {
    restartGame();
    scene.scene.restart();
  });
}

function restartGame() {
  p1Collected = 0;
  p2Collected = 0;
  p1Points = 0;
  p2Points = 0;
  timer = 120000;
  codes = [];
  enemies = [];
  bananas = [];
  p1Immune = false;
  p2Immune = false;
  p1Alive = true;
  p2Alive = true;
  twoPlayer = false;
  speed = 4;
  cameraX = 0;
  lastObstacleX = 600;
  spawnTimer = 0;
  codeSpawnTimer = 0;
  p1Jumping = false;
  p1JumpVel = 0;
  p1DoubleJumpUsed = false;
  p2Jumping = false;
  p2JumpVel = 0;
  p2DoubleJumpUsed = false;
  p1.x = 100;
  p1.y = groundY;
  p2 = null;
  gameOver = false;
  if (bannerText) bannerText.setVisible(false);
  stopStarMusic();
  musicTime = 0;
}

function playTone(frequency, duration) {
  const audioContext = scene.sound.context;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'square';
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function showBanner() {
  if (bannerText) {
    bannerText.setVisible(true);
    return;
  }
  
  bannerText = scene.add.text(400, 150, 'PLATANUS HACK MODE', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ffff00',
    stroke: '#000000',
    strokeThickness: 6,
    fontWeight: 'bold'
  }).setOrigin(0.5).setVisible(true);
  
  scene.tweens.add({
    targets: bannerText,
    alpha: { from: 1, to: 0.3 },
    duration: 200,
    yoyo: true,
    repeat: -1
  });
}

function playStarMusic() {
  if (starMusicOsc) return;
  
  const audioContext = scene.sound.context;
  const now = audioContext.currentTime;
  
  starMusicOsc = audioContext.createOscillator();
  starMusicOsc2 = audioContext.createOscillator();
  starMusicGain = audioContext.createGain();
  
  starMusicOsc.type = 'sine';
  starMusicOsc2.type = 'sine';
  
  starMusicOsc.frequency.value = 330;
  starMusicOsc2.frequency.value = 392;
  
  starMusicOsc.connect(starMusicGain);
  starMusicOsc2.connect(starMusicGain);
  starMusicGain.connect(audioContext.destination);
  
  starMusicGain.gain.setValueAtTime(0.08, now);
  
  starMusicOsc.start(now);
  starMusicOsc2.start(now);
}

function stopStarMusic() {
  if (starMusicOsc) {
    starMusicOsc.stop();
    starMusicOsc = null;
  }
  if (starMusicOsc2) {
    starMusicOsc2.stop();
    starMusicOsc2 = null;
  }
  starMusicGain = null;
}
