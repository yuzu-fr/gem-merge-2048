<script setup lang="ts">
defineProps<{
  name:
    | 'sparkle'
    | 'diamond'
    | 'arrow'
    | 'undo'
    | 'restart'
    | 'close'
    | 'grid'
    | 'help'
    | 'lock'
    | 'home'
    | 'chevron'
}>()
const paths = {
  sparkle: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
  diamond: 'm6 4 12 0 4 6-10 12L2 10 6 4Zm-4 6h20M6 4l6 18 6-18M9 4l-3 6m9-6 3 6',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  undo: 'M4 9h10a6 6 0 0 1 0 12h-3M4 9l5-5M4 9l5 5',
  restart: 'M20 7v5h-5M20 12a8 8 0 1 0-2 6',
  close: 'm6 6 12 12M18 6 6 18',
  grid: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
  help: 'M9 8a3 3 0 0 1 6 0c0 3-3 2-3 5m0 4v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Zm7 4v3',
  home: 'm3 11 9-8 9 8M5 9v12h14V9m-10 12v-7h6v7',
  chevron: 'm9 5 7 7-7 7',
}
</script>
<template>
  <svg
    class="app-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.45"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name]" />
  </svg>
</template>
