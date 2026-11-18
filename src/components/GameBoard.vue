<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Direction, Tile } from '../game/engine.ts'
import { gemFor } from '../game/gems.ts'
import { swipeDirection } from '../game/gestures.ts'
import GemIcon from './GemIcon.vue'

const props = defineProps<{
  tiles: Tile[]
  mergedIds: number[]
  spawnedId: number | null
  active: boolean
}>()
const emit = defineEmits<{ move: [direction: Direction] }>()
const board = ref<HTMLElement | null>(null)
let start: { x: number; y: number; id: number } | null = null
let mouseStart: { x: number; y: number; id: number } | null = null
function touchStart(event: TouchEvent) {
  start =
    props.active && event.touches.length === 1
      ? {
          x: event.touches[0]!.clientX,
          y: event.touches[0]!.clientY,
          id: event.touches[0]!.identifier,
        }
      : null
}
function touchEnd(event: TouchEvent) {
  if (!start) return
  const touch = Array.from(event.changedTouches).find((t) => t.identifier === start?.id)
  if (touch && props.active) {
    const direction = swipeDirection(touch.clientX - start.x, touch.clientY - start.y)
    if (direction) emit('move', direction)
  }
  start = null
}
function pointerDown(event: PointerEvent) {
  if (event.pointerType === 'touch' || !props.active || event.button !== 0) return
  mouseStart = { x: event.clientX, y: event.clientY, id: event.pointerId }
  board.value?.setPointerCapture(event.pointerId)
}
function pointerUp(event: PointerEvent) {
  if (!mouseStart || mouseStart.id !== event.pointerId) return
  const direction = swipeDirection(event.clientX - mouseStart.x, event.clientY - mouseStart.y)
  if (direction && props.active) emit('move', direction)
  mouseStart = null
}
function keyDown(event: KeyboardEvent) {
  if (
    !props.active ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    (event.target instanceof HTMLElement && event.target.isContentEditable)
  )
    return
  const keys: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  }
  const direction = keys[event.key]
  if (direction) {
    event.preventDefault()
    emit('move', direction)
  }
}
onMounted(() => window.addEventListener('keydown', keyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', keyDown))
</script>

<template>
  <div
    ref="board"
    class="game-board"
    tabindex="0"
    role="group"
    aria-label="珠宝棋盘，使用方向键或在棋盘上滑动操作"
    data-testid="board"
    @touchstart="touchStart"
    @touchmove.prevent
    @touchend.prevent="touchEnd"
    @touchcancel="start = null"
    @pointerdown="pointerDown"
    @pointerup="pointerUp"
    @pointercancel="mouseStart = null"
    @contextmenu.prevent
  >
    <div class="board-cells" aria-hidden="true">
      <div v-for="cell in 16" :key="cell" class="board-cell" />
    </div>
    <div class="tile-plane">
      <div
        v-for="tile in tiles"
        :key="tile.id"
        class="tile-position"
        :style="{ transform: `translate(${tile.col * 100}%, ${tile.row * 100}%)` }"
        :data-value="tile.value"
        :data-row="tile.row"
        :data-col="tile.col"
      >
        <div
          class="gem-tile"
          :class="{
            'is-merged': mergedIds.includes(tile.id),
            'is-new': spawnedId === tile.id,
            'is-precious': tile.value >= 128,
          }"
          :style="{ '--gem-color': gemFor(tile.value).color }"
          :aria-label="`${gemFor(tile.value).name} ${tile.value}`"
        >
          <GemIcon :value="tile.value" />
          <span class="tile-value">{{ tile.value }}</span>
          <div v-if="mergedIds.includes(tile.id)" class="merge-particles" aria-hidden="true">
            <i v-for="n in 6" :key="n" :style="{ '--i': n }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
