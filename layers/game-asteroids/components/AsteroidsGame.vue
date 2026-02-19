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

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { score, level, startGame } = useGameEngine(canvasRef)

onMounted(() => {
  if (canvasRef.value) {
    canvasRef.value.width = 1024
    canvasRef.value.height = 768
    startGame()
  }
})
</script>

<template>
  <div class="game-container">
    <div class="hud">
      <span>Score: {{ score }}</span>
      <span>Level: {{ level }}</span>
    </div>
    <canvas ref="canvasRef" class="game-canvas"></canvas>
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
.controls { margin-top: 10px; color: #888; }
</style>
