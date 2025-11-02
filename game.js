// HTTP Monkey: Debug the Maze
// Neon digital maze game where hacker monkeys collect 200 codes and dodge 400/500 errors

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

// Game state
let p1, p2;
let codes = [];
let enemies = [];
let bananas = [];
let walls = [];
let grid = [];
let gridSize = 20;
let cols, rows;
let collected = 0;
let totalCodes = 200;
let timer = 120000;
let timerText;
let scoreText;
let gameOver = false;
let graphics;
let gameScene;
let twoPlayer = false;
let p1Immune = false;
let p2Immune = false;
let immuneTimer1 = 0;
let immuneTimer2 = 0;

// Controls
let cursors, wasd;

function create() {
  gameScene = this;
  graphics = this.add.graphics();
  
  cols = Math.floor(800 / gridSize);
  rows = Math.floor(600 / gridSize);
  
  // Initialize grid
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = 0;
    }
  }
  
  // Generate maze
  generateMaze();
  
  // Create players
  p1 = { x: 1, y: 1, vx: 0, vy: 0, s: 0.1 };
  twoPlayer = false;
  
  // Create collectibles
  spawnCodes();
  
  // Create enemies
  spawnEnemies();
  
  // Spawn bananas periodically
  spawnBanana();
  this.time.addEvent({
    delay: 8000,
    callback: spawnBanana,
    loop: true
  });
  
  // UI
  timerText = this.add.text(10, 10, 'Time: 120', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ffff'
  });
  
  scoreText = this.add.text(10, 35, 'Codes: 0/200', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff00'
  });
  
  this.add.text(10, 570, 'Press SPACE for 2P mode | Arrow Keys: P1 | WASD: P2', {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#888888'
  });
  
  // Input
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys('W,S,A,D');
  this.input.keyboard.on('keydown-SPACE', () => {
    if (!gameOver && !twoPlayer) {
      twoPlayer = true;
      p2 = { x: cols - 2, y: rows - 2, vx: 0, vy: 0, s: 0.1 };
    }
  });
}

function generateMaze() {
  // Simple maze with walls
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) {
        grid[y][x] = 1;
        walls.push({ x, y });
      } else if ((x % 3 === 0 || y % 3 === 0) && Math.random() > 0.3) {
        grid[y][x] = 1;
        walls.push({ x, y });
      }
    }
  }
  
  // Ensure path exists
  for (let y = 2; y < rows - 2; y += 3) {
    for (let x = 2; x < cols - 2; x += 3) {
      grid[y][x] = 0;
      const idx = walls.findIndex(w => w.x === x && w.y === y);
      if (idx >= 0) walls.splice(idx, 1);
    }
  }
}

function spawnCodes() {
  let count = 0;
  while (count < totalCodes) {
    const x = Math.floor(Math.random() * (cols - 2)) + 1;
    const y = Math.floor(Math.random() * (rows - 2)) + 1;
    if (grid[y][x] === 0 && !codes.find(c => c.x === x && c.y === y)) {
      codes.push({ x, y });
      count++;
    }
  }
}

function spawnEnemies() {
  const enemyCount = 8;
  for (let i = 0; i < enemyCount; i++) {
    let x, y, valid = false;
    while (!valid) {
      x = Math.floor(Math.random() * (cols - 2)) + 1;
      y = Math.floor(Math.random() * (rows - 2)) + 1;
      if (grid[y][x] === 0) valid = true;
    }
    enemies.push({
      x, y, type: i % 2 === 0 ? 400 : 500,
      tx: x, ty: y, s: 0.08
    });
  }
}

function spawnBanana() {
  if (bananas.length >= 3) return;
  let x, y, valid = false, attempts = 0;
  while (!valid && attempts < 50) {
    x = Math.floor(Math.random() * (cols - 2)) + 1;
    y = Math.floor(Math.random() * (rows - 2)) + 1;
    if (grid[y][x] === 0 && !codes.find(c => c.x === x && c.y === y)) {
      valid = true;
    }
    attempts++;
  }
  if (valid) bananas.push({ x, y, t: 0 });
}

function update(time, delta) {
  if (gameOver) return;
  
  timer -= delta;
  if (timer <= 0) {
    endGame(false);
    return;
  }
  
  if (collected >= totalCodes) {
    endGame(true);
    return;
  }
  
  // Update immune timers
  if (p1Immune) {
    immuneTimer1 -= delta;
    if (immuneTimer1 <= 0) p1Immune = false;
  }
  if (p2Immune && twoPlayer) {
    immuneTimer2 -= delta;
    if (immuneTimer2 <= 0) p2Immune = false;
  }
  
  // Player 1 controls
  if (cursors.left.isDown && grid[Math.floor(p1.y)][Math.floor(p1.x - 0.5)] === 0) {
    p1.vx = -0.15;
  } else if (cursors.right.isDown && grid[Math.floor(p1.y)][Math.floor(p1.x + 0.5)] === 0) {
    p1.vx = 0.15;
  } else {
    p1.vx *= 0.8;
  }
  
  if (cursors.up.isDown && grid[Math.floor(p1.y - 0.5)][Math.floor(p1.x)] === 0) {
    p1.vy = -0.15;
  } else if (cursors.down.isDown && grid[Math.floor(p1.y + 0.5)][Math.floor(p1.x)] === 0) {
    p1.vy = 0.15;
  } else {
    p1.vy *= 0.8;
  }
  
  // Player 2 controls
  if (twoPlayer && p2) {
    if (wasd.A.isDown && grid[Math.floor(p2.y)][Math.floor(p2.x - 0.5)] === 0) {
      p2.vx = -0.15;
    } else if (wasd.D.isDown && grid[Math.floor(p2.y)][Math.floor(p2.x + 0.5)] === 0) {
      p2.vx = 0.15;
    } else {
      p2.vx *= 0.8;
    }
    
    if (wasd.W.isDown && grid[Math.floor(p2.y - 0.5)][Math.floor(p2.x)] === 0) {
      p2.vy = -0.15;
    } else if (wasd.S.isDown && grid[Math.floor(p2.y + 0.5)][Math.floor(p2.x)] === 0) {
      p2.vy = 0.15;
    } else {
      p2.vy *= 0.8;
    }
    
    p2.x += p2.vx;
    p2.y += p2.vy;
    
    // Player 2 boundaries
    p2.x = Math.max(0.5, Math.min(cols - 1.5, p2.x));
    p2.y = Math.max(0.5, Math.min(rows - 1.5, p2.y));
    
    // Collect codes
    codes = codes.filter(c => {
      if (Math.abs(p2.x - c.x) < 0.5 && Math.abs(p2.y - c.y) < 0.5) {
        collected++;
        playTone(gameScene, 600, 0.1);
        return false;
      }
      return true;
    });
    
    // Collect bananas
    bananas = bananas.filter(b => {
      if (Math.abs(p2.x - b.x) < 0.5 && Math.abs(p2.y - b.y) < 0.5) {
        p2Immune = true;
        immuneTimer2 = 5000;
        playTone(gameScene, 800, 0.15);
        return false;
      }
      return true;
    });
    
    // Enemy collision P2
    if (!p2Immune) {
      for (let e of enemies) {
        if (Math.abs(p2.x - e.x) < 0.6 && Math.abs(p2.y - e.y) < 0.6) {
          endGame(false);
          return;
        }
      }
    } else {
      // Debug enemies when immune
      for (let e of enemies) {
        if (Math.abs(p2.x - e.x) < 0.6 && Math.abs(p2.y - e.y) < 0.6) {
          const idx = enemies.indexOf(e);
          if (idx >= 0) {
            enemies.splice(idx, 1);
            playTone(gameScene, 400, 0.2);
            if (enemies.length === 0) spawnEnemies();
          }
        }
      }
    }
  }
  
  // Update player 1
  p1.x += p1.vx;
  p1.y += p1.vy;
  
  // Player 1 boundaries
  p1.x = Math.max(0.5, Math.min(cols - 1.5, p1.x));
  p1.y = Math.max(0.5, Math.min(rows - 1.5, p1.y));
  
  // Collect codes
  codes = codes.filter(c => {
    if (Math.abs(p1.x - c.x) < 0.5 && Math.abs(p1.y - c.y) < 0.5) {
      collected++;
      playTone(gameScene, 600, 0.1);
      return false;
    }
    return true;
  });
  
  // Collect bananas
  bananas = bananas.filter(b => {
    if (Math.abs(p1.x - b.x) < 0.5 && Math.abs(p1.y - b.y) < 0.5) {
      p1Immune = true;
      immuneTimer1 = 5000;
      playTone(gameScene, 800, 0.15);
      return false;
    }
    return true;
  });
  
  // Enemy AI
  for (let e of enemies) {
    const target = twoPlayer && p2 ? 
      (Math.abs(e.x - p1.x) + Math.abs(e.y - p1.y) < 
       Math.abs(e.x - p2.x) + Math.abs(e.y - p2.y) ? p1 : p2) : p1;
    
    let dx = target.x - e.x;
    let dy = target.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      dx /= dist;
      dy /= dist;
    }
    
    let nx = e.x + dx * e.s;
    let ny = e.y + dy * e.s;
    
    // Wall check
    if (grid[Math.floor(ny)][Math.floor(nx)] === 0) {
      e.x = nx;
      e.y = ny;
    } else {
      // Try alternative paths
      if (grid[Math.floor(e.y)][Math.floor(nx)] === 0) e.x = nx;
      else if (grid[Math.floor(ny)][Math.floor(e.x)] === 0) e.y = ny;
    }
    
    // Collision with player 1
    if (!p1Immune && Math.abs(p1.x - e.x) < 0.6 && Math.abs(p1.y - e.y) < 0.6) {
      endGame(false);
      return;
    }
    
    // Debug enemy when immune
    if (p1Immune && Math.abs(p1.x - e.x) < 0.6 && Math.abs(p1.y - e.y) < 0.6) {
      const idx = enemies.indexOf(e);
      if (idx >= 0) {
        enemies.splice(idx, 1);
        playTone(gameScene, 400, 0.2);
        if (enemies.length === 0) spawnEnemies();
      }
    }
  }
  
  // Update banana timers
  bananas.forEach(b => b.t += delta);
  bananas = bananas.filter(b => b.t < 10000);
  
  // Update UI
  timerText.setText('Time: ' + Math.ceil(timer / 1000));
  scoreText.setText('Codes: ' + collected + '/' + totalCodes);
  
  drawGame();
}

function drawGame() {
  graphics.clear();
  
  // Draw maze walls (neon cyan)
  walls.forEach(w => {
    graphics.fillStyle(0x00ffff, 0.3);
    graphics.fillRect(w.x * gridSize, w.y * gridSize, gridSize, gridSize);
    graphics.lineStyle(2, 0x00ffff, 0.6);
    graphics.strokeRect(w.x * gridSize, w.y * gridSize, gridSize, gridSize);
  });
  
  // Draw collectible codes (green 200)
  codes.forEach(c => {
    graphics.fillStyle(0x00ff00, 0.8);
    graphics.fillCircle(c.x * gridSize + gridSize/2, c.y * gridSize + gridSize/2, 6);
    graphics.lineStyle(1, 0x00ff00, 1);
    graphics.strokeCircle(c.x * gridSize + gridSize/2, c.y * gridSize + gridSize/2, 6);
  });
  
  // Draw bananas (yellow)
  bananas.forEach(b => {
    graphics.fillStyle(0xffff00, 0.9);
    graphics.fillCircle(b.x * gridSize + gridSize/2, b.y * gridSize + gridSize/2, 7);
    graphics.lineStyle(2, 0xffaa00, 1);
    graphics.strokeCircle(b.x * gridSize + gridSize/2, b.y * gridSize + gridSize/2, 7);
  });
  
  // Draw enemies (red - 400/500)
  enemies.forEach(e => {
    const color = e.type === 400 ? 0xff6600 : 0xff0000;
    graphics.fillStyle(color, 0.9);
    graphics.fillCircle(e.x * gridSize + gridSize/2, e.y * gridSize + gridSize/2, 8);
    graphics.lineStyle(2, color, 1);
    graphics.strokeCircle(e.x * gridSize + gridSize/2, e.y * gridSize + gridSize/2, 8);
  });
  
  // Draw player 1 (monkey - orange)
  const p1Color = p1Immune ? 0x00ffff : 0xff8800;
  graphics.fillStyle(p1Color, 1);
  graphics.fillCircle(p1.x * gridSize + gridSize/2, p1.y * gridSize + gridSize/2, 9);
  graphics.lineStyle(2, p1Color, 1);
  graphics.strokeCircle(p1.x * gridSize + gridSize/2, p1.y * gridSize + gridSize/2, 9);
  
  // Draw player 2 if active
  if (twoPlayer && p2) {
    const p2Color = p2Immune ? 0x00ffff : 0xff8800;
    graphics.fillStyle(p2Color, 1);
    graphics.fillCircle(p2.x * gridSize + gridSize/2, p2.y * gridSize + gridSize/2, 9);
    graphics.lineStyle(2, p2Color, 1);
    graphics.strokeCircle(p2.x * gridSize + gridSize/2, p2.y * gridSize + gridSize/2, 9);
  }
}

function endGame(won) {
  gameOver = true;
  playTone(gameScene, won ? 880 : 220, 0.5);
  
  const overlay = gameScene.add.graphics();
  overlay.fillStyle(0x000000, 0.8);
  overlay.fillRect(0, 0, 800, 600);
  
  const msg = won ? 'VICTORY!' : 'GAME OVER';
  const color = won ? '#00ff00' : '#ff0000';
  const text = gameScene.add.text(400, 250, msg, {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: color,
    stroke: '#000000',
    strokeThickness: 8
  }).setOrigin(0.5);
  
  gameScene.add.text(400, 350, 'Codes Collected: ' + collected + '/' + totalCodes, {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  gameScene.add.text(400, 400, 'Press R to Restart', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  gameScene.input.keyboard.once('keydown-R', () => {
    collected = 0;
    timer = 120000;
    codes = [];
    enemies = [];
    bananas = [];
    walls = [];
    grid = [];
    p1Immune = false;
    p2Immune = false;
    twoPlayer = false;
    gameOver = false;
    gameScene.scene.restart();
  });
}

function playTone(scene, frequency, duration) {
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
