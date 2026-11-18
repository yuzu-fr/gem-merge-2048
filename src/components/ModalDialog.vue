<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'
const props = withDefaults(defineProps<{ title: string; closable?: boolean }>(), { closable: true })
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closable) emit('close')
  if (event.key !== 'Tab') return
  const focusable = Array.from(
    dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex="0"]') ??
      [],
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first) {
    event.preventDefault()
    return
  }
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === dialog.value)
  ) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
onMounted(async () => {
  previousFocus = document.activeElement as HTMLElement
  document.addEventListener('keydown', keydown)
  await nextTick()
  dialog.value?.focus()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', keydown)
  previousFocus?.focus()
})
</script>
<template>
  <Teleport to="body"
    ><div class="modal-backdrop" @click.self="closable && emit('close')">
      <section
        ref="dialog"
        class="modal-card"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
      >
        <button
          v-if="closable"
          class="icon-button modal-close"
          aria-label="关闭弹窗"
          @click="emit('close')"
        >
          <AppIcon name="close" />
        </button>
        <slot />
      </section></div
  ></Teleport>
</template>
