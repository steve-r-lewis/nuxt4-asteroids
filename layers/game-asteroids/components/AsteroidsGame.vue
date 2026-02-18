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

// We use the composable from our layer
// Note: This requires the layer to be registered in nuxt.config.ts
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { score, level, gameOver, startGame, submitScore, highScoreList } = useGameEngine(canvasRef)

const playerName = ref('')
const submitting = ref(false)

const handleRestart = () => {
  if (submitting.value) return
  startGame()
  playerName.value = ''
}

const handleSubmit = async () => {
  if (!playerName.value || submitting.value) return
  submitting.value = true
  await submitScore(playerName.value)
  submitting.value = false
  playerName.value = ''
}
</script>

<template>
  <div class="game-container">
    <div class="hud">
      <span>Score: {{ score }}</span>
      <span>Level: {{ level }}</span>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" class="game-canvas"></canvas>

      <div v-if="gameOver" class="modal-overlay">
        <div class="modal-content">
          <h2 class="text-red-500 text-4xl mb-4 font-bold">GAME OVER</h2>
          <p class="text-xl mb-6">Final Score: {{ score }}</p>

          <div class="flex gap-2 justify-center mb-8">
            <input
              v-model="playerName"
              type="text"
              placeholder="AAA"
              maxlength="3"
              class="bg-gray-800 border border-gray-600 px-4 py-2 text-white uppercase text-center w-32 rounded focus:outline-none focus:border-blue-500"
              @keyup.enter="handleSubmit"
            />
            <button
              @click="handleSubmit"
              :disabled="submitting || !playerName"
              class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              SAVE
            </button>
          </div>

          <div v-if="highScoreList.length > 0" class="bg-gray-900 p-4 rounded-lg border border-gray-700 w-full max-w-md mx-auto mb-6">
            <h3 class="text-yellow-400 text-lg mb-2 underline tracking-wider">HIGH SCORES</h3>
            <table class="w-full text-left text-sm">
              <thead>
              <tr class="text-gray-500 border-b border-gray-800">
                <th class="py-1 w-1/4">Rank</th>
                <th class="py-1 w-1/2">Name</th>
                <th class="py-1 w-1/4 text-right">Score</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(entry, index) in highScoreList" :key="index" class="border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
                <td class="py-1 text-gray-400">#{{ index + 1 }}</td>
                <td class="py-1 font-bold tracking-wider">{{ entry.name }}</td>
                <td class="py-1 text-right text-green-400 font-mono">{{ entry.score }}</td>
              </tr>
              </tbody>
            </table>
          </div>

          <button
            @click="handleRestart"
            class="mt-4 bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold text-lg animate-pulse shadow-lg shadow-green-900/50 transition-all transform hover:scale-105"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>

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
.canvas-wrapper {
  position: relative;
  width: 1024px;
  height: 768px;
}
.game-canvas {
  width: 100%;
  height: 100%;
  border: 2px solid #333;
  background-color: black;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.1);
}
.modal-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}
.modal-content {
  background: #1a1a1a;
  padding: 40px;
  border: 1px solid #444;
  text-align: center;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 0 50px rgba(0,0,0,0.8);
}
.controls { margin-top: 10px; color: #888; }
</style>
