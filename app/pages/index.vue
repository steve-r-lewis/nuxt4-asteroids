<script setup lang="ts">
/**
 * ================================================================================
 *
 * @project:    nuxt4-holistic-therapy-clinic
 * @file:       ~app/pages/index.vue
 * @version:    1.2.2
 * @createDate: 2026 Jan 22
 * @createTime: 23:54
 * @author:     Steve R Lewis
 *
 * ================================================================================
 *
 * @description:
 * Homepage component.
 *
 * ================================================================================
 *
 * @notes: Revision History
 *
 * V1.2.2, 20260216
 * - FIXED: Restored ServiceCarousel component (was accidentally reverted to grid).
 * - MAINTAINED: Safety filter for homeTreatments to prevent build errors.
 *
 * V1.2.1, 20260216
 * - FIXED: Added safety filter for homeTreatments to prevent build errors with undefined items.
 *
 * V1.1.0, 20260216
 * - Removed .limit(4) from therapies query to fetch all services.
 * - Replaced LandingContentGrid with ServiceCarousel to allow scrolling through all services.
 *
 * V1.0.0, 20260122-23:54
 * Initial creation and release of index.vue
 *
 * ================================================================================
 */

</script>

<template>
  <div>
    <AsteroidsGame />
  </div>
</template>

<style scoped>
/* Scoped styles if necessary, currently relying on Tailwind utility classes */
</style>
