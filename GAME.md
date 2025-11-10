# HTTP Monkey: Error Runner

## Game Overview

**HTTP Monkey: Debug the Maze** is a fast-paced side-scrolling runner arcade game where you play as a hacker monkey navigating through a digital network maze. Collect successful HTTP status codes (2xx) to score points while avoiding error codes (4xx and 5xx) that appear as dangerous obstacles. The game features progressive difficulty, complex obstacle patterns, and a time-based challenge that gets increasingly difficult as you play.

## Game Modes

### Single Player Mode
- Start with one hacker monkey (Player 1)
- Navigate obstacles solo
- Collect codes and bananas on your own
- Race against the 120-second timer

### Two Player Mode
- Press **SPACE** during gameplay to add Player 2
- Both players share the same timer and play cooperatively
- Players can cover more ground together
- Scores are tracked separately but combined for total
- Game ends when both players are eliminated

## Controls

### Player 1
- **UP Arrow**: Jump / Double Jump
- Double tap UP while in the air for double jump

### Player 2 (Two Player Mode)
- **W Key**: Jump / Double Jump
- Double tap W while in the air for double jump

### General
- **SPACE**: Add second player (in single player mode)

## Game Mechanics

### Movement
- **Auto-Scrolling**: The game automatically scrolls forward at an increasing speed
- **Jump Mechanics**: Players can perform a standard jump from the ground
- **Double Jump**: Press jump again while in the air (before landing) to perform a second jump
  - Double jump is only available once per landing
  - Resets when you touch the ground
  - Essential for navigating higher obstacles and complex patterns

### Ground Level
- The ground is at Y position 500
- Players spawn at ground level
- Most obstacles spawn at ground level (60% chance)

## Collectibles

### 2xx Success Codes (Green Circles)
These represent successful HTTP requests and award points:

- **200 OK**: Standard successful response
- **201 Created**: Resource successfully created
- **202 Accepted**: Request accepted for processing
- **204 No Content**: Successful response with no content
- **206 Partial Content**: Partial content success

**Scoring**: Each 2xx code collected awards **200 points**

**Behavior**:
- Spawn at random heights (ground level to 120 pixels above)
- Display their status code number clearly
- Green color indicates they're safe to collect

### Bananas (Yellow/Platanus Logo)
Special collectibles that grant powerful abilities:

- **Visual**: Banana-shaped icons with Platanus logo
- **Size**: 30x30 pixels
- **Spawn Rate**: Random chance, up to 10 bananas active at once
- **Duration**: Despawn after 15 seconds if not collected
- **Stacking**: Can collect up to 3 bananas for enhanced abilities

**PLATANUS HACK MODE**:
- **First Banana**: Activates immunity mode with **5 seconds of immunity**
- **Additional Bananas** (up to 3 total): Each banana extends immunity by **2 seconds**
- **Banana Counter**: Displayed as 🍌: X in the UI

**Immunity Effects**:
- Player glows cyan color
- "PLATANUS HACK MODE" banner appears
- Special background music plays
- Contact with error codes destroys them instead of eliminating you
- Destroying error codes awards bonus points equal to their status code number (400-511 points)

**Projectile Shooting** (2+ Bananas):
- At **2 or more bananas**, players gain automatic projectile shooting ability
- Shoots **3 projectiles in a burst** every 150ms
- Projectiles travel forward and can:
  - Collect 2xx success codes for **200 points** each
  - Destroy error codes (4xx/5xx) for **status code value** in points
- Banner animates with cyan colors when shooting is active
- Projectiles are color-coded: orange for Player 1, green for Player 2

## Obstacles - HTTP Error Codes

### 4xx Client Error Codes (Orange)
These appear as orange pulsing obstacles:

- **400 Bad Request**: Invalid request syntax
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **408 Request Timeout**: Request took too long
- **409 Conflict**: Resource conflict
- **410 Gone**: Resource no longer available
- **413 Payload Too Large**: Request entity too large
- **414 URI Too Long**: Request URI too long
- **418 I'm a teapot**: Easter egg status code
- **429 Too Many Requests**: Rate limit exceeded
- **431 Request Header Fields Too Large**: Headers too large

**Characteristics**:
- Orange color (0xff6600)
- Pulsing animation effect
- Worth their status code value when destroyed during immunity

### 5xx Server Error Codes (Red)
These appear as red pulsing obstacles:

- **500 Internal Server Error**: Server malfunction
- **501 Not Implemented**: Method not supported
- **502 Bad Gateway**: Invalid gateway response
- **503 Service Unavailable**: Server temporarily unavailable
- **504 Gateway Timeout**: Gateway timeout
- **505 HTTP Version Not Supported**: Unsupported HTTP version
- **507 Insufficient Storage**: Storage space insufficient
- **508 Loop Detected**: Infinite loop detected
- **510 Not Extended**: Extended request required
- **511 Network Authentication Required**: Network auth needed

**Characteristics**:
- Red color (0xff0000)
- Pulsing animation effect
- Worth their status code value when destroyed during immunity

### Obstacle Heights
Obstacles spawn at three height levels:

1. **Ground Level** (Y: 500) - 60% chance
   - Most common spawn location
   - Requires standard jump or stay on ground

2. **Mid Level** (Y: 350) - 30% chance
   - Requires jump to navigate
   - Often part of alternating or wave patterns

3. **High Level** (Y: 220) - 10% chance
   - Requires double jump to reach
   - Most challenging to navigate

## Obstacle Patterns

As difficulty increases, more complex patterns appear:

### Single Obstacle (All Difficulties)
- Individual obstacles with randomized heights
- Base spacing between obstacles
- Most common pattern at low difficulty

### Cluster Pattern (All Difficulties, More Common at Higher Difficulty)
- **2-4 obstacles** grouped closely together
- Gaps of 60-180 pixels between obstacles in cluster
- Creates dense challenge sections
- Cluster size increases with difficulty level

### Alternating Pattern (Difficulty 2+)
- **3+ obstacles** in low-high-low-high sequence
- Alternates between ground level and high level
- Pattern length increases with difficulty
- Requires rhythm and precise double jumping

### Wall Pattern (Difficulty 2+)
- **Vertical wall** blocking all three height levels simultaneously
- All three heights occupied at the same X position
- Requires double jump timing to pass through gaps
- Creates intense challenge moments

### Wave Pattern (Difficulty 3+)
- **3+ obstacles** arranged in a sine wave formation
- Obstacles follow a curved wave pattern
- Wave count increases with difficulty
- Requires precise timing to navigate the curve
- Most visually dynamic pattern

## Progressive Difficulty System

### Difficulty Scaling
- **Difficulty increases every 30 seconds** of gameplay
- Difficulty level affects:
  - Game speed
  - Obstacle spawn rate
  - Pattern complexity
  - Pattern variety

### Speed Progression
- **Base Speed**: 4 units per frame
- **Speed Increase**: +0.5 per difficulty level
- Game becomes progressively faster over time

### Spawn Rate Progression
- **Base Spawn Rate**: 150ms (slower = more frequent)
- **Rate Decreases**: -15ms per difficulty level
- **Minimum Rate**: 80ms (capped to prevent extreme difficulty)
- More obstacles spawn as difficulty increases

### Pattern Unlocking
- **Difficulty 1**: Single obstacles and clusters
- **Difficulty 2**: Alternating patterns and walls unlock
- **Difficulty 3+**: Wave patterns unlock

## Scoring System

### Points Breakdown

**2xx Success Codes**: +200 points each
- Collected by touching the green circles
- Different 2xx codes all award the same value

**Error Code Destruction**: +status code value
- During PLATANUS HACK MODE (contact or projectiles)
- 4xx codes: 400-431 points
- 5xx codes: 500-511 points
- Higher status codes = higher point values

**Projectile Collection**: +200 points per 2xx code
- Projectiles automatically collect success codes they hit
- Allows scoring from a distance during immunity mode

### Score Display
- **Player 1 Score**: Displayed in green at top-left
- **Player 2 Score**: Displayed in darker green (two-player mode)
- **Combined Score**: Shown in game over screen (two-player mode)
- Score = Collected Codes + Destroyed Error Codes

## Visual Features

### Graphics Style
- **Neon digital aesthetic** with dark background (#0a0a1a)
- Procedurally generated graphics
- Cyan grid lines for depth
- Pulsing animations on error codes
- Clear digit display for status codes

### Status Code Display
- Large, bold numbers displayed on obstacles
- White digits with black outlines for visibility
- Positioned clearly on each obstacle
- Supports all digits 0-9

### Player Indicators
- **Player 1**: Yellow/orange color (cyan when immune)
- **Player 2**: Green/cyan color (cyan when immune)
- Face features when alive
- Gray when eliminated

### Effects
- Pulsing glow on error codes
- Highlight effects on collectibles
- Visual feedback on collection
- Banner animation for PLATANUS HACK MODE
- Cyan animated banner when projectile shooting is active (2+ bananas)
- Projectile trails showing shooting direction

## Audio Features

### Sound Effects
- **Jump Sound**: 300Hz tone on jump
- **Double Jump Sound**: 350Hz tone (higher pitch)
- **Code Collection**: 600Hz tone
- **Error Code Destruction**: 400Hz tone during immunity
- **Game Over**: 220Hz (low) or 880Hz (victory)

### PLATANUS HACK MODE Music
- Special background music during immunity
- Two-oscillator harmony
- Rhythm-based frequency changes
- Creates engaging gameplay atmosphere

## Strategy Tips

### For Beginners
1. **Master Double Jump**: Essential for navigating higher obstacles
2. **Collect All 2xx Codes**: Steady point accumulation
3. **Use Bananas Strategically**: Save immunity for dense obstacle clusters
4. **Watch Height Levels**: Learn to identify which obstacles require jumps

### For Advanced Players
1. **Stack Bananas**: Collect multiple bananas to extend immunity and unlock projectiles
2. **Time Bananas**: Collect bananas before encountering walls or waves
3. **Use Projectiles**: At 2+ bananas, let projectiles collect codes and destroy enemies automatically
4. **Prioritize High-Value Codes**: During immunity, target 5xx codes for more points (or let projectiles do it)
5. **Anticipate Patterns**: Learn to recognize pattern types for better navigation
6. **Two-Player Coordination**: Split collection duties for maximum efficiency

### Pattern-Specific Strategies

**Clusters**: Use double jump early to get over multiple obstacles
**Walls**: Timing is key - jump just before the wall
**Alternating**: Establish a rhythm with your jumps
**Waves**: Follow the curve - jump at the right moment in the wave

## Game End Conditions

### Time Limit
- **120 seconds** total game time
- Timer counts down from 120 to 0
- Game ends when timer reaches 0

### Elimination
- Contact with error code while **not** immune = elimination
- **Single Player**: Elimination = immediate game over
- **Two Player**: Game continues if other player is alive
- Game over when both players eliminated

### Victory Condition
- No explicit victory condition
- Goal is to maximize score within time limit
- Survive as long as possible
- Achieve high score

## Restart

Press **R** key on game over screen to restart:
- Resets all scores and timers
- Clears all obstacles and collectibles
- Returns to single player mode
- Difficulty resets to level 1

## Technical Details

### Game Engine
- Built with **Phaser 3** (v3.87.0)
- Pure vanilla JavaScript
- No external dependencies (Phaser loaded via CDN)
- File size: Under 50KB after minification

### Performance
- 60 FPS target
- Optimized rendering
- Efficient collision detection
- Procedural graphics generation

### Browser Compatibility
- Works in modern browsers with Canvas/WebGL support
- No network access required (fully offline-capable)
- Base64-encoded assets

## Credits

Created for **Platanus Hack 25: Arcade Challenge**

### Author

**Leonardo Burbano**  
🚀 Tech Lead | Senior AI & Machine Learning Engineer

Turning complex AI workflows into simple, reliable, scalable solutions.

- 🌐 [leonardoburbano.com](https://leonardoburbano.com/)
- 🔗 [LinkedIn](https://www.linkedin.com/in/leoburbano/)
- 📍 Based in Latin America (Ecuador)

---

**Good luck debugging the maze! May your HTTP requests always return 200!** 🐒🍌

