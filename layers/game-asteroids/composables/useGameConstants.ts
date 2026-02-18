/**
 * ================================================================================
 *
 * @project:    nuxt4-asteroids
 * @file:       ~/layers/game-asteroids/composables/useGameConstants.ts
 * @version:    1.0.0
 * @createDate: 2026 Feb 18
 * @createTime: 22:14
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
 * V1.0.0, 20260218-22:14
 * Initial creation and release of useGameConstants.ts
 *
 * ================================================================================
 */

export const useGameConstants = () => {
  return {
    // --------------------------------------------------------------------------
    // SYSTEM SETTINGS
    // --------------------------------------------------------------------------
    /** Target Frames Per Second. Controls the speed of the game loop. */
    FPS: 60,

    // --------------------------------------------------------------------------
    // SHIP PHYSICS
    // --------------------------------------------------------------------------
    /**
     * Friction Coefficient (0.0 - 1.0).
     * 0.0 = Space Physics (No drag, ship glides forever).
     * 1.0 = High drag (Ship stops immediately when key released).
     */
    FRICTION: 0.0,

    /** Acceleration force (Pixels per Second squared). Controls how fast the ship gains speed. */
    SHIP_THRUST: 0.5,

    /** Rotation speed in Degrees per Second. */
    SHIP_TURN_SPEED: 120,

    // --------------------------------------------------------------------------
    // ASTEROID SETTINGS
    // --------------------------------------------------------------------------
    /** Initial number of asteroids to spawn on Level 1. */
    ASTEROID_NUM: 5,

    /** Base size of a large asteroid in pixels. */
    ASTEROID_SIZE: 100,

    /** Maximum asteroid travel speed in Pixels per Second. */
    ASTEROID_SPEED: 30,

    /**
     * Irregularity factor (0.0 - 1.0).
     * 0.0 = Perfect Circle.
     * 0.5 = Very jagged/rocky shape.
     */
    ASTEROID_JAG: 0.4,

    // --------------------------------------------------------------------------
    // [NEW] Physics Constants
    // --------------------------------------------------------------------------
    /** * Energy required to shatter an asteroid.
     * Higher = harder to break (more bouncing).
     * Lower = everything explodes on contact.
     */
    COLLISION_BREAK_THRESHOLD: 150000,

    /** * Bounciness (0 = no bounce, 1 = perfect elastic bounce).
     */
    RESTITUTION: 1.0,

    // --------------------------------------------------------------------------
    // WEAPON SETTINGS
    // --------------------------------------------------------------------------
    /** Maximum number of lasers allowed on screen at once. */
    LASER_MAX: 10,

    /** Laser travel speed in Pixels per Second. */
    LASER_SPD: 500,

    /** Maximum distance a laser can travel before fading (as a fraction of screen width). */
    LASER_DIST: 0.6,

    // --------------------------------------------------------------------------
    // VISUALS
    // --------------------------------------------------------------------------
    COLOR: {
      BG: 'black',
      SHIP: 'white',
      ASTEROID: 'slategray',
      LASER: 'white',
      TEXT: 'white'
    }
  }
}
