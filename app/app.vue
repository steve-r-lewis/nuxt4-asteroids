<script setup lang="ts">
/**
 * ================================================================================
 *
 * @project:    nuxt4-holistic-therapy-clinic
 * @file:       ~/app/app.vue
 * @version:    V1.0.0
 * @createDate: 2025 Oct 15
 * @createTime: 23:57
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
 * V1.0.0, 20251015-23:57
 * Initial creation and release of app.vue
 *
 * ================================================================================
 */

/**
 * Set global HTML and body attributes for the application, this is to remove the scrollbar application wide.
 */
useHead({
  htmlAttrs: {
    class: 'h-full scrollbar-hide overflow-y-auto'
  },
  bodyAttrs: {
    class: 'h-full min-h-screen'
  },
})
</script>

<template>
  <div class="bg-white min-h-screen text-gray-900 antialiased">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style scoped>
/* TODO: Add component-specific styles for LayoutDevelopment if utility classes are insufficient. */
</style>
