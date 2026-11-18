<script setup lang="ts">
import { gemFor } from '../game/gems.ts'
defineProps<{ value: number; locked?: boolean }>()
</script>

<template>
  <img
    class="gem-icon"
    :class="{ 'gem-locked': locked }"
    :src="gemFor(value).asset"
    :alt="locked ? '未解锁珠宝' : gemFor(value).name"
    draggable="false"
  />
</template>
