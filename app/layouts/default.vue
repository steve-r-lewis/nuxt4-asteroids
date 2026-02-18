<script setup lang="ts">
/**
* ================================================================================
*
* @project:    nuxt4-holistic-therapy-clinic
* @file:       ~/app/layouts/default.vue
* @version:    V1.0.0
* @createDate: 2025 Oct 16
* @createTime: 00:02
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
* V1.0.0, 20251016-00:02
* Initial creation and release of default.vue
*
* ================================================================================
*/

/**
 * TODO: TypeScript code for the component goes here with suitable DocBlock type comments as necessary
 * for new/changed logic.
 */
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white font-sans antialiased text-gray-600">
    <LayoutSiteHeader />

    <main class="flex-1 w-full">
      <slot />
    </main>

    <LayoutSiteFooter />
  </div>
</template>

<style scoped>
/* TODO: Add component-specific styles for LayoutDevelopment if utility classes are insufficient. */
</style>





