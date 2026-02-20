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
  const CONST = useGameConstants();
  const { keys, shootRequest } = useGameInput();

  // State
  const score = ref(0);
  const level = ref(1);
  const gameOver = ref(false);

  // Entities
  // NEW Added fragility to the Entity type
  type Entity = {
    x: number, y: number,
    vx: number, vy: number,
    radius: number, angle: number,
    vert: number, offs: number[],
    dead: boolean,
    fragility: number // <--- NEW
  }

  let ship: any = null;
  let asteroids: Entity[] = [];

  // Helpers
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  // --- Entity Creation ---

  // Add the inheritedFragility parameter
  const createAsteroid = (x: number, y: number, r: number, inheritedFragility?: number): Entity => {
    const lvlMult = 1 + 0.1 * level.value
    const roid = {
      x, y,
      vx: Math.random() * CONST.ASTEROID_SPEED * lvlMult * (Math.random() < 0.5 ? 1 : -1) / CONST.FPS,
      vy: Math.random() * CONST.ASTEROID_SPEED * lvlMult * (Math.random() < 0.5 ? 1 : -1) / CONST.FPS,
      radius: r,
      angle: Math.random() * Math.PI * 2,
      vert: Math.floor(Math.random() * (10) + 7),
      offs: [] as number[],
      dead: false,
      // Use inherited value if it exists, otherwise generate a new random value from the range
      fragility: inheritedFragility ?? (Math.random() * (CONST.COLLISION_BREAK_THRESHOLD.MAX - CONST.COLLISION_BREAK_THRESHOLD.MIN) + CONST.COLLISION_BREAK_THRESHOLD.MIN)
    }
    for (let i = 0; i < roid.vert; i++) {
      roid.offs.push(Math.random() * CONST.ASTEROID_JAG * 2 + 1 - CONST.ASTEROID_JAG)
    }
    return roid
  }

  const initLevel = () => {
    if (!canvasRef.value) return
    const w = canvasRef.value.width;
    const h = canvasRef.value.height;

    ship = {
      x: w / 2, y: h / 2,
      angle: 90 / 180 * Math.PI,
      radius: 15,
      vx: 0, vy: 0,
      lasers: [] as any[]
    };

    asteroids = [];
    let x, y;
    for (let i = 0; i < CONST.ASTEROID_NUM + level.value; i++) {
      do {
        x = Math.floor(Math.random() * w)
        y = Math.floor(Math.random() * h)
      } while (dist(ship.x, ship.y, x, y) < CONST.ASTEROID_SIZE * 2 + ship.radius)
      asteroids.push(createAsteroid(x, y, Math.ceil(CONST.ASTEROID_SIZE / 2)))
    }
  };

  // --- Main Update Loop ---
  const update = () => {
    if (!canvasRef.value || !ship) return;
    const ctx = canvasRef.value.getContext('2d');
    if (!ctx) return;
    const w = canvasRef.value.width;
    const h = canvasRef.value.height;

    // 1. Draw Background
    ctx.fillStyle = CONST.COLOR.BG;
    ctx.fillRect(0, 0, w, h);

    if (gameOver.value) {
      ctx.fillStyle = CONST.COLOR.TEXT;
      ctx.font = '40px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText("GAME OVER", w/2, h/2);
      ctx.font = '20px Courier New';
      ctx.fillText("Press Space to Restart", w/2, h/2 + 40);

      if (shootRequest.value) {
        score.value = 0;
        level.value = 1;
        gameOver.value = false;
        shootRequest.value = false;
        initLevel()
      }
      requestAnimationFrame(update);
      return
    }

    // 2. Physics: Ship
    if (keys.ArrowLeft) ship.angle += toRad(CONST.SHIP_TURN_SPEED) / CONST.FPS;
    if (keys.ArrowRight) ship.angle -= toRad(CONST.SHIP_TURN_SPEED) / CONST.FPS;

    if (keys.ArrowUp) {
      ship.vx += CONST.SHIP_THRUST * Math.cos(ship.angle) / CONST.FPS;
      ship.vy -= CONST.SHIP_THRUST * Math.sin(ship.angle) / CONST.FPS;

      // Draw Thruster (Emerging from the cone)
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        ship.x - ship.radius * (1.0 * Math.cos(ship.angle) + 0.25 * Math.sin(ship.angle)),
        ship.y + ship.radius * (1.0 * Math.sin(ship.angle) - 0.25 * Math.cos(ship.angle))
      );
      ctx.lineTo(
        ship.x - ship.radius * 2.0 * Math.cos(ship.angle),
        ship.y + ship.radius * 2.0 * Math.sin(ship.angle)
      );
      ctx.lineTo(
        ship.x - ship.radius * (1.0 * Math.cos(ship.angle) - 0.25 * Math.sin(ship.angle)),
        ship.y + ship.radius * (1.0 * Math.sin(ship.angle) + 0.25 * Math.cos(ship.angle))
      );
      ctx.closePath(); ctx.fill(); ctx.stroke()
    } else {
      ship.vx -= CONST.FRICTION * ship.vx / CONST.FPS;
      ship.vy -= CONST.FRICTION * ship.vy / CONST.FPS
    }

    ship.x += ship.vx; ship.y += ship.vy;

    // Wrap Ship
    if (ship.x < 0 - ship.radius) ship.x = w + ship.radius;
    else if (ship.x > w + ship.radius) ship.x = 0 - ship.radius;
    if (ship.y < 0 - ship.radius) ship.y = h + ship.radius;
    else if (ship.y > h + ship.radius) ship.y = 0 - ship.radius;

    // Draw Engine Cone
    ctx.fillStyle = '#333';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      ship.x - ship.radius * (2/3 * Math.cos(ship.angle) + 0.3 * Math.sin(ship.angle)),
      ship.y + ship.radius * (2/3 * Math.sin(ship.angle) - 0.3 * Math.cos(ship.angle))
    );
    ctx.lineTo(
      ship.x - ship.radius * 1.05 * Math.cos(ship.angle),
      ship.y + ship.radius * 1.05 * Math.sin(ship.angle)
    );
    ctx.lineTo(
      ship.x - ship.radius * (2/3 * Math.cos(ship.angle) - 0.3 * Math.sin(ship.angle)),
      ship.y + ship.radius * (2/3 * Math.sin(ship.angle) + 0.3 * Math.cos(ship.angle))
    );
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Draw Main Ship Body
    ctx.strokeStyle = CONST.COLOR.SHIP
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      ship.x + 4/3 * ship.radius * Math.cos(ship.angle),
      ship.y - 4/3 * ship.radius * Math.sin(ship.angle)
    );
    ctx.lineTo(
      ship.x - ship.radius * (2/3 * Math.cos(ship.angle) + Math.sin(ship.angle)),
      ship.y + ship.radius * (2/3 * Math.sin(ship.angle) - Math.cos(ship.angle))
    );
    ctx.lineTo(
      ship.x - ship.radius * (2/3 * Math.cos(ship.angle) - Math.sin(ship.angle)),
      ship.y + ship.radius * (2/3 * Math.sin(ship.angle) + Math.cos(ship.angle))
    );
    ctx.closePath(); ctx.stroke();

    // 3. Lasers
    if (shootRequest.value && ship.lasers.length < CONST.LASER_MAX) {
      ship.lasers.push({
        x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle),
        y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle),
        vx: CONST.LASER_SPD * Math.cos(ship.angle) / CONST.FPS,
        vy: -CONST.LASER_SPD * Math.sin(ship.angle) / CONST.FPS,
        dist: 0,
        dead: false
      })
    }
    shootRequest.value = false;

    ship.lasers = ship.lasers.filter((l:any) => !l.dead);
    for (let l of ship.lasers) {
      l.x += l.vx; l.y += l.vy;
      l.dist += Math.sqrt(l.vx**2 + l.vy**2);

      if (l.x < 0) l.x = w; else if (l.x > w) l.x = 0;
      if (l.y < 0) l.y = h; else if (l.y > h) l.y = 0;

      if (l.dist > w * CONST.LASER_DIST) {
        l.dead = true; continue
      }

      ctx.fillStyle = CONST.COLOR.LASER
      ctx.beginPath(); ctx.arc(l.x, l.y, 2, 0, Math.PI * 2, false); ctx.fill()
    }

    // 4. Asteroids Logic

    // A. Move & Wrap
    asteroids.forEach(a => {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 - a.radius) a.x = w + a.radius;
      else if (a.x > w + a.radius) a.x = 0 - a.radius;
      if (a.y < 0 - a.radius) a.y = h + a.radius;
      else if (a.y > h + a.radius) a.y = 0 - a.radius
    });

    // B. Check Collisions (Asteroid vs Asteroid)
    for (let i = 0; i < asteroids.length; i++) {
      for (let j = i + 1; j < asteroids.length; j++) {
        const a1 = asteroids[i]
        const a2 = asteroids[j]

        if (a1.dead || a2.dead) continue

        const dx = a2.x - a1.x
        const dy = a2.y - a1.y
        const distVal = dist(a1.x, a1.y, a2.x, a2.y)

        if (distVal < a1.radius + a2.radius) {

          const m1 = Math.PI * (a1.radius ** 2)
          const m2 = Math.PI * (a2.radius ** 2)
          const invM1 = 1 / m1
          const invM2 = 1 / m2

          const nx = distVal === 0 ? 1 : dx / distVal
          const ny = distVal === 0 ? 0 : dy / distVal

          const overlap = (a1.radius + a2.radius) - distVal
          if (overlap > 0) {
            const separationTotal = overlap * 1.01
            const separation1 = (invM1 / (invM1 + invM2)) * separationTotal
            const separation2 = (invM2 / (invM1 + invM2)) * separationTotal

            a1.x -= nx * separation1
            a1.y -= ny * separation1
            a2.x += nx * separation2
            a2.y += ny * separation2
          }

          const rvx = a2.vx - a1.vx
          const rvy = a2.vy - a1.vy
          const velAlongNormal = rvx * nx + rvy * ny

          if (velAlongNormal > 0) continue

          // Impact Energy
          const reducedMass = (m1 * m2) / (m1 + m2)
          const impactEnergy = 0.5 * reducedMass * (velAlongNormal ** 2)

          // Evaluate individually against their own specific fragilities
          const a1Breaks = impactEnergy >= a1.fragility
          const a2Breaks = impactEnergy >= a2.fragility

          // Calculate impulse regardless (survivors still bounce/get bumped)
          const e = CONST.RESTITUTION
          const jForce = -(1 + e) * velAlongNormal / (invM1 + invM2)
          const impulseX = jForce * nx
          const impulseY = jForce * ny

          if (!a1Breaks && !a2Breaks) {
            // --- BOTH SURVIVE (Standard Bounce) ---
            a1.vx -= impulseX * invM1
            a1.vy -= impulseY * invM1
            a2.vx += impulseX * invM2
            a2.vy += impulseY * invM2
          } else {
            // --- AT LEAST ONE DESTROYED ---

            // Apply bounce force to whoever survived (if anyone)
            if (!a1Breaks) {
              a1.vx -= impulseX * invM1
              a1.vy -= impulseY * invM1
            }
            if (!a2Breaks) {
              a2.vx += impulseX * invM2
              a2.vy += impulseY * invM2
            }

            // Inline helper to fragment the broken asteroid(s)
            const shatterAsteroid = (broken: any, other: any) => {
              broken.dead = true
              const massRatio = (other.radius ** 2) / (broken.radius ** 2)

              // If obliterated by something 2.5x larger, leave no fragments
              if (massRatio > 2.5) {
                broken.radius = 0
              } else {
                let numFragments = 2
                if (impactEnergy > broken.fragility * 3) numFragments = 4
                else if (impactEnergy > broken.fragility * 1.5) numFragments = 3

                const baseRadius = broken.radius / Math.sqrt(numFragments)

                for (let f = 0; f < numFragments; f++) {
                  const angle = Math.random() * Math.PI * 2
                  const fragRadius = baseRadius * (0.8 + Math.random() * 0.4)

                  if (fragRadius >= 5) {
                    // CREATE FRAGMENT AND PASS INHERITED FRAGILITY
                    const frag = createAsteroid(
                      broken.x + Math.cos(angle) * broken.radius * 0.5,
                      broken.y + Math.sin(angle) * broken.radius * 0.5,
                      fragRadius,
                      broken.fragility // <--- Inherited here!
                    )
                    const scatterSpeed = (Math.sqrt(impactEnergy) / broken.radius) * 0.05
                    frag.vx = broken.vx + (Math.cos(angle) * scatterSpeed)
                    frag.vy = broken.vy + (Math.sin(angle) * scatterSpeed)
                    asteroids.push(frag)
                  }
                }
                broken.radius = 0 // Prevent Step D from running default split
              }
            }

            if (a1Breaks) shatterAsteroid(a1, a2)
            if (a2Breaks) shatterAsteroid(a2, a1)
          }
        }
      }
    }

    // C. Check Collisions (Lasers & Ship)
    asteroids.forEach(a => {
      if (a.dead) return;

      // Ship vs Asteroid
      if (dist(ship.x, ship.y, a.x, a.y) < ship.radius + a.radius) {
        gameOver.value = true
      }

      // Laser vs Asteroid
      for (let l of ship.lasers) {
        if (l.dead) continue
        if (dist(l.x, l.y, a.x, a.y) < a.radius) {
          a.dead = true;
          l.dead = true;
          score.value += 100;
          break
        }
      }
    });

    // D. Process Destruction (Draw & Spawn)
    const nextAsteroids: Entity[] = [];
    asteroids.forEach(a => {
      if (a.dead) {
        if (a.radius > 20) {
          // Pass the parent's fragility to the children!
          nextAsteroids.push(createAsteroid(a.x - a.radius * 0.5, a.y - a.radius * 0.5, a.radius / 2, a.fragility));
          nextAsteroids.push(createAsteroid(a.x + a.radius * 0.5, a.y + a.radius * 0.5, a.radius / 2, a.fragility));
        }
      } else {
        nextAsteroids.push(a);

        ctx.strokeStyle = CONST.COLOR.ASTEROID;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let j = 0; j < a.vert; j++) {
          ctx.lineTo(
            a.x + a.radius * a.offs[j] * Math.cos(a.angle + j * Math.PI * 2 / a.vert),
            a.y + a.radius * a.offs[j] * Math.sin(a.angle + j * Math.PI * 2 / a.vert)
          )
        }
        ctx.closePath(); ctx.stroke()
      }
    });

    // Update List
    asteroids = nextAsteroids;

    if (asteroids.length === 0) {
      level.value++;
      initLevel()
    }

    requestAnimationFrame(update)
  };

  const startGame = () => {
    initLevel();
    requestAnimationFrame(update)
  };

  return { score, level, gameOver, startGame }
};
