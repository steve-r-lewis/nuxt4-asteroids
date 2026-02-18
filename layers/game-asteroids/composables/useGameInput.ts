/**
 * ================================================================================
 *
 * @project:    nuxt4-asteroids
 * @file:       ~/layers/game-asteroids/composables/useGameInput.ts
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
 * Initial creation and release of useGameInput.ts
 *
 * ================================================================================
 */

// layers/game-asteroids/composables/useGameInput.ts
export const useGameInput = () => {
  const keys = reactive({
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
  })

  const shootRequest = ref(false)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp') keys.ArrowUp = true
    if (e.code === 'ArrowLeft') keys.ArrowLeft = true
    if (e.code === 'ArrowRight') keys.ArrowRight = true
    if (e.code === 'Space') keys.Space = true
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp') keys.ArrowUp = false
    if (e.code === 'ArrowLeft') keys.ArrowLeft = false
    if (e.code === 'ArrowRight') keys.ArrowRight = false
    if (e.code === 'Space') {
      keys.Space = false
      shootRequest.value = true // Trigger shot on release
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  return { keys, shootRequest }
}
