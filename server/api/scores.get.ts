/**
 * ================================================================================
 *
 * @project:    nuxt4-asteroids
 * @file:       ~/server/api/scores.get.ts
 * @version:    1.0.0
 * @createDate: 2026 Feb 18
 * @createTime: 23:26
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
 * V1.0.0, 20260218-23:26
 * Initial creation and release of scores.get.ts
 *
 * ================================================================================
 */

export default defineEventHandler(async () => {
  // Read the list from storage
  // 'scores' matches the key in nuxt.config.ts
  // 'leaderboard' is the filename
  const scores = await useStorage('scores').getItem('leaderboard')

  // Return empty array if file doesn't exist yet
  return scores || []
})
