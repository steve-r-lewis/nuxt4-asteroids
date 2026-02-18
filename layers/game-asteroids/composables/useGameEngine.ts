/**
 * ================================================================================
 *
 * @project:    nuxt4-asteroids
 * @file:       ~/layers/game-asteroids/composables/useGameEngine.ts
 * @version:    1.0.0
 * @createDate: 2026 Feb 18
 * @createTime: 22:15
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
 * V1.0.0, 20260218-22:15
 * Initial creation and release of useGameEngine.ts
 *
 * ================================================================================
 */

export const useGameEngine = (canvasRef: Ref<HTMLCanvasElement | null>) => {
  const CONST = useGameConstants()
  const { keys, shootRequest } = useGameInput()

  const score = ref(0)
  const level = ref(1)
  const gameOver = ref(false)
  const highScoreList = ref<any[]>([])

  // [UPDATED] Entity now has 'mass'
  type Entity = {
    x: number, y: number,
    vx: number, vy: number,
    radius: number, angle: number,
    mass: number, // New property
    vert: number, offs: number[],
    dead: boolean
  }

  let ship: any = null
  let asteroids: Entity[] = []

  const toRad = (deg: number) => deg * (Math.PI / 180)
  const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

  const fetchScores = async () => { /* ... existing code ... */ }
  const submitScore = async (name: string) => { /* ... existing code ... */ }

  const createAsteroid = (x: number, y: number, r: number): Entity => {
    const lvlMult = 1 + 0.1 * level.value
    const roid = {
      x, y,
      vx: Math.random() * CONST.ASTEROID_SPEED * lvlMult * (Math.random() < 0.5 ? 1 : -1) / CONST.FPS,
      vy: Math.random() * CONST.ASTEROID_SPEED * lvlMult * (Math.random() < 0.5 ? 1 : -1) / CONST.FPS,
      radius: r,
      // [NEW] Mass is proportional to Area (r^2).
      // This means a 100px asteroid is 4x heavier than a 50px one.
      mass: r * r,
      angle: Math.random() * Math.PI * 2,
      vert: Math.floor(Math.random() * (10) + 7),
      offs: [] as number[],
      dead: false
    }
    for (let i = 0; i < roid.vert; i++) {
      roid.offs.push(Math.random() * CONST.ASTEROID_JAG * 2 + 1 - CONST.ASTEROID_JAG)
    }
    return roid
  }

  const initLevel = () => {
    if (!canvasRef.value) return
    const w = canvasRef.value.width
    const h = canvasRef.value.height

    ship = {
      x: w / 2, y: h / 2,
      angle: 90 / 180 * Math.PI,
      radius: 15,
      vx: 0, vy: 0,
      lasers: [] as any[]
    }

    asteroids = []
    let x, y
    for (let i = 0; i < CONST.ASTEROID_NUM + level.value; i++) {
      do {
        x = Math.floor(Math.random() * w)
        y = Math.floor(Math.random() * h)
      } while (dist(ship.x, ship.y, x, y) < CONST.ASTEROID_SIZE * 2 + ship.radius)
      asteroids.push(createAsteroid(x, y, Math.ceil(CONST.ASTEROID_SIZE / 2)))
    }
  }

  const update = () => {
    if (!canvasRef.value || !ship) return
    const ctx = canvasRef.value.getContext('2d')
    if (!ctx) return
    const w = canvasRef.value.width
    const h = canvasRef.value.height

    // 1. Clear & Draw Background
    ctx.fillStyle = CONST.COLOR.BG
    ctx.fillRect(0, 0, w, h)

    if (gameOver.value) return

    // 2. Physics: Ship (Inertia + Thrust)
    if (keys.ArrowLeft) ship.angle += toRad(CONST.SHIP_TURN_SPEED) / CONST.FPS
    if (keys.ArrowRight) ship.angle -= toRad(CONST.SHIP_TURN_SPEED) / CONST.FPS

    if (keys.ArrowUp) {
      ship.vx += CONST.SHIP_THRUST * Math.cos(ship.angle) / CONST.FPS
      ship.vy -= CONST.SHIP_THRUST * Math.sin(ship.angle) / CONST.FPS

      // Draw Exhaust
      ctx.fillStyle = 'red'; ctx.strokeStyle = 'yellow'; ctx.lineWidth = 2; ctx.beginPath()
      ctx.moveTo(ship.x - ship.radius * (Math.cos(ship.angle) + 0.5 * Math.sin(ship.angle)), ship.y + ship.radius * (Math.sin(ship.angle) - 0.5 * Math.cos(ship.angle)))
      ctx.lineTo(ship.x - ship.radius * 2 * Math.cos(ship.angle), ship.y + ship.radius * 2 * Math.sin(ship.angle))
      ctx.lineTo(ship.x - ship.radius * (Math.cos(ship.angle) - 0.5 * Math.sin(ship.angle)), ship.y + ship.radius * (Math.sin(ship.angle) + 0.5 * Math.cos(ship.angle)))
      ctx.closePath(); ctx.fill(); ctx.stroke()
    } else {
      ship.vx -= CONST.FRICTION * ship.vx / CONST.FPS
      ship.vy -= CONST.FRICTION * ship.vy / CONST.FPS
    }
    ship.x += ship.vx; ship.y += ship.vy

    // Ship Wrap
    if (ship.x < 0 - ship.radius) ship.x = w + ship.radius; else if (ship.x > w + ship.radius) ship.x = 0 - ship.radius
    if (ship.y < 0 - ship.radius) ship.y = h + ship.radius; else if (ship.y > h + ship.radius) ship.y = 0 - ship.radius

    // Draw Rocket Cone
    ctx.fillStyle = '#333'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.beginPath()
    ctx.moveTo(ship.x - ship.radius * (2/3 * Math.cos(ship.angle) + 0.3 * Math.sin(ship.angle)), ship.y + ship.radius * (2/3 * Math.sin(ship.angle) - 0.3 * Math.cos(ship.angle)))
    ctx.lineTo(ship.x - ship.radius * 1.05 * Math.cos(ship.angle), ship.y + ship.radius * 1.05 * Math.sin(ship.angle))
    ctx.lineTo(ship.x - ship.radius * (2/3 * Math.cos(ship.angle) - 0.3 * Math.sin(ship.angle)), ship.y + ship.radius * (2/3 * Math.sin(ship.angle) + 0.3 * Math.cos(ship.angle)))
    ctx.closePath(); ctx.fill(); ctx.stroke()

    // Draw Ship
    ctx.strokeStyle = CONST.COLOR.SHIP; ctx.lineWidth = 2; ctx.beginPath()
    ctx.moveTo(ship.x + 4/3 * ship.radius * Math.cos(ship.angle), ship.y - 4/3 * ship.radius * Math.sin(ship.angle))
    ctx.lineTo(ship.x - ship.radius * (2/3 * Math.cos(ship.angle) + Math.sin(ship.angle)), ship.y + ship.radius * (2/3 * Math.sin(ship.angle) - Math.cos(ship.angle)))
    ctx.lineTo(ship.x - ship.radius * (2/3 * Math.cos(ship.angle) - Math.sin(ship.angle)), ship.y + ship.radius * (2/3 * Math.sin(ship.angle) + Math.cos(ship.angle)))
    ctx.closePath(); ctx.stroke()

    // 3. Lasers
    if (shootRequest.value && ship.lasers.length < CONST.LASER_MAX) {
      ship.lasers.push({ x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle), y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle), vx: CONST.LASER_SPD * Math.cos(ship.angle) / CONST.FPS, vy: -CONST.LASER_SPD * Math.sin(ship.angle) / CONST.FPS, dist: 0, dead: false })
    }
    shootRequest.value = false
    ship.lasers = ship.lasers.filter((l:any) => !l.dead)
    for (let l of ship.lasers) {
      l.x += l.vx; l.y += l.vy; l.dist += Math.sqrt(l.vx**2 + l.vy**2)
      if (l.x < 0) l.x = w; else if (l.x > w) l.x = 0
      if (l.y < 0) l.y = h; else if (l.y > h) l.y = 0
      if (l.dist > w * CONST.LASER_DIST) l.dead = true
      ctx.fillStyle = CONST.COLOR.LASER; ctx.beginPath(); ctx.arc(l.x, l.y, 2, 0, Math.PI * 2, false); ctx.fill()
    }

    // 4. Asteroids Logic (Move & Wrap)
    asteroids.forEach(a => {
      a.x += a.vx; a.y += a.vy
      if (a.x < 0 - a.radius) a.x = w + a.radius; else if (a.x > w + a.radius) a.x = 0 - a.radius
      if (a.y < 0 - a.radius) a.y = h + a.radius; else if (a.y > h + a.radius) a.y = 0 - a.radius
    })

    // [NEW] 5. Physics Collision: Asteroid vs Asteroid
    for (let i = 0; i < asteroids.length; i++) {
      for (let j = i + 1; j < asteroids.length; j++) {
        const a1 = asteroids[i]
        const a2 = asteroids[j]
        if (a1.dead || a2.dead) continue

        // Distance Check
        const dx = a2.x - a1.x
        const dy = a2.y - a1.y
        const distVal = Math.sqrt(dx*dx + dy*dy)

        if (distVal < a1.radius + a2.radius) {
          // --- PHYSICS CALCULATION ---

          // 1. Normal Unit Vector (Direction of collision)
          const nx = dx / distVal
          const ny = dy / distVal

          // 2. Relative Velocity (v2 - v1)
          const dvx = a2.vx - a1.vx
          const dvy = a2.vy - a1.vy

          // 3. Impact Speed (Velocity along the normal)
          // If > 0, they are moving apart, so skip collision response
          const velAlongNormal = dvx * nx + dvy * ny
          if (velAlongNormal > 0) continue

          // 4. Kinetic Energy of the Collision
          // Uses "Reduced Mass" logic: E = 0.5 * (m1*m2)/(m1+m2) * v_rel^2
          // We scale it up by 1000 to make the numbers easier to work with in constants
          const reducedMass = (a1.mass * a2.mass) / (a1.mass + a2.mass)
          const impactEnergy = 0.5 * reducedMass * (velAlongNormal * velAlongNormal) * 1000

          // --- DECISION: SHATTER OR BOUNCE? ---
          if (impactEnergy > CONST.COLLISION_BREAK_THRESHOLD) {
            // HIGH ENERGY -> DESTRUCTION
            a1.dead = true
            a2.dead = true
          } else {
            // LOW ENERGY -> BOUNCE (Elastic Collision)

            // A. Separate them (prevent sticking)
            const overlap = (a1.radius + a2.radius) - distVal
            const mTotal = a1.mass + a2.mass
            // Move lighter asteroid more than heavier one
            a1.x -= nx * overlap * (a2.mass / mTotal)
            a1.y -= ny * overlap * (a2.mass / mTotal)
            a2.x += nx * overlap * (a1.mass / mTotal)
            a2.y += ny * overlap * (a1.mass / mTotal)

            // B. Impulse Scalar
            // j = -(1 + e) * v_rel_normal / (1/m1 + 1/m2)
            const j = -(1 + CONST.RESTITUTION) * velAlongNormal / (1/a1.mass + 1/a2.mass)

            // C. Apply Impulse
            const impulseX = j * nx
            const impulseY = j * ny

            a1.vx -= impulseX / a1.mass
            a1.vy -= impulseY / a1.mass
            a2.vx += impulseX / a2.mass
            a2.vy += impulseY / a2.mass
          }
        }
      }
    }

    // 6. Other Collisions & Drawing
    const nextAsteroids: Entity[] = []

    asteroids.forEach(a => {
      // Check Ship
      if (!a.dead && dist(ship.x, ship.y, a.x, a.y) < ship.radius + a.radius) {
        gameOver.value = true
        fetchScores()
      }
      // Check Lasers
      for (let l of ship.lasers) {
        if (l.dead || a.dead) continue
        if (dist(l.x, l.y, a.x, a.y) < a.radius) {
          a.dead = true; l.dead = true; score.value += 100
        }
      }

      // Process Lifecycle
      if (a.dead) {
        if (a.radius > 20) {
          // Spawn children slightly offset to prevent instant re-collision
          nextAsteroids.push(createAsteroid(a.x - a.radius * 0.5, a.y - a.radius * 0.5, a.radius / 2))
          nextAsteroids.push(createAsteroid(a.x + a.radius * 0.5, a.y + a.radius * 0.5, a.radius / 2))
        }
      } else {
        nextAsteroids.push(a)
        ctx.strokeStyle = CONST.COLOR.ASTEROID; ctx.lineWidth = 2; ctx.beginPath()
        for (let j = 0; j < a.vert; j++) {
          ctx.lineTo(a.x + a.radius * a.offs[j] * Math.cos(a.angle + j * Math.PI * 2 / a.vert), a.y + a.radius * a.offs[j] * Math.sin(a.angle + j * Math.PI * 2 / a.vert))
        }
        ctx.closePath(); ctx.stroke()
      }
    })
    asteroids = nextAsteroids

    if (asteroids.length === 0) { level.value++; initLevel() }
    requestAnimationFrame(update)
  }

  const startGame = () => { initLevel(); gameOver.value = false; score.value = 0; level.value = 1; requestAnimationFrame(update) }

  return { score, level, gameOver, startGame, submitScore, highScoreList }
}
