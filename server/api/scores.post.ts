/**
 * ================================================================================
 *
 * @project:    nuxt4-asteroids
 * @file:       ~/server/api/scores.post.ts
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
 * Initial creation and release of scores.post.ts
 *
 * ================================================================================
 */

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 1. Validation
  if (!body.name || !body.score) {
    throw createError({ statusCode: 400, message: 'Missing name or score' })
  }

  // 2. Get existing scores
  let scores: any = await useStorage('scores').getItem('leaderboard') || []

  // 3. Add new score
  scores.push({
    name: body.name.substring(0, 10), // Limit name length
    score: body.score,
    date: new Date().toISOString()
  })

  // 4. Sort (High to Low) and keep top 10
  scores.sort((a: any, b: any) => b.score - a.score)
  scores = scores.slice(0, 10)

  // 5. Save back to storage
  await useStorage('scores').setItem('leaderboard', scores)

  return scores
})
