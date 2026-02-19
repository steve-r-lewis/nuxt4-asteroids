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
  type Entity = {
    x: number, y: number,
    vx: number, vy: number,
    radius: number, angle: number,
    vert: number, offs: number[],
    dead: boolean
  }

  let ship: any = null;
  let asteroids: Entity[] = [];

  // Helpers
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  // --- Entity Creation ---
  const createAsteroid = (x: number, y: number, r: number): Entity => {
    const lvlMult = 1 + 0.1 * level.value;
    const roid = {
      x, y,
      vx: Math.random() * CONST.ASTEROID_SPEED * lvlMult * (Math.random() < 0.5 ? 1 : -1) / CONST.FPS,
      vy: Math.random() * CONST.ASTEROID_SPEED * lvlMult * (Math.random() < 0.5 ? 1 : -1) / CONST.FPS,
      radius: r,
      angle: Math.random() * Math.PI * 2,
      vert: Math.floor(Math.random() * (10) + 7),
      offs: [] as number[],
      dead: false
    };
    for (let i = 0; i < roid.vert; i++) {
      roid.offs.push(Math.random() * CONST.ASTEROID_JAG * 2 + 1 - CONST.ASTEROID_JAG)
    }
    return roid
  };

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
    // for (let i = 0; i < asteroids.length; i++) {
    //   for (let j = i + 1; j < asteroids.length; j++) {
    //     const a1 = asteroids[i];
    //     const a2 = asteroids[j];
    //
    //     if (a1.dead || a2.dead) continue
    //
    //     // Check if touching
    //     const distVal = dist(a1.x, a1.y, a2.x, a2.y);
    //     if (distVal < a1.radius + a2.radius) {
    //
    //       // --- RANDOM INTERACTION ---
    //       // 50% Chance to Explode, 50% Chance to Bounce
    //       if (Math.random() < 0.5) {
    //         // 1. EXPLODE
    //         a1.dead = true;
    //         a2.dead = true
    //       } else {
    //         // 2. BOUNCE (Elastic Collision)
    //
    //         // Normalize Normal Vector
    //         const nx = (a2.x - a1.x) / distVal;
    //         const ny = (a2.y - a1.y) / distVal;
    //
    //         // Resolve Overlap (Push them apart so they don't stick)
    //         const overlap = (a1.radius + a2.radius) - distVal;
    //         a1.x -= nx * overlap * 0.5;
    //         a1.y -= ny * overlap * 0.5;
    //         a2.x += nx * overlap * 0.5;
    //         a2.y += ny * overlap * 0.5;
    //
    //         // Tangent Vector
    //         const tx = -ny;
    //         const ty = nx;
    //
    //         // Dot Product Tangent
    //         const dpTan1 = a1.vx * tx + a1.vy * ty;
    //         const dpTan2 = a2.vx * tx + a2.vy * ty;
    //
    //         // Dot Product Normal
    //         const dpNorm1 = a1.vx * nx + a1.vy * ny;
    //         const dpNorm2 = a2.vx * nx + a2.vy * ny;
    //
    //         // Conservation of Momentum (Mass is proportional to Radius)
    //         const m1 = a1.radius;
    //         const m2 = a2.radius;
    //
    //         const mom1 = (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2);
    //         const mom2 = (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2);
    //
    //         // Update Velocities
    //         a1.vx = tx * dpTan1 + nx * mom1;
    //         a1.vy = ty * dpTan1 + ny * mom1;
    //         a2.vx = tx * dpTan2 + nx * mom2;
    //         a2.vy = ty * dpTan2 + ny * mom2
    //       }
    //     }
    //   }
    // }
    // B. Check Collisions (Asteroid vs Asteroid)
    for (let i = 0; i < asteroids.length; i++) {
      for (let j = i + 1; j < asteroids.length; j++) {
        const a1 = asteroids[i];
        const a2 = asteroids[j];

        if (a1.dead || a2.dead) continue;

        // Calculate distance and vector between centers
        const dx = a2.x - a1.x;
        const dy = a2.y - a1.y;
        const distVal = dist(a1.x, a1.y, a2.x, a2.y); // using your existing dist() helper

        // Check if touching
        if (distVal < a1.radius + a2.radius) {

          // 1. Calculate Mass (Area = PI * r^2)
          const m1 = Math.PI * (a1.radius ** 2);
          const m2 = Math.PI * (a2.radius ** 2);

          // 2. Calculate Collision Normal (Unit Vector)
          const nx = dx / distVal;
          const ny = dy / distVal;

          // 3. Relative Velocity
          const rvx = a1.vx - a2.vx;
          const rvy = a1.vy - a2.vy;

          // Velocity along the normal
          const velAlongNormal = rvx * nx + rvy * ny;

          // Do not resolve if velocities are separating (objects moving apart)
          if (velAlongNormal > 0) continue

          // 4. Calculate Impulse (J)
          const e = CONST.RESTITUTION;
          const jForce = -(1 + e) * velAlongNormal / (1 / m1 + 1 / m2);

          // Represent the impact force as the absolute magnitude of the impulse
          const impactForce = Math.abs(jForce);

          if (impactForce < CONST.COLLISION_BREAK_THRESHOLD) {
            // --- ELASTIC BOUNCE ---

            // Apply impulse to velocities
            const impulseX = jForce * nx;
            const impulseY = jForce * ny;

            a1.vx += impulseX / m1;
            a1.vy += impulseY / m1;
            a2.vx -= impulseX / m2;
            a2.vy -= impulseY / m2;

            // Positional Correction (Resolves overlap so they don't stick)
            const percent = 0.5; // Penetration percentage to correct
            const overlap = (a1.radius + a2.radius) - distVal;
            const correction = (overlap / (1 / m1 + 1 / m2)) * percent;

            const cx = correction * nx;
            const cy = correction * ny;

            // Push objects apart along the normal, proportional to inverse mass
            a1.x -= cx / m1;
            a1.y -= cy / m1;
            a2.x += cx / m2;
            a2.y += cy / m2;

          } else {
            // --- DESTRUCTION / FRAGMENTATION ---
            a1.dead = true;
            a2.dead = true;

            // Identify the larger and smaller asteroid
            const a1Larger = a1.radius > a2.radius;
            const larger = a1Larger ? a1 : a2;
            const smaller = a1Larger ? a2 : a1;

            // Calculate Mass Ratio (e.g., if > 2.0, the larger object is twice as heavy)
            const massRatio = (Math.PI * (larger.radius ** 2)) / (Math.PI * (smaller.radius ** 2));

            // If the smaller asteroid is significantly smaller (mass ratio > 2.5), obliterate it.
            // By setting radius to 0, Step 'D' will bypass it and it won't spawn fragments.
            if (massRatio > 2.5) {
              smaller.radius = 0
            }
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
          nextAsteroids.push(createAsteroid(a.x - a.radius * 0.5, a.y - a.radius * 0.5, a.radius / 2));
          nextAsteroids.push(createAsteroid(a.x + a.radius * 0.5, a.y + a.radius * 0.5, a.radius / 2));
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
