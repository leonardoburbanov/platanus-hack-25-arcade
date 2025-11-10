// HTTP Monkey: Debug the Maze
// Side-scrolling runner - collect codes and destroy 400/500 errors for unlimited points

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0a0a1a',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let p1, p2, codes = [], enemies = [], bananas = [];
let stars = [];
let p1Collected = 0, p2Collected = 0, p1Points = 0, p2Points = 0, timer = 120000;
let timerText, scoreText1, scoreText2, bananaText1, bananaText2, gameOver = false;
let graphics, scene, twoPlayer = false;
let p1Immune = false, p2Immune = false;
let immuneTimer1 = 0, immuneTimer2 = 0;
let p1Alive = true, p2Alive = true;
let speed = 4, groundY = 500;
let spawnTimer = 0, codeSpawnTimer = 0;
let difficulty = 1, gameTime = 0;
let p1Jumping = false, p1JumpVel = 0, p1DoubleJumpUsed = false;
let p2Jumping = false, p2JumpVel = 0, p2DoubleJumpUsed = false;
let cameraX = 0, lastObstacleX = 600;
let cursors, wasd, spaceKey;
let bannerText = null, starMusicOsc = null, starMusicGain = null, musicTime = 0, starMusicOsc2 = null;
let projectiles = [];
let p1Bananas = 0, p2Bananas = 0;
let p1ShootTimer = 0, p2ShootTimer = 0;

function preload() {
  // No assets to preload - using procedural 8-bit graphics
}

// Simple digit patterns - 5x7 grid, bold and clear
function drawDigit(g, x, y, digit, size) {
  const patterns = {
    '0': [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
    '2': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
    '3': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,1]],
    '4': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1]],
    '5': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,1]],
    '6': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1]],
    '8': [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    '9': [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,1]]
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

// Draw 8-bit style banana sprite - matches reference design
function drawBanana8bit(g, x, y, size) {
  const px = size / 10;
  const py = size / 10;
  
  // 10x14 banana - crescent shape, stem at top-left, curves to bottom-right
  // Progressive shift right in middle creates the curve
  const sprite = [
    [0,0,0,3,3,0,0,0,0,0], // stem moved right
    [0,0,0,3,3,0,0,0,0,0], // stem base
    [0,0,0,1,1,0,0,0,0,0], // top - narrow start
    [0,0,1,2,2,1,0,0,0,0], // thickening
    [0,0,2,2,2,1,0,0,0,0], // thicker
    [0,0,2,2,2,1,0,0,0,0], // full thickness
    [0,0,1,2,2,2,1,0,0,0], // start curving left
    [0,0,1,2,2,2,1,0,0,0], // curve more
    [0,0,0,1,2,2,1,0,0,0], // continuing curve
    [0,0,0,1,2,2,1,0,0,0], // maintain curve
    [0,0,0,0,1,2,1,0,0,0], // tapering
    [0,0,0,0,1,2,2,1,0,0], // more taper
    [0,0,0,0,0,1,2,1,0,0], // narrowing
    [0,0,0,0,0,0,1,1,0,0], // tip
    [0,0,0,0,0,0,0,1,0,0], // pointed end
    [0,0,0,0,0,0,0,0,0,0]  // bottom
  ];
  
  const colors = {
    0: null,
    1: 0xffaa00, // orange-yellow outline/shading
    2: 0xffff00, // bright yellow body
    3: 0x8b4513  // dark brown stem
  };
  
  // Draw single continuous banana
  for (let row = 0; row < 14; row++) {
    for (let col = 0; col < 10; col++) {
      const val = sprite[row][col];
      if (val && colors[val]) {
        g.fillStyle(colors[val], 1);
        g.fillRect(x + col * px, y + row * py, px, py);
      }
    }
  }
}

// Draw 8-bit style monkey sprite using pixel-based rectangles
// Colors: 0=transparent, 1=dark, 2=medium, 3=light, 4=black, 5=white
// playerNum: 1 for P1 (orange/yellow), 2 for P2 (green/teal)
function drawMonkey8bit(g, x, y, w, h, alive, immune, playerNum) {
  const px = w / 8; // Pixel size based on width
  const py = h / 10; // Pixel size based on height
  // 8x10 pixel monkey sprite: head with ears, face, body, legs
  const sprite = [
    [0,0,0,1,1,0,0,0], // top ears
    [0,0,1,2,2,1,0,0], // ears
    [0,1,2,2,2,2,1,0], // head top
    [1,2,2,3,3,2,2,1], // face
    [1,2,4,3,3,4,2,1], // eyes
    [1,2,3,4,4,3,2,1], // mouth
    [0,1,2,2,2,2,1,0], // neck/chest
    [0,1,2,2,2,2,1,0], // body
    [1,2,2,2,2,2,2,1], // body bottom
    [0,1,1,0,0,1,1,0]  // legs
  ];
  
  // Different color schemes for P1 (orange/yellow) and P2 (green/teal)
  const p1Colors = {
    0: null,
    1: alive ? 0x8b4513 : 0x555555, // dark brown
    2: alive ? 0xcd853f : 0x666666, // medium brown
    3: alive ? 0xffa500 : 0x777777, // orange
    4: 0x000000, // black (eyes, mouth)
    5: 0xffffff  // white
  };
  
  const p2Colors = {
    0: null,
    1: alive ? 0x2d5016 : 0x555555, // dark green
    2: alive ? 0x4a7c59 : 0x666666, // medium green
    3: alive ? 0x00ff88 : 0x777777, // bright green/teal
    4: 0x000000, // black (eyes, mouth)
    5: 0xffffff  // white
  };
  
  const colors = playerNum === 1 ? p1Colors : p2Colors;
  
  // Draw sprite pixel by pixel
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 8; col++) {
      const val = sprite[row][col];
      if (val && colors[val]) {
        g.fillStyle(colors[val], 1);
        g.fillRect(x + col * px, y + row * py, px, py);
      }
    }
  }
  
  // Draw circular cyan aura when in Platanus Hack mode (immune)
  if (alive && immune) {
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const radius = Math.max(w, h) * 0.7;
    
    // Outer glow
    g.lineStyle(3, 0x00ffff, 0.6);
    g.beginPath();
    g.arc(centerX, centerY, radius, 0, Math.PI * 2);
    g.strokePath();
    
    // Inner glow
    g.lineStyle(2, 0x88ffff, 0.8);
    g.beginPath();
    g.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
    g.strokePath();
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
    color: '#ffa500'  // Orange to match P1 monkey
  });
  
  scoreText2 = this.add.text(10, 60, 'P2: 0', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff88',  // Bright green/teal to match P2 monkey
    visible: false
  });
  
  bananaText1 = this.add.text(200, 35, '🍌: 0', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffff00'  // Yellow for bananas
  });
  
  bananaText2 = this.add.text(200, 60, '🍌: 0', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffff00',  // Yellow for bananas
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
      difficulty = 1;
      gameTime = 0;
      speed = 4;
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
      bananaText2.setVisible(true);
      stars = []; // Reset stars for new game
      projectiles = [];
      p1Bananas = 0;
      p2Bananas = 0;
      p1ShootTimer = 0;
      p2ShootTimer = 0;
        for (let i = 0; i < 5; i++) {
          const successCodes = [200, 201, 202, 204, 206];
          const code = successCodes[Math.floor(Math.random() * successCodes.length)];
          codes.push({ x: 400 + i * 150, y: groundY - 50 - Math.random() * 100, r: 18, code });
        }
      spawnObstacle();
    }
  });
  
  for (let i = 0; i < 5; i++) {
    const successCodes = [200, 201, 202, 204, 206];
    const code = successCodes[Math.floor(Math.random() * successCodes.length)];
    codes.push({ x: 400 + i * 150, y: groundY - 50 - Math.random() * 100, r: 18, code });
  }
  spawnObstacle();
  
  drawGame();
}

function spawnObstacle() {
  // More variety of 4xx and 5xx HTTP error codes
  const types = [400, 401, 403, 404, 408, 409, 410, 413, 414, 418, 429, 431, 500, 501, 502, 503, 504, 505, 507, 508, 510, 511];
  
  // Pattern selection based on difficulty
  const patternRoll = Math.random();
  let pattern;
  
  if (difficulty >= 3 && patternRoll < 0.15) {
    pattern = 'wave'; // Wave pattern
  } else if (difficulty >= 2 && patternRoll < 0.25) {
    pattern = 'wall'; // Vertical wall
  } else if (difficulty >= 2 && patternRoll < 0.4) {
    pattern = 'alternating'; // Alternating heights
  } else if (patternRoll < 0.3 + (difficulty * 0.1)) {
    pattern = 'cluster'; // Cluster
  } else {
    pattern = 'single'; // Single obstacle
  }
  
  if (pattern === 'wave') {
    // Wave pattern: obstacles moving up and down
    const waveCount = 3 + Math.floor(difficulty);
    for (let i = 0; i < waveCount; i++) {
      const wavePhase = (i / waveCount) * Math.PI * 2;
      const height = groundY - 100 + Math.sin(wavePhase) * 80;
      enemies.push({ x: lastObstacleX + i * 100, y: height, type: types[Math.floor(Math.random() * types.length)], w: 45, h: 55, pulse: 0 });
    }
    lastObstacleX += waveCount * 100;
  } else if (pattern === 'wall') {
    // Vertical wall: obstacles at multiple heights
    const wallHeights = [groundY, groundY - 150, groundY - 280];
    for (let h of wallHeights) {
      enemies.push({ x: lastObstacleX + 50, y: h, type: types[Math.floor(Math.random() * types.length)], w: 45, h: 55, pulse: 0 });
    }
    lastObstacleX += 200;
  } else if (pattern === 'alternating') {
    // Alternating pattern: low-high-low-high
    const altCount = 3 + Math.floor(difficulty * 0.5);
    for (let i = 0; i < altCount; i++) {
      const height = (i % 2 === 0) ? groundY : (groundY - 200);
      enemies.push({ x: lastObstacleX + i * 120, y: height, type: types[Math.floor(Math.random() * types.length)], w: 45, h: 55, pulse: 0 });
    }
    lastObstacleX += altCount * 120;
  } else if (pattern === 'cluster') {
    // Cluster pattern
    const clusterSize = 2 + Math.floor(Math.random() * (2 + difficulty));
    for (let i = 0; i < clusterSize; i++) {
      const gap = i === 0 ? 350 + Math.random() * 250 : 60 + Math.random() * 80;
      const rand = Math.random();
      let height;
      if (rand < 0.6) {
        height = groundY;
      } else if (rand < 0.9) {
        height = groundY - 150;
      } else {
        height = groundY - 280;
      }
      enemies.push({ x: lastObstacleX + gap, y: height, type: types[Math.floor(Math.random() * types.length)], w: 45, h: 55, pulse: 0 });
      lastObstacleX = lastObstacleX + gap;
    }
  } else {
    // Single obstacle
    const rand = Math.random();
    let height;
    if (rand < 0.6) {
      height = groundY;
    } else if (rand < 0.9) {
      height = groundY - 150;
    } else {
      height = groundY - 280;
    }
    enemies.push({ x: lastObstacleX + 350 + Math.random() * 250, y: height, type: types[Math.floor(Math.random() * types.length)], w: 45, h: 55, pulse: 0 });
    lastObstacleX = lastObstacleX + 350 + Math.random() * 250;
  }
}

function spawnCode() {
  // Variety of 2xx HTTP success codes
  const successCodes = [200, 201, 202, 204, 206];
  const code = successCodes[Math.floor(Math.random() * successCodes.length)];
  const y = groundY - 30 - Math.random() * 120;
  codes.push({ x: cameraX + 500 + Math.random() * 200, y, r: 18, code });
}

function update(time, delta) {
  if (gameOver) return;
  
  timer -= delta;
  if (timer <= 0) {
    endGame(false);
    return;
  }
  
  // Progressive difficulty system
  gameTime += delta;
  difficulty = 1 + Math.floor(gameTime / 30000); // Increase difficulty every 30 seconds
  speed = 4 + (difficulty - 1) * 0.5; // Speed increases with difficulty
  cameraX += speed;
  
  if (p1Immune) {
    immuneTimer1 -= delta;
    if (immuneTimer1 <= 0) {
      p1Immune = false;
      p1Bananas = 0;
      p1ShootTimer = 0;
      if (bannerText) bannerText.setVisible(false);
      stopStarMusic();
    } else if (p1Bananas >= 2) {
      // Auto-shoot projectiles in burst
      p1ShootTimer += delta;
      if (p1ShootTimer >= 150) { // Shoot every 150ms
        p1ShootTimer = 0;
        const baseY = p1.y + p1.h / 2;
        for (let i = 0; i < 3; i++) {
          projectiles.push({
            x: cameraX + p1.x + p1.w,
            y: baseY + (i - 1) * 10, // Spread vertically
            vx: 15,
            vy: 0,
            player: 1
          });
        }
        playTone(500, 0.05);
      }
    }
  }
  if (p2Immune && twoPlayer) {
    immuneTimer2 -= delta;
    if (immuneTimer2 <= 0) {
      p2Immune = false;
      p2Bananas = 0;
      p2ShootTimer = 0;
      if (bannerText) bannerText.setVisible(false);
      stopStarMusic();
    } else if (p2Bananas >= 2) {
      // Auto-shoot projectiles in burst
      p2ShootTimer += delta;
      if (p2ShootTimer >= 150) { // Shoot every 150ms
        p2ShootTimer = 0;
        const baseY = p2.y + p2.h / 2;
        for (let i = 0; i < 3; i++) {
          projectiles.push({
            x: cameraX + p2.x + p2.w,
            y: baseY + (i - 1) * 10, // Spread vertically
            vx: 15,
            vy: 0,
            player: 2
          });
        }
        playTone(500, 0.05);
      }
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
        if (p2Immune) {
          p2Bananas++;
          if (p2Bananas >= 2) {
            p2ShootTimer = 0; // Start shooting immediately
          }
        } else {
          p2Immune = true;
          p2Bananas = 1; // First banana
          immuneTimer2 = 5000;
          showBanner(false);
          playStarMusic();
        }
        if (p2Bananas >= 2) {
          showBanner(true); // Animate with cyan for second banana
        }
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
        if (p1Immune) {
          p1Bananas++;
          if (p1Bananas >= 2) {
            p1ShootTimer = 0; // Start shooting immediately
          }
        } else {
          p1Immune = true;
          p1Bananas = 1; // First banana
          immuneTimer1 = 5000;
          showBanner(false);
          playStarMusic();
        }
        if (p1Bananas >= 2) {
          showBanner(true); // Animate with cyan for second banana
        }
        return false;
      }
      return true;
    });
  }
  
  // Spawn rate increases with difficulty
  const baseSpawnRate = 150 - (difficulty - 1) * 15;
  const minSpawnRate = 80;
  spawnTimer += delta * speed * 0.5;
  if (spawnTimer > Math.max(baseSpawnRate, minSpawnRate)) {
    spawnTimer = 0;
    spawnObstacle();
  }
  
  codeSpawnTimer += delta * speed * 0.3;
  if (codeSpawnTimer > 120 && codes.length < 15) {
    codeSpawnTimer = 0;
    spawnCode();
  }
  
  if (Math.random() < 0.006 && bananas.length < 5) {
    const bananaX = cameraX + 900;
    const bananaY = groundY - 25;
    bananas.push({ x: bananaX, y: bananaY, size: 30, t: 0 });
  }
  
  bananas.forEach(b => {
    b.t += delta;
  });
  bananas = bananas.filter(b => {
    if (b.t >= 15000) {
      return false;
    }
    return true;
  });
  
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
  
  // Update projectiles and check collisions with codes
  projectiles = projectiles.filter(proj => {
    proj.x += proj.vx;
    const projX = proj.x - cameraX;
    
    // Check collision with codes
    let hit = false;
    for (let i = codes.length - 1; i >= 0; i--) {
      const c = codes[i];
      const cx = c.x - cameraX;
      if (projX > -50 && projX < 850 && Math.abs(projX - cx) < 25 && Math.abs(proj.y - c.y) < 25) {
        if (proj.player === 1) {
          p1Collected += 200;
        } else {
          p2Collected += 200;
        }
        playTone(600, 0.1);
        codes.splice(i, 1);
        hit = true;
        break;
      }
    }
    
    // Remove if hit code or off screen
    return !hit && (projX < 850);
  });
  
  timerText.setText('Time: ' + Math.ceil(timer / 1000));
  scoreText1.setText('P1: ' + (p1Collected + p1Points));
  bananaText1.setText('🍌: ' + p1Bananas);
  if (twoPlayer) {
    scoreText2.setText('P2: ' + (p2Collected + p2Points));
    bananaText2.setText('🍌: ' + p2Bananas);
  }
  
  drawGame();
}

function drawGame() {
  if (!graphics) return;
  graphics.clear();
  
  // Simple solid background (drawn once, Phaser handles the rest via backgroundColor)
  // Background is handled by Phaser's backgroundColor config
  
  // Draw simple stars (fewer, larger for better performance)
  if (stars.length === 0) {
    // Initialize stars - fewer for better performance
    for (let i = 0; i < 30; i++) {
      stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 500,
        size: 1.5,
        speed: 0.3
      });
    }
  }
  
  stars.forEach(star => {
    const x = (star.x - cameraX * star.speed) % 2000;
    if (x >= -10 && x <= 810) {
      graphics.fillStyle(0xffffff, 0.6);
      graphics.fillCircle(x, star.y, star.size);
    }
  });
  
  // Draw ground line
  graphics.lineStyle(3, 0x00ffff, 0.5);
  graphics.moveTo(0, groundY + 28);
  graphics.lineTo(800, groundY + 28);
  graphics.strokePath();
  
  codes.forEach(c => {
    const x = c.x - cameraX;
    if (x > -50 && x < 850) {
      graphics.fillStyle(0x00ff88, 0.9);
      graphics.fillCircle(x, c.y, c.r);
      graphics.lineStyle(2, 0x00ff88, 1);
      graphics.strokeCircle(x, c.y, c.r);
      
      // Draw 2xx code dynamically (centered inside circle)
      const code = (c.code || 200).toString();
      const cx = x;
      const cy = c.y - 5.25; // Center vertically (digit height is 10.5px)
      const offset = (code.length === 3 ? -13.5 : -9);
      for (let i = 0; i < code.length; i++) {
        drawDigit(graphics, cx + offset + i * 9, cy, code[i], 1.5);
      }
    }
  });
  
  bananas.forEach(b => {
    const x = b.x - cameraX;
    if (x > -50 && x < 850) {
      drawBanana8bit(graphics, x - b.size/2, b.y - b.size/2, b.size);
    }
  });
  
  enemies.forEach(e => {
    const x = e.x - cameraX;
    if (x > -50 && x < 850) {
      e.pulse = (e.pulse || 0) + 0.12;
      const pulseScale = 1 + Math.sin(e.pulse) * 0.15;
      // 4xx codes = orange (matches P1 palette), 5xx codes = red
      const color = e.type < 500 ? 0xffa500 : 0xcc3300;
      
      graphics.fillStyle(color, 0.25);
      graphics.fillCircle(x + e.w/2, e.y + e.h/2, e.w * 0.7 * pulseScale);
      
      graphics.fillStyle(color, 1);
      graphics.fillRect(x, e.y, e.w, e.h);
      graphics.lineStyle(4, 0xffffff, 1);
      graphics.strokeRect(x, e.y, e.w, e.h);
      
      // Draw status code dynamically (centered inside rectangle)
      const code = e.type.toString();
      const cx = x + e.w/2;
      const cy = e.y + e.h/2 - 5.25; // Center vertically (digit height is 10.5px)
      const offset = (code.length === 3 ? -13.5 : -9);
      for (let i = 0; i < code.length; i++) {
        drawDigit(graphics, cx + offset + i * 9, cy, code[i], 1.5);
      }
    }
  });
  
  if (p1) {
    // Draw monkey sprite: p1.y represents top position (based on collision detection)
    // P1 uses orange/yellow color scheme
    drawMonkey8bit(graphics, p1.x, p1.y, p1.w, p1.h, p1Alive, p1Immune, 1);
  }
  
  if (twoPlayer && p2) {
    // Draw monkey sprite: p2.y represents top position (based on collision detection)
    // P2 uses green/teal color scheme
    drawMonkey8bit(graphics, p2.x, p2.y, p2.w, p2.h, p2Alive, p2Immune, 2);
  }
  
  // Draw projectiles
  projectiles.forEach(proj => {
    const x = proj.x - cameraX;
    if (x > -10 && x < 810) {
      const color = proj.player === 1 ? 0xffa500 : 0x00ff88;
      graphics.fillStyle(color, 1);
      graphics.fillCircle(x, proj.y, 6);
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeCircle(x, proj.y, 6);
    }
  });
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
    color: '#ffa500'  // Orange to match P1 monkey
  }).setOrigin(0.5);
  if (twoPlayer) {
    scene.add.text(400, 370, 'P2: ' + p2Total, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#00ff88'  // Bright green/teal to match P2 monkey
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
  difficulty = 1;
  gameTime = 0;
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
  stars = []; // Reset stars
  projectiles = [];
  p1Bananas = 0;
  p2Bananas = 0;
  p1ShootTimer = 0;
  p2ShootTimer = 0;
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

function showBanner(secondBanana = false) {
  if (!bannerText) {
    bannerText = scene.add.text(400, 150, 'PLATANUS HACK MODE', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6,
      fontWeight: 'bold'
    }).setOrigin(0.5).setVisible(true);
  } else {
    bannerText.setVisible(true);
  }
  
  // If second banana, animate with cyan colors
  if (secondBanana) {
    // Stop existing tweens
    scene.tweens.killTweensOf(bannerText);
    
    // Animate color between cyan shades
    scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 300,
      yoyo: true,
      repeat: -1,
      onUpdate: function(tween) {
        const value = tween.getValue();
        // Interpolate between #00ffff (cyan) and #88ffff (light cyan)
        const r = 0;
        const g = Math.floor(255 - (255 - 136) * value);
        const b = 255;
        const hexColor = '#' + [r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('');
        bannerText.setColor(hexColor);
      }
    });
    
    // Also animate scale for extra effect
    scene.tweens.add({
      targets: bannerText,
      scale: { from: 1, to: 1.1 },
      duration: 200,
      yoyo: true,
      repeat: -1
    });
    
    // Animate stroke color to cyan
    scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 300,
      yoyo: true,
      repeat: -1,
      onUpdate: function(tween) {
        const value = tween.getValue();
        const r = Math.floor(0);
        const g = Math.floor(255 - (255 - 136) * value);
        const b = Math.floor(255);
        bannerText.setStroke(`rgb(${r},${g},${b})`, 6);
      }
    });
  } else {
    // Normal yellow animation
    scene.tweens.killTweensOf(bannerText);
    bannerText.clearTint();
    bannerText.setColor('#ffff00');
    bannerText.setStroke('#000000', 6);
    bannerText.setScale(1);
    
    scene.tweens.add({
      targets: bannerText,
      alpha: { from: 1, to: 0.3 },
      duration: 200,
      yoyo: true,
      repeat: -1
    });
  }
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
