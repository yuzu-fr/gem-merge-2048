import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { type Direction } from '../game/engine.ts'
import { newGame, playTurn, undoTurn, type GameState } from '../game/session.ts'
import { loadGame, saveGame } from '../game/storage.ts'
import { gemFor } from '../game/gems.ts'

export function useGame() {
  let loaded: ReturnType<typeof loadGame>
  try {
    loaded = loadGame(window.localStorage)
  } catch {
    loaded = { state: null, status: 'unavailable' }
  }
  const hasSave = !!loaded.state
  const state = shallowRef<GameState>(loaded.state ?? newGame())
  const renderedTiles = shallowRef(state.value.tiles)
  const busy = ref(false)
  const mergedIds = ref<number[]>([])
  const spawnedId = ref<number | null>(null)
  const scoreGain = ref(0)
  const toast = ref('')
  const storageWarning = ref(
    loaded.status === 'unavailable'
      ? '浏览器暂时无法保存进度，本次仍可正常游玩。'
      : loaded.status === 'corrupt'
        ? '旧存档无法读取，已为你准备一盘新珠宝。'
        : '',
  )
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let toastTimer: ReturnType<typeof setTimeout> | undefined
  function later(fn: () => void, delay: number) {
    const id = setTimeout(() => {
      timers.delete(id)
      fn()
    }, delay)
    timers.add(id)
    return id
  }
  function notify(message: string) {
    if (toastTimer) {
      clearTimeout(toastTimer)
      timers.delete(toastTimer)
    }
    toast.value = message
    toastTimer = later(() => {
      toast.value = ''
    }, 2600)
  }
  function persist() {
    try {
      if (!saveGame(window.localStorage, state.value))
        storageWarning.value = '浏览器暂时无法保存进度，请保持此页面打开。'
    } catch {
      storageWarning.value = '浏览器暂时无法保存进度，请保持此页面打开。'
    }
  }
  function move(direction: Direction) {
    if (busy.value) return
    const turn = playTurn(state.value, direction)
    if (!turn) return
    busy.value = true
    mergedIds.value = []
    spawnedId.value = null
    scoreGain.value = 0
    const oldHighest = Math.max(...state.value.tiles.map((tile) => tile.value))
    state.value = turn.state
    persist() // Save the completed turn immediately, even if the tab closes mid-animation.
    renderedTiles.value = turn.motionTiles
    later(() => {
      renderedTiles.value = turn.state.tiles
      mergedIds.value = turn.mergedIds
      spawnedId.value = turn.spawnedId
      scoreGain.value = turn.scoreDelta
      const highest = Math.max(...turn.state.tiles.map((tile) => tile.value))
      if (highest > oldHighest && highest !== 2048) {
        const action = turn.newlyUnlocked.includes(highest) ? '已解锁' : '合成了'
        notify(`新的璀璨 · ${action}${gemFor(highest).name} ${highest}`)
      }
    }, 145)
    later(() => {
      busy.value = false
    }, 320)
  }
  function restart() {
    if (busy.value) return
    state.value = newGame(state.value)
    renderedTiles.value = state.value.tiles
    mergedIds.value = []
    spawnedId.value = null
    scoreGain.value = 0
    persist()
  }
  function undo() {
    if (busy.value) return
    const previous = undoTurn(state.value)
    if (!previous) return
    state.value = previous
    renderedTiles.value = previous.tiles
    mergedIds.value = []
    spawnedId.value = null
    scoreGain.value = 0
    persist()
    notify('已回到上一步，继续寻找美好的相遇。')
  }
  function continueGame() {
    state.value = { ...state.value, winAcknowledged: true }
    persist()
  }
  onBeforeUnmount(() => timers.forEach(clearTimeout))
  return {
    state,
    renderedTiles,
    busy,
    mergedIds,
    spawnedId,
    scoreGain,
    toast,
    storageWarning,
    hasSave,
    move,
    restart,
    undo,
    continueGame,
    persist,
    canUndo: computed(() => !state.value.undoUsed && !!state.value.previous && !busy.value),
    showWin: computed(() => state.value.hasWon && !state.value.winAcknowledged && !busy.value),
    highest: computed(() => Math.max(...state.value.unlocked)),
  }
}
