<script setup lang="ts">
/**
 * ================================================================================
 *
 * @project:    nuxt4-asteroids
 * @file:       ~app/components/AsteroidsGame.vue
 * @version:    1.0.0
 * @createDate: 2026 Feb 18
 * @createTime: 21:30
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * TODO: Create description here
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.0.0, 20260218-21:30
 * Initial creation and release of AsteroidsGame.vue
 *
 * ================================================================================
 */

import { ref, onMounted, onUnmounted } from 'vue'

// --- Types ---
type Point = { x: number; y: number }
type Velocity = { x: number; y: number }

interface Entity {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  angle: number
  rotationSpeed?: number
  dead: boolean
}

// --- Game Constants ---
const FPS = 60
const FRICTION = 0.7 // 0 = no friction, 1 = lots of friction
const SHIP_THRUST = 5 // Acceleration
const SHIP_TURN_SPEED = 360 // Degrees per second
const ASTEROID_JAG = 0.4 // Irregularity of asteroids (0 = none, 1 = lots)
const ASTEROID_NUM = 5 // Starting number of asteroids
const ASTEROID_SIZE = 100 // Starting size in pixels
const ASTEROID_SPEED = 50 // Max pixels per second
const LASER_MAX = 10 // Max lasers on screen
const LASER_SPD = 500 // Pixels per second
const LASER_DIST = 0.4 // Max distance laser travels (screen fraction)

// --- State ---
const canvasRef = ref<HTMLCanvasElement | null>(null)
const score = ref(0)
const gameOver = ref(false)
const level = ref(1)

// Game Objects
let ship: Entity & { blinkNum: number; blinkTime: number; canShoot: boolean; lasers: any[] }
let asteroids: any[] = []
let lastTime = 0

// Input State
const keys = {
  ArrowUp: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
}

// --- Helper Functions ---
const toRad = (deg: number) => deg * (Math.PI / 180)
const distBetweenPoints = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

// --- Game Logic ---

function createAsteroid(x: number, y: number, r: number) {
  const lvlMult = 1 + 0.1 * level.value
  const roid = {
    x, y,
    vx: Math.random() * ASTEROID_SPEED * lvlMult * (Math.random() < 0.5 ? 1 : -1) / FPS,
    vy: Math.random() * ASTEROID_SPEED * lvlMult * (Math.random() < 0.5 ? 1 : -1) / FPS,
    radius: r,
    angle: Math.random() * Math.PI * 2,
    vert: Math.floor(Math.random() * (10) + 7), // Vertices
    offs: [] as number[],
    dead: false
  }
  // Create irregular shape offsets
  for (let i = 0; i < roid.vert; i++) {
    roid.offs.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG)
  }
  return roid
}

function resetGame() {
  score.value = 0
  level.value = 1
  gameOver.value = false
  initLevel()
}

function initLevel() {
  if(!canvasRef.value) return
  const w = canvasRef.value.width
  const h = canvasRef.value.height

  // Reset Ship
  ship = {
    id: 0,
    x: w / 2,
    y: h / 2,
    angle: 90 / 180 * Math.PI, // Convert to Radians
    radius: 15,
    vx: 0,
    vy: 0,
    blinkNum: Math.ceil(0.1 * FPS),
    blinkTime: Math.ceil(0.1 * FPS),
    canShoot: true,
    lasers: [],
    dead: false
  }

  // Create Asteroids
  asteroids = []
  let x, y
  for (let i = 0; i < ASTEROID_NUM + level.value; i++) {
    do {
      x = Math.floor(Math.random() * w)
      y = Math.floor(Math.random() * h)
    } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROID_SIZE * 2 + ship.radius)
    asteroids.push(createAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 2)))
  }
}

function shootLaser() {
  if (ship.canShoot && ship.lasers.length < LASER_MAX) {
    ship.lasers.push({
      x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle),
      y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle),
      vx: LASER_SPD * Math.cos(ship.angle) / FPS,
      vy: -LASER_SPD * Math.sin(ship.angle) / FPS,
      distTraveled: 0,
      explodeTime: 0
    })
  }
  ship.canShoot = false // Prevent machine gun effect
}

// --- The Main Loop ---
function update(time: number) {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const w = canvasRef.value.width
  const h = canvasRef.value.height

  // 1. Draw Space
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, w, h)

  if (gameOver.value) {
    ctx.fillStyle = 'white'
    ctx.font = '40px Courier New'
    ctx.textAlign = 'center'
    ctx.fillText("GAME OVER", w/2, h/2)
    ctx.font = '20px Courier New'
    ctx.fillText("Press Space to Restart", w/2, h/2 + 40)

    if(keys.Space) resetGame()
    requestAnimationFrame(update)
    return
  }

  // 2. Physics: Ship Movement
  const thrusting = keys.ArrowUp
  const turningLeft = keys.ArrowLeft
  const turningRight = keys.ArrowRight

  // Rotation
  if (turningLeft) ship.angle += toRad(SHIP_TURN_SPEED) / FPS
  if (turningRight) ship.angle -= toRad(SHIP_TURN_SPEED) / FPS

  // Thrust
  if (thrusting) {
    ship.vx += SHIP_THRUST * Math.cos(ship.angle) / FPS
    ship.vy -= SHIP_THRUST * Math.sin(ship.angle) / FPS

    // Draw Thruster
    ctx.fillStyle = 'red'
    ctx.strokeStyle = 'yellow'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo( // rear left
      ship.x - ship.radius * (2/3 * Math.cos(ship.angle) + 0.5 * Math.sin(ship.angle)),
      ship.y + ship.radius * (2/3 * Math.sin(ship.angle) - 0.5 * Math.cos(ship.angle))
    )
    ctx.lineTo( // rear center (behind the ship)
      ship.x - ship.radius * 6/3 * Math.cos(ship.angle),
      ship.y + ship.radius * 6/3 * Math.sin(ship.angle)
    )
    ctx.lineTo( // rear right
      ship.x - ship.radius * (2/3 * Math.cos(ship.angle) - 0.5 * Math.sin(ship.angle)),
      ship.y + ship.radius * (2/3 * Math.sin(ship.angle) + 0.5 * Math.cos(ship.angle))
    )
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  } else {
    // Friction
    ship.vx -= FRICTION * ship.vx / FPS
    ship.vy -= FRICTION * ship.vy / FPS
  }

  // Apply Velocity
  ship.x += ship.vx
  ship.y += ship.vy

  // Screen Wrapping (Toroidal world)
  if (ship.x < 0 - ship.radius) ship.x = w + ship.radius
  else if (ship.x > w + ship.radius) ship.x = 0 - ship.radius
  if (ship.y < 0 - ship.radius) ship.y = h + ship.radius
  else if (ship.y > h + ship.radius) ship.y = 0 - ship.radius

  // 3. Draw Ship
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo( // Nose
    ship.x + 4/3 * ship.radius * Math.cos(ship.angle),
    ship.y - 4/3 * ship.radius * Math.sin(ship.angle)
  )
  ctx.lineTo( // Rear Left
    ship.x - ship.radius * (2/3 * Math.cos(ship.angle) + Math.sin(ship.angle)),
    ship.y + ship.radius * (2/3 * Math.sin(ship.angle) - Math.cos(ship.angle))
  )
  ctx.lineTo( // Rear Right
    ship.x - ship.radius * (2/3 * Math.cos(ship.angle) - Math.sin(ship.angle)),
    ship.y + ship.radius * (2/3 * Math.sin(ship.angle) + Math.cos(ship.angle))
  )
  ctx.closePath()
  ctx.stroke()

  // 4. Lasers
  if (keys.Space) shootLaser() // Logic handles rate limiting

  for (let i = ship.lasers.length - 1; i >= 0; i--) {
    let l = ship.lasers[i]

    // Move laser
    l.x += l.vx
    l.y += l.vy

    // Calculate distance
    l.distTraveled += Math.sqrt(Math.pow(l.vx, 2) + Math.pow(l.vy, 2))

    // Handle Screen Wrapping for Lasers
    if (l.x < 0) l.x = w
    else if (l.x > w) l.x = 0
    if (l.y < 0) l.y = h
    else if (l.y > h) l.y = 0

    // Remove if too far
    if (l.distTraveled > w * LASER_DIST) {
      ship.lasers.splice(i, 1)
      continue
    }

    // Draw Laser
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(l.x, l.y, 2, 0, Math.PI * 2, false)
    ctx.fill()
  }

  // 5. Asteroids
  asteroids.forEach((a, index) => {
    // Move
    a.x += a.vx
    a.y += a.vy

    // Wrap
    if (a.x < 0 - a.radius) a.x = w + a.radius
    else if (a.x > w + a.radius) a.x = 0 - a.radius
    if (a.y < 0 - a.radius) a.y = h + a.radius
    else if (a.y > h + a.radius) a.y = 0 - a.radius

    // Draw
    ctx.strokeStyle = 'slategray'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let j = 0; j < a.vert; j++) {
      ctx.lineTo(
        a.x + a.radius * a.offs[j] * Math.cos(a.angle + j * Math.PI * 2 / a.vert),
        a.y + a.radius * a.offs[j] * Math.sin(a.angle + j * Math.PI * 2 / a.vert)
      )
    }
    ctx.closePath()
    ctx.stroke()

    // Collision Detection (Ship vs Asteroid)
    if (distBetweenPoints(ship.x, ship.y, a.x, a.y) < ship.radius + a.radius) {
      gameOver.value = true
    }

    // Collision Detection (Laser vs Asteroid)
    for (let l = ship.lasers.length - 1; l >= 0; l--) {
      if (distBetweenPoints(ship.lasers[l].x, ship.lasers[l].y, a.x, a.y) < a.radius) {

        // Remove Laser
        ship.lasers.splice(l, 1)

        // Destroy Asteroid
        asteroids.splice(index, 1)
        score.value += 100

        // Split Asteroid?
        if(a.radius > 15) { // Minimum size
          asteroids.push(createAsteroid(a.x, a.y, a.radius / 2))
          asteroids.push(createAsteroid(a.x, a.y, a.radius / 2))
        }
        break
      }
    }
  })

  if(asteroids.length === 0) {
    level.value++
    initLevel()
  }

  requestAnimationFrame(update)
}

// --- Event Listeners ---
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Space') keys.Space = true
  if (e.code === 'ArrowUp') keys.ArrowUp = true
  if (e.code === 'ArrowLeft') keys.ArrowLeft = true
  if (e.code === 'ArrowRight') keys.ArrowRight = true
}

const handleKeyUp = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    keys.Space = false
    ship.canShoot = true // Reset trigger
  }
  if (e.code === 'ArrowUp') keys.ArrowUp = false
  if (e.code === 'ArrowLeft') keys.ArrowLeft = false
  if (e.code === 'ArrowRight') keys.ArrowRight = false
}

// --- Lifecycle ---
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  if (canvasRef.value) {
    // Set standard HD size
    canvasRef.value.width = 1024
    canvasRef.value.height = 768
    resetGame()
    requestAnimationFrame(update)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<template>
  <div class="game-container">
    <div class="hud">
      <span>Score: {{ score }}</span>
      <span>Level: {{ level }}</span>
    </div>
    <canvas ref="canvas" class="game-canvas"></canvas>
    <div class="controls">
      <p>Use <b>Arrow Keys</b> to Move/Rotate. <b>Space</b> to Shoot.</p>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #111;
  min-height: 100vh;
  color: white;
  font-family: 'Courier New', Courier, monospace;
}

.hud {
  width: 1024px;
  display: flex;
  justify-content: space-between;
  font-size: 24px;
  margin-bottom: 10px;
}

.game-canvas {
  border: 2px solid #333;
  background-color: black;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.1);
}

.controls {
  margin-top: 10px;
  color: #888;
}
</style>
